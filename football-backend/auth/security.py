from passlib.context import CryptContext
from datetime import datetime, timedelta, timezone
from jose import jwt, JWTError
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
import logging

# password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

SECRET_KEY = "CHANGE_ME_LATER"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 1

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

credentials_exception = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="Could not validate credentials",
    headers={"WWW-Authenticate": "Bearer"},
)

logger = logging.getLogger("auth.security")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)

from datetime import datetime, timedelta, timezone

def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()

    now = datetime.now(timezone.utc)
    expire = now + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))

    to_encode.update({
        "exp": expire,
        "iat": now,
        "nbf": now,
    })

    token = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    try:
        # log human-readable timestamps for debugging
        logger.info("Created token for %s iat=%s exp=%s", data.get("sub"), now.isoformat(), expire.isoformat())
    except Exception:
        logger.info("Created token (sub unknown)")
    return token



def get_current_user(token: str = Depends(oauth2_scheme)):
    logger.debug("Verifying token (raw): %s", token)
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        logger.debug("Token payload verified: %s", payload)
        email: str = payload.get("sub")
        if email is None:
            logger.warning("Token missing 'sub' claim")
            raise credentials_exception
        return email
    except JWTError as e:
        # provide additional info for debugging expiry/clock issues
        now_ts = int(datetime.now(timezone.utc).timestamp())
        payload_no_verify = None
        token_exp = None
        try:
            payload_no_verify = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM], options={"verify_exp": False})
            token_exp = payload_no_verify.get("exp")
        except Exception:
            payload_no_verify = None
            token_exp = None

        logger.warning("Token verification failed: %s", e)
        logger.warning("Current UTC ts: %s, token exp: %s, token payload (no-verify): %s", now_ts, token_exp, payload_no_verify)
        raise credentials_exception
