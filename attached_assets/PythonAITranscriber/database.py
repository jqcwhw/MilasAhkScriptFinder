import os
from datetime import datetime
from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

DATABASE_URL = os.environ.get("DATABASE_URL")

engine = None
SessionLocal = None
Base = declarative_base()

def is_database_available():
    """Check if database is configured and available"""
    return DATABASE_URL is not None and DATABASE_URL != ""

def get_engine():
    """Lazy initialization of database engine"""
    global engine, SessionLocal
    if engine is None:
        if not is_database_available():
            raise ValueError("Database is not configured. DATABASE_URL environment variable is not set.")
        engine = create_engine(DATABASE_URL)
        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    return engine

class SavedScript(Base):
    __tablename__ = "saved_scripts"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    python_code = Column(Text, nullable=False)
    ahk_code = Column(Text, nullable=False)
    script_type = Column(String(50), default="conversion")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

def init_db():
    """Initialize the database by creating all tables"""
    if not is_database_available():
        raise ValueError("Database is not configured")
    eng = get_engine()
    Base.metadata.create_all(bind=eng)

def get_db():
    """Get database session"""
    if not is_database_available():
        raise ValueError("Database is not configured")
    get_engine()
    db = SessionLocal()
    try:
        return db
    finally:
        pass

def save_script(name: str, python_code: str, ahk_code: str, description: str = "", script_type: str = "conversion"):
    """Save a script to the database"""
    if not is_database_available():
        raise ValueError("Database is not configured")
    get_engine()
    db = SessionLocal()
    try:
        script = SavedScript(
            name=name,
            description=description,
            python_code=python_code,
            ahk_code=ahk_code,
            script_type=script_type
        )
        db.add(script)
        db.commit()
        db.refresh(script)
        return script
    except Exception as e:
        db.rollback()
        raise e
    finally:
        db.close()

def get_all_scripts(script_type: str = None):
    """Get all saved scripts, optionally filtered by type"""
    if not is_database_available():
        raise ValueError("Database is not configured")
    get_engine()
    db = SessionLocal()
    try:
        query = db.query(SavedScript)
        if script_type:
            query = query.filter(SavedScript.script_type == script_type)
        return query.order_by(SavedScript.created_at.desc()).all()
    finally:
        db.close()

def get_script_by_id(script_id: int):
    """Get a specific script by ID"""
    if not is_database_available():
        raise ValueError("Database is not configured")
    get_engine()
    db = SessionLocal()
    try:
        return db.query(SavedScript).filter(SavedScript.id == script_id).first()
    finally:
        db.close()

def delete_script(script_id: int):
    """Delete a script by ID"""
    if not is_database_available():
        raise ValueError("Database is not configured")
    get_engine()
    db = SessionLocal()
    try:
        script = db.query(SavedScript).filter(SavedScript.id == script_id).first()
        if script:
            db.delete(script)
            db.commit()
            return True
        return False
    except Exception as e:
        db.rollback()
        raise e
    finally:
        db.close()

def update_script(script_id: int, name: str = None, description: str = None, python_code: str = None, ahk_code: str = None):
    """Update an existing script"""
    if not is_database_available():
        raise ValueError("Database is not configured")
    get_engine()
    db = SessionLocal()
    try:
        script = db.query(SavedScript).filter(SavedScript.id == script_id).first()
        if script:
            if name:
                script.name = name
            if description is not None:
                script.description = description
            if python_code:
                script.python_code = python_code
            if ahk_code:
                script.ahk_code = ahk_code
            script.updated_at = datetime.utcnow()
            db.commit()
            db.refresh(script)
            return script
        return None
    except Exception as e:
        db.rollback()
        raise e
    finally:
        db.close()
