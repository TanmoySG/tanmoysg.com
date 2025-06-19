import { faComments } from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState, useRef } from "react";
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);


export const FeedbackPopover = ({ minimize }: { minimize: boolean }) => {
    const [open, setOpen] = useState(false);
    const [feedback, setFeedback] = useState("");
    const [preference, setPreference] = useState("");
    const [rating, setRating] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const buttonRef = useRef<HTMLButtonElement>(null);

    // Capture user agent string
    const userAgent = typeof window !== "undefined" ? window.navigator.userAgent : "";

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const feedbackData = {
            feedback,
            rating,
            userAgent,
            timestamp: new Date().toISOString(),
            preference,
        };

        const { data, error } = await supabase
            .from('feedback')
            .insert([
                {  "feedback": feedbackData },
            ])
            .select()

        if (error) {
            window.alert("Error submitting feedback: " + error.message);
            return;
        }

        setSubmitted(true);

        setTimeout(() => {
            setOpen(false);
            setSubmitted(false);
            setFeedback("");
            setPreference("");
        }, 1500);
    };

    return (
        <div style={{ position: "fixed", bottom: 32, right: 32, zIndex: 2000 }} >
            <button
                ref={buttonRef}
                onClick={() => setOpen((v) => !v)}
                style={{
                    fontSize: 16,
                    fontWeight: 700,
                    background: "#222",
                    color: "#fff",
                    border: "none",
                    borderRadius: 24,
                    padding: "12px 20px",
                    cursor: "pointer",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
                }}
            >
                {!minimize ? "Feedback" : <FontAwesomeIcon icon={faComments} />}
            </button>
            {open && (
                <div
                    style={{
                        position: "absolute",
                        right: 0,
                        bottom: 48,
                        background: "#222",
                        borderRadius: 12,
                        // boxShadow: "0 4px 24px rgba(255, 99, 99, 0.20)",
                        padding: 24,
                        minWidth: 260,
                        maxWidth: 320,
                        zIndex: 2100,
                        animation: "fadeInPop 0.25s cubic-bezier(0.4,0,0.2,1)",
                    }}
                >
                    {submitted ? (
                        <div style={{ color: "#16a34a", fontWeight: 500, textAlign: "center" }}>Thank you for your feedback!</div>
                    ) : (
                        <form onSubmit={handleSubmit}>
                            <h3 style={{ fontSize: "1.5rem", marginBottom: 16, color: "white" }}>Feedback</h3>
                            <p style={{ color: "#ccc", fontSize: "1rem", marginBottom: 16 }}>
                                I am trying out a minimal design for my portfolio. Your feedback is valuable to me!
                            </p>
                            <p style={{ color: "#ccc", fontSize: "1rem", marginBottom: 20 }}>
                                For comparison, you can view the current version at <a href="https://tanmoysg.com/" target="_blank" rel="noopener noreferrer" style={{ textDecoration: "underline", fontWeight: 700 }}>tanmoysg.com</a>.
                            </p>
                            <hr style={{ border: "none", borderTop: "3px solid #444", margin: "22px 0" }} />
                            <label htmlFor="rating" style={{ fontWeight: 500, marginBottom: 8, display: "block" }}>
                                Rating
                            </label>
                            <select
                                id="rating"
                                value={rating}
                                onChange={e => setRating(e.target.value)}
                                style={{ width: "100%", borderRadius: 8, border: "1px solid #ccc", padding: 8, marginBottom: 12 }}
                                required
                            >
                                <option value="" disabled>Select your rating</option>
                                <option value="1">1</option>
                                <option value="2">2</option>
                                <option value="3">3</option>
                                <option value="4">4</option>
                                <option value="5">5</option>
                            </select>
                            <label htmlFor="preference" style={{ fontWeight: 500, marginBottom: 8, display: "block" }}>
                                Do you like the new design better than the current one? (if you visited <a href="https://tanmoysg.com/" target="_blank" rel="noopener noreferrer" style={{ textDecoration: "underline", fontWeight: 700 }}>tanmoysg.com</a>)
                            </label>
                            <option value="" disabled>Select your answer</option>
                            <select
                                id="likeDesign"
                                value={preference}
                                onChange={e => setPreference(e.target.value)}
                                style={{ width: "100%", borderRadius: 8, border: "1px solid #ccc", padding: 8, marginBottom: 12 }}
                                required
                            >
                                <option value="" disabled>Select your answer</option>
                                <option value="New">Yes, I like the New design more.</option>
                                <option value="Old">No, I prefer the Current design.</option>
                            </select>
                            <label htmlFor="feedback" style={{ fontWeight: 500, marginBottom: 8, display: "block" }}>
                                Your feedback
                            </label>
                            <textarea
                                id="feedback"
                                value={feedback}
                                onChange={e => setFeedback(e.target.value)}
                                rows={3}
                                style={{ width: "100%", borderRadius: 8, border: "1px solid #ccc", padding: 8, marginBottom: 12, resize: "vertical" }}
                                required
                            />
                            <button
                                type="submit"
                                style={{
                                    background: " rgb(255, 255, 255)",
                                    color: "#000",
                                    border: "none",
                                    borderRadius: 8,
                                    padding: "8px 16px",
                                    fontSize: 16,
                                    fontWeight: 700,
                                    cursor: "pointer",
                                    float: "right"
                                }}
                            >
                                Submit
                            </button>
                        </form>
                    )}
                </div>
            )}
            <style>{`
          @keyframes fadeInPop {
            0% { opacity: 0; transform: translateY(16px) scale(0.98); }
            100% { opacity: 1; transform: translateY(0) scale(1); }
          }
        `}</style>
        </div>
    );
}
