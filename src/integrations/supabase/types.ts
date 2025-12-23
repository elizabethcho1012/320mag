export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      article_tags: {
        Row: {
          article_id: string
          tag_id: string
        }
        Insert: {
          article_id: string
          tag_id: string
        }
        Update: {
          article_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "article_tags_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "article_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      articles: {
        Row: {
          author_name: string | null
          category_id: string | null
          content: string | null
          created_at: string | null
          created_by: string | null
          creator_id: string | null
          excerpt: string | null
          featured: boolean | null
          featured_image_id: string | null
          featured_image_url: string | null
          id: string
          like_count: number | null
          published_at: string | null
          read_time: string | null
          scheduled_at: string | null
          seo_description: string | null
          seo_keywords: string | null
          seo_title: string | null
          share_count: number | null
          slug: string
          status: string | null
          subcategory_id: string | null
          title: string
          updated_at: string | null
          updated_by: string | null
          view_count: number | null
        }
        Insert: {
          author_name?: string | null
          category_id?: string | null
          content?: string | null
          created_at?: string | null
          created_by?: string | null
          creator_id?: string | null
          excerpt?: string | null
          featured?: boolean | null
          featured_image_id?: string | null
          featured_image_url?: string | null
          id?: string
          like_count?: number | null
          published_at?: string | null
          read_time?: string | null
          scheduled_at?: string | null
          seo_description?: string | null
          seo_keywords?: string | null
          seo_title?: string | null
          share_count?: number | null
          slug: string
          status?: string | null
          subcategory_id?: string | null
          title: string
          updated_at?: string | null
          updated_by?: string | null
          view_count?: number | null
        }
        Update: {
          author_name?: string | null
          category_id?: string | null
          content?: string | null
          created_at?: string | null
          created_by?: string | null
          creator_id?: string | null
          excerpt?: string | null
          featured?: boolean | null
          featured_image_id?: string | null
          featured_image_url?: string | null
          id?: string
          like_count?: number | null
          published_at?: string | null
          read_time?: string | null
          scheduled_at?: string | null
          seo_description?: string | null
          seo_keywords?: string | null
          seo_title?: string | null
          share_count?: number | null
          slug?: string
          status?: string | null
          subcategory_id?: string | null
          title?: string
          updated_at?: string | null
          updated_by?: string | null
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "articles_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "articles_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "creators"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "articles_featured_image_id_fkey"
            columns: ["featured_image_id"]
            isOneToOne: false
            referencedRelation: "media"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "articles_subcategory_id_fkey"
            columns: ["subcategory_id"]
            isOneToOne: false
            referencedRelation: "subcategories"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          order_index: number | null
          slug: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          order_index?: number | null
          slug: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          order_index?: number | null
          slug?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      creators: {
        Row: {
          age: number | null
          articles_count: number | null
          bio: string | null
          created_at: string | null
          email: string | null
          experience: string | null
          followers_count: number | null
          id: string
          image_url: string | null
          name: string
          profession: string | null
          social_links: Json | null
          specialty: string | null
          status: string | null
          updated_at: string | null
          verified: boolean | null
        }
        Insert: {
          age?: number | null
          articles_count?: number | null
          bio?: string | null
          created_at?: string | null
          email?: string | null
          experience?: string | null
          followers_count?: number | null
          id?: string
          image_url?: string | null
          name: string
          profession?: string | null
          social_links?: Json | null
          specialty?: string | null
          status?: string | null
          updated_at?: string | null
          verified?: boolean | null
        }
        Update: {
          age?: number | null
          articles_count?: number | null
          bio?: string | null
          created_at?: string | null
          email?: string | null
          experience?: string | null
          followers_count?: number | null
          id?: string
          image_url?: string | null
          name?: string
          profession?: string | null
          social_links?: Json | null
          specialty?: string | null
          status?: string | null
          updated_at?: string | null
          verified?: boolean | null
        }
        Relationships: []
      }
      daily_news: {
        Row: {
          content: string
          created_at: string | null
          created_by: string | null
          excerpt: string | null
          featured: boolean | null
          id: string
          published_date: string
          status: string | null
          title: string
          updated_at: string | null
          view_count: number | null
        }
        Insert: {
          content: string
          created_at?: string | null
          created_by?: string | null
          excerpt?: string | null
          featured?: boolean | null
          id?: string
          published_date: string
          status?: string | null
          title: string
          updated_at?: string | null
          view_count?: number | null
        }
        Update: {
          content?: string
          created_at?: string | null
          created_by?: string | null
          excerpt?: string | null
          featured?: boolean | null
          id?: string
          published_date?: string
          status?: string | null
          title?: string
          updated_at?: string | null
          view_count?: number | null
        }
        Relationships: []
      }
      media: {
        Row: {
          alt_text: string | null
          caption: string | null
          created_at: string | null
          file_path: string
          file_size: number | null
          filename: string
          height: number | null
          id: string
          mime_type: string | null
          original_name: string
          uploaded_by: string | null
          width: number | null
        }
        Insert: {
          alt_text?: string | null
          caption?: string | null
          created_at?: string | null
          file_path: string
          file_size?: number | null
          filename: string
          height?: number | null
          id?: string
          mime_type?: string | null
          original_name: string
          uploaded_by?: string | null
          width?: number | null
        }
        Update: {
          alt_text?: string | null
          caption?: string | null
          created_at?: string | null
          file_path?: string
          file_size?: number | null
          filename?: string
          height?: number | null
          id?: string
          mime_type?: string | null
          original_name?: string
          uploaded_by?: string | null
          width?: number | null
        }
        Relationships: []
      }
      newsletter_subscribers: {
        Row: {
          email: string
          id: string
          name: string | null
          preferences: Json | null
          status: string | null
          subscribed_at: string | null
        }
        Insert: {
          email: string
          id?: string
          name?: string | null
          preferences?: Json | null
          status?: string | null
          subscribed_at?: string | null
        }
        Update: {
          email?: string
          id?: string
          name?: string | null
          preferences?: Json | null
          status?: string | null
          subscribed_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          display_name: string | null
          email: string
          id: string
          role: string | null
          updated_at: string | null
          username: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          display_name?: string | null
          email: string
          id: string
          role?: string | null
          updated_at?: string | null
          username: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          display_name?: string | null
          email?: string
          id?: string
          role?: string | null
          updated_at?: string | null
          username?: string
        }
        Relationships: []
      }
      subcategories: {
        Row: {
          category_id: string | null
          created_at: string | null
          id: string
          name: string
          order_index: number | null
          slug: string
          updated_at: string | null
        }
        Insert: {
          category_id?: string | null
          created_at?: string | null
          id?: string
          name: string
          order_index?: number | null
          slug: string
          updated_at?: string | null
        }
        Update: {
          category_id?: string | null
          created_at?: string | null
          id?: string
          name?: string
          order_index?: number | null
          slug?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subcategories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      tags: {
        Row: {
          color: string | null
          created_at: string | null
          id: string
          name: string
          slug: string
          usage_count: number | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          id?: string
          name: string
          slug: string
          usage_count?: number | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          id?: string
          name?: string
          slug?: string
          usage_count?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      update_article_views: {
        Args: { article_uuid: string }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
