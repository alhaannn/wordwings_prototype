import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types for TypeScript
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string
          word_coins: number
          stories_generated: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          name: string
          word_coins?: number
          stories_generated?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          word_coins?: number
          stories_generated?: number
          created_at?: string
          updated_at?: string
        }
      }
      mastered_words: {
        Row: {
          id: string
          user_id: string
          word: string
          mastered_at: string
        }
        Insert: {
          id?: string
          user_id: string
          word: string
          mastered_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          word?: string
          mastered_at?: string
        }
      }
      user_badges: {
        Row: {
          id: string
          user_id: string
          badge_id: string
          earned_at: string
        }
        Insert: {
          id?: string
          user_id: string
          badge_id: string
          earned_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          badge_id?: string
          earned_at?: string
        }
      }
      user_inventory: {
        Row: {
          id: string
          user_id: string
          item_id: string
          quantity: number
          acquired_at: string
        }
        Insert: {
          id?: string
          user_id: string
          item_id: string
          quantity?: number
          acquired_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          item_id?: string
          quantity?: number
          acquired_at?: string
        }
      }
      generated_stories: {
        Row: {
          id: string
          user_id: string
          title: string | null
          content: string
          words_used: string[]
          difficulty_level: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title?: string | null
          content: string
          words_used: string[]
          difficulty_level?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string | null
          content?: string
          words_used?: string[]
          difficulty_level?: string
          created_at?: string
        }
      }
      quiz_questions: {
        Row: {
          id: string
          user_id: string
          story_id: string
          question: string
          correct_answer: string
          wrong_answers: string[]
          answered_correctly: boolean | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          story_id: string
          question: string
          correct_answer: string
          wrong_answers: string[]
          answered_correctly?: boolean | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          story_id?: string
          question?: string
          correct_answer?: string
          wrong_answers?: string[]
          answered_correctly?: boolean | null
          created_at?: string
        }
      }
    }
  }
}
