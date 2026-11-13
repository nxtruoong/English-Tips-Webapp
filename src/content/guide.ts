// Study methods and free resources, adapted from
// OtherInfo/"Phương pháp học và nền tảng học.docx". Wording is tidied; meaning follows the source.

export type Level = 'beginner' | 'intermediate' | 'advanced';
export type TimeBudget = 'low' | 'high';

export const levels: { id: Level; label: string; trait: string; goal?: string }[] = [
  {
    id: 'beginner',
    label: 'Mất gốc / mới bắt đầu',
    trait: 'Chưa vững phát âm và chữ viết, còn lỗi ngữ pháp sơ cấp, vốn từ ít và chưa biết bắt đầu từ đâu.',
    goal: 'Chuẩn hóa phát âm, nắm hơn 1.000 từ vựng và các cấu trúc ngữ pháp cơ bản.',
  },
  {
    id: 'intermediate',
    label: 'Trung bình, có nền tảng',
    trait:
      'Nắm ngữ pháp cơ bản, đọc hiểu được văn bản ngắn, nhưng thiếu từ vựng trung–cao cấp và chưa quen tốc độ nói của người bản xứ.',
  },
  {
    id: 'advanced',
    label: 'Khá / giỏi',
    trait: 'Nghe tốt, giao tiếp trôi chảy; chỉ gặp khó với giao tiếp chuyên sâu và từ vựng chuyên ngành.',
  },
];

export const timeBudgets: { id: TimeBudget; label: string; detail: string }[] = [
  { id: 'low', label: 'Ít thời gian', detail: '2–5 giờ/tuần · khoảng 20–30 phút/ngày' },
  { id: 'high', label: 'Nhiều thời gian', detail: 'Trên 10 giờ/tuần · hơn 1,5 giờ/ngày' },
];

export interface Step {
  title: string;
  text: string;
  tools?: string[];
}

export const plans: Record<Level, Partial<Record<TimeBudget, Step[]>> & { any?: Step[] }> = {
  beginner: {
    low: [
      {
        title: 'Phát âm',
        text: 'Mỗi ngày luyện 2–3 âm mới qua video ngắn có hướng dẫn. Kiểm tra lại bằng nhận diện giọng nói trên điện thoại: máy ghi đúng chữ nghĩa là bạn đọc đúng.',
        tools: ['Google Speech-to-Text'],
      },
      {
        title: '5 từ mới mỗi ngày',
        text: 'Học bằng flashcard có hình ảnh để hình dung được từ, không chỉ nhớ nghĩa dịch.',
        tools: ['Anki', 'Quizlet'],
      },
      {
        title: 'Nghe thụ động',
        text: 'Nghe hội thoại rất ngắn, tốc độ chậm. Chưa hiểu hết cũng được: mục tiêu là cho tai quen âm.',
      },
      {
        title: 'Tận dụng thời gian chết',
        text: 'Ôn từ và ngữ pháp lúc đi xe buýt, chờ thang máy, trước khi ngủ.',
      },
    ],
    high: [
      {
        title: 'Ngữ pháp từ giáo trình cơ bản',
        text: 'Học lại ngữ pháp sơ cấp theo sách giáo khoa hoặc giáo trình nền tảng, tự viết ví dụ cho mỗi cấu trúc.',
      },
      {
        title: 'Nghe audio dài hơn',
        text: 'Audio dài giúp gặp nhiều từ mới trong ngữ cảnh.',
      },
      {
        title: 'Shadowing',
        text: 'Nghe và nói đuổi theo người nói để luyện phản xạ và quen cảm giác nói tiếng Anh.',
      },
      {
        title: 'Flashcard hằng ngày',
        text: 'Duy trì ôn từ bằng lặp lại ngắt quãng.',
        tools: ['Anki', 'Quizlet'],
      },
    ],
  },
  intermediate: {
    low: [
      {
        title: 'Dictation (nghe – chép)',
        text: 'Nghe đoạn ngắn rồi chép lại. Cách này lộ ra lỗi bạn hay bỏ sót: âm bị nuốt, nối âm, trợ từ và ngữ pháp.',
        tools: ['DailyDictation'],
      },
      {
        title: 'Đọc và thu nạp từ',
        text: 'Đọc đoạn văn ngắn với công cụ tra từ một chạm, lưu từ mới để ôn lại sau.',
        tools: ['Google Translate', 'Yomitan'],
      },
    ],
    high: [
      {
        title: 'Giải đề Đọc/Nghe trung cấp',
        text: 'Làm bài, sau đó dành phần lớn thời gian phân tích câu sai: vì sao sai, bằng chứng nằm ở đâu.',
        tools: ['Mini IELTS', 'IELTS Online Tests', 'STUDY4'],
      },
      {
        title: 'Học từ đồng nghĩa (paraphrase)',
        text: 'Đề IELTS thường diễn đạt lại ý trong bài. Tra từ đồng nghĩa cho các từ khóa bạn gặp.',
        tools: ['Thesaurus'],
      },
      {
        title: 'Dùng AI làm trợ lý sửa lỗi',
        text: 'Nhờ chatbot sửa ngữ pháp, gợi ý cách diễn đạt và nhận xét bài viết. Luôn đọc lại và tự hiểu vì sao sửa.',
        tools: ['ChatGPT / Claude'],
      },
    ],
  },
  advanced: {
    any: [
      {
        title: 'Tự học bằng tài liệu chuyên ngành',
        text: 'Đọc tài liệu, báo cáo và bài giảng chuyên ngành bằng tiếng Anh; ghi lại thuật ngữ mới.',
        tools: ['Ludwig'],
      },
      {
        title: 'Viết chuyên nghiệp',
        text: 'Luyện viết email, báo cáo; dùng công cụ sửa văn phong để học cách diễn đạt trang trọng hơn.',
        tools: ['Grammarly'],
      },
    ],
  },
};

