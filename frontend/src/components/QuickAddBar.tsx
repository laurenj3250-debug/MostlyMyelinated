import React, { useState } from 'react';

interface Props {
  onAdd: (statement: string, factType: string) => void;
  isLoading?: boolean;
}

const FACT_TYPES = [
  { value: 'definition', label: 'DEFINITION (TERM = DEF)' },
  { value: 'association', label: 'ASSOCIATION (A → B)' },
  { value: 'localization', label: 'LOCALIZATION' },
  { value: 'comparison', label: 'COMPARISON (A VS B)' },
  { value: 'clinical', label: 'CLINICAL' },
  { value: 'simple', label: 'SIMPLE' },
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
    <form onSubmit={handleSubmit} className="bg-black border-2 border-lab-cyan/50 p-4" style={{ borderRadius: '2px' }}>
      <div className="flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={statement}
            onChange={(e) => setStatement(e.target.value)}
            placeholder="ENTER FACT STATEMENT..."
            className="flex-1 bg-lab-card border-2 border-lab-border focus:border-lab-cyan text-lab-text-primary font-mono px-4 py-3 outline-none transition-all placeholder:text-lab-text-tertiary"
            style={{ borderRadius: '2px' }}
            disabled={isLoading}
          />
          <select
            value={factType}
            onChange={(e) => setFactType(e.target.value)}
            className="bg-lab-card border-2 border-lab-border focus:border-lab-cyan text-lab-text-primary font-mono px-4 py-3 outline-none transition-all sm:w-64"
            style={{ borderRadius: '2px' }}
            disabled={isLoading}
          >
            {FACT_TYPES.map((type) => (
              <option key={type.value} value={type.value} className="bg-lab-card">
                {type.label}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="bg-lab-cyan border-2 border-lab-cyan text-black hover:bg-lab-mint hover:border-lab-mint py-3 px-8 font-mono uppercase font-bold transition-all disabled:bg-lab-border disabled:border-lab-border disabled:text-lab-text-tertiary disabled:cursor-not-allowed"
            style={{ borderRadius: '2px' }}
            disabled={!statement.trim() || isLoading}
          >
            {isLoading ? 'PROCESSING...' : 'GENERATE FLASHCARDS'}
          </button>
        </div>
        <div className="text-xs font-mono text-lab-text-tertiary border-t border-lab-border/30 pt-3">
          <span className="text-lab-cyan">SYNTAX TIPS:</span> Use "=" for definitions • "→" for associations • "vs" for comparisons
        </div>
      </div>
    </form>
  );
}
