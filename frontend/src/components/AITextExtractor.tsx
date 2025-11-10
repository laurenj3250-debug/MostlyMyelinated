import { useState } from 'react';

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
    <div className="bg-black border-2 border-lab-mint/50 p-6" style={{ borderRadius: '2px' }}>
      <div className="flex items-center gap-2 mb-4 border-b border-lab-mint/30 pb-3">
        <span className="text-2xl">✨</span>
        <h3 className="text-lg font-mono font-bold uppercase text-lab-mint">AI KNOWLEDGE EXTRACTION</h3>
      </div>

      <p className="text-xs font-mono text-lab-text-secondary mb-4 leading-relaxed">
        PASTE LECTURE NOTES, TEXTBOOK EXCERPTS, OR EDUCATIONAL CONTENT. AI WILL EXTRACT STRUCTURED FACTS AND GENERATE FLASHCARDS.
      </p>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="w-full bg-lab-card border-2 border-lab-border focus:border-lab-mint text-lab-text-primary font-mono px-4 py-3 outline-none transition-all min-h-[200px] mb-3 placeholder:text-lab-text-tertiary text-sm"
        style={{ borderRadius: '2px' }}
        placeholder="PASTE TEXT HERE...

EXAMPLE:
The neural tube forms when neural folds fuse dorsally. This occurs during neurulation. Failure of fusion leads to neural tube defects like spina bifida."
        disabled={loading}
      />

      <div className="flex items-center gap-2 mb-4 bg-lab-card/30 border border-lab-border p-3" style={{ borderRadius: '2px' }}>
        <input
          type="checkbox"
          id="autoCards"
          checked={autoGenerateCards}
          onChange={(e) => setAutoGenerateCards(e.target.checked)}
          disabled={loading}
          className="w-4 h-4 accent-lab-mint"
        />
        <label htmlFor="autoCards" className="text-xs font-mono text-lab-text-primary uppercase">
          AUTOMATICALLY GENERATE FLASHCARDS FROM EXTRACTED FACTS
        </label>
      </div>

      <button
        onClick={handleExtract}
        disabled={!text.trim() || loading}
        className="w-full bg-lab-mint border-2 border-lab-mint text-black hover:bg-lab-mint/80 py-4 px-6 font-mono uppercase font-bold transition-all disabled:bg-lab-border disabled:border-lab-border disabled:text-lab-text-tertiary disabled:cursor-not-allowed"
        style={{ borderRadius: '2px' }}
      >
        {loading ? (
          <>
            <span className="inline-block animate-spin mr-2">⏳</span>
            EXTRACTING WITH AI...
          </>
        ) : (
          '✨ EXTRACT KNOWLEDGE WITH AI'
        )}
      </button>

      {loading && (
        <div className="mt-4 text-xs font-mono text-lab-text-tertiary text-center border-t border-lab-border/30 pt-3">
          PROCESSING... THIS MAY TAKE 10-30 SECONDS DEPENDING ON TEXT LENGTH
        </div>
      )}
    </div>
  );
}
