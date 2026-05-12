"use client";

import { useEffect, useRef } from "react";

declare global {
  interface Window {
    turnstile?: {
      render: (container: HTMLElement | string, opts: Record<string, unknown>) => string;
      reset: (widgetId: string) => void;
      getResponse: (widgetId: string) => string;
    };
  }
}

interface TurnstileWidgetProps {
  onVerify: (token: string) => void;
}

export default function TurnstileWidget({ onVerify }: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  useEffect(() => {
    if (!siteKey || !containerRef.current) return;

    function renderWidget() {
      if (!window.turnstile || !containerRef.current) return;
      if (widgetIdRef.current) {
        window.turnstile.reset(widgetIdRef.current);
        return;
      }
      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: siteKey,
        callback: (token: string) => onVerify(token),
        "expired-callback": () => onVerify(""),
        language: "ar",
      });
    }

    if (window.turnstile) {
      renderWidget();
    } else {
      const s = document.createElement("script");
      s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onloadTurnstileCallback&render=explicit";
      s.async = true;
      s.defer = true;
      (window as any).onloadTurnstileCallback = renderWidget;
      document.head.appendChild(s);
      return () => { delete (window as any).onloadTurnstileCallback; };
    }
  }, [siteKey, onVerify]);

  if (!siteKey) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800 text-center">
        ⚠️ التحقق الأمني غير متاح حالياً. يُرجى إضافة{" "}
        <code className="bg-yellow-100 px-1 rounded">NEXT_PUBLIC_TURNSTILE_SITE_KEY</code> إلى ملف البيئة.
      </div>
    );
  }

  return <div ref={containerRef} className="flex justify-center" />;
}