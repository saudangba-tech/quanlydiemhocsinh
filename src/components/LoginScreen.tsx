import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Sparkles, LogIn } from 'lucide-react';

export const LoginScreen: React.FC = () => {
  const { login } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-400/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-amber-400/20 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-md w-full bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 sm:p-10 relative z-10 border border-white/50 text-center animate-scale-up">
        <div className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-500/30 mb-6">
          <i className="fa-solid fa-square-root-variable text-4xl"></i>
        </div>
        
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-2">MathClass Pro</h1>
        <p className="text-slate-500 text-sm mb-8">
          Nền tảng quản lý điểm số & đánh giá hành vi môn Toán THPT trên Đám mây.
        </p>

        <button
          onClick={login}
          className="w-full flex items-center justify-center gap-3 py-3.5 px-4 bg-white border border-slate-200 hover:bg-slate-50 hover:border-blue-300 rounded-xl text-sm font-semibold text-slate-700 shadow-sm transition-all group"
        >
          <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5 group-hover:scale-110 transition-transform" />
          <span>Đăng nhập bằng Google</span>
        </button>

        <div className="mt-8 flex items-center justify-center gap-1.5 text-xs font-medium text-emerald-600 bg-emerald-50 py-2 px-4 rounded-full w-max mx-auto border border-emerald-100">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Dữ liệu đồng bộ thời gian thực</span>
        </div>
      </div>
    </div>
  );
};
