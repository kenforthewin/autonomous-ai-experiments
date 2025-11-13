from __future__ import annotations

from fastapi.testclient import TestClient


def _create_note(client: TestClient, title: str, content: str, labels: list[str]) -> str:
    response = client.post(
        "/documents",
        json={"title": title, "content": content, "labels": labels},
    )
    assert response.status_code == 200
    return response.json()["id"]


def test_query_offline_returns_answer_and_citations(test_client: TestClient) -> None:
    first_id = _create_note(
        test_client,
        "Python Tips",
        "Python typing and asyncio best practices are important for maintainability.",
        ["programming"],
    )
    _create_note(
        test_client,
        "Gardening Guide",
        "Tomatoes require sunlight and regular watering to thrive in home gardens.",
        ["gardening"],
    )

    response = test_client.post(
        "/query",
        json={"query": "How do I improve Python typing?", "labels": ["programming"]},
    )

    assert response.status_code == 200
    payload = response.json()
    assert payload["answer"]
    assert payload["citations"]
    assert any(citation["doc_id"] == first_id for citation in payload["citations"])

