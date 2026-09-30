import React, { useState } from 'react';
import { Student, BehaviorRecord } from '../types';
import { calculateMathGPA, getAcademicRank } from '../services/storage';
import { 
  X, 
  Award, 
  Sparkles, 
  Phone, 
  User, 
  Clock, 
  ThumbsUp, 
  AlertTriangle, 
  Save, 
  MessageSquare 
} from 'lucide-react';

interface StudentProfileModalProps {
  student: Student | null;
  behaviors: BehaviorRecord[];
  onClose: () => void;
  onUpdateStudent: (student: Student) => void;
  onAddBehavior: (records: BehaviorRecord[]) => void;
  isTeacherMode: boolean;
}

export const StudentProfileModal: React.FC<StudentProfileModalProps> = ({
  student,
  behaviors,
  onClose,
  onUpdateStudent,
  onAddBehavior,
  isTeacherMode
}) => {
  if (!student) return null;

  const [notes, setNotes] = useState(student.notes || '');
  const [isSavedNotes, setIsSavedNotes] = useState(false);

  const gpa = calculateMathGPA(student);
  const rank = getAcademicRank(gpa);

  // Student's behavior history
  const studentBehaviors = behaviors.filter(b => b.studentId === student.id);

  const handleSaveNotes = () => {
    const updated = {
      ...student,
      notes
    };
    onUpdateStudent(updated);
    setIsSavedNotes(true);
    setTimeout(() => setIsSavedNotes(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-2xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl space-y-5 p-6 animate-scale-up">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <img
              src={student.avatar}
              alt={student.name}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-slate-200 shadow-xs"
            />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-800">{student.name}</h2>
                <span className="text-xs bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full font-semibold">
                  {student.role}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Mã định danh: <strong className="text-slate-700">{student.code}</strong> · Giới tính: {student.gender === 'nam' ? 'Nam' : 'Nữ'}
              </p>
              <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>PH: {student.parentName} ({student.parentPhone})</span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Academic & Behavior Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-100 text-center">
            <span className="text-[11px] font-semibold text-indigo-600 uppercase">ĐTB Môn Toán</span>
            <div className="text-xl font-bold text-indigo-900 mt-1">
              {gpa !== null ? gpa.toFixed(1) : '-'}
            </div>
            <span className="text-[10px] text-indigo-700 font-medium">{rank.text}</span>
          </div>

          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100 text-center">
            <span className="text-[11px] font-semibold text-emerald-600 uppercase">Điểm Rèn Luyện</span>
            <div className="text-xl font-bold text-emerald-900 mt-1">
              {student.behaviorScore}đ
            </div>
            <span className="text-[10px] text-emerald-700 font-medium">Kỷ luật lớp học</span>
          </div>

          <div className="p-3 rounded-xl bg-amber-50 border border-amber-100 text-center">
            <span className="text-[11px] font-semibold text-amber-600 uppercase">Sao Danh Dự</span>
            <div className="text-xl font-bold text-amber-900 mt-1">
              {student.starCount} ⭐
            </div>
            <span className="text-[10px] text-amber-700 font-medium">Tích lũy khen thưởng</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
            <span className="text-[11px] font-semibold text-slate-500 uppercase">Xếp Loại</span>
            <div className="text-base font-bold text-slate-800 mt-1.5">
              {rank.text}
            </div>
            <span className="text-[10px] text-slate-500">Thông tư 22</span>
          </div>
        </div>

        {/* Breakdown of Math Scores */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Chi tiết các đầu điểm kiểm tra Toán:
          </h4>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center text-xs">
            <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-slate-500 block">Miệng (Tx1)</span>
              <strong className="text-sm font-bold text-slate-800">{student.tx1 ?? '-'}</strong>
            </div>
            <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-slate-500 block">15p - 1 (Tx2)</span>
              <strong className="text-sm font-bold text-slate-800">{student.tx2 ?? '-'}</strong>
            </div>
            <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-slate-500 block">15p - 2 (Tx3)</span>
              <strong className="text-sm font-bold text-slate-800">{student.tx3 ?? '-'}</strong>
            </div>
            <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-slate-500 block">Dự án (Tx4)</span>
              <strong className="text-sm font-bold text-slate-800">{student.tx4 ?? '-'}</strong>
            </div>
            <div className="p-2 rounded-lg bg-amber-50 border border-amber-200">
              <span className="text-[10px] text-amber-700 block">Giữa kỳ (GK)</span>
              <strong className="text-sm font-bold text-amber-900">{student.gk ?? '-'}</strong>
            </div>
            <div className="p-2 rounded-lg bg-orange-50 border border-orange-200">
              <span className="text-[10px] text-orange-700 block">Cuối kỳ (CK)</span>
              <strong className="text-sm font-bold text-orange-900">{student.ck ?? '-'}</strong>
            </div>
          </div>
        </div>

        {/* Teacher Notes */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Nhận xét sư phạm của giáo viên:
            </h4>
            {isTeacherMode && (
              <button
                onClick={handleSaveNotes}
                className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isSavedNotes ? '✓ Đã lưu' : 'Lưu ghi chú'}</span>
              </button>
            )}
          </div>
          <textarea
            rows={2}
            value={notes}
            disabled={!isTeacherMode}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Nhận xét ưu điểm, mặt cần khắc phục của học sinh..."
            className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white resize-y"
          />
        </div>

        {/* Behavior History Timeline */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span>Lịch sử đánh giá hành vi ({studentBehaviors.length})</span>
          </h4>

          <div className="max-h-48 overflow-y-auto divide-y divide-slate-100 border border-slate-100 rounded-xl p-2 bg-slate-50/50">
            {studentBehaviors.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-400">
                Chưa có ghi nhận hành vi nào cho học sinh này.
              </div>
            ) : (
              studentBehaviors.map(b => (
                <div key={b.id} className="py-2 px-2 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                      b.points > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {b.points > 0 ? `+${b.points}đ` : `${b.points}đ`}
                    </span>
                    <span className="text-slate-700 font-medium">{b.reason}</span>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    {new Date(b.timestamp).toLocaleDateString('vi-VN')}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Close Button */}
        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
