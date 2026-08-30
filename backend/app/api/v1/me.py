from fastapi import APIRouter, Depends
from pydantic import BaseModel

from app.core.auth import authenticated_user_id

router = APIRouter(tags=["authentication"])


class AuthenticatedUser(BaseModel):
    user_id: str


@router.get("/me", response_model=AuthenticatedUser)
def me(user_id: str = Depends(authenticated_user_id)) -> AuthenticatedUser:
    return AuthenticatedUser(user_id=user_id)

