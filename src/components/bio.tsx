import { fonts } from "@/utils/fonts";
import styles from "./bio.module.css";

export default function Bio({ showOverlay = false }: { showOverlay?: boolean }) {
    return (
        <div style={{ marginTop: "25px" }}>
            <p className={`${fonts.taviraj.className} ${styles.bio}`}>
                I'm a Senior Software Engineer at Optum (a UnitedHealth Group company), building the Enterprise Data Platform for UHG's vast data needs.
                {
                    showOverlay &&
                    <span style={{ display: "block", marginTop: "10px" }}>
                        I have a strong background in software development and data engineering, with expertise in various programming languages and tools.
                    </span>
                }
            </p>
        </div>
    );
}
