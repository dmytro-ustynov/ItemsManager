from fastapi import APIRouter, Response, Request, Depends

from .jwt_bearer import JWTBearer
from .jwt_handler import sign_jwt
from .jwt_handler import decode_jwt
from .user import User
from .user import UserSchema
from .user import UserLoginSchema
from ..dependencies import MM, logger

router = APIRouter(prefix='',
                   tags=['user'])


@router.post("/user/signup")
def user_signup(user: UserSchema):
    if MM.query(User).get(username=user.username) is not None:
        return {'result': False,
                'details': 'email already registered'}
    mongo_user = User.create_user_dict(user)
    if MM.query(User).create(mongo_user):
        res = sign_jwt(mongo_user['user_id'])
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
        'role': 'registered'  # required field to handle frontEnd logic
    }
    result = {**sign_jwt(mongo_user.user_id),
              **sign_jwt(mongo_user.user_id, seconds=3000, token_key='refresh_token'),
              'result': True,
              'user': user}  # dict
    response.set_cookie(key='refresh_token', value=result.get('refresh_token', ''))
    return result


@router.post('/auth/refresh_token')
def refresh_token(request: Request, response: Response):
    """
    Endpoint to silently refresh tokens
    :param request:
    :param response:Mi
    :return:
    """
    token = request.cookies.get('refresh_token')
    if not token:
        return {'result': False}
    decoded = decode_jwt(token)
    if decoded is None:
        return {'result': False}
    user_id = decoded.get('user_id')
    mongo_user = MM.query(User).get(user_id=user_id)
    if not mongo_user:
        return {'result': False}
    result = {**sign_jwt(mongo_user.user_id),
              **sign_jwt(mongo_user.user_id, seconds=3000, token_key='refresh_token'),
              'result': True}  # dict
    response.set_cookie(key='refresh_token', value=result.get('refresh_token', ''))
    return result


@router.post("/auth/logout")
async def logout(response: Response):
    response.set_cookie(key='refresh_token', value='')
    # unset_jwt_cookies(response)
    return {"msg": "logout OK"}


@router.post("/user/approve_user/", dependencies=[Depends(JWTBearer(auto_error=False))])
async def approve_user(user_id: str, token: str, response: Response):
    root_user = MM.query(User).get(username='root')
    if not root_user.check_password(token):
        return {'result': False, 'details': 'can not validate root credentials'}
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
