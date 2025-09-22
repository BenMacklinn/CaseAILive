import React, { useState, useEffect, useRef } from 'react';
import './App.css';

interface Response {
  text: string;
  audio_url: string;
  error?: string;
}

function App() {
  const [isRecording, setIsRecording] = useState(false);
  const [currentResponse, setCurrentResponse] = useState<Response>({ text: '', audio_url: '' });
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    // Get initial question when component mounts
    fetchInitialQuestion();
  }, []);

  const fetchInitialQuestion = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch('http://127.0.0.1:8001/api/initial-question');
      const data = await response.json();
      setCurrentResponse(data);
      
      // Play the audio if available
      if (data.audio_url && audioRef.current) {
        audioRef.current.src = `http://127.0.0.1:8001${data.audio_url}`;
        audioRef.current.play();
      }
      
      // Show error message if speech generation failed
      if (data.error) {
        setError(data.error);
      }
    } catch (error) {
      console.error('Error fetching initial question:', error);
      setError('Failed to fetch the initial question. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const startRecording = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];

      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = async () => {
        const audioBlob = new Blob(chunks, { type: 'audio/wav' });
        await sendAudioToServer(audioBlob);
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      setError('Failed to start recording. Please make sure you have granted microphone access.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  const sendAudioToServer = async (audioBlob: Blob) => {
    try {
      setIsLoading(true);
      setError(null);
      const formData = new FormData();
      formData.append('audio_file', audioBlob, 'recording.wav');

      const response = await fetch('http://127.0.0.1:8001/api/transcribe', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      setCurrentResponse(data);
      
      // Play the audio if available
      if (data.audio_url && audioRef.current) {
        audioRef.current.src = `http://127.0.0.1:8001${data.audio_url}`;
        audioRef.current.play();
      }

      // Show error message if speech generation failed
      if (data.error) {
        setError(data.error);
      }
    } catch (error) {
      console.error('Error sending audio:', error);
      setError('Failed to process your response. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Case Interview AI</h1>
        
        {isLoading ? (
          <div className="loading">Processing...</div>
        ) : (
          <>
            <div className="question-box">
              <h3>Current Question/Response:</h3>
              <p>{currentResponse.text}</p>
            </div>

            {error && (
              <div className="error-message">
                <p>{error}</p>
                {error.includes('ElevenLabs') && (
                  <p className="error-hint">The conversation will continue with text only.</p>
                )}
              </div>
            )}

            <div className="controls">
              <button
                onClick={isRecording ? stopRecording : startRecording}
                className={isRecording ? 'recording' : ''}
                disabled={isLoading}
              >
                {isRecording ? 'Stop Recording' : 'Start Recording'}
              </button>
            </div>

            {currentResponse.audio_url && (
              <audio ref={audioRef} controls style={{ marginTop: '20px' }} />
            )}
          </>
        )}
      </header>
    </div>
  );
}

export default App; 