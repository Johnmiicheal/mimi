"use client";

import { ThumbsUp, ThumbsDown } from "@phosphor-icons/react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface VotingButtonsProps {
  upvotes: number;
  downvotes: number;
  userVote?: 'up' | 'down' | null;
  onVote: (vote: 'up' | 'down') => void;
  className?: string;
}

export function VotingButtons({
  upvotes,
  downvotes,
  userVote,
  onVote,
  className
}: VotingButtonsProps) {
  const total = upvotes + downvotes;
  const upvotePercentage = total > 0 ? (upvotes / total) * 100 : 50;

  return (
    <motion.div
      className={cn(
        "inline-flex items-center gap-2 px-2 py-1 rounded-full",
        "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700",
        "shadow-sm",
        className
      )}
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      {/* Upvote button */}
      <motion.button
        onClick={() => onVote('up')}
        className={cn(
          "flex items-center gap-1 px-2 py-1 rounded-full",
          "transition-all duration-200",
          userVote === 'up'
            ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
            : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
        )}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <ThumbsUp
          weight={userVote === 'up' ? 'fill' : 'regular'}
          className="w-4 h-4"
        />
        <span className="text-xs font-semibold">{upvotes}</span>
      </motion.button>

      {/* Vote bar */}
      {total > 0 && (
        <div className="relative w-16 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <motion.div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full"
            initial={{ width: '50%' }}
            animate={{ width: `${upvotePercentage}%` }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
          />
        </div>
      )}

      {/* Downvote button */}
      <motion.button
        onClick={() => onVote('down')}
        className={cn(
          "flex items-center gap-1 px-2 py-1 rounded-full",
          "transition-all duration-200",
          userVote === 'down'
            ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
            : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
        )}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <span className="text-xs font-semibold">{downvotes}</span>
        <ThumbsDown
          weight={userVote === 'down' ? 'fill' : 'regular'}
          className="w-4 h-4"
        />
      </motion.button>
    </motion.div>
  );
}
