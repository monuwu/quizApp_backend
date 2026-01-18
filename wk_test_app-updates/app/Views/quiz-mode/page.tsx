'use client';

import Emoji from 'react-emoji-render';
import { useRouter } from 'next/navigation';
import QuizModeNavbar from '@/components/DefaultNavbar';
import { useTranslation } from 'react-i18next';
import { ChevronRight } from 'lucide-react';
import { useState } from 'react';

// Define constants outside the component to prevent re-creation on every render
const MODES = [
  {
    key: 'beginner',
    emoji: '🌱',
    titleKey: 'beginner',
    descKey: 'beginner_desc',
    questions: 10,
    color: 'bg-gradient-to-br from-green-400 to-green-600',
    shadow: 'shadow-green-200',
  },
  {
    key: 'intermediate',
    emoji: '🔥',
    titleKey: 'intermediate',
    descKey: 'intermediate_desc',
    questions: 10,
    color: 'bg-gradient-to-br from-yellow-400 to-orange-500',
    shadow: 'shadow-yellow-200',
    noteKey: 'requires',
  },
  {
    key: 'advanced',
    emoji: '🚀',
    titleKey: 'advanced',
    descKey: 'advanced_desc',
    questions: 10,
    color: 'bg-gradient-to-br from-purple-400 to-indigo-700',
    shadow: 'shadow-purple-200',
    noteKey: 'requires',
  },
];

export default function QuizLevelSelection() {
  const router = useRouter();
  const { t } = useTranslation();
  const [activeIdx, setActiveIdx] = useState<number | null>(null);

  return (
    <>
      <div className="flex flex-col items-center min-h-screen w-full bg-[url('/background.svg')] bg-cover px-4 pt-0 sm:pt-2 md:pt-4" style={{ marginTop: '-96px' }}>
        <div className="flex flex-col items-center gap-8 w-full max-w-[672px] h-auto justify-center flex-1">
          {/* Heading at the top */}
          <div className="flex flex-col gap-2 w-full items-center justify-center">
            <h1
              className="text-[32px] sm:text-[36px] leading-10 font-bold text-[#0F1729] text-center"
              style={{ fontFamily: 'Segoe UI' }}
            >
              {t('welcome')} <Emoji text="👋" />
            </h1>
            <p
              className="text-lg text-[#65758B] text-center"
              style={{ fontFamily: 'Inter' }}
            >
              {t('choose_level')}
            </p>
          </div>
          {/* Modes below heading */}
          <div className="flex flex-col gap-4 w-full">
            {MODES.map((mode, idx) => (
              <button
                key={mode.key}
                className={`flex flex-row items-start p-6 w-full min-h-[110px] sm:h-[130px] bg-white/95 border border-slate-200/50 shadow-xl backdrop-blur-md rounded-3xl gap-4 transition hover:scale-[1.02] active:scale-95 focus:outline-none`}
                style={{ boxShadow: '0px 8px 24px -8px rgba(0,0,0,0.12)' }}
                onMouseDown={() => setActiveIdx(idx)}
                onMouseUp={() => setActiveIdx(null)}
                onMouseLeave={() => setActiveIdx(null)}
                onClick={() => router.push(`/quiz?level=${mode.key}`)}
              >
                <div
                  className={`flex justify-center items-center w-14 h-14 sm:w-16 sm:h-16 rounded-2xl ${mode.color} ${mode.shadow}`}
                >
                  <Emoji text={mode.emoji} onlyEmojiClassName="text-3xl" />
                </div>
                <div className="flex flex-col items-start gap-1 flex-1">
                  <div className="flex flex-row items-center w-full">
                    <h3
                      className="font-bold text-lg sm:text-xl text-[#0F1729]"
                      style={{ fontFamily: 'Arial' }}
                    >
                      {t(mode.titleKey)}
                    </h3>
                  </div>
                  <span
                    className="text-sm text-[#65758B]"
                    style={{ fontFamily: 'Inter' }}
                  >
                    {t(mode.descKey)}
                  </span>
                  <div className="flex flex-row items-center gap-4 mt-2">
                    <span className="text-sm text-[#65758B]">
                      {mode.questions} {t('questions')}
                    </span>
                    {mode.noteKey && (
                      <span className="text-sm text-[#65758B]">
                        {t(mode.noteKey)}
                      </span>
                    )}
                  </div>
                </div>
                {activeIdx === idx && (
                  <div className="flex items-center ml-auto">
                    <ChevronRight size={28} className="text-[#65758B]" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}