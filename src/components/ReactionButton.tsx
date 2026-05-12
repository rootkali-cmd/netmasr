"use client";

import { useState, useRef, useEffect } from "react";
import toast from "react-hot-toast";

const REACTIONS = [
  { emoji: "👍", label: "إعجاب" },
  { emoji: "❤️", label: "حب" },
  { emoji: "😂", label: "هاها" },
  { emoji: "😮", label: "مفاجأة" },
  { emoji: "😢", label: "حزين" },
  { emoji: "😡", label: "غضب" },
];

interface ReactionButtonProps {
  score: number;
  voteStatus: "none" | "up" | "down";
  onVote: (type: "up" | "down") => void;
}

export default function ReactionButton({ score, voteStatus, onVote }: ReactionButtonProps) {
  const [showPicker, setShowPicker] = useState(false);
  const [longPressing, setLongPressing] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  function startLongPress() {
    timerRef.current = setTimeout(() => {
      setLongPressing(true);
      setShowPicker(true);
    }, 400);
  }

  function cancelLongPress() {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = null;
  }

  function handleClick() {
    if (longPressing) {
      setLongPressing(false);
      return;
    }
    onVote("up");
  }

  function handleSelect(emoji: string) {
    onVote("up");
    setShowPicker(false);
    setLongPressing(false);
  }

  useEffect(() => {
    if (!showPicker) return;
    function handleOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowPicker(false);
        setLongPressing(false);
      }
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [showPicker]);

  return (
    <div className="relative" ref={containerRef}>
      <button
        onMouseDown={startLongPress}
        onMouseUp={cancelLongPress}
        onMouseLeave={() => { cancelLongPress(); }}
        onTouchStart={startLongPress}
        onTouchEnd={cancelLongPress}
        onClick={handleClick}
        className={`flex items-center gap-1.5 rounded-lg transition-colors px-3 py-1.5 text-sm ${
          voteStatus === "up" ? "bg-blue-50 text-blue-600" : "text-gray-500 hover:text-blue-600 hover:bg-gray-50"
        }`}
      >
        <svg className="w-5 h-5" fill={voteStatus === "up" ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
        </svg>
        <span className="font-semibold">{score}</span>
      </button>

      {showPicker && (
        <div className="absolute bottom-full left-0 mb-2 flex items-center gap-0.5 bg-white rounded-full shadow-xl border border-gray-200 px-2.5 py-2 z-50">
          {REACTIONS.map((r) => (
            <button
              key={r.emoji}
              onClick={() => handleSelect(r.emoji)}
              className="text-2xl hover:scale-125 transition-transform p-1 rounded-full hover:bg-gray-100 active:scale-150"
              title={r.label}
            >
              {r.emoji}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}