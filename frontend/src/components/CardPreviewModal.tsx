import { useState } from 'react';
import { X, Edit2, Save, Plus, Trash2 } from 'lucide-react';

interface CardTemplate {
  front: string;
  back: string;
  hint?: string;
  cardType: string;
}

interface CardPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  cards: CardTemplate[];
  onSave: (cards: CardTemplate[]) => void;
  factStatement: string;
}

export default function CardPreviewModal({
  isOpen,
  onClose,
  cards: initialCards,
  onSave,
  factStatement,
}: CardPreviewModalProps) {
  const [cards, setCards] = useState<CardTemplate[]>(initialCards);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editedCard, setEditedCard] = useState<CardTemplate | null>(null);

  if (!isOpen) return null;

  const handleEdit = (index: number) => {
    setEditingIndex(index);
    setEditedCard({ ...cards[index] });
  };

  const handleSaveEdit = () => {
    if (editingIndex !== null && editedCard) {
      const newCards = [...cards];
      newCards[editingIndex] = editedCard;
      setCards(newCards);
      setEditingIndex(null);
      setEditedCard(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setEditedCard(null);
  };

  const handleDelete = (index: number) => {
    setCards(cards.filter((_, i) => i !== index));
  };

  const handleAddCard = () => {
    const newCard: CardTemplate = {
      front: 'New Question',
      back: 'New Answer',
      cardType: 'basic',
    };
    setCards([...cards, newCard]);
    handleEdit(cards.length);
  };

  const handleSaveAll = () => {
    onSave(cards);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-black border-2 border-lab-cyan max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col" style={{ borderRadius: '2px' }}>
        {/* Header */}
        <div className="border-b-2 border-lab-cyan/30 p-6 bg-lab-card/30">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-mono font-bold uppercase text-lab-cyan">FLASHCARD PREVIEW - {cards.length} CARDS</h2>
              <p className="text-xs font-mono text-lab-text-secondary mt-2 uppercase">
                REVIEW AND EDIT GENERATED CARDS BEFORE CONFIRMATION
              </p>
              <p className="text-xs font-mono text-lab-text-tertiary mt-2 border-l-2 border-lab-mint/50 pl-3">
                <span className="font-bold text-lab-mint">SOURCE FACT:</span> {factStatement}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-lab-alert/20 border border-lab-border hover:border-lab-alert text-lab-text-tertiary hover:text-lab-alert transition-all"
              style={{ borderRadius: '2px' }}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Cards List */}
        <div className="flex-1 overflow-y-auto p-6 bg-lab-background/50">
          {cards.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-3">⚠️</div>
              <p className="text-sm font-mono text-lab-text-tertiary uppercase">
                NO CARDS GENERATED. CLICK "ADD CARD" TO CREATE ONE.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {cards.map((card, index) => (
                <div
                  key={index}
                  className="bg-black border border-lab-border hover:border-lab-cyan/50 p-4 transition-all"
                  style={{ borderRadius: '2px' }}
                >
                  {editingIndex === index && editedCard ? (
                    // Edit mode
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-mono text-lab-text-tertiary uppercase mb-1">
                          FRONT (STIMULUS)
                        </label>
                        <textarea
                          value={editedCard.front}
                          onChange={(e) =>
                            setEditedCard({ ...editedCard, front: e.target.value })
                          }
                          className="w-full bg-lab-card border-2 border-lab-border focus:border-lab-cyan text-lab-text-primary font-mono px-3 py-2 outline-none transition-all"
                          style={{ borderRadius: '2px' }}
                          rows={2}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-mono text-lab-text-tertiary uppercase mb-1">
                          BACK (RESPONSE)
                        </label>
                        <textarea
                          value={editedCard.back}
                          onChange={(e) =>
                            setEditedCard({ ...editedCard, back: e.target.value })
                          }
                          className="w-full bg-lab-card border-2 border-lab-border focus:border-lab-cyan text-lab-text-primary font-mono px-3 py-2 outline-none transition-all"
                          style={{ borderRadius: '2px' }}
                          rows={2}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-mono text-lab-text-tertiary uppercase mb-1">
                          HINT (OPTIONAL)
                        </label>
                        <input
                          type="text"
                          value={editedCard.hint || ''}
                          onChange={(e) =>
                            setEditedCard({ ...editedCard, hint: e.target.value })
                          }
                          className="w-full bg-lab-card border-2 border-lab-border focus:border-lab-mint text-lab-text-primary font-mono px-3 py-2 outline-none transition-all"
                          style={{ borderRadius: '2px' }}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-mono text-lab-text-tertiary uppercase mb-1">
                          CARD TYPE
                        </label>
                        <select
                          value={editedCard.cardType}
                          onChange={(e) =>
                            setEditedCard({ ...editedCard, cardType: e.target.value })
                          }
                          className="w-full bg-lab-card border-2 border-lab-border focus:border-lab-cyan text-lab-text-primary font-mono px-3 py-2 outline-none transition-all"
                          style={{ borderRadius: '2px' }}
                        >
                          <option value="basic" className="bg-lab-card">BASIC</option>
                          <option value="reverse" className="bg-lab-card">REVERSE</option>
                          <option value="cloze" className="bg-lab-card">CLOZE</option>
                        </select>
                      </div>
                      <div className="flex gap-2 pt-2 border-t border-lab-border/30">
                        <button
                          onClick={handleSaveEdit}
                          className="flex items-center gap-2 px-4 py-2 bg-lab-mint border-2 border-lab-mint text-black hover:bg-lab-mint/80 font-mono uppercase font-bold transition-all"
                          style={{ borderRadius: '2px' }}
                        >
                          <Save className="w-4 h-4" />
                          SAVE
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="px-4 py-2 border border-lab-border text-lab-text-tertiary hover:border-lab-alert hover:text-lab-alert font-mono uppercase transition-all"
                          style={{ borderRadius: '2px' }}
                        >
                          CANCEL
                        </button>
                      </div>
                    </div>
                  ) : (
                    // View mode
                    <div>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="mb-3 flex items-center gap-2">
                            <span className="text-xs font-mono text-lab-text-tertiary">
                              CARD #{String(index + 1).padStart(3, '0')}
                            </span>
                            <span className="text-xs font-mono bg-lab-cyan/20 border border-lab-cyan text-lab-cyan px-2 py-0.5 uppercase" style={{ borderRadius: '2px' }}>
                              {card.cardType}
                            </span>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="bg-lab-card/30 border-l-2 border-lab-cyan/50 p-3">
                              <h4 className="text-xs font-mono text-lab-cyan uppercase mb-1">STIMULUS:</h4>
                              <p className="text-sm font-mono text-lab-text-primary">{card.front}</p>
                            </div>
                            <div className="bg-lab-card/30 border-l-2 border-lab-mint/50 p-3">
                              <h4 className="text-xs font-mono text-lab-mint uppercase mb-1">RESPONSE:</h4>
                              <p className="text-sm font-mono text-lab-text-primary">{card.back}</p>
                            </div>
                          </div>
                          {card.hint && (
                            <div className="mt-2 text-xs font-mono text-lab-text-tertiary">
                              <span className="text-lab-mint">HINT:</span> {card.hint}
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2 ml-4">
                          <button
                            onClick={() => handleEdit(index)}
                            className="p-2 border border-lab-border text-lab-cyan hover:border-lab-cyan hover:bg-lab-cyan/10 transition-all"
                            style={{ borderRadius: '2px' }}
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(index)}
                            className="p-2 border border-lab-border text-lab-alert hover:border-lab-alert hover:bg-lab-alert/10 transition-all"
                            style={{ borderRadius: '2px' }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t-2 border-lab-cyan/30 p-6 bg-lab-card/30">
          <div className="flex flex-col sm:flex-row justify-between gap-3">
            <button
              onClick={handleAddCard}
              className="flex items-center justify-center gap-2 px-4 py-2 border-2 border-lab-border text-lab-text-primary hover:border-lab-cyan hover:text-lab-cyan font-mono uppercase transition-all"
              style={{ borderRadius: '2px' }}
            >
              <Plus className="w-4 h-4" />
              ADD CARD
            </button>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-6 py-2 border-2 border-lab-alert/30 text-lab-alert hover:border-lab-alert hover:bg-lab-alert/10 font-mono uppercase transition-all"
                style={{ borderRadius: '2px' }}
              >
                CANCEL
              </button>
              <button
                onClick={handleSaveAll}
                disabled={cards.length === 0}
                className="px-6 py-2 bg-lab-cyan border-2 border-lab-cyan text-black hover:bg-lab-mint hover:border-lab-mint disabled:bg-lab-border disabled:border-lab-border disabled:text-lab-text-tertiary disabled:cursor-not-allowed font-mono uppercase font-bold transition-all"
                style={{ borderRadius: '2px' }}
              >
                CONFIRM {cards.length} CARD{cards.length !== 1 ? 'S' : ''}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}