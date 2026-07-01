import { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import {
  AreaChart, Area, LineChart, Line,
  ResponsiveContainer, XAxis, Tooltip,
} from "recharts";
import {
  ArrowRight, Database, Cpu, PieChart, FileText, Globe,
  Home, Bell, Search, Plus, Settings,
} from "lucide-react";

// ── DATA ──────────────────────────────────────────────────────────────────────

const toSpark = (arr: number[]) => arr.map((v, i) => ({ i, v }));

const SPARK = {
  throughput: toSpark([12, 19, 15, 28, 22, 35, 31, 42, 38, 51, 47, 55]),
  models:     toSpark([45, 38, 52, 41, 58, 47, 63, 55, 70, 62, 74, 69]),
  accuracy:   toSpark([91, 93, 92, 95, 94, 96, 95, 97, 96, 98, 97, 99]),
};

const CHART_DATA = [
  { month: "Jan", throughput: 1.2, accuracy: 94.2 },
  { month: "Feb", throughput: 1.8, accuracy: 95.1 },
  { month: "Mar", throughput: 2.1, accuracy: 96.3 },
  { month: "Apr", throughput: 1.9, accuracy: 95.8 },
  { month: "May", throughput: 2.6, accuracy: 97.2 },
  { month: "Jun", throughput: 2.4, accuracy: 98.7 },
];

const STAGES = [
  {
    tag: "01 — COLLECT",
    headline: "Pull from anywhere.\nLose nothing.",
    body: "Connect structured, unstructured, and streaming data sources through a single unified API. Every byte is tracked, versioned, and immediately queryable.",
  },
  {
    tag: "02 — PROCESS",
    headline: "Find signal in\nnoise at scale.",
    body: "Distributed scan engines run pattern recognition, anomaly detection, and semantic clustering across petabytes in real time — no sampling, no approximation.",
  },
  {
    tag: "03 — SYNTHESIZE",
    headline: "Intelligence as\ninfrastructure.",
    body: "Structured outputs, embeddings, and decision graphs served as low-latency endpoints your stack consumes directly. Predictions become products.",
  },
];

const ACTIVITY = [
  { label: "Model XAI-7 completed training", time: "2m ago", color: "#10B981" },
  { label: "Dataset ingested: finance_q3.parquet", time: "5m ago", color: "#3B82F6" },
  { label: "Pipeline #42 triggered threshold alert", time: "8m ago", color: "#F59E0B" },
  { label: "Schema validation passed — 99.8% integrity", time: "12m ago", color: "#10B981" },
  { label: "Cross-region sync: eu-west → us-east", time: "18m ago", color: "#8B5CF6" },
];

const SIDEBAR_NAV = [
  { icon: Home,     label: "Overview",     active: true  },
  { icon: Database, label: "Pipelines",    active: false },
  { icon: Cpu,      label: "Models",       active: false },
  { icon: PieChart, label: "Analytics",    active: false },
  { icon: FileText, label: "Reports",      active: false },
  { icon: Globe,    label: "Integrations", active: false },
];

const METRIC_CARDS = [
  { label: "Pipeline Throughput", value: "2.4M/s", delta: "+18.2%", spark: SPARK.throughput, color: "#3B82F6" },
  { label: "Active Models",       value: "847",    delta: "+12.4%", spark: SPARK.models,     color: "#8B5CF6" },
  { label: "Accuracy Score",      value: "98.7%",  delta: "+2.1%",  spark: SPARK.accuracy,   color: "#10B981" },
];

const FLOAT_CARDS = [
  { dx: -340, dy: -90,  depth: 1,   label: "2.4M events/sec",  sub: "Real-time throughput",   color: "#3B82F6" },
  { dx:  300, dy: -130, depth: 2,   label: "847 Models Active", sub: "Auto-scaled inference",  color: "#8B5CF6" },
  { dx: -290, dy:  110, depth: 3,   label: "99.8% Uptime",      sub: "Infrastructure SLA",     color: "#10B981" },
  { dx:  320, dy:   90, depth: 1.5, label: "< 2ms Latency",     sub: "p99 response time",      color: "#F59E0B" },
];

// ── POINT CLOUD CANVAS ────────────────────────────────────────────────────────

function HeroCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = 1000, H = 560, N = 84, COLS = 12, ROWS = 7;
    canvas.width = W;
    canvas.height = H;

    type Pt = { x: number; y: number; vx: number; vy: number; tx: number; ty: number };
    const pts: Pt[] = Array.from({ length: N }, (_, i) => ({
      x:  Math.random() * W,
      y:  Math.random() * H,
      vx: (Math.random() - 0.5) * 0.45,
      vy: (Math.random() - 0.5) * 0.45,
      tx: ((i % COLS) + 1) * (W / (COLS + 1)),
      ty: (Math.floor(i / COLS) + 1) * (H / (ROWS + 1)),
    }));

    let phase = 0, pt = 0, last = performance.now(), raf = 0;
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
    const ease = (t: number) => 1 - Math.pow(1 - t, 3);

    function tick(now: number) {
      const dt = Math.min(now - last, 33);
      last = now;
      pt += dt;

      if (phase === 0 && pt > 3800) { phase = 1; pt = 0; }
      else if (phase === 1 && pt > 2600) { phase = 2; pt = 0; }
      else if (phase === 2 && pt > 3200) {
        phase = 0; pt = 0;
        pts.forEach(p => {
          p.x  = Math.random() * W; p.y  = Math.random() * H;
          p.vx = (Math.random() - 0.5) * 0.45;
          p.vy = (Math.random() - 0.5) * 0.45;
        });
      }

      ctx.clearRect(0, 0, W, H);

      const morphT = phase === 1 ? ease(Math.min(pt / 2600, 1)) : phase === 2 ? 1 : 0;

      pts.forEach(p => {
        if (phase === 0) {
          p.x += p.vx; p.y += p.vy;
          if (p.x < 0 || p.x > W) p.vx *= -1;
          if (p.y < 0 || p.y > H) p.vy *= -1;
        } else if (phase === 1) {
          p.x = lerp(p.x, p.tx, morphT * 0.07);
          p.y = lerp(p.y, p.ty, morphT * 0.07);
        }
      });

      const thresh = phase === 2 ? 130 : 88;
      ctx.lineWidth = 0.6;
      for (let i = 0; i < N; i++) {
        for (let j = i + 1; j < N; j++) {
          const dx = pts[i].x - pts[j].x;
          const dy = pts[i].y - pts[j].y;
          const d  = Math.sqrt(dx * dx + dy * dy);
          if (d < thresh) {
            const a = (1 - d / thresh) * (phase === 2 ? 0.38 : 0.16);
            ctx.strokeStyle = (i + j) % 2 === 0
              ? `rgba(59,130,246,${a})`
              : `rgba(139,92,246,${a})`;
            ctx.beginPath();
            ctx.moveTo(pts[i].x, pts[i].y);
            ctx.lineTo(pts[j].x, pts[j].y);
            ctx.stroke();
          }
        }
      }

      pts.forEach((p, i) => {
        const highlight = phase === 2 && i % 5 === 0;
        const r = highlight ? 3.5 : 1.5;
        const alpha = phase === 2 ? 0.9 : 0.65;
        if (highlight) {
          const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 14);
          g.addColorStop(0, "rgba(59,130,246,0.18)");
          g.addColorStop(1, "transparent");
          ctx.beginPath(); ctx.arc(p.x, p.y, 14, 0, Math.PI * 2);
          ctx.fillStyle = g; ctx.fill();
        }
        ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
        ctx.fillStyle = i % 3 === 0
          ? `rgba(59,130,246,${alpha})`
          : i % 3 === 1
          ? `rgba(139,92,246,${alpha})`
          : `rgba(237,237,237,${alpha * 0.6})`;
        ctx.fill();
      });

      raf = requestAnimationFrame(tick);
    }

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return <canvas ref={canvasRef} className="w-full h-full block" />;
}

