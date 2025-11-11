import DocumentDetailPage from "./pageContent";

export default function DocumentPage({ params }: { params: { id: string } }) {
  return <DocumentDetailPage id={params.id} />;
}

