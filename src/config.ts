// Site-wide settings the team edits by hand.

// TODO(nhóm): thay bằng link Google Form góp ý thật (dạng https://forms.gle/...) trước khi công bố.
// Khi còn placeholder, nút Góp ý hiện ở trạng thái "sắp mở" thay vì dẫn tới link hỏng.
export const FEEDBACK_FORM_URL = 'https://forms.gle/REPLACE_WITH_FEEDBACK_FORM';

export const feedbackReady = (url = FEEDBACK_FORM_URL) =>
  /^https:\/\/(forms\.gle|docs\.google\.com\/forms)\//.test(url) && !url.includes('REPLACE');
