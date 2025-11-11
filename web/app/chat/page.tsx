"use client";

import { useState, useTransition } from "react";
import { runQuery, type QueryPayload, type QueryResponse } from "@/lib/api";

interface FormState extends QueryPayload {
  labelInput: string;
}

const parseLabels = (value: string) =>
  value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

export default function ChatPage() {
  const [state, setState] = useState<FormState>({ query: "", labelInput: "", labels: [], k: 5 });
  const [result, setResult] = useState<QueryResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, startSubmit] = useTransition();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!state.query.trim()) {
      setError("Ask a question to run a query.");
      return;
    }

    const payload: QueryPayload = {
      query: state.query.trim(),
      labels: parseLabels(state.labelInput),
      k: state.k,
    };

    startSubmit(async () => {
      try {
        setError(null);
        const response = await runQuery(payload);
        setResult(response);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to run query");
      }
    });
  };

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold text-neutral-900">Ask your knowledge base</h1>
        <p className="text-sm text-neutral-600">
          Provide an optional set of labels to focus the retrieval on specific topics.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl bg-white p-8 shadow-sm" aria-label="Ask a question">
        <label className="flex flex-col text-sm font-medium text-neutral-700">
          Question
          <textarea
            className="mt-1 min-h-[120px] rounded-lg border border-neutral-300 px-3 py-2 text-sm"
            value={state.query}
            onChange={(event) => setState((prev) => ({ ...prev, query: event.target.value }))}
            placeholder="What did we conclude about the Q4 roadmap?"
          />
        </label>
        <label className="flex flex-col text-sm font-medium text-neutral-700">
          Labels (comma separated)
          <input
            className="mt-1 rounded-lg border border-neutral-300 px-3 py-2 text-sm"
            value={state.labelInput}
            onChange={(event) => setState((prev) => ({ ...prev, labelInput: event.target.value }))}
            placeholder="product, planning"
          />
        </label>
        <label className="flex flex-col text-sm font-medium text-neutral-700">
          Number of references
          <input
            type="number"
            min={1}
            max={20}
            className="mt-1 w-32 rounded-lg border border-neutral-300 px-3 py-2 text-sm"
            value={state.k}
            onChange={(event) =>
              setState((prev) => ({ ...prev, k: Number.parseInt(event.target.value, 10) || 5 }))
            }
          />
        </label>
        <button
          type="submit"
          className="rounded-full bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Running…" : "Ask"}
        </button>

        {error && <p className="text-sm text-red-600">{error}</p>}
      </form>

      {result && (
        <section className="space-y-4 rounded-2xl bg-white p-8 shadow-sm">
          <header>
            <h2 className="text-xl font-semibold text-neutral-900">Answer</h2>
          </header>
          <p className="whitespace-pre-wrap text-neutral-700">{result.answer}</p>
          {result.citations.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-neutral-700">Citations</h3>
              <ul className="mt-2 space-y-1 text-sm text-neutral-600">
                {result.citations.map((citation, index) => (
                  <li key={`${citation.doc_id}-${citation.chunk_index}-${index}`}>
                    <span className="font-medium text-neutral-800">{citation.title}</span> – chunk {citation.chunk_index}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}
    </div>
  );
}

