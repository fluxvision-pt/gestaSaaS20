#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Configuração do banco de dados
"""

import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.engine import URL
from dotenv import load_dotenv

# Carregar variáveis de ambiente baseado na prioridade
dev_env_path = os.path.join(os.path.dirname(__file__), '..', '.env.development')
prod_env_path = os.path.join(os.path.dirname(__file__), '..', '.env.production')

# Primeiro carrega development
if os.path.exists(dev_env_path):
    load_dotenv(dev_env_path)
    print(f"✅ Carregado: {dev_env_path}")

# Depois carrega production, mas só sobrescreve se ENVIRONMENT não for development
if os.path.exists(prod_env_path):
    # Se ENVIRONMENT já está definido como development, não sobrescrever
    current_env = os.getenv("ENVIRONMENT")
    if current_env != "development":
        load_dotenv(prod_env_path, override=True)
        print(f"✅ Carregado (prioridade): {prod_env_path}")
    else:
        print(f"ℹ️  Mantendo configurações de desenvolvimento, ignorando produção")

# Configurações do banco de dados
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "5432")
DB_USER = os.getenv("DB_USER", "postgres")
DB_PASSWORD = os.getenv("DB_PASSWORD", "")
DB_NAME = os.getenv("DB_NAME", "app_gesta_db")
ENVIRONMENT = os.getenv("ENVIRONMENT", "production")

print(f"🔧 Configuração do banco:")
print(f"   Environment: {ENVIRONMENT}")
print(f"   Host: {DB_HOST}")
print(f"   Port: {DB_PORT}")
print(f"   Database: {DB_NAME}")
print(f"   User: {DB_USER}")

# PostgreSQL URL usando SQLAlchemy URL para melhor tratamento de caracteres especiais
SQLALCHEMY_DATABASE_URL = URL.create(
    "postgresql",
    username=DB_USER,
    password=DB_PASSWORD,
    host=DB_HOST,
    port=int(DB_PORT),
    database=DB_NAME,
    query={"client_encoding": "utf8"}
)
print(f"🔗 Database URL: postgresql://{DB_USER}:***@{DB_HOST}:{DB_PORT}/{DB_NAME}?client_encoding=utf8")

# Criar engine do SQLAlchemy para PostgreSQL
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    pool_pre_ping=True,
    pool_size=5,
    max_overflow=10,
    echo=False
)
print(f"✅ Engine PostgreSQL criado: {SQLALCHEMY_DATABASE_URL}")

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    """Dependency para obter sessão do banco de dados"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

