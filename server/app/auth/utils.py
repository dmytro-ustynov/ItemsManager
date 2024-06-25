import uuid

from fastapi import Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordBearer
from server.app.auth.jwt_handler import decode_jwt


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="users/user/login")


async def get_current_user_id(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    payload = decode_jwt(token)
    user_id: str = payload.get("user_id")
    if user_id is None:
        raise credentials_exception
    return user_id


class RequestGetter:
    def __init__(self):
        pass

    def __call__(self, request: Request):
        if request.headers.get('X-Request-ID'):
            return request.headers.get('X-Request-ID')
        else:
            rid = str(uuid.uuid4())
            request.headers.raw.append((bytes('X-Request-ID'.encode()), bytes(rid.encode())))
            return rid


async def get_request_id(request: Request):
    if request.headers.get('X-Request-ID'):
        return request.headers.get('X-Request-ID')
    else:
        rid = str(uuid.uuid4())
        request.headers.raw.append((bytes('X-Request-ID'.encode()), bytes(rid.encode())))
        return rid
