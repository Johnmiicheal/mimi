"use client";

import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowClockwise, Warning, X } from "@phosphor-icons/react";
import { formatReplanPrompt } from "@/lib/hooks/useReplan";
import { LandingPage } from "@/components/landing/LandingPage";
import { ChatFooter } from "@/components/chat/ChatFooter";
import { ChatMessage } from "@/components/chat/ChatMessage";
import {
  ThinkingSkeleton,
  StreamingDots,
  ReplanningIndicator,
} from "@/components/chat/StatusIndicators";

export default function Home() {
  const [controlValues, setControlValues] = useState<Record<string, unknown>>({});
  const [committedControlValues, setCommittedControlValues] = useState<Record<string, unknown>>({});
  const [pendingControlChanges, setPendingControlChanges] = useState<Record<string, unknown>>({});
  const [isReplanning, setIsReplanning] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [dismissedError, setDismissedError] = useState<string | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const messageRefs = useRef(new Map<string, HTMLDivElement>());

  const { messages, status, sendMessage, error } = useChat({
    transport: new DefaultChatTransport({ api: "/api/plan-trip" }),
  });

  const isLoading = status === "submitted" || status === "streaming";
  const isThinking = status === "submitted";
  const isChat = messages.length > 0;
  const hasPendingControlChanges = Object.keys(pendingControlChanges).length > 0;

  const latestUserMessageId = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i -= 1) {
      if (messages[i]?.role === "user") {
        return messages[i].id;
      }
    }

    return messages[messages.length - 1]?.id;
  }, [messages]);

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

  const handleAction = useCallback(
    async (prompt: string) => {
      if (isLoading) return;
      setPendingControlChanges({});
      await sendMessage({ text: prompt });
    },
    [isLoading, sendMessage]
  );

  const handleReplan = useCallback(
    async (changes: Map<string, unknown>) => {
      if (messages.length === 0) return;
      setIsReplanning(true);
      await sendMessage({ text: formatReplanPrompt(changes) });
      setIsReplanning(false);
    },
    [messages.length, sendMessage]
  );

  const handleControlChange = (id: string, value: unknown) => {
    setControlValues((prev) => ({ ...prev, [id]: value }));
    setPendingControlChanges((prev) => ({ ...prev, [id]: value }));
  };

  const handleConfirmControlChanges = useCallback(async () => {
    if (isLoading || !hasPendingControlChanges) return;

    const changes = new Map<string, unknown>(Object.entries(pendingControlChanges));
    await handleReplan(changes);
    setCommittedControlValues((prev) => ({ ...prev, ...pendingControlChanges }));
    setPendingControlChanges({});
  }, [handleReplan, hasPendingControlChanges, isLoading, pendingControlChanges]);

  const handleCancelControlChanges = useCallback(() => {
    setControlValues((prev) => {
      const next = { ...prev };

      for (const key of Object.keys(pendingControlChanges)) {
        if (Object.prototype.hasOwnProperty.call(committedControlValues, key)) {
          next[key] = committedControlValues[key];
        } else {
          delete next[key];
        }
      }

      return next;
    });

    setPendingControlChanges({});
  }, [committedControlValues, pendingControlChanges]);

  useEffect(() => {
    if (!isChat || !latestUserMessageId) return;

    const container = scrollContainerRef.current;
    const anchor = messageRefs.current.get(latestUserMessageId);
    if (!container || !anchor) return;

    const topPadding = 24;
    container.scrollTo({
      top: Math.max(anchor.offsetTop - topPadding, 0),
      behavior: "smooth",
    });
  }, [isChat, latestUserMessageId, status]);

  return (
    <div
      className="flex flex-col h-screen overflow-hidden"
      style={{
        background: isChat
          ? "linear-gradient(180deg, #11265b 0%, #0c1d49 42%, #081338 100%)"
          : "linear-gradient(180deg, #3d7ecc 0%, #1d4d9e 38%, #102966 68%, #09183e 100%)",
      }}
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

      {/* ── Main scroll area ── */}
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto relative">
        <AnimatePresence mode="wait">
          {!isChat && (
            <LandingPage
              inputValue={inputValue}
              onInputChange={setInputValue}
              isLoading={isLoading}
              onSubmit={handleSubmit}
              onSuggestionClick={handleSuggestionClick}
            />
          )}
        </AnimatePresence>

        {isChat && (
          <div className="max-w-5xl mx-auto px-4 pt-8 pb-24 space-y-6">
            <AnimatePresence initial={false}>
              {messages.map((message, msgIdx) => (
                <div
                  key={message.id}
                  ref={(node) => {
                    if (node) {
                      messageRefs.current.set(message.id, node);
                    } else {
                      messageRefs.current.delete(message.id);
                    }
                  }}
                >
                  <ChatMessage
                    message={message}
                    isLastAssistant={message.role === "assistant" && msgIdx === messages.length - 1}
                    isLoading={isLoading}
                    controlValues={controlValues}
                    onControlChange={handleControlChange}
                    onAction={handleAction}
                  />
                </div>
              ))}
            </AnimatePresence>

            <ThinkingSkeleton show={isThinking} />
            <StreamingDots show={status === "streaming"} />
            <ReplanningIndicator show={isReplanning && !isLoading} />

            <AnimatePresence>
              {!isLoading && (
                <ChatFooter
                  inputValue={inputValue}
                  onInputChange={setInputValue}
                  isLoading={isLoading}
                  onSubmit={handleSubmit}
                  variant={hasPendingControlChanges ? "confirm" : "inline"}
                  onConfirmChanges={handleConfirmControlChanges}
                  onCancelChanges={handleCancelControlChanges}
                />
              )}
            </AnimatePresence>

            <div className="h-24" />
          </div>
        )}
      </div>
    </div>
  );
}
