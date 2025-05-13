import React, { useState, useEffect, useRef } from 'react';
import { 
  Container, 
  Paper, 
  Typography, 
  Box, 
  Button,
  CircularProgress,
  Alert,
  Snackbar,
  IconButton,
  Tooltip,
  Chip,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  Grid,
  Card,
  CardContent,
  Avatar,
  useMediaQuery,
  useTheme
} from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import StopIcon from '@mui/icons-material/Stop';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import TimerIcon from '@mui/icons-material/Timer';
import FeedbackIcon from '@mui/icons-material/Feedback';
import DownloadIcon from '@mui/icons-material/Download';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import AssessmentIcon from '@mui/icons-material/Assessment';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import StarIcon from '@mui/icons-material/Star';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import BarChartIcon from '@mui/icons-material/BarChart';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import GroupIcon from '@mui/icons-material/Group';
import FastForwardIcon from '@mui/icons-material/FastForward';
import ChatIcon from '@mui/icons-material/Chat';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import VisibilityIcon from '@mui/icons-material/Visibility';
import axios from 'axios';
import newLogo from './Images/newLogo.jpg';
import { liveType } from './utils/liveType.js';
import QuickReferenceGuide from './components/QuickReferenceGuide';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import SendIcon from '@mui/icons-material/Send';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import CloseIcon from '@mui/icons-material/Close';
import ReactGA from 'react-ga4';

// Set API_BASE_URL based on environment
let API_BASE_URL;
if (typeof window !== 'undefined' && (window.location.hostname.includes('caseai.ca') || window.location.hostname.includes('onrender.com'))) {
  API_BASE_URL = 'https://benmacklinbenlewycaseai.onrender.com';
} else {
  API_BASE_URL = 'http://localhost:8000';
}

const CASE_LENGTHS = [
  { label: 'QUICK', value: 'mini' },
  { label: 'CLASSIC', value: 'standard' },
  { label: 'IN-DEPTH', value: 'full' }
];
const INTERVIEWER_STYLES = [
  { label: 'Standard (Balanced)', value: 'standard' },
  { label: 'Friendly', value: 'friendly' },
  { label: 'Challenging', value: 'challenging' },
  { label: 'Socratic', value: 'socratic' }
];
const INDUSTRIES = [
  { label: 'General', value: 'general' },
  { label: 'Tech', value: 'tech' },
  { label: 'Healthcare', value: 'healthcare' },
  { label: 'Retail', value: 'retail' },
  { label: 'Finance', value: 'finance' },
  { label: 'Energy', value: 'energy' },
  { label: 'Consumer Goods', value: 'consumer_goods' },
  { label: 'Other', value: 'other' }
];

const FINAL_ANSWER_KEYWORDS = [
  'my recommendation is', 'i recommend', 'in conclusion', 'to conclude', 'my final answer is', 'i would advise', 'i would suggest', 'i propose'
];

// Place this after imports, before any component definitions
const backgroundWrapperSx = {
  minHeight: '100vh',
  width: '100vw',
  position: 'fixed',
  top: 0,
  left: 0,
  zIndex: 0,
  overflow: 'hidden',
  background: '#f8fafc',
  pointerEvents: 'none',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: `
      repeating-linear-gradient(
        90deg,
        transparent 0,
        transparent 79px,
        rgba(0,0,0,0.08) 79px,
        rgba(0,0,0,0.08) 80px
      ),
      repeating-linear-gradient(
        0deg,
        transparent 0,
        transparent 79px,
        rgba(0,0,0,0.08) 79px,
        rgba(0,0,0,0.08) 80px
      ),
      radial-gradient(
        circle at 50% 50%,
        rgba(0,0,0,0.02) 0%,
        transparent 50%
      )
    `,
    backgroundSize: '80px 80px, 80px 80px, 100% 100%',
    animation: 'pulse 8s ease-in-out infinite',
    '@keyframes pulse': {
      '0%, 100%': {
        opacity: 0.8,
        transform: 'scale(1)',
      },
      '50%': {
        opacity: 1,
        transform: 'scale(1.02)',
      }
    }
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: `
      repeating-linear-gradient(
        90deg,
        transparent 0,
        transparent 39px,
        rgba(0,0,0,0.03) 39px,
        rgba(0,0,0,0.03) 40px
      ),
      repeating-linear-gradient(
        0deg,
        transparent 0,
        transparent 39px,
        rgba(0,0,0,0.03) 39px,
        rgba(0,0,0,0.03) 40px
      )
    `,
    backgroundSize: '80px 80px',
    animation: 'float 15s ease-in-out infinite',
    '@keyframes float': {
      '0%, 100%': {
        transform: 'translate(0, 0) rotate(0deg)',
      },
      '25%': {
        transform: 'translate(-1%, -1%) rotate(0.5deg)',
      },
      '50%': {
        transform: 'translate(1%, 1%) rotate(-0.5deg)',
      },
      '75%': {
        transform: 'translate(-1%, 1%) rotate(0.5deg)',
      }
    }
  }
};

function AuthForm({ onAuth, mode, setMode, error }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState(null);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setLocalError(null);
    try {
      if (mode === 'login') {
        const form = new FormData();
        form.append('username', email);
        form.append('password', password);
        const res = await axios.post(`${API_BASE_URL}/api/login`, form);
        onAuth(res.data.access_token);
      } else {
        await axios.post(`${API_BASE_URL}/api/register`, { email, password });
        setMode('login');
      }
    } catch (err) {
      console.error('Auth error:', err);
      setLocalError(err.response?.data?.detail || 'Authentication error');
    } finally {
      setLoading(false);
    }
  };
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f7f9fb', px: 2 }}>
      <Paper elevation={3} sx={{ p: 5, borderRadius: 3, maxWidth: 400, width: '100%' }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 2, color: '#2563eb', textAlign: 'center' }}>
          {mode === 'login' ? 'Login' : 'Sign Up'}
        </Typography>
        <form onSubmit={handleSubmit}>
          <Box sx={{ mb: 2 }}>
            <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required style={{ width: '100%', padding: 10, fontSize: 16, borderRadius: 4, border: '1px solid #ccc' }} />
          </Box>
          <Box sx={{ mb: 2 }}>
            <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required style={{ width: '100%', padding: 10, fontSize: 16, borderRadius: 4, border: '1px solid #ccc' }} />
          </Box>
          <Button type="submit" variant="contained" color="primary" fullWidth disabled={loading} startIcon={mode === 'login' ? <LockOpenIcon /> : <PersonAddIcon />}>{loading ? 'Please wait...' : (mode === 'login' ? 'Login' : 'Sign Up')}</Button>
        </form>
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          {mode === 'login' ? (
            <Button onClick={() => setMode('signup')}>Need an account? Sign Up</Button>
          ) : (
            <Button onClick={() => setMode('login')}>Already have an account? Login</Button>
          )}
        </Box>
        {(error || localError) && <Alert severity="error">{error || localError}</Alert>}
      </Paper>
    </Box>
  );
}

function CaseSettingsDialog({ open, onClose, onStart, caseOptions, setCaseOptions }) {
  // Color mapping for each section title
  const sectionColors = {
    length: '#5FE6EC',    // Softer turquoise
    style: '#8B38FF',     // Vivid purple
    industry: '#4B1A6B'   // Deep purple
  };

  const getButtonStyle = (selected, section) => ({
    color: selected ? '#fff' : '#000',
    bgcolor: selected ? sectionColors[section] : '#fff',
    border: selected ? `2.5px solid ${sectionColors[section]}` : '2px solid #000',
    borderRadius: 2,
    fontWeight: 700,
    boxShadow: selected ? '0 2px 8px rgba(0,0,0,0.10)' : 'none',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    transform: 'translateY(0)',
    '&:hover': {
      bgcolor: selected ? sectionColors[section] : '#f3f4f6',
      borderColor: selected ? sectionColors[section] : '#000',
      color: selected ? '#fff' : '#000',
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      '&::after': {
        opacity: 0.1,
        transform: 'scale(1.05)',
      }
    },
    '&::after': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: sectionColors[section],
      borderRadius: 'inherit',
      opacity: 0,
      transition: 'all 0.3s ease',
      zIndex: -1,
    }
  });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth
      PaperProps={{
        sx: {
          borderRadius: 4,
          boxShadow: '0 8px 40px rgba(0,0,0,0.12)',
          bgcolor: '#fff',
          p: 2,
          background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
          border: '1px solid rgba(0,0,0,0.1)'
        }
      }}
    >
      <DialogTitle sx={{ 
        fontWeight: 700, 
        fontSize: 28, 
        color: '#000', 
        pb: 1,
        textAlign: 'center',
        background: 'linear-gradient(45deg, #000 30%, #333 90%)',
        backgroundClip: 'text',
        textFillColor: 'transparent',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent'
      }}>
        Customize Your Practice Case
      </DialogTitle>
      <DialogContent sx={{ pb: 2 }}>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: 3, 
          mt: 1,
          '& > div': {
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateX(4px)'
            }
          }
        }}>
          {/* Case Length */}
          <Box>
            <Typography variant="subtitle2" sx={{ 
              mb: 1, 
              color: sectionColors.length, 
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              '&::before': {
                content: '""',
                display: 'block',
                width: 4,
                height: 16,
                background: sectionColors.length,
                borderRadius: 2
              }
            }}>Case Exploration Level</Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {CASE_LENGTHS.map(opt => {
                const selected = caseOptions.length === opt.value;
                return (
                  <Button
                    key={opt.value}
                    variant="outlined"
                    sx={getButtonStyle(selected, 'length')}
                    size="small"
                    onClick={() => setCaseOptions({ ...caseOptions, length: opt.value })}
                  >
                    {selected && <StarIcon sx={{ fontSize: 16, mr: 0.5 }} />}
                    {opt.label}
                  </Button>
                );
              })}
            </Box>
          </Box>
          {/* Interviewer Style */}
          <Box>
            <Typography variant="subtitle2" sx={{ 
              mb: 1, 
              color: sectionColors.style, 
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              '&::before': {
                content: '""',
                display: 'block',
                width: 4,
                height: 16,
                background: sectionColors.style,
                borderRadius: 2
              }
            }}>Interviewer Style</Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {INTERVIEWER_STYLES.map(opt => {
                const selected = caseOptions.style === opt.value;
                return (
                  <Button
                    key={opt.value}
                    variant="outlined"
                    sx={getButtonStyle(selected, 'style')}
                    size="small"
                    onClick={() => setCaseOptions({ ...caseOptions, style: opt.value })}
                  >
                    {selected && <StarIcon sx={{ fontSize: 16, mr: 0.5 }} />}
                    {opt.label}
                  </Button>
                );
              })}
            </Box>
          </Box>
          {/* Industry */}
          <Box>
            <Typography variant="subtitle2" sx={{ 
              mb: 1, 
              color: sectionColors.industry, 
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              '&::before': {
                content: '""',
                display: 'block',
                width: 4,
                height: 16,
                background: sectionColors.industry,
                borderRadius: 2
              }
            }}>Industry</Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {INDUSTRIES.map(opt => {
                const selected = caseOptions.industry === opt.value;
                return (
                  <Button
                    key={opt.value}
                    variant="outlined"
                    sx={getButtonStyle(selected, 'industry')}
                    size="small"
                    onClick={() => setCaseOptions({ ...caseOptions, industry: opt.value })}
                  >
                    {selected && <StarIcon sx={{ fontSize: 16, mr: 0.5 }} />}
                    {opt.label}
                  </Button>
                );
              })}
            </Box>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} sx={{ color: '#000', fontWeight: 600, borderRadius: 2, border: '2px solid #000', bgcolor: '#fff', px: 3, '&:hover': { bgcolor: '#f3f4f6', borderColor: '#000' } }}>Cancel</Button>
        <Button onClick={onStart} variant="contained" sx={{ color: '#fff', fontWeight: 700, borderRadius: 2, bgcolor: '#000', px: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.10)', '&:hover': { bgcolor: '#222' } }}>Continue</Button>
      </DialogActions>
    </Dialog>
  );
}

