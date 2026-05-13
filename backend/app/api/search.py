from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.database import get_db
from app.models import User, Document
from app.dependencies import get_current_user
from app.services.embedding_service import generate_embedding
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter(prefix="/api/search", tags=["search"])


class SearchResult(BaseModel):
    document_id: str
    filename: str
    relevance_score: float
    raw_text: Optional[str] = None
    file_type: str


class SemanticSearchRequest(BaseModel):
    query: str
    limit: int = 10


@router.post("/semantic", response_model=List[SearchResult])
def semantic_search(
    request: SemanticSearchRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Semantic search using MiniLM embeddings and pgvector similarity.
    
    This endpoint:
    1. Generates embedding for the query using MiniLM
    2. Finds similar documents using pgvector cosine similarity
    3. Returns documents sorted by relevance score
    """
    try:
        from pgvector.sqlalchemy import Vector
        
        # Generate embedding for the query
        query_embedding = generate_embedding(request.query)
        
        # Query documents using pgvector similarity
        # The <=> operator computes the distance, so we use 1 - distance for similarity
        sql_query = text("""
            SELECT 
                d.id,
                d.filename,
                d.file_type,
                d.raw_text,
                (1 - (d.embedding <=> CAST(:query_embedding AS vector))) as relevance_score
            FROM documents d
            WHERE d.owner_id = :user_id AND d.embedding IS NOT NULL
            ORDER BY relevance_score DESC
            LIMIT :limit
        """)
        
        # Convert embedding to string for SQL
        embedding_str = "[" + ",".join(str(x) for x in query_embedding) + "]"
        
        results = db.execute(
            sql_query,
            {
                "query_embedding": embedding_str,
                "user_id": current_user.id,
                "limit": request.limit
            }
        ).fetchall()
        
        # Convert results to SearchResult objects
        search_results = []
        for result in results:
            search_results.append(SearchResult(
                document_id=result[0],
                filename=result[1],
                file_type=result[2],
                raw_text=result[3],
                relevance_score=float(result[4]) if result[4] is not None else 0.0
            ))
        
        return search_results
    
    except Exception as e:
        print(f"Error during semantic search: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error performing semantic search: {str(e)}"
        )


@router.post("/generate-embeddings")
def generate_embeddings_for_user(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Generate embeddings for all documents of the current user that have raw_text but no embedding.
    This endpoint should be called to initialize embeddings for semantic search.
    """
    try:
        from app.services.embedding_service import generate_embedding
        
        # Get all documents for the user that have raw_text but no embedding yet
        documents = db.query(Document).filter(
            Document.owner_id == current_user.id,
            Document.raw_text.isnot(None),
            Document.embedding.is_(None)
        ).all()
        
        if not documents:
            return {
                "message": "No documents found to generate embeddings for",
                "count": 0
            }
        
        # Generate embeddings one at a time with individual error handling
        success_count = 0
        for doc in documents:
            try:
                embedding = generate_embedding(doc.raw_text)
                if any(v != 0.0 for v in embedding):  # Verify non-zero
                    doc.embedding = embedding
                    success_count += 1
                else:
                    print(f"Warning: Zero embedding for document {doc.id}")
            except Exception as e:
                print(f"Error embedding document {doc.id}: {str(e)}")
        
        db.commit()
        
        return {
            "message": f"Generated embeddings for {success_count} documents",
            "count": success_count
        }
    
    except Exception as e:
        print(f"Error generating embeddings: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating embeddings: {str(e)}"
        )
