import json
import logging
import os
from decouple import config
from logging.config import dictConfig
from fastapi import Depends, HTTPException

from server.app.auth.jwt_bearer import JWTBearerWithPayload
from server.app.dal.mongo_manager import MongoManager
from server.app.qr_code_generator.qr_generator import QRCodeGenerator
from server.app.utils.utils import read_config

LOG_YAML = os.path.join(os.getcwd(), 'logger_config.yaml')

CONFIG_YAML = os.path.join(os.getcwd(), 'config.yaml')

app_config = read_config(CONFIG_YAML)
logger_config = read_config(LOG_YAML).get('logging')
dictConfig(logger_config)

logger = logging.getLogger('server')

MM = MongoManager()

if not MM.connected:
    logger.error('MongoManager not connected')


SERVICE_TO_NUMBER_MAPPER = dict()
for i, s in enumerate(app_config.get('services')):
    for key in s.keys():
        SERVICE_TO_NUMBER_MAPPER[key] = i + 1
#     {"СЗ": 1, ... }


async def get_current_user(payload: dict = Depends(JWTBearerWithPayload(auto_error=False))):
    if 'username' not in payload or 'is_active' not in payload:
        raise HTTPException(status_code=403, detail='Invalid token payload')
    return payload


async def get_active_user(current_user: dict = Depends(get_current_user)):
    if not current_user['is_active']:
        raise HTTPException(status_code=403, detail='User is not active')
    return current_user


async def get_root_user(current_user: dict = Depends(get_current_user)):
    if current_user['username'] != 'root':
        raise HTTPException(status_code=403, detail='For root user only ')
    return current_user


def get_filters_from_request(body: dict):
    valid_fields = ("search_string", "older_than", "younger_than", "service", "category")
    return {k: v for k, v in body.items() if k in valid_fields}


def get_payload_request(body: dict):
    upd = body.get('update')
    if isinstance(upd, str):
        upd = json.loads(upd)
    return upd


def do_pagination(result: dict, skip: int, limit: int, total_count: int):
    """
    Modifies input dictionary by adding key 'pagination'
    :param result: input dict
    :param skip: skip
    :param limit: limit param
    :param total_count: total count of the
    :return: none, but dictionary was updated
    """
    result['pagination'] = {'skip': skip,
                            'limit': limit,
                            'total': total_count,
                            'has_next_step': total_count > skip + limit,
                            'has_previous_step': skip > 0}


def get_item_link(item_id):
    return f'http://{config("CLIENT_HOST")}/item?item_id={item_id}'


def get_qr_image_path(item_id):
    path = os.path.join('data', 'qr', f'{item_id}.png')
    if os.path.isfile(path):
        return path
    try:
        link = get_item_link(item_id)
        qr = QRCodeGenerator(link, logo='logo_2.jpg')
        img = qr.get_image()
        img.save(path)
        return path
    except Exception as e:
        logger.error(str(e))
        return None
