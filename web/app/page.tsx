import Link from "next/link";

const cards = [
  {
    href: "/documents",
    title: "Manage Documents",
    description: "Upload files, create notes, and keep everything organized by labels.",
  },
  {
    href: "/chat",
    title: "Ask Questions",
    description: "Query your knowledge base to get concise answers with citations.",
  },
  {
    href: "/wiki",
    title: "Browse the Wiki",
    description: "Read automatically generated summaries grouped by label.",
  },
];

export default function Page() {
  return (
    <div className="space-y-12">
      <section className="rounded-2xl bg-white p-10 shadow-sm">
        <h1 className="text-3xl font-semibold tracking-tight text-neutral-900">
          Welcome to Your Knowledge Workspace
        </h1>
        <p className="mt-4 max-w-2xl text-neutral-600">
          Collect documents, craft notes, ask questions, and explore auto-generated wiki pages built from your personal knowledge base.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {cards.map((card) => (
            <Link key={card.href} className="card" href={card.href}>
              <h2 className="text-xl font-semibold">{card.title}</h2>
              <p className="mt-2 text-sm text-neutral-600">{card.description}</p>
            </Link>
          ))}
          <Link className="card" href="/documents">
            <h2 className="text-xl font-semibold">Quick Start</h2>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-neutral-600">
              <li>Upload your first document</li>
              <li>Tag it with labels for easy filtering</li>
              <li>Ask a question to see citations in action</li>
            </ul>
          </Link>
        </div>
      </section>
    </div>
  );
}

