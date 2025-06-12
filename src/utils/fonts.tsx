import { Spectral, Taviraj, Libre_Baskerville, Newsreader } from "next/font/google";

const newsreader = Newsreader({
    subsets: ["latin"],
    variable: "--newsreader",
    display: "swap",
    weight: ["400", "500", "600", "700"],
});

const taviraj = Taviraj({
    subsets: ["latin"],
    variable: "--taviraj",
    display: "swap",
    weight: ["200", "300", "400", "500", "600", "700", "800", "900"],
    style: ["normal", "italic"],
});

const spectral = Spectral({
    subsets: ["latin"],
    variable: "--spectral",
    display: "swap",
    weight: ["400", "500", "600", "700"],
});

const libreBaskerville = Libre_Baskerville({
    subsets: ["latin"],
    variable: "--libre-baskerville",
    display: "swap",
    weight: ["400", "700"],
});

export const fonts = {
    newsreader,
    taviraj,
    spectral,
    libreBaskerville,
};
