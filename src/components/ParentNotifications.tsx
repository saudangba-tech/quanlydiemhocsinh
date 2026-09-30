import React, { useState } from 'react';
import { Student } from '../types';
import { calculateMathGPA, getAcademicRank } from '../services/storage';
import { aiGenerateParentMessage } from '../services/gemini';
import { 
  Send, 
  Bot, 
  Sparkles, 
  Copy, 
  Check, 
  Phone, 
  MessageSquare, 
  User, 
  HelpCircle,
  ExternalLink
} from 'lucide-react';

interface ParentNotificationsProps {
  students: Student[];
  selectedClassId: string;
  classNameStr: string;
  customApiKey?: string;
}

export const ParentNotifications: React.FC<ParentNotificationsProps> = ({
  students,
  selectedClassId,
  classNameStr,
  customApiKey
}) => {
  const classStudents = students.filter(s => s.classId === selectedClassId);
  const [selectedStudentId, setSelectedStudentId] = useState<string>(classStudents[0]?.id || '');
  const [messageText, setMessageText] = useState<string>('');
  const [isAiGenerating, setIsAiGenerating] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [templateType, setTemplateType] = useState<'standard' | 'praise' | 'warning'>('standard');

  const currentStudent = classStudents.find(s => s.id === selectedStudentId) || classStudents[0];

  // Helper to generate manual template
  const generateManualTemplate = (student: Student, type: 'standard' | 'praise' | 'warning') => {
    if (!student) return '';
    const gpa = calculateMathGPA(student);
    const rank = getAcademicRank(gpa);

    if (type === 'praise') {
      return `Kính gửi Phụ huynh em ${student.name} (Lớp ${classNameStr}),\nThầy/Cô dạy Toán xin gửi lời biểu dương đặc biệt đến em. Trong tuần qua, em ${student.name} có tinh thần học tập rất hăng say, tích cực lên bảng phát biểu và đạt kết quả điểm Toán rất tốt (${gpa ? `ĐTB: ${gpa.toFixed(1)} - ${rank.text}` : 'tiến bộ rõ rệt'}). Điểm rèn luyện của em hiện đạt ${student.behaviorScore} điểm với ${student.starCount} sao thưởng. Rất mong gia đình tiếp tục động viên để em duy trì phong độ xuất sắc này!`;
    }

    if (type === 'warning') {
      return `Kính gửi Phụ huynh em ${student.name} (Lớp ${classNameStr}),\nThầy/Cô giáo bộ môn Toán gửi thông tin cập nhật tình hình học tập của em: Hiện tại điểm kiểm tra Toán của em là ${gpa ? `${gpa.toFixed(1)} (${rank.text})` : 'chưa ổn định'}, điểm rèn luyện ${student.behaviorScore} điểm. Trong các tiết học gần đây em còn có biểu hiện ${student.notes || 'chưa tập trung, cần rèn luyện thêm bài tập'}. Kính mong Quý phụ huynh cùng nhắc nhở em ôn lại lý thuyết và hoàn thành bài tập về nhà đầy đủ. Thầy/Cô xin cảm ơn!`;
    }

    // Standard
    return `Kính gửi Quý phụ huynh em ${student.name} (Lớp ${classNameStr}),\nThầy/Cô giáo bộ môn Toán xin gửi báo cáo định kỳ kết quả học tập của em:\n- Điểm thường xuyên: Tx1=${student.tx1 ?? '-'}, Tx2=${student.tx2 ?? '-'}, Tx3=${student.tx3 ?? '-'}\n- Điểm Giữa kỳ: ${student.gk ?? '-'}\n- Điểm Cuối kỳ: ${student.ck ?? '-'}\n- Điểm TB môn Toán tạm tính: ${gpa ? `${gpa.toFixed(1)} (${rank.text})` : 'Đang cập nhật'}\n- Điểm rèn luyện / Kỷ luật: ${student.behaviorScore}đ (${student.starCount} sao)\n- Nhận xét của giáo viên: ${student.notes || 'Học tập đầy đủ, ngoan ngoãn'}.\nKính chúc Quý phụ huynh nhiều sức khỏe và tiếp tục đồng hành cùng con!`;
  };

  // Switch student
  const handleSelectStudent = (id: string) => {
    setSelectedStudentId(id);
    const target = classStudents.find(s => s.id === id);
    if (target) {
      setMessageText(generateManualTemplate(target, templateType));
    }
  };

  // Switch template
  const handleTemplateChange = (type: 'standard' | 'praise' | 'warning') => {
    setTemplateType(type);
    if (currentStudent) {
      setMessageText(generateManualTemplate(currentStudent, type));
    }
  };

  // AI Generator
  const handleAiGenerate = async () => {
    if (!currentStudent) return;
    setIsAiGenerating(true);
    try {
      const generated = await aiGenerateParentMessage(currentStudent, customApiKey);
      setMessageText(generated);
    } catch (err: any) {
      alert('Lỗi tạo tin nhắn AI: ' + err.message);
    } finally {
      setIsAiGenerating(false);
    }
  };

  // Copy to clipboard
  const handleCopy = () => {
    if (!messageText) return;
    navigator.clipboard.writeText(messageText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Open Zalo or SMS
  const handleSendZalo = () => {
    if (!currentStudent?.parentPhone) {
      alert('Học sinh chưa có số điện thoại phụ huynh!');
      return;
    }
    // Zalo chat link: https://zalo.me/{phone}
    const cleanPhone = currentStudent.parentPhone.replace(/\D/g, '');
    window.open(`https://zalo.me/${cleanPhone}`, '_blank');
  };

  const handleSendSMS = () => {
    if (!currentStudent?.parentPhone) {
      alert('Học sinh chưa có số điện thoại phụ huynh!');
      return;
    }
    const cleanPhone = currentStudent.parentPhone.replace(/\D/g, '');
    window.open(`sms:${cleanPhone}?body=${encodeURIComponent(messageText)}`, '_blank');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-5 sm:px-6 space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <Send className="w-5 h-5 text-blue-600" />
            <span>Gửi Thông Báo Học Tập & Kỷ Luật Đến Phụ Huynh</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Cầu nối thông tin nhanh chóng, minh bạch giữa giáo viên Toán và gia đình qua Zalo / SMS
          </p>
        </div>

        {/* Template Buttons */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">Mẫu nhanh:</span>
          <button
            onClick={() => handleTemplateChange('standard')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              templateType === 'standard' ? 'bg-blue-600 text-white shadow-2xs' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            Định kỳ
          </button>
          <button
            onClick={() => handleTemplateChange('praise')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              templateType === 'praise' ? 'bg-emerald-600 text-white shadow-2xs' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            Khen ngợi
          </button>
          <button
            onClick={() => handleTemplateChange('warning')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              templateType === 'warning' ? 'bg-rose-600 text-white shadow-2xs' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            Nhắc nhở
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left column: Student list selection (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 shadow-2xs p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Chọn học sinh ({classStudents.length})
            </h3>
          </div>

          <div className="space-y-1.5 max-h-[500px] overflow-y-auto">
            {classStudents.map(student => {
              const isSelected = student.id === selectedStudentId;
              const gpa = calculateMathGPA(student);
              return (
                <button
                  key={student.id}
                  onClick={() => handleSelectStudent(student.id)}
                  className={`w-full p-2.5 rounded-xl text-left transition-all flex items-center justify-between ${
                    isSelected 
                      ? 'bg-blue-50 border border-blue-200 shadow-2xs' 
                      : 'hover:bg-slate-50 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <img
                      src={student.avatar}
                      alt={student.name}
                      className="w-9 h-9 rounded-full object-cover border border-slate-200"
                    />
                    <div>
                      <div className="text-xs font-bold text-slate-800">{student.name}</div>
                      <div className="text-[11px] text-slate-400">
                        PH: {student.parentName} ({student.parentPhone})
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-bold text-indigo-700">{gpa ? `${gpa.toFixed(1)}đ` : '-'}</span>
                    <div className="text-[10px] text-emerald-600 font-semibold">{student.behaviorScore}đ RL</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right column: Message Editor & Preview (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200 shadow-2xs p-5 space-y-4">
          {currentStudent ? (
            <>
              {/* Student Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <img
                    src={currentStudent.avatar}
                    alt={currentStudent.name}
                    className="w-11 h-11 rounded-full object-cover border border-slate-200"
                  />
                  <div>
                    <h3 className="font-bold text-sm text-slate-800">{currentStudent.name} ({currentStudent.code})</h3>
                    <p className="text-xs text-slate-500">
                      Phụ huynh: <strong className="text-slate-700">{currentStudent.parentName}</strong> · SĐT: <strong className="text-slate-700">{currentStudent.parentPhone}</strong>
                    </p>
                  </div>
                </div>

                {/* AI personalized button */}
                <button
                  onClick={handleAiGenerate}
                  disabled={isAiGenerating}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-all active:scale-95 disabled:opacity-50"
                >
                  <Bot className="w-4 h-4" />
                  <span>{isAiGenerating ? 'AI đang soạn...' : 'AI soạn tin nhắn cá nhân'}</span>
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                </button>
              </div>

              {/* Message Editor */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
                  <span>Nội dung tin nhắn:</span>
                  <span className="text-[11px] text-slate-400">{messageText.length} ký tự</span>
                </label>
                <textarea
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  rows={8}
                  placeholder="Nhập nội dung tin nhắn gửi phụ huynh..."
                  className="w-full p-3.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white resize-y"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    <span>{copied ? 'Đã sao chép!' : 'Sao chép tin nhắn'}</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSendZalo}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Mở Chat Zalo</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>

                  <button
                    onClick={handleSendSMS}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors"
                  >
                    <Phone className="w-4 h-4" />
                    <span>Gửi tin nhắn SMS</span>
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-16 text-slate-400 text-xs">
              Vui lòng chọn học sinh từ danh sách bên trái.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
