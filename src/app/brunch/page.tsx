import { redirect } from "next/navigation";
import styles from "./page.module.css";
import BrunchPreferences from "@/components/brunch-preferences";
import { getAuthenticatedInvitee } from "@/lib/brunch-access";
import { getBrunchContent } from "@/lib/github-content";

export const dynamic = "force-dynamic";

export const metadata = { title: "Brunch at Tanmoy's" };

export default async function BrunchPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; pin?: string; code?: string }>;
}) {
  const { error, pin, code } = await searchParams;
  const accessCode = pin ?? code;

  if (accessCode) {
    redirect(`/brunch/unlock?pin=${encodeURIComponent(accessCode)}`);
  }

  const invitee = await getAuthenticatedInvitee();
  if (!invitee) {
    return (
      <main className={styles.page}>
        <section className={styles.card}>
          <p className={styles.label}>private invitation</p>
          <h1>brunch <span>at</span><br />tanmoy&apos;s</h1>
          <p className={styles.copy}>Enter the four digit code to continue.</p>
          <form className={styles.unlockForm} action="/brunch/unlock" method="post">
            <label htmlFor="brunch-pin">access code</label>
            <input
              id="brunch-pin"
              name="pin"
              type="password"
              inputMode="numeric"
              pattern="[0-9]{4}"
              minLength={4}
              maxLength={4}
              autoComplete="one-time-code"
              required
              aria-describedby={error === "invalid-pin" ? "invalid-pin" : undefined}
            />
            {error === "invalid-pin" && (
              <p id="invalid-pin" className={styles.unlockError}>That code is not valid.</p>
            )}
            <button className={styles.submitButton} type="submit">open invitation <span aria-hidden="true">↗</span></button>
          </form>
        </section>
      </main>
    );
  }

  const content = await getBrunchContent();

  return (
    <main className={`${styles.page} ${styles.invitationPage}`}>
      <section className={styles.card}>
        <p className={styles.label}>
          {content.invitation.label} · <span className={styles.inviteeName}>{invitee.name}</span>
        </p>
        <h1>
          {content.invitation.title.before}{" "}
          <span>{content.invitation.title.connector}</span>
          <br />
          {content.invitation.title.after}
        </h1>
        <p className={styles.copy}>{content.invitation.description}</p>
        <div className={styles.line} />
        <div className={styles.details}>
          <div><span>{content.event.when.label}</span><p>{content.event.when.value}</p></div>
          <div><span>{content.event.where.label}</span><p>{content.event.where.value}</p></div>
        </div>
        <div className={styles.menu}>
          <span>{content.menu.label}</span>
          <p>{content.menu.description}</p>
        </div>
        <BrunchPreferences
          content={content.preferences}
          response={content.response}
          className={styles.preferences}
        />
      </section>
      <footer>{content.footer}</footer>
    </main>
  );
}
