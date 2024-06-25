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

    @staticmethod
    def verify_jwt(token: str):
        payload = decode_jwt(token)
        if payload:
            return True
        return False
