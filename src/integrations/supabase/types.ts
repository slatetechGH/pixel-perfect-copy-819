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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      admin_meetings: {
        Row: {
          admin_id: string
          completed: boolean
          created_at: string
          date: string
          id: string
          meeting_type: string
          notes: string | null
          producer_id: string | null
          title: string
        }
        Insert: {
          admin_id: string
          completed?: boolean
          created_at?: string
          date: string
          id?: string
          meeting_type?: string
          notes?: string | null
          producer_id?: string | null
          title: string
        }
        Update: {
          admin_id?: string
          completed?: boolean
          created_at?: string
          date?: string
          id?: string
          meeting_type?: string
          notes?: string | null
          producer_id?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_meetings_producer_id_fkey"
            columns: ["producer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admin_meetings_producer_id_fkey"
            columns: ["producer_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      broadcast_recipients: {
        Row: {
          broadcast_id: string
          created_at: string
          email: string
          id: string
          sent_at: string | null
          status: string
        }
        Insert: {
          broadcast_id: string
          created_at?: string
          email: string
          id?: string
          sent_at?: string | null
          status?: string
        }
        Update: {
          broadcast_id?: string
          created_at?: string
          email?: string
          id?: string
          sent_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "broadcast_recipients_broadcast_id_fkey"
            columns: ["broadcast_id"]
            isOneToOne: false
            referencedRelation: "broadcasts"
            referencedColumns: ["id"]
          },
        ]
      }
      broadcasts: {
        Row: {
          body: string
          created_at: string
          id: string
          producer_id: string
          recipient_count: number
          sent_at: string | null
          status: string
          subject: string
          target_segments: Json
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          producer_id: string
          recipient_count?: number
          sent_at?: string | null
          status?: string
          subject: string
          target_segments?: Json
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          producer_id?: string
          recipient_count?: number
          sent_at?: string | null
          status?: string
          subject?: string
          target_segments?: Json
        }
        Relationships: [
          {
            foreignKeyName: "broadcasts_producer_id_fkey"
            columns: ["producer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "broadcasts_producer_id_fkey"
            columns: ["producer_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      collection_reminders: {
        Row: {
          created_at: string
          id: string
          producer_id: string
          recipient_count: number
          sent_date: string
        }
        Insert: {
          created_at?: string
          id?: string
          producer_id: string
          recipient_count?: number
          sent_date?: string
        }
        Update: {
          created_at?: string
          id?: string
          producer_id?: string
          recipient_count?: number
          sent_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "collection_reminders_producer_id_fkey"
            columns: ["producer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collection_reminders_producer_id_fkey"
            columns: ["producer_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      collections: {
        Row: {
          collected_at: string
          created_at: string
          id: string
          marked_by: string
          month_year: string
          notes: string | null
          plan_id: string
          producer_id: string
          subscriber_id: string
        }
        Insert: {
          collected_at?: string
          created_at?: string
          id?: string
          marked_by?: string
          month_year: string
          notes?: string | null
          plan_id: string
          producer_id: string
          subscriber_id: string
        }
        Update: {
          collected_at?: string
          created_at?: string
          id?: string
          marked_by?: string
          month_year?: string
          notes?: string | null
          plan_id?: string
          producer_id?: string
          subscriber_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "collections_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collections_producer_id_fkey"
            columns: ["producer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collections_producer_id_fkey"
            columns: ["producer_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collections_subscriber_id_fkey"
            columns: ["subscriber_id"]
            isOneToOne: false
            referencedRelation: "subscribers"
            referencedColumns: ["id"]
          },
        ]
      }
      contacts: {
        Row: {
          created_at: string
          email: string
          id: string
          invited_at: string | null
          name: string | null
          phone: string | null
          plan_id: string | null
          producer_id: string
          source: string
          status: string
          subscribed_at: string | null
          unsubscribed_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          invited_at?: string | null
          name?: string | null
          phone?: string | null
          plan_id?: string | null
          producer_id: string
          source?: string
          status?: string
          subscribed_at?: string | null
          unsubscribed_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          invited_at?: string | null
          name?: string | null
          phone?: string | null
          plan_id?: string | null
          producer_id?: string
          source?: string
          status?: string
          subscribed_at?: string | null
          unsubscribed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contacts_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contacts_producer_id_fkey"
            columns: ["producer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contacts_producer_id_fkey"
            columns: ["producer_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      content: {
        Row: {
          ai: boolean | null
          body: string | null
          cook_time: string | null
          created_at: string
          eligible_plans: string[] | null
          id: string
          ingredients: Json | null
          method_steps: string[] | null
          prep_time: string | null
          producer_id: string
          published_at: string | null
          serves: string | null
          status: string
          tier: string | null
          title: string
          type: string
          updated_at: string
          views: number | null
        }
        Insert: {
          ai?: boolean | null
          body?: string | null
          cook_time?: string | null
          created_at?: string
          eligible_plans?: string[] | null
          id?: string
          ingredients?: Json | null
          method_steps?: string[] | null
          prep_time?: string | null
          producer_id: string
          published_at?: string | null
          serves?: string | null
          status?: string
          tier?: string | null
          title: string
          type?: string
          updated_at?: string
          views?: number | null
        }
        Update: {
          ai?: boolean | null
          body?: string | null
          cook_time?: string | null
          created_at?: string
          eligible_plans?: string[] | null
          id?: string
          ingredients?: Json | null
          method_steps?: string[] | null
          prep_time?: string | null
          producer_id?: string
          published_at?: string | null
          serves?: string | null
          status?: string
          tier?: string | null
          title?: string
          type?: string
          updated_at?: string
          views?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "content_producer_id_fkey"
            columns: ["producer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_producer_id_fkey"
            columns: ["producer_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          avatar: string | null
          created_at: string
          id: string
          name: string
          plan: string
          producer_id: string
          unread: boolean | null
          updated_at: string
        }
        Insert: {
          avatar?: string | null
          created_at?: string
          id?: string
          name: string
          plan: string
          producer_id: string
          unread?: boolean | null
          updated_at?: string
        }
        Update: {
          avatar?: string | null
          created_at?: string
          id?: string
          name?: string
          plan?: string
          producer_id?: string
          unread?: boolean | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_producer_id_fkey"
            columns: ["producer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_producer_id_fkey"
            columns: ["producer_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_profiles: {
        Row: {
          id: string
          joined_at: string
          name: string
          phone: string | null
          plan_id: string | null
          producer_id: string
          status: string
          user_id: string
        }
        Insert: {
          id?: string
          joined_at?: string
          name?: string
          phone?: string | null
          plan_id?: string | null
          producer_id: string
          status?: string
          user_id: string
        }
        Update: {
          id?: string
          joined_at?: string
          name?: string
          phone?: string | null
          plan_id?: string | null
          producer_id?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_profiles_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_profiles_producer_id_fkey"
            columns: ["producer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_profiles_producer_id_fkey"
            columns: ["producer_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      demo_configs: {
        Row: {
          config: Json
          created_at: string
          id: string
          name: string | null
          producer_id: string
          updated_at: string
        }
        Insert: {
          config: Json
          created_at?: string
          id?: string
          name?: string | null
          producer_id: string
          updated_at?: string
        }
        Update: {
          config?: Json
          created_at?: string
          id?: string
          name?: string | null
          producer_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "demo_configs_producer_id_fkey"
            columns: ["producer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "demo_configs_producer_id_fkey"
            columns: ["producer_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      drops: {
        Row: {
          created_at: string
          description: string | null
          drop_date: string | null
          drop_time: string | null
          eligible_plans: string[] | null
          end_date: string | null
          end_time: string | null
          id: string
          items: Json | null
          notify: boolean | null
          price_num: number
          producer_id: string
          remaining: number
          status: string
          title: string
          total: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          drop_date?: string | null
          drop_time?: string | null
          eligible_plans?: string[] | null
          end_date?: string | null
          end_time?: string | null
          id?: string
          items?: Json | null
          notify?: boolean | null
          price_num?: number
          producer_id: string
          remaining?: number
          status?: string
          title: string
          total?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          drop_date?: string | null
          drop_time?: string | null
          eligible_plans?: string[] | null
          end_date?: string | null
          end_time?: string | null
          id?: string
          items?: Json | null
          notify?: boolean | null
          price_num?: number
          producer_id?: string
          remaining?: number
          status?: string
          title?: string
          total?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "drops_producer_id_fkey"
            columns: ["producer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "drops_producer_id_fkey"
            columns: ["producer_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          additional_notes: string | null
          business_name: string | null
          business_type: string | null
          created_at: string
          customer_count: string | null
          email: string
          hear_about: string | null
          id: string
          interested_plan: string | null
          interests: string[] | null
          message: string | null
          name: string | null
          newsletter: boolean | null
          notes: string | null
          phone: string | null
          status: string
          terms: boolean | null
          type: string
          website: string | null
        }
        Insert: {
          additional_notes?: string | null
          business_name?: string | null
          business_type?: string | null
          created_at?: string
          customer_count?: string | null
          email: string
          hear_about?: string | null
          id?: string
          interested_plan?: string | null
          interests?: string[] | null
          message?: string | null
          name?: string | null
          newsletter?: boolean | null
          notes?: string | null
          phone?: string | null
          status?: string
          terms?: boolean | null
          type: string
          website?: string | null
        }
        Update: {
          additional_notes?: string | null
          business_name?: string | null
          business_type?: string | null
          created_at?: string
          customer_count?: string | null
          email?: string
          hear_about?: string | null
          id?: string
          interested_plan?: string | null
          interests?: string[] | null
          message?: string | null
          name?: string | null
          newsletter?: boolean | null
          notes?: string | null
          phone?: string | null
          status?: string
          terms?: boolean | null
          type?: string
          website?: string | null
        }
        Relationships: []
      }
      messages: {
        Row: {
          conversation_id: string
          created_at: string
          id: string
          sender: string
          sent_at: string | null
          text: string
        }
        Insert: {
          conversation_id: string
          created_at?: string
          id?: string
          sender: string
          sent_at?: string | null
          text: string
        }
        Update: {
          conversation_id?: string
          created_at?: string
          id?: string
          sender?: string
          sent_at?: string | null
          text?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      plans: {
        Row: {
          active: boolean
          benefits: string[] | null
          collections_per_month: number
          created_at: string
          description: string | null
          id: string
          is_free: boolean
          name: string
          price_num: number
          producer_id: string
          show_on_public_page: boolean
          sort_order: number | null
          stripe_price_id: string | null
          subscriber_limit: number | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          benefits?: string[] | null
          collections_per_month?: number
          created_at?: string
          description?: string | null
          id?: string
          is_free?: boolean
          name: string
          price_num?: number
          producer_id: string
          show_on_public_page?: boolean
          sort_order?: number | null
          stripe_price_id?: string | null
          subscriber_limit?: number | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          benefits?: string[] | null
          collections_per_month?: number
          created_at?: string
          description?: string | null
          id?: string
          is_free?: boolean
          name?: string
          price_num?: number
          producer_id?: string
          show_on_public_page?: boolean
          sort_order?: number | null
          stripe_price_id?: string | null
          subscriber_limit?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "plans_producer_id_fkey"
            columns: ["producer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "plans_producer_id_fkey"
            columns: ["producer_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          accent_color: string | null
          address: string | null
          bio: string | null
          business_name: string | null
          business_type: string | null
          commission_percentage: number
          cover_url: string | null
          created_at: string
          description: string | null
          display_name: string | null
          email: string
          facebook: string | null
          id: string
          instagram: string | null
          logo_url: string | null
          notification_prefs: Json | null
          onboarding_completed: boolean
          onboarding_step: number
          phone: string | null
          plan: string
          producer_stripe_subscription_id: string | null
          public_visible: boolean | null
          stripe_connect_id: string | null
          stripe_connect_status: string
          stripe_customer_id: string | null
          subscription_tier: string
          tagline: string | null
          tier_updated_at: string | null
          twitter: string | null
          updated_at: string
          url_slug: string | null
          website: string | null
        }
        Insert: {
          accent_color?: string | null
          address?: string | null
          bio?: string | null
          business_name?: string | null
          business_type?: string | null
          commission_percentage?: number
          cover_url?: string | null
          created_at?: string
          description?: string | null
          display_name?: string | null
          email: string
          facebook?: string | null
          id: string
          instagram?: string | null
          logo_url?: string | null
          notification_prefs?: Json | null
          onboarding_completed?: boolean
          onboarding_step?: number
          phone?: string | null
          plan?: string
          producer_stripe_subscription_id?: string | null
          public_visible?: boolean | null
          stripe_connect_id?: string | null
          stripe_connect_status?: string
          stripe_customer_id?: string | null
          subscription_tier?: string
          tagline?: string | null
          tier_updated_at?: string | null
          twitter?: string | null
          updated_at?: string
          url_slug?: string | null
          website?: string | null
        }
        Update: {
          accent_color?: string | null
          address?: string | null
          bio?: string | null
          business_name?: string | null
          business_type?: string | null
          commission_percentage?: number
          cover_url?: string | null
          created_at?: string
          description?: string | null
          display_name?: string | null
          email?: string
          facebook?: string | null
          id?: string
          instagram?: string | null
          logo_url?: string | null
          notification_prefs?: Json | null
          onboarding_completed?: boolean
          onboarding_step?: number
          phone?: string | null
          plan?: string
          producer_stripe_subscription_id?: string | null
          public_visible?: boolean | null
          stripe_connect_id?: string | null
          stripe_connect_status?: string
          stripe_customer_id?: string | null
          subscription_tier?: string
          tagline?: string | null
          tier_updated_at?: string | null
          twitter?: string | null
          updated_at?: string
          url_slug?: string | null
          website?: string | null
        }
        Relationships: []
      }
      subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
          joined_at: string | null
          name: string
          phone: string | null
          plan: string
          producer_id: string
          revenue: string | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          joined_at?: string | null
          name: string
          phone?: string | null
          plan: string
          producer_id: string
          revenue?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          joined_at?: string | null
          name?: string
          phone?: string | null
          plan?: string
          producer_id?: string
          revenue?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscribers_producer_id_fkey"
            columns: ["producer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscribers_producer_id_fkey"
            columns: ["producer_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          amount_paid: number
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          customer_email: string
          id: string
          plan_id: string | null
          producer_id: string
          producer_net: number
          slate_commission_earned: number
          status: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          updated_at: string
        }
        Insert: {
          amount_paid?: number
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          customer_email: string
          id?: string
          plan_id?: string | null
          producer_id: string
          producer_net?: number
          slate_commission_earned?: number
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
        }
        Update: {
          amount_paid?: number
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          customer_email?: string
          id?: string
          plan_id?: string | null
          producer_id?: string
          producer_net?: number
          slate_commission_earned?: number
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_producer_id_fkey"
            columns: ["producer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_producer_id_fkey"
            columns: ["producer_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount: number
          created_at: string
          id: string
          producer_id: string
          stripe_event_id: string | null
          subscription_id: string | null
          transaction_type: string
        }
        Insert: {
          amount?: number
          created_at?: string
          id?: string
          producer_id: string
          stripe_event_id?: string | null
          subscription_id?: string | null
          transaction_type: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          producer_id?: string
          stripe_event_id?: string | null
          subscription_id?: string | null
          transaction_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_producer_id_fkey"
            columns: ["producer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_producer_id_fkey"
            columns: ["producer_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      public_profiles: {
        Row: {
          accent_color: string | null
          business_name: string | null
          cover_url: string | null
          description: string | null
          facebook: string | null
          id: string | null
          instagram: string | null
          logo_url: string | null
          public_visible: boolean | null
          tagline: string | null
          twitter: string | null
          url_slug: string | null
          website: string | null
        }
        Insert: {
          accent_color?: string | null
          business_name?: string | null
          cover_url?: string | null
          description?: string | null
          facebook?: string | null
          id?: string | null
          instagram?: string | null
          logo_url?: string | null
          public_visible?: boolean | null
          tagline?: string | null
          twitter?: string | null
          url_slug?: string | null
          website?: string | null
        }
        Update: {
          accent_color?: string | null
          business_name?: string | null
          cover_url?: string | null
          description?: string | null
          facebook?: string | null
          id?: string | null
          instagram?: string | null
          logo_url?: string | null
          public_visible?: boolean | null
          tagline?: string | null
          twitter?: string | null
          url_slug?: string | null
          website?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      assign_customer_role: { Args: never; Returns: undefined }
      get_all_producers: {
        Args: never
        Returns: {
          business_name: string
          created_at: string
          email: string
          id: string
        }[]
      }
      get_user_role: { Args: { _user_id: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "producer" | "customer"
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
    Enums: {
      app_role: ["admin", "producer", "customer"],
    },
  },
} as const
