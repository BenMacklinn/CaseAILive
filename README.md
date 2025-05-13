# Case Interview Simulator

An interactive web application that simulates a spoken case interview between a user and an AI interviewer. The application uses GPT-4 for generating questions and evaluating responses, Whisper for speech-to-text, and ElevenLabs for text-to-speech.

## Features

- Real-time audio recording with waveform visualization
- Automatic speech-to-text transcription
- AI-powered case interview questions and feedback
- Natural-sounding voice responses
- Clean, modern UI with Material-UI components

## Prerequisites

- Python 3.8+
- Node.js 14+
- OpenAI API key
- ElevenLabs API key

## Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd case-interview-simulator
```

2. Set up the backend:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

3. Create a `.env` file in the backend directory:
```
OPENAI_API_KEY=your_openai_api_key
ELEVENLABS_API_KEY=your_elevenlabs_api_key
```

4. Set up the frontend:
```bash
cd frontend
npm install
```

## Running the Application

1. Start the backend server:
```bash
cd backend
uvicorn app.main:app --reload
```

2. Start the frontend development server:
```bash
cd frontend
npm start
```

3. Open your browser and navigate to `http://localhost:3000`

## Usage

1. When the application loads, you'll receive an initial case interview question via audio and text.
2. Click the "Start Recording" button to begin your response.
3. Speak your answer clearly into your microphone.
4. Click "Stop Recording" when you're done.
5. The application will transcribe your response, send it to GPT-4 for evaluation, and play back the AI's response.
6. Continue the conversation by recording your next response.

## Technical Stack

- Frontend:
  - React
  - Material-UI
  - Web Audio API
  - MediaRecorder API
  - Axios

- Backend:
  - FastAPI
  - OpenAI GPT-4
  - OpenAI Whisper
  - ElevenLabs TTS

## License

MIT 