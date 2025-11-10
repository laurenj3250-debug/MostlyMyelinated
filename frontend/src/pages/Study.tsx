import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { study, cards as cardsApi } from '../services/api';
import { DueCard } from '../types';
import FlashCard from '../components/FlashCard';
import ComboDisplay from '../components/ComboDisplay';
import { useToast } from '../components/ToastContainer';
import { useSwipe } from '../hooks/useSwipe';

export default function Study() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode'); // 'disasters' for weak nodes mode, 'drill' for hardest cards
  const nodeId = searchParams.get('nodeId'); // For drill mode
  const { addToast } = useToast();
  const [session, setSession] = useState<DueCard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [reviewing, setReviewing] = useState(false);
  const [sessionTitle, setSessionTitle] = useState('Study Session');
  const [sessionStats, setSessionStats] = useState({
    total: 0,
    reviewed: 0,
    again: 0,
    hard: 0,
    good: 0,
    easy: 0,
  });
  const [combo, setCombo] = useState(0);

  useEffect(() => {
    loadSession();
  }, [mode]);

  // Swipe gestures for mobile (optional but nice)
  useSwipe((_direction) => {
    // Only allow swipes when card is flipped (answer is shown)
    // This prevents accidental swipes while reading the question
    // Swipe up = Easy (4), Down = Again (1), Right = Good (3), Left = Hard (2)
    // Note: This is a nice-to-have feature, keyboard and buttons are primary input methods
    // Currently disabled - can be enabled later if desired
  });

  const loadSession = async () => {
    try {
      let res;
      if (mode === 'weak-drill') {
        // Load weak drill session (nodes < 40% strength)
        res = await study.getWeakDrill(40, 50);
        setSessionTitle('🚨 CRITICAL NODE INTERVENTION PROTOCOL');
      } else if (mode === 'disasters') {
        // Load weak nodes session
        res = await study.getWeakNodesSession(50, 60);
        setSessionTitle('DISASTER MODE: Weak Nodes Only');
      } else if (mode === 'drill' && nodeId) {
        // Load drill hardest cards
        res = await study.getDrillHardest(nodeId, 20);
        setSessionTitle(`Disaster Drill: ${res.data.nodeName}`);
      } else {
        // Load normal session
        res = await study.getSession(80);
        setSessionTitle('Study Session');
      }
      setSession(res.data.cards);
      setSessionStats((prev) => ({ ...prev, total: res.data.count }));
    } catch (error) {
      console.error('Failed to load session:', error);
      alert('Failed to load study session');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (rating: number) => {
    if (reviewing) return;

    setReviewing(true);
    const card = session[currentIndex];

    try {
      const res = await cardsApi.review(card.id, rating);

      // Update combo counter
      let newCombo = combo;
      if (rating >= 2) {
        // Good or Easy - increment combo
        newCombo = combo + 1;
        setCombo(newCombo);

        // Show combo milestones
        if (newCombo === 5 || newCombo === 10 || newCombo === 25 || newCombo === 50) {
          addToast({
            message: `COMBO x${newCombo} - NEURAL EFFICIENCY INCREASING`,
            type: 'info',
            duration: 2000,
          });
        }
      } else {
        // Again or Hard - reset combo
        newCombo = 0;
        setCombo(0);
      }

      // Check for strength band drop (Lesion Alert)
      if (res.data.strengthDropped) {
        addToast({
          message: `LESION ALERT: ${res.data.nodeName} dropped from ${res.data.oldBand} → ${res.data.newBand}`,
          type: 'warning',
          duration: 5000,
        });
      }

      // Update stats
      setSessionStats((prev) => ({
        ...prev,
        reviewed: prev.reviewed + 1,
        again: prev.again + (rating === 0 ? 1 : 0),
        hard: prev.hard + (rating === 1 ? 1 : 0),
        good: prev.good + (rating === 2 ? 1 : 0),
        easy: prev.easy + (rating === 3 ? 1 : 0),
      }));

      // Move to next card
      if (currentIndex < session.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        // Session complete!
        alert('Session complete! Great work!');
        navigate('/');
      }
    } catch (error) {
      console.error('Failed to submit review:', error);
      alert('Failed to submit review');
    } finally {
      setReviewing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading session...</div>
      </div>
    );
  }

  if (session.length === 0) {
    // Different empty state for weak-drill mode
    if (mode === 'weak-drill') {
      return (
        <div className="flex items-center justify-center min-h-screen bg-lab-background">
          <div className="bg-black border-2 border-lab-mint/50 p-8 text-center max-w-md" style={{ borderRadius: '2px' }}>
            <div className="text-6xl mb-4">✓</div>
            <h2 className="text-2xl font-mono uppercase text-lab-mint mb-4">NO CRITICAL NODES DETECTED</h2>
            <p className="text-lg font-mono text-lab-text-primary mb-2">
              All nodes are functioning above the 40% intervention threshold.
            </p>
            <p className="text-sm font-mono text-lab-text-tertiary mb-6">
              Neural integrity status: STABLE
            </p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-lab-cyan border-2 border-lab-cyan text-black font-mono uppercase font-bold hover:bg-lab-cyan/80 transition-all"
              style={{ borderRadius: '2px' }}
            >
              RETURN TO DASHBOARD
            </button>
          </div>
        </div>
      );
    }

    // Default empty state for normal/other modes
    return (
      <div className="flex items-center justify-center min-h-screen bg-lab-background">
        <div className="bg-black border-2 border-lab-mint/50 p-8 text-center max-w-md" style={{ borderRadius: '2px' }}>
          <div className="text-6xl mb-4">✓</div>
          <h2 className="text-2xl font-mono uppercase text-lab-mint mb-4">ALL SYNAPSES FIRING</h2>
          <p className="text-lg font-mono text-lab-text-primary mb-2">
            No cards due. All neural pathways functioning within normal parameters.
          </p>
          <p className="text-sm font-mono text-lab-text-tertiary mb-6">
            Myelin integrity: OPTIMAL
          </p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-lab-cyan border-2 border-lab-cyan text-black font-mono uppercase font-bold hover:bg-lab-cyan/80 transition-all"
            style={{ borderRadius: '2px' }}
          >
            RETURN TO DASHBOARD
          </button>
        </div>
      </div>
    );
  }

  const currentCard = session[currentIndex];
  const progress = ((currentIndex + 1) / session.length) * 100;

  // Calculate success rate
  const successRate = sessionStats.reviewed > 0
    ? (((sessionStats.good + sessionStats.easy) / sessionStats.reviewed) * 100).toFixed(1)
    : '0.0';

  // Determine session title based on mode
  const getSessionTitle = () => {
    if (mode === 'weak-drill') {
      return '🚨 CRITICAL NODE INTERVENTION PROTOCOL';
    } else if (mode === 'disasters') {
      return 'DISASTER MODE: WEAK NODES ONLY';
    } else if (mode === 'drill') {
      return sessionTitle.toUpperCase();
    } else {
      return 'COGNITIVE ASSESSMENT IN PROGRESS';
    }
  };

  return (
    <div className="min-h-screen bg-diagnostic-grid">
      {/* HUD Header */}
      <header
        className="sticky top-0 z-50 bg-lab-card/80 backdrop-blur-xl border-b-2 border-lab-cyan/50"
        style={{
          boxShadow: 'inset 0 1px 0 rgba(0, 217, 255, 0.05), 0 4px 12px rgba(0, 0, 0, 0.2)'
        }}
      >
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          {/* Top row: Quit, Title, Stats */}
          <div className="flex items-center justify-between mb-4">
            {/* Quit button */}
            <button
              onClick={() => {
                if (confirm('Quit session? Progress will be saved.')) {
                  navigate('/');
                }
              }}
              className="bg-lab-card border-2 border-lab-border text-lab-text-primary hover:border-lab-alert hover:text-lab-alert px-4 py-2 font-mono uppercase font-bold text-sm transition-all hover:scale-[1.02]"
              style={{ borderRadius: '2px' }}
            >
              ← QUIT
            </button>

            {/* Session title and progress */}
            <div className="text-center flex-1 px-6">
              <div
                className="text-xs font-mono uppercase mb-2 tracking-[0.2em]"
                style={{
                  color: mode === 'weak-drill' || mode === 'disasters' || mode === 'drill' ? '#ff3366' : '#00d9ff',
                  textShadow: mode === 'weak-drill' || mode === 'disasters' || mode === 'drill'
                    ? '0 0 10px rgba(255, 51, 102, 0.5)'
                    : '0 0 10px rgba(0, 217, 255, 0.5)'
                }}
              >
                {getSessionTitle()}
              </div>

              {/* Large progress indicator */}
              <div className="flex items-baseline justify-center gap-2 mb-2">
                <span
                  className="text-5xl font-mono font-black"
                  style={{
                    color: mode === 'weak-drill' || mode === 'disasters' || mode === 'drill' ? '#ff3366' : '#00d9ff',
                    textShadow: mode === 'weak-drill' || mode === 'disasters' || mode === 'drill'
                      ? '0 0 16px rgba(255, 51, 102, 0.6), 0 0 32px rgba(255, 51, 102, 0.3)'
                      : '0 0 16px rgba(0, 217, 255, 0.6), 0 0 32px rgba(0, 217, 255, 0.3)'
                  }}
                >
                  {currentIndex + 1}
                </span>
                <span className="text-2xl font-mono text-lab-text-tertiary">/</span>
                <span className="text-2xl font-mono text-lab-text-secondary">{session.length}</span>
              </div>
            </div>

            {/* Stats chip */}
            <div
              className="flex flex-col items-end gap-1 px-4 py-2 rounded border-2"
              style={{
                borderRadius: '2px',
                borderColor: 'rgba(0, 217, 255, 0.3)',
                background: 'rgba(0, 217, 255, 0.05)'
              }}
            >
              <div className="text-[10px] font-mono text-lab-text-tertiary uppercase tracking-wider">
                ASSESSED
              </div>
              <div className="text-xl font-mono font-bold text-lab-cyan">
                {sessionStats.reviewed}/{session.length}
              </div>
              <div className="text-[10px] font-mono text-lab-text-tertiary uppercase tracking-wider">
                SUCCESS: {successRate}%
              </div>
            </div>
          </div>

          {/* Enhanced Progress bar with scanning line */}
          <div
            className="h-4 bg-black border-2 relative overflow-hidden"
            style={{
              borderRadius: '2px',
              borderColor: mode === 'weak-drill' || mode === 'disasters' || mode === 'drill' ? '#ff3366' : '#00d9ff'
            }}
          >
            {/* Progress fill */}
            <div
              className="absolute inset-y-0 left-0 transition-all duration-500"
              style={{
                width: `${progress}%`,
                background: mode === 'weak-drill' || mode === 'disasters' || mode === 'drill'
                  ? 'linear-gradient(90deg, #ff3366 0%, rgba(255, 51, 102, 0.6) 100%)'
                  : 'linear-gradient(90deg, #00d9ff 0%, rgba(0, 217, 255, 0.6) 100%)',
                boxShadow: mode === 'weak-drill' || mode === 'disasters' || mode === 'drill'
                  ? 'inset 0 0 12px rgba(255, 51, 102, 0.5)'
                  : 'inset 0 0 12px rgba(0, 217, 255, 0.5)'
              }}
            />

            {/* Scanning line at progress position */}
            <div
              className="absolute inset-y-0 w-0.5"
              style={{
                background: mode === 'weak-drill' || mode === 'disasters' || mode === 'drill'
                  ? 'linear-gradient(to right, transparent, #ff3366, transparent)'
                  : 'linear-gradient(to right, transparent, #00d9ff, transparent)',
                boxShadow: mode === 'weak-drill' || mode === 'disasters' || mode === 'drill'
                  ? '0 0 8px rgba(255, 51, 102, 0.8)'
                  : '0 0 8px rgba(0, 217, 255, 0.8)',
                left: `${progress}%`,
                animation: 'scan 2s ease-in-out infinite'
              }}
            />

            {/* Percentage label */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span
                className="text-xs font-mono font-bold"
                style={{
                  color: progress > 50 ? '#000' : (mode === 'weak-drill' || mode === 'disasters' || mode === 'drill' ? '#ff3366' : '#00d9ff'),
                  textShadow: progress > 50 ? 'none' : '0 0 6px rgba(0, 217, 255, 0.8)'
                }}
              >
                {progress.toFixed(0)}%
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Combo Display */}
      <ComboDisplay combo={combo} visible={true} />

      {/* Card */}
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <FlashCard card={currentCard} onReview={handleReview} />
      </div>

      {/* Stats footer HUD */}
      <div
        className="fixed bottom-0 left-0 right-0 bg-lab-card/80 backdrop-blur-xl border-t-2 border-lab-cyan/50 py-4"
        style={{
          boxShadow: 'inset 0 -1px 0 rgba(0, 217, 255, 0.05), 0 -4px 12px rgba(0, 0, 0, 0.2)'
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {/* FAILED */}
            <div
              className="flex flex-col items-center p-3 bg-black/40 border-2 border-lab-alert/30 hover:border-lab-alert/60 transition-all"
              style={{ borderRadius: '2px' }}
            >
              <div className="text-[10px] font-mono text-lab-text-tertiary uppercase tracking-wider mb-1">
                FAILED
              </div>
              <div
                className="text-3xl font-mono font-black"
                style={{
                  color: '#ff3366',
                  textShadow: '0 0 12px rgba(255, 51, 102, 0.5)'
                }}
              >
                {sessionStats.again}
              </div>
              <div className="w-full h-1.5 bg-black border border-lab-alert/30 mt-2 overflow-hidden" style={{ borderRadius: '1px' }}>
                <div
                  className="h-full bg-lab-alert transition-all"
                  style={{
                    width: `${sessionStats.reviewed > 0 ? (sessionStats.again / sessionStats.reviewed * 100) : 0}%`,
                    boxShadow: '0 0 8px rgba(255, 51, 102, 0.5)'
                  }}
                />
              </div>
            </div>

            {/* PARTIAL */}
            <div
              className="flex flex-col items-center p-3 bg-black/40 border-2 hover:border-orange-500/60 transition-all"
              style={{
                borderRadius: '2px',
                borderColor: 'rgba(249, 115, 22, 0.3)'
              }}
            >
              <div className="text-[10px] font-mono text-lab-text-tertiary uppercase tracking-wider mb-1">
                PARTIAL
              </div>
              <div
                className="text-3xl font-mono font-black"
                style={{
                  color: '#f97316',
                  textShadow: '0 0 12px rgba(249, 115, 22, 0.5)'
                }}
              >
                {sessionStats.hard}
              </div>
              <div
                className="w-full h-1.5 bg-black border mt-2 overflow-hidden"
                style={{
                  borderRadius: '1px',
                  borderColor: 'rgba(249, 115, 22, 0.3)'
                }}
              >
                <div
                  className="h-full bg-orange-500 transition-all"
                  style={{
                    width: `${sessionStats.reviewed > 0 ? (sessionStats.hard / sessionStats.reviewed * 100) : 0}%`,
                    boxShadow: '0 0 8px rgba(249, 115, 22, 0.5)'
                  }}
                />
              </div>
            </div>

            {/* SUCCESS */}
            <div
              className="flex flex-col items-center p-3 bg-black/40 border-2 border-lab-cyan/30 hover:border-lab-cyan/60 transition-all"
              style={{ borderRadius: '2px' }}
            >
              <div className="text-[10px] font-mono text-lab-text-tertiary uppercase tracking-wider mb-1">
                SUCCESS
              </div>
              <div
                className="text-3xl font-mono font-black"
                style={{
                  color: '#00d9ff',
                  textShadow: '0 0 12px rgba(0, 217, 255, 0.6)'
                }}
              >
                {sessionStats.good}
              </div>
              <div className="w-full h-1.5 bg-black border border-lab-cyan/30 mt-2 overflow-hidden" style={{ borderRadius: '1px' }}>
                <div
                  className="h-full bg-lab-cyan transition-all"
                  style={{
                    width: `${sessionStats.reviewed > 0 ? (sessionStats.good / sessionStats.reviewed * 100) : 0}%`,
                    boxShadow: '0 0 8px rgba(0, 217, 255, 0.6)'
                  }}
                />
              </div>
            </div>

            {/* PERFECT */}
            <div
              className="flex flex-col items-center p-3 bg-black/40 border-2 border-lab-mint/30 hover:border-lab-mint/60 transition-all"
              style={{ borderRadius: '2px' }}
            >
              <div className="text-[10px] font-mono text-lab-text-tertiary uppercase tracking-wider mb-1">
                PERFECT
              </div>
              <div
                className="text-3xl font-mono font-black"
                style={{
                  color: '#00ff88',
                  textShadow: '0 0 12px rgba(0, 255, 136, 0.6)'
                }}
              >
                {sessionStats.easy}
              </div>
              <div className="w-full h-1.5 bg-black border border-lab-mint/30 mt-2 overflow-hidden" style={{ borderRadius: '1px' }}>
                <div
                  className="h-full bg-lab-mint transition-all"
                  style={{
                    width: `${sessionStats.reviewed > 0 ? (sessionStats.easy / sessionStats.reviewed * 100) : 0}%`,
                    boxShadow: '0 0 8px rgba(0, 255, 136, 0.6)'
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
