import React, { useEffect } from 'react';
import { legendaryConfetti } from '../utils/confetti';

interface LevelUpModalProps {
  oldLevel: number;
  newLevel: number;
  newTitle: string;
  onClose: () => void;
}

/**
 * MAXIMUM DOPAMINE LEVEL UP MODAL
 * Epic celebration for leveling up
 */
export default function LevelUpModal({
  oldLevel,
  newLevel,
  newTitle,
  onClose,
}: LevelUpModalProps) {
  useEffect(() => {
    legendaryConfetti();
  }, []);

  return (
    <div
      className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="max-w-lg w-full animate-scaleIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-500 via-orange-500 to-yellow-500 rounded-3xl opacity-50 blur-3xl animate-pulse"></div>

        {/* Content */}
        <div className="relative bg-gradient-to-br from-yellow-900/90 to-orange-900/90 border-4 border-yellow-500 rounded-3xl p-8 text-center shadow-2xl">
          {/* Icon */}
          <div className="text-8xl mb-4 animate-bounce">⬆️</div>

          {/* Title */}
          <h2 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-yellow-100 to-yellow-300 mb-4 animate-shimmerText">
            LEVEL UP!
          </h2>

          {/* Level Change */}
          <div className="flex items-center justify-center space-x-4 mb-6">
            <div className="text-4xl font-bold text-yellow-400">
              {oldLevel}
            </div>
            <div className="text-4xl">→</div>
            <div className="text-6xl font-black text-yellow-300 animate-pulse">
              {newLevel}
            </div>
          </div>

          {/* New Title */}
          <div className="bg-black/50 border-2 border-yellow-500/50 rounded-xl p-4 mb-6">
            <div className="text-sm text-yellow-500 uppercase tracking-wider mb-1">
              New Title Unlocked
            </div>
            <div className="text-2xl font-bold text-yellow-300">
              {newTitle}
            </div>
          </div>

          {/* Flavor Text */}
          <p className="text-lg text-yellow-200 mb-6">
            Your brain just sprouted new dendrites! 🧠
          </p>

          {/* Continue Button */}
          <button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 text-white font-black text-xl py-4 px-8 rounded-xl transition-all transform hover:scale-105 shadow-lg"
          >
            CONTINUE GRINDING
          </button>

          {/* Sparkles */}
          <div className="absolute -top-4 -left-4 text-4xl animate-spin-slow">✨</div>
          <div className="absolute -top-4 -right-4 text-4xl animate-spin-slow delay-1000">✨</div>
          <div className="absolute -bottom-4 -left-4 text-4xl animate-spin-slow delay-500">✨</div>
          <div className="absolute -bottom-4 -right-4 text-4xl animate-spin-slow delay-1500">✨</div>
        </div>
      </div>

      <style>{`
        @keyframes scaleIn {
          from {
            transform: scale(0.8);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        @keyframes shimmerText {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        @keyframes spinSlow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        .animate-scaleIn {
          animation: scaleIn 0.5s ease-out;
        }
        .animate-shimmerText {
          background-size: 200% 200%;
          animation: shimmerText 3s ease-in-out infinite;
        }
        .animate-spin-slow {
          animation: spinSlow 3s linear infinite;
        }
        .delay-500 {
          animation-delay: 0.5s;
        }
        .delay-1000 {
          animation-delay: 1s;
        }
        .delay-1500 {
          animation-delay: 1.5s;
        }
      `}</style>
    </div>
  );
}