// ── INSIGHT VISUALS ───────────────────────────────────────────────────────────

function IngestVisual() {
  const rays = [
    [0,72],[0,160],[0,240],[0,320],[0,408],
    [480,72],[480,160],[480,240],[480,320],[480,408],
    [72,0],[160,0],[240,0],[320,0],[408,0],
    [72,480],[160,480],[240,480],[320,480],[408,480],
  ];
  return (
    <svg viewBox="0 0 480 480" className="w-full h-full">
      <defs>
        <filter id="ig-glow">
          <feGaussianBlur stdDeviation="4" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      <style>{`
        @keyframes ig-dash { to { stroke-dashoffset: -24; } }
        @keyframes ig-fade { 0%,100% { stroke-opacity:.12; } 50% { stroke-opacity:.55; } }
      `}</style>
      {rays.map(([x1, y1], i) => (
        <line
          key={i} x1={x1} y1={y1} x2={240} y2={240}
          stroke={i % 2 === 0 ? "#3B82F6" : "#8B5CF6"}
          strokeWidth="0.8" strokeDasharray="5 5"
          style={{ animation: `ig-dash 1.8s ${i * 0.08}s linear infinite, ig-fade 2.4s ${i * 0.12}s ease-in-out infinite` }}
        />
      ))}
      <circle cx="240" cy="240" r="28" fill="none" stroke="#8B5CF6" strokeOpacity="0.2" strokeWidth="1" />
      <circle cx="240" cy="240" r="14" fill="none" stroke="#3B82F6" strokeOpacity="0.35" strokeWidth="1" />
      <circle cx="240" cy="240" r="7"  fill="#3B82F6" filter="url(#ig-glow)" />
    </svg>
  );
}

