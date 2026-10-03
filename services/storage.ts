import { ClassRoom, Student, BehaviorRecord, MathQuestion, AppSettings } from '../types';
import { initialClasses, initialStudents, initialBehaviorRecords, initialQuestions, initialSettings } from '../data/mockData';

const KEYS = {
  CLASSES: 'mathclass_classes',
  STUDENTS: 'mathclass_students',
  BEHAVIORS: 'mathclass_behaviors',
  QUESTIONS: 'mathclass_questions',
  SETTINGS: 'mathclass_settings',
};

// Calculate Math GPA according to Circular 22/BGDĐT
export function calculateMathGPA(student: Student): number | null {
  const txScores = [student.tx1, student.tx2, student.tx3, student.tx4].filter((s): s is number => s !== null && !isNaN(s));
  const hasGk = student.gk !== null && !isNaN(student.gk);
  const hasCk = student.ck !== null && !isNaN(student.ck);

  if (txScores.length === 0 && !hasGk && !hasCk) {
    return null;
  }

  const txSum = txScores.reduce((acc, curr) => acc + curr, 0);
  const gkVal = hasGk ? student.gk! * 2 : 0;
  const ckVal = hasCk ? student.ck! * 3 : 0;

  const totalWeights = txScores.length + (hasGk ? 2 : 0) + (hasCk ? 3 : 0);
  if (totalWeights === 0) return null;

  const gpa = (txSum + gkVal + ckVal) / totalWeights;
  return Math.round(gpa * 10) / 10;
}

// Get academic rank
export function getAcademicRank(gpa: number | null): { text: string; color: string; badge: string } {
  if (gpa === null) return { text: 'Chưa đủ điểm', color: 'text-slate-400', badge: 'bg-slate-100 text-slate-600' };
  if (gpa >= 9.0) return { text: 'Xuất sắc', color: 'text-emerald-600', badge: 'bg-emerald-50 text-emerald-700' };
  if (gpa >= 8.0) return { text: 'Giỏi', color: 'text-blue-600', badge: 'bg-blue-50 text-blue-700' };
  if (gpa >= 6.5) return { text: 'Khá', color: 'text-amber-600', badge: 'bg-amber-50 text-amber-700' };
  if (gpa >= 5.0) return { text: 'Đạt', color: 'text-slate-600', badge: 'bg-slate-100 text-slate-700' };
  return { text: 'Chưa đạt', color: 'text-rose-600', badge: 'bg-rose-50 text-rose-700' };
}

export const storage = {
  getClasses(): ClassRoom[] {
    try {
      const data = localStorage.getItem(KEYS.CLASSES);
      return data ? JSON.parse(data) : initialClasses;
    } catch {
      return initialClasses;
    }
  },
  saveClasses(classes: ClassRoom[]) {
    localStorage.setItem(KEYS.CLASSES, JSON.stringify(classes));
  },

  getStudents(): Student[] {
    try {
      const data = localStorage.getItem(KEYS.STUDENTS);
      return data ? JSON.parse(data) : initialStudents;
    } catch {
      return initialStudents;
    }
  },
  saveStudents(students: Student[]) {
    localStorage.setItem(KEYS.STUDENTS, JSON.stringify(students));
  },

  getBehaviors(): BehaviorRecord[] {
    try {
      const data = localStorage.getItem(KEYS.BEHAVIORS);
      return data ? JSON.parse(data) : initialBehaviorRecords;
    } catch {
      return initialBehaviorRecords;
    }
  },
  saveBehaviors(behaviors: BehaviorRecord[]) {
    localStorage.setItem(KEYS.BEHAVIORS, JSON.stringify(behaviors));
  },

  getQuestions(): MathQuestion[] {
    try {
      const data = localStorage.getItem(KEYS.QUESTIONS);
      return data ? JSON.parse(data) : initialQuestions;
    } catch {
      return initialQuestions;
    }
  },
  saveQuestions(questions: MathQuestion[]) {
    localStorage.setItem(KEYS.QUESTIONS, JSON.stringify(questions));
  },

  getSettings(): AppSettings {
    try {
      const data = localStorage.getItem(KEYS.SETTINGS);
      return data ? { ...initialSettings, ...JSON.parse(data) } : initialSettings;
    } catch {
      return initialSettings;
    }
  },
  saveSettings(settings: AppSettings) {
    localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
  },

  resetToDefault() {
    localStorage.setItem(KEYS.CLASSES, JSON.stringify(initialClasses));
    localStorage.setItem(KEYS.STUDENTS, JSON.stringify(initialStudents));
    localStorage.setItem(KEYS.BEHAVIORS, JSON.stringify(initialBehaviorRecords));
    localStorage.setItem(KEYS.QUESTIONS, JSON.stringify(initialQuestions));
    localStorage.setItem(KEYS.SETTINGS, JSON.stringify(initialSettings));
  },

  exportFullBackup(): string {
    const backup = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      classes: this.getClasses(),
      students: this.getStudents(),
      behaviors: this.getBehaviors(),
      questions: this.getQuestions(),
      settings: this.getSettings()
    };
    return JSON.stringify(backup, null, 2);
  },

  importFullBackup(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString);
      if (data.classes && data.students) {
        this.saveClasses(data.classes);
        this.saveStudents(data.students);
        if (data.behaviors) this.saveBehaviors(data.behaviors);
        if (data.questions) this.saveQuestions(data.questions);
        if (data.settings) this.saveSettings(data.settings);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }
};
