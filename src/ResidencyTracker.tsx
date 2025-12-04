import React, { useState, useEffect, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell, Legend } from 'recharts';

const STORAGE_KEY = 'residency-tracker-data';

const colors = {
  bg: '#0f0f14',
  surface: '#18181f',
  card: '#1f1f28',
  cardHover: '#262630',
  border: '#2a2a35',
  textPrimary: '#e8e8ed',
  textSecondary: '#8b8b9a',
  textMuted: '#5c5c6d',
  enjoyment: '#4ade80',
  enjoymentDim: '#22543d',
  quit: '#f87171',
  quitDim: '#7f1d1d',
  energy: '#fbbf24',
  energyDim: '#78350f',
  stress: '#a78bfa',
  stressDim: '#4c1d95',
  accent: '#60a5fa',
  accentDim: '#1e3a5f',
  surgery: '#34d399',
  client: '#fb923c',
  glass: '#ef4444',
};

interface TrackerData {
  entries: Entry[];
  streak: number;
  lastEntryDate: string | null;
  longestStreak: number;
}

interface Entry {
  id: string;
  timestamp: string;
  date: string;
  dayOfWeek: string;
  enjoyment: number;
  quitUrge: number;
  energy: number;
  stress: number;
  hoursWorked: string | null;
  caseType: string | null;
  glassInteraction: string;
  hadWin: boolean;
  winNote: string;
  hadDemoralizingMoment: boolean;
  demoralizingNote: string;
  sleepHours: string | null;
  exhaustion: string | null;
  gym: boolean;
  adam: boolean;
  german: boolean;
  cats: boolean;
  notes: string;
}

const loadData = (): TrackerData => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch (e) {}
  return { entries: [], streak: 0, lastEntryDate: null, longestStreak: 0 };
};

const saveData = (data: TrackerData) => {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch (e) {}
};

