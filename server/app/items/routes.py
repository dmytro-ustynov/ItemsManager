from bson import ObjectId
from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import FileResponse

from server.app.auth.jwt_bearer import JWTBearer
from server.app.auth.user import User
from server.app.auth.utils import get_request_id
from server.app.dal.mongo_manager import MongoManagerConnectionError
from server.app.dal.query_builder import QueryBuilder
from server.app.dependencies import MM, do_pagination, logger, get_filters_from_request
from server.app.file_manager.file_manager import FileManager, FileExtension
from server.app.items.item import Item, FieldNames
from server.app.items.schemas import NoteRequest, ItemsRequest, UpdateItemRequest, CreateItemRequest

router = APIRouter(prefix='/items',
                   tags=['ITEMS'],
                   dependencies=[Depends(JWTBearer(auto_error=False))])


@router.get("/", summary="Get all items from db")
async def get_items(search_string: str = None, skip: int = None, limit: int = None,
                    request_id: str = Depends(get_request_id)):
    filters = {}
    total_count = None
    logger.info(f'REQUEST_ID: {request_id} - getting items')
    if search_string is not None:
        filters = QueryBuilder.like_query(search_string=search_string) or {}
    if skip is not None and limit is not None:
        total_count = MM.query(Item).count(filters)
        filters['skip'] = skip
        filters['limit'] = limit
    items_query = MM.query(Item).find(filters)
    try:
        items = [i.to_dict() for i in items_query]
        result = {"total": len(items), "items": items}
        if skip is not None and limit is not None:
            do_pagination(result, skip, limit, total_count)
        result['fields'] = FieldNames.all(name=False)
        return result
    except MongoManagerConnectionError as e:
        logger.error(f'REQUEST_ID: {request_id} - {str(e)}')
        raise HTTPException(status_code=432, detail=str(e))
    except Exception as e:
        logger.error(f'REQUEST_ID: {request_id} - {str(e)}')
        return {"result": False}


@router.get("/item/{inv_number}")
async def get_single_item(inv_number: str):
    item = MM.query(Item).get(**{FieldNames.inventory_number: inv_number})
    if item:
        return {'result': True, 'inv number': inv_number, 'item': item.to_dict()}
    raise HTTPException(status_code=404, detail=f'Item with inventory number {inv_number} not found')


@router.post("/", )
def filter_items(filters: dict = Depends(get_filters_from_request)):
    search_string = filters.get('search_string')
    older_than = filters.get('older_than')
    younger_than = filters.get('younger_than')
    service = filters.get('service')
    category = filters.get('category')
    query = dict()
    if search_string is not None:
        query.update(QueryBuilder.like_query(search_string))
    if older_than is not None or younger_than is not None:
        if older_than:
            query.update(QueryBuilder.older_than_query(older_than))
        if younger_than:
            query.update(QueryBuilder.younger_than_query(younger_than))
    if service:
        query.update({FieldNames.service: service})
    if category:
        query.update(QueryBuilder.category_query(category))
    items_query = MM.query(Item).find(query)
    try:
        items = [i.to_dict() for i in items_query]
        return {"total": len(items), "items": items}
    except MongoManagerConnectionError as e:
        raise HTTPException(status_code=432, detail=str(e))


@router.post("/save_note", summary="Add a note for the item with selected ID")
async def save_note(note_request: NoteRequest):
    object_id = note_request.object_id
    note = note_request.note
    item = MM.query(Item).get(_id=ObjectId(object_id))
    if item:
        update_result = MM.query(Item).update(filters={FieldNames.ID: item._id},
                                              payload={FieldNames.notes: note})
        if str(update_result.get(FieldNames.ID, "")):
            return {"result": True, "_id": str(update_result.get(FieldNames.ID, ""))}
        logger.error(f"CAN NOT UPDATE {object_id} | result: {update_result}")
        return {"result": False}
    return {"result": False, "details": "not found"}


@router.post("/export", summary="Export selected IDS to csv/xls")
async def export(ids_request: ItemsRequest):
    ids_list = ids_request.item_ids
    ids = [ObjectId(i) for i in ids_list]
    item_query = MM.query(Item).find(filters=QueryBuilder.in_query(field=FieldNames.ID,
                                                                   entities_list=ids))
    items = [i.to_dict() for i in item_query]
    if not items:
        return {"result": False, "details": f"No item found by this ids: {str(ids_list)}"}

    try:
        result, path = FileManager.create_file(items=items, extension=FileExtension.xls)
        if result:
            headers = {'Content-Disposition': 'attachment; filename="Items_export.xls"'}
            logger.info(f'File saved: {path}')
            return FileResponse(path, headers=headers)
        else:
            return {"result": False, "details": "error"}
    except Exception as e:
        logger.error(str(e))
        return {"result": False, "details": str(e)}


@router.post("/update", summary="Add fields to existing item")
async def update_item(update_request: UpdateItemRequest):
    item_id = update_request.item_id
    item = MM.query(Item).get(_id=ObjectId(item_id))

    if not item:
        return {"result": False, "details": "Item not found"}
    to_update = {}
    payload = update_request.payload
    updated_item = item.to_dict()
    field_name = payload.newFieldName
    if field_name not in updated_item:
        to_update = {field_name: payload.newFieldValue}
    if not to_update:
        return {"result": False, "details": "Overwriting of the existing fields is forbidden"}
    update_result = MM.query(Item).update(filters={FieldNames.ID: item._id},
                                          payload=to_update)
    if update_result:
        updated_item.update(to_update)
    return {"result": True, "item": updated_item}


@router.post("/create", summary="Create new item")
async def create_new_item(item: CreateItemRequest):
    new_item = MM.query(Item).create(item.to_dict())
    if new_item:
        logger.info(f'NEW ITEM CREATED: {str(new_item)} - {item.name}')
        return {"result": True, "item": str(new_item)}
    else:
        logger.error("Error creating new item ")
        return {"result": False, "details": "Error creating new item "}


@router.delete("/{item_id}", summary="delete element by its id from database, use root token to delete")
async def delete_item(item_id: str, token: str):
    root_user = MM.query(User).get(username='root')
    if not root_user or not root_user.check_password(token):
        return {'result': False, 'details': 'can not validate root credentials'}
    try:
        result = MM.query(Item).delete(_id=ObjectId(item_id))
        return {'deleted_count': result.deleted_count}
    except Exception as e:
        logger.error(str(e))
        raise HTTPException(status_code=432)
