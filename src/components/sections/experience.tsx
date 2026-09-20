import { fonts } from "@/utils/fonts";
import styles from "./sections.module.css";
import { Slash } from "@/utils/shared";
import type { ExperienceItem } from "./types";

export default function Experience({ data }: { data: ExperienceItem[] }) {
    return (
        <div className={styles.aboutSection}>
            <h3 className={styles.aboutTitle}>Experience</h3>

            <div className={`${fonts.taviraj.className} ${styles.aboutContent}`} style={{ fontSize: "1rem" }}>
                <ul className={styles.aboutList}>
                    {data.map((exp, index) => (
                        <li key={index} style={{ marginBottom: "20px", alignItems: "center", textAlign: "center" }}>
                            <span style={{ fontSize: "1.3rem", fontWeight: "bold" }}>
                                {exp.title}
                            </span>
                            <br />
                            <span style={{ fontSize: "1.1rem", fontStyle: "italic" }}>
                               <span style={{ fontWeight: "600" }}>{exp.company}</span><Slash /> <span style={{ color: "gray" }}>{exp.duration}</span>
                            </span>
                            <br />
                            <p style={{ marginTop: "10px" }} className={styles.para}>
                                {exp.description}
                            </p>

                            {/* 
                                <p style={{ marginTop: "10px" }}>
                                    Know More
                                </p>
                            */}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
