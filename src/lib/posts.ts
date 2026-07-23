import { parse } from "yaml";
import { marked } from "marked";

export type Post = {
  slug: string;
  title: string;
  date: string;
  html: string;
};

const files = import.meta.glob("/content/posts/*.md", {
  eager: true,
  query: "?raw",
  import: "default",
});

function parsePost(path: string, raw: string): Post {
  const slug = path.split("/").pop()!.replace(/\.md$/, "");
  const match = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  const frontmatter = match ? parse(match[1]) : {};
  const body = match ? match[2] : raw;
  return {
    slug,
    title: frontmatter.title ?? "Untitled",
    date: frontmatter.date ?? "",
    html: marked.parse(body, { async: false }) as string,
  };
}

export function getPosts(): Post[] {
  return Object.entries(files).map(([path, raw]) =>
    parsePost(path, raw as string),
  );
}