function AnalyzeVisual() {
  const CIRC = 2 * Math.PI * 100;
  return (
    <svg viewBox="0 0 480 480" className="w-full h-full">
      <defs>
        <filter id="an-glow">
          <feGaussianBlur stdDeviation="5" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      <style>{`
        @keyframes an-pulse { 0%,100% { stroke-opacity:.08; } 50% { stroke-opacity:.4; } }
        @keyframes an-spin  { to { transform: rotate(360deg); } }
      `}</style>
      {[50, 100, 150, 195].map((r, i) => (
        <circle key={i} cx="240" cy="240" r={r}
          fill="none" stroke={i % 2 === 0 ? "#3B82F6" : "#8B5CF6"}
          strokeWidth="0.8"
          style={{ animation: `an-pulse ${1.6 + i * 0.45}s ${i * 0.3}s ease-in-out infinite` }}
        />
      ))}
      <circle cx="240" cy="240" r="100"
        fill="none" stroke="#3B82F6" strokeWidth="2" strokeOpacity="0.85"
        strokeDasharray={`65 ${CIRC - 65}`}
        style={{ animation: "an-spin 3s linear infinite", transformOrigin: "240px 240px" }}
      />
      {[0, 60, 120, 180, 240, 300].map((deg, i) => {
        const rad = deg * Math.PI / 180;
        return (
          <circle key={i}
            cx={240 + 100 * Math.cos(rad)} cy={240 + 100 * Math.sin(rad)}
            r="3.5" fill={i % 2 === 0 ? "#3B82F6" : "#8B5CF6"} fillOpacity="0.85"
          />
        );
      })}
      <circle cx="240" cy="240" r="20" fill="#3B82F6" fillOpacity="0.1" />
      <circle cx="240" cy="240" r="9"  fill="#3B82F6" filter="url(#an-glow)" />
    </svg>
  );
}

