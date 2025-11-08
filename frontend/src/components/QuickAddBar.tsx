import React, { useState } from 'react';

interface Props {
  onAdd: (statement: string, factType: string) => void;
  isLoading?: boolean;
}

const FACT_TYPES = [
  { value: 'definition', label: 'Definition (Term = Def)' },
  { value: 'association', label: 'Association (A → B)' },
  { value: 'localization', label: 'Localization' },
  { value: 'comparison', label: 'Comparison (A vs B)' },
  { value: 'clinical', label: 'Clinical' },
  { value: 'simple', label: 'Simple' },
];

export default function QuickAddBar({ onAdd, isLoading }: Props) {
  const [statement, setStatement] = useState('');
  const [factType, setFactType] = useState('simple');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (statement.trim()) {
      onAdd(statement, factType);
      setStatement('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card">
      <div className="flex flex-col gap-3">
        <div className="flex gap-3">
          <input
            type="text"
            value={statement}
            onChange={(e) => setStatement(e.target.value)}
            placeholder="Quick add: Type a fact and press Enter..."
            className="input flex-1"
            disabled={isLoading}
          />
          <select
            value={factType}
            onChange={(e) => setFactType(e.target.value)}
            className="input w-48"
            disabled={isLoading}
          >
            {FACT_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={!statement.trim() || isLoading}
          >
            {isLoading ? 'Adding...' : 'Add Fact'}
          </button>
        </div>
        <div className="text-xs text-gray-500">
          <strong>Tips:</strong> Use "=" for definitions, "→" for associations, "vs" for comparisons
        </div>
      </div>
    </form>
  );
}
