from fastapi import FastAPI, UploadFile, File, HTTPException, Query, Depends, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import RedirectResponse, JSONResponse
from pydantic import BaseModel
import openai
from openai import OpenAI
import os
from dotenv import load_dotenv
import tempfile
import shutil
from pathlib import Path
import logging
import io
import sqlite3
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
from typing import Optional, Dict, List, Union, Any
import json
import glob
import time
import threading
import uuid
from starlette.responses import FileResponse
from dataclasses import dataclass, field
from .prompts import Stage, PROMPTS, GRADE_PROMPT
import asyncio
from .grading import (
    calculate_progressive_score, ProgressiveScore, StageGrading, 
    STAGE_GRADING_CRITERIA, evaluate_stage, calculate_transition_quality,
    generate_stage_feedback
)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(
    title="Case Interview AI",
    description="API for conducting AI-powered case interviews",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"https?://localhost(:[0-9]+)?",
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "https://caseailive-1frontendbenmacklinbenlewy.onrender.com",
        "https://caseai.ca",
        "https://www.caseai.ca",
        "https://benmacklinbenlewycaseai.onrender.com"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create audio directory if it doesn't exist
AUDIO_DIR = Path(__file__).parent / "audio"
AUDIO_DIR.mkdir(exist_ok=True)

# Mount the audio directory
app.mount("/audio", StaticFiles(directory=str(AUDIO_DIR)), name="audio")

# Configure API keys
openai_key = os.getenv("OPENAI_API_KEY")

if not openai_key:
    raise HTTPException(
        status_code=500,
        detail="OpenAI API key not found. Please check your .env file."
    )

# Initialize OpenAI client (v1.x style)
client = openai.OpenAI()

def get_openai_client() -> OpenAI:
    """Dependency to get OpenAI client."""
    return client

# --- User Auth & DB Setup ---
SECRET_KEY = "supersecretkey"  # Change this in production
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/login")

# Initialize SQLite DB
conn = sqlite3.connect("caseai.db", check_same_thread=False)
c = conn.cursor()
c.execute('''CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    hashed_password TEXT NOT NULL
)''')
c.execute('''CREATE TABLE IF NOT EXISTS cases (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    date TEXT,
    type TEXT,
    length TEXT,
    style TEXT,
    industry TEXT,
    score INTEGER,
    feedback TEXT,
    FOREIGN KEY(user_id) REFERENCES users(id)
)''')
conn.commit()

# Add conversation history storage
conversation_history = {}

# Add answer key storage
answer_keys = {}

# Add a set to track ended sessions
ended_sessions = set()

# Define prompts for each phase
PHASE_PROMPTS = [
    # Clarifying phase
    "Continue the case as a real interviewer. Speak naturally, without any labels, section headers, or meta-language. Invite the candidate to ask clarifying questions about the company, market, or objective. Only say what you would actually say aloud. If the candidate is ready to move on, transition naturally.",
    # Framework phase
    "Continue the case as a real interviewer. Ask the candidate for their structured approach to the case. Do not use any labels, section headers, or meta-language. Only say what you would actually say aloud. If the candidate is ready to move on, transition naturally.",
    # Quantitative phase
    "Continue the case as a real interviewer. Ask a relevant quantitative question, provide only the necessary data, and prompt for calculation and interpretation. Do not use any labels, section headers, or meta-language. Only say what you would actually say aloud. If the candidate is ready to move on, transition naturally.",
    # Qualitative phase
    "Continue the case as a real interviewer. Ask a qualitative question that builds on the previous answer. Do not use any labels, section headers, or meta-language. Only say what you would actually say aloud. If the candidate is ready to move on, transition naturally.",
    # CEO synthesis phase
    "The CEO is walking into the room and you have 60 seconds. What would you say to them?"
]

class InterviewResponse(BaseModel):
    text: str
    audio_url: str

class FeedbackRequest(BaseModel):
    transcript: str
    session_id: str  # Add session_id to feedback request

class HintRequest(BaseModel):
    conversation: list

class UserRegister(BaseModel):
    email: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class CaseRecord(BaseModel):
    date: str
    type: str
    length: str
    style: str
    industry: str
    score: Optional[int]
    feedback: str

class TTSRequest(BaseModel):
    text: str

# Utility functions

def get_password_hash(password):
    return pwd_context.hash(password)

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def get_user(email: str):
    c.execute("SELECT id, email, hashed_password FROM users WHERE email=?", (email,))
    row = c.fetchone()
    if row:
        return {"id": row[0], "email": row[1], "hashed_password": row[2]}
    return None

def get_user_by_id(user_id: int):
    c.execute("SELECT id, email FROM users WHERE id=?", (user_id,))
    row = c.fetchone()
    if row:
        return {"id": row[0], "email": row[1]}
    return None

# Background task to delete audio files older than 20 minutes
AUDIO_EXPIRY_MINUTES = 20

def cleanup_old_audio_files():
    while True:
        now = time.time()
        for audio_file in AUDIO_DIR.glob("*.mp3"):
            try:
                mtime = audio_file.stat().st_mtime
                if now - mtime > AUDIO_EXPIRY_MINUTES * 60:
                    audio_file.unlink()
            except Exception as e:
                logging.error(f"Error deleting old audio file {audio_file}: {e}")
        time.sleep(300)  # Run every 5 minutes

# Start the background cleanup thread
threading.Thread(target=cleanup_old_audio_files, daemon=True).start()

@app.get("/")
async def root():
    """
    Redirect to the API documentation
    """
    return RedirectResponse(url="/docs")

@app.post("/api/transcribe")
async def transcribe_audio(
    file: Optional[UploadFile] = File(None),
    text: Optional[str] = Form(None),
    question_count: int = Form(0),
    final_answer: Optional[bool] = Form(None),
    session_id: Optional[str] = Form(None)
):
    try:
        print('file:', file)
        print('text:', text)
        print('question_count:', question_count)
        print('final_answer:', final_answer)
        print('session_id:', session_id)
        if not session_id:
            raise HTTPException(status_code=400, detail="session_id is required")
        if session_id in ended_sessions:
            return {
                "transcript": "",
                "response": "The case has ended. No further responses will be processed.",
                "audio_url": ""
            }
        if file is not None:
            # Log the file content type
            logger.info(f"Processing audio file: {file.filename}")
            logger.info(f"File content type: {file.content_type}")

            # Read the file content
            audio_bytes = await file.read()
            logger.info(f"Received {len(audio_bytes)} bytes of audio data")

            # Create a BytesIO object with a name attribute for format inference
            audio_file = io.BytesIO(audio_bytes)
            audio_file.name = file.filename or "recording.webm"

            # Transcribe with Whisper directly
            try:
                transcription = client.audio.transcriptions.create(
                    model="whisper-1",
                    file=audio_file
                )
                logger.info(f"Transcription successful: {transcription.text}")
                user_text = transcription.text
            except Exception as e:
                logger.error(f"Error processing audio: {str(e)}")
                raise HTTPException(status_code=400, detail=str(e))
        elif text is not None:
            user_text = text
        else:
            raise HTTPException(status_code=400, detail="No input provided.")

        # Track the current phase in the session
        if session_id not in conversation_history:
            conversation_history[session_id] = []
        # Count only assistant messages to determine phase
        current_phase = len([msg for msg in conversation_history[session_id] if msg['role'] == 'assistant'])

        # Add user's response to conversation history
        conversation_history[session_id].append({"role": "user", "content": user_text})

        # Only end the case after the CEO synthesis question (phase 5)
        if current_phase >= 5:
            # Generate a context-aware closing message
            try:
                ceo_response = user_text
                closing_prompt = f"""You are a real case interviewer. The candidate has just given their CEO recommendation:\n\n"""
                closing_prompt += ceo_response + "\n\n"
                closing_prompt += "Briefly acknowledge or react to their CEO answer in a professional, realistic way (1-2 sentences). Then say: 'The case has now ended, thank you.' Do not provide feedback or a score."
                response = client.chat.completions.create(
                    model="gpt-4",
                    messages=[
                        {"role": "system", "content": closing_prompt}
                    ]
                )
                closing_message = response.choices[0].message.content.strip()
            except Exception as e:
                logger.error(f"Error generating closing message: {str(e)}")
                closing_message = "Thank you for your recommendation. The case has now ended, thank you."
            # Mark session as ended
            ended_sessions.add(session_id)

            # Generate feedback card
            feedback_report = None
            try:
                session_answer_keys = answer_keys.get(session_id, None)
                user_transcript = '\n\n'.join([msg['content'] for msg in conversation_history[session_id] if msg['role'] == 'user'])
                if session_answer_keys:
                    feedback_prompt = f"""You are a Bain & Company case interviewer providing detailed feedback. \nEvaluate the interviewee's performance against these answer keys:\n\nFramework Answer Key:\n{session_answer_keys['framework']}\n\nQuantitative Answer Key:\n{session_answer_keys['quantitative']}\n\nQualitative Answer Key:\n{session_answer_keys['qualitative']}\n\nCEO Synthesis Answer Key:\n{session_answer_keys['ceo_synthesis']}\n\nCandidate's Transcript:\n{user_transcript}\n\nEvaluate the interviewee's performance as follows:\n- Give an overall score out of 100\n- Provide a breakdown of the score for each question type:\n    1. Framework (out of 25)\n    2. Quantitative (out of 25)\n    3. Qualitative (out of 25)\n    4. Recommendation/Synthesis (out of 25)\n- For each section, explain how their answer compared to the answer key\n- Provide specific, actionable feedback for improvement\n- Highlight what went well, where they went wrong, and what you wanted to see from them\n- Be concise, professional, and realistic."""
                    feedback_response = client.chat.completions.create(
                        model="gpt-4",
                        messages=[
                            {"role": "system", "content": feedback_prompt}
                        ]
                    )
                    feedback_report = feedback_response.choices[0].message.content
                else:
                    feedback_report = "Thank you for completing the case. (No answer keys available for detailed feedback.)"
            except Exception as e:
                logger.error(f"Error generating feedback: {str(e)}")
                feedback_report = "Thank you for completing the case. (Feedback generation failed.)"
            return {
                "transcript": user_text,
                "response": closing_message,
                "audio_url": "",
                "feedback_report": feedback_report
            }

        # Use a specific prompt for each phase
        if current_phase < len(PHASE_PROMPTS):
            phase_prompt = PHASE_PROMPTS[current_phase]
        else:
            phase_prompt = "Continue the case."

        # Generate GPT-4 response for the case continuation
        messages = [
            {"role": "system", "content": phase_prompt}
        ]
        messages.extend(conversation_history[session_id])

        response = client.chat.completions.create(
            model="gpt-4",
            messages=messages
        )
        case_response = response.choices[0].message.content

        # Grammar correction step
        correction_prompt = f"Correct any spelling or grammar mistakes in the following text. Return only the corrected version, no extra commentary:\n\n{case_response}"
        correction_response = client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are a helpful assistant that only returns the corrected text."},
                {"role": "user", "content": correction_prompt}
            ]
        )
        corrected_case_response = correction_response.choices[0].message.content.strip()

        # Add AI's response to conversation history
        conversation_history[session_id].append({"role": "assistant", "content": corrected_case_response})

        # Generate speech using OpenAI TTS
        try:
            speech_response = client.audio.speech.create(
                model="tts-1",
                voice="alloy",
                input=corrected_case_response
            )

            # Save the audio response with session_id in filename
            audio_filename = f"{session_id}_response_{len(list(AUDIO_DIR.glob(f'{session_id}_response_*.mp3')))}.mp3"
            audio_path = AUDIO_DIR / audio_filename
            speech_response.stream_to_file(audio_path)

            return {
                "transcript": user_text,
                "response": corrected_case_response,
                "audio_url": f"/audio/{audio_filename}"
            }
        except Exception as e:
            logger.error(f"OpenAI TTS API error: {str(e)}")
            return {
                "transcript": user_text,
                "response": corrected_case_response,
                "error": "Speech generation failed"
            }
    except Exception as e:
        logger.error(f"Error handling file upload or text input: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/get-feedback")
