// @ts-nocheck
"use client";

import { useState } from "react";
import { useChat } from "@ai-sdk/react";
import { motion, AnimatePresence } from "framer-motion";
import { PaperPlaneRight, Sparkle } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import type { Country } from "./inline-ui/CountryPicker";

interface TripParams {
  destination: Country;
  travelers: number;
  nights: number;
  departure: Date;
  budget: number;
  interests: Record<string, boolean>;
  pace?: 'relaxed' | 'moderate' | 'packed';
}

interface TripPlanStreamProps {
  tripParams: TripParams;
}

export function TripPlanStream({ tripParams }: TripPlanStreamProps) {
  const [hasStarted, setHasStarted] = useState(false);

  const { messages, append, isLoading } = useChat({
    api: '/api/plan-trip',
    onFinish: () => {
      console.log('[Chat] Planning complete');
    },
    onError: (error) => {
      console.error('[Chat] Error:', error);
    },
  });

  const handleStartPlanning = async () => {
    setHasStarted(true);

    await append({
      role: 'user',
      content: 'Start planning my trip',
      data: { tripParams },
    });
  };

  return (
    <div className="space-y-6">
      {/* Start button */}
      {!hasStarted && messages.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center"
        >
          <motion.button
            onClick={handleStartPlanning}
            disabled={isLoading}
            className={cn(
              "px-8 py-4 rounded-full font-semibold text-lg shadow-xl hover:shadow-2xl",
              "bg-gradient-to-r from-primary-500 via-secondary-500 to-accent-500 text-white",
              "relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed"
            )}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0"
              initial={{ x: "-100%" }}
              whileHover={{ x: "100%" }}
              transition={{ duration: 0.6 }}
            />
            <span className="relative z-10 flex items-center gap-2">
              <Sparkle weight="fill" className="w-5 h-5" />
              Plan My Perfect Trip
              <Sparkle weight="fill" className="w-5 h-5" />
            </span>
          </motion.button>
        </motion.div>
      )}

      {/* Messages */}
      <AnimatePresence mode="popLayout">
        {messages.map((message, index) => (
          <motion.div
            key={message.id || index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ delay: index * 0.1 }}
            className={cn(
              "glass-strong rounded-2xl p-6 shadow-lg border",
              message.role === 'user'
                ? "border-primary-200/50 bg-gradient-to-r from-primary-50/30 to-primary-100/30"
                : "border-white/20"
            )}
          >
            {/* Message role badge */}
            <div className="flex items-center gap-2 mb-3">
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center",
                  message.role === 'user'
                    ? "bg-gradient-to-br from-primary-400 to-primary-600"
                    : "bg-gradient-to-br from-secondary-400 to-secondary-600"
                )}
              >
                {message.role === 'user' ? (
                  <span className="text-white text-sm font-bold">You</span>
                ) : (
                  <Sparkle weight="fill" className="w-4 h-4 text-white" />
                )}
              </div>
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {message.role === 'user' ? 'You' : 'AI Travel Planner'}
              </span>
            </div>

            {/* Message content */}
            <div className="prose dark:prose-invert max-w-none">
              {/* For now, just render raw content - we'll add inline UI parser later */}
              <div className="whitespace-pre-wrap">{message.content}</div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Loading state */}
      {isLoading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-strong rounded-2xl p-6 border border-white/20"
        >
          <div className="flex items-center gap-3">
            <motion.div
              animate={{
                rotate: 360,
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "linear",
              }}
            >
              <Sparkle weight="fill" className="w-6 h-6 text-primary-500" />
            </motion.div>
            <div>
              <div className="font-medium text-gray-800 dark:text-gray-200">
                Planning your perfect trip...
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Analyzing destinations, checking flights, finding the best activities
              </div>
            </div>
          </div>

          {/* Loading animation */}
          <div className="mt-4 flex gap-2">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="h-2 w-2 rounded-full bg-primary-400"
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
              />
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
