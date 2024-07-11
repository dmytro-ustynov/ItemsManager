import logging
import os
import yaml
from logging.config import dictConfig
from server.app.dal.mongo_manager import MongoManager

LOG_YAML = os.path.join(os.getcwd(), 'logger_config.yaml')

CONFIG_YAML = os.path.join(os.getcwd(), 'config.yaml')

with open(LOG_YAML, 'r') as cfg:
    logger_config = yaml.safe_load(cfg).get('logging')
dictConfig(logger_config)

logger = logging.getLogger('server')

MM = MongoManager()

with open(CONFIG_YAML, 'r') as yml:
    app_config = yaml.safe_load(yml)

# class Service(str, Enum):
#     SZ = "СЗ"
#     VNLZ = "ВНЛЗ"

SERVICES_ = app_config.get('services')
#    {1: "СЗ", 2: "ВНЛЗ", ... }

SERVICE_TO_NUMBER_MAPPER = {v: k for k, v in SERVICES_.items()}
#     {"СЗ": 1, ... }


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