const formatDate = (date: string) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
const formatTime = (date: string) => new Date(date).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
const getDayOfWeek = (date: string | Date) => new Date(date).toLocaleDateString('en-US', { weekday: 'short' });
const getDateKey = (date: string | Date) => {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
const isToday = (date: string | Date) => getDateKey(date) === getDateKey(new Date());

export default function ResidencyTracker() {
  const [data, setData] = useState<TrackerData>(() => loadData());
  const [activeTab, setActiveTab] = useState('home');
  const [showLogModal, setShowLogModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showExportSuccess, setShowExportSuccess] = useState(false);

  useEffect(() => { saveData(data); }, [data]);

  const addEntry = (entry: Omit<Entry, 'id' | 'timestamp' | 'date' | 'dayOfWeek'>) => {
    const now = new Date().toISOString();
    const today = getDateKey(new Date());
    const lastDate = data.lastEntryDate ? getDateKey(data.lastEntryDate) : null;
    const yesterdayKey = getDateKey(new Date(Date.now() - 86400000));

    let newStreak = data.streak;
    if (lastDate === today) { /* same day */ }
    else if (lastDate === yesterdayKey) newStreak = data.streak + 1;
    else newStreak = 1;

    const newEntry: Entry = { ...entry, id: Date.now().toString(), timestamp: now, date: today, dayOfWeek: getDayOfWeek(now) };
    setData(prev => ({
      ...prev,
      entries: [...prev.entries, newEntry],
      streak: newStreak,
      longestStreak: Math.max(prev.longestStreak, newStreak),
      lastEntryDate: now,
    }));
    setShowLogModal(false);
  };

  const exportData = () => {
    const blob = new Blob([JSON.stringify({ exportDate: new Date().toISOString(), ...data }, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `residency-tracker-${getDateKey(new Date())}.json`;
    a.click();
    setShowExportSuccess(true);
    setTimeout(() => setShowExportSuccess(false), 2000);
  };

  const todayEntries = useMemo(() => data.entries.filter(e => getDateKey(e.timestamp) === getDateKey(new Date())), [data.entries]);
  const daysLogged = useMemo(() => new Set(data.entries.map(e => getDateKey(e.timestamp))).size, [data.entries]);
  const insightsUnlocked = daysLogged >= 14;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: colors.bg, color: colors.textPrimary, fontFamily: "'Inter', -apple-system, sans-serif" }}>
      <div style={{ paddingBottom: '80px' }}>
        {activeTab === 'home' && <HomeScreen data={data} todayEntries={todayEntries} onLogClick={() => setShowLogModal(true)} daysLogged={daysLogged} insightsUnlocked={insightsUnlocked} daysUntilInsights={Math.max(0, 14 - daysLogged)} />}
        {activeTab === 'insights' && <InsightsScreen data={data} insightsUnlocked={insightsUnlocked} daysUntilInsights={Math.max(0, 14 - daysLogged)} daysLogged={daysLogged} />}
        {activeTab === 'calendar' && <CalendarScreen data={data} onSelectDate={setSelectedDate} selectedDate={selectedDate} />}
        {activeTab === 'settings' && <SettingsScreen data={data} onExport={exportData} showExportSuccess={showExportSuccess} onClearData={() => { if (confirm('Delete ALL data?')) setData({ entries: [], streak: 0, lastEntryDate: null, longestStreak: 0 }); }} />}
      </div>
      <nav style={{ position: 'fixed', bottom: 0, left: 0, right: 0, backgroundColor: colors.surface, borderTop: `1px solid ${colors.border}`, display: 'flex', justifyContent: 'space-around', padding: '8px 0 20px 0', zIndex: 100 }}>
        {[['🏠', 'Home', 'home'], ['📊', 'Insights', 'insights'], ['📅', 'Calendar', 'calendar'], ['⚙️', 'Settings', 'settings']].map(([icon, label, tab]) => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{ background: 'none', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', padding: '8px 16px', cursor: 'pointer', opacity: activeTab === tab ? 1 : 0.5, position: 'relative' }}>
            <span style={{ fontSize: '20px' }}>{icon}</span>
            <span style={{ fontSize: '11px', color: activeTab === tab ? colors.accent : colors.textSecondary, fontWeight: activeTab === tab ? '600' : '400' }}>{label}</span>
            {tab === 'insights' && !insightsUnlocked && <span style={{ position: 'absolute', top: '4px', right: '12px', fontSize: '10px' }}>🔒</span>}
          </button>
        ))}
      </nav>
      {showLogModal && <LogEntryModal onClose={() => setShowLogModal(false)} onSave={addEntry} />}
    </div>
  );
}

function HomeScreen({ data, todayEntries, onLogClick, daysLogged, insightsUnlocked, daysUntilInsights }: { data: TrackerData; todayEntries: Entry[]; onLogClick: () => void; daysLogged: number; insightsUnlocked: boolean; daysUntilInsights: number }) {
  const weeklyData = useMemo(() => {
    const result = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(); date.setDate(date.getDate() - i);
      const dayEntries = data.entries.filter(e => getDateKey(e.timestamp) === getDateKey(date));
      result.push({
        day: getDayOfWeek(date),
        enjoyment: dayEntries.length ? dayEntries.reduce((s, e) => s + e.enjoyment, 0) / dayEntries.length : null,
        quit: dayEntries.length ? dayEntries.reduce((s, e) => s + e.quitUrge, 0) / dayEntries.length : null,
      });
    }
    return result;
  }, [data.entries]);

  return (
    <div style={{ padding: '20px', maxWidth: '500px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '4px', background: `linear-gradient(135deg, ${colors.textPrimary}, ${colors.accent})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Residency Tracker</h1>
        <p style={{ color: colors.textSecondary, fontSize: '14px' }}>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
      </div>
      <div style={{ background: `linear-gradient(135deg, ${colors.card}, ${colors.surface})`, borderRadius: '16px', padding: '20px', marginBottom: '16px', border: `1px solid ${colors.border}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '14px', color: colors.textSecondary, marginBottom: '4px' }}>Current Streak</div>
            <div style={{ fontSize: '36px', fontWeight: '700' }}>{data.streak} <span style={{ fontSize: '24px' }}>{data.streak >= 7 ? '🔥' : data.streak >= 3 ? '✨' : '📝'}</span></div>
            <div style={{ fontSize: '12px', color: colors.textMuted }}>Best: {data.longestStreak} days</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '14px', color: colors.textSecondary, marginBottom: '4px' }}>Today</div>
            <div style={{ fontSize: '24px', fontWeight: '600' }}>{todayEntries.length}</div>
            <div style={{ fontSize: '12px', color: colors.textMuted }}>{todayEntries.length === 1 ? 'entry' : 'entries'}</div>
          </div>
        </div>
      </div>
      {data.entries.length > 0 && (
        <div style={{ background: colors.card, borderRadius: '16px', padding: '16px', marginBottom: '16px', border: `1px solid ${colors.border}` }}>
          <div style={{ fontSize: '14px', color: colors.textSecondary, marginBottom: '12px' }}>Last 7 Days</div>
          <div style={{ height: '80px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weeklyData}>
                <Line type="monotone" dataKey="enjoyment" stroke={colors.enjoyment} strokeWidth={2} dot={false} connectNulls />
                <Line type="monotone" dataKey="quit" stroke={colors.quit} strokeWidth={2} dot={false} connectNulls />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: colors.textMuted, fontSize: 10 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: 'flex', gap: '16px', marginTop: '8px', justifyContent: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}><div style={{ width: '12px', height: '3px', backgroundColor: colors.enjoyment, borderRadius: '2px' }} /><span style={{ color: colors.textSecondary }}>Enjoyment</span></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}><div style={{ width: '12px', height: '3px', backgroundColor: colors.quit, borderRadius: '2px' }} /><span style={{ color: colors.textSecondary }}>Quit Urge</span></div>
          </div>
        </div>
      )}
      {!insightsUnlocked && (
        <div style={{ background: colors.card, borderRadius: '16px', padding: '16px', marginBottom: '16px', border: `1px solid ${colors.border}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}><span>🔒</span><span style={{ fontSize: '14px', color: colors.textSecondary }}>Insights unlock in {daysUntilInsights} days</span></div>
          <div style={{ height: '6px', backgroundColor: colors.border, borderRadius: '3px', overflow: 'hidden' }}><div style={{ width: `${(daysLogged / 14) * 100}%`, height: '100%', backgroundColor: colors.accent, borderRadius: '3px' }} /></div>
          <div style={{ fontSize: '12px', color: colors.textMuted, marginTop: '6px' }}>{daysLogged}/14 days logged</div>
        </div>
      )}
      <button onClick={onLogClick} style={{ width: '100%', padding: '20px', fontSize: '18px', fontWeight: '600', backgroundColor: colors.accent, color: '#fff', border: 'none', borderRadius: '16px', cursor: 'pointer', marginBottom: '24px', boxShadow: `0 4px 20px ${colors.accentDim}` }}>+ Log How You're Feeling</button>
      {todayEntries.length > 0 && (
        <div>
          <h2 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px', color: colors.textSecondary }}>Today's Entries</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>{todayEntries.map(entry => <EntryCard key={entry.id} entry={entry} />)}</div>
        </div>
      )}
      {data.entries.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: colors.textSecondary }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📝</div>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px', color: colors.textPrimary }}>Start Tracking</h3>
          <p style={{ fontSize: '14px', lineHeight: '1.5' }}>Log your first entry to start understanding patterns.</p>
        </div>
      )}
    </div>
  );
}

