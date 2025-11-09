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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="border-b p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Preview & Edit Cards</h2>
              <p className="text-gray-600 mt-1">
                Review and edit the generated cards before saving
              </p>
              <p className="text-sm text-gray-500 mt-2">
                <span className="font-medium">Fact:</span> {factStatement}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Cards List */}
        <div className="flex-1 overflow-y-auto p-6">
          {cards.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No cards generated. Click "Add Card" to create one.
            </div>
          ) : (
            <div className="space-y-4">
              {cards.map((card, index) => (
                <div
                  key={index}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  {editingIndex === index && editedCard ? (
                    // Edit mode
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Front (Question)
                        </label>
                        <textarea
                          value={editedCard.front}
                          onChange={(e) =>
                            setEditedCard({ ...editedCard, front: e.target.value })
                          }
                          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          rows={2}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Back (Answer)
                        </label>
                        <textarea
                          value={editedCard.back}
                          onChange={(e) =>
                            setEditedCard({ ...editedCard, back: e.target.value })
                          }
                          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          rows={2}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Hint (Optional)
                        </label>
                        <input
                          type="text"
                          value={editedCard.hint || ''}
                          onChange={(e) =>
                            setEditedCard({ ...editedCard, hint: e.target.value })
                          }
                          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Card Type
                        </label>
                        <select
                          value={editedCard.cardType}
                          onChange={(e) =>
                            setEditedCard({ ...editedCard, cardType: e.target.value })
                          }
                          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="basic">Basic</option>
                          <option value="reverse">Reverse</option>
                          <option value="cloze">Cloze</option>
                        </select>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={handleSaveEdit}
                          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                          <Save className="w-4 h-4" />
                          Save
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    // View mode
                    <div>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="mb-3">
                            <span className="text-xs font-medium text-gray-500 uppercase">
                              {card.cardType} Card #{index + 1}
                            </span>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <h4 className="font-medium text-gray-700 mb-1">Front:</h4>
                              <p className="text-gray-900">{card.front}</p>
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-700 mb-1">Back:</h4>
                              <p className="text-gray-900">{card.back}</p>
                            </div>
                          </div>
                          {card.hint && (
                            <div className="mt-2">
                              <span className="text-sm text-gray-600">
                                <span className="font-medium">Hint:</span> {card.hint}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2 ml-4">
                          <button
                            onClick={() => handleEdit(index)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(index)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
        <div className="border-t p-6">
          <div className="flex justify-between">
            <button
              onClick={handleAddCard}
              className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Card
            </button>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-6 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveAll}
                disabled={cards.length === 0}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                Save {cards.length} Card{cards.length !== 1 ? 's' : ''}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}