async def get_feedback(request: FeedbackRequest):
    try:
        if request.session_id not in answer_keys:
            raise HTTPException(status_code=400, detail="No answer keys found for this session")

        # Get the answer keys for this session
        session_answer_keys = answer_keys[request.session_id]

        # Generate feedback using GPT-4 with access to answer keys
        feedback_prompt = f"""You are a Bain & Company case interviewer providing detailed feedback. 
Evaluate the interviewee's performance against these answer keys:

Framework Answer Key:
{session_answer_keys['framework']}

Quantitative Answer Key:
{session_answer_keys['quantitative']}

Qualitative Answer Key:
{session_answer_keys['qualitative']}

CEO Synthesis Answer Key:
{session_answer_keys['ceo_synthesis']}

Candidate's Transcript:
{request.transcript}

Evaluate the interviewee's performance as follows:
- Give an overall score out of 100
- Provide a breakdown of the score for each question type:
    1. Framework (out of 25)
    2. Quantitative (out of 25)
    3. Qualitative (out of 25)
    4. Recommendation/Synthesis (out of 25)
- For each section, explain how their answer compared to the answer key
- Provide specific, actionable feedback for improvement
- Highlight what went well, where they went wrong, and what you wanted to see from them
- Be concise, professional, and realistic."""

        response = client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": feedback_prompt}
            ]
        )
        
        feedback = response.choices[0].message.content
        
        return {
            "feedback": feedback
        }
    except Exception as e:
        logger.error(f"Error generating feedback: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/initial-question")
