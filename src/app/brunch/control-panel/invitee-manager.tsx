"use client";

import { FormEvent, useEffect, useState } from "react";
import styles from "./page.module.css";

type Invitee = { name: string; accessCode: string };

export default function InviteeManager({
  initialInvitees,
  inviteTemplate,
}: {
  initialInvitees: Invitee[];
  inviteTemplate: string;
}) {
  const [invitees, setInvitees] = useState(initialInvitees);
  const [name, setName] = useState("");
  const [accessCode, setAccessCode] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [copiedCode, setCopiedCode] = useState("");
  const [inviteMessage, setInviteMessage] = useState<{ name: string; link: string; message: string } | null>(null);
  const [copiedMessage, setCopiedMessage] = useState(false);

  const accessPath = (code: string) => `/brunch?pin=${encodeURIComponent(code)}`;

  useEffect(() => {
    if (!inviteMessage) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setInviteMessage(null);
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [inviteMessage]);

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

  const openInviteMessage = (invitee: Invitee) => {
    const link = new URL(accessPath(invitee.accessCode), window.location.origin).toString();
    const message = inviteTemplate
      .replace(/\{\{\s*url\s*\}\}|\{\s*url\s*\}|\[\s*url\s*\]/gi, link)
      .replace(/\{\{\s*name\s*\}\}|\{\s*name\s*\}|\[\s*name\s*\]/gi, invitee.name);
    setCopiedMessage(false);
    setInviteMessage({ name: invitee.name, link, message });
  };

  const copyInviteMessage = async () => {
    if (!inviteMessage) return;
    try {
      await copyText(inviteMessage.message);
      setCopiedMessage(true);
      window.setTimeout(() => setCopiedMessage(false), 1800);
    } catch {
      setError("Could not copy invite message");
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
              <button className={styles.copyButton} type="button" disabled={saving} onClick={() => openInviteMessage(invitee)}>
                invite message
              </button>
              <button className={styles.removeButton} type="button" disabled={saving} onClick={() => void remove(invitee.accessCode)}>remove</button>
            </td>
          </tr>
        ))}
          </tbody>
        </table>
      </div>
      {inviteMessage && (
        <div className={styles.modalBackdrop} role="presentation" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setInviteMessage(null);
        }}>
          <section className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="invite-message-title">
            <div className={styles.modalHeader}>
              <div>
                <p className={styles.label}>invite message</p>
                <h2 id="invite-message-title">for <span>{inviteMessage.name}</span></h2>
              </div>
              <button className={styles.modalClose} type="button" onClick={() => setInviteMessage(null)} aria-label="Close invite message">×</button>
            </div>
            <label className={styles.modalLabel} htmlFor="invite-message">message</label>
            <textarea id="invite-message" className={styles.messageText} value={inviteMessage.message} readOnly />
            <p className={styles.modalLink}><strong>link</strong> {inviteMessage.link}</p>
            <div className={styles.modalActions}>
              <button className={styles.button} type="button" onClick={() => void copyInviteMessage()}>
                {copiedMessage ? "copied" : "copy message"}
              </button>
              <button className={styles.copyButton} type="button" onClick={() => setInviteMessage(null)}>close</button>
            </div>
          </section>
        </div>
      )}
    </section>
  );
}
