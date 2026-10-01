/**
 * Tính năm học hiện tại dựa theo thời gian thực của máy tính.
 * Quy ước: Năm học bắt đầu từ tháng 8 (tháng 8 trở đi thuộc năm học mới).
 * Ví dụ:
 *   - Tháng 10/2026 → "2026 - 2027"
 *   - Tháng 5/2026  → "2025 - 2026"
 */
export function getCurrentSchoolYear(): string {
  const now = new Date();
  const month = now.getMonth() + 1; // getMonth() trả về 0-11
  const year = now.getFullYear();

  if (month >= 8) {
    // Từ tháng 8 trở đi: năm học mới
    return `${year} - ${year + 1}`;
  } else {
    // Tháng 1-7: vẫn thuộc năm học cũ
    return `${year - 1} - ${year}`;
  }
}
