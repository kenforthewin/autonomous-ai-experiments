from __future__ import annotations

from fastapi.testclient import TestClient


def test_create_note_offline(test_client: TestClient) -> None:
    response = test_client.post(
        "/documents",
        json={
            "title": "Test Note",
            "content": "This is a sample note about astronomy and stars.",
            "labels": ["astronomy"],
        },
    )

    assert response.status_code == 200
    payload = response.json()
    doc_id = payload["id"]

    assert doc_id
    assert payload["labels"]

    detail_response = test_client.get(f"/documents/{doc_id}")
    assert detail_response.status_code == 200
    detail = detail_response.json()
    assert detail["id"] == doc_id
    assert "astronomy" in detail["labels"]

    content = detail.get("content")
    assert content is not None
    assert "sample note" in content

    list_response = test_client.get("/documents")
    assert list_response.status_code == 200
    listed = list_response.json()["documents"]
    assert any(item["id"] == doc_id for item in listed)

