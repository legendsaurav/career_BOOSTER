/**
 * Site Guide — a "guider" that walks new users through the Career Booster website.
 *
 * Two cooperating pieces:
 *  1. A guided TOUR: press ▶ in the chatbot and a coach-mark steps through every
 *     section, one at a time, with a short explanation.
 *  2. A secondary CURSOR: a purely-visual pointer (pointer-events:none) that
 *     - follows your real mouse while the guide is ON and idle,
 *     - takes over and glides to each highlighted section during the tour, and
 *     - points to whatever section you ask the AI about ("how do quizzes work?").
 *
 * The cursor is a fixed-position element whose coordinates are ALWAYS clamped to
 * the viewport, so it can never leave the website area.
 */
import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';

export type GuideActions = {
    home: () => void;
    openProfile: () => void;
    closeProfile: () => void;
    openMenu: () => void;
    closeMenu: () => void;
    openDirectory: () => void;
    openModal: (name: string) => void;
    closeMenuPanels: () => void;
};

export type PointSignal = { key: string | null; ts: number; act?: boolean } | null;

// A parsed instruction the cursor carries out: either navigate to a department and
// find a person, or open a component (Certificates/Alumni/…) and run its search.
export type GuideCommand = { ts: number; dept?: string | null; query?: string | null; component?: string | null } | null;

// Steps whose target is a real control the cursor can click to open a section.
const ACTIONABLE_STEP_KEYS = new Set(['menu', 'avatar', 'certs', 'alumni', 'quizzes', 'hackathons', 'selfdev']);

type Step = {
    key: string;
    selector: string;      // querySelector (comma list allowed → first match wins)
    title: string;
    body: string;
    before?: Array<Exclude<keyof GuideActions, 'openModal'>>; // App-state actions (zero-arg) to run so the target is visible
};

// The walkthrough. Steps target persistent chrome + the profile hub cards, and
// open the panels they need via `before` actions so the pointer always has a target.
export const GUIDE_STEPS: Step[] = [
    {
        key: 'welcome',
        selector: '.chatbot-window, .chatbot-fab',
        title: 'Your Career Advisor & Guide',
        body: 'Hi! I can answer questions AND walk you through the site. This glowing pointer is me — I’ll show you each part. Use Next to continue, or ✕ to stop anytime.',
        before: [],
    },
    {
        key: 'home',
        selector: '[data-guide="home"]',
        title: 'Home',
        body: 'Click the Career Booster logo at any time to return to the home page.',
        before: ['closeMenuPanels', 'home'],
    },
    {
        key: 'tabs',
        selector: '[data-guide="home-tabs"]',
        title: 'PUBLIC vs MINE',
        body: 'PUBLIC shows job announcements and tech news. MINE is your personalized dashboard — it unlocks after you pick a target professor from the directory.',
        before: ['closeMenuPanels', 'home'],
    },
    {
        key: 'menu',
        selector: '[data-guide="menu"]',
        title: 'Menu → Directory & Departments',
        body: 'Open the Menu to reach the Professor Directory and browse Departments and their faculty.',
        before: ['closeMenuPanels'],
    },
    {
        key: 'avatar',
        selector: '[data-guide="avatar"]',
        title: 'Your Profile Hub',
        body: 'The avatar (top-left) opens your profile hub: Certificates, Alumni, Quizzes, Hackathons and Self-Development. Let’s look inside…',
        before: ['closeMenuPanels'],
    },
    {
        key: 'certs',
        selector: '[data-guide="res-certificates"]',
        title: 'Free Certifications',
        body: '100+ free certification programs. Search by keyword, filter by category, and open course links provider-wise.',
        before: ['openProfile'],
    },
    {
        key: 'alumni',
        selector: '[data-guide="res-alumni"]',
        title: 'Alumni Networking',
        body: 'Find alumni and mentors by company or field to grow your network.',
        before: ['openProfile'],
    },
    {
        key: 'quizzes',
        selector: '[data-guide="res-quizzes"]',
        title: 'Quizzes & Exams',
        body: 'Practice quizzes and prep resources to get interview-ready — and you can launch an interview from here.',
        before: ['openProfile'],
    },
    {
        key: 'hackathons',
        selector: '[data-guide="res-hackathons"]',
        title: 'Hackathons',
        body: 'Hackathon updates, PFL programs, and an AI GitHub repo analyser that explains what any repository is up to.',
        before: ['openProfile'],
    },
    {
        key: 'selfdev',
        selector: '[data-guide="res-selfdev"]',
        title: 'Self Development',
        body: 'Track your coding progress and analytics over time.',
        before: ['openProfile'],
    },
    {
        key: 'ask',
        selector: '.chatbot-window, .chatbot-fab',
        title: 'Ask me anything',
        body: 'Type a question like “how do quizzes work?” and I’ll answer AND point you straight to it. That’s the end of the tour — happy exploring!',
        before: ['closeProfile'],
    },
];

