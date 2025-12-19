// src/lib/database.types.ts
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      articles: {
        Row: {
          id: string
          title: string
          slug: string
          excerpt: string | null
          content: string | null
          category_id: string | null
          subcategory_id: string | null
          creator_id: string | null
          author_name: string | null
          featured_image_id: string | null
          featured_image_url: string | null
          read_time: string | null
          featured: boolean | null
          seo_title: string | null
          seo_description: string | null
          seo_keywords: string | null
          status: string | null
          published_at: string | null
          scheduled_at: string | null
          view_count: number | null
          like_count: number | null
          share_count: number | null
          created_at: string | null
          updated_at: string | null
          created_by: string | null
          updated_by: string | null
        }
        Insert: {
          id?: string
          title: string
          slug: string
          excerpt?: string | null
          content?: string | null
          category_id?: string | null
          subcategory_id?: string | null
          creator_id?: string | null
          author_name?: string | null
          featured_image_id?: string | null
          featured_image_url?: string | null
          read_time?: string | null
          featured?: boolean | null
          seo_title?: string | null
          seo_description?: string | null
          seo_keywords?: string | null
          status?: string | null
          published_at?: string | null
          scheduled_at?: string | null
          view_count?: number | null
          like_count?: number | null
          share_count?: number | null
          created_at?: string | null
          updated_at?: string | null
          created_by?: string | null
          updated_by?: string | null
        }
        Update: {
          id?: string
          title?: string
          slug?: string
          excerpt?: string | null
          content?: string | null
          category_id?: string | null
          subcategory_id?: string | null
          creator_id?: string | null
          author_name?: string | null
          featured_image_id?: string | null
          featured_image_url?: string | null
          read_time?: string | null
          featured?: boolean | null
          seo_title?: string | null
          seo_description?: string | null
          seo_keywords?: string | null
          status?: string | null
          published_at?: string | null
          scheduled_at?: string | null
          view_count?: number | null
          like_count?: number | null
          share_count?: number | null
          created_at?: string | null
          updated_at?: string | null
          created_by?: string | null
          updated_by?: string | null
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          order_index: number | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          order_index?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          order_index?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      subcategories: {
        Row: {
          id: string
          category_id: string | null
          name: string
          slug: string
          order_index: number | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          category_id?: string | null
          name: string
          slug: string
          order_index?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          category_id?: string | null
          name?: string
          slug?: string
          order_index?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      creators: {
        Row: {
          id: string
          name: string
          profession: string | null
          age: number | null
          experience: string | null
          specialty: string | null
          bio: string | null
          image_url: string | null
          email: string | null
          social_links: Json | null
          verified: boolean | null
          followers_count: number | null
          articles_count: number | null
          status: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          profession?: string | null
          age?: number | null
          experience?: string | null
          specialty?: string | null
          bio?: string | null
          image_url?: string | null
          email?: string | null
          social_links?: Json | null
          verified?: boolean | null
          followers_count?: number | null
          articles_count?: number | null
          status?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          profession?: string | null
          age?: number | null
          experience?: string | null
          specialty?: string | null
          bio?: string | null
          image_url?: string | null
          email?: string | null
          social_links?: Json | null
          verified?: boolean | null
          followers_count?: number | null
          articles_count?: number | null
          status?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      tags: {
        Row: {
          id: string
          name: string
          slug: string
          color: string | null
          usage_count: number | null
          created_at: string | null
        }
        Insert: {
          id?: string
          name: string
          slug: string
          color?: string | null
          usage_count?: number | null
          created_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          color?: string | null
          usage_count?: number | null
          created_at?: string | null
        }
      }
      daily_news: {
        Row: {
          id: string
          title: string
          content: string
          excerpt: string | null
          published_date: string
          featured: boolean | null
          status: string | null
          view_count: number | null
          created_at: string | null
          updated_at: string | null
          created_by: string | null
        }
        Insert: {
          id?: string
          title: string
          content: string
          excerpt?: string | null
          published_date: string
          featured?: boolean | null
          status?: string | null
          view_count?: number | null
          created_at?: string | null
          updated_at?: string | null
          created_by?: string | null
        }
        Update: {
          id?: string
          title?: string
          content?: string
          excerpt?: string | null
          published_date?: string
          featured?: boolean | null
          status?: string | null
          view_count?: number | null
          created_at?: string | null
          updated_at?: string | null
          created_by?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}