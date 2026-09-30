import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Student, BehaviorRecord } from '../types';
import { sound } from '../services/sound';
import { fireConfetti } from '../utils/mathjax';
import { 
  Sparkles, 
  Search, 
  UserPlus, 
  RotateCcw, 
  CheckSquare, 
  Square, 
  Dices, 
  Clock, 
  ThumbsUp, 
  AlertTriangle,
  Award,
  Zap,
  BookOpen,
  HelpCircle,
  Smartphone,
  MessageSquareOff,
  Moon
} from 'lucide-react';

interface LiveBehaviorGradingProps {
  students: Student[];
  behaviors: BehaviorRecord[];
  onUpdateStudents: (students: Student[]) => void;
  onAddBehavior: (records: BehaviorRecord[]) => void;
  onUndoBehavior: (recordId: string) => void;
  onOpenStudentDetail: (student: Student) => void;
  selectedClassId: string;
}

export const LiveBehaviorGrading: React.FC<LiveBehaviorGradingProps> = ({
  students,
  behaviors,
  onUpdateStudents,
  onAddBehavior,
  onUndoBehavior,
  onOpenStudentDetail,
  selectedClassId
}) => {
  const [search, setSearch] = useState('');
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false);
  const [customActionModalStudent, setCustomActionModalStudent] = useState<Student | null>(null);
  const [randomWinner, setRandomWinner] = useState<Student | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [filterRole, setFilterRole] = useState<string>('all');

  // Filter students for current class
  const classStudents = students.filter(s => s.classId === selectedClassId);

  const filteredStudents = classStudents.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) || 
                        s.code.toLowerCase().includes(search.toLowerCase());
    const matchRole = filterRole === 'all' || s.role === filterRole;
    return matchSearch && matchRole;
  });

  // Today's behaviors
  const todayBehaviors = behaviors.filter(b => b.classId === selectedClassId);

  // Apply single student score
  const handleScoreChange = (
    student: Student,
    points: number,
    reason: string,
    category: BehaviorRecord['category']
  ) => {
    if (points > 0) {
      sound.playPositive();
      if (points >= 2) fireConfetti();
    } else {
      sound.playNegative();
    }

    const updated = students.map(s => {
      if (s.id === student.id) {
        const newScore = Math.max(0, s.behaviorScore + points);
        const newStars = points > 0 ? s.starCount + (points >= 2 ? 2 : 1) : s.starCount;
        return {
          ...s,
          behaviorScore: newScore,
          starCount: newStars
        };
      }
      return s;
    });

    const newRecord: BehaviorRecord = {
      id: 'bh-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      studentId: student.id,
      studentName: student.name,
      classId: selectedClassId,
      type: points > 0 ? 'positive' : 'negative',
      points,
      reason,
      category,
      timestamp: new Date().toISOString()
    };

    onUpdateStudents(updated);
    onAddBehavior([newRecord]);
  };

  // Batch scoring for selected students
  const handleBatchScore = (
    points: number,
    reason: string,
    category: BehaviorRecord['category']
  ) => {
    if (selectedStudentIds.length === 0) return;

    if (points > 0) {
      sound.playPositive();
      fireConfetti();
    } else {
      sound.playNegative();
    }

    const newRecords: BehaviorRecord[] = [];
    const updated = students.map(s => {
      if (selectedStudentIds.includes(s.id)) {
        newRecords.push({
          id: 'bh-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6) + '-' + s.id,
          studentId: s.id,
          studentName: s.name,
          classId: selectedClassId,
          type: points > 0 ? 'positive' : 'negative',
          points,
          reason: `[Nhóm] ${reason}`,
          category,
          timestamp: new Date().toISOString()
        });
        return {
          ...s,
          behaviorScore: Math.max(0, s.behaviorScore + points),
          starCount: points > 0 ? s.starCount + 1 : s.starCount
        };
      }
      return s;
    });

    onUpdateStudents(updated);
    onAddBehavior(newRecords);
    setSelectedStudentIds([]);
    setIsMultiSelectMode(false);
  };

  // Random student picker
  const handlePickRandomStudent = () => {
    if (classStudents.length === 0) return;
    setIsSpinning(true);
    setRandomWinner(null);

    let count = 0;
    const interval = setInterval(() => {
      const idx = Math.floor(Math.random() * classStudents.length);
      setRandomWinner(classStudents[idx]);
      count++;
      if (count > 15) {
        clearInterval(interval);
        setIsSpinning(false);
        sound.playFanfare();
        fireConfetti();
      }
    }, 100);
  };

  const toggleSelectStudent = (id: string) => {
    if (selectedStudentIds.includes(id)) {
      setSelectedStudentIds(selectedStudentIds.filter(item => item !== id));
    } else {
      setSelectedStudentIds([...selectedStudentIds, id]);
    }
  };

  const selectAll = () => {
    if (selectedStudentIds.length === filteredStudents.length) {
      setSelectedStudentIds([]);
    } else {
      setSelectedStudentIds(filteredStudents.map(s => s.id));
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-5 sm:px-6 space-y-6">
      {/* Top Banner / Toolbar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex flex-wrap items-center justify-between gap-4">
        {/* Search & Filter */}
        <div className="flex items-center gap-3 flex-1 min-w-[280px]">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm học sinh theo tên hoặc mã HS..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
            />
          </div>

          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 font-medium text-slate-700 focus:outline-none"
          >
            <option value="all">Tất cả chức vụ</option>
            <option value="Lớp trưởng">Lớp trưởng</option>
            <option value="Cán sự Toán">Cán sự Toán</option>
            <option value="Tổ trưởng">Tổ trưởng</option>
            <option value="Học sinh">Học sinh</option>
          </select>
        </div>

        {/* Action Buttons: Batch mode, Random wheel */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => {
              setIsMultiSelectMode(!isMultiSelectMode);
              if (isMultiSelectMode) setSelectedStudentIds([]);
            }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
              isMultiSelectMode 
                ? 'bg-amber-500 text-white shadow-2xs' 
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <CheckSquare className="w-4 h-4" />
            <span>{isMultiSelectMode ? 'Hủy chọn nhiều' : 'Đánh giá nhóm'}</span>
          </button>

          <button
            onClick={handlePickRandomStudent}
            disabled={isSpinning}
            className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-lg text-xs font-semibold shadow-2xs transition-all active:scale-95"
          >
            <Dices className="w-4 h-4" />
            <span>{isSpinning ? 'Đang quay...' : 'Gọi ngẫu nhiên'}</span>
          </button>
        </div>
      </div>

      {/* Batch Action Bar if Multi-Select Active */}
      {isMultiSelectMode && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-center gap-3">
            <button
              onClick={selectAll}
              className="text-xs font-semibold text-amber-900 flex items-center gap-1 hover:underline"
            >
              {selectedStudentIds.length === filteredStudents.length ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
              <span>Chọn tất cả ({selectedStudentIds.length}/{filteredStudents.length})</span>
            </button>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-amber-800 font-medium mr-1">Cộng/Trừ điểm cho nhóm đã chọn:</span>
            <button
              onClick={() => handleBatchScore(1, 'Cả nhóm tích cực thảo luận và hoàn thành bài tập', 'Phát biểu')}
              disabled={selectedStudentIds.length === 0}
              className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-xs font-semibold disabled:opacity-50"
            >
              +1đ Thảo luận tốt
            </button>
            <button
              onClick={() => handleBatchScore(2, 'Nhóm hoàn thành bài tập Toán xuất sắc', 'Lên bảng')}
              disabled={selectedStudentIds.length === 0}
              className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-semibold disabled:opacity-50"
            >
              +2đ Xuất sắc
            </button>
            <button
              onClick={() => handleBatchScore(-1, 'Nhóm chưa tập trung làm bài tập', 'Kỷ luật')}
              disabled={selectedStudentIds.length === 0}
              className="px-2.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-md text-xs font-semibold disabled:opacity-50"
            >
              -1đ Mất tập trung
            </button>
          </div>
        </div>
      )}

      {/* Random Winner Modal Banner */}
      {randomWinner && (
        <div className="bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500 text-white p-4 rounded-xl shadow-md flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img
              src={randomWinner.avatar}
              alt={randomWinner.name}
              className="w-12 h-12 rounded-full border-2 border-white object-cover"
            />
            <div>
              <div className="text-xs uppercase tracking-wider text-purple-200 font-bold">Học sinh được gọi lên bảng:</div>
              <div className="text-lg font-bold flex items-center gap-2">
                <span>{randomWinner.name}</span>
                <span className="text-xs bg-white/20 px-2 py-0.5 rounded font-normal">{randomWinner.code}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleScoreChange(randomWinner, 2, 'Lên bảng giải bài đúng và tự tin', 'Lên bảng')}
              className="px-3 py-1.5 bg-white text-purple-700 hover:bg-purple-50 font-bold text-xs rounded-lg shadow-xs"
            >
              +2đ Trả lời đúng
            </button>
            <button
              onClick={() => handleScoreChange(randomWinner, 1, 'Lên bảng cố gắng, có hướng đi đúng', 'Lên bảng')}
              className="px-3 py-1.5 bg-purple-700 hover:bg-purple-800 text-white font-semibold text-xs rounded-lg"
            >
              +1đ Khích lệ
            </button>
            <button
              onClick={() => setRandomWinner(null)}
              className="text-xs text-white/80 hover:text-white px-2 py-1"
            >
              Đóng
            </button>
          </div>
        </div>
      )}

      {/* Main Grid: Student Cards (Seating / Attendance grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredStudents.map((student) => {
          const isSelected = selectedStudentIds.includes(student.id);
          const isHighBehavior = student.behaviorScore >= 110;
          const isLowBehavior = student.behaviorScore < 95;

          return (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              key={student.id}
              className={`bg-white rounded-2xl border transition-all duration-300 p-4 flex flex-col justify-between relative shadow-sm hover:shadow-lg ${
                isSelected 
                  ? 'border-blue-500 ring-2 ring-blue-200 shadow-blue-100' 
                  : 'border-slate-200 hover:border-blue-300'
              }`}
            >
              {/* Checkbox for Multi-select */}
              {isMultiSelectMode && (
                <button
                  onClick={() => toggleSelectStudent(student.id)}
                  className="absolute top-3 right-3 text-blue-600 focus:outline-none"
                >
                  {isSelected ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5 text-slate-300" />}
                </button>
              )}

              {/* Student Header Info */}
              <div>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src={student.avatar}
                      alt={student.name}
                      onClick={() => onOpenStudentDetail(student)}
                      className="w-12 h-12 rounded-xl object-cover border border-slate-200 cursor-pointer hover:opacity-90 transition-opacity"
                    />
                    <div 
                      className={`absolute -bottom-1 -right-1 text-[10px] font-bold px-1.5 py-0.2 rounded-full border border-white ${
                        isHighBehavior 
                          ? 'bg-emerald-500 text-white' 
                          : isLowBehavior 
                          ? 'bg-rose-500 text-white' 
                          : 'bg-blue-500 text-white'
                      }`}
                    >
                      {student.behaviorScore}đ
                    </div>
                  </div>

                  <div className="flex-1 min-w-0 pr-6">
                    <h3 
                      onClick={() => onOpenStudentDetail(student)}
                      className="text-sm font-bold text-slate-800 hover:text-blue-600 cursor-pointer truncate"
                      title={student.name}
                    >
                      {student.name}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                      <span>{student.code}</span>
                      <span>·</span>
                      <span className="truncate">{student.role}</span>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-amber-600 mt-0.5">
                      <Sparkles className="w-3 h-3 text-amber-500 fill-amber-400" />
                      <span>{student.starCount} sao</span>
                    </div>
                  </div>
                </div>

                {/* Teacher Note preview if any */}
                {student.notes && (
                  <p className="text-[11px] text-slate-500 mt-2.5 line-clamp-1 italic bg-slate-50 px-2 py-1 rounded">
                    "{student.notes}"
                  </p>
                )}
              </div>

              {/* Quick Action Buttons (Real-time in class) */}
              <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between gap-1.5">
                {/* +1 Quick */}
                <button
                  onClick={() => handleScoreChange(student, 1, 'Phát biểu xây dựng bài học', 'Phát biểu')}
                  title="Cộng 1 điểm: Phát biểu đúng"
                  className="flex-1 py-1.5 bg-emerald-50 hover:bg-emerald-100 active:bg-emerald-200 text-emerald-700 font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1"
                >
                  <ThumbsUp className="w-3 h-3" />
                  <span>+1</span>
                </button>

                {/* +2 Quick */}
                <button
                  onClick={() => handleScoreChange(student, 2, 'Lên bảng giải bài toán khó xuất sắc', 'Lên bảng')}
                  title="Cộng 2 điểm: Lên bảng / Bài tập khó"
                  className="flex-1 py-1.5 bg-blue-50 hover:bg-blue-100 active:bg-blue-200 text-blue-700 font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1"
                >
                  <Award className="w-3 h-3" />
                  <span>+2</span>
                </button>

                {/* -1 Quick */}
                <button
                  onClick={() => handleScoreChange(student, -1, 'Mất trật tự / Nhắc nhở', 'Kỷ luật')}
                  title="Trừ 1 điểm: Nhắc nhở kỷ luật"
                  className="flex-1 py-1.5 bg-rose-50 hover:bg-rose-100 active:bg-rose-200 text-rose-700 font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1"
                >
                  <AlertTriangle className="w-3 h-3" />
                  <span>-1</span>
                </button>

                {/* More behavior options */}
                <button
                  onClick={() => setCustomActionModalStudent(student)}
                  title="Thêm các loại hành vi khác..."
                  className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs"
                >
                  <i className="fa-solid fa-ellipsis"></i>
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredStudents.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
          <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h3 className="text-sm font-semibold text-slate-700">Không tìm thấy học sinh</h3>
          <p className="text-xs text-slate-500 mt-1">Thử đổi từ khóa tìm kiếm hoặc lọc theo chức vụ khác.</p>
        </div>
      )}

      {/* Real-time Classroom Timeline / Activity Log */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-600" />
            <h2 className="text-sm font-bold text-slate-800">Nhật ký đánh giá hành vi trong tiết học</h2>
            <span className="text-xs text-slate-500">({todayBehaviors.length} lượt ghi nhận)</span>
          </div>
        </div>

        <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto">
          {todayBehaviors.length === 0 ? (
            <p className="text-xs text-slate-400 py-3 text-center">Chưa có lượt cộng/trừ điểm nào trong tiết học này.</p>
          ) : (
            todayBehaviors.map((item) => (
              <div key={item.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5">
                  <span
                    className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                      item.points > 0
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-rose-50 text-rose-700'
                    }`}
                  >
                    {item.points > 0 ? `+${item.points}đ` : `${item.points}đ`}
                  </span>
                  <div>
                    <strong className="text-slate-800 font-semibold">{item.studentName}</strong>
                    <span className="text-slate-500 mx-1.5">·</span>
                    <span className="text-slate-600">{item.reason}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-[11px] text-slate-400">
                    {new Date(item.timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <button
                    onClick={() => onUndoBehavior(item.id)}
                    title="Hoàn tác lượt chấm này"
                    className="text-slate-400 hover:text-slate-700 transition-colors p-1"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal: Custom Detailed Behavior Actions */}
      <AnimatePresence>
        {customActionModalStudent && (
          <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl space-y-4"
            >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <img
                  src={customActionModalStudent.avatar}
                  alt={customActionModalStudent.name}
                  className="w-10 h-10 rounded-full object-cover border"
                />
                <div>
                  <h3 className="font-bold text-sm text-slate-800">{customActionModalStudent.name}</h3>
                  <p className="text-xs text-slate-500">Mã: {customActionModalStudent.code} · Điểm hiện tại: {customActionModalStudent.behaviorScore}đ</p>
                </div>
              </div>
              <button
                onClick={() => setCustomActionModalStudent(null)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div className="text-xs font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1">
                <ThumbsUp className="w-3.5 h-3.5" />
                <span>Hành vi tích cực (Cộng điểm)</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  onClick={() => {
                    handleScoreChange(customActionModalStudent, 1, 'Phát biểu đúng trọng tâm bài học', 'Phát biểu');
                    setCustomActionModalStudent(null);
                  }}
                  className="p-2.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-left font-medium transition-colors"
                >
                  <div className="font-bold">+1đ Phát biểu</div>
                  <div className="text-[11px] text-emerald-600">Đóng góp ý kiến hay</div>
                </button>
                <button
                  onClick={() => {
                    handleScoreChange(customActionModalStudent, 2, 'Lên bảng giải bài toán khó', 'Lên bảng');
                    setCustomActionModalStudent(null);
                  }}
                  className="p-2.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-left font-medium transition-colors"
                >
                  <div className="font-bold">+2đ Lên bảng</div>
                  <div className="text-[11px] text-emerald-600">Xung phong giải bài</div>
                </button>
                <button
                  onClick={() => {
                    handleScoreChange(customActionModalStudent, 2, 'Có cách giải sáng tạo / ngắn gọn', 'Sáng tạo');
                    setCustomActionModalStudent(null);
                  }}
                  className="p-2.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-left font-medium transition-colors"
                >
                  <div className="font-bold">+2đ Sáng tạo</div>
                  <div className="text-[11px] text-emerald-600">Cách giải độc đáo</div>
                </button>
                <button
                  onClick={() => {
                    handleScoreChange(customActionModalStudent, 1, 'Hỗ trợ, hướng dẫn bạn cùng tiến', 'Sáng tạo');
                    setCustomActionModalStudent(null);
                  }}
                  className="p-2.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-left font-medium transition-colors"
                >
                  <div className="font-bold">+1đ Giúp đỡ bạn</div>
                  <div className="text-[11px] text-emerald-600">Tinh thần đồng đội</div>
                </button>
              </div>

              <div className="text-xs font-bold text-rose-700 uppercase tracking-wider flex items-center gap-1 pt-2">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Vi phạm nội quy (Trừ điểm nhắc nhở)</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  onClick={() => {
                    handleScoreChange(customActionModalStudent, -1, 'Mất trật tự trong giờ học', 'Kỷ luật');
                    setCustomActionModalStudent(null);
                  }}
                  className="p-2.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-800 text-left font-medium transition-colors"
                >
                  <div className="font-bold">-1đ Mất trật tự</div>
                  <div className="text-[11px] text-rose-600">Nói chuyện riêng</div>
                </button>
                <button
                  onClick={() => {
                    handleScoreChange(customActionModalStudent, -1, 'Chưa làm bài tập về nhà môn Toán', 'BTVN');
                    setCustomActionModalStudent(null);
                  }}
                  className="p-2.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-800 text-left font-medium transition-colors"
                >
                  <div className="font-bold">-1đ Quên BTVN</div>
                  <div className="text-[11px] text-rose-600">Chưa chuẩn bị bài</div>
                </button>
                <button
                  onClick={() => {
                    handleScoreChange(customActionModalStudent, -2, 'Sử dụng điện thoại không đúng mục đích', 'Kỷ luật');
                    setCustomActionModalStudent(null);
                  }}
                  className="p-2.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-800 text-left font-medium transition-colors"
                >
                  <div className="font-bold">-2đ Dùng điện thoại</div>
                  <div className="text-[11px] text-rose-600">Chơi game / nhắn tin</div>
                </button>
                <button
                  onClick={() => {
                    handleScoreChange(customActionModalStudent, -1, 'Ngủ gật / Không tập trung nghe giảng', 'Kỷ luật');
                    setCustomActionModalStudent(null);
                  }}
                  className="p-2.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-800 text-left font-medium transition-colors"
                >
                  <div className="font-bold">-1đ Ngủ gật</div>
                  <div className="text-[11px] text-rose-600">Mất tập trung</div>
                </button>
              </div>
            </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
