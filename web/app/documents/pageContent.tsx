"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import {
  createOrUpdateNote,
  getDocument,
  listDocuments,
  uploadDocuments,
  type DocumentDetail,
  type DocumentSummary,
  type NotePayload,
} from "@/lib/api";

const parseLabels = (value: string) =>
  value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

export default function DocumentsPageContent() {
  const [documents, setDocuments] = useState<DocumentSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<DocumentDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [noteLabels, setNoteLabels] = useState("");

  const [isUploading, startUpload] = useTransition();
  const [isSaving, startSave] = useTransition();

  useEffect(() => {
    void reloadDocuments();
  }, []);

  useEffect(() => {
    if (!selectedId) {
      setDetail(null);
      setNoteTitle("");
      setNoteContent("");
      setNoteLabels("");
      return;
    }

    setDetailLoading(true);
    getDocument(selectedId)
      .then((doc) => {
        setDetail(doc);
        setNoteTitle(doc.title);
        setNoteContent(doc.content ?? "");
        setNoteLabels(doc.labels.join(", "));
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load document"))
      .finally(() => setDetailLoading(false));
  }, [selectedId]);

  const reloadDocuments = async () => {
    try {
      setLoading(true);
      const data = await listDocuments();
      setDocuments(data.documents ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load documents");
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const fileInput = form.elements.namedItem("files") as HTMLInputElement;
    const labelsInput = form.elements.namedItem("labels") as HTMLInputElement;

    if (!fileInput.files || fileInput.files.length === 0) {
      setError("Select at least one file to upload.");
      return;
    }

    const files = Array.from(fileInput.files);
    const labels = parseLabels(labelsInput.value);

    startUpload(async () => {
      try {
        setError(null);
        await uploadDocuments(files, labels);
        form.reset();
        await reloadDocuments();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Upload failed");
      }
    });
  };

  const handleSaveNote = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!noteTitle.trim() || !noteContent.trim()) {
      setError("Title and content are required.");
      return;
    }

    const payload: NotePayload = {
      id: detail?.id,
      title: noteTitle.trim(),
      content: noteContent.trim(),
      labels: parseLabels(noteLabels),
    };

    startSave(async () => {
      try {
        setError(null);
        const saved = await createOrUpdateNote(payload);
        await reloadDocuments();
        setSelectedId(saved.id);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to save note");
      }
    });
  };

  const handleStartNewNote = () => {
    setSelectedId(null);
  };

  const selectedLabels = useMemo(() => detail?.labels ?? [], [detail]);

  return (
    <div className="grid gap-8 lg:grid-cols-[2fr,1fr]">
      <section className="space-y-8">
        <div className="rounded-2xl bg-white p-8 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-semibold text-neutral-900">Documents</h1>
              <p className="mt-1 text-sm text-neutral-600">
                Upload files or craft notes to keep your knowledge base up to date.
              </p>
            </div>
            <button
              type="button"
              onClick={handleStartNewNote}
              className="rounded-full border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-100"
            >
              New note
            </button>
          </div>

          <div className="mt-8 grid gap-8 lg:grid-cols-2">
            <form onSubmit={handleUpload} className="space-y-4" aria-label="Upload documents">
              <h2 className="text-lg font-medium text-neutral-900">Upload files</h2>
              <label className="flex flex-col text-sm font-medium text-neutral-700">
                Files
                <input
                  className="mt-1 rounded-lg border border-neutral-300 px-3 py-2 text-sm"
                  type="file"
                  name="files"
                  multiple
                />
              </label>
              <label className="flex flex-col text-sm font-medium text-neutral-700">
                Labels (comma separated)
                <input
                  className="mt-1 rounded-lg border border-neutral-300 px-3 py-2 text-sm"
                  type="text"
                  name="labels"
                  placeholder="research, meeting"
                />
              </label>
              <button
                type="submit"
                className="rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isUploading}
              >
                {isUploading ? "Uploading…" : "Upload"}
              </button>
            </form>

            <form onSubmit={handleSaveNote} className="space-y-4" aria-label="Create or update note">
              <h2 className="text-lg font-medium text-neutral-900">
                {detail ? "Edit note" : "Create a note"}
              </h2>
              <label className="flex flex-col text-sm font-medium text-neutral-700">
                Title
                <input
                  className="mt-1 rounded-lg border border-neutral-300 px-3 py-2 text-sm"
                  value={noteTitle}
                  onChange={(event) => setNoteTitle(event.target.value)}
                  placeholder="Project summary"
                  required
                />
              </label>
              <label className="flex flex-col text-sm font-medium text-neutral-700">
                Labels (comma separated)
                <input
                  className="mt-1 rounded-lg border border-neutral-300 px-3 py-2 text-sm"
                  value={noteLabels}
                  onChange={(event) => setNoteLabels(event.target.value)}
                  placeholder="research, meeting"
                />
              </label>
              <label className="flex flex-col text-sm font-medium text-neutral-700">
                Content
                <textarea
                  className="mt-1 min-h-[200px] rounded-lg border border-neutral-300 px-3 py-2 text-sm"
                  value={noteContent}
                  onChange={(event) => setNoteContent(event.target.value)}
                  placeholder="Write your note here..."
                  required
                />
              </label>
              <button
                type="submit"
                className="rounded-full bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isSaving}
              >
                {isSaving ? "Saving…" : detail ? "Update note" : "Create note"}
              </button>
            </form>
          </div>
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}
      </section>

      <aside className="space-y-4">
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-neutral-900">Recent documents</h2>
          {loading ? (
            <p className="mt-4 text-sm text-neutral-500">Loading…</p>
          ) : documents.length === 0 ? (
            <p className="mt-4 text-sm text-neutral-500">No documents yet. Upload a file or create a note.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {documents.map((doc) => (
                <li key={doc.id}>
                  <button
                    onClick={() => setSelectedId(doc.id)}
                    className={`w-full rounded-lg border px-3 py-2 text-left text-sm transition hover:border-blue-300 hover:bg-blue-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 ${
                      selectedId === doc.id ? "border-blue-400 bg-blue-50" : "border-neutral-200"
                    }`}
                  >
                    <div className="font-medium text-neutral-900">{doc.title}</div>
                    {doc.labels.length > 0 && (
                      <div className="mt-1 flex flex-wrap gap-1 text-xs text-neutral-500">
                        {doc.labels.map((label) => (
                          <span key={label} className="rounded-full bg-neutral-100 px-2 py-0.5">
                            {label}
                          </span>
                        ))}
                      </div>
                    )}
                    {doc.updated_at && (
                      <time className="mt-1 block text-xs text-neutral-400" dateTime={doc.updated_at}>
                        Updated {new Date(doc.updated_at).toLocaleString()}
                      </time>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {selectedId && (
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-neutral-900">Selected document</h3>
            {detailLoading ? (
              <p className="mt-3 text-sm text-neutral-500">Loading…</p>
            ) : detail ? (
              <dl className="mt-4 space-y-2 text-sm text-neutral-600">
                <div>
                  <dt className="font-medium text-neutral-700">Title</dt>
                  <dd>{detail.title}</dd>
                </div>
                <div>
                  <dt className="font-medium text-neutral-700">Labels</dt>
                  <dd>{selectedLabels.length > 0 ? selectedLabels.join(", ") : "—"}</dd>
                </div>
                <div>
                  <dt className="font-medium text-neutral-700">Last updated</dt>
                  <dd>
                    <time dateTime={detail.updated_at}>{new Date(detail.updated_at).toLocaleString()}</time>
                  </dd>
                </div>
                {detail.content ? (
                  <div>
                    <dt className="font-medium text-neutral-700">Preview</dt>
                    <dd className="max-h-40 overflow-hidden whitespace-pre-wrap text-neutral-500">
                      {detail.content}
                    </dd>
                  </div>
                ) : (
                  <p className="text-xs text-neutral-400">
                    Content preview unavailable for this document.
                  </p>
                )}
              </dl>
            ) : (
              <p className="mt-3 text-sm text-neutral-500">Select a document to view details.</p>
            )}
            <div className="mt-5">
              <a
                className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500"
                href={`/documents/${selectedId}`}
              >
                Open detail view →
              </a>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}

