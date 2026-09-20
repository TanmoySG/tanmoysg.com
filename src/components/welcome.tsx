import Bio from "./bio";
import { fonts } from "@/utils/fonts";
import Pages from "./sections/pages";

export default function Welcome({ className, showOverlay, onAboutClick, commandOpen, commandClosing, command, onCommandChange, onCommandSubmit, onCommandCloseComplete }: { className?: any, showOverlay?: boolean, onAboutClick?: () => void, commandOpen?: boolean, commandClosing?: boolean, command?: string, onCommandChange?: (value: string) => void, onCommandSubmit?: (value: string) => void, onCommandCloseComplete?: () => void }) {
    return (
        <div className={className}>

            {/* 
            
            <h1 className={fonts.spectral.className}>Hi! I'm Tanmoy.</h1>
            <Bio />
            <br />

            <h1 className={fonts.taviraj.className}>Hi! I'm Tanmoy.</h1>
            <Bio /> 
            <br /> 

            // alt
            <h1 className={fonts.newsreader.className}>Hi! I'm Tanmoy.</h1>
            <Bio />
            
            */}
            <h1 className={fonts.libreBaskerville.className}>Hi! I'm Tanmoy.</h1>
            <Bio />
            {/* <Socials /> */}
            <div style={{ visibility: showOverlay ? "hidden" : "visible" }}>
                <Pages
                    onAboutClick={onAboutClick}
                    commandOpen={commandOpen}
                    commandClosing={commandClosing}
                    command={command}
                    onCommandChange={onCommandChange}
                    onCommandSubmit={onCommandSubmit}
                    onCommandCloseComplete={onCommandCloseComplete}
                />
            </div>
        </div>
    );
}
