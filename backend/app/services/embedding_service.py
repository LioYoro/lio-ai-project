from sentence_transformers import SentenceTransformer
from typing import List
import numpy as np

# Load MiniLM model for embeddings (free, runs locally)
# This model is efficient and suitable for semantic search
model = SentenceTransformer('all-MiniLM-L6-v2')


def generate_embedding(text: str) -> List[float]:
    """
    Generate embedding for a given text using MiniLM model.
    
    Args:
        text: Text to embed
        
    Returns:
        List of floats representing the embedding vector
    """
    if not text or not text.strip():
        # Return zero vector for empty text
        return [0.0] * 384  # MiniLM produces 384-dimensional vectors
    
    try:
        # Generate embedding
        embedding = model.encode(text, convert_to_numpy=True)
        
        # Convert to list of floats
        return embedding.tolist()
    except Exception as e:
        print(f"Error generating embedding: {str(e)}")
        return [0.0] * 384


def generate_embeddings_batch(texts: List[str]) -> List[List[float]]:
    """
    Generate embeddings for multiple texts efficiently.
    
    Args:
        texts: List of texts to embed
        
    Returns:
        List of embedding vectors
    """
    try:
        embeddings = model.encode(texts, convert_to_numpy=True)
        return [emb.tolist() for emb in embeddings]
    except Exception as e:
        print(f"Error generating batch embeddings: {str(e)}")
        return [[0.0] * 384 for _ in texts]


def similarity_score(embedding1: List[float], embedding2: List[float]) -> float:
    """
    Calculate cosine similarity between two embeddings.
    Note: This is mainly for reference, the actual similarity is calculated
    in the database using pgvector's <=> operator.
    
    Args:
        embedding1: First embedding vector
        embedding2: Second embedding vector
        
    Returns:
        Similarity score between -1 and 1
    """
    arr1 = np.array(embedding1)
    arr2 = np.array(embedding2)
    
    # Cosine similarity
    dot_product = np.dot(arr1, arr2)
    norm1 = np.linalg.norm(arr1)
    norm2 = np.linalg.norm(arr2)
    
    if norm1 == 0 or norm2 == 0:
        return 0.0
    
    return float(dot_product / (norm1 * norm2))
