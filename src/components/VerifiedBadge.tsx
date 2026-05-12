"use client";

import { useState } from "react";

interface VerifiedBadgeProps {
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
}

export default function VerifiedBadge({ showLabel = true, size = "sm" }: VerifiedBadgeProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  const sizes = {
    sm: { icon: 16, text: "0.8rem", gap: "0.375rem" },
    md: { icon: 20, text: "0.875rem", gap: "0.5rem" },
    lg: { icon: 24, text: "1rem", gap: "0.5rem" },
  };

  const s = sizes[size];

  return (
    <span
      className="verified-badge"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: s.gap,
        position: "relative",
        cursor: "default",
      }}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <svg
        width={s.icon}
        height={s.icon}
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ flexShrink: 0 }}
        aria-label="موثق"
      >
        <circle cx="10" cy="10" r="10" fill="#1877F2" />
        <path
          d="M6 10.5l2.5 2.5 5.5-5.5"
          stroke="white"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {showLabel && (
        <span style={{ fontWeight: 700, color: "#1877F2", fontSize: s.text, lineHeight: 1 }}>
          نت مصر
        </span>
      )}
      {showTooltip && (
        <span
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            left: "50%",
            transform: "translateX(-50%)",
            backgroundColor: "#1f2937",
            color: "white",
            fontSize: "0.75rem",
            padding: "4px 10px",
            borderRadius: "6px",
            whiteSpace: "nowrap",
            zIndex: 60,
            pointerEvents: "none",
            direction: "rtl",
          }}
        >
          منشور رسمي من إدارة NetMasr.org
          <span
            style={{
              position: "absolute",
              top: "-4px",
              left: "50%",
              transform: "translateX(-50%)",
              width: 0,
              height: 0,
              borderLeft: "5px solid transparent",
              borderRight: "5px solid transparent",
              borderBottom: "5px solid #1f2937",
            }}
          />
        </span>
      )}
    </span>
  );
}