async def get_initial_question(
    length: str = Query('standard'),
    type: str = Query('market_entry'),
    style: str = Query('standard'),
    industry: str = Query('general'),
    session_id: str = Query(...)
):
    try:
        # Generate initial case question using GPT-4
        logger.info("Generating initial question with GPT-4...")
        style_map = {
            'standard': 'balanced and professional',
            'friendly': 'friendly and encouraging',
            'challenging': 'challenging and rigorous',
            'socratic': 'Socratic, asking probing questions'
        }
        type_map = {
            'market_entry': 'market entry',
            'profitability': 'profitability',
            'ma': 'mergers and acquisitions',
            'pricing': 'pricing strategy',
            'growth': 'growth strategy',
            'operations': 'operations',
            'other': 'other business'
        }
        industry_map = {
            'general': 'any industry',
            'tech': 'technology',
            'healthcare': 'healthcare',
            'retail': 'retail',
            'finance': 'finance',
            'energy': 'energy',
            'consumer_goods': 'consumer goods',
            'other': 'any industry'
        }
        length_map = {
            'mini': 'short, focused case that can be completed in 5 minutes',
            'standard': 'standard case for a 20-minute interview',
            'full': 'comprehensive, multi-part case for a 45-minute session'
        }
        style_desc = style_map.get(style, 'balanced and professional')
        type_desc = type_map.get(type, 'business')
        industry_desc = industry_map.get(industry, 'any industry')
        length_desc = length_map.get(length, 'standard case for a 20-minute interview')
        prompt = f"""
You are a real case interviewer. Introduce the case as you would in a real interview: begin with a natural spoken introduction, including a creative case name and a concise overview of the business and the problem (maximum 4 sentences). Do not use any labels, section headers, or meta-language such as 'Case Name:', 'Prompt:', or 'Introduction:'. After the introduction, naturally invite the candidate to ask clarifying questions about the company, market, or objective. Only say what you would actually say aloud. Be concise, professional, and realistic.
Case style: {style_desc}. Case type: {type_desc}. Industry: {industry_desc}. Length: {length_desc}.
"""
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": prompt},
                {"role": "user", "content": "Generate a case interview question."}
            ]
        )
        
        question = response.choices[0].message.content

        # Grammar correction step for initial question
        correction_prompt = f"Correct any spelling or grammar mistakes in the following text. Return only the corrected version, no extra commentary:\n\n{question}"
        correction_response = client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are a helpful assistant that only returns the corrected text."},
                {"role": "user", "content": correction_prompt}
            ]
        )
        corrected_question = correction_response.choices[0].message.content.strip()

        # Generate answer keys for each phase
        answer_key_prompt = f"""Based on the case you just generated, create detailed answer keys for each phase:
1. Framework: What would be a strong, MECE framework for this case?
2. Quantitative: What would be the correct calculation and interpretation?
3. Qualitative: What would be a strong qualitative analysis?
4. CEO Synthesis: What would be an excellent final recommendation?

Format your response as a JSON object with these keys: framework, quantitative, qualitative, ceo_synthesis.
Only return the JSON object, no other text."""

        answer_key_response = client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are a helpful assistant that only returns JSON."},
                {"role": "user", "content": answer_key_prompt}
            ]
        )
        
        # Store the answer keys for this session
        answer_keys[session_id] = json.loads(answer_key_response.choices[0].message.content)

        # Initialize conversation history for this session
        conversation_history[session_id] = [
            {"role": "assistant", "content": corrected_question}
        ]

        # Generate speech using OpenAI TTS
        logger.info("Generating speech with OpenAI TTS...")
        try:
            speech_response = client.audio.speech.create(
                model="tts-1",
                voice="alloy",
                input=corrected_question
            )

            # Save the audio response to the audio directory with session_id in filename
            audio_filename = f"{session_id}_question_{len(list(AUDIO_DIR.glob(f'{session_id}_question_*.mp3')))}.mp3"
            audio_path = AUDIO_DIR / audio_filename
            speech_response.stream_to_file(audio_path)

            return InterviewResponse(
                text=corrected_question,
                audio_url=f"/audio/{audio_filename}"
            )
        except Exception as e:
            logger.error(f"OpenAI TTS API error: {str(e)}")
            return JSONResponse(
                status_code=200,
                content={
                    "text": corrected_question,
                    "audio_url": "",
                    "error": "Speech generation failed. Please check your OpenAI API key and quota."
                }
            )

    except Exception as e:
        logger.error(f"Error generating question: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/hint")
