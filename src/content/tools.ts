// Free tools page (#tools). URLs and site icons come from the resource list in
// guide.ts so a link is maintained in one place.
import { resourceGroups, type Resource } from './guide';

export const toolSkills = ['Từ vựng', 'Phát âm', 'Nghe', 'Nói', 'Đọc', 'Viết'] as const;
export type ToolSkill = (typeof toolSkills)[number];

export interface Tool extends Resource {
  skills: ToolSkill[];
}

const resources = new Map(resourceGroups.flatMap(g => g.items.map(r => [r.name, r])));

function tool(name: string, use: string, skills: ToolSkill[], label = name): Tool {
  const resource = resources.get(name);
  if (!resource) throw new Error(`Missing resource: ${name}`);
  return { ...resource, name: label, use, skills };
}

export const toolGroups: { title: string; items: Tool[] }[] = [
  {
    title: 'Flashcard từ vựng',
    items: [
      tool('Anki', 'Flashcard tự làm, tự xếp lịch ôn theo lặp lại ngắt quãng.', ['Từ vựng']),
      tool('Quizlet', 'Bộ thẻ có sẵn theo chủ đề, ôn nhanh bằng trò chơi và kiểm tra.', ['Từ vựng']),
    ],
  },
  {
    title: 'Nghe – chép chính tả',
    items: [
      tool('DailyDictation', 'Nghe từng câu ngắn rồi gõ lại, so ngay với đáp án.', ['Nghe', 'Phát âm']),
    ],
  },
  {
    title: 'Từ điển & phát âm',
    items: [
      tool('Cambridge Dictionary', 'Nghĩa Anh–Anh/Anh–Việt, phiên âm và audio giọng Anh, Mỹ.', [
        'Từ vựng',
        'Phát âm',
      ]),
      tool('Oxford Learner’s Dictionaries', 'Từ điển cho người học, có collocation và câu ví dụ.', [
        'Từ vựng',
        'Phát âm',
      ]),
    ],
  },
  {
    title: 'Câu ví dụ theo ngữ cảnh',
    items: [
      tool(
        'Ludwig',
        'Kiểm tra một cụm từ có tự nhiên không bằng câu thật từ báo, tài liệu.',
        ['Viết', 'Từ vựng'],
        'Ludwig.guru',
      ),
    ],
  },
  {
    title: 'Luyện đề TOEIC, IELTS',
    items: [
      tool('STUDY4', 'Đề TOEIC và IELTS dạng máy tính, chấm điểm Nghe – Đọc ngay.', ['Nghe', 'Đọc']),
      tool('Mini IELTS', 'Bài Nghe, Đọc ngắn, làm xong trong một buổi.', ['Nghe', 'Đọc']),
      tool('IELTS Online Tests', 'Đề luyện IELTS theo từng kỹ năng, có giải thích.', ['Nghe', 'Đọc', 'Viết']),
    ],
  },
  {
    title: 'Nhập môn',
    items: [tool('Duolingo', 'Bài 5 phút mỗi ngày cho người mới làm quen lại.', ['Từ vựng', 'Nghe'])],
  },
  {
    title: 'Luyện hội thoại & sửa bài viết',
    items: [
      tool(
        'ChatGPT / Claude',
        'Bản miễn phí: hỏi đáp bằng tiếng Anh, nhờ sửa lỗi bài viết và giải thích vì sao.',
        ['Nói', 'Viết'],
        'ChatGPT / Claude (bản miễn phí)',
      ),
    ],
  },
];

/** Places to practise speaking. Information only: no specific group is endorsed. */
export const speakingPlaces: { title: string; text: string; tips: string[] }[] = [
  {
    title: 'Nhóm trao đổi ngôn ngữ trên Discord',
    text: 'Nhiều server Discord có kênh thoại luyện tiếng Anh mở suốt ngày. Tìm theo từ khóa “English learning” hoặc “language exchange”.',
    tips: [
      'Vào kênh chữ trước để quen, sau đó mới vào kênh thoại.',
      'Đọc nội quy server; không chia sẻ thông tin cá nhân.',
    ],
  },
  {
    title: 'Câu lạc bộ ngoại ngữ',
    text: 'Trường, khoa hoặc Đoàn – Hội thường có câu lạc bộ tiếng Anh sinh hoạt định kỳ, miễn phí cho sinh viên.',
    tips: [
      'Hỏi trên fanpage của trường, khoa hoặc phòng Công tác sinh viên.',
      'Buổi sinh hoạt theo chủ đề giúp có sẵn ý để nói.',
    ],
  },
  {
    title: 'Học nhóm với bạn bè',
    text: 'Nhóm 2–4 người, mỗi tuần 1–2 buổi khoảng 30 phút. Không cần ai giỏi hơn: mục tiêu là được nói thường xuyên.',
    tips: [
      'Dùng câu hỏi Speaking Part 1 trong mục Luyện tập làm đề tài.',
      'Mỗi người ghi âm câu trả lời, nghe lại và góp ý 1 điểm cụ thể.',
    ],
  },
];
