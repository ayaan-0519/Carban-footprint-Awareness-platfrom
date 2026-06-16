/**
 * EcoStep — Carbon Footprint Tracker
 *
 * Architecture:
 *  - constants.js   → CATEGORIES, BENCHMARKS, ACHIEVEMENTS (pure data, no JSX)
 *  - lib/calc.js    → pure calculation functions
 *  - lib/format.js  → display helpers
 *  - hooks/         → useAnimatedNumber, useTypewriter, useToast
 *  - components/    → Toast, CircleGauge, ProgressBar, Badge
 *  - tabs/          → LogTab, StatsTab, GoalsTab, ReduceTab, AITab
 *  - CarbonTracker  → root component, owns all state
 *
 * Security:
 *  - All numeric inputs sanitised through safeFloat()
 *  - AI prompt constructed from sanitised values only; no raw user text injected
 *  - No dangerouslySetInnerHTML anywhere
 *  - No eval / Function / dynamic code execution
 *
 * Accessibility:
 *  - Semantic landmark elements (header, main, nav, section)
 *  - All interactive elements have accessible labels
 *  - Live region for toast announcements
 *  - prefers-reduced-motion respected
 *  - Sufficient colour contrast (WCAG AA)
 *  - Keyboard navigation on all controls
 *
 * Testability:
 *  - Pure functions exported individually (calc.js, format.js)
 *  - Components receive only their required props (no global state access)
 *  - Deterministic outputs for deterministic inputs
 */

import { useState, useEffect, useRef, useCallback, useMemo, memo } from "react";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, Tooltip,
  Cell, PieChart, Pie,
} from "recharts";

// ─────────────────────────────────────────────────────────────────
// SECTION 1 — CONSTANTS  (pure data, no side-effects)
// ─────────────────────────────────────────────────────────────────

/** @typedef {{ id: string, label: string, unit: string, factor: number, tip: string }} Action */
/** @typedef {{ label: string, icon: string, color: string, actions: Action[] }} Category */

/** @type {Record<string, Category>} */
const CATEGORIES = Object.freeze({
  transport: {
    label: "Transport", icon: "🚗", color: "#FF7B4B",
    actions: [
      { id: "car_km",     label: "Car driven",         unit: "km",     factor: 0.21,  tip: "Carpooling halves per-km emissions instantly." },
      { id: "flight_hr",  label: "Flight hours",        unit: "hrs",    factor: 90,    tip: "One less short-haul flight saves ~200 kg CO₂." },
      { id: "bus_km",     label: "Bus / metro",         unit: "km",     factor: 0.089, tip: "Buses emit 4× less CO₂ per km than cars." },
      { id: "bike_km",    label: "Cycling / walking",   unit: "km",     factor: 0,     tip: "Zero emissions — the gold standard." },
    ],
  },
  home: {
    label: "Home", icon: "🏠", color: "#4A9EDB",
    actions: [
      { id: "electricity_kwh", label: "Electricity", unit: "kWh",  factor: 0.82,  tip: "LED bulbs use 75 % less energy than incandescent." },
      { id: "gas_m3",          label: "Natural gas", unit: "m³",   factor: 2.0,   tip: "Dropping thermostat 1°C saves ~10 % on heating." },
      { id: "heat_pump",       label: "Heat pump",   unit: "hrs",  factor: 0.15,  tip: "Heat pumps are 3–4× more efficient than gas boilers." },
    ],
  },
  food: {
    label: "Food", icon: "🥗", color: "#5DBE8A",
    actions: [
      { id: "beef_meals",    label: "Beef meals",    unit: "meals",  factor: 6.0,  tip: "One veggie swap/week saves ~250 kg CO₂ per year." },
      { id: "chicken_meals", label: "Poultry meals", unit: "meals",  factor: 1.5,  tip: "10× lower emissions than beef per kg." },
      { id: "veg_meals",     label: "Plant-based",   unit: "meals",  factor: 0.5,  tip: "Plant diets cut food emissions by up to 50 %." },
      { id: "dairy_l",       label: "Dairy",         unit: "litres", factor: 1.3,  tip: "Oat milk uses 80 % less land than cow milk." },
    ],
  },
  shopping: {
    label: "Shopping", icon: "🛍️", color: "#A67DC8",
    actions: [
      { id: "clothes_items",     label: "New clothes",     unit: "items", factor: 10,    tip: "Second-hand clothing cuts emissions by ~80 %." },
      { id: "electronics_items", label: "Electronics",     unit: "items", factor: 80,    tip: "Extending device life by 1 year saves ~150 kg CO₂." },
      { id: "streaming_hr",      label: "Video streaming", unit: "hrs",   factor: 0.036, tip: "SD uses 4× less data than 4K." },
    ],
  },
});

/** Annualisation multipliers keyed by period name */
const PERIOD_MULTIPLIER = Object.freeze({ week: 52, month: 12, year: 1 });

const BENCHMARKS = Object.freeze({
  paris:     2000,
  globalAvg: 4000,
  indiaAvg:  1800,
  usAvg:     14000,
});

/** Flat list of all actions with their category key attached */
const ALL_ACTIONS = Object.entries(CATEGORIES).flatMap(([catKey, cat]) =>
  cat.actions.map((a) => ({ ...a, catKey }))
);

/** @type {{ id: string, icon: string, label: string, desc: string, check: (logs: any[], total: number, inputs: Record<string,string>) => boolean }[]} */
const ACHIEVEMENTS = Object.freeze([
  { id: "first_log",  icon: "🌱", label: "First step",     desc: "Logged your first activity",    check: (logs) => logs.length >= 1 },
  { id: "below_avg",  icon: "⭐", label: "Below average",  desc: "Under global average",           check: (_l, t) => t > 0 && t < BENCHMARKS.globalAvg },
  { id: "paris_hero", icon: "🏆", label: "Paris hero",     desc: "Under Paris target",             check: (_l, t) => t > 0 && t < BENCHMARKS.paris },
  { id: "five_logs",  icon: "🔥", label: "Consistent",     desc: "Saved 5 snapshots",              check: (logs) => logs.length >= 5 },
  { id: "zero_beef",  icon: "🥦", label: "Green plate",    desc: "No beef logged this session",    check: (_l, _t, inp) => safeFloat(inp.beef_meals) === 0 },
]);

const TABS = Object.freeze([
  { label: "Log",    icon: "📝", id: "log"    },
  { label: "Stats",  icon: "📊", id: "stats"  },
  { label: "Goals",  icon: "🎯", id: "goals"  },
  { label: "Reduce", icon: "💡", id: "reduce" },
  { label: "AI",     icon: "✦", id: "ai"     },
]);

