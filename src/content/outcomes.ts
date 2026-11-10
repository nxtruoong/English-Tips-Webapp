// Foreign-language graduation requirements, transcribed from
// OtherInfo/HoangTranGiaHuy_chuandaurangoaingu.pdf (compiled 18/10/2026).
// Values are copied as published; do not convert between TOEIC and IELTS.

export type Scale = 'toeic-lr' | 'toeic-sw' | 'toeic-total' | 'ielts' | 'toefl-ibt';

export const scaleMax: Record<Scale, number> = {
  'toeic-lr': 990,
  'toeic-sw': 400,
  'toeic-total': 1390,
  ielts: 9,
  'toefl-ibt': 120,
};

export const scaleLabel: Record<Scale, string> = {
  'toeic-lr': 'TOEIC Nghe–Đọc',
  'toeic-sw': 'TOEIC Nói–Viết',
  'toeic-total': 'TOEIC tổng 4 kỹ năng',
  ielts: 'IELTS',
  'toefl-ibt': 'TOEFL iBT',
};

export interface Score {
  scale: Scale;
  value: number;
}

export interface Source {
  label: string;
  url: string;
}

export type ProgramKind = 'graduation' | 'entry' | 'unclear';

export interface Program {
  name: string;
  cohort?: string;
  kind: ProgramKind;
  /** Main thresholds, shown on their own scale. */
  scores: Score[];
  /** Other accepted options or extra conditions, as plain text. */
  extra?: string[];
  source: Source;
}

export interface ProgramGroup {
  title: string;
  programs: Program[];
}

export interface School {
  id: string;
  short: string;
  name: string;
  /** Public-folder path; logos from Wikimedia Commons. */
  logo: string;
  basis: string;
  groups: ProgramGroup[];
  notes: { title: string; text: string; link?: Source }[];
}

const uitRules: Source = {
  label: 'UIT – Hướng dẫn chuẩn quá trình và chuẩn đầu ra',
  url: 'https://daa.uit.edu.vn/content/huong-dan-sinh-vien-dai-hoc-he-chinh-quy-thuc-hien-cac-quy-dinh-ve-chuan-qua-trinh-va-chuan',
};
const oepOverview: Source = {
  label: 'OEP – Tổng quan chương trình dạy bằng tiếng Anh',
  url: 'https://oep.uit.edu.vn/vi/tong-quan-chuong-trinh-giang-day-bang-tieng-anh',
};
const hcmut: Source = {
  label: 'QĐ 2749/QĐ-ĐHBK (27/05/2026)',
  url: 'https://fme.hcmut.edu.vn/wp-content/uploads/2026/05/2026.05.27_2749_QD-DHBK_QD-dieu-chinh_Hvu-DH_-2933_2026_PL1_lan-2_27-5-2026.signed.pdf',
};
const ueh52: Source = {
  label: 'UEH – Chuẩn đầu ra tiếng Anh khóa 52',
  url: 'https://li.ueh.edu.vn/chuan-dau-ra-trinh-do-tieng-anh-doi-voi-khoa-52-ueh-dhcq-la-gi-can-dat-bao-nhieu-diem-de-tot-nghiep-dung-han/',
};
const ielts6 = (name: string, source: Source): Program => ({
  name,
  kind: 'graduation',
  scores: [{ scale: 'ielts', value: 6.0 }],
  extra: ['Thông tin công bố năm 2026; không mặc nhiên áp dụng cho khóa 2024–2025.'],
  source,
});

