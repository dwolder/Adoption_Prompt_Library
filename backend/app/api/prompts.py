"""Prompt CRUD and voting."""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.config import get_settings
from app.database import get_db
from app.models.prompt import Prompt
from app.models.vote import Vote
from app.schemas.prompt import (
    PromptCreate,
    PromptResponse,
    PROMPT_CATEGORIES,
    GeneratePromptRequest,
    GeneratePromptResponse,
)
from app.core.security import get_current_user_id

router = APIRouter(prefix="/prompts", tags=["prompts"])

SYSTEM_PROMPT = """You are helping create prompts for an AI Prompt Library used for internal product adoption tracking.
Given a user's description of what they want, output a single, well-structured prompt that is clear, specific, and ready to be saved in the library.
Output only the prompt text itself, with no extra commentary, headings, or labels."""


@router.post("/generate", response_model=GeneratePromptResponse)
def generate_prompt(
    payload: GeneratePromptRequest,
    _user_id: int = Depends(get_current_user_id),
):
    """Use AI to generate a well-structured prompt from a short description. Requires OPENAI_API_KEY in backend .env."""
    settings = get_settings()
    if not (settings.openai_api_key or settings.openai_api_key.strip()):
        raise HTTPException(
            status_code=503,
            detail="AI prompt generation is not configured. Set OPENAI_API_KEY in backend/.env.",
        )
    try:
        from openai import OpenAI
        client = OpenAI(api_key=settings.openai_api_key.strip())
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": payload.description},
            ],
            max_tokens=500,
        )
        text = (response.choices[0].message.content or "").strip()
        if not text:
            raise HTTPException(status_code=502, detail="AI returned an empty prompt.")
        return GeneratePromptResponse(generated_prompt=text)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"AI generation failed: {str(e)}")


@router.get("/categories", response_model=list[str])
def list_categories():
    """Return allowed prompt categories for the form."""
    return PROMPT_CATEGORIES


@router.get("/products", response_model=list[str])
def list_products(
    db: Session = Depends(get_db),
    _user_id: int = Depends(get_current_user_id),
):
    """Return distinct product_context values for filter dropdown."""
    from sqlalchemy import distinct
    rows = db.query(distinct(Prompt.product_context)).filter(
        Prompt.product_context.isnot(None), Prompt.product_context != ""
    ).all()
    return sorted(r[0] for r in rows if r[0])


def _prompt_to_response(p: Prompt, vote_count: int, user_has_voted: bool) -> PromptResponse:
    return PromptResponse(
        id=p.id,
        text=p.text,
        category=p.category,
        product_context=p.product_context,
        creator_id=p.creator_id,
        created_at=p.created_at,
        vote_count=vote_count,
        user_has_voted=user_has_voted,
    )


@router.get("", response_model=list[PromptResponse])
def list_prompts(
    category: str | None = Query(None, description="Filter by category"),
    product_context: str | None = Query(None, description="Filter by product"),
    sort_by_votes: bool = Query(True, description="Sort by vote count descending"),
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id),
):
    """List prompts with optional filters and sort by vote count."""
    q = db.query(Prompt)
    if category:
        q = q.filter(Prompt.category == category)
    if product_context:
        q = q.filter(Prompt.product_context == product_context)
    rows = q.all()

    if not rows:
        return []

    ids = [p.id for p in rows]
    # Vote counts per prompt_id
    count_rows = (
        db.query(Vote.prompt_id, func.count(Vote.id).label("cnt"))
        .filter(Vote.prompt_id.in_(ids))
        .group_by(Vote.prompt_id)
        .all()
    )
    vote_map = {r.prompt_id: r.cnt for r in count_rows}
    # Current user's voted prompt ids
    user_voted_ids = {
        r.prompt_id
        for r in db.query(Vote.prompt_id).filter(
            Vote.prompt_id.in_(ids), Vote.user_id == user_id
        ).all()
    }

    result = [
        _prompt_to_response(
            p,
            vote_map.get(p.id, 0),
            p.id in user_voted_ids,
        )
        for p in rows
    ]
    if sort_by_votes:
        result.sort(
            key=lambda x: (-x.vote_count, -(x.created_at.timestamp() if x.created_at else 0))
        )
    else:
        result.sort(key=lambda x: x.created_at, reverse=True)
    return result


@router.post("", response_model=PromptResponse, status_code=201)
def create_prompt(
    payload: PromptCreate,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id),
):
    """Create a new prompt."""
    prompt = Prompt(
        text=payload.text,
        category=payload.category,
        product_context=payload.product_context or None,
        creator_id=user_id,
    )
    db.add(prompt)
    db.commit()
    db.refresh(prompt)
    return _prompt_to_response(prompt, 0, False)


@router.post("/{prompt_id}/vote", response_model=PromptResponse)
def vote_prompt(
    prompt_id: int,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id),
):
    """Add a thumbs-up vote for the prompt (one per user per prompt)."""
    prompt = db.query(Prompt).filter(Prompt.id == prompt_id).first()
    if not prompt:
        raise HTTPException(status_code=404, detail="Prompt not found")
    existing = db.query(Vote).filter(Vote.prompt_id == prompt_id, Vote.user_id == user_id).first()
    if existing:
        return _prompt_to_response(
            prompt,
            db.query(func.count(Vote.id)).filter(Vote.prompt_id == prompt_id).scalar() or 0,
            True,
        )
    vote = Vote(prompt_id=prompt_id, user_id=user_id)
    db.add(vote)
    db.commit()
    db.refresh(prompt)
    count = db.query(func.count(Vote.id)).filter(Vote.prompt_id == prompt_id).scalar() or 0
    return _prompt_to_response(prompt, count, True)


@router.delete("/{prompt_id}/vote", response_model=PromptResponse)
def unvote_prompt(
    prompt_id: int,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id),
):
    """Remove the current user's vote from the prompt."""
    prompt = db.query(Prompt).filter(Prompt.id == prompt_id).first()
    if not prompt:
        raise HTTPException(status_code=404, detail="Prompt not found")
    vote = db.query(Vote).filter(Vote.prompt_id == prompt_id, Vote.user_id == user_id).first()
    if vote:
        db.delete(vote)
        db.commit()
        db.refresh(prompt)
    count = db.query(func.count(Vote.id)).filter(Vote.prompt_id == prompt_id).scalar() or 0
    return _prompt_to_response(prompt, count, False)
