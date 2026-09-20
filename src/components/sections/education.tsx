import { fonts } from "@/utils/fonts";
import { Slash } from "@/utils/shared";
import styles from "./sections.module.css";
import type { EducationItem } from "./types";

export default function Education({ data }: { data: EducationItem[] }) {
    return (
        <div className={styles.aboutSection}>
            <h3 className={styles.aboutTitle}>Education</h3>

            <div className={`${fonts.taviraj.className} ${styles.aboutContent}`} style={{ fontSize: "1rem" }}>
                <ul className={styles.aboutList}>
                    {
                        data.map((edu, index) => (
                            <li key={index} style={{ marginBottom: "20px" }}>
                                <span style={{ fontSize: "1.2rem" }}>
                                    <b>{edu.degree}</b> {edu.specialization && <span style={{ /*fontStyle: "italic" */ }}>in {edu.specialization}</span>}
                                </span>
                                <br />
                                <span style={{ fontSize: "1rem", fontStyle: "italic" }}>
                                    {edu.institution}
                                    {/* <br /> */}
                                    {/* <Dot /> */}
                                    <Slash />
                                    <span style={{ color: "gray" }}>
                                        {edu.duration}
                                    </span>
                                </span>
                            </li>
                        ))
                    }
                </ul>
            </div>
        </div>
    );
}