// Map a free-text question to the section anchor the cursor should point at.
const SECTION_KEYWORDS: Array<[RegExp, string]> = [
    [/certificat|course|program/i, 'res-certificates'],
    [/alumni|network|mentor/i, 'res-alumni'],
    [/quiz|exam|\btest\b|practice/i, 'res-quizzes'],
    [/hackathon|repo|github|\bpfl\b/i, 'res-hackathons'],
    [/self.?develop|tracker|progress|coding track/i, 'res-selfdev'],
    [/directory|professor|faculty|teacher/i, 'menu'],
    [/department/i, 'menu'],
    [/news|announcement|public|mine|dashboard/i, 'home-tabs'],
    [/\bmenu\b|navigat/i, 'menu'],
    [/profile|avatar|account/i, 'avatar'],
    [/\bhome\b|logo/i, 'home'],
];

export function detectGuideSection(text: string): string | null {
    const t = String(text || '');
    for (const [re, key] of SECTION_KEYWORDS) if (re.test(t)) return key;
    return null;
}

// Parse an actionable instruction the cursor can carry out end-to-end.
// Recognizes "open <X> department" and/or "search for / find <name>".
export function parseGuideCommand(text: string): { dept: string | null; query: string | null } | null {
    const t = String(text || '').trim();
    const low = t.toLowerCase();
    const hasDept = /\bdepartment\b|\bdept\b/.test(low);
    const qm = t.match(/(?:search(?:\s+for)?|look\s+for|find)\s+([^]+)$/i);
    if (!hasDept && !qm) return null;

    let dept: string | null = null;
    let query: string | null = null;

    if (qm) {
        query = qm[1].replace(/[.?!]+$/, '').trim();
        // Drop honorifics so the name matches the stored professor name.
        query = query.replace(/^(professor|prof\.?|dr\.?|mr\.?|ms\.?|mrs\.?)\s+/i, '').trim() || null;
    }
    if (hasDept) {
        const dm = t.match(/(?:open|go\s*to|navigate\s*to|show(?:\s+me)?|view)\s+(.+?)\s+depart?ment/i)
            || t.match(/([a-z0-9 &.\-]+?)\s+depart?ment/i);
        if (dm) dept = dm[1].replace(/^(the|open|go to|show me|view)\s+/i, '').trim();
        if (dept) dept = dept.split(/\s+(?:and|then|,|search|find|look)\b/i)[0].trim();
    }
    if (!dept && !query) return null;
    return { dept: dept || null, query: query || null };
}

