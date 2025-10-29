#!/usr/bin/env python3
import os
import sys
from datetime import datetime

# Adicionar o diretório backend ao path
sys.path.append('backend')

try:
    from app.database import get_db
    from app.models import Usuario, Categoria, Plataforma, MeioPagamento, Transacao, ConfiguracaoUsuario, Pais
    import json
    
    # Criar diretório database se não existir
    os.makedirs('database', exist_ok=True)
    
    # Nome do arquivo de backup
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    backup_filename = f'database/backup_gestaSaaS_{timestamp}.json'
    
    print(f'Iniciando backup do banco de dados gestaSaaS...')
    print(f'Arquivo de backup: {backup_filename}')
    
    # Conectar ao banco
    db = next(get_db())
    
    # Backup dos dados
    backup_data = {}
    
    # Backup das tabelas principais
    tables_to_backup = [
        ('paises', Pais),
        ('usuarios', Usuario),
        ('categorias', Categoria),
        ('plataformas', Plataforma),
        ('meios_pagamento', MeioPagamento),
        ('transacoes', Transacao),
        ('configuracoes_usuario', ConfiguracaoUsuario)
    ]
    
    for table_name, model in tables_to_backup:
        try:
            records = db.query(model).all()
            backup_data[table_name] = []
            
            for record in records:
                record_dict = {}
                for column in record.__table__.columns:
                    value = getattr(record, column.name)
                    if hasattr(value, 'isoformat'):  # datetime objects
                        value = value.isoformat()
                    elif hasattr(value, '__dict__'):  # complex objects
                        value = str(value)
                    record_dict[column.name] = value
                backup_data[table_name].append(record_dict)
            
            print(f'Backup da tabela {table_name}: {len(backup_data[table_name])} registros')
            
        except Exception as e:
            print(f'Erro ao fazer backup da tabela {table_name}: {str(e)}')
            backup_data[table_name] = []
    
    # Salvar backup em JSON
    with open(backup_filename, 'w', encoding='utf-8') as f:
        json.dump(backup_data, f, indent=2, ensure_ascii=False, default=str)
    
    # Verificar se o arquivo foi criado
    if os.path.exists(backup_filename):
        size = os.path.getsize(backup_filename)
        print(f'Backup criado com sucesso: {backup_filename}')
        print(f'Tamanho do arquivo: {size} bytes ({size/1024:.2f} KB)')
        
        # Mostrar resumo dos dados
        total_records = sum(len(records) for records in backup_data.values())
        print(f'Total de registros salvos: {total_records}')
        
        # Mostrar detalhes por tabela
        for table_name, records in backup_data.items():
            if records:
                print(f'  - {table_name}: {len(records)} registros')
        
    else:
        print('Erro: Arquivo de backup não foi criado!')
    
    db.close()
    
except ImportError as e:
    print(f'Erro de importação: {str(e)}')
    print('Certifique-se de que está no diretório correto e as dependências estão instaladas')
except Exception as e:
    print(f'Erro durante o backup: {str(e)}')