function Dashboard({ cases, onClose }) {
  const avgScore = cases.length
    ? (cases.reduce((sum, c) => sum + (c.score || 0), 0) / cases.length).toFixed(1)
    : '-';
  const mostCommonType = cases.length
    ? Object.entries(cases.reduce((acc, c) => { acc[c.type] = (acc[c.type] || 0) + 1; return acc; }, {}))
        .sort((a, b) => b[1] - a[1])[0][0]
    : '-';
  return (
    <Dialog open={true} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Case Dashboard</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle1">Total Cases: {cases.length}</Typography>
          <Typography variant="subtitle1">Average Score: {avgScore}</Typography>
          <Typography variant="subtitle1">Most Common Case Type: {mostCommonType}</Typography>
        </Box>
        <Divider sx={{ mb: 2 }} />
        <Box sx={{ maxHeight: 400, overflowY: 'auto' }}>
          {cases.length === 0 ? (
            <Typography>No cases completed yet.</Typography>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f3f4f6' }}>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Length</th>
                  <th>Style</th>
                  <th>Industry</th>
                  <th>Score</th>
                  <th>Feedback</th>
                </tr>
              </thead>
              <tbody>
                {cases.map((c, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td>{c.date}</td>
                    <td>{c.type}</td>
                    <td>{c.length}</td>
                    <td>{c.style}</td>
                    <td>{c.industry}</td>
                    <td>{c.score || '-'}</td>
                    <td>
                      <Button size="small" onClick={() => window.alert(c.feedback)}>
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}

// Shared cycling quote component for loading screens
function CyclingQuotes() {
  const quotes = React.useMemo(() => {
    const arr = [
      "You need some sun.",
      "Calm down its loading.",
      "We had budget constraints, please donate... please.",
      "Four eggs, sourdough bread, and a green apple.",
      "I'm not sure if you're ready for this.",
      "Vibe coding is hard.",
      "Hey, you look great today.",
      "UFC, KFC, GPT, Lakers in 5",
      "No tarrifs on CaseAI.",
      "Seahawks should have ran the ball.",
      "Why are you staring?",
      "Looks like you need some sleep.",
      "We spent all of our budget on this loading screen. Worth it?",
      "Sorry for the delay, blame the intern.",
      "We are hiring full stack vibe coders.",
      "Thanks for taking your time to be here! Love the CaseAI team."
    ];
    // Fisher-Yates shuffle
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }, []);
  const [quoteIndex, setQuoteIndex] = React.useState(0);
  const [fade, setFade] = React.useState(true);
  React.useEffect(() => {
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setQuoteIndex((prev) => (prev + 1) % quotes.length);
        setFade(true);
      }, 300); // fade out before changing
    }, 3500);
    return () => clearInterval(interval);
  }, [quotes.length]);
  return (
    <Typography
      sx={{
        mt: 3,
        fontSize: 18,
        background: 'linear-gradient(45deg, #5FFBF1 0%, #3BA9FF 50%, #A385FF 100%)',
        backgroundClip: 'text',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        color: 'transparent',
        minHeight: 32,
        fontWeight: 700,
        fontFamily: 'inherit',
        opacity: fade ? 1 : 0,
        transition: 'opacity 0.3s',
        textAlign: 'center',
        maxWidth: 600,
        fontStyle: 'italic',
      }}
    >
      {`"${quotes[quoteIndex]}"`}
    </Typography>
  );
}

function RainbowLoadingDots({ message = "Generating your case..." }) {
  // Animated turquoise-to-purple gradient bouncing dots
  // Remove cycling quotes logic from here, use CyclingQuotes only
  return (
    <Box sx={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      bgcolor: 'rgba(255,255,255,0.98)',
      zIndex: 2000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      transition: 'opacity 0.4s',
    }}>
      <Box sx={{ display: 'flex', gap: 2 }}>
        {[0,1,2,3].map(i => (
          <Box
            key={i}
            sx={{
              width: 22,
              height: 22,
              borderRadius: '50%',
              background: 'linear-gradient(90deg, #5FE6EC, #256EA0, #8B38FF, #4B1A6B)',
              backgroundSize: '400% 400%',
              backgroundPosition: `${i * 33}% 50%`,
              animation: `gradient-bounce 1.2s cubic-bezier(.68,-0.55,.27,1.55) infinite, gradient-wave 2.4s linear infinite`,
              animationDelay: `${i*0.18}s, ${i*0.3}s`,
              boxShadow: '0 2px 12px rgba(0,0,0,0.10)',
              mx: 1,
            }}
          />
        ))}
      </Box>
      <Typography sx={{ mt: 4, fontWeight: 700, fontSize: 22, color: '#222', letterSpacing: 1.2 }}>
        {message}
      </Typography>
      <CyclingQuotes />
      <style>{`
        @keyframes gradient-bounce {
          0%, 100% { transform: translateY(0); filter: brightness(1); }
          20% { transform: translateY(-22px) scale(1.1); filter: brightness(1.2); }
          40% { transform: translateY(0); filter: brightness(1); }
        }
        @keyframes gradient-wave {
          0% { background-position: 0% 50%; }
          100% { background-position: 100% 50%; }
        }
      `}</style>
    </Box>
  );
}

function SpeakingAnimation() {
  return (
    <Box sx={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: 0.5,
      animation: 'pulse 1s infinite',
      '@keyframes pulse': {
        '0%, 100%': { transform: 'scale(1)' },
        '50%': { transform: 'scale(1.1)' }
      }
    }}>
      <Box sx={{
        width: 4,
        height: 4,
        borderRadius: '50%',
        bgcolor: '#2563eb',
        animation: 'bounce 1s infinite',
        '@keyframes bounce': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' }
        }
      }} />
      <Box sx={{
        width: 4,
        height: 4,
        borderRadius: '50%',
        bgcolor: '#2563eb',
        animation: 'bounce 1s infinite 0.2s',
        '@keyframes bounce': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' }
        }
      }} />
      <Box sx={{
        width: 4,
        height: 4,
        borderRadius: '50%',
        bgcolor: '#2563eb',
        animation: 'bounce 1s infinite 0.4s',
        '@keyframes bounce': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' }
        }
      }} />
    </Box>
  );
}

// Logo with animated gradient outline
function LogoWithAnimatedOutline() {
  const [hovered, setHovered] = React.useState(false);
  return (
    <Box
      sx={{
        position: 'absolute',
        top: 24,
        left: 24,
        zIndex: 2,
        width: 120,
        height: 120,
        transition: 'transform 0.4s cubic-bezier(.4,2,.6,1)',
        '&:hover': {
          transform: 'translateY(-10px) scale(1.03)',
        },
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#fff', // Optional: to match the logo background
        borderRadius: '16px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.10)',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <img
        src={newLogo}
        alt="Case AI Logo"
        style={{
          maxWidth: '100%',
          maxHeight: '100%',
          objectFit: 'contain',
          borderRadius: '16px',
          display: 'block',
        }}
      />
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 120 120"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          zIndex: 2,
          pointerEvents: 'none',
        }}
      >
        <defs>
          <linearGradient id="logo-gradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#5FE6EC" />
            <stop offset="50%" stopColor="#8B38FF" />
            <stop offset="100%" stopColor="#4B1A6B" />
          </linearGradient>
        </defs>
        <rect
          x="2"
          y="2"
          width="116"
          height="116"
          rx="16"
          ry="16"
          fill="none"
          stroke="url(#logo-gradient)"
          strokeWidth="4"
          style={{
            strokeDasharray: 440,
            strokeDashoffset: hovered ? 0 : 440,
            transition: 'stroke-dashoffset 1.2s cubic-bezier(.4,2,.6,1)',
          }}
        />
      </svg>
    </Box>
  );
}

