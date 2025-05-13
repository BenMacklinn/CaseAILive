from typing import Dict, List, Optional, Any
from pydantic import BaseModel
from .prompts import Stage

class Session(BaseModel):
    session_id: str
    current_stage: Stage = Stage.INTRO
    answers_received: Dict[Stage, str] = {}
    questions_asked: List[str] = []
    answer_keys: Dict[Stage, Dict[str, Any]] = {}
    final_score: Optional[float] = None
    score_breakdown: Optional[Dict[str, Any]] = None
    feedback: Optional[Dict[str, Any]] = None
    stage_scores: Dict[Stage, Dict[str, Any]] = {}
    transition_scores: Dict[str, float] = {}
    quality_metrics: Dict[Stage, Dict[str, float]] = {}
    bonus_points: Dict[Stage, int] = {}
    penalty_points: Dict[Stage, int] = {}
    stage_completion_status: Dict[Stage, bool] = {}
    required_elements_status: Dict[Stage, Dict[str, bool]] = {}
    time_spent_per_stage: Dict[Stage, float] = {}
    communication_quality: Dict[Stage, float] = {}
    
    class Config:
        arbitrary_types_allowed = True 