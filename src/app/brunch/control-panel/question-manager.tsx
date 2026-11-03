"use client";

import { FormEvent, useState } from "react";
import type { PreferenceQuestion } from "@/lib/brunch-schema";
import styles from "./page.module.css";

export default function QuestionManager({ initialQuestions }: { initialQuestions: PreferenceQuestion[] }) {
  const [questions, setQuestions] = useState(initialQuestions);
  const [id, setId] = useState("");
  const [label, setLabel] = useState("");
  const [type, setType] = useState<"input" | "single-select" | "multi-select">("input");
  const [placeholder, setPlaceholder] = useState("");
  const [options, setOptions] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const resetForm = () => {
    setId("");
    setLabel("");
    setType("input");
    setPlaceholder("");
    setOptions("");
    setEditingId(null);
  };

  const buildQuestion = (): PreferenceQuestion => {
    const optionValues = options.split(",").map((value) => value.trim()).filter(Boolean);
    return type === "input"
      ? { id, label, type, ...(placeholder ? { placeholder } : {}) }
      : {
          id,
          label,
          type,
          options: optionValues.map((value) => ({
            value: value.toLowerCase().replace(/\s+/g, "-"),
            label: value,
          })),
        };
  };

  const save = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    const question = buildQuestion();
    try {
      const response = await fetch("/api/brunch/control-panel/questions", {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingId ? { originalId: editingId, question } : question),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || `Could not ${editingId ? "update" : "add"} question`);
      setQuestions(result.questions);
      resetForm();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Could not save question");
    } finally {
      setSaving(false);
    }
  };

  const edit = (question: PreferenceQuestion) => {
    setEditingId(question.id);
    setId(question.id);
    setLabel(question.label);
    setType(question.type);
    setPlaceholder(question.type === "input" ? question.placeholder ?? "" : "");
    setOptions(question.type === "input" ? "" : question.options.map((option) => option.label).join(", "));
    setError("");
  };

  const remove = async (questionId: string) => {
    if (!window.confirm("Remove this question?")) return;
    setSaving(true);
    setError("");
    try {
      const response = await fetch("/api/brunch/control-panel/questions", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: questionId }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not remove question");
      setQuestions(result.questions);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Could not remove question");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className={styles.questionPanel}>
      <p className={styles.label}>preference questions</p>
      <form className={styles.questionForm} onSubmit={save}>
        <input value={id} onChange={(event) => setId(event.target.value)} placeholder="id (e.g. coffee)" required />
        <input value={label} onChange={(event) => setLabel(event.target.value)} placeholder="question label" required />
        <select value={type} onChange={(event) => setType(event.target.value as typeof type)}>
          <option value="input">input</option>
          <option value="single-select">single select</option>
          <option value="multi-select">multi select</option>
        </select>
        {type === "input" ? (
          <input value={placeholder} onChange={(event) => setPlaceholder(event.target.value)} placeholder="placeholder (optional)" />
        ) : (
          <input value={options} onChange={(event) => setOptions(event.target.value)} placeholder="options, separated by commas" required />
        )}
        <div className={styles.questionFormActions}>
          <button className={styles.button} type="submit" disabled={saving}>{editingId ? "save question" : "add question"}</button>
          {editingId && <button className={styles.closeButton} type="button" onClick={resetForm}>cancel</button>}
        </div>
      </form>
      {error && <p className={styles.error} role="alert">{error}</p>}
      <div className={styles.questions}>
        {questions.map((question) => (
          <div className={styles.question} key={question.id}>
            <span>{question.label} <small>({question.type})</small></span>
            <div className={styles.questionActions}>
              <button className={styles.closeButton} type="button" disabled={saving} onClick={() => edit(question)}>edit</button>
              <button className={styles.removeButton} type="button" disabled={saving} onClick={() => void remove(question.id)}>remove</button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
