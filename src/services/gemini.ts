import { Student, MathQuestion, BehaviorRecord } from '../types';
import { calculateMathGPA, getAcademicRank } from './storage';

// Chuỗi model fallback GA/stable theo api.md
const FALLBACK_MODELS = [
  'gemini-3.6-flash',
  'gemini-3.5-flash',
  'gemini-3.5-flash-lite',
  'gemini-3.1-flash-lite',
  'gemini-2.5-flash',
];

// Validation: chấp nhận cả key AIzaSy... và AQ...
export const GOOGLE_AI_API_KEY_PATTERN = /^(?:AIzaSy|AQ)\S{8,}$/;

export const isValidGoogleAiApiKey = (key: string): boolean => {
  return GOOGLE_AI_API_KEY_PATTERN.test(key.trim());
};

interface CallAIOptions {
  prompt: string;
  systemInstruction?: string;
  customApiKey?: string;
  preferredModel?: string;
  provider?: 'gemini' | 'agent-platform';
}

export async function callGemini(options: CallAIOptions): Promise<string> {
  const modelsToTry = [
    options.preferredModel || 'gemini-3.6-flash',
    ...FALLBACK_MODELS.filter(m => m !== options.preferredModel)
  ];

  let lastError = '';

  for (const model of modelsToTry) {
    try {
      const response = await fetch('/api/gemini/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: options.prompt,
          systemInstruction: options.systemInstruction,
          model,
          customApiKey: options.customApiKey || undefined,
          provider: options.provider || 'gemini'
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMsg = errorData.error || `HTTP ${response.status}`;
        lastError = errorMsg;
        // Auth/key issue: dừng ngay
        if (response.status === 401 || response.status === 403) {
          throw new Error('API Key không hợp lệ hoặc chưa được cấp quyền.');
        }
        // Quota exceeded: dừng ngay
        if (response.status === 429) {
          throw new Error('Đã hết quota hoặc vượt giới hạn tốc độ API. Vui lòng đợi rồi thử lại.');
        }
        // 503/500: thử model tiếp theo
        continue;
      }

      const data = await response.json();
      if (data.text) {
        return data.text;
      }
    } catch (err: any) {
      lastError = err.message;
      if (err.message.includes('API Key') || err.message.includes('quota')) {
        throw err;
      }
    }
  }

  throw new Error(lastError || 'Không thể kết nối đến Gemini AI. Vui lòng kiểm tra lại kết nối mạng hoặc API Key.');
}

// 1. Soạn tin nhắn báo cáo gửi phụ huynh cá nhân hóa bằng AI
export async function aiGenerateParentMessage(
  student: Student,
  customApiKey?: string
): Promise<string> {
  const gpa = calculateMathGPA(student);
  const rank = getAcademicRank(gpa);

  const prompt = `
Bạn là giáo viên dạy Toán THPT đầy tâm huyết, chuẩn mực và thấu hiểu học sinh.
Hãy viết một tin nhắn ngắn gọn (khoảng 120 - 180 từ) gửi đến phụ huynh học sinh "${student.name}" (Phụ huynh: ${student.parentName || 'Quý phụ huynh'}).

Thông tin học tập:
- Môn: Toán THPT
- Điểm kiểm tra thường xuyên: Tx1=${student.tx1 ?? 'chưa có'}, Tx2=${student.tx2 ?? 'chưa có'}, Tx3=${student.tx3 ?? 'chưa có'}
- Điểm Giữa kỳ: ${student.gk ?? 'chưa có'}
- Điểm Cuối kỳ: ${student.ck ?? 'chưa có'}
- Điểm trung bình môn tạm tính: ${gpa !== null ? gpa : 'đang cập nhật'} (Xếp loại: ${rank.text})
- Điểm rèn luyện/kỷ luật lớp học: ${student.behaviorScore} điểm (Số sao thưởng: ${student.starCount}⭐)
- Ghi chú của giáo viên: ${student.notes || 'Học tập chăm chỉ, chấp hành nội quy'}

Yêu cầu tin nhắn:
1. Chào hỏi lịch sự, nêu rõ tình hình học lực Toán và tinh thần rèn luyện trên lớp.
2. Nêu bật ưu điểm đáng khen ngợi (phát biểu, làm bài, tích cực).
3. Đưa ra lời khuyên hoặc nhắc nhở nhẹ nhàng (nếu cần ôn tập thêm dạng bài nào).
4. Thể hiện sự phối hợp chặt chẽ giữa nhà trường và gia đình.
5. Văn phong ấm áp, trang trọng, chuẩn mực tiếng Việt. Không dùng ký hiệu markdown phức tạp.
`;

  return callGemini({
    prompt,
    systemInstruction: 'Bạn là giáo viên Toán THPT tận tụy, tôn trọng học sinh và giao tiếp tinh tế với phụ huynh.',
    customApiKey
  });
}

