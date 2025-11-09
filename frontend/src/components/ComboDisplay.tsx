interface ComboDisplayProps {
  combo: number;
  visible: boolean;
}

export default function ComboDisplay({ combo, visible }: ComboDisplayProps) {
  if (!visible || combo === 0) return null;

  // Determine size/color based on combo level
  const getComboStyle = () => {
    if (combo >= 50) {
      return {
        color: 'text-lab-mint',
        scale: 'scale-150',
        glow: 'shadow-glow-mint',
        border: 'border-lab-mint',
        message: 'MAXIMUM NEURAL EFFICIENCY'
      };
    }
    if (combo >= 25) {
      return {
        color: 'text-lab-cyan',
        scale: 'scale-125',
        glow: 'shadow-glow-cyan',
        border: 'border-lab-cyan',
        message: 'OPTIMAL SYNAPTIC FUNCTION'
      };
    }
    if (combo >= 10) {
      return {
        color: 'text-lab-cyan',
        scale: 'scale-110',
        glow: 'shadow-glow-cyan',
        border: 'border-lab-cyan',
        message: 'NEURAL EFFICIENCY ENHANCED'
      };
    }
    return {
      color: 'text-lab-cyan',
      scale: 'scale-100',
      glow: '',
      border: 'border-lab-cyan',
      message: null
    };
  };

  const style = getComboStyle();

  return (
    <div className={`fixed top-24 right-8 ${style.scale} transition-all duration-300 z-40`}>
      <div
        className={`bg-black border-2 ${style.border} p-4 ${style.glow}`}
        style={{ borderRadius: '2px' }}
      >
        <div className="text-xs font-mono text-lab-text-tertiary uppercase tracking-wider">
          COMBO
        </div>
        <div className={`text-4xl font-mono font-bold ${style.color}`}>
          x{combo}
        </div>
        {style.message && (
          <div className="text-xs font-mono text-lab-mint uppercase mt-1 tracking-wider">
            {style.message}
          </div>
        )}
      </div>
    </div>
  );
}