function GenerateVisual() {
  const nodes = [
    { x: 240, y: 55,  r: 10, hi: true,  c: "#3B82F6" },
    { x: 140, y: 155, r: 7,  hi: false, c: "#8B5CF6" },
    { x: 340, y: 155, r: 7,  hi: false, c: "#8B5CF6" },
    { x: 75,  y: 265, r: 5,  hi: false, c: "#8B5CF6" },
    { x: 200, y: 265, r: 5,  hi: true,  c: "#3B82F6" },
    { x: 285, y: 265, r: 5,  hi: false, c: "#8B5CF6" },
    { x: 405, y: 265, r: 5,  hi: false, c: "#8B5CF6" },
    { x: 48,  y: 370, r: 3.5,hi: false, c: "#8B5CF6" },
    { x: 110, y: 370, r: 3.5,hi: false, c: "#8B5CF6" },
    { x: 170, y: 370, r: 3.5,hi: true,  c: "#3B82F6" },
    { x: 228, y: 370, r: 3.5,hi: false, c: "#8B5CF6" },
    { x: 285, y: 370, r: 3.5,hi: false, c: "#8B5CF6" },
    { x: 370, y: 370, r: 3.5,hi: false, c: "#8B5CF6" },
    { x: 432, y: 370, r: 3.5,hi: false, c: "#8B5CF6" },
  ];
  const edges = [
    [0,1],[0,2],[1,3],[1,4],[2,5],[2,6],
    [3,7],[3,8],[4,9],[4,10],[5,11],[6,12],[6,13],
  ];
  return (
    <svg viewBox="0 0 480 480" className="w-full h-full">
      <defs>
        <filter id="gn-glow">
          <feGaussianBlur stdDeviation="5" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      <style>{`
        @keyframes gn-pulse { 0%,100% { opacity:.7; } 50% { opacity:1; } }
      `}</style>
      {edges.map(([a, b], i) => (
        <line key={i}
          x1={nodes[a].x} y1={nodes[a].y}
          x2={nodes[b].x} y2={nodes[b].y}
          stroke={i % 2 === 0 ? "#3B82F6" : "#8B5CF6"}
          strokeWidth="0.7" strokeOpacity="0.35"
        />
      ))}
      {nodes.map((n, i) => (
        <g key={i}>
          {n.hi && <circle cx={n.x} cy={n.y} r={n.r + 9} fill={n.c} fillOpacity="0.1" />}
          <circle
            cx={n.x} cy={n.y} r={n.r}
            fill={n.hi ? n.c : "transparent"}
            stroke={n.c} strokeWidth={n.hi ? 0 : 1} strokeOpacity={n.hi ? 0 : 0.45}
            filter={n.hi ? "url(#gn-glow)" : undefined}
            style={n.hi ? { animation: "gn-pulse 2s ease-in-out infinite" } : undefined}
          />
        </g>
      ))}
    </svg>
  );
}

function InsightVisual({ stage }: { stage: number }) {
  return (
    <div className="w-[440px] h-[440px]">
      {stage === 0 && <IngestVisual />}
      {stage === 1 && <AnalyzeVisual />}
      {stage === 2 && <GenerateVisual />}
    </div>
  );
}

// ── DASHBOARD MOCKUP ──────────────────────────────────────────────────────────

