import { fonts } from "@/utils/fonts";
import styles from "./sections.module.css";
import { Dot, Slash } from "@/utils/shared";

type ExperienceData = {
    title: string;
    company: string;
    duration: string;
    description: string;
};

export default function Experience() {
    const experienceData: ExperienceData[] = [
        {
            title: "Senior Software Engineer",
            company: "Optum",
            duration: "June 2022 - Present",
            description: "Developed and maintained a data platform for healthcare analytics. Implemented access provisioning systems to ensure secure data access. Collaborated with cross-functional teams to deliver high-quality software solutions."
        },
    ];

    return (
        <div>
            <h3 style={{ fontSize: "2rem", marginBottom: "20px" }}>Experience</h3>

            <div className={fonts.taviraj.className} style={{ textAlign: "left", fontSize: "1rem", marginTop: "10px", marginBottom: "20px" }}>
                <ul style={{ listStyleType: "none" }}>
                    {experienceData.map((exp, index) => (
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
