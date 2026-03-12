"""Create database tables. Run from backend dir: python -m app.create_tables."""
from pathlib import Path
from dotenv import load_dotenv

# Ensure we load backend/.env even if cwd is project root
_backend_dir = Path(__file__).resolve().parent.parent
load_dotenv(_backend_dir / ".env")

from app.database import Base, engine
from app.models import User, Prompt, Vote  # noqa: F401 - ensure tables registered


def main():
    Base.metadata.create_all(bind=engine)
    print("Tables created successfully.")


if __name__ == "__main__":
    main()
