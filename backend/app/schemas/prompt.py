"""Prompt schemas."""
from datetime import datetime
from pydantic import BaseModel, Field, field_validator

# Allow-list for category to prevent injection / invalid values
PROMPT_CATEGORIES = [
    "Customer Baseline",
    "Feature Adoption",
    "Outcome Adoption",
    "QBR Preparation",
    "Product Name/General",
]


class PromptCreate(BaseModel):
    text: str = Field(..., min_length=1, max_length=10000)
    category: str = Field(..., max_length=128)
    product_context: str | None = Field(None, max_length=255)

    @field_validator("category")
    @classmethod
    def category_must_be_allowed(cls, v: str) -> str:
        if v not in PROMPT_CATEGORIES:
            raise ValueError(f"category must be one of: {PROMPT_CATEGORIES}")
        return v


class PromptResponse(BaseModel):
    id: int
    text: str
    category: str
    product_context: str | None
    creator_id: int | None
    created_at: datetime
    vote_count: int = 0
    user_has_voted: bool = False

    class Config:
        from_attributes = True


class PromptListQuery(BaseModel):
    category: str | None = None
    product_context: str | None = None
    sort_by_votes: bool = True  # True = descending by votes


class GeneratePromptRequest(BaseModel):
    description: str = Field(..., min_length=1, max_length=2000)


class GeneratePromptResponse(BaseModel):
    generated_prompt: str
