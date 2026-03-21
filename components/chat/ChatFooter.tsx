"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { PaperPlaneRight, User } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

interface ChatFooterProps {
  inputValue: string;
  onInputChange: (value: string) => void;
  isLoading: boolean;
  onSubmit: (e: React.FormEvent) => void;
  variant?: "footer" | "inline";
}

export function ChatFooter({
  inputValue,
  onInputChange,
  isLoading,
  onSubmit,
  variant = "footer",
}: ChatFooterProps) {
  const inlineTextareaRef = useRef<HTMLTextAreaElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [inlineHeight, setInlineHeight] = useState(26);
  const inlinePlaceholder = "Ask mimi anything...";

  useLayoutEffect(() => {
    if (variant !== "inline") return;

    const textarea = inlineTextareaRef.current;
    if (!textarea) return;

    textarea.style.height = "0px";
    const nextHeight = Math.min(220, Math.max(26, textarea.scrollHeight));
    textarea.style.height = `${nextHeight}px`;
    setInlineHeight(nextHeight);
  }, [inputValue, variant]);

  if (variant === "inline") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="flex justify-end gap-3"
      >
        <motion.div
          className={cn(
            "rounded-2xl px-4 py-3 text-white shadow-sm",
            "border border-white/15 backdrop-blur-[12px]"
          )}
          animate={{
            width: isFocused ? 648 : 360,
          }}
          transition={{
            type: "spring",
            duration: 0.5,
            bounce: 0.18,
            ease: "easeInOut",
          }}
          style={{
            background: "linear-gradient(135deg, rgba(61,126,204,0.6), rgba(29,77,158,0.6))",
            maxWidth: "90%",
            minWidth: "320px",
          }}
        >
          <form onSubmit={onSubmit} className="relative">
            <textarea
              ref={inlineTextareaRef}
              value={inputValue}
              onChange={(e) => onInputChange(e.target.value)}
              placeholder={inlinePlaceholder}
              disabled={isLoading}
              rows={1}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  if (!isLoading && inputValue.trim()) {
                    e.currentTarget.form?.requestSubmit();
                  }
                }
              }}
              className={cn(
                "w-full pr-11 bg-transparent text-white placeholder:text-white/55 resize-none overflow-hidden",
                "text-sm font-medium",
                "focus:outline-none leading-6",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                "transition-all duration-200"
              )}
              style={{ minHeight: `${inlineHeight}px` }}
            />
            <motion.button
              type="submit"
              disabled={isLoading || !inputValue?.trim()}
              className="absolute right-0 bottom-0 w-8 h-8 rounded-full flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed"
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
        </motion.div>

        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
          style={{
            background: "rgba(255,255,255,0.12)",
            border: "1px solid rgba(255,255,255,0.18)",
          }}
        >
          <User weight="bold" className="w-4 h-4 text-white/65" />
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.3 }}
      className="shrink-0"
      style={{
        borderTop: "1px solid rgba(255,255,255,0.1)",
        background: "rgba(16,40,100,0.45)",
        backdropFilter: "blur(20px)",
      }}
    >
      <div className="max-w-3xl mx-auto px-4 py-3">
        <form onSubmit={onSubmit} className="relative">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => onInputChange(e.target.value)}
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
  );
}