export const goals: { title: string; who: string; core: string; steps: string[] }[] = [
  {
    title: 'Đạt chuẩn đầu ra của trường',
    who: 'Cần chứng chỉ (IELTS, TOEIC…) để tốt nghiệp hoặc lấy bằng tốt hơn.',
    core: 'Pattern recognition – nhận diện dạng bài',
    steps: [
      'Học kỹ từng dạng đề để làm nhanh và đúng hướng.',
      'Luyện thêm ngữ pháp và kỹ năng scanning cho bài đọc.',
      'Đặt mục tiêu điểm theo đúng mức trường yêu cầu.',
    ],
  },
  {
    title: 'Giao tiếp thực tế',
    who: 'Muốn nói và nghe tự nhiên trong đời sống.',
    core: 'Shadowing + hội thoại với AI giọng nói',
    steps: [
      'Nhại lại giọng, nhịp và cách xử lý tình huống của người nói; luyện mỗi ngày.',
      'Xem video ngắn, nội dung giải trí bằng tiếng Anh để học từ lóng, viết tắt và cách ứng xử. Cách này cũng giúp đỡ chán.',
    ],
  },
  {
    title: 'Chuyên ngành & sự nghiệp',
    who: 'Cần đọc tài liệu, viết email và báo cáo trong công việc.',
    core: 'Contextual reading – học từ trong ngữ cảnh',
    steps: [
      'Vừa đọc vừa tra từ trong ngữ cảnh thật bằng công cụ như Ludwig.',
      'Viết email, báo cáo rồi dùng AI hoặc Grammarly để sửa văn phong.',
    ],
  },
];

