import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { study, cards as cardsApi } from '../services/api';
import { DueCard } from '../types';
import FlashCard from '../components/FlashCard';
import { useToast } from '../components/ToastContainer';

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

  useEffect(() => {
    loadSession();
  }, [mode]);

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

      // Check for strength band drop (Lesion Alert)
      if (res.data.strengthDropped) {
        addToast({
          message: `⚠️ Lesion Alert: ${res.data.nodeName} dropped from ${res.data.oldBand} → ${res.data.newBand}`,
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      {/* Header */}
      <header className={`shadow-xl ${
        mode === 'weak-drill' || mode === 'disasters' || mode === 'drill'
          ? 'bg-gradient-to-r from-red-600 to-pink-600'
          : 'bg-gradient-to-r from-blue-600 to-purple-600'
      }`}>
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <button
              onClick={() => {
                if (confirm('Quit session? Progress will be saved.')) {
                  navigate('/');
                }
              }}
              className="text-white hover:bg-white/20 px-4 py-2 rounded-lg font-semibold
                        transition-all duration-200 flex items-center gap-2"
            >
              <span>←</span> Quit
            </button>
            <div className="text-center flex-1">
              {(mode === 'weak-drill' || mode === 'disasters' || mode === 'drill') && (
                <div className="text-sm font-bold text-white/90 mb-2 animate-pulse">
                  {sessionTitle}
                </div>
              )}
              <div className="text-2xl md:text-3xl font-black text-white mb-1">
                {currentIndex + 1} <span className="text-white/70">/</span> {session.length}
              </div>
              <div className="text-sm text-white/80 font-medium">
                {sessionStats.reviewed} cards reviewed
              </div>
            </div>
            <div className="w-20"></div>
          </div>

          {/* Progress bar */}
          <div className="mt-6 h-3 bg-white/20 rounded-full overflow-hidden backdrop-blur">
            <div
              className={`h-full ${
                mode === 'weak-drill' || mode === 'disasters' || mode === 'drill'
                  ? 'bg-gradient-to-r from-yellow-400 to-green-400'
                  : 'bg-gradient-to-r from-green-400 to-blue-400'
              } transition-all duration-500 shadow-lg`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </header>

      {/* Card */}
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <FlashCard card={currentCard} onReview={handleReview} />
      </div>

      {/* Stats footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t-2 border-gray-100 py-4 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center gap-6 md:gap-8 text-sm md:text-base font-semibold">
            <div className="flex flex-col items-center">
              <span className="text-red-600 text-xl md:text-2xl font-bold">{sessionStats.again}</span>
              <span className="text-gray-600 text-xs">Again</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-orange-600 text-xl md:text-2xl font-bold">{sessionStats.hard}</span>
              <span className="text-gray-600 text-xs">Hard</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-green-600 text-xl md:text-2xl font-bold">{sessionStats.good}</span>
              <span className="text-gray-600 text-xs">Good</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-blue-600 text-xl md:text-2xl font-bold">{sessionStats.easy}</span>
              <span className="text-gray-600 text-xs">Easy</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