export const schools: School[] = [
  {
    id: 'uit',
    logo: '/media/logos/uit.png',
    short: 'UIT',
    name: 'Trường Đại học Công nghệ Thông tin',
    basis: 'Đại học chính quy, khóa tuyển sinh 2024 trở đi.',
    groups: [
      {
        title: 'Chuẩn theo chương trình',
        programs: [
          {
            name: 'Đại trà',
            cohort: '2024+',
            kind: 'graduation',
            scores: [
              { scale: 'toeic-lr', value: 450 },
              { scale: 'toeic-sw', value: 185 },
            ],
            extra: ['Hoàn thành các học phần tiếng Anh theo chương trình đào tạo.'],
            source: { ...uitRules, label: 'UIT, mục I' },
          },
          {
            name: 'Cử nhân tài năng',
            cohort: '2024+',
            kind: 'graduation',
            scores: [
              { scale: 'toeic-lr', value: 555 },
              { scale: 'toeic-sw', value: 205 },
            ],
            extra: ['Hoàn thành các học phần tiếng Anh theo chương trình đào tạo.'],
            source: { ...uitRules, label: 'UIT, mục II' },
          },
          {
            name: 'Tiên tiến – Hệ thống thông tin',
            cohort: '2024+',
            kind: 'graduation',
            scores: [
              { scale: 'toeic-lr', value: 675 },
              { scale: 'toeic-sw', value: 225 },
            ],
            extra: ['Hoặc mức tương đương được chấp nhận.'],
            source: { ...uitRules, label: 'UIT, mục IV' },
          },
          {
            name: 'CNTT Việt–Nhật',
            cohort: 'CTĐT khóa 2024',
            kind: 'graduation',
            scores: [],
            extra: ['JLPT N3 hoặc NAT-TEST N3.', 'Hoàn thành 20 tín chỉ tiếng Nhật.'],
            source: {
              label: 'CTĐT khóa 2024',
              url: 'https://daa.uit.edu.vn/content/cu-nhan-nganh-cong-nghe-thong-tin-ap-dung-tu-khoa-19-2024?page=2',
            },
          },
          {
            name: 'Chất lượng cao (CLC)',
            kind: 'unclear',
            scores: [],
            extra: ['Bảng CLC công khai không có dòng từ khóa 2024; chưa đủ cơ sở kết luận mức áp dụng.'],
            source: { ...uitRules, label: 'UIT, mục III' },
          },
        ],
      },
      {
        title: 'Chương trình giảng dạy bằng tiếng Anh',
        programs: [
          {
            ...ielts6('Tiên tiến – Hệ thống thông tin', oepOverview),
            extra: ['Thông tin công bố năm 2026; cần đối chiếu thêm chuẩn TOEIC theo khóa.'],
          },
          ielts6('An toàn thông tin – tiếng Anh', oepOverview),
          ielts6('Khoa học dữ liệu – tiếng Anh', {
            label: 'OEP – Khoa học dữ liệu',
            url: 'https://oep.uit.edu.vn/vi/chuong-trinh-tieng-anh-nganh-khoa-hoc-du-lieu',
          }),
          ielts6('Khoa học máy tính – tiếng Anh', {
            label: 'OEP – Khoa học máy tính',
            url: 'https://oep.uit.edu.vn/vi/chuong-trinh-tieng-anh-nganh-khoa-hoc-may-tinh',
          }),
          ielts6('Kỹ thuật phần mềm – tiếng Anh', {
            label: 'OEP – Kỹ thuật phần mềm',
            url: 'https://www.oep.uit.edu.vn/vi/chuong-trinh-tieng-anh-nganh-ky-thuat-phan-mem',
          }),
          ielts6('Thiết kế vi mạch – tiếng Anh', {
            label: 'OEP – Thiết kế vi mạch',
            url: 'https://oep.uit.edu.vn/vi/chuong-trinh-tieng-anh-nganh-nganh-thiet-ke-vi-mach',
          }),
        ],
      },
      {
        title: 'Chương trình liên kết quốc tế',
        programs: [
          {
            name: 'Birmingham City (Anh)',
            kind: 'entry',
            scores: [{ scale: 'ielts', value: 5.5 }],
            extra: [
              'IELTS ≥ 5.5 / B2: điều kiện đầu vào.',
              'IELTS 6.0, không kỹ năng nào dưới 5.5: điều kiện chuyển giai đoạn 2.',
              'Chưa xác minh chuẩn tốt nghiệp.',
            ],
            source: { label: 'Thông báo tuyển sinh GĐ1', url: 'https://tuyensinh.uit.edu.vn/node/4226' },
          },
          {
            name: 'Newcastle (Úc), lộ trình 2+2',
            kind: 'entry',
            scores: [{ scale: 'ielts', value: 5.5 }],
            extra: [
              'IELTS ≥ 5.5 / B2: điều kiện đầu vào giai đoạn 1.',
              'Chưa xác minh chuẩn tốt nghiệp của đối tác.',
            ],
            source: {
              label: 'Tuyển sinh 2026',
              url: 'https://tuyensinh.uit.edu.vn/2026-thong-bao-tuyen-sinh-trinh-do-dai-hoc-chuong-trinh-lien-ket-voi-truong-dai-hoc-newcastle-lien-bang-uc-nam-2026',
            },
          },
        ],
      },
    ],
    notes: [
      {
        title: 'Chuẩn quá trình',
        text: 'Đạt AV1 sau 2 học kỳ chính, AV2 sau 4 học kỳ, AV3 sau 6 học kỳ (với các nhóm có áp dụng). Trường chỉ xét miễn AV trong 4 học kỳ chính đầu tiên.',
      },
      {
        title: 'Điều kiện đầu vào',
        text: 'Mức IELTS của chương trình liên kết là điều kiện đầu vào hoặc chuyển giai đoạn, không phải chuẩn tốt nghiệp.',
      },
    ],
  },
  {
    id: 'hcmus',
    logo: '/media/logos/hcmus.png',
    short: 'HCMUS',
    name: 'Trường Đại học Khoa học tự nhiên',
    basis: 'Đối chiếu các quyết định ban hành ngày 11/08/2026.',
    groups: [
      {
        title: 'Chuẩn theo chương trình',
        programs: [
          {
            name: 'Đại trà',
            kind: 'graduation',
            scores: [
              { scale: 'ielts', value: 4.5 },
              { scale: 'toeic-lr', value: 450 },
              { scale: 'toeic-sw', value: 181 },
            ],
            extra: ['Bậc 3/6. IELTS ≥ 4.5, hoặc TOEIC Nghe–Đọc ≥ 450 và Nói–Viết ≥ 181.'],
            source: {
              label: 'QĐ 2464, Điều 7',
              url: 'https://tuyensinh.hcmus.edu.vn/wp-content/uploads/2026/08/2026_CDRTAnh_Daitra.pdf',
            },
          },
          {
            name: 'Cử nhân tài năng',
            cohort: '2023+',
            kind: 'graduation',
            scores: [
              { scale: 'ielts', value: 5.0 },
              { scale: 'toeic-lr', value: 600 },
              { scale: 'toeic-sw', value: 240 },
            ],
            extra: ['Bậc 4/6. IELTS ≥ 5.0, hoặc TOEIC tổng ≥ 840 với Nghe–Đọc ≥ 600 và Nói–Viết ≥ 240.'],
            source: {
              label: 'QĐ 2464, Điều 8',
              url: 'https://tuyensinh.hcmus.edu.vn/wp-content/uploads/2026/08/2026_CDRTAnh_Daitra.pdf',
            },
          },
          {
            name: 'Tăng cường tiếng Anh',
            kind: 'graduation',
            scores: [
              { scale: 'ielts', value: 5.0 },
              { scale: 'toeic-lr', value: 600 },
              { scale: 'toeic-sw', value: 240 },
            ],
            extra: ['Bậc 4/6. IELTS ≥ 5.0, hoặc TOEIC tổng ≥ 840 (Nghe–Đọc ≥ 600; Nói–Viết ≥ 240).'],
            source: {
              label: 'QĐ 2465',
              url: 'https://tuyensinh.hcmus.edu.vn/wp-content/uploads/2026/08/2026_CDRTAnh_TCTA.pdf',
            },
          },
          {
            name: 'CNTT – tăng cường tiếng Anh',
            cohort: '2025+',
            kind: 'graduation',
            scores: [
              { scale: 'ielts', value: 5.0 },
              { scale: 'toeic-lr', value: 600 },
              { scale: 'toeic-sw', value: 240 },
            ],
            extra: [
              'IELTS ≥ 5.0, hoặc TOEIC tổng ≥ 840 (Nghe–Đọc ≥ 600; Nói–Viết ≥ 240).',
              'Có phương án JLPT N2.',
            ],
            source: {
              label: 'QĐ 2466',
              url: 'https://tuyensinh.hcmus.edu.vn/wp-content/uploads/2026/08/2026_CDRTAnh_CNTT-TCTA.pdf',
            },
          },
          {
            name: 'Khoa học máy tính – tiên tiến',
            cohort: '2025+',
            kind: 'graduation',
            scores: [
              { scale: 'ielts', value: 6.0 },
              { scale: 'toefl-ibt', value: 79 },
            ],
            extra: [
              'Hoặc TOEFL ITP ≥ 550 kèm TOEIC Nói–Viết ≥ 270.',
              'Chứng chỉ không ghi hiệu lực được tính 2 năm từ ngày cấp đến ngày đăng ký xét.',
            ],
            source: {
              label: 'QĐ 2467',
              url: 'https://tuyensinh.hcmus.edu.vn/wp-content/uploads/2026/08/2026_CDRTAnh_TT.pdf',
            },
          },
        ],
      },
    ],
    notes: [
      {
        title: 'Phạm vi áp dụng',
        text: 'Quy định riêng của CNTT tăng cường tiếng Anh và KHMT tiên tiến ghi rõ từ khóa 2025. Sinh viên khóa 2024 phải đối chiếu văn bản đúng khóa.',
      },
    ],
  },
  {
    id: 'hcmut',
    logo: '/media/logos/hcmut.png',
    short: 'HCMUT',
    name: 'Trường Đại học Bách khoa',
    basis: 'Quyết định 2749/QĐ-ĐHBK ngày 27/05/2026, phụ lục “Chuẩn ngoại ngữ tốt nghiệp”.',
    groups: [
      {
        title: 'Chuẩn theo loại chương trình',
        programs: [
          {
            name: 'Tiêu chuẩn',
            cohort: '2020+',
            kind: 'graduation',
            scores: [
              { scale: 'toeic-lr', value: 600 },
              { scale: 'toeic-sw', value: 200 },
            ],
            source: hcmut,
          },
          {
            name: 'Tài năng',
            cohort: '2020+',
            kind: 'graduation',
            scores: [
              { scale: 'toeic-lr', value: 700 },
              { scale: 'toeic-sw', value: 245 },
            ],
            source: hcmut,
          },
          {
            name: 'Kỹ sư chất lượng cao Việt–Pháp (PFIEV)',
            kind: 'graduation',
            scores: [
              { scale: 'toeic-lr', value: 700 },
              { scale: 'toeic-sw', value: 245 },
            ],
            extra: ['Đồng thời DELF B1 hoặc TCF B1.'],
            source: hcmut,
          },
          {
            name: 'Định hướng Nhật Bản',
            kind: 'graduation',
            scores: [],
            extra: ['JLPT N3; không dùng chuẩn TOEIC như chương trình tiêu chuẩn.'],
            source: hcmut,
          },
          {
            name: 'Tiên tiến / học bằng tiếng Anh',
            cohort: '2021+',
            kind: 'graduation',
            scores: [
              { scale: 'ielts', value: 6.0 },
              { scale: 'toefl-ibt', value: 79 },
              { scale: 'toeic-lr', value: 730 },
              { scale: 'toeic-sw', value: 280 },
            ],
            extra: [
              'Một trong: IELTS Academic ≥ 6.0; TOEFL iBT ≥ 79; PTE ≥ 52; hoặc TOEIC Nghe–Đọc ≥ 730 và Nói–Viết ≥ 280.',
            ],
            source: hcmut,
          },
          {
            name: 'Vừa làm vừa học / từ xa',
            cohort: '2021+',
            kind: 'graduation',
            scores: [
              { scale: 'toeic-lr', value: 600 },
              { scale: 'toeic-sw', value: 200 },
            ],
            source: hcmut,
          },
          {
            name: 'Văn bằng thứ hai chính quy',
            kind: 'graduation',
            scores: [],
            extra: ['Theo chuẩn của khóa/chương trình chính quy người học đang theo.'],
            source: hcmut,
          },
        ],
      },
    ],
    notes: [
      {
        title: 'Khóa cũ',
        text: 'Khóa 2018 về trước và 2019 có mức Nghe–Đọc thấp hơn (ví dụ chương trình tiêu chuẩn: 500 và 550). Xem bảng gốc nếu bạn thuộc các khóa này.',
      },
    ],
  },
  {
    id: 'ueh',
    logo: '/media/logos/ueh.png',
    short: 'UEH',
    name: 'Đại học Kinh tế TP. Hồ Chí Minh',
    basis: 'Công bố 2026 của UEH và hướng dẫn khóa 52 từ Viện Ngôn ngữ – Quốc tế học.',
    groups: [
      {
        title: 'Chương trình khóa 52 (phương án IELTS / TOEFL iBT)',
        programs: [
          {
            name: 'Chuẩn – tiếng Việt',
            kind: 'graduation',
            scores: [
              { scale: 'ielts', value: 5.0 },
              { scale: 'toefl-ibt', value: 55 },
            ],
            extra: ['IELTS Academic ≥ 5.0 hoặc TOEFL iBT ≥ 55.'],
            source: ueh52,
          },
          {
            name: 'Tiếng Anh bán phần',
            kind: 'graduation',
            scores: [
              { scale: 'ielts', value: 5.5 },
              { scale: 'toefl-ibt', value: 70 },
            ],
            extra: ['IELTS Academic ≥ 5.5 hoặc TOEFL iBT ≥ 70.'],
            source: ueh52,
          },
          {
            name: 'Tiếng Anh toàn phần',
            kind: 'graduation',
            scores: [
              { scale: 'ielts', value: 6.0 },
              { scale: 'toefl-ibt', value: 80 },
            ],
            extra: ['IELTS Academic ≥ 6.0 hoặc TOEFL iBT ≥ 80.'],
            source: ueh52,
          },
          {
            name: 'Cử nhân tài năng ISB; Cử nhân ASIA Co-op',
            kind: 'graduation',
            scores: [
              { scale: 'ielts', value: 6.5 },
              { scale: 'toefl-ibt', value: 90 },
            ],
            extra: ['Theo bảng quy đổi khóa 52 trong phụ lục ảnh minh chứng.'],
            source: ueh52,
          },
          {
            name: 'Chương trình tích hợp chứng chỉ nghề nghiệp quốc tế',
            kind: 'graduation',
            scores: [
              { scale: 'ielts', value: 6.5 },
              { scale: 'toefl-ibt', value: 90 },
            ],
            extra: ['Theo bảng quy đổi khóa 52 trong phụ lục ảnh minh chứng.'],
            source: ueh52,
          },
        ],
      },
    ],
    notes: [
      {
        title: 'Phương án TOEIC',
        text: 'Khóa 52 có các phương án TOEIC đủ 4 kỹ năng. Trang này không dùng số liệu khóa 51 thay cho khóa 52; xem bảng điểm chi tiết trong link chính thức.',
      },
      {
        title: 'Đọc thêm',
        text: 'Danh mục quy chế và quy định UEH 2026.',
        link: { label: 'daotao.ueh.edu.vn', url: 'https://daotao.ueh.edu.vn/quy-che-quy-dinh-ueh/' },
      },
    ],
  },
];

export const compiledOn = '18/10/2026';