async def get_hint(request: HintRequest):
    try:
        messages = [
            {"role": (m["role"] if m["role"] != "ai" else "assistant"), "content": m["text"]} for m in request.conversation
        ]
        messages.insert(0, {
            "role": "system",
            "content": """You are a Bain & Company case interviewer. The candidate is working through a case. Provide a helpful hint that:
1. Is EXACTLY 2-3 sentences total
2. Nudges them in the right direction
3. Focuses on the most relevant lever or insight
4. Maintains the professional tone
5. Does not give away the answer directly
6. Encourages quantitative analysis where appropriate

Keep your response brief and impactful."""
        })
        response = client.chat.completions.create(
            model="gpt-4",
            messages=messages + [
                {"role": "user", "content": "Can I have a hint?"}
            ]
        )
        hint = response.choices[0].message.content
        return {"hint": hint}
    except Exception as e:
        logger.error(f"Error generating hint: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# --- Auth Endpoints ---

@app.post("/api/register")
def register(user: UserRegister):
    logger.info(f"Register attempt: {user.email}")
    if get_user(user.email):
        logger.error("Email already registered")
        raise HTTPException(status_code=400, detail="Email already registered")
    hashed = get_password_hash(user.password)
    try:
        c.execute("INSERT INTO users (email, hashed_password) VALUES (?, ?)", (user.email, hashed))
        conn.commit()
        logger.info(f"User registered: {user.email}")
        return {"msg": "User registered successfully"}
    except Exception as e:
        logger.error(f"Registration DB error: {str(e)}")
    c.execute("INSERT INTO users (email, hashed_password) VALUES (?, ?)", (user.email, hashed))
    conn.commit()
    return {"msg": "User registered successfully"}

@app.post("/api/login")
def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = get_user(form_data.username)
    if not user or not verify_password(form_data.password, user["hashed_password"]):
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    access_token = create_access_token(data={"sub": user["email"], "user_id": user["id"]})
    return {"access_token": access_token, "token_type": "bearer"}

# --- Case History Endpoints ---

def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=401,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: int = payload.get("user_id")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    user = get_user_by_id(user_id)
    if user is None:
        raise credentials_exception
    return user

@app.post("/api/save_case")
def save_case(case: CaseRecord, user=Depends(get_current_user)):
    c.execute("INSERT INTO cases (user_id, date, type, length, style, industry, score, feedback) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        (user["id"], case.date, case.type, case.length, case.style, case.industry, case.score, case.feedback))
    conn.commit()
    return {"msg": "Case saved"}

@app.get("/api/case_history")
def case_history(user=Depends(get_current_user)):
    c.execute("SELECT date, type, length, style, industry, score, feedback FROM cases WHERE user_id=? ORDER BY id DESC", (user["id"],))
    rows = c.fetchall()
    return [
        {"date": r[0], "type": r[1], "length": r[2], "style": r[3], "industry": r[4], "score": r[5], "feedback": r[6]}
        for r in rows
    ] 

# Endpoint to clean up audio files for a session
@app.post("/api/cleanup-audio")
async def cleanup_audio(session_id: str = Form(...)):
    try:
        pattern = str(AUDIO_DIR / f"{session_id}_*.mp3")
        files = glob.glob(pattern)
        for f in files:
            os.remove(f)
        return {"status": "success", "deleted": len(files)}
    except Exception as e:
        logger.error(f"Error cleaning up audio files: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/end-case")
async def end_case(session_id: str = Form(...)):
    # Simulate the rest of the case, assign 0s for skipped sections, and generate feedback
    if session_id in ended_sessions:
        return {"status": "already ended"}
    if session_id not in conversation_history:
        return {"status": "no session"}
    # Determine which phases are missing
    user_phases = [msg['role'] for msg in conversation_history[session_id] if msg['role'] == 'user']
    num_phases = len([msg for msg in conversation_history[session_id] if msg['role'] == 'assistant'])
    # Simulate skipped phases
    while num_phases < 5:
        conversation_history[session_id].append({"role": "user", "content": "[No answer provided for this section]"})
        num_phases += 1
    ended_sessions.add(session_id)
    # Generate feedback as in /api/transcribe
    feedback_text = "Thank you for completing the case. Here is your feedback and score:"
    try:
        session_answer_keys = answer_keys.get(session_id, None)
        # Ensure every section has an answer or a skipped marker
        user_answers = [msg['content'] for msg in conversation_history[session_id] if msg['role'] == 'user']
        while len(user_answers) < 4:
            user_answers.append('[No answer provided for this section]')
        user_transcript = '\n\n'.join(user_answers)
        if session_answer_keys:
            feedback_prompt = f"""You are a Bain & Company case interviewer providing detailed feedback. 
Evaluate the interviewee's performance against these answer keys:

Framework Answer Key:
{session_answer_keys['framework']}

Quantitative Answer Key:
{session_answer_keys['quantitative']}

Qualitative Answer Key:
{session_answer_keys['qualitative']}

CEO Synthesis Answer Key:
{session_answer_keys['ceo_synthesis']}

Candidate's Transcript:
{user_transcript}

Evaluate the interviewee's performance as follows:
- Give an overall score out of 100
- Provide a breakdown of the score for each question type:
    1. Framework (out of 25)
    2. Quantitative (out of 25)
    3. Qualitative (out of 25)
    4. Recommendation/Synthesis (out of 25)
- For each section, explain how their answer compared to the answer key
- For any section skipped, assign a score of 0 and note it was skipped. Do not give partial credit for awareness or intent if no answer was given.
- Provide specific, actionable feedback for improvement
- Highlight what went well, where they went wrong, and what you wanted to see from them
- Be concise, professional, and realistic."""
            response = client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": feedback_prompt}
                ]
            )
            feedback_text = response.choices[0].message.content
        else:
            feedback_text = "Thank you for completing the case. (No answer keys available for detailed feedback.)"
    except Exception as e:
        logger.error(f"Error generating feedback: {str(e)}")
        feedback_text = "Thank you for completing the case. (Feedback generation failed.)"
    return {"feedback_report": feedback_text}

