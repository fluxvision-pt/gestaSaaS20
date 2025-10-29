FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# usuário não-root (boa prática)
RUN useradd --create-home --shell /bin/bash app && chown -R app:app /app
USER app

EXPOSE 3001

# Healthcheck: sempre localhost interno do container
HEALTHCHECK --interval=60s --timeout=10s --start-period=120s --retries=3 \
  CMD curl -f https://api.fluxvision.cloud/health || exit 1

# Start
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "3001", "--workers", "1", "--loop", "asyncio"]
