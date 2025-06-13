import { useEffect, useState } from "react";
import styles from "./projects.module.css";
import { Dot } from "@/utils/shared";

const projectTexts = [
    {
        title: "wunderDB",
        text: "wunderDb is a JSON-based in-memory Data Store.",
        stack: "GoLang, Docker, Shell Scripting, Python",
        links: [
            { label: "GitHub", url: "https://github.com/TanmoySG/wunderDB" },
            { label: "Demo", url: "https://wdb.tanmoysg.com/" }
        ]
    },
    {
        title: "GoSteps - a Go library",
        text: "GoSteps is a go library that helps in running functions as steps. The idea behind gosteps is to define set of functions as chain-of-steps and execute them in a sequential fashion.",
        stack: "GoLang, Shell Scripting",
        links: [
            { label: "GitHub", url: "https://github.com/TanmoySG/go-steps" },
        ]
    },
    {
        title: "hyENC3 - Advanced Data Security",
        text: "Advanced-Data Security using multiple cryptographic algorithms over multiple layers and secured key sharing.",
        stack: "Python, Flask, JavaScript, HTML, CSS",
        links: [
            { label: "Research Paper", url: "https://www.irjet.net/archives/V8/i8/IRJET-V8I8428.pdf" },
            { label: "GitHub", url: "https://github.com/TanmoySG/hyENC3" }
        ]
    },
    {
        title: "Bhavcopy Scrapper",
        text: "A simple web scrapper to fetch the daily bhavcopy from NSE and store it in a local file.",
        stack: "Python, HTML",
        links: [
            { label: "GitHub", url: "https://github.com/TanmoySG/bhavcopy-scraper" },
            { label: "Demo", url: "https://utils.tanmoysg.com/bhavcopy/" }
        ]
    }
];

export default function ProjectsCarousel() {
    const [index, setIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);

    useEffect(() => {
        if (isPaused) return;
        const interval = setInterval(() => {
            setIndex((prev) => (prev + 1) % projectTexts.length);
        }, 3000);
        return () => clearInterval(interval);
    }, [isPaused]);

    const goPrev = () => setIndex((prev) => (prev - 1 + projectTexts.length) % projectTexts.length);
    const goNext = () => setIndex((prev) => (prev + 1) % projectTexts.length);

    return (
        <div>
            <h3 style={{ fontSize: "2rem", marginBottom: "50px" }}>Projects</h3>

            <div
                className={styles.projectsCarousel}
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
                tabIndex={0}
                onFocus={() => setIsPaused(true)}
                onBlur={() => setIsPaused(false)}
            >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
                    <button
                        aria-label="Previous project"
                        onClick={goPrev}
                        className={styles.carouselNavBtn}
                        type="button"
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    </button>
                    <div className={styles["carousel-content"]}>
                        <div className={styles["carousel-title"]}>
                            {projectTexts[index].title}
                        </div>
                        <div className={styles["carousel-text"]}>
                            {projectTexts[index].text}
                        </div>
                        <div className={styles["carousel-stack"]} style={{ marginTop: '10px', fontStyle: 'italic', fontSize: '1rem' }}>
                            built with <br /> <b style={{ fontSize: '1.15rem' }}>{projectTexts[index].stack}</b>
                        </div>
                        <div className={styles["carousel-links"]} style={{ marginTop: '10px', fontSize: '1.15rem' }}>
                            {projectTexts[index].links.map((link, i) => (
                                <span key={i}>
                                    <a key={i} href={link.url} target="_blank" rel="noopener noreferrer" className={`${styles["carousel-link"]} ${styles["carouselLinks"]}`}>
                                        {link.label}
                                    </a>
                                    {i !== projectTexts[index].links.length - 1 && (
                                        <Dot />
                                    )}
                                </span>
                            ))}
                        </div>
                    </div>
                    <button
                        aria-label="Next project"
                        onClick={goNext}
                        className={styles.carouselNavBtn}
                        type="button"
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 6L15 12L9 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    </button>
                </div>
                <div className={styles["carousel-dots"]}>
                    {projectTexts.map((_, i) => (
                        <span
                            key={i}
                            className={i === index ? styles["dot-active"] : styles["dot"]}
                            onClick={() => setIndex(i)}
                        >
                            •
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
}
