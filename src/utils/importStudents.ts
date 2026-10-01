import { Student } from '../types';

export const importStudentsFromFile = async (file: File, classId: string): Promise<Student[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        let importedStudents: any[] = [];

        if (file.name.endsWith('.json')) {
          importedStudents = JSON.parse(text);
          if (!Array.isArray(importedStudents)) {
            throw new Error('Định dạng JSON không hợp lệ (phải là một mảng).');
          }
        } else if (file.name.endsWith('.csv')) {
          const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
          if (lines.length <= 1) {
            throw new Error('File CSV trống hoặc không đúng định dạng (cần có dòng tiêu đề).');
          }

          // Phân tích header (dòng đầu)
          const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
          
          // Tìm index của các cột quan trọng
          const nameIdx = headers.findIndex(h => h.includes('tên') || h.includes('name'));
          const codeIdx = headers.findIndex(h => h.includes('mã') || h.includes('code'));
          const genderIdx = headers.findIndex(h => h.includes('giới tính') || h.includes('gender'));
          const roleIdx = headers.findIndex(h => h.includes('chức vụ') || h.includes('role'));
          const parentNameIdx = headers.findIndex(h => h.includes('phụ huynh') || h.includes('parent'));
          const phoneIdx = headers.findIndex(h => h.includes('sđt') || h.includes('điện thoại') || h.includes('phone'));

          if (nameIdx === -1) {
            throw new Error('Không tìm thấy cột Tên học sinh trong file CSV.');
          }

          for (let i = 1; i < lines.length; i++) {
            // Xử lý split theo dấu phẩy, hỗ trợ chuỗi có dấu ngoặc kép đơn giản
            const rowStr = lines[i];
            const row: string[] = [];
            let inQuotes = false;
            let currentVal = '';
            
            for (let j = 0; j < rowStr.length; j++) {
              const char = rowStr[j];
              if (char === '"') {
                inQuotes = !inQuotes;
              } else if (char === ',' && !inQuotes) {
                row.push(currentVal.trim());
                currentVal = '';
              } else {
                currentVal += char;
              }
            }
            row.push(currentVal.trim());

            if (row.length < nameIdx) continue;

            const name = row[nameIdx];
            if (!name) continue;

            importedStudents.push({
              name,
              code: codeIdx !== -1 ? row[codeIdx] : undefined,
              gender: genderIdx !== -1 ? row[genderIdx] : undefined,
              role: roleIdx !== -1 ? row[roleIdx] : undefined,
              parentName: parentNameIdx !== -1 ? row[parentNameIdx] : undefined,
              parentPhone: phoneIdx !== -1 ? row[phoneIdx] : undefined,
            });
          }
        } else {
          throw new Error('Định dạng file không được hỗ trợ. Vui lòng chọn file .csv hoặc .json');
        }

        const avatarsMale = [
          'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        ];
        
        const avatarsFemale = [
          'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        ];

        // Chuẩn hóa dữ liệu sang kiểu Student
        const finalStudents: Student[] = importedStudents.map((item, index) => {
          const rawGender = (item.gender || '').toLowerCase();
          const gender = (rawGender === 'nữ' || rawGender === 'nu' || rawGender === 'female' || rawGender === 'f') ? 'nữ' : 'nam';
          
          const rawRole = (item.role || '').toLowerCase();
          let role: Student['role'] = 'Học sinh';
          if (rawRole.includes('lớp trưởng')) role = 'Lớp trưởng';
          else if (rawRole.includes('lớp phó')) role = 'Lớp phó';
          else if (rawRole.includes('cán sự')) role = 'Cán sự Toán';
          else if (rawRole.includes('tổ trưởng')) role = 'Tổ trưởng';

          const newStudent: Student = {
            id: 'hs-' + Date.now() + '-' + index + '-' + Math.random().toString(36).substring(7),
            classId: classId,
            name: item.name || 'Học sinh ' + (index + 1),
            code: item.code || ('HS-' + Math.floor(1000 + Math.random() * 9000)),
            gender,
            avatar: gender === 'nam' ? avatarsMale[index % avatarsMale.length] : avatarsFemale[index % avatarsFemale.length],
            role,
            parentName: item.parentName || ('Phụ huynh em ' + (item.name || '')).trim(),
            parentPhone: item.parentPhone || '0901234567',
            tx1: item.tx1 ?? null,
            tx2: item.tx2 ?? null,
            tx3: item.tx3 ?? null,
            tx4: item.tx4 ?? null,
            gk: item.gk ?? null,
            ck: item.ck ?? null,
            behaviorScore: item.behaviorScore ?? 100,
            starCount: item.starCount ?? 5,
            notes: item.notes || 'Nhập từ file',
          };
          return newStudent;
        });

        resolve(finalStudents);
      } catch (err: any) {
        reject(err);
      }
    };

    reader.onerror = () => {
      reject(new Error('Lỗi khi đọc file.'));
    };

    reader.readAsText(file);
  });
};

export const downloadStudentTemplate = () => {
  const headers = ['Tên học sinh', 'Mã học sinh', 'Giới tính', 'Chức vụ', 'Họ tên phụ huynh', 'Số điện thoại phụ huynh', 'Ghi chú'];
  const sampleData1 = ['Nguyễn Văn A', 'HS-001', 'Nam', 'Học sinh', 'Nguyễn Văn B', '0901234567', 'Chăm chỉ'];
  const sampleData2 = ['Trần Thị B', 'HS-002', 'Nữ', 'Lớp trưởng', 'Trần Văn C', '0987654321', ''];
  
  const csvContent = [
    headers.join(','),
    sampleData1.map(v => `"${v}"`).join(','),
    sampleData2.map(v => `"${v}"`).join(',')
  ].join('\n');

  // Add BOM for UTF-8 Excel compatibility
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', 'mau_danh_sach_hoc_sinh.csv');
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
