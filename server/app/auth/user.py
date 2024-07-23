import bcrypt
import uuid
from pydantic import BaseModel, Field


# Pydantic Schemas
class UserSchema(BaseModel):
    username: str = Field(default=None)
    password: str = Field(default=None)

    class Config:
        json_schema_extra = {
            'example': {
                'username': 'John Doe',
                'password': 'password',
            }
        }


class UserLoginSchema(UserSchema):
    class Config:
        json_schema_extra = {
            'example': {
                'username': 'admin',
                'password': '12345',
            }
        }


class ChangePasswordSchema(BaseModel):
    old_password: str = Field(default=None)
    new_password: str = Field(..., min_length=5)
    confirm_password: str = Field(..., min_length=5)


# Mongo models
class User:
    __collection__ = 'USERS'
    __slots__ = ('user_id', 'username', 'password', 'is_active', 'created_at', 'updated_at')

    def __init__(self, user_id=None, username=None, password=None, is_active=None, **kwargs):
        self.user_id = user_id
        self.username = username
        self.password = password
        self.is_active = is_active
        self.created_at = kwargs.get('created_at')
        self.updated_at = kwargs.get('updated_at')

    def check_password(self, password) -> bool:
        """
        Checks if the password for the user is acceptable
        :param password:
        :return: True if password was accepted
        """
        if not isinstance(password, bytes):
            password = password.encode('utf-8')
        return bcrypt.checkpw(password, self.password)

    @property
    def disabled(self):
        return not self.is_active

    @staticmethod
    def create_password(password_string: str):
        """
        Creates a hashed password ready to save in the DB
        :param password_string: password in string format
        :return:
        """
        return bcrypt.hashpw(password_string.encode(), bcrypt.gensalt())

    @classmethod
    def create_user_dict(cls, user: UserSchema):
        password = cls.create_password(user.password)
        uid = str(uuid.uuid4())
        is_active = True if user.username in ('admin', 'root') else False
        return dict(user_id=uid,
                    username=user.username,
                    password=password,
                    is_active=is_active)

    def to_dict(self):
        return dict(username=self.username,
                    user_id=str(self.user_id),
                    is_active=self.is_active,
                    created_at=self.created_at,
                    updated_at=self.updated_at)
