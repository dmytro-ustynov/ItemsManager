from time import time
import jwt
from decouple import config

JWT_SECRET = config('JWT_SECRET')
JWT_ALGORITHM = config('JWT_ALGORITHM', 'HS256')  # HS256
ACCESS_TOKEN_TIME = config('ACCESS_TOKEN_TIME', 600, cast=int)
REFRESH_TOKEN_TIME = config('REFRESH_TOKEN_TIME', 7200, cast=int)


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


def sign_jwt(user: dict, mode='access'):
    if mode not in ('access', 'refresh'):
        mode = 'access'
    modes = {'access': {"key": "access_token",
                        "seconds": ACCESS_TOKEN_TIME},
             'refresh': {"key": "refresh_token",
                         "seconds": REFRESH_TOKEN_TIME}}
    return _sign_jwt(user, seconds=modes[mode]['seconds'],
                     token_key=modes[mode]['key'])


def _sign_jwt(user: dict, seconds: int = ACCESS_TOKEN_TIME, token_key: str = "access_token"):
    exp = time() + seconds
    payload = {
        "user_id": user.get('user_id'),
        "username": user.get('username', 'anonymous'),
        "is_active": user.get('is_active', False),
        "role": user.get('role', 'registered'),
        "expiry": exp
    }
    token = jwt.encode(payload, JWT_SECRET, JWT_ALGORITHM)
    return token


def decode_jwt(token: str):
    try:
        decoded = jwt.decode(token, JWT_SECRET, JWT_ALGORITHM)
    except Exception as e:
        return {}
    if decoded["expiry"] < time():
        raise jwt.exceptions.ExpiredSignatureError
    return decoded
