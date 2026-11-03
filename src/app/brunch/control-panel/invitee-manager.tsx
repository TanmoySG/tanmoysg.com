"use client";

import { FormEvent, useState } from "react";
import styles from "./page.module.css";

type Invitee = { name: string; accessCode: string };

export default function InviteeManager({ initialInvitees }: { initialInvitees: Invitee[] }) {
  const [invitees, setInvitees] = useState(initialInvitees);
  const [name, setName] = useState("");
  const [accessCode, setAccessCode] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const add = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const response = await fetch("/api/brunch/control-panel/invitees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, accessCode }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not add invitee");
      setInvitees(result.invitees);
      setName("");
      setAccessCode("");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Could not add invitee");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (code: string) => {
    if (!window.confirm("Remove this invitee? Existing response issues will remain.")) return;
    setSaving(true);
    setError("");
    try {
      const response = await fetch("/api/brunch/control-panel/invitees", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessCode: code }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not remove invitee");
      setInvitees(result.invitees);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Could not remove invitee");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className={styles.inviteePanel}>
      <p className={styles.label}>invitees</p>
      <form className={styles.inviteeForm} onSubmit={add}>
        <input value={name} onChange={(event) => setName(event.target.value)} placeholder="name" required />
        <input value={accessCode} onChange={(event) => setAccessCode(event.target.value.replace(/\D/g, "").slice(0, 4))} placeholder="code" inputMode="numeric" required />
        <button className={styles.button} type="submit" disabled={saving}>add invitee</button>
      </form>
      {error && <p className={styles.error} role="alert">{error}</p>}
      <div className={styles.invitees}>
        {invitees.map((invitee) => (
          <div className={styles.invitee} key={invitee.accessCode}>
            <span>{invitee.name} <small>({invitee.accessCode})</small></span>
            <button className={styles.removeButton} type="button" disabled={saving} onClick={() => void remove(invitee.accessCode)}>remove</button>
          </div>
        ))}
      </div>
    </section>
  );
}
