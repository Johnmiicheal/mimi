"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Sparkle, ArrowClockwise } from "@phosphor-icons/react";

/** Pulsing skeleton shown while the AI is processing the request. */
export function ThinkingSkeleton({ show }: { show: boolean }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="flex gap-3"
        >
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            style={{
              background: "linear-gradient(to bottom, #f87360, #e84e30, #d93c20)",
              boxShadow: "0 4px 0 #a82610, inset 0 2px 0 rgba(255,200,185,0.4)",
            }}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <Sparkle weight="fill" className="w-4 h-4 text-white" />
            </motion.div>
          </div>
          <div
            className="rounded-2xl px-4 py-4 space-y-2.5"
            style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)" }}
          >
            <motion.p
              className="text-xs text-white/35 mb-1"
              animate={{ opacity: [0.4, 0.8, 0.4] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              mimi is thinking...
            </motion.p>
            {[120, 88, 104, 72].map((w, i) => (
              <motion.div
                key={i}
                className="h-3 rounded-full"
                style={{ width: `${w}px`, background: "rgba(255,255,255,0.12)" }}
                animate={{ opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.15 }}
              />
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** Three bouncing dots shown while the AI is streaming a response. */
export function StreamingDots({ show }: { show: boolean }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
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
  );
}

/** Spinner shown when an existing plan is being updated. */
export function ReplanningIndicator({ show }: { show: boolean }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          className="flex items-center justify-center gap-2 py-3"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          >
            <ArrowClockwise className="w-4 h-4 text-[#ff8a6e]" />
          </motion.div>
          <span className="text-sm text-white/50">Updating your plan...</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