function Landing({ onStart }) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [showMobileWarning, setShowMobileWarning] = useState(false);
  const [caseOptions, setCaseOptions] = useState({ length: 'standard', style: 'standard', industry: 'general' });
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleStartClick = () => {
    if (isMobile && isMobileDevice()) {
      setShowMobileWarning(true);
    } else {
      setSettingsOpen(true);
    }
  };

  // Initialize Google Analytics 4
  useEffect(() => {
    ReactGA.initialize('G-DL2R9PEKTX');
    ReactGA.send({ hitType: 'pageview', page: window.location.pathname + window.location.search });
  }, []);

  return (
    <Box sx={backgroundWrapperSx}>
      <Box sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        pointerEvents: 'auto',
        px: { xs: 1, md: 0 },
      }}>
        <LogoWithAnimatedOutline />
        {/* Welcome and Slogan, reorganized for mobile */}
        <Box sx={{
          mb: { xs: 3, md: 8 },
          mt: { xs: 2, md: 0 },
          textAlign: 'center',
          width: '100%',
          maxWidth: 700,
          mx: 'auto',
          animation: 'fadeInUp 1s ease-out',
          '@keyframes fadeInUp': {
            '0%': {
              opacity: 0,
              transform: 'translateY(20px)'
            },
            '100%': {
              opacity: 1,
              transform: 'translateY(0)'
            }
          }
        }}>
          <Typography
            variant="h1"
            sx={{
              fontSize: { xs: '2.3rem', md: '4rem' }, // bigger on mobile
              fontWeight: 800,
              background: 'linear-gradient(45deg, #5FFBF1 0%, #3BA9FF 50%, #A385FF 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: { xs: 1, md: 2 },
              letterSpacing: '-0.02em',
              backgroundSize: '300% 100%',
              animation: 'gradientFlow 6s ease-in-out infinite alternate',
              transition: 'transform 0.4s cubic-bezier(.4,2,.6,1)',
              cursor: 'pointer',
              '@keyframes gradientFlow': {
                '0%': { backgroundPosition: '0% 50%' },
                '100%': { backgroundPosition: '100% 50%' },
              },
              '&:hover': {
                transform: 'translateY(-8px) scale(1.03)',
              },
            }}
          >
            Welcome to Case AI
          </Typography>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 500,
              maxWidth: '700px',
              mx: 'auto',
              mb: { xs: 3, md: 4 }, // more space below slogan on mobile
              fontSize: { xs: '1.13rem', md: '1.25rem' }, // bigger on mobile
              letterSpacing: '0.12em',
              color: '#111',
              textShadow: '0 2px 8px rgba(44, 62, 80, 0.08)',
              textTransform: 'uppercase',
              textAlign: 'center',
              transition: 'transform 0.4s cubic-bezier(.4,2,.6,1), background-position 1.2s, color 0.6s, WebkitTextFillColor 0.6s',
              cursor: 'pointer',
              background: 'linear-gradient(90deg, #5FFBF1 0%, #3BA9FF 50%, #A385FF 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: '#111',
              '&:hover': {
                transform: 'translateY(-8px) scale(1.03)',
                backgroundPosition: '100% 0',
                color: 'transparent',
                WebkitTextFillColor: 'transparent',
              },
            }}
          >
            <span style={{ display: 'block', fontWeight: 500 }}>Ace Every Interview with AI.</span>
            <span style={{ display: 'block', fontWeight: 500 }}>Real Cases. Real Feedback. Real Results.</span>
          </Typography>
        </Box>
        {/* Start Button, bigger on mobile and spaced from text */}
        <Button
          variant="contained"
          color="primary"
          size={isMobile ? 'medium' : 'large'}
          sx={{
            px: { xs: 5, md: 8 },
            py: { xs: 2, md: 3 },
            fontSize: { xs: 22, md: 28 },
            borderRadius: 4,
            mb: { xs: 3, md: 5 },
            mt: { xs: 2, md: 0 },
            fontWeight: 800,
            letterSpacing: 1.5,
            color: '#fff',
            background: 'linear-gradient(45deg, #000 30%, #333 90%)',
            border: 'none',
            boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
            position: 'relative',
            overflow: 'visible',
            transition: 'transform 0.4s cubic-bezier(.4,2,.6,1)',
            cursor: 'pointer',
            backgroundClip: 'padding-box',
            WebkitBackgroundClip: 'padding-box',
            WebkitTextFillColor: '#fff',
            '&:hover': {
              transform: 'translateY(-8px) scale(1.03)',
            },
            '& .gradient-text': {
              transition: 'background-position 1.2s, color 0.6s, WebkitTextFillColor 0.6s',
              background: 'linear-gradient(90deg, #5FFBF1 0%, #3BA9FF 50%, #A385FF 100%)',
              backgroundSize: '200% 200%',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: '#fff',
            },
            '&:hover .gradient-text': {
              backgroundPosition: '100% 0',
              color: 'transparent',
              WebkitTextFillColor: 'transparent',
            },
          }}
          onClick={() => {
            ReactGA.event({
              category: 'Button',
              action: 'Click',
              label: 'Start Practice Case'
            });
            handleStartClick();
          }}
        >
          <span className="gradient-text">START PRACTICE CASE</span>
        </Button>
        {/* Feature Cards: only show on desktop */}
        {!isMobile && (
          <Grid container spacing={6} justifyContent="center" alignItems="stretch" sx={{ maxWidth: 1100, mt: 0, mb: 0, display: { xs: 'block', md: 'flex' }, flexWrap: { xs: 'wrap', md: 'nowrap' } }}>
            <Grid sx={{ 
              width: { xs: '100%', md: '33.33%' },
              flexShrink: 0,
              flexGrow: 0
            }}>
              <Box sx={{
                borderRadius: 4,
                p: 3,
                minHeight: 220,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#ffffff',
                background: '#ffffff',
                opacity: 1,
                border: '2.5px solid #000',
                boxShadow: '0 4px 24px rgba(0,0,0,0.10)',
                position: 'relative',
                overflow: 'visible',
                zIndex: 2,
                isolation: 'isolate',
                backdropFilter: 'none',
                WebkitBackdropFilter: 'none',
                transition: 'transform 0.25s cubic-bezier(.4,2,.6,1), box-shadow 0.25s',
                '&:hover': {
                  backgroundColor: '#ffffff',
                  background: '#ffffff',
                  transform: 'translateY(-4px)',
                },
                '::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: '#ffffff',
                  borderRadius: 'inherit',
                  zIndex: -1,
                },
                '::after': {
                  content: '""',
                  display: 'block',
                  position: 'absolute',
                  left: '-12px',
                  right: '-12px',
                  bottom: '-10px',
                  height: '10px',
                  borderBottomLeftRadius: '12px',
                  borderBottomRightRadius: '12px',
                  background: 'linear-gradient(90deg, #2DEDFB 0%, #256EA0 50%, #6C38FF 100%)',
                  backgroundSize: '300% 300%',
                  opacity: 0,
                  filter: 'blur(12px)',
                  transition: 'opacity 0.08s',
                  zIndex: 1,
                  animation: 'blueFlow 3s linear infinite alternate',
                },
                '&:hover::after': {
                  opacity: 0.5,
                  backgroundPosition: '100% 0',
                },
                '@keyframes blueFlow': {
                  '0%': { backgroundPosition: '0% 0' },
                  '100%': { backgroundPosition: '100% 0' },
                },
              }}>
                <Avatar sx={{ bgcolor: '#2563eb', mb: 2, width: 64, height: 64 }}>
                  <BarChartIcon fontSize="large" />
                </Avatar>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, textAlign: 'center', color: '#000' }}>
                  Real Business Cases
                </Typography>
                <Typography variant="body2" sx={{ color: '#000' }} align="center">
                  Practice with actual MBB-style cases covering market entry, M&A, pricing strategy, and more
                </Typography>
              </Box>
            </Grid>
            <Grid sx={{ 
              width: { xs: '100%', md: '33.33%' },
              flexShrink: 0,
              flexGrow: 0
            }}>
              <Box sx={{
                borderRadius: 4,
                p: 3,
                minHeight: 220,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#ffffff',
                background: '#ffffff',
                opacity: 1,
                border: '2.5px solid #000',
                boxShadow: '0 4px 24px rgba(0,0,0,0.10)',
                position: 'relative',
                overflow: 'visible',
                zIndex: 2,
                isolation: 'isolate',
                backdropFilter: 'none',
                WebkitBackdropFilter: 'none',
                transition: 'transform 0.25s cubic-bezier(.4,2,.6,1), box-shadow 0.25s',
                '&:hover': {
                  backgroundColor: '#ffffff',
                  background: '#ffffff',
                  transform: 'translateY(-4px)',
                },
                '::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: '#ffffff',
                  borderRadius: 'inherit',
                  zIndex: -1,
                },
                '::after': {
                  content: '""',
                  display: 'block',
                  position: 'absolute',
                  left: '-12px',
                  right: '-12px',
                  bottom: '-10px',
                  height: '10px',
                  borderBottomLeftRadius: '12px',
                  borderBottomRightRadius: '12px',
                  background: 'linear-gradient(90deg, #2DEDFB 0%, #256EA0 50%, #6C38FF 100%)',
                  backgroundSize: '300% 300%',
                  opacity: 0,
                  filter: 'blur(12px)',
                  transition: 'opacity 0.08s',
                  zIndex: 1,
                  animation: 'blueFlow 3s linear infinite alternate',
                },
                '&:hover::after': {
                  opacity: 0.5,
                  backgroundPosition: '100% 0',
                },
                '@keyframes blueFlow': {
                  '0%': { backgroundPosition: '0% 0' },
                  '100%': { backgroundPosition: '100% 0' },
                },
              }}>
                <Avatar sx={{ bgcolor: '#0ea5e9', mb: 2, width: 64, height: 64 }}>
                  <ShowChartIcon fontSize="large" />
                </Avatar>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, textAlign: 'center', color: '#000' }}>
                  Real-time Analysis
                </Typography>
                <Typography variant="body2" sx={{ color: '#000' }} align="center">
                  Get instant feedback on your structure, insights, and quantitative analysis skills
                </Typography>
              </Box>
            </Grid>
            <Grid sx={{ 
              width: { xs: '100%', md: '33.33%' },
              flexShrink: 0,
              flexGrow: 0
            }}>
              <Box sx={{
                borderRadius: 4,
                p: 3,
                minHeight: 220,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#ffffff',
                background: '#ffffff',
                opacity: 1,
                border: '2.5px solid #000',
                boxShadow: '0 4px 24px rgba(0,0,0,0.10)',
                position: 'relative',
                overflow: 'visible',
                zIndex: 2,
                isolation: 'isolate',
                backdropFilter: 'none',
                WebkitBackdropFilter: 'none',
                transition: 'transform 0.25s cubic-bezier(.4,2,.6,1), box-shadow 0.25s',
                '&:hover': {
                  backgroundColor: '#ffffff',
                  background: '#ffffff',
                  transform: 'translateY(-4px)',
                },
                '::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: '#ffffff',
                  borderRadius: 'inherit',
                  zIndex: -1,
                },
                '::after': {
                  content: '""',
                  display: 'block',
                  position: 'absolute',
                  left: '-12px',
                  right: '-12px',
                  bottom: '-10px',
                  height: '10px',
                  borderBottomLeftRadius: '12px',
                  borderBottomRightRadius: '12px',
                  background: 'linear-gradient(90deg, #2DEDFB 0%, #256EA0 50%, #6C38FF 100%)',
                  backgroundSize: '300% 300%',
                  opacity: 0,
                  filter: 'blur(12px)',
                  transition: 'opacity 0.08s',
                  zIndex: 1,
                  animation: 'blueFlow 3s linear infinite alternate',
                },
                '&:hover::after': {
                  opacity: 0.5,
                  backgroundPosition: '100% 0',
                },
                '@keyframes blueFlow': {
                  '0%': { backgroundPosition: '0% 0' },
                  '100%': { backgroundPosition: '100% 0' },
                },
              }}>
                <Avatar sx={{ bgcolor: '#8b5cf6', mb: 2, width: 64, height: 64 }}>
                  <GroupIcon fontSize="large" />
                </Avatar>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, textAlign: 'center', color: '#000' }}>
                  Expert Guidance
                </Typography>
                <Typography variant="body2" sx={{ color: '#000' }} align="center">
                  Learn from patterns of successful candidates and improve with each practice session
                </Typography>
              </Box>
            </Grid>
          </Grid>
        )}
        <CaseSettingsDialog
          open={settingsOpen}
          onClose={() => setSettingsOpen(false)}
          onStart={() => {
            setSettingsOpen(false);
            onStart({
              ...caseOptions,
              resetState: true
            });
          }}
          caseOptions={caseOptions}
          setCaseOptions={setCaseOptions}
        />
        <MobileWarningModal 
          open={showMobileWarning} 
          onClose={() => setShowMobileWarning(false)} 
        />
      </Box>
    </Box>
  );
}

// Add this function to clean up audio files for the session
const cleanupAudio = async (sessionId) => {
  if (!sessionId) return;
  try {
    const formData = new FormData();
    formData.append('session_id', sessionId);
    await fetch(`${API_BASE_URL}/api/cleanup-audio`, {
      method: 'POST',
      body: formData,
    });
  } catch (err) {
    // Silently ignore errors
  }
};

// Add device detection utility
const isMobileDevice = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768;
};

// Add mobile warning modal component
function MobileWarningModal({ open, onClose }) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          borderRadius: 2,
          maxWidth: '90%',
          width: 400,
          mx: 'auto',
          p: 2,
          boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
        }
      }}
    >
      <DialogTitle sx={{ 
        textAlign: 'center', 
        fontWeight: 700,
        fontSize: '1.5rem',
        color: '#333',
        pb: 1
      }}>
        Desktop Only
      </DialogTitle>
      <DialogContent sx={{ textAlign: 'center', py: 2 }}>
        <Typography sx={{ 
          fontSize: '1.1rem',
          color: '#666',
          mb: 2
        }}>
          Sorry, for the time being this is a desktop only software.
        </Typography>
        <Typography sx={{ 
          fontSize: '0.9rem',
          color: '#888',
          fontStyle: 'italic'
        }}>
          Please visit us on a desktop computer for the best experience.
        </Typography>
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'center', pb: 2 }}>
        <Button
          onClick={onClose}
          variant="contained"
          sx={{
            px: 4,
            py: 1,
            borderRadius: 2,
            fontWeight: 600,
            background: 'linear-gradient(45deg, #000 30%, #333 90%)',
            '&:hover': {
              background: 'linear-gradient(45deg, #333 30%, #000 90%)',
            }
          }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function LinkedInFloatingButton() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  return (
    <Box sx={{ position: 'fixed', bottom: 24, left: 24, zIndex: 9999, display: 'flex', gap: 2 }}>
      <IconButton
        href="https://www.linkedin.com/company/case-ai"
        target="_blank"
        rel="noopener noreferrer"
        sx={{
          backgroundColor: '#0077B5',
          color: '#fff',
          width: 48,
          height: 48,
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          transition: 'all 0.3s cubic-bezier(.4,2,.6,1)',
          '&:hover': {
            backgroundColor: '#006399',
            transform: 'translateY(-4px) scale(1.05)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
          },
          '&:active': {
            transform: 'translateY(-2px) scale(0.98)',
          },
        }}
        onClick={() => {
          ReactGA.event({
            category: 'Button',
            action: 'Click',
            label: 'LinkedIn'
          });
        }}
      >
        <LinkedInIcon sx={{ fontSize: 28 }} />
      </IconButton>
      {!isMobile && (
        <Button
          href="https://docs.google.com/forms/d/e/1FAIpQLSfs_huqeb4Fe7PLshbH0qI3N20PVYt8D6vDDX1vzbw4TOwGgA/viewform?usp=header"
          target="_blank"
          rel="noopener noreferrer"
          variant="contained"
          sx={{
            backgroundColor: '#fff',
            color: '#111',
            fontWeight: 700,
            borderRadius: 3,
            height: 48,
            minWidth: 120,
            px: 3,
            boxShadow: '0 4px 12px rgba(0,0,0,0.10)',
            textTransform: 'none',
            fontSize: 16,
            border: '2px solid #3BA9FF',
            transition: 'all 0.3s cubic-bezier(.4,2,.6,1)',
            ml: 1,
            backgroundClip: 'padding-box',
            '& .gradient-text': {
              background: 'linear-gradient(45deg, #5FFBF1 0%, #3BA9FF 50%, #A385FF 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              color: 'transparent',
              fontWeight: 700,
            },
            '&:hover': {
              backgroundColor: '#f3f4f6',
              borderColor: '#A385FF',
              transform: 'translateY(-4px) scale(1.05)',
              boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
            },
            '&:active': {
              transform: 'translateY(-2px) scale(0.98)',
            },
          }}
          onClick={() => {
            ReactGA.event({
              category: 'Button',
              action: 'Click',
              label: 'User Feedback'
            });
          }}
        >
          <span className="gradient-text">User Feedback</span>
        </Button>
      )}
    </Box>
  );
}

