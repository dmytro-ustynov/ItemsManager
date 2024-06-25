import time
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


def sign_jwt(user_id: str, seconds: int = 600,  token_key: str = "access_token"):
    payload = {
        "user_id": user_id,
        "expiry": time.time() + seconds
    }
    token = jwt.encode(payload, JWT_SECRET, JWT_ALGORITHM)
    return token_response(token, token_key)


def decode_jwt(token: str):
    try:
        decoded = jwt.decode(token, JWT_SECRET, JWT_ALGORITHM)
        return decoded if decoded["expiry"] >= time.time() else {}
    except jwt.exceptions.ExpiredSignatureError:
        return {}
    except Exception as e:
        return {}
