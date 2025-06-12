import { fonts } from "@/utils/fonts";

export default function Skills() {
    return (
        <div>
            <h3 style={{ fontSize: "2rem", marginBottom: "20px" }}>Skills</h3>
            <div className={fonts.taviraj.className} style={{ fontSize: "1.2rem", marginTop: "10px", marginBottom: "20px" }}>
                {[
                    "NodeJS",
                    "Javascript",
                    "Typescript",
                    "C/C++",
                    "Golang", "Python", "JavaScript", "Java",
                    "React.js", "GraphQL", "Kubernetes",
                    "Docker", "Azure", "Kafka", "Snowflake",
                    "GitHub Actions", "Shell Scripting",
                    "Google Cloud Platform", "SQL",
                    "Cryptography"
                ].join(" · ")}
            </div>
        </div>
    );
}


// // work to  be done
// // 1. Add a list of skills
// // 2. Segregate the skills into categories (e.g., Programming Languages, Frameworks, Tools, etc.)
// //    - Use a bullet point or dot to separate skills
// // 3. Add a link to the LinkedIn profile

{/* <div>
    <h3 style={{ fontSize: "2rem", marginBottom: "20px" }}>Skills</h3>
    <div className={fonts.taviraj.className} style={{ fontSize: "1rem", marginTop: "10px", marginBottom: "20px" }}>
        <div style={{ marginBottom: "10px" }}>
            <strong>Programming Languages:</strong><br /> C/C++, GoLang, Javascript, Python, Shell Programming, SQL
        </div>
        <div style={{ marginBottom: "10px" }}>
            <strong>Frameworks & Libraries:</strong><br /> React JS, Python-Flask, NodeJS
        </div>
        <div style={{ marginBottom: "10px" }}>
            <strong>Cloud & Platforms:</strong><br /> Google Cloud Platform, Azure, Kubernetes
        </div>
        <div style={{ marginBottom: "10px" }}>
            <strong>Tools & Technologies:</strong><br /> Kafka, Data Engineering, Docker, HTML-CSS, MySQL, Cryptography
        </div>
    </div>
</div> */}

// // looks better
{/* <div style={{ marginBottom: "10px" }}>
<strong>Programming Languages:</strong><br /> Golang, Python, JavaScript, Java, Shell Scripting, SQL
</div>
<div style={{ marginBottom: "10px" }}>
<strong>Frameworks & Libraries:</strong><br /> React.js, GraphQL
</div>
<div style={{ marginBottom: "10px" }}>
<strong>Cloud & Platforms:</strong><br /> Google Cloud Platform, Azure, Kubernetes, Snowflake
</div>
<div style={{ marginBottom: "10px" }}>
<strong>Tools & Technologies:</strong><br /> Docker, Kafka, GitHub Actions, Cryptography
</div> */}