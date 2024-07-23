import jwt
from fastapi import Request, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from .jwt_handler import decode_jwt


class JWTBearer(HTTPBearer):
    def __init__(self, auto_error: bool = True):
        super().__init__(auto_error=auto_error)

    async def __call__(self, request: Request):
        credentials: HTTPAuthorizationCredentials = await super().__call__(request)
        if credentials:
            if not credentials.scheme == 'Bearer':
                raise HTTPException(status_code=403, detail='Invalid or expired token')
            return credentials.credentials
        else:
            raise HTTPException(status_code=403, detail='Invalid or expired token')


class JWTBearerWithPayload(JWTBearer):
    async def __call__(self, request: Request):
        token: HTTPAuthorizationCredentials = await super().__call__(request)
        # token = credentials.credentials
        try:
            payload = decode_jwt(str(token))
        except jwt.exceptions.ExpiredSignatureError:
            # print('expired token...')
            raise HTTPException(status_code=401, detail="Expired token provided")
        return payload
