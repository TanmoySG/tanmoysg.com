"use client";

import styles from "./buttons.module.css";
import shared_styles from "./shared.module.css"

export const ToggleButton = ({
    className = "",
    buttonText = "Toggle",
    onClick = () => { },
}: {
    className?: string;
    buttonText?: string;
    onClick?: () => void;
}) => {
    return (
        <a
            onClick={(e) => {
                e.preventDefault();
                onClick();
            }}
            type="button"
            target="_blank"
            rel="noopener noreferrer"
            className={`${styles.dottedUnderline} ${shared_styles.magnify} ${className}`}
        >
            {buttonText}
        </a>
    );
};
