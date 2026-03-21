"use client";

import { useState, useCallback, useRef } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import {
  PaperPlaneRight,
  Sparkle,
  User,
  ArrowClockwise,
  Warning,
  X,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { InlineUIRenderer } from "@/lib/inline-ui/renderer";
import { useReplan, formatReplanPrompt } from "@/lib/hooks/useReplan";
import { AgentPanel, type AgentData, type AgentType } from "@/components/AgentPanel";

// ─── Deterministic star field (LCG seeded — no SSR hydration mismatch) ────────
interface StarDot {
  id: number; x: number; y: number;
  size: number; opacity: number;
  duration: number; delay: number;
  warm: boolean; // golden vs white star
}
function lcg(seed: number) {
  let s = seed >>> 0;
  return () => { s = ((s * 1664525 + 1013904223) >>> 0); return s / 4294967296; };
}
const rand = lcg(0x1a2b3c4d);
const STARS: StarDot[] = Array.from({ length: 110 }, (_, i) => ({
  id: i,
  x: rand() * 100, y: rand() * 100,
  size: rand() * 2.4 + 0.6,
  opacity: rand() * 0.55 + 0.2,
  duration: rand() * 3 + 2,
  delay: rand() * 6,
  warm: rand() > 0.6, // 40% warm golden
}));

// ─── Suggestion pill configs ───────────────────────────────────────────────────
// gradient: radial from top-center (like light hitting a balloon) → gives puffy look
const SUGGESTIONS = [
  {
    label: "7 days in Japan 🇯🇵",
    prompt: "Plan a 7-day trip to Japan for 2 people with a budget of $3000 per person",
    gradient: "radial-gradient(ellipse at 50% 15%, #ffcbb8 0%, #f87868 28%, #e84830 62%, #c83018 100%)",
    shadowRgb: "160,36,14",
    topHighlight: "rgba(255,220,205,0.6)",
  },
  {
    label: "Paris art & food 🥐",
    prompt: "I want to visit Paris for 5 nights, I love art and food",
    gradient: "radial-gradient(ellipse at 50% 15%, #c8e8ff 0%, #74b8ff 28%, #3e88f0 62%, #2060cc 100%)",
    shadowRgb: "22,72,160",
    topHighlight: "rgba(210,235,255,0.6)",
  },
  {
    label: "Bali beach escape 🌊",
    prompt: "Plan a beach vacation to Bali, budget-friendly for a solo traveler",
    gradient: "radial-gradient(ellipse at 50% 15%, #b8f8d4 0%, #52e08a 28%, #1ec862 62%, #14a048 100%)",
    shadowRgb: "12,110,48",
    topHighlight: "rgba(195,255,220,0.6)",
  },
];

// ─── Mimi 3D text shadow ───────────────────────────────────────────────────────
const MIMI_SHADOW = [
  "0 2px 0 #e56a50",
  "0 4px 0 #d05238",
  "0 6px 0 #ba3e25",
  "0 8px 0 #a02c14",
  "0 10px 0 #8a2008",
  "0 14px 24px rgba(0,0,0,0.45)",
  "0 26px 40px rgba(0,0,0,0.22)",
  "0 0 80px rgba(255,138,110,0.25)",
].join(", ");

// ─── CSS cloud component ───────────────────────────────────────────────────────
function CloudShape({ scale = 1 }: { scale?: number }) {
  const w = 220 * scale;
  return (
    <div className="relative" style={{ width: w, height: w * 0.42 }}>
      {/* base body */}
      <div
        className="absolute bottom-0 left-0 right-0 rounded-full"
        style={{
          height: "55%",
          background: "linear-gradient(to bottom, #ffffff, #eef3ff)",
          boxShadow: "0 8px 24px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.8)",
        }}
      />
      {/* left bump */}
      <div
        className="absolute rounded-full"
        style={{
          bottom: "40%", left: "8%",
          width: "38%", height: "85%",
          background: "linear-gradient(to bottom, #ffffff, #f0f5ff)",
          boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
        }}
      />
      {/* center bump (tallest) */}
      <div
        className="absolute rounded-full"
        style={{
          bottom: "42%", left: "30%",
          width: "44%", height: "100%",
          background: "linear-gradient(to bottom, #ffffff, #eef3ff)",
          boxShadow: "0 4px 14px rgba(0,0,0,0.14)",
        }}
      />
      {/* right bump */}
      <div
        className="absolute rounded-full"
        style={{
          bottom: "35%", left: "58%",
          width: "32%", height: "75%",
          background: "linear-gradient(to bottom, #f8fbff, #e8f0ff)",
          boxShadow: "0 3px 10px rgba(0,0,0,0.10)",
        }}
      />
    </div>
  );
}

export default function Home() {
  const [controlValues, setControlValues] = useState<Record<string, unknown>>({});
  const [isReplanning, setIsReplanning] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [dismissedError, setDismissedError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Mouse parallax
  const rawX = useMotionValue(0.5);
  const rawY = useMotionValue(0.5);
  const smoothX = useSpring(rawX, { stiffness: 45, damping: 18, mass: 0.6 });
  const smoothY = useSpring(rawY, { stiffness: 45, damping: 18, mass: 0.6 });

  // Stars: subtle 18px range
  const starsX = useTransform(smoothX, [0, 1], [-18, 18]);
  const starsY = useTransform(smoothY, [0, 1], [-12, 12]);

  // Cloud layers at different depths
  const cloudsFarX = useTransform(smoothX, [0, 1], [-8, 8]);
  const cloudsFarY = useTransform(smoothY, [0, 1], [-4, 4]);
  const cloudsNearX = useTransform(smoothX, [0, 1], [-14, 14]);
  const cloudsNearY = useTransform(smoothY, [0, 1], [-7, 7]);

  const handleLandingMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      rawX.set((e.clientX - rect.left) / rect.width);
      rawY.set((e.clientY - rect.top) / rect.height);
    },
    [rawX, rawY]
  );

  const { messages, status, sendMessage, error } = useChat({
    transport: new DefaultChatTransport({ api: "/api/plan-trip" }),
  });

  const isLoading = status === "submitted" || status === "streaming";
  const isThinking = status === "submitted";
  const isChat = messages.length > 0;

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!inputValue.trim() || isLoading) return;
      const text = inputValue;
      setInputValue("");
      await sendMessage({ text });
    },
    [inputValue, isLoading, sendMessage]
  );

  const handleSuggestionClick = useCallback(
    async (prompt: string) => {
      if (isLoading) return;
      await sendMessage({ text: prompt });
    },
    [isLoading, sendMessage]
  );

  const handleReplan = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async (changes: Map<string, any>) => {
      if (messages.length === 0) return;
      setIsReplanning(true);
      await sendMessage({ text: formatReplanPrompt(changes) });
      setIsReplanning(false);
    },
    [messages.length, sendMessage]
  );

  const { handleControlChange: triggerReplan } = useReplan({
    onReplan: handleReplan,
    debounceMs: 1500,
  });

  const handleControlChange = (id: string, value: unknown) => {
    setControlValues((prev) => ({ ...prev, [id]: value }));
    triggerReplan(id, value);
  };

  return (
    <div
      className="flex flex-col h-screen overflow-hidden"
      style={{ background: "linear-gradient(180deg, #3d7ecc 0%, #1d4d9e 38%, #102966 68%, #09183e 100%)" }}
    >
      {/* ── Replanning banner ── */}
      <AnimatePresence>
        {isReplanning && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden shrink-0"
            style={{ background: "rgba(30,70,160,0.7)", backdropFilter: "blur(12px)" }}
          >
            <div className="max-w-3xl mx-auto px-4 py-2 flex items-center justify-center gap-2 text-white text-sm font-medium">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}>
                <ArrowClockwise className="w-4 h-4" weight="bold" />
              </motion.div>
              <span>Updating your travel plan...</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Error banner ── */}
      <AnimatePresence>
        {error && error.message !== dismissedError && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden shrink-0"
            style={{ background: "rgba(160,30,30,0.6)", backdropFilter: "blur(12px)" }}
          >
            <div className="max-w-3xl mx-auto px-4 py-2 flex items-center gap-2 text-red-100 text-sm">
              <Warning className="w-4 h-4 shrink-0" weight="fill" />
              <span className="flex-1">Something went wrong. Please try again.</span>
              <button
                onClick={() => setDismissedError(error?.message ?? "")}
                className="p-1 hover:bg-red-800/40 rounded transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Chat header ── */}
      <AnimatePresence>
        {isChat && (
          <motion.header
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="shrink-0 sticky top-0 z-20"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.12)", background: "rgba(16,40,100,0.55)", backdropFilter: "blur(20px)" }}
          >
            <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: "linear-gradient(to bottom, #f87360, #e84e30, #d93c20)", boxShadow: "0 4px 0 #a82610, inset 0 2px 0 rgba(255,200,185,0.4), 0 5px 14px rgba(215,60,32,0.35)" }}
              >
                <Sparkle weight="fill" className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-base font-semibold text-white leading-none" style={{ fontFamily: "var(--font-fredoka)" }}>
                  mimi
                </h1>
                <p className="text-xs text-white/45 mt-0.5">AI travel companion</p>
              </div>
            </div>
          </motion.header>
        )}
      </AnimatePresence>

      {/* ── Main scroll area ── */}
      <div className="flex-1 overflow-y-auto relative">

        {/* ═══════════ LANDING STATE ═══════════ */}
        <AnimatePresence mode="wait">
          {!isChat && (
            <motion.div
              key="landing"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.4 }}
              className="relative w-full min-h-full flex flex-col items-center justify-center px-4 overflow-hidden"
              onMouseMove={handleLandingMouseMove}
            >
              {/* ── Star field (parallax layer 1 — deepest) ── */}
              <motion.div
                className="absolute inset-0 pointer-events-none"
                style={{ x: starsX, y: starsY }}
              >
                {STARS.map((star) => (
                  <motion.span
                    key={star.id}
                    className="absolute rounded-full"
                    style={{
                      left: `${star.x}%`,
                      top: `${star.y}%`,
                      width: `${star.size}px`,
                      height: `${star.size}px`,
                      opacity: star.opacity,
                      background: star.warm ? "#ffe8a0" : "#ffffff",
                      boxShadow: star.warm
                        ? `0 0 ${star.size * 2}px rgba(255,232,140,0.7)`
                        : `0 0 ${star.size}px rgba(255,255,255,0.5)`,
                    }}
                    animate={{ opacity: [star.opacity, Math.min(star.opacity * 2.4, 1), star.opacity] }}
                    transition={{ duration: star.duration, repeat: Infinity, delay: star.delay, ease: "easeInOut" }}
                  />
                ))}
              </motion.div>

              {/* ── Clouds — far layer ── */}
              <motion.div
                className="absolute pointer-events-none"
                style={{ x: cloudsFarX, y: cloudsFarY, top: "12%", left: "-2%" }}
              >
                <motion.div
                  animate={{ y: [0, -10, 0], x: [0, 6, 0] }}
                  transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
                >
                  <CloudShape scale={0.85} />
                </motion.div>
              </motion.div>

              <motion.div
                className="absolute pointer-events-none"
                style={{ x: cloudsFarX, y: cloudsFarY, top: "58%", right: "-4%" }}
              >
                <motion.div
                  animate={{ y: [0, 8, 0], x: [0, -8, 0] }}
                  transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
                >
                  <CloudShape scale={1.1} />
                </motion.div>
              </motion.div>

              {/* ── Clouds — near layer ── */}
              <motion.div
                className="absolute pointer-events-none"
                style={{ x: cloudsNearX, y: cloudsNearY, bottom: "18%", left: "4%" }}
              >
                <motion.div
                  animate={{ y: [0, -14, 0], x: [0, 10, 0] }}
                  transition={{ duration: 11, repeat: Infinity, ease: "easeInOut", delay: 3 }}
                >
                  <CloudShape scale={1.25} />
                </motion.div>
              </motion.div>

              <motion.div
                className="absolute pointer-events-none"
                style={{ x: cloudsNearX, y: cloudsNearY, top: "20%", right: "3%" }}
              >
                <motion.div
                  animate={{ y: [0, -12, 0], x: [0, -6, 0] }}
                  transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 4.5 }}
                >
                  <CloudShape scale={0.9} />
                </motion.div>
              </motion.div>

              {/* ── Ambient glow ── */}
              <div
                className="absolute pointer-events-none"
                style={{
                  top: "30%", left: "50%", transform: "translate(-50%, -50%)",
                  width: "600px", height: "220px",
                  borderRadius: "50%",
                  background: "radial-gradient(ellipse, rgba(255,120,90,0.12) 0%, transparent 70%)",
                  filter: "blur(20px)",
                }}
              />

              {/* ── Hero text ── */}
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                className="relative z-10 text-center mb-10 select-none"
              >
                <p
                  className="text-white/75 font-light tracking-widest uppercase mb-0"
                  style={{ fontSize: "clamp(1rem, 2.5vw, 1.3rem)", letterSpacing: "0.35em" }}
                >
                  Travel with
                </p>
                <h1
                  className="leading-none"
                  style={{
                    fontFamily: "var(--font-fredoka)",
                    fontWeight: 600,
                    fontSize: "clamp(5.5rem, 20vw, 12rem)",
                    color: "#ff8a6e",
                    textShadow: MIMI_SHADOW,
                    letterSpacing: "0.01em",
                    lineHeight: 1.05,
                  }}
                >
                  mimi
                </h1>
                <p
                  className="text-white/38 tracking-[0.28em] uppercase mt-2"
                  style={{ fontSize: "0.72rem" }}
                >
                  Your AI travel companion
                </p>
              </motion.div>

              {/* ── Input + pills ── */}
              <motion.div
                initial={{ opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
                className="relative z-10 w-full max-w-lg"
              >
                {/* White pill input */}
                <form onSubmit={handleSubmit} className="relative mb-5">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Where do you want to go?"
                    disabled={isLoading}
                    className={cn(
                      "w-full pl-6 pr-16 py-4 rounded-full",
                      "bg-white text-gray-800 placeholder:text-gray-400",
                      "text-base font-medium",
                      "focus:outline-none focus:ring-4 focus:ring-blue-300/40",
                      "disabled:opacity-50 disabled:cursor-not-allowed",
                      "transition-all duration-200"
                    )}
                    style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.22), 0 2px 6px rgba(0,0,0,0.12)" }}
                  />
                  <motion.button
                    type="submit"
                    disabled={isLoading || !inputValue?.trim()}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{
                      background: "radial-gradient(ellipse at 50% 20%, #ffcbb8 0%, #f87868 30%, #e84830 65%, #c83018 100%)",
                      boxShadow: "inset 0 2px 10px rgba(255,220,205,0.6), inset 0 -6px 14px rgba(0,0,0,0.18), 0 10px 28px rgba(160,36,14,0.45)",
                    }}
                    whileHover={{ scale: 1.1, boxShadow: "inset 0 2px 10px rgba(255,220,205,0.6), inset 0 -6px 14px rgba(0,0,0,0.18), 0 16px 34px rgba(160,36,14,0.5)", transition: { type: "spring", stiffness: 800, damping: 20 } }}
                    whileTap={{ scale: 0.93, boxShadow: "inset 0 2px 10px rgba(255,220,205,0.6), inset 0 -3px 8px rgba(0,0,0,0.14), 0 4px 14px rgba(160,36,14,0.38)", transition: { type: "spring", stiffness: 1000, damping: 30 } }}
                  >
                    <PaperPlaneRight weight="fill" className="w-5 h-5 text-white" />
                  </motion.button>
                </form>

                {/* 3D bubbly pill suggestions */}
                <div className="flex flex-wrap gap-3 justify-center">
                  {SUGGESTIONS.map((s, i) => (
                    <motion.button
                      key={i}
                      initial={{ opacity: 0, y: 14, scale: 0.88 }}
                      animate={{ opacity: 1, y: 0, scale: 1, transition: {  duration: 0.5, ease: [0.22, 1, 0.36, 1] } }}
                      transition={{ type: "spring", stiffness: 800, damping: 20 }}
                      onClick={() => handleSuggestionClick(s.prompt)}
                      disabled={isLoading}
                      className="px-7 py-3 rounded-full text-sm font-bold text-white cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed select-none"
                      style={{
                        background: s.gradient,
                        boxShadow: [
                          `inset 0 2px 10px ${s.topHighlight}`,
                          `inset 0 -6px 14px rgba(0,0,0,0.18)`,
                          `0 10px 28px rgba(${s.shadowRgb},0.45)`,
                        ].join(", "),
                      }}
                      whileHover={{ scale: 1.08, transition: { type: "spring", stiffness: 800, damping: 20 } }}
                      whileTap={{ scale: 0.93, transition: { type: "spring", stiffness: 1000, damping: 30 } }}
                    >
                      {s.label}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ═══════════ CHAT STATE ═══════════ */}
        {isChat && (
          <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
            <AnimatePresence initial={false}>
              {messages.map((message, msgIdx) => {
                const agentData: AgentData = {};
                const agentTypes: AgentType[] = ["safety", "currency", "weather", "visa", "events"];
                if (message.role === "assistant" && message.parts) {
                  for (const part of message.parts) {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const p = part as any;
                    if (typeof p.type === "string" && p.type.startsWith("data-agent-")) {
                      const agentKey = p.type.replace("data-agent-", "") as AgentType;
                      if (agentTypes.includes(agentKey)) {
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        (agentData as any)[agentKey] = p.data;
                      }
                    }
                  }
                }

                const isLastAssistant = message.role === "assistant" && msgIdx === messages.length - 1;
                const loadingAgents = new Set<AgentType>(
                  isLastAssistant && isLoading
                    ? agentTypes.filter((t) => agentData[t] === undefined)
                    : []
                );
                const hasAgentData = Object.keys(agentData).length > 0;
                const showAgentPanel =
                  message.role === "assistant" &&
                  (hasAgentData || (isLastAssistant && isLoading));

                return (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    className={cn("flex gap-3", message.role === "user" ? "justify-end" : "justify-start")}
                  >
                    {message.role === "assistant" && (
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                        style={{
                          background: "linear-gradient(to bottom, #f87360, #e84e30, #d93c20)",
                          boxShadow: "0 4px 0 #a82610, inset 0 2px 0 rgba(255,200,185,0.4), 0 5px 12px rgba(215,60,32,0.3)",
                        }}
                      >
                        <Sparkle weight="fill" className="w-4 h-4 text-white" />
                      </div>
                    )}

                    <div
                      className={cn(
                        "max-w-[85%]",
                        message.role === "user"
                          ? "rounded-2xl px-4 py-3 text-white shadow-sm"
                          : "py-1 min-w-0"
                      )}
                      style={
                        message.role === "user"
                          ? {
                              background: "linear-gradient(135deg, rgba(61,126,204,0.6), rgba(29,77,158,0.6))",
                              border: "1px solid rgba(255,255,255,0.15)",
                              backdropFilter: "blur(12px)",
                            }
                          : undefined
                      }
                    >
                      <div className={cn("text-sm", message.role === "user" ? "text-white" : "text-white/88")}>
                        {(() => {
                          const textPart = message.parts?.find(
                            (p): p is { type: "text"; text: string } => p.type === "text"
                          );
                          const text =
                            textPart?.text ??
                            (message as unknown as { content?: string }).content ??
                            "";
                          return message.role === "assistant" ? (
                            <InlineUIRenderer text={text} controlValues={controlValues} onControlChange={handleControlChange} />
                          ) : (
                            <p className="whitespace-pre-wrap m-0">{text}</p>
                          );
                        })()}
                      </div>
                      {showAgentPanel && <AgentPanel data={agentData} loading={loadingAgents} />}
                    </div>

                    {message.role === "user" && (
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                        style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.18)" }}
                      >
                        <User weight="bold" className="w-4 h-4 text-white/65" />
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {/* Thinking skeleton */}
            <AnimatePresence>
              {isThinking && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
                  className="flex gap-3"
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: "linear-gradient(to bottom, #f87360, #e84e30, #d93c20)", boxShadow: "0 4px 0 #a82610, inset 0 2px 0 rgba(255,200,185,0.4)" }}
                  >
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}>
                      <Sparkle weight="fill" className="w-4 h-4 text-white" />
                    </motion.div>
                  </div>
                  <div
                    className="rounded-2xl px-4 py-4 space-y-2.5"
                    style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)" }}
                  >
                    <motion.p className="text-xs text-white/35 mb-1" animate={{ opacity: [0.4, 0.8, 0.4] }} transition={{ duration: 1.5, repeat: Infinity }}>
                      mimi is thinking...
                    </motion.p>
                    {[120, 88, 104, 72].map((w, i) => (
                      <motion.div
                        key={i} className="h-3 rounded-full" style={{ width: `${w}px`, background: "rgba(255,255,255,0.12)" }}
                        animate={{ opacity: [0.3, 0.6, 0.3] }} transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.15 }}
                      />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Streaming dots */}
            <AnimatePresence>
              {status === "streaming" && (
                <motion.div
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="flex justify-start pl-11"
                >
                  <div className="flex gap-1.5 px-3 py-2">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ background: "#ff8a6e" }}
                        animate={{ scale: [1, 1.4, 1], opacity: [0.4, 1, 0.4] }}
                        transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
                      />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Replanning indicator */}
            <AnimatePresence>
              {isReplanning && !isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                  className="flex items-center justify-center gap-2 py-3"
                >
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}>
                    <ArrowClockwise className="w-4 h-4 text-[#ff8a6e]" />
                  </motion.div>
                  <span className="text-sm text-white/50">Updating your plan...</span>
                </motion.div>
              )}
            </AnimatePresence>

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* ── Chat footer ── */}
      <AnimatePresence>
        {isChat && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            className="shrink-0"
            style={{ borderTop: "1px solid rgba(255,255,255,0.1)", background: "rgba(16,40,100,0.45)", backdropFilter: "blur(20px)" }}
          >
            <div className="max-w-3xl mx-auto px-4 py-3">
              <form onSubmit={handleSubmit} className="relative">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Ask mimi anything..."
                  disabled={isLoading}
                  className={cn(
                    "w-full pl-5 pr-12 py-3 rounded-full",
                    "bg-white text-gray-800 placeholder:text-gray-400",
                    "text-sm font-medium",
                    "focus:outline-none focus:ring-4 focus:ring-blue-300/40",
                    "disabled:opacity-50 disabled:cursor-not-allowed",
                    "transition-all duration-200"
                  )}
                  style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.2)" }}
                />
                <motion.button
                  type="submit"
                  disabled={isLoading || !inputValue?.trim()}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{
                    background: "linear-gradient(to bottom, #f87360 0%, #e84e30 55%, #d93c20 100%)",
                    boxShadow: "0 4px 0 #a82610, inset 0 2px 0 rgba(255,200,185,0.45), 0 6px 16px rgba(215,60,32,0.35)",
                  }}
                  whileHover={{ y: -2, boxShadow: "0 6px 0 #a82610, inset 0 2px 0 rgba(255,200,185,0.45), 0 8px 20px rgba(215,60,32,0.4)" }}
                  whileTap={{ y: 3, boxShadow: "0 1px 0 #a82610, inset 0 2px 0 rgba(255,200,185,0.45), 0 3px 8px rgba(215,60,32,0.25)" }}
                >
                  <PaperPlaneRight
                    weight="fill"
                    className={cn("w-4 h-4", inputValue?.trim() && !isLoading ? "text-white" : "text-white/60")}
                  />
                </motion.button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
