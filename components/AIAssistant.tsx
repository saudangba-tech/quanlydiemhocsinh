import React, { useState } from 'react';
import { MathQuestion } from '../types';
import { aiGenerateMathQuestions, aiSolveMath } from '../services/gemini';
import { useMathJax } from '../utils/mathjax';
import { 
  Bot, 
  Sparkles, 
  PenTool, 
  HelpCircle, 
  PlusCircle, 
  Calculator, 
  Copy, 
  Check, 
  BookOpen,
  ArrowRight
} from 'lucide-react';

interface AIAssistantProps {
  onAddQuestions: (questions: MathQuestion[]) => void;
  customApiKey?: string;
  selectedGrade: 10 | 11 | 12;
}

export const AIAssistant: React.FC<AIAssistantProps> = ({
  onAddQuestions,
  customApiKey,
  selectedGrade
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'generator' | 'solver'>('generator');

  // Generator states
  const [topic, setTopic] = useState('Khảo sát hàm số & Cực trị');
  const [grade, setGrade] = useState<number>(selectedGrade);
  const [level, setLevel] = useState('Vận dụng');
  const [count, setCount] = useState<number>(3);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<MathQuestion[]>([]);
  const [addedSuccess, setAddedSuccess] = useState(false);

  // Solver states
  const [mathPrompt, setMathPrompt] = useState('');
  const [isSolving, setIsSolving] = useState(false);
  const [solution, setSolution] = useState('');
  const [error, setError] = useState('');

  // Auto trigger MathJax re-render when generated questions or solution updates
  useMathJax([generatedQuestions, solution]);

  const mathTopicsByGrade: Record<number, string[]> = {
    10: [
      'Mệnh đề & Tập hợp',
      'Bất phương trình & Hệ bất phương trình bậc nhất hai ẩn',
      'Hàm số bậc hai & Đồ thị',
      'Hệ thức lượng trong tam giác',
      'Vectơ & Các phép toán vectơ',
      'Phương pháp tọa độ trong mặt phẳng Oxy',
      'Đại số tổ hợp & Nhị thức Newton',
      'Xác suất cổ điển'
    ],
    11: [
      'Hàm số lượng giác & Phương trình lượng giác',
      'Dãy số, Cấp số cộng & Cấp số nhân',
      'Giới hạn & Hàm số liên tục',
      'Đạo hàm & Ý nghĩa hình học của đạo hàm',
      'Quan hệ song song trong không gian',
      'Quan hệ vuông góc trong không gian',
      'Phép thử & Biến cố - Xác suất có điều kiện',
      'Hàm số mũ & Hàm số logarit'
    ],
    12: [
      'Ứng dụng đạo hàm khảo sát hàm số',
      'Giá trị lớn nhất, nhỏ nhất & Cực trị hàm số',
      'Nguyên hàm, Tích phân & Ứng dụng hình học',
      'Phương pháp tọa độ trong không gian Oxyz',
      'Phương trình mặt phẳng & Mặt cầu trong Oxyz',
      'Phương trình đường thẳng trong Oxyz',
      'Xác suất có điều kiện & Công thức Bayes',
      'Số phức & Tập hợp điểm biểu diễn số phức'
    ]
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError('');
    setAddedSuccess(false);
    try {
      const questions = await aiGenerateMathQuestions(topic, grade, count, level, customApiKey);
      setGeneratedQuestions(questions);
    } catch (err: any) {
      setError(err.message || 'Lỗi khi tạo câu hỏi');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveToBank = () => {
    if (generatedQuestions.length === 0) return;
    onAddQuestions(generatedQuestions);
    setAddedSuccess(true);
    setTimeout(() => setAddedSuccess(false), 3000);
  };

  const handleSolve = async () => {
    if (!mathPrompt.trim()) return;
    setIsSolving(true);
    setError('');
    try {
      const res = await aiSolveMath(mathPrompt, customApiKey);
      setSolution(res);
    } catch (err: any) {
      setError(err.message || 'Lỗi khi giải toán');
    } finally {
      setIsSolving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-5 sm:px-6 space-y-6">
      {/* Sub tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveSubTab('generator')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors ${
            activeSubTab === 'generator'
              ? 'bg-blue-600 text-white shadow-2xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <PenTool className="w-4 h-4" />
          <span>Sinh Đề Trắc Nghiệm Toán THPT</span>
        </button>

        <button
          onClick={() => setActiveSubTab('solver')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors ${
            activeSubTab === 'solver'
              ? 'bg-blue-600 text-white shadow-2xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Calculator className="w-4 h-4" />
          <span>Gia Sư Giải Toán & Thủ Thuật Casio</span>
        </button>
      </div>

      {error && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">
          {error}
        </div>
      )}

      {/* Tab 1: AI Question Generator */}
      {activeSubTab === 'generator' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Controls (4 cols) */}
          <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
            <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span>Thiết lập tạo câu hỏi trắc nghiệm</span>
            </h3>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Khối lớp:</label>
                <div className="grid grid-cols-3 gap-2">
                  {[10, 11, 12].map(g => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => {
                        setGrade(g);
                        setTopic(mathTopicsByGrade[g][0]);
                      }}
                      className={`py-1.5 rounded-lg text-xs font-bold transition-colors ${
                        grade === g 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      Lớp {g}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Chủ đề chuyên đề:</label>
                <select
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {(mathTopicsByGrade[grade] || []).map((t, idx) => (
                    <option key={idx} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Mức độ nhận thức:</label>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Nhận biết">Nhận biết</option>
                  <option value="Thông hiểu">Thông hiểu</option>
                  <option value="Vận dụng">Vận dụng</option>
                  <option value="Vận dụng cao">Vận dụng cao</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Số lượng câu:</label>
                <select
                  value={count}
                  onChange={(e) => setCount(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={2}>2 câu</option>
                  <option value={3}>3 câu</option>
                  <option value={5}>5 câu</option>
                </select>
              </div>

              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full mt-2 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl text-xs font-bold shadow-2xs transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <i className="fa-solid fa-circle-notch fa-spin"></i>
                    <span>AI đang tạo câu hỏi và công thức...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Tạo câu hỏi trắc nghiệm ngay</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Results Display (8 cols) */}
          <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-sm text-slate-800">Kết quả câu hỏi trắc nghiệm ({generatedQuestions.length})</h3>
                <p className="text-xs text-slate-500">Các công thức toán hiển thị qua MathJax LaTeX</p>
              </div>

              {generatedQuestions.length > 0 && (
                <button
                  onClick={handleSaveToBank}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>{addedSuccess ? '✓ Đã lưu vào Ngân hàng!' : 'Lưu vào Ngân hàng câu hỏi'}</span>
                </button>
              )}
            </div>

            {generatedQuestions.length === 0 ? (
              <div className="text-center py-16 text-slate-400 text-xs space-y-2">
                <BookOpen className="w-10 h-10 text-slate-300 mx-auto" />
                <p>Chưa có câu hỏi nào được tạo. Nhấn "Tạo câu hỏi trắc nghiệm ngay" để AI sinh đề.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {generatedQuestions.map((q, idx) => (
                  <div key={q.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-blue-700">Câu {idx + 1} ({q.level})</span>
                      <span className="text-[11px] text-slate-500">{q.topic} - Lớp {q.grade}</span>
                    </div>

                    <div className="text-sm font-medium text-slate-800 leading-relaxed">
                      {q.content}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {q.options.map((opt, optIdx) => {
                        const isCorrect = optIdx === q.correctAnswer;
                        const label = String.fromCharCode(65 + optIdx);
                        return (
                          <div
                            key={optIdx}
                            className={`p-2.5 rounded-lg border font-medium ${
                              isCorrect 
                                ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-semibold' 
                                : 'bg-white border-slate-200 text-slate-700'
                            }`}
                          >
                            <strong>{label}. </strong> {opt}
                          </div>
                        );
                      })}
                    </div>

                    {q.explanation && (
                      <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-lg text-xs text-amber-900 leading-relaxed">
                        <strong className="text-amber-800">Lời giải chi tiết: </strong>
                        {q.explanation}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: AI Solver & Casio Tricks */}
      {activeSubTab === 'solver' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
            <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
              <Calculator className="w-4 h-4 text-indigo-600" />
              <span>Nhập bài toán cần giải chi tiết</span>
            </h3>

            <textarea
              rows={7}
              placeholder="Nhập đề bài toán (Ví dụ: Cho hàm số y = (x^2 - 3x + 2)/(x - 1). Tìm tiệm cận và khoảng đồng biến... Hoặc: Tính tích phân từ 0 đến pi/2 của x.sin(x)dx...)"
              value={mathPrompt}
              onChange={(e) => setMathPrompt(e.target.value)}
              className="w-full p-3.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white resize-y"
            />

            {/* Quick Math Samples */}
            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-slate-500">Ví dụ nhanh:</span>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => setMathPrompt('Cho hình chóp S.ABCD có đáy ABCD là hình vuông cạnh a, SA vuông góc đáy, SA = a. Căn 2. Tính khoảng cách từ điểm A đến mặt phẳng (SBD).')}
                  className="text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-1 rounded"
                >
                  Khoảng cách hình không gian
                </button>
                <button
                  type="button"
                  onClick={() => setMathPrompt('Tính tích phân I = tích phân từ 0 đến 1 của (2x + 1).e^(2x) dx bằng phương pháp từng phần và chỉ cách bấm máy Casio.')}
                  className="text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-1 rounded"
                >
                  Tích phân từng phần
                </button>
              </div>
            </div>

            <button
              onClick={handleSolve}
              disabled={isSolving || !mathPrompt.trim()}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-2xs transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSolving ? (
                <>
                  <i className="fa-solid fa-circle-notch fa-spin"></i>
                  <span>AI đang giải toán từng bước...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Giải toán & Hướng dẫn Casio</span>
                </>
              )}
            </button>
          </div>

          <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
            <h3 className="font-bold text-sm text-slate-800 pb-3 border-b border-slate-100">
              Lời giải chi tiết & Phương pháp
            </h3>

            {solution ? (
              <div className="text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-line bg-slate-50/50 p-4 rounded-xl border border-slate-200 font-sans">
                {solution}
              </div>
            ) : (
              <div className="text-center py-16 text-slate-400 text-xs">
                Nhập đề bài ở khung bên trái và nhấn "Giải toán" để nhận lời giải chi tiết và hướng dẫn bấm máy tính Casio.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
