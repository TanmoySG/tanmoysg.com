import { fonts } from "@/utils/fonts";
import { Dot, Slash } from "@/utils/shared";
import shared from "../../utils/shared.module.css"
import styles from "./sections.module.css";

export default function Socials() {
    return (
        <div style={{ textAlign: "center", marginTop: "30px" }}>
            <div style={{ fontSize: "1.2rem", marginTop: "10px", marginBottom: "20px" }} className={fonts.taviraj.className}>
                <a href="https://www.linkedin.com/in/tanmoysg/" target="_blank" rel="noopener noreferrer" className={`${styles.socialLinks} ${shared.magnify}`}>
                    LinkedIn
                </a>
                <Dot />
                <a href="https://github.com/TanmoySG" target="_blank" rel="noopener noreferrer" className={`${styles.socialLinks} ${shared.magnify}`}>
                    GitHub
                </a>
                <Dot />
                <a href="mailto:tanmoysg@gmail.com" target="_blank" rel="noopener noreferrer" className={`${styles.socialLinks} ${shared.magnify}`}>
                    Mail
                </a>
            </div>
        </div>
    );
}
