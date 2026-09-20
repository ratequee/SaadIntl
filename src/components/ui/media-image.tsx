import Image, { type ImageProps } from "next/image";

function isInlineSrc(src: ImageProps["src"]) {
  return typeof src === "string" && (src.startsWith("blob:") || src.startsWith("data:"));
}

export function MediaImage({ src, alt, className, ...props }: ImageProps) {
  if (isInlineSrc(src)) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={src} alt={alt} className={className} />
    );
  }

  return <Image src={src} alt={alt} className={className} {...props} />;
}
