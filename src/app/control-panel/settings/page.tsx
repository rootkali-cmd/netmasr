import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin-auth";
import SettingsClient from "./SettingsClient";
import { ADMIN_PANEL_PATH } from "@/lib/admin-url";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const session = await getAdminSession();
  if (!session) {
    redirect(`/${ADMIN_PANEL_PATH}/login`);
  }

  return <SettingsClient session={session} />;
}
