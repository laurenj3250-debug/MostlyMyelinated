import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import axios from 'axios';

interface EditableNodeNameProps {
  nodeId: string;
  initialName: string;
  onSave?: (nodeId: string, newName: string) => void;
  readonly?: boolean;
  className?: string;
}

export default function EditableNodeName({
  nodeId,
  initialName,
  onSave,
  readonly = false,
  className = '',
}: EditableNodeNameProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(initialName);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Update local name when initialName changes
  useEffect(() => {
    setName(initialName);
  }, [initialName]);

  // Focus input when editing starts
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleStartEdit = () => {
    if (readonly) return;
    setIsEditing(true);
    setError(null);
  };

  const handleCancel = () => {
    setName(initialName);
    setIsEditing(false);
    setError(null);
  };

  const handleSave = async () => {
    const trimmedName = name.trim();

    if (!trimmedName) {
      setError('Name cannot be empty');
      return;
    }

    if (trimmedName === initialName) {
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `/api/nodes/${nodeId}/name`,
        { name: trimmedName },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setIsEditing(false);
      if (onSave) {
        onSave(nodeId, trimmedName);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update name');
      setName(initialName);
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  if (isEditing) {
    return (
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleSave}
          disabled={isSaving}
          className={`w-full px-3 py-2 rounded-lg border-2 transition-all font-display text-base uppercase tracking-wider ${
            isSaving
              ? 'border-lab-border-dim bg-lab-bg-tertiary cursor-wait animate-pulse'
              : error
              ? 'border-red-500 bg-lab-bg-secondary'
              : 'border-neon-cyan bg-lab-bg-secondary'
          } ${className}`}
          style={{
            boxShadow: error
              ? '0 0 16px rgba(255, 51, 102, 0.4)'
              : '0 0 16px rgba(0, 234, 255, 0.4)',
            color: '#00eaff',
            outline: 'none',
          }}
        />
        {error && (
          <p className="text-xs text-red-500 mt-1 font-mono">
            {error}
          </p>
        )}
      </div>
    );
  }

  return (
    <div
      className={`group ${readonly ? '' : 'cursor-pointer'} ${className}`}
      onDoubleClick={handleStartEdit}
    >
      <div className="flex items-center gap-2">
        <span className="font-display text-base uppercase tracking-wider">
          {name}
        </span>
        {!readonly && (
          <button
            onClick={handleStartEdit}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-lab-bg-tertiary"
            title="Edit name (or double-click)"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 text-neon-cyan"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
