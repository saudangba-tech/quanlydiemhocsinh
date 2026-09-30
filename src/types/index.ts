export interface Student {
  id: string;
  classId: string;
  name: string;
  code: string; // Mã học sinh e.g. HS-1201
  gender: 'nam' | 'nữ';
  avatar: string;
  role: 'Lớp trưởng' | 'Lớp phó' | 'Cán sự Toán' | 'Tổ trưởng' | 'Học sinh';
  parentName: string;
  parentPhone: string;
  // Điểm số môn Toán (Thông tư 22)
  tx1: number | null; // Miệng / 15p lần 1
  tx2: number | null; // 15p lần 2
  tx3: number | null; // 15p lần 3
  tx4: number | null; // Bài tập thực hành / nhóm
  gk: number | null;  // Đánh giá giữa kỳ (hệ số 2)
  ck: number | null;  // Đánh giá cuối kỳ (hệ số 3)
  // Điểm rèn luyện môn Toán
  behaviorScore: number; // Mặc định 100, cộng/trừ theo quá trình
  starCount: number; // Số sao danh dự
  notes: string;
}

export interface ClassRoom {
  id: string;
  name: string; // e.g. "12A1", "11B2", "10A3"
  grade: 10 | 11 | 12;
  schoolYear: string; // e.g. "2025 - 2026"
  teacherName: string;
  room: string;
}

export interface BehaviorRecord {
  id: string;
  studentId: string;
  studentName: string;
  classId: string;
  type: 'positive' | 'negative';
  points: number; // e.g. +1, +2, -1, -2
  reason: string;
  category: 'Phát biểu' | 'Lên bảng' | 'BTVN' | 'Kỷ luật' | 'Sáng tạo' | 'Khác';
  timestamp: string; // ISO string
}

export interface MathQuestion {
  id: string;
  topic: string; // e.g. "Khảo sát hàm số", "Nguyên hàm - Tích phân", "Hình không gian Oxyz", "Tổ hợp - Xác suất"
  grade: 10 | 11 | 12;
  level: 'Nhận biết' | 'Thông hiểu' | 'Vận dụng' | 'Vận dụng cao';
  content: string; // Có thể chứa công thức LaTeX e.g. $f(x) = x^3 - 3x + 1$
  options: string[];
  correctAnswer: number; // 0, 1, 2, 3 (A, B, C, D)
  explanation: string;
}

export interface AppSettings {
  apiKey: string;
  selectedModel: string;
  soundEnabled: boolean;
  autoSave: boolean;
  defaultClassId: string;
}

export interface QuizSession {
  id: string;
  topic: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  timeSpentSeconds: number;
  date: string;
}
