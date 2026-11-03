import type { ReactNode } from "react";

function inlineMarkdown(value: string): ReactNode[] {
  const pattern = /(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\(https?:\/\/[^)]+\))/g;
  return value.split(pattern).map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return <code key={index}>{part.slice(1, -1)}</code>;
    }
    const link = part.match(/^\[([^\]]+)\]\((https?:\/\/[^)]+)\)$/);
    if (link) {
      return <a key={index} href={link[2]} target="_blank" rel="noreferrer">{link[1]}</a>;
    }
    return part;
  });
}

export default function Markdown({ source }: { source: string }) {
  const blocks = source.split(/\n{2,}/);

  return (
    <div>
      {blocks.map((block, index) => {
        const lines = block.split("\n");
        if (lines.every((line) => /^[-*]\s+/.test(line))) {
          return (
            <ul key={index}>
              {lines.map((line) => <li key={line}>{inlineMarkdown(line.replace(/^[-*]\s+/, ""))}</li>)}
            </ul>
          );
        }

        const heading = block.match(/^(#{1,6})\s+(.+)$/);
        if (heading) {
          const level = heading[1].length;
          const Heading = `h${level}` as "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
          return <Heading key={index}>{inlineMarkdown(heading[2])}</Heading>;
        }

        return <p key={index}>{lines.map((line, lineIndex) => (
          <span key={lineIndex}>{lineIndex > 0 && <br />}{inlineMarkdown(line)}</span>
        ))}</p>;
      })}
    </div>
  );
}
