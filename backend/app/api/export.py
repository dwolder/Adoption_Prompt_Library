"""Export filtered/sorted prompts as PDF."""
from fastapi import APIRouter, Depends, Query
from fastapi.responses import Response
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app.models.prompt import Prompt
from app.models.vote import Vote
from app.schemas.prompt import PromptResponse
from app.core.security import get_current_user_id
from app.services.pdf_export import build_prompt_library_pdf

router = APIRouter(prefix="/export", tags=["export"])


def _get_prompts_for_export(
    db: Session,
    user_id: int,
    category: str | None,
    product_context: str | None,
    sort_by_votes: bool,
) -> list[PromptResponse]:
    q = db.query(Prompt)
    if category:
        q = q.filter(Prompt.category == category)
    if product_context:
        q = q.filter(Prompt.product_context == product_context)
    rows = q.all()
    if not rows:
        return []
    ids = [p.id for p in rows]
    count_rows = (
        db.query(Vote.prompt_id, func.count(Vote.id).label("cnt"))
        .filter(Vote.prompt_id.in_(ids))
        .group_by(Vote.prompt_id)
        .all()
    )
    vote_map = {r.prompt_id: r.cnt for r in count_rows}
    user_voted_ids = {
        r.prompt_id
        for r in db.query(Vote.prompt_id).filter(
            Vote.prompt_id.in_(ids), Vote.user_id == user_id
        ).all()
    }
    result = [
        PromptResponse(
            id=p.id,
            text=p.text,
            category=p.category,
            product_context=p.product_context,
            creator_id=p.creator_id,
            created_at=p.created_at,
            vote_count=vote_map.get(p.id, 0),
            user_has_voted=p.id in user_voted_ids,
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


@router.get("/pdf")
def export_prompts_pdf(
    category: str | None = Query(None),
    product_context: str | None = Query(None),
    sort_by_votes: bool = Query(True),
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id),
):
    """Generate PDF of currently filtered/sorted prompts."""
    prompts = _get_prompts_for_export(db, user_id, category, product_context, sort_by_votes)
    pdf_bytes = build_prompt_library_pdf(prompts)
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": "attachment; filename=prompt-library.pdf",
        },
    )
