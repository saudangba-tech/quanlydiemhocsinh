import React, { useState, useEffect } from 'react';
import { MathQuestion } from '../types';
import { useMathJax, fireConfetti } from '../utils/mathjax';
import { sound } from '../services/sound';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Clock, 
  CheckCircle2, 
  XCircle, 
  RotateCcw, 
  Award, 
  HelpCircle, 
  BookOpen, 
  ArrowRight,
  Flame,
  Gamepad2,
  Heart,
  ShieldAlert
} from 'lucide-react';

interface StudentPracticeProps {
  questions: MathQuestion[];
}

export const StudentPractice: React.FC<StudentPracticeProps> = ({ questions }) => {
  const [selectedTopic, setSelectedTopic] = useState<string>('all');
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(300); // 5 minutes
  const [timerRunning, setTimerRunning] = useState<boolean>(false);

  // Minigame states
  const [isMinigame, setIsMinigame] = useState<boolean>(false);
  const [gameHp, setGameHp] = useState<number>(3);
  const [gameScore, setGameScore] = useState<number>(0);
  const [gameTimeLeft, setGameTimeLeft] = useState<number>(20);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [shake, setShake] = useState<boolean>(false);

  // Available topics
  const topics = ['all', ...Array.from(new Set(questions.map(q => q.topic)))];

  const practiceQuestions = selectedTopic === 'all'
    ? questions
    : questions.filter(q => q.topic === selectedTopic);

  const currentQ = practiceQuestions[isMinigame ? currentIdx : currentIdx];

  // Re-run MathJax rendering whenever question changes or answers are submitted
  useMathJax([currentQ, isSubmitted, currentIdx]);

  // Timer effect for Normal Mode
  useEffect(() => {
    let interval: any = null;
    if (!isMinigame && timerRunning && timeLeft > 0 && !isSubmitted) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (!isMinigame && timeLeft === 0 && timerRunning && !isSubmitted) {
      handleSubmit();
    }
    return () => clearInterval(interval);
  }, [timerRunning, timeLeft, isSubmitted, isMinigame]);

  // Timer effect for Minigame Mode
  useEffect(() => {
    let interval: any = null;
    if (isMinigame && !gameOver && practiceQuestions.length > 0) {
      interval = setInterval(() => {
        setGameTimeLeft(prev => {
          if (prev <= 1) {
            handleMinigameWrong();
            return 20; // reset time for next q
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isMinigame, gameOver, currentIdx, practiceQuestions.length]);

  const handleMinigameWrong = () => {
    sound.playNegative();
    setShake(true);
    setTimeout(() => setShake(false), 500);
    setGameHp(prev => {
      if (prev <= 1) {
        setGameOver(true);
        return 0;
      }
      return prev - 1;
    });
    // Move to next question if alive
    if (gameHp > 1) {
      if (currentIdx < practiceQuestions.length - 1) {
        setCurrentIdx(currentIdx + 1);
      } else {
        setGameOver(true); // win but run out of questions
      }
    }
  };

  const handleMinigameCorrect = () => {
    sound.playPositive();
    setGameScore(prev => prev + 10 + gameTimeLeft);
    setGameTimeLeft(20);
    if (currentIdx < practiceQuestions.length - 1) {
      setCurrentIdx(currentIdx + 1);
    } else {
      setGameOver(true);
      fireConfetti();
    }
  };

  const handleMinigameSelect = (optIndex: number) => {
    if (gameOver) return;
    if (optIndex === currentQ.correctAnswer) {
      handleMinigameCorrect();
    } else {
      handleMinigameWrong();
    }
  };

  const startMinigame = () => {
    setIsMinigame(true);
    setGameHp(3);
    setGameScore(0);
    setCurrentIdx(0);
    setGameTimeLeft(20);
    setGameOver(false);
  };

  const handleSelectOption = (optIndex: number) => {
    if (isSubmitted) return;
    setSelectedAnswers(prev => ({
      ...prev,
      [currentIdx]: optIndex
    }));
  };

  const handleNext = () => {
    if (currentIdx < practiceQuestions.length - 1) {
      setCurrentIdx(currentIdx + 1);
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      setCurrentIdx(currentIdx - 1);
    }
  };

  const handleSubmit = () => {
    setIsSubmitted(true);
    setTimerRunning(false);

    // Calculate score
    let correctCount = 0;
    practiceQuestions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctAnswer) {
        correctCount++;
      }
    });

    const percent = practiceQuestions.length > 0 ? (correctCount / practiceQuestions.length) * 100 : 0;
    if (percent >= 80) {
      sound.playFanfare();
      fireConfetti();
    } else {
      sound.playPositive();
    }
  };

  const handleReset = () => {
    setSelectedAnswers({});
    setIsSubmitted(false);
    setCurrentIdx(0);
    setTimeLeft(300);
    setTimerRunning(true);
  };

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Score summary
  const score = practiceQuestions.reduce((acc, q, idx) => {
    return acc + (selectedAnswers[idx] === q.correctAnswer ? 1 : 0);
  }, 0);

  return (
    <div className="max-w-5xl mx-auto px-4 py-5 sm:px-6 space-y-6">
      {/* Top Banner & Topic Select */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-800">Luyện Đề Trắc Nghiệm Toán THPT</h2>
            <p className="text-xs text-slate-500">Rèn luyện tốc độ làm bài và củng cố phương pháp giải</p>
          </div>
        </div>

        {/* Topic filter & Timer */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-500 font-medium">Chủ đề:</span>
            <select
              value={selectedTopic}
              onChange={(e) => {
                setSelectedTopic(e.target.value);
                handleReset();
              }}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none"
            >
              <option value="all">Tất cả chủ đề ({questions.length} câu)</option>
              {topics.filter(t => t !== 'all').map((t, idx) => (
                <option key={idx} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* Timer Widget */}
          {!isMinigame && (
            <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-900 px-3 py-1.5 rounded-lg text-xs font-bold">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              <span>{formatTime(timeLeft)}</span>
            </div>
          )}

          <button
            onClick={() => setIsMinigame(!isMinigame)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${isMinigame ? 'bg-orange-600 text-white' : 'bg-orange-100 text-orange-700 hover:bg-orange-200'}`}
          >
            <Gamepad2 className="w-4 h-4" />
            <span>{isMinigame ? 'Thoát Game' : 'Minigame'}</span>
          </button>

          {!isMinigame && (
            <button
              onClick={handleReset}
              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600"
              title="Làm lại từ đầu"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {practiceQuestions.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-slate-200 text-xs text-slate-400">
          Chưa có câu hỏi nào trong chủ đề này. Bạn có thể nhờ Trợ lý AI tạo thêm câu hỏi.
        </div>
      ) : isMinigame ? (
        // --- MINIGAME MODE ---
        <div className="bg-slate-900 rounded-2xl p-6 shadow-2xl relative overflow-hidden min-h-[400px] flex flex-col items-center justify-center">
          {/* Game Header */}
          <div className="absolute top-4 left-6 right-6 flex items-center justify-between text-white">
            <div className="flex items-center gap-2">
              <span className="text-orange-400 font-bold flex items-center gap-1">
                <Flame className="w-5 h-5" /> Điểm: {gameScore}
              </span>
            </div>
            <div className="flex items-center gap-1">
              {[1, 2, 3].map(hp => (
                <Heart key={hp} className={`w-6 h-6 ${hp <= gameHp ? 'text-rose-500 fill-rose-500' : 'text-slate-700'}`} />
              ))}
            </div>
          </div>

          {gameOver ? (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-center text-white space-y-4 z-10">
              <ShieldAlert className="w-16 h-16 text-rose-500 mx-auto" />
              <h2 className="text-3xl font-black">GAME OVER</h2>
              <p className="text-slate-300">Tổng điểm của bạn: <span className="text-orange-400 font-bold text-xl">{gameScore}</span></p>
              <button onClick={startMinigame} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-full font-bold text-sm">Chơi Lại</button>
            </motion.div>
          ) : (
            <motion.div 
              animate={shake ? { x: [-10, 10, -10, 10, 0] } : {}} 
              transition={{ duration: 0.4 }}
              className="w-full max-w-2xl bg-slate-800/80 p-6 rounded-2xl border border-slate-700 backdrop-blur-md z-10"
            >
              <div className="flex justify-between items-center mb-4">
                <span className="text-xs font-bold text-blue-400">Câu hỏi {currentIdx + 1}/{practiceQuestions.length}</span>
                <span className={`text-sm font-bold px-3 py-1 rounded-full ${gameTimeLeft <= 5 ? 'bg-rose-500/20 text-rose-400' : 'bg-slate-700 text-slate-300'}`}>
                  ⏳ {gameTimeLeft}s
                </span>
              </div>
              <div className="text-lg text-white font-medium min-h-[80px]">
                {currentQ.content}
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
                {currentQ.options.map((opt, optIdx) => (
                  <button
                    key={optIdx}
                    onClick={() => handleMinigameSelect(optIdx)}
                    className="p-3 bg-slate-700 hover:bg-blue-600 text-white rounded-xl text-sm font-medium transition-colors text-left"
                  >
                    {String.fromCharCode(65 + optIdx)}. {opt}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Background particles */}
          <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at center, #ffffff 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
        </div>
      ) : (
        // --- NORMAL MODE ---
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Question Card (8 cols) */}
          <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">
                Câu {currentIdx + 1} / {practiceQuestions.length} ({currentQ.level})
              </span>
              <span className="text-xs text-slate-500 font-medium">
                {currentQ.topic} · Lớp {currentQ.grade}
              </span>
            </div>

            {/* Question Content */}
            <div className="text-base font-semibold text-slate-800 leading-relaxed">
              {currentQ.content}
            </div>

            {/* Options */}
            <div className="space-y-2.5 pt-2">
              {currentQ.options.map((opt, optIdx) => {
                const label = String.fromCharCode(65 + optIdx);
                const isSelected = selectedAnswers[currentIdx] === optIdx;
                const isCorrect = optIdx === currentQ.correctAnswer;

                let stateClasses = 'border-slate-200 bg-white hover:border-blue-300 text-slate-800';

                if (isSubmitted) {
                  if (isCorrect) {
                    stateClasses = 'border-emerald-500 bg-emerald-50 text-emerald-950 font-bold';
                  } else if (isSelected && !isCorrect) {
                    stateClasses = 'border-rose-500 bg-rose-50 text-rose-950 font-bold';
                  }
                } else if (isSelected) {
                  stateClasses = 'border-blue-600 bg-blue-50 text-blue-900 font-bold shadow-2xs';
                }

                return (
                  <button
                    key={optIdx}
                    onClick={() => handleSelectOption(optIdx)}
                    disabled={isSubmitted}
                    className={`w-full p-3.5 rounded-xl border text-left text-xs sm:text-sm font-medium transition-all flex items-center justify-between ${stateClasses}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                        isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {label}
                      </span>
                      <span>{opt}</span>
                    </div>

                    {isSubmitted && isCorrect && (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    )}
                    {isSubmitted && isSelected && !isCorrect && (
                      <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Explanation when submitted */}
            {isSubmitted && currentQ.explanation && (
              <div className="mt-4 p-4 rounded-xl bg-amber-50/70 border border-amber-200 text-xs sm:text-sm text-amber-950 space-y-1">
                <strong className="text-amber-800 block font-bold">Giải thích chi tiết:</strong>
                <div className="leading-relaxed">{currentQ.explanation}</div>
              </div>
            )}

            {/* Nav controls */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button
                onClick={handlePrev}
                disabled={currentIdx === 0}
                className="px-4 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40"
              >
                ← Câu trước
              </button>

              {!isSubmitted ? (
                <button
                  onClick={handleSubmit}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-2xs"
                >
                  Nộp bài chấm điểm
                </button>
              ) : (
                <div className="text-xs font-bold text-indigo-700">
                  Đã nộp bài ({score}/{practiceQuestions.length} câu đúng)
                </div>
              )}

              <button
                onClick={handleNext}
                disabled={currentIdx === practiceQuestions.length - 1}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold disabled:opacity-40"
              >
                Câu tiếp theo →
              </button>
            </div>
          </div>

          {/* Right: Question Palette & Score Board (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            {/* Score Board if Submitted */}
            {isSubmitted && (
              <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100 rounded-2xl p-5 text-center shadow-2xs space-y-3">
                <div className="w-12 h-12 rounded-full bg-indigo-600 text-white mx-auto flex items-center justify-center shadow-xs">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-extrabold text-base text-slate-800">Kết quả bài làm</h4>
                  <div className="text-2xl font-black text-indigo-700 mt-1">
                    {Math.round((score / practiceQuestions.length) * 10 * 10) / 10} / 10 điểm
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Đúng {score}/{practiceQuestions.length} câu trắc nghiệm
                  </p>
                </div>
                <button
                  onClick={handleReset}
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-2xs"
                >
                  Luyện tập lại
                </button>
              </div>
            )}

            {/* Question Selector Palette */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-3">
              <h4 className="font-bold text-xs text-slate-700 uppercase tracking-wider">
                Bảng câu hỏi ({practiceQuestions.length})
              </h4>

              <div className="grid grid-cols-5 gap-2">
                {practiceQuestions.map((_, idx) => {
                  const isAnswered = selectedAnswers[idx] !== undefined;
                  const isCurrent = idx === currentIdx;
                  let bg = 'bg-slate-100 text-slate-700 border-slate-200';

                  if (isSubmitted) {
                    const isCorrect = selectedAnswers[idx] === practiceQuestions[idx].correctAnswer;
                    bg = isCorrect 
                      ? 'bg-emerald-500 text-white border-emerald-600' 
                      : 'bg-rose-500 text-white border-rose-600';
                  } else if (isCurrent) {
                    bg = 'bg-blue-600 text-white border-blue-700 font-bold';
                  } else if (isAnswered) {
                    bg = 'bg-blue-100 text-blue-900 border-blue-300 font-semibold';
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => setCurrentIdx(idx)}
                      className={`h-9 rounded-lg border text-xs font-bold transition-all flex items-center justify-center ${bg}`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
