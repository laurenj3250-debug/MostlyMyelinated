import { useState } from 'react';
import { DueCard } from '../types';
import { Brain, Eye } from 'lucide-react';

interface Props {
  card: DueCard;
  onReview: (rating: number) => void;
}

export default function FlashCard({ card, onReview }: Props) {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleReview = (rating: number) => {
    onReview(rating);
    setIsFlipped(false); // Reset for next card
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Node context badge */}
      <div className="mb-6 flex items-center justify-center gap-2">
        <div className="bg-white shadow-lg rounded-full px-6 py-3 border-2 border-blue-100">
          <div className="flex items-center gap-3">
            <Brain className="w-5 h-5 text-blue-600" />
            <span className="font-semibold text-gray-900">{card.nodeName}</span>
            <span className="text-gray-400">•</span>
            <span className="text-sm font-medium text-gray-600">
              Strength: <span className="text-blue-600 font-bold">{card.nodeStrength}%</span>
            </span>
          </div>
        </div>
      </div>

      {/* Card */}
      <div
        className={`relative overflow-hidden bg-gradient-to-br from-white to-blue-50
                    rounded-3xl shadow-2xl p-8 md:p-12
                    min-h-[400px] flex flex-col justify-center items-center
                    cursor-pointer border-2 border-blue-100
                    transition-all duration-500
                    ${isFlipped ? 'scale-[0.98]' : 'hover:scale-[1.02]'}
                    ${!isFlipped ? 'animate-scale-in' : ''}`}
        onClick={() => setIsFlipped(!isFlipped)}
      >
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-blue-400 rounded-full mix-blend-multiply
                        filter blur-3xl opacity-10" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-400 rounded-full mix-blend-multiply
                        filter blur-3xl opacity-10" />

        <div className="relative z-10 w-full">
          {!isFlipped ? (
            <div className="text-center animate-fade-in">
              <p className="text-3xl md:text-4xl font-bold mb-6 leading-tight text-gray-900">
                {card.front}
              </p>
              {card.hint && (
                <div className="mt-8 p-4 bg-yellow-50 border-2 border-yellow-200 rounded-xl">
                  <p className="text-sm font-medium text-yellow-900">
                    <span className="font-bold">Hint:</span> {card.hint}
                  </p>
                </div>
              )}
              <div className="mt-12 flex items-center justify-center gap-2 text-blue-600 animate-float">
                <Eye className="w-5 h-5" />
                <p className="text-sm font-semibold">Click to reveal answer</p>
              </div>
            </div>
          ) : (
            <div className="text-center animate-fade-in">
              <p className="text-xl md:text-2xl text-gray-600 mb-6">{card.front}</p>
              <div className="border-t-2 border-blue-200 pt-6 mt-6">
                <p className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
                  {card.back}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Answer buttons */}
      {isFlipped && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mt-8 animate-slide-in">
          <button
            onClick={(e) => { e.stopPropagation(); handleReview(0); }}
            className="btn bg-gradient-to-r from-red-600 to-red-700 text-white
                      hover:from-red-700 hover:to-red-800 py-5 md:py-6
                      shadow-xl hover:shadow-2xl transform hover:scale-105
                      transition-all duration-200"
          >
            <div className="flex flex-col">
              <span className="text-base md:text-lg font-bold">Again</span>
              <span className="text-xs opacity-90 mt-1">&lt;1m</span>
            </div>
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); handleReview(1); }}
            className="btn bg-gradient-to-r from-orange-500 to-orange-600 text-white
                      hover:from-orange-600 hover:to-orange-700 py-5 md:py-6
                      shadow-xl hover:shadow-2xl transform hover:scale-105
                      transition-all duration-200"
          >
            <div className="flex flex-col">
              <span className="text-base md:text-lg font-bold">Hard</span>
              <span className="text-xs opacity-90 mt-1">~6m</span>
            </div>
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); handleReview(2); }}
            className="btn bg-gradient-to-r from-green-600 to-green-700 text-white
                      hover:from-green-700 hover:to-green-800 py-5 md:py-6
                      shadow-xl hover:shadow-2xl transform hover:scale-105
                      transition-all duration-200"
          >
            <div className="flex flex-col">
              <span className="text-base md:text-lg font-bold">Good</span>
              <span className="text-xs opacity-90 mt-1">~10m</span>
            </div>
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); handleReview(3); }}
            className="btn bg-gradient-to-r from-blue-600 to-blue-700 text-white
                      hover:from-blue-700 hover:to-blue-800 py-5 md:py-6
                      shadow-xl hover:shadow-2xl transform hover:scale-105
                      transition-all duration-200"
          >
            <div className="flex flex-col">
              <span className="text-base md:text-lg font-bold">Easy</span>
              <span className="text-xs opacity-90 mt-1">~4d</span>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}
