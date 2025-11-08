
interface Props {
  strength: number;
  label?: string;
  emoji?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function StrengthBadge({ strength, label, emoji, size = 'md' }: Props) {
  const getColor = () => {
    if (strength < 20) return 'bg-black text-white';
    if (strength < 40) return 'bg-strength-darkred text-white';
    if (strength < 60) return 'bg-strength-red text-white';
    if (strength < 75) return 'bg-strength-orange text-white';
    if (strength < 85) return 'bg-strength-yellow text-gray-900';
    if (strength < 95) return 'bg-strength-green text-white';
    return 'bg-strength-blue text-white';
  };

  const getSize = () => {
    if (size === 'sm') return 'text-xs px-2 py-1';
    if (size === 'lg') return 'text-lg px-4 py-2';
    return 'text-sm px-3 py-1.5';
  };

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full font-semibold ${getColor()} ${getSize()}`}
    >
      {emoji && <span>{emoji}</span>}
      <span>{strength}%</span>
      {label && <span className="font-normal">{label}</span>}
    </div>
  );
}
