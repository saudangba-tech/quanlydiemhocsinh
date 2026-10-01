import React, { useRef, useState } from 'react';
import { ClassRoom, Student } from '../types';
import { importStudentsFromFile, downloadStudentTemplate } from '../utils/importStudents';
import { 
  GraduationCap, 
  Settings, 
  Sparkles, 
  Users, 
  TableProperties, 
  BarChart3, 
  Trophy, 
  Send, 
  Bot, 
  PenTool, 
  PlusCircle, 
  Volume2, 
  VolumeX,
  UserCheck,
  Upload,
  Download
} from 'lucide-react';

interface HeaderProps {
  classes: ClassRoom[];
  selectedClassId: string;
  onSelectClass: (id: string) => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onOpenSettings: () => void;
  onAddStudent: () => void;
  onAddStudents?: (students: Student[]) => void;
  onAddClass: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  isTeacherMode: boolean;
  onToggleRoleMode: () => void;
  hasApiKey: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  classes,
  selectedClassId,
  onSelectClass,
  activeTab,
  onTabChange,
  onOpenSettings,
  onAddStudent,
  onAddStudents,
  onAddClass,
  soundEnabled,
  onToggleSound,
  isTeacherMode,
  onToggleRoleMode,
  hasApiKey
}) => {
  const currentClass = classes.find(c => c.id === selectedClassId) || classes[0];
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isImporting, setIsImporting] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsImporting(true);
      const students = await importStudentsFromFile(file, selectedClassId);
      if (students.length > 0) {
        onAddStudents?.(students);
        alert(`Đã nhập thành công ${students.length} học sinh!`);
      } else {
        alert('Không tìm thấy dữ liệu học sinh hợp lệ trong file.');
      }
    } catch (err: any) {
      alert(`Lỗi khi nhập file: ${err.message}`);
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const navItems = [
    { id: 'live', label: 'Đánh giá tức thì', icon: Sparkles },
    { id: 'gradebook', label: 'Sổ điểm điện tử', icon: TableProperties },
    { id: 'analytics', label: 'Thống kê & Biểu đồ', icon: BarChart3 },
    { id: 'halloffame', label: 'Bảng vinh danh', icon: Trophy },
    { id: 'parents', label: 'Báo cáo Phụ huynh', icon: Send },
    { id: 'ai', label: 'Trợ lý AI Toán', icon: Bot },
    { id: 'practice', label: 'Luyện đề trắc nghiệm', icon: PenTool },
  ];

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      {/* Brand & Top Action Bar */}
      <div className="bg-gradient-to-r from-[#4A90E2] via-[#617eea] to-[#FF9500] text-white px-4 py-2.5 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Logo & Subtitle */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white shadow-inner font-bold text-lg">
              <i className="fa-solid fa-square-root-variable text-xl"></i>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
                  MathClass Pro
                </h1>
                <span className="text-[11px] font-medium bg-white/20 px-2 py-0.5 rounded text-white/95">
                  THPT
                </span>
              </div>
              <p className="text-xs text-white/85 hidden sm:block">
                Quản lý điểm số & Kỷ luật lớp học Toán THPT thời gian thực
              </p>
            </div>
          </div>

          {/* Quick Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Mode switch */}
            <button
              onClick={onToggleRoleMode}
              title={isTeacherMode ? "Chuyển sang chế độ xem Học sinh" : "Chuyển sang chế độ Giáo viên"}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                isTeacherMode 
                  ? 'bg-white/20 hover:bg-white/30 text-white' 
                  : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-xs'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>{isTeacherMode ? 'Chế độ Giáo viên' : 'Chế độ Học sinh'}</span>
            </button>

            {/* Sound toggle */}
            <button
              onClick={onToggleSound}
              title={soundEnabled ? "Tắt âm thanh hiệu ứng" : "Bật âm thanh hiệu ứng"}
              className="p-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-white transition-colors"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Settings button */}
            <div className="flex items-center gap-2">
              {!hasApiKey && (
                <span className="text-xs font-bold text-rose-500 bg-white/90 px-2 py-1 rounded animate-pulse shadow-sm">
                  Lấy API key để sử dụng app
                </span>
              )}
              <button
                onClick={onOpenSettings}
                title="Cài đặt & API Key Gemini"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white text-xs font-medium transition-colors"
              >
                <Settings className="w-4 h-4" />
                <span className="hidden sm:inline">Cài đặt (API Key)</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Class Selector Bar & Actions */}
      <div className="max-w-7xl mx-auto px-4 py-2 sm:px-6 flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/70">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Lớp học:</span>
            <select
              value={selectedClassId}
              onChange={(e) => onSelectClass(e.target.value)}
              className="bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-sm font-semibold text-slate-800 shadow-2xs hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {classes.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.room})
                </option>
              ))}
            </select>
          </div>

          <div className="hidden md:flex items-center gap-2 text-xs text-slate-500">
            <span>GV: <strong className="text-slate-700">{currentClass?.teacherName}</strong></span>
            <span>·</span>
            <span>Năm học: <strong className="text-slate-700">{currentClass?.schoolYear}</strong></span>
          </div>

          {isTeacherMode && (
            <button
              onClick={onAddClass}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 hover:underline"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              Thêm lớp
            </button>
          )}
        </div>

        {isTeacherMode && (
          <div className="flex items-center gap-2">
            <button
              onClick={downloadStudentTemplate}
              title="Tải file mẫu CSV"
              className="flex items-center justify-center p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-200"
            >
              <Download className="w-4 h-4" />
            </button>
            <input
              type="file"
              accept=".csv,.json"
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileChange}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isImporting}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{isImporting ? 'Đang nhập...' : 'Nhập từ file'}</span>
            </button>
            <button
              onClick={onAddStudent}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors"
            >
              <Users className="w-3.5 h-3.5" />
              <span>Thêm học sinh</span>
            </button>
          </div>
        )}
      </div>

      {/* Primary Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-2 sm:px-6 overflow-x-auto scrollbar-none">
        <nav className="flex space-x-1 sm:space-x-2 py-1.5" aria-label="Tabs">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`flex items-center gap-2 px-3 py-2 text-xs sm:text-sm font-medium rounded-lg whitespace-nowrap transition-all duration-150 ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 font-semibold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
