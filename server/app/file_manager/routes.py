import datetime
import aiofiles
from bson import ObjectId
from bson.errors import InvalidId
from fastapi import APIRouter, Depends
from fastapi import UploadFile
from fastapi.responses import FileResponse
from server.app.dependencies import logger, MM, get_active_user, get_root_user, get_qr_image_path
from server.app.file_manager.file_manager import FileManager
from server.app.items.item import FieldNames,  Item
from server.generate_static import read_config

router = APIRouter(prefix='/files',
                   tags=['FILES'])


@router.post('/validate_xls')
async def validate_xls(file: UploadFile):
    if file.content_type not in FileManager.XLS_CONTENT_TYPES:
        return {'result': False, 'details': f'file not accepted: {file.content_type}'}
    file_path = FileManager.generate_filepath(file.filename.split('.')[-1])
    async with aiofiles.open(file_path, 'wb') as out_file:
        content = file.file.read()  # async read
        await out_file.write(content)
    try:
        result, titles, total_rows = FileManager.validate_input_xls(path=file_path)
        return {'result': result, 'titles': titles, 'total_rows': total_rows}
    except Exception as e:
        logger.error(str(e))
        return False


@router.post('/bulk_upload', dependencies=[Depends(get_active_user)])
async def validate_xls(file: UploadFile):
    if file.content_type not in FileManager.XLS_CONTENT_TYPES:
        return {'result': False, 'details': f'file not accepted: {file.content_type}'}
    file_path = FileManager.generate_filepath(file.filename.split('.')[-1])
    async with aiofiles.open(file_path, 'wb') as out_file:
        content = file.file.read()  # async read
        await out_file.write(content)
    try:
        data = FileManager.get_data_from_xls(file_path)
        count = 0
        for item in data:
            new_item = MM.query(Item).create(item)
            if new_item:
                logger.info(f'NEW ITEM CREATED: {str(new_item)} - {item[FieldNames.name]}')
                count +=1
            else:
                logger.error('cant create new item')
        return {'result': True if data else False, 'total_items_load': len(data), 'total_items_created': count}
    except Exception as e:
        logger.error(str(e))
        return False


@router.get('/count', summary="Get count of xls temporary files in a data folder",
            dependencies=[Depends(get_root_user)])
async def get_files_count():
    try:
        result, count = FileManager.count_data_files()
        if result:
            return {'result': result, 'count': count}
        return {'result': False}
    except Exception as e:
        logger.error(str(e))
        return {'result': False}


@router.put('/clear_yesterday_files',
            summary="delete xls files from data folder",
            dependencies=[Depends(get_root_user)])
async def clear_yesterday_files():
    try:
        result, count = FileManager.clear_data_folder()
        if result:
            msg = f'ROOT USER HAS CLEARED data folder; {count} files were deleted'
        else:
            msg = count
        logger.info(msg)
        return {'result': result, 'details': msg}
    except Exception as e:
        logger.error(str(e))
        return {'result': False}


@router.get('/download_tag/{item_id}', dependencies=[Depends(get_active_user)])
async def download_item_tag_file(item_id: str):
    cfg = read_config('config.yaml')
    try:
        item = MM.query(Item).get(_id=ObjectId(item_id))
        item = item.to_dict()
        today = datetime.datetime.now()
        year = item.get(FieldNames.year) or item.get('year') or today.year
        qr = get_qr_image_path(item_id)
        context = {'name': item[FieldNames.name],
                   'inventory': item.get(FieldNames.inventory_number, ''),
                   'department': cfg.get('department_code', ''),
                   'year': year,
                   'qr': qr}
        path = FileManager.generate_tag_file(context)
        headers = {'Content-Disposition': f'attachment; filename="Tagfile.docx"'}
        logger.info(f'Tag file created : {path}')
        return FileResponse(path, headers=headers)
    except InvalidId:
        return {'result': False, 'details': 'invalid ID number'}
    except Exception as e:
        logger.error(str(e))
        return {'result': False, 'details': 'error generating tagfile'}
