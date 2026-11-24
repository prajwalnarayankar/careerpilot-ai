from typing import Optional, List
import datetime
from pydantic import BaseModel, ConfigDict

class InterviewAnswerCreate(BaseModel):
    user_answer: str

class InterviewAnswerResponse(BaseModel):
    id: int
    question_id: int
    user_answer: str
    evaluation_score: float
    feedback: str
    improved_answer: str
    strengths: List[str] = []
    weaknesses: List[str] = []
    key_takeaways: List[str] = []
    submitted_at: datetime.datetime

    model_config = ConfigDict(from_attributes=True)

class InterviewQuestionResponse(BaseModel):
    id: int
    session_id: int
    category: str
    question_text: str
    context_hint: Optional[str] = None
    sample_key_points: List[str] = []
    order_index: int
    answer: Optional[InterviewAnswerResponse] = None

    model_config = ConfigDict(from_attributes=True)

class InterviewSessionCreate(BaseModel):
    job_id: Optional[int] = None
    role_target: str
    session_type: Optional[str] = "Comprehensive"
    custom_topics: Optional[List[str]] = None

class InterviewSessionResponse(BaseModel):
    id: int
    user_id: int
    job_id: Optional[int] = None
    title: str
    role_target: str
    session_type: str
    overall_score: Optional[float] = None
    summary_feedback: Optional[str] = None
    created_at: datetime.datetime
    completed_at: Optional[datetime.datetime] = None
    questions: List[InterviewQuestionResponse] = []

    model_config = ConfigDict(from_attributes=True)

class EvaluateAnswerRequest(BaseModel):
    question_id: int
    user_answer: str
