import logging
import os
from uuid import UUID

import yaml
from enum import Enum
from logging.config import dictConfig
from pydantic import BaseModel, Field
from server.app.dal.mongo_manager import MongoManager
from server.app.items.item import FieldNames, SERVICES

LOG_YAML = os.path.join(os.getcwd(), 'logger_config.yaml')

with open(LOG_YAML, 'r') as cfg:
    logger_config = yaml.safe_load(cfg).get('logging')
dictConfig(logger_config)

logger = logging.getLogger('server')

MM = MongoManager()


class Service(str, Enum):
    SZ = "СЗ"
    VNLZ = "ВНЛЗ"


class NoteRequest(BaseModel):
    object_id: str
    note: str


class ItemsRequest(BaseModel):
    item_ids: list[str]


class NewFieldObject(BaseModel):
    newFieldName: str
    newFieldValue: str


class UpdateItemRequest(BaseModel):
    item_id: str
    payload: NewFieldObject


class CreateItemRequest(BaseModel):
    name: str = Field(..., min_length=5)
    inventory_number: str = Field(..., min_length=5)
    service: Service
    year: str = None
    serial: str = None
    payload: dict = None

    class Config:
        schema_extra = {
            'example': {
                'name': 'щось новеньке',
                'service': 'ВНЛЗ',
                'inventory_number': "123456"
            }
        }

    def get_service(self):
        mapper = {
            Service.SZ: SERVICES.sz,
            Service.VNLZ: SERVICES.vnlz
        }
        return mapper.get(self.service)

    def to_dict(self):
        result = {FieldNames.name: self.name,
                  FieldNames.inventory_number: self.inventory_number,
                  FieldNames.service: self.get_service(),
                  }
        if self.year:
            result[FieldNames.year] = self.year
        if self.serial:
            result[FieldNames.serial] = self.serial
        if self.payload:
            result = {**self.payload, **result}
        return result

    def validate_name(self):
        if not self.name:
            raise ValueError('name must not be empty')
        if self.name == 'string':
            raise ValueError('not valid name')


def get_item_list_from_request(body: dict):
    return body.get("item_ids", [])


def get_filters_from_request(body: dict):
    valid_fields = ("search_string", "older_than", "younger_than", "service", "category")
    return {k: v for k, v in body.items() if k in valid_fields}


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
