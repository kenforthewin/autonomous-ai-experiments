import Link from "next/link";
import { listLabels } from "@/lib/api";

export default async function WikiPage() {
  let labels: string[] = [];
  let loadError: string | null = null;

  try {
    const data = await listLabels();
    labels = data.labels ?? [];
  } catch {
    loadError = "Unable to load labels. Ensure the backend API is running.";
  }

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold text-neutral-900">Knowledge labels</h1>
        <p className="text-sm text-neutral-600">
          Select a label to browse its auto-generated wiki page.
        </p>
      </header>

      <section className="rounded-2xl bg-white p-8 shadow-sm">
        {loadError ? (
          <p className="text-sm text-red-600">{loadError}</p>
        ) : labels.length === 0 ? (
          <p className="text-sm text-neutral-500">
            No labels yet. Upload documents or create notes to generate wiki pages.
          </p>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {labels.map((label) => (
              <li key={label}>
                <Link
                  href={`/wiki/${encodeURIComponent(label)}`}
                  className="flex items-center justify-between rounded-lg border border-neutral-200 px-4 py-3 text-sm font-medium text-neutral-700 transition hover:border-neutral-300 hover:bg-neutral-50"
                >
                  <span>{label}</span>
                  <span aria-hidden>→</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