function EntryCard({ entry }: { entry: Entry }) {
  const emojis = ['😫', '😔', '😐', '🙂', '😊'];
  const quitColors = [colors.enjoyment, '#a3e635', colors.energy, colors.quit, '#991b1b'];
  return (
    <div style={{ background: colors.card, borderRadius: '12px', padding: '14px', border: `1px solid ${colors.border}` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
        <span style={{ fontSize: '12px', color: colors.textMuted }}>{formatTime(entry.timestamp)}</span>
        <div style={{ display: 'flex', gap: '6px' }}>
          {entry.caseType === 'surgery' && <span style={{ fontSize: '12px' }}>🩺</span>}
          {entry.caseType === 'client' && <span style={{ fontSize: '12px' }}>😬</span>}
          {(entry.glassInteraction === 'negative' || entry.glassInteraction === 'major') && <span style={{ fontSize: '12px' }}>⚡</span>}
          {entry.hadWin && <span style={{ fontSize: '12px' }}>🏆</span>}
          {entry.hadDemoralizingMoment && <span style={{ fontSize: '12px' }}>💔</span>}
        </div>
      </div>
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ fontSize: '18px' }}>{emojis[entry.enjoyment - 1]}</span><span style={{ fontSize: '12px', color: colors.textSecondary }}>Enjoyment</span></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '16px', height: '16px', borderRadius: '4px', backgroundColor: quitColors[entry.quitUrge - 1] }} /><span style={{ fontSize: '12px', color: colors.textSecondary }}>Quit: {entry.quitUrge}</span></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ fontSize: '12px', color: colors.energy }}>⚡{entry.energy}</span></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ fontSize: '12px', color: colors.stress }}>😰{entry.stress}</span></div>
      </div>
      {entry.notes && <p style={{ fontSize: '12px', color: colors.textSecondary, marginTop: '10px', fontStyle: 'italic' }}>"{entry.notes}"</p>}
    </div>
  );
}

interface FormState {
  enjoyment: number;
  quitUrge: number;
  energy: number;
  stress: number;
  hoursWorked: string | null;
  caseType: string | null;
  glassInteraction: string;
  hadWin: boolean;
  winNote: string;
  hadDemoralizingMoment: boolean;
  demoralizingNote: string;
  sleepHours: string | null;
  exhaustion: string | null;
  gym: boolean;
  adam: boolean;
  german: boolean;
  cats: boolean;
  notes: string;
}

function LogEntryModal({ onClose, onSave }: { onClose: () => void; onSave: (entry: FormState) => void }) {
  const [form, setForm] = useState<FormState>({ enjoyment: 3, quitUrge: 3, energy: 3, stress: 3, hoursWorked: null, caseType: null, glassInteraction: 'none', hadWin: false, winNote: '', hadDemoralizingMoment: false, demoralizingNote: '', sleepHours: null, exhaustion: null, gym: false, adam: false, german: false, cats: false, notes: '' });
  const [expanded, setExpanded] = useState({ work: false, life: false });

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 200, overflowY: 'auto' }}>
      <div style={{ minHeight: '100%', backgroundColor: colors.bg, padding: '20px', paddingBottom: '100px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '22px', fontWeight: '700' }}>How are you feeling?</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '24px', color: colors.textSecondary, cursor: 'pointer', padding: '8px' }}>✕</button>
        </div>
        <p style={{ color: colors.textSecondary, fontSize: '14px', marginBottom: '24px' }}>Right now, in this moment.</p>

        <div style={{ marginBottom: '24px' }}>
          <MoodScale label="Enjoyment / Fulfillment" value={form.enjoyment} onChange={(v) => setForm(p => ({ ...p, enjoyment: v }))} type="emoji" color={colors.enjoyment} />
          <MoodScale label="Wanting to Quit" value={form.quitUrge} onChange={(v) => setForm(p => ({ ...p, quitUrge: v }))} type="quit" color={colors.quit} lowLabel="not at all" highLabel="desperately" />
          <MoodScale label="Energy Level" value={form.energy} onChange={(v) => setForm(p => ({ ...p, energy: v }))} type="number" color={colors.energy} lowLabel="empty" highLabel="full" />
          <MoodScale label="Stress / Overwhelm" value={form.stress} onChange={(v) => setForm(p => ({ ...p, stress: v }))} type="number" color={colors.stress} lowLabel="calm" highLabel="overwhelmed" />
        </div>

        <CollapsibleSection title="Work Context" expanded={expanded.work} onToggle={() => setExpanded(p => ({ ...p, work: !p.work }))}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ fontSize: '14px', color: colors.textSecondary, display: 'block', marginBottom: '10px' }}>Hours worked so far</label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>{['<8', '8-10', '10-12', '12-14', '14+'].map(o => <ToggleButton key={o} label={o} selected={form.hoursWorked === o} onClick={() => setForm(p => ({ ...p, hoursWorked: o }))} />)}</div>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ fontSize: '14px', color: colors.textSecondary, display: 'block', marginBottom: '10px' }}>Today's case mix</label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <ToggleButton label="🩺 Surgery" selected={form.caseType === 'surgery'} onClick={() => setForm(p => ({ ...p, caseType: 'surgery' }))} activeColor={colors.surgery} />
              <ToggleButton label="😬 Client-heavy" selected={form.caseType === 'client'} onClick={() => setForm(p => ({ ...p, caseType: 'client' }))} activeColor={colors.client} />
              <ToggleButton label="Mixed" selected={form.caseType === 'mixed'} onClick={() => setForm(p => ({ ...p, caseType: 'mixed' }))} />
              <ToggleButton label="Other" selected={form.caseType === 'other'} onClick={() => setForm(p => ({ ...p, caseType: 'other' }))} />
            </div>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ fontSize: '14px', color: colors.textSecondary, display: 'block', marginBottom: '10px' }}>Glass interaction</label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {[{ v: 'none', l: 'None' }, { v: 'neutral', l: 'Neutral' }, { v: 'negative', l: 'Negative' }, { v: 'major', l: '💥 Major clash' }, { v: 'positive', l: '✨ Positive' }].map(o => (
                <ToggleButton key={o.v} label={o.l} selected={form.glassInteraction === o.v} onClick={() => setForm(p => ({ ...p, glassInteraction: o.v }))} activeColor={(o.v === 'major' || o.v === 'negative') ? colors.glass : undefined} />
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '140px' }}>
              <ToggleButton label="🏆 Win moment" selected={form.hadWin} onClick={() => setForm(p => ({ ...p, hadWin: !p.hadWin }))} activeColor={colors.enjoyment} fullWidth />
              {form.hadWin && <input type="text" placeholder="What was the win? (optional)" value={form.winNote} onChange={(e) => setForm(p => ({ ...p, winNote: e.target.value }))} style={{ width: '100%', marginTop: '8px', padding: '10px', backgroundColor: colors.surface, border: `1px solid ${colors.border}`, borderRadius: '8px', color: colors.textPrimary, fontSize: '14px' }} />}
            </div>
            <div style={{ flex: 1, minWidth: '140px' }}>
              <ToggleButton label="💔 Demoralizing" selected={form.hadDemoralizingMoment} onClick={() => setForm(p => ({ ...p, hadDemoralizingMoment: !p.hadDemoralizingMoment }))} activeColor={colors.quit} fullWidth />
              {form.hadDemoralizingMoment && <input type="text" placeholder="What happened? (optional)" value={form.demoralizingNote} onChange={(e) => setForm(p => ({ ...p, demoralizingNote: e.target.value }))} style={{ width: '100%', marginTop: '8px', padding: '10px', backgroundColor: colors.surface, border: `1px solid ${colors.border}`, borderRadius: '8px', color: colors.textPrimary, fontSize: '14px' }} />}
            </div>
          </div>
        </CollapsibleSection>

        <CollapsibleSection title="Life Stuff" expanded={expanded.life} onToggle={() => setExpanded(p => ({ ...p, life: !p.life }))}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ fontSize: '14px', color: colors.textSecondary, display: 'block', marginBottom: '10px' }}>Sleep last night</label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>{['<5', '5-6', '6-7', '7-8', '8+'].map(o => <ToggleButton key={o} label={o + 'h'} selected={form.sleepHours === o} onClick={() => setForm(p => ({ ...p, sleepHours: o }))} />)}</div>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ fontSize: '14px', color: colors.textSecondary, display: 'block', marginBottom: '10px' }}>Physical state</label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {[{ v: 'fine', l: '👍 Fine' }, { v: 'tired', l: '😴 Tired' }, { v: 'wrecked', l: '😵 Wrecked' }].map(o => <ToggleButton key={o.v} label={o.l} selected={form.exhaustion === o.v} onClick={() => setForm(p => ({ ...p, exhaustion: o.v }))} />)}
            </div>
          </div>
          <div>
            <label style={{ fontSize: '14px', color: colors.textSecondary, display: 'block', marginBottom: '10px' }}>Today's wins</label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <ToggleButton label="🏋️ Gym" selected={form.gym} onClick={() => setForm(p => ({ ...p, gym: !p.gym }))} activeColor={colors.enjoyment} />
              <ToggleButton label="💬 Adam" selected={form.adam} onClick={() => setForm(p => ({ ...p, adam: !p.adam }))} activeColor={colors.accent} />
              <ToggleButton label="🇩🇪 German" selected={form.german} onClick={() => setForm(p => ({ ...p, german: !p.german }))} activeColor={colors.energy} />
              <ToggleButton label="🐱 Cats" selected={form.cats} onClick={() => setForm(p => ({ ...p, cats: !p.cats }))} activeColor={colors.stress} />
            </div>
          </div>
        </CollapsibleSection>

        <div style={{ marginBottom: '24px' }}>
          <label style={{ fontSize: '14px', color: colors.textSecondary, display: 'block', marginBottom: '10px' }}>Notes (optional)</label>
          <textarea placeholder="Anything else on your mind..." value={form.notes} onChange={(e) => setForm(p => ({ ...p, notes: e.target.value }))} style={{ width: '100%', minHeight: '80px', padding: '12px', backgroundColor: colors.surface, border: `1px solid ${colors.border}`, borderRadius: '12px', color: colors.textPrimary, fontSize: '14px', resize: 'vertical', fontFamily: 'inherit' }} />
        </div>

        <button onClick={() => onSave(form)} style={{ width: '100%', padding: '18px', fontSize: '16px', fontWeight: '600', backgroundColor: colors.accent, color: '#fff', border: 'none', borderRadius: '12px', cursor: 'pointer' }}>Save Entry</button>
      </div>
    </div>
  );
}