export const barriers: { barrier: string; cause: string; fix: string }[] = [
  {
    barrier: 'Khó nhớ từ vựng',
    cause: 'Học rời rạc, nhảy chủ đề, học thụ động: nhớ nhanh nhưng quên cũng nhanh.',
    fix: 'Lặp lại ngắt quãng (spaced repetition) kết hợp flashcard, học theo chủ đề.',
  },
  {
    barrier: 'Ngại nói, khó nghe, thiếu phản xạ',
    cause: 'Sợ bị chê cười vì phát âm hoặc nghe chưa tốt.',
    fix: 'Luyện với AI chatbot để không áp lực. Tự độc thoại theo chủ đề, tự đóng vai nhiều phía. Shadowing và dictation hằng ngày.',
  },
  {
    barrier: 'Thiếu động lực, hay trì hoãn',
    cause: 'Mục tiêu đặt vội và mơ hồ; hăng hái lúc đầu rồi nản vì lộ trình quá dài.',
    fix: 'Chia nhỏ buổi học (micro learning, Pomodoro), đặt mức vừa sức, tìm bạn học cùng (study buddy).',
  },
];

export const glossary: { term: string; text: string }[] = [
  {
    term: 'Shadowing',
    text: 'Nghe và nói đuổi theo audio gần như cùng lúc, bắt chước âm, nhịp và ngữ điệu.',
  },
  {
    term: 'Dictation',
    text: 'Nghe một đoạn ngắn rồi chép lại từng chữ, sau đó so với bản gốc để tìm chỗ nghe sai.',
  },
  {
    term: 'Spaced repetition',
    text: 'Ôn một từ ngay trước lúc sắp quên; khoảng cách ôn giãn dần. Anki làm việc này tự động.',
  },
  {
    term: 'Pattern recognition',
    text: 'Nhận ra dạng câu hỏi và cách làm tương ứng để tiết kiệm thời gian trong phòng thi.',
  },
  { term: 'Contextual reading', text: 'Học từ qua câu và đoạn văn thật thay vì học danh sách từ rời.' },
  {
    term: 'Micro learning / Pomodoro',
    text: 'Học từng khối ngắn (ví dụ 25 phút) rồi nghỉ, để dễ bắt đầu và duy trì.',
  },
];

export type Price = 'free' | 'freemium';
export const priceLabel: Record<Price, string> = {
  free: 'Miễn phí',
  freemium: 'Có bản miễn phí',
};

export interface Resource {
  name: string;
  use: string;
  url: string;
  /** Site icon in the public folder. */
  icon: string;
  price: Price;
  note?: string;
}

