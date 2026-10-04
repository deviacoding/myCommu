import type { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/blog";
import { guides } from "../../content/guides";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: "monthly", priority: 1 },
    { url: `${SITE_URL}/blog`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    ...getAllPosts().map((p) => ({ url: `${SITE_URL}/blog/${p.slug}`, lastModified: new Date(p.date), changeFrequency: "yearly" as const, priority: 0.7 })),
    { url: `${SITE_URL}/apprendre`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    ...guides.map((g) => ({ url: `${SITE_URL}/apprendre/${g.slug}`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.7 })),
  ];
}
