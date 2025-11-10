import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { nodes } from '../services/api';
import { useToast } from '../components/ToastContainer';

export default function NodeNew() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    summary: '',
    module: '',
    tags: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      addToast({ message: 'Name is required', type: 'error' });
      return;
    }

    setLoading(true);
    try {
      const tagsArray = formData.tags
        .split(',')
        .map(t => t.trim())
        .filter(t => t.length > 0);

      const res = await nodes.create({
        name: formData.name.trim(),
        summary: formData.summary.trim() || undefined,
        tags: tagsArray.length > 0 ? tagsArray : undefined,
      });

      addToast({ message: `Node "${res.data.name}" created!`, type: 'success' });
      navigate(`/nodes/${res.data.id}`);
    } catch (error: any) {
      console.error('Create node error:', error);
      addToast({
        message: error.response?.data?.error || 'Failed to create node',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-lab-bg-primary p-6">
      {/* Header */}
      <header className="max-w-4xl mx-auto mb-8">
        <button
          onClick={() => navigate('/')}
          className="px-6 py-3 rounded-pill border-medium font-display font-bold text-sm uppercase tracking-wider transition-all mb-6"
          style={{
            background: 'rgba(255, 94, 205, 0.12)',
            borderColor: '#ff5ecd',
            color: '#ff9cff'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.02)';
            e.currentTarget.style.boxShadow = '0 0 16px rgba(255, 94, 205, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          ← BACK TO DASHBOARD
        </button>

        <h1 className="text-holographic font-display text-5xl font-extrabold uppercase tracking-wider mb-4">
          CREATE NEW NODE
        </h1>
        <p className="text-lg font-sans text-lab-text-muted">
          Add a new concept to your neural network
        </p>
      </header>

      {/* Form */}
      <div className="max-w-4xl mx-auto">
        <form onSubmit={handleSubmit}>
          <div
            className="p-10 rounded-xl border-fat backdrop-blur-md"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 94, 205, 0.05) 0%, rgba(163, 75, 255, 0.05) 50%, rgba(0, 234, 255, 0.05) 100%)',
              borderColor: 'rgba(255, 156, 255, 0.3)',
              boxShadow: '0 0 30px rgba(255, 90, 255, 0.1), 0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
            }}
          >
            {/* Name field */}
            <div className="mb-8">
              <label
                htmlFor="name"
                className="block text-sm font-display font-bold uppercase tracking-wider text-neon-cyan mb-3"
                style={{ textShadow: '0 0 8px rgba(0, 234, 255, 0.6)' }}
              >
                Node Name *
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., C6-T2 Spinal Lesions"
                className="w-full px-6 py-4 rounded-pill border-medium font-sans text-lg transition-all"
                style={{
                  background: 'rgba(0, 0, 0, 0.4)',
                  borderColor: 'rgba(255, 156, 255, 0.3)',
                  color: '#ffffff',
                  outline: 'none'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#00eaff';
                  e.currentTarget.style.boxShadow = '0 0 16px rgba(0, 234, 255, 0.4)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255, 156, 255, 0.3)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
                required
              />
            </div>

            {/* Summary field */}
            <div className="mb-8">
              <label
                htmlFor="summary"
                className="block text-sm font-display font-bold uppercase tracking-wider text-neon-purple mb-3"
                style={{ textShadow: '0 0 8px rgba(163, 75, 255, 0.6)' }}
              >
                Summary
              </label>
              <textarea
                id="summary"
                value={formData.summary}
                onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                placeholder="Brief overview of this concept..."
                rows={4}
                className="w-full px-6 py-4 rounded-lg border-medium font-sans text-base transition-all resize-none"
                style={{
                  background: 'rgba(0, 0, 0, 0.4)',
                  borderColor: 'rgba(255, 156, 255, 0.3)',
                  color: '#ffffff',
                  outline: 'none'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#a34bff';
                  e.currentTarget.style.boxShadow = '0 0 16px rgba(163, 75, 255, 0.4)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255, 156, 255, 0.3)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
            </div>

            {/* Tags field */}
            <div className="mb-10">
              <label
                htmlFor="tags"
                className="block text-sm font-display font-bold uppercase tracking-wider text-neon-pink mb-3"
                style={{ textShadow: '0 0 8px rgba(255, 94, 205, 0.6)' }}
              >
                Tags (comma-separated)
              </label>
              <input
                type="text"
                id="tags"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                placeholder="spinal, motor, LMN"
                className="w-full px-6 py-4 rounded-pill border-medium font-sans text-base transition-all"
                style={{
                  background: 'rgba(0, 0, 0, 0.4)',
                  borderColor: 'rgba(255, 156, 255, 0.3)',
                  color: '#ffffff',
                  outline: 'none'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#ff5ecd';
                  e.currentTarget.style.boxShadow = '0 0 16px rgba(255, 94, 205, 0.4)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255, 156, 255, 0.3)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
              <p className="text-sm font-sans text-lab-text-dim mt-2 italic">
                Separate multiple tags with commas
              </p>
            </div>

            {/* Submit button */}
            <div className="flex items-center gap-4">
              <button
                type="submit"
                disabled={loading}
                className="relative overflow-hidden px-10 py-5 rounded-pill border-none font-display font-extrabold text-lg uppercase tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: 'linear-gradient(135deg, #ff5ecd 0%, #a34bff 50%, #00eaff 100%)',
                  color: '#ffffff',
                  boxShadow: '0 0 24px rgba(255, 90, 255, 0.5), 0 0 48px rgba(255, 90, 255, 0.3)'
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.currentTarget.style.transform = 'scale(1.05)';
                    e.currentTarget.style.boxShadow = '0 0 32px rgba(255, 90, 255, 0.7), 0 0 64px rgba(255, 90, 255, 0.4)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = '0 0 24px rgba(255, 90, 255, 0.5), 0 0 48px rgba(255, 90, 255, 0.3)';
                }}
              >
                {loading ? 'CREATING NODE...' : 'CREATE NODE'}
                {!loading && (
                  <div
                    className="absolute inset-0 w-1/2 h-full animate-light-sweep"
                    style={{
                      background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)',
                      pointerEvents: 'none'
                    }}
                  />
                )}
              </button>

              <button
                type="button"
                onClick={() => navigate('/')}
                className="px-8 py-5 rounded-pill border-medium font-display font-bold text-base uppercase tracking-wider transition-all"
                style={{
                  background: 'rgba(0, 0, 0, 0.3)',
                  borderColor: 'rgba(255, 156, 255, 0.2)',
                  color: '#c4b5fd'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255, 156, 255, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255, 156, 255, 0.2)';
                }}
              >
                CANCEL
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
