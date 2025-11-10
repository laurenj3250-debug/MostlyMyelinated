import { useState, useRef, KeyboardEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../components/ToastContainer';
import { facts } from '../services/api';

interface ParsedVariant {
  kind: 'basic' | 'cloze' | 'explain';
  front: string;
  back: string;
  confidence: number;
}

interface ParsedFact {
  original: string;
  cleaned: string;
  factType: string;
  confidence: number;
  nodeMatches: Array<{
    id: string;
    title: string;
    confidence: number;
  }>;
  newNodeProposal: {
    title: string;
    parentNodeId: string;
    reason: string;
  } | null;
  variants: ParsedVariant[];
  factId: string;
  variantIds: string[];
}

export default function QuickNotes() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [notesText, setNotesText] = useState('');
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [parsedFacts, setParsedFacts] = useState<ParsedFact[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeVariant, setActiveVariant] = useState<'basic' | 'cloze' | 'explain'>('basic');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleGenerate = async () => {
    if (!notesText.trim()) {
      addToast({ message: 'Please enter some notes', type: 'error' });
      return;
    }

    // Split notes by newlines
    const noteLines = notesText
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);

    if (noteLines.length === 0) {
      addToast({ message: 'Please enter some notes', type: 'error' });
      return;
    }

    if (noteLines.length > 20) {
      addToast({ message: 'Maximum 20 notes per batch', type: 'error' });
      return;
    }

    setLoading(true);
    try {
      const response = await facts.parse({
        notes: noteLines,
        topic: topic.trim() || undefined,
      });

      setParsedFacts(response.data.parsed);
      setCurrentIndex(0);
      setActiveVariant('basic');
      addToast({ message: `Generated ${response.data.count} facts!`, type: 'success' });
    } catch (error: any) {
      console.error('Parse error:', error);
      addToast({
        message: error.response?.data?.error || 'Failed to parse notes',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < parsedFacts.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setActiveVariant('basic');
    } else {
      // Done with all facts
      addToast({ message: 'All notes processed!', type: 'success' });
      setNotesText('');
      setTopic('');
      setParsedFacts([]);
      setCurrentIndex(0);
      textareaRef.current?.focus();
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      if (parsedFacts.length === 0) {
        handleGenerate();
      } else {
        handleNext();
      }
    }
  };

  const currentFact = parsedFacts[currentIndex];

  return (
    <div className="min-h-screen bg-lab-bg-primary p-6" onKeyDown={handleKeyDown}>
      {/* Header */}
      <header className="max-w-6xl mx-auto mb-8">
        <button
          onClick={() => navigate('/')}
          className="px-6 py-3 rounded-pill border-medium font-display font-bold text-sm uppercase tracking-wider transition-all mb-6"
          style={{
            background: 'rgba(0, 234, 255, 0.12)',
            borderColor: '#00eaff',
            color: '#00eaff',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.02)';
            e.currentTarget.style.boxShadow = '0 0 16px rgba(0, 234, 255, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          ← BACK TO DASHBOARD
        </button>

        <h1 className="text-holographic font-display text-5xl font-extrabold uppercase tracking-wider mb-4">
          QUICK NOTES
        </h1>
        <p className="text-lg font-sans text-lab-text-muted">
          Paste messy notes • Generate cards • Study immediately
        </p>
        <p className="text-sm font-mono text-neon-cyan mt-2">
          Press Cmd+Enter to {parsedFacts.length === 0 ? 'Generate' : 'Save & Next'}
        </p>
      </header>

      <div className="max-w-6xl mx-auto">
        {parsedFacts.length === 0 ? (
          /* Input Mode */
          <div
            className="p-10 rounded-xl border-fat backdrop-blur-md"
            style={{
              background: 'linear-gradient(135deg, rgba(0, 234, 255, 0.05) 0%, rgba(163, 75, 255, 0.05) 50%, rgba(255, 94, 205, 0.05) 100%)',
              borderColor: 'rgba(0, 234, 255, 0.3)',
              boxShadow: '0 0 30px rgba(0, 234, 255, 0.1), 0 8px 32px rgba(0, 0, 0, 0.3)',
            }}
          >
            {/* Topic (optional) */}
            <div className="mb-6">
              <label
                htmlFor="topic"
                className="block text-sm font-display font-bold uppercase tracking-wider text-neon-purple mb-3"
                style={{ textShadow: '0 0 8px rgba(163, 75, 255, 0.6)' }}
              >
                Topic (optional)
              </label>
              <input
                type="text"
                id="topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., Neural Crest Development"
                className="w-full px-6 py-3 rounded-pill border-medium font-sans text-base transition-all"
                style={{
                  background: 'rgba(0, 0, 0, 0.4)',
                  borderColor: 'rgba(163, 75, 255, 0.3)',
                  color: '#ffffff',
                  outline: 'none',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#a34bff';
                  e.currentTarget.style.boxShadow = '0 0 16px rgba(163, 75, 255, 0.4)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(163, 75, 255, 0.3)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
            </div>

            {/* Notes textarea */}
            <div className="mb-8">
              <label
                htmlFor="notes"
                className="block text-sm font-display font-bold uppercase tracking-wider text-neon-cyan mb-3"
                style={{ textShadow: '0 0 8px rgba(0, 234, 255, 0.6)' }}
              >
                Your Notes (one per line, max 20)
              </label>
              <textarea
                ref={textareaRef}
                id="notes"
                value={notesText}
                onChange={(e) => setNotesText(e.target.value)}
                placeholder={`neural crest -> DRG + schwann + melanocytes\nneural plate -> groove -> tube\nCNS from neuroectoderm`}
                rows={12}
                className="w-full px-6 py-4 rounded-lg border-medium font-mono text-sm transition-all resize-none"
                style={{
                  background: 'rgba(0, 0, 0, 0.6)',
                  borderColor: 'rgba(0, 234, 255, 0.3)',
                  color: '#00eaff',
                  outline: 'none',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#00eaff';
                  e.currentTarget.style.boxShadow = '0 0 20px rgba(0, 234, 255, 0.5)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(0, 234, 255, 0.3)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
              <p className="text-xs font-mono text-lab-text-dim mt-2">
                Lines: {notesText.split('\n').filter(l => l.trim()).length} / 20
              </p>
            </div>

            {/* Generate button */}
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="relative overflow-hidden px-12 py-5 rounded-pill border-none font-display font-extrabold text-lg uppercase tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: 'linear-gradient(135deg, #00eaff 0%, #a34bff 50%, #ff5ecd 100%)',
                color: '#ffffff',
                boxShadow: '0 0 24px rgba(0, 234, 255, 0.5), 0 0 48px rgba(0, 234, 255, 0.3)',
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.transform = 'scale(1.05)';
                  e.currentTarget.style.boxShadow = '0 0 32px rgba(0, 234, 255, 0.7), 0 0 64px rgba(0, 234, 255, 0.4)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = '0 0 24px rgba(0, 234, 255, 0.5), 0 0 48px rgba(0, 234, 255, 0.3)';
              }}
            >
              {loading ? 'GENERATING...' : 'GENERATE CARDS'}
            </button>
          </div>
        ) : (
          /* Preview Mode */
          <div className="space-y-6">
            {/* Progress */}
            <div
              className="p-6 rounded-xl border-medium"
              style={{
                background: 'rgba(0, 0, 0, 0.4)',
                borderColor: 'rgba(0, 234, 255, 0.3)',
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="font-display text-xl font-bold uppercase text-neon-cyan">
                  Fact {currentIndex + 1} of {parsedFacts.length}
                </span>
                <div className="flex gap-2">
                  {parsedFacts.map((_, idx) => (
                    <div
                      key={idx}
                      className="w-3 h-3 rounded-full"
                      style={{
                        background: idx <= currentIndex ? '#00eaff' : 'rgba(255, 255, 255, 0.2)',
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Fact preview */}
            <div
              className="p-10 rounded-xl border-fat"
              style={{
                background: 'linear-gradient(135deg, rgba(0, 234, 255, 0.08) 0%, rgba(163, 75, 255, 0.08) 100%)',
                borderColor: 'rgba(0, 234, 255, 0.4)',
                boxShadow: '0 0 40px rgba(0, 234, 255, 0.2), 0 8px 32px rgba(0, 0, 0, 0.3)',
              }}
            >
              {/* Original */}
              <div className="mb-6">
                <div className="text-xs font-mono text-lab-text-dim uppercase mb-2">Original:</div>
                <div className="font-mono text-sm text-lab-text-muted">{currentFact.original}</div>
              </div>

              {/* Cleaned */}
              <div className="mb-8">
                <div className="text-xs font-mono text-lab-text-dim uppercase mb-2">Cleaned Fact:</div>
                <div className="font-sans text-lg text-lab-text-primary">{currentFact.cleaned}</div>
              </div>

              {/* Node assignment */}
              <div className="mb-8">
                <div className="text-xs font-mono text-lab-text-dim uppercase mb-3">Node Assignment:</div>
                {currentFact.nodeMatches.length > 0 && currentFact.nodeMatches[0].confidence > 0.85 ? (
                  <div
                    className="inline-block px-4 py-2 rounded-pill border-medium"
                    style={{
                      background: 'rgba(0, 255, 136, 0.15)',
                      borderColor: '#00ff88',
                      color: '#00ff88',
                    }}
                  >
                    <span className="font-display font-bold text-sm">
                      {currentFact.nodeMatches[0].title} ({Math.round(currentFact.nodeMatches[0].confidence * 100)}%)
                    </span>
                  </div>
                ) : (
                  <div
                    className="inline-block px-4 py-2 rounded-pill border-medium"
                    style={{
                      background: 'rgba(255, 94, 205, 0.15)',
                      borderColor: '#ff5ecd',
                      color: '#ff9cff',
                    }}
                  >
                    <span className="font-display font-bold text-sm">UNSORTED</span>
                  </div>
                )}
              </div>

              {/* Card variant tabs */}
              <div className="mb-6 flex gap-3">
                {(['basic', 'cloze', 'explain'] as const).map((variantType) => (
                  <button
                    key={variantType}
                    onClick={() => setActiveVariant(variantType)}
                    className="px-6 py-3 rounded-pill border-medium font-display font-bold text-sm uppercase tracking-wider transition-all"
                    style={{
                      background: activeVariant === variantType ? 'rgba(0, 234, 255, 0.2)' : 'rgba(0, 0, 0, 0.3)',
                      borderColor: activeVariant === variantType ? '#00eaff' : 'rgba(255, 255, 255, 0.2)',
                      color: activeVariant === variantType ? '#00eaff' : '#c4b5fd',
                      boxShadow: activeVariant === variantType ? '0 0 16px rgba(0, 234, 255, 0.4)' : 'none',
                    }}
                  >
                    {variantType}
                  </button>
                ))}
              </div>

              {/* Card preview */}
              {currentFact.variants.find(v => v.kind === activeVariant) && (
                <div
                  className="p-8 rounded-xl border-medium"
                  style={{
                    background: 'rgba(0, 0, 0, 0.5)',
                    borderColor: 'rgba(0, 234, 255, 0.3)',
                  }}
                >
                  <div className="mb-6">
                    <div className="text-xs font-mono text-lab-text-dim uppercase mb-3">Front:</div>
                    <div className="font-sans text-base text-lab-text-primary">
                      {currentFact.variants.find(v => v.kind === activeVariant)!.front}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-mono text-lab-text-dim uppercase mb-3">Back:</div>
                    <div className="font-sans text-base text-neon-cyan">
                      {currentFact.variants.find(v => v.kind === activeVariant)!.back}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <button
                onClick={handleNext}
                className="relative overflow-hidden px-12 py-5 rounded-pill border-none font-display font-extrabold text-lg uppercase tracking-wider transition-all"
                style={{
                  background: 'linear-gradient(135deg, #00ff88 0%, #00eaff 100%)',
                  color: '#000000',
                  boxShadow: '0 0 24px rgba(0, 255, 136, 0.5)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)';
                  e.currentTarget.style.boxShadow = '0 0 32px rgba(0, 255, 136, 0.7)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = '0 0 24px rgba(0, 255, 136, 0.5)';
                }}
              >
                {currentIndex < parsedFacts.length - 1 ? 'SAVE & NEXT →' : 'FINISH'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
