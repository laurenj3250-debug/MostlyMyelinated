import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { study, cards as cardsApi } from '../services/api';
import { DueCard } from '../types';
import FlashCard from '../components/FlashCard';

export default function Study() {
  const navigate = useNavigate();
  const [session, setSession] = useState<DueCard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [reviewing, setReviewing] = useState(false);
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
  }, []);

  const loadSession = async () => {
    try {
      const res = await study.getSession(80);
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
      await cardsApi.review(card.id, rating);

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
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="card text-center">
          <h2 className="text-2xl font-bold mb-4">No cards due!</h2>
          <p className="text-gray-600 mb-6">
            You're all caught up. Come back later!
          </p>
          <button onClick={() => navigate('/')} className="btn btn-primary">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const currentCard = session[currentIndex];
  const progress = ((currentIndex + 1) / session.length) * 100;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <button
              onClick={() => {
                if (confirm('Quit session? Progress will be saved.')) {
                  navigate('/');
                }
              }}
              className="text-blue-600 hover:text-blue-800"
            >
              ← Quit
            </button>
            <div className="text-center flex-1">
              <div className="text-lg font-semibold">
                {currentIndex + 1} / {session.length}
              </div>
              <div className="text-sm text-gray-600">
                {sessionStats.reviewed} reviewed
              </div>
            </div>
            <div className="w-20"></div>
          </div>

          {/* Progress bar */}
          <div className="mt-4 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 transition-all duration-300"
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
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t py-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center gap-6 text-sm">
            <span className="text-red-600">Again: {sessionStats.again}</span>
            <span className="text-orange-600">Hard: {sessionStats.hard}</span>
            <span className="text-green-600">Good: {sessionStats.good}</span>
            <span className="text-blue-600">Easy: {sessionStats.easy}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
