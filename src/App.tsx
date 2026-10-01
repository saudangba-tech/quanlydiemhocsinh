import React, { useState, useEffect } from 'react';
import { ClassRoom, Student, BehaviorRecord, MathQuestion, AppSettings } from './types';
import { firebaseStorage } from './services/firebase-storage';
import { useAuth } from './contexts/AuthContext';
import { sound } from './services/sound';
import { renderMathJax } from './utils/mathjax';

// Components
import { Header } from './components/Header';
import { LiveBehaviorGrading } from './components/LiveBehaviorGrading';
import { Gradebook } from './components/Gradebook';
import { AnalyticsReports } from './components/AnalyticsReports';
import { HallOfFame } from './components/HallOfFame';
import { ParentNotifications } from './components/ParentNotifications';
import { AIAssistant } from './components/AIAssistant';
import { StudentPractice } from './components/StudentPractice';
import { SettingsModal } from './components/SettingsModal';
import { StudentProfileModal } from './components/StudentProfileModal';
import { AddStudentModal } from './components/AddStudentModal';
import { AddClassModal } from './components/AddClassModal';

export default function App() {
  const { user } = useAuth();

  // State management
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  
  const [students, setStudents] = useState<Student[]>([]);
  const [behaviors, setBehaviors] = useState<BehaviorRecord[]>([]);
  const [questions, setQuestions] = useState<MathQuestion[]>([]);
  const [settings, setSettings] = useState<AppSettings>({ apiKey: '', selectedModel: '', soundEnabled: false, autoSave: true, defaultClassId: '' });

  // Load data khi khởi động
  useEffect(() => {
    firebaseStorage.loadTeacherData(user.uid).then(data => {
      setClasses(data.classes);
      if (data.classes.length > 0) setSelectedClassId(data.classes[0].id);
      setStudents(data.students);
      setBehaviors(data.behaviors);
      setQuestions(data.questions);
      setSettings(data.settings);
      setIsDataLoaded(true);
    }).catch(console.error);
  }, []);

  // UI state
  const [activeTab, setActiveTab] = useState<string>('live');
  const [isTeacherMode, setIsTeacherMode] = useState<boolean>(true);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(false);

  // Modals
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [isAddClassOpen, setIsAddClassOpen] = useState(false);
  const [selectedStudentForModal, setSelectedStudentForModal] = useState<Student | null>(null);

  // Sync sound setting
  useEffect(() => {
    if (isDataLoaded) setSoundEnabled(settings.soundEnabled);
  }, [isDataLoaded, settings.soundEnabled]);

  useEffect(() => {
    sound.setEnabled(soundEnabled);
  }, [soundEnabled]);

  // Initial MathJax render
  useEffect(() => {
    if (isDataLoaded) renderMathJax();
  }, [activeTab, isDataLoaded]);

  // Show settings if no API key
  useEffect(() => {
    if (isDataLoaded && !settings.apiKey) {
      setIsSettingsOpen(true);
    }
  }, [isDataLoaded, settings.apiKey]);

  // Persistence effects
  useEffect(() => {
    if (isDataLoaded) firebaseStorage.saveFullData(user.uid, { classes });
  }, [classes, isDataLoaded]);

  useEffect(() => {
    if (isDataLoaded) firebaseStorage.saveFullData(user.uid, { students });
  }, [students, isDataLoaded]);

  useEffect(() => {
    if (isDataLoaded) firebaseStorage.saveFullData(user.uid, { behaviors });
  }, [behaviors, isDataLoaded]);

  useEffect(() => {
    if (isDataLoaded) firebaseStorage.saveFullData(user.uid, { questions });
  }, [questions, isDataLoaded]);

  useEffect(() => {
    if (isDataLoaded) firebaseStorage.saveFullData(user.uid, { settings });
  }, [settings, isDataLoaded]);

  // Handlers for modifying students and behavior records
  const handleUpdateStudents = (updatedStudents: Student[]) => {
    setStudents(updatedStudents);
  };

  const handleAddBehavior = (newRecords: BehaviorRecord[]) => {
    setBehaviors(prev => [...newRecords, ...prev]);
  };

  const handleUndoBehavior = (recordId: string) => {
    const record = behaviors.find(b => b.id === recordId);
    if (!record) return;

    // Reverse point change
    setStudents(prev => prev.map(s => {
      if (s.id === record.studentId) {
        return {
          ...s,
          behaviorScore: Math.max(0, s.behaviorScore - record.points),
          starCount: record.points > 0 ? Math.max(0, s.starCount - (record.points >= 2 ? 2 : 1)) : s.starCount
        };
      }
      return s;
    }));

    setBehaviors(prev => prev.filter(b => b.id !== recordId));
  };

  // Add new student
  const handleAddStudent = (newStudent: Student) => {
    setStudents(prev => [...prev, newStudent]);
  };

  // Add new class
  const handleAddClass = (newClass: ClassRoom) => {
    setClasses(prev => [...prev, newClass]);
    setSelectedClassId(newClass.id);
  };

  // Save settings
  const handleSaveSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    setSoundEnabled(newSettings.soundEnabled);
  };

  // Reset demo data
  const handleResetData = () => {
    // Reset Firebase data omitted for safety, usually we'd delete the user's data and reload
  };

  // Import full backup
  const handleReloadFromStorage = () => {
    if (user) {
      firebaseStorage.loadTeacherData(user.uid).then(data => {
        setClasses(data.classes);
        setStudents(data.students);
        setBehaviors(data.behaviors);
        setQuestions(data.questions);
        setSettings(data.settings);
      });
    }
  };

  if (!isDataLoaded) {
    return <div className="min-h-screen flex flex-col gap-4 items-center justify-center bg-slate-50"><i className="fa-solid fa-circle-notch fa-spin text-3xl text-blue-500"></i><p className="text-slate-500 font-medium">Đang tải dữ liệu lớp học...</p></div>;
  }

  // Current active class object
  const currentClass = classes.find(c => c.id === selectedClassId) || classes[0];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-['Be_Vietnam_Pro',sans-serif]">
      {/* Top Application Header */}
      <Header
        classes={classes}
        selectedClassId={selectedClassId}
        onSelectClass={setSelectedClassId}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onAddStudent={() => setIsAddStudentOpen(true)}
        onAddClass={() => setIsAddClassOpen(true)}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled(!soundEnabled)}
        isTeacherMode={isTeacherMode}
        onToggleRoleMode={() => setIsTeacherMode(!isTeacherMode)}
        hasApiKey={!!settings.apiKey}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        {activeTab === 'live' && (
          <LiveBehaviorGrading
            students={students}
            behaviors={behaviors}
            onUpdateStudents={handleUpdateStudents}
            onAddBehavior={handleAddBehavior}
            onUndoBehavior={handleUndoBehavior}
            onOpenStudentDetail={(student) => setSelectedStudentForModal(student)}
            selectedClassId={selectedClassId}
          />
        )}

        {activeTab === 'gradebook' && (
          <Gradebook
            students={students}
            selectedClassId={selectedClassId}
            classNameStr={currentClass?.name || '12A1'}
            onUpdateStudents={handleUpdateStudents}
            onOpenStudentDetail={(student) => setSelectedStudentForModal(student)}
            isTeacherMode={isTeacherMode}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsReports
            students={students}
            behaviors={behaviors}
            selectedClassId={selectedClassId}
            classNameStr={currentClass?.name || '12A1'}
            customApiKey={settings.apiKey}
          />
        )}

        {activeTab === 'halloffame' && (
          <HallOfFame
            students={students}
            selectedClassId={selectedClassId}
            classNameStr={currentClass?.name || '12A1'}
            onOpenStudentDetail={(student) => setSelectedStudentForModal(student)}
          />
        )}

        {activeTab === 'parents' && (
          <ParentNotifications
            students={students}
            selectedClassId={selectedClassId}
            classNameStr={currentClass?.name || '12A1'}
            customApiKey={settings.apiKey}
          />
        )}

        {activeTab === 'ai' && (
          <AIAssistant
            onAddQuestions={(newQuestions) => setQuestions(prev => [...newQuestions, ...prev])}
            customApiKey={settings.apiKey}
            selectedGrade={currentClass?.grade || 12}
          />
        )}

        {activeTab === 'practice' && (
          <StudentPractice
            questions={questions}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 px-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700">MathClass Pro</span>
            <span>·</span>
            <span>Hệ thống số hóa điểm số & đánh giá hành vi Toán THPT</span>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-slate-400">
            <span>Thông tư 22/2021/TT-BGDĐT</span>
            <span>·</span>
            <span>Hỗ trợ giáo viên Toán toàn diện</span>
          </div>
        </div>
      </footer>

      {/* Modal: Settings & Gemini API */}
      {isSettingsOpen && (
        <SettingsModal
          settings={settings}
          onSaveSettings={handleSaveSettings}
          onClose={() => setIsSettingsOpen(false)}
          onResetData={handleResetData}
          onImportData={handleReloadFromStorage}
        />
      )}

      {/* Modal: Student Profile Details */}
      {selectedStudentForModal && (
        <StudentProfileModal
          student={selectedStudentForModal}
          behaviors={behaviors}
          onClose={() => setSelectedStudentForModal(null)}
          onUpdateStudent={(updated) => {
            setStudents(prev => prev.map(s => s.id === updated.id ? updated : s));
            setSelectedStudentForModal(updated);
          }}
          onAddBehavior={handleAddBehavior}
          isTeacherMode={isTeacherMode}
        />
      )}

      {/* Modal: Add New Student */}
      {isAddStudentOpen && (
        <AddStudentModal
          classId={selectedClassId}
          classNameStr={currentClass?.name || ''}
          onClose={() => setIsAddStudentOpen(false)}
          onAddStudent={handleAddStudent}
        />
      )}

      {/* Modal: Add New Class */}
      {isAddClassOpen && (
        <AddClassModal
          onClose={() => setIsAddClassOpen(false)}
          onAddClass={handleAddClass}
        />
      )}
    </div>
  );
}
