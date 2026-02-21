from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

from app.api.endpoints import router as api_router

app = FastAPI(
    title="RAKSHAK API",
    description="Advanced Deepfake Detection System API",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify the actual frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api/v1")

@app.get("/")
async def root():
    return {"message": "RAKSHAK API is operational", "status": "online"}

@app.post("/analyze")
async def analyze_media(file: UploadFile = File(...)):
    # Placeholder for multi-modal analysis logic
    return {
        "filename": file.filename,
        "status": "processing",
        "job_id": "mock_job_123"
    }

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
