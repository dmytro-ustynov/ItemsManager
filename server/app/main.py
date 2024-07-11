from time import time
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from decouple import config

from server.app.dependencies import logger
from server.app.auth.routes import router as auth_router
from server.app.items.routes import router as item_router
from server.app.file_manager.routes import router as file_router

app = FastAPI()

app.include_router(auth_router)
app.include_router(item_router)
app.include_router(file_router)

origin_address = f'http://{config("CLIENT_HOST")}'

origins = [
    # for local development
    "http://localhost",
    "http://localhost:3000",
    origin_address
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def index():
    logger.info('Server running ok')
    return {"server": "Items manager", "version": "1.02", "time": time()}


if __name__ == '__main__':
    uvicorn.run("main:app", host="localhost", port=8000, reload=True)
