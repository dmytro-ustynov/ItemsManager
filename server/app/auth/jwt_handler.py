from time import time
import jwt
from decouple import config

JWT_SECRET = config('JWT_SECRET')
JWT_ALGORITHM = config('JWT_ALGORITHM', 'HS256')       # HS256


def token_response(token: str, token_key: str = "access_token"):
    """
    Returns the dict with access_token encoded
    :param token: token string itself
    :param token_key: token key : "access_token" or "refresh_token"
    :return: dict
    """
    return {
        token_key: token
    }


def sign_jwt(user: dict, seconds: int = 600,  token_key: str = "access_token"):
    exp = time() + seconds
    # if token_key == 'refresh_token':
    #     print(f' ==== REFRESH set to: {exp}')
    payload = {
        "user_id": user.get('user_id'),
        "username": user.get('username', 'anonymous'),
        "is_active": user.get('is_active', False),
        "role": user.get('role', 'registered'),
        "expiry": exp
    }
    token = jwt.encode(payload, JWT_SECRET, JWT_ALGORITHM)
    return token_response(token, token_key)


def decode_jwt(token: str):
    try:
        decoded = jwt.decode(token, JWT_SECRET, JWT_ALGORITHM)
    except Exception:
        return {}
    if decoded["expiry"] < time():
        raise jwt.exceptions.ExpiredSignatureError
    return decoded
