# Placeholder for search API (Phase 4)
from fastapi import APIRouter

router = APIRouter(prefix="/api/search", tags=["search"])


@router.get("/")
def search(q: str, skip: int = 0, limit: int = 10):
    """Search documents (Phase 4)"""
    return {"message": "Search endpoint - coming in Phase 4"}
