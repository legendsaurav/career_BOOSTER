/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';

const MOTIVATIONAL_QUOTES = [
  "They’re not doing you a favor by interviewing you — you’re evaluating them too.",
  "Confidence isn’t knowing everything; it’s trusting yourself to handle anything.",
  "You don’t need to be perfect — you need to be clear and decisive.",
  "Preparation creates calm. Panic comes from guessing.",
  "If you can explain it simply, you actually understand it.",
  "They’re not looking for genius — they’re looking for reliability.",
  "Your mindset walks into the room before you do.",
  "Slow down. Rushed answers look like weak thinking.",
  "Every question is an opportunity to show how you think, not just what you know.",
  "Eye contact, clarity, and structure beat raw intelligence.",
  "Don’t try to impress — try to communicate.",
  "Silence for a few seconds is better than a confused answer.",
  "Own your story — no one can challenge authenticity.",
  "Even if you don’t know the answer, show how you would approach it.",
  "Rejection doesn’t mean you’re not good — it means it wasn’t your fit."
];

function useInterval(callback: () => void, delay: number | null) {
  const savedCallback = useRef<() => void>();
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);
  useEffect(() => {
    if (delay === null) return;
    const id = setInterval(() => savedCallback.current && savedCallback.current(), delay);
    return () => clearInterval(id);
  }, [delay]);
}

function getRandomQuoteIdx(used: number[]) {
  const available = MOTIVATIONAL_QUOTES.map((_, i) => i).filter(i => !used.includes(i));
  if (available.length === 0) return Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length);
  return available[Math.floor(Math.random() * available.length)];
}

const preventImageDrag = (e: React.DragEvent<HTMLImageElement>) => {
    e.preventDefault();
};

const DEFAULT_PROFESSOR_PHOTO = '/photos/team.png';

const resolveProfessorPhotoSrc = (rawValue: unknown) => {
    const raw = String(rawValue || '').trim();
    if (!raw) return DEFAULT_PROFESSOR_PHOTO;
    if (/^data:/i.test(raw) || /^https?:\/\//i.test(raw)) return raw;

    let normalized = raw.replace(/\\+/g, '/');

    // Handle accidental absolute paths that include "/public/...".
    const lower = normalized.toLowerCase();
    const publicIdx = lower.indexOf('/public/');
    if (publicIdx >= 0) {
        normalized = normalized.slice(publicIdx + '/public'.length);
    }

    if (!normalized.startsWith('/')) {
        normalized = `/${normalized.replace(/^\/+/, '')}`;
    }

    try {
        normalized = decodeURIComponent(normalized);
    } catch {
        // Keep original if decode fails.
    }

    return encodeURI(normalized);
};

const isGenericProfessorPhoto = (rawValue: unknown) => {
    const raw = String(rawValue || '').trim().toLowerCase();
    if (!raw) return true;
    return raw === '/photos/team.png' || raw.startsWith('/photos/');
};

export function InterviewLoadingScreen({ duration = 15 * 60, onDone, theme }: { duration?: number; onDone?: () => void; theme?: 'light' | 'dark' }) {
  const [countdown, setCountdown] = useState(duration);
  const [quoteIdx, setQuoteIdx] = useState(() => Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length));
  const [usedQuotes, setUsedQuotes] = useState<number[]>([quoteIdx]);
  const [quoteFade, setQuoteFade] = useState(false);
  const [dotCount, setDotCount] = useState(1);
  const [jump, setJump] = useState(false);

  // Countdown logic
  useInterval(() => {
    setCountdown(c => {
      if (c <= 1) {
        if (onDone) onDone();
        return 0;
      }
      return c - 1;
    });
    setDotCount(d => (d % 3) + 1);
    
    // Micro jump every 4 seconds
    if (countdown % 4 === 0) {
      setJump(true);
      setTimeout(() => setJump(false), 200);
    }
  }, 1000);

  // Quote change logic
  useInterval(() => {
    setQuoteFade(true);
    setTimeout(() => {
      setQuoteIdx(prev => {
        const idx = getRandomQuoteIdx(usedQuotes);
        setUsedQuotes(uq => uq.length === MOTIVATIONAL_QUOTES.length ? [idx] : [...uq, idx]);
        return idx;
      });
      setQuoteFade(false);
    }, 500);
  }, 60000);

  // Timer animations
  // Floating: 2.5s cycle
  const floatY = 4 * Math.sin((Date.now() % 2500) / 2500 * 2 * Math.PI);
  const scale = jump ? 1.05 : 1;
  // Pulse: synced with seconds (1s cycle)
  const pulse = 0.5 + 0.5 * Math.sin((Date.now() % 1000) / 1000 * 2 * Math.PI);

    // Progress bar percent
    const progress = 100 - (countdown / duration) * 100;

    return (
        <div className="interview-loading-overlay interview-animate-fadein">
            <div className="interview-loading-center">
                <div className="interview-spinner-container">
                    <div className="interview-spinner" />
                </div>
                <h2 className="interview-loading-heading gradient-text">Your interview is being prepared</h2>
                <div
                    className="interview-loading-timer glassy-timer"
                    style={{
                        transform: `translateY(${floatY}px) scale(${scale})`,
                        boxShadow: `0 20px 40px -10px rgba(99, 102, 241, ${0.1 + 0.1 * pulse})`,
                    }}
                >
                    <span className="timer-digits">{`${Math.floor(countdown / 60).toString().padStart(2, '0')}:${(countdown % 60).toString().padStart(2, '0')}`}</span>
                    <div className="interview-loading-dots">
                        {Array(dotCount).fill('.').join('')}
                    </div>
                    <div className="interview-loading-ring" />
                </div>
                <div className="interview-progress-bar-bg">
                    <div className="interview-progress-bar-fg" style={{ width: `${progress}%` }} />
                </div>
                <div
                    className={`interview-loading-quote quote-card${quoteFade ? " fade" : ""}`}
                >
                    <span className="quote-icon" aria-hidden>💡</span>
                    {MOTIVATIONAL_QUOTES[quoteIdx]}
                </div>
            </div>
        </div>
    );
}

// Interviewer selection data
const INTERVIEWERS = [
    { id: 'akash_01', name: 'Akash', avatar: '/photos/interviewer/akash.png' },
    { id: 'steve_01', name: 'Steve', avatar: '/photos/interviewer/steven.png' },
    { id: 'yuri_01', name: 'Yuri', avatar: '/photos/interviewer/yuri.png' },
    { id: 'flora_01', name: 'Flora', avatar: '/photos/interviewer/flora.png' },
    { id: 'elina_01', name: 'Elina', avatar: '/photos/interviewer/elina.png' },
    { id: 'akashi_01', name: 'Akashi', avatar: '/photos/interviewer/akashi.png' },
];

type Interviewer = (typeof INTERVIEWERS)[number];

export function InterviewerSelectorPanel({ onStartInterview = () => {} }: { onStartInterview?: () => void }) {
    // Interviewer selection logic
    const [selected, setSelected] = useState<Interviewer | null>(null);
    const [loading, setLoading] = useState(false);
    const [userName, setUserName] = useState('');

    // Card click handler
    const handleSelect = (interviewer: Interviewer) => setSelected(interviewer);

    // Start interview
    const handleStart = async () => {
        if (!selected || !userName.trim()) return;
        if (onStartInterview) onStartInterview();
        setLoading(true);
        localStorage.setItem('selectedInterviewer', JSON.stringify(selected));
        localStorage.setItem('interviewUserName', userName.trim());
        // Compose payload for backend
        const payload = {
            interviewer_id: selected.id,
            interviewer_name: selected.name,
            user_id: userName.trim(),
            mode: interviewMode,
            manual_text: interviewMode === 'manual' ? manualInterviewText.trim() : undefined,
            ai_role: interviewMode === 'ai' ? aiRole.trim() : undefined,
            ai_position: interviewMode === 'ai' ? aiPosition.trim() : undefined,
            ai_companies: interviewMode === 'ai' ? aiCompanies.split(',').map(c => c.trim()).filter(Boolean) : undefined
        };
        try {
            await fetch('/api/interview/select', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
        } catch (err) {
            // Optionally handle error
        } finally {
            setLoading(false);
        }
    };
    // Left panel: Interview Practice Studio
    const [interviewMode, setInterviewMode] = useState('manual');
    const [manualInterviewText, setManualInterviewText] = useState('');
    const [aiRole, setAiRole] = useState('Software Engineering');
    const [aiPosition, setAiPosition] = useState('SDE-1 / Graduate Engineer Trainee');
    const [aiCompanies, setAiCompanies] = useState('Google, Microsoft, Amazon');
    const aiGeneratedInterviewPrompt = useMemo(() => {
        const cleanRole = aiRole.trim();
        const cleanPosition = aiPosition.trim();
        const cleanCompanies = aiCompanies.split(',').map((c) => c.trim()).filter(Boolean).join(', ');
        if (!cleanRole || !cleanPosition || !cleanCompanies) return '';
        return [
            `Generate a realistic interview practice set for ${cleanRole} candidates targeting the ${cleanPosition} position.`,
            `Keep the company style aligned with: ${cleanCompanies}.`,
            'Include technical questions, behavioral questions, and one short case/problem-solving question.',
            'After each question, include what an ideal strong answer should contain.'
        ].join(' ');
    }, [aiRole, aiPosition, aiCompanies]);
    const openInterviewBridge = (mode: string, prompt: string) => {
        const cleanPrompt = prompt.trim();
        if (!cleanPrompt) return;
        const payload = {
            source: 'career_booster', mode, prompt: cleanPrompt,
            role: aiRole.trim(), position: aiPosition.trim(),
            companies: aiCompanies.split(',').map((c) => c.trim()).filter(Boolean),
            timestamp: new Date().toISOString()
        };
        const params = new URLSearchParams({
            source: 'career_booster', mode, prompt: cleanPrompt,
            role: payload.role, position: payload.position,
            companies: payload.companies.join(', '),
            bridgeData: encodeURIComponent(JSON.stringify(payload))
        });
        const targetUrl = `https://interview-analysis-legendsauravs-projects.vercel.app/?${params.toString()}`;
        const opened = window.open(targetUrl, '_blank', 'noopener,noreferrer');
        if (!opened) window.location.href = targetUrl;
    };
    return (
        <>
            <div
                className="interview-practice-layout"
                style={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'stretch',
                    justifyContent: 'center',
                    width: '100%',
                    maxWidth: 980,
                    minWidth: 0,
                    margin: '0 auto',
                    background: 'linear-gradient(120deg, #f8fafc 0%, #f1f5f9 100%)',
                    borderRadius: 18,
                    boxShadow: '0 6px 32px #e0e7ef44',
                    border: '1.5px solid #e5e7eb',
                    overflow: 'visible',
                    position: 'relative',
                }}
            >
                {/* Left: Interview Practice Studio */}
                <div className="interview-practice-left" style={{
                    minWidth: 320,
                    maxWidth: 370,
                    width: '34%',
                    background: 'rgba(255,255,255,0.98)',
                    borderRight: '1.5px solid #e5e7eb',
                    padding: '2.2rem 1.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    boxSizing: 'border-box',
                    height: '100%',
                }}>
                    {/* ...existing code for left panel... */}
                    <h3 className="interview-practice-title" style={{ margin: '0 0 0.3rem 0', fontSize: '1.32rem', color: '#0f172a', fontWeight: 800, letterSpacing: 0.1 }}>Interview Practice Studio</h3>
                    <p className="interview-practice-subtitle" style={{ margin: 0, color: '#475569', fontSize: '1.01rem', fontWeight: 500, marginBottom: 12 }}>Choose how you want to practice, then continue in your dedicated interview website.</p>
                    <div style={{ display: 'flex', gap: '0.6rem', margin: '0.7rem 0 1.1rem 0', flexWrap: 'wrap' }}>
                        <button
                            className="interview-practice-mode-toggle"
                            onClick={() => setInterviewMode(interviewMode === 'manual' ? 'ai' : 'manual')}
                            style={{ border: '1.5px solid #cbd5e1', padding: '0.55rem 0.9rem', borderRadius: '999px', cursor: 'pointer', background: '#0f172a', color: '#ffffff', fontWeight: 700, fontSize: '1.01rem', boxShadow: '0 2px 8px #6366f122' }}
                        >
                            {interviewMode === 'manual' ? 'Switch to AI Interview Prompt Generator' : 'Switch to My Own Interview Text'}
                        </button>
                    </div>
                    {interviewMode === 'manual' ? (
                        <div className="interview-practice-box" style={{ background: '#f9fafb', border: '1.5px solid #e2e8f0', borderRadius: '1rem', padding: '1rem', boxShadow: '0 1px 6px #e2e8f055' }}>
                            <label className="interview-practice-label" style={{ display: 'block', fontWeight: 700, marginBottom: '0.45rem', color: '#0f172a', fontSize: '1.01rem' }}>Interview text / question set</label>
                            <textarea
                                className="interview-practice-input"
                                value={manualInterviewText}
                                onChange={(e) => setManualInterviewText(e.target.value)}
                                placeholder="Example: Conduct a frontend interview for React with focus on performance and state management."
                                rows={5}
                                style={{ width: '100%', border: '1.5px solid #cbd5e1', borderRadius: '0.8rem', padding: '0.8rem', resize: 'vertical', fontSize: '0.98rem', background: '#fff' }}
                            />
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.8rem', gap: '0.6rem', flexWrap: 'wrap' }}>
                                <p className="interview-practice-note" style={{ margin: 0, fontSize: '0.89rem', color: '#64748b' }}>This sends your custom text directly to the interview app.</p>
                            </div>
                        </div>
                    ) : (
                        <div className="interview-practice-box" style={{ background: '#f9fafb', border: '1.5px solid #e2e8f0', borderRadius: '1rem', padding: '1rem', boxShadow: '0 1px 6px #e2e8f055' }}>
                            <p className="interview-practice-note" style={{ margin: '0 0 0.8rem 0', color: '#334155', fontSize: '0.98rem' }}>Provide the details below and we will generate an interview practice prompt for you.</p>
                            <div style={{ display: 'grid', gap: '0.7rem', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))' }}>
                                <div>
                                    <label className="interview-practice-label" style={{ display: 'block', fontSize: '0.93rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>Role</label>
                                    <input
                                        className="interview-practice-input"
                                        type="text"
                                        value={aiRole}
                                        onChange={(e) => setAiRole(e.target.value)}
                                        placeholder="Software Engineering"
                                        style={{ width: '100%', border: '1.5px solid #cbd5e1', borderRadius: '0.7rem', padding: '0.55rem 0.7rem', fontSize: '0.98rem', background: '#fff' }}
                                    />
                                </div>
                                <div>
                                    <label className="interview-practice-label" style={{ display: 'block', fontSize: '0.93rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>Position</label>
                                    <input
                                        className="interview-practice-input"
                                        type="text"
                                        value={aiPosition}
                                        onChange={(e) => setAiPosition(e.target.value)}
                                        placeholder="SDE-1 / Graduate Engineer Trainee"
                                        style={{ width: '100%', border: '1.5px solid #cbd5e1', borderRadius: '0.7rem', padding: '0.55rem 0.7rem', fontSize: '0.98rem', background: '#fff' }}
                                    />
                                </div>
                            </div>
                            <div style={{ marginTop: '0.7rem' }}>
                                <label className="interview-practice-label" style={{ display: 'block', fontSize: '0.93rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>Target companies</label>
                                <input
                                    className="interview-practice-input"
                                    type="text"
                                    value={aiCompanies}
                                    onChange={(e) => setAiCompanies(e.target.value)}
                                    placeholder="Google, Microsoft, Amazon"
                                    style={{ width: '100%', border: '1.5px solid #cbd5e1', borderRadius: '0.7rem', padding: '0.55rem 0.7rem', fontSize: '0.98rem', background: '#fff' }}
                                />
                            </div>
                            <div className="interview-practice-preview" style={{ marginTop: '0.9rem', padding: '0.8rem', border: '1.5px dashed #94a3b8', borderRadius: '0.8rem', background: '#f8fafc' }}>
                                <div className="interview-practice-preview-label" style={{ fontSize: '0.87rem', color: '#475569', marginBottom: '0.35rem', fontWeight: 700 }}>Generated AI interview prompt preview</div>
                                <div className="interview-practice-preview-text" style={{ fontSize: '0.98rem', color: '#0f172a', lineHeight: 1.5 }}>
                                    {aiGeneratedInterviewPrompt || 'Fill role, position, and companies to generate the prompt.'}
                                </div>
                            </div>
                            {/* Button removed as per user request */}
                        </div>
                    )}
                </div>
                {/* Right: Interviewer selection grid (aesthetic, large, centered) */}
                <section className="interview-practice-right" style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    justifyContent: 'flex-start',
                    padding: '2.5rem 0 0 7vw', // Add left padding to shift rightwards
                    minWidth: 0,
                }}>
                    <h2 className="interview-practice-heading" style={{
                        fontSize: '2.1rem',
                        fontWeight: 800,
                        color: '#22223b',
                        margin: '0 0 2.2rem 0',
                        letterSpacing: 0.1,
                        textAlign: 'left',
                        fontFamily: 'Inter, Segoe UI, Arial, sans-serif',
                        marginLeft: '2vw',
                    }}>Choose the Interviewer</h2>
                    <div className="interview-practice-grid" style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, 1fr)',
                        gap: '2.2rem 2.2rem',
                        justifyItems: 'center',
                        alignItems: 'center',
                        width: '100%',
                        maxWidth: 700,
                        marginLeft: '2vw',
                    }}>
                        {INTERVIEWERS.map((iv) => (
                            <button
                                className={`interviewer-card ${selected?.id === iv.id ? 'selected' : ''}`}
                                key={iv.id}
                                type="button"
                                onClick={() => handleSelect(iv)}
                                tabIndex={0}
                                aria-pressed={selected?.id === iv.id}
                                style={{
                                    border: selected?.id === iv.id ? '3px solid #7c3aed' : '2px solid #e5e7eb',
                                    boxShadow: selected?.id === iv.id ? '0 4px 18px #7c3aed22' : '0 2px 8px #e5e7eb33',
                                    background: '#fff',
                                    borderRadius: 18,
                                    padding: 0,
                                    margin: 0,
                                    cursor: 'pointer',
                                    outline: 'none',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    transition: 'all 0.18s cubic-bezier(.4,0,.2,1)',
                                    width: 160,
                                    height: 170,
                                    justifyContent: 'center',
                                }}
                            >
                                <img
                                    className="interviewer-card-image"
                                    src={iv.avatar}
                                    alt={iv.name}
                                    draggable={false}
                                    onDragStart={preventImageDrag}
                                    onError={(e) => {
                                        e.currentTarget.onerror = null;
                                        e.currentTarget.src = '/photos/team.png';
                                    }}
                                    style={{
                                        width: 100,
                                        height: 100,
                                        borderRadius: 16,
                                        objectFit: 'cover',
                                        marginBottom: 18,
                                        border: '2.5px solid #e5e7eb',
                                        background: '#f3f4f6',
                                    }}
                                />
                                <span className="interviewer-card-name" style={{
                                    fontWeight: 700,
                                    color: '#22223b',
                                    fontSize: '1.18rem',
                                    textAlign: 'center',
                                    fontFamily: 'Inter, Segoe UI, Arial, sans-serif',
                                }}>{iv.name}</span>
                            </button>
                        ))}
                    </div>
                    <div className="interview-practice-actions" style={{
                        margin: '2.8rem 0 0 15vw',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 18,
                        width: '100%',
                        maxWidth: 350,
                    }}>
                        <input
                            className="interview-name-input"
                            type="text"
                            placeholder="Enter your name"
                            value={userName}
                            onChange={e => setUserName(e.target.value)}
                            style={{
                                width: 270,
                                padding: '0.85rem 1.1rem',
                                borderRadius: 12,
                                border: '1.7px solid #cbd5e1',
                                fontSize: '1.09rem',
                                background: '#f8fafc',
                                fontWeight: 500,
                                textAlign: 'center',
                                fontFamily: 'Inter, Segoe UI, Arial, sans-serif',
                                marginBottom: 0,
                            }}
                        />
                        <button
                            className={`interview-start-btn ${selected && userName.trim() && !loading ? 'ready' : 'disabled'}`}
                            type="button"
                            onClick={handleStart}
                            disabled={!selected || !userName.trim() || loading}
                            style={{
                                minWidth: 200,
                                background: selected && userName.trim() && !loading ? 'linear-gradient(90deg,#6366f1 0%,#7c3aed 100%)' : '#e5e7eb',
                                color: selected && userName.trim() && !loading ? '#fff' : '#888',
                                border: 'none', borderRadius: 12, fontWeight: 800, fontSize: '1.13rem',
                                padding: '0.85rem 1.4rem', cursor: selected && userName.trim() && !loading ? 'pointer' : 'not-allowed',
                                boxShadow: selected && userName.trim() && !loading ? '0 2px 8px #6366f122' : 'none',
                                transition: 'all 0.18s cubic-bezier(.4,0,.2,1)',
                                position: 'relative',
                                letterSpacing: 0.1,
                                fontFamily: 'Inter, Segoe UI, Arial, sans-serif',
                            }}
                        >
                            {loading ? (
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                                    <span className="spinner" style={{ width: 18, height: 18, border: '2.5px solid #fff', borderTop: '2.5px solid #6366f1', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite', marginRight: 8 }} />
                                    Starting…
                                </span>
                            ) : 'Start Interview'}
                        </button>
                    </div>
                </section>
                <style>{`
                    @keyframes spin { 100% { transform: rotate(360deg); } }
                `}</style>
            </div>
            {/* Overlay for waiting screen is now handled by main.tsx */}
        </>
    );
}
import ReactDOM from 'react-dom/client';
import { fetchMockData, updateProfessor, deleteProfessor, deleteDepartment, logout, fetchVisitors, trackVisit, registerPublicUser, getApiBaseUrl } from './api';
import { apiLogger, LogEntry } from './apilogger';
import { fallbackData } from './seed-export';
import { supabase, insertGuestLogin, getGuestTargetLockByEmail, insertGuestTargetLock } from './supabaseClient';

// Helper: section-specific Google Custom Search keys (env-first with localStorage fallback)
const getSectionAliases = (section: string): string[] => {
    const normalized = String(section || '').toUpperCase();
    if (normalized === 'LINKEDIN') return ['LINKEDIN', 'ALUMNI'];
    if (normalized === 'GITHUB') return ['GITHUB', 'PROJECTS'];
    return [normalized];
};

const getSectionApiKey = (section: string): string | null => {
    try {
        const envAny: any = (import.meta as any).env || {};
        const aliases = getSectionAliases(section);
        for (const alias of aliases) {
            const envKey = envAny[`VITE_GOOGLE_CSE_KEY_${alias}`];
            if (envKey) return envKey;
        }
        for (const alias of aliases) {
            const stored = localStorage.getItem(`GOOGLE_SEARCH_KEY_${alias}`);
            if (stored) return stored;
        }
        return envAny.VITE_GOOGLE_CSE_KEY || localStorage.getItem('GOOGLE_SEARCH_KEY') || null;
    } catch (e) { return null; }
};

const getSectionCx = (section: string): string | null => {
    try {
        const envAny: any = (import.meta as any).env || {};
        const aliases = getSectionAliases(section);
        for (const alias of aliases) {
            const envCx = envAny[`VITE_GOOGLE_CSE_CX_${alias}`];
            if (envCx) return envCx;
        }
        for (const alias of aliases) {
            const stored = localStorage.getItem(`GOOGLE_SEARCH_CX_${alias}`);
            if (stored) return stored;
        }
        return envAny.VITE_GOOGLE_CSE_CX || localStorage.getItem('GOOGLE_SEARCH_CX') || null;
    } catch (e) { return null; }
};

// NOTE: We intentionally do NOT seed any per-section API keys into localStorage
// at startup. Keys will only be read/used when the user navigates to the
// corresponding section and explicitly configures them in the Personal Panel.

// Exception: the ANNOUNCEMENTS section should remain active by default and
// auto-refresh periodically. Seed a default ANNOUNCEMENTS key/CX if not present.
try {
    // --- DEFAULT API KEYS FOR GUEST USERS ---
    // ALUMNI
    if (!localStorage.getItem('GOOGLE_SEARCH_KEY_ALUMNI')) {
        localStorage.setItem('GOOGLE_SEARCH_KEY_ALUMNI', 'AIzaSyC0ivyXvvrqHyPxSYRrlicqp5yWynOLbhY');
    }
    if (!localStorage.getItem('GOOGLE_SEARCH_CX_ALUMNI')) {
        localStorage.setItem('GOOGLE_SEARCH_CX_ALUMNI', '01c6c3ae77c0046b9');
    }
    // NEWS
    if (!localStorage.getItem('GOOGLE_SEARCH_KEY_NEWS')) {
        localStorage.setItem('GOOGLE_SEARCH_KEY_NEWS', 'AIzaSyCu35lRnlTSMYxNtHFdnVOZ7BBBq-_3nio');
    }
    if (!localStorage.getItem('GOOGLE_SEARCH_CX_NEWS')) {
        localStorage.setItem('GOOGLE_SEARCH_CX_NEWS', '85f2a0e2b4f4541d4');
    }
    // PROJECTS
    if (!localStorage.getItem('GOOGLE_SEARCH_KEY_PROJECTS')) {
        localStorage.setItem('GOOGLE_SEARCH_KEY_PROJECTS', 'AIzaSyDbFUdkelvwTq4ovghyxcRaaNgsP9Lirh8');
    }
    if (!localStorage.getItem('GOOGLE_SEARCH_CX_PROJECTS')) {
        localStorage.setItem('GOOGLE_SEARCH_CX_PROJECTS', 'c645970c8ba844cea');
    }
    // ANNOUNCEMENTS: Use NEWS API key/CX for guest users
    if (!localStorage.getItem('GOOGLE_SEARCH_KEY_ANNOUNCEMENTS')) {
        localStorage.setItem('GOOGLE_SEARCH_KEY_ANNOUNCEMENTS', 'AIzaSyCu35lRnlTSMYxNtHFdnVOZ7BBBq-_3nio');
    }
    if (!localStorage.getItem('GOOGLE_SEARCH_CX_ANNOUNCEMENTS')) {
        localStorage.setItem('GOOGLE_SEARCH_CX_ANNOUNCEMENTS', '85f2a0e2b4f4541d4');
    }
} catch (e) { /* ignore storage errors */ }

// --- DATA TYPES ---

// Replace/ensure Alumni search key and CX are set to the requested values.
// This intentionally overwrites any existing Alumni key/CX so the app
// will use the provided credentials.
try {
    const envAny: any = (import.meta as any).env || {};
    const alKey = envAny.VITE_GOOGLE_CSE_KEY_ALUMNI;
    const alCx = envAny.VITE_GOOGLE_CSE_CX_ALUMNI;
    if (alKey) localStorage.setItem('GOOGLE_SEARCH_KEY_ALUMNI', alKey);
    if (alCx) localStorage.setItem('GOOGLE_SEARCH_CX_ALUMNI', alCx);

    const ggKey = envAny.VITE_GOOGLE_GENAI_KEY;
    if (ggKey) localStorage.setItem('GOOGLE_GENAI_KEY', ggKey);

    const pplxKey = envAny.VITE_PERPLEXITY_API_KEY;
    if (pplxKey) localStorage.setItem('PERPLEXITY_API_KEY', pplxKey);
    const pplxModel = envAny.VITE_PERPLEXITY_MODEL;
    if (pplxModel) localStorage.setItem('PERPLEXITY_MODEL', pplxModel);

    const prjKey = envAny.VITE_GOOGLE_CSE_KEY_PROJECTS;
    const prjCx = envAny.VITE_GOOGLE_CSE_CX_PROJECTS;
    if (prjKey) localStorage.setItem('GOOGLE_SEARCH_KEY_PROJECTS', prjKey);
    if (prjCx) localStorage.setItem('GOOGLE_SEARCH_CX_PROJECTS', prjCx);

    const ghKey = envAny.VITE_GOOGLE_CSE_KEY_GITHUB;
    const ghCx = envAny.VITE_GOOGLE_CSE_CX_GITHUB;
    if (ghKey) localStorage.setItem('GOOGLE_SEARCH_KEY_GITHUB', ghKey);
    if (ghCx) localStorage.setItem('GOOGLE_SEARCH_CX_GITHUB', ghCx);

    const liKey = envAny.VITE_GOOGLE_CSE_KEY_LINKEDIN;
    const liCx = envAny.VITE_GOOGLE_CSE_CX_LINKEDIN;
    if (liKey) localStorage.setItem('GOOGLE_SEARCH_KEY_LINKEDIN', liKey);
    if (liCx) localStorage.setItem('GOOGLE_SEARCH_CX_LINKEDIN', liCx);
} catch (e) { /* ignore storage errors */ }
interface ProfessorLinks {
    awards: string;
    webpage: string;
    bio: string;
    [key: string]: string;
}

interface Professor {
    _id?: string;
    id: string;
    name: string;
    email: string;
    position: string;
    degree: string;
    branch: string;
    department?: string;
    departmentId?: string;
    description: string;
    photo: string;
    links: ProfessorLinks;
    research: string[] | string;
    projects: string[] | string;
    companies: string[] | string;
    lectures?: { title: string; url?: string; notes?: string }[] | string[] | string;
    websites?: string[] | string;
    institutes?: string[] | string;
    strategyNotice?: string;
}

const DEPARTMENT_STRATEGY_GUIDE: Record<string, { title: string; summary: string }> = {
    dept_ce: {
        title: 'Civil Strategy Track',
        summary: 'Prioritize resilient infrastructure: connect your work in structures, geotechnics, hydrology, and transport to climate-adaptive planning, GIS-backed decision systems, and IoT-enabled monitoring pipelines.'
    },
    dept_ee: {
        title: 'Electrical Strategy Track',
        summary: 'Build depth across smart grids, power electronics, EV systems, communication, and VLSI. The strongest profile combines simulation ability with deployable hardware/software validation.'
    },
    dept_me: {
        title: 'Mechanical Strategy Track',
        summary: 'Target the design-to-deployment chain: advanced manufacturing, thermo-fluids, robotics, and materials reliability. Showcase both numerical modeling and lab/industrial prototyping skills.'
    },
    dept_cs: {
        title: 'CSE Strategy Track',
        summary: 'Pair theoretical foundations with systems execution. For AI/ML roles, combine model quality with privacy, distributed systems, and production-grade engineering to stand out.'
    },
    dept_ch: {
        title: 'Chemical Strategy Track',
        summary: 'Map chemistry fundamentals to high-impact sectors: catalysis, electrochemistry, biomaterials, and computational design. Emphasize translational outcomes for pharma and energy ecosystems.'
    },
    dept_mt: {
        title: 'Materials Strategy Track',
        summary: 'Focus on characterization-to-application flow: deformation behavior, corrosion/coatings, energy materials, and nanostructures. Build a portfolio around measurable performance improvement.'
    },
    dept_ph: {
        title: 'Physics Strategy Track',
        summary: 'Bridge fundamentals and frontier applications: quantum technologies, photonics, condensed matter, and instrumentation. Align coursework and projects with mission-led R&D opportunities.'
    },
    dept_ma: {
        title: 'Mathematics Strategy Track',
        summary: 'Develop a dual edge: proof-level rigor plus computational implementation. High-value paths include quant finance, scientific computing, algorithms, and mathematical modeling for industry.'
    },
    dept_hs: {
        title: 'HSS Strategy Track',
        summary: 'Position domain expertise for policy, cognition, language, and organizational impact. Strong profiles combine analytical writing with data-backed frameworks and research communication.'
    },
    dept_ai: {
        title: 'AI Strategy Track',
        summary: 'Focus on computer vision, speech, security, healthcare, and trustworthy AI systems. The strongest profiles show research depth, strong experimentation, and measurable deployment impact.'
    }
};

interface Department {
    id: string;
    name: string;
    branches: string[];
}

interface Branch {
    id: string;
    name: string;
    departmentId?: string;
}

interface NewsItem { title: string; date: string; id?: string; link?: string; }

interface AppData {
    departments: Department[];
    branches: { [key: string]: Branch };
    professors: { [key: string]: Professor };
    news: NewsItem[];
}

interface JobItem {
    title: string;
    link: string;
    snippet: string;
    source: string;
    publishedAt?: string;
    isJobPosting: boolean;
}

const AI_DEPARTMENT_CSV_URL = encodeURI('/ai department/hs 202 project - AI.csv');

const AI_PROFESSOR_PHOTOS: Record<string, string> = {
    santoshkumarvipparthi: 'santosh kumar.jpg',
    abhinavkumar: 'abhinav kumar.jpg',
    anushaprakash: 'anusha prakash.jpg',
    awaneeshkumaryadav: 'Awaneesh Kumar Yadav.jpg',
    abhilashananda: 'Abhilasha Nanda.jpg',
    mayureshspardeshi: 'M. S. Pardeshi.jpg',
    puneetkumar: 'Puneet Kumar.jpg',
    rakeshsanodiya: 'Rakesh Sanodiya.jpg',
    tanushreemeena: 'Tanushree Meena.jpg',
    vandanabharti: 'Vandana Bharti.jpg',
    ashwanisharma: 'Ashwani Sharma.jpg',
    brajeshrawat: 'Brajesh Rawat.jpg',
    sudeeptamishra: 'Sudeepta.jpg',
    sujatapal: 'Sujata Pa.jpg',
    shashishekharjha: 'Shashi Shekar Jha.png',
    mukeshkumarsaini: 'Mukesh Kumar Sain.png',
    nitinauluck: 'Nitin Auluck.png',
    arunkumar: 'arun kumar.jpg',
    chandankumarbehera: 'C Behera.jpg'
};

const normalizeProfessorName = (value: string) => String(value || '')
    .toLowerCase()
    .replace(/^dr\.?\s*/i, '')
    .replace(/[^a-z0-9]+/g, '')
    .trim();

const parseCsvText = (text: string): Record<string, string>[] => {
    const rows = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
    if (!rows.length) return [];

    const splitRow = (line: string) => {
        const cells: string[] = [];
        let current = '';
        let insideQuotes = false;

        for (let index = 0; index < line.length; index += 1) {
            const char = line[index];
            const nextChar = line[index + 1];

            if (char === '"' && nextChar === '"') {
                current += '"';
                index += 1;
                continue;
            }

            if (char === '"') {
                insideQuotes = !insideQuotes;
                continue;
            }

            if (char === ',' && !insideQuotes) {
                cells.push(current.trim());
                current = '';
                continue;
            }

            current += char;
        }

        cells.push(current.trim());
        return cells.map((cell) => cell.replace(/^"|"$/g, '').trim());
    };

    const headers = splitRow(rows[0]);
    return rows.slice(1).map((row) => {
        const values = splitRow(row);
        const record: Record<string, string> = {};
        headers.forEach((header, index) => {
            if (!header) return;
            record[header] = values[index] || '';
        });
        return record;
    });
};

const getAiProfessorPhoto = (name: string) => {
    const normalized = normalizeProfessorName(name);
    const filename = AI_PROFESSOR_PHOTOS[normalized];
    if (!filename) return '/photos/team.png';
    return encodeURI(`/ai department/${filename}`);
};

const normalizeOfficialProfileUrl = (rawValue: string) => {
    const raw = String(rawValue || '').trim();
    if (!raw) return '';

    let candidate = raw;
    if (!/^https?:\/\//i.test(candidate)) {
        if (/^www\./i.test(candidate)) {
            candidate = `https://${candidate}`;
        } else if (/^[a-z0-9.-]+\.[a-z]{2,}(\/.*)?$/i.test(candidate)) {
            candidate = `https://${candidate}`;
        }
    }

    try {
        const parsed = new URL(candidate);
        if (!/^https?:$/i.test(parsed.protocol)) return '';
        return parsed.toString();
    } catch {
        return '';
    }
};

const loadAiDepartmentData = async () => {
    try {
        const response = await fetch(AI_DEPARTMENT_CSV_URL);
        if (!response.ok) return null;

        const csvText = await response.text();
        const rows = parseCsvText(csvText);
        if (!rows.length) return null;

        const department: Department = {
            id: 'dept_ai',
            name: 'AI',
            branches: ['branch_ai']
        };

        const branch: Branch = {
            id: 'branch_ai',
            name: 'AI',
            departmentId: 'dept_ai'
        };

        const professors: Record<string, Professor> = {};

        rows.forEach((row, index) => {
            const rawName = row['Professor Name'] || '';
            const cleanName = rawName.trim();
            if (!cleanName) return;

            const researchArea = (row['Research Area'] || '').trim();
            const phdFrom = (row['PhD From'] || '').trim();
            const email = (row['Email'] || '').trim();
            const websiteValue = (row['Website'] || '').trim();
            const officialProfileUrl = normalizeOfficialProfileUrl(websiteValue);

            professors[`prof_ai_${index + 1}`] = {
                id: `prof_ai_${index + 1}`,
                name: cleanName,
                email,
                position: 'Professor',
                degree: phdFrom,
                branch: 'branch_ai',
                department: 'AI',
                departmentId: 'dept_ai',
                description: `AI research focus: ${researchArea || 'General artificial intelligence'}.`,
                photo: getAiProfessorPhoto(cleanName),
                links: {
                    webpage: officialProfileUrl,
                    awards: '',
                    bio: websiteValue && !officialProfileUrl ? websiteValue : ''
                },
                research: researchArea,
                projects: [],
                companies: [],
                lectures: [],
                websites: [],
                institutes: phdFrom ? [phdFrom] : [],
                source: 'hs 202 project - AI.csv',
                strategyNotice: researchArea
                    ? `Focus: ${researchArea}. Recommended approach: emphasize datasets, evaluation, and practical deployment.`
                    : 'Focus: Artificial Intelligence. Recommended approach: emphasize datasets, evaluation, and practical deployment.'
            } as Professor;
        });

        return { departments: [department], branches: { branch_ai: branch }, professors };
    } catch {
        return null;
    }
};

type View = { view: 'home' } | { view: 'professor', id: string } | { view: 'department', id: string } | { view: 'professor_directory' };

const ALLOWED_GUESTS = [
    { name: 'Mohi Modi', first: 'Mohi didi', photo: '/photos/mohi_didi.png', role: 'Student at IIT ROPAR', location: 'RAJASTHAN, India' },
    { name: 'Harsh Yadav', first: 'Harsh', photo: '/photos/harsh.png', role: 'Student at IIT ROPAR', location: 'PUNE, India' },
    { name: 'Ankit Mittal', first: 'Ankit', photo: '/photos/ankit.png', role: 'Research Intern', location: 'NOIDA, India' },
    { name: 'Aditya Verma', first: 'Aditya', photo: '/photos/aditya.png', role: 'Student at IIT ROPAR', location: 'INDORE, India' },
    { name: 'Dhakshin Kotha', first: 'Dhakshin', photo: '/photos/dhakshin.png', role: 'Student at IIT ROPAR', location: 'INDORE, India' },
    { name: 'team', first: 'team', photo: '/photos/team.png', role: 'Team Member', location: 'India' },
    { name: 'Chandan Behera', first: 'Chandan', photo: '/photos/chandan behera.png', role: 'Team Member', location: 'India' },
    ];

const LOCAL_STORAGE_KEY = 'career-booster-data';
const TARGET_SELECTION_TOKENS_KEY = 'admin_target_selection_tokens';
const APP_SESSION_STATE_KEY = 'career-booster-session-state';
const APP_INACTIVITY_LIMIT_MS = 15 * 60 * 1000;

type TargetSelectionToken = {
    token: string;
    userName: string;
    userEmail: string;
    professorName: string;
    branchName: string;
    professorId: string;
    createdAt: string;
};

type PersistedSessionState = {
    userRole: 'admin' | 'public';
    currentUser: { name: string; email: string; role: string; photo?: string; location?: string };
    viewStack: View[];
    hasSetTarget: boolean;
    guestTarget: string | null;
    selectedProfessorId: string | null;
    isPersonalPanelOpen: boolean;
    lastActivityAt: number;
};

const loadSessionState = (): PersistedSessionState | null => {
    try {
        const raw = localStorage.getItem(APP_SESSION_STATE_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw) as PersistedSessionState;
        if (!parsed || (parsed.userRole !== 'admin' && parsed.userRole !== 'public')) return null;
        if (!parsed.currentUser || !parsed.currentUser.email) return null;
        if (!Array.isArray(parsed.viewStack) || parsed.viewStack.length === 0) return null;
        return parsed;
    } catch {
        return null;
    }
};

const saveSessionState = (state: PersistedSessionState | null) => {
    try {
        if (!state) localStorage.removeItem(APP_SESSION_STATE_KEY);
        else localStorage.setItem(APP_SESSION_STATE_KEY, JSON.stringify(state));
    } catch {
        // ignore storage errors
    }
};

const loadTargetSelectionTokens = (): TargetSelectionToken[] => {
    try {
        const raw = localStorage.getItem(TARGET_SELECTION_TOKENS_KEY);
        const parsed = raw ? JSON.parse(raw) : [];
        if (!Array.isArray(parsed)) return [];
        return parsed.filter((item) => item && item.token && item.userName && item.professorName);
    } catch {
        return [];
    }
};

const saveTargetSelectionTokens = (tokens: TargetSelectionToken[]) => {
    try { localStorage.setItem(TARGET_SELECTION_TOKENS_KEY, JSON.stringify(tokens)); } catch (e) { /* ignore */ }
};

const createTargetSelectionToken = () => {
    const ts = Date.now().toString(36).toUpperCase();
    const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
    return `TGT-${ts}-${rand}`;
};

const loadLocalData = (): AppData | null => {
    try {
        const data = localStorage.getItem(LOCAL_STORAGE_KEY);
        return data ? JSON.parse(data) : null;
    } catch {
        return null;
    }
};

const saveLocalData = (data: AppData) => {
    try { localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data)); } catch (e) { /* ignore */ }
};

// --- TOAST ---
const ToastContext = React.createContext<(msg: string) => void>(() => {});
export const ToastProvider = ({ children }: { children?: React.ReactNode }) => {
    const [toasts, setToasts] = useState<{ id: number; message: string }[]>([]);
    const showToast = (message: string) => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message }]);
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 5000);
    };
    return (
        <ToastContext.Provider value={showToast}>
            {children}
            <div id="toast-container">
                {toasts.map(t => <div key={t.id} className="toast visible">{t.message}</div>)}
            </div>
        </ToastContext.Provider>
    );
};