// Components the guider can open (and optionally search) from a natural-language prompt.
type ComponentSpec = {
    keys: RegExp;              // triggers that route to this component
    nameRe: RegExp;            // just the component's name words, stripped out of the query
    modal: string;             // activeModal name to open
    label: string;
    searchAnchor?: string;     // data-guide-search value of its search input (if any)
    submit?: boolean;          // whether the search runs on form submit (vs live filter)
};
export const GUIDE_COMPONENTS: Record<string, ComponentSpec> = {
    certificates: { keys: /certificat|\bcourses?\b|certification|program/i, nameRe: /certificat\w*|certification|\bcourses?\b|programs?/i, modal: 'certificates', label: 'Certificates', searchAnchor: 'certificates' },
    alumni: { keys: /alumni|alumnus|graduate|mentor/i, nameRe: /alumni|alumnus|graduates?|mentors?/i, modal: 'alumni', label: 'Alumni Networking', searchAnchor: 'alumni', submit: true },
    quizzes: { keys: /quiz|exam|mcq|practice\s+test/i, nameRe: /quiz\w*|exams?/i, modal: 'quizzes', label: 'Quizzes' },
    hackathons: { keys: /hackathon|\bpfl\b/i, nameRe: /hackathons?/i, modal: 'hackathons', label: 'Hackathons' },
    announcements: { keys: /announcement|\bjobs?\b|internship|hiring|vacanc|placement/i, nameRe: /announcements?/i, modal: 'announcements', label: 'Announcements', searchAnchor: 'jobfeed', submit: true },
    news: { keys: /\bnews\b|tech\s+news|headline/i, nameRe: /\bnews\b|headlines?/i, modal: 'news', label: 'Tech News', searchAnchor: 'jobfeed', submit: true },
};

const QUERY_STOPWORDS = new Set(['how', 'what', 'why', 'who', 'where', 'when', 'do', 'does', 'did', 'is', 'are', 'can', 'i', 'me', 'my', 'a', 'an', 'to', 'the', 'please', 'help', 'find', 'search', 'open', 'show', 'section', 'page', 'modal', 'tab', 'feed', 'feeds', 'for', 'about', 'work', 'works', 'working']);

function cleanCompQuery(raw: string, keys: RegExp): string | null {
    let q = String(raw || '')
        .replace(keys, ' ')
        .replace(/[.?!]+$/g, '')
        .replace(/\s+/g, ' ')
        .trim();
    const kept = q.split(/\s+/).filter(w => w && !QUERY_STOPWORDS.has(w.toLowerCase()));
    q = kept.join(' ').trim();
    return q || null;
}

// Parse "open/search/find <component> [for <query>]" → which component + optional query.
export function parseComponentCommand(text: string): { component: string; query: string | null; label: string } | null {
    const t = String(text || '').trim();
    const low = t.toLowerCase();
    if (!/\b(open|show|go\s*to|goto|take\s+me|navigate|launch|start|search|find|look\s+for)\b/.test(low)) return null;

    let key: string | null = null;
    for (const [k, spec] of Object.entries(GUIDE_COMPONENTS)) {
        if (spec.keys.test(low)) { key = k; break; }
    }
    if (!key) return null;
    const spec = GUIDE_COMPONENTS[key];

    let query: string | null = null;
    const prep = t.match(/\b(?:for|about|on|regarding|related\s+to|of|at|in)\s+(.+)$/i);
    if (prep) query = cleanCompQuery(prep[1], spec.nameRe);
    if (!query) {
        const sf = t.match(/\b(?:search|find|look\s+for)\s+(?:for\s+)?(.+)$/i);
        if (sf) query = cleanCompQuery(sf[1], spec.nameRe);
    }
    if (!query) query = cleanCompQuery(t, spec.nameRe);
    return { component: key, query, label: spec.label };
}

// Set a React-controlled input's value so its onChange fires (native setter + input event).
function setNativeValue(el: HTMLInputElement | HTMLTextAreaElement, value: string) {
    try {
        const proto = el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
        const desc = Object.getOwnPropertyDescriptor(proto, 'value');
        desc?.set?.call(el, value);
        el.dispatchEvent(new Event('input', { bubbles: true }));
    } catch { /* ignore */ }
}

