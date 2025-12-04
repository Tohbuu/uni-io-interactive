import React, { useState } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  Typography, 
  Box, 
  Radio, 
  RadioGroup, 
  FormControlLabel, 
  FormControl, 
  LinearProgress 
} from '@mui/material';
import { CheckCircle, Cancel } from '@mui/icons-material';

const questions = [
  {
    question: "Which planet is closest to the Sun?",
    options: ["Venus", "Mercury", "Mars", "Earth"],
    answer: "Mercury"
  },
  {
    question: "Which planet is known as the Red Planet?",
    options: ["Jupiter", "Mars", "Saturn", "Venus"],
    answer: "Mars"
  },
  {
    question: "Which is the largest planet in our Solar System?",
    options: ["Saturn", "Jupiter", "Neptune", "Uranus"],
    answer: "Jupiter"
  },
  {
    question: "What is the Great Red Spot on Jupiter?",
    options: ["A volcano", "A crater", "A storm", "A lake"],
    answer: "A storm"
  },
  {
    question: "Which planet has the most prominent ring system?",
    options: ["Uranus", "Neptune", "Saturn", "Jupiter"],
    answer: "Saturn"
  }
];

interface QuizProps {
  open: boolean;
  onClose: () => void;
  onComplete: (score: number) => void;
}

export default function Quiz({ open, onClose, onComplete }: QuizProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOption, setSelectedOption] = useState('');
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const handleOptionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedOption((event.target as HTMLInputElement).value);
  };

  const handleSubmit = () => {
    const correct = selectedOption === questions[currentQuestion].answer;
    setIsCorrect(correct);
    if (correct) setScore(score + 1);

    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedOption('');
        setIsCorrect(null);
      } else {
        setShowResult(true);
      }
    }, 1000);
  };

  const handleFinish = () => {
    onComplete(score);
    resetQuiz();
    onClose();
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setSelectedOption('');
    setScore(0);
    setShowResult(false);
    setIsCorrect(null);
  };

  return (
    <Dialog open={open} onClose={onClose} PaperProps={{ sx: { bgcolor: '#222', color: 'white', minWidth: 400 } }}>
      {!showResult ? (
        <>
          <DialogTitle sx={{ borderBottom: '1px solid #444' }}>
            Cosmic Quiz ({currentQuestion + 1}/{questions.length})
          </DialogTitle>
          <DialogContent sx={{ pt: 3 }}>
            <LinearProgress 
              variant="determinate" 
              value={((currentQuestion) / questions.length) * 100} 
              sx={{ mb: 3, bgcolor: '#444', '& .MuiLinearProgress-bar': { bgcolor: '#1976d2' } }} 
            />
            <Typography variant="h6" gutterBottom>{questions[currentQuestion].question}</Typography>
            <FormControl component="fieldset" sx={{ width: '100%', mt: 2 }}>
              <RadioGroup value={selectedOption} onChange={handleOptionChange}>
                {questions[currentQuestion].options.map((option) => (
                  <FormControlLabel 
                    key={option} 
                    value={option} 
                    control={<Radio sx={{ color: '#888', '&.Mui-checked': { color: '#1976d2' } }} />} 
                    label={option} 
                    sx={{ 
                      bgcolor: 'rgba(255,255,255,0.05)', 
                      mb: 1, 
                      borderRadius: 1, 
                      pl: 1,
                      border: isCorrect !== null && option === questions[currentQuestion].answer 
                        ? '1px solid #4caf50' 
                        : isCorrect !== null && option === selectedOption && !isCorrect 
                        ? '1px solid #f44336' 
                        : '1px solid transparent'
                    }} 
                  />
                ))}
              </RadioGroup>
            </FormControl>
            {isCorrect === true && <Typography sx={{ color: '#4caf50', mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}><CheckCircle /> Correct!</Typography>}
            {isCorrect === false && <Typography sx={{ color: '#f44336', mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}><Cancel /> Incorrect!</Typography>}
          </DialogContent>
          <DialogActions sx={{ p: 2, borderTop: '1px solid #333' }}>
            <Button onClick={onClose} sx={{ color: '#888' }}>Cancel</Button>
            <Button 
              variant="contained" 
              onClick={handleSubmit} 
              disabled={!selectedOption || isCorrect !== null}
            >
              Submit
            </Button>
          </DialogActions>
        </>
      ) : (
        <>
          <DialogTitle sx={{ textAlign: 'center' }}>Quiz Complete!</DialogTitle>
          <DialogContent sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h2" sx={{ color: '#1976d2', fontWeight: 'bold' }}>
              {score} / {questions.length}
            </Typography>
            <Typography variant="subtitle1" sx={{ mt: 2, color: '#aaa' }}>
              {score === questions.length ? "Perfect Score! You are a Cosmic Genius!" : "Good job! Keep exploring to learn more."}
            </Typography>
          </DialogContent>
          <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
            <Button variant="contained" onClick={handleFinish} size="large">
              Close
            </Button>
          </DialogActions>
        </>
      )}
    </Dialog>
  );
}