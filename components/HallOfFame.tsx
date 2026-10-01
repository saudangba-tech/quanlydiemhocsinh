import React, { useState } from 'react';
import { Student } from '../types';
import { calculateMathGPA } from '../services/storage';
import { sound } from '../services/sound';
import { fireConfetti } from '../utils/mathjax';
import { 
  Trophy, 
  Medal, 
  Sparkles, 
  Star, 
  Award, 
  Flame, 
  Crown,
  Zap,
  TrendingUp,
  Volume2,
  Presentation
} from 'lucide-react';
import pptxgen from "pptxgenjs";

interface HallOfFameProps {
  students: Student[];
  selectedClassId: string;
  classNameStr: string;
  onOpenStudentDetail: (student: Student) => void;
}

export const HallOfFame: React.FC<HallOfFameProps> = ({
  students,
  selectedClassId,
  classNameStr,
  onOpenStudentDetail
}) => {
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'semester'>('week');

  const classStudents = students.filter(s => s.classId === selectedClassId);

  // Composite competition score: (Behavior Score) + (GPA * 10)
  const rankedStudents = [...classStudents].map(s => {
    const gpa = calculateMathGPA(s) ?? 0;
    // Composite points
    const totalPoints = s.behaviorScore + Math.round(gpa * 10);
    return {
      student: s,
      gpa,
      totalPoints
    };
  }).sort((a, b) => b.totalPoints - a.totalPoints);

  const top1 = rankedStudents[0];
  const top2 = rankedStudents[1];
  const top3 = rankedStudents[2];
  const others = rankedStudents.slice(3);

  // Trigger celebration fanfare
  const handleCelebrate = () => {
    sound.playFanfare();
    fireConfetti();
  };

  const exportToPPT = () => {
    let pres = new pptxgen();
    let slide = pres.addSlide();
    
    // Add title
    slide.addText(`Bảng Vinh Danh - Lớp ${classNameStr}`, { x: 1, y: 0.5, w: 8, h: 1, fontSize: 32, bold: true, align: "center", color: "d97706" });
    
    // Add Top 3
    if (top1) {
      slide.addText(`🥇 Hạng 1: ${top1.student.name} - Tổng điểm: ${top1.totalPoints}`, { x: 1, y: 2.0, w: 8, h: 0.8, fontSize: 24, bold: true, color: "b45309" });
    }
    if (top2) {
      slide.addText(`🥈 Hạng 2: ${top2.student.name} - Tổng điểm: ${top2.totalPoints}`, { x: 1, y: 3.0, w: 8, h: 0.8, fontSize: 20, color: "475569" });
    }
    if (top3) {
      slide.addText(`🥉 Hạng 3: ${top3.student.name} - Tổng điểm: ${top3.totalPoints}`, { x: 1, y: 4.0, w: 8, h: 0.8, fontSize: 20, color: "b45309" });
    }
    
    // Add full list on next slide
    const rows = rankedStudents.map((item, idx) => {
      return [
        { text: String(idx + 1) },
        { text: item.student.name },
        { text: String(item.totalPoints) },
        { text: String(item.gpa.toFixed(1)) }
      ];
    });
    rows.unshift([{text:"Hạng", options:{bold:true}}, {text:"Học sinh", options:{bold:true}}, {text:"Điểm thi đua", options:{bold:true}}, {text:"ĐTB", options:{bold:true}}]);
    
    let slide2 = pres.addSlide();
    slide2.addText(`Danh sách thi đua chi tiết`, { x: 0.5, y: 0.3, w: 9, h: 0.5, fontSize: 20, bold: true });
    slide2.addTable(rows, { x: 0.5, y: 1.0, w: 9, colW: [1, 4, 2, 2], border: {pt: 1, color: "CCCCCC"} });
    
    pres.writeFile({ fileName: `Bang_Vinh_Danh_${classNameStr}.pptx` });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-5 sm:px-6 space-y-6">
      {/* Top Banner with Celebration Action */}
      <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 rounded-2xl p-6 text-white shadow-md flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-200 text-xs font-bold uppercase tracking-wider">
            <Trophy className="w-4 h-4" />
            <span>Bảng Vinh Danh & Thi Đua Toán THPT</span>
          </div>
          <h2 className="text-2xl font-black mt-1">Ngôi Sao Toán Học Lớp {classNameStr}</h2>
          <p className="text-xs text-amber-100 mt-1 max-w-xl">
            Vinh danh những học sinh xuất sắc nhất kết hợp giữa năng lực học tập Toán và tinh thần rèn luyện kỷ luật lớp học.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Timeframe switch */}
          <div className="flex items-center bg-black/20 backdrop-blur-xs p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setTimeframe('week')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${timeframe === 'week' ? 'bg-white text-amber-900 shadow-2xs' : 'text-white/80 hover:text-white'}`}
            >
              Tuần này
            </button>
            <button
              onClick={() => setTimeframe('month')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${timeframe === 'month' ? 'bg-white text-amber-900 shadow-2xs' : 'text-white/80 hover:text-white'}`}
            >
              Tháng này
            </button>
            <button
              onClick={() => setTimeframe('semester')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${timeframe === 'semester' ? 'bg-white text-amber-900 shadow-2xs' : 'text-white/80 hover:text-white'}`}
            >
              Học kỳ
            </button>
          </div>

          <button
            onClick={exportToPPT}
            className="flex items-center gap-2 px-4 py-2.5 bg-orange-700/80 hover:bg-orange-800 text-white rounded-xl text-xs font-bold shadow-md transition-transform active:scale-95 border border-orange-500/50"
          >
            <Presentation className="w-4 h-4" />
            <span>Xuất Slides (PPT)</span>
          </button>

          <button
            onClick={handleCelebrate}
            className="flex items-center gap-2 px-4 py-2.5 bg-white text-amber-700 hover:bg-amber-50 rounded-xl text-xs font-bold shadow-md transition-transform active:scale-95"
          >
            <Sparkles className="w-4 h-4 text-amber-500 fill-amber-400" />
            <span>Vinh danh trước lớp</span>
          </button>
        </div>
      </div>

      {/* Top 3 Podium (Bục vinh quang 3 ngôi sao cao nhất) */}
      {rankedStudents.length >= 3 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 items-end max-w-4xl mx-auto">
          {/* Top 2 - Bạc */}
          <div className="order-2 sm:order-1 bg-white rounded-2xl border-2 border-slate-200 p-5 shadow-2xs text-center flex flex-col items-center relative transition-transform hover:-translate-y-1">
            <div className="absolute -top-4 w-8 h-8 rounded-full bg-slate-300 text-slate-800 font-extrabold flex items-center justify-center text-sm shadow-xs border-2 border-white">
              2
            </div>
            <img
              src={top2.student.avatar}
              alt={top2.student.name}
              onClick={() => onOpenStudentDetail(top2.student)}
              className="w-16 h-16 rounded-full object-cover border-3 border-slate-300 shadow-xs cursor-pointer hover:opacity-95"
            />
            <h3 
              onClick={() => onOpenStudentDetail(top2.student)}
              className="font-bold text-sm text-slate-800 mt-2.5 hover:text-blue-600 cursor-pointer"
            >
              {top2.student.name}
            </h3>
            <span className="text-xs text-slate-500 font-medium">{top2.student.code}</span>

            <div className="mt-3 flex items-center gap-1.5 text-xs">
              <span className="font-bold text-slate-700">ĐTB: {top2.gpa.toFixed(1)}</span>
              <span>·</span>
              <span className="font-semibold text-emerald-600">{top2.student.behaviorScore}đ RL</span>
            </div>

            <div className="mt-2 text-[11px] bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full font-semibold flex items-center gap-1">
              <Medal className="w-3.5 h-3.5 text-slate-400" />
              <span>Bạc · {top2.student.starCount} ⭐</span>
            </div>
          </div>

          {/* Top 1 - Vàng (Cao nhất) */}
          <div className="order-1 sm:order-2 bg-gradient-to-b from-amber-50 to-white rounded-2xl border-2 border-amber-400 p-6 shadow-md text-center flex flex-col items-center relative -translate-y-2 transition-transform hover:-translate-y-3">
            <div className="absolute -top-6 w-11 h-11 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 text-amber-950 font-black flex items-center justify-center text-base shadow-sm border-2 border-white">
              <Crown className="w-6 h-6 text-amber-900 fill-amber-400" />
            </div>
            <img
              src={top1.student.avatar}
              alt={top1.student.name}
              onClick={() => onOpenStudentDetail(top1.student)}
              className="w-20 h-20 rounded-full object-cover border-4 border-amber-400 shadow-md cursor-pointer hover:opacity-95 mt-1"
            />
            <div className="text-[10px] uppercase tracking-wider font-extrabold text-amber-600 mt-2">
              Quán quân tuần
            </div>
            <h3 
              onClick={() => onOpenStudentDetail(top1.student)}
              className="font-extrabold text-base text-slate-900 hover:text-amber-600 cursor-pointer"
            >
              {top1.student.name}
            </h3>
            <span className="text-xs text-slate-500 font-medium">{top1.student.code} · {top1.student.role}</span>

            <div className="mt-3 flex items-center gap-2 text-xs">
              <span className="font-bold text-amber-800">ĐTB: {top1.gpa.toFixed(1)}</span>
              <span>·</span>
              <span className="font-bold text-emerald-600">{top1.student.behaviorScore}đ RL</span>
            </div>

            <div className="mt-2.5 text-xs bg-amber-100 text-amber-900 px-3 py-1 rounded-full font-bold flex items-center gap-1 shadow-2xs">
              <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
              <span>Huy hiệu Ngôi Sao Vàng · {top1.student.starCount} ⭐</span>
            </div>
          </div>

          {/* Top 3 - Đồng */}
          <div className="order-3 bg-white rounded-2xl border-2 border-orange-200 p-5 shadow-2xs text-center flex flex-col items-center relative transition-transform hover:-translate-y-1">
            <div className="absolute -top-4 w-8 h-8 rounded-full bg-amber-600 text-white font-extrabold flex items-center justify-center text-sm shadow-xs border-2 border-white">
              3
            </div>
            <img
              src={top3.student.avatar}
              alt={top3.student.name}
              onClick={() => onOpenStudentDetail(top3.student)}
              className="w-16 h-16 rounded-full object-cover border-3 border-amber-600 shadow-xs cursor-pointer hover:opacity-95"
            />
            <h3 
              onClick={() => onOpenStudentDetail(top3.student)}
              className="font-bold text-sm text-slate-800 mt-2.5 hover:text-blue-600 cursor-pointer"
            >
              {top3.student.name}
            </h3>
            <span className="text-xs text-slate-500 font-medium">{top3.student.code}</span>

            <div className="mt-3 flex items-center gap-1.5 text-xs">
              <span className="font-bold text-slate-700">ĐTB: {top3.gpa.toFixed(1)}</span>
              <span>·</span>
              <span className="font-semibold text-emerald-600">{top3.student.behaviorScore}đ RL</span>
            </div>

            <div className="mt-2 text-[11px] bg-amber-50 text-amber-800 px-2.5 py-0.5 rounded-full font-semibold flex items-center gap-1">
              <Medal className="w-3.5 h-3.5 text-amber-600" />
              <span>Đồng · {top3.student.starCount} ⭐</span>
            </div>
          </div>
        </div>
      )}

      {/* Bảng Xếp Hạng Đầy Đủ (Full Leaderboard Table) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-orange-500" />
            <h3 className="font-bold text-sm text-slate-800">Bảng Xếp Hạng Thi Đua Toàn Lớp</h3>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            Điểm thi đua = Điểm rèn luyện + (ĐTBm × 10)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 font-bold text-slate-800 uppercase text-[11px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 text-center w-14">Hạng</th>
                <th className="py-3 px-4">Học sinh</th>
                <th className="py-3 px-4 text-center">ĐTB môn Toán</th>
                <th className="py-3 px-4 text-center">Điểm rèn luyện</th>
                <th className="py-3 px-4 text-center">Sao danh dự</th>
                <th className="py-3 px-4 text-center font-extrabold text-amber-900">Tổng điểm thi đua</th>
                <th className="py-3 px-4">Danh hiệu đạt được</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rankedStudents.map((item, idx) => {
                const s = item.student;
                let badgeTitle = 'Chiến binh Toán';
                if (idx === 0) badgeTitle = '👑 Trạng Nguyên Toán Học';
                else if (idx === 1) badgeTitle = '🥈 Bảng Nhãn Xuất Sắc';
                else if (idx === 2) badgeTitle = '🥉 Thám Hoa Năng Động';
                else if (item.gpa >= 9.0) badgeTitle = '⚡ Kiện tướng Hình học & Đại số';
                else if (s.behaviorScore >= 110) badgeTitle = '🌟 Gương mẫu Kỷ luật';
                else if (s.starCount >= 8) badgeTitle = '🔥 Ngôi sao Chăm chỉ';

                return (
                  <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 text-center font-bold">
                      {idx === 0 && <span className="text-amber-500 font-black text-sm">#1</span>}
                      {idx === 1 && <span className="text-slate-400 font-black text-sm">#2</span>}
                      {idx === 2 && <span className="text-amber-700 font-black text-sm">#3</span>}
                      {idx > 2 && <span className="text-slate-400">#{idx + 1}</span>}
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={s.avatar}
                          alt={s.name}
                          className="w-7 h-7 rounded-full object-cover border border-slate-200"
                        />
                        <div>
                          <button
                            onClick={() => onOpenStudentDetail(s)}
                            className="font-bold text-slate-800 hover:text-blue-600 text-left cursor-pointer"
                          >
                            {s.name}
                          </button>
                          <div className="text-[11px] text-slate-400">{s.code} · {s.role}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-center font-bold text-blue-700">
                      {item.gpa > 0 ? item.gpa.toFixed(1) : '-'}
                    </td>

                    <td className="py-3 px-4 text-center font-bold text-emerald-600">
                      {s.behaviorScore}
                    </td>

                    <td className="py-3 px-4 text-center font-semibold text-amber-600">
                      {s.starCount} ⭐
                    </td>

                    <td className="py-3 px-4 text-center font-extrabold text-amber-800 text-sm">
                      {item.totalPoints}
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-full text-[11px]">
                        {badgeTitle}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
