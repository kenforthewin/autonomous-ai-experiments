import { Suspense } from "react";
import DocumentsPageContent from "./pageContent";

export default function DocumentsPage() {
  return (
    <section className="space-y-6">
      <Suspense fallback={<p className="text-neutral-500">Loading documents…</p>}>
        <DocumentsPageContent />
      </Suspense>
    </section>
  );
}

