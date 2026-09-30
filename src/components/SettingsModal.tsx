import React, { useState } from 'react';
import { AppSettings } from '../types';
import { storage } from '../services/storage';
import { 
  X, 
  Key, 
  Eye, 
  EyeOff, 
  Save, 
  Download, 
  Upload, 
  RotateCcw, 
  Check, 
  Sparkles, 
  Cpu, 
  Volume2, 
  ShieldCheck,
  FileJson
} from 'lucide-react';

interface SettingsModalProps {
  settings: AppSettings;
  onSaveSettings: (settings: AppSettings) => void;
  onClose: () => void;
  onResetData: () => void;
  onImportData: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  onSaveSettings,
  onClose,
  onResetData,
  onImportData
}) => {
  const [apiKey, setApiKey] = useState(settings.apiKey || '');
  const [showKey, setShowKey] = useState(false);
  const [model, setModel] = useState(settings.selectedModel || 'gemini-3-flash-preview');
  const [soundEnabled, setSoundEnabled] = useState(settings.soundEnabled);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = () => {
    onSaveSettings({
      ...settings,
      apiKey,
      selectedModel: model,
      soundEnabled
    });
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 800);
  };

  const handleExportBackup = () => {
    const jsonStr = storage.exportFullBackup();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Sao_Luu_MathClassPro_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const ok = storage.importFullBackup(content);
        if (ok) {
          alert('Khôi phục dữ liệu thành công!');
          onImportData();
          onClose();
        } else {
          alert('Tệp dữ liệu không hợp lệ!');
        }
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-2xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 space-y-6 animate-scale-up">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-base text-slate-800">Cài Đặt Hệ Thống & Gemini AI</h2>
              <p className="text-xs text-slate-500">Cấu hình API Key, AI Models và Sao lưu dữ liệu</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Section 1: Gemini AI Config */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Key className="w-3.5 h-3.5 text-blue-600" />
            <span>Cấu hình Gemini API Key</span>
          </h3>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 block">
              Google Gemini API Key (Tùy chọn):
            </label>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                placeholder="Nhập API Key nếu bạn có key riêng (hoặc để trống để dùng key mặc định từ server)"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full pl-3 pr-10 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[11px] text-slate-500 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Nếu server đã cấu hình GEMINI_API_KEY, bạn có thể để trống và sử dụng ngay lập tức.</span>
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 block">
              Mô hình AI (Model):
            </label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="gemini-3-flash-preview">gemini-3-flash-preview (Mặc định: Nhanh, tối ưu Toán THPT)</option>
              <option value="gemini-3-pro-preview">gemini-3-pro-preview (Lý luận sâu, toán chuyên & vận dụng cao)</option>
              <option value="gemini-2.5-flash">gemini-2.5-flash (Dự phòng)</option>
            </select>
          </div>
        </div>

        {/* Section 2: App Preferences */}
        <div className="space-y-3 pt-3 border-t border-slate-100">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Volume2 className="w-3.5 h-3.5 text-slate-600" />
            <span>Tùy chọn trải nghiệm</span>
          </h3>

          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
            <div>
              <div className="text-xs font-bold text-slate-800">Âm thanh hiệu ứng trong lớp học</div>
              <div className="text-[11px] text-slate-500">Phát âm thanh ting ting khi cộng điểm, nhắc nhở khi trừ điểm</div>
            </div>
            <input
              type="checkbox"
              checked={soundEnabled}
              onChange={(e) => setSoundEnabled(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
            />
          </div>
        </div>

        {/* Section 3: Data Management */}
        <div className="space-y-3 pt-3 border-t border-slate-100">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <FileJson className="w-3.5 h-3.5 text-slate-600" />
            <span>Quản lý dữ liệu & Sao lưu</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <button
              onClick={handleExportBackup}
              className="flex items-center justify-center gap-2 p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 font-semibold text-slate-700 transition-colors"
            >
              <Download className="w-4 h-4 text-blue-600" />
              <span>Xuất bản sao lưu (JSON)</span>
            </button>

            <label className="flex items-center justify-center gap-2 p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 font-semibold text-slate-700 cursor-pointer transition-colors">
              <Upload className="w-4 h-4 text-emerald-600" />
              <span>Nhập file sao lưu (JSON)</span>
              <input
                type="file"
                accept=".json"
                onChange={handleImportFile}
                className="hidden"
              />
            </label>
          </div>

          <button
            onClick={() => {
              if (confirm('Bạn có chắc muốn khôi phục dữ liệu ban đầu không? Các thay đổi sẽ được đưa về dữ liệu mẫu chuẩn.')) {
                onResetData();
                onClose();
              }
            }}
            className="w-full flex items-center justify-center gap-1.5 p-2 rounded-xl text-rose-600 hover:bg-rose-50 text-xs font-medium transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Khôi phục dữ liệu mẫu ban đầu</span>
          </button>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
          >
            Hủy
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-2xs transition-colors"
          >
            {savedSuccess ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            <span>{savedSuccess ? 'Đã lưu cài đặt!' : 'Lưu cài đặt'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
