import React, { useEffect, useState } from 'react';
import { ArrowLeft, Lightbulb } from 'lucide-react';

export interface Question {
  id: string;
  label: string;
  question: string;
  subtext: string;
  probing: string[];
}

interface QuestionScreenProps {
  question: Question;
  questionIndex: number;
  totalQuestions: number;
  value: string;
  onChange: (val: string) => void;
  onNext: () => void;
  onBack: () => void;
}

const ACTION_BAR_HEIGHT = 64;

export function QuestionScreen({
  question,
  questionIndex,
  totalQuestions,
  value,
  onChange,
  onNext,
  onBack
}: QuestionScreenProps) {
  const [timeLeft, setTimeLeft] = useState(60);

  useEffect(() => {
    setTimeLeft(60);
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev > 0 ? prev - 1 : 0);
    }, 1000);
    return () => clearInterval(timer);
  }, [question.id]);

  const showExtraThinking = value.length > 0 && value.length < 50;
  const progressPercentage = (questionIndex + 1) / totalQuestions * 100;

  return (
    <div
      className="flex flex-col w-full bg-brand-dark text-white relative"
      style={{ minHeight: '100dvh', paddingBottom: ACTION_BAR_HEIGHT }}>

      <div className="w-full pt-6 sm:pt-8 md:pt-10 px-4 sm:px-6 md:px-8">
        <div className="text-brand-accent text-xs sm:text-sm font-medium mb-2 text-center">
          Question {questionIndex + 1} of {totalQuestions}
        </div>
        <div className="w-full h-1 bg-brand-dark border border-brand-accent/30 rounded-full overflow-hidden">
          <div
            className="h-full bg-brand-accent transition-all duration-300 ease-out"
            style={{ width: `${progressPercentage}%` }} />
          
        </div>
      </div>

      <div className="flex-1 px-4 sm:px-6 md:px-8 pt-8 md:pt-12 flex flex-col">
        <div className="text-brand-accent text-sm md:text-base font-bold tracking-widest uppercase mb-3">
          {question.label}
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-2 leading-tight">
          {question.question}
        </h1>
        <p className="text-brand-surface/80 italic text-base md:text-lg mb-6 md:mb-8">
          {question.subtext}
        </p>

        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Type your answer here..."
          className="w-full bg-white text-brand-dark rounded-xl p-4 md:p-6 text-base md:text-lg focus:outline-none focus:ring-2 focus:ring-brand-accent resize-none shadow-inner"
          rows={4} />
        

        {showExtraThinking &&
        <div className="mt-4 md:mt-6 bg-white/5 border border-brand-accent/20 rounded-xl p-4 md:p-6">
            <div className="flex items-center gap-2 text-brand-accent mb-2">
              <Lightbulb size={16} className="md:w-5 md:h-5" />
              <span className="text-xs md:text-sm font-bold uppercase tracking-wider">
                Extra thinking
              </span>
            </div>
            <ul className="space-y-2 md:space-y-3">
              {question.probing.map((probe, idx) =>
            <li
              key={idx}
              className="text-brand-surface/90 text-sm md:text-base flex items-start gap-2">

                  <span className="text-brand-accent mt-0.5">•</span>
                  <span>{probe}</span>
                </li>
            )}
            </ul>
          </div>
        }
      </div>

      <div
        className="fixed bottom-0 left-0 right-0 max-w-[390px] sm:max-w-md md:max-w-lg lg:max-w-2xl mx-auto bg-brand-dark border-t border-white/10 px-4 sm:px-6 md:px-8 flex items-center justify-between z-20"
        style={{ height: ACTION_BAR_HEIGHT }}>

        <button
          onClick={onBack}
          disabled={questionIndex === 0}
          className={`p-3 md:p-4 rounded-lg transition-colors ${
          questionIndex === 0 ?
          'opacity-0 pointer-events-none' :
          'text-white hover:bg-white/10'}`
          }
          aria-label="Go back">

          <ArrowLeft size={24} className="md:w-7 md:h-7" />
        </button>

        <div className="text-brand-surface/60 font-mono text-sm md:text-base font-medium">
          0:{timeLeft.toString().padStart(2, '0')}
        </div>

        <button
          onClick={onNext}
          className="bg-brand-cta text-brand-dark px-8 md:px-12 py-3 md:py-4 rounded-lg font-bold text-base md:text-lg hover:bg-brand-cta/90 transition-colors shadow-lg">

          Next
        </button>
      </div>
    </div>);

}