from sqlalchemy.orm import Session
from app.database import SessionLocal, engine
from app.models import Pais, Base

# Criar todas as tabelas
Base.metadata.create_all(bind=engine)

def populate_countries():
    db = SessionLocal()
    try:
        # Verificar se já existem países
        existing_countries = db.query(Pais).count()
        if existing_countries > 0:
            print(f"Já existem {existing_countries} países na base de dados.")
            return
        
        # Lista de países para popular
        countries = [
            {"nome": "Brasil", "codigo": "BR", "codigo_telefone": "+55", "regiao": "América do Sul"},
            {"nome": "Portugal", "codigo": "PT", "codigo_telefone": "+351", "regiao": "Europa"},
            {"nome": "Angola", "codigo": "AO", "codigo_telefone": "+244", "regiao": "África"},
            {"nome": "Estados Unidos", "codigo": "US", "codigo_telefone": "+1", "regiao": "América do Norte"},
            {"nome": "Reino Unido", "codigo": "GB", "codigo_telefone": "+44", "regiao": "Europa"},
            {"nome": "França", "codigo": "FR", "codigo_telefone": "+33", "regiao": "Europa"},
            {"nome": "Alemanha", "codigo": "DE", "codigo_telefone": "+49", "regiao": "Europa"},
            {"nome": "Espanha", "codigo": "ES", "codigo_telefone": "+34", "regiao": "Europa"},
            {"nome": "Itália", "codigo": "IT", "codigo_telefone": "+39", "regiao": "Europa"},
            {"nome": "Canadá", "codigo": "CA", "codigo_telefone": "+1", "regiao": "América do Norte"},
            {"nome": "Argentina", "codigo": "AR", "codigo_telefone": "+54", "regiao": "América do Sul"},
            {"nome": "México", "codigo": "MX", "codigo_telefone": "+52", "regiao": "América do Norte"},
            {"nome": "Cabo Verde", "codigo": "CV", "codigo_telefone": "+238", "regiao": "África"},
            {"nome": "Moçambique", "codigo": "MZ", "codigo_telefone": "+258", "regiao": "África"},
            {"nome": "Guiné-Bissau", "codigo": "GW", "codigo_telefone": "+245", "regiao": "África"},
            {"nome": "São Tomé e Príncipe", "codigo": "ST", "codigo_telefone": "+239", "regiao": "África"},
            {"nome": "Timor-Leste", "codigo": "TL", "codigo_telefone": "+670", "regiao": "Ásia"},
            {"nome": "Macau", "codigo": "MO", "codigo_telefone": "+853", "regiao": "Ásia"},
        ]
        
        # Inserir países
        for country_data in countries:
            country = Pais(**country_data)
            db.add(country)
        
        db.commit()
        print(f"Inseridos {len(countries)} países na base de dados.")
        
    except Exception as e:
        print(f"Erro ao popular países: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    populate_countries()