@app.post("/api/tts")
async def tts_endpoint(request: TTSRequest):
    audio_url = await generate_tts(request.text)
    return {"audio_url": audio_url}

@app.get("/audio/{filename}")
async def serve_audio(filename: str):
    filepath = AUDIO_DIR / filename
    if not filepath.exists():
        raise HTTPException(status_code=404, detail="Audio file not found.")
    return FileResponse(filepath, media_type="audio/mpeg")

# Session model
@dataclass
class Session:
    # Required fields (no defaults)
    case_type: str
    industry: str
    interviewer_style: str
    
    # Optional fields (with defaults)
    user_id: Optional[str] = None
    current_stage: Stage = Stage.INTRO
    questions_asked: List[str] = field(default_factory=list)
    answers_received: Dict[Stage, str] = field(default_factory=dict)
    scores: Dict[str, int] = field(default_factory=dict)
    ai_feedback: Dict[str, str] = field(default_factory=dict)
    is_active: bool = True
    clarifying_questions: List[Dict[str, str]] = field(default_factory=list)  # Store Q&A pairs
    framework_answer: Optional[str] = None  # Store the final framework answer
    quantitative_answer: Optional[str] = None  # Store the quantitative answer
    selected_bucket: Optional[str] = None  # Store the selected framework bucket for quantitative analysis
    qualitative_answer: Optional[str] = None  # Store the qualitative answer
    ceo_synthesis_answer: Optional[str] = None  # Store the CEO synthesis answer
    answer_keys: Optional[Dict[str, str]] = None  # Store the answer keys for scoring

# Store sessions
SESSIONS: Dict[str, Session] = {}

def get_session(session_id: str) -> Optional[Session]:
    """Get a session by ID."""
    return SESSIONS.get(session_id)

# Request/Response models
class StartCaseRequest(BaseModel):
    case_type: str
    industry: str
    interviewer_style: str
    user_id: Optional[str] = None

class AnswerRequest(BaseModel):
    session_id: str
    text: str

# Utility functions
async def generate_tts(text: str) -> str:
    """Generate TTS audio and return the URL."""
    try:
        # Use synchronous call since OpenAI client is not async
        response = client.audio.speech.create(
            model="tts-1",
            voice="alloy",
            input=text
        )
        # Generate unique filename
        filename = f"{uuid.uuid4()}.mp3"
        filepath = AUDIO_DIR / filename
        # Save audio file
        response.stream_to_file(str(filepath))
        return f"/audio/{filename}"
    except Exception as e:
        logger.error(f"TTS generation failed: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate audio")

async def call_openai_with_retry(prompt: str, max_retries: int = 3) -> str:
    """Call OpenAI with exponential backoff retry."""
    for attempt in range(max_retries):
        try:
            # Use synchronous call since OpenAI client is not async
            response = client.chat.completions.create(
                model="gpt-4-turbo-preview",
                messages=[{"role": "system", "content": prompt}],
                temperature=0
            )
            return response.choices[0].message.content
        except Exception as e:
            if attempt == max_retries - 1:
                raise HTTPException(status_code=500, detail="OpenAI API call failed")
            wait_time = (2 ** attempt) * 1.0
            time.sleep(wait_time)

async def grade_session(session: Session) -> dict:
    """Grade the session using GPT and return structured feedback."""
    # Build the complete transcript
    user_transcript = "\n\n".join([
        f"Framework: {session.framework_answer}",
        f"Quantitative: {session.quantitative_answer}",
        f"Qualitative: {session.qualitative_answer}",
        f"CEO Synthesis: {session.ceo_synthesis_answer}"
    ])
    
    # Prepare the scoring prompt
    scoring_prompt = f"""You are a Bain & Company case interviewer providing detailed feedback. 
Evaluate the interviewee's performance against these answer keys:

Framework Answer Key:
{session.answer_keys['framework']}

Quantitative Answer Key:
{session.answer_keys['quantitative']}

Qualitative Answer Key:
{session.answer_keys['qualitative']}

CEO Synthesis Answer Key:
{session.answer_keys['ceo_synthesis']}

Candidate's Transcript:
{user_transcript}

Evaluate the interviewee's performance as follows:
- Give an overall score out of 100
- Provide a breakdown of the score for each question type:
    1. Framework (out of 25)
    2. Quantitative (out of 25)
    3. Qualitative (out of 25)
    4. Recommendation/Synthesis (out of 25)
- For each section, explain how their answer compared to the answer key
- Provide specific, actionable feedback for improvement
- Highlight what went well, where they went wrong, and what you wanted to see from them
- Be concise, professional, and realistic."""

    # Call GPT for scoring
    response = await call_openai_with_retry(scoring_prompt)
    
    # Store the feedback
    session.ai_feedback = response
    
    # Mark session as complete
    session.is_active = False
    
    return {
        "feedback": response,
        "session_complete": True
    }

