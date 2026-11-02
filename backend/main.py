
import asyncio
import json

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sse_starlette.sse import EventSourceResponse

app = FastAPI()

# Разрешаем React подключаться к серверу
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_methods=["GET"],
    allow_headers=["*"],
)


@app.get("/progress")
async def progress():
    async def generate_events():
        for value in [20, 40, 60, 80, 100]:
            await asyncio.sleep(1)

            yield {
                "event": "progress",
                "data": json.dumps({"progress": value}),
            }

        yield {
            "event": "complete",
            "data": json.dumps({"message": "Задача завершена"}),
        }

    return EventSourceResponse(generate_events())
