// Temporary stand-in for the community server: used when `api/community` is missing
// (for example on a deployment without the serverless function). Posts live in this browser only.
import type { Board, CommunityAction, Thread } from './community';

const KEY = 'hien.community.mock';
const VIEWER = 'local-viewer';
const ago = (hours: number) => new Date(Date.now() - hours * 3_600_000).toISOString();

function seed(): Thread[] {
  return [
    {
      id: 'mock-1',
      category: 'questions',
      title: 'Listening Part 1 hay nghe sót số điện thoại, có mẹo nào không?',
      body: 'Mình toàn bị lỡ 1–2 số khi người nói đọc nhanh. Mọi người có cách ghi chép nào hiệu quả không?',
      nickname: 'Minh Anh',
      owner: 'mock-a',
      createdAt: ago(3),
      replies: [
        {
          id: 'mock-1-r1',
          body: 'Mình chia số thành cụm 3-3-4 khi ghi, và để ý “double” với “oh” (= 0). Nghe lại vài lần là quen.',
          nickname: 'Tuấn',
          owner: 'mock-b',
          createdAt: ago(2),
        },
      ],
    },
    {
      id: 'mock-2',
      category: 'tips',
      title: 'Ôn 10 thẻ từ vựng mỗi sáng giúp mình nhớ lâu hơn hẳn',
      body: 'Thay vì học 50 từ một lúc, mình ôn 10 thẻ mỗi sáng trước khi đi học. Sau 2 tuần thấy nhớ chắc hơn nhiều.',
      nickname: 'Hà Linh',
      owner: 'mock-c',
      createdAt: ago(26),
      replies: [],
    },
    {
      id: 'mock-3',
      category: 'partners',
      title: 'Tìm bạn luyện Speaking 20 phút tối thứ 3, 5',
      body: 'Mình khoảng band 5.5, muốn luyện Part 2 và Part 3. Rảnh 21h–21h30. Ai quan tâm thì trả lời bên dưới nhé.',
      nickname: 'Quang',
      owner: 'mock-d',
      createdAt: ago(50),
      replies: [
        {
          id: 'mock-3-r1',
          body: 'Mình tham gia được tối thứ 5!',
          nickname: 'Thảo',
          owner: 'mock-e',
          createdAt: ago(40),
        },
      ],
    },
  ];
}

function read(): Thread[] {
  try {
    const saved = localStorage.getItem(KEY);
    if (saved) return JSON.parse(saved) as Thread[];
  } catch {
    // Fall back to the seed posts.
  }
  return seed();
}
function write(threads: Thread[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(threads));
  } catch {
    // Not critical for sample data.
  }
}

export function mockBoard(): Board {
  return { threads: read(), viewerId: VIEWER };
}

export function mockAction(action: CommunityAction): { id?: string } {
  const threads = read();
  const id = `local-${crypto.randomUUID()}`;
  const now = new Date().toISOString();
  if (action.action === 'thread') {
    const { nickname, title, body, category } = action;
    write([{ id, category, title, body, nickname, owner: VIEWER, createdAt: now, replies: [] }, ...threads]);
    return { id };
  }
  if (action.action === 'reply') {
    write(
      threads.map(t =>
        t.id === action.threadId
          ? {
              ...t,
              replies: [
                ...t.replies,
                { id, body: action.body, nickname: action.nickname, owner: VIEWER, createdAt: now },
              ],
            }
          : t,
      ),
    );
    return { id };
  }
  if (action.action === 'delete') {
    write(
      action.replyId
        ? threads.map(t =>
            t.id === action.threadId ? { ...t, replies: t.replies.filter(r => r.id !== action.replyId) } : t,
          )
        : threads.filter(t => t.id !== action.threadId),
    );
  }
  return {};
}