# API endpoints
@app.post("/api/start_case")
async def start_case(request: StartCaseRequest):
    """Start a new case interview session."""
    session_id = str(uuid.uuid4())
    
    # Create new session
    session = Session(
        user_id=request.user_id,
        case_type=request.case_type,
        industry=request.industry,
        interviewer_style=request.interviewer_style
    )
    SESSIONS[session_id] = session
    
    # Generate intro prompt
    prompt = PROMPTS[Stage.INTRO]
    response = await call_openai_with_retry(prompt)
    session.questions_asked.append(response)
    
    # Generate TTS
    audio_url = await generate_tts(response)
    
    return {
        "session_id": session_id,
        "stage": session.current_stage.name,
        "prompt": response,
        "audio_url": audio_url
    }

@app.post("/api/answer")
async def submit_answer(request: AnswerRequest):
    """Process a candidate's answer and advance the session."""
    session = SESSIONS.get(request.session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    if not session.is_active:
        raise HTTPException(status_code=400, detail="Session is not active")
    if session.current_stage == Stage.COMPLETE:
        raise HTTPException(status_code=400, detail="Session is already complete")
        
    # Validate answer
    if not request.text.strip():
        return {
            "status": "retry",
            "prompt": session.questions_asked[-1]  # Re-send last question
        }
    
    # Handle introduction stage
    if session.current_stage == Stage.INTRO:
        # Store the clarifying question and answer
        if session.questions_asked:
            session.clarifying_questions.append({
                "question": session.questions_asked[-1],
                "answer": request.text
            })
        
        # Check if candidate is ready to proceed
        if request.text.lower() in ["i'm ready to proceed", "let's move to structuring"]:
            # Move to framework stage
            session.current_stage = Stage.FRAMEWORK
            response = await call_openai_with_retry(PROMPTS[Stage.FRAMEWORK])
        else:
            # Continue with clarifying questions
            response = await call_openai_with_retry(PROMPTS[Stage.CLARIFY])
    # Handle framework stage
    elif session.current_stage == Stage.FRAMEWORK:
        # Count distinct buckets in the framework
        buckets = [b.strip() for b in request.text.split('\n') if b.strip()]
        if len(buckets) < 3:
            # Reprompt for more structure
            response = await call_openai_with_retry(PROMPTS[Stage.FRAMEWORK])
        else:
            # Store the framework answer
            session.framework_answer = request.text
            # Select a bucket for quantitative analysis
            session.selected_bucket = buckets[0]  # Select first bucket by default
            # Move to quantitative stage
            session.current_stage = Stage.QUANT
            response = await call_openai_with_retry(PROMPTS[Stage.QUANT].format(bucket=session.selected_bucket))
    # Handle quantitative stage
    elif session.current_stage == Stage.QUANT:
        # Store the quantitative answer
        session.quantitative_answer = request.text
        
        # Check if the answer is correct using GPT
        check_prompt = f"""You are a case interviewer evaluating a quantitative answer.
Candidate's answer: {request.text}
Expected answer: {session.questions_asked[-1]}  # Contains the correct answer

Evaluate if the candidate's answer is correct. Consider:
1. Final numerical result
2. Calculation approach
3. Assumptions made

Return a JSON response with:
{{
    "is_correct": boolean,
    "feedback": "Brief feedback on the answer",
    "should_proceed": boolean
}}"""

        evaluation = await call_openai_with_retry(check_prompt)
        eval_result = json.loads(evaluation)
        
        if eval_result["is_correct"]:
            # Move to qualitative stage
            session.current_stage = Stage.QUAL
            response = await call_openai_with_retry(PROMPTS[Stage.QUAL].format(result=session.quantitative_answer))
        else:
            # Offer retry or correction
            response = f"{eval_result['feedback']}\n\nWould you like to try again or shall we move on?"
    # Handle qualitative stage
    elif session.current_stage == Stage.QUAL:
        # Store the qualitative answer
        session.qualitative_answer = request.text
        
        # Check if the answer has enough ideas
        check_prompt = f"""You are a case interviewer evaluating a qualitative answer.
Candidate's answer: {request.text}

Evaluate if the answer has sufficient depth. Consider:
1. Number of unique ideas/suggestions (need at least 2-3)
2. Quality of interpretation
3. Practicality of suggestions

Return a JSON response with:
{{
    "has_sufficient_ideas": boolean,
    "num_ideas": integer,
    "feedback": "Brief feedback on the answer",
    "should_proceed": boolean
}}"""

        evaluation = await call_openai_with_retry(check_prompt)
        eval_result = json.loads(evaluation)
        
        if eval_result["has_sufficient_ideas"]:
            # Move to CEO synthesis stage
            session.current_stage = Stage.CEO_SYNTH
            response = await call_openai_with_retry(PROMPTS[Stage.CEO_SYNTH])
        else:
            # Reprompt for more ideas
            response = f"{eval_result['feedback']}\n\nCould you please provide more specific ideas or examples? We're looking for at least 2-3 concrete suggestions."
    # Handle CEO synthesis stage
    elif session.current_stage == Stage.CEO_SYNTH:
        # Store the CEO synthesis answer
        session.ceo_synthesis_answer = request.text
        
        # Check if the answer has all required elements
        check_prompt = f"""You are a case interviewer evaluating a CEO synthesis.
Candidate's answer: {request.text}

Evaluate if the answer includes all required elements:
1. Clear strategy recommendation
2. Key facts and data supporting the recommendation
3. At least 2-3 risks
4. At least 2-3 mitigation strategies/next steps

Return a JSON response with:
{{
    "has_all_elements": boolean,
    "missing_elements": ["list of missing elements"],
    "feedback": "Brief feedback on the answer",
    "should_proceed": boolean
}}"""

        evaluation = await call_openai_with_retry(check_prompt)
        eval_result = json.loads(evaluation)
        
        if eval_result["has_all_elements"]:
            # Move to scoring stage
            session.current_stage = Stage.COMPLETE
            feedback = await grade_session(session)
            return {
                "done": True,
                "feedback": feedback
            }
        else:
            # Reprompt for missing elements
            response = f"{eval_result['feedback']}\n\nPlease ensure your recommendation includes: {', '.join(eval_result['missing_elements'])}"
    else:
        # Store answer for other stages
        session.answers_received[session.current_stage] = request.text
        
        # Advance stage
        if session.current_stage == Stage.CEO_SYNTH:
            session.current_stage = Stage.COMPLETE
            feedback = await grade_session(session)
            return {
                "done": True,
                "feedback": feedback
            }
        else:
            session.current_stage = Stage(session.current_stage.value + 1)
            response = await call_openai_with_retry(PROMPTS[session.current_stage])
    
    # Store the question
    session.questions_asked.append(response)
    
    # Generate TTS
    audio_url = await generate_tts(response)
    
    return {
        "stage": session.current_stage.name,
        "prompt": response,
        "audio_url": audio_url
    }

@app.post("/api/end_case")
async def end_case(session_id: str = Form(...)):
    """End a case interview session and generate final feedback."""
    session = SESSIONS.get(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    if not session.is_active:
        raise HTTPException(status_code=400, detail="Session is already inactive")
        
    # Mark session inactive
    session.is_active = False
    
    # Fill in missing answers with empty strings
    for stage in Stage:
        if stage not in session.answers_received:
            session.answers_received[stage] = ""
    
    # Generate final feedback
    feedback = await grade_session(session)
    return feedback

# Periodic cleanup of old audio files (older than 20 minutes)
@app.on_event("startup")
async def startup_event():
    async def cleanup_old_audio():
        while True:
            try:
                now = time.time()
                for audio_file in AUDIO_DIR.glob("*.mp3"):
                    if now - audio_file.stat().st_mtime > AUDIO_EXPIRY_MINUTES * 60:
                        audio_file.unlink()
            except Exception as e:
                logger.error(f"Error cleaning up audio files: {e}")
            await asyncio.sleep(300)  # Run every 5 minutes
    asyncio.create_task(cleanup_old_audio()) 

@app.post("/score")
async def score_interview(
    session_id: str,
    client: OpenAI = Depends(get_openai_client)
):
    """Score the interview using the progressive grading system."""
    session = get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    if session.current_stage != Stage.COMPLETE:
        raise HTTPException(
            status_code=400,
            detail="Interview must be complete before scoring"
        )
    
    try:
        # Calculate progressive score using new grading system
        score_result = await calculate_progressive_score(session, client)
        
        # Store the score in the session
        session.final_score = score_result["total_score"]
        session.score_breakdown = score_result["stage_breakdown"]
        session.feedback = {
            "strengths": score_result["strengths"],
            "areas_for_improvement": score_result["areas_for_improvement"],
            "recommendations": score_result["recommendations"]
        }
        
        return {
            "status": "success",
            "score": score_result["total_score"],
            "breakdown": score_result["stage_breakdown"],
            "feedback": {
                "strengths": score_result["strengths"],
                "areas_for_improvement": score_result["areas_for_improvement"],
                "recommendations": score_result["recommendations"]
            }
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error calculating score: {str(e)}"
        )

async def evaluate_answer(
    stage: Stage,
    answer: str,
    answer_key: Dict[str, Any],
    questions: List[str],
    client: OpenAI,
    session: Session
) -> Dict[str, Any]:
    """Evaluate an answer using the progressive grading system."""
    try:
        # Use the new grading system to evaluate the stage
        stage_score = await evaluate_stage(
            stage=stage,
            answer=answer,
            answer_key=answer_key,
            questions=questions,
            client=client
        )
        
        # Calculate transition quality
        transition_score = calculate_transition_quality(
            stage,
            session.answers_received,
            questions,
            client
        )
        stage_score.transition_quality = transition_score
        
        # Generate feedback
        feedback = generate_stage_feedback(stage, stage_score)
        
        return {
            "score": stage_score.base_score,
            "bonus_points": stage_score.bonus_points,
            "penalty_points": stage_score.penalty_points,
            "quality_metrics": stage_score.quality_metrics,
            "transition_quality": transition_score,
            "feedback": feedback
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error evaluating answer: {str(e)}"
        )

def extract_framework_buckets(answer: str) -> List[str]:
    """Extract framework buckets from the answer text."""
    # Split by newlines and common separators, filter empty lines
    buckets = [b.strip() for b in answer.replace('•', '\n').replace('-', '\n').split('\n') if b.strip()]
    # Remove any lines that are too short or don't look like buckets
    return [b for b in buckets if len(b) > 3 and not b.startswith(('1.', '2.', '3.', 'a.', 'b.', 'c.'))]

def extract_calculations(answer: str) -> List[str]:
    """Extract calculations from the answer text."""
    # Split by sentences and look for calculation patterns
    sentences = [s.strip() for s in answer.replace('!', '.').replace('?', '.').split('.') if s.strip()]
    calculations = []
    for sentence in sentences:
        # Look for sentences containing numbers and calculation keywords
        if any(keyword in sentence.lower() for keyword in ['calculate', 'compute', 'total', 'sum', 'multiply', 'divide']) and \
           any(c.isdigit() for c in sentence):
            calculations.append(sentence)
    return calculations

def extract_qualitative_elements(answer: str) -> List[str]:
    """Extract qualitative analysis elements from the answer text."""
    # Split by sentences and look for qualitative analysis patterns
    sentences = [s.strip() for s in answer.replace('!', '.').replace('?', '.').split('.') if s.strip()]
    elements = []
    for sentence in sentences:
        # Look for sentences containing qualitative analysis keywords
        if any(keyword in sentence.lower() for keyword in [
            'strategy', 'market', 'competition', 'customer', 'brand', 'quality',
            'process', 'efficiency', 'risk', 'opportunity', 'threat', 'strength',
            'weakness', 'advantage', 'disadvantage'
        ]):
            elements.append(sentence)
    return elements

def extract_recommendations(answer: str) -> List[str]:
    """Extract recommendations from the answer text."""
    # Split by sentences and look for recommendation patterns
    sentences = [s.strip() for s in answer.replace('!', '.').replace('?', '.').split('.') if s.strip()]
    recommendations = []
    for sentence in sentences:
        # Look for sentences containing recommendation keywords
        if any(keyword in sentence.lower() for keyword in [
            'recommend', 'suggest', 'propose', 'advise', 'should', 'must', 'need to',
            'recommendation', 'suggestion', 'proposal'
        ]):
            recommendations.append(sentence)
    return recommendations

def extract_risks(answer: str) -> List[str]:
    """Extract risks from the answer text."""
    # Split by sentences and look for risk patterns
    sentences = [s.strip() for s in answer.replace('!', '.').replace('?', '.').split('.') if s.strip()]
    risks = []
    for sentence in sentences:
        # Look for sentences containing risk keywords
        if any(keyword in sentence.lower() for keyword in [
            'risk', 'threat', 'challenge', 'concern', 'vulnerability', 'exposure',
            'danger', 'hazard', 'pitfall', 'drawback', 'weakness'
        ]):
            risks.append(sentence)
    return risks

def extract_mitigations(answer: str) -> List[str]:
    """Extract risk mitigations from the answer text."""
    # Split by sentences and look for mitigation patterns
    sentences = [s.strip() for s in answer.replace('!', '.').replace('?', '.').split('.') if s.strip()]
    mitigations = []
    for sentence in sentences:
        # Look for sentences containing mitigation keywords
        if any(keyword in sentence.lower() for keyword in [
            'mitigate', 'address', 'handle', 'manage', 'reduce', 'minimize',
            'prevent', 'avoid', 'counter', 'overcome', 'solution', 'measure',
            'action', 'step', 'plan'
        ]):
            mitigations.append(sentence)
    return mitigations

def check_stage_completion(
    stage: Stage,
    answers: Dict[Stage, str],
    questions: List[str]
) -> bool:
    """Check if a stage is complete based on the new grading criteria."""
    if stage not in STAGE_GRADING_CRITERIA:
        return False
        
    criteria = STAGE_GRADING_CRITERIA[stage]
    required_elements = criteria["required_elements"]
    
    # Check if all required elements are present
    for element, required in required_elements.items():
        if required and not check_element_presence(stage, element, answers.get(stage, "")):
            return False
    
    # Check minimum requirements
    if stage == Stage.INTRO:
        return len(questions) >= 2
    elif stage == Stage.FRAMEWORK:
        return len(extract_framework_buckets(answers.get(stage, ""))) >= 3
    elif stage == Stage.QUANT:
        return len(extract_calculations(answers.get(stage, ""))) >= 2
    elif stage == Stage.QUAL:
        return len(extract_qualitative_elements(answers.get(stage, ""))) >= 3
    elif stage == Stage.CEO_SYNTH:
        return (
            len(extract_recommendations(answers.get(stage, ""))) >= 1 and
            len(extract_risks(answers.get(stage, ""))) >= 2 and
            len(extract_mitigations(answers.get(stage, ""))) >= 2
        )
    
    return True

def check_element_presence(stage: Stage, element: str, answer: str) -> bool:
    """Check if a specific element is present in the answer."""
    if not answer:
        return False
        
    if element == "understanding_demonstrated":
        return any(keyword in answer.lower() for keyword in [
            "understand", "clear", "comprehend", "grasp"
        ])
    elif element == "appropriate_questions":
        return "?" in answer
    elif element == "professional_tone":
        return not any(word in answer.lower() for word in [
            "um", "uh", "like", "you know"
        ])
    elif element == "mECE_structure":
        return any(keyword in answer.lower() for keyword in [
            "mECE", "mutually exclusive", "collectively exhaustive"
        ])
    elif element == "case_relevance":
        return any(keyword in answer.lower() for keyword in [
            "case", "problem", "situation", "context"
        ])
    elif element == "logical_flow":
        return any(keyword in answer.lower() for keyword in [
            "first", "second", "third", "finally", "therefore", "thus"
        ])
    elif element == "calculation_accuracy":
        return any(keyword in answer.lower() for keyword in [
            "calculate", "compute", "math", "number"
        ])
    elif element == "assumptions_stated":
        return "assume" in answer.lower()
    elif element == "process_explained":
        return any(keyword in answer.lower() for keyword in [
            "step", "process", "method", "approach"
        ])
    elif element == "interpretation_provided":
        return any(keyword in answer.lower() for keyword in [
            "mean", "imply", "indicate", "suggest"
        ])
    elif element == "strategic_thinking":
        return any(keyword in answer.lower() for keyword in [
            "strategy", "strategic", "long-term", "competitive"
        ])
    elif element == "implementation_considered":
        return any(keyword in answer.lower() for keyword in [
            "implement", "execute", "roll out", "deploy"
        ])
    elif element == "risks_addressed":
        return "risk" in answer.lower()
    elif element == "clear_recommendation":
        return any(keyword in answer.lower() for keyword in [
            "recommend", "suggest", "propose", "advise"
        ])
    elif element == "data_support":
        return any(keyword in answer.lower() for keyword in [
            "data", "evidence", "support", "based on"
        ])
    
    return False 