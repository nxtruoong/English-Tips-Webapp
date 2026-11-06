import excerpts from './excerpts.json';
import type { Activity, Question } from '../domain';

const readingOptions = ['TRUE', 'FALSE', 'NOT GIVEN'];
const listeningAnswers = ['Braithwaite', 'August', '07700 900 452', 'Fairview', 'KF4 8BL', 'Silver', 'tennis', 'shoulder', 'monthly', '60'];
const listeningPrompts = ['Applicant name: Michael ___', 'Date of birth: 18th ___, 1994', 'Contact phone number', 'Street address: 72 ___ Avenue, Kingsford', 'Postcode', 'Membership tier: ___ Member', 'Preferred indoor sport: indoor ___', 'An old injury to his ___', 'Paying on a ___ basis', 'Total initial payment today: £ ___'];
const explanations = [
  'Họ được đánh vần B-R-A-I-T-H-W-A-I-T-E. Bài luyện này không phân biệt hoa/thường.',
  'Ngày 18 và năm 1994 đã có sẵn. Chỉ điền tháng August.',
  'Số nhà 020 7946 0112 là bẫy. Michael muốn dùng số di động. Chấp nhận có hoặc không có khoảng trắng.',
  'Avenue đã được in sẵn. Chỉ điền Fairview.',
  'Mã được đọc là KF4 8BL. Chấp nhận có hoặc không có khoảng trắng.',
  'Michael từ chối Gold vì quá đắt và chọn Silver.',
  'Swimming chỉ là sở thích; môn thể thao chính là indoor tennis.',
  'Michael nói về chấn thương ở vai trái. Từ cần điền là shoulder.',
  'Michael chọn trả theo tháng, không trả trước cả năm.',
  '40 bảng tiền tháng cộng 20 bảng phí ban đầu bằng 60 bảng. Ký hiệu £ đã có sẵn.',
];
const listeningQuestions: Question[] = listeningAnswers.map((answer, i) => ({ id: `l${i+1}`, prompt: listeningPrompts[i], accepted: [answer], explanation: explanations[i], compact: i === 2 || i === 4, maxWords: i === 2 || i === 4 ? undefined : 2 }));

