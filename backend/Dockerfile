FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

COPY requirements.txt ./requirements.txt

RUN set -eux; \
    python -m pip install --no-cache-dir --upgrade pip; \
    awk '!/^(pywin32|WMI)(==|$)/ && !/^[[:space:]]*(#|$)/ { print }' requirements.txt > /tmp/requirements-linux.txt; \
    python -m pip install --no-cache-dir -r /tmp/requirements-linux.txt; \
    python -m pip install --no-cache-dir alembic requests beautifulsoup4

COPY alembic ./alembic
COPY alembic.ini ./alembic.ini
COPY backend ./backend

EXPOSE 8000

CMD ["sh", "-c", "alembic upgrade head && exec uvicorn backend.main:app --host 0.0.0.0 --port 8000"]