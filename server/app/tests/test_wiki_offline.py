from __future__ import annotations

from fastapi.testclient import TestClient


def _create_note(client: TestClient, title: str, content: str, labels: list[str]) -> str:
    response = client.post(
        "/documents",
        json={"title": title, "content": content, "labels": labels},
    )
    assert response.status_code == 200
    return response.json()["id"]


def test_wiki_offline_builds_content(test_client: TestClient) -> None:
    _create_note(
        test_client,
        "Space Travel",
        "Space travel requires rockets and careful mission planning for Mars.",
        ["space"],
    )

    list_response = test_client.get("/wiki")
    assert list_response.status_code == 200
    labels = list_response.json()["labels"]
    assert "space" in labels

    wiki_response = test_client.get("/wiki/space")
    assert wiki_response.status_code == 200
    content = wiki_response.json()["content"]
    assert content.startswith("# ")
    assert "## References" in content

    rebuild_response = test_client.post("/wiki/rebuild")
    assert rebuild_response.status_code == 200
    assert rebuild_response.json()["rebuilt"] >= 1