// 2. Trợ lý AI sinh đề trắc nghiệm Toán THPT có công thức LaTeX
export async function aiGenerateMathQuestions(
  topic: string,
  grade: number,
  count: number = 3,
  level: string = 'Thông hiểu',
  customApiKey?: string
): Promise<MathQuestion[]> {
  const prompt = `
Hãy tạo ${count} câu hỏi trắc nghiệm môn Toán lớp ${grade} THPT theo chủ đề: "${topic}".
Mức độ yêu cầu: "${level}".

Định dạng trả về BẮT BUỘC là một JSON Array hợp lệ (không kèm văn bản dẫn nhập), cấu trúc từng phần tử:
[
  {
    "topic": "${topic}",
    "grade": ${grade},
    "level": "${level}",
    "content": "Nội dung câu hỏi, công thức toán viết dạng LaTeX kẹp trong dấu $ e.g. $y = x^3 - 3x$",
    "options": [
      "Lựa chọn A với công thức nếu có e.g. $x = 1$",
      "Lựa chọn B",
      "Lựa chọn C",
      "Lựa chọn D"
    ],
    "correctAnswer": 0, // 0 cho A, 1 cho B, 2 cho C, 3 cho D
    "explanation": "Lời giải chi tiết từng bước có công thức LaTeX"
  }
]
Đảm bảo các công thức toán chuẩn xác, nội dung bám sát chương trình Giáo dục Phổ thông môn Toán của Bộ GD&ĐT Việt Nam.
`;

  const text = await callGemini({
    prompt,
    systemInstruction: 'Bạn là chuyên gia ra đề thi Toán THPT quốc gia. Bạn luôn trả về kết quả định dạng JSON array chuẩn.',
    customApiKey
  });

  // Extract JSON from markdown codeblock if needed
  try {
    let cleanJson = text.trim();
    if (cleanJson.startsWith('```json')) {
      cleanJson = cleanJson.slice(7);
    } else if (cleanJson.startsWith('```')) {
      cleanJson = cleanJson.slice(3);
    }
    if (cleanJson.endsWith('```')) {
      cleanJson = cleanJson.slice(0, -3);
    }
    const parsed = JSON.parse(cleanJson);
    return parsed.map((item: any, idx: number) => ({
      id: 'ai-q-' + Date.now() + '-' + idx,
      topic: item.topic || topic,
      grade: Number(item.grade) || grade,
      level: item.level || level,
      content: item.content || '',
      options: Array.isArray(item.options) ? item.options : ['A', 'B', 'C', 'D'],
      correctAnswer: typeof item.correctAnswer === 'number' ? item.correctAnswer : 0,
      explanation: item.explanation || ''
    }));
  } catch (e) {
    throw new Error('Không thể phân tích dữ liệu câu hỏi từ AI. Vui lòng thử lại.');
  }
}

// 3. Phân tích sư phạm hiệu suất học tập và kỷ luật lớp học
export async function aiAnalyzeClass(
  className: string,
  students: Student[],
  behaviors: BehaviorRecord[],
  customApiKey?: string
): Promise<string> {
  const validStudents = students.map(s => {
    const gpa = calculateMathGPA(s);
    return `${s.name}: ĐTB=${gpa ?? 'N/A'}, Rèn luyện=${s.behaviorScore}đ, Ghi chú=${s.notes}`;
  }).join('\n');

  const recentBehaviors = behaviors.slice(0, 10).map(b => 
    `- ${b.studentName}: ${b.points > 0 ? '+' + b.points : b.points}đ (${b.reason})`
  ).join('\n');

  const prompt = `
Hãy đóng vai chuyên gia phương pháp giảng dạy môn Toán THPT.
Hãy phân tích báo cáo lớp học môn Toán "${className}" dựa trên dữ liệu thực tế sau:

Danh sách học sinh & kết quả:
${validStudents}

Các hoạt động rèn luyện / hành vi gần đây:
${recentBehaviors}

Hãy đưa ra bản báo cáo đánh giá sư phạm bao gồm:
1. **Tổng quan học lực và kỷ luật lớp học**: Nhận định chung về sự phân hóa trình độ và tinh thần học tập.
2. **Điểm sáng và học sinh tiêu biểu**: Khen ngợi những cá nhân nỗ lực và đóng góp tích cực cho tiết học.
3. **Các vấn đề cần can thiệp**: Nhóm học sinh có nguy cơ hổng kiến thức hoặc có vi phạm kỷ luật cần lưu ý.
4. **Đề xuất chiến lược sư phạm cho tiết học tới**: Gợi ý phương pháp dạy học phân hóa, bài tập vừa sức và cách kích thích động lực học tập.

Trình bày chuyên nghiệp, rõ ràng bằng tiếng Việt.
`;

  return callGemini({
    prompt,
    systemInstruction: 'Bạn là chuyên gia tư vấn sư phạm môn Toán THPT với hơn 15 năm kinh nghiệm.',
    customApiKey
  });
}

// 4. Giải bài toán & hướng dẫn phương pháp giải
export async function aiSolveMath(
  problem: string,
  customApiKey?: string
): Promise<string> {
  const prompt = `
Bạn là Gia sư AI môn Toán THPT. Hãy giải chi tiết và hướng dẫn phương pháp giải bài toán sau:

Đề bài:
${problem}

Yêu cầu:
1. Tóm tắt dạng toán và kiến thức trọng tâm cần nhớ.
2. Lời giải chi tiết từng bước, tất cả công thức viết bằng LaTeX kẹp giữa $...$ hoặc $$...$$.
3. Mẹo giải nhanh trắc nghiệm hoặc cách bấm máy tính Casio fx-580VN X / fx-880BTG (nếu có thể áp dụng).
4. Các lỗi sai thường gặp mà học sinh hay mắc phải ở dạng bài này.
`;

  return callGemini({
    prompt,
    systemInstruction: 'Bạn là chuyên gia giải toán THPT giảng giải mạch lạc, khoa học, dễ hiểu.',
    customApiKey
  });
}
