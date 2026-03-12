"""Vote model - one thumbs up per user per prompt."""
from sqlalchemy import Column, Integer, ForeignKey, UniqueConstraint
from app.database import Base


class Vote(Base):
    __tablename__ = "votes"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    prompt_id = Column(Integer, ForeignKey("prompts.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    __table_args__ = (UniqueConstraint("prompt_id", "user_id", name="uq_vote_prompt_user"),)
