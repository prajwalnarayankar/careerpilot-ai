import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.database import Base, get_db
from app.main import app
from app.models.user import User
from app.models.profile import Profile
from app.utils.security import get_password_hash, create_access_token

# Use SQLite in-memory for fast isolated tests
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="session")
def setup_test_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

@pytest.fixture
def db(setup_test_db):
    connection = engine.connect()
    transaction = connection.begin()
    session = TestingSessionLocal(bind=connection)
    
    yield session
    
    session.close()
    transaction.rollback()
    connection.close()

@pytest.fixture
def client(db):
    def override_get_db():
        try:
            yield db
        finally:
            pass
            
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()

@pytest.fixture
def auth_headers(client, db):
    # Create test user
    email = "testuser@example.com"
    pwd = "SecurePassword123!"
    hashed = get_password_hash(pwd)
    user = User(email=email, full_name="Test Candidate", hashed_password=hashed)
    db.add(user)
    db.commit()
    db.refresh(user)

    profile = Profile(
        user_id=user.id,
        headline="Full Stack Developer",
        preferred_job_role="Python Developer",
        skills=["Python", "FastAPI", "SQL", "Docker"]
    )
    db.add(profile)
    db.commit()

    token = create_access_token(data={"user_id": user.id, "email": user.email})
    return {"Authorization": f"Bearer {token}"}