// Find the side-panel department link whose text matches (exact → contains → all-tokens).
function findDeptLink(dept: string): HTMLElement | null {
    const q = dept.toLowerCase().trim();
    const links = Array.from(document.querySelectorAll('.side-panel .department-name')) as HTMLElement[];
    const txt = (a: HTMLElement) => (a.textContent || '').toLowerCase().trim();
    return links.find(a => txt(a) === q)
        || links.find(a => txt(a).includes(q))
        || links.find(a => q.split(/\s+/).every(tok => txt(a).includes(tok)))
        || null;
}

// Find a professor card/list-item whose text contains the queried name.
function findProfByName(query: string): HTMLElement | null {
    const q = query.toLowerCase().trim();
    const tokens = q.split(/\s+/).filter(Boolean);
    const cards = Array.from(document.querySelectorAll('#main-content .professor-card, #main-content .professor-list-item')) as HTMLElement[];
    for (const el of cards) {
        const txt = (el.textContent || '').toLowerCase();
        if (txt.includes(q) || (tokens.length > 0 && tokens.every(tok => txt.includes(tok)))) return el;
    }
    return null;
}

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

function locate(selector: string): HTMLElement | null {
    try { return document.querySelector(selector) as HTMLElement | null; } catch { return null; }
}

function selectorForKey(key: string | null | undefined): string {
    if (!key) return '';
    if (key === 'chatbot') return '.chatbot-window, .chatbot-fab';
    return `[data-guide="${key}"]`;
}

