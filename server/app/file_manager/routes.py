# from bson import ObjectId
import aiofiles
from fastapi import APIRouter, HTTPException, Depends
from fastapi import UploadFile

from server.app.auth.jwt_bearer import JWTBearer
from server.app.auth.user import User
from server.app.dependencies import logger, MM
from server.app.file_manager.file_manager import FileManager, FileExtension
from server.app.items.item import FieldNames, SERVICES, Item

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


@router.post('/bulk_upload')
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


@router.put('/clear_yesterday_files',
            summary="delete xls files from data folder",
            dependencies=[Depends(JWTBearer(auto_error=False))])
async def clear_yesterday_files(token: str):
    root_user = MM.query(User).get(username='root')
    if not root_user or not root_user.check_password(token):
        return {'result': False, 'details': 'can not validate root credentials'}
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
