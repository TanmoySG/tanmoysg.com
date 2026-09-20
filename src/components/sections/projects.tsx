import styles from "./projects.module.css";
import sectionStyles from "./sections.module.css";
import type { Project } from "./types";

export default function ProjectsCarousel({ data }: { data: Project[] }) {
    return (
        <div className={sectionStyles.aboutSection}>
            <h3 className={sectionStyles.aboutTitle}>Projects</h3>

            <div className={styles.projectsGrid}>
                {data.map((project) => (
                    <article className={styles.projectCard} key={project.title}>
                        <h4 className={styles.projectTitle}>{project.title}</h4>
                        <p className={styles.projectText}>{project.text}</p>
                        <p className={styles.projectStack}>Built with {project.stack}</p>
                        <div className={styles.projectLinks}>
                            {project.links.map((link) => (
                                <a
                                    key={link.label}
                                    href={link.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={styles.projectLink}
                                >
                                    {link.label}
                                </a>
                            ))}
                        </div>
                    </article>
                ))}
            </div>
        </div>
    );
}
