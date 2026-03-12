"""Generate PDF of prompts (filtered/sorted list) using reportlab."""
import io
from datetime import datetime

from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak

from app.schemas.prompt import PromptResponse


def build_prompt_library_pdf(prompts: list[PromptResponse], title: str = "AI Prompt Library") -> bytes:
    """Generate a PDF buffer containing the given prompts. Returns PDF bytes."""
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=inch,
        leftMargin=inch,
        topMargin=inch,
        bottomMargin=inch,
    )
    styles = getSampleStyleSheet()
    heading_style = ParagraphStyle(
        name="CustomHeading",
        parent=styles["Heading1"],
        fontSize=18,
        spaceAfter=12,
    )
    body_style = styles["Normal"]
    body_style.spaceAfter = 6

    story = []
    story.append(Paragraph(title, heading_style))
    story.append(
        Paragraph(
            f"Generated on {datetime.now().strftime('%Y-%m-%d %H:%M UTC')} — {len(prompts)} prompt(s)",
            styles["Normal"],
        )
    )
    story.append(Spacer(1, 0.25 * inch))

    for i, p in enumerate(prompts, 1):
        story.append(Paragraph(f"<b>#{i} — {p.category}</b>", body_style))
        if p.product_context:
            story.append(Paragraph(f"Product: {_escape(p.product_context)}", body_style))
        story.append(Paragraph(f"Thumbs up: {p.vote_count}", body_style))
        story.append(Paragraph(_escape(p.text), body_style))
        story.append(Spacer(1, 0.15 * inch))

    doc.build(story)
    buffer.seek(0)
    return buffer.getvalue()


def _escape(s: str) -> str:
    """Escape HTML for ReportLab Paragraph."""
    if not s:
        return ""
    return (
        s.replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace('"', "&quot;")
    )
