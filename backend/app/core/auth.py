import os
from functools import lru_cache

import jwt
from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jwt import PyJWKClient

bearer = HTTPBearer(auto_error=False)


@lru_cache(maxsize=1)
def jwks_client() -> PyJWKClient:
    url = os.getenv("SUPABASE_JWKS_URL", "").strip()
    if not url:
        raise RuntimeError("Supabase JWKS URL is not configured")
    return PyJWKClient(url, cache_keys=True, lifespan=300)


def authenticated_user_id(credentials: HTTPAuthorizationCredentials | None = Depends(bearer)) -> str:
    if credentials is None or credentials.scheme.lower() != "bearer":
        raise HTTPException(status_code=401, detail="Authentication required", headers={"WWW-Authenticate": "Bearer"})
    try:
        key = jwks_client().get_signing_key_from_jwt(credentials.credentials).key
        options: dict[str, object] = {"require": ["exp", "sub"]}
        kwargs: dict[str, object] = {"algorithms": ["RS256", "ES256"], "options": options}
        audience = os.getenv("SUPABASE_JWT_AUDIENCE", "").strip()
        if audience: kwargs["audience"] = audience
        else: options["verify_aud"] = False
        supabase_url = os.getenv("SUPABASE_URL", "").rstrip("/")
        if supabase_url: kwargs["issuer"] = f"{supabase_url}/auth/v1"
        payload = jwt.decode(credentials.credentials, key, **kwargs)
        subject = payload.get("sub")
        if not isinstance(subject, str) or not subject:
            raise ValueError("Missing subject")
        return subject
    except Exception as exc:
        raise HTTPException(status_code=401, detail="Invalid or expired authentication token", headers={"WWW-Authenticate": "Bearer"}) from exc

