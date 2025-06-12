import { fonts } from "@/utils/fonts";
import { Dot, Slash } from "@/utils/shared";

type EducationData = {
    degree: string;
    specialization?: string;
    institution: string;
    duration: string;
};

export default function Education() {
    const educationData: EducationData[] = [
        {
            degree: "Bachelor of Technology",
            specialization: "Computer Science and Engineering",
            institution: "SRM Institute of Science and Technology",
            duration: "2017 - 2021"
        },
        {
            degree: "AISSCE (CBSE/Class 12)",
            specialization: "Science",
            institution: "South Point School, Guwahati",
            duration: "2017"
        },
        {
            degree: "AISSE (CBSE/Class 10)",
            institution: "South Point School, Guwahati",
            duration: "2015"
        }
    ];

    return (
        <div>
            <h3 style={{ fontSize: "2rem", marginBottom: "20px" }}>Education</h3>

            <div className={fonts.taviraj.className} style={{ textAlign: "center", fontSize: "1rem", marginTop: "10px", marginBottom: "20px" }}>
                <ul style={{ listStyleType: "none" }}>
                    {
                        educationData.map((edu, index) => (
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