export function SiteGuideOverlay({
    active,
    stepIndex,
    onStepChange,
    onExit,
    actions,
    pointSignal,
    command,
}: {
    active: boolean;
    stepIndex: number;
    onStepChange: (i: number) => void;
    onExit: () => void;
    actions: GuideActions;
    pointSignal: PointSignal;
    command?: GuideCommand;
}) {
    const [cursor, setCursor] = useState<{ x: number; y: number }>(() => ({
        x: typeof window !== 'undefined' ? window.innerWidth / 2 : 300,
        y: typeof window !== 'undefined' ? window.innerHeight / 2 : 300,
    }));
    const [rect, setRect] = useState<{ left: number; top: number; width: number; height: number } | null>(null);
    const [pointing, setPointing] = useState(false);
    const [pointLabel, setPointLabel] = useState<string | null>(null);
    const cardRef = useRef<HTMLDivElement | null>(null);
    const [cardSize, setCardSize] = useState<{ w: number; h: number }>({ w: 300, h: 170 });
    // The element the pointer is currently over — so the cursor can actually click it.
    const targetElRef = useRef<HTMLElement | null>(null);

    const touring = active && stepIndex >= 0 && stepIndex < GUIDE_STEPS.length;
    const mode: 'off' | 'tour' | 'point' | 'follow' = !active ? 'off' : touring ? 'tour' : pointing ? 'point' : 'follow';

    // Where the pointer sits for a given element — near its top-left, clamped in-viewport.
    const cursorForRect = useCallback((r: DOMRect | { left: number; top: number; width: number; height: number }) => ({
        x: clamp(r.left + Math.min(28, r.width / 2), 6, window.innerWidth - 8),
        y: clamp(r.top + r.height / 2, 6, window.innerHeight - 8),
    }), []);

    // Actuate the element the cursor is pointing at (open a section, focus an input).
    const clickTarget = useCallback(() => {
        const el = targetElRef.current;
        if (!el) return;
        try {
            el.scrollIntoView({ block: 'center', behavior: 'smooth' });
            if (typeof (el as any).focus === 'function') (el as HTMLElement).focus({ preventScroll: true } as any);
            (el as HTMLElement).click();
        } catch { /* ignore */ }
    }, []);

    // --- Follow the real mouse while idle (clamped so it never leaves the page) ---
    useEffect(() => {
        if (mode !== 'follow') return;
        const onMove = (e: MouseEvent) => {
            setCursor({
                x: clamp(e.clientX, 0, window.innerWidth - 2),
                y: clamp(e.clientY, 0, window.innerHeight - 2),
            });
        };
        window.addEventListener('mousemove', onMove);
        return () => window.removeEventListener('mousemove', onMove);
    }, [mode]);

    // --- Tour: run before-actions, locate the target (retrying while panels animate) ---
    useEffect(() => {
        if (mode !== 'tour') return;
        const step = GUIDE_STEPS[stepIndex];
        if (!step) return;
        let cancelled = false;
        const timers: any[] = [];
        (step.before || []).forEach((name) => { try { actions[name]?.(); } catch { /* ignore */ } });

        const tryLocate = (attempt: number) => {
            if (cancelled) return;
            const el = locate(step.selector);
            if (el) {
                targetElRef.current = el;
                try { el.scrollIntoView({ block: 'center', behavior: 'smooth' }); } catch { /* ignore */ }
                const r = el.getBoundingClientRect();
                const box = { left: r.left, top: r.top, width: r.width, height: r.height };
                setRect(box);
                setCursor(cursorForRect(box));
            } else if (attempt < 6) {
                timers.push(setTimeout(() => tryLocate(attempt + 1), 200));
            } else {
                setRect(null);
                setCursor({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
            }
        };
        // Wait a beat so before-actions (panel/nav) have rendered.
        timers.push(setTimeout(() => tryLocate(0), 280));
        return () => { cancelled = true; timers.forEach(clearTimeout); };
    }, [mode, stepIndex, actions, cursorForRect]);

    // --- AI pointing: glide to the asked-about section, then fade back to follow ---
    useEffect(() => {
        if (!active || stepIndex >= 0 || !pointSignal || !pointSignal.key) return;
        const key = pointSignal.key;
        let cancelled = false;
        const timers: any[] = [];
        setPointing(true);
        setPointLabel(null);
        if (key.startsWith('res-')) { try { actions.openProfile(); } catch { /* ignore */ } }
        else if (key === 'home-tabs' || key === 'home') { try { actions.home(); } catch { /* ignore */ } }

        const selector = selectorForKey(key);
        const tryLocate = (attempt: number) => {
            if (cancelled) return;
            const el = locate(selector);
            if (el) {
                targetElRef.current = el;
                try { el.scrollIntoView({ block: 'center', behavior: 'smooth' }); } catch { /* ignore */ }
                const r = el.getBoundingClientRect();
                setRect({ left: r.left, top: r.top, width: r.width, height: r.height });
                setCursor(cursorForRect(r));
                setPointLabel('Open ›');
            } else if (attempt < 6) {
                timers.push(setTimeout(() => tryLocate(attempt + 1), 200));
            }
        };
        timers.push(setTimeout(() => tryLocate(0), key.startsWith('res-') ? 380 : 60));
        // If the user's phrasing was an action ("open/go to/show me…"), actually click it.
        if (pointSignal.act) {
            timers.push(setTimeout(() => { if (!cancelled) clickTarget(); }, key.startsWith('res-') ? 820 : 460));
        }
        // Return to mouse-follow after a few seconds.
        timers.push(setTimeout(() => {
            if (cancelled) return;
            setPointing(false);
            setPointLabel(null);
            setRect(null);
        }, 4200));
        return () => { cancelled = true; timers.forEach(clearTimeout); };
    }, [pointSignal, active, stepIndex, actions, cursorForRect, clickTarget]);

    // --- Multi-step command: open a department, then find/search a person, step by step ---
    useEffect(() => {
        if (!active || !command || !command.ts) return;
        let cancelled = false;
        const wait = (ms: number) => new Promise<void>((res) => setTimeout(res, ms));
        const focusEl = (el: HTMLElement | null) => {
            if (!el) return;
            targetElRef.current = el;
            try { el.scrollIntoView({ block: 'center', behavior: 'smooth' }); } catch { /* ignore */ }
            const r = el.getBoundingClientRect();
            setRect({ left: r.left, top: r.top, width: r.width, height: r.height });
            setCursor(cursorForRect(r));
        };
        const findRetry = async (selector: string, tries = 8, gap = 180): Promise<HTMLElement | null> => {
            for (let i = 0; i < tries; i++) {
                const el = document.querySelector(selector) as HTMLElement | null;
                if (el) return el;
                await wait(gap);
                if (cancelled) return null;
            }
            return null;
        };
        (async () => {
            setPointing(true);
            setPointLabel(null);

            // Component command: open a modal (Certificates/Alumni/Quizzes/…) and run its search.
            if (command.component) {
                const spec = GUIDE_COMPONENTS[command.component];
                if (spec) {
                    actions.closeMenuPanels();
                    actions.openModal(spec.modal);
                    await wait(150); if (cancelled) return;
                    if (spec.searchAnchor) {
                        const input = await findRetry(`[data-guide-search="${spec.searchAnchor}"]`);
                        if (cancelled) return;
                        if (input) {
                            focusEl(input);
                            if (command.query) {
                                await wait(350); if (cancelled) return;
                                setNativeValue(input as HTMLInputElement, command.query);
                                setPointLabel('Searching…');
                                await wait(350); if (cancelled) return;
                                if (spec.submit) {
                                    const form = input.closest('form') as HTMLFormElement | null;
                                    try {
                                        if (form && typeof form.requestSubmit === 'function') form.requestSubmit();
                                        else if (form) form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
                                    } catch { /* ignore */ }
                                }
                            }
                        }
                    }
                }
                await wait(2600); if (cancelled) return;
                setPointing(false);
                setPointLabel(null);
                setRect(null);
                return;
            }

            // 1) Open the requested department from the Menu.
            if (command.dept) {
                actions.openMenu();
                await wait(450); if (cancelled) return;
                const link = findDeptLink(command.dept);
                if (link) {
                    focusEl(link);
                    await wait(700); if (cancelled) return;
                    try { link.click(); } catch { /* ignore */ }
                    await wait(650); if (cancelled) return;
                } else {
                    actions.closeMenuPanels();
                    await wait(150);
                }
            }
            if (cancelled) return;

            // 2) Find the person — first on the current page, else via the Directory search.
            if (command.query) {
                let card = findProfByName(command.query);
                if (!card) {
                    actions.closeMenuPanels();
                    actions.openDirectory();
                    await wait(550); if (cancelled) return;
                    const input = document.querySelector('#main-content .section-title-bar input') as HTMLInputElement | null;
                    if (input) {
                        focusEl(input);
                        await wait(300); if (cancelled) return;
                        setNativeValue(input, command.query);
                        await wait(600); if (cancelled) return;
                    }
                    card = findProfByName(command.query);
                }
                if (card) {
                    focusEl(card);
                    setPointLabel('Open ›');
                    await wait(650); if (cancelled) return;
                    try { card.click(); } catch { /* ignore */ }
                } else {
                    setPointLabel('Not found');
                    await wait(1800);
                }
            }
            if (cancelled) return;

            await wait(2200); if (cancelled) return;
            setPointing(false);
            setPointLabel(null);
            setRect(null);
        })();
        return () => { cancelled = true; };
    }, [command, active, actions, cursorForRect]);

    // --- Keep the highlight glued to the target on scroll/resize ---
    useEffect(() => {
        if (mode !== 'tour' && mode !== 'point') return;
        const selector = touring ? GUIDE_STEPS[stepIndex]?.selector : selectorForKey(pointSignal?.key);
        if (!selector) return;
        const reposition = () => {
            const el = locate(selector);
            if (!el) return;
            const r = el.getBoundingClientRect();
            const box = { left: r.left, top: r.top, width: r.width, height: r.height };
            setRect(box);
            setCursor(cursorForRect(box));
        };
        window.addEventListener('scroll', reposition, true);
        window.addEventListener('resize', reposition);
        return () => {
            window.removeEventListener('scroll', reposition, true);
            window.removeEventListener('resize', reposition);
        };
    }, [mode, stepIndex, pointSignal, touring, cursorForRect]);

    // Measure the coach-mark so we can place it without overflowing the viewport.
    useLayoutEffect(() => {
        if (cardRef.current) {
            const r = cardRef.current.getBoundingClientRect();
            if (r.width && r.height) setCardSize({ w: r.width, h: r.height });
        }
    }, [stepIndex, mode, rect]);

    if (!active) return null;

    const step = touring ? GUIDE_STEPS[stepIndex] : null;

    // Coach-mark placement: below the target if it fits, else above; always clamped.
    let cardStyle: React.CSSProperties = {};
    if (mode === 'tour') {
        const cw = cardSize.w || 300;
        const ch = cardSize.h || 170;
        let left: number;
        let top: number;
        if (rect) {
            left = clamp(rect.left, 8, window.innerWidth - cw - 8);
            const below = rect.top + rect.height + 12;
            top = below + ch <= window.innerHeight - 8
                ? below
                : clamp(rect.top - ch - 12, 8, window.innerHeight - ch - 8);
        } else {
            left = clamp(window.innerWidth / 2 - cw / 2, 8, window.innerWidth - cw - 8);
            top = clamp(window.innerHeight / 2 - ch / 2, 8, window.innerHeight - ch - 8);
        }
        cardStyle = { left, top };
    }

    const isLast = stepIndex >= GUIDE_STEPS.length - 1;

    return (
        <>
            {mode === 'tour' && rect && (
                <div
                    className="guide-spotlight"
                    style={{ left: rect.left - 8, top: rect.top - 8, width: rect.width + 16, height: rect.height + 16 }}
                />
            )}
            {mode === 'point' && rect && (
                <div
                    className="guide-spotlight ring-only"
                    style={{ left: rect.left - 8, top: rect.top - 8, width: rect.width + 16, height: rect.height + 16 }}
                />
            )}

            {mode === 'tour' && step && (
                <div className="guide-coachmark" ref={cardRef} style={cardStyle} role="dialog" aria-label="Site guide">
                    <div className="guide-coachmark-head">
                        <span className="guide-step-count">{stepIndex + 1} / {GUIDE_STEPS.length}</span>
                        <button className="guide-skip" onClick={onExit} aria-label="End guide" title="End guide">✕</button>
                    </div>
                    <h4>{step.title}</h4>
                    <p>{step.body}</p>
                    <div className="guide-coachmark-actions">
                        <button
                            className="guide-btn ghost"
                            disabled={stepIndex === 0}
                            onClick={() => onStepChange(Math.max(0, stepIndex - 1))}
                        >
                            Back
                        </button>
                        <div className="guide-actions-right">
                            {ACTIONABLE_STEP_KEYS.has(step.key) && (
                                <button className="guide-btn open" onClick={clickTarget} title="Open this section">Open ›</button>
                            )}
                            <button
                                className="guide-btn primary"
                                onClick={() => {
                                    if (isLast) { try { actions.closeMenuPanels(); } catch { /* ignore */ } onStepChange(-1); }
                                    else onStepChange(stepIndex + 1);
                                }}
                            >
                                {isLast ? 'Finish' : 'Next'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {mode === 'point' && rect && pointLabel && (
                <button
                    className="guide-point-label"
                    onClick={clickTarget}
                    title="Click to open"
                    style={{ left: clamp(rect.left, 8, window.innerWidth - 120), top: clamp(rect.top - 34, 8, window.innerHeight - 40) }}
                >
                    {pointLabel}
                </button>
            )}

            <div className={`guide-cursor ${mode}`} style={{ transform: `translate(${cursor.x}px, ${cursor.y}px)` }} aria-hidden="true">
                <span className="guide-cursor-ring" />
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                        d="M4 2 L4 19 L8.4 14.8 L11.4 21.4 L14.3 20.1 L11.3 13.7 L18 13.5 Z"
                        fill="#ffffff"
                        stroke="#4f46e5"
                        strokeWidth="1.4"
                        strokeLinejoin="round"
                    />
                </svg>
            </div>
        </>
    );
}
