"""Vote schemas."""
from pydantic import BaseModel


class VoteResponse(BaseModel):
    prompt_id: int
    vote_count: int

    class Config:
        from_attributes = True
