"use client";

import { motion } from "framer-motion";
import { Sparkle } from "@phosphor-icons/react";

export function ChatHeader() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="shrink-0 sticky top-0 z-20"
      style={{
        borderBottom: "1px solid rgba(255,255,255,0.12)",
        background: "rgba(16,40,100,0.55)",
        backdropFilter: "blur(20px)",
      }}
    >
      <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
          style={{
            background: "linear-gradient(to bottom, #f87360, #e84e30, #d93c20)",
            boxShadow: "0 4px 0 #a82610, inset 0 2px 0 rgba(255,200,185,0.4), 0 5px 14px rgba(215,60,32,0.35)",
          }}
        >
          <Sparkle weight="fill" className="w-4 h-4 text-white" />
        </div>
        <div>
          <h1
            className="text-base font-semibold text-white leading-none"
            style={{ fontFamily: "var(--font-fredoka)" }}
          >
            mimi
          </h1>
          <p className="text-xs text-white/45 mt-0.5">AI travel companion</p>
        </div>
      </div>
    </motion.header>
  );
}
