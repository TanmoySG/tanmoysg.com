"use client";

import { FormEvent, useState } from "react";
import styles from "./brunch-preferences.module.css";
import type { BrunchContent } from "@/lib/brunch-schema";

type Preferences = BrunchContent["preferences"];
type ResponseContent = BrunchContent["response"];

export default function BrunchPreferences({
  content,
  response,
  className = "",
}: {
  content: Preferences;
  response: ResponseContent;
  className?: string;
}) {
  const [coffee, setCoffee] = useState(content.coffee.default);
  const [food, setFood] = useState(content.food.default);
  const [notes, setNotes] = useState("");
  const [popup, setPopup] = useState<"thank-you" | "declined" | "reconsider" | "final-decline" | null>(null);
  const [declineDisabled, setDeclineDisabled] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const submit = async (attending: boolean) => {
    setSaving(true);
    setError("");

    try {
      const result = await fetch("/api/brunch/responses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ coffee, food, notes, attending }),
      });

      if (!result.ok) {
        throw new Error("Could not save your response");
      }

      setPopup(attending ? "thank-you" : null);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Could not save your response");
    } finally {
      setSaving(false);
    }
  };

  const submitForm = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void submit(true);
  };

  const chooseToAttend = () => {
    setDeclineDisabled(true);
    setPopup(null);
  };

  return (
    <form className={`${styles.form} ${styles.card} ${className}`} onSubmit={submitForm}>
      <fieldset>
        <legend>{content.coffee.label}</legend>
        {content.coffee.options.map((option) => (
          <label key={option.value}>
            <input type="radio" name="coffee" value={option.value} checked={coffee === option.value} onChange={() => setCoffee(option.value)} /> {option.label}
          </label>
        ))}
      </fieldset>
      <fieldset>
        <legend>{content.food.label}</legend>
        {content.food.options.map((option) => (
          <label key={option.value}>
            <input type="radio" name="food" value={option.value} checked={food === option.value} onChange={() => setFood(option.value)} /> {option.label}
          </label>
        ))}
      </fieldset>
      <label className={styles.notes}>
        {content.notes.label}
        <input type="text" value={notes} onChange={(event) => setNotes(event.target.value)} placeholder={content.notes.placeholder} />
      </label>
      <div className={styles.responseActions}>
        <button className={styles.submitButton} type="submit" disabled={saving}>
          {content.submitLabel} <span aria-hidden="true">{content.submitIcon}</span>
        </button>
        <button
          className={styles.declineButton}
          type="button"
          disabled={saving || declineDisabled}
          onClick={() => setPopup("declined")}
        >
          I won&apos;t make it
        </button>
      </div>
      {error && <p className={styles.error} role="alert">{error}</p>}
      {popup && (
        <>
          <div className={styles.popupBackdrop} aria-hidden="true" />
          <div className={styles.successPopup} role="dialog" aria-modal="true" aria-labelledby="thank-you-title">
            {popup === "thank-you" && (
              <>
                <p className={styles.popupLabel} id="thank-you-title">thank you</p>
                <p className={styles.popupMessage}>{response.thankYou}</p>
                <p className={styles.popupFrom}>— {response.inviter}</p>
                <button type="button" onClick={() => setPopup(null)}>close</button>
              </>
            )}
            {popup === "declined" && (
              <>
                <p className={styles.popupEmoji} aria-hidden="true">😔</p>
                <p className={styles.popupLabel} id="thank-you-title">are you sure?</p>
                <p className={styles.popupMessage}>I&apos;ll miss having you there.</p>
                <div className={styles.popupActions}>
                  <button type="button" onClick={() => setPopup("reconsider")}>Sorry, can&apos;t make it</button>
                  <button type="button" onClick={chooseToAttend}>I will come</button>
                </div>
              </>
            )}
            {popup === "reconsider" && (
              <>
                <p className={styles.popupEmoji} aria-hidden="true">😔</p>
                <p className={styles.popupMessage}>I will give you one more chance to think.</p>
                <div className={styles.popupActions}>
                  <button type="button" onClick={chooseToAttend}>I will come</button>
                  <button type="button" onClick={() => setPopup("final-decline")}>sorry to break your heart</button>
                </div>
              </>
            )}
            {popup === "final-decline" && (
              <>
                <p className={styles.popupEmoji} aria-hidden="true">😭</p>
                <p className={styles.popupMessage}>I am sad</p>
                <button type="button" onClick={() => void submit(false)}>next time</button>
              </>
            )}
          </div>
        </>
      )}
    </form>
  );
}
