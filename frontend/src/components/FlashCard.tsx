import { useState, useEffect } from 'react';
import { DueCard } from '../types';

interface Props {
  card: DueCard;
  onReview: (rating: number) => void;
}

export default function FlashCard({ card, onReview }: Props) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [feedback, setFeedback] = useState<{ message: string; color: string } | null>(null);

  // Reset card state when card changes
  useEffect(() => {
    setIsFlipped(false);
    setShowHint(false);
  }, [card.id]);

  const getMicroFeedback = (rating: number, nodeStrength: number) => {
    const messages = {
      0: { // Again
        weak: ["CRITICAL: Neural pathway requires immediate intervention", "LESION DETECTED: Myelin degradation observed", "ASSESSMENT FAILED: Immediate repetition required"],
        strong: ["UNEXPECTED: Synapse misfire recorded", "ANOMALY: Pattern recognition compromised", "DIAGNOSTIC: Memory trace degradation"]
      },
      1: { // Hard
        weak: ["MARGINAL: Partial pathway activation detected", "SUBOPTIMAL: Neural efficiency below threshold", "IMPROVING: Synaptic connection strengthening"],
        strong: ["PARTIAL RECALL: Pattern recognition delayed", "ACCEPTABLE: Minor latency observed", "DIAGNOSTIC: Consolidation in progress"]
      },
      2: { // Good
        weak: ["BREAKTHROUGH: Pathway restoration detected", "POSITIVE: Synaptic efficiency increasing", "SUCCESS: Neural integrity confirmed"],
        strong: ["OPTIMAL: Pattern recognition successful", "CONFIRMED: Pathway fully functional", "VALIDATED: Memory trace stable"]
      },
      3: { // Easy
        weak: ["EXCEPTIONAL: Rapid pathway restoration", "MAXIMUM EFFICIENCY: Pattern mastery achieved", "CLINICAL EXCELLENCE: Neural hyperfunction"],
        strong: ["HYPERREFLEXIC: Instantaneous recall", "MASTERY LEVEL: Perfect pattern execution", "DIAGNOSTIC PERFECTION: Textbook response"]
      }
    };

    const category = nodeStrength < 60 ? 'weak' : 'strong';
    const options = messages[rating as keyof typeof messages][category as keyof typeof messages[0]];
    const message = options[Math.floor(Math.random() * options.length)];

    const colors = {
      0: 'bg-lab-alert border-lab-alert',
      1: 'bg-orange-500 border-orange-500',
      2: 'bg-lab-cyan border-lab-cyan',
      3: 'bg-lab-mint border-lab-mint',
    };

    return { message, color: colors[rating as keyof typeof colors] };
  };

  const handleReview = (rating: number) => {
    // Show micro-feedback
    const feedbackData = getMicroFeedback(rating, card.nodeStrength);
    setFeedback(feedbackData);

    // Hide feedback after 2.5 seconds
    setTimeout(() => {
      setFeedback(null);
      onReview(rating);
    }, 2500);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (feedback) return; // Ignore during feedback

      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        setIsFlipped(!isFlipped);
      } else if (isFlipped) {
        // Review shortcuts (only when flipped)
        if (e.key === '1') handleReview(0); // Again
        if (e.key === '2') handleReview(1); // Hard
        if (e.key === '3') handleReview(2); // Good
        if (e.key === '4') handleReview(3); // Easy
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isFlipped, feedback]);

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Card */}
      <div
        className="bg-black border-2 border-lab-cyan/50 shadow-2xl shadow-lab-cyan/10 p-8 md:p-12 min-h-[400px] flex flex-col cursor-pointer transition-all duration-300 hover:border-lab-cyan"
        style={{ borderRadius: '2px' }}
        onClick={() => !feedback && setIsFlipped(!isFlipped)}
      >
        {/* Card Metadata Header */}
        <div className="border-b border-lab-cyan/30 pb-3 mb-4">
          <div className="flex flex-wrap justify-between items-center gap-2 text-xs font-mono text-lab-text-tertiary">
            <span>NODE: {card.nodeName.toUpperCase()}</span>
            <span>STRENGTH: {card.nodeStrength}%</span>
            <span>TYPE: {card.cardType?.toUpperCase() || 'RECALL'}</span>
          </div>
        </div>

        {/* Card Content */}
        <div className="flex-1 flex flex-col justify-center">
          {!isFlipped ? (
            <div className="animate-fade-in">
              {/* Front Side - Stimulus */}
              <div className="mb-4">
                <div className="text-xs font-mono uppercase text-lab-cyan tracking-wider mb-2">STIMULUS:</div>
                <div className="bg-lab-card/30 p-4 border border-lab-border/50" style={{ borderRadius: '2px' }}>
                  <p className="font-mono text-lab-text-primary text-lg leading-relaxed">
                    {card.front}
                  </p>
                </div>
              </div>

              {/* Hint Section */}
              {card.hint && (
                <div className="mt-6">
                  {!showHint ? (
                    <button
                      onClick={(e) => { e.stopPropagation(); setShowHint(true); }}
                      className="bg-lab-card border border-lab-border text-lab-text-secondary hover:border-lab-cyan hover:text-lab-cyan px-4 py-2 font-mono text-sm uppercase transition-all"
                      style={{ borderRadius: '2px' }}
                    >
                      DIAGNOSTIC HINT
                    </button>
                  ) : (
                    <div className="bg-lab-card/50 border-l-2 border-lab-mint p-3 text-sm font-mono text-lab-mint animate-fade-in" style={{ borderRadius: '2px' }}>
                      {card.hint}
                    </div>
                  )}
                </div>
              )}

              {/* Flip instruction */}
              <div className="mt-8 text-center text-xs font-mono text-lab-text-tertiary uppercase tracking-wider opacity-70">
                [SPACE] TO REVEAL RESPONSE
              </div>
            </div>
          ) : (
            <div className="animate-fade-in">
              {/* Back Side - Response */}
              <div className="mb-4">
                <div className="text-xs font-mono uppercase text-lab-cyan tracking-wider mb-2">STIMULUS:</div>
                <div className="bg-lab-card/30 p-3 border border-lab-border/50" style={{ borderRadius: '2px' }}>
                  <p className="font-mono text-lab-text-secondary text-base">
                    {card.front}
                  </p>
                </div>
              </div>

              <div className="mb-4">
                <div className="text-xs font-mono uppercase text-lab-mint tracking-wider mb-2">RESPONSE:</div>
                <div className="bg-lab-card/30 p-4 border border-lab-border/50" style={{ borderRadius: '2px' }}>
                  <p className="font-mono text-lab-text-primary text-lg leading-relaxed">
                    {card.back}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Micro-feedback overlay */}
      {feedback && (
        <div className="mt-6 animate-scale-in">
          <div className={`${feedback.color}/10 border-2 ${feedback.color} text-white p-6 text-center font-mono uppercase tracking-wide`} style={{ borderRadius: '2px' }}>
            <p className="text-sm md:text-base font-bold">
              {feedback.message}
            </p>
          </div>
        </div>
      )}

      {/* Answer buttons */}
      {isFlipped && !feedback && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-6 animate-slide-in">
          {/* FAILED ASSESSMENT */}
          <button
            onClick={(e) => { e.stopPropagation(); handleReview(0); }}
            className="flex-1 bg-lab-alert/10 border-2 border-lab-alert text-lab-alert hover:bg-lab-alert/20 py-4 font-mono uppercase font-bold transition-all"
            style={{ borderRadius: '2px' }}
          >
            <div className="text-xs opacity-70">[1]</div>
            <div className="text-sm">FAILED</div>
            <div className="text-xs opacity-70">ASSESSMENT</div>
          </button>

          {/* PARTIAL RECALL */}
          <button
            onClick={(e) => { e.stopPropagation(); handleReview(1); }}
            className="flex-1 bg-orange-500/10 border-2 border-orange-500 text-orange-500 hover:bg-orange-500/20 py-4 font-mono uppercase font-bold transition-all"
            style={{ borderRadius: '2px' }}
          >
            <div className="text-xs opacity-70">[2]</div>
            <div className="text-sm">PARTIAL</div>
            <div className="text-xs opacity-70">RECALL</div>
          </button>

          {/* SUCCESSFUL RECALL */}
          <button
            onClick={(e) => { e.stopPropagation(); handleReview(2); }}
            className="flex-1 bg-lab-cyan/10 border-2 border-lab-cyan text-lab-cyan hover:bg-lab-cyan/20 py-4 font-mono uppercase font-bold transition-all"
            style={{ borderRadius: '2px' }}
          >
            <div className="text-xs opacity-70">[3]</div>
            <div className="text-sm">SUCCESSFUL</div>
            <div className="text-xs opacity-70">RECALL</div>
          </button>

          {/* PERFECT RECALL */}
          <button
            onClick={(e) => { e.stopPropagation(); handleReview(3); }}
            className="flex-1 bg-lab-mint/10 border-2 border-lab-mint text-lab-mint hover:bg-lab-mint/20 py-4 font-mono uppercase font-bold transition-all"
            style={{ borderRadius: '2px' }}
          >
            <div className="text-xs opacity-70">[4]</div>
            <div className="text-sm">PERFECT</div>
            <div className="text-xs opacity-70">RECALL</div>
          </button>
        </div>
      )}
    </div>
  );
}