function App() {
  const [showInterview, setShowInterview] = useState(false);
  const [caseOptions, setCaseOptions] = useState({ length: 'standard', style: 'standard', industry: 'general' });
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [messages, setMessages] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [error, setError] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isCaseStarted, setIsCaseStarted] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const canvasRef = useRef(null);
  const audioRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isReplayingAudio, setIsReplayingAudio] = useState(false);
  const [timer, setTimer] = useState(0);
  const [hint, setHint] = useState(null);
  const [showHint, setShowHint] = useState(false);
  const [caseEnded, setCaseEnded] = useState(false);
  const [questionCount, setQuestionCount] = useState(0);
  const [loadingInitialQuestion, setLoadingInitialQuestion] = useState(false);
  const [caseName, setCaseName] = useState('');
  const [revealedWords, setRevealedWords] = useState([]);
  const [audioProgress, setAudioProgress] = useState(0);
  const timerRef = useRef(null);
  const [initialAiText, setInitialAiText] = useState('');
  const [initialAudioUrl, setInitialAudioUrl] = useState('');
  const [showFeedbackConfirm, setShowFeedbackConfirm] = useState(false);
  // Add this at the top level of the component, with other state declarations
  const [animationKey, setAnimationKey] = useState(0);
  const [playingAiIndex, setPlayingAiIndex] = useState(null);
  const [showChat, setShowChat] = useState(true);
  const [textMode, setTextMode] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [feedbackReport, setFeedbackReport] = useState('');
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  // Add a ref to track if audio was intentionally interrupted
  const audioInterruptedRef = useRef(false);
  // Add new state for pause/resume
  const [isPaused, setIsPaused] = useState(false);
  const [pausedWordIndex, setPausedWordIndex] = useState(null);
  // Add state for manual play fallback
  const [audioNeedsManualPlay, setAudioNeedsManualPlay] = useState(false);
  // Add a ref to track the last played AI message index
  const lastPlayedAiIndexRef = useRef(null);
  // 1. Remove audioNeedsManualPlay state and overlay
  // 2. Add audioUnlockedRef and handleUserInteraction
  const audioUnlockedRef = useRef(false);
  const handleUserInteraction = () => { audioUnlockedRef.current = true; };
  const [audioUnlocked, setAudioUnlocked] = useState(false);
  const [caseReady, setCaseReady] = useState(false); // True after case is generated
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [audioError, setAudioError] = useState(null);
  const [pendingAudio, setPendingAudio] = useState(null);
  const [pendingInitialAudio, setPendingInitialAudio] = useState(null);
  // Add new state for pending response audio
  const [pendingResponseAudio, setPendingResponseAudio] = useState(null);
  const [isGeneratingReportCard, setIsGeneratingReportCard] = useState(false);
  // Disclaimer popup state
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [showDisclaimer, setShowDisclaimer] = useState(!isMobile);
  
  // Add this useEffect near the top of the component, after the state declarations
  useEffect(() => {
    console.log('[CaseAI] Component mounted, audioRef.current:', audioRef.current);
    return () => {
      console.log('[CaseAI] Component unmounting, audioRef.current:', audioRef.current);
    };
  }, []);

  // Add this useEffect to track audioRef changes
  useEffect(() => {
    if (audioRef.current) {
      console.log('[CaseAI] audioRef.current is now set');
    }
  }, [audioRef.current]);

  useEffect(() => {
    // Initialize audio context and analyzer
    audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    analyserRef.current = audioContextRef.current.createAnalyser();
    analyserRef.current.fftSize = 256;

    // Add keyboard shortcuts
    const handleKeyDown = (e) => {
      // Ignore if typing in an input or textarea
      const tag = document.activeElement?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea') return;
      // Space bar to start/stop recording
      if (e.code === 'Space' && !isPlaying && !isProcessing) {
        e.preventDefault();
        if (isRecording) {
          stopRecording();
        } else {
          startRecording();
        }
      }
      
      // Esc to end case
      if (e.code === 'Escape' && isCaseStarted && !caseEnded) {
        e.preventDefault();
        endCaseAndGetFeedback();
      }
      
      // Ctrl/Cmd + S to save feedback
      if ((e.ctrlKey || e.metaKey) && e.code === 'KeyS' && feedbackReport) {
        e.preventDefault();
        downloadFeedbackReport();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
    };
  }, [isRecording, isPlaying, isProcessing, isCaseStarted, caseEnded, feedbackReport]);

  useEffect(() => {
    let recTimer;
    if (isRecording) {
      recTimer = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(recTimer);
  }, [isRecording]);

  useEffect(() => {
    if (isCaseStarted) {
      timerRef.current = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    } else {
      setTimer(0);
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isCaseStarted]);

  useEffect(() => {
    if (messages.length > 0 && messages[0].role === 'ai') {
      // Try to extract a quoted case name, or use the first sentence
      const match = messages[0].text.match(/"([^"]{3,100})"/);
      if (match && match[1]) {
        setCaseName(match[1]);
      } else {
        // Fallback: use the first sentence up to a period
        const firstSentence = messages[0].text.split('.')[0];
        setCaseName(firstSentence);
      }
    }
  }, [messages]);

  // Auto-play audio for every new AI message
  useEffect(() => {
    if (!messages.length) return;
    // Find the last AI message
    const lastIndex = messages.length - 1;
    const lastMsg = messages[lastIndex];
    if (
      lastMsg.role === 'ai' &&
      lastPlayedAiIndexRef.current !== lastIndex &&
      lastMsg.audio_url &&
      typeof lastMsg.audio_url === 'string' &&
      lastMsg.audio_url.trim()
    ) {
      lastPlayedAiIndexRef.current = lastIndex;
      playAudio(lastMsg.audio_url, lastMsg.text, lastIndex);
    }
  }, [messages]);

  const getInitialQuestion = async (opts) => {
    try {
      setLoadingInitialQuestion(true);
      setIsProcessing(true);
      setError(null);
      setCaseEnded(false);
      const newSessionId = Math.random().toString(36).substring(2, 15);
      setSessionId(newSessionId);
      
      const response = await axios.get(`${API_BASE_URL}/api/initial-question`, {
        params: {
          ...(opts || caseOptions),
          session_id: newSessionId
        }
      });
      
      console.log('[CaseAI] Initial question received. Text:', response.data.text);
      console.log('[CaseAI] Initial audio URL:', response.data.audio_url);
      
      setMessages([{ role: 'ai', text: response.data.text, audio_url: response.data.audio_url }]);
      setInitialAiText(response.data.text);
      setInitialAudioUrl(response.data.audio_url);
      
      // Instead of trying to play immediately, set pendingInitialAudio
      setPendingInitialAudio({ url: response.data.audio_url, text: response.data.text });
      
      // Extract case name from the AI's first message
      const match = response.data.text.match(/called "([^"]{1,50})"/i);
      if (match && match[1]) {
        const words = match[1].replace(/[""]/g, '').split(/\s+/);
        const limitedWords = words.slice(0, Math.min(3, words.length));
        setCaseName(limitedWords.join(' '));
      } else {
        setCaseName('Case Interview');
      }
      
      setIsCaseStarted(true);
      setCaseReady(true);
      
    } catch (error) {
      setError('Failed to get initial question. Please try again.');
      console.error('Error getting initial question:', error);
    } finally {
      setIsProcessing(false);
      setLoadingInitialQuestion(false);
    }
  };

  const startRecording = async () => {
    try {
      setError(null);
      console.log('[DEBUG] startRecording called');
      // Resume audio context if suspended (required by browsers)
      if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
        console.log('[DEBUG] Audio context resumed');
      }
      // Clean up previous MediaRecorder if any
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current = null;
        console.log('[DEBUG] Cleaned up previous MediaRecorder');
      }
      // Clean up previous audio stream if any
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
        console.log('[DEBUG] Cleaned up previous audioRef');
      }
      if (revealIntervalRef.current) {
        clearInterval(revealIntervalRef.current);
        revealIntervalRef.current = null;
        console.log('[DEBUG] Cleared revealIntervalRef');
      }
      audioInterruptedRef.current = false;
      setIsPlaying(false);
      setPlayingAiIndex(null);
      setRevealedWords([]);
      setAudioProgress(0);
      setIsRecording(true); // Set immediately for UI feedback
      setIsProcessing(false); // Not processing yet
      // Detect Safari
      const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
      console.log('[DEBUG] isSafari:', isSafari);
      // Use minimal constraints for Safari
      const constraints = isSafari ? { audio: true } : {
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          channelCount: 1,
          sampleRate: 44100
        }
      };
      console.log('[DEBUG] getUserMedia constraints:', constraints);
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log('[DEBUG] getUserMedia stream acquired');
      // Try different mime types in order of preference, prioritizing Safari compatibility
      const mimeTypes = [
        'audio/mp4',
        'audio/mpeg',
        'audio/webm',
        'audio/webm;codecs=opus',
        'audio/ogg;codecs=opus'
      ];
      let selectedMimeType = '';
      for (const type of mimeTypes) {
        if (MediaRecorder.isTypeSupported(type)) {
          selectedMimeType = type;
          break;
        }
      }
      console.log('[DEBUG] selectedMimeType:', selectedMimeType);
      if (!selectedMimeType) {
        throw new Error('No supported mime type found for this browser');
      }
      const recorder = new MediaRecorder(stream, { 
        mimeType: selectedMimeType,
        audioBitsPerSecond: 128000 
      });
      mediaRecorderRef.current = recorder;
      // Connect the stream to the audio context for visualization
      const audioSource = audioContextRef.current.createMediaStreamSource(stream);
      audioSource.connect(analyserRef.current);
      // Reset chunks array
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        console.log('[DEBUG] ondataavailable fired, size:', e.data.size, 'type:', e.data.type);
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
          console.log('[DEBUG] Pushed chunk, total chunks:', chunksRef.current.length);
        }
      };
      recorder.onstop = async () => {
        try {
          setIsRecording(false); // UI feedback
          setIsProcessing(true); // Show "Interviewer Thinking"
          console.log('[DEBUG] onstop fired, total chunks:', chunksRef.current.length);
          const blob = new Blob(chunksRef.current, { type: selectedMimeType });
          console.log('[DEBUG] Final blob size:', blob.size, 'type:', blob.type);
          chunksRef.current = []; // clear for next recording
          if (blob.size === 0) {
            setError("Recording failed. Please try again.");
            setIsProcessing(false);
            console.log('[DEBUG] Blob size is 0, aborting');
            return;
          }
          // Use correct extension for the mime type
          let fileExtension = 'webm';
          if (selectedMimeType === 'audio/mp4') fileExtension = 'mp4';
          else if (selectedMimeType === 'audio/mpeg') fileExtension = 'mp3';
          else if (selectedMimeType === 'audio/ogg' || selectedMimeType === 'audio/ogg;codecs=opus') fileExtension = 'ogg';
          // Safari: append blob directly, Chrome/others: use File if available
          const formData = new FormData();
          try {
            const file = new File([blob], `recording.${fileExtension}`, { type: selectedMimeType });
            formData.append('file', file);
            console.log('[DEBUG] Appended File to formData:', file.name, file.size, file.type);
          } catch (e) {
            // Fallback for Safari: append blob directly
            formData.append('file', blob, `recording.${fileExtension}`);
            console.log('[DEBUG] Appended Blob to formData:', blob.size, blob.type);
          }
          await sendAudioToServer(formData);
        } catch (error) {
          setIsProcessing(false);
          setError('Failed to process recording. Please try again.');
          console.error('[DEBUG] Error processing recording:', error);
        }
      };
      recorder.onstart = () => {
        console.log('[DEBUG] MediaRecorder started');
      };
      recorder.onerror = (e) => {
        console.error('[DEBUG] MediaRecorder error:', e);
      };
      recorder.onpause = () => {
        console.log('[DEBUG] MediaRecorder paused');
      };
      recorder.onresume = () => {
        console.log('[DEBUG] MediaRecorder resumed');
      };
      recorder.onwarning = (e) => {
        console.warn('[DEBUG] MediaRecorder warning:', e);
      };
      recorder.start(isSafari ? 1000 : undefined);
      console.log('[DEBUG] MediaRecorder started with timeslice', isSafari ? 1000 : undefined);
      startVisualization();
    } catch (error) {
      setIsRecording(false);
      setIsPlaying(false);
      setPlayingAiIndex(null);
      setIsProcessing(false);
      setError('Failed to start recording. Please check your microphone permissions.');
      console.error('[DEBUG] Error starting recording:', error);
    }
  };

  const stopRecording = () => {
    try {
      console.log('[DEBUG] stopRecording called');
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        if (/^((?!chrome|android).)*safari/i.test(navigator.userAgent)) {
          // Safari: requestData before stop
          try {
            mediaRecorderRef.current.requestData();
            console.log('[DEBUG] Safari: requestData called before stop');
          } catch (e) {
            console.warn('[DEBUG] Safari: requestData failed', e);
          }
          setTimeout(() => {
            mediaRecorderRef.current.stop();
            console.log('[DEBUG] Safari: stop called after delay');
          }, 300);
        } else {
          mediaRecorderRef.current.stop();
          console.log('[DEBUG] stop called');
        }
        setIsProcessing(true); // Show "Interviewer Thinking" immediately
      } else {
        setIsRecording(false);
        setIsProcessing(false);
        console.log('[DEBUG] No active MediaRecorder to stop');
      }
      stopVisualization();
    } catch (error) {
      setIsRecording(false);
      setIsProcessing(false);
      setError('Failed to stop recording.');
      console.error('[DEBUG] Error stopping recording:', error);
    }
  };

  const startVisualization = () => {
    const canvas = canvasRef.current;
    if (!canvas) return; // Prevent error if canvas is gone
    const canvasCtx = canvas.getContext('2d');
    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      if (!isRecording) return;

      requestAnimationFrame(draw);
      analyserRef.current.getByteFrequencyData(dataArray);

      canvasCtx.fillStyle = 'rgb(200, 200, 200)';
      canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / bufferLength) * 2.5;
      let barHeight;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        barHeight = dataArray[i] / 2;

        canvasCtx.fillStyle = `rgb(50, ${barHeight + 100}, 50)`;
        canvasCtx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);

        x += barWidth + 1;
      }
    };

    draw();
  };

  const stopVisualization = () => {
    const canvas = canvasRef.current;
    if (!canvas) return; // Prevent error if canvas is gone
    const canvasCtx = canvas.getContext('2d');
    canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const sendAudioToServer = async (formData) => {
    setIsProcessing(true);
    try {
      // Attach question_count and final_answer to formData
      const userResponses = messages.filter(msg => msg.role === 'user');
      const aiResponses = messages.filter(msg => msg.role === 'ai');
      const currentQuestionCount = aiResponses.length;
      setQuestionCount(currentQuestionCount);
      // Try to get the last user message (the one just recorded)
      let lastUserText = '';
      if (userResponses.length > 0) {
        lastUserText = userResponses[userResponses.length - 1].text;
      }
      // But if this is a new user message, get it from the transcript after upload
      // We'll set it after the response
      // For now, use empty string
      const finalAnswer = detectFinalAnswer(lastUserText);
      formData.append('question_count', currentQuestionCount);
      formData.append('final_answer', finalAnswer);
      formData.append('session_id', sessionId);

      const response = await axios.post(`${API_BASE_URL}/api/transcribe`, formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data) {
        console.log('Received audio_url from backend:', response.data.audio_url);
        setMessages((prev) => [
          ...prev,
          { role: 'user', text: response.data.transcript || 'User response transcribed...' },
          { role: 'ai', text: response.data.response }
        ]);
        // If backend signals case end, show feedback
        // (Removed: auto-end logic based on 'case is now complete')
        // if (response.data.response && response.data.response.includes('case is now complete')) {
        //   setCaseEnded(true);
        //   setIsCaseStarted(false);
        //   setShowFeedback(true);
        //   await getFeedback();
        //   return;
        // }
        // Play audio and trigger typewriter for the new AI message
        const aiIndex = messages.length + 1; // index of the new AI message
        await playAudio(response.data.audio_url, response.data.response, aiIndex);
      }
    } catch (error) {
      console.error('Error sending audio to server:', error);
      setError('Failed to process your response. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const getFeedback = async () => {
    try {
      setIsProcessing(true);
      const userResponses = messages
        .filter(msg => msg.role === 'user')
        .map(msg => msg.text)
        .join('\n\n');
      const response = await axios.post(`${API_BASE_URL}/api/get-feedback`, {
        transcript: userResponses
      });
      if (response.data) {
        const feedbackText = response.data.feedback;
        setFeedback([{
          timestamp: new Date().toLocaleTimeString(),
          content: feedbackText
        }]);
        handleShowFeedback([{
          timestamp: new Date().toLocaleTimeString(),
          content: feedbackText
        }]);
        // Try to extract a score (e.g., "Score: 85%" or "B+") from feedback
        let score = null;
        const match = feedbackText.match(/(\d{2,3})%/);
        if (match) score = parseInt(match[1], 10);
      }
    } catch (error) {
      console.error('Error getting feedback:', error);
      setError('Failed to get feedback. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Add a ref to store the reveal interval so it can be cleared reliably
  const revealIntervalRef = useRef(null);

  // 3. In playAudio, always use the same DOM audio element
  const playAudio = (audioUrl, aiText, aiIndex) => {
    console.log('[CaseAI] playAudio called with audioUrl:', audioUrl, 'aiText:', aiText, 'aiIndex:', aiIndex);
    
    // Store the current audio element reference
    const audioElement = audioRef.current;
    
    if (!audioElement) {
      console.log('[CaseAI] Audio element not ready, setting pendingInitialAudio');
      setPendingInitialAudio({ url: audioUrl, text: aiText });
      return;
    }

    // Clean up previous listeners and intervals
    audioElement.oncanplaythrough = null;
    audioElement.onended = null;
    audioElement.onerror = null;
    
    if (revealIntervalRef.current) {
      clearInterval(revealIntervalRef.current);
      revealIntervalRef.current = null;
    }

    setIsPlaying(true);
    setPlayingAiIndex(aiIndex);
    setAudioProgress(0);
    setRevealedWords([]);

    const fullAudioUrl = audioUrl.startsWith('http') ? audioUrl : `${API_BASE_URL}${audioUrl}`;
    console.log('[CaseAI] Playing audio from URL:', fullAudioUrl);
    
    // Set up event handlers before loading audio
    audioElement.oncanplaythrough = () => {
      console.log('[CaseAI] Audio can play through');
      let wordIndex = 0;
      const words = aiText.split(/\s+/);
      const duration = audioElement.duration || 0;
      const intervalMs = duration > 0 ? (duration * 1000) / words.length : 50;
      
      revealIntervalRef.current = setInterval(() => {
        if (audioInterruptedRef.current) {
          clearInterval(revealIntervalRef.current);
          revealIntervalRef.current = null;
          return;
        }

        if (wordIndex < words.length) {
          wordIndex++;
          setRevealedWords(words.slice(0, wordIndex));
          setAudioProgress((wordIndex / words.length) * 100);
        } else {
          clearInterval(revealIntervalRef.current);
          revealIntervalRef.current = null;
        }
      }, intervalMs > 0 ? intervalMs : 50);

      audioElement.play().catch(error => {
        console.error('[CaseAI] Error playing audio:', error);
        setRevealedWords(words);
        setIsPlaying(false);
        setPlayingAiIndex(null);
        setAudioProgress(100);
      });
    };

    audioElement.onended = () => {
      console.log('[CaseAI] Audio playback ended');
      setIsPlaying(false);
      setPlayingAiIndex(null);
      setRevealedWords(aiText.split(/\s+/));
      setAudioProgress(100);
      if (revealIntervalRef.current) {
        clearInterval(revealIntervalRef.current);
        revealIntervalRef.current = null;
      }
    };

    audioElement.onerror = (error) => {
      console.error('[CaseAI] Audio error:', error);
      setRevealedWords(aiText.split(/\s+/));
      setIsPlaying(false);
      setPlayingAiIndex(null);
      setAudioProgress(100);
    };

    // Load and play the audio
    audioElement.src = fullAudioUrl;
    audioElement.load();
  };

  // fastForward unchanged, but also pause DOM audio
  const fastForward = () => {
    audioInterruptedRef.current = true;
    if (audioRef.current) {
      audioRef.current.onended = null;
      audioRef.current.onloadedmetadata = null;
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (revealIntervalRef.current) {
      clearInterval(revealIntervalRef.current);
      revealIntervalRef.current = null;
    }
    const currentMessage = messages.find((msg, idx) => idx === playingAiIndex);
    if (currentMessage) {
      setRevealedWords(currentMessage.text.split(/\s+/));
      setAudioProgress(100);
    }
    setIsPlaying(false);
    setPlayingAiIndex(null);
  };

  const pauseAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPaused(true);
    }
    if (revealIntervalRef.current) {
      clearInterval(revealIntervalRef.current);
    }
  };

  const resumeAudio = () => {
    if (audioRef.current) {
      audioRef.current.play();
      setIsPaused(false);
      // Resume word reveal from pausedWordIndex
      if (playingAiIndex !== null && messages[playingAiIndex]) {
        playAudio(messages[playingAiIndex].audio_url, messages[playingAiIndex].text, playingAiIndex, pausedWordIndex || 0);
      }
    }
  };

  const handleCloseError = () => {
    setError(null);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleShowFeedback = (feedback) => {
    setShowFeedback(true);
  };

  const handleCloseFeedback = () => {
    setShowFeedback(false);
  };

  const resetInterview = async () => {
    await cleanupAudio(sessionId);
    setFeedback([]);
    setIsCaseStarted(false);
    setRecordingTime(0);
    setError(null);
    setCaseEnded(false);
    setTimer(0);
    clearInterval(timerRef.current);
    // Stop any playing audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    // Force a re-render of the message component
    setAnimationKey(prev => prev + 1);
    // Set transcript to just the initial AI message
    setMessages([{ role: 'ai', text: initialAiText, audio_url: initialAudioUrl }]);
    // Wait for the message to be rendered before playing audio
    setTimeout(async () => {
      await playAudio(initialAudioUrl, initialAiText, 0);
      setIsCaseStarted(true);
    }, 100);
  };

  const replayLastResponse = async () => {
    if (messages.length > 0) {
      const lastAiMessage = messages.filter(m => m.role === 'ai').pop();
      if (lastAiMessage && lastAiMessage.audio_url) {
        setIsReplayingAudio(true);
        try {
          await playAudio(lastAiMessage.audio_url);
        } catch (error) {
          setError('Failed to replay audio');
        }
        setIsReplayingAudio(false);
      }
    }
  };

  const downloadFeedback = () => {
    if (feedback.length > 0) {
      const element = document.createElement('a');
      const file = new Blob([
        `Case Interview AI Feedback Report\n\n${feedback[0].content}`
      ], { type: 'text/plain' });
      element.href = URL.createObjectURL(file);
      element.download = 'case_interview_feedback.txt';
      // Append to body, click, and remove in a single synchronous operation
      document.body.appendChild(element);
      element.click();
      // Use setTimeout to ensure the click event has been processed
      setTimeout(() => {
        URL.revokeObjectURL(element.href);
        if (element.parentNode) {
          element.parentNode.removeChild(element);
        }
      }, 0);
    }
  };

  const getMaxTime = () => {
    if (!caseOptions) return 0;
    const found = CASE_LENGTHS.find(l => l.value === caseOptions.length);
    return found ? found.minutes * 60 : 0;
  };

  const getHint = async () => {
    try {
      console.log('[CaseAI] Getting hint...');
      setIsProcessing(true);
      setError(null); // Clear any previous errors
      const response = await axios.post(`${API_BASE_URL}/api/hint`, {
        conversation: messages
      });
      console.log('[CaseAI] Hint response:', response.data);
      if (response.data && response.data.hint) {
        setHint(response.data.hint);
        setShowHint(true);
      } else {
        console.warn('[CaseAI] No hint in response:', response.data);
        setError('No hint available. Please try again.');
      }
    } catch (error) {
      console.error('[CaseAI] Error getting hint:', error);
      setError('Failed to get a hint. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const detectFinalAnswer = (text) => {
    if (!text) return false;
    const lower = text.toLowerCase();
    return FINAL_ANSWER_KEYWORDS.some(kw => lower.includes(kw));
  };

  const handleCloseHint = () => setShowHint(false);

  // Handler for sending text input to the AI
  const sendTextToAI = async () => {
    if (!textInput.trim()) return;
    setMessages((prev) => [...prev, { role: 'user', text: textInput }]);
    setIsProcessing(true);
    try {
      const formData = new FormData();
      formData.append('text', textInput);
      formData.append('question_count', questionCount);
      formData.append('final_answer', detectFinalAnswer(textInput));
      formData.append('session_id', sessionId);

      const response = await fetch(`${API_BASE_URL}/api/transcribe`, {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      if (data) {
        setMessages((prev) => [...prev, { role: 'ai', text: data.response, audio_url: data.audio_url }]);
        // Always call playAudio, even if no audio_url
        await playAudio(data.audio_url || '', data.response, messages.length + 1);
      }
    } catch (error) {
      setError('Failed to send text to AI.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handler for ending the case and getting feedback
  const endCaseAndGetFeedback = async () => {
    setIsGeneratingReportCard(true);
    setIsProcessing(true);
    try {
      const formData = new FormData();
      formData.append('session_id', sessionId);
      const response = await fetch(`${API_BASE_URL}/api/end-case`, {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      if (data && data.feedback_report) {
        setFeedbackReport(data.feedback_report);
        setShowFeedbackDialog(true);
        setShowFeedback(false);
        setIsCaseStarted(false);
      }
    } catch (error) {
      setError('Failed to end case and get feedback.');
    } finally {
      setIsProcessing(false);
      setIsGeneratingReportCard(false);
    }
  };

  // Handler for downloading the feedback report
  const downloadFeedbackReport = () => {
    if (!feedbackReport) return;
    const element = document.createElement('a');
    const file = new Blob([
      `Case Interview AI Feedback Report\n\n${feedbackReport}`
    ], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = 'case_interview_feedback.txt';
    document.body.appendChild(element);
    element.click();
    setTimeout(() => {
      URL.revokeObjectURL(element.href);
      if (element.parentNode) {
        element.parentNode.removeChild(element);
      }
    }, 0);
  };

  // On Start Case button click
  const handleStartCase = () => {
    if (!audioUnlocked && audioRef.current) {
      // Play a short silent audio to unlock
      audioRef.current.src = "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=";
      audioRef.current.play().then(() => setAudioUnlocked(true));
    } else {
      setAudioUnlocked(true);
    }
  };

  // Only play audio when audioRef is ready and pendingAudio is set
  useEffect(() => {
    if (audioRef.current && pendingAudio) {
      audioRef.current.src = pendingAudio;
      audioRef.current.load();
      audioRef.current.oncanplaythrough = () => {
        audioRef.current.play().catch((err) => {
          setAudioError("Failed to play audio.");
          console.error("[CaseAI] Audio playback error:", err);
        });
      };
      audioRef.current.onended = () => {
        setIsAudioLoading(false);
      };
      audioRef.current.onerror = (err) => {
        setAudioError("Audio failed to load.");
        setIsAudioLoading(false);
        console.error("[CaseAI] Audio element error:", err);
      };
      setPendingAudio(null); // Reset after playing
    }
  }, [pendingAudio]);

  const playTTS = async (text) => {
    setIsAudioLoading(true);
    setAudioError(null);
    try {
      const response = await axios.post(`${API_BASE_URL}/api/tts`, { text });
      const audioUrl = `${API_BASE_URL}${response.data.audio_url}`;
      if (audioRef.current) {
        setPendingAudio(audioUrl);
      } else {
        setAudioError("Audio element not found.");
        setIsAudioLoading(false);
      }
    } catch (err) {
      setAudioError("TTS request failed.");
      setIsAudioLoading(false);
      console.error("[CaseAI] TTS request error:", err);
    }
  };

  useEffect(() => {
    console.log('[CaseAI] useEffect for pendingInitialAudio. pendingInitialAudio:', pendingInitialAudio, 'audioRef.current:', audioRef.current);
    if (pendingInitialAudio && audioRef.current) {
      console.log('[CaseAI] Calling playAudio from useEffect with pendingInitialAudio:', pendingInitialAudio);
      playAudio(pendingInitialAudio.url, pendingInitialAudio.text, 0);
      setPendingInitialAudio(null);
    }
  }, [pendingInitialAudio, audioRef.current]);

  // Place the audio element here, always rendered
  // (remove any duplicate or conditional rendering below)
  const audioElement = (
    <audio 
      ref={audioRef}
      style={{ display: 'none' }}
      onLoadedMetadata={() => console.log('[CaseAI] Audio element loaded metadata')}
      onCanPlay={() => console.log('[CaseAI] Audio element can play')}
      onError={(e) => console.error('[CaseAI] Audio element error:', e)}
    />
  );

  // Custom RainbowLoadingDots for report card
  function ReportCardLoading() {
    return (
      <RainbowLoadingDots message="Generating report card..." />
    );
  }

  return (
    <>
      {/* Single audio element at the root level */}
      <audio 
        ref={audioRef}
        style={{ display: 'none' }}
        onLoadedMetadata={() => console.log('[CaseAI] Audio element loaded metadata')}
        onCanPlay={() => console.log('[CaseAI] Audio element can play')}
        onError={(e) => console.error('[CaseAI] Audio element error:', e)}
      />
      {showInterview ? (
        <>
          {/* Logo in top-left corner, same as landing page */}
          <Box sx={{ position: 'absolute', top: 24, left: 24, zIndex: 2 }}>
            <LogoWithAnimatedOutline />
          </Box>
          <Box sx={backgroundWrapperSx} />
          {/* Add loading screen */}
          {loadingInitialQuestion && <RainbowLoadingDots />}
          {/* Remove duplicate audio element */}
          <audio 
            ref={(el) => {
              audioRef.current = el;
              if (el) {
                console.log('[CaseAI] Audio element mounted');
                // If we have pending audio, play it now
                if (pendingInitialAudio) {
                  console.log('[CaseAI] Playing pending audio after mount');
                  playAudio(pendingInitialAudio.url, pendingInitialAudio.text, 0);
                  setPendingInitialAudio(null);
                }
              }
            }}
            style={{ display: 'none' }} 
            onLoadedMetadata={() => console.log('[CaseAI] Audio element loaded metadata')}
            onCanPlay={() => console.log('[CaseAI] Audio element can play')}
            onError={(e) => console.error('[CaseAI] Audio element error:', e)}
          />
          <Box sx={{ position: 'relative', zIndex: 1, minHeight: '100vh', height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'center', overflow: 'hidden' }}>
            <Container maxWidth="md" disableGutters sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'center', height: '100vh', minHeight: '100vh', py: 0 }}>
              {/* Header and controls */}
              <Box sx={{ width: '100%', maxWidth: 900, mt: 4, mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography
                    variant="h3"
                    sx={{
                      fontWeight: 800,
                      color: '#000',
                      letterSpacing: 1.2,
                      mb: 0,
                      width: '100%',
                      display: 'block',
                      textAlign: 'left',
                      fontSize: 'clamp(1rem, 3vw, 3rem)',
                      lineHeight: 1.1,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                    title={caseName}
                  >
                    {caseName}
                  </Typography>
                  {isCaseStarted && !caseEnded && (
                    <IconButton
                      onClick={() => setShowGuide(true)}
                      sx={{
                        color: '#2563eb',
                        '&:hover': { bgcolor: 'rgba(37, 99, 235, 0.1)' }
                      }}
                    >
                      <MenuBookIcon />
                    </IconButton>
                  )}
                </Box>
                {/* Add time elapsed bar */}
                {isCaseStarted && !caseEnded && (
                  <Box sx={{ 
                    width: '100%', 
                    mb: 2,
                    position: 'relative'
                  }}>
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        color: '#000',
                        fontWeight: 700,
                        mb: 1,
                        textAlign: 'center'
                      }}
                    >
                      {formatTime(timer)}
                    </Typography>
                    <Box sx={{ 
                      width: '100%', 
                      height: 8,
                      bgcolor: '#f3f4f6',
                      borderRadius: 4,
                      overflow: 'hidden',
                      position: 'relative'
                    }}>
                      <Box sx={{ 
                        position: 'absolute', 
                        top: 0, 
                        left: 0, 
                        height: '100%', 
                        width: '100%',
                        background: 'linear-gradient(90deg, #2DEDFB 0%, #256EA0 50%, #6C38FF 100%)',
                        borderRadius: 4
                      }} />
                    </Box>
                  </Box>
                )}
                {isCaseStarted && !caseEnded && (
                  <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                    <Button
                      variant="contained"
                      color="error"
                      onClick={async () => {
                        // If textMode is active and textInput is not empty, send the text before ending the case
                        if (textMode && textInput.trim()) {
                          setIsProcessing(true);
                          try {
                            const formData = new FormData();
                            formData.append('text', textInput);
                            formData.append('question_count', questionCount);
                            formData.append('final_answer', detectFinalAnswer(textInput));
                            formData.append('session_id', sessionId);
                            const response = await fetch(`${API_BASE_URL}/api/transcribe`, {
                              method: 'POST',
                              body: formData,
                            });
                            const data = await response.json();
                            if (data) {
                              setMessages((prev) => [...prev, { role: 'user', text: textInput }, { role: 'ai', text: data.response, audio_url: data.audio_url }]);
                            }
                            setTextInput('');
                          } catch (error) {
                            setError('Failed to send text to AI.');
                          } finally {
                            setIsProcessing(false);
                          }
                        }
                        setShowFeedbackConfirm(true);
                      }}
                      disabled={isProcessing}
                      sx={{ fontWeight: 700, borderRadius: 2, px: 4 }}
                    >
                      Get Feedback
                    </Button>
                  </Box>
                )}
              </Box>
              {/* Controls and waveform */}
              <Box sx={{
                flex: 1,
                width: '100%',
                maxWidth: 900,
                mx: 'auto',
                mb: 2,
                p: 0,
                bgcolor: 'transparent',
                borderRadius: 0,
                boxShadow: 'none',
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
                minHeight: 400,
                maxHeight: '60vh',
                height: 'auto',
                overflowY: 'auto',
                overflowX: 'hidden',
                pb: 8,
              }}>
                {messages.map((message, index) => (
                  <Box
                    key={`${index}-${animationKey}`}
                    data-message-index={index}
                    sx={{
                      mb: 0,
                      p: 2,
                      maxWidth: '70%',
                      ml: message.role === 'ai' ? 0 : 'auto',
                      mr: message.role === 'ai' ? 'auto' : 0,
                      bgcolor: message.role === 'ai' ? '#e3f2fd' : '#fff',
                      borderRadius: 3,
                      boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                      border: '1.5px solid #e5e7eb',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: message.role === 'ai' ? 'flex-start' : 'flex-end',
                      position: 'relative',
                      animation: message.role === 'ai' ? 'slideIn 0.3s ease-out' : 'slideInRight 0.3s ease-out',
                      '@keyframes slideIn': {
                        '0%': {
                          opacity: 0,
                          transform: 'translateX(-20px)'
                        },
                        '100%': {
                          opacity: 1,
                          transform: 'translateX(0)'
                        }
                      },
                      '@keyframes slideInRight': {
                        '0%': {
                          opacity: 0,
                          transform: 'translateX(20px)'
                        },
                        '100%': {
                          opacity: 1,
                          transform: 'translateX(0)'
                        }
                      }
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Chip 
                        label={message.role === 'ai' ? 'Case AI' : 'You'} 
                        size="small" 
                        color={message.role === 'ai' ? 'primary' : 'default'}
                        sx={{ 
                          mr: message.role === 'ai' ? 1 : 0, 
                          ml: message.role === 'ai' ? 0 : 1,
                          animation: 'fadeIn 0.3s ease-out',
                          '@keyframes fadeIn': {
                            '0%': { opacity: 0 },
                            '100%': { opacity: 1 }
                          }
                        }}
                      />
                      {message.role === 'ai' && isPlaying && playingAiIndex === index && (
                        <>
                          <IconButton 
                            size="small" 
                            onClick={fastForward}
                            sx={{ 
                              ml: 1,
                              color: '#e11d48',
                              '&:hover': { bgcolor: 'rgba(225, 29, 72, 0.1)' },
                              animation: 'pulse 2s infinite',
                              '@keyframes pulse': {
                                '0%': { transform: 'scale(1)' },
                                '50%': { transform: 'scale(1.1)' },
                                '100%': { transform: 'scale(1)' }
                              }
                            }}
                          >
                            <FastForwardIcon fontSize="small" />
                          </IconButton>
                        </>
                      )}
                    </Box>
                    <Typography 
                      variant="body1" 
                      className="message-text"
                      sx={{ 
                        textAlign: message.role === 'ai' ? 'left' : 'right', 
                        fontSize: 18, 
                        color: '#222', 
                        fontWeight: 500,
                        minHeight: '1.5em',
                        animation: 'fadeIn 0.3s ease-out',
                        '@keyframes fadeIn': {
                          '0%': { opacity: 0 },
                          '100%': { opacity: 1 }
                        }
                      }}
                    >
                      {message.role === 'ai' 
                        ? (isPlaying && playingAiIndex === index 
                            ? revealedWords.join(' ')
                            : message.text)
                        : message.text}
                    </Typography>
                    {message.role === 'ai' && isPlaying && playingAiIndex === index && (
                      <Box sx={{ mt: 1 }}>
                        <SpeakingAnimation />
                      </Box>
                    )}
                  </Box>
                ))}
              </Box>
              {/* Bottom controls: recording button, text input toggle */}
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mb: 4, position: 'fixed', bottom: 24, left: 0, right: 0, zIndex: 10 }}>
                {/* Main recording button and timer, etc. (existing controls) */}
                {!textMode && (
                  <Button
                    variant="contained"
                    color={isPlaying ? 'error' : isProcessing ? 'primary' : 'primary'}
                    disabled={isPlaying || isProcessing}
                    sx={{
                      borderRadius: 3,
                      px: 5,
                      py: 2,
                      fontSize: 20,
                      fontWeight: 700,
                      background: isPlaying
                        ? '#e11d48'
                        : isProcessing
                          ? 'linear-gradient(90deg, #2563eb 0%, #60a5fa 100%)'
                          : 'linear-gradient(45deg, #000 30%, #333 90%)',
                      color: '#fff',
                      boxShadow: 'none',
                      position: 'relative',
                      overflow: 'visible',
                      transition: 'all 0.3s cubic-bezier(.4,2,.6,1)',
                      cursor: isProcessing ? 'not-allowed' : 'pointer',
                      '&:hover': {
                        background: isPlaying
                          ? '#be123c'
                          : isProcessing
                            ? 'linear-gradient(90deg, #1d4ed8 0%, #60a5fa 100%)'
                            : 'linear-gradient(45deg, #111 30%, #444 90%)',
                        boxShadow: 'none',
                        transform: 'translateY(-6px) scale(1.02)',
                      },
                      '&:active': {
                        transform: 'translateY(-2px) scale(0.98)',
                      },
                      '::after': {
                        content: '""',
                        display: 'block',
                        position: 'absolute',
                        left: '-16px',
                        right: '-16px',
                        bottom: '-12px',
                        height: '12px',
                        borderBottomLeftRadius: '16px',
                        borderBottomRightRadius: '16px',
                        background: 'linear-gradient(90deg, #2DEDFB 0%, #256EA0 50%, #6C38FF 100%)',
                        backgroundSize: '300% 300%',
                        opacity: 0,
                        filter: 'blur(12px)',
                        transition: 'opacity 0.3s',
                        zIndex: 1,
                        animation: 'blueFlow 3s linear infinite alternate',
                      },
                      '&:hover::after': isProcessing ? {} : {
                        opacity: 0.5,
                        backgroundPosition: '100% 0',
                      },
                      '@keyframes blueFlow': {
                        '0%': { backgroundPosition: '0% 0' },
                        '100%': { backgroundPosition: '100% 0' },
                      },
                    }}
                    onClick={isRecording ? stopRecording : startRecording}
                  >
                    {isRecording ? (
                      <>
                        <StopIcon sx={{ mr: 1 }} />
                        Stop Recording
                      </>
                    ) : isPlaying ? (
                      <>
                        <MicIcon sx={{ mr: 1 }} />
                        Interviewer Talking...
                      </>
                    ) : isProcessing ? (
                      <>
                        <MicIcon sx={{ mr: 1 }} />
                        Interviewer Thinking
                      </>
                    ) : (
                      <>
                        <MicIcon sx={{ mr: 1 }} />
                        Start Recording
                      </>
                    )}
                  </Button>
                )}
                {/* Text input for text mode */}
                {textMode && (
                  <Box sx={{
                    minWidth: 320,
                    maxWidth: 400,
                    display: 'flex',
                    alignItems: 'center',
                    background: '#fff',
                    borderRadius: 32,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
                    p: 0.5,
                    ml: 3,
                  }}>
                    <textarea
                      value={textInput}
                      onChange={e => setTextInput(e.target.value)}
                      placeholder="Type your message..."
                      style={{
                        flex: 1,
                        fontSize: 18,
                        padding: '18px 24px',
                        borderRadius: 32,
                        border: '2px solid #111',
                        resize: 'none',
                        minHeight: 64,
                        maxHeight: 64,
                        minWidth: 0,
                        outline: 'none',
                        boxSizing: 'border-box',
                        transition: 'border-color 0.2s',
                        marginRight: 0,
                      }}
                      onFocus={e => e.target.style.borderColor = '#000'}
                      onBlur={e => e.target.style.borderColor = '#111'}
                      disabled={isProcessing}
                    />
                    <IconButton
                      onClick={async () => {
                        if (!textInput.trim()) return;
                        setIsProcessing(true);
                        try {
                          await sendTextToAI();
                          setTextInput('');
                        } catch (error) {
                          setError('Failed to send text to AI.');
                        }
                      }}
                      disabled={isProcessing || !textInput.trim()}
                      sx={{
                        background: 'linear-gradient(90deg, #111 30%, #333 90%)',
                        color: '#fff',
                        borderRadius: 32,
                        width: 56,
                        height: 56,
                        minWidth: 56,
                        minHeight: 56,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
                        ml: 2,
                        opacity: isProcessing || !textInput.trim() ? 0.5 : 1,
                        pointerEvents: isProcessing || !textInput.trim() ? 'none' : 'auto',
                        cursor: isProcessing || !textInput.trim() ? 'not-allowed' : 'pointer',
                        transition: 'background 0.2s, opacity 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        '&:hover': {
                          background: 'linear-gradient(90deg, #222 30%, #444 90%)',
                        },
                      }}
                    >
                      <SendIcon sx={{ color: '#fff', fontSize: 28 }} />
                    </IconButton>
                  </Box>
                )}
              </Box>
              {/* Hint and dashboard controls */}
              <Box sx={{ width: '100%', maxWidth: 900, display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0 }}>
                <Button
                  variant="outlined"
                  color="secondary"
                  startIcon={<RestartAltIcon />}
                  onClick={() => {
                    console.log('[CaseAI] Return Home button clicked');
                    setShowInterview(false);
                    cleanupAudio(sessionId);
                    setCaseOptions({ length: 'standard', style: 'standard', industry: 'general' });
                    setIsRecording(false);
                    setIsProcessing(false);
                    setMessages([]);
                    setFeedback([]);
                    setError(null);
                    setIsPlaying(false);
                    setIsCaseStarted(false);
                    setShowFeedback(false);
                    setSessionId(null);
                    setRecordingTime(0);
                    setIsReplayingAudio(false);
                    setTimer(0);
                    setHint(null);
                    setShowHint(false);
                    setCaseEnded(false);
                    setQuestionCount(0);
                    setLoadingInitialQuestion(false);
                    setCaseName('');
                    setInitialAiText('');
                    setInitialAudioUrl('');
                    setShowFeedbackConfirm(false);
                    if (audioRef.current) {
                      audioRef.current.pause();
                      audioRef.current = null;
                    }
                    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
                      mediaRecorderRef.current.stop();
                    }
                    clearInterval(timerRef.current);
                  }}
                  disabled={isProcessing}
                  sx={{
                    fontWeight: 600,
                    borderRadius: 2,
                    px: 3,
                    py: 1.5,
                    fontSize: 16,
                    border: '2px solid #2563eb',
                    color: '#2563eb',
                    background: '#fff',
                    boxShadow: '0 2px 8px rgba(37,99,235,0.10)',
                    minWidth: 140,
                    minHeight: 40,
                    transition: 'all 0.2s',
                    position: 'relative',
                    zIndex: 1000,
                    overflow: 'visible',
                    '&:hover': {
                      background: '#f3f4f6',
                      borderColor: '#2563eb',
                      transform: 'translateY(-2px) scale(1.02)',
                    },
                    '&:active': {
                      transform: 'scale(0.98)',
                    },
                    '&:disabled': {
                      opacity: 0.7,
                      cursor: 'not-allowed',
                      transform: 'none',
                    },
                    '::after': {
                      content: '""',
                      display: 'block',
                      position: 'absolute',
                      left: '-16px',
                      right: '-16px',
                      bottom: '-12px',
                      height: '12px',
                      borderBottomLeftRadius: '16px',
                      borderBottomRightRadius: '16px',
                      background: 'linear-gradient(90deg, #2DEDFB 0%, #256EA0 50%, #6C38FF 100%)',
                      backgroundSize: '300% 300%',
                      opacity: 0,
                      filter: 'blur(12px)',
                      transition: 'opacity 0.3s',
                      zIndex: 1,
                      animation: 'blueFlow 3s linear infinite alternate',
                    },
                    '&:hover::after': {
                      opacity: 0.5,
                      backgroundPosition: '100% 0',
                    },
                    '@keyframes blueFlow': {
                      '0%': { backgroundPosition: '0% 0' },
                      '100%': { backgroundPosition: '100% 0' },
                    },
                  }}
                >
                  Return Home
                </Button>
                <Box sx={{ flex: 1 }} />
                {isCaseStarted && (
                  <Tooltip title="Get a Hint">
                    <Button
                      variant="outlined"
                      color="secondary"
                      startIcon={<HelpOutlineIcon />}
                      onClick={() => {
                        console.log('[CaseAI] Hint button clicked');
                        if (!isProcessing) {
                          getHint();
                        }
                      }}
                      disabled={isProcessing}
                      sx={{
                        fontWeight: 600,
                        borderRadius: 2,
                        px: 3,
                        py: 1.5,
                        fontSize: 16,
                        border: '2px solid #2563eb',
                        color: '#2563eb',
                        background: '#fff',
                        boxShadow: '0 2px 8px rgba(37,99,235,0.10)',
                        minWidth: 100,
                        minHeight: 40,
                        transition: 'all 0.2s',
                        position: 'relative',
                        zIndex: 1000,
                        overflow: 'visible',
                        '&:hover': {
                          background: '#f3f4f6',
                          borderColor: '#2563eb',
                          transform: 'translateY(-2px) scale(1.02)',
                        },
                        '&:active': {
                          transform: 'scale(0.98)',
                        },
                        '&:disabled': {
                          opacity: 0.7,
                          cursor: 'not-allowed',
                          transform: 'none',
                        },
                        '::after': {
                          content: '""',
                          display: 'block',
                          position: 'absolute',
                          left: '-16px',
                          right: '-16px',
                          bottom: '-12px',
                          height: '12px',
                          borderBottomLeftRadius: '16px',
                          borderBottomRightRadius: '16px',
                          background: 'linear-gradient(90deg, #2DEDFB 0%, #256EA0 50%, #6C38FF 100%)',
                          backgroundSize: '300% 300%',
                          opacity: 0,
                          filter: 'blur(12px)',
                          transition: 'opacity 0.3s',
                          zIndex: 1,
                          animation: 'blueFlow 3s linear infinite alternate',
                        },
                        '&:hover::after': {
                          opacity: 0.5,
                          backgroundPosition: '100% 0',
                        },
                        '@keyframes blueFlow': {
                          '0%': { backgroundPosition: '0% 0' },
                          '100%': { backgroundPosition: '100% 0' },
                        },
                      }}
                    >
                      Hint
                    </Button>
                  </Tooltip>
                )}
                <Dialog open={showHint} onClose={handleCloseHint} maxWidth="sm" fullWidth
                  PaperProps={{ sx: { borderRadius: 5 } }}
                >
                  <DialogTitle sx={{ fontWeight: 700, fontSize: 24, color: '#2563eb', textAlign: 'center', borderRadius: 5 }}>Hint</DialogTitle>
                  <DialogContent sx={{ borderRadius: 5 }}>
                    <Typography sx={{ fontSize: 18, color: '#222', textAlign: 'center', mb: 2 }}>
                      {hint || 'No hint yet.'}
                    </Typography>
                  </DialogContent>
                  <DialogActions sx={{ justifyContent: 'center', pb: 0, mb: 2, width: '100%' }}>
                    <Button onClick={handleCloseHint} variant="contained" sx={{ borderRadius: 999, fontWeight: 700, px: 6, py: 1.5, mt: 1, background: 'linear-gradient(45deg, #000 30%, #333 90%)', color: '#fff', boxShadow: 'none', mx: 'auto', display: 'block', '&:hover': { background: 'linear-gradient(45deg, #111 30%, #444 90%)', boxShadow: 'none' } }}>CLOSE</Button>
                  </DialogActions>
                </Dialog>
              </Box>
              {/* Show feedback report card as a popup dialog at the end of the case */}
              <Dialog open={showFeedbackDialog} onClose={() => setShowFeedbackDialog(false)} maxWidth="md" fullWidth>
                <DialogTitle>Case Feedback Report</DialogTitle>
                <DialogContent>
                  <Box sx={{ 
                    display: 'flex', 
                    gap: 1, 
                    flexWrap: 'wrap', 
                    mb: 2 
                  }}>
                    <Chip 
                      label="Structure" 
                      sx={{ 
                        bgcolor: '#e3f2fd', 
                        color: '#1976d2',
                        fontWeight: 600
                      }} 
                    />
                    <Chip 
                      label="Math" 
                      sx={{ 
                        bgcolor: '#e8f5e9', 
                        color: '#2e7d32',
                        fontWeight: 600
                      }} 
                    />
                    <Chip 
                      label="Communication" 
                      sx={{ 
                        bgcolor: '#f3e5f5', 
                        color: '#7b1fa2',
                        fontWeight: 600
                      }} 
                    />
                    <Chip 
                      label="Business Insight" 
                      sx={{ 
                        bgcolor: '#fff3e0', 
                        color: '#e65100',
                        fontWeight: 600
                      }} 
                    />
                  </Box>
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      whiteSpace: 'pre-line', 
                      mb: 2,
                      '& .structure': {
                        color: '#1976d2',
                        fontWeight: 600
                      },
                      '& .math': {
                        color: '#2e7d32',
                        fontWeight: 600
                      },
                      '& .communication': {
                        color: '#7b1fa2',
                        fontWeight: 600
                      },
                      '& .business': {
                        color: '#e65100',
                        fontWeight: 600
                      }
                    }}
                    dangerouslySetInnerHTML={{
                      __html: feedbackReport
                        .replace(/Structure:/g, '<span class="structure">Structure:</span>')
                        .replace(/Math:/g, '<span class="math">Math:</span>')
                        .replace(/Communication:/g, '<span class="communication">Communication:</span>')
                        .replace(/Business Insight:/g, '<span class="business">Business Insight:</span>')
                    }}
                  />
                </DialogContent>
                <DialogActions>
                  <Button
                    variant="outlined"
                    color="primary"
                    startIcon={<DownloadIcon />}
                    onClick={downloadFeedbackReport}
                    sx={{ fontWeight: 700, borderRadius: 2, px: 4 }}
                  >
                    Download Report Card
                  </Button>
                  <Button 
                    onClick={() => {
                      setShowInterview(false);
                      cleanupAudio(sessionId);
                      setCaseOptions({ length: 'standard', style: 'standard', industry: 'general' });
                      setIsRecording(false);
                      setIsProcessing(false);
                      setMessages([]);
                      setFeedback([]);
                      setError(null);
                      setIsPlaying(false);
                      setIsCaseStarted(false);
                      setShowFeedback(false);
                      setSessionId(null);
                      setRecordingTime(0);
                      setIsReplayingAudio(false);
                      setTimer(0);
                      setHint(null);
                      setShowHint(false);
                      setCaseEnded(false);
                      setQuestionCount(0);
                      setLoadingInitialQuestion(false);
                      setCaseName('');
                      setInitialAiText('');
                      setInitialAudioUrl('');
                      setShowFeedbackConfirm(false);
                      if (audioRef.current) {
                        audioRef.current.pause();
                        audioRef.current = null;
                      }
                      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
                        mediaRecorderRef.current.stop();
                      }
                      clearInterval(timerRef.current);
                    }} 
                    variant="contained" 
                    color="primary" 
                    sx={{ fontWeight: 700, borderRadius: 2, px: 4 }}
                  >
                    Return Home
                  </Button>
                </DialogActions>
              </Dialog>
            </Container>
          </Box>
          <QuickReferenceGuide open={showGuide} onClose={() => setShowGuide(false)} />
          <Dialog open={showFeedbackConfirm} onClose={() => setShowFeedbackConfirm(false)} maxWidth="xs" fullWidth>
            <DialogTitle sx={{ fontWeight: 700, fontSize: 22, color: '#e11d48', textAlign: 'center' }}>Are you sure?</DialogTitle>
            <DialogContent>
              <Typography sx={{ fontSize: 17, color: '#222', textAlign: 'center', mb: 2 }}>
                By getting feedback right now you are ending the case.
              </Typography>
            </DialogContent>
            <DialogActions sx={{ justifyContent: 'center', pb: 2 }}>
              <Button onClick={() => setShowFeedbackConfirm(false)} variant="outlined" sx={{ borderRadius: 2, fontWeight: 700, px: 4 }}>Cancel</Button>
              <Button onClick={() => { setShowFeedbackConfirm(false); endCaseAndGetFeedback(); }} variant="contained" sx={{ borderRadius: 2, fontWeight: 700, px: 4, background: 'linear-gradient(45deg, #000 30%, #333 90%)', color: '#fff', boxShadow: 'none', '&:hover': { background: 'linear-gradient(45deg, #111 30%, #444 90%)', boxShadow: 'none' } }}>Yes, End Case</Button>
            </DialogActions>
          </Dialog>
          {isGeneratingReportCard && <RainbowLoadingDots message="Generating report card..." />}
        </>
      ) : (
        <Landing onStart={(opts) => {
          if (opts.resetState) {
            // Reset all state
            setCaseOptions({ length: 'standard', style: 'standard', industry: 'general' });
            setIsRecording(false);
            setIsProcessing(false);
            setMessages([]);
            setFeedback([]);
            setError(null);
            setIsPlaying(false);
            setIsCaseStarted(false);
            setShowFeedback(false);
            setSessionId(null);
            setRecordingTime(0);
            setIsReplayingAudio(false);
            setTimer(0);
            setHint(null);
            setShowHint(false);
            setCaseEnded(false);
            setQuestionCount(0);
            setLoadingInitialQuestion(false);
            setCaseName('');
            setInitialAiText('');
            setInitialAudioUrl('');
            setShowFeedbackConfirm(false);
            setShowFeedbackDialog(false);
            setFeedbackReport('');
            if (audioRef.current) {
              audioRef.current.pause();
              audioRef.current = null;
            }
            if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
              mediaRecorderRef.current.stop();
            }
            clearInterval(timerRef.current);
          }
          setCaseOptions(opts);
          setShowInterview(true);
          setTimeout(() => getInitialQuestion(opts), 0);
        }} />
      )}
      {/* Move LinkedInFloatingButton outside the conditional so it always renders */}
      <LinkedInFloatingButton />
      {/* Desktop-only disclaimer popup */}
      {!isMobile && (
        <Dialog open={showDisclaimer} onClose={() => setShowDisclaimer(false)} maxWidth="xs" fullWidth>
          <Box sx={{ bgcolor: '#fdecea', p: 3, borderRadius: 0, border: '1.5px solid #fca5a5', position: 'relative' }}>
            <IconButton
              onClick={() => setShowDisclaimer(false)}
              sx={{ position: 'absolute', top: 8, right: 8, color: '#b91c1c' }}
              size="small"
            >
              <CloseIcon />
            </IconButton>
            <Typography variant="h6" sx={{ color: '#b91c1c', fontWeight: 700, mb: 1 }}>
              Notice Regarding Loading Times
            </Typography>
            <Typography sx={{ color: '#7f1d1d', fontSize: 16, fontWeight: 500 }}>
              Due to high user demand and current infrastructure limitations, you may experience longer loading times during peak periods. We appreciate your patience and understanding as we continue to optimize and scale our platform to serve you better.
            </Typography>
          </Box>
        </Dialog>
      )}
    </>
  );
}

export default App; 