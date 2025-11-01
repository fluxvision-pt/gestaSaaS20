from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
import os
from dotenv import load_dotenv
from pathlib import Path

# ==========================
# Carregar variáveis do ambiente
# ==========================
# Caminho absoluto para o .env.production
env_path = Path(__file__).resolve().parent.parent / ".env.production"

# Garante o carregamento mesmo se o main já tiver feito isso
load_dotenv(dotenv_path=env_path, override=True)

# Configuração das variáveis do banco de dados
DB_USER = os.getenv("DB_USER", "postgres")
DB_PASSWORD = os.getenv("DB_PASSWORD", "2084b5fb1f7fd997a2b0")
DB_NAME = os.getenv("DB_NAME", "app_gesta_db")
DB_HOST = os.getenv("DB_HOST", "aplicacao_gesta_db")
DB_PORT = os.getenv("DB_PORT", "5432")

# Construção da URL do banco de dados PostgreSQL
DATABASE_URL = f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

if not all([DB_USER, DB_PASSWORD, DB_NAME, DB_HOST, DB_PORT]):
    raise ValueError("❌ Erro: variáveis de ambiente do banco de dados ausentes ou incorretas")

engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    pool_size=5,
    max_overflow=10,
    echo=True
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

