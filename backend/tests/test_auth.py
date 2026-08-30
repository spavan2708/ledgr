from types import SimpleNamespace

from fastapi.testclient import TestClient

from app.core import auth
from app.main import app

client = TestClient(app)


def test_me_rejects_missing_token() -> None:
    response = client.get("/api/v1/me")
    assert response.status_code == 401
    assert response.headers["www-authenticate"] == "Bearer"


def test_me_accepts_verified_subject(monkeypatch) -> None:
    monkeypatch.setattr(auth, "jwks_client", lambda: SimpleNamespace(get_signing_key_from_jwt=lambda token: SimpleNamespace(key="public-key")))
    monkeypatch.setattr(auth.jwt, "decode", lambda *args, **kwargs: {"sub": "user-123", "exp": 9999999999})
    response = client.get("/api/v1/me", headers={"Authorization": "Bearer test-token"})
    assert response.status_code == 200
    assert response.json() == {"user_id": "user-123"}


def test_me_fails_securely_when_jwks_unavailable(monkeypatch) -> None:
    monkeypatch.setattr(auth, "jwks_client", lambda: (_ for _ in ()).throw(RuntimeError("offline")))
    assert client.get("/api/v1/me", headers={"Authorization": "Bearer test-token"}).status_code == 401

