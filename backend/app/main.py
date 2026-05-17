from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import Base, engine
from app.api import auth, documents, search, workflows, admin

# Initialize FastAPI app
app = FastAPI(
    title="AI Document Workflow API",
    description="OCR + AI-powered document processing platform",
    version="0.1.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(documents.router)
app.include_router(search.router)
app.include_router(workflows.router)
app.include_router(admin.router)


@app.get("/")
def root():
    """Health check"""
    return {"message": "AI Document Workflow API is running", "version": "0.1.0"}


@app.on_event("startup")
async def startup_event():
    """Create tables and sync users from Supabase Auth to local DB on startup"""
    # Create tables (with retry)
    try:
        Base.metadata.create_all(bind=engine)
        print("Database tables created successfully")
    except Exception as e:
        print(f"Warning: Could not create database tables: {e}")
    
    from app.dependencies import supabase
    from app.database import SessionLocal
    from app.models import User
    
    try:
        db = SessionLocal()
        # Check if users exist in local DB
        local_users = db.query(User).all()
        print(f"Local users count: {len(local_users)}")
        
        # If no local users, try to get them from auth
        if not local_users:
            try:
                # Try admin list users
                response = supabase.auth.admin.list_users()
                users_list = response if isinstance(response, list) else getattr(response, 'users', [])
                print(f"Supabase auth users: {len(users_list) if users_list else 0}")
                
                for supabase_user in users_list:
                    from app.dependencies import create_or_sync_user
                    create_or_sync_user(db, supabase_user)
                print(f"Synced {len(users_list)} users from Supabase Auth")
            except Exception as e:
                print(f"Could not fetch from auth: {e}")
        
        # Final count
        local_users = db.query(User).all()
        print(f"Final local users: {len(local_users)}")
        db.close()
    except Exception as e:
        import traceback
        print(f"Warning: Could not sync users from Supabase: {e}")
        traceback.print_exc()


@app.get("/health")
def health_check():
    """Health check endpoint"""
    return {"status": "ok"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
