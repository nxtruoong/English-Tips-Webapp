import { useEffect, useRef, useState } from 'react';
import { Mic, Square, Download, Trash2 } from 'lucide-react';
import { download } from './storage';

export function Recorder({
  recording,
  onChange,
  disabled,
}: {
  recording?: Blob;
  onChange: (blob?: Blob) => void;
  disabled: boolean;
}) {
  const [state, setState] = useState<'idle' | 'requesting' | 'recording'>('idle');
  const [error, setError] = useState('');
  const [url, setUrl] = useState('');
  const [seconds, setSeconds] = useState(0);
  const recorder = useRef<MediaRecorder | null>(null);
  const stream = useRef<MediaStream | null>(null);
  const mounted = useRef(true);
  const changed = useRef(onChange);
  changed.current = onChange;
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      if (recorder.current?.state === 'recording') recorder.current.stop();
      stream.current?.getTracks().forEach(t => t.stop());
    };
  }, []);
  useEffect(() => {
    if (!recording) {
      setUrl('');
      return;
    }
    const next = URL.createObjectURL(recording);
    setUrl(next);
    return () => URL.revokeObjectURL(next);
  }, [recording]);
  useEffect(() => {
    if (state !== 'recording') return;
    const timer = setInterval(() => setSeconds(s => s + 1), 1000);
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
    };
    window.addEventListener('beforeunload', warn);
    return () => {
      clearInterval(timer);
      window.removeEventListener('beforeunload', warn);
    };
  }, [state]);
  async function start() {
    setError('');
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      setError('Trình duyệt chưa hỗ trợ ghi âm. Thử Chrome hoặc luyện nói không ghi âm.');
      return;
    }
    setState('requesting');
    try {
      const captured = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (!mounted.current) {
        captured.getTracks().forEach(t => t.stop());
        return;
      }
      stream.current = captured;
      const mimeType = ['audio/webm;codecs=opus', 'audio/ogg;codecs=opus', 'audio/mp4'].find(t =>
        MediaRecorder.isTypeSupported(t),
      );
      const next = new MediaRecorder(captured, mimeType ? { mimeType } : undefined);
      recorder.current = next;
      const chunks: Blob[] = [];
      next.ondataavailable = event => {
        if (event.data.size) chunks.push(event.data);
      };
      next.onstop = () => {
        captured.getTracks().forEach(t => t.stop());
        const result = new Blob(chunks, { type: next.mimeType || chunks[0]?.type || 'audio/webm' });
        if (result.size) changed.current(result);
        if (mounted.current) setState('idle');
      };
      next.onerror = () => {
        captured.getTracks().forEach(t => t.stop());
        if (mounted.current) {
          setState('idle');
          setError('Ghi âm bị gián đoạn. Thử lại hoặc luyện nói không ghi âm.');
        }
      };
      next.start();
      setSeconds(0);
      setState('recording');
    } catch {
      stream.current?.getTracks().forEach(t => t.stop());
      if (mounted.current) {
        setState('idle');
        setError(
          'Chưa truy cập được micro. Cho phép micro trong trình duyệt rồi thử lại, hoặc luyện nói không ghi âm.',
        );
      }
    }
  }
  return (
    <section className="recorder" aria-label="Ghi âm luyện nói">
      <h3>Ghi âm & phát lại</h3>
      <p>Ghi âm được lưu trên thiết bị này. Khi rời bài, bản ghi đang thu sẽ dừng và lưu.</p>
      <div className="actions">
        {state === 'recording' ? (
          <button className="primary" onClick={() => recorder.current?.stop()}>
            <Square size={17} /> Dừng ghi âm · {Math.floor(seconds / 60)}:
            {String(seconds % 60).padStart(2, '0')}
          </button>
        ) : (
          <button className="primary" disabled={disabled || state === 'requesting'} onClick={start}>
            <Mic size={18} />
            {state === 'requesting' ? 'Đang chờ micro…' : recording ? 'Ghi âm lại' : 'Bắt đầu ghi âm'}
          </button>
        )}
        {recording && state === 'idle' && (
          <>
            <button
              onClick={() =>
                download(
                  recording,
                  `hien-speaking.${recording.type.includes('mp4') ? 'm4a' : recording.type.includes('ogg') ? 'ogg' : 'webm'}`,
                )
              }
            >
              <Download size={17} />
              Tải bản ghi
            </button>
            <button
              disabled={disabled}
              onClick={() => {
                if (confirm('Xóa bản ghi âm này?')) onChange(undefined);
              }}
            >
              <Trash2 size={17} />
              Xóa bản ghi
            </button>
          </>
        )}
      </div>
      {url && <audio aria-label="Bản ghi của bạn" controls src={url} />}
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
    </section>
  );
}
