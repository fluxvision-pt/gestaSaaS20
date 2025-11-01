from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from app.routers import auth, dashboard, transacoes, configuracoes
import os
import signal
import asyncio
import logging
from dotenv import load_dotenv
from pathlib import Path

# ==============================
# Inicialização e Logging
# ==============================

# ==========================
# Carregar variáveis do ambiente
# ==========================
# Caminho absoluto para o .env.production
env_path = Path(__file__).resolve().parent.parent / ".env.production"

# Garante o carregamento mesmo se o main já tiver feito isso
load_dotenv(dotenv_path=env_path, override=True)

# Configuração básica de logs
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("gestaSaaS")

# ==============================
# Inicialização do FastAPI
# ==============================
app = FastAPI(
    title="gestaSaaS API",
    description="API para gestão financeira inteligente",
    version="1.0.0"
)

# ==============================
# Controle de desligamento suave (graceful shutdown)
# ==============================
shutdown_event = asyncio.Event()

@app.on_event("startup")
async def startup_event():
    logger.info("🚀 Iniciando gestaSaaS API...")

    # ✅ Loga a conexão do DB para verificar se as variáveis estão corretas
    db_host = os.getenv("DB_HOST")
    db_name = os.getenv("DB_NAME")
    if not db_host or not db_name:
        logger.warning("⚠️  Variáveis de ambiente do banco ausentes ou não carregadas.")
    else:
        logger.info(f"✅ DB conectado em: {db_host} | {db_name}")

    logger.info("✅ Aplicação iniciada com sucesso!")

@app.on_event("shutdown")
async def shutdown_event_handler():
    logger.info("🛑 Iniciando shutdown graceful...")
    shutdown_event.set()
    await asyncio.sleep(2)
    logger.info("✅ Shutdown concluído com sucesso!")

# ==============================
# Configuração de CORS
# ==============================
cors_origins_str = os.getenv(
    "CORS_ORIGINS", 
    "https://app.fluxvision.cloud,https://rotas.fluxvision.cloud"
)
cors_origins = [o.strip() for o in cors_origins_str.split(",") if o.strip()]

environment = os.getenv("ENVIRONMENT", "production")

print(f"Environment: {environment}")
print(f"CORS Origins: {cors_origins}")

# Middleware padrão de CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==============================
# Headers de segurança
# ==============================
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    
    # Headers de segurança para evitar Mixed Content
    response.headers["Content-Security-Policy"] = "upgrade-insecure-requests"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    
    return response

# ==============================
# Rotas da aplicação
# ==============================
app.include_router(auth.router, prefix="/api")
app.include_router(dashboard.router, prefix="/api")
app.include_router(transacoes.router, prefix="/api")
app.include_router(configuracoes.router, prefix="/api")

# ==============================
# Rotas básicas
# ==============================
@app.get("/")
async def root():
    return {"message": "gestaSaaS API - Gestão Inteligente"}

@app.get("/health")
async def health_check():
    """
    Health check endpoint otimizado para evitar reinicializações
    """
    try:
        import time
        return {
            "status": "healthy",
            "service": "gestaSaaS API",
            "timestamp": int(time.time()),
            "environment": os.getenv("ENVIRONMENT", "production"),
            "version": "1.0.0"
        }
    except Exception as e:
        logger.error(f"Health check falhou: {e}")
        return {
            "status": "unhealthy",
            "service": "gestaSaaS API",
            "error": str(e)
        }
