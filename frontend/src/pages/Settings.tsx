import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import { nodes as nodesApi } from '../services/api';

export default function Settings() {
  const navigate = useNavigate();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmText, setConfirmText] = useState('');

  const handleDeleteAll = async () => {
    if (confirmText !== 'DELETE ALL') {
      return;
    }

    try {
      setIsDeleting(true);

      const response = await nodesApi.deleteAll();

      // Success - redirect to dashboard
      alert(`Successfully deleted ${response.data.deletedCount} nodes`);
      setShowConfirm(false);
      setConfirmText('');
      navigate('/');
    } catch (error: any) {
      console.error('Delete all nodes error:', error);
      alert(error.response?.data?.error || 'Failed to delete nodes');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div
      className="min-h-screen text-lab-text-primary"
      style={{
        background: 'linear-gradient(180deg, #0a0e1a 0%, #0f1320 100%)',
        position: 'relative'
      }}
    >
      {/* Scanline Overlay */}
      <div
        className="fixed inset-0 pointer-events-none opacity-10 z-50"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 234, 255, 0.03) 2px, rgba(0, 234, 255, 0.03) 4px)',
          animation: 'scanline 8s linear infinite'
        }}
      />

      {/* Header */}
      <header
        className="border-b-2 border-lab-cyan/30 py-6 mb-8"
        style={{
          background: 'linear-gradient(135deg, rgba(0, 234, 255, 0.08) 0%, rgba(163, 75, 255, 0.08) 100%)',
          boxShadow: '0 4px 20px rgba(0, 234, 255, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
        }}
      >
        <div className="max-w-5xl mx-auto px-6">
          <button
            onClick={() => navigate('/')}
            className="mb-4 px-4 py-2 font-mono text-sm text-lab-cyan hover:text-white transition-colors border border-lab-cyan/30 hover:border-lab-cyan rounded"
          >
            ← BACK TO DASHBOARD
          </button>
          <h1
            className="text-4xl font-extrabold font-display uppercase tracking-wider"
            style={{
              background: 'linear-gradient(135deg, #00eaff 0%, #ff5ecd 50%, #a34bff 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 0 40px rgba(0, 234, 255, 0.6)'
            }}
          >
            SYSTEM SETTINGS
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-6 pb-12 space-y-8">

        {/* User Preferences Section */}
        <div
          className="border-2 border-lab-border p-6"
          style={{
            background: 'rgba(15, 23, 42, 0.6)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
          }}
        >
          <h2 className="text-2xl font-bold font-display text-lab-cyan uppercase tracking-wider mb-4">
            USER PREFERENCES
          </h2>
          <p className="text-lab-text-secondary font-mono text-sm mb-4">
            Study settings and preferences coming soon...
          </p>
        </div>

        {/* Danger Zone */}
        <div
          className="border-2 p-6"
          style={{
            background: 'rgba(255, 51, 102, 0.05)',
            borderColor: '#ff3366',
            boxShadow: '0 4px 12px rgba(255, 51, 102, 0.2), inset 0 1px 0 rgba(255, 51, 102, 0.1)'
          }}
        >
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle size={24} color="#ff3366" />
            <h2 className="text-2xl font-bold font-display uppercase tracking-wider" style={{ color: '#ff3366' }}>
              DANGER ZONE
            </h2>
          </div>

          <p className="text-lab-text-secondary font-mono text-sm mb-6">
            Destructive actions that cannot be undone. Proceed with extreme caution.
          </p>

          {!showConfirm ? (
            <button
              onClick={() => setShowConfirm(true)}
              className="px-6 py-3 font-display font-bold uppercase tracking-wider rounded border-2 transition-all"
              style={{
                background: 'transparent',
                borderColor: '#ff3366',
                color: '#ff3366',
                boxShadow: '0 0 10px rgba(255, 51, 102, 0.3)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 51, 102, 0.1)';
                e.currentTarget.style.boxShadow = '0 0 20px rgba(255, 51, 102, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.boxShadow = '0 0 10px rgba(255, 51, 102, 0.3)';
              }}
            >
              DELETE ALL NODES
            </button>
          ) : (
            <div
              className="border-2 p-6 space-y-4"
              style={{
                background: 'rgba(255, 51, 102, 0.08)',
                borderColor: '#ff3366',
                boxShadow: '0 0 20px rgba(255, 51, 102, 0.3)'
              }}
            >
              <p className="font-mono text-sm font-bold" style={{ color: '#ff3366' }}>
                ⚠️ WARNING: This will permanently delete ALL nodes, cards, and related data.
              </p>
              <p className="font-mono text-sm text-lab-text-secondary">
                Type <span className="font-bold text-white">DELETE ALL</span> to confirm:
              </p>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="DELETE ALL"
                className="w-full px-4 py-3 font-mono text-sm border-2 rounded"
                style={{
                  background: 'rgba(0, 0, 0, 0.5)',
                  borderColor: confirmText === 'DELETE ALL' ? '#00ff88' : '#ff3366',
                  color: '#ffffff'
                }}
              />
              <div className="flex gap-4">
                <button
                  onClick={handleDeleteAll}
                  disabled={confirmText !== 'DELETE ALL' || isDeleting}
                  className="px-6 py-3 font-display font-bold uppercase tracking-wider rounded border-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    background: confirmText === 'DELETE ALL' ? '#ff3366' : 'transparent',
                    borderColor: '#ff3366',
                    color: confirmText === 'DELETE ALL' ? '#ffffff' : '#ff3366',
                    boxShadow: confirmText === 'DELETE ALL' ? '0 0 20px rgba(255, 51, 102, 0.5)' : 'none'
                  }}
                >
                  {isDeleting ? 'DELETING...' : 'CONFIRM DELETE'}
                </button>
                <button
                  onClick={() => {
                    setShowConfirm(false);
                    setConfirmText('');
                  }}
                  className="px-6 py-3 font-display font-bold uppercase tracking-wider rounded border-2 transition-all"
                  style={{
                    background: 'transparent',
                    borderColor: '#00eaff',
                    color: '#00eaff'
                  }}
                >
                  CANCEL
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
