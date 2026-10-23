from fastapi.testclient import TestClient


def test_salud_ok(client: TestClient) -> None:
    response = client.get("/api/v1/salud")
    assert response.status_code == 200
    assert response.json() == {"estado": "ok"}
