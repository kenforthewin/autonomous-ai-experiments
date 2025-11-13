"use client";

import { useEffect, useState, useTransition } from "react";
import { createOrUpdateNote, getDocument, type DocumentDetail } from "@/lib/api";

interface Props {
  id: string;
}

export default function DocumentDetailPage({ id }: Props) {
  const [document, setDocument] = useState<DocumentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [labels, setLabels] = useState("");
  const [isSaving, startSave] = useTransition();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    getDocument(id)
      .then((doc) => {
        setDocument(doc);
        setTitle(doc.title);
        setContent(doc.content ?? "");
        setLabels(doc.labels.join(", "));
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Unable to load document");
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleSave = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!document) return;

    const payload = {
      id: document.id,
      title: title.trim(),
      content: content.trim(),
      labels: labels
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    };

    startSave(async () => {
      try {
        setError(null);
        await createOrUpdateNote(payload);
        setSuccessMessage("Document saved");
        setTimeout(() => setSuccessMessage(null), 3000);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to save document");
      }
    });
  };

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

  if (!document) {
    return <p className="text-neutral-500">Document not found.</p>;
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-white p-8 shadow-sm">
        <header className="space-y-2">
          <p className="text-sm text-neutral-500">Document ID: {document.id}</p>
          <h1 className="text-3xl font-semibold text-neutral-900">{document.title}</h1>
          {document.updated_at && (
            <p className="text-xs text-neutral-400">
              Last updated {new Date(document.updated_at).toLocaleString()}
            </p>
          )}
        </header>

        <form onSubmit={handleSave} className="mt-6 space-y-4">
          <label className="flex flex-col text-sm font-medium text-neutral-700">
            Title
            <input
              className="mt-1 rounded-lg border border-neutral-300 px-3 py-2 text-sm"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              required
            />
          </label>

          <label className="flex flex-col text-sm font-medium text-neutral-700">
            Labels (comma separated)
            <input
              className="mt-1 rounded-lg border border-neutral-300 px-3 py-2 text-sm"
              value={labels}
              onChange={(event) => setLabels(event.target.value)}
            />
          </label>

          <label className="flex flex-col text-sm font-medium text-neutral-700">
            Content
            <textarea
              className="mt-1 min-h-[320px] rounded-lg border border-neutral-300 px-3 py-2 text-sm"
              value={content}
              onChange={(event) => setContent(event.target.value)}
              placeholder="Write or edit the note content"
              required
            />
          </label>

          <button
            type="submit"
            className="rounded-full bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isSaving}
          >
            {isSaving ? "Saving…" : "Save changes"}
          </button>
        </form>

        {successMessage && (
          <p className="pt-2 text-sm text-green-600">{successMessage}</p>
        )}
      </div>
    </div>
  );
}

