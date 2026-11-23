"""Passwords, JWTs and the SSRF guard that blocks scans of private/internal hosts."""
import ipaddress
import socket
from datetime import datetime, timedelta, timezone
from urllib.parse import urlparse

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from passlib.context import CryptContext

from .config import settings
from .database import SESSION_LOCAL
from .models import User

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
bearer = HTTPBearer(auto_error=False)


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(password: str, hashed: str) -> bool:
    try:
        return pwd_context.verify(password, hashed)
    except Exception:
        return False


def create_token(user: User) -> str:
    exp = datetime.now(timezone.utc) + timedelta(hours=settings.JWT_EXPIRE_HOURS)
    return jwt.encode({"sub": str(user.id), "exp": exp}, settings.JWT_SECRET, algorithm="HS256")


def get_current_user(
    session: SESSION_LOCAL,
    creds: HTTPAuthorizationCredentials | None = Depends(bearer),
) -> User:
    unauthorized = HTTPException(status.HTTP_401_UNAUTHORIZED, "Please log in to continue.")
    if creds is None:
        raise unauthorized
    try:
        payload = jwt.decode(creds.credentials, settings.JWT_SECRET, algorithms=["HS256"])
        user = session.get(User, int(payload["sub"]))
    except Exception:
        raise unauthorized
    if user is None:
        raise unauthorized
    return user


# ── SSRF guard ───────────────────────────────────────────────────────────────

def _is_public(ip_text: str) -> bool:
    ip = ipaddress.ip_address(ip_text)
    return ip.is_global and not ip.is_multicast


def assert_public_url(url: str) -> None:
    """Raise ValueError unless the URL points at a public internet host."""
    if settings.ALLOW_PRIVATE_TARGETS:
        return
    parsed = urlparse(url)
    if parsed.scheme not in ("http", "https") or not parsed.hostname:
        raise ValueError("Only http(s) URLs are allowed.")
    host = parsed.hostname
    try:
        infos = socket.getaddrinfo(host, parsed.port or (443 if parsed.scheme == "https" else 80))
    except socket.gaierror:
        raise ValueError(f"The domain '{host}' could not be resolved.")
    for info in infos:
        if not _is_public(info[4][0]):
            raise ValueError(
                "Scanning private, local or internal addresses is not allowed. "
                "Use a public website you own or have permission to test."
            )
