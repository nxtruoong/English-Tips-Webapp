import { useState } from 'react';
import { Download, Settings2, Trash2, Upload } from 'lucide-react';
import type { StudyData } from '../domain';
import { download, validateData } from '../storage';
import { PageTitle } from '../ui';
import { LevelPicker, LevelQuiz } from './LevelPanel';
import type { Level } from '../content/levels';
import { goalOptions, minutesPerStep } from '../streak';

export function DataSettings({
  data,
  onImport,
  onClear,
  setLevel,
  setGoal,
}: {
  data: StudyData;
  setLevel: (level: Level) => void;
  setGoal: (goal: number) => void;
  onImport: (data: StudyData) => void;
  onClear: () => void;
}) {
  const [message, setMessage] = useState('');
  const [quiz, setQuiz] = useState(false);
  const [busy, setBusy] = useState(false);
  async function exportBackup() {
    setBusy(true);
    setMessage('');
    try {
      const attempts = await Promise.all(
        data.attempts.map(async attempt => {
          const { recording, ...rest } = attempt;
          const base64 = recording
            ? await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(String(reader.result));
                reader.onerror = () => reject(reader.error);
                reader.readAsDataURL(recording);
              })
            : undefined;
          return { ...rest, ...(base64 ? { recordingData: base64 } : {}) };
        }),
      );
      download(
        // Every StudyData field goes into the backup; only attempts need recording conversion.
        new Blob([JSON.stringify({ ...data, attempts })], { type: 'application/json' }),
        `hien-backup-${new Date().toISOString().slice(0, 10)}.json`,
      );
      setMessage('Đã tải tệp sao lưu (có cả bản ghi âm).');
    } catch {
      setMessage('Chưa xuất được. Thử lại nhé.');
    } finally {
      setBusy(false);
    }
  }
  async function importBackup(file?: File) {
    if (!file) return;
    setBusy(true);
    setMessage('');
    try {
      if (file.size > 100 * 1024 * 1024) throw new Error('Tệp lớn hơn 100 MB.');
      const raw: unknown = JSON.parse(await file.text());
      const validated = validateData(raw);
      // Recording data is decoded only after the rest of the backup validates.
      const rawAttempts: unknown[] =
        raw && typeof raw === 'object' && 'attempts' in raw && Array.isArray(raw.attempts)
          ? raw.attempts
          : [];
      validated.attempts.forEach((attempt, index) => {
        const item = rawAttempts[index];
        if (item && typeof item === 'object' && 'recordingData' in item) {
          if (typeof item.recordingData !== 'string') throw new Error('Dữ liệu ghi âm không hợp lệ.');
          const match = /^data:(audio\/[\w.+-]+(?:;codecs=[\w.+-]+)?);base64,([A-Za-z0-9+/]*={0,2})$/.exec(
            item.recordingData,
          );
          if (!match) throw new Error('Định dạng ghi âm không hợp lệ.');
          const decoded = atob(match[2]);
          attempt.recording = new Blob([Uint8Array.from(decoded, c => c.charCodeAt(0))], { type: match[1] });
        }
      });
      if (
        !confirm('Nhập tệp sẽ thay thế toàn bộ dữ liệu học trên thiết bị này. Đã sao lưu dữ liệu hiện tại?')
      )
        return;
      onImport(validated);
      setMessage('Đã nhập xong. Đợi thanh bên báo “Đã lưu” rồi hãy đóng trang.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Không đọc được tệp.');
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <PageTitle title="Cài đặt & dữ liệu" />
      <section className="panel study-settings" aria-labelledby="settings-title">
        <h2 id="settings-title">Trình độ & mục tiêu</h2>
        {quiz ? (
          <LevelQuiz
            onConfirm={level => {
              setLevel(level);
              setQuiz(false);
            }}
            onCancel={() => setQuiz(false)}
          />
        ) : (
          <>
            <LevelPicker level={data.level} onPick={setLevel} />
            <button className="text-button" onClick={() => setQuiz(true)}>
              Chưa chắc? Trả lời 5 câu hỏi nhanh
            </button>
          </>
        )}
        <label className="strip-goal">
          <span>Mục tiêu mỗi ngày</span>
          <select value={data.dailyGoal} onChange={e => setGoal(Number(e.target.value))}>
            {goalOptions.map(option => (
              <option key={option} value={option}>
                {option} bước · khoảng {option * minutesPerStep} phút
              </option>
            ))}
          </select>
        </label>
      </section>
      <section className="data-settings">
        <Settings2 size={30} strokeWidth={1.2} />
        <h2>Sao lưu & khôi phục</h2>
        <p>
          EngStudyMate chưa có tài khoản hay đồng bộ. Xóa dữ liệu trình duyệt có thể làm mất bài. Xuất tệp
          định kỳ để sao lưu hoặc chuyển sang thiết bị khác.
        </p>
        <p>
          {data.attempts.length} lượt học · {data.saved.length} câu đã lưu ·{' '}
          {data.attempts.filter(a => a.recording).length} bản ghi âm · {data.cards.length} thẻ từ vựng ·{' '}
          {Object.keys(data.studyDays).length} ngày học
        </p>
        <div className="actions">
          <button className="primary" onClick={exportBackup} disabled={busy}>
            <Download size={18} />
            Xuất toàn bộ dữ liệu
          </button>
          <label className={`file-button ${busy ? 'disabled' : ''}`}>
            <Upload size={18} />
            Nhập tệp sao lưu
            <input
              type="file"
              accept=".json,application/json"
              disabled={busy}
              onChange={e => {
                void importBackup(e.target.files?.[0]);
                e.target.value = '';
              }}
            />
          </label>
        </div>
        {message && (
          <p role="status" className="notice">
            {message}
          </p>
        )}
        <div className="danger-zone">
          <h3>Xóa dữ liệu trên thiết bị này</h3>
          <p>
            Thao tác xóa toàn bộ lượt học, bản nháp, câu đã lưu, bản ghi âm, thẻ từ vựng và lịch sử ngày học
            trong EngStudyMate.
          </p>
          <button
            disabled={busy}
            onClick={() => {
              if (
                confirm('Xóa toàn bộ dữ liệu EngStudyMate trên thiết bị này? Thao tác không thể hoàn tác.')
              ) {
                onClear();
                setMessage('Đã xóa. Đợi thanh bên báo “Đã lưu” rồi hãy đóng trang.');
              }
            }}
          >
            <Trash2 size={18} />
            Xóa dữ liệu
          </button>
        </div>
      </section>
    </>
  );
}
