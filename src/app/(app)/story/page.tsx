
'use client';

import { Suspense, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { generateMiniNarrative } from '@/ai/flows/generate-mini-narrative';
import { Bot, Loader2, Send } from 'lucide-react';
import Link from 'next/link';
import { useAppContext } from '@/context/AppContext';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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

function StoryGenerator() {
  const { incrementStoriesGenerated } = useAppContext();

  const [targetWords, setTargetWords] = useState('');
  const [narrative, setNarrative] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [topicType, setTopicType] = useState('auto');
  const [csTopic, setCsTopic] = useState(csTopics[0]);
  const [customTopic, setCustomTopic] = useState('');

  const { toast } = useToast();

  const handleGenerateStory = async () => {
    const words = targetWords.split(',').map((word) => word.trim()).filter(Boolean);
    if (words.length === 0) {
      toast({
        variant: 'destructive',
        title: 'No words provided!',
        description: 'Please enter some comma-separated words to generate a story.',
      });
      return;
    }

    let topic: string | undefined = undefined;
    switch (topicType) {
        case 'casual':
        case 'formal':
        case 'request':
            topic = topicType;
            break;
        case 'cs':
            topic = csTopic;
            break;
        case 'custom':
            if (!customTopic.trim()) {
                toast({
                    variant: 'destructive',
                    title: 'Custom topic is empty!',
                    description: 'Please enter a custom topic to generate a story.',
                });
                return;
            }
            topic = customTopic;
            break;
        case 'auto':
        default:
            topic = undefined;
            break;
    }


    setIsLoading(true);
    setNarrative('');

    try {
      const result = await generateMiniNarrative({
        targetWords: words,
        pastQuizPerformance: { correctAnswers: 8, totalQuestions: 10 },
        topic: topic
      });
      setNarrative(result.narrative);
      incrementStoriesGenerated();
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: 'There was a problem generating your story.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight font-headline">AI Story Generator</h2>
        <Bot className="h-8 w-8 text-primary" />
      </div>
      <p className="text-muted-foreground !mt-4">
        Enter some words you want to learn, and our AI will weave them into a mini-story for you.
      </p>

      <div className="grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Create Your Story</CardTitle>
            <CardDescription>
              Enter words separated by commas.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid w-full items-center gap-2">
              <Label htmlFor="words">Target Words</Label>
              <Textarea
                id="words"
                placeholder="e.g., brave, explore, discover, journey"
                value={targetWords}
                onChange={(e) => setTargetWords(e.target.value)}
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
                <Label>Choose a Topic</Label>
                 <RadioGroup value={topicType} onValueChange={setTopicType} className="grid grid-cols-2 gap-2">
                    <Label htmlFor="auto" className="flex items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer text-center text-sm"><RadioGroupItem value="auto" id="auto" className="sr-only peer" />Auto AI Generator</Label>
                    <Label htmlFor="casual" className="flex items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer text-center text-sm"><RadioGroupItem value="casual" id="casual" className="sr-only peer" />Casual</Label>
                    <Label htmlFor="formal" className="flex items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer text-center text-sm"><RadioGroupItem value="formal" id="formal" className="sr-only peer" />Formal</Label>
                    <Label htmlFor="request" className="flex items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer text-center text-sm"><RadioGroupItem value="request" id="request" className="sr-only peer" />Request</Label>
                    <Label htmlFor="cs" className="flex items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer text-center text-sm"><RadioGroupItem value="cs" id="cs" className="sr-only peer" />Computer Science</Label>
                    <Label htmlFor="custom" className="flex items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer text-center text-sm"><RadioGroupItem value="custom" id="custom" className="sr-only peer" />Custom Topic</Label>
                </RadioGroup>
            </div>
            
            {topicType === 'cs' && (
                <div className="space-y-2">
                    <Label htmlFor="cs-topic">Computer Science Sub-topic</Label>
                     <Select value={csTopic} onValueChange={setCsTopic}>
                        <SelectTrigger id="cs-topic">
                            <SelectValue placeholder="Select a CS topic" />
                        </SelectTrigger>
                        <SelectContent>
                            {csTopics.map(topic => (
                                <SelectItem key={topic} value={topic}>{topic}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            )}
            
            {topicType === 'custom' && (
                <div className="space-y-2">
                     <Label htmlFor="custom-topic">Your Custom Topic</Label>
                     <Input 
                        id="custom-topic" 
                        placeholder="e.g., A space adventure on Mars"
                        value={customTopic}
                        onChange={(e) => setCustomTopic(e.target.value)}
                    />
                </div>
            )}


          </CardContent>
          <CardFooter>
            <Button onClick={handleGenerateStory} disabled={isLoading} className="w-full">
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Send className="mr-2 h-4 w-4" />
              )}
              Generate Story
            </Button>
          </CardFooter>
        </Card>

        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Your Adventure</CardTitle>
            <CardDescription>Read the story and get ready for a quiz!</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow prose prose-sm max-w-none text-foreground/90">
            {isLoading && (
              <div className="flex flex-col items-center justify-center h-full gap-2 text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p>Generating your story...</p>
              </div>
            )}
            {!isLoading && !narrative && (
              <div className="flex items-center justify-center h-full text-center text-muted-foreground">
                <p>Your generated story will appear here.</p>
              </div>
            )}
            {narrative && <p>{narrative}</p>}
          </CardContent>
          {narrative && (
             <CardFooter>
                <Button asChild className="w-full">
                    <Link href="/quiz">Test Your Knowledge</Link>
                </Button>
             </CardFooter>
          )}
        </Card>
      </div>
    </div>
  );
}

export default function StoryPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <StoryGenerator />
    </Suspense>
  );
}
