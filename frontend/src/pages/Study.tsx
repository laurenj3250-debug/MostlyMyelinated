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
    <div className="min-h-screen bg-lab-background">
      {/* Header */}
      <header className="bg-black border-b-2 border-lab-cyan/30">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <button
              onClick={() => {
                if (confirm('Quit session? Progress will be saved.')) {
                  navigate('/');
                }
              }}
              className="bg-lab-card/50 border border-lab-border text-lab-text-primary hover:border-lab-cyan hover:text-lab-cyan px-4 py-2 font-mono uppercase font-bold transition-all"
              style={{ borderRadius: '2px' }}
            >
              <span>←</span> QUIT
            </button>
            <div className="text-center flex-1">
              <div className="text-sm font-mono text-lab-cyan uppercase mb-2 tracking-wider">
                {getSessionTitle()}
              </div>
              <div className="text-3xl font-mono font-bold text-lab-cyan mb-1">
                {currentIndex + 1} <span className="text-lab-cyan/50">/</span> {session.length}
              </div>
              <div className="text-sm font-mono text-lab-text-secondary">
                ASSESSED: {sessionStats.reviewed}/{session.length} | SUCCESS RATE: {successRate}%
              </div>
            </div>
            <div className="w-20"></div>
          </div>

          {/* Progress bar */}
          <div className="mt-6 h-2 bg-lab-card/30" style={{ borderRadius: '2px' }}>
            <div
              className={`h-full ${
                mode === 'weak-drill' || mode === 'disasters' || mode === 'drill'
                  ? 'bg-lab-alert'
                  : 'bg-lab-cyan'
              } ${progress > 50 ? 'shadow-glow-cyan' : ''} transition-all duration-500`}
              style={{ width: `${progress}%`, borderRadius: '2px' }}
            />
          </div>
        </div>
      </header>

      {/* Combo Display */}
      <ComboDisplay combo={combo} visible={true} />

      {/* Card */}
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <FlashCard card={currentCard} onReview={handleReview} />
      </div>

      {/* Stats footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-black border-t-2 border-lab-cyan/30 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {/* FAILED */}
            <div className="flex flex-col items-center">
              <div className="text-xs font-mono text-lab-text-tertiary uppercase mb-1">FAILED</div>
              <div className="text-2xl font-mono font-bold text-lab-alert">{sessionStats.again}</div>
              <div className="w-full h-1 bg-lab-card mt-2" style={{ borderRadius: '2px' }}>
                <div
                  className="h-full bg-lab-alert transition-all"
                  style={{
                    width: `${sessionStats.reviewed > 0 ? (sessionStats.again / sessionStats.reviewed * 100) : 0}%`,
                    borderRadius: '2px'
                  }}
                />
              </div>
            </div>

            {/* PARTIAL */}
            <div className="flex flex-col items-center">
              <div className="text-xs font-mono text-lab-text-tertiary uppercase mb-1">PARTIAL</div>
              <div className="text-2xl font-mono font-bold text-orange-500">{sessionStats.hard}</div>
              <div className="w-full h-1 bg-lab-card mt-2" style={{ borderRadius: '2px' }}>
                <div
                  className="h-full bg-orange-500 transition-all"
                  style={{
                    width: `${sessionStats.reviewed > 0 ? (sessionStats.hard / sessionStats.reviewed * 100) : 0}%`,
                    borderRadius: '2px'
                  }}
                />
              </div>
            </div>

            {/* SUCCESS */}
            <div className="flex flex-col items-center">
              <div className="text-xs font-mono text-lab-text-tertiary uppercase mb-1">SUCCESS</div>
              <div className="text-2xl font-mono font-bold text-lab-cyan">{sessionStats.good}</div>
              <div className="w-full h-1 bg-lab-card mt-2" style={{ borderRadius: '2px' }}>
                <div
                  className="h-full bg-lab-cyan transition-all"
                  style={{
                    width: `${sessionStats.reviewed > 0 ? (sessionStats.good / sessionStats.reviewed * 100) : 0}%`,
                    borderRadius: '2px'
                  }}
                />
              </div>
            </div>

            {/* PERFECT */}
            <div className="flex flex-col items-center">
              <div className="text-xs font-mono text-lab-text-tertiary uppercase mb-1">PERFECT</div>
              <div className="text-2xl font-mono font-bold text-lab-mint">{sessionStats.easy}</div>
              <div className="w-full h-1 bg-lab-card mt-2" style={{ borderRadius: '2px' }}>
                <div
                  className="h-full bg-lab-mint transition-all"
                  style={{
                    width: `${sessionStats.reviewed > 0 ? (sessionStats.easy / sessionStats.reviewed * 100) : 0}%`,
                    borderRadius: '2px'
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