export const resourceGroups: { title: string; items: Resource[] }[] = [
  {
    title: 'Từ điển & từ vựng',
    items: [
      {
        name: 'Cambridge Dictionary',
        icon: '/media/favicons/cambridge.jpg',
        use: 'Từ điển Anh–Anh, Anh–Việt, có phát âm.',
        url: 'https://dictionary.cambridge.org/vi/',
        price: 'free',
      },
      {
        name: 'Oxford Learner’s Dictionaries',
        icon: '/media/favicons/oxford.png',
        use: 'Từ điển cho người học, có ví dụ và collocation.',
        url: 'https://www.oxfordlearnersdictionaries.com/',
        price: 'free',
      },
      {
        name: 'Thesaurus',
        icon: '/media/favicons/thesaurus.png',
        use: 'Tìm từ đồng nghĩa để paraphrase.',
        url: 'https://www.thesaurus.com/',
        price: 'free',
      },
      {
        name: 'Ludwig',
        icon: '/media/favicons/ludwig.png',
        use: 'Xem từ/cụm từ được dùng trong câu thật từ nguồn uy tín.',
        url: 'https://ludwig.guru/',
        price: 'freemium',
      },
    ],
  },
  {
    title: 'Flashcard',
    items: [
      {
        name: 'Anki',
        icon: '/media/favicons/anki.png',
        use: 'Flashcard với lặp lại ngắt quãng.',
        url: 'https://apps.ankiweb.net/',
        price: 'free',
        note: 'Bản iOS trả phí; máy tính, Android và web miễn phí.',
      },
      {
        name: 'Quizlet',
        icon: '/media/favicons/quizlet.png',
        use: 'Tạo và học bộ flashcard, có sẵn nhiều bộ của người khác.',
        url: 'https://quizlet.com/vn',
        price: 'freemium',
      },
    ],
  },
  {
    title: 'Nghe – chép & phát âm',
    items: [
      {
        name: 'DailyDictation',
        icon: '/media/favicons/dailydictation.png',
        use: 'Audio ngắn để nghe – chép, tự chấm từng câu.',
        url: 'https://dailydictation.com/',
        price: 'free',
      },
      {
        name: 'Google Speech-to-Text',
        icon: '/media/favicons/google-cloud.png',
        use: 'Chuyển lời nói thành chữ để tự kiểm tra phát âm. Trên điện thoại có thể dùng luôn tính năng nhập bằng giọng nói của bàn phím.',
        url: 'https://cloud.google.com/speech-to-text',
        price: 'freemium',
      },
    ],
  },
  {
    title: 'Luyện đề IELTS / TOEIC',
    items: [
      {
        name: 'STUDY4',
        icon: '/media/favicons/study4.png',
        use: 'Đề và khóa luyện IELTS, TOEIC.',
        url: 'https://study4.com/',
        price: 'freemium',
      },
      {
        name: 'Mini IELTS',
        icon: '/media/favicons/mini-ielts.png',
        use: 'Bài tập IELTS ngắn theo kỹ năng.',
        url: 'https://mini-ielts.com/',
        price: 'free',
      },
      {
        name: 'IELTS Online Tests',
        icon: '/media/favicons/ieltsonlinetests.png',
        use: 'Đề thi thử IELTS trực tuyến.',
        url: 'https://ieltsonlinetests.com/',
        price: 'freemium',
      },
    ],
  },
  {
    title: 'Viết & sửa lỗi',
    items: [
      {
        name: 'Grammarly',
        icon: '/media/favicons/grammarly.png',
        use: 'Sửa chính tả, ngữ pháp và văn phong.',
        url: 'https://www.grammarly.com/',
        price: 'freemium',
      },
      {
        name: 'ChatGPT / Claude',
        icon: '/media/favicons/claude.png',
        use: 'Hỏi ngữ pháp, nhờ nhận xét bài viết, luyện hội thoại.',
        url: 'https://claude.ai/',
        price: 'freemium',
        note: 'Luôn tự kiểm tra lại; AI có thể sửa sai.',
      },
    ],
  },
  {
    title: 'Dịch, tra nhanh & học tổng quát',
    items: [
      {
        name: 'Google Translate',
        icon: '/media/favicons/google-translate.png',
        use: 'Dịch nhanh câu hoặc đoạn.',
        url: 'https://translate.google.com/',
        price: 'free',
      },
      {
        name: 'Yomitan',
        icon: '/media/favicons/yomitan.png',
        use: 'Tiện ích trình duyệt: rê chuột vào từ để tra nghĩa.',
        url: 'https://yomitan.wiki/',
        price: 'free',
      },
      {
        name: 'Duolingo',
        icon: '/media/favicons/duolingo.png',
        use: 'Ôn 4 kỹ năng ở mức cơ bản, bài ngắn mỗi ngày.',
        url: 'https://www.duolingo.com/',
        price: 'freemium',
      },
    ],
  },
];

export const budgets: { title: string; text: string }[] = [
  {
    title: 'Ngân sách 0 đồng',
    text: 'Đủ để học: Anki/Quizlet bản miễn phí, DailyDictation, Mini IELTS, IELTS Online Tests, chatbot AI bản miễn phí, và các server Discord luyện nói.',
  },
  {
    title: 'Ngân sách nhỏ',
    text: 'Chung tài khoản bản quyền (Quizlet Plus, Grammarly Premium) hoặc mua sách giáo trình in để luyện trực tiếp.',
  },
];

/** Name → URL, for linking tool chips on the methods page. */
export const resourceUrl: Record<string, string> = Object.fromEntries(
  resourceGroups.flatMap(g => g.items.map(r => [r.name, r.url])),
);
