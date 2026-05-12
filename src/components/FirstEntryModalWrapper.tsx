"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";

const FirstEntryModal = dynamic(() => import("./FirstEntryModal"), {
  ssr: false,
  loading: () => null,
});

export default function FirstEntryModalWrapper() {
  const [accepted, setAccepted] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem("netmasr_rules_accepted")) {
      setAccepted(true);
    }
  }, []);

  function handleAccept() {
    sessionStorage.setItem("netmasr_rules_accepted", "true");
    setAccepted(true);
  }

  if (accepted) return null;

  return <FirstEntryModal onAccept={handleAccept} />;
}