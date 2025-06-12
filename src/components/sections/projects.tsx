import { useEffect, useState } from "react";
import styles from "./projects.module.css";
import { Dot } from "@/utils/shared";

const projectTexts = [
    {
        title: "E-commerce Platform",
        text: "Personal Portfolio Website - Built with Next.js, React, and Tailwind CSS.",
        stack: "Next.js, React, Tailwind CSS",
        links: [
            { label: "GitHub", url: "https://github.com/yourusername/ecommerce-platform" }
        ]
    },
    {
        title: "Social Media App",
        text: "Real-time Chat App - Node.js, Socket.io, and MongoDB.",
        stack: "Node.js, Socket.io, MongoDB",
        links: [
            { label: "GitHub", url: "https://github.com/yourusername/social-media-app" },
            { label: "Demo", url: "https://yourusername.github.io/social-media-app" }
        ]
    },
    {
        title: "Data Engineering Pipeline",
        text: "Data Engineering Pipeline - Kafka, Python, and Google Cloud Platform.",
        stack: "Kafka, Python, Google Cloud Platform",
        links: [
            { label: "GitHub", url: "https://github.com/yourusername/data-engineering-pipeline" }
        ]
    },
    {
        title: "Kubernetes Deployment Automation",
        text: "Kubernetes Deployment Automation - Docker, K8s, and GitHub Actions.",
        stack: "Docker, K8s, GitHub Actions",
        links: [
            { label: "GitHub", url: "https://github.com/yourusername/kubernetes-deployment-automation" }
        ]
    },
    {
        title: "Cryptography Playground",
        text: "Cryptography Playground - Interactive web app for learning cryptography.",
        stack: "JavaScript, HTML, CSS",
        links: [
            { label: "GitHub", url: "https://github.com/yourusername/cryptography-playground" }
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
                                <>
                                    <a key={i} href={link.url} target="_blank" rel="noopener noreferrer" className={styles["carousel-link"]}>
                                        {link.label}
                                    </a>
                                    {i !== projectTexts[index].links.length - 1 && (
                                        <Dot />
                                    )}
                                </>
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
