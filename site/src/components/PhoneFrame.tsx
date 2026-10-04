/* eslint-disable @next/next/no-img-element */
export function PhoneFrame({ src, alt, small = false }: { src: string; alt: string; small?: boolean }) {
  return (
    <figure
      className={`overflow-hidden rounded-[2rem] border-[6px] border-night bg-night shadow-[var(--shadow)] ${small ? "rounded-[1.4rem] border-4" : ""}`}
    >
      <img src={src} alt={alt} className="block aspect-[430/880] w-full bg-white object-cover object-top" loading="lazy" />
    </figure>
  );
}
