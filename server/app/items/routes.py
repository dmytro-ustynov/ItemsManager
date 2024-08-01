from bson import ObjectId
from bson.errors import InvalidId
from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import FileResponse

from server.app.auth.utils import get_request_id
from server.app.dal.mongo_manager import MongoManagerConnectionError
from server.app.dal.query_builder import QueryBuilder
from server.app.dependencies import MM, do_pagination, logger, SERVICE_TO_NUMBER_MAPPER
from server.app.dependencies import get_filters_from_request, get_active_user, get_root_user, get_payload_request
from server.app.dependencies import get_qr_image_path
from server.app.file_manager.file_manager import FileManager, FileExtension
from server.app.items.item import Item, FieldNames
from server.app.items.schemas import NoteRequest, ItemsRequest, UpdateItemRequest, CreateItemRequest

router = APIRouter(prefix='/items',
                   tags=['ITEMS'])


@router.get("/", dependencies=[Depends(get_active_user)],
            summary="Get all items from db", )
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


@router.get("/{item_id}", dependencies=[Depends(get_active_user)],
            summary="Get item by its id")
async def get_single_item(item_id: str):
    try:
        item = MM.query(Item).get(_id=ObjectId(item_id))
        return {"result": True, "item": item.to_dict(), 'fields': FieldNames.all(name=False)}
    except InvalidId:
        return {'result': False, 'details': 'invalid ID number'}
    except Exception as e:
        logger.error(str(e))
        return {"result": False}


@router.get("/qr_code/{item_id}")
async def generate_qr_code(item_id: str):
    try:
        _ = ObjectId(item_id)
    except InvalidId:
        return {'result': False, 'details': 'invalid ID number'}
    path = get_qr_image_path(item_id)
    if path is not None:
        return FileResponse(path)
    return None


@router.get("/item/{inv_number}", dependencies=[Depends(get_active_user)])
async def get_single_item(inv_number: str):
    item = MM.query(Item).get(**{FieldNames.inventory_number: inv_number})
    if item:
        return {'result': True, 'inv number': inv_number, 'item': item.to_dict()}
    raise HTTPException(status_code=404, detail=f'Item with inventory number {inv_number} not found')


@router.post("/", dependencies=[Depends(get_active_user)])
def filter_items(filters: dict = Depends(get_filters_from_request), ):
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


@router.post("/save_note",
             summary="Add a note for the item with selected ID", )
async def save_note(note_request: NoteRequest, user: dict = Depends(get_active_user)):
    object_id = note_request.object_id
    note = note_request.note
    item = MM.query(Item).get(_id=ObjectId(object_id))
    if item:
        update_result = MM.query(Item).update(filters={FieldNames.ID: item.id},
                                              payload={FieldNames.notes: note})
        if str(update_result.get(FieldNames.ID, "")):
            logger.info(f"User \"{user.get('username')}\" saved notes for item ID: {object_id}")
            return {"result": True, "_id": str(update_result.get(FieldNames.ID, ""))}
        logger.error(f"CAN NOT UPDATE {object_id} | result: {update_result}")
        return {"result": False}
    return {"result": False, "details": "not found"}


@router.post("/export", dependencies=[Depends(get_active_user)],
             summary="Export selected IDS to csv/xls")
async def export(ids_request: ItemsRequest, get_all: bool = False):
    if not get_all:
        ids_list = ids_request.item_ids
        ids = [ObjectId(i) for i in ids_list]
        item_query = MM.query(Item).find(filters=QueryBuilder.in_query(field=FieldNames.ID,
                                                                       entities_list=ids))
    else:
        item_query = MM.query(Item).find({})
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


@router.post("/update", dependencies=[Depends(get_active_user)],
             summary="Add fields to existing item")
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
    update_result = MM.query(Item).update(filters={FieldNames.ID: item.id},
                                          payload=to_update)
    if update_result:
        updated_item.update(to_update)
    return {"result": True, "item": updated_item}


@router.post("/create", dependencies=[Depends(get_active_user)],
             summary="Create new item")
async def create_new_item(item: CreateItemRequest):
    item_id = MM.query(Item).create(item.to_dict())
    if item_id:
        logger.info(f'NEW ITEM CREATED: {str(item_id)} - {item.name}')
        new_item = item.to_dict()
        new_item[FieldNames.ID] = str(item_id)
        return {"result": True, "item": new_item}
    else:
        logger.error("Error creating new item ")
        return {"result": False, "details": "Error creating new item "}


@router.delete("/{item_id}", dependencies=[Depends(get_root_user)],
               summary="Delete element by its ID from database, only for the root user")
async def delete_item(item_id: str):
    item = MM.query(Item).get(_id=ObjectId(item_id))
    if not item:
        return {'result': False, 'details': 'item not found'}
    try:
        result = MM.query(Item).delete(_id=ObjectId(item_id))
        logger.info(f"Root user deleted item: \"{item.to_dict()}\"")
        return {"result": True, 'deleted_count': result.deleted_count}
    except InvalidId:
        return {'result': False, 'details': 'invalid ID number'}
    except Exception as e:
        logger.error(str(e))
        raise HTTPException(status_code=432)


@router.put("/{item_id}", dependencies=[Depends(get_root_user)],
            summary="Completely update item by given ID, replacing existing with new payload")
async def replace_item(item_id: str, payload: dict = Depends(get_payload_request)):
    if not payload:
        return {"result": False, "details": "empty payload"}
    try:
        item = MM.query(Item).get(_id=ObjectId(item_id))
        if not item:
            return {"result": False, "details": "Item not found"}
        for key in ('created_at', 'updated_at', 'inventory', 'service_number'):
            if key in payload:
                payload.pop(key)
        if FieldNames.service in payload:
            payload['service_number'] = SERVICE_TO_NUMBER_MAPPER.get(payload.get(FieldNames.service), 0)
        update_result = MM.query(Item).replace_one(filters={FieldNames.ID: ObjectId(item_id)},
                                                   payload=payload)
        if update_result is not None:
            updated = {**item.to_dict(), **payload}
            logger.info(f"Root user has updated item, ID: {item_id}")
            return {'result': True, 'updated': updated}
        return {'result': False, 'details': update_result}
    except InvalidId:
        return {'result': False, 'details': 'invalid ID number'}
    except Exception as e:
        logger.error(str(e))
        return {'result': False, 'details': str(e)}
