import jwt
from fastapi import APIRouter, Response, Request, Depends, HTTPException

from .jwt_handler import sign_jwt, decode_jwt
from .user import User, UserSchema, UserLoginSchema, ChangePasswordSchema
from ..dependencies import MM, logger, get_root_user, get_active_user

router = APIRouter(prefix='',
                   tags=['user'])


@router.post("/user/signup")
def user_signup(user: UserSchema):
    if MM.query(User).get(username=user.username) is not None:
        return {'result': False,
                'details': 'User already registered'}
    mongo_user = User.create_user_dict(user)
    if MM.query(User).create(mongo_user):
        user = dict(username=mongo_user['username'],
                    user_id=mongo_user['user_id'],
                    is_active=mongo_user['is_active'])
        result = {"result": True, "user": user, "access_token": sign_jwt(user)}
        return result
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
    a_token = sign_jwt(user)
    r_token = sign_jwt(user, mode='refresh')
    result = {'access_token': a_token,
              'result': True,
              'user': user}  # dict
    response.set_cookie(key='refresh_token', value=r_token, httponly=True)
    # samesite='none', secure=True) # this for https
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
        return {'result': False, 'details': "unable to decode token"}
    user_id = payload.get('user_id')
    mongo_user = MM.query(User).get(user_id=user_id)
    if not mongo_user:
        return {'result': False}
    user = dict(username=mongo_user.username,
                user_id=mongo_user.user_id,
                is_active=mongo_user.is_active)
    a_token = sign_jwt(user)
    r_token = sign_jwt(user, mode='refresh')
    result = {'access_token': a_token,
              'result': True,
              'user': user}  # dict
    response.set_cookie(key='refresh_token', value=r_token, httponly=True)
    # samesite='none')
    return result


@router.post("/auth/logout")
async def logout(response: Response):
    response.set_cookie(key='refresh_token', value='', httponly=True)
    return {"msg": "logout OK"}


@router.get("/user/all", dependencies=[Depends(get_root_user)],
            summary="Get the list of all users, only for root user")
async def get_all_users():
    unactivated_users = MM.query(User).find({})
    return {"users": [u.to_dict() for u in unactivated_users]}


@router.post("/user/activate_user", dependencies=[Depends(get_root_user)],
             summary="Approve user by id, only for root user")
async def activate_user(user_id: str):
    try:
        mongo_user = MM.query(User).get(user_id=user_id)
        if not mongo_user:
            return {'result': False, 'details': 'user doesn`t exist'}
        update_result = MM.query(User).update(filters={'user_id': user_id},
                                              payload={'is_active': True})
        if str(update_result.get("_id", "")):
            mongo_user.is_active = True
            logger.info(f'Root user has activated user ID: {user_id}, NAME: {mongo_user.username}')
            return {"result": True, "user": mongo_user.to_dict()}
    except Exception as e:
        logger.error(str(e))
        return False


@router.post("/user/deactivate_user", dependencies=[Depends(get_root_user)],
             summary="Deactivate existing user, only for root user")
async def deactivate_user(user_id: str):
    try:
        mongo_user = MM.query(User).get(user_id=user_id)
        if not mongo_user:
            return {'result': False, 'details': 'user doesn`t exist'}
        if mongo_user.username == 'root':
            return {'result': False, 'details': 'can not deactivate root user'}
        update_result = MM.query(User).update(filters={'user_id': user_id},
                                              payload={'is_active': False})
        if str(update_result.get("_id", "")):
            logger.info(f'Root user has deactivated user ID: {user_id}, NAME: {mongo_user.username}')
            return {"result": True, "user_id": user_id, "is_active": False}
    except Exception as e:
        logger.error(str(e))
        return False


@router.post("/user/set_password", summary="Set user's new password by user itself or by root user")
async def set_user_password(passwords: ChangePasswordSchema, user: dict = Depends(get_active_user),
                            user_id: str = None):
    user_id = user_id or user['user_id']
    mongo_user = MM.query(User).get(user_id=user_id)
    if not mongo_user:
        return {'result': False, 'details': 'User not found'}
    if user['username'] != 'root':
        if user['user_id'] != user_id:
            raise HTTPException(status_code=403, detail='For root user only')
        # root user does not need confirmation
        if not mongo_user.check_password(passwords.old_password):
            return {'result': False, 'details': 'Wrong password'}
        if passwords.new_password != passwords.confirm_password:
            return {'result': False, 'details': 'Passwords dont match'}
    update_result = MM.query(User).update(filters={'user_id': user_id},
                                          payload={'password': User.create_password(passwords.new_password)})
    if str(update_result.get("_id", "")):
        logger.info(f'Password changed ID: {user_id}, NAME: {mongo_user.username}')
        return {'result': True, 'details': 'Password successfully changed'}
    return False


@router.delete('/user/{user_id}', dependencies=[Depends(get_root_user)],
               summary="Delete user by user_id, for root user only")
async def delete_user(user_id: str):
    try:
        result = MM.query(User).delete(user_id=user_id)
        logger.info(f'ROOT  deleted user {user_id}')
        return {"result": True, 'deleted_count': result.deleted_count}
    except Exception as e:
        logger.error(str(e))
        raise HTTPException(status_code=432)
