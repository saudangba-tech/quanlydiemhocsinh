import React, { useState } from 'react';
import { Student } from '../types';
import { X, UserPlus, Save } from 'lucide-react';

interface AddStudentModalProps {
  classId: string;
  classNameStr: string;
  onClose: () => void;
  onAddStudent: (student: Student) => void;
}

export const AddStudentModal: React.FC<AddStudentModalProps> = ({
  classId,
  classNameStr,
  onClose,
  onAddStudent
}) => {
  const [name, setName] = useState('');
  const [code, setCode] = useState('HS-' + Math.floor(1000 + Math.random() * 9000));
  const [gender, setGender] = useState<'nam' | 'nữ'>('nam');
  const [role, setRole] = useState<Student['role']>('Học sinh');
  const [parentName, setParentName] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [notes, setNotes] = useState('');

  const avatarsMale = [
    'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80'
  ];

  const avatarsFemale = [
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80'
  ];

  const [selectedAvatar, setSelectedAvatar] = useState(
    gender === 'nam' ? avatarsMale[0] : avatarsFemale[0]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Vui lòng nhập họ và tên học sinh!');
      return;
    }

    const newStudent: Student = {
      id: 'hs-' + Date.now(),
      classId,
      name: name.trim(),
      code: code.trim(),
      gender,
      avatar: selectedAvatar,
      role,
      parentName: parentName.trim() || 'Phụ huynh em ' + name.trim(),
      parentPhone: parentPhone.trim() || '0901234567',
      tx1: null,
      tx2: null,
      tx3: null,
      tx4: null,
      gk: null,
      ck: null,
      behaviorScore: 100,
      starCount: 5,
      notes: notes.trim()
    };

    onAddStudent(newStudent);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-2xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-xl p-6 space-y-5 animate-scale-up">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-blue-600" />
            <h2 className="font-bold text-base text-slate-800">Thêm Học Sinh Vào Lớp {classNameStr}</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="space-y-1">
            <label className="font-semibold text-slate-700 block">Họ và tên học sinh *</label>
            <input
              type="text"
              required
              placeholder="Ví dụ: Nguyễn Văn An"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700 block">Mã học sinh</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700 block">Giới tính</label>
              <select
                value={gender}
                onChange={(e) => {
                  const g = e.target.value as 'nam' | 'nữ';
                  setGender(g);
                  setSelectedAvatar(g === 'nam' ? avatarsMale[0] : avatarsFemale[0]);
                }}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              >
                <option value="nam">Nam</option>
                <option value="nữ">Nữ</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-700 block">Chức vụ trong lớp</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as Student['role'])}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
            >
              <option value="Học sinh">Học sinh</option>
              <option value="Lớp trưởng">Lớp trưởng</option>
              <option value="Lớp phó">Lớp phó</option>
              <option value="Cán sự Toán">Cán sự Toán</option>
              <option value="Tổ trưởng">Tổ trưởng</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700 block">Họ tên Phụ huynh</label>
              <input
                type="text"
                placeholder="Ví dụ: Bác Nguyễn Văn Ba"
                value={parentName}
                onChange={(e) => setParentName(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700 block">Số điện thoại Phụ huynh</label>
              <input
                type="tel"
                placeholder="Ví dụ: 0912345678"
                value={parentPhone}
                onChange={(e) => setParentPhone(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-700 block">Chọn ảnh đại diện</label>
            <div className="flex gap-2">
              {(gender === 'nam' ? avatarsMale : avatarsFemale).map((av, idx) => (
                <img
                  key={idx}
                  src={av}
                  alt="avatar"
                  onClick={() => setSelectedAvatar(av)}
                  className={`w-11 h-11 rounded-xl object-cover cursor-pointer border-2 transition-all ${
                    selectedAvatar === av ? 'border-blue-600 scale-105 shadow-xs' : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-700 block">Ghi chú ban đầu của giáo viên</label>
            <textarea
              rows={2}
              placeholder="Đặc điểm học tập, ưu điểm nổi bật..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-2xs"
            >
              <Save className="w-4 h-4" />
              <span>Thêm học sinh</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
