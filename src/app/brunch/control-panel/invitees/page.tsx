import { redirect } from "next/navigation";
import styles from "../page.module.css";
import { hasControlPanelAccess } from "@/lib/control-panel-access";
import { getInviteeContent } from "@/lib/github-content";
import InviteeManager from "../invitee-manager";

export const dynamic = "force-dynamic";

export default async function InviteesPage() {
  if (!(await hasControlPanelAccess())) redirect("/brunch/control-panel");
  const invitees = await getInviteeContent();

  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <div className={styles.header}>
          <div><p className={styles.label}>brunch</p><h1>manage <span>invitees</span></h1></div>
          <a href="/brunch/control-panel">home</a>
        </div>
        <InviteeManager initialInvitees={invitees.invitees} />
      </section>
    </main>
  );
}
