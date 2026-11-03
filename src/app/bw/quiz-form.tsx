"use client";

import { FormEvent, useState } from "react";
import styles from "./page.module.css";

export default function QuizForm() {
  const [values, setValues] = useState({ question: "", resources: "", answer: "", clues: "" });
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  const update = (key: keyof typeof values, value: string) => {
    setValues((current) => ({ ...current, [key]: value }));
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      const response = await fetch("/api/quiz/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not save quiz question");
      setValues({ question: "", resources: "", answer: "", clues: "" });
      setMessage("Question saved.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not save quiz question");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className={styles.form} onSubmit={submit}>
      <label>Q. Question<textarea className={styles.textarea} value={values.question} onChange={(event) => update("question", event.target.value)} required /></label>
      <label>R. Resources and References<textarea className={styles.textarea} value={values.resources} onChange={(event) => update("resources", event.target.value)} /></label>
      <label>A. Answer<textarea className={styles.textarea} value={values.answer} onChange={(event) => update("answer", event.target.value)} required /></label>
      <label>C. Clues<textarea className={styles.textarea} value={values.clues} onChange={(event) => update("clues", event.target.value)} /></label>
      <button className={styles.button} type="submit" disabled={saving}>{saving ? "saving..." : "save question"}</button>
      {message && <p role="status">{message}</p>}
    </form>
  );
}