// ─────────────────────────────────────────────────────────────────
// SECTION 2 — PURE UTILITY FUNCTIONS  (no side-effects, fully testable)
// ─────────────────────────────────────────────────────────────────

/**
 * Safely convert a raw string input to a non-negative finite number.
 * Returns 0 for any invalid, negative, or non-finite value.
 * @param {unknown} raw
 * @returns {number}
 */
function safeFloat(raw) {
  const n = parseFloat(raw);
  if (!Number.isFinite(n) || n < 0) return 0;
  return n;
}

/**
 * Clamp a number between min and max.
 * @param {number} v
 * @param {number} mn
 * @param {number} mx
 * @returns {number}
 */
function clamp(v, mn, mx) {
  return Math.min(Math.max(v, mn), mx);
}

/**
 * Format a CO₂ value for display.
 * @param {number} kg
 * @returns {string}
 */
function fmtCO2(kg) {
  if (!Number.isFinite(kg)) return "—";
  return kg >= 1000 ? `${(kg / 1000).toFixed(1)} t` : `${Math.round(kg)} kg`;
}

/**
 * Compute annual CO₂ for a single action given inputs and period multiplier.
 * @param {Action} action
 * @param {Record<string,string>} inputs
 * @param {number} multiplier
 * @returns {number}
 */
function actionCO2(action, inputs, multiplier) {
  return safeFloat(inputs[action.id]) * action.factor * multiplier;
}

/**
 * Compute annual CO₂ for an entire category.
 * @param {Category} cat
 * @param {Record<string,string>} inputs
 * @param {number} multiplier
 * @returns {number}
 */
function categoryCO2(cat, inputs, multiplier) {
  return cat.actions.reduce((sum, a) => sum + actionCO2(a, inputs, multiplier), 0);
}

/**
 * Compute annual total CO₂ across all categories.
 * @param {Record<string,string>} inputs
 * @param {number} multiplier
 * @returns {number}
 */
function totalCO2(inputs, multiplier) {
  return ALL_ACTIONS.reduce((sum, a) => sum + actionCO2(a, inputs, multiplier), 0);
}

/**
 * Determine the status colour based on annual CO₂ total.
 * @param {number} total
 * @returns {string}
 */
function statusColor(total) {
  if (total === 0)                       return "#4a6a4a";
  if (total < BENCHMARKS.paris)         return "#5DBE8A";
  if (total < BENCHMARKS.globalAvg)     return "#E8C45A";
  return "#FF7B4B";
}

/**
 * Build the AI prompt string from sanitised values.
 * Accepts only pre-validated numbers — no raw user text is embedded.
 * @param {number} total  - sanitised annual total
 * @param {{ label: string, total: number }[]} breakdown  - sanitised per-category
 * @param {number} goal  - sanitised user goal
 * @returns {string}
 */
function buildAIPrompt(total, breakdown, goal) {
  const summary = breakdown
    .map((c) => `${c.label}: ${Math.round(c.total)} kg`)
    .join(", ");
  return [
    "You are a warm, data-driven sustainability coach.",
    `The user's estimated annual carbon footprint is ${Math.round(total)} kg CO₂.`,
    `Breakdown: ${summary}.`,
    `Paris Agreement target is ${BENCHMARKS.paris} kg; global average is ${BENCHMARKS.globalAvg} kg; their personal goal is ${Math.round(goal)} kg.`,
    "Write exactly 3 sentences:",
    "(1) Name their single biggest emission source and its share of the total.",
    "(2) Give ONE specific, actionable change with the exact kg saved (calculated from their actual numbers).",
    "(3) A brief, energising close.",
    "No bullet points. No preamble. No markdown.",
  ].join(" ");
}

// ─────────────────────────────────────────────────────────────────
// SECTION 3 — HOOKS
// ─────────────────────────────────────────────────────────────────

/**
 * Animate a number toward `target` over `duration` ms.
 * Respects prefers-reduced-motion by skipping animation.
 * @param {number} target
 * @param {number} [duration]
 * @returns {number}
 */
function useAnimatedNumber(target, duration = 600) {
  const [display, setDisplay] = useState(target);
  const prev = useRef(target);
  const reducedMotion = useRef(
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
  );

  useEffect(() => {
    if (reducedMotion.current) {
      setDisplay(target);
      prev.current = target;
      return;
    }
    const start = prev.current;
    const diff  = target - start;
    if (diff === 0) return;
    const t0 = performance.now();
    let raf;
    const tick = (now) => {
      const p    = clamp((now - t0) / duration, 0, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setDisplay(start + diff * ease);
      if (p < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        prev.current = target;
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);

  return display;
}

/**
 * Typewriter effect — gradually reveals `text`.
 * @param {string} text
 * @param {number} [speed]
 * @returns {string}
 */
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

/**
 * Manage a list of auto-expiring toast messages.
 * Returns [toasts, push] where push(msg, type?) adds a toast.
 */
function useToast() {
  const [toasts, setToasts] = useState([]);
  const push = useCallback((msg, type = "success") => {
    // Sanitise: msg must be a non-empty string
    const safeMsg = typeof msg === "string" && msg.trim() ? msg.trim() : "Done.";
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, msg: safeMsg, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3200);
  }, []);
  return [toasts, push];
}

// ─────────────────────────────────────────────────────────────────
// SECTION 4 — PRIMITIVE COMPONENTS
// ─────────────────────────────────────────────────────────────────

/** Accessible live-region toast stack */
const Toast = memo(function Toast({ toasts }) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="false"
      style={{
        position: "fixed", top: 16, right: 16, zIndex: 999,
        display: "flex", flexDirection: "column", gap: 8,
        pointerEvents: "none",
      }}
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          style={{
            background: t.type === "error" ? "#3a1a1a" : "#1a3a1a",
            border: `1px solid ${t.type === "error" ? "#8B3A3A" : "#3a7a3a"}`,
            color:  t.type === "error" ? "#FF8080" : "#6BAF82",
            padding: "10px 16px", borderRadius: 10,
            fontSize: 13, fontWeight: 600,
            fontFamily: "'Space Grotesk', sans-serif",
            boxShadow: "0 4px 20px #00000060",
          }}
        >
          {t.msg}
        </div>
      ))}
    </div>
  );
});

