import type { SVGProps } from "react";

const base = (props: SVGProps<SVGSVGElement>) => ({
  width: 22,
  height: 22,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
  ...props,
});

export const Icon = {
  Clock: (p: SVGProps<SVGSVGElement>) => (
    <svg {...base(p)}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>
  ),
  Book: (p: SVGProps<SVGSVGElement>) => (
    <svg {...base(p)}><path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z" /><path d="M4 19V5" /><path d="M8 7h7" /></svg>
  ),
  Chat: (p: SVGProps<SVGSVGElement>) => (
    <svg {...base(p)}><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z" /></svg>
  ),
  Gift: (p: SVGProps<SVGSVGElement>) => (
    <svg {...base(p)}><rect x="3" y="8" width="18" height="5" /><path d="M5 13v8h14v-8" /><path d="M12 8v13" /><path d="M12 8c-2-4-6-3-6-1s3 1 6 1zm0 0c2-4 6-3 6-1s-3 1-6 1z" /></svg>
  ),
  Calendar: (p: SVGProps<SVGSVGElement>) => (
    <svg {...base(p)}><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4M16 3v4" /></svg>
  ),
  Users: (p: SVGProps<SVGSVGElement>) => (
    <svg {...base(p)}><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20a6.5 6.5 0 0 1 13 0" /><circle cx="17" cy="9" r="2.5" /><path d="M16 15.5a5 5 0 0 1 5.5 4.5" /></svg>
  ),
  Live: (p: SVGProps<SVGSVGElement>) => (
    <svg {...base(p)}><circle cx="12" cy="12" r="3" /><path d="M7.5 7.5a6.5 6.5 0 0 0 0 9M16.5 7.5a6.5 6.5 0 0 1 0 9M4.5 4.5a10.5 10.5 0 0 0 0 15M19.5 4.5a10.5 10.5 0 0 1 0 15" /></svg>
  ),
  Qr: (p: SVGProps<SVGSVGElement>) => (
    <svg {...base(p)}><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><path d="M14 14h3v3h-3zM20 14v3M17 20h4M14 20h1" /></svg>
  ),
  Key: (p: SVGProps<SVGSVGElement>) => (
    <svg {...base(p)}><circle cx="8" cy="14" r="4" /><path d="M11 11l9-9M16 6l3 3M14 8l2 2" /></svg>
  ),
  Receipt: (p: SVGProps<SVGSVGElement>) => (
    <svg {...base(p)}><path d="M5 3h14v18l-2.5-1.5L14 21l-2-1.5L10 21l-2.5-1.5L5 21z" /><path d="M9 8h6M9 12h6" /></svg>
  ),
  Shield: (p: SVGProps<SVGSVGElement>) => (
    <svg {...base(p)}><path d="M12 3l8 3v6c0 4.5-3.5 8-8 9-4.5-1-8-4.5-8-9V6z" /><path d="M9 12l2 2 4-4" /></svg>
  ),
  Globe: (p: SVGProps<SVGSVGElement>) => (
    <svg {...base(p)}><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" /></svg>
  ),
  Heart: (p: SVGProps<SVGSVGElement>) => (
    <svg {...base(p)}><path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10z" /></svg>
  ),
  Sparkle: (p: SVGProps<SVGSVGElement>) => (
    <svg {...base(p)}><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" /><path d="M19 17l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7z" /></svg>
  ),
  Building: (p: SVGProps<SVGSVGElement>) => (
    <svg {...base(p)}><path d="M4 21V5l8-2 8 2v16" /><path d="M9 9h2M13 9h2M9 13h2M13 13h2M10 21v-4h4v4" /></svg>
  ),
  Pin: (p: SVGProps<SVGSVGElement>) => (
    <svg {...base(p)}><path d="M12 21s-6-5.5-6-11a6 6 0 0 1 12 0c0 5.5-6 11-6 11z" /><circle cx="12" cy="10" r="2.2" /></svg>
  ),
  Arrow: (p: SVGProps<SVGSVGElement>) => (
    <svg {...base(p)}><path d="M5 12h14M13 6l6 6-6 6" /></svg>
  ),
  Print: (p: SVGProps<SVGSVGElement>) => (
    <svg {...base(p)}><path d="M7 8V3h10v5" /><rect x="4" y="8" width="16" height="9" rx="2" /><path d="M7 14h10v7H7z" /></svg>
  ),
  Download: (p: SVGProps<SVGSVGElement>) => (
    <svg {...base(p)}><path d="M12 3v12M7 10l5 5 5-5" /><path d="M4 19h16" /></svg>
  ),
};
