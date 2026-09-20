"use client";

import { useEffect, useState } from "react";
import Education from "./sections/education";
import Experience from "./sections/experience";
import ProjectsCarousel from "./sections/projects";
import Skills from "./sections/skills";
import styles from "./sections/sections.module.css";
import type { AboutData } from "./sections/types";

const sourceUrl = "https://raw.githubusercontent.com/TanmoySG/TanmoySG/master/source/source.json";
const sourceCacheKey = "tanmoysg-about-source";
const ABOUT_CACHE_SECONDS = 600; // in sec
const MINIMUM_LOADER_MS = 1000;
const sourceCacheTtl = ABOUT_CACHE_SECONDS * 1000;

export default function About({ className }: { className?: string }) {
    const [data, setData] = useState<AboutData>({});
    const [isLoading, setIsLoading] = useState(true);
    const [isTransitioning, setIsTransitioning] = useState(false);

    useEffect(() => {
        let isCurrent = true;
        let loadingTimer: ReturnType<typeof setTimeout> | undefined;
        let transitionTimer: ReturnType<typeof setTimeout> | undefined;
        const loadingStartedAt = Date.now();

        const finishLoading = (callback: () => void) => {
            const remainingTime = Math.max(
                0,
                MINIMUM_LOADER_MS - (Date.now() - loadingStartedAt),
            );
            loadingTimer = setTimeout(callback, remainingTime);
        };

        try {
            const cached = localStorage.getItem(sourceCacheKey);
            if (cached) {
                const { data: cachedData, timestamp } = JSON.parse(cached) as {
                    data: AboutData;
                    timestamp: number;
                };

                if (Date.now() - timestamp < sourceCacheTtl) {
                    setData(cachedData);
                    setIsLoading(false);
                    return () => {
                        isCurrent = false;
                    };
                }
            }
        } catch {
            localStorage.removeItem(sourceCacheKey);
        }

        fetch(`${sourceUrl}?t=${Date.now()}`, { cache: "no-store" })
            .then((response) => {
                if (!response.ok) throw new Error("Unable to fetch About data");
                return response.json() as Promise<AboutData>;
            })
            .then((nextData) => {
                localStorage.setItem(
                    sourceCacheKey,
                    JSON.stringify({ data: nextData, timestamp: Date.now() }),
                );
                if (isCurrent) {
                    finishLoading(() => {
                        if (isCurrent) {
                            setData(nextData);
                            setIsLoading(false);
                            setIsTransitioning(true);
                            transitionTimer = setTimeout(() => {
                                if (isCurrent) setIsTransitioning(false);
                            }, 420);
                        }
                    });
                }
            })
            .catch(() => {
                // Missing or unavailable remote data leaves all sections hidden.
                if (isCurrent) finishLoading(() => setIsLoading(false));
            });

        return () => {
            isCurrent = false;
            if (loadingTimer) clearTimeout(loadingTimer);
            if (transitionTimer) clearTimeout(transitionTimer);
        };
    }, []);

    return (
        <div className={`${className ?? ""} ${styles.about}`}>
            {isLoading || isTransitioning ? (
                <div className={`${styles.aboutLoader} ${isTransitioning ? styles.aboutLoaderExiting : ""}`} role="status" aria-label="Loading About data">
                    <span className={styles.coffeeLoader} aria-hidden="true">
                        <span className={styles.coffeeSteam} />
                        <span className={styles.coffeeCup}>
                            <span className={styles.coffeeSurface} />
                            <span className={styles.coffeeHandle} />
                        </span>
                        <span className={styles.coffeeSaucer} />
                    </span>
                </div>
            ) : (
                <div className={styles.aboutContentLoaded}>
                    {data.experience && <Experience data={data.experience} />}
                    {data.projects && <ProjectsCarousel data={data.projects} />}
                    {data.skills && <Skills data={data.skills} />}
                    {data.education && <Education data={data.education} />}
                </div>
            )}
        </div>
    );
}
