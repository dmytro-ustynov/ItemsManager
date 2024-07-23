import uuid
from fastapi import Request


async def get_request_id(request: Request):
    if request.headers.get('X-Request-ID'):
        return request.headers.get('X-Request-ID')
    else:
        rid = str(uuid.uuid4())
        request.headers.raw.append((bytes('X-Request-ID'.encode()), bytes(rid.encode())))
        return rid
