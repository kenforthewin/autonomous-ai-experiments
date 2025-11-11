"use client";

import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getWiki, type WikiResponse } from "@/lib/api";

interface Props {
  label: string;
}

export default function WikiDetail({ label }: Props) {
  const [data, setData] = useState<WikiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getWiki(label)
      .then((response) => setData(response))
      .catch((err) => setError(err instanceof Error ? err.message : "Unable to load wiki page"))
      .finally(() => setLoading(false));
  }, [label]);

  if (loading) {
    return <p className="text-neutral-500">Loading…</p>;
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
        {error}
      </div>
    );
  }

  const content = data?.content?.trim() ||
    `# ${label}\n\nNo content yet. Upload documents or notes with this label to generate a wiki page.`;

  return (
    <article className="prose prose-neutral prose-headings:font-semibold prose-a:text-blue-600 max-w-none">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </article>
  );
}

