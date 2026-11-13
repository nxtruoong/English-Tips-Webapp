import { ArrowRight, GraduationCap } from 'lucide-react';
import { scaleLabel, schools } from '../content/outcomes';

// Thresholds come from the outcomes data so this note never disagrees with the outcomes page.
const uit = schools.find(s => s.id === 'uit');
const standard = uit?.groups.flatMap(g => g.programs).find(p => p.name === 'Đại trà');

export const uitStandard = standard?.scores.map(s => ({ label: scaleLabel[s.scale], value: s.value })) ?? [];

/** Short explanation for UIT students: their requirement is TOEIC, while Hiên practises IELTS formats. */
export function UitNote() {
  if (!uitStandard.length) return null;
  return (
    <section className="panel uit-note" aria-labelledby="uit-note-title">
      <h2 id="uit-note-title">
        <GraduationCap size={18} aria-hidden="true" />
        Chuẩn đầu ra UIT tính bằng TOEIC
      </h2>
      <p>
        Hệ đại trà, khóa {standard?.cohort?.replace('+', '')} trở đi cần đạt{' '}
        {uitStandard.map((s, i) => (
          <span key={s.label}>
            {i > 0 && ' và '}
            <strong>
              {s.label} ≥ {s.value}
            </strong>
          </span>
        ))}
        .
      </p>
      <p>Bài trên Hiên theo dạng IELTS nhưng vẫn luyện đủ 4 kỹ năng mà TOEIC kiểm tra.</p>
      <div className="uit-links">
        <a href="#outcomes">
          Chuẩn các trường khác <ArrowRight size={15} aria-hidden="true" />
        </a>
        <a href="#tools">
          Đề TOEIC miễn phí <ArrowRight size={15} aria-hidden="true" />
        </a>
      </div>
    </section>
  );
}
