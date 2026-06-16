import { useState, useEffect, useRef, useCallback } from "react";
import { RadialBarChart, RadialBar, ResponsiveContainer, AreaChart, Area, XAxis, Tooltip, Cell, PieChart, Pie } from "recharts";

// ─── DATA ────────────────────────────────────────────────────────────────────

const CATEGORIES = {
  transport: {
    label: "Transport", icon: "🚗", color: "#FF7B4B",
    actions: [
      { id: "car_km",      label: "Car driven",        unit: "km",    factor: 0.21,  tip: "Carpooling halves your per-km emissions instantly." },
      { id: "flight_hr",   label: "Flight hours",      unit: "hrs",   factor: 90,    tip: "One less short-haul flight saves ~200kg CO₂." },
      { id: "bus_km",      label: "Bus / metro",       unit: "km",    factor: 0.089, tip: "You're already ahead — buses emit 4× less than cars." },
      { id: "bike_km",     label: "Cycling / walking", unit: "km",    factor: 0,     tip: "Zero emissions. The gold standard." },
    ],
  },
  home: {
    label: "Home", icon: "🏠", color: "#4A9EDB",
    actions: [
      { id: "electricity_kwh", label: "Electricity",   unit: "kWh",   factor: 0.82,  tip: "LED bulbs use 75% less energy than incandescent." },
      { id: "gas_m3",          label: "Natural gas",   unit: "m³",    factor: 2.0,   tip: "Drop thermostat 1°C → save ~10% on heating bills." },
      { id: "heat_pump",       label: "Heat pump",     unit: "hrs",   factor: 0.15,  tip: "Heat pumps are 3–4× more efficient than gas boilers." },
    ],
  },
  food: {
    label: "Food", icon: "🥗", color: "#5DBE8A",
    actions: [
      { id: "beef_meals",     label: "Beef meals",     unit: "meals", factor: 6.0,   tip: "One veggie swap/week saves ~250kg CO₂ per year." },
      { id: "chicken_meals",  label: "Poultry meals",  unit: "meals", factor: 1.5,   tip: "10× lower emissions than beef per kg." },
      { id: "veg_meals",      label: "Plant-based",    unit: "meals", factor: 0.5,   tip: "Plant diets cut food-related emissions by up to 50%." },
      { id: "dairy_l",        label: "Dairy",          unit: "litres",factor: 1.3,   tip: "Oat milk: 80% less land, 60% less energy than cow milk." },
    ],
  },
  shopping: {
    label: "Shopping", icon: "🛍️", color: "#A67DC8",
    actions: [
      { id: "clothes_items",     label: "New clothes",   unit: "items", factor: 10,    tip: "Buying second-hand cuts clothing emissions by ~80%." },
      { id: "electronics_items", label: "Electronics",   unit: "items", factor: 80,    tip: "Extending device life by 1 year saves ~150kg CO₂." },
      { id: "streaming_hr",      label: "Video streaming",unit: "hrs",  factor: 0.036, tip: "Standard definition uses 4× less data than 4K." },
    ],
  },
};

const PARIS_TARGET = 2000;
const GLOBAL_AVG   = 4000;
const US_AVG       = 14000;

const allActions = Object.entries(CATEGORIES).flatMap(([cat, c]) =>
  c.actions.map(a => ({ ...a, category: cat }))
);

const ACHIEVEMENTS = [
  { id: "first_log",   icon: "🌱", label: "First Step",    desc: "Logged your first activity",     check: (logs) => logs.length >= 1 },
  { id: "below_avg",   icon: "⭐", label: "Below Average", desc: "Footprint under global average",  check: (_, total) => total > 0 && total < GLOBAL_AVG },
  { id: "paris_hero",  icon: "🏆", label: "Paris Hero",    desc: "Footprint under Paris target",   check: (_, total) => total > 0 && total < PARIS_TARGET },
  { id: "five_logs",   icon: "🔥", label: "Consistent",    desc: "Logged 5 activity snapshots",    check: (logs) => logs.length >= 5 },
  { id: "zero_beef",   icon: "🥦", label: "Green Plate",   desc: "No beef logged this session",    check: (_, __, inputs) => parseFloat(inputs?.beef_meals || 0) === 0 },
];

// ─── UTILS ───────────────────────────────────────────────────────────────────

const fmt = (val) => val >= 1000 ? `${(val / 1000).toFixed(1)}t` : `${Math.round(val)}kg`;
const clamp = (v, mn, mx) => Math.min(Math.max(v, mn), mx);

