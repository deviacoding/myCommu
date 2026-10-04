import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";

export type PostMeta = {
  slug: string;
  title: string;
  date: string; // ISO (AAAA-MM-JJ)
  excerpt: string;
  tags: string[];
  cover?: string;
  readingMinutes: number;
};

export type Post = PostMeta & { html: string };

const BLOG_DIR = path.join(process.cwd(), "content", "blog");

function readFile(slug: string) {
  return fs.readFileSync(path.join(BLOG_DIR, `${slug}.md`), "utf8");
}

function toMeta(slug: string, raw: string): PostMeta {
  const { data, content } = matter(raw);
  const words = content.split(/\s+/).filter(Boolean).length;
  return {
    slug,
    title: String(data.title ?? slug),
    date: data.date instanceof Date ? data.date.toISOString().slice(0, 10) : String(data.date ?? "2026-01-01"),
    excerpt: String(data.excerpt ?? ""),
    tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
    cover: data.cover ? String(data.cover) : undefined,
    readingMinutes: Math.max(1, Math.round(words / 200)),
  };
}

export function getAllPosts(): PostMeta[] {
  if (!fs.existsSync(BLOG_DIR)) return [];
  return fs
    .readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith(".md"))
    .map((f) => toMeta(f.replace(/\.md$/, ""), readFile(f.replace(/\.md$/, ""))))
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export async function getPost(slug: string): Promise<Post> {
  const raw = readFile(slug);
  const meta = toMeta(slug, raw);
  const { content } = matter(raw);
  const processed = await remark().use(html, { sanitize: false }).process(content);
  return { ...meta, html: processed.toString() };
}

export function formatDate(iso: string) {
  const d = new Date(iso + "T12:00:00Z");
  return new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(d);
}
