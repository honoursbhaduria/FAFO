"use client";

import { useState, useEffect, useCallback } from "react";
import { RefreshCw } from "lucide-react";

interface RefreshButtonProps {
  cooldownEndsAt?: string;
  onRefresh: () => Promise<void>;
  isLoading: boolean;
}

export default function RefreshButton({
  cooldownEndsAt,
  onRefresh,
  isLoading,
}: RefreshButtonProps) {
  const [remaining, setRemaining] = useState<number>(0);

  const calcRemaining = useCallback(() => {
    if (!cooldownEndsAt) return 0;
    const diff = new Date(cooldownEndsAt).getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / 1000));
  }, [cooldownEndsAt]);

  useEffect(() => {
    setRemaining(calcRemaining());
    const interval = setInterval(() => {
      const r = calcRemaining();
      setRemaining(r);
      if (r <= 0) clearInterval(interval);
    }, 1000);
    return () => clearInterval(interval);
  }, [calcRemaining]);

  const inCooldown = remaining > 0;
  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;

  return (
    <button
      id="refresh-feed-btn"
      onClick={() => !inCooldown && !isLoading && onRefresh()}
      disabled={inCooldown || isLoading}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
        inCooldown || isLoading
          ? "bg-slate-100 text-slate-400 cursor-not-allowed"
          : "bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-200 active:scale-95"
      }`}
    >
      <RefreshCw
        size={16}
        className={isLoading ? "animate-spin" : ""}
      />
      {isLoading
        ? "Refreshing..."
        : inCooldown
        ? `Wait ${minutes}:${seconds.toString().padStart(2, "0")}`
        : "Refresh Feed"}
    </button>
  );
}
