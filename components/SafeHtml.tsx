"use client";

import DOMPurify from "isomorphic-dompurify";

const ALLOWED_TAGS = ["b", "strong", "i", "em", "u", "ruby", "rt", "rp", "span", "br", "p"];

type Props = {
  html: string;
  className?: string;
  as?: "span" | "p" | "div";
  /** When true, strip all HTML tags (use for content that should show plain text with 【】 emphasis only) */
  stripTags?: boolean;
};

export function SafeHtml({ html, className, as: Tag = "span", stripTags = false }: Props) {
  if (html == null || html === "") return null;
  const withBreaks = stripTags ? html : html.replace(/\n/g, "<br />");
  const sanitized = DOMPurify.sanitize(withBreaks, {
    ALLOWED_TAGS: stripTags ? [] : ALLOWED_TAGS,
  });
  const cls = stripTags ? `${className ?? ""} whitespace-pre-wrap`.trim() : className;
  return <Tag className={cls || undefined} dangerouslySetInnerHTML={{ __html: sanitized }} />;
}
