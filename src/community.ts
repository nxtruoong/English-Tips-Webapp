// Client for the shared discussion board served by the `api/community` function on the deployed site.
// Posts live on the server; study data stays on the device.

export const categories = {
  questions: 'Hỏi đáp',
  tips: 'Mẹo học',
  partners: 'Tìm bạn học',
} as const;
export type Category = keyof typeof categories;

export type Reply = { id: string; nickname: string; body: string; createdAt: string; owner: string };
export type Thread = Reply & { title: string; category: Category; replies: Reply[] };
export type Board = { threads: Thread[]; viewerId: string };

export type CommunityAction =
  | { action: 'thread'; nickname: string; title: string; body: string; category: Category }
  | { action: 'reply'; nickname: string; threadId: string; body: string }
  | { action: 'delete' | 'report'; threadId: string; replyId?: string };

export const LIMITS = { nameMin: 2, nameMax: 32, titleMin: 3, titleMax: 120, body: 3000 };

async function call<T>(method: 'GET' | 'POST', body?: CommunityAction): Promise<T> {
  let response: Response;
  try {
    response = await fetch(new URL('api/community', document.baseURI), {
      method,
      credentials: 'same-origin',
      cache: 'no-store',
      ...(body ? { headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) } : {}),
      signal: AbortSignal.timeout(25_000),
    });
  } catch {
    throw new Error('Không kết nối được. Kiểm tra mạng rồi thử lại.');
  }
  const result = await response.json().catch(() => null);
  if (!response.ok || !result || result.error) {
    throw new Error(result?.error || 'Máy chủ đang bận. Thử lại sau ít phút.');
  }
  return result as T;
}

export async function loadBoard(): Promise<Board> {
  const board = await call<Board>('GET');
  if (!Array.isArray(board.threads) || typeof board.viewerId !== 'string') {
    throw new Error('Dữ liệu nhận về bị lỗi. Thử tải lại.');
  }
  return board;
}

export const sendAction = (action: CommunityAction) => call<{ id?: string }>('POST', action);

const relative = new Intl.RelativeTimeFormat('vi', { numeric: 'auto' });
const fullDate = new Intl.DateTimeFormat('vi-VN', { day: 'numeric', month: 'numeric', year: 'numeric' });

/** "vừa xong", "5 phút trước", "hôm qua"… then a plain date after a week. */
export function timeAgo(iso: string, now = Date.now()): string {
  const seconds = Math.round((new Date(iso).getTime() - now) / 1000);
  if (Number.isNaN(seconds)) return '';
  if (seconds > -60) return 'vừa xong';
  const minutes = Math.round(seconds / 60);
  if (minutes > -60) return relative.format(minutes, 'minute');
  const hours = Math.round(minutes / 60);
  if (hours > -24) return relative.format(hours, 'hour');
  const days = Math.round(hours / 24);
  if (days > -7) return relative.format(days, 'day');
  return fullDate.format(new Date(iso));
}
