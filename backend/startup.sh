#!/bin/bash

pip install -r requirements.txt

# Run UVICORN server with Websocket support
uvicorn app.main:app \
    --host 0.0.0.0 \
    --port ${PORT:-8000} \
    --workers ${WEB_WORKERS:-2} \
    --ws websockets \
    --timeout-keep-alive 300