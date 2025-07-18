
'use client';
import { useState, useMemo } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAppContext } from '@/context/AppContext';
import { newWords } from '@/lib/data';
import { GraduationCap, CheckCircle, PlusCircle, Shuffle, Sparkles, HelpCircle, Loader2, Bot } from 'lucide-react';
import { generateQuizQuestion } from '@/ai/flows/generate-quiz-question';
import { generateTopicWords } from '@/ai/flows/generate-topic-words';
import { useToast } from '@/hooks/use-toast';
import type { NewWord } from '@/lib/types';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

const WORDS_PER_BATCH = 3;

const csTopics = [
    'Computer Science Fundamentals', 
    'Data Structures and Algorithms', 
    'Web Development', 
    'Artificial Intelligence', 
    'Cloud Computing', 
    'System Design', 
    'Cyber Security', 
    'Interview Preparation'
];

export default function LearnPage() {
  const { addQuizQuestion, quizQuestions } = useAppContext();
  const [difficulty, setDifficulty] = useState('medium');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [generatingQuestionFor, setGeneratingQuestionFor] = useState<string | null>(null);
  const { toast } = useToast();
  
  // State for topic-based word generation
  const [topicType, setTopicType] = useState('casual');
  const [csTopic, setCsTopic] = useState(csTopics[0]);
  const [customTopic, setCustomTopic] = useState('');
  const [topicWords, setTopicWords] = useState<NewWord[]>([]);
  const [isGeneratingWords, setIsGeneratingWords] = useState(false);
  const [topicDifficulty, setTopicDifficulty] = useState('medium');


  const filteredWords = useMemo(() => {
    return newWords.filter(word => word.difficulty === difficulty);
  }, [difficulty]);

  const currentWords = useMemo(() => {
    return filteredWords.slice(currentIndex, currentIndex + WORDS_PER_BATCH);
  }, [filteredWords, currentIndex]);

  const handleNextBatch = () => {
    if (currentIndex + WORDS_PER_BATCH < filteredWords.length) {
      setCurrentIndex(currentIndex + WORDS_PER_BATCH);
    } else {
      setCurrentIndex(0);
    }
  };

  const handleAddToPractice = async (word: NewWord) => {
    const questionExists = quizQuestions.some(q => q.word === word.word);
    if(questionExists) {
        toast({
            title: 'Already Added!',
            description: `A quiz question for "${word.word}" already exists. It's ready for practice!`,
        });
        return;
    }

    setGeneratingQuestionFor(word.word);

    try {
      const newQuestion = await generateQuizQuestion({
        word: word.word,
        definition: word.definition,
        difficulty: word.difficulty,
      });
      addQuizQuestion(newQuestion);
      toast({
        title: 'Question Added!',
        description: `A new quiz question for "${word.word}" is ready for you in the Practice Quiz section.`,
      });
    } catch (error) {
      console.error("Failed to generate quiz question:", error);
      toast({
        variant: 'destructive',
        title: 'Generation Failed',
        description: `Could not create a quiz question for "${word.word}". Please try again.`,
      });
    } finally {
      setGeneratingQuestionFor(null);
    }
  };
  
  const handleSelectChange = (value: string) => {
    setDifficulty(value);
    setCurrentIndex(0);
  }
  
  const handleGenerateTopicWords = async () => {
    let topic: string;
    switch (topicType) {
        case 'cs':
            topic = csTopic;
            break;
        case 'custom':
            if (!customTopic.trim()) {
                toast({ variant: 'destructive', title: 'Custom topic is empty!', description: 'Please enter a custom topic.' });
                return;
            }
            topic = customTopic;
            break;
        default:
            topic = topicType;
            break;
    }

    setIsGeneratingWords(true);
    setTopicWords([]);
    try {
        const result = await generateTopicWords({ topic, difficulty: topicDifficulty as "easy" | "medium" | "hard" });
        setTopicWords(result.words);
    } catch (error) {
        console.error("Failed to generate topic words:", error);
        toast({
            variant: 'destructive',
            title: 'Word Generation Failed',
            description: 'Could not generate words for this topic. Please try again.',
        });
    } finally {
        setIsGeneratingWords(false);
    }
  };

  return (
    <div className="flex-1 space-y-8 p-4 md:p-8 pt-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between space-y-2 md:space-y-0">
        <div>
            <h2 className="text-3xl font-bold tracking-tight font-headline">Learn New Words</h2>
            <p className="text-muted-foreground">
                Discover new vocabulary to expand your linguistic horizons.
            </p>
        </div>
        <GraduationCap className="h-8 w-8 text-primary hidden md:block" />
      </div>

      <Card>
        <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <CardTitle>Vocabulary Discovery</CardTitle>
            <CardDescription>A selection of words for you to learn.</CardDescription>
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <Select value={difficulty} onValueChange={handleSelectChange}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Select difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" onClick={handleNextBatch} aria-label="Next words">
              <Shuffle className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {currentWords.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {currentWords.map((word) => {
                const isAdded = quizQuestions.some(q => q.word === word.word);
                const isGenerating = generatingQuestionFor === word.word;
                return (
                  <Card key={word.word} className="flex flex-col card-hover-effect">
                    <CardHeader>
                      <Image 
                        src={`https://source.unsplash.com/400x200/?${word.imageHint.replace(' ', ',')}`} 
                        alt={`Illustration for ${word.word}`}
                        width={400}
                        height={200}
                        className="rounded-lg object-cover"
                        data-ai-hint={word.imageHint}
                        unoptimized
                      />
                    </CardHeader>
                    <CardContent className="flex-grow space-y-2">
                      <h3 className="text-xl font-bold font-headline flex items-center gap-2">
                        {word.word}
                        {word.difficulty === 'easy' && <Sparkles className="h-4 w-4 text-green-500" />}
                        {word.difficulty === 'medium' && <HelpCircle className="h-4 w-4 text-yellow-500" />}
                        {word.difficulty === 'hard' && <Sparkles className="h-4 w-4 text-red-500" />}
                      </h3>
                      <p className="text-sm text-muted-foreground italic">{word.definition}</p>
                      <p className="text-sm pt-2">"{word.example}"</p>
                    </CardContent>
                    <CardFooter>
                      <Button className="w-full" onClick={() => handleAddToPractice(word)} disabled={isAdded || isGenerating}>
                        {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> :
                         isAdded ? <CheckCircle className="mr-2 h-4 w-4" /> : 
                         <PlusCircle className="mr-2 h-4 w-4" />}
                        {isGenerating ? 'Generating Quiz...' :
                         isAdded ? 'Added to Practice' : 
                         'Add to Practice'}
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <p>No words found for this difficulty level.</p>
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
            <CardTitle>Topic-Based Vocabulary</CardTitle>
            <CardDescription>Generate a list of words based on a topic of your choice.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-4">
                    <Label>Choose a Topic</Label>
                    <RadioGroup value={topicType} onValueChange={setTopicType} className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <Label htmlFor="casual" className="flex items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"><RadioGroupItem value="casual" id="casual" className="sr-only peer" />Casual</Label>
                        <Label htmlFor="formal" className="flex items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"><RadioGroupItem value="formal" id="formal" className="sr-only peer" />Formal</Label>
                        <Label htmlFor="request" className="flex items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"><RadioGroupItem value="request" id="request" className="sr-only peer" />Request</Label>
                        <Label htmlFor="cs" className="flex items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"><RadioGroupItem value="cs" id="cs" className="sr-only peer" />Computer Science</Label>
                        <Label htmlFor="custom" className="flex items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"><RadioGroupItem value="custom" id="custom" className="sr-only peer" />Custom</Label>
                    </RadioGroup>
                </div>
                 <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="topic-difficulty">Difficulty</Label>
                        <Select value={topicDifficulty} onValueChange={setTopicDifficulty}>
                            <SelectTrigger id="topic-difficulty"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="easy">Easy</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="hard">Hard</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    {topicType === 'cs' && (
                      <div className="space-y-2">
                          <Label htmlFor="cs-topic">Sub-topic</Label>
                          <Select value={csTopic} onValueChange={setCsTopic}>
                              <SelectTrigger id="cs-topic"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                  {csTopics.map(topic => (<SelectItem key={topic} value={topic}>{topic}</SelectItem>))}
                              </SelectContent>
                          </Select>
                      </div>
                    )}
                    {topicType === 'custom' && (
                      <div className="space-y-2">
                          <Label htmlFor="custom-topic">Your Topic</Label>
                          <Input id="custom-topic" placeholder="e.g., Space Exploration" value={customTopic} onChange={(e) => setCustomTopic(e.target.value)} />
                      </div>
                    )}
                </div>
            </div>
             <Button onClick={handleGenerateTopicWords} disabled={isGeneratingWords} className="w-full md:w-auto">
                {isGeneratingWords ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Bot className="mr-2 h-4 w-4" />}
                Generate Words
            </Button>
            
            <div className="mt-6">
            {isGeneratingWords && (
                <div className="flex flex-col items-center justify-center text-center text-muted-foreground h-48">
                    <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                    <p>Our AI is crafting your word list...</p>
                </div>
            )}
            {topicWords.length > 0 && (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {topicWords.map((word) => {
                        const isAdded = quizQuestions.some(q => q.word === word.word);
                        const isGenerating = generatingQuestionFor === word.word;
                        return (
                            <Card key={word.word} className="flex flex-col card-hover-effect">
                                <CardHeader>
                                    <Image 
                                        src={`https://source.unsplash.com/400x200/?${word.imageHint.replace(' ', ',')}`} 
                                        alt={`Illustration for ${word.word}`}
                                        width={400}
                                        height={200}
                                        className="rounded-lg object-cover"
                                        data-ai-hint={word.imageHint}
                                        unoptimized
                                    />
                                </CardHeader>
                                <CardContent className="flex-grow space-y-2">
                                <h3 className="text-xl font-bold font-headline flex items-center gap-2">
                                    {word.word}
                                    {word.difficulty === 'easy' && <Sparkles className="h-4 w-4 text-green-500" />}
                                    {word.difficulty === 'medium' && <HelpCircle className="h-4 w-4 text-yellow-500" />}
                                    {word.difficulty === 'hard' && <Sparkles className="h-4 w-4 text-red-500" />}
                                </h3>
                                <p className="text-sm text-muted-foreground italic">{word.definition}</p>
                                <p className="text-sm pt-2">"{word.example}"</p>
                                </CardContent>
                                <CardFooter>
                                <Button className="w-full" onClick={() => handleAddToPractice(word)} disabled={isAdded || isGenerating}>
                                    {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> :
                                    isAdded ? <CheckCircle className="mr-2 h-4 w-4" /> : 
                                    <PlusCircle className="mr-2 h-4 w-4" />}
                                    {isGenerating ? 'Generating Quiz...' :
                                    isAdded ? 'Added to Practice' : 
                                    'Add to Practice'}
                                </Button>
                                </CardFooter>
                            </Card>
                        );
                    })}
                </div>
            )}
             {!isGeneratingWords && topicWords.length === 0 && (
                 <div className="text-center py-12 text-muted-foreground">
                    <p>Generated words will appear here.</p>
                </div>
            )}
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
