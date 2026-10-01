import React, { useState } from 'react';
import { Student } from '../types';
import { calculateMathGPA, getAcademicRank } from '../services/storage';
import { 
  Download, 
  Search, 
  ArrowUpDown, 
  Edit3, 
  Check, 
  HelpCircle,
  FileSpreadsheet,
  Printer,
  Sparkles,
  FileText
} from 'lucide-react';
import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType } from 'docx';
import { saveAs } from 'file-saver';

interface GradebookProps {
  students: Student[];
  selectedClassId: string;
  classNameStr: string;
  onUpdateStudents: (students: Student[]) => void;
  onOpenStudentDetail: (student: Student) => void;
  isTeacherMode: boolean;
}

export const Gradebook: React.FC<GradebookProps> = ({
  students,
  selectedClassId,
  classNameStr,
  onUpdateStudents,
  onOpenStudentDetail,
  isTeacherMode
}) => {
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<'name' | 'gpa' | 'behavior'>('name');
  const [sortAsc, setSortAsc] = useState(true);
  const [editingScore, setEditingScore] = useState<{ studentId: string; field: keyof Student } | null>(null);
  const [editValue, setEditValue] = useState<string>('');

  const classStudents = students.filter(s => s.classId === selectedClassId);

  // Sorting and filtering
  const processedStudents = classStudents
    .filter(s => s.name.toLowerCase().includes(search.toLowerCase()) || s.code.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sortField === 'name') {
        const nameA = a.name.split(' ').pop() || a.name;
        const nameB = b.name.split(' ').pop() || b.name;
        return sortAsc ? nameA.localeCompare(nameB, 'vi') : nameB.localeCompare(nameA, 'vi');
      }
      if (sortField === 'gpa') {
        const gpaA = calculateMathGPA(a) ?? -1;
        const gpaB = calculateMathGPA(b) ?? -1;
        return sortAsc ? gpaA - gpaB : gpaB - gpaA;
      }
      if (sortField === 'behavior') {
        return sortAsc ? a.behaviorScore - b.behaviorScore : b.behaviorScore - a.behaviorScore;
      }
      return 0;
    });

  // Handle inline score editing
  const startEdit = (student: Student, field: keyof Student) => {
    if (!isTeacherMode) return;
    setEditingScore({ studentId: student.id, field });
    const val = student[field];
    setEditValue(val !== null && val !== undefined ? String(val) : '');
  };

  const saveEdit = (studentId: string, field: keyof Student) => {
    const num = editValue.trim() === '' ? null : parseFloat(editValue);
    if (num !== null && (isNaN(num) || num < 0 || num > 10)) {
      alert('Điểm số phải từ 0 đến 10!');
      return;
    }

    const updated = students.map(s => {
      if (s.id === studentId) {
        return {
          ...s,
          [field]: num
        };
      }
      return s;
    });

    onUpdateStudents(updated);
    setEditingScore(null);
  };

  // Export to Excel using SheetJS
  const exportToExcel = () => {
    if (typeof window === 'undefined' || !window.XLSX) {
      alert('Đang tải thư viện Excel, vui lòng thử lại sau giây lát!');
      return;
    }

    const rows = classStudents.map((s, idx) => {
      const gpa = calculateMathGPA(s);
      const rank = getAcademicRank(gpa);
      return {
        'STT': idx + 1,
        'Mã học sinh': s.code,
        'Họ và tên': s.name,
        'Giới tính': s.gender === 'nam' ? 'Nam' : 'Nữ',
        'ĐĐGtx 1 (Miệng)': s.tx1 ?? '',
        'ĐĐGtx 2 (15p-1)': s.tx2 ?? '',
        'ĐĐGtx 3 (15p-2)': s.tx3 ?? '',
        'ĐĐGtx 4 (Dự án)': s.tx4 ?? '',
        'ĐĐGgk (Hệ số 2)': s.gk ?? '',
        'ĐĐGck (Hệ số 3)': s.ck ?? '',
        'ĐTB Môn Toán': gpa ?? '',
        'Xếp loại học lực': rank.text,
        'Điểm rèn luyện': s.behaviorScore,
        'Số sao tích lũy': s.starCount,
        'Ghi chú': s.notes
      };
    });

    const worksheet = window.XLSX.utils.json_to_sheet(rows);
    const workbook = window.XLSX.utils.book_new();
    window.XLSX.utils.book_append_sheet(workbook, worksheet, 'SoDiemToan_' + classNameStr);

    const filename = `Bang_Diem_Mon_Toan_${classNameStr.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.xlsx`;
    window.XLSX.writeFile(workbook, filename);
  };

  const exportToWord = async () => {
    const tableRows = [
      new TableRow({
        children: [
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "STT", bold: true })] })] }),
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Mã HS", bold: true })] })] }),
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Họ và tên", bold: true })] })] }),
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "ĐTB", bold: true })] })] }),
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Xếp loại", bold: true })] })] }),
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Hành vi", bold: true })] })] }),
        ]
      }),
      ...processedStudents.map((s, idx) => {
        const gpa = calculateMathGPA(s);
        const rank = getAcademicRank(gpa);
        return new TableRow({
          children: [
            new TableCell({ children: [new Paragraph(String(idx + 1))] }),
            new TableCell({ children: [new Paragraph(s.code)] }),
            new TableCell({ children: [new Paragraph(s.name)] }),
            new TableCell({ children: [new Paragraph(gpa ? gpa.toFixed(1) : '-')] }),
            new TableCell({ children: [new Paragraph(rank.text)] }),
            new TableCell({ children: [new Paragraph(String(s.behaviorScore))] }),
          ]
        });
      })
    ];

    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          new Paragraph({
            children: [
              new TextRun({ text: `Báo Cáo Điểm Và Hành Vi - Lớp ${classNameStr}`, bold: true, size: 28 })
            ],
            spacing: { after: 300 }
          }),
          new Table({
            rows: tableRows,
            width: { size: 100, type: WidthType.PERCENTAGE },
          })
        ]
      }]
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `Bao_Cao_${classNameStr}.docx`);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-5 sm:px-6 space-y-5">
      {/* Gradebook Header Actions */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-[260px]">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm theo tên hoặc mã học sinh..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
            />
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <span>Sắp xếp:</span>
            <button
              onClick={() => {
                if (sortField === 'name') setSortAsc(!sortAsc);
                else { setSortField('name'); setSortAsc(true); }
              }}
              className={`px-2.5 py-1.5 rounded-lg border font-medium transition-colors ${
                sortField === 'name' ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-slate-50 border-slate-200 text-slate-700'
              }`}
            >
              Tên {sortField === 'name' ? (sortAsc ? '↑' : '↓') : ''}
            </button>
            <button
              onClick={() => {
                if (sortField === 'gpa') setSortAsc(!sortAsc);
                else { setSortField('gpa'); setSortAsc(false); }
              }}
              className={`px-2.5 py-1.5 rounded-lg border font-medium transition-colors ${
                sortField === 'gpa' ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-slate-50 border-slate-200 text-slate-700'
              }`}
            >
              ĐTBm {sortField === 'gpa' ? (sortAsc ? '↑' : '↓') : ''}
            </button>
            <button
              onClick={() => {
                if (sortField === 'behavior') setSortAsc(!sortAsc);
                else { setSortField('behavior'); setSortAsc(false); }
              }}
              className={`px-2.5 py-1.5 rounded-lg border font-medium transition-colors ${
                sortField === 'behavior' ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-slate-50 border-slate-200 text-slate-700'
              }`}
            >
              Rèn luyện {sortField === 'behavior' ? (sortAsc ? '↑' : '↓') : ''}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportToExcel}
            className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Xuất Excel</span>
          </button>
          <button
            onClick={exportToWord}
            className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors"
          >
            <FileText className="w-4 h-4" />
            <span>Xuất Word</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span className="hidden sm:inline">In sổ điểm</span>
          </button>
        </div>
      </div>

      {/* Thông tin quy chế tính điểm */}
      <div className="bg-blue-50/70 border border-blue-100 rounded-xl p-3 text-xs text-blue-800 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-blue-600 shrink-0" />
          <span>
            <strong>Quy chuẩn Thông tư 22/BGDĐT:</strong> ĐĐGtx (hệ số 1), ĐĐGgk (hệ số 2), ĐĐGck (hệ số 3).
            {isTeacherMode && ' Click đúp hoặc nhấn vào ô điểm để nhập/chỉnh sửa trực tiếp.'}
          </span>
        </div>
        <div className="text-[11px] text-blue-600 font-medium shrink-0">
          Sĩ số: {classStudents.length} học sinh
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-800 uppercase text-[11px] tracking-wider">
              <tr>
                <th className="py-3 px-3 w-10 text-center">STT</th>
                <th className="py-3 px-4 min-w-[180px]">Học sinh</th>
                <th className="py-3 px-2 text-center bg-blue-50/50">Tx 1</th>
                <th className="py-3 px-2 text-center bg-blue-50/50">Tx 2</th>
                <th className="py-3 px-2 text-center bg-blue-50/50">Tx 3</th>
                <th className="py-3 px-2 text-center bg-blue-50/50">Tx 4</th>
                <th className="py-3 px-3 text-center bg-amber-50/50">Giữa kỳ (x2)</th>
                <th className="py-3 px-3 text-center bg-orange-50/50">Cuối kỳ (x3)</th>
                <th className="py-3 px-3 text-center bg-indigo-50/50 font-extrabold text-indigo-900">ĐTBm</th>
                <th className="py-3 px-3 text-center">Xếp loại</th>
                <th className="py-3 px-3 text-center">Rèn luyện</th>
                <th className="py-3 px-3 text-center">Sao</th>
                <th className="py-3 px-4 min-w-[150px]">Nhận xét giáo viên</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {processedStudents.map((student, idx) => {
                const gpa = calculateMathGPA(student);
                const rank = getAcademicRank(gpa);

                // Helper to render editable cell
                const renderCell = (field: keyof Student, bgClass = '') => {
                  const isEditing = editingScore?.studentId === student.id && editingScore?.field === field;
                  const val = student[field];

                  if (isEditing) {
                    return (
                      <td className={`p-1 text-center ${bgClass}`}>
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max="10"
                          autoFocus
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={() => saveEdit(student.id, field)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') saveEdit(student.id, field);
                            if (e.key === 'Escape') setEditingScore(null);
                          }}
                          className="w-12 text-center py-1 border border-blue-500 rounded bg-white text-xs font-bold text-blue-700 shadow-inner focus:outline-none"
                        />
                      </td>
                    );
                  }

                  return (
                    <td
                      onClick={() => startEdit(student, field)}
                      title={isTeacherMode ? "Bấm để sửa điểm" : ""}
                      className={`py-2.5 px-2 text-center font-semibold transition-colors cursor-pointer hover:bg-blue-100/50 ${bgClass}`}
                    >
                      {val !== null && val !== undefined ? (
                        <span className={Number(val) < 5 ? 'text-rose-600 font-bold' : 'text-slate-800'}>
                          {Number(val).toFixed(1)}
                        </span>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>
                  );
                };

                return (
                  <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 px-3 text-center font-medium text-slate-400">
                      {idx + 1}
                    </td>

                    <td className="py-2.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={student.avatar}
                          alt={student.name}
                          className="w-7 h-7 rounded-full object-cover border border-slate-200"
                        />
                        <div>
                          <button
                            onClick={() => onOpenStudentDetail(student)}
                            className="font-bold text-slate-800 hover:text-blue-600 text-left cursor-pointer"
                          >
                            {student.name}
                          </button>
                          <div className="text-[11px] text-slate-400">{student.code} · {student.role}</div>
                        </div>
                      </div>
                    </td>

                    {/* Tx scores */}
                    {renderCell('tx1', 'bg-blue-50/20')}
                    {renderCell('tx2', 'bg-blue-50/20')}
                    {renderCell('tx3', 'bg-blue-50/20')}
                    {renderCell('tx4', 'bg-blue-50/20')}

                    {/* GK & CK */}
                    {renderCell('gk', 'bg-amber-50/20')}
                    {renderCell('ck', 'bg-orange-50/20')}

                    {/* ĐTBm */}
                    <td className="py-2.5 px-3 text-center font-bold text-indigo-700 bg-indigo-50/30 text-sm">
                      {gpa !== null ? gpa.toFixed(1) : '-'}
                    </td>

                    {/* Academic Rank */}
                    <td className="py-2.5 px-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${rank.badge}`}>
                        {rank.text}
                      </span>
                    </td>

                    {/* Behavior points */}
                    <td className="py-2.5 px-3 text-center">
                      <span className={`font-bold ${
                        student.behaviorScore >= 110 ? 'text-emerald-600' :
                        student.behaviorScore < 95 ? 'text-rose-600' : 'text-slate-700'
                      }`}>
                        {student.behaviorScore}
                      </span>
                    </td>

                    {/* Star count */}
                    <td className="py-2.5 px-3 text-center font-semibold text-amber-600">
                      {student.starCount} ⭐
                    </td>

                    {/* Teacher Notes */}
                    <td className="py-2.5 px-4 text-[11px] text-slate-600 max-w-[200px] truncate" title={student.notes}>
                      {student.notes || <span className="text-slate-300 italic">Chưa có ghi chú</span>}
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
