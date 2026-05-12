"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ADMIN_PANEL_PATH } from "@/lib/admin-url";

export function useAdminGate() {
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const gateSecret = process.env.NEXT_PUBLIC_ADMIN_PANEL_PATH;
    if (!gateSecret) {
      setChecked(true);
      return;
    }
    fetch("/api/admin-gate")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.valid) setChecked(true);
        else router.replace(`/${ADMIN_PANEL_PATH}/login`);
      })
      .catch(() => router.replace(`/${ADMIN_PANEL_PATH}/login`));
  }, [router]);

  return checked;
}