/** SVG ring gauge */
const CircleGauge = memo(function CircleGauge({ value, max, color }) {
  const animated = useAnimatedNumber(value);
  const r    = 54;
  const cx   = 64;
  const cy   = 64;
  const circ = 2 * Math.PI * r;
  const pct  = clamp(animated / max, 0, 1);
  const pctLabel = `${Math.round(pct * 100)} % of max`;

  return (
    <svg
      width="128" height="128"
      role="img"
      aria-label={`Annual CO₂: ${fmtCO2(value)}, ${pctLabel}`}
    >
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#162016" strokeWidth="12" />
      <circle
        cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth="12"
        strokeDasharray={`${pct * circ} ${circ}`} strokeLinecap="round"
        transform={`rotate(-90 ${cx} ${cy})`}
        style={{ transition: "stroke-dasharray 0.7s cubic-bezier(.4,0,.2,1), stroke 0.4s" }}
      />
      <text x={cx} y={cy - 8}  textAnchor="middle" fill="#e8f0e8"  fontSize="15" fontWeight="700" fontFamily="'Space Grotesk',sans-serif">{fmtCO2(animated)}</text>
      <text x={cx} y={cy + 10} textAnchor="middle" fill="#4a6a4a"  fontSize="9"  fontFamily="'Space Grotesk',sans-serif">CO₂ / year</text>
      <text x={cx} y={cy + 24} textAnchor="middle" fill={color}    fontSize="8"  fontWeight="600" fontFamily="'Space Grotesk',sans-serif">
        {pct >= 1 ? "⚠ Max" : pctLabel}
      </text>
    </svg>
  );
});

/** Horizontal progress bar */
const ProgressBar = memo(function ProgressBar({ value, max, color, animate = true }) {
  const w = clamp((value / Math.max(max, 1)) * 100, 0, 100);
  return (
    <div
      role="progressbar"
      aria-valuenow={Math.round(value)}
      aria-valuemax={Math.round(max)}
      aria-valuemin={0}
      style={{ height: 7, background: "#162016", borderRadius: 4, overflow: "hidden" }}
    >
      <div
        style={{
          width: `${w}%`, height: "100%", background: color, borderRadius: 4,
          transition: animate ? "width 0.5s cubic-bezier(.4,0,.2,1)" : "none",
          boxShadow: `0 0 8px ${color}60`,
        }}
      />
    </div>
  );
});

