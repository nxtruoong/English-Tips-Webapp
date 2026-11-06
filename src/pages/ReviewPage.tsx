import { ArrowRight, Trash2, X } from 'lucide-react';
import { activities } from '../content/activities';
import type { Activity, StudyData } from '../domain';
import type { StudyStore } from '../useStudyData';
import { Empty, PageTitle, formatDate } from '../ui';

export function ReviewPage({
  data,
  reviewTab,
  setReviewTab,
  start,
  mutate,
  go,
}: {
  data: StudyData;
  reviewTab: 'saved' | 'history';
  setReviewTab: (tab: 'saved' | 'history') => void;
  start: (activity: Activity, fresh?: boolean) => void;
  mutate: StudyStore['mutate'];
  go: (destination: string) => void;
}) {
  return (
    <>
      <PageTitle
        title="Ôn tập & lịch sử"
        description="Xem lại câu đã lưu, tiếp tục bản nháp hoặc kiểm tra bài đã làm."
      />
      <div className="skill-tabs">
        <button
          className={reviewTab === 'saved' ? 'selected' : ''}
          aria-pressed={reviewTab === 'saved'}
          onClick={() => setReviewTab('saved')}
        >
          Câu đã lưu ({data.saved.length})
        </button>
        <button
          className={reviewTab === 'history' ? 'selected' : ''}
          aria-pressed={reviewTab === 'history'}
          onClick={() => setReviewTab('history')}
        >
          Nhật ký học ({data.attempts.length})
        </button>
      </div>
      {reviewTab === 'saved' ? (
        <>
          {data.saved.length ? (
            data.saved.map(key => {
              const [ref, questionId] = key.split('/');
              const a = activities.find(x => `${x.id}@${x.version}` === ref);
              const q = a?.questions.find(x => x.id === questionId);
              return (
                <article className="saved-question" key={key}>
                  <p className="metadata">
                    {a?.skill || ref} · {a?.title || 'Phiên bản nội dung cũ'}
                  </p>
                  <h2>{q?.prompt || 'Câu hỏi không có trong phiên bản hiện tại.'}</h2>
                  {q && (
                    <>
                      <p>
                        <strong>{q.accepted.join(' / ')}</strong> — {q.explanation}
                      </p>
                      <button className="text-button" onClick={() => a && start(a, true)}>
                        Luyện lại bài <ArrowRight size={18} />
                      </button>
                    </>
                  )}
                  <button
                    className="text-button muted"
                    onClick={() => mutate(old => ({ ...old, saved: old.saved.filter(s => s !== key) }))}
                  >
                    <X size={16} />
                    Bỏ lưu
                  </button>
                </article>
              );
            })
          ) : (
            <Empty
              title="Chưa có câu nào cần ôn."
              text="Sau mỗi bài, lưu những câu bạn muốn quay lại. Sổ ôn sẽ nằm ở đây."
              onClick={() => go('practice')}
            />
          )}
        </>
      ) : (
        <>
          {data.attempts.length ? (
            <div className="history">
              {[...data.attempts].reverse().map(a => {
                const lesson = activities.find(x => x.id === a.activityId && x.version === a.version);
                return (
                  <article key={a.id}>
                    <div>
                      <p className="metadata">
                        {formatDate(a.updatedAt)} · {a.status === 'draft' ? 'Đang học' : 'Đã hoàn thành'}
                        {a.revealed ? ' · Đã xem gợi ý/mẫu' : ''}
                      </p>
                      <h2>{lesson?.title || `${a.activityId} · phiên bản ${a.version}`}</h2>
                      <p>
                        {lesson?.questions.length && a.status === 'completed'
                          ? `${a.score ?? 0}/${lesson.questions.length} câu đúng`
                          : a.status === 'completed'
                            ? 'Tự đánh giá'
                            : 'Bản nháp được giữ lại'}
                      </p>
                    </div>
                    <div className="actions">
                      {lesson && (
                        <button onClick={() => go(`attempt/${a.id}`)}>
                          {a.status === 'draft' ? 'Học tiếp' : 'Xem lại'}
                          <ArrowRight size={17} />
                        </button>
                      )}
                      <button
                        aria-label={`Xóa lượt học ${lesson?.title || a.id}`}
                        onClick={() => {
                          if (confirm('Xóa lượt học và bản ghi âm đi kèm?'))
                            mutate(
                              old => ({
                                ...old,
                                attempts: old.attempts.filter(x => x.id !== a.id),
                              }),
                              { immediate: true },
                            );
                        }}
                      >
                        <Trash2 size={17} />
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <Empty
              title="Chưa có lịch sử học"
              text="Bắt đầu một bài luyện. Mọi bản nháp và lượt học sẽ xuất hiện ở đây."
              onClick={() => go('practice')}
            />
          )}
        </>
      )}
    </>
  );
}
