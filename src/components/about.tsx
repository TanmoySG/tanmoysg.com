import Education from "./sections/education";
import Experience from "./sections/experience";
import ProjectsCarousel from "./sections/projects";
import Skills from "./sections/skills";

export default function About({ className }: { className?: string }) {
    return (
        <div className={className} style={{ alignItems: "center" }}>
            <Experience />
            <br />
            <Education />
            <br />
            <Skills />
            <br />
            <ProjectsCarousel />
            <br />
        </div>
    );
}
