import { collection, doc, getDocs, writeBatch, setDoc, getDoc } from 'firebase/firestore';
import { db } from './firebase';
import { ClassRoom, Student, BehaviorRecord, MathQuestion, AppSettings } from '../types';
import { initialClasses, initialStudents, initialBehaviorRecords, initialQuestions, initialSettings } from '../data/mockData';

export const firebaseStorage = {
  async loadTeacherData(uid: string) {
    try {
      const teacherRef = doc(db, 'teachers', uid);
      
      const [classesSnap, studentsSnap, behaviorsSnap, questionsSnap, settingsSnap] = await Promise.all([
        getDocs(collection(teacherRef, 'classes')),
        getDocs(collection(teacherRef, 'students')),
        getDocs(collection(teacherRef, 'behaviors')),
        getDocs(collection(teacherRef, 'questions')),
        getDoc(doc(teacherRef, 'settings', 'config'))
      ]);

      let classes = classesSnap.docs.map(d => d.data() as ClassRoom);
      let students = studentsSnap.docs.map(d => d.data() as Student);
      let behaviors = behaviorsSnap.docs.map(d => d.data() as BehaviorRecord);
      let questions = questionsSnap.docs.map(d => d.data() as MathQuestion);
      let settings = settingsSnap.exists() ? (settingsSnap.data() as AppSettings) : initialSettings;

      // If no data exists, initialize with mock data
      if (classes.length === 0) {
        classes = initialClasses;
        students = initialStudents;
        behaviors = initialBehaviorRecords;
        questions = initialQuestions;
        
        await this.saveFullData(uid, { classes, students, behaviors, questions, settings });
      }

      return { classes, students, behaviors, questions, settings };
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu từ Firebase:", error);
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
    const teacherRef = doc(db, 'teachers', uid);
    const batch = writeBatch(db);

    if (data.classes) {
      data.classes.forEach(c => {
        batch.set(doc(collection(teacherRef, 'classes'), c.id), c);
      });
    }
    if (data.students) {
      data.students.forEach(s => {
        batch.set(doc(collection(teacherRef, 'students'), s.id), s);
      });
    }
    if (data.behaviors) {
      data.behaviors.forEach(b => {
        batch.set(doc(collection(teacherRef, 'behaviors'), b.id), b);
      });
    }
    if (data.questions) {
      data.questions.forEach(q => {
        batch.set(doc(collection(teacherRef, 'questions'), q.id), q);
      });
    }
    if (data.settings) {
      batch.set(doc(teacherRef, 'settings', 'config'), data.settings);
    }

    await batch.commit();
  }
};
