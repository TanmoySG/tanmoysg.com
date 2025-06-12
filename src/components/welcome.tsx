import Bio from "./bio";
import { fonts } from "@/utils/fonts";
import Socials from "./sections/socials";

export default function Welcome({ className, showOverlay }: { className?: any, showOverlay?: boolean }) {
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
            <Bio showOverlay={showOverlay} />
            <Socials />
        </div>
    );
}
