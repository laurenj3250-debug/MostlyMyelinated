import React, { useState } from 'react';
import { DueCard } from '../types';

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
    <div className="w-full max-w-2xl mx-auto">
      {/* Node context */}
      <div className="mb-4 text-sm text-gray-600">
        <span className="font-medium">{card.nodeName}</span>
        <span className="mx-2">•</span>
        <span>Strength: {card.nodeStrength}%</span>
      </div>

      {/* Card */}
      <div
        className="card min-h-[300px] flex flex-col justify-center items-center cursor-pointer"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        {!isFlipped ? (
          <div className="text-center">
            <p className="text-2xl font-medium mb-4">{card.front}</p>
            {card.hint && (
              <p className="text-sm text-gray-500 italic">Hint: {card.hint}</p>
            )}
            <p className="text-sm text-gray-400 mt-8">Click to reveal</p>
          </div>
        ) : (
          <div className="text-center w-full">
            <p className="text-xl text-gray-600 mb-4">{card.front}</p>
            <div className="border-t pt-4">
              <p className="text-2xl font-medium">{card.back}</p>
            </div>
          </div>
        )}
      </div>

      {/* Answer buttons */}
      {isFlipped && (
        <div className="grid grid-cols-4 gap-3 mt-6">
          <button
            onClick={() => handleReview(0)}
            className="btn bg-red-600 text-white hover:bg-red-700 py-4"
          >
            Again
            <div className="text-xs opacity-75 mt-1">&lt;1m</div>
          </button>
          <button
            onClick={() => handleReview(1)}
            className="btn bg-orange-500 text-white hover:bg-orange-600 py-4"
          >
            Hard
            <div className="text-xs opacity-75 mt-1">~6m</div>
          </button>
          <button
            onClick={() => handleReview(2)}
            className="btn bg-green-600 text-white hover:bg-green-700 py-4"
          >
            Good
            <div className="text-xs opacity-75 mt-1">~10m</div>
          </button>
          <button
            onClick={() => handleReview(3)}
            className="btn bg-blue-600 text-white hover:bg-blue-700 py-4"
          >
            Easy
            <div className="text-xs opacity-75 mt-1">~4d</div>
          </button>
        </div>
      )}
    </div>
  );
}
