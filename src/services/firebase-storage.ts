import { ClassRoom, Student, BehaviorRecord, MathQuestion, AppSettings } from '../types';
import { initialClasses, initialStudents, initialBehaviorRecords, initialQuestions, initialSettings } from '../data/mockData';

export const firebaseStorage = {
  async loadTeacherData(uid: string) {
    try {
      const storageKey = `mock_data_${uid}`;
      const savedData = localStorage.getItem(storageKey);
      
      if (savedData) {
        return JSON.parse(savedData);
      }

      // If no data exists, initialize with mock data
      let classes = initialClasses;
      let students = initialStudents;
      let behaviors = initialBehaviorRecords;
      let questions = initialQuestions;
      let settings = initialSettings;
      
      const defaultData = { classes, students, behaviors, questions, settings };
      await this.saveFullData(uid, defaultData);

      return defaultData;
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu Local:", error);
      throw error;
    }
  },

  async saveFullData(uid: string, data: {
    classes?: ClassRoom[],
    students?: Student[],
    behaviors?: BehaviorRecord[],
    questions?: MathQuestion[],
    settings?: AppSettings
  }) {
    const storageKey = `mock_data_${uid}`;
    const savedDataStr = localStorage.getItem(storageKey);
    let currentData = savedDataStr ? JSON.parse(savedDataStr) : {};
    
    const mergedData = { ...currentData, ...data };
    localStorage.setItem(storageKey, JSON.stringify(mergedData));
  }
};
