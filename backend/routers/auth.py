import httpx
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr, Field
from sqlmodel import select

from ..config import settings
from ..database import SESSION_LOCAL
from ..models import User
from ..security import create_token, get_current_user, hash_password, verify_password

router = APIRouter(prefix="/auth", tags=["auth"])


class RegisterIn(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=72)
    name: str | None = None


class LoginIn(BaseModel):
    email: EmailStr
    password: str


class GoogleIn(BaseModel):
    credential: str


class UserOut(BaseModel):
    id: int
    email: str
    name: str | None = None


class AuthOut(BaseModel):
    token: str
    user: UserOut


def _out(user: User) -> AuthOut:
    return AuthOut(token=create_token(user), user=UserOut(id=user.id, email=user.email, name=user.name))


@router.post("/register", response_model=AuthOut)
def register(body: RegisterIn, session: SESSION_LOCAL):
    email = body.email.lower()
    if session.exec(select(User).where(User.email == email)).first():
        raise HTTPException(status.HTTP_409_CONFLICT, "An account with this email already exists.")
    user = User(email=email, name=body.name, password_hash=hash_password(body.password))
    session.add(user)
    session.commit()
    session.refresh(user)
    return _out(user)


@router.post("/login", response_model=AuthOut)
def login(body: LoginIn, session: SESSION_LOCAL):
    user = session.exec(select(User).where(User.email == body.email.lower())).first()
    if user is None or not user.password_hash or not verify_password(body.password, user.password_hash):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Incorrect email or password.")
    return _out(user)


@router.post("/google", response_model=AuthOut)
def google_login(body: GoogleIn, session: SESSION_LOCAL):
    if not settings.GOOGLE_CLIENT_ID:
        raise HTTPException(status.HTTP_503_SERVICE_UNAVAILABLE, "Google sign-in is not configured.")
    try:
        resp = httpx.get(
            "https://oauth2.googleapis.com/tokeninfo",
            params={"id_token": body.credential},
            timeout=10,
        )
    except httpx.HTTPError:
        raise HTTPException(status.HTTP_502_BAD_GATEWAY, "Could not reach Google to verify sign-in.")
    info = resp.json() if resp.status_code == 200 else {}
    if info.get("aud") != settings.GOOGLE_CLIENT_ID or info.get("email_verified") not in (True, "true"):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Google sign-in could not be verified.")

    email = info["email"].lower()
    sub = info["sub"]
    user = session.exec(select(User).where(User.google_sub == sub)).first() or \
        session.exec(select(User).where(User.email == email)).first()
    if user is None:
        user = User(email=email, name=info.get("name"), google_sub=sub)
    elif not user.google_sub:
        user.google_sub = sub
    session.add(user)
    session.commit()
    session.refresh(user)
    return _out(user)


@router.get("/me", response_model=UserOut)
def me(user: User = Depends(get_current_user)):
    return UserOut(id=user.id, email=user.email, name=user.name)