export const activities: Activity[] = [
  {
    id: 'listening-westlake', version: 1, skill: 'Listening', part: 'Part 1', title: 'Westlake Sports Club', description: 'Theo dấu thông tin và nhận ra lúc người nói đổi ý.', minutes: 15, technique: 'Form completion',
    theory: 'Đọc trước chỗ trống. Đoán loại thông tin cần nghe: tên, số hay thời gian. Đừng chọn đáp án đầu tiên quá sớm — người nói có thể sửa lại. Sau khi nghe, kiểm tra số ít/số nhiều và từ đã có sẵn.',
    instructions: 'Complete the form. Write NO MORE THAN TWO WORDS AND/OR A NUMBER for each answer. Đây là bài luyện một phần, không phải bài thi đầy đủ.',
    source: 'Listening/IELTS_Listening_Complete_Master_4_Parts_Updated.docx · Part 1 · Westlake Sports Club',
    verification: 'Bản nhập thử: đề và đáp án đã đối chiếu văn bản. Audio chưa được nghe kiểm định toàn bộ; không dùng kết quả để suy ra band.',
    passage: 'Westlake Sports and Leisure Club\nMembership application\n\nListen to Michael speaking to the receptionist. Complete his application using the information you hear.',
    audio: '/media/listening-part1.mp3', transcript: excerpts.listeningTranscript, questions: listeningQuestions,
  },
  {
    id: 'speaking-study', version: 1, skill: 'Speaking', part: 'Part 1', title: 'Study & university life', description: 'Nói tự nhiên về môn học, lựa chọn và những ngày ôn thi.', minutes: 10, technique: 'Developing answers',
    theory: 'Trả lời thẳng câu hỏi, giải thích ngắn rồi thêm một chi tiết thật. Dùng ý chính thay vì học thuộc cả đoạn. Nghe lại và chọn một câu để nói tốt hơn.',
    instructions: 'Answer all four questions aloud. Record if you wish, then listen and choose one answer to repeat. Suggested speaking practice: 3–4 minutes.',
    source: 'Speaking/IELTS_Speaking_Part_1.docx · F3. Study', verification: 'Câu hỏi và câu trả lời mẫu trích từ tài liệu. Tự đánh giá, không chấm band.',
    questions: [], prompts: excerpts.speakingQuestions, model: excerpts.speakingModel,
    checklist: ['Tôi trả lời đúng trọng tâm.', 'Tôi giải thích và đưa một chi tiết cụ thể.', 'Tôi hiểu được lời nói khi nghe lại.', 'Tôi chọn được một câu để luyện lại.'],
  },
  {
    id: 'reading-museum', version: 1, skill: 'Reading', part: 'Micro practice', title: 'Museum: True / False / Not Given', description: 'Phân biệt sai thông tin với thông tin chưa được nói đến.', minutes: 5, technique: 'True / False / Not Given',
    theory: 'TRUE: đoạn văn xác nhận. FALSE: đoạn văn mâu thuẫn. NOT GIVEN: chưa đủ thông tin. Đừng dùng kiến thức bên ngoài để lấp chỗ trống.',
    instructions: 'Read the passage. Choose TRUE, FALSE or NOT GIVEN for each statement.',
    source: 'Reading/IELTS_READING.docx · 1. True / False / Not Given · Small exercise', verification: 'Bài luyện ngắn từ tài liệu. Bộ bài đọc dài sẽ được bổ sung sau.',
    passage: 'The museum opened in 2004 and began offering free entry in 2010.',
    questions: [
      { id: 'r1', prompt: 'The museum started operating in 2004.', accepted: ['TRUE'], options: readingOptions, explanation: '“Opened in 2004” xác nhận “started operating in 2004”.' },
      { id: 'r2', prompt: 'Admission was free from the first day.', accepted: ['FALSE'], options: readingOptions, explanation: 'Bảo tàng mở năm 2004 nhưng chỉ bắt đầu miễn phí từ năm 2010.' },
      { id: 'r3', prompt: 'The museum is the city’s most visited attraction.', accepted: ['NOT GIVEN'], options: readingOptions, explanation: 'Đoạn văn không đề cập số lượt khách hoặc thứ hạng của bảo tàng.' },
    ],
  },
  {
    id: 'reading-garden', version: 1, skill: 'Reading', part: 'Short practice', title: 'Botanical garden', description: 'Tìm bằng chứng trước khi chọn câu trả lời.', minutes: 8, technique: 'True / False / Not Given',
    theory: 'Gạch chân mốc thời gian và những từ chỉ phạm vi như most. Đọc cả câu chứa bằng chứng trước khi quyết định.', instructions: 'Write TRUE, FALSE or NOT GIVEN.',
    source: 'Reading/IELTS_READING.docx · 1. True / False / Not Given · Full exercise', verification: 'Bài luyện ngắn từ tài liệu; không phải một passage thi hoàn chỉnh.',
    passage: 'A university established its botanical garden in 1998. In its first year, the garden held 120 plant species. A new greenhouse was constructed in 2012, allowing staff to cultivate tropical plants. The garden welcomes school groups throughout the year, but the report gives no visitor breakdown.',
    questions: [
      { id: 'g1', prompt: 'The garden was established in 1998.', accepted: ['TRUE'], options: readingOptions, explanation: 'Câu đầu xác nhận khu vườn được thành lập năm 1998.' },
      { id: 'g2', prompt: 'A greenhouse had already been built before 2000.', accepted: ['FALSE'], options: readingOptions, explanation: 'Nhà kính mới được xây năm 2012, không phải trước năm 2000.' },
      { id: 'g3', prompt: 'Most visitors are university students.', accepted: ['NOT GIVEN'], options: readingOptions, explanation: 'Báo cáo không chia số lượt khách theo nhóm. Không thể kết luận nhóm nào chiếm đa số.' },
    ],
  },
  {
    id: 'writing-food', version: 1, skill: 'Writing', part: 'Task 2', title: 'Food waste', description: 'Từ nguyên nhân lãng phí thực phẩm đến giải pháp cụ thể.', minutes: 30, technique: 'Causes & solutions',
    theory: 'Với câu hỏi nguyên nhân và giải pháp, mỗi giải pháp nên giải quyết một nguyên nhân đã nêu. Lập dàn ý trước: ai làm gì, bằng cách nào, và kết quả mong đợi là gì. Phiên này dành 30 phút để luyện; bài mẫu không phải đáp án duy nhất.',
    instructions: 'Nowadays, people tend to waste a great amount of food. Why is this happening, and how can we solve this problem? Write at least 250 words.',
    source: 'Writing/IELTS_Writing_Task_2_No_Vertical_Lines.docx · First essay answer on food waste', verification: 'Đề và bài mẫu trích từ tài liệu. Bài mẫu mang tính hướng dẫn, không có band do giám khảo cấp.', questions: [], model: excerpts.writingModel,
    checklist: ['Tôi trả lời cả hai yêu cầu của đề.', 'Mỗi đoạn có một ý chính rõ ràng.', 'Giải pháp giải quyết đúng nguyên nhân.', 'Ví dụ cụ thể và không bịa số liệu.', 'Tôi đã kiểm tra ngữ pháp và cách dùng từ.'],
  },
  {
    id: 'writing-bakeries', version: 1, skill: 'Writing', part: 'Task 1', title: 'Three London bakeries', description: 'Chọn xu hướng chính, nhóm dữ liệu và viết một overview.', minutes: 20, technique: 'Line graph',
    theory: 'Đọc tên biểu đồ, trục, đơn vị và mốc thời gian trước. Chọn các xu hướng nổi bật để viết overview, rồi nhóm số liệu thành các đoạn. Chỉ mô tả điều biểu đồ thể hiện.',
    instructions: 'The graph shows the annual earnings of three bakeries in London from 2000 to 2010. Summarise the information by selecting and reporting the main features, and make comparisons where relevant. Write at least 150 words.',
    source: 'Writing/IELTS_Writing_Task_1_No_Vertical_Lines.docx · Task 1 · Three London bakeries', verification: 'Hình gốc được giữ nguyên. Cần kiểm tra hình và giá trị trước khi xuất bản công khai.', questions: [], image: excerpts.task1Image, model: excerpts.task1Model,
    checklist: ['Tôi xác định đúng chủ đề, thời gian và đơn vị.', 'Overview nêu các xu hướng nổi bật.', 'Các chi tiết được nhóm hợp lý.', 'Số liệu và so sánh đúng với hình.', 'Tôi không thêm nguyên nhân hoặc ý kiến cá nhân.'],
  },
];
export const skills = ['Listening', 'Speaking', 'Reading', 'Writing'] as const;
