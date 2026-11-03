"use client";

import { FormEvent, useState } from "react";
import styles from "./brunch-preferences.module.css";
import type { BrunchContent } from "@/lib/brunch-schema";

type Preferences = BrunchContent["preferences"];
type ResponseContent = BrunchContent["response"];
type Answers = Record<string, string | string[]>;

export default function BrunchPreferences({
  content,
  response,
  initialPopup = null,
  initialError = "",
  className = "",
}: {
  content: Preferences;
  response: ResponseContent;
  initialPopup?: "thank-you" | null;
  initialError?: string;
  className?: string;
}) {
  const [answers, setAnswers] = useState<Answers>(() =>
    Object.fromEntries(content.questions.map((question) => [
      question.id,
      question.type === "multi-select" ? [] : "",
    ])),
  );
  const [popup, setPopup] = useState<"thank-you" | "declined" | "reconsider" | "final-decline" | null>(initialPopup);
  const [declineDisabled, setDeclineDisabled] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(initialError);

  const updateAnswer = (id: string, value: string | string[]) => {
    setAnswers((current) => ({ ...current, [id]: value }));
  };

  const toggleOption = (id: string, value: string) => {
    const current = answers[id];
    const selected = Array.isArray(current) ? current : [];
    updateAnswer(id, selected.includes(value)
      ? selected.filter((item) => item !== value)
      : [...selected, value]);
  };

  const submit = async (attending: boolean) => {
    setSaving(true);
    setError("");

    try {
      const result = await fetch("/api/brunch/responses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers, attending }),
      });

      if (!result.ok) {
        const failure = await result.json().catch(() => null);
        throw new Error(
          failure && typeof failure.error === "string"
            ? failure.error
            : "Could not save your response",
        );
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
    <form className={`${styles.form} ${styles.card} ${className}`} action="/api/brunch/responses" method="post" onSubmit={submitForm}>
      {content.questions.map((question) => {
        if (question.type === "input") {
          return (
            <label className={styles.notes} key={question.id}>
              {question.label}
              <input
                type="text"
                name={question.id}
                value={typeof answers[question.id] === "string" ? answers[question.id] : ""}
                onChange={(event) => updateAnswer(question.id, event.target.value)}
                placeholder={question.placeholder}
              />
            </label>
          );
        }

        const selected = Array.isArray(answers[question.id]) ? answers[question.id] : [];
        const singleSelected = typeof answers[question.id] === "string" ? answers[question.id] : "";
        return (
          <fieldset key={question.id}>
            <legend>{question.label}</legend>
            {question.options.map((option) => (
              <label key={option.value}>
                {question.type === "multi-select" ? (
                  <input
                    type="checkbox"
                    name={question.id}
                    value={option.value}
                    checked={selected.includes(option.value)}
                    onChange={() => toggleOption(question.id, option.value)}
                  />
                ) : (
                  <input
                    type="radio"
                    name={question.id}
                    value={option.value}
                    required={question.type === "single-select"}
                    checked={singleSelected === option.value}
                    onChange={() => updateAnswer(question.id, option.value)}
                  />
                )}{" "}
                {option.label}
              </label>
            ))}
          </fieldset>
        );
      })}
      <div className={styles.responseActions}>
        <button className={styles.submitButton} type="submit" name="attending" value="true" disabled={saving}>
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
