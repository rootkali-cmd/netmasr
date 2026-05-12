import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin-auth";
import { ADMIN_PANEL_PATH } from "@/lib/admin-url";

export default async function ControlPanelPage() {
  const session = await getAdminSession();
  if (session) {
    redirect(`/${ADMIN_PANEL_PATH}/dashboard`);
  }
  redirect(`/${ADMIN_PANEL_PATH}/login`);
}
