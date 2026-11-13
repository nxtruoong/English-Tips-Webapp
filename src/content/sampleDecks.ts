// Ready-made starter decks for the flashcard page. Meanings are short Vietnamese
// glosses for the sense used in the example; examples are original sentences.
import type { CardInput } from '../flashcards';
import type { Level } from './guide';

export interface SampleDeck {
  id: string;
  title: string;
  description: string;
  /**
   * Levels this deck suits; the first is its main level, which earns the
   * "fits your level" badge. A hint only, never a restriction.
   */
  levels: Level[];
  cards: CardInput[];
}

const c = (word: string, meaning: string, example: string): CardInput => ({ word, meaning, example });

export const sampleDecks: SampleDeck[] = [
  {
    id: 'speaking-everyday',
    title: 'Giao tiếp hằng ngày & Speaking Part 1',
    description: 'Từ và cụm từ để nói về bản thân, thói quen, sở thích.',
    levels: ['beginner', 'intermediate'],
    cards: [
      c('hometown', 'quê nhà', 'My hometown is a small city near the coast.'),
      c('be into something', 'thích, mê cái gì', "I'm really into mobile games these days."),
      c('unwind', 'thư giãn', 'I listen to music to unwind after class.'),
      c('hectic', 'bận rộn, hối hả', 'My schedule is quite hectic during exam season.'),
      c('get on well with', 'hòa hợp với ai', 'I get on well with my roommates.'),
      c('keen on', 'hứng thú với, thích', "I'm not very keen on cooking."),
      c(
        'commute',
        'đi lại hằng ngày (nhà – trường/chỗ làm)',
        'My daily commute takes about 30 minutes by bus.',
      ),
      c('it depends', 'còn tùy', 'It depends on how much free time I have.'),
      c('catch up with', 'gặp lại để hàn huyên', 'I usually catch up with old friends at weekends.'),
      c('to be honest', 'thành thật mà nói', "To be honest, I don't read much."),
      c('spare time', 'thời gian rảnh', 'In my spare time, I play badminton.'),
      c('cosy', 'ấm cúng', 'My room is small but cosy.'),
    ],
  },
  {
    id: 'toeic-office',
    title: 'TOEIC: công sở & kinh doanh',
    description: 'Từ hay gặp trong email, thông báo và hội thoại văn phòng của đề TOEIC.',
    levels: ['intermediate', 'beginner'],
    cards: [
      c('deadline', 'hạn chót', 'The deadline for the report is Friday.'),
      c('postpone', 'hoãn lại', 'The meeting has been postponed until next week.'),
      c('invoice', 'hóa đơn', 'Please send the invoice to the accounting department.'),
      c('colleague', 'đồng nghiệp', 'I asked a colleague to check my email.'),
      c('agenda', 'nội dung, chương trình cuộc họp', 'The first item on the agenda is the budget.'),
      c('applicant', 'người nộp đơn, ứng viên', 'There were over 200 applicants for the position.'),
      c('reimburse', 'hoàn trả (chi phí)', 'The company will reimburse your travel expenses.'),
      c('shipment', 'lô hàng', 'The shipment will arrive on Monday.'),
      c('warranty', 'chế độ bảo hành', 'The laptop comes with a two-year warranty.'),
      c('budget', 'ngân sách', 'We are over budget this month.'),
      c('attend', 'tham dự', 'All staff must attend the training session.'),
      c('confirm', 'xác nhận', 'Please confirm your booking by email.'),
    ],
  },
  {
    id: 'academic-core',
    title: 'Từ học thuật thường gặp',
    description: 'Từ xuất hiện nhiều trong bài đọc và bài viết IELTS, TOEIC.',
    levels: ['intermediate'],
    cards: [
      c(
        'significant',
        'đáng kể, quan trọng',
        'There was a significant increase in online shopping last year.',
      ),
      c('evidence', 'bằng chứng', 'The writer gives no evidence for this claim.'),
      c('approach', 'cách tiếp cận, phương pháp', 'We need a different approach to this problem.'),
      c('factor', 'yếu tố', 'Cost is the main factor when students choose a laptop.'),
      c('affect', 'ảnh hưởng đến', 'Lack of sleep can affect your memory.'),
      c('benefit', 'lợi ích', 'Regular review brings long-term benefits.'),
      c('require', 'đòi hỏi, cần', 'The course requires two hours of practice a week.'),
      c('indicate', 'cho thấy, chỉ ra', 'The results indicate that most students study alone.'),
      c('maintain', 'duy trì', 'It is hard to maintain motivation without a clear goal.'),
      c('issue', 'vấn đề', 'Traffic is a serious issue in big cities.'),
      c('available', 'có sẵn', 'The recordings are available online.'),
      c('approximately', 'xấp xỉ, khoảng', 'Approximately 40% of the students said they lacked motivation.'),
      c('reliable', 'đáng tin cậy', 'Use a reliable dictionary to check pronunciation.'),
      c('alternative', 'phương án thay thế', 'Cycling is a cheap alternative to taking the bus.'),
      c('contribute to', 'góp phần vào', 'Good sleep contributes to better exam results.'),
    ],
  },
  {
    id: 'writing-charts',
    title: 'Mô tả biểu đồ (Writing Task 1)',
    description: 'Động từ, trạng từ và cụm từ để tả xu hướng và so sánh số liệu.',
    levels: ['advanced', 'intermediate'],
    cards: [
      c(
        'fluctuate',
        'dao động, lên xuống thất thường',
        'The price of coffee fluctuated throughout the year.',
      ),
      c('peak', 'đạt đỉnh', 'Sales peaked at 500 units in July.'),
      c('remain stable', 'giữ ổn định', 'The number of visitors remained stable at around 2,000.'),
      c('gradual', 'dần dần, từ từ', 'There was a gradual rise in temperature.'),
      c('sharply', '(tăng/giảm) mạnh, đột ngột', 'Unemployment fell sharply in 2010.'),
      c('proportion', 'tỉ lệ, phần', 'A large proportion of students live with their parents.'),
      c('account for', 'chiếm (bao nhiêu phần)', 'Rice accounts for 60% of the total.'),
      c(
        'respectively',
        'lần lượt (theo thứ tự đã nêu)',
        'Figures for A and B were 20% and 35% respectively.',
      ),
      c('overtake', 'vượt qua', 'Online sales overtook in-store sales in 2020.'),
      c('a slight dip', 'sự giảm nhẹ', 'There was a slight dip in profits in March.'),
      c('by contrast', 'ngược lại', 'By contrast, spending on food decreased.'),
      c('overall', 'nhìn chung', 'Overall, the number of tourists rose over the period.'),
    ],
  },
  {
    id: 'it-core',
    title: 'Tiếng Anh ngành CNTT',
    description: 'Thuật ngữ gặp hằng ngày trong tài liệu, môn học và công việc IT.',
    levels: ['advanced', 'intermediate'],
    cards: [
      c('algorithm', 'thuật toán', 'The search algorithm returns results in under a second.'),
      c('database', 'cơ sở dữ liệu', 'All user accounts are stored in a database.'),
      c('deploy', 'triển khai (đưa lên môi trường chạy thật)', 'We deploy the new version every Friday.'),
      c('debug', 'gỡ lỗi', 'I spent the whole morning debugging the login page.'),
      c('requirement', 'yêu cầu (của hệ thống, dự án)', 'The client changed the requirements twice.'),
      c(
        'framework',
        'framework, bộ khung phát triển',
        'Django is a popular framework for building web applications.',
      ),
      c('encryption', 'mã hóa', 'Encryption keeps stolen data unreadable.'),
      c('authentication', 'xác thực danh tính', 'The app uses two-factor authentication.'),
      c('repository', 'kho mã nguồn', 'Clone the repository before you start.'),
      c('latency', 'độ trễ', 'High latency makes video calls lag.'),
      c('scalable', 'có khả năng mở rộng', 'The system must be scalable to millions of users.'),
      c('compatible', 'tương thích', 'This app is not compatible with older phones.'),
      c('bandwidth', 'băng thông', 'Streaming video uses a lot of bandwidth.'),
      c('backup', 'bản sao lưu', 'Always keep a backup of important files.'),
      c('interface', 'giao diện', 'The new interface is easier to use.'),
    ],
  },
];
