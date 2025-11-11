import WikiDetail from "./WikiDetail";

export default function WikiLabelPage({ params }: { params: { label: string } }) {
  const label = decodeURIComponent(params.label);
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold text-neutral-900">{label}</h1>
        <p className="text-sm text-neutral-600">
          Explore the synthesized knowledge compiled from your documents.
        </p>
      </header>
      <section className="rounded-2xl bg-white p-8 shadow-sm">
        <WikiDetail label={label} />
      </section>
    </div>
  );
}

