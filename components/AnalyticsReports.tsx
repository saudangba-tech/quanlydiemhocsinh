import React, { useEffect, useRef, useState } from 'react';
import { Student, BehaviorRecord } from '../types';
import { calculateMathGPA, getAcademicRank } from '../services/storage';
import { aiAnalyzeClass } from '../services/gemini';
import { 
  BarChart3, 
  TrendingUp, 
  Award, 
  AlertCircle, 
  Bot, 
  CheckCircle2, 
  Users,
  Target,
  ScatterChart,
  Sparkles
} from 'lucide-react';
import * as d3 from 'd3';

interface AnalyticsReportsProps {
  students: Student[];
  behaviors: BehaviorRecord[];
  selectedClassId: string;
  classNameStr: string;
  customApiKey?: string;
}

export const AnalyticsReports: React.FC<AnalyticsReportsProps> = ({
  students,
  behaviors,
  selectedClassId,
  classNameStr,
  customApiKey
}) => {
  const classStudents = students.filter(s => s.classId === selectedClassId);
  const classBehaviors = behaviors.filter(b => b.classId === selectedClassId);

  const barChartRef = useRef<HTMLCanvasElement | null>(null);
  const doughnutChartRef = useRef<HTMLCanvasElement | null>(null);
  const behaviorChartRef = useRef<HTMLCanvasElement | null>(null);
  const d3ScatterRef = useRef<SVGSVGElement | null>(null);

  const chartInstances = useRef<any[]>([]);

  // AI Analysis state
  const [aiReport, setAiReport] = useState<string>('');
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [aiError, setAiError] = useState<string>('');

  // 1. Calculate General Metrics
  const gpaList = classStudents
    .map(s => calculateMathGPA(s))
    .filter((g): g is number => g !== null);

  const averageGPA = gpaList.length > 0 
    ? (gpaList.reduce((a, b) => a + b, 0) / gpaList.length).toFixed(1) 
    : '0.0';

  const averageBehavior = classStudents.length > 0
    ? Math.round(classStudents.reduce((a, s) => a + s.behaviorScore, 0) / classStudents.length)
    : 100;

  const goodRankCount = classStudents.filter(s => {
    const gpa = calculateMathGPA(s);
    return gpa !== null && gpa >= 8.0;
  }).length;

  const goodRankPercent = classStudents.length > 0
    ? Math.round((goodRankCount / classStudents.length) * 100)
    : 0;

  const positiveBehaviorsCount = classBehaviors.filter(b => b.points > 0).length;
  const negativeBehaviorsCount = classBehaviors.filter(b => b.points < 0).length;

  // Render Chart.js charts
  useEffect(() => {
    if (typeof window === 'undefined' || !(window as any).Chart) return;
    const Chart = (window as any).Chart;

    // Destroy existing charts
    chartInstances.current.forEach(c => c?.destroy?.());
    chartInstances.current = [];

    // Chart 1: Score Distribution Bar Chart
    if (barChartRef.current) {
      const bins = [0, 0, 0, 0, 0]; // <5.0, 5.0-6.4, 6.5-7.9, 8.0-8.9, 9.0-10.0
      gpaList.forEach(score => {
        if (score < 5.0) bins[0]++;
        else if (score < 6.5) bins[1]++;
        else if (score < 8.0) bins[2]++;
        else if (score < 9.0) bins[3]++;
        else bins[4]++;
      });

      const barChart = new Chart(barChartRef.current, {
        type: 'bar',
        data: {
          labels: ['< 5.0 (Chưa đạt)', '5.0 - 6.4 (Đạt)', '6.5 - 7.9 (Khá)', '8.0 - 8.9 (Giỏi)', '9.0 - 10 (Xuất sắc)'],
          datasets: [{
            label: 'Số lượng học sinh',
            data: bins,
            backgroundColor: [
              '#f43f5e',
              '#94a3b8',
              '#f59e0b',
              '#3b82f6',
              '#10b981'
            ],
            borderRadius: 6,
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            title: {
              display: true,
              text: 'Phổ điểm trung bình môn Toán',
              font: { size: 13, family: 'Be Vietnam Pro', weight: 'bold' },
              color: '#1e293b'
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: { stepSize: 1 }
            }
          }
        }
      });
      chartInstances.current.push(barChart);
    }

    // Chart 2: Academic Rank Doughnut Chart
    if (doughnutChartRef.current) {
      let excellent = 0, good = 0, fair = 0, passed = 0, failed = 0;
      classStudents.forEach(s => {
        const gpa = calculateMathGPA(s);
        if (gpa === null) return;
        if (gpa >= 9.0) excellent++;
        else if (gpa >= 8.0) good++;
        else if (gpa >= 6.5) fair++;
        else if (gpa >= 5.0) passed++;
        else failed++;
      });

      const doughnutChart = new Chart(doughnutChartRef.current, {
        type: 'doughnut',
        data: {
          labels: ['Xuất sắc (>=9)', 'Giỏi (8-8.9)', 'Khá (6.5-7.9)', 'Đạt (5-6.4)', 'Chưa đạt (<5)'],
          datasets: [{
            data: [excellent, good, fair, passed, failed],
            backgroundColor: ['#10b981', '#3b82f6', '#f59e0b', '#64748b', '#ef4444'],
            borderWidth: 2,
            borderColor: '#ffffff'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 11, family: 'Be Vietnam Pro' } } },
            title: {
              display: true,
              text: 'Tỷ lệ xếp loại học lực Toán',
              font: { size: 13, family: 'Be Vietnam Pro', weight: 'bold' },
              color: '#1e293b'
            }
          }
        }
      });
      chartInstances.current.push(doughnutChart);
    }

    // Chart 3: Behavior Category Distribution
    if (behaviorChartRef.current) {
      const categories: Record<string, number> = {
        'Phát biểu': 0,
        'Lên bảng': 0,
        'BTVN': 0,
        'Kỷ luật': 0,
        'Sáng tạo': 0
      };
      classBehaviors.forEach(b => {
        if (categories[b.category] !== undefined) {
          categories[b.category]++;
        }
      });

      const behaviorChart = new Chart(behaviorChartRef.current, {
        type: 'bar',
        data: {
          labels: Object.keys(categories),
          datasets: [{
            label: 'Số lượt ghi nhận',
            data: Object.values(categories),
            backgroundColor: '#4A90E2',
            borderRadius: 6
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            title: {
              display: true,
              text: 'Phân loại các hoạt động hành vi / rèn luyện',
              font: { size: 13, family: 'Be Vietnam Pro', weight: 'bold' },
              color: '#1e293b'
            }
          },
          scales: {
            y: { beginAtZero: true, ticks: { stepSize: 1 } }
          }
        }
      });
      chartInstances.current.push(behaviorChart);
    }

    return () => {
      chartInstances.current.forEach(c => c?.destroy?.());
    };
  }, [students, behaviors, selectedClassId]);

  // Render D3 Scatter Plot
  useEffect(() => {
    if (!d3ScatterRef.current || classStudents.length === 0) return;
    
    const data = classStudents.map(s => {
       const gpa = calculateMathGPA(s);
       return {
         id: s.id,
         name: s.name,
         gpa: gpa ?? 0,
         behavior: s.behaviorScore
       };
    }).filter(d => d.gpa > 0);

    const margin = {top: 20, right: 30, bottom: 40, left: 40};
    const containerWidth = d3ScatterRef.current.parentElement?.clientWidth || 600;
    const width = containerWidth - margin.left - margin.right;
    const height = 280 - margin.top - margin.bottom;

    const svg = d3.select(d3ScatterRef.current)
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom);
      
    svg.selectAll("*").remove();

    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3.scaleLinear().domain([0, 10]).range([0, width]);
    const minBeh = d3.min(data, d => d.behavior) || 50;
    const maxBeh = d3.max(data, d => d.behavior) || 120;
    const y = d3.scaleLinear().domain([Math.max(0, minBeh - 10), maxBeh + 10]).range([height, 0]);

    // X Axis
    g.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .append("text")
      .attr("x", width)
      .attr("y", 35)
      .attr("fill", "#64748b")
      .attr("text-anchor", "end")
      .text("Điểm trung bình (GPA)");

    // Y Axis
    g.append("g")
      .call(d3.axisLeft(y))
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -30)
      .attr("fill", "#64748b")
      .attr("text-anchor", "end")
      .text("Điểm rèn luyện");

    // Add dots with tooltip
    g.selectAll("circle")
      .data(data)
      .enter()
      .append("circle")
      .attr("cx", d => x(d.gpa))
      .attr("cy", d => y(d.behavior))
      .attr("r", 6)
      .style("fill", "#6366f1")
      .style("opacity", 0.7)
      .style("cursor", "pointer")
      .on("mouseover", function() {
        d3.select(this).attr("r", 9).style("opacity", 1).style("fill", "#4f46e5");
      })
      .on("mouseout", function() {
        d3.select(this).attr("r", 6).style("opacity", 0.7).style("fill", "#6366f1");
      })
      .append("title")
      .text(d => `${d.name}\nGPA: ${d.gpa.toFixed(1)}\nRèn luyện: ${d.behavior}`);

  }, [classStudents]);

  // Request AI Pedagogical Analysis
  const handleGenerateAIReport = async () => {
    setIsAiLoading(true);
    setAiError('');
    try {
      const result = await aiAnalyzeClass(classNameStr, classStudents, classBehaviors, customApiKey);
      setAiReport(result);
    } catch (err: any) {
      setAiError(err.message || 'Không thể tạo báo cáo AI');
    } finally {
      setIsAiLoading(false);
    }
  };

  // Top performers and needs attention
  const sortedByGpa = [...classStudents].sort((a, b) => (calculateMathGPA(b) ?? -1) - (calculateMathGPA(a) ?? -1));
  const topStudents = sortedByGpa.slice(0, 3);
  const strugglingStudents = sortedByGpa.filter(s => {
    const gpa = calculateMathGPA(s);
    return (gpa !== null && gpa < 6.5) || s.behaviorScore < 95;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-5 sm:px-6 space-y-6">
      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">Điểm TB môn Toán</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-800 mt-2">{averageGPA}</div>
          <p className="text-[11px] text-slate-500 mt-1">
            Toàn lớp {classNameStr}
          </p>
        </div>

        {/* Metric 2 */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">Tỷ lệ Giỏi & Xuất sắc</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-emerald-600 mt-2">{goodRankPercent}%</div>
          <p className="text-[11px] text-slate-500 mt-1">
            {goodRankCount}/{classStudents.length} học sinh đạt $\ge$ 8.0
          </p>
        </div>

        {/* Metric 3 */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">Điểm rèn luyện TB</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-800 mt-2">{averageBehavior}đ</div>
          <p className="text-[11px] text-slate-500 mt-1">
            {positiveBehaviorsCount} lượt cộng / {negativeBehaviorsCount} nhắc nhở
          </p>
        </div>

        {/* Metric 4 */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">Sĩ số lớp học</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-800 mt-2">{classStudents.length}</div>
          <p className="text-[11px] text-slate-500 mt-1">
            Đang quản lý trên hệ thống
          </p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Chart 1: Phổ điểm */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <div className="h-64">
            <canvas ref={barChartRef}></canvas>
          </div>
        </div>

        {/* Chart 2: Cơ cấu học lực */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <div className="h-64">
            <canvas ref={doughnutChartRef}></canvas>
          </div>
        </div>
      </div>

      {/* D3 Interactive Scatter Plot */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
        <div className="flex items-center gap-2 mb-2">
          <ScatterChart className="w-5 h-5 text-indigo-500" />
          <h3 className="font-bold text-sm text-slate-800">Biểu đồ tương quan: Học lực & Rèn luyện (D3.js)</h3>
        </div>
        <p className="text-xs text-slate-500 mb-4">Mỗi điểm tương ứng với 1 học sinh. Hover vào điểm để xem chi tiết.</p>
        <div className="w-full overflow-hidden flex justify-center">
          <svg ref={d3ScatterRef}></svg>
        </div>
      </div>

      {/* Chart 3 & Highlight Students */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Chart 3: Hành vi rèn luyện */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs lg:col-span-2">
          <div className="h-60">
            <canvas ref={behaviorChartRef}></canvas>
          </div>
        </div>

        {/* Top Performers and Attention List */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 uppercase tracking-wider mb-2">
              <Award className="w-4 h-4 text-emerald-600" />
              <span>Top 3 Điểm Toán cao nhất</span>
            </div>
            <div className="space-y-2">
              {topStudents.map((s, idx) => {
                const gpa = calculateMathGPA(s);
                return (
                  <div key={s.id} className="flex items-center justify-between p-2 rounded-lg bg-emerald-50/50 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-[10px]">
                        {idx + 1}
                      </span>
                      <span className="font-semibold text-slate-800">{s.name}</span>
                    </div>
                    <span className="font-bold text-emerald-700">{gpa?.toFixed(1) ?? '-'}đ</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100">
            <div className="flex items-center gap-2 text-xs font-bold text-rose-800 uppercase tracking-wider mb-2">
              <AlertCircle className="w-4 h-4 text-rose-600" />
              <span>Học sinh cần lưu ý ({strugglingStudents.length})</span>
            </div>
            {strugglingStudents.length === 0 ? (
              <p className="text-xs text-slate-400 italic">Không có học sinh nào bị hổng kiến thức hoặc kỷ luật yếu.</p>
            ) : (
              <div className="space-y-1.5 max-h-40 overflow-y-auto">
                {strugglingStudents.map(s => {
                  const gpa = calculateMathGPA(s);
                  return (
                    <div key={s.id} className="flex items-center justify-between p-2 rounded-lg bg-rose-50/60 text-xs">
                      <span className="font-medium text-slate-800">{s.name}</span>
                      <div className="flex items-center gap-2 text-[11px]">
                        <span className="text-rose-700 font-bold">ĐTB: {gpa?.toFixed(1) ?? '-'}</span>
                        <span className="text-slate-500">| RL: {s.behaviorScore}đ</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* AI Pedagogical Analysis Section */}
      <div className="bg-gradient-to-br from-blue-50/80 via-indigo-50/60 to-purple-50/80 rounded-2xl border border-indigo-100 p-5 shadow-2xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                Báo cáo Phân tích Sư phạm chuyên sâu bằng Gemini AI
                <Sparkles className="w-4 h-4 text-amber-500 fill-amber-400" />
              </h3>
              <p className="text-xs text-slate-500">
                AI phân tích phổ điểm, độ phân hóa kiến thức và đề xuất giải pháp dạy học phân hóa
              </p>
            </div>
          </div>

          <button
            onClick={handleGenerateAIReport}
            disabled={isAiLoading}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs disabled:opacity-50 transition-all active:scale-95"
          >
            {isAiLoading ? (
              <>
                <i className="fa-solid fa-circle-notch fa-spin"></i>
                <span>AI đang phân tích...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>{aiReport ? 'Phân tích lại' : 'Tạo nhận xét sư phạm'}</span>
              </>
            )}
          </button>
        </div>

        {aiError && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700">
            Lỗi: {aiError}
          </div>
        )}

        {aiReport && (
          <div className="bg-white rounded-xl p-4 border border-indigo-100 text-xs sm:text-sm text-slate-700 leading-relaxed shadow-2xs space-y-2 whitespace-pre-line">
            {aiReport}
          </div>
        )}
      </div>
    </div>
  );
};
