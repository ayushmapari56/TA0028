from fastapi import APIRouter, UploadFile, File, HTTPException, BackgroundTasks
from pydantic import BaseModel
from typing import List, Optional
import uuid
import time
import os
import shutil
from app.core.detector import detector

router = APIRouter()

TEMP_DIR = "temp_uploads"
os.makedirs(TEMP_DIR, exist_ok=True)

# In-memory storage for job status (in a real app, use Redis/PostgreSQL)
jobs = {}

class AnalysisResult(BaseModel):
    job_id: str
    status: str
    filename: str
    authenticity_score: Optional[float] = None
    manipulation_type: Optional[str] = None
    artifacts_detected: List[str] = []
    message: str

@router.post("/upload", response_model=AnalysisResult)
async def upload_media(background_tasks: BackgroundTasks, file: UploadFile = File(...)):
    if not file.content_type.startswith(('image/', 'video/', 'audio/')):
        raise HTTPException(status_code=400, detail="Invalid file type. Only image, video, and audio are supported.")
    
    job_id = str(uuid.uuid4())
    file_ext = os.path.splitext(file.filename)[1]
    temp_file_path = os.path.join(TEMP_DIR, f"{job_id}{file_ext}")
    
    # Save file locally
    with open(temp_file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    jobs[job_id] = {
        "job_id": job_id,
        "status": "queued",
        "filename": file.filename,
        "authenticity_score": None,
        "manipulation_type": None,
        "artifacts_detected": [],
        "message": "File uploaded and queued for analysis"
    }
    
    # Process in background
    background_tasks.add_task(run_analysis, job_id, temp_file_path, file.content_type)
    
    return jobs[job_id]

@router.get("/status/{job_id}", response_model=AnalysisResult)
async def get_status(job_id: str):
    if job_id not in jobs:
        raise HTTPException(status_code=404, detail="Job not found")
    return jobs[job_id]

async def run_analysis(job_id: str, file_path: str, content_type: str):
    try:
        jobs[job_id]["status"] = "processing"
        jobs[job_id]["message"] = "Analyzing spatial coherence and frequency artifacts..."
        
        # Run detector
        result = detector.predict(file_path, content_type)
        
        # Update job status
        jobs[job_id].update({
            "status": "completed",
            "authenticity_score": result.get("authenticity_score"),
            "manipulation_type": result.get("manipulation_type"),
            "artifacts_detected": result.get("artifacts_detected", []),
            "message": result.get("details", "Analysis complete.")
        })
    except Exception as e:
        jobs[job_id]["status"] = "failed"
        jobs[job_id]["message"] = f"Analysis failed: {str(e)}"
    finally:
        # Cleanup temp file
        if os.path.exists(file_path):
            os.remove(file_path)