function useAnimatedNumber(target, duration = 600) {
  const [display, setDisplay] = useState(target);
  const prev = useRef(target);
  useEffect(() => {
    const start = prev.current, diff = target - start, t0 = performance.now();
    if (diff === 0) return;
    const tick = (now) => {
      const p = clamp((now - t0) / duration, 0, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setDisplay(start + diff * ease);
      if (p < 1) requestAnimationFrame(tick);
      else prev.current = target;
    };
    requestAnimationFrame(tick);
  }, [target, duration]);
  return display;
}

function useTypewriter(text, speed = 18) {
  const [shown, setShown] = useState("");
  useEffect(() => {
    if (!text) { setShown(""); return; }
    setShown("");
    let i = 0;
    const id = setInterval(() => {
      i++;
      setShown(text.slice(0, i));
      if (i >= text.length) clearInterval(id);
    }, speed);
    return () => clearInterval(id);
  }, [text]);
  return shown;
}

// ─── MINI COMPONENTS ─────────────────────────────────────────────────────────

function Toast({ toasts }) {
  return (
    <div style={{ position: "fixed", top: 16, right: 16, zIndex: 999, display: "flex", flexDirection: "column", gap: 8, pointerEvents: "none" }}>
      {toasts.map(t => (
        <div key={t.id} style={{
          background: t.type === "error" ? "#3a1a1a" : "#1a3a1a",
          border: `1px solid ${t.type === "error" ? "#8B3A3A" : "#3a7a3a"}`,
          color: t.type === "error" ? "#FF8080" : "#6BAF82",
          padding: "10px 16px", borderRadius: 10, fontSize: 13, fontWeight: 600,
          fontFamily: "'Space Grotesk',sans-serif",
          animation: "toastIn 0.25s ease", boxShadow: "0 4px 20px #00000060",
        }}>
          {t.msg}
        </div>
      ))}
    </div>
  );
}

function CircleGauge({ value, max, color }) {
  const animated = useAnimatedNumber(value);
  const r = 54, cx = 64, cy = 64, circ = 2 * Math.PI * r;
  const pct = clamp(animated / max, 0, 1);
  return (
    <svg width="128" height="128">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#162016" strokeWidth="12" />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#1e2e1e" strokeWidth="12"
        strokeDasharray={`${circ} ${circ}`} />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth="12"
        strokeDasharray={`${pct * circ} ${circ}`} strokeLinecap="round"
        transform={`rotate(-90 ${cx} ${cy})`}
        style={{ transition: "stroke-dasharray 0.7s cubic-bezier(.4,0,.2,1), stroke 0.4s" }} />
      <text x={cx} y={cy - 8} textAnchor="middle" fill="#e8f0e8" fontSize="15"
        fontWeight="700" fontFamily="'Space Grotesk',sans-serif">{fmt(animated)}</text>
      <text x={cx} y={cy + 10} textAnchor="middle" fill="#4a6a4a" fontSize="9"
        fontFamily="'Space Grotesk',sans-serif">CO₂ / year</text>
      <text x={cx} y={cy + 24} textAnchor="middle" fill={color} fontSize="8"
        fontWeight="600" fontFamily="'Space Grotesk',sans-serif">
        {pct >= 1 ? "⚠ Max" : `${Math.round(pct * 100)}% of max`}
      </text>
    </svg>
  );
}

function ProgressBar({ value, max, color, animated = true }) {
  const w = clamp((value / Math.max(max, 1)) * 100, 0, 100);
  return (
    <div style={{ height: 7, background: "#162016", borderRadius: 4, overflow: "hidden" }}>
      <div style={{
        width: `${w}%`, height: "100%", background: color, borderRadius: 4,
        transition: animated ? "width 0.5s cubic-bezier(.4,0,.2,1)" : "none",
        boxShadow: `0 0 8px ${color}60`,
      }} />
    </div>
  );
}

function Badge({ icon, label, unlocked }) {
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
      opacity: unlocked ? 1 : 0.25, transition: "opacity 0.3s",
    }}>
      <div style={{
        width: 44, height: 44, borderRadius: "50%",
        background: unlocked ? "#1a3a1a" : "#131f13",
        border: `2px solid ${unlocked ? "#3a7a3a" : "#1e2e1e"}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 20, boxShadow: unlocked ? "0 0 12px #6BAF8240" : "none",
        transition: "all 0.3s",
      }}>{icon}</div>
      <span style={{ fontSize: 9, color: unlocked ? "#6BAF82" : "#4a6a4a", textAlign: "center", fontWeight: 600, maxWidth: 50 }}>{label}</span>
    </div>
  );
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────

const TABS = [
  { label: "Log", icon: "📝" },
  { label: "Stats", icon: "📊" },
  { label: "Goals", icon: "🎯" },
  { label: "Reduce", icon: "💡" },
  { label: "AI", icon: "✦" },
];

export default function CarbonTracker() {
  const [tab, setTab]           = useState(0);
  const [inputs, setInputs]     = useState({});
  const [period, setPeriod]     = useState("week");
  const [logs, setLogs]         = useState([]);
  const [goal, setGoal]         = useState(2500);
  const [aiText, setAiText]     = useState("");
  const [aiLoading, setAiLoad]  = useState(false);
  const [toasts, setToasts]     = useState([]);
  const [expanded, setExpanded] = useState({});

  const multiplier = period === "week" ? 52 : period === "month" ? 12 : 1;

  const annualTotal = allActions.reduce((s, a) =>
    s + parseFloat(inputs[a.id] || 0) * a.factor * multiplier, 0);

  const byCategory = Object.entries(CATEGORIES).map(([key, cat]) => ({
    key, ...cat,
    total: cat.actions.reduce((s, a) =>
      s + parseFloat(inputs[a.id] || 0) * a.factor * multiplier, 0),
  }));

  const topCat = [...byCategory].sort((a, b) => b.total - a.total)[0];
  const animTotal = useAnimatedNumber(annualTotal);
  const typed = useTypewriter(aiText);

  const statusColor = annualTotal === 0 ? "#4a6a4a"
    : annualTotal < PARIS_TARGET ? "#5DBE8A"
    : annualTotal < GLOBAL_AVG  ? "#E8C45A" : "#FF7B4B";

  const unlocked = ACHIEVEMENTS.filter(a => a.check(logs, annualTotal, inputs));

  // Toast helper
  const toast = useCallback((msg, type = "success") => {
    const id = Date.now();
    setToasts(p => [...p, { id, msg, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3000);
  }, []);

  function logActivity() {
    const entries = allActions
      .filter(a => parseFloat(inputs[a.id] || 0) > 0)
      .map(a => ({ ...a, value: parseFloat(inputs[a.id]), co2: parseFloat(inputs[a.id]) * a.factor }));
    if (!entries.length) { toast("Enter at least one activity first.", "error"); return; }
    const snap = { id: Date.now(), date: new Date().toLocaleDateString("en-IN"), period, entries, total: annualTotal };
    setLogs(p => [snap, ...p.slice(0, 9)]);
    toast(`Snapshot saved — ${fmt(annualTotal)} / year`);
  }

  async function getAI() {
    if (annualTotal === 0) { toast("Log some activities first.", "error"); return; }
    setAiLoad(true); setAiText("");
    const summary = byCategory.map(c => `${c.label}: ${Math.round(c.total)}kg`).join(", ");
    const prompt = `You are a warm, data-driven sustainability coach. The user's annual carbon footprint is ${Math.round(annualTotal)}kg CO₂, split as: ${summary}. Paris target is 2,000kg; global avg 4,000kg; their personal goal is ${goal}kg.

Write exactly 3 sentences: (1) Name their single biggest source and its share of total. (2) Give ONE specific action with exact kg saved (calculated from their data). (3) A brief, energising close. No bullet points. No preamble.`;
    try {
      const res  = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-6", max_tokens: 1000, messages: [{ role: "user", content: prompt }] }),
      });
      const data = await res.json();
      setAiText(data.content?.map(b => b.text || "").join("") || "No response.");
    } catch { setAiText("Could not reach AI. Check your connection."); }
    setAiLoad(false);
  }

  // Trend data for area chart
  const trendData = [...logs].reverse().slice(-7).map((l, i) => ({
    name: l.date.slice(0, 5), val: Math.round(l.total / 1000 * 10) / 10,
  }));

  // Pie chart data
  const pieData = byCategory.filter(c => c.total > 0).map(c => ({ name: c.label, value: Math.round(c.total), fill: c.color }));

  const GF = "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Instrument+Serif:ital@0;1&display=swap";

  return (
    <>
      <style>{`
        @import url('${GF}');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { background: #080f08; height: 100%; }

        .root {
          min-height: 100vh; background: #080f08; color: #ddeedd;
          font-family: 'Space Grotesk', sans-serif;
          max-width: 430px; margin: 0 auto; position: relative;
          padding-bottom: 80px;
        }

        /* HEADER */
        .hdr {
          padding: 20px 18px 14px;
          display: flex; justify-content: space-between; align-items: center;
          border-bottom: 1px solid #121e12;
        }
        .logo {
          font-family: 'Instrument Serif', serif; font-size: 20px; color: #5DBE8A;
          letter-spacing: -0.3px;
        }
        .logo-sub { font-size: 10px; color: #2d4a2d; font-family: 'Space Grotesk',sans-serif; margin-top: 1px; }
        .streak-badge {
          background: #1a2a1a; border: 1px solid #2a3a2a; border-radius: 20px;
          padding: 5px 10px; font-size: 11px; color: #5DBE8A; font-weight: 600;
          display: flex; align-items: center; gap: 5px;
        }

        /* HERO */
        .hero {
          padding: 16px 18px; display: flex; align-items: center; justify-content: space-between;
          border-bottom: 1px solid #121e12; gap: 12px;
        }
        .hero-left { flex: 1; }
        .hero-eyebrow { font-size: 9px; color: #2d4a2d; text-transform: uppercase; letter-spacing: 0.12em; font-weight: 600; }
        .hero-num {
          font-family: 'Instrument Serif', serif; font-size: 48px; line-height: 1;
          margin: 4px 0;
        }
        .hero-unit { font-size: 13px; color: #4a6a4a; }
        .hero-pill {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 700;
          margin-top: 8px;
        }
        .goal-bar-wrap { margin-top: 10px; }
        .goal-bar-meta { display: flex; justify-content: space-between; font-size: 10px; color: #3a5a3a; margin-bottom: 4px; }

        /* PERIOD */
        .period-row { display: flex; gap: 6px; padding: 10px 18px; border-bottom: 1px solid #121e12; }
        .p-btn {
          flex: 1; padding: 7px 0; background: #111811; border: 1px solid #1e2e1e;
          color: #4a6a4a; font-family: 'Space Grotesk',sans-serif; font-size: 11px;
          font-weight: 600; border-radius: 8px; cursor: pointer; transition: all 0.15s;
        }
        .p-btn.on { background: #1a3a1a; border-color: #5DBE8A; color: #5DBE8A; }

        /* TABS */
        .tabs {
          display: flex; border-bottom: 1px solid #121e12;
          position: sticky; top: 0; background: #080f08; z-index: 30;
        }
        .tab-btn {
          flex: 1; padding: 11px 2px; background: none; border: none;
          color: #2d4a2d; font-family: 'Space Grotesk',sans-serif; font-size: 10px;
          font-weight: 600; cursor: pointer; border-bottom: 2px solid transparent;
          transition: all 0.15s; display: flex; flex-direction: column; align-items: center; gap: 2px;
        }
        .tab-btn .ticon { font-size: 14px; }
        .tab-btn.on { color: #5DBE8A; border-bottom-color: #5DBE8A; }

        /* SECTIONS */
        .sec { padding: 16px 18px; }

        /* CATEGORY ACCORDION */
        .cat-hdr {
          display: flex; align-items: center; justify-content: space-between;
          padding: 10px 0; cursor: pointer; user-select: none;
        }
        .cat-hdr-left { display: flex; align-items: center; gap: 8px; }
        .cat-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
        .cat-hdr-label { font-size: 13px; font-weight: 600; color: #c0d4c0; }
        .cat-hdr-co2 { font-size: 11px; color: #4a6a4a; font-weight: 500; }
        .cat-chevron { color: #3a5a3a; font-size: 12px; transition: transform 0.2s; }
        .cat-body { overflow: hidden; transition: max-height 0.3s ease; }
        .cat-divider { border: none; border-top: 1px solid #121e12; margin: 2px 0 8px; }

        /* FIELDS */
        .field { margin-bottom: 10px; }
        .field-lbl { display: flex; justify-content: space-between; font-size: 11px; color: #4a7a4a; margin-bottom: 5px; }
        .field-lbl span { color: #2d4a2d; }
        .input-row { display: flex; align-items: center; gap: 8px; }
        .inp {
          flex: 1; background: #111811; border: 1px solid #1a2a1a; border-radius: 8px;
          padding: 9px 12px; color: #ddeedd; font-family: 'Space Grotesk',sans-serif;
          font-size: 14px; font-weight: 600; outline: none; transition: border-color 0.15s;
          -webkit-appearance: none; appearance: none;
        }
        .inp:focus { border-color: #5DBE8A; box-shadow: 0 0 0 2px #5DBE8A18; }
        .inp::placeholder { color: #1e3a1e; }
        .inp-unit { font-size: 10px; color: #2d4a2d; width: 28px; text-align: right; flex-shrink: 0; }
        .inp-co2 { font-size: 10px; width: 56px; text-align: right; flex-shrink: 0; font-weight: 700; }

        /* BUTTONS */
        .btn-primary {
          width: 100%; padding: 13px; background: #1a4a1a; border: none; border-radius: 10px;
          color: #5DBE8A; font-family: 'Space Grotesk',sans-serif; font-size: 13px;
          font-weight: 700; cursor: pointer; transition: all 0.15s; letter-spacing: 0.02em;
        }
        .btn-primary:hover { background: #225022; box-shadow: 0 0 16px #5DBE8A20; }
        .btn-ai {
          width: 100%; padding: 13px; border-radius: 10px; cursor: pointer;
          font-family: 'Space Grotesk',sans-serif; font-size: 13px; font-weight: 700;
          background: linear-gradient(135deg, #0d1a2e 0%, #1e0d2e 100%);
          border: 1px solid #2a2a5a; color: #9090d8; transition: all 0.15s;
          margin-top: 10px; letter-spacing: 0.02em;
        }
        .btn-ai:hover:not(:disabled) { border-color: #4a4a9a; box-shadow: 0 0 20px #6060c020; color: #b0b0f0; }
        .btn-ai:disabled { opacity: 0.5; cursor: not-allowed; }

        /* CARDS */
        .card {
          background: #0e1a0e; border: 1px solid #151f15; border-radius: 12px;
          padding: 14px; margin-bottom: 10px;
        }
        .card-title {
          font-size: 9px; color: #2d4a2d; text-transform: uppercase; letter-spacing: 0.1em;
          font-weight: 700; margin-bottom: 12px;
        }

        /* STAT ROW */
        .stat-row { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
        .stat-lbl { font-size: 11px; color: #7a9a7a; width: 85px; flex-shrink: 0; }
        .stat-bar-wrap { flex: 1; }
        .stat-val { font-size: 11px; color: #9ab49a; font-weight: 600; width: 48px; text-align: right; flex-shrink: 0; }

        /* TIP CARD */
        .tip-card {
          background: #0e1a0e; border: 1px solid #151f15; border-radius: 12px;
          padding: 12px 14px; margin-bottom: 8px; display: flex; gap: 12px; align-items: flex-start;
          transition: border-color 0.15s;
        }
        .tip-card:hover { border-color: #2a3a2a; }
        .tip-icon { font-size: 20px; flex-shrink: 0; margin-top: 1px; }
        .tip-title { font-size: 12px; font-weight: 700; color: #c0d4c0; margin-bottom: 3px; }
        .tip-text { font-size: 11px; color: #5a7a5a; line-height: 1.5; }
        .tip-co2 { font-size: 10px; color: #FF7B4B; font-weight: 700; margin-top: 4px; }

        /* AI BOX */
        .ai-box {
          background: linear-gradient(140deg, #080f1e 0%, #120820 100%);
          border: 1px solid #20204a; border-radius: 12px; padding: 18px; margin-bottom: 12px;
        }
        .ai-badge {
          display: inline-flex; align-items: center; gap: 5px;
          font-size: 9px; color: #4040a0; text-transform: uppercase; letter-spacing: 0.1em;
          font-weight: 700; margin-bottom: 12px;
        }
        .ai-dot { width: 6px; height: 6px; background: #6060c0; border-radius: 50%; animation: pulse 1.5s infinite; }
        .ai-text { font-size: 13px; color: #a0a0cc; line-height: 1.75; min-height: 44px; }

        /* GOAL */
        .goal-slider { width: 100%; accent-color: #5DBE8A; cursor: pointer; }
        .goal-meta { display: flex; justify-content: space-between; font-size: 10px; color: #4a6a4a; margin-top: 6px; }

        /* ACHIEVEMENTS */
        .ach-grid { display: flex; justify-content: space-around; padding: 4px 0; }

        /* COMPARE */
        .cmp-bar {
          display: flex; align-items: center; gap: 10px; margin-bottom: 10px;
        }
        .cmp-lbl { font-size: 10px; color: #5a7a5a; width: 80px; flex-shrink: 0; }

        /* HISTORY */
        .hist-row {
          display: flex; justify-content: space-between; align-items: center;
          padding: 8px 0; border-bottom: 1px solid #121e12; font-size: 11px;
        }
        .hist-row:last-child { border-bottom: none; }
        .hist-date { color: #4a6a4a; }
        .hist-val { font-weight: 700; }

        /* PULSE */
        .pulse-dot {
          display: inline-block; width: 6px; height: 6px; background: #5DBE8A;
          border-radius: 50%; animation: pulse 1.5s infinite;
        }

        @keyframes pulse { 0%,100%{opacity:1;} 50%{opacity:.25;} }
        @keyframes toastIn { from{opacity:0;transform:translateY(-8px);} to{opacity:1;transform:translateY(0);} }
        @keyframes fadeIn  { from{opacity:0;transform:translateY(6px);} to{opacity:1;transform:translateY(0);} }
        .fade-in { animation: fadeIn 0.3s ease both; }

        /* EMPTY */
        .empty { text-align: center; padding: 48px 20px; color: #2d4a2d; font-size: 12px; line-height: 1.8; }
        .empty-icon { font-size: 36px; margin-bottom: 12px; }

        /* Custom tooltip */
        .recharts-tooltip-wrapper { outline: none !important; }
      `}</style>

      <Toast toasts={toasts} />

      <div className="root">
        {/* ── HEADER ── */}
        <div className="hdr">
          <div>
            <div className="logo">🌿 Ecostep</div>
            <div className="logo-sub">Carbon footprint tracker</div>
          </div>
          <div className="streak-badge">
            <span className="pulse-dot" /> {logs.length} snapshot{logs.length !== 1 ? "s" : ""}
          </div>
        </div>

        {/* ── HERO ── */}
        <div className="hero">
          <div className="hero-left">
            <div className="hero-eyebrow">Estimated annual CO₂</div>
            <div className="hero-num" style={{ color: statusColor }}>
              {animTotal >= 1000
                ? <>{(animTotal / 1000).toFixed(1)}<span style={{ fontSize: 22 }}>t</span></>
                : <>{Math.round(animTotal)}<span style={{ fontSize: 22 }}>kg</span></>}
            </div>
            <div className="hero-pill" style={{ background: statusColor + "18", color: statusColor }}>
              {annualTotal === 0 ? "⬤ Enter data"
                : annualTotal < PARIS_TARGET ? "🌱 Below Paris target"
                : annualTotal < GLOBAL_AVG   ? "⚠ Above Paris target"
                : "🔴 High impact"}
            </div>
            {annualTotal > 0 && (
              <div className="goal-bar-wrap">
                <div className="goal-bar-meta">
                  <span>vs goal ({fmt(goal)})</span>
                  <span style={{ color: annualTotal <= goal ? "#5DBE8A" : "#FF7B4B" }}>
                    {annualTotal <= goal ? `✓ ${fmt(goal - annualTotal)} under` : `${fmt(annualTotal - goal)} over`}
                  </span>
                </div>
                <ProgressBar value={annualTotal} max={goal * 1.5} color={annualTotal <= goal ? "#5DBE8A" : "#FF7B4B"} />
              </div>
            )}
          </div>
          <CircleGauge value={annualTotal} max={8000} color={statusColor} />
        </div>

        {/* ── PERIOD ── */}
        <div className="period-row">
          {["week", "month", "year"].map(p => (
            <button key={p} className={`p-btn ${period === p ? "on" : ""}`} onClick={() => setPeriod(p)}>
              Per {p}
            </button>
          ))}
        </div>

        {/* ── TABS ── */}
        <div className="tabs">
          {TABS.map((t, i) => (
            <button key={i} className={`tab-btn ${tab === i ? "on" : ""}`} onClick={() => setTab(i)}>
              <span className="ticon">{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>

        {/* ══════════ TAB 0: LOG ══════════ */}
        {tab === 0 && (
          <div className="sec fade-in">
            {Object.entries(CATEGORIES).map(([catKey, cat]) => {
              const catTotal = cat.actions.reduce((s, a) =>
                s + parseFloat(inputs[a.id] || 0) * a.factor * multiplier, 0);
              const open = expanded[catKey] !== false; // default open
              return (
                <div key={catKey}>
                  <div className="cat-hdr" onClick={() => setExpanded(p => ({ ...p, [catKey]: !open }))}>
                    <div className="cat-hdr-left">
                      <div className="cat-dot" style={{ background: cat.color }} />
                      <span style={{ fontSize: 16 }}>{cat.icon}</span>
                      <span className="cat-hdr-label">{cat.label}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      {catTotal > 0 && <span className="cat-hdr-co2">{fmt(catTotal)}/yr</span>}
                      <span className="cat-chevron" style={{ transform: open ? "rotate(90deg)" : "none" }}>▶</span>
                    </div>
                  </div>
                  <hr className="cat-divider" />
                  <div className="cat-body" style={{ maxHeight: open ? "600px" : "0" }}>
                    {cat.actions.map(action => {
                      const val = parseFloat(inputs[action.id] || 0);
                      const co2 = val * action.factor * multiplier;
                      return (
                        <div key={action.id} className="field">
                          <div className="field-lbl">
                            <span style={{ color: "#7a9a7a" }}>{action.label}</span>
                            <span>{action.unit} / {period}</span>
                          </div>
                          <div className="input-row">
                            <input className="inp" type="number" min="0" placeholder="0"
                              value={inputs[action.id] || ""}
                              onChange={e => setInputs(p => ({ ...p, [action.id]: e.target.value }))} />
                            <div className="inp-unit">{action.unit}</div>
                            <div className="inp-co2" style={{ color: co2 > 0 ? cat.color : "#2d4a2d" }}>
                              {co2 > 0 ? `+${fmt(co2)}` : "—"}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div style={{ marginBottom: 6 }} />
                  </div>
                </div>
              );
            })}
            <button className="btn-primary" onClick={logActivity}>Save snapshot →</button>
          </div>
        )}

        {/* ══════════ TAB 1: STATS ══════════ */}
        {tab === 1 && (
          <div className="sec fade-in">
            {annualTotal === 0 ? (
              <div className="empty"><div className="empty-icon">📊</div>Log activities to see your stats</div>
            ) : (
              <>
                {/* Category breakdown */}
                <div className="card">
                  <div className="card-title">Breakdown by category</div>
                  {byCategory.map(cat => (
                    <div key={cat.key} className="stat-row">
                      <div className="stat-lbl">{cat.icon} {cat.label}</div>
                      <div className="stat-bar-wrap">
                        <ProgressBar value={cat.total} max={Math.max(...byCategory.map(c => c.total), 1)} color={cat.color} />
                      </div>
                      <div className="stat-val" style={{ color: cat.color }}>{fmt(cat.total)}</div>
                    </div>
                  ))}
                </div>

                {/* Pie chart */}
                {pieData.length > 0 && (
                  <div className="card">
                    <div className="card-title">Share of emissions</div>
                    <ResponsiveContainer width="100%" height={160}>
                      <PieChart>
                        <Pie data={pieData} cx="50%" cy="50%" innerRadius={42} outerRadius={68}
                          paddingAngle={3} dataKey="value" stroke="none">
                          {pieData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                        </Pie>
                        <Tooltip
                          contentStyle={{ background: "#0e1a0e", border: "1px solid #1e2e1e", borderRadius: 8, fontSize: 11, color: "#c0d4c0" }}
                          formatter={(v) => [`${fmt(v)} CO₂/yr`, ""]} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px 14px", marginTop: 4 }}>
                      {pieData.map(d => (
                        <div key={d.name} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10, color: "#7a9a7a" }}>
                          <div style={{ width: 8, height: 8, borderRadius: 2, background: d.fill }} />
                          {d.name}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Comparison */}
                <div className="card">
                  <div className="card-title">Global comparison</div>
                  {[
                    { label: "You",          value: annualTotal, color: statusColor },
                    { label: "Paris target", value: PARIS_TARGET, color: "#5DBE8A" },
                    { label: "World avg",    value: GLOBAL_AVG,   color: "#E8C45A" },
                    { label: "US avg",       value: US_AVG,       color: "#FF7B4B" },
                  ].map(row => (
                    <div key={row.label} className="cmp-bar">
                      <div className="cmp-lbl">{row.label}</div>
                      <div style={{ flex: 1 }}>
                        <ProgressBar value={row.value} max={US_AVG} color={row.color} />
                      </div>
                      <div className="stat-val" style={{ color: row.color }}>{fmt(row.value)}</div>
                    </div>
                  ))}
                </div>

                {/* Trend */}
                {trendData.length > 1 && (
                  <div className="card">
                    <div className="card-title">Trend (tonnes / yr)</div>
                    <ResponsiveContainer width="100%" height={100}>
                      <AreaChart data={trendData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                        <defs>
                          <linearGradient id="tg" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%"  stopColor="#5DBE8A" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#5DBE8A" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="name" tick={{ fontSize: 9, fill: "#4a6a4a" }} axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={{ background: "#0e1a0e", border: "1px solid #1e2e1e", borderRadius: 8, fontSize: 11, color: "#c0d4c0" }} />
                        <Area type="monotone" dataKey="val" stroke="#5DBE8A" strokeWidth={2} fill="url(#tg)" dot={{ fill: "#5DBE8A", r: 3 }} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {/* History */}
                {logs.length > 0 && (
                  <div className="card">
                    <div className="card-title">Snapshot history</div>
                    {logs.slice(0, 5).map(l => (
                      <div key={l.id} className="hist-row">
                        <span className="hist-date">{l.date} · per {l.period}</span>
                        <span className="hist-val" style={{ color: statusColor }}>{fmt(l.total)}/yr</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Achievements */}
                <div className="card">
                  <div className="card-title">Achievements</div>
                  <div className="ach-grid">
                    {ACHIEVEMENTS.map(a => (
                      <Badge key={a.id} icon={a.icon} label={a.label} unlocked={unlocked.some(u => u.id === a.id)} />
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* ══════════ TAB 2: GOALS ══════════ */}
        {tab === 2 && (
          <div className="sec fade-in">
            <div className="card">
              <div className="card-title">Set your annual CO₂ goal</div>
              <div style={{ textAlign: "center", marginBottom: 16 }}>
                <span style={{ fontFamily: "'Instrument Serif',serif", fontSize: 36, color: "#5DBE8A" }}>{fmt(goal)}</span>
                <span style={{ fontSize: 12, color: "#4a6a4a", marginLeft: 6 }}>target / year</span>
              </div>
              <input className="goal-slider" type="range" min={500} max={10000} step={100}
                value={goal} onChange={e => setGoal(Number(e.target.value))} />
              <div className="goal-meta">
                <span>500kg (exceptional)</span>
                <span>10t (high)</span>
              </div>
            </div>

            {annualTotal > 0 && (
              <div className="card">
                <div className="card-title">Progress to goal</div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontSize: 12, color: "#7a9a7a" }}>Your footprint</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: statusColor }}>{fmt(annualTotal)}</span>
                </div>
                <ProgressBar value={annualTotal} max={goal * 1.5} color={annualTotal <= goal ? "#5DBE8A" : "#FF7B4B"} />
                <div style={{ marginTop: 10, fontSize: 12, color: "#5a7a5a", lineHeight: 1.6 }}>
                  {annualTotal <= goal
                    ? `✓ You are ${fmt(goal - annualTotal)} under your goal. Keep it up!`
                    : `You need to cut ${fmt(annualTotal - goal)} to hit your goal. Check the Reduce tab for ideas.`}
                </div>
              </div>
            )}

            <div className="card">
              <div className="card-title">Reference points</div>
              {[
                { label: "Paris Agreement 2030", value: 2000, note: "Global per-capita target" },
                { label: "Global average",        value: 4000, note: "Current world average" },
                { label: "India average",         value: 1800, note: "One of the lowest" },
                { label: "US average",            value: 14000, note: "One of the highest" },
              ].map(r => (
                <div key={r.label} style={{ display: "flex", justifyContent: "space-between", marginBottom: 10, alignItems: "flex-start" }}>
                  <div>
                    <div style={{ fontSize: 12, color: "#c0d4c0", fontWeight: 600 }}>{r.label}</div>
                    <div style={{ fontSize: 10, color: "#4a6a4a" }}>{r.note}</div>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#7a9a7a" }}>{fmt(r.value)}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══════════ TAB 3: REDUCE ══════════ */}
        {tab === 3 && (
          <div className="sec fade-in">
            {allActions.filter(a => parseFloat(inputs[a.id] || 0) > 0).length === 0 ? (
              <div className="empty">
                <div className="empty-icon">💡</div>
                Log your activities first —<br />we'll show you exactly where<br />to cut emissions.
              </div>
            ) : (
              <>
                <div style={{ fontSize: 11, color: "#3a5a3a", marginBottom: 14 }}>
                  Sorted by your highest-impact sources
                </div>
                {allActions
                  .filter(a => parseFloat(inputs[a.id] || 0) > 0)
                  .sort((a, b) =>
                    parseFloat(inputs[b.id] || 0) * b.factor - parseFloat(inputs[a.id] || 0) * a.factor
                  )
                  .slice(0, 8)
                  .map(action => {
                    const cat = CATEGORIES[action.category];
                    const val = parseFloat(inputs[action.id] || 0);
                    const co2 = val * action.factor * multiplier;
                    return (
                      <div key={action.id} className="tip-card">
                        <div className="tip-icon">{cat.icon}</div>
                        <div>
                          <div className="tip-title">{action.label}</div>
                          <div className="tip-text">{action.tip}</div>
                          {co2 > 0 && <div className="tip-co2">{fmt(co2)} CO₂/yr from this source</div>}
                        </div>
                      </div>
                    );
                  })}

                <div className="card" style={{ marginTop: 16 }}>
                  <div className="card-title">Carbon offset equivalent</div>
                  {[
                    { label: "Trees to plant", value: Math.ceil(annualTotal / 21), icon: "🌳", note: "to absorb your annual CO₂" },
                    { label: "Solar panels",   value: Math.ceil(annualTotal / 900), icon: "☀️", note: "to offset with clean energy" },
                  ].map(o => (
                    <div key={o.label} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                      <span style={{ fontSize: 22 }}>{o.icon}</span>
                      <div>
                        <div style={{ fontSize: 18, fontWeight: 700, color: "#5DBE8A", fontFamily: "'Instrument Serif',serif" }}>{o.value.toLocaleString()}</div>
                        <div style={{ fontSize: 11, color: "#4a6a4a" }}>{o.label} {o.note}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* ══════════ TAB 4: AI ══════════ */}
        {tab === 4 && (
          <div className="sec fade-in">
            <div className="ai-box">
              <div className="ai-badge">
                <span className="ai-dot" /> AI Coach · Claude
              </div>
              {aiLoading ? (
                <div className="ai-text" style={{ color: "#4040a0" }}>
                  <span className="pulse-dot" style={{ background: "#6060c0", marginRight: 8 }} />
                  Analysing your footprint…
                </div>
              ) : typed ? (
                <div className="ai-text">{typed}</div>
              ) : (
                <div className="ai-text" style={{ color: "#2a2a5a" }}>
                  Log your activities, then get a personalised insight based on your actual data.
                </div>
              )}
            </div>
            <button className="btn-ai" onClick={getAI} disabled={aiLoading || annualTotal === 0}>
              {aiLoading ? "Thinking…" : aiText ? "↺ New insight" : "✦ Get AI insight"}
            </button>

            {annualTotal > 0 && (
              <div className="card" style={{ marginTop: 16 }}>
                <div className="card-title">Your current snapshot</div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontSize: 12, color: "#7a9a7a" }}>Annual footprint</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: statusColor }}>{fmt(annualTotal)}</span>
                </div>
                {topCat && topCat.total > 0 && (
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                    <span style={{ fontSize: 12, color: "#7a9a7a" }}>Biggest source</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: topCat.color }}>{topCat.icon} {topCat.label} ({fmt(topCat.total)})</span>
                  </div>
                )}
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 12, color: "#7a9a7a" }}>vs. Paris target</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: annualTotal <= PARIS_TARGET ? "#5DBE8A" : "#FF7B4B" }}>
                    {annualTotal <= PARIS_TARGET ? `✓ ${fmt(PARIS_TARGET - annualTotal)} under` : `${fmt(annualTotal - PARIS_TARGET)} over`}
                  </span>
                </div>
              </div>
            )}

            <div className="card">
              <div className="card-title">Emissions facts</div>
              {[
                "A transatlantic flight emits ~600kg CO₂ — 3 months of average driving.",
                "Beef produces 20× more CO₂ per 100g protein than tofu.",
                "Switching to an EV saves ~1.5 tonnes of CO₂ per year vs. a petrol car.",
                "The average Indian emits 1.8t/yr — well below the Paris target.",
                "Data centres generate ~1% of global electricity demand.",
              ].map((f, i) => (
                <div key={i} style={{ fontSize: 11, color: "#5a7a5a", marginBottom: 9, lineHeight: 1.55, display: "flex", gap: 7 }}>
                  <span style={{ color: "#5DBE8A", flexShrink: 0 }}>→</span>{f}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
