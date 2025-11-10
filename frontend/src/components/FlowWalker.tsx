import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, X, CheckCircle } from 'lucide-react';

interface FlowStep {
  id: string;
  stepNumber: number;
  title: string;
  content: string;
  decisionPoint: boolean;
  nextSteps?: Array<{ condition: string; nextStepNumber: number }>;
  imageUrl?: string;
}

interface FlowWalkerProps {
  isOpen: boolean;
  onClose: () => void;
  nodeName: string;
  steps: FlowStep[];
}

export default function FlowWalker({ isOpen, onClose, nodeName, steps }: FlowWalkerProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (isOpen) {
      setCurrentStepIndex(0);
      setCompletedSteps(new Set());
    }
  }, [isOpen]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight' && currentStepIndex < steps.length - 1) {
        handleNext();
      } else if (e.key === 'ArrowLeft' && currentStepIndex > 0) {
        handlePrevious();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentStepIndex, steps.length, onClose]);

  if (!isOpen || steps.length === 0) return null;

  const currentStep = steps[currentStepIndex];
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  const handleNext = () => {
    setCompletedSteps(prev => new Set(prev).add(currentStepIndex));
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const handleJumpToStep = (index: number) => {
    setCurrentStepIndex(index);
  };

  const isStepCompleted = (index: number) => completedSteps.has(index);
  const isLastStep = currentStepIndex === steps.length - 1;

  return (
    <div
      className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-black border-2 border-lab-cyan max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-[0_0_30px_rgba(0,217,255,0.3)]"
        style={{ borderRadius: '2px' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="border-b-2 border-lab-cyan/30 p-6 bg-lab-card/30">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="text-xs font-mono text-lab-mint uppercase mb-2">
                CLINICAL FLOW MODE
              </div>
              <h2 className="text-2xl font-mono font-bold text-lab-cyan mb-3">
                {nodeName}
              </h2>
              <div className="flex items-center gap-4 text-sm font-mono text-lab-text-secondary">
                <span>STEP {currentStep.stepNumber} OF {steps.length}</span>
                <span>•</span>
                <span className="text-lab-cyan">{Math.round(progress)}% COMPLETE</span>
              </div>
            </div>

            {/* Close button */}
            <button
              onClick={onClose}
              className="p-2 hover:bg-lab-alert/20 border border-lab-border hover:border-lab-alert text-lab-text-tertiary hover:text-lab-alert transition-all ml-4"
              style={{ borderRadius: '2px' }}
              title="Close (ESC)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Progress bar */}
          <div className="mt-4 h-2 bg-lab-card border border-lab-cyan/20 overflow-hidden" style={{ borderRadius: '1px' }}>
            <div
              className="h-full bg-lab-cyan transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Step Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-lab-background/50">
          {/* Step indicator */}
          {currentStep.decisionPoint && (
            <div className="mb-4 px-4 py-2 bg-orange-500/20 border-l-4 border-orange-500">
              <span className="text-xs font-mono font-bold uppercase text-orange-500">
                ⚠ DECISION POINT
              </span>
            </div>
          )}

          {/* Step title */}
          <h3 className="text-xl font-mono font-bold text-lab-text-primary mb-4">
            {currentStep.title}
          </h3>

          {/* Step content */}
          <div className="prose prose-invert prose-sm max-w-none mb-6">
            <div className="text-lab-text-secondary font-mono whitespace-pre-wrap leading-relaxed">
              {currentStep.content}
            </div>
          </div>

          {/* Image if available */}
          {currentStep.imageUrl && (
            <div className="mb-6 border-2 border-lab-border p-4" style={{ borderRadius: '2px' }}>
              <img
                src={currentStep.imageUrl}
                alt={currentStep.title}
                className="max-w-full h-auto"
              />
            </div>
          )}

          {/* Decision branches if applicable */}
          {currentStep.decisionPoint && currentStep.nextSteps && (
            <div className="bg-lab-card/30 border border-lab-border/30 p-4 mb-6" style={{ borderRadius: '2px' }}>
              <h4 className="text-sm font-mono font-bold uppercase text-lab-mint mb-3">
                NEXT STEPS DEPEND ON:
              </h4>
              <div className="space-y-2">
                {currentStep.nextSteps.map((branch, idx) => (
                  <div
                    key={idx}
                    className="text-sm font-mono text-lab-text-primary flex items-start gap-2"
                  >
                    <span className="text-lab-mint flex-shrink-0 mt-1">→</span>
                    <span>
                      <span className="text-lab-cyan font-bold">{branch.condition}</span>
                      {' '}<span className="text-lab-text-tertiary">→ Step {branch.nextStepNumber}</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Step Navigator (Thumbnail list) */}
        <div className="border-t-2 border-lab-cyan/30 p-4 bg-lab-card/30">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {steps.map((step, index) => (
              <button
                key={step.id}
                onClick={() => handleJumpToStep(index)}
                className={`flex-shrink-0 px-3 py-2 text-xs font-mono border transition-all ${
                  index === currentStepIndex
                    ? 'border-lab-cyan bg-lab-cyan/20 text-lab-cyan'
                    : isStepCompleted(index)
                    ? 'border-lab-mint/50 bg-lab-mint/10 text-lab-mint'
                    : 'border-lab-border text-lab-text-tertiary hover:border-lab-cyan/50'
                }`}
                style={{ borderRadius: '2px' }}
              >
                <div className="flex items-center gap-1">
                  {isStepCompleted(index) && (
                    <CheckCircle className="w-3 h-3" />
                  )}
                  <span>{step.stepNumber}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Footer actions */}
        <div className="border-t-2 border-lab-cyan/30 p-4 bg-lab-card/30 flex justify-between gap-3">
          <button
            onClick={handlePrevious}
            disabled={currentStepIndex === 0}
            className={`px-4 py-2 border-2 font-mono uppercase transition-all flex items-center gap-2 ${
              currentStepIndex === 0
                ? 'border-lab-border/30 text-lab-text-tertiary opacity-50 cursor-not-allowed'
                : 'border-lab-border text-lab-text-primary hover:border-lab-cyan hover:text-lab-cyan'
            }`}
            style={{ borderRadius: '2px' }}
          >
            <ChevronLeft className="w-4 h-4" />
            PREVIOUS
          </button>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border-2 border-lab-border text-lab-text-primary hover:border-lab-alert hover:text-lab-alert font-mono uppercase transition-all"
              style={{ borderRadius: '2px' }}
            >
              EXIT FLOW
            </button>

            <button
              onClick={handleNext}
              disabled={isLastStep}
              className={`px-4 py-2 border-2 font-mono uppercase font-bold transition-all flex items-center gap-2 ${
                isLastStep
                  ? 'border-lab-mint bg-lab-mint/20 text-lab-mint'
                  : 'bg-lab-cyan border-lab-cyan text-black hover:bg-lab-cyan/80'
              }`}
              style={{ borderRadius: '2px' }}
            >
              {isLastStep ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  FLOW COMPLETE
                </>
              ) : (
                <>
                  NEXT STEP
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