function MoodScale({ label, value, onChange, type, color, lowLabel, highLabel }: { label: string; value: number; onChange: (v: number) => void; type: 'emoji' | 'quit' | 'number'; color: string; lowLabel?: string; highLabel?: string }) {
  const emojis = ['😫', '😔', '😐', '🙂', '😊'];
  const quitColors = ['#4ade80', '#a3e635', '#fbbf24', '#f87171', '#991b1b'];
  return (
    <div style={{ marginBottom: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <label style={{ fontSize: '14px', color: colors.textSecondary }}>{label}</label>
        {type === 'number' && <span style={{ fontSize: '20px', fontWeight: '700', color }}>{value}</span>}
      </div>
      <div style={{ display: 'flex', gap: '8px', justifyContent: 'space-between' }}>
        {[1, 2, 3, 4, 5].map(v => (
          <button key={v} onClick={() => onChange(v)} style={{ flex: 1, height: '52px', minWidth: '52px', maxWidth: '64px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '12px', border: value === v ? `2px solid ${color}` : `1px solid ${colors.border}`, backgroundColor: value === v ? `${color}22` : colors.card, cursor: 'pointer', transform: value === v ? 'scale(1.05)' : 'scale(1)', transition: 'all 0.15s' }}>
            {type === 'emoji' && <span style={{ fontSize: '24px' }}>{emojis[v - 1]}</span>}
            {type === 'quit' && <div style={{ width: '28px', height: '28px', borderRadius: '6px', backgroundColor: quitColors[v - 1] }} />}
            {type === 'number' && <span style={{ fontSize: '18px', fontWeight: '600', color: value === v ? color : colors.textSecondary }}>{v}</span>}
          </button>
        ))}
      </div>
      {(lowLabel || highLabel) && <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '11px', color: colors.textMuted }}><span>{lowLabel}</span><span>{highLabel}</span></div>}
    </div>
  );
}

function CollapsibleSection({ title, expanded, onToggle, children }: { title: string; expanded: boolean; onToggle: () => void; children: React.ReactNode }) {
  return (
    <div style={{ backgroundColor: colors.card, borderRadius: '16px', marginBottom: '16px', border: `1px solid ${colors.border}`, overflow: 'hidden' }}>
      <button onClick={onToggle} style={{ width: '100%', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer', color: colors.textPrimary }}>
        <span style={{ fontSize: '15px', fontWeight: '600' }}>{title}</span>
        <span style={{ fontSize: '18px', transform: expanded ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }}>▼</span>
      </button>
      {expanded && <div style={{ padding: '0 16px 16px 16px' }}>{children}</div>}
    </div>
  );
}

function ToggleButton({ label, selected, onClick, activeColor = colors.accent, fullWidth }: { label: string; selected: boolean; onClick: () => void; activeColor?: string; fullWidth?: boolean }) {
  return (
    <button onClick={onClick} style={{ padding: '10px 16px', borderRadius: '10px', border: selected ? `2px solid ${activeColor}` : `1px solid ${colors.border}`, backgroundColor: selected ? `${activeColor}22` : colors.surface, color: selected ? activeColor : colors.textSecondary, cursor: 'pointer', fontSize: '14px', fontWeight: selected ? '600' : '400', transition: 'all 0.15s', width: fullWidth ? '100%' : 'auto' }}>{label}</button>
  );
}

interface Insights {
  avgEnjoyment: number | null;
  avgQuit: number | null;
  avgEnergy: number | null;
  avgStress: number | null;
  glassAvgEnjoyment: number | null;
  glassAvgQuit: number | null;
  noGlassAvgEnjoyment: number | null;
  noGlassAvgQuit: number | null;
  glassCount: number;
  noGlassCount: number;
  surgeryAvgEnjoyment: number | null;
  clientAvgEnjoyment: number | null;
  surgeryCount: number;
  clientCount: number;
  hoursData: { hours: string; avgEnjoyment: number | null; count: number }[];
  factorImpacts: { key: string; label: string; impact: number; withCount: number; withoutCount: number }[];
  timeline: { date: string; dateLabel: string; enjoyment: number | null; quit: number | null; hasGlass: boolean }[];
}

function InsightsScreen({ data, insightsUnlocked, daysUntilInsights, daysLogged }: { data: TrackerData; insightsUnlocked: boolean; daysUntilInsights: number; daysLogged: number }) {
  const insights = useMemo((): Insights | null => {
    if (!insightsUnlocked || data.entries.length < 10) return null;
    const entries = data.entries;
    const avg = (arr: Entry[], key: keyof Entry) => arr.length ? arr.reduce((s, e) => s + (e[key] as number), 0) / arr.length : null;

    const glassEntries = entries.filter(e => e.glassInteraction === 'negative' || e.glassInteraction === 'major');
    const noGlassEntries = entries.filter(e => e.glassInteraction === 'none' || e.glassInteraction === 'neutral');
    const surgeryEntries = entries.filter(e => e.caseType === 'surgery');
    const clientEntries = entries.filter(e => e.caseType === 'client');

    const hoursBuckets: Record<string, Entry[]> = {};
    entries.forEach(e => { if (e.hoursWorked) { if (!hoursBuckets[e.hoursWorked]) hoursBuckets[e.hoursWorked] = []; hoursBuckets[e.hoursWorked].push(e); } });
    const hoursData = Object.entries(hoursBuckets).map(([hours, ents]) => ({ hours, avgEnjoyment: avg(ents, 'enjoyment'), count: ents.length })).sort((a, b) => ['<8', '8-10', '10-12', '12-14', '14+'].indexOf(a.hours) - ['<8', '8-10', '10-12', '12-14', '14+'].indexOf(b.hours));

    const factors: { key: keyof Entry; label: string }[] = [{ key: 'gym', label: '🏋️ Gym' }, { key: 'adam', label: '💬 Adam' }, { key: 'german', label: '🇩🇪 German' }, { key: 'cats', label: '🐱 Cats' }];
    const factorImpacts = factors.map(f => {
      const withF = entries.filter(e => e[f.key]), withoutF = entries.filter(e => !e[f.key]);
      if (withF.length < 3 || withoutF.length < 3) return null;
      const avgWith = avg(withF, 'enjoyment');
      const avgWithout = avg(withoutF, 'enjoyment');
      if (avgWith === null || avgWithout === null) return null;
      return { key: f.key as string, label: f.label, impact: avgWith - avgWithout, withCount: withF.length, withoutCount: withoutF.length };
    }).filter((f): f is NonNullable<typeof f> => f !== null).sort((a, b) => b.impact - a.impact);

    const dailyData: Record<string, { entries: Entry[]; date: string }> = {};
    entries.forEach(e => { const d = getDateKey(e.timestamp); if (!dailyData[d]) dailyData[d] = { entries: [], date: d }; dailyData[d].entries.push(e); });
    const timeline = Object.values(dailyData).map(d => ({ date: d.date, dateLabel: formatDate(d.date), enjoyment: avg(d.entries, 'enjoyment'), quit: avg(d.entries, 'quitUrge'), hasGlass: d.entries.some(e => e.glassInteraction === 'negative' || e.glassInteraction === 'major') })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).slice(-30);

    return {
      avgEnjoyment: avg(entries, 'enjoyment'), avgQuit: avg(entries, 'quitUrge'), avgEnergy: avg(entries, 'energy'), avgStress: avg(entries, 'stress'),
      glassAvgEnjoyment: avg(glassEntries, 'enjoyment'), glassAvgQuit: avg(glassEntries, 'quitUrge'), noGlassAvgEnjoyment: avg(noGlassEntries, 'enjoyment'), noGlassAvgQuit: avg(noGlassEntries, 'quitUrge'),
      glassCount: glassEntries.length, noGlassCount: noGlassEntries.length,
      surgeryAvgEnjoyment: avg(surgeryEntries, 'enjoyment'), clientAvgEnjoyment: avg(clientEntries, 'enjoyment'), surgeryCount: surgeryEntries.length, clientCount: clientEntries.length,
      hoursData, factorImpacts, timeline
    };
  }, [data.entries, insightsUnlocked]);

  if (!insightsUnlocked) {
    return (
      <div style={{ padding: '20px', maxWidth: '500px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px' }}>Insights</h1>
        <p style={{ color: colors.textSecondary, marginBottom: '32px' }}>Patterns in your data</p>
        <div style={{ backgroundColor: colors.card, borderRadius: '16px', padding: '32px 24px', textAlign: 'center', border: `1px solid ${colors.border}` }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔒</div>
          <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px' }}>{daysUntilInsights} more {daysUntilInsights === 1 ? 'day' : 'days'}</h2>
          <p style={{ color: colors.textSecondary, fontSize: '14px', lineHeight: '1.6', marginBottom: '20px' }}>Keep logging to unlock insights about:</p>
          <div style={{ textAlign: 'left', color: colors.textSecondary, fontSize: '14px' }}>
            <div style={{ marginBottom: '8px' }}>• Is it Glass or the hours?</div>
            <div style={{ marginBottom: '8px' }}>• Surgery days vs client days</div>
            <div style={{ marginBottom: '8px' }}>• What actually helps your mood</div>
            <div>• Your burnout trajectory</div>
          </div>
          <div style={{ marginTop: '24px', height: '8px', backgroundColor: colors.border, borderRadius: '4px', overflow: 'hidden' }}><div style={{ width: `${(daysLogged / 14) * 100}%`, height: '100%', backgroundColor: colors.accent, borderRadius: '4px' }} /></div>
          <div style={{ fontSize: '12px', color: colors.textMuted, marginTop: '8px' }}>{daysLogged}/14 days logged</div>
        </div>
      </div>
    );
  }

  if (!insights) return <div style={{ padding: '20px', textAlign: 'center', color: colors.textSecondary }}>Not enough data yet.</div>;

  const caseTypeData = [{ name: 'Surgery', enjoyment: insights.surgeryAvgEnjoyment, count: insights.surgeryCount }, { name: 'Client-heavy', enjoyment: insights.clientAvgEnjoyment, count: insights.clientCount }].filter(d => d.enjoyment !== null);

  return (
    <div style={{ padding: '20px', maxWidth: '500px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px' }}>Insights</h1>
      <p style={{ color: colors.textSecondary, marginBottom: '24px' }}>Based on {data.entries.length} entries over {daysLogged} days</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '24px' }}>
        <StatCard label="Avg Enjoyment" value={insights.avgEnjoyment?.toFixed(1) ?? '-'} color={colors.enjoyment} />
        <StatCard label="Avg Quit Urge" value={insights.avgQuit?.toFixed(1) ?? '-'} color={colors.quit} />
        <StatCard label="Avg Energy" value={insights.avgEnergy?.toFixed(1) ?? '-'} color={colors.energy} />
        <StatCard label="Avg Stress" value={insights.avgStress?.toFixed(1) ?? '-'} color={colors.stress} />
      </div>

      <div style={{ backgroundColor: colors.card, borderRadius: '16px', padding: '16px', marginBottom: '16px', border: `1px solid ${colors.border}` }}>
        <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>Enjoyment vs Quit Urge</h3>
        <p style={{ fontSize: '12px', color: colors.textSecondary, marginBottom: '16px' }}>Daily averages over time</p>
        <div style={{ height: '200px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={insights.timeline}>
              <CartesianGrid strokeDasharray="3 3" stroke={colors.border} />
              <XAxis dataKey="dateLabel" tick={{ fill: colors.textMuted, fontSize: 10 }} axisLine={{ stroke: colors.border }} tickLine={false} />
              <YAxis domain={[1, 5]} tick={{ fill: colors.textMuted, fontSize: 10 }} axisLine={{ stroke: colors.border }} tickLine={false} />
              <Tooltip contentStyle={{ backgroundColor: colors.surface, border: `1px solid ${colors.border}`, borderRadius: '8px' }} />
              <Line type="monotone" dataKey="enjoyment" stroke={colors.enjoyment} strokeWidth={2} dot={(props: any) => { const { cx, cy, payload } = props; return payload.hasGlass ? <circle cx={cx} cy={cy} r={4} fill={colors.glass} /> : <circle cx={cx} cy={cy} r={3} fill={colors.enjoyment} />; }} name="Enjoyment" />
              <Line type="monotone" dataKey="quit" stroke={colors.quit} strokeWidth={2} dot={{ r: 3 }} name="Quit Urge" />
              <Legend />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div style={{ fontSize: '11px', color: colors.textMuted, marginTop: '8px', textAlign: 'center' }}>🔴 Red dots = Glass interaction days</div>
      </div>

      {insights.noGlassAvgEnjoyment && insights.glassAvgEnjoyment && (
        <div style={{ backgroundColor: colors.card, borderRadius: '16px', padding: '16px', marginBottom: '16px', border: `1px solid ${colors.border}` }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>🔍 The Glass Question</h3>
          <p style={{ fontSize: '12px', color: colors.textSecondary, marginBottom: '16px' }}>Is your mentor the problem?</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
            <div style={{ backgroundColor: colors.surface, borderRadius: '12px', padding: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: '12px', color: colors.textSecondary, marginBottom: '4px' }}>Without Glass ({insights.noGlassCount})</div>
              <div style={{ fontSize: '24px', fontWeight: '700', color: colors.enjoyment }}>{insights.noGlassAvgEnjoyment?.toFixed(1)}</div>
              <div style={{ fontSize: '11px', color: colors.textMuted }}>enjoyment</div>
            </div>
            <div style={{ backgroundColor: colors.surface, borderRadius: '12px', padding: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: '12px', color: colors.textSecondary, marginBottom: '4px' }}>With Glass ({insights.glassCount})</div>
              <div style={{ fontSize: '24px', fontWeight: '700', color: colors.quit }}>{insights.glassAvgEnjoyment?.toFixed(1)}</div>
              <div style={{ fontSize: '11px', color: colors.textMuted }}>enjoyment</div>
            </div>
          </div>
          <div style={{ backgroundColor: (insights.noGlassAvgEnjoyment - insights.glassAvgEnjoyment) > 0.5 ? colors.quitDim : colors.surface, borderRadius: '8px', padding: '12px', fontSize: '13px', lineHeight: '1.5' }}>
            {(insights.noGlassAvgEnjoyment - insights.glassAvgEnjoyment) > 0.5 ? <><strong>Glass drops your enjoyment by {(insights.noGlassAvgEnjoyment - insights.glassAvgEnjoyment).toFixed(1)} points.</strong><br /><span style={{ color: colors.textSecondary }}>This is environmental, not career mismatch.</span></> : <span style={{ color: colors.textSecondary }}>Glass impact is minimal. Other factors may be the driver.</span>}
          </div>
        </div>
      )}

      {caseTypeData.length === 2 && (
        <div style={{ backgroundColor: colors.card, borderRadius: '16px', padding: '16px', marginBottom: '16px', border: `1px solid ${colors.border}` }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>🩺 The Neurology Question</h3>
          <p style={{ fontSize: '12px', color: colors.textSecondary, marginBottom: '16px' }}>Do you hate the specialty or just parts of it?</p>
          <div style={{ height: '120px', marginBottom: '12px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={caseTypeData} layout="vertical">
                <XAxis type="number" domain={[0, 5]} tick={{ fill: colors.textMuted, fontSize: 10 }} />
                <YAxis type="category" dataKey="name" tick={{ fill: colors.textSecondary, fontSize: 12 }} width={90} />
                <Bar dataKey="enjoyment" radius={[0, 6, 6, 0]}>{caseTypeData.map((entry, i) => <Cell key={i} fill={entry.name === 'Surgery' ? colors.surgery : colors.client} />)}</Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          {insights.surgeryAvgEnjoyment && insights.clientAvgEnjoyment && (
            <div style={{ backgroundColor: (insights.surgeryAvgEnjoyment - insights.clientAvgEnjoyment) > 0.5 ? colors.enjoymentDim : colors.surface, borderRadius: '8px', padding: '12px', fontSize: '13px', lineHeight: '1.5' }}>
              {(insights.surgeryAvgEnjoyment - insights.clientAvgEnjoyment) > 0.5 ? <><strong>You love surgery (+{(insights.surgeryAvgEnjoyment - insights.clientAvgEnjoyment).toFixed(1)} points).</strong><br /><span style={{ color: colors.textSecondary }}>Your intrinsic motivation is intact. Client interactions are the issue.</span></> : <span style={{ color: colors.textSecondary }}>Case type doesn't strongly predict your mood.</span>}
            </div>
          )}
        </div>
      )}

      {insights.hoursData.length > 0 && (
        <div style={{ backgroundColor: colors.card, borderRadius: '16px', padding: '16px', marginBottom: '16px', border: `1px solid ${colors.border}` }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>⏰ The Hours Question</h3>
          <p style={{ fontSize: '12px', color: colors.textSecondary, marginBottom: '16px' }}>When does mood collapse?</p>
          <div style={{ height: '150px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={insights.hoursData}>
                <CartesianGrid strokeDasharray="3 3" stroke={colors.border} />
                <XAxis dataKey="hours" tick={{ fill: colors.textMuted, fontSize: 10 }} />
                <YAxis domain={[0, 5]} tick={{ fill: colors.textMuted, fontSize: 10 }} />
                <Tooltip contentStyle={{ backgroundColor: colors.surface, border: `1px solid ${colors.border}`, borderRadius: '8px' }} />
                <Bar dataKey="avgEnjoyment" name="Enjoyment" fill={colors.enjoyment} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {insights.factorImpacts.length > 0 && (
        <div style={{ backgroundColor: colors.card, borderRadius: '16px', padding: '16px', marginBottom: '16px', border: `1px solid ${colors.border}` }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>💡 What Actually Helps</h3>
          <p style={{ fontSize: '12px', color: colors.textSecondary, marginBottom: '16px' }}>Impact on your enjoyment</p>
          {insights.factorImpacts.map(f => (
            <div key={f.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: `1px solid ${colors.border}` }}>
              <span style={{ fontSize: '14px' }}>{f.label}</span>
              <span style={{ fontSize: '14px', fontWeight: '600', color: f.impact > 0 ? colors.enjoyment : colors.quit }}>{f.impact > 0 ? '+' : ''}{f.impact.toFixed(1)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{ backgroundColor: colors.card, borderRadius: '12px', padding: '14px', border: `1px solid ${colors.border}` }}>
      <div style={{ fontSize: '12px', color: colors.textSecondary, marginBottom: '4px' }}>{label}</div>
      <div style={{ fontSize: '24px', fontWeight: '700', color }}>{value}</div>
    </div>
  );
}

interface CalendarDay {
  day: number;
  date: string;
  mood: number | null;
  hasGlass: boolean;
  entries: Entry[];
  isToday: boolean;
}

function CalendarScreen({ data, selectedDate, onSelectDate }: { data: TrackerData; selectedDate: string | null; onSelectDate: (date: string | null) => void }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const calendarData = useMemo(() => {
    const year = currentMonth.getFullYear(), month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1), lastDay = new Date(year, month + 1, 0);
    const days: (CalendarDay | null)[] = [];
    for (let i = 0; i < firstDay.getDay(); i++) days.push(null);
    for (let d = 1; d <= lastDay.getDate(); d++) {
      const date = new Date(year, month, d), dateKey = getDateKey(date);
      const dayEntries = data.entries.filter(e => getDateKey(e.timestamp) === dateKey);
      let mood: number | null = null, hasGlass = false;
      if (dayEntries.length > 0) {
        const avgE = dayEntries.reduce((s, e) => s + e.enjoyment, 0) / dayEntries.length;
        const avgQ = dayEntries.reduce((s, e) => s + e.quitUrge, 0) / dayEntries.length;
        mood = avgE - avgQ;
        hasGlass = dayEntries.some(e => e.glassInteraction === 'negative' || e.glassInteraction === 'major');
      }
      days.push({ day: d, date: dateKey, mood, hasGlass, entries: dayEntries, isToday: isToday(date) });
    }
    return days;
  }, [currentMonth, data.entries]);

  const selectedDayData = selectedDate ? calendarData.find(d => d && d.date === selectedDate) : null;

  return (
    <div style={{ padding: '20px', maxWidth: '500px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '24px' }}>Calendar</h1>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))} style={{ background: 'none', border: 'none', fontSize: '24px', color: colors.textSecondary, cursor: 'pointer', padding: '8px' }}>◀</button>
        <span style={{ fontSize: '18px', fontWeight: '600' }}>{currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
        <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))} style={{ background: 'none', border: 'none', fontSize: '24px', color: colors.textSecondary, cursor: 'pointer', padding: '8px' }}>▶</button>
      </div>
      <div style={{ backgroundColor: colors.card, borderRadius: '16px', padding: '16px', border: `1px solid ${colors.border}`, marginBottom: '16px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', marginBottom: '8px' }}>
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => <div key={i} style={{ textAlign: 'center', fontSize: '12px', color: colors.textMuted, padding: '8px 0' }}>{d}</div>)}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
          {calendarData.map((day, i) => (
            <button key={i} onClick={() => day?.entries?.length > 0 && onSelectDate(day.date)} disabled={!day || day.entries.length === 0} style={{ aspectRatio: '1', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderRadius: '8px', border: day?.isToday ? `2px solid ${colors.accent}` : 'none', backgroundColor: !day ? 'transparent' : day.mood === null ? colors.surface : day.mood > 1 ? colors.enjoymentDim : day.mood < -1 ? colors.quitDim : colors.surface, cursor: day?.entries?.length > 0 ? 'pointer' : 'default', opacity: day ? 1 : 0, position: 'relative' }}>
              {day && (<><span style={{ fontSize: '14px', color: day.entries.length > 0 ? colors.textPrimary : colors.textMuted, fontWeight: day.isToday ? '700' : '400' }}>{day.day}</span>{day.hasGlass && <div style={{ position: 'absolute', bottom: '4px', width: '6px', height: '6px', borderRadius: '50%', backgroundColor: colors.glass }} />}</>)}
            </button>
          ))}
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginBottom: '16px', fontSize: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '12px', height: '12px', borderRadius: '4px', backgroundColor: colors.enjoymentDim }} /><span style={{ color: colors.textSecondary }}>Good</span></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '12px', height: '12px', borderRadius: '4px', backgroundColor: colors.quitDim }} /><span style={{ color: colors.textSecondary }}>Bad</span></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: colors.glass }} /><span style={{ color: colors.textSecondary }}>Glass</span></div>
      </div>
      {selectedDayData?.entries?.length > 0 && (
        <div style={{ backgroundColor: colors.card, borderRadius: '16px', padding: '16px', border: `1px solid ${colors.border}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600' }}>{formatDate(selectedDayData.date)}</h3>
            <button onClick={() => onSelectDate(null)} style={{ background: 'none', border: 'none', color: colors.textSecondary, cursor: 'pointer', fontSize: '16px' }}>✕</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>{selectedDayData.entries.map(e => <EntryCard key={e.id} entry={e} />)}</div>
        </div>
      )}
    </div>
  );
}

function SettingsScreen({ data, onExport, showExportSuccess, onClearData }: { data: TrackerData; onExport: () => void; showExportSuccess: boolean; onClearData: () => void }) {
  const daysLogged = new Set(data.entries.map(e => getDateKey(e.timestamp))).size;
  return (
    <div style={{ padding: '20px', maxWidth: '500px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '24px' }}>Settings</h1>
      <div style={{ backgroundColor: colors.card, borderRadius: '16px', padding: '16px', marginBottom: '16px', border: `1px solid ${colors.border}` }}>
        <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>Your Data</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
          <div><div style={{ fontSize: '12px', color: colors.textSecondary }}>Total Entries</div><div style={{ fontSize: '24px', fontWeight: '700' }}>{data.entries.length}</div></div>
          <div><div style={{ fontSize: '12px', color: colors.textSecondary }}>Days Logged</div><div style={{ fontSize: '24px', fontWeight: '700' }}>{daysLogged}</div></div>
          <div><div style={{ fontSize: '12px', color: colors.textSecondary }}>Current Streak</div><div style={{ fontSize: '24px', fontWeight: '700' }}>{data.streak} 🔥</div></div>
          <div><div style={{ fontSize: '12px', color: colors.textSecondary }}>Best Streak</div><div style={{ fontSize: '24px', fontWeight: '700' }}>{data.longestStreak}</div></div>
        </div>
      </div>
      <div style={{ backgroundColor: colors.card, borderRadius: '16px', padding: '16px', marginBottom: '16px', border: `1px solid ${colors.border}` }}>
        <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>Export</h3>
        <button onClick={onExport} style={{ width: '100%', padding: '14px', backgroundColor: colors.surface, border: `1px solid ${colors.border}`, borderRadius: '10px', color: colors.textPrimary, fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>📤 Export all data (JSON)</button>
        {showExportSuccess && <div style={{ marginTop: '8px', padding: '10px', backgroundColor: colors.enjoymentDim, borderRadius: '8px', fontSize: '13px', textAlign: 'center' }}>✓ Data exported!</div>}
      </div>
      <div style={{ backgroundColor: colors.card, borderRadius: '16px', padding: '16px', border: `1px solid ${colors.border}` }}>
        <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px', color: colors.quit }}>Danger Zone</h3>
        <button onClick={onClearData} style={{ width: '100%', padding: '14px', backgroundColor: 'transparent', border: `1px solid ${colors.quit}`, borderRadius: '10px', color: colors.quit, fontSize: '14px', cursor: 'pointer' }}>🗑️ Clear all data</button>
        <p style={{ fontSize: '12px', color: colors.textMuted, marginTop: '8px', textAlign: 'center' }}>This cannot be undone. Export first.</p>
      </div>
      <div style={{ marginTop: '32px', textAlign: 'center', color: colors.textMuted, fontSize: '12px' }}>
        <p>Residency Mood Tracker</p>
        <p style={{ marginTop: '4px' }}>Built with 💙 to help you understand your experience</p>
      </div>
    </div>
  );
}
