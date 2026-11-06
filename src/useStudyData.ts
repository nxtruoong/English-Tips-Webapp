import { useCallback, useEffect, useRef, useState } from 'react';
import { emptyData, type StudyData } from './domain';
import { readData, writeData } from './storage';

/** Typing pauses shorter than this are batched into one IndexedDB write. */
export const SAVE_DELAY_MS = 400;
const CHANNEL = 'hien-study';
const SAVED = 'Đã lưu trên thiết bị này';
const tabId = crypto.randomUUID();

type Message = { type: 'saved'; from: string };

export interface StudyStore {
  data: StudyData;
  ready: boolean;
  saveState: string;
  storageError: string;
  /** True when another tab saved while this tab had unsaved edits. */
  conflict: boolean;
  /** Apply an update. `immediate` skips the typing delay (imports, deletes). */
  mutate: (update: (old: StudyData) => StudyData, options?: { immediate?: boolean }) => void;
  /** Discard local state and load what is stored on the device. */
  reload: () => void;
  /** Keep this tab's version; its next save overwrites the other tab's. */
  dismissConflict: () => void;
}

export function useStudyData(): StudyStore {
  const [data, setData] = useState<StudyData>(emptyData);
  const current = useRef(data);
  const [ready, setReady] = useState(false);
  const [saveState, setSaveState] = useState('Đang tải dữ liệu…');
  const [storageError, setStorageError] = useState('');
  const [conflict, setConflict] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const dirty = useRef(false);
  const queue = useRef(Promise.resolve());
  const revision = useRef(0);
  const channel = useRef<BroadcastChannel | null>(null);

  const load = useCallback(async () => {
    try {
      const value = await readData();
      current.current = value;
      setData(value);
      setSaveState(SAVED);
      setStorageError('');
      setConflict(false);
    } catch {
      setStorageError(
        'Không mở được bộ nhớ trình duyệt. Bạn vẫn có thể luyện, nhưng hãy xuất dữ liệu trước khi rời trang.',
      );
      setSaveState('Chưa lưu được');
    }
  }, []);

  const flush = useCallback(() => {
    clearTimeout(timer.current);
    timer.current = undefined;
    if (!dirty.current) return;
    dirty.current = false;
    const snapshot = current.current;
    const latest = ++revision.current;
    queue.current = queue.current
      .catch(() => undefined)
      .then(() => writeData(snapshot))
      .then(() => {
        channel.current?.postMessage({ type: 'saved', from: tabId } satisfies Message);
        if (latest === revision.current && !dirty.current) {
          setSaveState(SAVED);
          setStorageError('');
        }
      })
      .catch(() => {
        if (latest === revision.current) {
          setSaveState('Chưa lưu được');
          setStorageError(
            'Chưa lưu được thay đổi. Có thể bộ nhớ đã đầy. Xuất dữ liệu để giữ bài, rồi thử lưu lại.',
          );
        }
      });
  }, []);

  const mutate = useCallback<StudyStore['mutate']>(
    (update, options) => {
      const next = update(current.current);
      current.current = next;
      setData(next);
      setSaveState('Đang lưu…');
      dirty.current = true;
      clearTimeout(timer.current);
      if (options?.immediate) flush();
      else timer.current = setTimeout(flush, SAVE_DELAY_MS);
    },
    [flush],
  );

  useEffect(() => {
    let active = true;
    readData()
      .then(value => {
        if (!active) return;
        current.current = value;
        setData(value);
        setSaveState(SAVED);
      })
      .catch(() => {
        if (!active) return;
        setStorageError(
          'Không mở được bộ nhớ trình duyệt. Bạn vẫn có thể luyện, nhưng hãy xuất dữ liệu trước khi rời trang.',
        );
        setSaveState('Chưa lưu được');
      })
      .finally(() => {
        if (active) setReady(true);
      });

    // Write pending edits as soon as the page may be closed or frozen.
    const onHidden = () => {
      if (document.visibilityState === 'hidden') flush();
    };
    document.addEventListener('visibilitychange', onHidden);
    window.addEventListener('pagehide', flush);

    // Another tab saved: pick up its data, unless this tab has edits of its own.
    if (typeof BroadcastChannel !== 'undefined') {
      channel.current = new BroadcastChannel(CHANNEL);
      channel.current.onmessage = (event: MessageEvent<Message>) => {
        if (event.data?.type !== 'saved' || event.data.from === tabId) return;
        if (dirty.current) setConflict(true);
        else void load();
      };
    }
    return () => {
      active = false;
      flush();
      document.removeEventListener('visibilitychange', onHidden);
      window.removeEventListener('pagehide', flush);
      channel.current?.close();
      channel.current = null;
    };
  }, [flush, load]);

  const reload = useCallback(() => {
    clearTimeout(timer.current);
    dirty.current = false;
    void load();
  }, [load]);

  const dismissConflict = useCallback(() => setConflict(false), []);

  return { data, ready, saveState, storageError, conflict, mutate, reload, dismissConflict };
}
