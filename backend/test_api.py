#!/usr/bin/env python3
"""End-to-end test script for RAG API."""
import requests
import sys
import time
from pathlib import Path


BASE_URL = "http://localhost:8000"


def test_health():
    """Test health endpoint."""
    print("\n=== Testing Health Endpoint ===")
    response = requests.get(f"{BASE_URL}/health")
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
    assert response.status_code == 200
    print("✓ Health check passed")


def test_upload_document():
    """Test uploading a document."""
    print("\n=== Testing Document Upload ===")
    
    # Create a test document
    test_content = """
    Greece is a country located in Southeast Europe, known for its rich history and culture.
    
    History:
    Greece has one of the longest histories of any country, with a continuous presence since ancient times.
    Ancient Greece gave the world democracy, philosophy, and many great works of art and literature.
    The Ancient Greek philosophers like Socrates, Plato, and Aristotle laid the foundation of Western philosophy.
    
    Geography:
    Greece consists of a mainland and thousands of islands scattered in the Mediterranean and Aegean seas.
    The capital and largest city is Athens, known for the Acropolis and the Parthenon.
    Other major cities include Thessaloniki, Patras, and Heraklion.
    
    Culture:
    Greek culture is known for its cuisine, including Mediterranean diet with olive oil, feta cheese, and fresh vegetables.
    Traditional Greek music and dance are integral parts of the culture.
    Greece has many UNESCO World Heritage Sites and archaeological wonders.
    
    Modern Greece:
    Greece is a member of the European Union and NATO.
    The country is a popular tourist destination, attracting millions of visitors annually.
    Greek islands like Santorini and Crete are among the most visited destinations in Europe.
    """
    
    test_file_path = Path("/tmp/test_greece.txt")
    test_file_path.write_text(test_content)
    
    with open(test_file_path, "rb") as f:
        files = {"file": ("test_greece.txt", f, "text/plain")}
        response = requests.post(f"{BASE_URL}/api/documents/upload", files=files)
    
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
    assert response.status_code == 200, f"Upload failed: {response.text}"
    
    result = response.json()
    doc_id = result["id"]
    print(f"✓ Document uploaded with ID: {doc_id}")
    
    test_file_path.unlink()
    
    return doc_id


def test_list_documents():
    """Test listing documents."""
    print("\n=== Testing List Documents ===")
    response = requests.get(f"{BASE_URL}/api/documents")
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
    assert response.status_code == 200
    
    documents = response.json()
    print(f"✓ Found {len(documents)} document(s)")
    
    if documents:
        print(f"  Document: {documents[0]['filename']}")


def test_get_document(doc_id: str):
    """Test getting a specific document."""
    print(f"\n=== Testing Get Document {doc_id} ===")
    response = requests.get(f"{BASE_URL}/api/documents/{doc_id}")
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
    assert response.status_code == 200
    print("✓ Document retrieved successfully")


def test_query():
    """Test querying documents."""
    print("\n=== Testing Query ===")
    
    query_data = {
        "query": "Tell me about Greece",
        "max_results": 5
    }
    
    response = requests.post(f"{BASE_URL}/api/query", json=query_data)
    print(f"Status: {response.status_code}")
    
    if response.status_code != 200:
        print(f"Error response: {response.text}")
        assert False, f"Query failed with status {response.status_code}"
    
    result = response.json()
    print(f"Answer: {result['answer'][:200]}...")
    print(f"Sources: {len(result['sources'])} source(s)")
    
    assert result["answer"], "No answer generated"
    print("✓ Query processed successfully")


def test_delete_document(doc_id: str):
    """Test deleting a document."""
    print(f"\n=== Testing Delete Document {doc_id} ===")
    response = requests.delete(f"{BASE_URL}/api/documents/{doc_id}")
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
    assert response.status_code == 200
    print("✓ Document deleted successfully")
    
    # Verify it's deleted
    response = requests.get(f"{BASE_URL}/api/documents/{doc_id}")
    assert response.status_code == 404, "Document should not be found after deletion"
    print("✓ Verified document is deleted")


def main():
    """Run all tests."""
    print("=" * 50)
    print("RAG API End-to-End Tests")
    print("=" * 50)
    
    try:
        # Wait a moment for server startup
        time.sleep(1)
        
        # Run tests
        test_health()
        doc_id = test_upload_document()
        
        # Wait for embeddings to be processed
        time.sleep(2)
        
        test_list_documents()
        test_get_document(doc_id)
        
        # Wait for embeddings to be ready
        time.sleep(2)
        
        test_query()
        test_delete_document(doc_id)
        
        print("\n" + "=" * 50)
        print("✓ All tests passed!")
        print("=" * 50)
        return 0
    
    except Exception as e:
        print(f"\n✗ Test failed with error: {e}")
        import traceback
        traceback.print_exc()
        return 1


if __name__ == "__main__":
    sys.exit(main())

