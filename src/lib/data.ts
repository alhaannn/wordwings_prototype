
import type { MarketItem, QuizQuestion, Badge, NewWord } from './types';
import { BookCheck, Feather, Star } from 'lucide-react';

export const marketItems: MarketItem[] = [
  { id: '1', name: 'Apple', description: 'A crisp, delicious apple.', price: 5, icon: '🍎', category: 'food' },
  { id: '2', name: 'Bread', description: 'A warm loaf of bread.', price: 10, icon: '🍞', category: 'food' },
  { id: '3', name: 'Hammer', description: 'A sturdy hammer.', price: 25, icon: '🔨', category: 'tool' },
  { id: '4', name: 'Compass', description: 'Helps you find your way.', price: 50, icon: '🧭', category: 'tool' },
  { id: '5', name: 'Shiny Stone', description: 'A beautiful, smooth stone.', price: 15, icon: '💎', category: 'trinket' },
  { id: '6', name: 'Feather', description: 'A light, colorful feather.', price: 20, icon: '🪶', category: 'trinket' },
];

export const progressData = [
  { month: 'January', mastered: 10 },
  { month: 'February', mastered: 25 },
  { month: 'March', mastered: 45 },
  { month: 'April', mastered: 60 },
  { month: 'May', mastered: 75 },
  { month: 'June', mastered: 90 },
];

export const sampleQuiz: QuizQuestion[] = [
  // Easy
  {
    word: 'brave',
    question: "What does 'brave' mean?",
    options: ['Scared', 'Courageous', 'Tired', 'Hungry'],
    correctAnswer: 'Courageous',
    difficulty: 'easy',
  },
  {
    word: 'happy',
    question: "Which word means feeling or showing pleasure?",
    options: ['Sad', 'Angry', 'Happy', 'Bored'],
    correctAnswer: 'Happy',
    difficulty: 'easy',
  },
  // Intermediate
  {
    word: 'explore',
    question: "What is a synonym for 'explore'?",
    options: ['Ignore', 'Sleep', 'Investigate', 'Forget'],
    correctAnswer: 'Investigate',
    difficulty: 'medium',
  },
  {
    word: 'discover',
    question: "If you 'discover' something, you...",
    options: ['Lose it', 'Find it', 'Break it', 'Eat it'],
    correctAnswer: 'Find it',
    difficulty: 'medium',
  },
   // Hard
  {
    word: 'journey',
    question: "A long 'journey' is a...",
    options: ['Nap', 'Snack', 'Trip', 'Song'],
    correctAnswer: 'Trip',
    difficulty: 'hard',
  },
  {
    word: 'eloquent',
    question: "What does it mean to be 'eloquent'?",
    options: ['Shy and quiet', 'Fluent and persuasive', 'Rude and abrupt', 'Clumsy and awkward'],
    correctAnswer: 'Fluent and persuasive',
    difficulty: 'hard',
  },
];

export const allBadges: Omit<Badge, 'unlocked' | 'date'>[] = [
    { id: 'first-word', name: 'First Word Mastered', description: 'You learned your first word!', icon: Star, check: (state) => state.masteredWords.size >= 1 },
    { id: 'ten-words', name: 'Word Collector', description: 'Mastered 10 words.', icon: BookCheck, check: (state) => state.masteredWords.size >= 10 },
    { id: 'first-story', name: 'Story Starter', description: 'Generated your first story.', icon: Feather, check: (state) => state.storiesGenerated >= 1},
    // The 'Explorer' badge logic would require tracking visited zones, which can be added later.
    // { id: 'explorer', name: 'Explorer', description: 'Visited every location on the map.', date: '2024-06-01', icon: Compass, check: () => false },
];


export const newWords: NewWord[] = [
  // Easy
  { word: 'serene', definition: 'Calm, peaceful, and untroubled; tranquil.', example: 'The lake was serene and still in the early morning.', difficulty: 'easy', imageHint: 'calm lake' },
  { word: 'vivid', definition: 'Producing powerful feelings or strong, clear images in the mind.', example: 'She had a vivid dream about flying over mountains.', difficulty: 'easy', imageHint: 'colorful dream' },
  { word: 'cozy', definition: 'Giving a feeling of comfort, warmth, and relaxation.', example: 'We sat by the fire in the cozy cabin.', difficulty: 'easy', imageHint: 'warm fireplace' },
  { word: 'gleam', definition: 'Shine brightly, especially with reflected light.', example: 'The polished floors started to gleam.', difficulty: 'easy', imageHint: 'shiny floor' },
  { word: 'crisp', definition: 'Firm, dry, and brittle, fresh.', example: 'The autumn air was crisp and cool.', difficulty: 'easy', imageHint: 'autumn leaves' },
  { word: 'gentle', definition: 'Having or showing a mild, kind, or tender temperament or character.', example: 'He had a gentle voice that calmed the child.', difficulty: 'easy', imageHint: 'helping hand' },
  // Medium
  { word: 'ephemeral', definition: 'Lasting for a very short time.', example: 'The beauty of the cherry blossoms is ephemeral.', difficulty: 'medium', imageHint: 'cherry blossoms' },
  { word: 'ubiquitous', definition: 'Present, appearing, or found everywhere.', example: 'Smartphones are now ubiquitous across the globe.', difficulty: 'medium', imageHint: 'many smartphones' },
  { word: 'mellifluous', definition: 'A sound that is sweet and musical; pleasant to hear.', example: 'Her mellifluous voice enchanted the audience.', difficulty: 'medium', imageHint: 'person singing' },
  { word: 'pensive', definition: 'Engaged in, involving, or reflecting deep or serious thought.', example: 'She looked pensive as she stared out the window.', difficulty: 'medium', imageHint: 'thoughtful person' },
  { word: 'resilient', definition: 'Able to withstand or recover quickly from difficult conditions.', example: 'The small plant was resilient, surviving the harsh winter.', difficulty: 'medium', imageHint: 'plant snow' },
  { word: 'eloquent', definition: 'Fluent or persuasive in speaking or writing.', example: 'The speaker delivered an eloquent and moving speech.', difficulty: 'medium', imageHint: 'public speaker' },
  // Hard
  { word: 'pulchritudinous', definition: 'Having great physical beauty.', example: 'The pulchritudinous landscape was breathtaking.', difficulty: 'hard', imageHint: 'beautiful landscape' },
  { word: 'sesquipedalian', definition: 'Characterized by long words; long-winded.', example: 'His sesquipedalian speech was impressive but hard to follow.', difficulty: 'hard', imageHint: 'long book' },
  { word: 'anachronistic', definition: 'Belonging to a period other than that being portrayed.', example: 'A knight using a cellphone would be anachronistic.', difficulty: 'hard', imageHint: 'knight cellphone' },
  { word: 'perspicacious', definition: 'Having a ready insight into and understanding of things.', example: 'The perspicacious detective solved the case with a single clue.', difficulty: 'hard', imageHint: 'detective clue' },
  { word: 'ineffable', definition: 'Too great or extreme to be expressed or described in words.', example: 'The view from the summit was one of ineffable beauty.', difficulty: 'hard', imageHint: 'mountain summit' },
  { word: 'obfuscate', definition: 'Render obscure, unclear, or unintelligible.', example: 'The politician tried to obfuscate the issue with complex jargon.', difficulty: 'hard', imageHint: 'confused person' },
];