function DashboardMockup() {
  return (
    <div className="flex h-full text-[10.5px] leading-tight">
      {/* Sidebar */}
      <motion.div
        initial={{ opacity: 0, x: -12 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.15, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-44 shrink-0 border-r border-white/[0.06] bg-[#0D0D10] flex flex-col py-5 px-3 gap-0.5"
      >
        <div className="px-2 pb-4 mb-2 border-b border-white/[0.05]">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-[5px] bg-gradient-to-br from-blue-500 to-purple-600 shrink-0" />
            <span className="font-semibold text-white text-[11px] tracking-tight">XAI Workspace</span>
          </div>
        </div>
        {SIDEBAR_NAV.map((item, i) => (
          <div key={i} className={`flex items-center gap-2 px-2 py-[5px] rounded-md cursor-pointer transition-colors ${
            item.active ? "bg-blue-500/10 text-blue-400" : "text-white/35 hover:text-white/60"
          }`}>
            <item.icon size={11} />
            <span>{item.label}</span>
          </div>
        ))}
        <div className="mt-auto">
          <div className="flex items-center gap-2 px-2 py-[5px] text-white/25">
            <Settings size={11} />
            <span>Settings</span>
          </div>
        </div>
      </motion.div>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.25, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="h-11 border-b border-white/[0.06] flex items-center px-5 gap-3 shrink-0"
        >
          <div className="flex items-center gap-1.5 bg-white/[0.04] border border-white/[0.06] rounded-md px-2.5 py-1 flex-1 max-w-xs">
            <Search size={10} className="text-white/25 shrink-0" />
            <span className="text-white/25">Search pipelines, models...</span>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <div className="relative">
              <Bell size={12} className="text-white/35" />
              <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-blue-500" />
            </div>
            <div className="w-[22px] h-[22px] rounded-full bg-gradient-to-br from-blue-400 to-purple-500" />
          </div>
        </motion.div>

        {/* Content */}
        <div className="flex-1 p-5 flex flex-col gap-3.5 overflow-hidden">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.35, duration: 0.5 }}
            className="flex items-center justify-between"
          >
            <div>
              <div className="text-[12px] font-semibold text-white">Overview</div>
              <div className="text-white/30 mt-0.5">Tuesday, Jun 24 · All systems nominal</div>
            </div>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-blue-500/10 border border-blue-500/20 text-blue-400">
              <Plus size={10} /><span>New Pipeline</span>
            </button>
          </motion.div>

          {/* 3 metric cards */}
          <div className="grid grid-cols-3 gap-3">
            {METRIC_CARDS.map((card, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.35 + i * 0.08, duration: 0.5 }}
                className="bg-white/[0.03] border border-white/[0.06] rounded-lg p-3 flex flex-col gap-1.5"
              >
                <div className="flex justify-between items-center">
                  <span className="text-white/35 uppercase tracking-wider">{card.label}</span>
                  <span style={{ color: card.color }}>{card.delta}</span>
                </div>
                <div className="text-[17px] font-semibold text-white">{card.value}</div>
                <ResponsiveContainer width="100%" height={26}>
                  <LineChart data={card.spark}>
                    <Line type="monotone" dataKey="v" stroke={card.color} strokeWidth={1.5} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </motion.div>
            ))}
          </div>

          {/* Chart + Activity */}
          <div className="grid grid-cols-3 gap-3 flex-1 min-h-0">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.58, duration: 0.6 }}
              className="col-span-2 bg-white/[0.03] border border-white/[0.06] rounded-lg p-3.5 flex flex-col gap-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium text-white/60">Intelligence Over Time</span>
                <div className="flex gap-4 text-white/28">
                  {[{ color: "#3B82F6", label: "Throughput" }, { color: "#8B5CF6", label: "Accuracy" }].map(l => (
                    <span key={l.label} className="flex items-center gap-1.5">
                      <span className="w-3 h-px inline-block" style={{ background: l.color }} />
                      {l.label}
                    </span>
                  ))}
                </div>
              </div>
              <ResponsiveContainer width="100%" height={130}>
                <AreaChart data={CHART_DATA} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gT" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.28" />
                      <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
                    </linearGradient>
                    <linearGradient id="gA" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.22" />
                      <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" tick={{ fill: "rgba(255,255,255,0.22)", fontSize: 9 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ background: "#1C1C1F", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 6, fontSize: 10, color: "#EDEDED" }}
                    cursor={{ stroke: "rgba(255,255,255,0.08)" }}
                  />
                  <Area type="monotone" dataKey="throughput" stroke="#3B82F6" strokeWidth={1.5} fill="url(#gT)" dot={false} />
                  <Area type="monotone" dataKey="accuracy"   stroke="#8B5CF6" strokeWidth={1.5} fill="url(#gA)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.66, duration: 0.6 }}
              className="bg-white/[0.03] border border-white/[0.06] rounded-lg p-3.5 flex flex-col gap-2"
            >
              <span className="text-[11px] font-medium text-white/60">Activity Feed</span>
              <div className="flex flex-col gap-2.5">
                {ACTIVITY.map((item, i) => (
                  <div key={i} className="flex gap-2 items-start">
                    <div className="w-1.5 h-1.5 rounded-full mt-[3px] shrink-0" style={{ background: item.color }} />
                    <div className="flex flex-col gap-[2px] min-w-0">
                      <span className="text-white/55 leading-tight truncate">{item.label}</span>
                      <span className="text-white/22">{item.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── NAV ───────────────────────────────────────────────────────────────────────

function Nav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 h-14 transition-all duration-300 ${
      scrolled ? "bg-[#09090B]/90 backdrop-blur-xl border-b border-white/[0.07]" : ""
    }`}>
      <div className="flex items-center gap-2.5">
        <div className="w-6 h-6 rounded-md bg-gradient-to-br from-blue-500 to-purple-600 shrink-0" />
        <span className="font-semibold text-white tracking-tight text-sm">XAI</span>
      </div>
      <div className="hidden md:flex items-center gap-8">
        {["Product", "Solutions", "Docs", "Pricing"].map(link => (
          <a key={link} href="#" className="text-sm text-white/45 hover:text-white/85 transition-colors duration-200">
            {link}
          </a>
        ))}
      </div>
      <div className="flex items-center gap-3">
        <a href="#" className="text-sm text-white/45 hover:text-white/85 transition-colors duration-200 hidden md:block">
          Sign in
        </a>
        <button className="text-sm px-4 py-1.5 rounded-md bg-white text-[#09090B] font-medium hover:bg-white/88 transition-colors duration-200">
          Get started
        </button>
      </div>
    </nav>
  );
}

// ── HERO ──────────────────────────────────────────────────────────────────────

function HeroSection() {
  return (
    <section className="relative flex flex-col items-center pt-36 pb-20 px-6 overflow-hidden">
      <div
        className="absolute pointer-events-none"
        style={{
          top: "30%", left: "50%", transform: "translate(-50%,-50%)",
          width: 900, height: 420,
          background: "radial-gradient(ellipse at center, rgba(59,130,246,0.12) 0%, rgba(139,92,246,0.06) 50%, transparent 70%)",
          filter: "blur(48px)",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 22 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col items-center text-center gap-6 max-w-[840px]"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/[0.1] bg-white/[0.03] text-xs text-white/45">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse shrink-0" />
          Now in private beta — XAI v2.0
        </div>

        <h1 className="text-6xl xl:text-[72px] font-semibold text-white leading-[1.04] tracking-tight">
          From raw data to<br />
          <span
            className="bg-clip-text text-transparent"
            style={{ backgroundImage: "linear-gradient(135deg, #60A5FA 0%, #A78BFA 100%)" }}
          >
            structured intelligence.
          </span>
        </h1>

        <p className="text-lg text-white/40 max-w-[520px] leading-relaxed">
          A unified data intelligence layer that ingests, processes, and synthesizes at scale — so your models get signal, not noise.
        </p>

        <div className="flex items-center gap-3 mt-1">
          <button className="flex items-center gap-2 px-6 py-2.5 rounded-md bg-blue-500 text-white text-sm font-medium hover:bg-blue-400 transition-colors duration-200">
            Start building <ArrowRight size={14} />
          </button>
          <button className="flex items-center gap-2 px-6 py-2.5 rounded-md border border-white/[0.1] text-white/60 text-sm hover:text-white hover:border-white/[0.2] transition-colors duration-200">
            View demo
          </button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 36, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: 0.25, duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
        className="relative mt-16 w-full max-w-[1000px] rounded-xl overflow-hidden border border-white/[0.08]"
        style={{ aspectRatio: "1000/560", background: "#0C0C0F" }}
      >
        <HeroCanvas />
        <div
          className="absolute bottom-0 left-0 right-0 h-28 pointer-events-none"
          style={{ background: "linear-gradient(to top, #09090B, transparent)" }}
        />
      </motion.div>
    </section>
  );
}

// ── INSIGHT FLOW ──────────────────────────────────────────────────────────────

function InsightFlow() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const fn = () => {
      const el = sectionRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const scrollable = el.offsetHeight - window.innerHeight;
      const progress   = Math.max(0, Math.min(1, -rect.top / scrollable));
      setStage(Math.min(2, Math.floor(progress * 3)));
    };
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <section
      ref={sectionRef}
      style={{ height: "300vh" }}
      className="relative border-t border-white/[0.06]"
    >
      <div className="sticky top-0 h-screen flex overflow-hidden">
        {/* Left: text */}
        <div className="w-[40%] flex flex-col justify-center px-12 xl:px-20 gap-14">
          {STAGES.map((s, i) => (
            <motion.div
              key={i}
              animate={{ opacity: stage === i ? 1 : 0.18, x: stage === i ? 0 : -10 }}
              transition={{ duration: 0.38, ease: [0.25, 1, 0.5, 1] }}
              className="flex flex-col gap-3"
            >
              <span className="text-[11px] font-mono tracking-[0.18em] text-blue-400/75">{s.tag}</span>
              <h3
                className="text-2xl xl:text-3xl font-semibold text-white leading-snug"
                style={{ whiteSpace: "pre-line" }}
              >
                {s.headline}
              </h3>
              <p className="text-sm text-white/38 leading-relaxed max-w-sm">{s.body}</p>
            </motion.div>
          ))}
        </div>

        {/* Right: visual */}
        <div
          className="w-[60%] flex items-center justify-center border-l border-white/[0.05] relative overflow-hidden"
          style={{ background: "#0C0C0F" }}
        >
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: "radial-gradient(ellipse at 50% 50%, rgba(59,130,246,0.09) 0%, transparent 65%)" }}
          />
          <motion.div
            key={stage}
            initial={{ opacity: 0, scale: 0.88 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.52, ease: [0.16, 1, 0.3, 1] }}
          >
            <InsightVisual stage={stage} />
          </motion.div>
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
            {[0, 1, 2].map(i => (
              <div
                key={i}
                className="h-[2px] rounded-full transition-all duration-350"
                style={{
                  width: i === stage ? 28 : 7,
                  background: i === stage ? "#60A5FA" : "rgba(255,255,255,0.18)",
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ── DASHBOARD SECTION ─────────────────────────────────────────────────────────

function DashboardSection() {
  return (
    <section className="py-28 px-6 flex flex-col items-center gap-14 border-t border-white/[0.06]">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="text-center flex flex-col gap-4 max-w-xl"
      >
        <span className="text-[11px] font-mono tracking-[0.18em] text-purple-400/75">PLATFORM OVERVIEW</span>
        <h2 className="text-4xl xl:text-5xl font-semibold text-white tracking-tight leading-tight">
          Your command center<br />
          <span className="text-white/35">for data intelligence.</span>
        </h2>
        <p className="text-white/38 leading-relaxed text-[15px]">
          Monitor pipelines, track model performance, and surface anomalies — all from a single unified workspace.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.18, duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[1200px] relative"
      >
        <div
          className="absolute -inset-px rounded-2xl pointer-events-none"
          style={{
            background: "linear-gradient(145deg, rgba(59,130,246,0.18), rgba(139,92,246,0.08))",
            filter: "blur(18px)",
          }}
        />
        <div
          className="relative rounded-2xl border border-white/[0.09] overflow-hidden"
          style={{ background: "linear-gradient(155deg, rgba(18,18,20,0.97), rgba(13,13,16,0.99))", backdropFilter: "blur(24px)" }}
        >
          <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(59,130,246,0.45), rgba(139,92,246,0.35), transparent)" }} />
          <div style={{ height: 680 }}>
            <DashboardMockup />
          </div>
        </div>
      </motion.div>
    </section>
  );
}

// ── CTA SECTION ───────────────────────────────────────────────────────────────

function CTASection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });

  const onMouseMove = (e: React.MouseEvent) => {
    const rect = sectionRef.current?.getBoundingClientRect();
    if (!rect) return;
    setMouse({
      x: (e.clientX - rect.left - rect.width  / 2) / rect.width,
      y: (e.clientY - rect.top  - rect.height / 2) / rect.height,
    });
  };

  return (
    <section
      ref={sectionRef}
      onMouseMove={onMouseMove}
      className="relative py-52 px-6 flex flex-col items-center justify-center overflow-hidden border-t border-white/[0.06]"
    >
      {/* Grid bg */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(rgba(255,255,255,0.028) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />
      {/* Radial glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(59,130,246,0.16) 0%, transparent 70%)" }}
      />

      {/* Central orb */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
        <div className="w-48 h-48 rounded-full" style={{ background: "radial-gradient(circle, rgba(59,130,246,0.14) 0%, rgba(139,92,246,0.06) 60%, transparent 100%)" }} />
        <div className="absolute inset-6 rounded-full border border-blue-500/18" />
        <div className="absolute inset-12 rounded-full border border-purple-500/14" />
      </div>

      {/* Floating cards */}
      {FLOAT_CARDS.map((card, i) => (
        <div
          key={i}
          className="absolute pointer-events-none select-none"
          style={{
            left: `calc(50% + ${card.dx}px)`,
            top:  `calc(50% + ${card.dy}px)`,
            transform: `translate(-50%, -50%) translate(${mouse.x * 28 * card.depth}px, ${mouse.y * 18 * card.depth}px)`,
            transition: "transform 80ms linear",
          }}
        >
          <div
            className="rounded-xl px-4 py-3 flex items-center gap-3 border border-white/[0.1]"
            style={{ background: "rgba(18,18,20,0.88)", backdropFilter: "blur(12px)", boxShadow: "0 8px 32px rgba(0,0,0,0.45)" }}
          >
            <div className="w-2 h-2 rounded-full shrink-0" style={{ background: card.color, boxShadow: `0 0 10px ${card.color}` }} />
            <div>
              <div className="text-sm font-semibold text-white">{card.label}</div>
              <div className="text-xs text-white/38">{card.sub}</div>
            </div>
          </div>
        </div>
      ))}

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 22 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="relative flex flex-col items-center gap-6 text-center max-w-2xl"
      >
        <h2 className="text-5xl xl:text-[62px] font-semibold text-white tracking-tight leading-tight">
          Ready to orchestrate<br />
          <span
            className="bg-clip-text text-transparent"
            style={{ backgroundImage: "linear-gradient(135deg, #60A5FA 0%, #A78BFA 100%)" }}
          >
            your data?
          </span>
        </h2>
        <p className="text-white/38 text-[17px] leading-relaxed max-w-[460px]">
          Join engineering teams that have moved from fragile pipelines to a resilient intelligence layer.
        </p>
        <div className="flex items-center gap-3 mt-2">
          <button className="flex items-center gap-2 px-8 py-3 rounded-md bg-blue-500 text-white font-medium hover:bg-blue-400 transition-colors duration-200">
            Start free trial <ArrowRight size={15} />
          </button>
          <button className="px-8 py-3 rounded-md border border-white/[0.1] text-white/58 hover:text-white hover:border-white/[0.2] transition-colors duration-200">
            Talk to sales
          </button>
        </div>
        <p className="text-xs text-white/22 mt-1">No credit card required · 14-day free trial · Cancel anytime</p>
      </motion.div>
    </section>
  );
}

// ── FOOTER ────────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer className="border-t border-white/[0.06] px-8 py-10 flex flex-col md:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-2">
        <div className="w-5 h-5 rounded-[5px] bg-gradient-to-br from-blue-500 to-purple-600 shrink-0" />
        <span className="text-sm font-semibold text-white/55 tracking-tight">XAI Workspace</span>
      </div>
      <div className="flex gap-7">
        {["Privacy", "Terms", "Security", "Status", "Blog"].map(link => (
          <a key={link} href="#" className="text-xs text-white/28 hover:text-white/55 transition-colors duration-200">{link}</a>
        ))}
      </div>
      <p className="text-xs text-white/22">© 2026 XAI Inc. All rights reserved.</p>
    </footer>
  );
}

// ── APP ───────────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <div
      className="dark min-h-screen"
      style={{ fontFamily: "'Inter', system-ui, sans-serif", background: "#09090B" }}
    >
      <Nav />
      <HeroSection />
      <InsightFlow />
      <DashboardSection />
      <CTASection />
      <Footer />
    </div>
  );
}