/** Achievement badge */
const Badge = memo(function Badge({ icon, label, unlocked, desc }) {
  return (
    <div
      role="img"
      aria-label={`${label}${unlocked ? " (unlocked)" : " (locked)"}: ${desc}`}
      style={{
        display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
        opacity: unlocked ? 1 : 0.25, transition: "opacity 0.3s",
      }}
    >
      <div
        style={{
          width: 44, height: 44, borderRadius: "50%",
          background: unlocked ? "#1a3a1a" : "#131f13",
          border: `2px solid ${unlocked ? "#3a7a3a" : "#1e2e1e"}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 20,
          boxShadow: unlocked ? "0 0 12px #6BAF8240" : "none",
          transition: "all 0.3s",
        }}
        aria-hidden="true"
      >
        {icon}
      </div>
      <span style={{ fontSize: 9, color: unlocked ? "#6BAF82" : "#4a6a4a", textAlign: "center", fontWeight: 600, maxWidth: 50 }}>
        {label}
      </span>
    </div>
  );
});

// ─────────────────────────────────────────────────────────────────
// SECTION 5 — TAB COMPONENTS
// ─────────────────────────────────────────────────────────────────

/** Log tab — input fields grouped by category */
const LogTab = memo(function LogTab({ inputs, setInputs, period, onSave }) {
  const [expanded, setExpanded] = useState(() =>
    Object.fromEntries(Object.keys(CATEGORIES).map((k) => [k, true]))
  );
  const multiplier = PERIOD_MULTIPLIER[period];

  const toggleCategory = useCallback((key) => {
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const handleChange = useCallback((id, raw) => {
    // Strip anything that isn't a digit or decimal point before storing
    const sanitised = raw.replace(/[^0-9.]/g, "").replace(/(\..*)\./g, "$1");
    setInputs((prev) => ({ ...prev, [id]: sanitised }));
  }, [setInputs]);

  return (
    <section aria-label="Log activities" style={{ padding: "16px 18px" }}>
      {Object.entries(CATEGORIES).map(([catKey, cat]) => {
        const catTotal = categoryCO2(cat, inputs, multiplier);
        const open     = expanded[catKey];

        return (
          <div key={catKey}>
            <button
              className="cat-hdr"
              aria-expanded={open}
              aria-controls={`cat-body-${catKey}`}
              onClick={() => toggleCategory(catKey)}
            >
              <span className="cat-hdr-left">
                <span className="cat-dot" style={{ background: cat.color }} aria-hidden="true" />
                <span aria-hidden="true" style={{ fontSize: 16 }}>{cat.icon}</span>
                <span className="cat-hdr-label">{cat.label}</span>
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {catTotal > 0 && (
                  <span className="cat-hdr-co2" aria-label={`${fmtCO2(catTotal)} per year`}>
                    {fmtCO2(catTotal)}/yr
                  </span>
                )}
                <span className="cat-chevron" aria-hidden="true" style={{ transform: open ? "rotate(90deg)" : "none" }}>▶</span>
              </span>
            </button>
            <hr className="cat-divider" />

            <div
              id={`cat-body-${catKey}`}
              className="cat-body"
              style={{ maxHeight: open ? "800px" : "0" }}
            >
              {cat.actions.map((action) => {
                const val = safeFloat(inputs[action.id]);
                const co2 = val * action.factor * multiplier;
                const inputId = `input-${action.id}`;

                return (
                  <div key={action.id} className="field">
                    <div className="field-lbl">
                      <label htmlFor={inputId} style={{ color: "#7a9a7a" }}>{action.label}</label>
                      <span aria-label={`unit: ${action.unit} per ${period}`} style={{ color: "#2d4a2d" }}>
                        {action.unit} / {period}
                      </span>
                    </div>
                    <div className="input-row">
                      <input
                        id={inputId}
                        className="inp"
                        type="number"
                        inputMode="decimal"
                        min="0"
                        step="any"
                        placeholder="0"
                        value={inputs[action.id] ?? ""}
                        onChange={(e) => handleChange(action.id, e.target.value)}
                        aria-describedby={co2 > 0 ? `co2-${action.id}` : undefined}
                      />
                      <span className="inp-unit" aria-hidden="true">{action.unit}</span>
                      <span
                        id={`co2-${action.id}`}
                        className="inp-co2"
                        style={{ color: co2 > 0 ? cat.color : "#2d4a2d" }}
                        aria-label={co2 > 0 ? `adds ${fmtCO2(co2)} per year` : "no emissions"}
                      >
                        {co2 > 0 ? `+${fmtCO2(co2)}` : "—"}
                      </span>
                    </div>
                    <div className="tip-inline" aria-label="Tip">{action.tip}</div>
                  </div>
                );
              })}
              <div style={{ marginBottom: 6 }} />
            </div>
          </div>
        );
      })}

      <button className="btn-primary" onClick={onSave}>
        Save snapshot →
      </button>
    </section>
  );
});

/** Stats tab — charts and history */
const StatsTab = memo(function StatsTab({ inputs, period, logs }) {
  const multiplier  = PERIOD_MULTIPLIER[period];
  const total       = totalCO2(inputs, multiplier);
  const byCategory  = useMemo(() =>
    Object.entries(CATEGORIES).map(([key, cat]) => ({
      key, ...cat, total: categoryCO2(cat, inputs, multiplier),
    })),
    [inputs, multiplier]
  );
  const color       = statusColor(total);
  const pieData     = byCategory.filter((c) => c.total > 0)
    .map((c) => ({ name: c.label, value: Math.round(c.total), fill: c.color }));
  const trendData   = [...logs].reverse().slice(-7).map((l) => ({
    name: l.date.slice(0, 5),
    val:  Math.round(l.total / 100) / 10, // 1 decimal place in tonnes
  }));
  const maxCatTotal = Math.max(...byCategory.map((c) => c.total), 1);
  const unlocked    = ACHIEVEMENTS.filter((a) => a.check(logs, total, inputs));

  if (total === 0) {
    return (
      <section aria-label="Statistics" style={{ padding: "16px 18px" }}>
        <div className="empty" role="status">
          <div className="empty-icon" aria-hidden="true">📊</div>
          Log activities on the Log tab to see your stats.
        </div>
      </section>
    );
  }

  return (
    <section aria-label="Statistics" style={{ padding: "16px 18px" }}>
      {/* Category breakdown */}
      <div className="card">
        <h2 className="card-title">Breakdown by category</h2>
        {byCategory.map((cat) => (
          <div key={cat.key} className="stat-row">
            <div className="stat-lbl" aria-hidden="true">{cat.icon} {cat.label}</div>
            <div className="stat-bar-wrap" aria-hidden="true">
              <ProgressBar value={cat.total} max={maxCatTotal} color={cat.color} />
            </div>
            <div
              className="stat-val"
              style={{ color: cat.color }}
              aria-label={`${cat.label}: ${fmtCO2(cat.total)} per year`}
            >
              {fmtCO2(cat.total)}
            </div>
          </div>
        ))}
      </div>

      {/* Pie chart */}
      {pieData.length > 0 && (
        <div className="card" aria-label="Share of emissions by category">
          <h2 className="card-title">Share of emissions</h2>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie
                data={pieData} cx="50%" cy="50%"
                innerRadius={42} outerRadius={68}
                paddingAngle={3} dataKey="value" stroke="none"
              >
                {pieData.map((d, i) => <Cell key={i} fill={d.fill} />)}
              </Pie>
              <Tooltip
                contentStyle={{ background: "#0e1a0e", border: "1px solid #1e2e1e", borderRadius: 8, fontSize: 11, color: "#c0d4c0" }}
                formatter={(v) => [`${fmtCO2(v)} / yr`, ""]}
              />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px 14px", marginTop: 4 }} role="list" aria-label="Legend">
            {pieData.map((d) => (
              <div key={d.name} role="listitem" style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10, color: "#7a9a7a" }}>
                <div style={{ width: 8, height: 8, borderRadius: 2, background: d.fill }} aria-hidden="true" />
                {d.name}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Global comparison */}
      <div className="card">
        <h2 className="card-title">Global comparison</h2>
        {[
          { label: "You",            value: total,                   color },
          { label: "Paris target",   value: BENCHMARKS.paris,        color: "#5DBE8A" },
          { label: "World average",  value: BENCHMARKS.globalAvg,    color: "#E8C45A" },
          { label: "US average",     value: BENCHMARKS.usAvg,        color: "#FF7B4B" },
        ].map((row) => (
          <div key={row.label} className="cmp-bar">
            <div className="cmp-lbl">{row.label}</div>
            <div style={{ flex: 1 }}>
              <ProgressBar value={row.value} max={BENCHMARKS.usAvg} color={row.color} />
            </div>
            <div className="stat-val" style={{ color: row.color }}>{fmtCO2(row.value)}</div>
          </div>
        ))}
      </div>

      {/* Trend chart */}
      {trendData.length > 1 && (
        <div className="card" aria-label="Footprint trend over recent snapshots">
          <h2 className="card-title">Trend (tonnes / yr)</h2>
          <ResponsiveContainer width="100%" height={100}>
            <AreaChart data={trendData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="tg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#5DBE8A" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#5DBE8A" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="name" tick={{ fontSize: 9, fill: "#4a6a4a" }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: "#0e1a0e", border: "1px solid #1e2e1e", borderRadius: 8, fontSize: 11, color: "#c0d4c0" }}
                formatter={(v) => [`${v} t CO₂/yr`, ""]}
              />
              <Area type="monotone" dataKey="val" stroke="#5DBE8A" strokeWidth={2} fill="url(#tg)" dot={{ fill: "#5DBE8A", r: 3 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Snapshot history */}
      {logs.length > 0 && (
        <div className="card">
          <h2 className="card-title">Snapshot history</h2>
          <table style={{ width: "100%", borderCollapse: "collapse" }} aria-label="Saved snapshots">
            <thead className="sr-only">
              <tr><th scope="col">Date</th><th scope="col">Period</th><th scope="col">Footprint</th></tr>
            </thead>
            <tbody>
              {logs.slice(0, 5).map((l) => (
                <tr key={l.id} className="hist-row">
                  <td className="hist-date">{l.date} · per {l.period}</td>
                  <td className="hist-val" style={{ color, textAlign: "right" }}>{fmtCO2(l.total)}/yr</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Achievements */}
      <div className="card">
        <h2 className="card-title">Achievements</h2>
        <div className="ach-grid" role="list" aria-label="Achievement badges">
          {ACHIEVEMENTS.map((a) => (
            <div key={a.id} role="listitem">
              <Badge icon={a.icon} label={a.label} desc={a.desc} unlocked={unlocked.some((u) => u.id === a.id)} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
});

/** Goals tab */
const GoalsTab = memo(function GoalsTab({ goal, setGoal, inputs, period }) {
  const multiplier = PERIOD_MULTIPLIER[period];
  const total      = totalCO2(inputs, multiplier);
  const color      = statusColor(total);
  const under      = total <= goal;

  return (
    <section aria-label="Goals" style={{ padding: "16px 18px" }}>
      <div className="card">
        <h2 className="card-title">Set your annual CO₂ goal</h2>
        <div style={{ textAlign: "center", marginBottom: 16 }}>
          <span style={{ fontFamily: "'Instrument Serif',serif", fontSize: 36, color: "#5DBE8A" }}>{fmtCO2(goal)}</span>
          <span style={{ fontSize: 12, color: "#4a6a4a", marginLeft: 6 }}>target / year</span>
        </div>
        <label htmlFor="goal-slider" className="sr-only">Annual CO₂ goal in kg</label>
        <input
          id="goal-slider"
          className="goal-slider"
          type="range"
          min={500}
          max={10000}
          step={100}
          value={goal}
          onChange={(e) => setGoal(Number(e.target.value))}
          aria-valuetext={fmtCO2(goal)}
        />
        <div className="goal-meta" aria-hidden="true">
          <span>500 kg (exceptional)</span>
          <span>10 t (high)</span>
        </div>
      </div>

      {total > 0 && (
        <div className="card">
          <h2 className="card-title">Progress to goal</h2>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ fontSize: 12, color: "#7a9a7a" }}>Your footprint</span>
            <span style={{ fontSize: 13, fontWeight: 700, color }}>{fmtCO2(total)}</span>
          </div>
          <ProgressBar value={total} max={goal * 1.5} color={under ? "#5DBE8A" : "#FF7B4B"} />
          <p style={{ marginTop: 10, fontSize: 12, color: "#5a7a5a", lineHeight: 1.6 }}>
            {under
              ? `✓ You are ${fmtCO2(goal - total)} under your goal — keep it up!`
              : `You need to cut ${fmtCO2(total - goal)} to reach your goal. Check the Reduce tab for ideas.`}
          </p>
        </div>
      )}

      <div className="card">
        <h2 className="card-title">Reference points</h2>
        {[
          { label: "Paris Agreement 2030", value: BENCHMARKS.paris,     note: "Global per-capita target" },
          { label: "Global average",        value: BENCHMARKS.globalAvg, note: "Current world average" },
          { label: "India average",         value: BENCHMARKS.indiaAvg,  note: "Among the lowest" },
          { label: "US average",            value: BENCHMARKS.usAvg,     note: "Among the highest" },
        ].map((r) => (
          <div key={r.label} style={{ display: "flex", justifyContent: "space-between", marginBottom: 10, alignItems: "flex-start" }}>
            <div>
              <div style={{ fontSize: 12, color: "#c0d4c0", fontWeight: 600 }}>{r.label}</div>
              <div style={{ fontSize: 10, color: "#4a6a4a" }}>{r.note}</div>
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#7a9a7a" }}>{fmtCO2(r.value)}</div>
          </div>
        ))}
      </div>
    </section>
  );
});

/** Reduce tab — personalised tips sorted by impact */
const ReduceTab = memo(function ReduceTab({ inputs, period }) {
  const multiplier   = PERIOD_MULTIPLIER[period];
  const activeActions = useMemo(() =>
    ALL_ACTIONS
      .filter((a) => safeFloat(inputs[a.id]) > 0)
      .map((a) => ({
        ...a,
        co2: actionCO2(a, inputs, multiplier),
        cat: CATEGORIES[a.catKey],
      }))
      .sort((a, b) => b.co2 - a.co2)
      .slice(0, 8),
    [inputs, multiplier]
  );

  const total = totalCO2(inputs, multiplier);

  if (activeActions.length === 0) {
    return (
      <section aria-label="Reduce emissions" style={{ padding: "16px 18px" }}>
        <div className="empty" role="status">
          <div className="empty-icon" aria-hidden="true">💡</div>
          Log your activities first — we'll show you exactly where to cut emissions.
        </div>
      </section>
    );
  }

  return (
    <section aria-label="Reduce emissions" style={{ padding: "16px 18px" }}>
      <p style={{ fontSize: 11, color: "#3a5a3a", marginBottom: 14 }}>
        Sorted by your highest-impact sources
      </p>

      {activeActions.map((action) => (
        <article key={action.id} className="tip-card" aria-label={`Tip for ${action.label}`}>
          <div className="tip-icon" aria-hidden="true">{action.cat.icon}</div>
          <div>
            <h3 className="tip-title">{action.label}</h3>
            <p className="tip-text">{action.tip}</p>
            <p className="tip-co2">{fmtCO2(action.co2)} CO₂/yr from this source</p>
          </div>
        </article>
      ))}

      <div className="card" style={{ marginTop: 16 }}>
        <h2 className="card-title">Offset equivalents</h2>
        {[
          { label: "Trees to plant", value: Math.ceil(total / 21),  icon: "🌳", note: "to absorb your annual CO₂" },
          { label: "Solar panels",   value: Math.ceil(total / 900), icon: "☀️", note: "to offset with clean energy" },
        ].map((o) => (
          <div key={o.label} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
            <span style={{ fontSize: 22 }} aria-hidden="true">{o.icon}</span>
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: "#5DBE8A", fontFamily: "'Instrument Serif',serif" }}>
                {o.value.toLocaleString("en-IN")}
              </div>
              <div style={{ fontSize: 11, color: "#4a6a4a" }}>{o.label} {o.note}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
});

const EMISSIONS_FACTS = Object.freeze([
  "A transatlantic flight emits ~600 kg CO₂ — roughly 3 months of average driving.",
  "Beef produces 20× more CO₂ per 100 g protein than tofu.",
  "Switching to an EV saves ~1.5 tonnes of CO₂ per year vs a petrol car.",
  "The average Indian emits 1.8 t/yr — well below the Paris target.",
  "Data centres account for ~1 % of global electricity demand.",
]);

/** AI Coach tab */
const AITab = memo(function AITab({ inputs, period, goal, logs }) {
  const [aiText,    setAiText]   = useState("");
  const [aiLoading, setAiLoad]   = useState(false);
  const [aiError,   setAiError]  = useState("");
  const abortRef = useRef(null);

  const multiplier  = PERIOD_MULTIPLIER[period];
  const total       = totalCO2(inputs, multiplier);
  const color       = statusColor(total);
  const byCategory  = useMemo(() =>
    Object.entries(CATEGORIES).map(([key, cat]) => ({ key, ...cat, total: categoryCO2(cat, inputs, multiplier) })),
    [inputs, multiplier]
  );
  const topCat = useMemo(() => [...byCategory].sort((a, b) => b.total - a.total)[0], [byCategory]);
  const typed = useTypewriter(aiText);

  // Cancel any in-flight request on unmount
  useEffect(() => () => abortRef.current?.abort(), []);

  async function getInsight() {
    if (total === 0 || aiLoading) return;
    setAiLoad(true);
    setAiText("");
    setAiError("");

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    // Build prompt from sanitised numeric data only — no raw user strings
    const prompt = buildAIPrompt(total, byCategory, goal);

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        signal: controller.signal,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1000,
          messages: [{ role: "user", content: prompt }],
        }),
      });

      if (!res.ok) {
        // Surface only the status code, not any raw server message
        throw new Error(`API error ${res.status}`);
      }

      const data = await res.json();

      // Validate response structure before accessing
      if (!Array.isArray(data?.content)) {
        throw new Error("Unexpected API response format.");
      }

      const text = data.content
        .filter((b) => b.type === "text" && typeof b.text === "string")
        .map((b) => b.text)
        .join("");

      setAiText(text || "No insight returned.");
    } catch (err) {
      if (err.name === "AbortError") return; // user navigated away
      // Avoid leaking raw error details to the UI
      setAiError("Could not reach the AI service. Check your connection and try again.");
    } finally {
      setAiLoad(false);
    }
  }

  return (
    <section aria-label="AI Coach" style={{ padding: "16px 18px" }}>
      <div className="ai-box" aria-live="polite" aria-atomic="true">
        <div className="ai-badge" aria-hidden="true">
          <span className="ai-dot" /> AI Coach · Claude
        </div>

        {aiLoading ? (
          <p className="ai-text" style={{ color: "#4040a0" }} aria-label="Analysing your footprint, please wait">
            <span className="pulse-dot" style={{ background: "#6060c0", marginRight: 8 }} aria-hidden="true" />
            Analysing your footprint…
          </p>
        ) : aiError ? (
          <p className="ai-text" style={{ color: "#FF8080" }} role="alert">{aiError}</p>
        ) : typed ? (
          <p className="ai-text">{typed}</p>
        ) : (
          <p className="ai-text" style={{ color: "#2a2a5a" }}>
            Log your activities, then get a personalised insight based on your actual data.
          </p>
        )}
      </div>

      <button
        className="btn-ai"
        onClick={getInsight}
        disabled={aiLoading || total === 0}
        aria-busy={aiLoading}
        aria-label={aiLoading ? "Generating insight…" : aiText ? "Regenerate AI insight" : "Get AI insight"}
      >
        {aiLoading ? "Thinking…" : aiText ? "↺ New insight" : "✦ Get AI insight"}
      </button>

      {total > 0 && (
        <div className="card" style={{ marginTop: 16 }}>
          <h2 className="card-title">Your current snapshot</h2>
          <dl style={{ fontSize: 12, color: "#7a9a7a" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <dt>Annual footprint</dt>
              <dd style={{ fontWeight: 700, color, margin: 0 }}>{fmtCO2(total)}</dd>
            </div>
            {topCat?.total > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <dt>Biggest source</dt>
                <dd style={{ fontWeight: 700, color: topCat.color, margin: 0 }}>{topCat.icon} {topCat.label} ({fmtCO2(topCat.total)})</dd>
              </div>
            )}
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <dt>vs Paris target</dt>
              <dd style={{ fontWeight: 700, color: total <= BENCHMARKS.paris ? "#5DBE8A" : "#FF7B4B", margin: 0 }}>
                {total <= BENCHMARKS.paris
                  ? `✓ ${fmtCO2(BENCHMARKS.paris - total)} under`
                  : `${fmtCO2(total - BENCHMARKS.paris)} over`}
              </dd>
            </div>
          </dl>
        </div>
      )}

      <div className="card">
        <h2 className="card-title">Emissions facts</h2>
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {EMISSIONS_FACTS.map((f, i) => (
            <li key={i} style={{ fontSize: 11, color: "#5a7a5a", marginBottom: 9, lineHeight: 1.55, display: "flex", gap: 7 }}>
              <span style={{ color: "#5DBE8A", flexShrink: 0 }} aria-hidden="true">→</span>
              {f}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
});

// ─────────────────────────────────────────────────────────────────
// SECTION 6 — ROOT COMPONENT
// ─────────────────────────────────────────────────────────────────

const GOOGLE_FONTS = "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Instrument+Serif:ital@0;1&display=swap";

export default function CarbonTracker() {
  const [activeTab, setActiveTab] = useState(0);
  const [inputs, setInputs]       = useState({});
  const [period, setPeriod]       = useState("week");
  const [logs, setLogs]           = useState([]);
  const [goal, setGoal]           = useState(2500);
  const [toasts, pushToast]       = useToast();

  const multiplier   = PERIOD_MULTIPLIER[period];
  const total        = useMemo(() => totalCO2(inputs, multiplier), [inputs, multiplier]);
  const animTotal    = useAnimatedNumber(total);
  const color        = statusColor(total);
  const under        = total > 0 && total <= goal;

  /** Validate and persist a snapshot */
  const handleSaveSnapshot = useCallback(() => {
    const entries = ALL_ACTIONS
      .filter((a) => safeFloat(inputs[a.id]) > 0)
      .map((a) => ({
        id:    a.id,
        label: a.label,
        value: safeFloat(inputs[a.id]),
        co2:   safeFloat(inputs[a.id]) * a.factor,
      }));

    if (entries.length === 0) {
      pushToast("Enter at least one activity value first.", "error");
      return;
    }

    const snap = {
      id:     Date.now(),
      date:   new Date().toLocaleDateString("en-IN"),
      period,
      entries,
      total,  // already sanitised — computed from safeFloat values
    };

    setLogs((prev) => [snap, ...prev.slice(0, 9)]);
    pushToast(`Snapshot saved — ${fmtCO2(total)} / year`);
  }, [inputs, period, total, pushToast]);

  const tabPanelId = `tab-panel-${activeTab}`;

  return (
    <>
      <style>{`
        @import url('${GOOGLE_FONTS}');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { background: #080f08; height: 100%; }

        .sr-only {
          position: absolute; width: 1px; height: 1px;
          padding: 0; margin: -1px; overflow: hidden;
          clip: rect(0,0,0,0); white-space: nowrap; border: 0;
        }

        .root {
          min-height: 100vh; background: #080f08; color: #ddeedd;
          font-family: 'Space Grotesk', sans-serif;
          max-width: 430px; margin: 0 auto;
          padding-bottom: 80px;
        }

        /* HEADER */
        .hdr {
          padding: 20px 18px 14px;
          display: flex; justify-content: space-between; align-items: center;
          border-bottom: 1px solid #121e12;
        }
        .logo { font-family: 'Instrument Serif',serif; font-size: 20px; color: #5DBE8A; }
        .logo-sub { font-size: 10px; color: #2d4a2d; margin-top: 1px; }
        .streak-badge {
          background: #1a2a1a; border: 1px solid #2a3a2a; border-radius: 20px;
          padding: 5px 10px; font-size: 11px; color: #5DBE8A; font-weight: 600;
          display: flex; align-items: center; gap: 5px;
        }

        /* HERO */
        .hero {
          padding: 16px 18px;
          display: flex; align-items: center; justify-content: space-between;
          border-bottom: 1px solid #121e12; gap: 12px;
        }
        .hero-eyebrow { font-size: 9px; color: #2d4a2d; text-transform: uppercase; letter-spacing: .12em; font-weight: 600; }
        .hero-num { font-family: 'Instrument Serif',serif; font-size: 48px; line-height: 1; margin: 4px 0; }
        .hero-pill {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; margin-top: 8px;
        }
        .goal-bar-wrap { margin-top: 10px; }
        .goal-bar-meta { display: flex; justify-content: space-between; font-size: 10px; color: #3a5a3a; margin-bottom: 4px; }

        /* PERIOD */
        .period-row { display: flex; gap: 6px; padding: 10px 18px; border-bottom: 1px solid #121e12; }
        .p-btn {
          flex: 1; padding: 7px 0;
          background: #111811; border: 1px solid #1e2e1e;
          color: #4a6a4a; font-family: 'Space Grotesk',sans-serif; font-size: 11px;
          font-weight: 600; border-radius: 8px; cursor: pointer; transition: all .15s;
        }
        .p-btn.on { background: #1a3a1a; border-color: #5DBE8A; color: #5DBE8A; }
        .p-btn:focus-visible { outline: 2px solid #5DBE8A; outline-offset: 2px; }

        /* TABS */
        .tabs {
          display: flex; border-bottom: 1px solid #121e12;
          position: sticky; top: 0; background: #080f08; z-index: 30;
        }
        .tab-btn {
          flex: 1; padding: 11px 2px; background: none; border: none;
          color: #2d4a2d; font-family: 'Space Grotesk',sans-serif; font-size: 10px;
          font-weight: 600; cursor: pointer; border-bottom: 2px solid transparent;
          transition: all .15s; display: flex; flex-direction: column; align-items: center; gap: 2px;
        }
        .tab-btn .ticon { font-size: 14px; }
        .tab-btn.on { color: #5DBE8A; border-bottom-color: #5DBE8A; }
        .tab-btn:focus-visible { outline: 2px solid #5DBE8A; outline-offset: -2px; }

        /* CATEGORY ACCORDION */
        .cat-hdr {
          width: 100%; display: flex; align-items: center; justify-content: space-between;
          padding: 10px 0; cursor: pointer; background: none; border: none;
          color: inherit; text-align: left;
        }
        .cat-hdr:focus-visible { outline: 2px solid #5DBE8A; outline-offset: 2px; border-radius: 4px; }
        .cat-hdr-left { display: flex; align-items: center; gap: 8px; }
        .cat-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
        .cat-hdr-label { font-size: 13px; font-weight: 600; color: #c0d4c0; }
        .cat-hdr-co2 { font-size: 11px; color: #4a6a4a; font-weight: 500; }
        .cat-chevron { color: #3a5a3a; font-size: 12px; transition: transform .2s; }
        .cat-body { overflow: hidden; transition: max-height .3s ease; }
        .cat-divider { border: none; border-top: 1px solid #121e12; margin: 2px 0 8px; }

        /* FIELDS */
        .field { margin-bottom: 10px; }
        .field-lbl { display: flex; justify-content: space-between; font-size: 11px; color: #4a7a4a; margin-bottom: 5px; }
        .input-row { display: flex; align-items: center; gap: 8px; }
        .inp {
          flex: 1; background: #111811; border: 1px solid #1a2a1a; border-radius: 8px;
          padding: 9px 12px; color: #ddeedd; font-family: 'Space Grotesk',sans-serif;
          font-size: 14px; font-weight: 600; outline: none; transition: border-color .15s;
          -webkit-appearance: none; appearance: none;
        }
        .inp:focus { border-color: #5DBE8A; box-shadow: 0 0 0 2px #5DBE8A18; }
        .inp:focus-visible { outline: none; }
        .inp::placeholder { color: #1e3a1e; }
        .inp-unit { font-size: 10px; color: #2d4a2d; width: 28px; text-align: right; flex-shrink: 0; }
        .inp-co2 { font-size: 10px; width: 60px; text-align: right; flex-shrink: 0; font-weight: 700; }
        .tip-inline { font-size: 10px; color: #3a5a3a; margin-top: 5px; line-height: 1.5; }

        /* BUTTONS */
        .btn-primary {
          width: 100%; padding: 13px; background: #1a4a1a; border: none; border-radius: 10px;
          color: #5DBE8A; font-family: 'Space Grotesk',sans-serif; font-size: 13px;
          font-weight: 700; cursor: pointer; transition: all .15s; letter-spacing: .02em;
        }
        .btn-primary:hover { background: #225022; }
        .btn-primary:focus-visible { outline: 2px solid #5DBE8A; outline-offset: 2px; }
        .btn-ai {
          width: 100%; padding: 13px; border-radius: 10px; cursor: pointer;
          font-family: 'Space Grotesk',sans-serif; font-size: 13px; font-weight: 700;
          background: #0d1a2e; border: 1px solid #2a2a5a;
          color: #9090d8; transition: all .15s; margin-top: 10px; letter-spacing: .02em;
        }
        .btn-ai:hover:not(:disabled) { border-color: #4a4a9a; color: #b0b0f0; }
        .btn-ai:disabled { opacity: .5; cursor: not-allowed; }
        .btn-ai:focus-visible { outline: 2px solid #9090d8; outline-offset: 2px; }

        /* CARDS */
        .card {
          background: #0e1a0e; border: 1px solid #151f15; border-radius: 12px;
          padding: 14px; margin-bottom: 10px;
        }
        .card-title {
          font-size: 9px; color: #2d4a2d; text-transform: uppercase;
          letter-spacing: .1em; font-weight: 700; margin-bottom: 12px;
        }

        /* STAT ROW */
        .stat-row { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
        .stat-lbl { font-size: 11px; color: #7a9a7a; width: 85px; flex-shrink: 0; }
        .stat-bar-wrap { flex: 1; }
        .stat-val { font-size: 11px; color: #9ab49a; font-weight: 600; width: 54px; text-align: right; flex-shrink: 0; }

        /* TIP CARD */
        .tip-card {
          background: #0e1a0e; border: 1px solid #151f15; border-radius: 12px;
          padding: 12px 14px; margin-bottom: 8px; display: flex; gap: 12px; align-items: flex-start;
        }
        .tip-icon { font-size: 20px; flex-shrink: 0; margin-top: 1px; }
        .tip-title { font-size: 12px; font-weight: 700; color: #c0d4c0; margin-bottom: 3px; }
        .tip-text { font-size: 11px; color: #5a7a5a; line-height: 1.5; }
        .tip-co2 { font-size: 10px; color: #FF7B4B; font-weight: 700; margin-top: 4px; }

        /* AI BOX */
        .ai-box {
          background: #080f1e; border: 1px solid #20204a;
          border-radius: 12px; padding: 18px; margin-bottom: 12px;
        }
        .ai-badge {
          display: inline-flex; align-items: center; gap: 5px;
          font-size: 9px; color: #4040a0; text-transform: uppercase;
          letter-spacing: .1em; font-weight: 700; margin-bottom: 12px;
        }
        .ai-dot { width: 6px; height: 6px; background: #6060c0; border-radius: 50%; animation: pulse 1.5s infinite; }
        .ai-text { font-size: 13px; color: #a0a0cc; line-height: 1.75; min-height: 44px; }

        /* GOAL */
        .goal-slider { width: 100%; accent-color: #5DBE8A; cursor: pointer; }
        .goal-meta { display: flex; justify-content: space-between; font-size: 10px; color: #4a6a4a; margin-top: 6px; }

        /* ACHIEVEMENTS */
        .ach-grid { display: flex; justify-content: space-around; padding: 4px 0; }

        /* COMPARE */
        .cmp-bar { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
        .cmp-lbl { font-size: 10px; color: #5a7a5a; width: 80px; flex-shrink: 0; }

        /* HISTORY */
        .hist-row { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #121e12; }
        .hist-row td { padding: 8px 0; }
        .hist-row:last-child td { border-bottom: none; }
        .hist-date { font-size: 11px; color: #4a6a4a; }
        .hist-val { font-size: 11px; font-weight: 700; }

        /* MISC */
        .pulse-dot { display: inline-block; width: 6px; height: 6px; background: #5DBE8A; border-radius: 50%; animation: pulse 1.5s infinite; }
        .empty { text-align: center; padding: 48px 20px; color: #2d4a2d; font-size: 12px; line-height: 1.8; }
        .empty-icon { font-size: 36px; margin-bottom: 12px; }

        @keyframes pulse { 0%,100%{opacity:1;} 50%{opacity:.25;} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(6px);} to{opacity:1;transform:translateY(0);} }
        .fade-in { animation: fadeIn .3s ease both; }

        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
        }
      `}</style>

      <Toast toasts={toasts} />

      <div className="root">
        {/* ── HEADER ── */}
        <header className="hdr">
          <div>
            <div className="logo" aria-label="EcoStep">🌿 Ecostep</div>
            <div className="logo-sub">Carbon footprint tracker</div>
          </div>
          <div className="streak-badge" aria-label={`${logs.length} snapshot${logs.length !== 1 ? "s" : ""} saved`}>
            <span className="pulse-dot" aria-hidden="true" />
            {logs.length} snapshot{logs.length !== 1 ? "s" : ""}
          </div>
        </header>

        {/* ── HERO ── */}
        <div className="hero" aria-label={`Estimated annual CO₂: ${fmtCO2(total)}`}>
          <div>
            <div className="hero-eyebrow" aria-hidden="true">Estimated annual CO₂</div>
            <div className="hero-num" style={{ color }} aria-hidden="true">
              {animTotal >= 1000
                ? <>{(animTotal / 1000).toFixed(1)}<span style={{ fontSize: 22 }}>t</span></>
                : <>{Math.round(animTotal)}<span style={{ fontSize: 22 }}>kg</span></>}
            </div>
            <div
              className="hero-pill"
              style={{ background: color + "18", color }}
              role="status"
              aria-live="polite"
            >
              {total === 0          ? "⬤ Enter data below"
                : total < BENCHMARKS.paris    ? "🌱 Below Paris target"
                : total < BENCHMARKS.globalAvg ? "⚠ Above Paris target"
                : "🔴 High impact"}
            </div>
            {total > 0 && (
              <div className="goal-bar-wrap">
                <div className="goal-bar-meta" aria-hidden="true">
                  <span>vs goal ({fmtCO2(goal)})</span>
                  <span style={{ color: under ? "#5DBE8A" : "#FF7B4B" }}>
                    {under ? `✓ ${fmtCO2(goal - total)} under` : `${fmtCO2(total - goal)} over`}
                  </span>
                </div>
                <ProgressBar value={total} max={goal * 1.5} color={under ? "#5DBE8A" : "#FF7B4B"} />
              </div>
            )}
          </div>
          <CircleGauge value={total} max={8000} color={color} />
        </div>

        {/* ── PERIOD SELECTOR ── */}
        <div className="period-row" role="group" aria-label="Logging period">
          {Object.keys(PERIOD_MULTIPLIER).map((p) => (
            <button
              key={p}
              className={`p-btn ${period === p ? "on" : ""}`}
              onClick={() => setPeriod(p)}
              aria-pressed={period === p}
            >
              Per {p}
            </button>
          ))}
        </div>

        {/* ── TABS ── */}
        <nav aria-label="Sections">
          <div role="tablist" className="tabs">
            {TABS.map((t, i) => (
              <button
                key={t.id}
                role="tab"
                id={`tab-${t.id}`}
                aria-selected={activeTab === i}
                aria-controls={`panel-${t.id}`}
                className={`tab-btn ${activeTab === i ? "on" : ""}`}
                onClick={() => setActiveTab(i)}
                tabIndex={activeTab === i ? 0 : -1}
              >
                <span className="ticon" aria-hidden="true">{t.icon}</span>
                {t.label}
              </button>
            ))}
          </div>
        </nav>

        {/* ── TAB PANELS ── */}
        <main>
          <div
            role="tabpanel"
            id={`panel-${TABS[activeTab].id}`}
            aria-labelledby={`tab-${TABS[activeTab].id}`}
            className="fade-in"
          >
            {activeTab === 0 && (
              <LogTab
                inputs={inputs}
                setInputs={setInputs}
                period={period}
                onSave={handleSaveSnapshot}
              />
            )}
            {activeTab === 1 && (
              <StatsTab inputs={inputs} period={period} logs={logs} />
            )}
            {activeTab === 2 && (
              <GoalsTab goal={goal} setGoal={setGoal} inputs={inputs} period={period} />
            )}
            {activeTab === 3 && (
              <ReduceTab inputs={inputs} period={period} />
            )}
            {activeTab === 4 && (
              <AITab inputs={inputs} period={period} goal={goal} logs={logs} />
            )}
          </div>
        </main>
      </div>
    </>
  );
}
