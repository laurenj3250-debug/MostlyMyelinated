import React from 'react';

interface NeuroLabelProps {
  strength: number;
  label: string;
  emoji: string;
  size?: 'sm' | 'md' | 'lg';
  showPercentage?: boolean;
}

export default function NeuroLabel({
  strength,
  label,
  emoji,
  size = 'md',
  showPercentage = true,
}: NeuroLabelProps) {
  // Get color classes based on strength
  const getColorClasses = () => {
    if (strength < 20) return 'bg-gray-900 text-gray-100 border-gray-900';
    if (strength < 40) return 'bg-red-900 text-red-100 border-red-900';
    if (strength < 60) return 'bg-red-600 text-white border-red-600';
    if (strength < 75) return 'bg-orange-500 text-white border-orange-500';
    if (strength < 85) return 'bg-yellow-500 text-black border-yellow-500';
    if (strength < 95) return 'bg-green-600 text-white border-green-600';
    return 'bg-blue-500 text-white border-blue-500';
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-2 py-1 text-xs';
      case 'lg':
        return 'px-4 py-3 text-lg';
      default:
        return 'px-3 py-2 text-sm';
    }
  };

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-lg font-semibold border-2 ${getColorClasses()} ${getSizeClasses()}`}
    >
      <span>{emoji}</span>
      <span>{label}</span>
      {showPercentage && <span>({strength}%)</span>}
    </div>
  );
}
