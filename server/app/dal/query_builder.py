# from models.item import FieldNames
from server.app.items.item import FieldNames


class QueryBuilder:

    @staticmethod
    def like_query(search_string):
        if search_string.isdigit():
            field = FieldNames.inventory_number
        else:
            field = FieldNames.name
        return {field: {"$regex": search_string, "$options": "i"}}

    @staticmethod
    def in_query(field, entities_list):
        return {field: {"$in": entities_list}}

    @staticmethod
    def older_than_query(year):
        if year:
            return {FieldNames.year: {"$lte": str(year), "$ne": ""}}
        return {}

    @staticmethod
    def younger_than_query(year):
        if year:
            return {FieldNames.year: {"$gte": str(year)}}
        return {}

    @staticmethod
    def get_by_inv_number(number):
        return {FieldNames.inventory_number: number}

    @staticmethod
    def category_query(category):
        if isinstance(category, str):
            return {'category': category}
        elif isinstance(category, list):
            return {'category': {'$in': category}}
