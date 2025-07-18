
'use client';
import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useAppContext } from '@/context/AppContext';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { PartyPopper, XCircle, CheckCircle, Lightbulb } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { QuizDifficulty, QuizQuestion } from '@/lib/types';

type AnswerState = 'unanswered' | 'correct' | 'incorrect';

// Function to shuffle an array
const shuffleArray = <T,>(array: T[]): T[] => {
  return [...array].sort(() => Math.random() - 0.5);
};


export default function QuizPage() {
  const [difficulty, setDifficulty] = useState<QuizDifficulty | 'mixed'>('mixed');
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [answerState, setAnswerState] = useState<AnswerState>('unanswered');
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const { addCoins, addMasteredWord, masteredWords, quizQuestions: allQuizQuestions } = useAppContext();
  const { toast } = useToast();

  const loadAndShuffleQuestions = useCallback((selectedDifficulty: QuizDifficulty | 'mixed') => {
    let potentialQuestions = allQuizQuestions.filter(q => !masteredWords.has(q.word));
    
    let questions;
    if (selectedDifficulty === 'mixed') {
      questions = potentialQuestions;
    } else {
      questions = potentialQuestions.filter((q) => q.difficulty === selectedDifficulty);
    }
    setQuizQuestions(shuffleArray(questions));
  }, [allQuizQuestions, masteredWords]);

  useEffect(() => {
    loadAndShuffleQuestions(difficulty);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setAnswerState('unanswered');
    setScore(0);
    setQuizFinished(false);
  }, [difficulty, loadAndShuffleQuestions, allQuizQuestions]);
  
  const currentQuestion = quizQuestions[currentQuestionIndex];
  const progress = quizQuestions.length > 0 ? ((currentQuestionIndex + 1) / quizQuestions.length) * 100 : 0;

  const handleRestart = (newDifficulty: QuizDifficulty | 'mixed') => {
    setDifficulty(newDifficulty);
    // The useEffect will handle the rest
  }

  const handleDifficultyChange = (value: QuizDifficulty | 'mixed') => {
    handleRestart(value);
  }

  const handleCheckAnswer = () => {
    if (!selectedAnswer || !currentQuestion) return;
    if (selectedAnswer === currentQuestion.correctAnswer) {
      setAnswerState('correct');
      setScore(score + 1);
      addMasteredWord(currentQuestion.word);
    } else {
      setAnswerState('incorrect');
    }
  };

  const handleNextQuestion = () => {
    setAnswerState('unanswered');
    setSelectedAnswer(null);
    if (currentQuestionIndex < quizQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setQuizFinished(true);
      const coinsEarned = score * 5;
      if (coinsEarned > 0) {
        addCoins(coinsEarned);
        toast({
            title: 'Quiz Complete!',
            description: `You earned ${coinsEarned} WordCoins!`,
        });
      } else {
         toast({
            title: 'Quiz Complete!',
            description: `Keep practicing to earn more WordCoins!`,
        });
      }
    }
  };
  
  if (quizFinished) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] p-4 text-center">
        <PartyPopper className="h-16 w-16 text-primary mb-4" />
        <h2 className="text-3xl font-bold font-headline mb-2">Quiz Complete!</h2>
        <p className="text-xl text-muted-foreground mb-4">You scored {score} out of {quizQuestions.length}</p>
        <p className="text-lg mb-6">You earned {score * 5} WordCoins!</p>
        <Button onClick={() => handleRestart(difficulty)}>Try Another Quiz</Button>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2 mb-4">
        <h2 className="text-3xl font-bold tracking-tight font-headline">Practice Quiz</h2>
        <Select value={difficulty} onValueChange={handleDifficultyChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select difficulty" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="easy">Easy</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="hard">Hard</SelectItem>
            <SelectItem value="mixed">Mixed</SelectItem>
          </SelectContent>
        </Select>
      </div>
       {quizQuestions.length > 0 && currentQuestion ? (
        <>
            <div className="w-full bg-card p-2 rounded-lg">
                <Progress value={progress} className="w-full" />
                <p className="text-sm text-right text-muted-foreground mt-1">{currentQuestionIndex + 1} / {quizQuestions.length}</p>
            </div>
            <Card>
                <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="h-6 w-6 text-primary" />
                    {currentQuestion.question}
                </CardTitle>
                <CardDescription>
                    Select the best option that answers the question.
                </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                <RadioGroup
                    value={selectedAnswer ?? ''}
                    onValueChange={setSelectedAnswer}
                    disabled={answerState !== 'unanswered'}
                >
                    {currentQuestion.options.map((option) => {
                    const isCorrect = option === currentQuestion.correctAnswer;
                    const isSelected = option === selectedAnswer;
                    const stateClass =
                        answerState === 'correct' && isSelected ? 'border-green-500 bg-green-500/10' :
                        answerState === 'incorrect' && isSelected ? 'border-red-500 bg-red-500/10' :
                        '';
                    const icon = 
                        answerState === 'correct' && isSelected ? <CheckCircle className="h-5 w-5 text-green-500"/> :
                        answerState === 'incorrect' && isSelected ? <XCircle className="h-5 w-5 text-red-500"/> :
                        null;
                        
                    return (
                        <Label
                        key={option}
                        htmlFor={option}
                        className={cn(
                            "flex items-center justify-between rounded-md border p-4 cursor-pointer hover:bg-accent/50 transition-colors",
                            stateClass
                        )}
                        >
                        <span className="font-medium">{option}</span>
                        <div className="flex items-center gap-2">
                            {icon}
                            <RadioGroupItem value={option} id={option} />
                        </div>
                        </Label>
                    );
                    })}
                </RadioGroup>

                {answerState !== 'unanswered' && (
                    <div className={cn("p-4 rounded-md text-center font-semibold", 
                    answerState === 'correct' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    )}>
                    {answerState === 'correct' ? 'Correct! Great job!' : `Not quite. The correct answer is "${currentQuestion.correctAnswer}".`}
                    </div>
                )}

                <div className="flex justify-end">
                    {answerState === 'unanswered' ? (
                    <Button onClick={handleCheckAnswer} disabled={!selectedAnswer}>
                        Check Answer
                    </Button>
                    ) : (
                    <Button onClick={handleNextQuestion}>
                        {currentQuestionIndex === quizQuestions.length - 1 ? 'Finish Quiz' : 'Next Question'}
                    </Button>
                    )}
                </div>
                </CardContent>
            </Card>
        </>
       ) : (
        <Card className="flex flex-col items-center justify-center p-8 text-center min-h-[400px]">
          <CardHeader>
            <CardTitle>No New Questions Available</CardTitle>
            <CardDescription>
              You've mastered all the available words for this difficulty! Go to the "Learn" page to add more words.
            </CardDescription>
          </CardHeader>
        </Card>
       )}
    </div>
  );
}
