import React, { useState } from 'react';
import { AppSettings } from '../types';
import { storage } from '../services/storage';
import { isValidGoogleAiApiKey } from '../services/gemini';
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
  FileJson,
  AlertTriangle
} from 'lucide-react';

// Danh sách model Gemini API (GA/stable)
const GEMINI_API_MODELS = [
  { value: 'gemini-3.6-flash', label: 'gemini-3.6-flash (Mặc định — Mới nhất, tối ưu Toán THPT)' },
  { value: 'gemini-3.5-flash', label: 'gemini-3.5-flash (Dự phòng chất lượng cao)' },
  { value: 'gemini-3.5-flash-lite', label: 'gemini-3.5-flash-lite (Nhanh, chi phí thấp)' },
  { value: 'gemini-3.1-flash-lite', label: 'gemini-3.1-flash-lite (Tương thích ngược)' },
  { value: 'gemini-2.5-pro', label: 'gemini-2.5-pro (Suy luận mạnh — Phân tích giáo án)' },
  { value: 'gemini-2.5-flash', label: 'gemini-2.5-flash (Dự phòng cuối chuỗi)' },
];

// Danh sách model Agent Platform API
const AGENT_PLATFORM_MODELS = [
  { value: 'gemini-2.5-flash', label: 'gemini-2.5-flash (Mặc định Agent Platform)' },
  { value: 'gemini-2.5-flash-lite', label: 'gemini-2.5-flash-lite (Chi phí thấp)' },
  { value: 'gemini-2.5-pro', label: 'gemini-2.5-pro (Suy luận mạnh)' },
  { value: 'gemini-3.1-pro-preview', label: 'gemini-3.1-pro-preview (Preview)' },
];

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
  const [provider, setProvider] = useState<'gemini' | 'agent-platform'>(settings.aiProvider || 'gemini');
  const [geminiKey, setGeminiKey] = useState(settings.apiKey || '');
  const [agentPlatformKey, setAgentPlatformKey] = useState(settings.agentPlatformApiKey || '');
  const [showKey, setShowKey] = useState(false);
  const [model, setModel] = useState(settings.selectedModel || 'gemini-3.6-flash');
  const [soundEnabled, setSoundEnabled] = useState(settings.soundEnabled);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [keyError, setKeyError] = useState('');

  // Key hiện tại theo provider đang chọn
  const currentKey = provider === 'gemini' ? geminiKey : agentPlatformKey;
  const setCurrentKey = provider === 'gemini' ? setGeminiKey : setAgentPlatformKey;
  const currentModels = provider === 'gemini' ? GEMINI_API_MODELS : AGENT_PLATFORM_MODELS;

  // Khi đổi provider: chuyển model về mặc định nếu model cũ không tương thích
  const handleProviderChange = (newProvider: 'gemini' | 'agent-platform') => {
    setProvider(newProvider);
    const modelList = newProvider === 'gemini' ? GEMINI_API_MODELS : AGENT_PLATFORM_MODELS;
    if (!modelList.some(m => m.value === model)) {
      setModel(modelList[0].value);
    }
    setKeyError('');
  };

  // Validate key khi nhập
  const handleKeyChange = (value: string) => {
    setCurrentKey(value);
    if (value.trim() && !isValidGoogleAiApiKey(value)) {
      setKeyError('API Key phải bắt đầu bằng AIzaSy... hoặc AQ... và dài ít nhất 10 ký tự.');
    } else {
      setKeyError('');
    }
  };

  const handleSave = () => {
    // Validate nếu có key
    if (currentKey.trim() && !isValidGoogleAiApiKey(currentKey)) {
      setKeyError('API Key không hợp lệ. Key phải bắt đầu bằng AIzaSy... hoặc AQ...');
      return;
    }

    onSaveSettings({
      ...settings,
      apiKey: geminiKey,
      agentPlatformApiKey: agentPlatformKey,
      aiProvider: provider,
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

        {/* Section 1: Provider Selection */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-blue-600" />
            <span>Chọn nhà cung cấp AI</span>
          </h3>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleProviderChange('gemini')}
              className={`p-3 rounded-xl border-2 text-left transition-all ${
                provider === 'gemini'
                  ? 'border-blue-500 bg-blue-50 shadow-sm'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div className="text-xs font-bold text-slate-800">🔷 Gemini API</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Google AI Studio • Miễn phí</div>
            </button>
            <button
              onClick={() => handleProviderChange('agent-platform')}
              className={`p-3 rounded-xl border-2 text-left transition-all ${
                provider === 'agent-platform'
                  ? 'border-purple-500 bg-purple-50 shadow-sm'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div className="text-xs font-bold text-slate-800">🟣 Agent Platform API</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Google Cloud • Trả phí</div>
            </button>
          </div>
        </div>

        {/* Section 2: API Key */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Key className="w-3.5 h-3.5 text-blue-600" />
            <span>Cấu hình {provider === 'gemini' ? 'Gemini' : 'Agent Platform'} API Key</span>
          </h3>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 block">
              {provider === 'gemini' ? 'Google Gemini' : 'Agent Platform'} API Key:
            </label>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                placeholder="Nhập API Key (AIzaSy... hoặc AQ...)"
                value={currentKey}
                onChange={(e) => handleKeyChange(e.target.value)}
                className={`w-full pl-3 pr-10 py-2.5 text-xs bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:bg-white ${
                  keyError ? 'border-red-300 focus:ring-red-400' : 'border-slate-200 focus:ring-blue-500'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {keyError && (
              <p className="text-[11px] text-red-500 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>{keyError}</span>
              </p>
            )}
            <p className="text-[11px] text-slate-500 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>
                {provider === 'gemini' 
                  ? 'Lấy key tại aistudio.google.com/apikey. Để trống nếu server đã cấu hình.' 
                  : 'Lấy key tại Google Cloud Console (Agent Platform API).'}
              </span>
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
              {currentModels.map(m => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Section 3: App Preferences */}
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

        {/* Section 4: Data Management */}
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
