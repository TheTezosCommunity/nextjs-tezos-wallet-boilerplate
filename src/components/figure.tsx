import Image from "next/image";

export interface FigureProps {
    src: string;
    alt: string;
    caption?: string;
    width?: number;
    height?: number;
}

export function Figure({ src, alt, caption, width = 600, height = 400 }: FigureProps) {
    return (
        <figure className="my-4">
            <Image src={src} alt={alt} width={width} height={height} className="rounded border" />
            {caption && <figcaption className="text-xs text-muted-foreground mt-2">{caption}</figcaption>}
        </figure>
    );
}
