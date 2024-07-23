import jwt
from fastapi import APIRouter, Response, Request, Depends

from .jwt_handler import sign_jwt, decode_jwt
from .user import User, UserSchema, UserLoginSchema
from ..dependencies import MM, logger, get_root_user

router = APIRouter(prefix='',
                   tags=['user'])


@router.post("/user/signup")
def user_signup(user: UserSchema):
    if MM.query(User).get(username=user.username) is not None:
        return {'result': False,
                'details': 'email already registered'}
    mongo_user = User.create_user_dict(user)
    if MM.query(User).create(mongo_user):
        user = dict(username=mongo_user['username'],
                    user_id=mongo_user['user_id'],
                    is_active=mongo_user['is_active'])
        res = sign_jwt(user)
        res['result'] = True
        return res
    else:
        return {'result': False}


@router.post("/auth/login")
def user_login(login: UserLoginSchema, response: Response):
    username = login.username
    password = login.password
    mongo_user = MM.query(User).get(username=username)
    if not mongo_user or not mongo_user.check_password(password):
        return {'result': False, 'details': 'not valid user or password'}
    user = {
        'username': mongo_user.username,
        'user_id': mongo_user.user_id,
        'is_active': mongo_user.is_active,
        'role': 'registered'  # required field to handle frontEnd logic
    }
    r_token = sign_jwt(user, seconds=7200, token_key='refresh_token')
    result = {**sign_jwt(user),
              **r_token,
              'result': True,
              'user': user}  # dict
    response.set_cookie(key='refresh_token', value=r_token, httponly=True, samesite='none')
    return result


@router.get('/auth/refresh_token')
def refresh_token(request: Request, response: Response):
    """
    Endpoint to silently refresh tokens
    :param request:
    :param response:
    :return:
    """
    token = request.cookies.get('refresh_token')
    if not token:
        return {'result': False, 'details': 'No refresh token found'}
    try:
        payload = decode_jwt(token)
    except jwt.exceptions.ExpiredSignatureError:
        return {'result': False, 'details': 'Refresh token is expired'}
    if not payload:
        return {'result': False}
    user_id = payload.get('user_id')
    mongo_user = MM.query(User).get(user_id=user_id)
    if not mongo_user:
        return {'result': False}
    user = dict(username=mongo_user.username,
                user_id=mongo_user.user_id,
                is_active=mongo_user.is_active)
    r_token = sign_jwt(user, seconds=7200, token_key='refresh_token')
    result = {**sign_jwt(user),
              **r_token,
              'result': True}  # dict
    response.set_cookie(key='refresh_token', value=r_token, httponly=True, samesite='none')
    return result


@router.post("/auth/logout")
async def logout(response: Response):
    response.set_cookie(key='refresh_token', value='')
    # unset_jwt_cookies(response)
    return {"msg": "logout OK"}


@router.get("/user/unactivated_users/", dependencies=[Depends(get_root_user)],
            summary="Get the list of unactivated users, only for root user")
async def get_unactivated_users():
    unactivated_users = MM.query(User).get(is_active=False)
    return {"users": unactivated_users}


@router.post("/user/approve_user/", dependencies=[Depends(get_root_user)],
             summary="Approve user by id, only for root user")
async def approve_user(user_id: str):
    try:
        mongo_user = MM.query(User).get(user_id=user_id)
        if not mongo_user:
            return {'result': False, 'details': 'user doesn`t exist'}
        update_result = MM.query(User).update(filters={'user_id': user_id},
                                              payload={'is_active': True})
        if str(update_result.get("_id", "")):
            logger.info(f'Root user has activated user by id: {user_id}')
            return {"result": True, "user_id": user_id, "is_active": True}
    except Exception as e:
        logger.error(str(e))
        return False
