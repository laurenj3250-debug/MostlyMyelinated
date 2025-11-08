import React, { useState } from 'react';

interface Props {
  factId: string;
  currentStatement: string;
  onImproved: (improved: string) => void;
}

export default function AIFactImprover({
  factId,
  currentStatement,
  onImproved,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [suggestion, setSuggestion] = useState<{
    improved: string;
    reasoning: string;
  } | null>(null);

  const handleGetSuggestions = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/ai/improve-fact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ factId }),
      });

      if (!response.ok) throw new Error('Failed to get suggestions');

      const data = await response.json();
      setSuggestion({
        improved: data.improved,
        reasoning: data.reasoning,
      });
    } catch (error) {
      console.error('Improve error:', error);
      alert('Failed to get AI suggestions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = () => {
    if (suggestion) {
      onImproved(suggestion.improved);
      setSuggestion(null);
    }
  };

  return (
    <div className="mt-2">
      {!suggestion ? (
        <button
          onClick={handleGetSuggestions}
          disabled={loading}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          {loading ? '💭 Thinking...' : '✨ Get AI suggestions'}
        </button>
      ) : (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-2">
          <div className="text-sm font-semibold mb-2">AI Suggestion:</div>
          <div className="text-sm mb-2">
            <strong>Improved:</strong> {suggestion.improved}
          </div>
          <div className="text-xs text-gray-600 mb-3">
            <strong>Why:</strong> {suggestion.reasoning}
          </div>
          <div className="flex gap-2">
            <button onClick={handleAccept} className="btn btn-primary text-sm py-1">
              Apply
            </button>
            <button
              onClick={() => setSuggestion(null)}
              className="btn btn-secondary text-sm py-1"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
