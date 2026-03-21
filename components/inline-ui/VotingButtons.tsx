"use client";

import { ThumbsUp, ThumbsDown } from "@phosphor-icons/react";
import { motion } from "framer-motion";
import { CONTROL_COLORS, pillBoxShadow } from "@/lib/inline-ui/colors";

const GREEN  = CONTROL_COLORS[2]; // green  → upvote
const CORAL  = CONTROL_COLORS[0]; // coral  → downvote

interface VotingButtonsProps {
  upvotes: number;
  downvotes: number;
  userVote?: 'up' | 'down' | null;
  onVote: (vote: 'up' | 'down') => void;
  className?: string;
}

export function VotingButtons({ upvotes, downvotes, userVote, onVote }: VotingButtonsProps) {
  const total = upvotes + downvotes;
  const upvotePercentage = total > 0 ? (upvotes / total) * 100 : 50;

  const activeUpStyle   = { background: GREEN.gradient, boxShadow: pillBoxShadow(GREEN, "sm") };
  const activeDownStyle = { background: CORAL.gradient, boxShadow: pillBoxShadow(CORAL, "sm") };
  const inactiveStyle   = { background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)" };

  return (
    <motion.div
      className="inline-flex items-center gap-2 px-2 py-1 rounded-full"
      style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)" }}
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 800, damping: 20 }}
    >
      <motion.button
        onClick={() => onVote('up')}
        className="flex items-center gap-1 px-2 py-1 rounded-full text-white text-sm font-semibold"
        style={userVote === 'up' ? activeUpStyle : inactiveStyle}
        whileHover={{ scale: 1.08, transition: { type: "spring", stiffness: 800, damping: 20 } }}
        whileTap={{ scale: 0.93, transition: { type: "spring", stiffness: 1000, damping: 30 } }}
        transition={{ type: "spring", stiffness: 800, damping: 20 }}
      >
        <ThumbsUp weight={userVote === 'up' ? 'fill' : 'bold'} className="w-4 h-4" />
        <span>{upvotes}</span>
      </motion.button>

      {total > 0 && (
        <div className="relative w-14 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.15)" }}>
          <motion.div
            className="absolute top-0 left-0 h-full rounded-full"
            style={{ background: GREEN.gradient }}
            initial={{ width: '50%' }}
            animate={{ width: `${upvotePercentage}%` }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
          />
        </div>
      )}

      <motion.button
        onClick={() => onVote('down')}
        className="flex items-center gap-1 px-2 py-1 rounded-full text-white text-sm font-semibold"
        style={userVote === 'down' ? activeDownStyle : inactiveStyle}
        whileHover={{ scale: 1.08, transition: { type: "spring", stiffness: 800, damping: 20 } }}
        whileTap={{ scale: 0.93, transition: { type: "spring", stiffness: 1000, damping: 30 } }}
        transition={{ type: "spring", stiffness: 800, damping: 20 }}
      >
        <span>{downvotes}</span>
        <ThumbsDown weight={userVote === 'down' ? 'fill' : 'bold'} className="w-4 h-4" />
      </motion.button>
    </motion.div>
  );
}