const useToast = () => React.useContext(ToastContext);

// --- COMPONENTS ---

// 1. Chatbot
const Chatbot = ({ userRole, apiKey }: { userRole?: 'admin' | 'public' | null, apiKey?: string }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'model', text: 'Hello! Ask me about any section of this website (Professor Directory, Departments, Mine/Public, Interview, Certificates, Quizzes, Alumni, Admin tools).' }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<null | HTMLDivElement>(null);

    const toggleChat = () => setIsOpen(!isOpen);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (isOpen) scrollToBottom();
    }, [messages, isOpen]);

    const getSiteSpecificReply = (question: string): string | null => {
        const q = question.toLowerCase();

        if (q.includes('section') || q.includes('what can i do') || q.includes('help') || q.includes('website')) {
            return [
                'This website has these main sections:',
                '- Professor Directory: browse all available professors.',
                '- Departments: open a department to view its professors.',
                '- PUBLIC: announcements and tech news feeds.',
                '- MINE: personalized dashboard (unlocks after selecting a target professor).',
                '- Free Certification Programs: provider-wise course collections.',
                '- Quizzes: practice and prep resources.',
                '- Alumni Networking: search alumni profiles.',
                '- Interview: choose interviewer and start interview flow with timer.'
            ].join('\n');
        }

        if (q.includes('professor directory') || q.includes('directory')) {
            return 'Open the Menu and click Professor Directory. You can browse available professors and open a profile from there.';
        }

        if (q.includes('department')) {
            return 'Use Menu -> Departments to open any department and view its professors. Departments with no data are removed from navigation.';
        }

        if (q.includes('mine') || q.includes('dashboard locked') || q.includes('unlock')) {
            return 'Mine is personalized. For public users, it unlocks after selecting a target professor from Professor Directory. The Go to Professor Directory button on the lock screen takes you directly there.';
        }

        if (q.includes('public') || q.includes('announcement') || q.includes('news')) {
            return 'PUBLIC tab shows announcements and news feeds. Use Open on each card to view full results.';
        }

        if (q.includes('interview') || q.includes('interviewer') || q.includes('timer')) {
            return 'Interview flow: open Interview section, choose interviewer, enter your name, and start. The timer screen runs and then returns to the app view after completion.';
        }

        if (q.includes('certificate') || q.includes('certification') || q.includes('course')) {
            return 'In Free Certification Programs, you can search by keyword, filter by category, and open course links provider-wise. Logos are loaded from local /logo files first, then fallback sources.';
        }

        if (q.includes('quiz') || q.includes('test') || q.includes('practice')) {
            return 'Quizzes section provides practice-oriented resources to prepare for interviews and assessments.';
        }

        if (q.includes('alumni') || q.includes('network')) {
            return 'Alumni Networking lets you search alumni/company-related profiles. Admin can configure API settings from the alumni modal settings button.';
        }

        if (q.includes('admin') || q.includes('visitor') || q.includes('manage')) {
            if (userRole === 'admin') {
                return 'As admin, you can manage professors/departments, view visitor notifications/panel, and open admin controls from the header.';
            }
            return 'Admin features are available only after admin login. Public users can browse directory, public feeds, and personalized Mine after target selection.';
        }

        if (q.includes('login') || q.includes('guest')) {
            return 'You can log in as Guest or Admin from the login page. Guest access is validated against allowed users and then routed into the main portal.';
        }

        return null;
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputValue.trim() || isLoading) return;

        const userMessage = { role: 'user', text: inputValue };
        const messagesForApi = [...messages, userMessage];

        setMessages(messagesForApi);
        setInputValue('');
        setIsLoading(true);

        const siteReply = getSiteSpecificReply(userMessage.text);
        if (siteReply) {
            setMessages(prev => [...prev, { role: 'model', text: siteReply }]);
            setIsLoading(false);
            return;
        }

        // Mock response if no key
        if (!apiKey) {
                setTimeout(() => {
                    setMessages(prev => [...prev, { role: 'model', text: "I can answer website section questions directly. For broader AI career guidance, add an API key in Personal Information." }]);
                    setIsLoading(false);
                }, 1000);
                return;
        }

        const systemPrompt = 'You are a helpful and friendly career advisor. Your goal is to provide insightful and encouraging advice to users about their careers.';
        const apiMessages = messagesForApi.map(msg => ({ role: msg.role === 'model' ? 'assistant' : 'user', content: msg.text }));

        try {
                const response = await fetch('https://api.perplexity.ai/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({ model: 'llama-3-sonar-small-32k-online', messages: [{ role: 'system', content: systemPrompt }, ...apiMessages] })
            });

            if (!response.ok) {
                throw new Error(`API request failed with status ${response.status}`);
            }

            const data = await response.json();
            const modelResponseText = data.choices?.[0]?.message?.content;
            if (modelResponseText) setMessages(prev => [...prev, { role: 'model', text: modelResponseText }]);
        } catch (error) {
            console.error('Chatbot error:', error);
            setMessages(prev => [...prev, { role: 'model', text: "Sorry, I'm having trouble connecting. Please try again later." }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <button
                className="chatbot-fab"
                onClick={toggleChat}
                aria-label="Open Chatbot"
            >
                <svg viewBox="0 0 120 120" className="chatbot-avatar" aria-hidden="true">
                    <g className="avatar-body">
                        <path d="M 30,120 C 30,90 90,90 90,120 Z" fill="#483D8B" />
                        <path d="M 60,95 L 50,115 L 70,115 Z" fill="#FFFFFF" />
                        <path d="M 60,95 m -10,0 l 10,10 l 10,-10" stroke="#FFC0CB" strokeWidth="2" fill="none" />
                        <rect x="55" y="85" width="10" height="10" fill="#ffdeb5" />
                    </g>
                    <g className="avatar-head" transform="translate(0, 0)">
                        <circle cx="60" cy="60" r="35" fill="#ffdeb5"/>
                        <path className="avatar-hair-back" d="M 20,60 C 20,10 100,10 100,60 Q 60,120 20,60 Z" fill="#8A2BE2" />
                        <g className="avatar-eyes">
                            <circle cx="47.5" cy="55" r="4" fill="#44281d" />
                            <circle cx="72.5" cy="55" r="4" fill="#44281d" />
                        </g>
                        <path d="M 55,75 Q 60,78 65,75" stroke="#44281d" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                    </g>
                </svg>
            </button>

            {isOpen && (
                <div className="chatbot-window">
                    <div className="chatbot-header">
                        <h3>Career Advisor</h3>
                        <button onClick={() => setIsOpen(false)} className="close-btn" aria-label="Close Chatbot">&times;</button>
                    </div>
                    <div className="chatbot-messages">
                        {messages.map((msg, index) => (
                            <div key={index} className={`message-bubble ${msg.role}`}>
                                {msg.text}
                            </div>
                        ))}
                        {isLoading && <div className="message-bubble model">...</div>}
                        <div ref={messagesEndRef} />
                    </div>
                    <form className="chatbot-input-form" onSubmit={handleSendMessage}>
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder="Ask me anything..."
                            disabled={isLoading}
                        />
                        <button type="submit" disabled={isLoading || !inputValue.trim()}>Send</button>
                    </form>
                </div>
            )}
        </>
    );
};

// 2. Login Page
const LoginPage = ({ onLogin, onPublicLogin, theme, onToggleTheme }: { onLogin: (email: string, pass: string) => boolean, onPublicLogin: (profile: { name: string; email: string; role?: string; photo?: string; location?: string }, pass: string) => Promise<boolean>, theme?: 'light' | 'dark', onToggleTheme?: () => void }) => {
        // Password visibility toggles
        const [adminPasswordVisible, setAdminPasswordVisible] = useState(false);
        const [guestPasswordVisible, setGuestPasswordVisible] = useState(false);
    const [mode, setMode] = useState<'admin' | 'public'>('public');
    const [adminEmail, setAdminEmail] = useState('');
    const [adminPassword, setAdminPassword] = useState('');
    const [guestName, setGuestName] = useState('');
    const [guestEmail, setGuestEmail] = useState('');
    const [guestPassword, setGuestPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [colorTheme, setColorTheme] = useState(() => localStorage.getItem('colorTheme') || 'purple');
    const [customColor, setCustomColor] = useState(() => localStorage.getItem('customColor') || '#5b21b6');

    const allowedGuests = ALLOWED_GUESTS;

    useEffect(() => {
        document.body.classList.remove('theme-purple', 'theme-blue', 'theme-green', 'theme-red', 'theme-orange');
        document.body.classList.add(`theme-${colorTheme}`);
        localStorage.setItem('colorTheme', colorTheme);
        if (colorTheme === 'custom') {
            // Set all relevant CSS variables for custom color
            document.documentElement.style.setProperty('--primary-color', customColor);
            document.documentElement.style.setProperty('--primary-2', customColor);
            document.documentElement.style.setProperty('--primary-gradient', `linear-gradient(135deg, ${customColor} 0%, ${customColor} 100%)`);
            document.documentElement.style.setProperty('--background-color', '#f8fafc');
            document.documentElement.style.setProperty('--background-accent', 'none');
            document.documentElement.style.setProperty('--content-background', '#ffffff');
            document.documentElement.style.setProperty('--glass-bg', 'rgba(255,255,255,0.65)');
            document.documentElement.style.setProperty('--text-color', '#1e293b');
            document.documentElement.style.setProperty('--subtle-text-color', '#64748b');
            document.documentElement.style.setProperty('--border-color', '#e2e8f0');
            localStorage.setItem('customColor', customColor);
        } else {
            // Reset to theme color (remove custom overrides)
            document.documentElement.style.removeProperty('--primary-color');
            document.documentElement.style.removeProperty('--primary-2');
            document.documentElement.style.removeProperty('--primary-gradient');
            document.documentElement.style.removeProperty('--background-color');
            document.documentElement.style.removeProperty('--background-accent');
            document.documentElement.style.removeProperty('--content-background');
            document.documentElement.style.removeProperty('--glass-bg');
            document.documentElement.style.removeProperty('--text-color');
            document.documentElement.style.removeProperty('--subtle-text-color');
            document.documentElement.style.removeProperty('--border-color');
        }
    }, [colorTheme, customColor]);

    const handleColorThemeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setColorTheme(e.target.value);
    };

    const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCustomColor(e.target.value);
        setColorTheme('custom');
    };

    const handleSetDefaultTheme = (e: React.MouseEvent) => {
        e.preventDefault();
        localStorage.setItem('colorTheme', colorTheme);
        if (colorTheme === 'custom') {
            localStorage.setItem('customColor', customColor);
        }
    };

    const handleAdminSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        // Custom admin login logic for new admin123@gmail.com
        if (adminEmail === 'admin123@gmail.com' && adminPassword === 'legends_reborn') {
            // Store user info in localStorage or state as needed
            const profile = {
                name: 'Admin 123',
                email: 'admin123@gmail.com',
                role: 'Admin',
                photo: '/photos/chandan%20behera.png',
                location: 'India'
            };
            localStorage.setItem('currentUser', JSON.stringify(profile));
            window.location.reload();
            return;
        }
        const success = onLogin(adminEmail, adminPassword);
        if (!success) setError('Invalid email or password.');
    };

    const handlePublicSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!guestName.trim() || !guestEmail.trim() || !guestPassword.trim()) {
            setError('Please provide name, email and password.');
            return;
        }

        // Validate specific users
        const inputName = guestName.trim();
        const foundUser = allowedGuests.find(u => u.name.toLowerCase() === inputName.toLowerCase());
        
        if (!foundUser) {
            setError('User not authorized.');
            return;
        }

        // Password policy: FirstName + &123 (e.g. Mohi&123)
        const expectedPass = `${foundUser.first}&123`;
        if (guestPassword !== expectedPass) {
            setError('Invalid password.');
            return;
        }

        setLoading(true);
        try {
            const profile = { name: foundUser.name, email: guestEmail.trim(), role: (foundUser as any).role, photo: (foundUser as any).photo, location: (foundUser as any).location };
            const ok = await onPublicLogin(profile, guestPassword);
            if (!ok) setError('Login failed.');
        } catch (err) {
            setError('Public login failed. Check server connection.');
        } finally { setLoading(false); }
    };

    return (
        <div className="login-page-container">
            <div className="login-box">
                <div style={{position: 'absolute', right: 18, top: 18, display: 'flex', gap: '0.5rem', alignItems: 'center'}}>
                    <select value={colorTheme} onChange={handleColorThemeChange} style={{borderRadius: 6, padding: '0.2rem 0.5rem', fontWeight: 500}} aria-label="Select color theme">
                        <option value="purple">Purple</option>
                        <option value="blue">Blue</option>
                        <option value="green">Green</option>
                        <option value="red">Red</option>
                        <option value="orange">Orange</option>
                        <option value="custom">Custom…</option>
                    </select>
                    {colorTheme === 'custom' && (
                        <input
                            type="color"
                            value={customColor}
                            onChange={handleCustomColorChange}
                            style={{ width: 36, height: 36, border: 'none', background: 'none', cursor: 'pointer', marginLeft: 4 }}
                            aria-label="Pick a custom color"
                        />
                    )}
                    <button onClick={handleSetDefaultTheme} style={{fontSize: '0.9em', borderRadius: 6, padding: '0.2rem 0.7rem', background: 'var(--primary-color)', color: 'white', border: 'none'}}>Set Default</button>
                    <button className="theme-toggle-btn" onClick={onToggleTheme} aria-label="Toggle theme">{theme === 'dark' ? '🌙' : '☀️'}</button>
                </div>
                <div className="login-branding">
                    <img src={"/converted_image.png"} alt="Career Booster" className="login-logo" draggable={false} onDragStart={preventImageDrag} />
                    <h1 className="site-title" style={{color: 'white', marginTop: '1rem', textShadow: '0 2px 8px #0002'}}>Career Booster</h1>
                    <p style={{color: '#e0e0e0', fontWeight: 500, textShadow: '0 1px 4px #0001'}}>Unlock your potential. Manage and explore academic profiles with ease.</p>
                </div>
                <div className="login-form-area">
                    <div className="mode-toggle">
                        <div className="login-toggle">
                                <button type="button" className={`toggle-option ${mode === 'public' ? 'active' : ''}`} onClick={() => setMode('public')}>Guest</button>
                                <button type="button" className={`toggle-option ${mode === 'admin' ? 'active' : ''}`} onClick={() => setMode('admin')}>Admin</button>
                            </div>
                    </div>

                    {mode === 'admin' ? (
                        <form className="login-form" onSubmit={handleAdminSubmit}>
                            <h2>Admin Login</h2>
                            <div className="input-group">
                                <label htmlFor="admin-email">Email</label>
                                <div className="input-wrapper">
                                    <input
                                        id="admin-email"
                                        type="text"
                                        value={adminEmail}
                                        onChange={(e) => setAdminEmail(e.target.value)}
                                        required
                                        placeholder="123"
                                    />
                                </div>
                            </div>
                            <div className="input-group" style={{ position: 'relative' }}>
                                <label htmlFor="admin-password">Password</label>
                                <div className="input-wrapper">
                                    <input
                                        id="admin-password"
                                        type={adminPasswordVisible ? 'text' : 'password'}
                                        value={adminPassword}
                                        onChange={(e) => setAdminPassword(e.target.value)}
                                        required
                                        placeholder="123"
                                    />
                                    <button
                                        type="button"
                                        aria-label={adminPasswordVisible ? 'Hide password' : 'Show password'}
                                        onClick={() => setAdminPasswordVisible(v => !v)}
                                        style={{
                                            position: 'absolute',
                                            right: 8,
                                            top: 8,
                                            background: 'none',
                                            border: 'none',
                                            cursor: 'pointer',
                                            padding: 0
                                        }}
                                    >
                                        {adminPasswordVisible ? (
                                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-5.05 0-9.14-3.38-10.94-8a10.94 10.94 0 0 1 2.06-3.34"/><path d="M1 1l22 22"/><path d="M9.53 9.53A3.5 3.5 0 0 0 12 15.5c1.93 0 3.5-1.57 3.5-3.5a3.5 3.5 0 0 0-3.5-3.5c-.47 0-.92.09-1.34.26"/></svg>
                                        ) : (
                                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3.5"/><path d="M2 12s4.5-7 10-7 10 7 10 7-4.5 7-10 7-10-7-10-7z"/></svg>
                                        )}
                                    </button>
                                </div>
                            </div>
                            {error && <p className="login-error" style={{color: 'red'}}>{error}</p>}
                            <button type="submit" className="login-btn">Login</button>
                        </form>
                    ) : (
                        <form className="login-form" onSubmit={handlePublicSubmit}>
                            <h2>Guest Login</h2>
                            <div className="input-group">
                                <label>Name</label>
                                <div className="input-wrapper">
                                    <input type="text" value={guestName} onChange={(e) => setGuestName(e.target.value)} placeholder="Full Name " />
                                </div>
                            </div>
                            <div className="input-group">
                                <label>Email</label>
                                <div className="input-wrapper">
                                    <input type="email" value={guestEmail} onChange={(e) => setGuestEmail(e.target.value)} placeholder="email.com" />
                                </div>
                            </div>
                            <div className="input-group" style={{ position: 'relative' }}>
                                <label>Password</label>
                                <div className="input-wrapper">
                                    <input
                                        type={guestPasswordVisible ? 'text' : 'password'}
                                        value={guestPassword}
                                        onChange={(e) => setGuestPassword(e.target.value)}
                                        placeholder="admin password "
                                    />
                                    <button
                                        type="button"
                                        aria-label={guestPasswordVisible ? 'Hide password' : 'Show password'}
                                        onClick={() => setGuestPasswordVisible(v => !v)}
                                        style={{
                                            position: 'absolute',
                                            right: 8,
                                            top: 8,
                                            background: 'none',
                                            border: 'none',
                                            cursor: 'pointer',
                                            padding: 0
                                        }}
                                    >
                                        {guestPasswordVisible ? (
                                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-5.05 0-9.14-3.38-10.94-8a10.94 10.94 0 0 1 2.06-3.34"/><path d="M1 1l22 22"/><path d="M9.53 9.53A3.5 3.5 0 0 0 12 15.5c1.93 0 3.5-1.57 3.5-3.5a3.5 3.5 0 0 0-3.5-3.5c-.47 0-.92.09-1.34.26"/></svg>
                                        ) : (
                                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3.5"/><path d="M2 12s4.5-7 10-7 10 7 10 7-4.5 7-10 7-10-7-10-7z"/></svg>
                                        )}
                                    </button>
                                </div>
                            </div>
                            {error && <p className="login-error" style={{color: 'red'}}>{error}</p>}
                            <button type="submit" className="login-btn" disabled={loading}>{loading ? 'Signing in...' : 'Continue'}</button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

// 3. Status Indicator
const ApiStatusIndicator = ({ status }: { status: 'connecting' | 'connected' | 'offline' }) => {
    return (
        <div className={`api-status`} style={{fontSize:'0.8rem', padding:'4px 8px', borderRadius:'12px', background:'#eee'}}>
            {status}
        </div>
    );
};

// 4. Header
    const SiteHeader = ({ onMenuClick, onBack, showBack, apiStatus, onLogout, userRole, onAvatarClick, isPersonalPanelOpen, theme, onToggleTheme, currentUser, onHomeClick, onOpenAdminPanel }: any) => {
    const avatarSrc = currentUser && currentUser.photo ? currentUser.photo : '/photos/team.png';
    return (
    <header className="site-header">
        {/* Left: small profile avatar moved to left as requested */}
        <button className="header-avatar" onClick={onAvatarClick} aria-label="Open profile" style={{left:'20px'}}>
            <img src={avatarSrc} alt="Profile" draggable={false} onDragStart={preventImageDrag} />
        </button>

        {/* Center: Branding (logo badge + title) */}
        <div className="center-branding" role="banner" onClick={onHomeClick} style={{cursor: 'pointer'}}>
                <span className="logo-badge" aria-hidden>
                <img src={"/converted_image.png"} alt="" className="logo-img" draggable={false} onDragStart={preventImageDrag} />
            </span>
            <h1 className="site-title">Career Booster</h1>
        </div>

        {/* Right: controls */}
        <div className="header-controls">
            <ApiStatusIndicator status={apiStatus} />
            {/* Admin visitor notifier - caller should pass userRole and visitors via props if needed */}
            {userRole === 'admin' && (typeof (window as any).__visitors_count__ !== 'undefined') && (
                <button className="visitors-btn" title="View visitors" onClick={() => { const ev = new CustomEvent('toggleVisitorsPanel'); window.dispatchEvent(ev); }}>
                    👥 { (window as any).__visitors_count__ || 0 }
                </button>
            )}
            {userRole === 'admin' && (
                <button className="menu-btn" onClick={onOpenAdminPanel} title="Open admin panel">Admin Panel</button>
            )}
            <button className="theme-toggle-btn" onClick={onToggleTheme}>{theme === 'dark' ? '🌙' : '☀️'}</button>
            <button className="logout-btn" onClick={onLogout}>Logout</button>
            <button className="menu-btn" onClick={onMenuClick}>Menu</button>
        </div>
    </header>
    );
};

// 5. Side Panel
const SidePanel = ({ isOpen, onClose, departments, onNavigate, onRemoveDepartment, userRole }: any) => (
    <>
        <div className={`side-panel ${isOpen ? 'is-open' : ''}`}>
            <div className="side-panel-header">
                <h2>Navigation</h2>
                <button className="close-btn" onClick={onClose}>&times;</button>
            </div>
            <div className="departments-list">
                <a href="#" className="department-name" onClick={(e) => { e.preventDefault(); onNavigate({ view: 'professor_directory' }); }}>Professor Directory</a>
                <div style={{margin:'1rem 0', fontWeight:'bold', fontSize:'0.8rem', color:'#888'}}>DEPARTMENTS</div>
                                 {departments
                                   .filter((dept: any) => !['Civil Engineering', 'Chemical Engineering'].includes(dept.name))
                                   .map((dept: any) => (
                                    <div key={dept.id} style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                                        <a href="#" className="department-name" onClick={(e) => { e.preventDefault(); onNavigate({ view: 'department', id: dept.id }); }}>{dept.name}</a>
                                        {userRole === 'admin' && <button className="close-btn" style={{padding:'2px 6px', fontSize:'0.7rem'}} onClick={() => onRemoveDepartment(dept.id)}>x</button>}
                                    </div>
                                 ))}
            </div>
        </div>
        {isOpen && <div className="side-panel-overlay" onClick={onClose}></div>}
    </>
);

// Visitors modal for admin to view tracked guest users
const VisitorsModal = ({ visitors, onClose }: { visitors: { id?: string; name?: string; email?: string }[]; onClose: () => void }) => (
    <>
        <div className="visitors-modal" style={{position:'fixed', right:20, top:80, width:320, maxHeight:'60vh', overflowY:'auto', background:'white', boxShadow:'0 6px 24px rgba(0,0,0,0.15)', zIndex:7000, padding:'1rem', borderRadius:8}}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8}}>
                <h3 style={{margin:0}}>Guest Visitors</h3>
                <button className="close-btn" onClick={onClose}>&times;</button>
            </div>
            {visitors && visitors.length > 0 ? (
                <div style={{display:'flex', flexDirection:'column', gap:8}}>
                    {visitors.map(v => (
                        <div key={v.id || v.email} style={{display:'flex', alignItems:'center', gap:8, padding:'6px 8px', borderRadius:6, background:'#fafafa'}}>
                            <div style={{width:36, height:36, borderRadius:18, background:'#eaeaea', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700}}>{(v.name || '?').split(' ').map(s=>s[0]).slice(0,2).join('').toUpperCase()}</div>
                            <div style={{flex:1}}>
                                <div style={{fontWeight:600}}>{v.name}</div>
                                <div style={{fontSize:'0.9rem', color:'#666'}}>{v.email}</div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div style={{color:'#666'}}>No visitors recorded yet.</div>
            )}
        </div>
        <div className="side-panel-overlay" onClick={onClose} style={{zIndex:6999}} />
    </>
);

const AdminDashboardModal = ({
    onClose,
    visitors,
    onVisitorsRefresh,
    onVisitorsUpdate
}: {
    onClose: () => void;
    visitors: { id?: string; name?: string; email?: string; created_at?: string; role?: string; location?: string }[];
    onVisitorsRefresh: () => Promise<void>;
    onVisitorsUpdate: (next: { id?: string; name?: string; email?: string; created_at?: string; role?: string; location?: string }[]) => void;
}) => {
    const [section, setSection] = useState<'activity' | 'users' | 'tokens' | 'database'>('activity');
    const [logs, setLogs] = useState<LogEntry[]>(() => apiLogger.getLogs());
    const [targetTokens, setTargetTokens] = useState<TargetSelectionToken[]>(() => loadTargetSelectionTokens());
    const [userMeta, setUserMeta] = useState<Record<string, { role?: string; location?: string; hidden?: boolean }>>(() => {
        try {
            const raw = localStorage.getItem('admin_user_meta');
            return raw ? JSON.parse(raw) : {};
        } catch {
            return {};
        }
    });
    const [dbTables, setDbTables] = useState<string[]>([]);
    const [selectedTable, setSelectedTable] = useState<string>('');
    const [tableRows, setTableRows] = useState<any[]>([]);
    const [dbLoading, setDbLoading] = useState(false);
    const [tableLoading, setTableLoading] = useState(false);
    const [dbError, setDbError] = useState('');
    const toast = useToast();

    useEffect(() => {
        const unsub = apiLogger.subscribe((nextLogs) => setLogs([...nextLogs]));
        return () => { try { unsub(); } catch (e) {} };
    }, []);

    useEffect(() => {
        const onTokenCreated = (ev: Event) => {
            const customEv = ev as CustomEvent<TargetSelectionToken>;
            const incoming = customEv.detail;
            if (!incoming || !incoming.token) return;
            setTargetTokens((prev) => {
                if (prev.some((item) => item.token === incoming.token)) return prev;
                return [incoming, ...prev];
            });
        };

        window.addEventListener('targetSelectionTokenCreated', onTokenCreated as EventListener);
        return () => window.removeEventListener('targetSelectionTokenCreated', onTokenCreated as EventListener);
    }, []);

    useEffect(() => {
        try { localStorage.setItem('admin_user_meta', JSON.stringify(userMeta)); } catch (e) {}
    }, [userMeta]);

    const allUsers = useMemo(() => {
        const byEmail = new Map<string, { name: string; email: string; role?: string; location?: string; source: string[] }>();

        ALLOWED_GUESTS.forEach((g) => {
            const key = (g.name || '').toLowerCase();
            const existing = byEmail.get(key);
            if (existing) {
                existing.source.push('allowlist');
            } else {
                byEmail.set(key, {
                    name: g.name,
                    email: '',
                    role: g.role,
                    location: g.location,
                    source: ['allowlist']
                });
            }
        });

        visitors.forEach((v) => {
            const key = (v.email || v.name || '').toLowerCase();
            if (!key) return;
            const existing = byEmail.get(key);
            if (existing) {
                existing.email = existing.email || (v.email || '');
                existing.name = existing.name || (v.name || '');
                existing.source.push('activity');
            } else {
                byEmail.set(key, {
                    name: v.name || 'Unknown User',
                    email: v.email || '',
                    role: v.role,
                    location: v.location,
                    source: ['activity']
                });
            }
        });

        return Array.from(byEmail.values())
            .map((u) => {
                const key = (u.email || u.name).toLowerCase();
                const meta = userMeta[key] || {};
                return {
                    ...u,
                    role: meta.role ?? u.role ?? 'Student',
                    location: meta.location ?? u.location ?? 'Unknown',
                    hidden: !!meta.hidden,
                    key
                };
            })
            .filter((u) => !u.hidden)
            .sort((a, b) => a.name.localeCompare(b.name));
    }, [visitors, userMeta]);

    // Use supabase client from supabaseClient.ts

    const discoverSupabaseTables = useCallback(async () => {
        setDbLoading(true);
        setDbError('');
        try {
            if (!supabase) {
                setDbError('Supabase is not configured.');
                setDbTables([]);
                return;
            }
            // Use supabase client to list tables (via information_schema)
            const { data, error } = await (supabase as any)
                .from('information_schema.tables')
                .select('table_name')
                .eq('table_schema', 'public');
            if (error) throw error;
            const tables = (data || []).map((row: any) => row.table_name).filter(Boolean);
            setDbTables(tables.length ? tables : ['guest_logins']);
            setSelectedTable((prev) => (prev && tables.includes(prev) ? prev : tables[0]));
        } catch (err: any) {
            setDbError(err?.message || 'Failed to discover Supabase tables.');
            setDbTables([]);
        } finally {
            setDbLoading(false);
        }
    }, []);

    const loadSelectedTable = useCallback(async () => {
        if (!selectedTable || !supabase) return;
        setTableLoading(true);
        setDbError('');
        try {
            const { data: rows, error } = await (supabase as any).from(selectedTable).select('*').limit(100);
            if (error) throw error;
            setTableRows(Array.isArray(rows) ? rows : []);
        } catch (err: any) {
            setTableRows([]);
            setDbError(err?.message || `Failed to load table: ${selectedTable}`);
        } finally {
            setTableLoading(false);
        }
    }, [selectedTable]);

    useEffect(() => {
        if (section === 'database') discoverSupabaseTables();
    }, [section, discoverSupabaseTables]);

    useEffect(() => {
        if (section === 'database' && selectedTable) loadSelectedTable();
    }, [section, selectedTable, loadSelectedTable]);

    const activityEvents = useMemo(() => {
        const visitorEvents = visitors.map((v) => ({
            type: 'visitor',
            label: `Guest login: ${v.name || 'Unknown'} (${v.email || 'no-email'})`,
            time: v.created_at ? new Date(v.created_at) : null
        }));
        const apiEvents = logs.map((l) => ({
            type: 'api',
            label: `${l.status} ${l.requestInfo} (${l.responseCode})`,
            time: l.timestamp ? new Date(l.timestamp) : null
        }));
        return [...visitorEvents, ...apiEvents]
            .sort((a, b) => (b.time?.getTime() || 0) - (a.time?.getTime() || 0))
            .slice(0, 120);
    }, [logs, visitors]);

    const tableColumns = useMemo(() => {
        if (!tableRows.length) return [] as string[];
        return Object.keys(tableRows[0]);
    }, [tableRows]);

    const sortedTargetTokens = useMemo(() => {
        return [...targetTokens].sort((a, b) => Date.parse(b.createdAt || '') - Date.parse(a.createdAt || ''));
    }, [targetTokens]);

    const refreshTargetTokens = useCallback(() => {
        setTargetTokens(loadTargetSelectionTokens());
    }, []);

    return (
        <>
            <div className="modal-overlay is-visible" role="dialog" aria-modal="true" aria-label="Admin Dashboard">
                <div style={{
                    background: '#fff',
                    borderRadius: '18px',
                    boxShadow: '0 8px 40px rgba(15,23,42,0.18)',
                    maxWidth: 900,
                    margin: '40px auto',
                    padding: '2.5rem 2.5rem 2rem 2.5rem',
                    width: '100%',
                    minHeight: 500,
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'stretch',
                    zIndex: 1002
                }}>
                    <div className="modal-header admin-dashboard-header">
                        <div>
                            <h2 className="modal-title">Admin Panel</h2>
                            <p className="admin-dashboard-subtitle">Monitor activity, manage users, and explore Supabase tables.</p>
                        </div>
                        <button className="close-btn" onClick={onClose} aria-label="Close admin panel">×</button>
                    </div>

                    <div className="admin-dashboard-nav">
                        <button className={`admin-nav-btn ${section === 'activity' ? 'active' : ''}`} onClick={() => setSection('activity')}>Activity</button>
                        <button className={`admin-nav-btn ${section === 'users' ? 'active' : ''}`} onClick={() => setSection('users')}>Users</button>
                        <button className={`admin-nav-btn ${section === 'tokens' ? 'active' : ''}`} onClick={() => setSection('tokens')}>Target Tokens</button>
                        <button className={`admin-nav-btn ${section === 'database' ? 'active' : ''}`} onClick={() => setSection('database')}>Supabase Explorer</button>
                    </div>

                    <div className="admin-dashboard-body">
                        {section === 'activity' && (
                            <div className="admin-section-card">
                                <div className="admin-section-title-row">
                                    <h3>User Activity Monitoring</h3>
                                    <button className="modal-btn secondary" onClick={onVisitorsRefresh}>Refresh Activity</button>
                                </div>
                                <div className="admin-metrics-row">
                                    <div className="admin-metric"><strong>{visitors.length}</strong><span>Tracked Visitors</span></div>
                                    <div className="admin-metric"><strong>{logs.length}</strong><span>API Log Entries</span></div>
                                    <div className="admin-metric"><strong>{activityEvents.length}</strong><span>Timeline Events</span></div>
                                </div>
                                <div className="admin-activity-list">
                                    {activityEvents.length === 0 ? (
                                        <div className="admin-empty">No activity recorded yet.</div>
                                    ) : (
                                        activityEvents.map((ev, i) => (
                                            <div key={`${ev.type}-${i}`} className="admin-activity-item">
                                                <span className={`admin-activity-pill ${ev.type}`}>{ev.type}</span>
                                                <div>
                                                    <div>{ev.label}</div>
                                                    <small>{ev.time ? ev.time.toLocaleString() : 'Time not available'}</small>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}

                        {section === 'users' && (
                            <div className="admin-section-card">
                                <div className="admin-section-title-row">
                                    <h3>User Management</h3>
                                    <button className="modal-btn secondary" onClick={onVisitorsRefresh}>Reload Users</button>
                                </div>
                                <div className="admin-user-table-wrap">
                                    <table className="admin-user-table">
                                        <thead>
                                            <tr>
                                                <th>Name</th>
                                                <th>Email</th>
                                                <th>Role</th>
                                                <th>Location</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {allUsers.map((u) => (
                                                <tr key={u.key}>
                                                    <td>{u.name}</td>
                                                    <td>{u.email || 'Not provided'}</td>
                                                    <td>
                                                        <input
                                                            value={u.role || ''}
                                                            onChange={(e) => setUserMeta((prev) => ({ ...prev, [u.key]: { ...(prev[u.key] || {}), role: e.target.value } }))}
                                                        />
                                                    </td>
                                                    <td>
                                                        <input
                                                            value={u.location || ''}
                                                            onChange={(e) => setUserMeta((prev) => ({ ...prev, [u.key]: { ...(prev[u.key] || {}), location: e.target.value } }))}
                                                        />
                                                    </td>
                                                    <td>
                                                        <button
                                                            className="table-action-btn"
                                                            onClick={() => {
                                                                setUserMeta((prev) => ({ ...prev, [u.key]: { ...(prev[u.key] || {}), hidden: true } }));
                                                                const nextVisitors = visitors.filter((v) => (v.email || v.name || '').toLowerCase() !== u.key);
                                                                onVisitorsUpdate(nextVisitors);
                                                                toast(`User hidden from dashboard: ${u.name}`);
                                                            }}
                                                        >
                                                            Delete
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    {allUsers.length === 0 && <div className="admin-empty">No users available for management.</div>}
                                </div>
                            </div>
                        )}

                        {section === 'tokens' && (
                            <div className="admin-section-card">
                                <div className="admin-section-title-row">
                                    <h3>Target Selection Tokens</h3>
                                    <button className="modal-btn secondary" onClick={refreshTargetTokens}>Refresh Tokens</button>
                                </div>
                                <div className="admin-metrics-row">
                                    <div className="admin-metric"><strong>{sortedTargetTokens.length}</strong><span>Total Tokens</span></div>
                                    <div className="admin-metric"><strong>{sortedTargetTokens.filter((t) => Date.now() - Date.parse(t.createdAt || '') <= 86400000).length}</strong><span>Last 24h</span></div>
                                    <div className="admin-metric"><strong>{new Set(sortedTargetTokens.map((t) => t.userEmail || t.userName)).size}</strong><span>Unique Students</span></div>
                                </div>
                                <div className="admin-user-table-wrap">
                                    {sortedTargetTokens.length === 0 ? (
                                        <div className="admin-empty">No target tokens generated yet.</div>
                                    ) : (
                                        <table className="admin-user-table">
                                            <thead>
                                                <tr>
                                                    <th>Token</th>
                                                    <th>Student</th>
                                                    <th>Professor</th>
                                                    <th>Branch</th>
                                                    <th>Created At</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {sortedTargetTokens.map((t) => (
                                                    <tr key={t.token}>
                                                        <td>{t.token}</td>
                                                        <td>{t.userName}</td>
                                                        <td>{t.professorName}</td>
                                                        <td>{t.branchName}</td>
                                                        <td>{t.createdAt ? new Date(t.createdAt).toLocaleString() : 'Unknown'}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    )}
                                </div>
                            </div>
                        )}

                        {section === 'database' && (
                            <div className="admin-section-card">
                                <div className="admin-section-title-row">
                                    <h3>Supabase Database Explorer</h3>
                                    <div style={{display:'flex', gap:'0.5rem'}}>
                                        <button className="modal-btn secondary" onClick={discoverSupabaseTables} disabled={dbLoading}>Refresh Tables</button>
                                        <button className="modal-btn secondary" onClick={loadSelectedTable} disabled={tableLoading || !selectedTable}>Reload Data</button>
                                    </div>
                                </div>

                                {dbError && <div className="admin-error">{dbError}</div>}

                                <div className="db-explorer-layout">
                                    <aside className="db-table-list">
                                        {dbLoading ? <div className="admin-empty">Loading tables...</div> : dbTables.map((tbl) => (
                                            <button
                                                key={tbl}
                                                className={`db-table-btn ${selectedTable === tbl ? 'active' : ''}`}
                                                onClick={() => setSelectedTable(tbl)}
                                            >
                                                {tbl}
                                            </button>
                                        ))}
                                        {!dbLoading && dbTables.length === 0 && <div className="admin-empty">No tables discovered.</div>}
                                    </aside>

                                    <section className="db-table-data">
                                        <div className="db-table-data-head">
                                            <strong>{selectedTable || 'Select a table'}</strong>
                                            <span>{tableRows.length} rows</span>
                                        </div>
                                        {tableLoading ? (
                                            <div className="admin-empty">Loading table data...</div>
                                        ) : tableRows.length === 0 ? (
                                            <div className="admin-empty">No data in this table.</div>
                                        ) : (
                                            <div className="db-grid-wrap">
                                                <table className="db-grid-table">
                                                    <thead>
                                                        <tr>
                                                            {tableColumns.map((c) => <th key={c}>{c}</th>)}
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {tableRows.map((row, idx) => (
                                                            <tr key={idx}>
                                                                {tableColumns.map((c) => (
                                                                    <td key={c}>{typeof row[c] === 'object' ? JSON.stringify(row[c]) : String(row[c] ?? '')}</td>
                                                                ))}
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}
                                    </section>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

// --- PUBLIC JOB SEARCH COMPONENT ---
type PublicMode = 'preview' | 'announcements' | 'news';
const PublicJobSearch = ({ mode = 'preview', previewCount = 2, pageSize = 10, queryTarget, userRole }: { mode?: PublicMode, previewCount?: number, pageSize?: number, queryTarget?: 'announcements' | 'news', userRole?: 'admin' | 'public' | null }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<JobItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [startIndex, setStartIndex] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    // Choose section key: use NEWS for mode/news, ANNOUNCEMENTS otherwise (preview uses queryTarget to decide)
    const sectionKey = (mode === 'news' || queryTarget === 'news') ? 'NEWS' : 'ANNOUNCEMENTS';
    const [apiKey, setApiKey] = useState(() => getSectionApiKey(sectionKey) || '');
    const [cx, setCx] = useState(() => getSectionCx(sectionKey) || '');
    const [showConfig, setShowConfig] = useState(false);

    const cache = useRef(new Map<string, JobItem[]>());

    const effectiveMode = mode === 'preview' && queryTarget ? queryTarget : mode;

    // If the effective mode is news, render a static set of authoritative news source links
    if (effectiveMode === 'news') {
        const newsSources = [
            { name: 'Reuters', url: 'https://www.reuters.com' },
            { name: 'Bloomberg', url: 'https://www.bloomberg.com' },
            { name: 'CNBC', url: 'https://www.cnbc.com' },
            { name: 'Wall Street Journal', url: 'https://www.wsj.com' },
            { name: 'Financial Times', url: 'https://www.ft.com' },
            { name: 'Business Insider', url: 'https://www.businessinsider.com' },
            { name: 'Forbes', url: 'https://www.forbes.com' },
            { name: 'MarketWatch', url: 'https://www.marketwatch.com' },
            { name: 'Economic Times', url: 'https://economictimes.indiatimes.com' },
            { name: 'Moneycontrol', url: 'https://www.moneycontrol.com' },
            { name: 'Mint', url: 'https://www.livemint.com' }
        ];

        const displayedSources = mode === 'preview' ? newsSources.slice(0, previewCount) : newsSources;

        return (
            <div className={`job-search-container public-search-news`}>
                <div className="cert-header-sticky">
                    <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1rem'}}>
                        <h2>Technology News</h2>
                        <div style={{display:'flex', gap:10, alignItems:'center'}}>
                            {/* No settings for static links */}
                        </div>
                    </div>
                </div>

                <div style={{padding:'0.5rem 0 1rem'}}>
                    <p style={{color:'#666'}}>Open trusted news sources for the selected companies. These links open the selected publisher site.</p>
                </div>

                <div className="job-results-list">
                    {displayedSources.map((s, idx) => (
                        <div key={s.url} className="job-card">
                            <div className="job-card-header">
                                <div>
                                    <h3 className="job-title"><a href={s.url} target="_blank" rel="noopener noreferrer" style={{textDecoration:'none', color:'inherit'}}>{s.name}</a></h3>
                                    <div className="job-meta"><span className="source-chip">{(new URL(s.url)).hostname.replace('www.','')}</span></div>
                                </div>
                            </div>
                            <p className="job-snippet">Open {s.name} to search for company-specific articles (use the site's search or search engine).</p>
                            <div className="job-footer">
                                <a href={s.url} target="_blank" rel="noopener noreferrer" className="view-job-btn">Open ↗</a>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // Helpers
    const saveConfig = () => {
        try { localStorage.setItem(`GOOGLE_SEARCH_KEY_${sectionKey}`, apiKey); localStorage.setItem(`GOOGLE_SEARCH_CX_${sectionKey}`, cx); } catch (e) {}
        setShowConfig(false);
    };

    const normalizeUrl = (raw: string) => {
        try {
            const u = new URL(raw);
            // Drop common tracking params
            const params = u.searchParams;
            ['utm_source','utm_medium','utm_campaign','utm_term','utm_content','fbclid','gclid'].forEach(p => params.delete(p));
            u.search = params.toString();
            u.hash = '';
            return u.toString();
        } catch { return raw; }
    };

    const extractDate = (item: any) => {
        try {
            const meta = item.pagemap?.metatags?.[0] || {};
            const d = meta['article:published_time'] || meta['og:updated_time'] || meta['og:published_time'] || meta['date'];
            if (d) return new Date(d).toISOString();
            if (item.snippet) {
                const match = item.snippet.match(/([A-Za-z]{3} \d{1,2}, \d{4})/);
                if (match) return new Date(match[1]).toISOString();
            }
        } catch { }
        return undefined;
    };

    const isJobPosting = (item: any) => {
        const text = ((item.title || '') + ' ' + (item.snippet || '')).toLowerCase();
        const keywords = ['hiring','job opening','we are hiring','careers','vacancy','apply','position','role'];
        return keywords.some(k => text.includes(k)) || Boolean(item.pagemap?.JobPosting);
    };

    const buildAnnouncementQueries = (userQuery = '') => {
        const suffix = userQuery ? ` ${userQuery}` : '';
        const primary = 'site:linkedin.com/posts ( Internship Group Global Early Talent Platform ) ( internship OR challenge OR hiring )';
        const fallback1 = 'site:linkedin.com/posts ("Internship Group" OR "Global Early Talent Platform" OR "early talent platform") ("internship" OR "challenge" OR "hiring")';
        const fallback2 = 'site:linkedin.com/posts ("internship" OR "challenge" OR "hiring" OR "early talent")';
        return [
            `${primary}${suffix}`.trim(),
            `${fallback1}${suffix}`.trim(),
            `${fallback2}${suffix}`.trim()
        ];
    };

    const buildQuery = (userQuery = '') => {
        const effectiveMode = mode === 'preview' && queryTarget ? queryTarget : mode;
        if (effectiveMode === 'news') {
            const terms = '("technology news" OR "tech updates" OR "latest IT news" OR "tech news")';
            return `${userQuery} ${terms}`.trim();
        }
        // announcements
        return buildAnnouncementQueries(userQuery)[0];
    };

    const fetchWithRetry = async (url: string, retries = 4) => {
        try {
            const res = await fetch(url);
            if (!res.ok) {
                if ((res.status === 429 || res.status >= 500) && retries > 0) {
                    const wait = Math.pow(2, 5 - retries) * 500;
                    await new Promise(r => setTimeout(r, wait));
                    return fetchWithRetry(url, retries - 1);
                }
                const errText = await res.text().catch(() => String(res.status));
                throw new Error(errText || `HTTP ${res.status}`);
            }
            return await res.json();
        } catch (err) {
            if (retries > 0) {
                const wait = Math.pow(2, 5 - retries) * 500;
                await new Promise(r => setTimeout(r, wait));
                return fetchWithRetry(url, retries - 1);
            }
            throw err;
        }
    };

    const performSearch = async (requestedStart = 1, append = false) => {
        setError('');
        // prefer state values, but fall back to localStorage for the section-specific keys
        const effectiveApiKey = apiKey || getSectionApiKey(sectionKey);
        const effectiveCx = cx || getSectionCx(sectionKey);
        if (!effectiveApiKey || !effectiveCx) { setShowConfig(true); return; }

        const userQuery = query.trim();
        const effectiveMode = mode === 'preview' && queryTarget ? queryTarget : mode;
        const queryVariants = effectiveMode === 'announcements' ? buildAnnouncementQueries(userQuery) : [buildQuery(userQuery)];
        const dateRestrictParam = effectiveMode === 'announcements' ? '&dateRestrict=w1' : '';
        const primaryQuery = queryVariants[0];
        const cacheKey = `${mode}::${primaryQuery}::${requestedStart}::${pageSize}`;
        if (cache.current.has(cacheKey)) {
            const cached = cache.current.get(cacheKey) || [];
            if (append) setResults(prev => [...prev, ...cached.filter(c => !prev.some(p => p.link === c.link))]);
            else setResults(cached.slice(0, mode === 'preview' ? previewCount : pageSize));
            setHasMore((cached || []).length >= pageSize);
            setStartIndex(requestedStart);
            return;
        }

        setLoading(true);
        try {
            let data: any = null;
            for (const q of queryVariants) {
                const url = `https://www.googleapis.com/customsearch/v1?key=${encodeURIComponent(effectiveApiKey)}&cx=${encodeURIComponent(effectiveCx)}&q=${encodeURIComponent(q)}&num=${pageSize}&start=${requestedStart}${dateRestrictParam}`;
                const attempt = await fetchWithRetry(url);
                if (attempt?.error) throw new Error(attempt.error.message || 'Search error');
                data = attempt;
                if ((attempt?.items || []).length > 0) break;
            }
            if (!data) throw new Error('Search failed');

            const items = data.items || [];
            const mapped: JobItem[] = items.map((it: any) => ({
                title: it.title,
                link: it.link,
                snippet: it.snippet,
                source: it.displayLink || (new URL(it.link)).hostname,
                publishedAt: extractDate(it),
                isJobPosting: isJobPosting(it)
            }));

            // Deduplicate by normalized URL
            const seen = new Set<string>();
            const unique: JobItem[] = [];
            for (const it of mapped) {
                const norm = normalizeUrl(it.link || it.source || '') || '';
                if (seen.has(norm)) continue;
                seen.add(norm);
                unique.push(it);
            }

            // Sort newest-first where possible
            unique.sort((a, b) => {
                const ta = a.publishedAt ? Date.parse(a.publishedAt) : 0;
                const tb = b.publishedAt ? Date.parse(b.publishedAt) : 0;
                return (tb - ta) || 0;
            });

            cache.current.set(cacheKey, unique);
            if (append) {
                setResults(prev => {
                    const newItems = unique.filter(n => !prev.some(p => p.link === n.link));
                    return [...prev, ...newItems];
                });
            } else {
                setResults(unique.slice(0, mode === 'preview' ? previewCount : pageSize));
            }
            // determine if more results may be available
            const total = data?.searchInformation?.totalResults ? parseInt(data.searchInformation.totalResults || '0', 10) : undefined;
            if (typeof total === 'number' && !isNaN(total)) {
                setHasMore((requestedStart - 1) + (unique.length) < total);
            } else {
                // fallback: if we got a full page, assume more may exist
                setHasMore(unique.length >= pageSize);
            }
            setStartIndex(requestedStart);
        } catch (err: any) {
            console.error('Search error', err);
            setError(err?.message || 'Search failed');
            setResults([]);
        } finally {
            setLoading(false);
        }
    };

    // Do NOT auto-run searches in preview mode to avoid activating API keys
    // unintentionally. Searches are performed only when the user explicitly
    // submits the form.

    const handleSubmit = (e?: React.FormEvent) => { if (e) e.preventDefault(); performSearch(1, false); };

    const handleLoadMore = () => {
        const next = startIndex + pageSize;
        performSearch(next, true);
    };

    // If this PublicJobSearch instance is for ANNOUNCEMENTS, auto-run and
    // schedule periodic refresh every 1.5 hours (5400000 ms) when keys are
    // available. This intentionally activates only the announcements section.
    useEffect(() => {
        if (sectionKey !== 'ANNOUNCEMENTS') return;
        const key = getSectionApiKey('ANNOUNCEMENTS');
        const cxVal = getSectionCx('ANNOUNCEMENTS');
        if (!key || !cxVal) return;

        // initial fetch
        performSearch(1, false).catch(() => {});

        const intervalMs = 1.5 * 60 * 60 * 1000; // 1.5 hours
        const iv = setInterval(() => {
            performSearch(1, false).catch(() => {});
        }, intervalMs);
        return () => clearInterval(iv);
    }, [sectionKey]);

    const displayed = results;

    return (
        <div className={`job-search-container public-search-${mode}`}>
            {/* Configuration area (shown if API missing or toggled) */}
            {showConfig && (
                <div className="api-config-section">
                    <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', gap:8}}>
                        <div style={{display:'flex', gap:8, flex:1}}>
                            <input placeholder="Google API Key" value={apiKey} onChange={e => setApiKey(e.target.value)} type="password" style={{flex:1}} />
                            <input placeholder="Search Engine ID (CX)" value={cx} onChange={e => setCx(e.target.value)} style={{width:300}} />
                        </div>
                        <div>
                            <button onClick={saveConfig} className="save-config-btn" style={{width:'auto', padding:'0.5rem 1rem'}}>Save</button>
                        </div>
                    </div>
                </div>
            )}
            {mode !== 'preview' && (
                <div className="cert-header-sticky">
                    <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1rem'}}>
                        <h2>{mode === 'news' ? 'Technology News' : 'Announcements'}</h2>
                        <div style={{display:'flex', gap:10, alignItems:'center'}}>
                            {userRole !== 'public' && (
                                <button onClick={() => setShowConfig(s => !s)} className="secondary-btn" style={{fontSize:'0.9rem'}}>⚙ Settings</button>
                            )}
                        </div>
                    </div>
                    <form onSubmit={handleSubmit} className="search-row" style={{marginTop: showConfig ? '0.5rem' : '0'}}>
                        <input className="search-input" placeholder={mode === 'news' ? 'Search tech topics (optional)...' : 'Filter announcements (optional)...'} value={query} onChange={e => setQuery(e.target.value)} />
                        <button type="submit" className="add-btn" disabled={loading}>{loading ? 'Searching...' : 'Search'}</button>
                    </form>
                </div>
            )}

            {error && <div style={{color:'red', padding:'1rem'}}>{error}</div>}

            <div className="job-results-list">
                {displayed.map((job, idx) => (
                    <div key={idx} className="job-card">
                        {job.isJobPosting && <div className="job-badge">JOB POST</div>}
                        <div className="job-card-header">
                            <div>
                                <h3 className="job-title"><a href={job.link} target="_blank" rel="noopener noreferrer" style={{textDecoration:'none', color:'inherit'}}>{job.title}</a></h3>
                                <div className="job-meta"><span className="source-chip">{job.source}</span>{job.publishedAt && <span>• {new Date(job.publishedAt).toLocaleString()}</span>}</div>
                            </div>
                        </div>
                        <p className="job-snippet">{job.snippet}</p>
                        <div className="job-footer">
                            <a href={job.link} target="_blank" rel="noopener noreferrer" className="view-job-btn">View / Apply ↗</a>
                        </div>
                    </div>
                ))}

                {displayed.length === 0 && !loading && (
                    <div style={{textAlign:'center', padding:'2rem', color:'#888'}}>
                        {mode === 'news' ? 'No news found. Try a different search term.' : 'No announcements found.'}
                    </div>
                )}
            </div>
            {/* Load More for modal modes */}
            {mode !== 'preview' && hasMore && (
                <div style={{display:'flex', justifyContent:'center', padding:'1rem 0'}}>
                    <button className="load-more-btn" onClick={handleLoadMore} disabled={loading}>
                        {loading ? 'Loading...' : 'Load More'}
                    </button>
                </div>
            )}
        </div>
    );
};

// Announcements Modal - opens a mini-page (modal) and shows top 10 latest announcements
const AnnouncementsModal = ({ onClose, userRole }: { onClose: () => void, userRole?: 'admin' | 'public' | null }) => {
    return (
        <div className="certificates-modal-overlay">
            <div className="certificates-modal-content">
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                    <h2>Job Announcements</h2>
                    <button className="close-btn" onClick={onClose} style={{fontSize:'1.5rem'}}>&times;</button>
                </div>
                <PublicJobSearch mode="announcements" pageSize={10} userRole={userRole} />
            </div>
        </div>
    );
};

// News Modal
const NewsModal = ({ onClose, userRole }: { onClose: () => void, userRole?: 'admin' | 'public' | null }) => {
    return (
        <div className="certificates-modal-overlay">
            <div className="certificates-modal-content">
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                    <h2>Technology News</h2>
                    <button className="close-btn" onClick={onClose} style={{fontSize:'1.5rem'}}>&times;</button>
                </div>
                <PublicJobSearch mode="news" pageSize={10} userRole={userRole} />
            </div>
        </div>
    );
};

// 6. Home Page
// CompanyNewsWidget: allows entering a company name and fetching official announcements/news
const CompanyNewsWidget = ({ defaultCompany }: { defaultCompany?: string }) => {
    const [company, setCompany] = useState(defaultCompany || '');
    const [results, setResults] = useState<Array<{ title: string; snippet?: string; link?: string; publishedAt?: string }>>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const getApiConfig = () => {
        // Allow configuration via a global variable for demo: window.__GOOGLE_CUSTOM_SEARCH = { apiKey, cx }
        // Fall back to REACT_APP_* globals, and finally to the requested hard-coded defaults.
        const globalAny = window as any;
        // Prefer per-section NEWS keys stored in localStorage, then global overrides
        const newsKey = getSectionApiKey('NEWS');
        const newsCx = getSectionCx('NEWS');
        return (
            globalAny.__GOOGLE_CUSTOM_SEARCH || {
                apiKey: (globalAny as any).REACT_APP_GOOGLE_CSE_API_KEY || newsKey,
                cx: (globalAny as any).REACT_APP_GOOGLE_CSE_CX || newsCx
            }
        );
    };

    const buildQuery = (companyName: string) => {
        // Keep query broad and Google-News-friendly to avoid zero-result strict filtering.
        const q = `"${companyName}" (announcement OR update OR hiring OR recruitment OR jobs OR partnership OR funding OR investment OR acquisition OR merger)`;
        return q;
    };

    const performSearch = async (companyName: string) => {
        setError(null);
        setLoading(true);
        setResults([]);
        const cfg = getApiConfig();
        if (!cfg || !cfg.apiKey || !cfg.cx) {
            setError('Google Custom Search API key and CX not configured. Set window.__GOOGLE_CUSTOM_SEARCH = { apiKey, cx }');
            setLoading(false);
            return;
        }

        const q = encodeURIComponent(buildQuery(companyName));
        const url = `https://www.googleapis.com/customsearch/v1?key=${encodeURIComponent(cfg.apiKey)}&cx=${encodeURIComponent(cfg.cx)}&q=${q}&num=10`;

        try {
            const res = await fetch(url);
            if (!res.ok) throw new Error(`Search API returned ${res.status}`);
            const data = await res.json();
            const items = (data.items || []).map((it: any) => ({ title: it.title, snippet: it.snippet, link: it.link, publishedAt: it.pagemap?.metatags?.[0]?.['article:published_time'] }));
            setResults(items);
        } catch (err: any) {
            console.error('CompanyNewsWidget error', err);
            setError(err.message || String(err));
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!company.trim()) return setError('Enter a company name');
        performSearch(company.trim());
    };

    return (
        <div style={{display:'flex', flexDirection:'column', gap:12}}>
            <form onSubmit={handleSubmit} style={{display:'flex', gap:8, alignItems:'center'}}>
                <input
                    aria-label="Company name"
                    placeholder="Enter company (e.g., Reliance, Google)"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    style={{flex:1, padding:'0.5rem', borderRadius:6, border:'1px solid #ddd'}}
                />
                <button type="submit" className="add-btn" disabled={loading}>{loading ? 'Searching...' : 'Search'}</button>
            </form>

            {error && <div style={{color:'red'}}>{error}</div>}

            <div style={{display:'flex', flexDirection:'column', gap:8}}>
                {results.length === 0 && !loading && <div style={{color:'#666'}}>No results yet. Try a company name above.</div>}
                {results.map((r, i) => (
                    <div key={i} className="mine-dashboard-card" style={{padding:'0.8rem'}}>
                        <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline'}}>
                            <a href={r.link} target="_blank" rel="noopener noreferrer"><h4 style={{margin:0}}>{r.title}</h4></a>
                            {r.publishedAt && <small style={{color:'#666'}}>{new Date(r.publishedAt).toLocaleString()}</small>}
                        </div>
                        {r.snippet && <p style={{margin:'0.5rem 0 0', color:'#444'}}>{r.snippet}</p>}
                    </div>
                ))}
            </div>
        </div>
    );
};

// HeadlinerSection: fetches news specific to a company (uses NEWS search key)
const HeadlinerSection = ({ company }: { company?: string }) => {
    // Instead of using any Google API, produce search links that open in a browser.
    // The user requested explicit search commands (no API key). We'll compose three search URLs
    // using the templates provided and show them as links. They open in a new tab.
    const makeSearchUrl = (companyName: string, body: string) => {
        const q = `"${companyName}" ${body}`;
        // Use Google News search (tbm=nws) to surface news results; still uses site: filters.
        return `https://www.google.com/search?q=${encodeURIComponent(q)}&tbm=nws`;
    };

    // Simpler commands work better in Google News than deeply nested site/OR logic.
    const hiringBody = '(hiring OR recruitment OR jobs OR "career opportunities" OR layoffs OR workforce)';
    const fundingBody = '(funding OR grant OR partnership OR collaboration OR acquisition OR merger OR investment)';
    const latestBody = '(announcement OR update OR latest OR reports OR launches OR expansion)';

    const links = company ? [
        { label: 'Hiring / Recruitment', url: makeSearchUrl(company, hiringBody) },
        { label: 'Funding / M&A', url: makeSearchUrl(company, fundingBody) },
        { label: 'Latest announcements', url: makeSearchUrl(company, latestBody) }
    ] : [];

    return (
        <div style={{padding:'1rem', borderRadius:8, boxShadow:'0 2px 12px rgba(0,0,0,0.06)', background:'white', minHeight:300}}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                <div>
                    <h3 style={{margin:0}}>Headliner</h3>
                    <p style={{margin:0, color:'#666', fontSize:'0.9rem'}}>Quick search links from reputable news sources (opens Google News search)</p>
                </div>
                <div style={{color:'#666', fontSize:'0.9rem'}}>{company || '—'}</div>
            </div>

            <div style={{marginTop:12}}>
                {!company && <div style={{color:'#666'}}>Select a company to see curated search links.</div>}
                {company && (
                    <div style={{display:'grid', gap:12}}>
                        {links.map((it, idx) => (
                            <div key={idx} style={{padding:12, borderRadius:8, border:'1px solid #f0f0f0', background:'#fff'}}>
                                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                                    <div style={{fontWeight:700}}>{it.label}</div>
                                    <a href={it.url} target="_blank" rel="noopener noreferrer" className="add-btn" style={{textDecoration:'none'}}>Open Search</a>
                                </div>
                                <div style={{fontSize:'0.85rem', color:'#666', marginTop:8}}>{decodeURIComponent(it.url).slice(0, 180)}</div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

// TCJPSection: targeted company junior/senior profiles search on GitHub and Perplexity Sonar integration
const TCJPSection = ({ company }: { company?: string }) => {
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(0); // page 0..n showing 5 items per page
    const perPage = 5;

    const fetchProfiles = async (startIndex = 1) => {
        if (!company) return;
        setLoading(true); setError(null);
        try {
            const key = getSectionApiKey('ALUMNI');
            const cx = getSectionCx('ALUMNI');
            if (!key || !cx) {
                setError('Alumni search key/CX not configured. Open Settings to configure.');
                setLoading(false);
                return;
            }
            // query targets profiles and senior roles at company on github
            const rolePhrases = '"principal engineer" OR "principal scientist" OR "chief architect" OR "senior staff engineer" OR "research scientist" OR "senior engineer"';
            const q = `site:github.com ${company} (${rolePhrases})`;
            const url = `https://www.googleapis.com/customsearch/v1?key=${encodeURIComponent(key)}&cx=${encodeURIComponent(cx)}&q=${encodeURIComponent(q)}&num=10&start=${startIndex}`;
            const res = await fetch(url);
            if (!res.ok) throw new Error('Search failed');
            const json = await res.json();
            const items = json.items || [];
            const parsed = items.map((it: any) => {
                // attempt to extract github handle from link
                let handle: string | null = null;
                try {
                    const m = it.link.match(/https?:\/\/github.com\/([^\/\?]+)/i);
                    if (m) handle = m[1];
                } catch (e) {}
                return {
                    title: it.title,
                    link: it.link,
                    snippet: it.snippet,
                    handle
                };
            });
            // For parsed items without handle, attempt a secondary search by name to find GitHub profile
            const needHandle = parsed.filter(p => !p.handle).slice(0, 5);
            if (needHandle.length) {
                // helper: try to find github handle for a given name via CSE
                const findGithubForName = async (name: string) => {
                    try {
                        const key2 = getSectionApiKey('ALUMNI');
                        const cx2 = getSectionCx('ALUMNI');
                        const q2 = `site:github.com "${name}"`;
                        const u2 = `https://www.googleapis.com/customsearch/v1?key=${encodeURIComponent(key2)}&cx=${encodeURIComponent(cx2)}&q=${encodeURIComponent(q2)}&num=5`;
                        const r2 = await fetch(u2);
                        if (!r2.ok) return null;
                        const j2 = await r2.json();
                        const its = j2.items || [];
                        for (const it of its) {
                            const m = (it.link || '').match(/https?:\/\/github.com\/([^\/\?]+)/i);
                            if (m) return m[1];
                        }
                    } catch (e) {}
                    return null;
                };

                await Promise.all(needHandle.map(async nh => {
                    // extract a probable person name from title/snippet
                    let nameGuess = nh.title || nh.snippet || '';
                    // clean common patterns
                    nameGuess = nameGuess.replace(/\|/g, ' ').replace(/·/g, ' ').replace(/GitHub/gi, '').replace(/repo/gi, '');
                    nameGuess = nameGuess.split('-')[0].split('(')[0].trim();
                    if (!nameGuess) return;
                    const h = await findGithubForName(nameGuess);
                    if (h) {
                        // update the matching parsed entry in results
                        parsed.forEach(p => { if (!p.handle && (p.title === nh.title || p.link === nh.link)) p.handle = h; });
                    }
                }));
            }
            // merge unique by link
            setResults(prev => {
                const combined = [...prev, ...parsed];
                const uniq: any[] = [];
                const seen = new Set<string>();
                combined.forEach((r:any) => { if (!seen.has(r.link)) { seen.add(r.link); uniq.push(r); } });
                return uniq;
            });
        } catch (e:any) { setError(e.message || 'Failed to fetch profiles'); }
        finally { setLoading(false); }
    };

    // Reset results/page when company changes, but DO NOT auto-run the search.
    // Searches will only run when the user explicitly clicks the Search button.
    useEffect(() => {
        setResults([]);
        setPage(0);
        setError(null);
        setLoading(false);
    }, [company]);

    const displayed = results.slice(page * perPage, (page + 1) * perPage);

    return (
        <div style={{padding:'1rem', borderRadius:8, boxShadow:'0 2px 12px rgba(0,0,0,0.06)', background:'white', minHeight:300}}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                <div>
                    <h3 style={{margin:0}}>TCJP</h3>
                    <p style={{margin:0, color:'#666', fontSize:'0.9rem'}}>Targeted company junior/senior profiles (GitHub)</p>
                </div>
                <div style={{display:'flex', gap:8}}>
                    <button className="secondary-btn" onClick={() => {
                        const query = `Senior engineers at ${company} site:github.com`;
                        const url = `https://www.perplexity.ai/search?q=${encodeURIComponent(query)}`;
                        window.open(url, '_blank');
                    }}>Perplexity Sonar</button>
                    <button className="add-btn" onClick={() => fetchProfiles(1)} disabled={!company || loading} title={!company ? 'Select a company first' : 'Search profiles'}>Search Profiles</button>
                </div>
            </div>

            <div style={{marginTop:12}}>
                {loading && <div style={{color:'#666'}}>Searching GitHub profiles…</div>}
                {error && <div style={{color:'red'}}>{error}</div>}
                {!loading && results.length === 0 && <div style={{color:'#666'}}>No profiles found yet.</div>}
                {!loading && displayed.length > 0 && (
                    <div style={{display:'grid', gap:10}}>
                        {displayed.map((r, idx) => (
                            <div key={r.link} style={{padding:10, borderRadius:8, border:'1px solid #f0f0f0'}}>
                                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                                    <div style={{fontWeight:600}}>{r.handle ? `@${r.handle}` : r.title}</div>
                                    <a href={r.link} target="_blank" rel="noopener noreferrer" style={{fontSize:'0.85rem'}}>Open ↗</a>
                                </div>
                                <div style={{fontSize:'0.85rem', color:'#666', marginTop:6}}>{r.snippet}</div>
                            </div>
                        ))}
                    </div>
                )}

                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:12}}>
                    <div style={{color:'#666'}}>{results.length} results</div>
                    <div style={{display:'flex', gap:8}}>
                        <button className="secondary-btn" disabled={page === 0} onClick={() => setPage(p => Math.max(0, p - 1))}>Prev</button>
                        <button className="secondary-btn" onClick={async () => {
                            // if next page items not present, fetch more
                            const nextPageStart = results.length + 1;
                            if ((page + 1) * perPage >= results.length) {
                                await fetchProfiles(nextPageStart);
                            }
                            setPage(p => p + 1);
                        }}>Load More</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Helper: extract username and repo from a GitHub URL
const extractGithubInfo = (url: string): { user?: string; repo?: string } => {
    try {
        const u = new URL(url);
        if (u.hostname !== 'github.com') return {};
        const parts = u.pathname.split('/').filter(Boolean);
        // URL forms: /user, /user/repo, /user/repo/..., /user?tab=repositories, etc.
        if (parts.length >= 2) return { user: parts[0], repo: parts[1] };
        if (parts.length === 1) return { user: parts[0] };
    } catch (e) {
        // ignore
    }
    return {};
};

// Helper: process google custom search items to group by user and repo
const processGithubResults = (items: any[]) => {
    const byUser: Record<string, { avatar?: string; profile?: string; bio?: string; repos: { name: string; url: string; snippet?: string }[] }> = {};
    items.forEach(it => {
        const link = it.link || it.formattedUrl || '';
        const info = extractGithubInfo(link);
        if (!info.user) return;
        const user = info.user;
        if (!byUser[user]) byUser[user] = { avatar: `https://github.com/${user}.png`, profile: `https://github.com/${user}`, bio: undefined, repos: [] };
        if (info.repo) {
            const repoName = info.repo;
            byUser[user].repos.push({ name: repoName, url: `https://github.com/${user}/${repoName}`, snippet: it.snippet });
        } else {
            // maybe it's a profile page; try to extract snippet as bio
            if (!byUser[user].bio && it.snippet) byUser[user].bio = it.snippet;
        }
    });
    return byUser;
};

// ProjectSearchWidget: search GitHub (via Google Custom Search site:github.com) for projects matching an idea
const ProjectSearchWidget = ({ defaultQuery }: { defaultQuery?: string }) => {
    const [query, setQuery] = useState(defaultQuery || '');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [users, setUsers] = useState<Record<string, any>>({});

    const getApiConfig = () => {
        // Only use per-section stored PROJECTS key/CX; do not fall back to
        // application defaults. If keys aren't present, return nulls so the
        // caller can prompt the user to configure them.
        const apiKey = getSectionApiKey('PROJECTS');
        const cx = getSectionCx('PROJECTS');
        return { apiKey, cx };
    };

    const performSearch = async (q: string) => {
        setError(null);
        setLoading(true);
        setUsers({});
        const cfg = getApiConfig();
        if (!cfg || !cfg.apiKey || !cfg.cx) {
            setError('Google Custom Search API key and CX not configured. Set window.__GOOGLE_CUSTOM_SEARCH = { apiKey, cx }');
            setLoading(false);
            return;
        }

        // Restrict to code and repos on github.com
        const fullQuery = `${q} site:github.com`;
        const url = `https://www.googleapis.com/customsearch/v1?key=${encodeURIComponent(cfg.apiKey)}&cx=${encodeURIComponent(cfg.cx)}&q=${encodeURIComponent(fullQuery)}&num=10`;
        try {
            const res = await fetch(url);
            if (!res.ok) throw new Error(`Search API returned ${res.status}`);
            const data = await res.json();
            const items = data.items || [];
            const grouped = processGithubResults(items);
            setUsers(grouped);
        } catch (err: any) {
            console.error('ProjectSearchWidget error', err);
            setError(err.message || String(err));
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!query.trim()) return setError('Enter a project idea');
        performSearch(query.trim());
    };

    return (
        <div className="github-search-container">
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                <h3 style={{margin:0}}>Project Finder</h3>
                <div style={{fontSize:'0.85rem', color:'var(--subtle-text-color)'}}>Searches GitHub for related projects and contributors</div>
            </div>

            <form onSubmit={handleSubmit} className="github-search-controls">
                <input className="github-search-input" placeholder="Describe your project idea (e.g. rust web server, deep learning NLP)" value={query} onChange={(e) => setQuery(e.target.value)} />
                <button className="add-btn" type="submit" disabled={loading}>{loading ? 'Searching...' : 'Find'}</button>
            </form>

            {error && <div style={{color:'red'}}>{error}</div>}

            <div className="github-user-cards">
                {Object.keys(users).length === 0 && !loading && <div style={{color:'#666'}}>No users found yet. Try a broader query.</div>}
                {Object.entries(users).map(([user, data]) => (
                    <div key={user} className="github-user-card">
                        <div className="github-user-avatar"><img src={data.avatar} alt={user} draggable={false} onDragStart={preventImageDrag} style={{width:'100%', height:'100%', objectFit:'cover'}}/></div>
                        <div className="github-user-meta">
                            <h4><a href={data.profile} target="_blank" rel="noopener noreferrer">{user}</a></h4>
                            {data.bio && <p>{data.bio}</p>}
                            <div className="repo-list">
                                {data.repos.slice(0,6).map((r: any, i: number) => (
                                    <div key={i}>
                                        <a href={r.url} target="_blank" rel="noopener noreferrer">{r.name}</a>
                                        {r.snippet && <div className="repo-meta">{r.snippet}</div>}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const HomePage = ({ data, onOpenPublicModal, onNavigate, userRole, hasGuestTarget, targetProfessorId }: { data: AppData, onOpenPublicModal?: (name: string) => void, onNavigate?: (view: View) => void, userRole?: 'admin' | 'public' | null, hasGuestTarget?: boolean, targetProfessorId?: string | null }) => {
    // Replaced useLiveNews with PublicJobSearch for Public tab
    const [homeTab, setHomeTab] = useState<'PUBLIC' | 'MINE'>('PUBLIC');
    const [mineSubTab, setMineSubTab] = useState<'news' | 'projects'>('news');
    const [selectedCompany, setSelectedCompany] = useState<string | undefined>(undefined);
    const [customMineCompanies, setCustomMineCompanies] = useState<string[]>([]);
    const [customCompanyInput, setCustomCompanyInput] = useState('');

    // --- MINE section: per-user/professor company list ---
    const normalizeCompany = useCallback((value: string) => value.trim().replace(/\s+/g, ' '), []);

    // Use a unique key for each user/professor for custom companies
    const customCompaniesStorageKey = useMemo(() => {
        // If public user with a target professor, use that professor's id
        if (userRole === 'public' && targetProfessorId) return `MINE_CUSTOM_COMPANIES_PUBLIC_${targetProfessorId}`;
        // If admin, use admin id or global
        if (userRole === 'admin') return `MINE_CUSTOM_COMPANIES_ADMIN`;
        return `MINE_CUSTOM_COMPANIES_GLOBAL`;
    }, [userRole, targetProfessorId]);

    // Load custom companies for this user/professor
    useEffect(() => {
        try {
            const raw = localStorage.getItem(customCompaniesStorageKey);
            if (!raw) {
                setCustomMineCompanies([]);
                return;
            }
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) {
                setCustomMineCompanies(parsed.map((v: any) => String(v)).map(normalizeCompany).filter(Boolean));
            } else {
                setCustomMineCompanies([]);
            }
        } catch {
            setCustomMineCompanies([]);
        }
    }, [customCompaniesStorageKey, normalizeCompany]);

    // Base companies: for public user with target, use only that professor's companies; for admin/global, use all
    const baseMineCompanies = useMemo(() => {
        if (userRole === 'public' && targetProfessorId) {
            const prof = Object.values(data.professors).find((p: any) => p.id === targetProfessorId || p._id === targetProfessorId);
            return prof ? (Array.isArray(prof.companies) ? prof.companies : (prof.companies ? [prof.companies] : [])) : [];
        }
        // For admin/global, show all companies from all professors
        const allCompanies = Object.values(data.professors).flatMap((p: any) => Array.isArray(p.companies) ? p.companies : (p.companies ? [p.companies] : []));
        return allCompanies;
    }, [data, userRole, targetProfessorId]);

    // Merge and deduplicate
    const mineCompanies = useMemo(() => {
        const merged = [...baseMineCompanies, ...customMineCompanies].map((c: any) => normalizeCompany(String(c || ''))).filter(Boolean);
        return Array.from(new Set(merged)).slice(0, 60);
    }, [baseMineCompanies, customMineCompanies, normalizeCompany]);

    // Add/remove custom company for this user/professor
    const addCustomMineCompany = useCallback(() => {
        const company = normalizeCompany(customCompanyInput);
        if (!company) return;
        setCustomMineCompanies(prev => {
            if (prev.some(p => p.toLowerCase() === company.toLowerCase())) {
                setSelectedCompany(company);
                return prev;
            }
            const updated = [...prev, company];
            try { localStorage.setItem(customCompaniesStorageKey, JSON.stringify(updated)); } catch {}
            setSelectedCompany(company);
            return updated;
        });
        setCustomCompanyInput('');
    }, [customCompaniesStorageKey, customCompanyInput, normalizeCompany]);

    const removeCustomMineCompany = useCallback((company: string) => {
        setCustomMineCompanies(prev => {
            const updated = prev.filter(p => p.toLowerCase() !== company.toLowerCase());
            try { localStorage.setItem(customCompaniesStorageKey, JSON.stringify(updated)); } catch {}
            return updated;
        });
        if (selectedCompany && selectedCompany.toLowerCase() === company.toLowerCase()) {
            setSelectedCompany(mineCompanies.find(c => c.toLowerCase() !== company.toLowerCase()) || undefined);
        }
    }, [customCompaniesStorageKey, mineCompanies, selectedCompany]);

    // Set default selected company
    useEffect(() => {
        if (!data) return;
        if (mineCompanies.length && (!selectedCompany || !mineCompanies.includes(selectedCompany))) {
            setSelectedCompany(mineCompanies[0]);
            return;
        }
        if (!selectedCompany && mineCompanies.length) {
            setSelectedCompany(mineCompanies[0]);
        }
    }, [data, mineCompanies, selectedCompany]);

    return (
        <div className="homepage-container">
            <div className="homepage-tabs">
                <button className={`home-tab ${homeTab === 'PUBLIC' ? 'active' : ''}`} onClick={() => setHomeTab('PUBLIC')}>PUBLIC</button>
                <button className={`home-tab ${homeTab === 'MINE' ? 'active' : ''}`} onClick={() => setHomeTab('MINE')}>MINE</button>
            </div>
            {homeTab === 'PUBLIC' ? (
                // PUBLIC preview: show stacked ANNOUNCEMENTS and NEWS with a 2-item preview
                <div style={{display:'flex', flexDirection:'column', gap:'1rem'}}>
                    <div className="public-section-card" style={{padding:'1rem', borderRadius:8, boxShadow:'0 2px 8px rgba(0,0,0,0.06)', background:'white'}}>
                        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                            <div>
                                <h3 style={{margin:0}}>ANNOUNCEMENTS</h3>
                                <p style={{margin:0, color:'#666', fontSize:'0.9rem'}}>Latest job announcements across companies</p>
                            </div>
                            <div style={{display:'flex', gap:8}}>
                                <button className="add-btn" onClick={() => onOpenPublicModal && onOpenPublicModal('announcements')}>Open</button>
                            </div>
                        </div>
                        <div style={{marginTop:'0.75rem'}}>
                            <PublicJobSearch mode="preview" previewCount={2} userRole={userRole} />
                        </div>
                    </div>

                    <div className="public-section-card" style={{padding:'1rem', borderRadius:8, boxShadow:'0 2px 8px rgba(0,0,0,0.06)', background:'white'}}>
                        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                            <div>
                                <h3 style={{margin:0}}>NEWS</h3>
                                <p style={{margin:0, color:'#666', fontSize:'0.9rem'}}>Technology news and updates</p>
                            </div>
                            <div style={{display:'flex', gap:8}}>
                                <button className="add-btn" onClick={() => onOpenPublicModal && onOpenPublicModal('news')}>Open</button>
                            </div>
                        </div>
                        <div style={{marginTop:'0.75rem'}}>
                            {/* show a small news preview using the same component in preview mode (it will run a news query) */}
                            <PublicJobSearch mode="preview" previewCount={2} queryTarget={'news'} userRole={userRole} />
                        </div>
                    </div>
                </div>
            ) : (
                <div className="mine-dashboard-wrapper">
                    {userRole === 'public' && !hasGuestTarget ? (
                        <div style={{textAlign:'center', padding:'3rem', color:'#666'}}>
                            <div style={{fontSize:'2.5rem', marginBottom:'1rem'}}>🔒</div>
                            <h3>Dashboard Locked</h3>
                            <p style={{maxWidth:'400px', margin:'0 auto'}}>To unlock your personalized dashboard, please select a professor from the directory.</p>
                            <button
                                className="add-btn"
                                style={{marginTop:'1.5rem', fontSize:'1.1rem', padding:'0.8rem 2.2rem'}}
                                onClick={() => {
                                    if (onNavigate) {
                                        onNavigate({ view: 'professor_directory' });
                                    }
                                }}
                            >
                                Go to Professor Directory
                            </button>
                        </div>
                    ) : (
                        <>
                            {/* Sub-tabs: News | Projects */}
                            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12}}>
                                <div style={{display:'flex', gap:8}}>
                                    <button className={`subtab ${mineSubTab === 'news' ? 'active' : ''}`} onClick={() => setMineSubTab('news')}>News</button>
                                    <button className={`subtab ${mineSubTab === 'projects' ? 'active' : ''}`} onClick={() => setMineSubTab('projects')}>Projects</button>
                                </div>
                                <div style={{color:'#666', fontSize:'0.9rem'}}>{selectedCompany || 'Select a company'}</div>
                            </div>

                            <div className="mine-company-toolbar" style={{marginBottom:12}}>
                                <div className="mine-company-pills" style={{display:'flex', gap:8, flexWrap:'wrap'}}>
                                    {mineCompanies.slice(0, 30).map((c: string) => (
                                        <button
                                            key={c}
                                            className="pill-btn"
                                            onClick={() => setSelectedCompany(c)}
                                            style={{padding:'6px 10px', borderRadius:20, border: '1px solid #e6e6e6', background: selectedCompany === c ? '#0ea5a4' : 'white', color: selectedCompany === c ? 'white' : '#333'}}
                                        >
                                            {c}
                                        </button>
                                    ))}
                                </div>

                                <div className="mine-addplus-card">
                                    <div className="mine-addplus-head">
                                        <strong>Add+</strong>
                                        <span>Add your company to Mine feeds</span>
                                    </div>
                                    <div className="mine-addplus-row">
                                        <input
                                            placeholder="Type company name"
                                            value={customCompanyInput}
                                            onChange={e => setCustomCompanyInput(e.target.value)}
                                            onKeyDown={e => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    addCustomMineCompany();
                                                }
                                            }}
                                        />
                                        <button className="add-btn mine-addplus-btn" type="button" onClick={addCustomMineCompany}>Add +</button>
                                    </div>
                                    {customMineCompanies.length > 0 && (
                                        <div className="mine-custom-list">
                                            {customMineCompanies.map(c => (
                                                <button key={c} type="button" className="mine-custom-chip" onClick={() => setSelectedCompany(c)}>
                                                    <span>{c}</span>
                                                    <span
                                                        className="mine-custom-remove"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            removeCustomMineCompany(c);
                                                        }}
                                                        role="button"
                                                        aria-label={`Remove ${c}`}
                                                    >
                                                        ×
                                                    </span>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Render content for selected subtab */}
                            {mineSubTab === 'news' ? (
                                <div className="mine-grid-center" style={{display:'grid', gridTemplateColumns:'2fr 1fr', gap:16}}>
                                    <HeadlinerSection company={selectedCompany} />
                                    <TCJPSection company={selectedCompany} />
                                </div>
                            ) : (
                                <div className="projects-center" style={{background:'white', padding:12, borderRadius:8, boxShadow:'0 2px 8px rgba(0,0,0,0.06)'}}>
                                    <ProjectSearchWidget defaultQuery={selectedCompany || ''} />
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

// 7. Professor List Item (new horizontal layout used in Directory)
const ProfessorListItem = ({ professor, onNavigate, onEdit, onRemove }: any) => {
    const photoSrc = resolveProfessorPhotoSrc(professor.photo);
    const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
        e.currentTarget.src = DEFAULT_PROFESSOR_PHOTO;
    };

    return (
        <div className="professor-list-item" onClick={() => onNavigate({ view: 'professor', id: professor.id })}>
            <div className="list-photo">
                <img src={photoSrc} alt={professor.name} className="list-photo-img" draggable={false} onDragStart={preventImageDrag} onError={handleImageError} />
            </div>

            <div className="list-details">
                <div className="list-name">{professor.name}</div>
                <div className="list-position">{professor.position}</div>
                <div className="list-email">{professor.email}</div>
            </div>

            <div className="list-actions" onClick={(e) => e.stopPropagation()}>
                <a href="#" className="view-profile-link" onClick={(e)=>{e.preventDefault(); onNavigate({ view: 'professor', id: professor.id });}}>View Profile</a>
                {onRemove && (
                    <button className="remove-btn" onClick={() => onRemove(professor.id)}>Remove</button>
                )}
            </div>
        </div>
    );
};

// 7b. Professor Card (kept for other places)
const ProfessorCard = ({ professor, onNavigate, onEdit }: any) => {
    const photoSrc = resolveProfessorPhotoSrc(professor.photo);
    const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
        e.currentTarget.src = DEFAULT_PROFESSOR_PHOTO;
    };

    return (
        <div className="professor-card" onClick={() => onNavigate({ view: 'professor', id: professor.id })}>
            <div className="card-photo-container">
                <img 
                    src={photoSrc} 
                    alt={professor.name} 
                    className="professor-photo" 
                    draggable={false}
                    onDragStart={preventImageDrag}
                    onError={handleImageError}
                />
                {onEdit && (
                    <button
                        className="edit-prof-btn"
                        onClick={(e) => { e.stopPropagation(); onEdit(professor.id); }}
                        aria-label={`Edit ${professor.name}`}
                        title={`Edit ${professor.name}`}
                    >
                        Edit
                    </button>
                )}
            </div>
            <div className="professor-details">
                <h3 className="professor-name-clickable">{professor.name}</h3>
                <p className="position">{professor.position}</p>
                <p className="email">{professor.email}</p>
            </div>
            <div className="professor-links">
                <span style={{fontSize:'0.9rem', color:'var(--primary-color)'}}>View Profile</span>
            </div>
        </div>
    );
};

// 8. Professor Directory
const ProfessorDirectoryPage = ({ professors, onNavigate, onAdd, userRole, onEdit, onRemove }: any) => {
    const [search, setSearch] = useState('');
    // Only show professors with a unique photo (not default/team)
    const filtered = Object.values(professors)
        .filter((p: any) => p.name.toLowerCase().includes(search.toLowerCase()))
        .filter((p: any) => p.photo && p.photo !== '/photos/team.png')
        .sort((a: any, b: any) => a.name.localeCompare(b.name));

    return (
        <div>
            <div className="section-title-bar">
                <h2>Directory</h2>
                <div style={{display:'flex', gap:'1rem', alignItems: 'center'}}>
                     <input type="text" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} style={{padding:'0.5rem 1rem', borderRadius:'99px', border:'1px solid #ddd'}} />
                     {userRole === 'admin' && <button className="add-btn" onClick={onAdd}>+ Add</button>}
                </div>
            </div>
            <div className="professors-list">
                {filtered.map((p: any) => (
                    <ProfessorListItem key={p.id} professor={p} onNavigate={onNavigate} onEdit={onEdit} onRemove={userRole === 'admin' ? onRemove : undefined} />
                ))}
            </div>
        </div>
    );
};

// 9. Profile Page
const ProfessorProfilePage = ({ professor, onEditProfessor, userRole, onSetTarget, onReturnHome, hasGuestTarget, onConfirmGuestTarget }: any) => {
    const [actionModalStep, setActionModalStep] = useState<number>(0);
    const [activeTab, setActiveTab] = useState<'about' | 'lectures' | 'companies'>('about');
    const cvGeneratorExternalUrl = 'https://cv-generator-theta-six.vercel.app/';
    const showCvGenerator = userRole !== 'admin';

    const companiesList = useMemo(() => {
        if (Array.isArray(professor?.companies)) return professor.companies.filter(Boolean);
        return professor?.companies ? [professor.companies] : [];
    }, [professor?.companies]);

    const deptGuide = useMemo(() => {
        const deptId = professor?.departmentId || '';
        return DEPARTMENT_STRATEGY_GUIDE[deptId] || {
            title: 'General Strategy Track',
            summary: 'Align your research profile with industry-ready outcomes, portfolio evidence, and targeted internship organizations connected to this professor\'s focus area.'
        };
    }, [professor?.departmentId]);

    const strategyNote = useMemo(() => {
        return typeof professor?.strategyNotice === 'string' ? professor.strategyNotice.trim() : '';
    }, [professor?.strategyNotice]);

    const profilePhotoSrc = useMemo(() => {
        if (professor?.departmentId === 'dept_ai') {
            return getAiProfessorPhoto(professor?.name || '');
        }

        return resolveProfessorPhotoSrc(professor?.photo);
    }, [professor?.photo]);

    const openAction = () => {
        // Guest Restriction Logic
        if (userRole === 'public') {
            if (hasGuestTarget) {
                // Keep target-locking behavior, but still let users re-open Strategy Notice.
                setActionModalStep(-2);
                return;
            } else {
                // Show warning before proceeding
                setActionModalStep(-1); // Special step for warning
                return;
            }
        }

        // Admin or non-restricted flow
        try { if (onSetTarget) onSetTarget(professor.id); } catch (e) {}
        setActionModalStep(-2);
    };

    const confirmGuestTargetSelection = () => {
        if (onConfirmGuestTarget) onConfirmGuestTarget(professor.id);
        setActionModalStep(-2); // Proceed to strategy notice first
    };

    return (
        <div className="professor-profile">
            <div className="profile-header">
                <img
                    src={profilePhotoSrc}
                    className="profile-photo-large"
                    draggable={false}
                    onDragStart={preventImageDrag}
                    onError={(e) => {
                        const img = e.target as HTMLImageElement;
                        img.onerror = null;
                        img.src = DEFAULT_PROFESSOR_PHOTO;
                    }}
                />
                <div className="profile-info">
                    <h1>{professor.name}</h1>
                    <p>{professor.position} | {professor.degree}</p>
                    <div className="profile-actions">
                        <button className="action-btn" onClick={openAction}>ACTION (Set Target)</button>
                        {showCvGenerator && (
                            <a className="secondary-btn" href={cvGeneratorExternalUrl} target="_blank" rel="noopener noreferrer">Open CV Generator</a>
                        )}
                        {userRole === 'admin' && (
                            <button
                                className="edit-profile-btn secondary-btn"
                                onClick={() => onEditProfessor && onEditProfessor(professor.id)}
                                aria-label={`Edit Professor ${professor.name}`}
                            >
                                Edit
                            </button>
                        )}
                    </div>
                    {professor?.links?.webpage && (
                        <div className="profile-webpage">
                            <a
                                href={professor.links.webpage}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="profile-webpage-link"
                                title="Open official profile"
                            >
                                Official Profile ↗
                            </a>
                            <div className="profile-webpage-url"><small>{professor.links.webpage}</small></div>
                        </div>
                    )}
                </div>
            </div>

            <div className="profile-body">
                <div className="profile-tabs">
                    <button type="button" className={`profile-tab ${activeTab === 'about' ? 'active' : ''}`} onClick={() => setActiveTab('about')}>About</button>
                    <button type="button" className={`profile-tab ${activeTab === 'lectures' ? 'active' : ''}`} onClick={() => setActiveTab('lectures')}>Lectures</button>
                    <button type="button" className={`profile-tab ${activeTab === 'companies' ? 'active' : ''}`} onClick={() => setActiveTab('companies')}>Companies</button>
                </div>

                <div className="profile-tab-content">
                    {activeTab === 'about' && (
                        <>
                            <h3>About</h3>
                            <p>{professor.description}</p>
                            <h3>Research</h3>
                            <ul>{(Array.isArray(professor.research) ? professor.research : [professor.research]).map((r:string, i:number) => <li key={i}>{r}</li>)}</ul>
                            <h3>Projects</h3>
                            <ul>{(Array.isArray(professor.projects) ? professor.projects : (professor.projects ? [professor.projects] : [])).map((p:string, i:number) => <li key={i}>{p}</li>)}</ul>
                        </>
                    )}

                    {activeTab === 'lectures' && (
                        <div className="lecture-list">
                            {(Array.isArray(professor.lectures) ? professor.lectures : (professor.lectures ? [professor.lectures] : [])).length === 0 ? (
                                <div className="empty-note">No lectures found for this professor.</div>
                            ) : (
                                <ul>
                                    {(Array.isArray(professor.lectures) ? professor.lectures : (professor.lectures ? [professor.lectures] : [])).map((lec:any, i:number) => {
                                        const title = typeof lec === 'string' ? lec : (lec.title || JSON.stringify(lec));
                                        const url = typeof lec === 'object' && lec.url ? lec.url : undefined;
                                        return (
                                            <li key={i} className="lecture-item">
                                                <div className="lecture-title">{title}</div>
                                                {url && <a href={url} target="_blank" rel="noopener noreferrer" className="lecture-link">Open</a>}
                                            </li>
                                        );
                                    })}
                                </ul>
                            )}
                        </div>
                    )}

                    {activeTab === 'companies' && (
                        <div className="companies-list">
                            {(Array.isArray(professor.companies) ? professor.companies : (professor.companies ? [professor.companies] : [])).length === 0 ? (
                                <div className="empty-note">No companies listed for this professor.</div>
                            ) : (
                                <ul>{(Array.isArray(professor.companies) ? professor.companies : [professor.companies]).map((c:string, i:number) => <li key={i}>{c}</li>)}</ul>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Guest Warning Modal */}
            {actionModalStep === -1 && (
                <div className="modal-overlay is-visible" role="dialog" aria-modal="true" aria-label="Confirm Target">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2 className="modal-title" style={{color:'#b91c1c'}}>Important Warning</h2>
                            <button onClick={() => setActionModalStep(0)} className="close-btn">×</button>
                        </div>
                        <div className="modal-body-wrapper">
                            <div className="modal-body">
                                <p>You can only select <strong>ONE</strong> professor as your target. This action cannot be undone.</p>
                                <p>Selecting this professor will unlock your personal "Mine" dashboard.</p>
                                <p>Do you want to set <strong>{professor.name}</strong> as your target?</p>
                            </div>
                        </div>
                        <div className="modal-actions">
                            <button className="modal-btn secondary" onClick={() => setActionModalStep(0)}>Cancel</button>
                            <button className="modal-btn primary" onClick={confirmGuestTargetSelection}>Confirm & View Strategy</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Strategy Notice Modal */}
            {actionModalStep === -2 && (
                <div className="modal-overlay is-visible" role="dialog" aria-modal="true" aria-label="Strategy Notice">
                    <div className="modal-content strategy-modal-content">
                        <div className="modal-body-wrapper">
                            <div className="modal-body">
                                <div className="modal-header strategy-modal-header">
                                    <h2
                                        className="modal-title"
                                        style={{
                                            display: 'inline-block',
                                            margin: 0,
                                            padding: '0.32rem 0.7rem',
                                            borderRadius: '10px',
                                            background: 'rgba(91, 33, 182, 0.22)',
                                            border: '1px solid rgba(91, 33, 182, 0.45)',
                                            color: 'var(--text-color)',
                                            lineHeight: 1.1
                                        }}
                                    >
                                        Strategy Notice
                                    </h2>
                                    <button onClick={() => setActionModalStep(0)} className="close-btn" aria-label="Exit strategy notice">×</button>
                                </div>
                                <div className="strategy-chip">{deptGuide.title}</div>
                                <p className="strategy-summary">{deptGuide.summary}</p>
                                {strategyNote && <p className="strategy-note">{strategyNote}</p>}
                                <h4 className="strategy-subtitle">Recommended Organizations for {professor.name}</h4>
                                {companiesList.length === 0 ? (
                                    <p className="strategy-empty">No mapped organizations found for this profile yet.</p>
                                ) : (
                                    <ul className="strategy-company-list">
                                        {companiesList.map((company: string, i: number) => (
                                            <li key={i}>{company}</li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>
                        <div className="modal-actions">
                            <button className="modal-btn secondary" onClick={() => setActionModalStep(0)}>Exit Strategy</button>
                            <button className="modal-btn primary" onClick={() => setActionModalStep(1)}>Continue</button>
                        </div>
                    </div>
                </div>
            )}

            {/* ACTION modal flow: 3-step dialog */}
            {actionModalStep === 1 && (
                <div className="modal-overlay is-visible" role="dialog" aria-modal="true" aria-label="Set as Target">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2 className="modal-title">Set as Target</h2>
                            <button onClick={() => setActionModalStep(0)} className="close-btn">×</button>
                        </div>
                        <div className="modal-body-wrapper">
                            <div className="modal-body">
                                <p>You have selected this professor as a target. Press confirm to see the next steps.</p>
                            </div>
                        </div>
                        <div className="modal-actions">
                            <button className="modal-btn primary" onClick={() => setActionModalStep(2)}>Confirm</button>
                        </div>
                    </div>
                </div>
            )}

            {actionModalStep === 2 && (
                <div className="modal-overlay is-visible" role="dialog" aria-modal="true" aria-label="Steps to Follow">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2 className="modal-title">Steps to Follow</h2>
                            <button onClick={() => setActionModalStep(0)} className="close-btn">×</button>
                        </div>
                        <div className="modal-body-wrapper">
                            <div className="modal-body">
                                <p>Please follow these steps to connect with the professor:</p>
                                <ol>
                                    <li>Review the professor's recent publications and research interests.</li>
                                    <li>Identify a specific area of overlap with your own interests or background.</li>
                                    <li>Draft a concise and professional email introducing yourself.</li>
                                    <li>Clearly state your purpose for contacting them and attach your CV.</li>
                                </ol>
                            </div>
                        </div>
                        <div className="modal-actions">
                            <button className="modal-btn primary" onClick={() => setActionModalStep(3)}>Accept</button>
                        </div>
                    </div>
                </div>
            )}

            {actionModalStep === 3 && (
                <div className="modal-overlay is-visible" role="dialog" aria-modal="true" aria-label="Internship Confirmed">
                    <div className="modal-content cv-launch-content">
                        <div className="modal-body-wrapper">
                            <div className="modal-body">
                                <div className="modal-header">
                                    <h2 className="modal-title">Internship Path Confirmed</h2>
                                    <button onClick={() => setActionModalStep(0)} className="close-btn" aria-label="Close confirmation">×</button>
                                </div>
                                <p>
                                    Great choice. Your target professor has been saved and your internship workflow is now active.
                                </p>
                                <p>
                                    Build your CV now to apply professionally with details tailored to this track.
                                </p>
                                {showCvGenerator && (
                                    <p>
                                        If redirection is blocked, use this link: <a href={cvGeneratorExternalUrl} target="_blank" rel="noopener noreferrer">Open CV Generator</a>
                                    </p>
                                )}
                            </div>
                        </div>
                        <div className="modal-actions">
                            <button
                                className="modal-btn secondary"
                                onClick={() => {
                                    setActionModalStep(0);
                                    try { if (typeof onReturnHome === 'function') onReturnHome(); } catch (e) {}
                                }}
                            >
                                Return Home
                            </button>
                            {showCvGenerator && (
                                <a
                                    className="modal-btn primary"
                                    href={cvGeneratorExternalUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    Open CV Generator
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

// 10. Department Page
const DepartmentPage = ({ department, allData, onNavigate }: any) => {
    // Hide Civil and Chemical department pages entirely
    if (['Civil Engineering', 'Chemical Engineering', 'Civil', 'Chemical'].includes(department.name) || ['dept_ce', 'dept_ch'].includes(department.id)) {
        return null;
    }
    const profs = Object.values(allData.professors).filter((p: any) => p.departmentId === department.id);
    return (
        <div>
            <h2>{department.name}</h2>
            <div className="professors-grid">
                {profs.map((p: any) => <ProfessorCard key={p.id} professor={p} onNavigate={onNavigate} />)}
            </div>
        </div>
    );
};

// 11. Modals
const AddProfessorModal = ({ onClose, onSubmit, departments }: any) => {
    const [form, setForm] = useState<any>({ name: '', email: '', position: '', degree: '', departmentId: departments && departments.length ? departments[0].id : '', branchName: '' });
    const [submitting, setSubmitting] = useState(false);
    const toast = useToast();

    useEffect(() => {
        if ((!form.departmentId || form.departmentId === '') && departments && departments.length) {
            setForm(f => ({ ...f, departmentId: departments[0].id }));
        }
    }, [departments]);

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [onClose]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setForm(f => ({ ...f, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name || !form.email) {
            toast('Please provide name and email.');
            return;
        }
        if (!onSubmit) {
            toast('No submit handler provided.');
            return;
        }
        try {
            setSubmitting(true);
            await onSubmit({ ...form });
            toast('Professor added.');
            onClose();
        } catch (err) {
            console.error('AddProfessorModal submit error', err);
            toast('Failed to add professor.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="add-professor-title">
            <div className="modal-content">
                <h2 id="add-professor-title">Add Professor</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="prof-name">Name</label>
                        <input id="prof-name" name="name" value={form.name} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="prof-email">Email</label>
                        <input id="prof-email" name="email" type="email" value={form.email} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="prof-position">Position</label>
                        <input id="prof-position" name="position" value={form.position} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                        <label htmlFor="prof-degree">Degree</label>
                        <input id="prof-degree" name="degree" value={form.degree} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                        <label htmlFor="prof-department">Department</label>
                        <select id="prof-department" name="departmentId" value={form.departmentId} onChange={handleChange}>
                            {(departments || []).map((d: any) => <option key={d.id} value={d.id}>{d.name}</option>)}
                        </select>
                    </div>
                    <div className="form-group">
                        <label htmlFor="prof-branch">Branch Name</label>
                        <input id="prof-branch" name="branchName" value={form.branchName} onChange={handleChange} />
                    </div>
                    <div className="modal-actions">
                        <button type="button" onClick={onClose} className="secondary-btn">Cancel</button>
                        <button type="submit" className="add-btn" disabled={submitting}>{submitting ? 'Saving...' : 'Save'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};
const EditProfessorModal = ({ professor, onClose, onSave, departments }: any) => {
    const [form, setForm] = useState<any>({
        id: professor?.id || professor?._id || '',
        name: professor?.name || '',
        email: professor?.email || '',
        position: professor?.position || '',
        degree: professor?.degree || '',
        departmentId: professor?.departmentId || (departments && departments.length ? departments[0].id : ''),
        branchName: professor?.branchName || professor?.branch || '',
        description: professor?.description || '',
        photoFile: null,
        photoPreview: professor?.photo || '',
        research: Array.isArray(professor?.research) ? professor.research : (professor?.research ? [professor.research] : []),
        projects: Array.isArray(professor?.projects) ? professor.projects : (professor?.projects ? [professor.projects] : []),
        companies: Array.isArray(professor?.companies) ? professor.companies : (professor?.companies ? [professor.companies] : []),
        websites: Array.isArray(professor?.websites) ? professor.websites : (professor?.websites ? [professor.websites] : []),
        institutes: Array.isArray(professor?.institutes) ? professor.institutes : (professor?.institutes ? [professor.institutes] : [])
    });
    const [submitting, setSubmitting] = useState(false);
    const firstInputRef = useRef<HTMLInputElement | null>(null);
    const previousActiveRef = useRef<HTMLElement | null>(null);

    useEffect(() => {
        previousActiveRef.current = document.activeElement as HTMLElement | null;
        setTimeout(() => firstInputRef.current?.focus(), 0);
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', onKey);
        return () => {
            document.removeEventListener('keydown', onKey);
            try { previousActiveRef.current?.focus(); } catch (e) {}
        };
    }, []);

    const updateField = (name: string, value: any) => setForm((f:any) => ({ ...f, [name]: value }));

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            updateField('photoPreview', reader.result as string);
            updateField('photoFile', file);
        };
        reader.readAsDataURL(file);
    };

    const ensureArray = (v: any) => Array.isArray(v) ? v.filter(Boolean) : (v ? [v] : []);

    const handleAddItem = (key: string) => {
        setForm((f:any) => ({ ...f, [key]: [...ensureArray(f[key]), ''] }));
    };
    const handleRemoveItem = (key: string, idx: number) => {
        setForm((f:any) => ({ ...f, [key]: ensureArray(f[key]).filter((_:any,i:number)=>i!==idx) }));
    };
    const handleItemChange = (key: string, idx: number, val: string) => {
        setForm((f:any) => ({ ...f, [key]: ensureArray(f[key]).map((it:any,i:number)=>i===idx?val:it) }));
    };

    const toBase64 = (file: File) => new Promise<string>((resolve, reject) => {
        const r = new FileReader(); r.onload = () => resolve(r.result as string); r.onerror = reject; r.readAsDataURL(file);
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name || !form.email || !form.branchName) { alert('Please provide Name, Email and Branch'); return; }
        setSubmitting(true);
        try {
            let photoData = form.photoPreview;
            if (form.photoFile) {
                try { photoData = await toBase64(form.photoFile); } catch (err) { /* ignore */ }
            }
            const payload: any = {
                id: form.id,
                name: form.name,
                email: form.email,
                position: form.position,
                degree: form.degree,
                departmentId: form.departmentId,
                branchName: form.branchName,
                description: form.description,
                photo: photoData,
                research: ensureArray(form.research),
                projects: ensureArray(form.projects),
                companies: ensureArray(form.companies),
                websites: ensureArray(form.websites),
                institutes: ensureArray(form.institutes)
            };
            await onSave(payload);
        } catch (err) {
            console.error('Edit save error', err);
            alert('Failed to save professor.');
        } finally { setSubmitting(false); }
    };

    return (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-label={`Edit Professor ${professor?.name || ''}`}>
            <div className="modal-content">
                <div className="modal-header">
                    <h2>Edit Professor</h2>
                    <button className="close-btn" onClick={onClose} aria-label="Close">&times;</button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="edit-name">Full Name</label>
                        <input id="edit-name" ref={firstInputRef} value={form.name} onChange={e => updateField('name', e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="edit-email">Email</label>
                        <input id="edit-email" type="email" value={form.email} onChange={e => updateField('email', e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="edit-position">Position</label>
                        <input id="edit-position" value={form.position} onChange={e => updateField('position', e.target.value)} />
                    </div>
                    <div className="form-group">
                        <label htmlFor="edit-degree">Degree</label>
                        <input id="edit-degree" value={form.degree} onChange={e => updateField('degree', e.target.value)} />
                    </div>
                    <div className="form-group">
                        <label htmlFor="edit-department">Department</label>
                        <select id="edit-department" value={form.departmentId} onChange={e => updateField('departmentId', e.target.value)}>
                            {(departments || []).map((d:any)=> <option key={d.id} value={d.id}>{d.name}</option>)}
                        </select>
                    </div>
                    <div className="form-group">
                        <label htmlFor="edit-branch">Branch</label>
                        <input id="edit-branch" value={form.branchName} onChange={e => updateField('branchName', e.target.value)} required />
                    </div>

                    <div className="form-group">
                        <label>Photo</label>
                        <input type="file" accept="image/*" onChange={handleFileChange} />
                        {form.photoPreview && <div style={{marginTop:8}}><img src={form.photoPreview} alt="Preview" draggable={false} onDragStart={preventImageDrag} style={{width:120, height:120, objectFit:'cover', borderRadius:8}}/></div>}
                    </div>

                    <div className="form-group">
                        <label>Description</label>
                        <textarea value={form.description} onChange={e => updateField('description', e.target.value)} />
                    </div>

                    {/* Repeatable lists */}
                    <div className="form-group">
                        <label>Research</label>
                        {(form.research || []).map((r:any, i:number) => (
                            <div key={i} style={{display:'flex', gap:8, marginBottom:6}}>
                                <input value={r} onChange={e => handleItemChange('research', i, e.target.value)} />
                                <button type="button" className="remove-item-btn" onClick={() => handleRemoveItem('research', i)} aria-label={`Remove research ${i}`}>x</button>
                            </div>
                        ))}
                        <button type="button" className="action-btn" onClick={() => handleAddItem('research')}>+ Add research</button>
                    </div>

                    <div className="form-group">
                        <label>Projects</label>
                        {(form.projects || []).map((r:any, i:number) => (
                            <div key={i} style={{display:'flex', gap:8, marginBottom:6}}>
                                <input value={r} onChange={e => handleItemChange('projects', i, e.target.value)} />
                                <button type="button" className="remove-item-btn" onClick={() => handleRemoveItem('projects', i)} aria-label={`Remove project ${i}`}>x</button>
                            </div>
                        ))}
                        <button type="button" className="action-btn" onClick={() => handleAddItem('projects')}>+ Add project</button>
                    </div>

                    <div className="modal-actions">
                        <button type="button" onClick={onClose} className="secondary-btn">Cancel</button>
                        <button type="submit" className="add-btn" disabled={submitting}>{submitting ? 'Saving...' : 'Save'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// --- SELF DEV DASHBOARD ---
const SelfDevDashboard = () => {
    const [lcUsername, setLcUsername] = useState(() => localStorage.getItem('lc_user') || '');
    const [cfUsername, setCfUsername] = useState(() => localStorage.getItem('cf_user') || '');
    const [target, setTarget] = useState(() => Number(localStorage.getItem('coding_target')) || 100);
    
    const [lcSolved, setLcSolved] = useState(0);
    const [cfSolved, setCfSolved] = useState(0);
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);

    const saveData = () => {
        localStorage.setItem('lc_user', lcUsername);
        localStorage.setItem('cf_user', cfUsername);
        localStorage.setItem('coding_target', String(target));
        fetchStats();
    };

    const fetchStats = async () => {
        setLoading(true);
        let lcCount = 0;
        let cfCount = 0;

        // Codeforces API (Public)
        if (cfUsername) {
            try {
                // Fetch user status (submissions) to count solved problems
                const res = await fetch(`https://codeforces.com/api/user.status?handle=${cfUsername}&from=1&count=10000`);
                if (res.ok) {
                    const data = await res.json();
                    if (data.status === "OK") {
                        // Count unique solved problems (verdict OK)
                        const solved = new Set();
                        data.result.forEach((sub: any) => {
                            if (sub.verdict === "OK") {
                                solved.add(sub.problem.name);
                            }
                        });
                        cfCount = solved.size;
                    }
                }
            } catch (e) {
                console.warn("Codeforces fetch failed (likely CORS or invalid user), using sim data for demo", e);
                // Fallback for demo purposes if API fails
                cfCount = 0; 
            }
        }

        // LeetCode API (Via Proxy)
        if (lcUsername) {
            try {
                const res = await fetch(`https://leetcode-stats-api.herokuapp.com/${lcUsername}`);
                if (res.ok) {
                    const data = await res.json();
                    if (data.status === "success") {
                        lcCount = data.totalSolved;
                    }
                }
            } catch (e) {
                console.warn("LeetCode fetch failed", e);
                lcCount = 0;
            }
        }

        setLcSolved(lcCount);
        setCfSolved(cfCount);
        setLoading(false);
    };

    // Calculate percentage and animate
    useEffect(() => {
        const total = lcSolved + cfSolved;
        const rawPct = target > 0 ? (total / target) * 100 : 0;
        const targetPct = Math.min(100, Math.max(0, rawPct));
        
        // Simple animation effect
        const timer = setTimeout(() => setProgress(targetPct), 100);
        return () => clearTimeout(timer);
    }, [lcSolved, cfSolved, target]);

    // Initial load
    useEffect(() => {
        fetchStats();
        // Periodic check every 15 minutes (simulated here as 60s for demo visibility)
        const interval = setInterval(fetchStats, 60000); 
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="dashboard-container">
            <div className="progress-card">
                <div className="progress-header">
                    <span>Progress to Goal</span>
                    <span>{Math.round(progress)}%</span>
                </div>
                <div className="progress-track">
                    <div className="progress-fill" style={{ width: `${progress}%` }}></div>
                </div>
                <div className="main-stat">
                    {lcSolved + cfSolved} / {target}
                </div>
                <div className="stat-label">Problems Solved</div>
            </div>

            <div className="platforms-grid">
                <div className="platform-stat-card">
                    <span className="platform-name">LeetCode</span>
                    <span className="platform-value">{lcSolved}</span>
                </div>
                <div className="platform-stat-card">
                    <span className="platform-name">Codeforces</span>
                    <span className="platform-value">{cfSolved}</span>
                </div>
            </div>

            <div className="config-form">
                <h4 style={{marginTop:0, marginBottom:'1rem'}}>Configuration</h4>
                <div className="config-row">
                    <input 
                        placeholder="LeetCode Username" 
                        value={lcUsername} 
                        onChange={e => setLcUsername(e.target.value)} 
                    />
                </div>
                <div className="config-row">
                    <input 
                        placeholder="Codeforces Handle" 
                        value={cfUsername} 
                        onChange={e => setCfUsername(e.target.value)} 
                    />
                </div>
                <div className="config-row">
                    <input 
                        type="number" 
                        placeholder="Goal (Total Problems)" 
                        value={target} 
                        onChange={e => setTarget(Number(e.target.value))} 
                    />
                </div>
                <button className="save-config-btn" onClick={saveData} disabled={loading}>
                    {loading ? 'Syncing...' : 'Update & Sync'}
                </button>
            </div>
        </div>
    );
};

// --- CERTIFICATES MODAL (Full Pop-Out) ---
const CertificatesModal = ({ onClose, onStartInterview }: { onClose: () => void; onStartInterview?: () => void }) => {
    // Full data list extracted from PDF OCR
    const allCertificates = [
         // Marketing & Business
        { name: 'Google Ads Apps Certification', provider: 'Google', link: 'https://www.classcentral.com/course/skillshop-google-ads-apps-certification-86240', category: 'Marketing' },
        { name: 'AI-Powered Shopping ads Certification', provider: 'Google', link: 'https://www.classcentral.com/course/skillshop-ai-powered-shopping-ads-certification-494096', category: 'Marketing' },
        { name: 'Google Ads Creative Certification', provider: 'Google', link: 'https://www.classcentral.com/course/skillshop-google-ads-creative-certification-494097', category: 'Marketing' },
        { name: 'Google Ads Display Certification', provider: 'Google', link: 'https://www.classcentral.com/course/google-ads-display-certification-98266', category: 'Marketing' },
        { name: 'Google Ads Search Certification', provider: 'Google', link: 'https://www.classcentral.com/course/google-ads-search-certification-98564', category: 'Marketing' },
        { name: 'Google Ads Video Certification', provider: 'Google', link: 'https://www.classcentral.com/course/skillshop-google-ads-video-certification-86242', category: 'Marketing' },
        { name: 'Google Analytics Certification', provider: 'Google', link: 'https://www.classcentral.com/course/skillshop-google-analytics-certification-126436', category: 'Analytics' },
        { name: 'Grow Offline Sales Certification', provider: 'Google', link: 'https://www.classcentral.com/course/skillshop-grow-offline-sales-certification-494098', category: 'Marketing' },
        { name: 'AI-Powered Performance Ads Certification', provider: 'Google', link: 'https://www.classcentral.com/course/skillshop-ai-powered-performance-ads-certification-494099', category: 'Marketing' },
        { name: 'Google Play Store Listing Certificate', provider: 'Google', link: 'https://playacademy.withgoogle.com/certificate/', category: 'Business' },
        { name: 'Introduction to Generative AI', provider: 'Google', link: 'https://www.classcentral.com/course/introduction-to-generative-ai-199878', category: 'AI' },
        { name: 'Introduction to Responsible AI', provider: 'Google', link: 'https://www.classcentral.com/course/introduction-to-responsible-ai-199886', category: 'AI' },
        { name: 'Gmail', provider: 'Google', link: 'https://www.classcentral.com/course/gmail-199674', category: 'Productivity' },
        { name: 'Google Sheets - Advanced Topics', provider: 'Google', link: 'https://www.classcentral.com/course/google-sheets---advanced-topics-199681', category: 'Productivity' },
        { name: 'Introduction to Image Generation', provider: 'Google', link: 'https://www.classcentral.com/course/introduction-to-image-generation-199881', category: 'AI' },
        { name: 'Google Calendar', provider: 'Google', link: 'https://www.classcentral.com/course/google-calendar-199675', category: 'Productivity' },
        { name: 'Google Sheets', provider: 'Google', link: 'https://www.classcentral.com/course/google-sheets-199679', category: 'Productivity' },
        { name: 'Introduction to Large Language Models', provider: 'Google', link: 'https://www.classcentral.com/course/introduction-to-large-language-models-199879', category: 'AI' },

        { name: 'Inbound Sales', provider: 'HubSpot', link: 'https://www.classcentral.com/course/inbound-sales-66301', category: 'Business' },
        { name: 'Content Marketing', provider: 'HubSpot', link: 'https://www.classcentral.com/course/content-marketing-66297', category: 'Marketing' },
        { name: 'Email Marketing', provider: 'HubSpot', link: 'https://www.classcentral.com/course/hubspot-email-marketing-course-get-certified-in-email-marketing-98576', category: 'Marketing' },
        { name: 'Inbound Marketing', provider: 'HubSpot', link: 'https://www.classcentral.com/course/hubspot-inbound-marketing-course-98574', category: 'Marketing' },
        { name: 'Digital Marketing', provider: 'HubSpot', link: 'https://www.classcentral.com/course/digital-marketing-66243', category: 'Marketing' },
        { name: 'SEO Training', provider: 'HubSpot', link: 'https://www.classcentral.com/course/seo-training-66293', category: 'Marketing' },
        { name: 'Social Media Marketing', provider: 'HubSpot', link: 'https://www.classcentral.com/course/social-media-66291', category: 'Marketing' },
        { name: 'Digital Advertising', provider: 'HubSpot', link: 'https://www.classcentral.com/course/digital-advertising-66244', category: 'Marketing' },
        
        { name: 'CS50 Introduction to Computer Science', provider: 'Harvard', link: 'https://www.classcentral.com/course/edx-cs50-s-introduction-to-computer-science-442', category: 'CS' },
        { name: 'CS50 Web Programming with Python and JavaScript', provider: 'Harvard', link: 'https://www.classcentral.com/course/edx-cs50-s-web-programming-with-python-and-javascript-11506', category: 'CS' },
        { name: 'CS50 Computer Science for Business Professionals', provider: 'Harvard', link: 'https://www.classcentral.com/course/edx-cs50-s-computer-science-for-business-professionals-10143', category: 'Business' },
        { name: 'CS50 AI with Python', provider: 'Harvard', link: 'https://www.classcentral.com/course/edx-cs50-s-introduction-to-artificial-intelligence-with-python-18122', category: 'AI' },
        { name: 'CS50 Introduction to Programming with Python', provider: 'Harvard', link: 'https://www.classcentral.com/course/cs50s-introduction-to-programming-with-python-58275', category: 'CS' },
        { name: 'CS50 Computer Science for Lawyers', provider: 'Harvard', link: 'https://www.classcentral.com/course/edx-cs50-s-computer-science-for-lawyers-16857', category: 'CS' },
        { name: 'CS50 Introduction to Programming with R', provider: 'Harvard', link: 'https://www.classcentral.com/course/r-programming-harvard-university-cs50-s-introduct-274066', category: 'CS' },
        { name: 'CS50 Introduction to Databases with SQL', provider: 'Harvard', link: 'https://www.classcentral.com/course/sql-harvard-university-cs50-s-introduction-to-dat-152357', category: 'CS' },

        { name: 'Responsive Web Design', provider: 'freeCodeCamp', link: 'https://www.classcentral.com/course/freecodecamp-responsive-web-design-34059', category: 'Development' },
        { name: 'JavaScript Algorithms and Data Structures', provider: 'freeCodeCamp', link: 'https://www.classcentral.com/course/freecodecamp-javascript-algorithms-and-data-struc-34060', category: 'Development' },
        { name: 'Data Analysis with Python', provider: 'freeCodeCamp', link: 'https://www.classcentral.com/course/freecodecamp-data-analysis-with-python-34066', category: 'Data Science' },
        { name: 'Front End Development Libraries', provider: 'freeCodeCamp', link: 'https://www.classcentral.com/course/freecodecamp-front-end-libraries-34061', category: 'Development' },
        { name: 'Machine Learning with Python', provider: 'freeCodeCamp', link: 'https://www.classcentral.com/course/freecodecamp-machine-learning-with-python-34068', category: 'AI' },
        { name: 'Quality Assurance', provider: 'freeCodeCamp', link: 'https://www.classcentral.com/course/freecodecamp-quality-assurance-34064', category: 'Development' },
        { name: 'Information Security', provider: 'freeCodeCamp', link: 'https://www.classcentral.com/course/freecodecamp-information-security-34067', category: 'Security' },
        { name: 'Back End Development and APIs', provider: 'freeCodeCamp', link: 'https://www.classcentral.com/course/freecodecamp-back-end-development-and-apis-34063', category: 'Development' },
        { name: 'Data Visualization', provider: 'freeCodeCamp', link: 'https://www.classcentral.com/course/freecodecamp-data-visualization-34062', category: 'Data Science' },
        { name: 'Scientific Computing with Python', provider: 'freeCodeCamp', link: 'https://www.classcentral.com/course/freecodecamp-scientific-computing-with-python-34065', category: 'Development' },
        { name: 'Relational Database (Beta)', provider: 'freeCodeCamp', link: 'https://www.classcentral.com/course/freecodecamp-relational-database-91574', category: 'Development' },
        { name: 'College Algebra with Python', provider: 'freeCodeCamp', link: 'https://www.classcentral.com/course/freecodecamp-college-algebra-with-python-293804', category: 'Math' },
        { name: 'Foundational C# with Microsoft', provider: 'freeCodeCamp', link: 'https://www.classcentral.com/course/freecodecamp-foundational-c-sharp-with-microsoft-284467', category: 'Development' },

        { name: 'Become an AI-Powered Marketer', provider: 'Semrush', link: 'https://www.classcentral.com/course/ai-for-marketing-course-289814', category: 'Marketing' },
        { name: 'On-Page and Technical SEO Course', provider: 'Semrush', link: 'https://www.classcentral.com/course/semrush-on-page-and-technical-seo-course-62159', category: 'Marketing' },
        { name: 'How to Optimize for Mobile', provider: 'Semrush', link: 'https://www.classcentral.com/course/craft-of-mobile-seo-278241', category: 'Marketing' },

        { name: 'Programming Foundations with Python', provider: 'CodeSignal', link: 'https://www.classcentral.com/course/codesignal-programming-foundations-with-python-357794', category: 'CS' },
        { name: 'Four-Week Coding Interview Prep in Python', provider: 'CodeSignal', link: 'https://www.classcentral.com/course/codesignal-four-week-coding-interview-prep-in-python-361276', category: 'CS' },
        { name: 'Understanding LLMs and Basic Prompting', provider: 'CodeSignal', link: 'https://www.classcentral.com/course/codesignal-understanding-llms-and-basic-prompting-techniques-357769', category: 'AI' },
        { name: 'Introduction to HTML', provider: 'CodeSignal', link: 'https://www.classcentral.com/course/codesignal-introduction-to-html-357717', category: 'Development' },
        { name: 'JavaScript Programming for Beginners', provider: 'CodeSignal', link: 'https://www.classcentral.com/course/codesignal-javascript-programming-for-beginners-361232', category: 'Development' },
        { name: 'Getting Started with Java', provider: 'CodeSignal', link: 'https://www.classcentral.com/course/codesignal-getting-started-with-java-357726', category: 'Development' },
        { name: 'Learn to Code for Free', provider: 'CodeSignal', link: 'https://www.classcentral.com/provider/codesignal', category: 'CS' },

        { name: 'Python', provider: 'Kaggle', link: 'https://www.classcentral.com/course/python-74248', category: 'Data Science' },
        { name: 'Intro to SQL', provider: 'Kaggle', link: 'https://www.classcentral.com/course/intro-to-sql-74254', category: 'Data Science' },
        { name: 'Advanced SQL', provider: 'Kaggle', link: 'https://www.classcentral.com/course/advanced-sql-74255', category: 'Data Science' },
        { name: 'Intro to Deep Learning', provider: 'Kaggle', link: 'https://www.classcentral.com/course/intro-to-deep-learning-74256', category: 'AI' },
        { name: 'Data Cleaning', provider: 'Kaggle', link: 'https://www.classcentral.com/course/data-cleaning-74259', category: 'Data Science' },
        { name: 'Time Series', provider: 'Kaggle', link: 'https://www.classcentral.com/course/time-series-74258', category: 'Data Science' },
        { name: 'Intro to Machine Learning', provider: 'Kaggle', link: 'https://www.classcentral.com/course/intro-to-machine-learning-74249', category: 'AI' },
        { name: 'Pandas', provider: 'Kaggle', link: 'https://www.classcentral.com/course/pandas-74250', category: 'Data Science' },
        { name: 'Data Visualization', provider: 'Kaggle', link: 'https://www.classcentral.com/course/data-visualization-74252', category: 'Data Science' },
        { name: 'Intro to AI Ethics', provider: 'Kaggle', link: 'https://www.classcentral.com/course/intro-to-ai-ethics-74260', category: 'AI' },

        { name: 'MATLAB Onramp', provider: 'MATLAB', link: 'https://www.classcentral.com/course/matlab-onramp-94369', category: 'Engineering' },
        { name: 'Machine Learning Onramp', provider: 'MATLAB', link: 'https://www.classcentral.com/course/machine-learning-onramp-94372', category: 'AI' },
        { name: 'Reinforcement Learning Onramp', provider: 'MATLAB', link: 'https://www.classcentral.com/course/reinforcement-learning-onramp-94374', category: 'AI' },
        { name: 'Signal Processing Onramp', provider: 'MATLAB', link: 'https://www.classcentral.com/course/signal-processing-onramp-94376', category: 'Engineering' },
        { name: 'Simulink Onramp', provider: 'MATLAB', link: 'https://www.classcentral.com/course/simulink-onramp-94370', category: 'Engineering' },
        { name: 'Circuit Simulation Onramp', provider: 'MATLAB', link: 'https://www.classcentral.com/course/circuit-simulation-onramp-94371', category: 'Engineering' },
        { name: 'Image Processing Onramp', provider: 'MATLAB', link: 'https://www.classcentral.com/course/image-processing-onramp-94375', category: 'Engineering' },

        { name: 'Problem Solving (Basic)', provider: 'HackerRank', link: 'https://www.hackerrank.com/skills-verification/problem_solving_basic', category: 'CS' },

        { name: 'Introduction to IoT', provider: 'Cisco', link: 'https://www.classcentral.com/course/networking-academy-introduction-to-iot-97417', category: 'Networking' },
        { name: 'PCAP: Programming Essentials in Python', provider: 'Cisco', link: 'https://www.classcentral.com/course/networking-academy-pcap-programming-essentials-in-python-97421', category: 'CS' },
        { name: 'Computer Hardware Basics', provider: 'Cisco', link: 'https://www.netacad.com/courses/computer-hardware-basics', category: 'Hardware' },
        { name: 'Operating Systems Basics', provider: 'Cisco', link: 'https://www.netacad.com/courses/operating-systems-basics', category: 'OS' },

        { name: 'Full Interactive Course for Introduction to Wolfram Language', provider: 'Wolfram U', link: 'https://www.classcentral.com/course/wolfram-u-wolfram-language-an-elementary-introduction-to-the-wolfram-language-292967', category: 'CS' },
        { name: 'Quick Start to Wolfram Tech', provider: 'Wolfram U', link: 'https://www.classcentral.com/course/wolfram-u-wolfram-language-quick-start-wolfram-tech-wl101-292968', category: 'CS' },
        { name: 'Programming Fundamentals of Wolfram Language', provider: 'Wolfram U', link: 'https://www.classcentral.com/course/wolfram-u-programming-applications-programming-fundamentals-dev210-293003', category: 'CS' },
        { name: 'Introduction to Calculus', provider: 'Wolfram U', link: 'https://www.classcentral.com/course/wolfram-u-mathematics-introduction-to-calculus-292970', category: 'Math' },
        { name: 'Introduction to Discrete Mathematics', provider: 'Wolfram U', link: 'https://www.classcentral.com/course/wolfram-u-mathematics-introduction-to-discrete-mathematics-292977', category: 'Math' },

        { name: 'Introduction to Complexity', provider: 'Complexity Explorer', link: 'https://www.complexityexplorer.org/courses/185-introduction-to-complexity', category: 'Science' },
        { name: 'Introduction to Dynamical Systems and Chaos', provider: 'Complexity Explorer', link: 'https://www.complexityexplorer.org/courses/186-introduction-to-dynamical-systems-and-chaos', category: 'Science' },
        { name: 'Fractals and Scaling', provider: 'Complexity Explorer', link: 'https://www.complexityexplorer.org/courses/187-fractals-and-scaling', category: 'Science' },
        { name: 'Origins of Life', provider: 'Complexity Explorer', link: 'https://www.complexityexplorer.org/courses/170-origins-of-life', category: 'Science' },
        { name: 'Nonlinear Dynamics', provider: 'Complexity Explorer', link: 'https://www.complexityexplorer.org/courses/200-nonlinear-dynamics-mathematical-and-computational-approaches', category: 'Science' },

        { name: 'CS107: C++ Programming', provider: 'Saylor Academy', link: 'https://www.classcentral.com/course/saylor-academy-65-cs107-c-programming-99526', category: 'CS' },
        { name: 'CS201: Elementary Data Structures', provider: 'Saylor Academy', link: 'https://www.classcentral.com/course/saylor-academy-66-cs201-elementary-data-structure-99528', category: 'CS' },
        { name: 'PRDV304: Introduction to Supply Chain Management', provider: 'Saylor Academy', link: 'https://www.classcentral.com/course/saylor-academy-434-prdv304-introduction-to-supply-99624', category: 'Business' },
        { name: 'PRDV410: Introduction to Java and OOP', provider: 'Saylor Academy', link: 'https://www.classcentral.com/course/saylor-academy-448-prdv410-introduction-to-java-a-99625', category: 'CS' },

        { name: 'Accelerating Deep Learning with GPUs', provider: 'IBM', link: 'https://www.classcentral.com/course/cognitive-class-accelerating-deep-learning-with-gpus-118534', category: 'AI' },
        { name: 'Introduction to Open Source', provider: 'IBM', link: 'https://www.classcentral.com/course/cognitive-class-introduction-to-open-source-118537', category: 'CS' },
        { name: 'Text Analytics 101', provider: 'IBM', link: 'https://www.classcentral.com/course/cognitive-class-text-analytics-101-118546', category: 'Data Science' },
        { name: 'Applied Data Science with R', provider: 'IBM', link: 'https://cognitiveclass.ai/learn/data-science-r', category: 'Data Science' },
        { name: 'Big Data Foundations', provider: 'IBM', link: 'https://cognitiveclass.ai/learn/big-data', category: 'Data Science' },

        { name: 'Digital Skills: Digital Marketing', provider: 'FutureLearn', link: 'https://www.classcentral.com/course/digital-skills-digital-marketing-9778', category: 'Marketing' },
        { name: 'Digital Skills: Social Media', provider: 'FutureLearn', link: 'https://www.classcentral.com/course/digital-skills-social-media-9777', category: 'Marketing' },
        { name: 'Digital Skills: User Experience', provider: 'FutureLearn', link: 'https://www.classcentral.com/course/digital-skills-user-experience-9780', category: 'Design' },
        { name: 'Digital Skills: Artificial Intelligence', provider: 'FutureLearn', link: 'https://www.classcentral.com/course/artificial-intelligence-16995', category: 'AI' },
        { name: 'Introduction to Virtual, Augmented and Mixed Reality', provider: 'FutureLearn', link: 'https://www.classcentral.com/course/introduction-to-virtual-reality-20088', category: 'Tech' },

        { name: 'Programming with Python: Introduction for Beginners', provider: 'upGrad', link: 'https://www.upgrad.com/au/free-courses/data-science/programming-with-python-course-for-beginners-free/', category: 'CS' },
        { name: 'Introduction to Natural Language Processing', provider: 'upGrad', link: 'https://www.upgrad.com/au/free-courses/data-science/introduction-to-natural-language-processing-free-course/', category: 'AI' },
        { name: 'Introduction to Data Analysis using Excel', provider: 'upGrad', link: 'https://www.upgrad.com/au/free-courses/data-science/excel-for-data-analysis-course-free/', category: 'Data Science' },
        { name: 'Introduction to Database Design with MySQL', provider: 'upGrad', link: 'https://www.upgrad.com/au/free-courses/data-science/database-design-with-mysql-free-course/', category: 'CS' },
        { name: 'Data Science in E-commerce', provider: 'upGrad', link: 'https://www.upgrad.com/au/free-courses/data-science/data-science-for-e-commerce-free-course/', category: 'Data Science' },
        { name: 'Fundamentals of Deep Learning of Neural Networks', provider: 'upGrad', link: 'https://www.upgrad.com/au/free-courses/data-science/fundamentals-of-deep-learning-neural-networks-free-course/', category: 'AI' },

        { name: 'Principles of Economics: Macroeconomics', provider: 'Marginal Revolution University', link: 'https://www.classcentral.com/course/mru-principles-of-economics-macroeconomics-98199', category: 'Business' },
        { name: 'Development Economics', provider: 'Marginal Revolution University', link: 'https://www.classcentral.com/course/mru-development-economics-98206', category: 'Business' },
        { name: 'International Trade', provider: 'Marginal Revolution University', link: 'https://www.classcentral.com/course/mru-international-trade-98256', category: 'Business' },

        { name: 'Effective Business Writing', provider: 'Santander Open Academy', link: 'https://www.santanderopenacademy.com/en/courses/effective-business-writing.html', category: 'Business' },
        { name: 'Introduction to Generative AI', provider: 'Santander Open Academy', link: 'https://www.santanderopenacademy.com/en/courses/generative-artificial-intelligence.html', category: 'AI' },
        { name: 'Cloud Computing Course', provider: 'Santander Open Academy', link: 'https://www.santanderopenacademy.com/en/courses/cloud.html', category: 'Tech' },
        { name: 'Strategic Communication & Teamwork', provider: 'Santander Open Academy', link: 'https://www.santanderopenacademy.com/en/courses/strategic-communication-teamwork.html', category: 'Business' },
        { name: 'Mindfulness & Work-life balance', provider: 'Santander Open Academy', link: 'https://www.santanderopenacademy.com/en/courses/mindfulness.html', category: 'Health' },
        { name: 'Marketing Automation Fundamentals', provider: 'Santander Open Academy', link: 'https://www.santanderopenacademy.com/en/courses/marketing-automation.html', category: 'Marketing' },
        { name: 'Business English', provider: 'Santander Open Academy', link: 'https://www.santanderopenacademy.com/en/courses/business-english-listening-communication-skills-1.html', category: 'Language' },

        { name: 'Understanding Embeddings for NLP', provider: 'openHPI', link: 'https://open.hpi.de/courses/embeddingsfornlp-kisz2023', category: 'AI' },

        { name: 'International trade in fisheries', provider: 'FAO elearning Academy', link: 'https://elearning.fao.org/course/view.php?id=949', category: 'Agriculture' },
        { name: 'Pathway to aquaculture biosecurity', provider: 'FAO elearning Academy', link: 'https://elearning.fao.org/course/view.php?id=979', category: 'Agriculture' },
        { name: 'Gender-responsive policy', provider: 'FAO elearning Academy', link: 'https://elearning.fao.org/course/view.php?id=968', category: 'Agriculture' },
        { name: 'Maintenance of agricultural equipment', provider: 'FAO elearning Academy', link: 'https://elearning.fao.org/course/view.php?id=780', category: 'Agriculture' },
        { name: 'Farmer Field School Programmes', provider: 'FAO elearning Academy', link: 'https://elearning.fao.org/course/view.php?id=776', category: 'Agriculture' },

        { name: 'Branding 101', provider: 'PhilanthropyU', link: 'https://www.classcentral.com/course/independent-branding-101-21019', category: 'Marketing' },
        { name: 'Fundraising: Connecting with Donors', provider: 'PhilanthropyU', link: 'https://courses.philanthropyu.org/courses/course-v1:PhilanthropyU+Fundraising_201+13_2.4_20191223_ondemand/about', category: 'Business' },
        { name: 'Creating a Theory of Change', provider: 'PhilanthropyU', link: 'https://courses.philanthropyu.org/courses/course-v1:PhilanthropyU+TheoryChange_101+3_2.4_20191223_ondemand/about', category: 'Business' },
        { name: 'Developing an Operating Budget', provider: 'PhilanthropyU', link: 'https://courses.philanthropyu.org/courses/course-v1:PhilanthropyU+Budget_000+4_3.11_20200717_ondemand/about', category: 'Business' },

        { name: 'Systems Practice', provider: 'Acumen Academy', link: 'https://www.classcentral.com/course/acumen-academy-systems-practice-8853', category: 'Business' },
        { name: 'Lean Data Approaches to Measure Social Impact', provider: 'Acumen Academy', link: 'https://www.classcentral.com/course/acumen-academy-lean-data-approaches-to-measure-social-impact-3146', category: 'Business' },
        { name: 'Human-Centered Design 201: Prototyping', provider: 'Acumen Academy', link: 'https://www.classcentral.com/course/acumen-academy-human-centered-design-201-prototyping-4789', category: 'Design' },
        { name: 'Designing for Environmental Sustainability', provider: 'Acumen Academy', link: 'https://www.classcentral.com/course/acumen-academy-designing-for-environmental-sustainability-and-social-impact-12310', category: 'Environment' },

        { name: 'A Practical Introduction to Cloud Computing', provider: 'EC-Council', link: 'https://codered.eccouncil.org/course/a-practical-introduction-to-cloud-computing', category: 'Cloud' },
        { name: 'Cybersecurity for Businesses', provider: 'EC-Council', link: 'https://codered.eccouncil.org/course/cybersecurity-for-businesses-the-fundamental-edition', category: 'Security' },
        { name: 'Android Bug Bounty Hunting', provider: 'EC-Council', link: 'https://codered.eccouncil.org/course/android-bug-bounty-hunting-hunt-like-a-rat', category: 'Security' },
        { name: 'Introduction to Dark Web', provider: 'EC-Council', link: 'https://codered.eccouncil.org/course/introduction-to-dark-web-anonymity-and-cryptocurrency', category: 'Security' },
        { name: 'SQL Injection Attacks', provider: 'EC-Council', link: 'https://codered.eccouncil.org/course/sql-injection-attacks', category: 'Security' },
        { name: 'Configure Juniper SRX Router', provider: 'EC-Council', link: 'https://codered.eccouncil.org/course/configure-juniper-srx-router-using-j-web', category: 'Networking' },
        { name: 'Introduction to SAN and NAS Storage', provider: 'EC-Council', link: 'https://codered.eccouncil.org/course/introduction-to-san-and-nas-storage', category: 'IT' },
        { name: 'Cisco LABS Crash Course', provider: 'EC-Council', link: 'https://codered.eccouncil.org/course/cisco-labs-crash-course', category: 'Networking' },
        { name: 'Build Your Own NetApp Storage Lab', provider: 'EC-Council', link: 'https://codered.eccouncil.org/course/build-your-own-netapp-storage-lab-for-free', category: 'IT' },

        { name: 'Meta Certified Digital Marketing Associate', provider: 'Meta', link: 'https://www.facebook.com/business/learn/certification/exams/100-101-exam', category: 'Marketing' },
        { name: 'Boost Your Marketing With Facebook Pixel', provider: 'Meta', link: 'https://www.facebookblueprint.com/student at IIT ROPAR/path/189425-boost-your-marketing-with-facebook-pixel', category: 'Marketing' },

        { name: 'Model Context Protocol (MCP)', provider: 'Hugging Face', link: 'https://huggingface.co/learn/mcp-course/unit0/introduction', category: 'AI' },
        { name: 'AI Agents', provider: 'Hugging Face', link: 'https://huggingface.co/learn/agents-course/unit0/introduction', category: 'AI' },
        { name: 'Deep Reinforcement Learning', provider: 'Hugging Face', link: 'https://huggingface.co/learn/deep-rl-course/unit0/introduction', category: 'AI' },
        { name: 'Community Computer Vision', provider: 'Hugging Face', link: 'https://huggingface.co/learn/computer-vision-course/unit0/welcome/welcome', category: 'AI' },
        { name: 'Audio', provider: 'Hugging Face', link: 'https://huggingface.co/learn/audio-course/chapter0/introduction', category: 'AI' },

        { name: 'CV Writing', provider: 'Edraak', link: 'https://www.edraak.org/courses/', category: 'Career' },
        { name: 'Introduction to alternative energy', provider: 'Edraak', link: 'https://www.edraak.org/programs/course-v1:zuj+APR101+T1_2021/', category: 'Environment' },
        { name: 'Sustainable energy sources', provider: 'Edraak', link: 'https://www.edraak.org/programs/course-v1:UCL+RE101+2020_T3/', category: 'Environment' },
        { name: 'Advanced Excel skills', provider: 'Edraak', link: 'https://www.edraak.org/programs/course-v1:Edraak+AE101+SP-2019/', category: 'Data Science' },
        { name: 'Introduction to networks', provider: 'Edraak', link: 'https://www.edraak.org/programs/course-v1:Edraak+IN101+T3-2020/', category: 'Networking' },
        { name: 'Basic technical skills', provider: 'Edraak', link: 'https://www.edraak.org/programs/course-v1:Microsoft+MDL101+2020_T2/', category: 'Tech' },
        { name: 'Introduction to Computer Science', provider: 'Edraak', link: 'https://www.edraak.org/programs/course-v1:edraak+CS50+T2_2020/', category: 'CS' },
        { name: 'Office 365', provider: 'Edraak', link: 'https://www.edraak.org/programs/course-v1:Microsoft+MS365+2020_T2/', category: 'Productivity' },
        { name: 'Robotics industry', provider: 'Edraak', link: 'https://www.edraak.org/programs/course-v1:edraak+RM100+2019SP/', category: 'Engineering' },
        { name: 'Agile Methodology', provider: 'Edraak', link: 'https://www.edraak.org/programs/course-v1:edraak+Agile101+T1_2020/', category: 'Business' },
        { name: 'Electronic games design', provider: 'Edraak', link: 'https://www.edraak.org/programs/course-v1:Edraak+GD101+2019_R1/', category: 'Design' },
        { name: 'Programming iPhone applications', provider: 'Edraak', link: 'https://www.edraak.org/programs/course-v1:Edraak+IP101+SP-2019/', category: 'Development' },
        { name: 'Building websites with WordPress', provider: 'Edraak', link: 'https://www.edraak.org/programs/course-v1:Edraak+WordPress101+SP-2019/', category: 'Development' },
        { name: 'Neurosciences in daily life', provider: 'Edraak', link: 'https://www.edraak.org/programs/course-v1:Edraak+NEL+2019_T3/', category: 'Science' },
        { name: 'Introduction to drinking water treatment', provider: 'Edraak', link: 'https://www.edraak.org/programs/course-v1:DelftX+DW102+T2_2019/', category: 'Engineering' },

        { name: 'Intelligenza Artificiale', provider: 'University of Urbino', link: 'https://www.classcentral.com/course/urbino-intelligenza-artificiale-97425', category: 'AI' },
        { name: 'Coding per genitori', provider: 'University of Urbino', link: 'https://www.classcentral.com/course/urbino-coding-per-genitori-97427', category: 'CS' },
        { name: 'Umano digitale', provider: 'University of Urbino', link: 'https://www.classcentral.com/course/urbino-umano-digitale-97450', category: 'Social Science' },
        { name: 'Uniurb 4 High School', provider: 'University of Urbino', link: 'https://www.classcentral.com/course/urbino-uniurb-4-high-school-97451', category: 'Education' },
        { name: 'Laboratorio di Comunicazione Interculturale', provider: 'University of Urbino', link: 'https://www.classcentral.com/course/urbino-laboratorio-di-comunicazione-interculturale-per-la-scuola-97426', category: 'Communication' },
        { name: 'Piattaforme digitali', provider: 'University of Urbino', link: 'https://www.classcentral.com/course/urbino-piattaforme-digitali-per-la-gestione-del-territorio-97428', category: 'Tech' },

        { name: 'Fire Safety Management', provider: 'ITCILO', link: 'https://www.itcilo.org/courses/fire-safety-management', category: 'Safety' },
        { name: 'Future of Work in Rural Economy', provider: 'ITCILO', link: 'https://www.itcilo.org/courses/future-work-rural-economy', category: 'Economics' },
        { name: 'Rural Economic Empowerment', provider: 'ITCILO', link: 'https://www.itcilo.org/courses/training-rural-economic-empowerment', category: 'Economics' },
        { name: 'Fair Recruitment Processes', provider: 'ITCILO', link: 'https://www.itcilo.org/courses/training-toolkit-establishing-fair-recruitment-processes', category: 'HR' },
        { name: 'Igualdad salarial', provider: 'ITCILO', link: 'https://www.itcilo.org/courses/igualdad-salarial-el-enfoque-de-la-oit', category: 'HR' },
        { name: 'Fire Safety Inspection', provider: 'ITCILO', link: 'https://www.itcilo.org/courses/essentials-fire-safety-inspection', category: 'Safety' },

        { name: 'Virtuelle Hochschule Bayern - Flourishing Together', provider: 'Virtuelle Hochschule Bayern', link: 'https://open.vhb.org/blocks/occoursemetaselect/detailpage.php?id=348', category: 'Health' },
        { name: 'Introduction to Academic Research', provider: 'Virtuelle Hochschule Bayern', link: 'https://open.vhb.org/blocks/occoursemetaselect/detailpage.php?id=339', category: 'Education' },
        { name: 'Principles of Fintech Business Models', provider: 'Virtuelle Hochschule Bayern', link: 'https://open.vhb.org/blocks/occoursemetaselect/detailpage.php?id=312', category: 'Finance' },
        { name: 'Building Confidence in Statistics', provider: 'Virtuelle Hochschule Bayern', link: 'https://open.vhb.org/blocks/occoursemetaselect/detailpage.php?id=323', category: 'Math' },

        { name: 'Watershed Management Training', provider: 'Watershed Academy', link: 'https://www.epa.gov/watershedacademy/watershed-academy-web-training-certificate', category: 'Environment' },
        { name: 'Global Campus of Human Rights Course', provider: 'Global Campus of Human Rights', link: 'https://elearning.gchumanrights.org/courses/course-v1:gchumanrights+pphr+2020/', category: 'Law' },

        { name: 'Human Skills (CPR/AED/First Aid)', provider: 'Save A Life by NHCPS', link: 'https://nhcps.com/course/cpr-aed-first-aid-certification-course/', category: 'Health' },
        { name: 'Advanced Cardiac Life Support (ACLS)', provider: 'Save A Life by NHCPS', link: 'https://nhcps.com/course/acls-advanced-cardiac-life-support-certification-course/', category: 'Health' },
        { name: 'Pediatric Advanced Life Support (PALS)', provider: 'Save A Life by NHCPS', link: 'https://nhcps.com/course/pals-pediatric-advanced-life-support-certification-course/', category: 'Health' },
        { name: 'Basic Life Support (BLS)', provider: 'Save A Life by NHCPS', link: 'https://nhcps.com/course/bls-basic-life-support-certification-course/', category: 'Health' },
        { name: 'Bloodborne Pathogens', provider: 'Save A Life by NHCPS', link: 'https://nhcps.com/course/bloodborne-pathogens-certification-course/', category: 'Health' }
    ];

    const [filter, setFilter] = useState('');
    const [category, setCategory] = useState('All');

    // 1. Filter certificates first
    const filtered = allCertificates.filter(c => {
        const matchesName = c.name.toLowerCase().includes(filter.toLowerCase()) || c.provider.toLowerCase().includes(filter.toLowerCase());
        const matchesCat = category === 'All' || c.category === category;
        return matchesName && matchesCat;
    });

    // 2. Group by Provider and Sort Providers Alphabetically
    const grouped = useMemo(() => {
        const groups: Record<string, typeof allCertificates> = {};
        filtered.forEach(cert => {
            if (!groups[cert.provider]) groups[cert.provider] = [];
            groups[cert.provider].push(cert);
        });
        
        // Sort keys alphabetically
        const sortedKeys = Object.keys(groups).sort((a, b) => a.localeCompare(b));
        
        return sortedKeys.map(provider => ({
            provider,
            certificates: groups[provider]
        }));
    }, [filtered]);

    // Use local logos from /public/logo first, then fall back to known remote provider logos.
    const getFallbackLogo = (provider: string) => {
        if (provider.includes('Google')) return 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Google_2015_logo.svg/368px-Google_2015_logo.svg.png';
        if (provider.includes('HubSpot')) return 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/HubSpot_Logo.svg/2560px-HubSpot_Logo.svg.png';
        if (provider.includes('Harvard')) return 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/25/Harvard_University_shield.png/1200px-Harvard_University_shield.png';
        if (provider.includes('freeCodeCamp')) return 'https://design-style-guide.freecodecamp.org/downloads/fcc_secondary_small.svg';
        if (provider.includes('IBM')) return 'https://upload.wikimedia.org/wikipedia/commons/5/51/IBM_logo.svg';
        if (provider.includes('Meta') || provider.includes('Facebook')) return 'https://upload.wikimedia.org/wikipedia/commons/7/7b/Meta_Platforms_Inc._logo.svg';
        if (provider.includes('Cisco')) return 'https://upload.wikimedia.org/wikipedia/commons/6/64/Cisco_logo.svg';
        if (provider.includes('MATLAB')) return 'https://upload.wikimedia.org/wikipedia/commons/2/21/Matlab_Logo.png';
        if (provider.includes('Kaggle')) return 'https://upload.wikimedia.org/wikipedia/commons/7/7c/Kaggle_logo.png';
        if (provider.includes('AWS')) return 'https://upload.wikimedia.org/wikipedia/commons/9/93/Amazon_Web_Services_Logo.svg';
        if (provider.includes('Semrush')) return 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Semrush_logo.svg/2560px-Semrush_logo.svg.png';
        if (provider.includes('CodeSignal')) return 'https://upload.wikimedia.org/wikipedia/commons/e/ee/CodeSignal_Logo.png';
        if (provider.includes('HackerRank')) return 'https://upload.wikimedia.org/wikipedia/commons/4/40/HackerRank_Icon-1000px.png';
        if (provider.includes('Wolfram')) return 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Wolfram_Research_logo.svg/2560px-Wolfram_Research_logo.svg.png';
        if (provider.includes('Complexity')) return 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/Santa_Fe_Institute_logo.svg/1200px-Santa_Fe_Institute_logo.svg.png';
        if (provider.includes('Saylor')) return 'https://upload.wikimedia.org/wikipedia/en/thumb/8/8e/Saylor_Academy_logo.png/220px-Saylor_Academy_logo.png';
        if (provider.includes('FutureLearn')) return 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/FutureLearn_Logo.svg/2560px-FutureLearn_Logo.svg.png';
        if (provider.includes('upGrad')) return 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/UpGrad_Logo.png/1200px-UpGrad_Logo.png';
        if (provider.includes('Hugging Face')) return 'https://huggingface.co/front/assets/huggingface_logo-noborder.svg';
        if (provider.includes('Marginal Revolution')) return 'https://mru.org/sites/default/files/mru-logo.png';
        if (provider.includes('Santander')) return 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/Banco_Santander_Logotipo.svg/2560px-Banco_Santander_Logotipo.svg.png';
        if (provider.includes('FAO')) return 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Flag_of_the_Food_and_Agriculture_Organization.svg/2560px-Flag_of_the_Food_and_Agriculture_Organization.svg.png';
        if (provider.includes('EC-Council')) return 'https://upload.wikimedia.org/wikipedia/commons/e/e0/EC-Council_logo.png';
        if (provider.includes('Edraak')) return 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Edraak_Logo.png/1200px-Edraak_Logo.png';
        if (provider.includes('ITCILO')) return 'https://www.itcilo.org/themes/custom/itcilo_theme/logo.svg';
        if (provider.includes('Urbino')) return 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Uniurb-logo.png/1200px-Uniurb-logo.png';
        return 'https://via.placeholder.com/100x50?text=' + provider.charAt(0);
    };

    const getLogoCandidates = (provider: string) => {
        // Provider to filename mapping for local logos
        const providerLogoMap: Record<string, string[]> = {
            'Acumen Academy': ['Acumen.png'],
            'EC-Council': ['ec council.png'],
            'Edraak': ['edraak.png'],
            'FAO elearning Academy': ['FAO.png'],
            'Global Campus of Human Rights': ['Global campus.png'],
            'Google': ['google.png'],
            'ITCILO': ['itcilo.png'],
            'Marginal Revolution University': ['mru.png'],
            'Santander Open Academy': ['Santander.png'],
            'Save A Life by NHCPS': ['save a life.png'],
            'University of Urbino': ['university of urbino.png'],
            'Virtuelle Hochschule Bayern': ['virtuelle.png'],
            'Watershed Academy': ['watershed.png'],
        };

        // First check for direct mapping
        if (providerLogoMap[provider]) {
            return providerLogoMap[provider].map(name => `/logo/${name}`);
        }

        // Fallback to normalized format
        const normalized = provider.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
        return [
            `/logo/${normalized}.png`,
            `/logo/${normalized}.jpg`,
            `/logo/${normalized}.jpeg`,
            `/logo/${normalized}.webp`
        ];
    };

    return (
        <div className="certificates-modal-overlay">
            <div className="certificates-modal-content">
                <div className="cert-header-sticky">
                    <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1rem'}}>
                        <h2>Free Certification Programs</h2>
                        <button className="close-btn" onClick={onClose} style={{fontSize:'1.5rem'}}>&times;</button>
                    </div>
                    <div className="cert-controls">
                        <input 
                            type="text" 
                            placeholder="Search certificates..." 
                            value={filter} 
                            onChange={e => setFilter(e.target.value)} 
                            className="cert-search-bar"
                        />
                        <select value={category} onChange={e => setCategory(e.target.value)} className="cert-cat-select">
                            <option value="All">All Categories</option>
                            <option value="Marketing">Marketing</option>
                            <option value="CS">Computer Science</option>
                            <option value="AI">AI & Machine Learning</option>
                            <option value="Data Science">Data Science</option>
                            <option value="Development">Development</option>
                            <option value="Security">Security</option>
                            <option value="Business">Business</option>
                        </select>
                    </div>
                </div>
                
                <div className="cert-list-container">
                    {grouped.map((group, groupIdx) => (
                        <div key={groupIdx} className="cert-provider-group">
                            <div className="cert-provider-header">
                                <img
                                    src={getLogoCandidates(group.provider)[0]}
                                    alt={group.provider}
                                    className="provider-header-logo"
                                    draggable={false}
                                    onDragStart={preventImageDrag}
                                    onError={(e) => {
                                        const img = e.currentTarget;
                                        const candidates = getLogoCandidates(group.provider);
                                        const currentIdx = Number(img.dataset.localLogoIndex || '0');
                                        const nextIdx = currentIdx + 1;
                                        if (nextIdx < candidates.length) {
                                            img.dataset.localLogoIndex = String(nextIdx);
                                            img.src = candidates[nextIdx];
                                            return;
                                        }
                                        const fallback = getFallbackLogo(group.provider);
                                        if (!img.dataset.remoteFallbackTried) {
                                            img.dataset.remoteFallbackTried = '1';
                                            img.src = fallback;
                                            return;
                                        }
                                        img.onerror = null;
                                        img.src = 'https://via.placeholder.com/100x50?text=' + group.provider.charAt(0);
                                    }}
                                />
                                <h3>{group.provider}</h3>
                                <div className="provider-line"></div>
                            </div>
                            <div className="cert-provider-grid">
                                {group.certificates.map((cert, idx) => (
                                    <a key={idx} href={cert.link} target="_blank" rel="noopener noreferrer" className="cert-card-pop">
                                        <div className="cert-card-top">
                                            <span className="cert-cat-badge">{cert.category}</span>
                                        </div>
                                        <h3 className="cert-card-title">{cert.name}</h3>
                                        <div className="cert-card-footer">
                                            <span className="open-icon">Visit Course ↗</span>
                                        </div>
                                    </a>
                                ))}
                            </div>
                        </div>
                    ))}
                    
                    {grouped.length === 0 && (
                        <p style={{textAlign:'center', padding:'2rem', color:'#666'}}>No certificates found matching your search.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

// --- ALUMNI NETWORKING MODAL ---
const AlumniNetworkingModal = ({ onClose, userRole }: { onClose: () => void, userRole?: 'admin' | 'public' | null }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    
    // API Configuration State (do not default to seeded keys; keep empty until configured)
    const [apiKey, setApiKey] = useState(() => getSectionApiKey('ALUMNI') || '');
    const [cx, setCx] = useState(() => getSectionCx('ALUMNI') || '');
    const [showConfig, setShowConfig] = useState(false);

    // Save config
    const saveConfig = () => {
        try { localStorage.setItem('GOOGLE_SEARCH_KEY_ALUMNI', apiKey); localStorage.setItem('GOOGLE_SEARCH_CX_ALUMNI', cx); } catch (e) {}
        setShowConfig(false);
    };

    // Helper: Extract Person Name logic ported from simple_multi_search.ts
    const extractPersonName = (title: string, link: string, snippet: string) => {
        let name = "N/A";
        // Clean title logic
        if (title && link && link.toLowerCase().includes("linkedin")) {
            let cleanTitle = title.replace(/\s*-\s*LinkedIn.*$/i, "");
            cleanTitle = cleanTitle.replace(/\s*\|\s*LinkedIn.*$/i, "");
            cleanTitle = cleanTitle.replace(/\s*on LinkedIn.*$/i, "");
            cleanTitle = cleanTitle.replace(/\s*-.*(?:at|@|,).*$/, "");
            cleanTitle = cleanTitle.replace(/\s*\|.*$/, "");

            if (cleanTitle.trim() && cleanTitle.trim().length > 2) {
                name = cleanTitle.trim();
            }
        }
        // Fallback to URL parsing
        if (name === "N/A" && link && link.includes("/in/")) {
            try {
                const urlName = link.split("/in/").pop()?.split("/")[0].split("?")[0] ?? "";
                if (urlName && urlName !== "") {
                    const formattedName = urlName.replace(/-/g, " ").replace(/\+/g, " ").replace(/%20/g, " ").replace(/\s+/g, " ").trim();
                    const titled = formattedName.split(" ").map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(" ");
                    if (titled.split(/\s+/).length >= 2) {
                        name = titled;
                    }
                }
            } catch { /* ignore */ }
        }
        return name;
    };

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;
        if (!apiKey || !cx) {
            alert("Please configure Google API Key and Search Engine ID (CX) first.");
            setShowConfig(true);
            return;
        }

        setLoading(true);
        // Construct the query: site:linkedin.com/in ("IIT Ropar" OR "Indian Institute of Technology Ropar") {company}
        const institution = '("IIT Ropar" OR "Indian Institute of Technology Ropar")';
        const finalQuery = `site:linkedin.com/in ${institution} "${query.trim()}"`;

        try {
            const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cx}&q=${encodeURIComponent(finalQuery)}&num=10`;
            const res = await fetch(url);
            const data = await res.json();

            if (data.items) {
                const processed = data.items.map((item: any) => ({
                    title: item.title,
                    link: item.link,
                    snippet: item.snippet,
                    name: extractPersonName(item.title, item.link, item.snippet),
                    photo: item.pagemap?.cse_image?.[0]?.src || '/photos/team.png'
                }));
                setResults(processed);
            } else {
                setResults([]);
            }
        } catch (error) {
            console.error("Search failed", error);
            alert("Search failed. Check your API Key/CX or quota.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="certificates-modal-overlay">
            <div className="certificates-modal-content alumni-modal-content">
                <div className="cert-header-sticky">
                    <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1rem'}}>
                        <h2>Alumni Networking</h2>
                        <div style={{display:'flex', gap:'10px', alignItems:'center'}}>
                            {userRole === 'admin' && (
                                <button onClick={() => setShowConfig(!showConfig)} className="secondary-btn" style={{fontSize:'0.8rem'}}>⚙ Settings</button>
                            )}
                            <button className="close-btn" onClick={onClose} style={{fontSize:'1.5rem'}}>&times;</button>
                        </div>
                    </div>

                    {showConfig && (
                        <div className="api-config-section">
                            <input placeholder="Google API Key" value={apiKey} onChange={e => setApiKey(e.target.value)} type="password" />
                            <input placeholder="Search Engine ID (CX)" value={cx} onChange={e => setCx(e.target.value)} />
                            <button onClick={saveConfig} className="save-config-btn" style={{width:'auto', padding:'0.5rem 1rem'}}>Save</button>
                        </div>
                    )}

                    <form onSubmit={handleSearch} className="alumni-search-container">
                        <input 
                            type="text" 
                            placeholder="Enter Company Name (e.g. Google, Microsoft)..." 
                            value={query} 
                            onChange={e => setQuery(e.target.value)} 
                            className="cert-search-bar"
                        />
                        <button type="submit" className="add-btn" disabled={loading}>
                            {loading ? 'Searching...' : 'Find Alumni'}
                        </button>
                    </form>
                </div>
                
                <div className="cert-list-container">
                    {results.length > 0 ? (
                        <div className="alumni-results-grid">
                            {results.map((profile, idx) => (
                                <div key={idx} className="alumni-card">
                                    <div className="alumni-card-header">
                                        <img src={profile.photo} alt={profile.name} className="alumni-avatar" draggable={false} onDragStart={preventImageDrag} onError={(e) => (e.target as HTMLImageElement).src = 'https://via.placeholder.com/60'} />
                                        <div className="alumni-info">
                                            <h4>{profile.name}</h4>
                                            <span>IIT Ropar Alumni</span>
                                        </div>
                                    </div>
                                    <div className="alumni-details">
                                        <p style={{fontSize:'0.85rem', color:'#555', margin:0, display:'-webkit-box', WebkitLineClamp:3, WebkitBoxOrient:'vertical', overflow:'hidden'}}>
                                            {profile.snippet}
                                        </p>
                                    </div>
                                    <a href={profile.link} target="_blank" rel="noopener noreferrer" className="alumni-connect-btn" style={{display:'block', textAlign:'center', textDecoration:'none'}}>
                                        Connect on LinkedIn
                                    </a>
                                </div>
                            ))}
                        </div>
                    ) : (
                        !loading && (
                            <div style={{textAlign:'center', marginTop:'3rem', color:'#888'}}>
                                <p>Enter a company name to find IIT Ropar alumni working there.</p>
                                <p style={{fontSize:'0.8rem'}}>Requires valid Google Custom Search API Key & CX.</p>
                            </div>
                        )
                    )}
                </div>
            </div>
        </div>
    );
};

// --- QUIZZES MODAL ---
// PDF viewer that attempts to locate a syllabus PDF for a given GATE branch code
const PDFViewer = ({ code }: { code: string }) => {
    const [src, setSrc] = useState<string | null>(null);
    const [loadingPdf, setLoadingPdf] = useState(true);
    const [notFound, setNotFound] = useState(false);

    useEffect(() => {
        let mounted = true;
        const tryPaths = async () => {
            setLoadingPdf(true);
            setNotFound(false);
            setSrc(null);

            // Support two common layouts:
            // 1) per-code folders: /syllabus/AE/AE_2026_Syllabus.pdf
            // 2) single syllabus folder with files named by code: /syllabus/AE_2026_Syllabus.pdf
            const candidates = [
                // single-folder filenames (project-root or public/syllabus)
                `${window.location.origin}/syllabus/${code}_2026_Syllabus.pdf`,
                `${window.location.origin}/syllabus/${code}_2025_Syllabus.pdf`,
                `${window.location.origin}/syllabus/${code}_Syllabus.pdf`,
                `${window.location.origin}/syllabus/${code}.pdf`,
                `${window.location.origin}/syllabus/${code}_2026.pdf`,
                // per-code folder layout
                `${window.location.origin}/syllabus/${code}/${code}_2026_Syllabus.pdf`,
                `${window.location.origin}/syllabus/${code}/${code}_2025_Syllabus.pdf`,
                `${window.location.origin}/syllabus/${code}/${code}_Syllabus.pdf`,
                `${window.location.origin}/syllabus/${code}/${code}.pdf`,
                `${window.location.origin}/syllabus/${code}/${code}_2026.pdf`
            ];

            for (const url of candidates) {
                try {
                    // Try a HEAD request to see if file exists
                    const res = await fetch(url, { method: 'HEAD' });
                    if (!mounted) return;
                    if (res.ok) {
                        setSrc(url);
                        setLoadingPdf(false);
                        return;
                    }
                } catch (e) {
                    // ignore and try next
                }
            }

            if (mounted) {
                setLoadingPdf(false);
                setNotFound(true);
            }
        };

        tryPaths();
        return () => { mounted = false; };
    }, [code]);

    if (loadingPdf) return <div className="pdf-loading">Checking for syllabus PDF for {code}…</div>;
    if (src) return (
        <div className="pdf-viewer-card">
            <div className="pdf-gutter" aria-hidden="true" />
            <div className="pdf-content">
                <div className="pdf-toolbar">
                    <div className="pdf-title">{selectedGateBranchName(code)}</div>
                    <div className="pdf-actions">
                        <a href={src} target="_blank" rel="noopener noreferrer" className="pdf-open-link">Open PDF in new tab</a>
                    </div>
                </div>
                <div className="pdf-frame-wrapper">
                    <iframe src={src} title={`Syllabus ${code}`} className="pdf-frame" />
                </div>
            </div>
        </div>
    );

    return (
        <div className="pdf-notfound">
            <p>No syllabus PDF found for <strong>{code}</strong> in the expected locations.</p>
            <p>Supported locations (choose one):</p>
            <ul>
                <li><code>public/syllabus/{code}/{code}_2026_Syllabus.pdf</code> (per-code folder)</li>
                <li><code>public/syllabus/{code}_2026_Syllabus.pdf</code> (single syllabus folder)</li>
                <li>If you serve static files from the project root, you can also place files at <code>./syllabus/{code}_2026_Syllabus.pdf</code></li>
            </ul>
            <p>If you already placed the file, ensure your dev/build server serves files from the <code>/syllabus</code> path. You can also <a href={`/syllabus/${code}/`} target="_blank" rel="noopener noreferrer">open the folder URL</a> to inspect files (if directory listing is enabled).</p>
        </div>
    );
};

// helper to map code to a nicer title shown in the PDF toolbar
const selectedGateBranchName = (code: string) => {
    const map: { [k: string]: string } = {
        AE: 'Aerospace Engineering', AG: 'Agricultural Engineering', AR: 'Architecture', BM: 'Biomedical Engineering',
        BT: 'Biotechnology', CE: 'Civil Engineering', CH: 'Chemical Engineering', CS: 'Computer Science',
        EC: 'Electronics & Communication', EE: 'Electrical Engineering', EN: 'Engineering Sciences',
        ES: 'Energy Science', EY: 'Environmental Science', MA: 'Mathematics', ME: 'Mechanical Engineering',
        MT: 'Metallurgical Engineering', MN: 'Mining Engineering', PH: 'Physics', ST: 'Statistics', XE: 'XE Combined'
    };
    return map[code] || code;
};

// GATE LECTURE RESOURCES
const GATE_LECTURES: Record<string, Array<{ name: string; desc: string; link: string }>> = {
    AE: [
        { name: "GATE Aerospace – IGC", desc: "GATE AE crash courses, aerodynamics, paper discussions", link: "https://www.youtube.com/results?search_query=GATE+Aerospace+IGC" },
        { name: "Goodwill Gate2IIT – GATE Aerospace", desc: "Full AE lecture series, aircraft structures, PYQs", link: "https://www.youtube.com/results?search_query=Goodwill+Gate2IIT+GATE+Aerospace" },
        { name: "ACE Engineering Academy", desc: "General GATE strategy + some AE support", link: "https://www.youtube.com/results?search_query=ACE+Engineering+Academy+GATE+Aerospace" },
        { name: "GATE Academy", desc: "General GATE; useful for maths/aptitude for AE", link: "https://www.youtube.com/results?search_query=GATE+Academy+Aerospace" }
    ],
    PI: [
        { name: "GATE Wallah – ME, CE, XE, CH, PI & ES", desc: "Mechanics, manufacturing, industrial topics; many one‑shots", link: "https://www.youtube.com/results?search_query=GATE+Wallah+Production+Industrial+One+Shot" },
        { name: "Exergic – GATE ME, XE", desc: "Strong ME/production concepts and problem practice", link: "https://www.youtube.com/results?search_query=Exergic+GATE+Production" },
        { name: "ACE Engineering Academy", desc: "General GATE with relevant ME/PI theory", link: "https://www.youtube.com/results?search_query=ACE+Engineering+Academy+GATE+PI" },
        { name: "BYJU’S Exam Prep GATE & ESE", desc: "CE, ME & XE content useful for PI core topics", link: "https://www.youtube.com/results?search_query=BYJUS+Exam+Prep+GATE+PI" }
    ],
    ME: [
        { name: "Exergic – GATE ME, XE", desc: "Leader for ME; detailed course + many revision/problem videos", link: "https://www.youtube.com/results?search_query=Exergic+GATE+Mechanical+One+Shot" },
        { name: "GATE Wallah – ME, CE, XE & CH", desc: "ME subject marathons and one‑shot maths", link: "https://www.youtube.com/results?search_query=GATE+Wallah+Mechanical+One+Shot" },
        { name: "BYJU’S Exam Prep GATE & ESE", desc: "Crash courses & marathons", link: "https://www.youtube.com/results?search_query=BYJUS+Exam+Prep+GATE+Mechanical" },
        { name: "ACE Engineering Academy", desc: "Strategy, subject marathons, guidance", link: "https://www.youtube.com/results?search_query=ACE+Engineering+Academy+GATE+Mechanical" }
    ],
    PH: [
        { name: "Physics Wallah – Alakh Pandey (PW)", desc: "GATE/JAM physics marathons and topic one‑shots", link: "https://www.youtube.com/results?search_query=Physics+Wallah+GATE+Physics" },
        { name: "PW IIT JAM & CSIR NET", desc: "PW’s dedicated higher‑physics competitive channel; JAM/NET but highly relevant to GATE PH", link: "https://www.youtube.com/results?search_query=PW+IIT+JAM+CSIR+NET+Physics" },
        { name: "Physics – CSIR NET, GATE & JEST: IFAS", desc: "Systematic GATE/JEST/NET physics prep", link: "https://www.youtube.com/results?search_query=IFAS+Physics+GATE" }
    ],
    ES: [
        { name: "GATE Wallah – ME, CE, XE, CH, PI & ES", desc: "Explicitly lists ES; thermo/heat transfer/fluids marathons", link: "https://www.youtube.com/results?search_query=GATE+Wallah+Energy+Science" },
        { name: "Exergic – GATE ME, XE", desc: "Strong thermo, heat transfer, power plant; very useful for ES", link: "https://www.youtube.com/results?search_query=Exergic+GATE+Energy+Science" },
        { name: "Engineers Institute (Eii) – Chemical Engineering", desc: "Thermo, transport, CRE useful for ES", link: "https://www.youtube.com/results?search_query=Engineers+Institute+of+India+Chemical" },
        { name: "ACE Engineering Academy", desc: "Maths/aptitude + some ES‑relevant content", link: "https://www.youtube.com/results?search_query=ACE+Engineering+Academy+GATE+ES" }
    ],
    ST: [
        { name: "Mathstats: IIT‑JAM, GATE, NET, CUET, ISI", desc: "Full GATE ST PYQ solutions & classes", link: "https://www.youtube.com/results?search_query=Mathstats+GATE+Statistics" },
        { name: "Mathstats channel GATE Statistics series", desc: "Live GATE ST 2022–2026 batches", link: "https://www.youtube.com/results?search_query=Mathstats+GATE+Statistics+Series" },
        { name: "GATE Wallah – Engineering Mathematics", desc: "One‑shots (probability & stats core for ST maths part)", link: "https://www.youtube.com/results?search_query=GATE+Wallah+Engineering+Mathematics+Probability" },
        { name: "GeeksforGeeks GATE", desc: "Probability/stats content in DA/CS playlists", link: "https://www.youtube.com/results?search_query=GeeksforGeeks+GATE+Statistics" }
    ],
    EC: [
        { name: "GATE Wallah – EC, EE & CS", desc: "Branch‑wise playlists + one‑shot maths and core subjects", link: "https://www.youtube.com/results?search_query=GATE+Wallah+ECE+One+Shot" },
        { name: "GeeksforGeeks – EC, EE & IN", desc: "Targeted EE/EC/IN GATE content", link: "https://www.youtube.com/results?search_query=GeeksforGeeks+GATE+ECE" },
        { name: "BYJU’S Exam Prep GATE & ESE – EE, EC, IN, CS", desc: "Marathons, crash courses", link: "https://www.youtube.com/results?search_query=BYJUS+Exam+Prep+GATE+ECE" },
        { name: "Kreatryx GATE – EE, ECE & IN", desc: "DPP discussions, signals, networks, etc.", link: "https://www.youtube.com/results?search_query=Kreatryx+GATE+ECE" }
    ],
    CE: [
        { name: "GATE Wallah – ME, CE, XE & CH", desc: "Strength of materials, FM, structures one‑shots", link: "https://www.youtube.com/results?search_query=GATE+Wallah+Civil+One+Shot" },
        { name: "GATE Academy by Umesh Dhande", desc: "Subject‑wise CE lectures & revisions", link: "https://www.youtube.com/results?search_query=GATE+Academy+Civil" },
        { name: "BYJU’S Exam Prep GATE & ESE – CE, ME & XE", desc: "CE‑oriented marathons: FM, soil, environment", link: "https://www.youtube.com/results?search_query=BYJUS+Exam+Prep+GATE+Civil" },
        { name: "GATE Adda247", desc: "Steel structures, RCC, other CE topics", link: "https://www.youtube.com/results?search_query=GATE+Adda247+Civil" }
    ],
    BM: [
        { name: "Kalams & Krishnans Biomedical", desc: "GATE BM strategy, simplified revision series", link: "https://www.youtube.com/results?search_query=Kalams+Krishnans+Biomedical" },
        { name: "Biomed Bro", desc: "Syllabus breakdown, important topics, strategy for GATE BM", link: "https://www.youtube.com/results?search_query=Biomed+Bro+GATE" },
        { name: "FindMyTest", desc: "GATE Biomedical / MT live classes and test‑oriented sessions", link: "https://www.youtube.com/results?search_query=FindMyTest+GATE+Biomedical" }
    ],
    MA: [
        { name: "Mathematics – CSIR NET, GATE, SET & NBHM: IFAS", desc: "Explicit GATE Mathematics strategy and prep", link: "https://www.youtube.com/results?search_query=IFAS+Mathematics+GATE" },
        { name: "tripBohemia Maths by Ishika", desc: "GATE MA full course overview & resources", link: "https://www.youtube.com/results?search_query=tripBohemia+GATE+Maths" },
        { name: "Pure Mathematical Academy", desc: "GATE MA PYQs, e.g., LPP 2020–24", link: "https://www.youtube.com/results?search_query=Pure+Mathematical+Academy+GATE" },
        { name: "GATE Wallah – Engineering Mathematics", desc: "One‑shots useful for MA basics & methods", link: "https://www.youtube.com/results?search_query=GATE+Wallah+Engineering+Mathematics" }
    ],
    DA: [
        { name: "GoClasses – GATE DA Course", desc: "GATE DA Data Science & AI full course channel", link: "https://www.youtube.com/results?search_query=GoClasses+GATE+DA" },
        { name: "GeeksforGeeks GATE", desc: "GATE DA database & warehousing practice sessions", link: "https://www.youtube.com/results?search_query=GeeksforGeeks+GATE+DA" },
        { name: "Mathstats", desc: "GATE DA 2026 batch (DA + statistics perspective)", link: "https://www.youtube.com/results?search_query=Mathstats+GATE+DA" },
        { name: "GATE DA analysis channel", desc: "GATE DA 2024/25 paper analysis & trends", link: "https://www.youtube.com/results?search_query=GATE+DA+analysis+channel" }
    ],
    CS: [
        { name: "Gate Smashers", desc: "Complete GATE CSE syllabus + PYQs, very popular", link: "https://www.youtube.com/results?search_query=Gate+Smashers+GATE+CSE" },
        { name: "GeeksforGeeks GATE", desc: "CSE + DA content, practice sessions", link: "https://www.youtube.com/results?search_query=GeeksforGeeks+GATE+CSE" },
        { name: "BYJU’S Exam Prep GATE & ESE", desc: "CSE marathons & crash courses", link: "https://www.youtube.com/results?search_query=BYJUS+Exam+Prep+GATE+CSE" },
        { name: "GATE Wallah – EC, EE & CS", desc: "CS playlists + one‑shot maths", link: "https://www.youtube.com/results?search_query=GATE+Wallah+CSE+One+Shot" }
    ],
    AG: [
        { name: "GATEFORALL – GATE AG", desc: "AG‑specific course with farm power, machinery, hydrology, etc.", link: "https://www.youtube.com/results?search_query=GATEFORALL+GATE+AG" },
        { name: "AGRIYUG – GATE AGRICULTURE ENGINEERING", desc: "Orientation + crash course playlists", link: "https://www.youtube.com/results?search_query=AGRIYUG+GATE+Agriculture" }
    ],
    BT: [
        { name: "Instant Biology by Dr. Neelabh", desc: "GATE BT crash course & strategy", link: "https://www.youtube.com/results?search_query=Instant+Biology+Dr+Neelabh+GATE+BT" },
        { name: "PW IIT JAM & CSIR NET", desc: "Biotech/XL/BT‑oriented courses helpful for GATE BT", link: "https://www.youtube.com/results?search_query=PW+IIT+JAM+Biotech" },
        { name: "CSIR NET Adda247 – BT playlists", desc: "GATE BT 2026 batch planning & study plan", link: "https://www.youtube.com/results?search_query=CSIR+NET+Adda247+GATE+BT" }
    ],
    EE: [
        { name: "GATE Wallah – EE, EC & CS", desc: "Electrical machines, power systems, control one‑shots", link: "https://www.youtube.com/results?search_query=GATE+Wallah+Electrical+One+Shot" },
        { name: "GeeksforGeeks – EC, EE & IN", desc: "EE‑specific GATE batches & guidance", link: "https://www.youtube.com/results?search_query=GeeksforGeeks+GATE+EE" },
        { name: "BYJU’S Exam Prep GATE & ESE – EE, EC, IN, CS", desc: "EE marathons, crash courses, PYQs", link: "https://www.youtube.com/results?search_query=BYJUS+Exam+Prep+GATE+EE" },
        { name: "ACE Engineering Academy", desc: "EE strategy and subject deep dives", link: "https://www.youtube.com/results?search_query=ACE+Engineering+Academy+GATE+EE" }
    ],
    CH: [
        { name: "GATE Chemical Engineering", desc: "Dedicated chemical GATE channel", link: "https://www.youtube.com/results?search_query=GATE+Chemical+Engineering" },
        { name: "Learn CHE", desc: "CHE concepts from scratch with GATE focus", link: "https://www.youtube.com/results?search_query=Learn+CHE+GATE" },
        { name: "Engineers Institute of India (Eii) – Chemical", desc: "Online live GATE CH classes", link: "https://www.youtube.com/results?search_query=Engineers+Institute+of+India+Chemical" },
        { name: "GATE Wallah – ME, CE, XE & CH", desc: "CH‑labelled playlists + maths", link: "https://www.youtube.com/results?search_query=GATE+Wallah+Chemical" }
    ],
    AR: [
        { name: "KP Classes for GATE Architecture & Planning", desc: "AR crash courses, PYQs, topper talks", link: "https://www.youtube.com/results?search_query=KP+Classes+GATE+Architecture" },
        { name: "Aekam Academy", desc: "URDPFI/urban planning series for GATE AR", link: "https://www.youtube.com/results?search_query=Aekam+Academy+GATE+Architecture" },
        { name: "KP GATE Classes main channel", desc: "Broader AR & planning content", link: "https://www.youtube.com/results?search_query=KP+GATE+Classes" }
    ],
    XE: [
        { name: "Exergic – GATE ME, XE", desc: "XE‑A/B: ME‑linked subjects, strong problem solving", link: "https://www.youtube.com/results?search_query=Exergic+GATE+XE" },
        { name: "Endurance Engineering Academy (EEA) – GATE XE", desc: "XE‑A,B,D,E courses & guidance", link: "https://www.youtube.com/results?search_query=Endurance+Engineering+Academy+GATE+XE" },
        { name: "GATE Wallah – ME, CE, XE & CH", desc: "XE‑oriented content & engg maths", link: "https://www.youtube.com/results?search_query=GATE+Wallah+XE" },
        { name: "ACE Engineering Academy", desc: "XE prep strategy and maths/aptitude", link: "https://www.youtube.com/results?search_query=ACE+Engineering+Academy+GATE+XE" }
    ],
    MT: [
        { name: "Metalogical Engineering", desc: "GATE MT syllabus + topic explanations", link: "https://www.youtube.com/results?search_query=Metalogical+Engineering+GATE+MT" },
        { name: "FindMyTest – GATE Metallurgical Engineering", desc: "Live MT classes & tests", link: "https://www.youtube.com/results?search_query=FindMyTest+GATE+Metallurgical" }
    ]
};

const QuizzesModal = ({ onClose, userRole, onStartInterview }: { onClose: () => void, userRole?: 'admin' | 'public' | null, onStartInterview?: () => void }) => {
    const [activeTab, setActiveTab] = useState("Interviewer");
    const [selectedGateBranch, setSelectedGateBranch] = useState<any>(null);
    const [gateSubTab, setGateSubTab] = useState<'Syllabus' | 'PYQs' | 'Lectures'>('Syllabus');
    const [interviewMode, setInterviewMode] = useState<'manual' | 'ai'>('manual');
    const [manualInterviewText, setManualInterviewText] = useState('');
    const [aiRole, setAiRole] = useState('Software Engineering');
    const [aiPosition, setAiPosition] = useState('SDE-1 / Graduate Engineer Trainee');
    const [aiCompanies, setAiCompanies] = useState('Google, Microsoft, Amazon');
    const [bridgeMessage, setBridgeMessage] = useState('');

    const interviewBridgeUrl = 'https://interview-analysis-legendsauravs-projects.vercel.app/';

    const aiGeneratedInterviewPrompt = useMemo(() => {
        const cleanRole = aiRole.trim();
        const cleanPosition = aiPosition.trim();
        const cleanCompanies = aiCompanies
            .split(',')
            .map((c) => c.trim())
            .filter(Boolean)
            .join(', ');

        if (!cleanRole || !cleanPosition || !cleanCompanies) return '';

        return [
            `Generate a realistic interview practice set for ${cleanRole} candidates targeting the ${cleanPosition} position.`,
            `Keep the company style aligned with: ${cleanCompanies}.`,
            'Include technical questions, behavioral questions, and one short case/problem-solving question.',
            'After each question, include what an ideal strong answer should contain.'
        ].join(' ');
    }, [aiRole, aiPosition, aiCompanies]);

    const openInterviewBridge = (mode: 'manual' | 'ai', prompt: string) => {
        const cleanPrompt = prompt.trim();
        if (!cleanPrompt) {
            setBridgeMessage('Please enter valid interview input before continuing.');
            return;
        }

        const payload = {
            source: 'career_booster',
            mode,
            prompt: cleanPrompt,
            role: aiRole.trim(),
            position: aiPosition.trim(),
            companies: aiCompanies
                .split(',')
                .map((c) => c.trim())
                .filter(Boolean),
            timestamp: new Date().toISOString()
        };

        const params = new URLSearchParams({
            source: 'career_booster',
            mode,
            prompt: cleanPrompt,
            role: payload.role,
            position: payload.position,
            companies: payload.companies.join(', '),
            bridgeData: encodeURIComponent(JSON.stringify(payload))
        });

        const targetUrl = `${interviewBridgeUrl}?${params.toString()}`;
        const opened = window.open(targetUrl, '_blank', 'noopener,noreferrer');
        if (!opened) {
            window.location.href = targetUrl;
        }
        setBridgeMessage('Interview workspace opened with your inputs.');
    };

    // Generic Quiz Data
    const quizData = [
        {
            title: "Interviewer",
            items: [
                { name: "Coding Interview Prep", desc: "Mock algorithmic problems", link: "#" },
                { name: "System Design Mock", desc: "Architecture interview practice", link: "#" },
                { name: "Behavioral Round", desc: "STAR method practice questions", link: "#" },
                { name: "Frontend Interview", desc: "React, JS, and CSS trivia", link: "#" },
                { name: "Backend Interview", desc: "Database, API, and Server logic", link: "#" }
            ]
        },
        // GATE has special handling now
        {
            title: "GATE",
            items: [] 
        },
        {
            title: "Courses",
            items: [
                { name: "Semester 1 Finals", desc: "Comprehensive review", link: "#" },
                { name: "Mid-term: Python", desc: "Basic syntax & logic", link: "#" },
                { name: "Data Structures Quiz", desc: "Arrays, Linked Lists, Trees", link: "#" },
                { name: "Operating Systems", desc: "Process management & memory", link: "#" },
                { name: "Networking Basics", desc: "OSI Model & TCP/IP", link: "#" }
            ]
        }
    ];

    const gateBranches = [
        // Expanded list of common GATE papers (add more as needed)
        { name: "Aerospace Engineering", code: "AE" },
        { name: "Agricultural Engineering", code: "AG" },
        { name: "Architecture", code: "AR" },
        { name: "Biomedical Engineering", code: "BM" },
        { name: "Biotechnology", code: "BT" },
        { name: "Civil Engineering", code: "CE" },
        { name: "Chemical Engineering", code: "CH" },
        { name: "Computer Science", code: "CS" },
        { name: "Data Science & AI", code: "DA" },
        { name: "Electronics and Communication Engineering", code: "EC" },
        { name: "Electrical Engineering", code: "EE" },
        { name: "Engineering Sciences", code: "EN" },
        { name: "Energy Science", code: "ES" },
        { name: "Environmental Science", code: "EY" },
        { name: "Mathematics", code: "MA" },
        { name: "Mechanical Engineering", code: "ME" },
        { name: "Metallurgical Engineering", code: "MT" },
        { name: "Mining Engineering", code: "MN" },
        { name: "Physics", code: "PH" },
        { name: "Production and Industrial Engineering", code: "PI" },
        { name: "Statistics", code: "ST" },
        { name: "XE Combined Syllabus", code: "XE" }
    ];

    const activeSection = quizData.find(q => q.title === activeTab);

    // PYQ list component: discovers available PYQ PDFs for a branch and displays them
    const PYQList = ({ code }: { code: string }) => {
        const [files, setFiles] = useState<string[]>([]);
        const [loading, setLoading] = useState(true);
        const [selectedSrc, setSelectedSrc] = useState<string | null>(null);

        useEffect(() => {
            let mounted = true;
            const loadManifestOrProbe = async () => {
                setLoading(true);
                setFiles([]);
                // Try manifest first
                try {
                    const mres = await fetch(`${window.location.origin}/pyqs/index.json`);
                    if (mres.ok) {
                        const json = await mres.json();
                        const list = json[code] || json[code.toUpperCase()];
                        if (list && Array.isArray(list) && mounted) {
                            // Normalize to full URLs if relative
                            const urls = list.map((f: string) => f.startsWith('http') ? f : `${window.location.origin}/pyqs/${f}`);
                            setFiles(urls);
                            setLoading(false);
                            return;
                        }
                    }
                } catch (e) {
                    // manifest not present or failed — do not probe. Show no PYQs.
                    if (mounted) {
                        setFiles([]);
                        setLoading(false);
                    }
                    return;
                }
            };
            loadManifestOrProbe();
            return () => { mounted = false; };
        }, [code]);

        return (
            <div>
                {loading && <div style={{padding:'1rem'}}>Looking for PYQs for {code}…</div>}
                {!loading && files.length === 0 && (
                    <div style={{padding:'1rem', color:'#666'}}>No PYQ PDFs found for {code}. Place files under <code>/pyqs/{code}/</code> or add a <code>/pyqs/index.json</code> manifest.</div>
                )}
                {!loading && files.length > 0 && (
                    <div className="pyqs-grid">
                        {files.map((f, i) => (
                            <div key={f} className="pyq-card">
                                <div className="pyq-thumb">PDF</div>
                                <div className="pyq-meta">
                                    <div className="pyq-name">{f.split('/').pop()}</div>
                                    <div className="pyq-actions">
                                        <button className="view-pyq-btn" onClick={() => setSelectedSrc(f)}>View</button>
                                        <a className="download-pyq" href={f} target="_blank" rel="noopener noreferrer">Download</a>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {selectedSrc && (
                    <div className="pdf-modal-overlay" onClick={() => setSelectedSrc(null)}>
                        <div className="pdf-modal" onClick={(e) => e.stopPropagation()}>
                            <button className="close-btn" onClick={() => setSelectedSrc(null)}>&times;</button>
                            <iframe src={selectedSrc} title="PYQ" className="pdf-frame" />
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="certificates-modal-overlay">
            <div className="certificates-modal-content">
                <div className="cert-header-sticky" style={{paddingBottom:0, borderBottom:'none'}}>
                    <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', paddingBottom:'1rem'}}>
                        <h2>Quizzes & Exams Preparation</h2>
                        <button className="close-btn" onClick={onClose} style={{fontSize:'1.5rem'}}>&times;</button>
                    </div>
                    
                    {/* Main Tabs (only show if not deep inside a branch view) */}
                    {!selectedGateBranch && (
                        <div className="quiz-nav-container" style={{paddingLeft:0, marginBottom:0}}>
                            {quizData.map((section) => (
                                <button
                                    key={section.title}
                                    className={`quiz-nav-tab ${activeTab === section.title ? 'active' : ''}`}
                                    onClick={() => setActiveTab(section.title)}
                                >
                                    {section.title}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
                
                <div className="cert-list-container" style={{paddingTop:'1.5rem'}}>
                    {/* Logic for GATE Tab */}
                    {activeTab === 'GATE' ? (
                        !selectedGateBranch && userRole === 'public' ? (
                            <>
                                <div style={{marginBottom:'2rem', display:'flex', justifyContent:'center'}}>
                                    <a
                                        href="https://examiner-gilt.vercel.app/"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '1rem',
                                            background: 'linear-gradient(90deg, #e0e7ff 0%, #f0fdfa 100%)',
                                            border: '1.5px solid #a5b4fc',
                                            borderRadius: '1.2rem',
                                            padding: '1.2rem 2.2rem',
                                            fontWeight: 600,
                                            fontSize: '1.15rem',
                                            color: '#3730a3',
                                            boxShadow: '0 2px 12px 0 rgba(80,80,180,0.07)',
                                            textDecoration: 'none',
                                            transition: 'box-shadow 0.2s, border 0.2s',
                                        }}
                                        onMouseOver={e => {
                                            (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 4px 24px 0 rgba(80,80,180,0.13)';
                                            (e.currentTarget as HTMLAnchorElement).style.border = '2px solid #6366f1';
                                        }}
                                        onMouseOut={e => {
                                            (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 2px 12px 0 rgba(80,80,180,0.07)';
                                            (e.currentTarget as HTMLAnchorElement).style.border = '1.5px solid #a5b4fc';
                                        }}
                                    >
                                        <span style={{fontSize:'1.7rem', background:'#6366f1', color:'#fff', borderRadius:'0.6rem', padding:'0.3rem 0.7rem', fontWeight:700, letterSpacing:'-1px'}}>AI Exam</span>
                                        <span style={{fontSize:'1.1rem'}}>Try SmartExam AI</span>
                                        <span style={{fontSize:'1.3rem', marginLeft:'0.5rem'}}>↗</span>
                                    </a>
                                </div>
                                <div className="cert-provider-grid">
                                    {gateBranches.map((branch) => (
                                        <div 
                                            key={branch.code} 
                                            className="cert-card-pop" 
                                            style={{cursor:'pointer'}}
                                            onClick={() => setSelectedGateBranch(branch)}
                                        >
                                            <div className="cert-card-top">
                                                <span className="cert-cat-badge">{branch.code}</span>
                                            </div>
                                            <h3 className="cert-card-title">{branch.name}</h3>
                                            <div className="cert-card-footer">
                                                <span className="open-icon">Open Details ↗</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : selectedGateBranch ? (
                            // Branch Detail View
                            <div>
                                <div style={{display:'flex', alignItems:'center', gap:'1rem', marginBottom:'1.5rem'}}>
                                    <button 
                                        onClick={() => setSelectedGateBranch(null)}
                                        style={{background:'none', border:'none', fontSize:'1.2rem', cursor:'pointer'}}
                                    >
                                        ← Back
                                    </button>
                                    <h3 style={{margin:0}}>{selectedGateBranch.name} ({selectedGateBranch.code})</h3>
                                </div>

                                {/* Like Mine Section: Open Format Navigation */}
                                <div className="mine-nav-container" style={{marginBottom:'2rem', borderBottom:'1px solid #eee', paddingBottom:'0.5rem', width:'100%'}}>
                                    <button 
                                        className={`mine-nav-tab ${gateSubTab === 'Syllabus' ? 'active' : ''}`}
                                        onClick={() => setGateSubTab('Syllabus')}
                                    >
                                        Syllabus
                                    </button>
                                    <button 
                                        className={`mine-nav-tab ${gateSubTab === 'PYQs' ? 'active' : ''}`}
                                        onClick={() => setGateSubTab('PYQs')}
                                    >
                                        PYQs
                                    </button>
                                    <button 
                                        className={`mine-nav-tab ${gateSubTab === 'Lectures' ? 'active' : ''}`}
                                        onClick={() => setGateSubTab('Lectures')}
                                    >
                                        Lectures
                                    </button>
                                </div>

                                <div className="gate-content-area">
                                    {gateSubTab === 'Syllabus' ? (
                                        // Embedded PDF viewer (loads syllabus from /syllabus/<code>/)
                                        <PDFViewer code={selectedGateBranch.code} />
                                    ) : (
                                            <>
                                                {gateSubTab === 'PYQs' ? (
                                                    <div>
                                                        <p style={{color:'#666'}}>Previous Year Questions for {selectedGateBranch.name}.</p>
                                                        <PYQList code={selectedGateBranch.code} />
                                                    </div>
                                                ) : (
                                                    <div>
                                                        <p style={{color:'#666', marginBottom:'1.5rem'}}>{`Recommended video lectures and channels for ${selectedGateBranch.name}.`}</p>
                                                        {GATE_LECTURES[selectedGateBranch.code] ? (
                                                            <div className="cert-provider-grid">
                                                                {GATE_LECTURES[selectedGateBranch.code].map((lecture, idx) => (
                                                                    <a key={idx} href={lecture.link} target="_blank" rel="noopener noreferrer" className="cert-card-pop">
                                                                        <div className="cert-card-top">
                                                                            <span className="cert-cat-badge">YouTube</span>
                                                                        </div>
                                                                        <h3 className="cert-card-title">{lecture.name}</h3>
                                                                        <p style={{fontSize:'0.85rem', color:'#666', margin:'0 0 1rem 0'}}>{lecture.desc}</p>
                                                                        <div className="cert-card-footer">
                                                                            <span className="open-icon">Watch Videos ↗</span>
                                                                        </div>
                                                                    </a>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <div style={{color:'#888', fontStyle:'italic'}}>
                                                                No specific lecture resources configured for this branch yet.
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </>
                                        )}
                                </div>
                            </div>
                        ) : (
                            // Branch List View (Grid of Boxes)
                            <div className="cert-provider-grid">
                                {gateBranches.map((branch) => (
                                    <div 
                                        key={branch.code} 
                                        className="cert-card-pop" 
                                        style={{cursor:'pointer'}}
                                        onClick={() => setSelectedGateBranch(branch)}
                                    >
                                        <div className="cert-card-top">
                                            <span className="cert-cat-badge">{branch.code}</span>
                                        </div>
                                        <h3 className="cert-card-title">{branch.name}</h3>
                                        <div className="cert-card-footer">
                                            <span className="open-icon">Open Details ↗</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )
                    ) : (
                        // Standard List for Interviewer & Courses
                        activeSection && (
                            <div className="cert-provider-group">
                                <div className="cert-provider-grid">
                                    {activeTab === 'Interviewer' ? (
                                        <InterviewerSelectorPanel onStartInterview={onStartInterview} />
                                    ) : (
                                        activeSection.items.map((item, i) => (
                                            <a key={i} href={item.link} className="cert-card-pop" onClick={e => e.preventDefault()}>
                                                <div className="cert-card-top">
                                                    <span className="cert-cat-badge" style={{background:'#e0f2fe', color:'#0369a1'}}>Practice</span>
                                                </div>
                                                <h3 className="cert-card-title">{item.name}</h3>
                                                <p style={{fontSize:'0.85rem', color:'#666', margin:'0 0 1rem 0'}}>{item.desc}</p>
                                                <div className="cert-card-footer">
                                                    <span className="open-icon">Start Quiz ↗</span>
                                                </div>
                                            </a>
                                        ))
                                    )}
                                </div>
                            </div>
                        )
                    )}
                </div>
            </div>
        </div>
    );
};

// -----------------------------
// Repo Investigator (AI Analysis)
// -----------------------------
const RepoInvestigator = () => {
    const [url, setUrl] = useState('');
    const [apiKeyInput, setApiKeyInput] = useState('');
    const [savedKey, setSavedKey] = useState<string | null>(() => {
        try { return localStorage.getItem('GOOGLE_GENAI_KEY') || null; } catch { return null; }
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [result, setResult] = useState<string | null>(null);

    const saveKey = () => { try { localStorage.setItem('GOOGLE_GENAI_KEY', apiKeyInput); setSavedKey(apiKeyInput); setApiKeyInput(''); } catch(e){} };
    const clearKey = () => { try { localStorage.removeItem('GOOGLE_GENAI_KEY'); setSavedKey(null); } catch(e){} };

    const isValidGithubUrl = (v: string) => {
        try {
            const u = new URL(v.trim());
            return /github.com/i.test(u.hostname) && u.pathname.split('/').filter(Boolean).length >= 2;
        } catch { return false; }
    };

    const runAnalysis = async () => {
        setError('');
        setResult(null);
        const key = savedKey || apiKeyInput || localStorage.getItem('GOOGLE_GENAI_KEY');
        if (!key) { setError('GenAI API key not configured. Paste your Google GenAI key in the field and Save.'); return; }
        if (!isValidGithubUrl(url)) { setError('Please enter a valid GitHub repository URL (e.g. https://github.com/org/repo).'); return; }

        setLoading(true);
        try {
            const prompt = `You are Repo Investigator. Given a GitHub repository URL: ${url}\n\nProduce two sections exactly: \n1) Execution Guide 🛠️: Provide step-by-step shell commands to run the project locally. Make commands copy-paste ready.\n2) Project Highlights ✨: Concise technical bullet points summarizing what's unique or impressive about the project.\n\nReturn output formatted like a README.md with headings and code blocks where appropriate.`;

            const endpoint = 'https://generativelanguage.googleapis.com/v1beta2/models/gemini-2.5-flash:generateText';

            const res = await fetch(`${endpoint}?key=${encodeURIComponent(key)}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text: prompt,
                    temperature: 0.05,
                    maxOutputTokens: 800,
                })
            });

            if (!res.ok) {
                const txt = await res.text().catch(() => '');
                throw new Error(`GenAI request failed: ${res.status} ${txt}`);
            }
            const json = await res.json();
            let textOut = '';
            if (json?.candidates && Array.isArray(json.candidates) && json.candidates[0]?.content) {
                textOut = json.candidates[0].content;
            } else if (json?.output?.[0]?.content?.text) {
                textOut = json.output[0].content.text;
            } else if (typeof json?.text === 'string') {
                textOut = json.text;
            } else if (json?.choices && json.choices[0]?.message?.content) {
                textOut = json.choices[0].message.content;
            } else {
                textOut = JSON.stringify(json, null, 2);
            }

            setResult(textOut);
        } catch (e: any) {
            console.error('Repo analysis error', e);
            setError(String(e?.message || e));
        } finally { setLoading(false); }
    };

    return (
        <div className="repo-investigator">
            <div className="repo-hero">
                <div className="repo-hero-inner">
                    <h3>Repo Investigator</h3>
                    <p className="muted">Paste a GitHub repository URL and get an AI-generated Execution Guide and Project Highlights (README-style).</p>
                    <div className="repo-input-row">
                        <input className="repo-url-input" placeholder="https://github.com/org/repo" value={url} onChange={e=>setUrl(e.target.value)} />
                        <button className="btn-solid" onClick={runAnalysis} disabled={loading}>{loading ? 'Analyzing…' : 'Analyze'}</button>
                    </div>
                    <div className="repo-api-keys">
                        <input placeholder="Google GenAI API Key (optional)" value={apiKeyInput} onChange={e=>setApiKeyInput(e.target.value)} />
                        <button className="btn-ghost" onClick={saveKey} disabled={!apiKeyInput}>Save</button>
                        <button className="btn-ghost" onClick={clearKey} disabled={!savedKey}>Clear</button>
                    </div>
                </div>
            </div>

            <div className="repo-results">
                {loading && (
                    <div className="result-card loading">
                        <div className="spinner" aria-hidden="true"></div>
                        <div>Analyzing repository — this may take a few seconds.</div>
                    </div>
                )}

                {error && <div className="result-card error">{error}</div>}

                {result && (
                    <div className="result-card">
                        <div className="result-readme">
                            <pre>{result}</pre>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const HackathonsModal = ({ onClose }: { onClose: () => void }) => {
    const [tab, setTab] = useState<'Updates' | 'PFL' | 'GitHub' | 'AI'>('Updates');
    // AI Analysis state
    const [aiUrl, setAiUrl] = useState('');
    const [aiLoading, setAiLoading] = useState(false);
    const [aiError, setAiError] = useState('');
    const [aiResult, setAiResult] = useState<string | null>(null);

    const rows = [
        ['Devpost','https://devpost.com','Biggest global hackathon hub (online + offline)'],
        ['Unstop (Dare2Compete)','https://unstop.com/hackathons','India-focused + global hackathons & challenges'],
        ['HackerEarth','https://www.hackerearth.com/challenges/hackathon/','Corporate & coding hackathons'],
        ['Hackathon.com','https://www.hackathon.com','Worldwide hackathon listings'],
        ['All Hackathons','https://allhackathons.com','Aggregated upcoming hackathons'],
        ['Hackathons.io','https://hackathons.io/events','Simple global hackathon finder'],
        ['Major League Hacking (MLH)','https://mlh.io/seasons/2026/events','College & student hackathons'],
        ['TAIKAI','https://taikai.network','Innovation & Web3 hackathons'],
        ['Eventbrite (Hackathon Search)','https://www.eventbrite.com/d/online/hackathon/','Local + online events'],
        ['Meetup (Hackathon Search)','https://www.meetup.com/find/?keywords=hackathon','Community-driven hackathons'],
        ['LinkedIn Events','https://www.linkedin.com/events','Corporate & professional hackathons']
    ];

    const isValidGithubUrl = (v: string) => {
        try { const u = new URL(v.trim()); return /github.com/i.test(u.hostname) && u.pathname.split('/').filter(Boolean).length >= 2; } catch { return false; }
    };

    const runRepoAnalysis = async () => {
        setAiError('');
        setAiResult(null);
        const key = (typeof localStorage !== 'undefined') ? (localStorage.getItem('PERPLEXITY_API_KEY') || '') : '';
        if (!key) { setAiError('AI key missing. Add PERPLEXITY_API_KEY in Personal Panel.'); return; }
        if (!isValidGithubUrl(aiUrl)) { setAiError('Enter a valid GitHub repository URL (e.g., https://github.com/org/repo).'); return; }
        setAiLoading(true);
        try {
            const systemPrompt = 'You are Repo Investigator. Return concise, technical, README-style output.';
            const userPrompt = `Analyze this GitHub repository: ${aiUrl}\n\nReturn two sections exactly:\n1) Execution Guide 🛠️: Step-by-step shell commands to run locally (copy-paste ready).\n2) Project Highlights ✨: Bullet points of unique or technically impressive aspects.\n\nUse clear headings and fenced code blocks where appropriate.`;
            const res = await fetch('https://api.perplexity.ai/chat/completions', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify({
                    model: (typeof localStorage !== 'undefined' && localStorage.getItem('PERPLEXITY_MODEL')) || 'sonar-pro',
                    messages: [
                        { role: 'system', content: systemPrompt },
                        { role: 'user', content: userPrompt }
                    ],
                    temperature: 0.2,
                })
            });
            if (!res.ok) { const txt = await res.text().catch(()=> ''); throw new Error(`Perplexity failed: ${res.status} ${txt}`); }
            const json = await res.json();
            const out = json?.choices?.[0]?.message?.content || JSON.stringify(json, null, 2);
            setAiResult(out);
        } catch (e:any) { setAiError(String(e?.message || e)); } finally { setAiLoading(false); }
    };

    return (
        <div className="certificates-modal-overlay">
            <div className="certificates-modal-content">
                <div className="cert-header-sticky" style={{paddingBottom:0, borderBottom:'none'}}>
                    <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', paddingBottom:'1rem'}}>
                        <h2>Hackathon Hub</h2>
                        <button className="close-btn" onClick={onClose} style={{fontSize:'1.5rem'}}>&times;</button>
                    </div>
                    <div style={{display:'flex', gap:8, alignItems:'center'}}>
                        <button className={`mini-tab ${tab === 'Updates' ? 'active' : ''}`} onClick={() => setTab('Updates')}>Updates</button>
                        <button className={`mini-tab ${tab === 'PFL' ? 'active' : ''}`} onClick={() => setTab('PFL')}>PFL</button>
                        <button className={`mini-tab ${tab === 'GitHub' ? 'active' : ''}`} onClick={() => setTab('GitHub')}>GitHub</button>
                        <button className={`mini-tab ${tab === 'AI' ? 'active' : ''}`} onClick={() => setTab('AI')}>AI Analysis</button>
                    </div>
                </div>

                {/* Flow diagram: select -> search PFL -> search GitHub -> AI analysis */}
                <div className="hackathon-flow-horizontal" style={{display:'flex', alignItems:'center', justifyContent:'center', gap:'0.5rem', margin:'2rem 0 1.5rem 0', flexWrap:'wrap'}} aria-hidden>
                    <div style={{display:'flex', alignItems:'center', gap:'0.5rem'}}>
                        <div style={{background:'#6366f1', color:'#fff', padding:'1.1rem 1.7rem', borderRadius:'1.1rem', fontWeight:600, fontSize:'1.08rem', minWidth:'180px', textAlign:'center', boxShadow:'0 2px 10px #6366f11a'}}>1. Select Hackathon<br/><span style={{fontWeight:400, fontSize:'0.97em'}}>from links below</span></div>
                        <span style={{fontSize:'2.2rem', color:'#6366f1', fontWeight:700, margin:'0 0.2rem'}}>→</span>
                        <div style={{background:'#818cf8', color:'#fff', padding:'1.1rem 1.7rem', borderRadius:'1.1rem', fontWeight:600, fontSize:'1.08rem', minWidth:'180px', textAlign:'center', boxShadow:'0 2px 10px #6366f11a'}}>2. Place Name in PFL</div>
                        <span style={{fontSize:'2.2rem', color:'#6366f1', fontWeight:700, margin:'0 0.2rem'}}>→</span>
                        <div style={{background:'#a5b4fc', color:'#3730a3', padding:'1.1rem 1.7rem', borderRadius:'1.1rem', fontWeight:600, fontSize:'1.08rem', minWidth:'180px', textAlign:'center', boxShadow:'0 2px 10px #6366f11a'}}>3. Search Name in GitHub<br/><span style={{fontWeight:400, fontSize:'0.97em'}}>search bar</span></div>
                        <span style={{fontSize:'2.2rem', color:'#6366f1', fontWeight:700, margin:'0 0.2rem'}}>→</span>
                        <div style={{background:'#fbbf24', color:'#fff', padding:'1.1rem 1.7rem', borderRadius:'1.1rem', fontWeight:600, fontSize:'1.08rem', minWidth:'180px', textAlign:'center', boxShadow:'0 2px 10px #6366f11a'}}>4. AI Powered Analysis</div>
                    </div>
                </div>

                {tab === 'AI' && (
                    <div className="repo-results" style={{marginTop:'12px', display:'grid', gap:12}}>
                        <div style={{background:'linear-gradient(90deg, rgba(63,81,181,0.12), rgba(124,58,237,0.06))', padding:12, borderRadius:12}}>
                            <h3 style={{margin:'0 0 8px 0'}}>Repo Investigator</h3>
                            <div style={{display:'flex', gap:8, alignItems:'center'}}>
                                <input value={aiUrl} onChange={e=>setAiUrl(e.target.value)} placeholder="Paste GitHub repo URL (https://github.com/org/repo)" style={{flex:1, padding:'10px 14px', borderRadius:999, border:'1px solid var(--border-color)', background:'rgba(255,255,255,0.9)'}} />
                                <button className="action-btn" onClick={runRepoAnalysis} disabled={aiLoading}>{aiLoading ? 'Analyzing…' : 'Analyze'}</button>
                            </div>
                            <div style={{color:'var(--subtle-text-color)', marginTop:6}}>Uses Perplexity Sonar Pro. Key: localStorage.PERPLEXITY_API_KEY.</div>
                        </div>
                        {aiLoading && (
                            <div style={{display:'flex', alignItems:'center', gap:10, background:'var(--content-background)', border:'1px solid var(--border-color)', borderRadius:12, padding:12}}>
                                <div style={{width:24, height:24, borderRadius:'50%', border:'4px solid rgba(0,0,0,0.08)', borderTopColor:'rgba(63,81,181,0.8)', animation:'spin 1s linear infinite'}}></div>
                                <div>Analyzing repository — this may take a few seconds.</div>
                            </div>
                        )}
                        {aiError && (
                            <div style={{background:'var(--content-background)', border:'1px solid var(--border-color)', borderRadius:12, padding:12, color:'crimson'}}>{aiError}</div>
                        )}
                        {aiResult && (
                            <div style={{background:'var(--content-background)', border:'1px solid var(--border-color)', borderRadius:12, padding:12}}>
                                <pre style={{margin:0, whiteSpace:'pre-wrap'}}>{aiResult}</pre>
                            </div>
                        )}
                    </div>
                )}

                <div className="cert-list-container" style={{paddingTop:'1rem'}}>
                    {tab === 'Updates' && (
                        <div style={{overflowX:'auto'}}>
                            <table className="hackathon-table">
                                <thead>
                                    <tr>
                                        <th>Platform Name</th>
                                        <th>Direct Link</th>
                                        <th>What You Get</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {rows.map((row, i) => (
                                        <tr key={i} className="hackathon-row">
                                            <td data-label="Platform Name"><strong>{row[0]}</strong></td>
                                            <td data-label="Direct Link">
                                                <a className="hackathon-link" href={row[1] as string} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>{row[1]}</a>
                                            </td>
                                            <td data-label="What You Get">{row[2]}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {tab === 'PFL' && (
                        <div style={{color:'#444'}}>
                            <h5 style={{marginTop:0}}>PFL — Hackathon Winners & Finalists Search</h5>
                            <p style={{color:'#666'}}>Search LinkedIn profiles of winners and finalists for a specific hackathon. Uses Google Custom Search (configured for LinkedIn).</p>

                            <PFLSearch />
                        </div>
                    )}

                    {tab === 'GitHub' && (
                        <div style={{color:'#444'}}>
                            <h5 style={{marginTop:0}}>GitHub Search</h5>
                            <p style={{color:'#666'}}>Search GitHub profiles and repositories by person name using Google Custom Search (uses the configured Google API key/CX).</p>

                            <GitHubSearch />
                        </div>
                    )}

                    {tab === 'AI' && (
                        <div style={{color:'#444'}}>
                            <h5 style={{marginTop:0}}>AI Analysis</h5>
                            <p style={{color:'#666'}}>AI-powered analysis will summarize findings from PFL and GitHub searches and provide suggested next steps. This feature is a placeholder — connect your AI key in Personal Panel to enable.</p>
                            <div style={{marginTop:12, padding:18, borderRadius:12, background:'linear-gradient(180deg,#fff,#fbfbff)', border:'1px solid var(--border-color)'}}>
                                <div style={{fontWeight:700, color:'#333'}}>Summary</div>
                                <div style={{color:'#666', marginTop:8}}>No analysis available yet. Run PFL and GitHub searches, then open this tab to analyze results.</div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const PFLSearch = () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const sectionKey = 'LINKEDIN';

    const runSearch = async () => {
        setError('');
        setResults([]);
        const apiKey = getSectionApiKey(sectionKey) || '';
        const cx = getSectionCx(sectionKey) || '';
        if (!apiKey || !cx) {
            setError('LinkedIn search is not configured. Set VITE_GOOGLE_CSE_KEY_LINKEDIN / VITE_GOOGLE_CSE_CX_LINKEDIN in .env, or save GOOGLE_SEARCH_KEY_LINKEDIN / GOOGLE_SEARCH_CX_LINKEDIN in Personal Panel.');
            return;
        }
        if (!query.trim()) { setError('Please enter a hackathon name to search.'); return; }

        const q = `site:linkedin.com/in ("${query.trim()}") (finalist OR winner OR \"rank\")`;
        const url = `https://www.googleapis.com/customsearch/v1?key=${encodeURIComponent(apiKey)}&cx=${encodeURIComponent(cx)}&q=${encodeURIComponent(q)}&num=10`;
        setLoading(true);
        try {
            const res = await fetch(url);
            if (!res.ok) throw new Error(`Search failed: ${res.status}`);
            const data = await res.json();
            const items = data.items || [];
            const mapped = items.map((it: any) => ({
                title: it.title || it.displayLink || '',
                link: it.link,
                snippet: it.snippet || ''
            }));
            setResults(mapped);
        } catch (e: any) {
            console.error('PFL search error', e);
            setError(String(e?.message || e));
        } finally { setLoading(false); }
    };

    return (
        <div>
            <div style={{display:'flex', gap:8, marginBottom:12}}>
                <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Enter hackathon name (e.g. Smart India Hackathon)" style={{flex:1, padding:'10px 12px', borderRadius:8, border:'1px solid var(--border-color)'}} />
                <button className="action-btn" onClick={runSearch} disabled={loading} style={{padding:'10px 14px'}}>{loading ? 'Searching...' : 'Search'}</button>
            </div>

            {error && <div style={{color:'crimson', marginBottom:12}}>{error}</div>}

            <div style={{display:'grid', gap:10}}>
                {results.map((r, i) => (
                    <a key={i} href={r.link} target="_blank" rel="noopener noreferrer" className="cert-card-pop" style={{textDecoration:'none'}}>
                        <div style={{display:'flex', flexDirection:'column'}}>
                            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                                <h4 style={{margin:'0 0 6px 0'}}>{r.title}</h4>
                                <span style={{fontSize:'0.85rem', color:'#666'}}>{new URL(r.link).hostname.replace('www.','')}</span>
                            </div>
                            <p style={{margin:0, color:'#555'}}>{r.snippet}</p>
                        </div>
                    </a>
                ))}
                {!loading && results.length === 0 && !error && (<div style={{color:'#666'}}>No results yet. Try a different hackathon name.</div>)}
            </div>
        </div>
    );
};

const GitHubSearch = () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<any[]>([]);
    const [grouped, setGrouped] = useState<Record<string, any> | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const sectionKey = 'GITHUB';

    const runSearch = async () => {
        setError('');
        setResults([]);
        setGrouped(null);
        const apiKey = getSectionApiKey(sectionKey) || '';
        const cx = getSectionCx(sectionKey) || '';
        if (!apiKey || !cx) {
            setError('Google Custom Search key/CX not configured for GitHub. Add them in the Personal Panel (GOOGLE_SEARCH_KEY_GITHUB / GOOGLE_SEARCH_CX_GITHUB) or set a global key.');
            return;
        }
        if (!query.trim()) { setError('Please enter a name or handle to search.'); return; }

        // Prefer profile-style matches and repositories on github.com
        const q = `site:github.com "${query.trim()}"`;
        const url = `https://www.googleapis.com/customsearch/v1?key=${encodeURIComponent(apiKey)}&cx=${encodeURIComponent(cx)}&q=${encodeURIComponent(q)}&num=10`;
        setLoading(true);
        try {
            const res = await fetch(url);
            if (!res.ok) throw new Error(`Search failed: ${res.status}`);
            const data = await res.json();
            const items = data.items || [];
            const mapped = items.map((it: any) => ({ title: it.title || '', link: it.link, snippet: it.snippet || '' }));
            setResults(mapped);

            // Try to group results into users/repos using existing helper
            const groupedUsers = processGithubResults(items);
            setGrouped(Object.keys(groupedUsers).length ? groupedUsers : null);
        } catch (e: any) {
            console.error('GitHub search error', e);
            setError(String(e?.message || e));
        } finally { setLoading(false); }
    };

    return (
        <div>
            <div style={{display:'flex', gap:8, marginBottom:12}}>
                <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Enter person name or GitHub handle" style={{flex:1, padding:'10px 12px', borderRadius:8, border:'1px solid var(--border-color)'}} />
                <button className="action-btn" onClick={runSearch} disabled={loading} style={{padding:'10px 14px'}}>{loading ? 'Searching...' : 'Search'}</button>
            </div>

            {error && <div style={{color:'crimson', marginBottom:12}}>{error}</div>}

            {grouped && (
                <div style={{display:'grid', gap:12}}>
                    {Object.entries(grouped).map(([user, data]) => (
                        <div key={user} className="github-user-card" style={{display:'flex', gap:12, padding:12, borderRadius:8, border:'1px solid #f0f0f0'}}>
                            <div style={{width:72, height:72, borderRadius:8, overflow:'hidden'}}><img src={data.avatar} alt={user} draggable={false} onDragStart={preventImageDrag} style={{width:'100%', height:'100%', objectFit:'cover'}}/></div>
                            <div style={{flex:1}}>
                                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                                    <div>
                                        <a href={data.profile} target="_blank" rel="noopener noreferrer" style={{fontWeight:700, fontSize:'1rem'}}>@{user}</a>
                                        {data.bio && <div style={{color:'#666', fontSize:'0.9rem'}}>{data.bio}</div>}
                                    </div>
                                    <div style={{display:'flex', gap:8}}>
                                        <a href={data.profile} target="_blank" rel="noopener noreferrer" className="add-btn">Open</a>
                                    </div>
                                </div>

                                {data.repos && data.repos.length > 0 && (
                                    <div style={{marginTop:8, display:'flex', gap:8, flexWrap:'wrap'}}>
                                        {data.repos.slice(0,8).map((r:any, i:number) => (
                                            <a key={i} href={r.url} target="_blank" rel="noopener noreferrer" className="pill-btn" style={{padding:'6px 10px'}}>{r.name}</a>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {!grouped && results.length > 0 && (
                <div style={{display:'grid', gap:10}}>
                    {results.map((r, i) => (
                        <a key={i} href={r.link} target="_blank" rel="noopener noreferrer" className="cert-card-pop" style={{textDecoration:'none'}}>
                            <div style={{display:'flex', flexDirection:'column'}}>
                                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                                    <h4 style={{margin:'0 0 6px 0'}}>{r.title}</h4>
                                    <span style={{fontSize:'0.85rem', color:'#666'}}>{new URL(r.link).hostname.replace('www.','')}</span>
                                </div>
                                <p style={{margin:0, color:'#555'}}>{r.snippet}</p>
                            </div>
                        </a>
                    ))}
                </div>
            )}

            {!loading && results.length === 0 && !error && (<div style={{color:'#666', marginTop:8}}>No results yet. Try a different name or handle.</div>)}
        </div>
    );
};

// --- MAIN APP COMPONENT ---
// Defined LAST so it can access all sub-components without ReferenceErrors
export const App = () => {
    const [isInterviewLoading, setIsInterviewLoading] = useState(false);
    const [showInterviewConstructionNotice, setShowInterviewConstructionNotice] = useState(false);
    const [restoredSession, setRestoredSession] = useState<PersistedSessionState | null>(() => loadSessionState());
    const [userRole, setUserRole] = useState<'admin' | 'public' | null>(() => loadSessionState()?.userRole ?? null);
    const [currentUser, setCurrentUser] = useState<{ name: string; email: string; role: string; photo?: string; location?: string } | null>(() => loadSessionState()?.currentUser ?? null);
    const [data, setData] = useState<AppData | null>(null);
    const [loading, setLoading] = useState(true);
    const [isSidePanelOpen, setSidePanelOpen] = useState(false);
    const [isPersonalPanelOpen, setPersonalPanelOpen] = useState<boolean>(() => loadSessionState()?.isPersonalPanelOpen ?? false);
    const [isSelfDevOpen, setSelfDevOpen] = useState(false);
    const [hasSetTarget, setHasSetTarget] = useState<boolean>(() => loadSessionState()?.hasSetTarget ?? false);
    // New state for guest target tracking
    const [guestTarget, setGuestTarget] = useState<string | null>(() => loadSessionState()?.guestTarget ?? null);
    // Visitors (admin view)
    const [visitors, setVisitors] = useState<{ id?: string; name?: string; email?: string }[]>([]);
    const prevVisitorsRef = useRef<{ id?: string; name?: string; email?: string }[]>([]);
    const [showVisitors, setShowVisitors] = useState(false);
    const [showInspectCredit, setShowInspectCredit] = useState(false);
    // Selected professor id for Mine dashboard (works for admin and guests)
    const [selectedProfessorId, setSelectedProfessorId] = useState<string | null>(() => loadSessionState()?.selectedProfessorId ?? null);
    const [lastActivityAt, setLastActivityAt] = useState<number>(() => loadSessionState()?.lastActivityAt ?? Date.now());

    const [theme, setTheme] = useState<'light' | 'dark'>(() => {
        try {
            const stored = localStorage.getItem('theme');
            if (stored === 'dark' || stored === 'light') return stored as 'dark' | 'light';
            return 'light';
        } catch (e) { return 'light'; }
    });
    // Color theme state
    const [colorTheme, setColorTheme] = useState(() => localStorage.getItem('colorTheme') || 'purple');

    // Handle color theme change
    const handleColorThemeChange = (val: string) => {
        setColorTheme(val);
        localStorage.setItem('colorTheme', val);
        // Optionally, preview color immediately
        applyColorTheme(val);
    };

    // Save color theme as default
    const saveColorTheme = () => {
        localStorage.setItem('colorTheme', colorTheme);
        applyColorTheme(colorTheme);
        showToast('Color theme saved!');
    };

    // Apply color theme to document root
    const applyColorTheme = (themeName: string) => {
        const root = document.documentElement;
        // Remove all color theme classes
        root.classList.remove('theme-purple', 'theme-blue', 'theme-green', 'theme-red', 'theme-orange');
        root.classList.add(`theme-${themeName}`);
    };

    // On mount, apply saved color theme
    useEffect(() => {
        const saved = localStorage.getItem('colorTheme') || 'purple';
        setColorTheme(saved);
        applyColorTheme(saved);
    }, []);
    const [apiKey, setApiKey] = useState<string>(() => {
        try { return localStorage.getItem('PUBLIC_API_KEY') || (window as any).API_KEY || ''; } catch { return (window as any).API_KEY || ''; }
    });
    const [localApiKeyInput, setLocalApiKeyInput] = useState<string>(apiKey || '');
    // Per-section Google Custom Search key inputs (editable from Personal Panel)
    const [alumniKeyInput, setAlumniKeyInput] = useState<string>(() => localStorage.getItem('GOOGLE_SEARCH_KEY_ALUMNI') || '');
    const [alumniCxInput, setAlumniCxInput] = useState<string>(() => localStorage.getItem('GOOGLE_SEARCH_CX_ALUMNI') || '');
    const [newsKeyInput, setNewsKeyInput] = useState<string>(() => localStorage.getItem('GOOGLE_SEARCH_KEY_NEWS') || '');
    const [newsCxInput, setNewsCxInput] = useState<string>(() => localStorage.getItem('GOOGLE_SEARCH_CX_NEWS') || '');
    const [annKeyInput, setAnnKeyInput] = useState<string>(() => localStorage.getItem('GOOGLE_SEARCH_KEY_ANNOUNCEMENTS') || '');
    const [annCxInput, setAnnCxInput] = useState<string>(() => localStorage.getItem('GOOGLE_SEARCH_CX_ANNOUNCEMENTS') || '');
    const [viewStack, setViewStack] = useState<View[]>(() => loadSessionState()?.viewStack || [{ view: 'home' }]);
    const [activeModal, setActiveModal] = useState<string | null>(null); // 'add-professor', 'edit-professor', 'certificates', 'quizzes', 'alumni'
    const [editingProfessor, setEditingProfessor] = useState<Professor | null>(null);
    const [apiStatus, setApiStatus] = useState<'connecting' | 'connected' | 'offline'>('connecting');
    const showToast = useToast();

    const touchSession = useCallback(() => {
        if (!userRole || !currentUser) return;
        setLastActivityAt(Date.now());
    }, [currentUser, userRole]);

    useEffect(() => {
        if (!userRole || !currentUser) {
            saveSessionState(null);
            setRestoredSession(null);
            return;
        }

        saveSessionState({
            userRole,
            currentUser,
            viewStack,
            hasSetTarget,
            guestTarget,
            selectedProfessorId,
            isPersonalPanelOpen,
            lastActivityAt,
        });
    }, [currentUser, guestTarget, hasSetTarget, isPersonalPanelOpen, lastActivityAt, selectedProfessorId, userRole, viewStack]);

    useEffect(() => {
        if (!userRole || !currentUser) return;

        const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'click', 'focus'];
        const handleActivity = () => setLastActivityAt(Date.now());
        events.forEach((eventName) => window.addEventListener(eventName, handleActivity, { passive: true }));

        const intervalId = window.setInterval(() => {
            const staleFor = Date.now() - lastActivityAt;
            if (staleFor >= APP_INACTIVITY_LIMIT_MS) {
                try { logout().catch(() => {}); } catch (e) {}
                try {
                    if (currentUser && currentUser.email) {
                        localStorage.removeItem(`guest_target_${currentUser.email}`);
                        Object.keys(localStorage).forEach((k) => {
                            if (k.startsWith(`MINE_CUSTOM_COMPANIES_PUBLIC_`)) {
                                localStorage.removeItem(k);
                            }
                        });
                    }
                } catch (e) {}
                setUserRole(null);
                setCurrentUser(null);
                setGuestTarget(null);
                setSelectedProfessorId(null);
                setViewStack([{ view: 'home' }]);
                setPersonalPanelOpen(false);
                setHasSetTarget(false);
                setLastActivityAt(Date.now());
                setRestoredSession(null);
            }
        }, 30000);

        return () => {
            events.forEach((eventName) => window.removeEventListener(eventName, handleActivity));
            window.clearInterval(intervalId);
        };
    }, [currentUser, lastActivityAt, userRole]);

    useEffect(() => {
        if (!restoredSession || !userRole || !currentUser) return;
        setViewStack(restoredSession.viewStack);
        setGuestTarget(restoredSession.guestTarget);
        setSelectedProfessorId(restoredSession.selectedProfessorId);
        setHasSetTarget(restoredSession.hasSetTarget);
        setPersonalPanelOpen(restoredSession.isPersonalPanelOpen);
        setLastActivityAt(restoredSession.lastActivityAt || Date.now());
        setRestoredSession(null);
    }, [currentUser, restoredSession, userRole]);

    // Side Effects
    useEffect(() => {
        try {
            if (theme === 'dark') document.documentElement.setAttribute('data-theme', 'dark');
            else document.documentElement.removeAttribute('data-theme');
        } catch (e) {}
        try { localStorage.setItem('theme', theme); } catch (e) {}
    }, [theme]);

    useEffect(() => {
        let devtoolsHintUntil = 0;
        const hintDurationMs = 60000;

        const extendHint = () => {
            devtoolsHintUntil = Date.now() + hintDurationMs;
            setShowInspectCredit(true);
        };

        const detectDevtools = () => {
            const widthGap = Math.max(0, window.outerWidth - window.innerWidth);
            const heightGap = Math.max(0, window.outerHeight - window.innerHeight);
            const threshold = 85;
            const sizeBasedOpen = widthGap > threshold || heightGap > threshold;

            const hintOpen = Date.now() < devtoolsHintUntil;
            setShowInspectCredit(sizeBasedOpen || hintOpen);
        };

        const onKeyDown = (e: KeyboardEvent) => {
            const opensDevtoolsShortcut =
                e.key === 'F12' ||
                ((e.ctrlKey || e.metaKey) && e.shiftKey && ['I', 'J', 'C'].includes(e.key.toUpperCase()));
            if (opensDevtoolsShortcut) {
                extendHint();
            }
        };

        const onContextMenu = () => {
            // Right-click is the most common path to "Inspect".
            extendHint();
        };

        detectDevtools();
        const intervalId = window.setInterval(detectDevtools, 1000);
        window.addEventListener('resize', detectDevtools);
        window.addEventListener('keydown', onKeyDown);
        window.addEventListener('contextmenu', onContextMenu);

        return () => {
            window.clearInterval(intervalId);
            window.removeEventListener('resize', detectDevtools);
            window.removeEventListener('keydown', onKeyDown);
            window.removeEventListener('contextmenu', onContextMenu);
        };
    }, []);

    useEffect(() => {
        if (isPersonalPanelOpen) setLocalApiKeyInput(apiKey || '');
        if (isPersonalPanelOpen) {
            setAlumniKeyInput(localStorage.getItem('GOOGLE_SEARCH_KEY_ALUMNI') || '');
            setAlumniCxInput(localStorage.getItem('GOOGLE_SEARCH_CX_ALUMNI') || '');
            setNewsKeyInput(localStorage.getItem('GOOGLE_SEARCH_KEY_NEWS') || '');
            setNewsCxInput(localStorage.getItem('GOOGLE_SEARCH_CX_NEWS') || '');
            setAnnKeyInput(localStorage.getItem('GOOGLE_SEARCH_KEY_ANNOUNCEMENTS') || '');
            setAnnCxInput(localStorage.getItem('GOOGLE_SEARCH_CX_ANNOUNCEMENTS') || '');
        }
    }, [isPersonalPanelOpen, apiKey]);

    const handleSetGuestTarget = async (profId: string) => {
        touchSession();
        if (userRole === 'public' && currentUser) {
            let lockedTargetId = String(guestTarget || selectedProfessorId || '').trim();

            try {
                const remoteLockRes = await getGuestTargetLockByEmail(currentUser.email || '');
                const remoteTargetId = String(remoteLockRes?.data?.targetProfessorId || '').trim();
                if (remoteTargetId) {
                    lockedTargetId = remoteTargetId;
                    setGuestTarget(remoteTargetId);
                    setSelectedProfessorId(remoteTargetId);
                    setHasSetTarget(true);
                }
            } catch (e) {
                // Continue with local fallback if remote read fails.
            }

            if (lockedTargetId) {
                if (lockedTargetId !== profId) {
                    showToast('Your target is already locked and cannot be changed.');
                    return;
                }

                setGuestTarget(lockedTargetId);
                setSelectedProfessorId(lockedTargetId);
                setHasSetTarget(true);
                showToast('Your target is already selected and locked.');
                return;
            }

            setGuestTarget(profId);
            localStorage.setItem(`guest_target_${currentUser.email}`, profId);

            const profFromMap = data?.professors?.[profId];
            const profFromList = !profFromMap
                ? Object.values(data?.professors || {}).find((p: any) => p?.id === profId || p?._id === profId)
                : null;
            const targetProfessor: any = profFromMap || profFromList;
            const branchId = targetProfessor?.branch || '';
            const branchName = (branchId && data?.branches?.[branchId]?.name) || branchId || 'Unknown';

            const tokenEntry: TargetSelectionToken = {
                token: createTargetSelectionToken(),
                userName: currentUser.name || 'Unknown User',
                userEmail: currentUser.email || '',
                professorName: targetProfessor?.name || profId,
                branchName,
                professorId: profId,
                createdAt: new Date().toISOString()
            };

            const existingTokens = loadTargetSelectionTokens();
            saveTargetSelectionTokens([tokenEntry, ...existingTokens]);

            try {
                await insertGuestTargetLock({
                    name: currentUser.name || 'Unknown User',
                    email: currentUser.email || '',
                    role: currentUser.role || null,
                    photo: currentUser.photo || null,
                    location: currentUser.location || null,
                    targetProfessorId: profId,
                    targetProfessorName: targetProfessor?.name || profId,
                    branchName,
                });
            } catch (e) {
                console.warn('Failed to persist target lock to Supabase', e);
            }

            try {
                const ev = new CustomEvent('targetSelectionTokenCreated', { detail: tokenEntry });
                window.dispatchEvent(ev);
            } catch (e) { /* ignore */ }

            showToast("Target professor set permanently. 'Mine' dashboard unlocked.");
        }
        // always set selected professor id so Mine can center on it for admins too
        try { setSelectedProfessorId(profId); } catch (e) {}
        setHasSetTarget(true); // For animation/flow
    };

    // Helpers
    const togglePersonalPanel = () => setPersonalPanelOpen(p => !p);
    const closePersonalPanel = () => { setPersonalPanelOpen(false); setSelfDevOpen(false); };
    const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark');
    const saveApiKeyFromPanel = () => {
        try { localStorage.setItem('PUBLIC_API_KEY', localApiKeyInput || ''); } catch {}
        try { (window as any).API_KEY = localApiKeyInput || ''; } catch {}
        setApiKey(localApiKeyInput || '');
        showToast('API key saved.');
    };

    const saveAlumniKeysFromPanel = () => {
        try { localStorage.setItem('GOOGLE_SEARCH_KEY_ALUMNI', alumniKeyInput || ''); localStorage.setItem('GOOGLE_SEARCH_CX_ALUMNI', alumniCxInput || ''); } catch {}
        showToast('Alumni search keys saved.');
    };

    const saveNewsKeysFromPanel = () => {
        try { localStorage.setItem('GOOGLE_SEARCH_KEY_NEWS', newsKeyInput || ''); localStorage.setItem('GOOGLE_SEARCH_CX_NEWS', newsCxInput || ''); } catch {}
        showToast('News search keys saved.');
    };

    const saveAnnouncementsKeysFromPanel = () => {
        try { localStorage.setItem('GOOGLE_SEARCH_KEY_ANNOUNCEMENTS', annKeyInput || ''); localStorage.setItem('GOOGLE_SEARCH_CX_ANNOUNCEMENTS', annCxInput || ''); } catch {}
        showToast('Announcements search keys saved.');
    };

    const currentView = viewStack[viewStack.length - 1];
    const navigateTo = (view: View) => setViewStack(prev => [...prev, view]);
    const goBack = () => { if (viewStack.length > 1) setViewStack(prev => prev.slice(0, -1)); };

    const handleDataUpdate = useCallback((updater: (currentData: AppData) => AppData) => {
        setData(currentData => {
            if (!currentData) return null;
            const newData = updater(currentData);
            saveLocalData(newData);
            return newData;
        });
    }, []);

    // Handlers
    const handleAddProfessor = useCallback(async (profFormData: any) => {
        if (!data) return;
        const { branchName, departmentId, ...profCoreData } = profFormData;
        const department = data.departments.find(d => d.id === departmentId);
        if (!department) { showToast("Error: Selected department not found."); return; }

        const existingBranch = department.branches.map(bId => data.branches[bId]).find(b => b?.name.toLowerCase() === branchName.toLowerCase());
        let branchId = existingBranch ? existingBranch.id : `branch_${Date.now()}`;
        
        const profPayload: any = {
            ...profCoreData, branch: branchId, departmentId: department.id, departmentName: department.name,
            
        };

        try {
            const savedProf = await updateProfessor(profPayload);
            handleDataUpdate(currentData => {
                let updatedData = { ...currentData };
                const newProfs = { ...updatedData.professors, [savedProf._id]: { ...savedProf, id: savedProf._id } };
                return { ...updatedData, professors: newProfs };
            });
            showToast(`Professor added!`);
            setActiveModal(null);
        } catch (error: any) {
            setApiStatus('offline');
            showToast(`Failed to save professor.`);
        }
    }, [data, handleDataUpdate, showToast]);

    const handleRemoveProfessor = useCallback(async (profId: string) => {
        if (!window.confirm("Remove this professor?")) return;
        try {
            await deleteProfessor(profId);
            handleDataUpdate(d => {
                const newProfs = { ...d.professors };
                delete newProfs[profId];
                const updated = { ...d, professors: newProfs };
                saveLocalData(updated);
                return updated;
            });
            showToast("Professor removed.");
        } catch (error) { showToast("Error removing professor."); }
    }, [data, handleDataUpdate, showToast]);

    const handleRemoveDepartment = useCallback(async (deptId: string) => {
        if (!window.confirm(`Remove this department?`)) return;
        try {
            await deleteDepartment(deptId);
            handleDataUpdate(d => {
                // Remove department and all professors in that department
                const newDepartments = d.departments.filter((dep) => dep.id !== deptId);
                const newProfessors = Object.fromEntries(Object.entries(d.professors).filter(([_, p]) => p.departmentId !== deptId));
                const updated = { ...d, departments: newDepartments, professors: newProfessors };
                saveLocalData(updated);
                return updated;
            });
            showToast("Department removed.");
        } catch (error) { showToast("Error removing department."); }
    }, [handleDataUpdate, showToast]);

    const handleEditInitiate = useCallback((profId: string) => {
        if (!data) return;
        const prof = (Object.values(data.professors) as Professor[]).find(p => p.id === profId) || data.professors[profId];
        if (!prof) return;
        setEditingProfessor(prof as Professor);
        setActiveModal('edit-professor');
    }, [data]);

    const handleEditProfessor = useCallback(async (profFormData: any) => {
        if (!data) return;
        const { branchName, departmentId, id, ...rest } = profFormData;
        const department = data.departments.find(d => d.id === departmentId);
        if (!department) { showToast('Selected department not found.'); return; }

        // try to find existing branch by id or name (case-insensitive)
        const existingBranch = department.branches
            .map((bId: string) => data.branches[bId])
            .find((b: any) => b && (b.id === branchName || b.name.toLowerCase() === (branchName || '').toLowerCase()));

        let branchId = existingBranch ? existingBranch.id : `branch_${Date.now()}`;
        const isNewBranch = !existingBranch;

        const payload: any = {
            _id: id || undefined,
            id: id || undefined,
            ...rest,
            branch: branchId,
            departmentId: department.id,
            departmentName: department.name,
        };
        if (isNewBranch) payload.branchName = branchName;

        try {
            const savedProf = await updateProfessor(payload);

            handleDataUpdate(currentData => {
                let updated = { ...currentData } as AppData;
                // add new branch if created
                if (isNewBranch) {
                    const newBranch = { id: branchId, name: branchName, departmentId: department.id };
                    updated = { ...updated, branches: { ...updated.branches, [branchId]: newBranch } };
                    // also add to department.branches
                    updated = { ...updated, departments: updated.departments.map(d => d.id === department.id ? { ...d, branches: [...d.branches, branchId] } : d) };
                }

                const profs = { ...updated.professors };
                const savedId = savedProf._id || savedProf.id || id;
                profs[savedId] = { ...(savedProf as any), id: savedId };
                updated = { ...updated, professors: profs };
                return updated;
            });

            showToast(`Professor updated.`);
            setActiveModal(null);
            setEditingProfessor(null);
        } catch (err: any) {
            // network/offline fallback: persist locally
            console.warn('Update failed, saving locally', err);
            setApiStatus('offline');
            handleDataUpdate(currentData => {
                let updated = { ...currentData } as AppData;
                if (isNewBranch) {
                    const newBranch = { id: branchId, name: branchName, departmentId: department.id };
                    updated = { ...updated, branches: { ...updated.branches, [branchId]: newBranch } };
                    updated = { ...updated, departments: updated.departments.map(d => d.id === department.id ? { ...d, branches: [...d.branches, branchId] } : d) };
                }
                const profs = { ...updated.professors };
                const key = id || `local_${Date.now()}`;
                profs[key] = { ...(rest as any), id: key, branch: branchId, departmentId: department.id, departmentName: department.name };
                updated = { ...updated, professors: profs };
                try { saveLocalData(updated); } catch (e) {}
                return updated;
            });
            showToast('Professor updated locally (connected).');
            setActiveModal(null);
            setEditingProfessor(null);
        }
    }, [data, handleDataUpdate, showToast]);

    const loadData = useCallback(async () => {
        setLoading(true);
        let loadedData: AppData | null = null;
        try {
            // Try fetching from server
            const serverData: any = await fetchMockData();
            if (serverData && serverData.departments) {
                loadedData = serverData;
                setApiStatus('connected');
            } else {
                throw new Error('Invalid server data');
            }
        } catch (error) {
            console.log('Using local/fallback data due to:', error);
            setApiStatus('offline');
            // Try localStorage, else fallback
            const local = loadLocalData();
            loadedData = local || (fallbackData as unknown as AppData);
        }

        // --- MERGE FALLBACK DATA TO ENSURE ECE PROFS APPEAR ---
        // Even if we loaded data from localStorage or Server, we want to ensure
        // the hardcoded professors from seed-export (fallbackData) are present.
        if (loadedData) {
            const fb = fallbackData as unknown as AppData;
            
            // 1. Merge Departments
            const existingDeptIds = new Set(loadedData.departments.map(d => d.id));
            fb.departments.forEach(d => {
                if (!existingDeptIds.has(d.id)) {
                    loadedData!.departments.push(d);
                }
            });

            // 2. Merge Professors (simple merge: add if not exists by ID)
            // Use type assertion to handle potential index signature issues
            const currentProfs = loadedData.professors as Record<string, Professor>;
            const fallbackProfs = fb.professors as Record<string, Professor>;
            
            Object.keys(fallbackProfs).forEach(key => {
                 if (!currentProfs[key]) {
                     currentProfs[key] = fallbackProfs[key];
                     return;
                 }

                 const fallbackPhoto = String(fallbackProfs[key]?.photo || '').trim();
                 const currentPhoto = String(currentProfs[key]?.photo || '').trim();

                 // If fetched/local data has a generic/broken avatar, recover the curated fallback photo.
                 if (fallbackPhoto && isGenericProfessorPhoto(currentPhoto)) {
                     currentProfs[key] = {
                         ...currentProfs[key],
                         photo: fallbackPhoto,
                     };
                 }
            });
            
            // 3. Merge Branches
            const currentBranches = loadedData.branches as Record<string, Branch>;
            const fallbackBranches = fb.branches as Record<string, Branch>;
             Object.keys(fallbackBranches).forEach(key => {
                 if (!currentBranches[key]) {
                     currentBranches[key] = fallbackBranches[key];
                 }
            });

            const aiData = await loadAiDepartmentData();
            if (aiData) {
                const existingAiDepartments = new Set(loadedData.departments.map((d) => d.id));
                aiData.departments.forEach((dept) => {
                    if (!existingAiDepartments.has(dept.id)) {
                        loadedData.departments.push(dept);
                    }
                });

                const currentAiBranches = loadedData.branches as Record<string, Branch>;
                Object.entries(aiData.branches).forEach(([key, branch]) => {
                    if (!currentAiBranches[key]) {
                        currentAiBranches[key] = branch;
                    }
                });

                const currentAiProfessors = loadedData.professors as Record<string, Professor>;
                Object.keys(aiData.professors).forEach((key) => {
                    if (!currentAiProfessors[key]) {
                        currentAiProfessors[key] = aiData.professors[key];
                        return;
                    }

                    const existingProf = currentAiProfessors[key] as Professor;
                    const incomingProf = aiData.professors[key] as Professor;
                    const existingWebpage = String(existingProf?.links?.webpage || '').trim();
                    const incomingWebpage = String(incomingProf?.links?.webpage || '').trim();

                    if (!existingWebpage && incomingWebpage) {
                        currentAiProfessors[key] = {
                            ...existingProf,
                            links: {
                                ...(existingProf.links || { awards: '', bio: '', webpage: '' }),
                                webpage: incomingWebpage,
                            },
                        };
                    }
                });
            }
        }

        setData(loadedData);
        setLoading(false);
    }, []);

    const handleLogin = (email: string, pass: string): boolean => {
        // Admin credentials (updated)
        const ADMIN_EMAIL_1 = 'saurav.saha1984@gmail.com';
        const ADMIN_PASSWORD_1 = 'legends_reborn';
        const ADMIN_EMAIL_2 = 'admin123@gmail.com';
        const ADMIN_PASSWORD_2 = 'admin123';
        if (email === ADMIN_EMAIL_1 && pass === ADMIN_PASSWORD_1) {
            const nextUser = {
                name: 'Administrator',
                email: email || 'admin',
                role: 'System Admin',
                photo: '/photos/team.png',
            };
            setUserRole('admin');
            setCurrentUser(nextUser);
            setLastActivityAt(Date.now());
            setRestoredSession(null);
            setViewStack([{ view: 'home' }]);
            return true;
        }
        if (email === ADMIN_EMAIL_2 && pass === ADMIN_PASSWORD_2) {
            const nextUser = {
                name: 'Administrator',
                email: email || 'admin',
                role: 'System Admin',
                photo: '/photos/chandan%20behera.png',
            };
            setUserRole('admin');
            setCurrentUser(nextUser);
            setLastActivityAt(Date.now());
            setRestoredSession(null);
            setViewStack([{ view: 'home' }]);
            return true;
        }
        return false;
    };

    const handlePublicLogin = async (profile: { name: string; email: string; role?: string; photo?: string; location?: string }, pass: string): Promise<boolean> => {
        // Try to register the public user (best-effort) then track the visit so admins can see it.
        try {
            await registerPublicUser({ name: profile.name, email: profile.email, password: pass }).catch(() => {});
        } catch (e) {
            // ignore registration failures
            console.warn('Public registration failed', e);
        }

        // Attempt to insert a guest login record into Supabase (if configured)
        try {
            if (typeof insertGuestLogin === 'function') {
                const res = await insertGuestLogin({ name: profile.name, email: profile.email, role: profile.role, photo: profile.photo, location: profile.location }).catch(err => ({ error: err }));
                if (res && (res as any).error) console.warn('Supabase insertGuestLogin error', (res as any).error);
            }
        } catch (e) {
            console.warn('Supabase insert failed', e);
        }

        try {
            console.log('[debug] API base for trackVisit:', getApiBaseUrl());
            const res: any = await trackVisit({ name: profile.name, email: profile.email }).catch((err) => {
                console.warn('trackVisit fetch error', err);
                return null;
            });
            console.log('[debug] trackVisit response:', res);
            // If the server returned a new count, update global count; otherwise increment locally
            try {
                const prev = (window as any).__visitors_count__ || 0;
                const newCount = (res && typeof res.count === 'number') ? res.count : (prev + 1);
                (window as any).__visitors_count__ = newCount;
            } catch (e) { /* ignore */ }

            if (res && res.ok) {
                try { showToast(`Welcome ${profile.name}. Your visit was recorded.`); } catch (e) {}
            } else if (!res) {
                try { showToast(`Welcome ${profile.name}. Could not record visit (network).`); } catch (e) {}
            }

            // Dispatch a browser event so any admin open in the same browser can react immediately
            try {
                const visitor = (res && res.visitor) ? res.visitor : { name: profile.name, email: profile.email };
                const ev = new CustomEvent('visitorTracked', { detail: visitor });
                window.dispatchEvent(ev);
            } catch (e) { /* ignore */ }
        } catch (e) {
            console.warn('trackVisit failed', e);
        }

        let lockedTargetProfessorId: string | null = null;
        try {
            const lockRes = await getGuestTargetLockByEmail(profile.email || '');
            const lockId = String(lockRes?.data?.targetProfessorId || '').trim();
            if (lockId) lockedTargetProfessorId = lockId;
        } catch (e) {
            console.warn('Failed to read target lock on login', e);
        }

        // profile validated inside LoginPage; set app state
        setUserRole('public');
        setCurrentUser({ name: profile.name, email: profile.email, role: profile.role || 'Student at IIT ROPAR', photo: profile.photo, location: profile.location });
        setGuestTarget(lockedTargetProfessorId);
        setSelectedProfessorId(lockedTargetProfessorId);
        setHasSetTarget(!!lockedTargetProfessorId);
        setLastActivityAt(Date.now());
        setRestoredSession(null);

        if (lockedTargetProfessorId) {
            showToast('Your previously selected target is locked and restored.');
        }

        return true;
    };

    const handleLogout = () => {
        try { logout().catch(() => {}); } catch (e) {}
        // Clear all guest target and MINE section keys for this user
        try {
            if (currentUser && currentUser.email) {
                localStorage.removeItem(`guest_target_${currentUser.email}`);
                // Remove all custom companies for this user
                Object.keys(localStorage).forEach((k) => {
                    if (k.startsWith(`MINE_CUSTOM_COMPANIES_PUBLIC_`)) {
                        localStorage.removeItem(k);
                    }
                });
            }
        } catch (e) {}
        setUserRole(null);
        setCurrentUser(null);
        setGuestTarget(null);
        setSelectedProfessorId(null);
        setViewStack([{ view: 'home' }]);
        setPersonalPanelOpen(false);
        setHasSetTarget(false);
        setLastActivityAt(Date.now());
        setRestoredSession(null);
    };
        // Removed invalid block referencing 'profile' outside any function

    useEffect(() => {
        if (userRole) loadData();
    }, [userRole, loadData]);

    // Load visitors when admin; poll periodically and allow toggling via window event
    useEffect(() => {
        let interval: any = null;
        const loadVisitors = async () => {
            try {
                const res: any = await fetchVisitors();
                const vs = res && res.visitors ? res.visitors : [];

                // Identify new visitors since last poll
                try {
                    const prev = prevVisitorsRef.current || [];
                    const newOnes = vs.filter((v: any) => !prev.some(p => p.email === v.email));
                    if (newOnes.length && userRole === 'admin') {
                        newOnes.forEach((v: any) => showToast(`Guest logged in: ${v.name} (${v.email})`));
                    }
                } catch (e) { /* ignore comparison errors */ }

                setVisitors(vs);
                prevVisitorsRef.current = vs;
                try { (window as any).__visitors_count__ = vs.length; } catch (e) {}
            } catch (e) {
                console.warn('Failed to fetch visitors:', e);
            }
        };

        const toggleHandler = () => setShowVisitors(s => !s);
        const trackedHandler = (ev: any) => {
            try {
                const visitor = ev && ev.detail ? ev.detail : null;
                if (!visitor) return;
                // If admin is active in this browser, show an immediate toast and append to the list
                if (userRole === 'admin') {
                    showToast(`Guest logged in: ${visitor.name} (${visitor.email})`);
                    setVisitors(prev => {
                        const exists = prev.some(p => p.email === visitor.email);
                        if (exists) return prev;
                        const updated = [...prev, visitor];
                        prevVisitorsRef.current = updated;
                        try { (window as any).__visitors_count__ = updated.length; } catch (e) {}
                        return updated;
                    });
                }
            } catch (e) { /* ignore */ }
        };

        window.addEventListener('toggleVisitorsPanel', toggleHandler as EventListener);
        window.addEventListener('visitorTracked', trackedHandler as EventListener);

        if (userRole === 'admin') {
            loadVisitors();
            interval = setInterval(loadVisitors, 15000);
        } else {
            setVisitors([]);
            prevVisitorsRef.current = [];
            try { (window as any).__visitors_count__ = 0; } catch (e) {}
        }

        return () => {
            window.removeEventListener('toggleVisitorsPanel', toggleHandler as EventListener);
            window.removeEventListener('visitorTracked', trackedHandler as EventListener);
            if (interval) clearInterval(interval);
        };
    }, [userRole, showToast]);

    // expose a quick global count for the header button (avoids prop drilling)
    useEffect(() => { (window as any).__visitors_count__ = visitors.length; }, [visitors]);

    const refreshVisitorsNow = useCallback(async () => {
        try {
            const res: any = await fetchVisitors();
            const vs = res && res.visitors ? res.visitors : [];
            setVisitors(vs);
            prevVisitorsRef.current = vs;
            try { (window as any).__visitors_count__ = vs.length; } catch (e) {}
        } catch (e) {
            console.warn('Manual visitor refresh failed:', e);
            showToast('Unable to refresh visitors right now.');
        }
    }, [showToast]);

    const renderView = () => {
        if (loading || !data) return <div>Loading...</div>;
        switch (currentView.view) {
            case 'professor':
                const prof =
                    data.professors[currentView.id] ||
                    (Object.values(data.professors) as Professor[]).find((p) => p.id === currentView.id || p._id === currentView.id);
                return prof ? (
                    <ProfessorProfilePage 
                        professor={prof} 
                        onEditProfessor={handleEditInitiate} 
                        userRole={userRole} 
                        onSetTarget={handleSetGuestTarget}
                        onReturnHome={() => setViewStack([{ view: 'home' }])}
                        hasGuestTarget={!!guestTarget}
                        onConfirmGuestTarget={handleSetGuestTarget}
                    /> 
                ) : <div>Professor not found.</div>;
            case 'department':
                 const dept = data.departments.find(d => d.id === currentView.id);
                 return dept ? <DepartmentPage department={dept} allData={data} onNavigate={navigateTo} onRemoveProf={handleRemoveProfessor} onEditProf={handleEditInitiate} userRole={userRole} /> : <div>Department not found.</div>;
            case 'professor_directory':
                return <ProfessorDirectoryPage professors={data.professors} onNavigate={navigateTo} onAdd={() => setActiveModal('add-professor')} userRole={userRole} onEdit={handleEditInitiate} onRemove={handleRemoveProfessor} />;
            case 'home':
            default:
                return (
                    <HomePage 
                        data={data} 
                        onOpenPublicModal={(name: string) => setActiveModal(name)} 
                        onNavigate={navigateTo}
                        userRole={userRole} 
                        hasGuestTarget={!!guestTarget} 
                        targetProfessorId={selectedProfessorId || guestTarget || null}
                    />
                );
        }
    };

    const MemoizedSidePanel = useMemo(() => (
        <SidePanel
            isOpen={isSidePanelOpen}
            onClose={() => setSidePanelOpen(false)}
            departments={data?.departments || []}
            onNavigate={(view: View) => { navigateTo(view); setSidePanelOpen(false); }}
            onRemoveDepartment={handleRemoveDepartment}
            userRole={userRole}
        />
    ), [isSidePanelOpen, data?.departments, handleRemoveDepartment, userRole]);

    if (!userRole) {
        return <LoginPage onLogin={handleLogin} onPublicLogin={handlePublicLogin} theme={theme} onToggleTheme={toggleTheme} />;
    }

    if (isInterviewLoading) {
        return <InterviewLoadingScreen theme={theme} onDone={() => {
            setIsInterviewLoading(false);
            setShowInterviewConstructionNotice(true);
        }} />;
    }

    return (
        <>
            <SiteHeader 
                onMenuClick={() => setSidePanelOpen(true)} 
                onBack={goBack} 
                showBack={viewStack.length > 1} 
                apiStatus={apiStatus} 
                onLogout={handleLogout} 
                userRole={userRole} 
                onAvatarClick={() => { touchSession(); togglePersonalPanel(); }} 
                isPersonalPanelOpen={isPersonalPanelOpen} 
                theme={theme} 
                onToggleTheme={toggleTheme} 
                currentUser={currentUser} 
                onHomeClick={() => { touchSession(); setViewStack([{ view: 'home' }]); }}
                onOpenAdminPanel={() => setActiveModal('admin-dashboard')}
            />
            <main className="main-container">
                <div id="main-content">
                    {renderView()}
                </div>
            </main>
            {MemoizedSidePanel}

            {showInterviewConstructionNotice && (
                <div className="modal-overlay is-visible" role="dialog" aria-modal="true" aria-label="Interview Under Construction">
                    <div className="modal-content" style={{ maxWidth: 560 }}>
                        <h3 style={{ marginTop: 0 }}>Interview Section Update</h3>
                        <p style={{ marginBottom: '1rem', lineHeight: 1.6 }}>
                            Under Construction — interviewer  features will be available to registered users soon. Please log in to access coding tracker and progress analytics.
                        </p>
                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <button className="modal-btn primary" onClick={() => setShowInterviewConstructionNotice(false)}>OK</button>
                        </div>
                    </div>
                </div>
            )}

            {userRole === 'admin' && (
                <button type="button" aria-label="Add Professor" title="Add Professor" className="add-btn floating-add-btn" onClick={() => setActiveModal('add-professor')}>
                    Add Professor
                </button>
            )}
            {userRole === 'admin' && activeModal === 'add-professor' && (
                <AddProfessorModal onClose={() => setActiveModal(null)} onSubmit={handleAddProfessor} departments={data?.departments || []} />
            )}

            {userRole === 'admin' && activeModal === 'edit-professor' && editingProfessor && (
                <EditProfessorModal
                    professor={editingProfessor}
                    departments={data?.departments || []}
                    onClose={() => { setActiveModal(null); setEditingProfessor(null); }}
                    onSave={handleEditProfessor}
                />
            )}

            {/* Certificates Modal (Pop-out) */}
            {activeModal === 'certificates' && (
                <CertificatesModal onClose={() => setActiveModal(null)} onStartInterview={() => setIsInterviewLoading(true)} />
            )}

            {/* Quizzes Modal (Pop-out) */}
            {activeModal === 'quizzes' && (
                <QuizzesModal onClose={() => setActiveModal(null)} userRole={userRole} onStartInterview={() => setIsInterviewLoading(true)} />
            )}

            {/* Hackathons Modal (Pop-out) */}
            {activeModal === 'hackathons' && (
                <HackathonsModal onClose={() => setActiveModal(null)} />
            )}

            {/* Alumni Modal (Pop-out) */}
            {activeModal === 'alumni' && (
                <AlumniNetworkingModal onClose={() => setActiveModal(null)} userRole={userRole} />
            )}

            {/* Announcements Modal */}
            {activeModal === 'announcements' && (
                <AnnouncementsModal onClose={() => setActiveModal(null)} userRole={userRole} />
            )}

            {/* News Modal */}
            {activeModal === 'news' && (
                <NewsModal onClose={() => setActiveModal(null)} userRole={userRole} />
            )}

            {/* Admin Dashboard Modal */}
            {activeModal === 'admin-dashboard' && userRole === 'admin' && (
                <AdminDashboardModal
                    onClose={() => setActiveModal(null)}
                    visitors={visitors}
                    onVisitorsRefresh={refreshVisitorsNow}
                    onVisitorsUpdate={setVisitors}
                />
            )}

            {isPersonalPanelOpen && (
                <>
                    <div className={`personal-panel ${isPersonalPanelOpen ? 'is-open' : ''}`} role="dialog" aria-modal="true" aria-label="Personal Profile">
                        <div className="linkedin-profile-container">
                            <div className="linkedin-banner">
                                <button className="linkedin-close-btn" onClick={() => { touchSession(); closePersonalPanel(); }}>&times;</button>
                                <div className="linkedin-avatar-container">
                                    <img src={currentUser && currentUser.photo ? currentUser.photo : '/photos/team.png'} alt="Profile" draggable={false} onDragStart={preventImageDrag} />
                                </div>
                            </div>
                            
                            <div className="linkedin-header">
                                {currentUser ? (
                                    <>
                                        <h2 className="linkedin-name">{currentUser.name}</h2>
                                        <p className="linkedin-headline">{currentUser.role}</p>
                                        <div className="linkedin-location">
                                            <span>{currentUser.location || 'San Francisco Bay Area'}</span>
                                            <span>•</span>
                                            <a href="#" className="linkedin-email">{currentUser.email}</a>
                                        </div>
                                    </>
                                ) : (
                                    <p>Guest User</p>
                                )}
                            </div>

                            <div className="linkedin-section">
                                <h4 className="linkedin-section-title">Resources</h4>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    <div 
                                        className="linkedin-dashboard-card" 
                                        role="button" 
                                        onClick={() => setSelfDevOpen(true)}
                                    >
                                        <span className="linkedin-dashboard-title">Self Development</span>
                                        <span className="linkedin-dashboard-subtitle">Track your career progress and analytics</span>
                                    </div>
                                    <div 
                                        className="linkedin-dashboard-card" 
                                        role="button"
                                        onClick={() => setActiveModal('certificates')}
                                    >
                                        <span className="linkedin-dashboard-title">Certificates</span>
                                        <span className="linkedin-dashboard-subtitle">View 100+ free certification programs</span>
                                    </div>
                                    <div 
                                        className="linkedin-dashboard-card" 
                                        role="button"
                                        onClick={() => setActiveModal('alumni')}
                                    >
                                        <span className="linkedin-dashboard-title">Alumni Networking</span>
                                        <span className="linkedin-dashboard-subtitle">Connect with graduates and mentors</span>
                                    </div>
                                    <div 
                                        className="linkedin-dashboard-card" 
                                        role="button"
                                        onClick={() => setActiveModal('quizzes')}
                                    >
                                        <span className="linkedin-dashboard-title">Quizzes/Exams</span>
                                        <span className="linkedin-dashboard-subtitle">Test your knowledge and prepare</span>
                                    </div>
                                    <div
                                        className="linkedin-dashboard-card"
                                        role="button"
                                        onClick={() => { setActiveModal('hackathons'); }}
                                    >
                                        <span className="linkedin-dashboard-title">Hackathons</span>
                                        <span className="linkedin-dashboard-subtitle">Updates, PFL programs and GitHub resources</span>
                                    </div>
                                </div>
                            </div>

                            

                            {userRole && userRole !== 'public' && (
                                <div className="linkedin-section">

                                    <h4 className="linkedin-section-title">Settings</h4>

                                    <label className="linkedin-form-label">AI API Key</label>
                                    <div className="linkedin-input-row">
                                        <input 
                                            type="password" 
                                            className="linkedin-input"
                                            value={localApiKeyInput} 
                                            onChange={e => setLocalApiKeyInput(e.target.value)} 
                                            placeholder="Enter API Key" 
                                        />
                                        <button onClick={saveApiKeyFromPanel} className="linkedin-save-btn">Save</button>
                                    </div>

                                    {/* Color Theme Selection */}
                                    <label className="linkedin-form-label">Color Theme</label>
                                    <div className="linkedin-input-row" style={{alignItems:'center', gap:'0.5rem'}}>
                                        <select
                                            className="linkedin-input"
                                            value={colorTheme}
                                            onChange={e => handleColorThemeChange(e.target.value)}
                                            style={{maxWidth:180}}
                                        >
                                            <option value="purple">Purple (Default)</option>
                                            <option value="blue">Blue</option>
                                            <option value="green">Green</option>
                                            <option value="red">Red</option>
                                            <option value="orange">Orange</option>
                                        </select>
                                        <button onClick={saveColorTheme} className="linkedin-save-btn">Set as Default</button>
                                    </div>
                                    <div style={{fontSize:'0.85em', color:'#888', marginBottom:8}}>Your color preference will be used as default until you change it.</div>

                                    {/* Only show section-specific search keys to non-guest users (admins) */}
                                    <>
                                            <div style={{height:8}} />
                                            <label className="linkedin-form-label">Alumni Search Key (API)</label>
                                            <input className="linkedin-input" value={alumniKeyInput} onChange={e => setAlumniKeyInput(e.target.value)} placeholder="Alumni GOOGLE_SEARCH_KEY_ALUMNI" />
                                            <label className="linkedin-form-label">Alumni Search CX</label>
                                            <input className="linkedin-input" value={alumniCxInput} onChange={e => setAlumniCxInput(e.target.value)} placeholder="Alumni GOOGLE_SEARCH_CX_ALUMNI" />
                                            <div style={{display:'flex', justifyContent:'flex-end', marginTop:6}}><button className="linkedin-save-btn" onClick={saveAlumniKeysFromPanel}>Save Alumni Keys</button></div>

                                            <div style={{height:8}} />
                                            <label className="linkedin-form-label">News Search Key (API)</label>
                                            <input className="linkedin-input" value={newsKeyInput} onChange={e => setNewsKeyInput(e.target.value)} placeholder="News GOOGLE_SEARCH_KEY_NEWS" />
                                            <label className="linkedin-form-label">News Search CX</label>
                                            <input className="linkedin-input" value={newsCxInput} onChange={e => setNewsCxInput(e.target.value)} placeholder="News GOOGLE_SEARCH_CX_NEWS" />
                                            <div style={{display:'flex', justifyContent:'flex-end', marginTop:6}}><button className="linkedin-save-btn" onClick={saveNewsKeysFromPanel}>Save News Keys</button></div>

                                            <div style={{height:8}} />
                                            <label className="linkedin-form-label">Announcements Search Key (API)</label>
                                            <input className="linkedin-input" value={annKeyInput} onChange={e => setAnnKeyInput(e.target.value)} placeholder="Announcements GOOGLE_SEARCH_KEY_ANNOUNCEMENTS" />
                                            <label className="linkedin-form-label">Announcements Search CX</label>
                                            <input className="linkedin-input" value={annCxInput} onChange={e => setAnnCxInput(e.target.value)} placeholder="Announcements GOOGLE_SEARCH_CX_ANNOUNCEMENTS" />
                                            <div style={{display:'flex', justifyContent:'flex-end', marginTop:6}}><button className="linkedin-save-btn" onClick={saveAnnouncementsKeysFromPanel}>Save Announcements Keys</button></div>
                                    </>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="side-panel-overlay" onClick={closePersonalPanel} style={{zIndex: 4550}} />
                </>
            )}

            {isSelfDevOpen && (
                <>
                    <div className={`self-dev-panel ${isSelfDevOpen ? 'is-open' : ''}`} style={{position:'fixed', top:0, left:0, height:'100%', width:'320px', background:'white', zIndex:6001, padding:'2rem', boxShadow:'5px 0 30px rgba(0,0,0,0.1)', transform: isSelfDevOpen ? 'translateX(0)' : 'translateX(-100%)', transition: 'transform 0.3s ease'}}>
                        <div className="self-dev-header" style={{display:'flex', justifyContent:'space-between', marginBottom:'1.5rem'}}>
                            <h3>Coding Tracker</h3>
                            <button className="close-btn" onClick={() => setSelfDevOpen(false)}>&times;</button>
                        </div>
                        <div className="self-dev-body">
                            {userRole === 'public' ? (
                                <div style={{padding:'1.5rem', color:'#666'}}>Under Construction — Self Development features will be available to registered users soon. Please log in to access coding tracker and progress analytics.</div>
                            ) : (
                                <SelfDevDashboard />
                            )}
                        </div>
                    </div>
                    <div className="side-panel-overlay" onClick={() => setSelfDevOpen(false)} style={{zIndex: 6000}} />
                </>
            )}

            <Chatbot userRole={userRole} apiKey={apiKey} />
            {showVisitors && userRole === 'admin' && (
                <VisitorsModal visitors={visitors} onClose={() => setShowVisitors(false)} />
            )}
            {showInspectCredit && (
                <div className="inspect-credit" aria-hidden="true">
                    made by saurav 2024epb1279
                </div>
            )}
        </>
    );
};

// --- MOUNTING REMOVED ---
