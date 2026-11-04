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
  const [copiedCode, setCopiedCode] = useState("");

  const accessPath = (code: string) => `/brunch?pin=${encodeURIComponent(code)}`;

  const copyText = async (value: string) => {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(value);
      return;
    }

    const textArea = document.createElement("textarea");
    textArea.value = value;
    textArea.setAttribute("readonly", "");
    textArea.style.position = "fixed";
    textArea.style.opacity = "0";
    document.body.appendChild(textArea);
    textArea.select();
    const copied = document.execCommand("copy");
    textArea.remove();
    if (!copied) throw new Error("Copy command was rejected");
  };

  const copyAccessLink = async (code: string) => {
    try {
      const inviteeLink = new URL(accessPath(code), window.location.origin).toString();
      await copyText(inviteeLink);
      setCopiedCode(code);
      window.setTimeout(() => setCopiedCode((current) => current === code ? "" : current), 1800);
    } catch {
      setError("Could not copy access link");
    }
  };

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
      <div className={styles.inviteeTableWrap}>
        <table className={styles.inviteeTable}>
          <thead>
            <tr><th>Name</th><th>Access code</th><th>Actions</th></tr>
          </thead>
          <tbody>
        {invitees.map((invitee) => (
          <tr key={invitee.accessCode}>
            <td>{invitee.name}</td>
            <td><small>{invitee.accessCode}</small></td>
            <td className={styles.inviteeActions}>
              <button className={styles.copyButton} type="button" disabled={saving} onClick={() => void copyAccessLink(invitee.accessCode)}>
                {copiedCode === invitee.accessCode ? "copied" : "copy link"}
              </button>
              <button className={styles.removeButton} type="button" disabled={saving} onClick={() => void remove(invitee.accessCode)}>remove</button>
            </td>
          </tr>
        ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
