
interface Props {
  strength: number;
  label?: string;
  emoji?: string;
  size?: 'sm' | 'md' | 'lg';
  showProgress?: boolean;
}

export default function StrengthBadge({ strength, label, emoji, size = 'md', showProgress = false }: Props) {
  const getGradientAndStyles = () => {
    if (strength < 20) {
      return {
        gradient: 'bg-gradient-to-r from-neuro-brain-dead-start to-neuro-brain-dead-end',
        textColor: 'text-white',
        shadow: '',
        glow: '',
      };
    }
    if (strength < 40) {
      return {
        gradient: 'bg-gradient-to-r from-neuro-lmn-tetraplegic-start to-neuro-lmn-tetraplegic-end',
        textColor: 'text-white',
        shadow: 'shadow-md',
        glow: '',
      };
    }
    if (strength < 60) {
      return {
        gradient: 'bg-gradient-to-r from-neuro-non-ambulatory-start to-neuro-non-ambulatory-end',
        textColor: 'text-white',
        shadow: 'shadow-md',
        glow: strength < 40 ? 'shadow-glow-red' : '',
      };
    }
    if (strength < 75) {
      return {
        gradient: 'bg-gradient-to-r from-neuro-ambulatory-ataxic-start to-neuro-ambulatory-ataxic-end',
        textColor: 'text-white',
        shadow: 'shadow-md',
        glow: '',
      };
    }
    if (strength < 85) {
      return {
        gradient: 'bg-gradient-to-r from-neuro-mild-paresis-start to-neuro-mild-paresis-end',
        textColor: 'text-gray-900',
        shadow: 'shadow-md',
        glow: '',
      };
    }
    if (strength < 95) {
      return {
        gradient: 'bg-gradient-to-r from-neuro-bar-start to-neuro-bar-end',
        textColor: 'text-white',
        shadow: 'shadow-md',
        glow: 'shadow-glow-green',
      };
    }
    return {
      gradient: 'bg-gradient-to-r from-neuro-hyperreflexic-start to-neuro-hyperreflexic-end',
      textColor: 'text-white',
      shadow: 'shadow-lg',
      glow: 'shadow-glow-md',
    };
  };

  const getSize = () => {
    if (size === 'sm') return {
      text: 'text-xs',
      padding: 'px-3 py-1.5',
      emoji: 'text-sm',
      gap: 'gap-1.5',
    };
    if (size === 'lg') return {
      text: 'text-xl',
      padding: 'px-6 py-3',
      emoji: 'text-3xl',
      gap: 'gap-3',
    };
    return {
      text: 'text-sm',
      padding: 'px-4 py-2',
      emoji: 'text-lg',
      gap: 'gap-2',
    };
  };

  const styles = getGradientAndStyles();
  const sizeStyles = getSize();
  const isPoor = strength < 60;

  return (
    <div className="inline-flex flex-col gap-2">
      <div
        className={`
          inline-flex items-center rounded-full font-bold
          ${styles.gradient}
          ${styles.textColor}
          ${styles.shadow}
          ${styles.glow}
          ${sizeStyles.padding}
          ${sizeStyles.gap}
          ${sizeStyles.text}
          ${isPoor ? 'animate-pulse-glow' : ''}
          transition-all duration-300
          hover:scale-105
        `}
      >
        {emoji && <span className={sizeStyles.emoji}>{emoji}</span>}
        <span className="font-extrabold">{strength}%</span>
        {label && <span className="font-semibold opacity-90">{label}</span>}
      </div>

      {showProgress && (
        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <div
            className={`h-full ${styles.gradient} transition-all duration-500`}
            style={{ width: `${strength}%` }}
          />
        </div>
      )}
    </div>
  );
}
