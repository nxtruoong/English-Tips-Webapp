import { emptyData, type StudyData, type Attempt } from './domain';
import { isLessonStage, type LessonProgress } from './curriculum';

let database: Promise<IDBDatabase> | undefined;
function db(): Promise<IDBDatabase> {
  if (!database) {
    database = new Promise((resolve, reject) => {
      const request = indexedDB.open('hien-study', 1);
      request.onupgradeneeded = () => request.result.createObjectStore('study');
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
      request.onblocked = () => reject(new Error('Đóng các tab Hiên khác rồi tải lại.'));
    });
    database.catch(() => {
      database = undefined;
    });
  }
  return database;
}
export async function readData(): Promise<StudyData> {
  const database = await db();
  return new Promise((resolve, reject) => {
    const tx = database.transaction('study', 'readonly');
    const request = tx.objectStore('study').get('data');
    request.onsuccess = () => resolve(request.result ? validateData(request.result, true) : emptyData());
    request.onerror = () => reject(request.error);
  });
}
export async function writeData(data: StudyData): Promise<void> {
  const database = await db();
  return new Promise((resolve, reject) => {
    const tx = database.transaction('study', 'readwrite');
    tx.objectStore('study').put(data, 'data');
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error || new Error('Lưu dữ liệu bị gián đoạn.'));
  });
}
function record(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
function strings(value: unknown): value is string[] {
  return Array.isArray(value) && value.every(item => typeof item === 'string');
}
function date(value: unknown): value is string {
  return typeof value === 'string' && Number.isFinite(Date.parse(value));
}
export function validateData(value: unknown, allowBlobs = false): StudyData {
  if (!record(value) || value.schema !== 1 || !Array.isArray(value.attempts) || !strings(value.saved))
    throw new Error('Tệp không đúng định dạng Hiên phiên bản 1.');
  const ids = new Set<string>();
  const attempts = value.attempts.map((item: unknown): Attempt => {
    if (
      !record(item) ||
      typeof item.id !== 'string' ||
      !item.id ||
      ids.has(item.id) ||
      typeof item.activityId !== 'string' ||
      !Number.isInteger(item.version) ||
      Number(item.version) < 1 ||
      !date(item.createdAt) ||
      !date(item.updatedAt) ||
      !record(item.responses) ||
      !Object.values(item.responses).every(x => typeof x === 'string') ||
      typeof item.plan !== 'string' ||
      typeof item.draft !== 'string' ||
      !strings(item.checks) ||
      typeof item.revealed !== 'boolean' ||
      !['draft', 'completed'].includes(String(item.status)) ||
      !Array.isArray(item.revisions) ||
      !item.revisions.every(r => record(r) && typeof r.text === 'string' && date(r.date)) ||
      (item.score !== undefined &&
        (typeof item.score !== 'number' || !Number.isInteger(item.score) || item.score < 0))
    )
      throw new Error('Một lượt học trong tệp không hợp lệ.');
    if (item.recording !== undefined && (!allowBlobs || !(item.recording instanceof Blob)))
      throw new Error('Bản ghi âm không hợp lệ.');
    ids.add(item.id);
    // Rebuild allowed properties; never spread untrusted imported objects.
    return {
      id: item.id,
      activityId: item.activityId,
      version: Number(item.version),
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      responses: Object.fromEntries(Object.entries(item.responses).map(([k, v]) => [k, String(v)])),
      plan: item.plan,
      draft: item.draft,
      revisions: item.revisions.map(r => ({ text: r.text, date: r.date })),
      checks: item.checks,
      revealed: item.revealed,
      status: item.status === 'draft' ? 'draft' : 'completed',
      ...(item.score !== undefined ? { score: Number(item.score) } : {}),
      ...(allowBlobs && item.recording instanceof Blob ? { recording: item.recording } : {}),
    };
  });
  const lessons: Record<string, LessonProgress> = {};
  if (value.lessons !== undefined) {
    if (!record(value.lessons)) throw new Error('Tiến độ bài học không hợp lệ.');
    for (const [key, progress] of Object.entries(value.lessons)) {
      if (
        !/^[a-z]+-\d+$/.test(key) ||
        !record(progress) ||
        typeof progress.stage !== 'string' ||
        !isLessonStage(progress.stage) ||
        !strings(progress.completed) ||
        !progress.completed.every(isLessonStage) ||
        !record(progress.notes) ||
        !Object.values(progress.notes).every(note => typeof note === 'string')
      )
        throw new Error('Tiến độ bài học không hợp lệ.');
      lessons[key] = {
        stage: progress.stage,
        completed: [...new Set(progress.completed)].filter(isLessonStage),
        notes: Object.fromEntries(Object.entries(progress.notes).map(([id, note]) => [id, String(note)])),
      };
    }
  }
  return { schema: 1, attempts, saved: [...new Set(value.saved)], lessons };
}
export function download(blob: Blob, name: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
