import React, { useState } from 'react';

interface Props {
  nodeId: string;
  onExtracted: () => void;
}

export default function AITextExtractor({ nodeId, onExtracted }: Props) {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [autoGenerateCards, setAutoGenerateCards] = useState(true);

  const handleExtract = async () => {
    if (!text.trim()) return;

    setLoading(true);
    try {
      const response = await fetch('/api/ai/batch-process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          text,
          nodeId,
          autoGenerateCards,
        }),
      });

      if (!response.ok) throw new Error('Failed to extract facts');

      const data = await response.json();
      alert(
        `✨ AI extracted ${data.factsCreated} facts and generated ${data.cardsCreated} cards!`
      );
      setText('');
      onExtracted();
    } catch (error) {
      console.error('Extract error:', error);
      alert('Failed to extract facts. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">✨</span>
        <h3 className="text-lg font-bold">AI Text Extractor</h3>
      </div>

      <p className="text-sm text-gray-600 mb-4">
        Paste lecture notes, textbook excerpts, or any educational content. AI will
        extract structured facts and optionally generate flashcards.
      </p>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="input min-h-[200px] mb-3"
        placeholder="Paste your text here...

Example:
The neural tube forms when neural folds fuse dorsally. This occurs during neurulation. Failure of fusion leads to neural tube defects like spina bifida."
        disabled={loading}
      />

      <div className="flex items-center gap-2 mb-4">
        <input
          type="checkbox"
          id="autoCards"
          checked={autoGenerateCards}
          onChange={(e) => setAutoGenerateCards(e.target.checked)}
          disabled={loading}
          className="w-4 h-4"
        />
        <label htmlFor="autoCards" className="text-sm">
          Automatically generate flashcards from extracted facts
        </label>
      </div>

      <button
        onClick={handleExtract}
        disabled={!text.trim() || loading}
        className="btn btn-primary w-full"
      >
        {loading ? (
          <>
            <span className="inline-block animate-spin mr-2">⏳</span>
            Extracting with AI...
          </>
        ) : (
          '✨ Extract Facts with AI'
        )}
      </button>

      {loading && (
        <div className="mt-4 text-sm text-gray-600 text-center">
          This may take 10-30 seconds depending on text length...
        </div>
      )}
    </div>
  );
}
