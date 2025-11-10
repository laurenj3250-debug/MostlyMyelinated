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
      <div className="flex items-center justify-center min-h-screen bg-lab-bg-primary">
        <div className="text-holographic font-display text-3xl font-extrabold uppercase tracking-wider animate-pulse-glow-neon">
          INITIALIZING SESSION HUD...
        </div>
      </div>
    );
  }

  if (session.length === 0) {
    // Different empty state for weak-drill mode
    if (mode === 'weak-drill') {
      return (
        <div className="flex items-center justify-center min-h-screen bg-lab-bg-primary">
          <div
            className="p-12 text-center max-w-lg rounded-xl border-fat backdrop-blur-md"
            style={{
              background: 'linear-gradient(135deg, rgba(0, 255, 136, 0.08) 0%, rgba(0, 234, 255, 0.08) 100%)',
              borderColor: 'rgba(0, 255, 136, 0.4)',
              boxShadow: '0 0 40px rgba(0, 255, 136, 0.2), 0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
            }}
          >
            <div className="text-8xl mb-6 animate-pulse-glow-neon" style={{ filter: 'drop-shadow(0 0 20px rgba(0, 255, 136, 0.6))' }}>◆</div>
            <h2 className="text-3xl font-display font-extrabold uppercase text-neon-cyan mb-4 tracking-wider">NO CRITICAL NODES DETECTED</h2>
            <p className="text-lg font-sans text-lab-text-primary mb-3">
              All nodes are functioning above the 40% intervention threshold.
            </p>
            <p className="text-base font-sans text-lab-text-muted mb-10">
              Neural integrity status: STABLE
            </p>
            <button
              onClick={() => navigate('/')}
              className="px-8 py-4 rounded-pill border-none font-display font-extrabold uppercase tracking-wider transition-all"
              style={{
                background: 'linear-gradient(135deg, #ff5ecd 0%, #a34bff 50%, #00eaff 100%)',
                color: '#ffffff',
                boxShadow: '0 0 24px rgba(255, 90, 255, 0.5), 0 0 48px rgba(255, 90, 255, 0.3)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.boxShadow = '0 0 32px rgba(255, 90, 255, 0.7), 0 0 64px rgba(255, 90, 255, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = '0 0 24px rgba(255, 90, 255, 0.5), 0 0 48px rgba(255, 90, 255, 0.3)';
              }}
            >
              RETURN TO DASHBOARD
            </button>
          </div>
        </div>
      );
    }

    // Default empty state for normal/other modes
    return (
      <div className="flex items-center justify-center min-h-screen bg-lab-bg-primary">
        <div
          className="p-12 text-center max-w-lg rounded-xl border-fat backdrop-blur-md"
          style={{
            background: 'linear-gradient(135deg, rgba(0, 255, 136, 0.08) 0%, rgba(0, 234, 255, 0.08) 100%)',
            borderColor: 'rgba(0, 255, 136, 0.4)',
            boxShadow: '0 0 40px rgba(0, 255, 136, 0.2), 0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
          }}
        >
          <div className="text-8xl mb-6 animate-pulse-glow-neon" style={{ filter: 'drop-shadow(0 0 20px rgba(0, 255, 136, 0.6))' }}>◆</div>
          <h2 className="text-3xl font-display font-extrabold uppercase text-neon-cyan mb-4 tracking-wider">ALL SYNAPSES FIRING</h2>
          <p className="text-lg font-sans text-lab-text-primary mb-3">
            No cards due. All neural pathways functioning within normal parameters.
          </p>
          <p className="text-base font-sans text-lab-text-muted mb-10">
            Myelin integrity: OPTIMAL
          </p>
          <button
            onClick={() => navigate('/')}
            className="px-8 py-4 rounded-pill border-none font-display font-extrabold uppercase tracking-wider transition-all"
            style={{
              background: 'linear-gradient(135deg, #ff5ecd 0%, #a34bff 50%, #00eaff 100%)',
              color: '#ffffff',
              boxShadow: '0 0 24px rgba(255, 90, 255, 0.5), 0 0 48px rgba(255, 90, 255, 0.3)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.boxShadow = '0 0 32px rgba(255, 90, 255, 0.7), 0 0 64px rgba(255, 90, 255, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 0 24px rgba(255, 90, 255, 0.5), 0 0 48px rgba(255, 90, 255, 0.3)';
            }}
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
    <div className="min-h-screen bg-lab-bg-primary">
      {/* HUD Header */}
      <header
        className="sticky top-0 z-50 backdrop-blur-xl border-b-fat"
        style={{
          background: 'linear-gradient(135deg, rgba(255, 94, 205, 0.08) 0%, rgba(163, 75, 255, 0.08) 50%, rgba(0, 234, 255, 0.08) 100%)',
          borderColor: 'rgba(255, 156, 255, 0.3)',
          boxShadow: '0 0 20px rgba(255, 90, 255, 0.15), 0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
        }}
      >
        <div className="max-w-7xl mx-auto px-6 py-5 sm:px-8 lg:px-10">
          {/* Top row: Quit, Title, Stats */}
          <div className="flex items-center justify-between mb-5">
            {/* Quit button */}
            <button
              onClick={() => {
                if (confirm('Quit session? Progress will be saved.')) {
                  navigate('/');
                }
              }}
              className="px-6 py-3 rounded-pill border-medium font-display font-bold text-sm uppercase tracking-wider transition-all"
              style={{
                background: 'rgba(255, 94, 205, 0.12)',
                borderColor: '#ff5ecd',
                color: '#ff9cff'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.02)';
                e.currentTarget.style.boxShadow = '0 0 16px rgba(255, 94, 205, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              ← QUIT
            </button>

            {/* Session title and progress */}
            <div className="text-center flex-1 px-6">
              <div
                className="text-sm font-display font-bold uppercase mb-3 tracking-[0.25em]"
                style={{
                  color: mode === 'weak-drill' || mode === 'disasters' || mode === 'drill' ? '#ff5ecd' : '#00eaff',
                  textShadow: mode === 'weak-drill' || mode === 'disasters' || mode === 'drill'
                    ? '0 0 12px rgba(255, 94, 205, 0.6)'
                    : '0 0 12px rgba(0, 234, 255, 0.6)'
                }}
              >
                {getSessionTitle()}
              </div>

              {/* Large progress indicator */}
              <div className="flex items-baseline justify-center gap-3 mb-2">
                <span
                  className="text-7xl font-display font-black animate-pulse-glow-neon"
                  style={{
                    color: mode === 'weak-drill' || mode === 'disasters' || mode === 'drill' ? '#ff5ecd' : '#00eaff',
                    textShadow: mode === 'weak-drill' || mode === 'disasters' || mode === 'drill'
                      ? '0 0 20px rgba(255, 94, 205, 0.8), 0 0 40px rgba(255, 94, 205, 0.5)'
                      : '0 0 20px rgba(0, 234, 255, 0.8), 0 0 40px rgba(0, 234, 255, 0.5)'
                  }}
                >
                  {currentIndex + 1}
                </span>
                <span className="text-3xl font-display text-lab-text-muted opacity-50">/</span>
                <span className="text-3xl font-display font-semibold text-lab-text-muted">{session.length}</span>
              </div>
            </div>

            {/* Stats chip */}
            <div
              className="flex flex-col items-end gap-1 px-6 py-3 rounded-pill border-medium"
              style={{
                borderColor: 'rgba(0, 234, 255, 0.4)',
                background: 'rgba(0, 234, 255, 0.08)'
              }}
            >
              <div className="text-xs font-display font-semibold text-lab-text-muted uppercase tracking-wider">
                ASSESSED
              </div>
              <div className="text-2xl font-display font-black text-neon-cyan" style={{ textShadow: '0 0 8px rgba(0, 234, 255, 0.6)' }}>
                {sessionStats.reviewed}/{session.length}
              </div>
              <div className="text-xs font-display font-semibold text-lab-text-muted uppercase tracking-wider">
                SUCCESS: {successRate}%
              </div>
            </div>
          </div>

          {/* Enhanced Progress bar with scanning line */}
          <div
            className="h-6 relative overflow-hidden rounded-pill border-medium"
            style={{
              background: 'rgba(0, 0, 0, 0.6)',
              borderColor: mode === 'weak-drill' || mode === 'disasters' || mode === 'drill' ? '#ff5ecd' : '#00eaff'
            }}
          >
            {/* Progress fill */}
            <div
              className="absolute inset-y-0 left-0 transition-all duration-500 rounded-pill"
              style={{
                width: `${progress}%`,
                background: mode === 'weak-drill' || mode === 'disasters' || mode === 'drill'
                  ? 'linear-gradient(90deg, #ff5ecd 0%, rgba(255, 94, 205, 0.6) 100%)'
                  : 'linear-gradient(90deg, #00eaff 0%, rgba(0, 234, 255, 0.6) 100%)',
                boxShadow: mode === 'weak-drill' || mode === 'disasters' || mode === 'drill'
                  ? 'inset 0 0 16px rgba(255, 94, 205, 0.6), 0 0 12px rgba(255, 94, 205, 0.4)'
                  : 'inset 0 0 16px rgba(0, 234, 255, 0.6), 0 0 12px rgba(0, 234, 255, 0.4)'
              }}
            />

            {/* Scanning line at progress position */}
            <div
              className="absolute inset-y-0 w-1"
              style={{
                background: mode === 'weak-drill' || mode === 'disasters' || mode === 'drill'
                  ? 'linear-gradient(to right, transparent, #ff5ecd, transparent)'
                  : 'linear-gradient(to right, transparent, #00eaff, transparent)',
                boxShadow: mode === 'weak-drill' || mode === 'disasters' || mode === 'drill'
                  ? '0 0 10px rgba(255, 94, 205, 0.9)'
                  : '0 0 10px rgba(0, 234, 255, 0.9)',
                left: `${progress}%`,
                transform: 'translateX(-50%)',
                animation: 'pulse 2s ease-in-out infinite'
              }}
            />

            {/* Percentage label */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span
                className="text-sm font-display font-extrabold tracking-wide"
                style={{
                  color: progress > 50 ? '#000' : '#fff',
                  textShadow: progress > 50 ? 'none' : '0 0 8px currentColor'
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
        className="fixed bottom-0 left-0 right-0 backdrop-blur-xl border-t-fat py-5"
        style={{
          background: 'linear-gradient(135deg, rgba(255, 94, 205, 0.08) 0%, rgba(163, 75, 255, 0.08) 50%, rgba(0, 234, 255, 0.08) 100%)',
          borderColor: 'rgba(255, 156, 255, 0.3)',
          boxShadow: 'inset 0 -1px 0 rgba(255, 255, 255, 0.1), 0 -8px 32px rgba(0, 0, 0, 0.4)'
        }}
      >
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
            {/* FAILED */}
            <div
              className="flex flex-col items-center p-4 rounded-lg border-medium transition-all"
              style={{
                background: 'rgba(255, 94, 205, 0.08)',
                borderColor: 'rgba(255, 94, 205, 0.4)'
              }}
            >
              <div className="text-xs font-display font-semibold text-lab-text-muted uppercase tracking-wider mb-2">
                FAILED
              </div>
              <div
                className="text-4xl font-display font-black"
                style={{
                  color: '#ff5ecd',
                  textShadow: '0 0 16px rgba(255, 94, 205, 0.6)'
                }}
              >
                {sessionStats.again}
              </div>
              <div className="w-full h-2 bg-black/60 border-thin mt-3 overflow-hidden rounded-pill" style={{ borderColor: 'rgba(255, 94, 205, 0.3)' }}>
                <div
                  className="h-full bg-gradient-to-r from-neon-pink to-neon-hot transition-all rounded-pill"
                  style={{
                    width: `${sessionStats.reviewed > 0 ? (sessionStats.again / sessionStats.reviewed * 100) : 0}%`,
                    boxShadow: '0 0 10px rgba(255, 94, 205, 0.6), inset 0 0 8px rgba(255, 94, 205, 0.3)'
                  }}
                />
              </div>
            </div>

            {/* PARTIAL */}
            <div
              className="flex flex-col items-center p-4 rounded-lg border-medium transition-all"
              style={{
                background: 'rgba(163, 75, 255, 0.08)',
                borderColor: 'rgba(163, 75, 255, 0.4)'
              }}
            >
              <div className="text-xs font-display font-semibold text-lab-text-muted uppercase tracking-wider mb-2">
                PARTIAL
              </div>
              <div
                className="text-4xl font-display font-black"
                style={{
                  color: '#a34bff',
                  textShadow: '0 0 16px rgba(163, 75, 255, 0.6)'
                }}
              >
                {sessionStats.hard}
              </div>
              <div className="w-full h-2 bg-black/60 border-thin mt-3 overflow-hidden rounded-pill" style={{ borderColor: 'rgba(163, 75, 255, 0.3)' }}>
                <div
                  className="h-full bg-gradient-to-r from-neon-purple to-neon-fuchsia transition-all rounded-pill"
                  style={{
                    width: `${sessionStats.reviewed > 0 ? (sessionStats.hard / sessionStats.reviewed * 100) : 0}%`,
                    boxShadow: '0 0 10px rgba(163, 75, 255, 0.6), inset 0 0 8px rgba(163, 75, 255, 0.3)'
                  }}
                />
              </div>
            </div>

            {/* SUCCESS */}
            <div
              className="flex flex-col items-center p-4 rounded-lg border-medium transition-all"
              style={{
                background: 'rgba(0, 234, 255, 0.08)',
                borderColor: 'rgba(0, 234, 255, 0.4)'
              }}
            >
              <div className="text-xs font-display font-semibold text-lab-text-muted uppercase tracking-wider mb-2">
                SUCCESS
              </div>
              <div
                className="text-4xl font-display font-black"
                style={{
                  color: '#00eaff',
                  textShadow: '0 0 16px rgba(0, 234, 255, 0.6)'
                }}
              >
                {sessionStats.good}
              </div>
              <div className="w-full h-2 bg-black/60 border-thin mt-3 overflow-hidden rounded-pill" style={{ borderColor: 'rgba(0, 234, 255, 0.3)' }}>
                <div
                  className="h-full bg-gradient-to-r from-neon-cyan to-band-hyper transition-all rounded-pill"
                  style={{
                    width: `${sessionStats.reviewed > 0 ? (sessionStats.good / sessionStats.reviewed * 100) : 0}%`,
                    boxShadow: '0 0 10px rgba(0, 234, 255, 0.6), inset 0 0 8px rgba(0, 234, 255, 0.3)'
                  }}
                />
              </div>
            </div>

            {/* PERFECT */}
            <div
              className="flex flex-col items-center p-4 rounded-lg border-medium transition-all"
              style={{
                background: 'rgba(0, 255, 136, 0.08)',
                borderColor: 'rgba(0, 255, 136, 0.4)'
              }}
            >
              <div className="text-xs font-display font-semibold text-lab-text-muted uppercase tracking-wider mb-2">
                PERFECT
              </div>
              <div
                className="text-4xl font-display font-black"
                style={{
                  color: '#00ff88',
                  textShadow: '0 0 16px rgba(0, 255, 136, 0.6)'
                }}
              >
                {sessionStats.easy}
              </div>
              <div className="w-full h-2 bg-black/60 border-thin mt-3 overflow-hidden rounded-pill" style={{ borderColor: 'rgba(0, 255, 136, 0.3)' }}>
                <div
                  className="h-full bg-gradient-to-r from-band-bar to-neon-cyan transition-all rounded-pill"
                  style={{
                    width: `${sessionStats.reviewed > 0 ? (sessionStats.easy / sessionStats.reviewed * 100) : 0}%`,
                    boxShadow: '0 0 10px rgba(0, 255, 136, 0.6), inset 0 0 8px rgba(0, 255, 136, 0.3)'
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
