import React, { useState } from 'react';
import { ClassRoom } from '../types';
import { getCurrentSchoolYear } from '../utils/schoolYear';
import { X, PlusCircle, Save } from 'lucide-react';

interface AddClassModalProps {
  onClose: () => void;
  onAddClass: (newClass: ClassRoom) => void;
}

export const AddClassModal: React.FC<AddClassModalProps> = ({
  onClose,
  onAddClass
}) => {
  const [name, setName] = useState('');
  const [grade, setGrade] = useState<10 | 11 | 12>(12);
  const [schoolYear, setSchoolYear] = useState(getCurrentSchoolYear());
  const [teacherName, setTeacherName] = useState('Thầy Nguyễn Văn Nam');
  const [room, setRoom] = useState('Phòng 301 - Nhà A');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Vui lòng nhập tên lớp học!');
      return;
    }

    const newClass: ClassRoom = {
      id: 'class-' + Date.now(),
      name: name.trim(),
      grade,
      schoolYear: schoolYear.trim(),
      teacherName: teacherName.trim(),
      room: room.trim()
    };

    onAddClass(newClass);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-2xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-xl p-6 space-y-5 animate-scale-up">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <PlusCircle className="w-5 h-5 text-blue-600" />
            <h2 className="font-bold text-base text-slate-800">Thêm Lớp Học Mới</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="space-y-1">
            <label className="font-semibold text-slate-700 block">Tên lớp học *</label>
            <input
              type="text"
              required
              placeholder="Ví dụ: 12A2, 11C1..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700 block">Khối lớp</label>
              <select
                value={grade}
                onChange={(e) => setGrade(Number(e.target.value) as 10 | 11 | 12)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              >
                <option value={10}>Khối 10</option>
                <option value={11}>Khối 11</option>
                <option value={12}>Khối 12</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700 block">Năm học</label>
              <input
                type="text"
                value={schoolYear}
                onChange={(e) => setSchoolYear(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-700 block">Giáo viên bộ môn / Chủ nhiệm</label>
            <input
              type="text"
              value={teacherName}
              onChange={(e) => setTeacherName(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-700 block">Phòng học</label>
            <input
              type="text"
              placeholder="Ví dụ: Phòng 201 - Nhà B"
              value={room}
              onChange={(e) => setRoom(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
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
              <span>Tạo lớp học</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
