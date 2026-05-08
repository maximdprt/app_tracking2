export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      daily_summaries: {
        Row: {
          created_at: string;
          food_summary: string | null;
          global_summary: string | null;
          id: string;
          sport_summary: string | null;
          summary_date: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          food_summary?: string | null;
          global_summary?: string | null;
          id?: string;
          sport_summary?: string | null;
          summary_date: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          food_summary?: string | null;
          global_summary?: string | null;
          id?: string;
          sport_summary?: string | null;
          summary_date?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      exercise_sets: {
        Row: {
          created_at: string;
          id: string;
          is_completed: boolean;
          performed_exercise_id: string;
          reps: number | null;
          rpe: number | null;
          set_number: number;
          updated_at: string;
          user_id: string;
          weight: number | null;
        };
        Insert: {
          created_at?: string;
          id?: string;
          is_completed?: boolean;
          performed_exercise_id: string;
          reps?: number | null;
          rpe?: number | null;
          set_number: number;
          updated_at?: string;
          user_id: string;
          weight?: number | null;
        };
        Update: {
          created_at?: string;
          id?: string;
          is_completed?: boolean;
          performed_exercise_id?: string;
          reps?: number | null;
          rpe?: number | null;
          set_number?: number;
          updated_at?: string;
          user_id?: string;
          weight?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "exercise_sets_performed_exercise_id_fkey";
            columns: ["performed_exercise_id"];
            isOneToOne: false;
            referencedRelation: "performed_exercises";
            referencedColumns: ["id"];
          },
        ];
      };
      food_items: {
        Row: {
          aliases: string[];
          calories_100g: number;
          calories_per_100g: number | null;
          carbs_per_100g: number | null;
          category: string | null;
          created_at: string;
          fats_per_100g: number | null;
          fiber_per_100g: number | null;
          fibres_100g: number;
          glucides_100g: number;
          id: string;
          lipides_100g: number;
          name: string | null;
          nom: string;
          protein_per_100g: number | null;
          proteines_100g: number;
          salt_per_100g: number | null;
          sel_100g: number;
          source: string;
          sucres_100g: number;
          sugar_per_100g: number | null;
          updated_at: string;
        };
        Insert: {
          aliases?: string[];
          calories_100g?: number;
          calories_per_100g?: number | null;
          carbs_per_100g?: number | null;
          category?: string | null;
          created_at?: string;
          fats_per_100g?: number | null;
          fiber_per_100g?: number | null;
          fibres_100g?: number;
          glucides_100g?: number;
          id?: string;
          lipides_100g?: number;
          name?: string | null;
          nom?: string;
          protein_per_100g?: number | null;
          proteines_100g?: number;
          salt_per_100g?: number | null;
          sel_100g?: number;
          source?: string;
          sucres_100g?: number;
          sugar_per_100g?: number | null;
          updated_at?: string;
        };
        Update: {
          aliases?: string[];
          calories_100g?: number;
          calories_per_100g?: number | null;
          carbs_per_100g?: number | null;
          category?: string | null;
          created_at?: string;
          fats_per_100g?: number | null;
          fiber_per_100g?: number | null;
          fibres_100g?: number;
          glucides_100g?: number;
          id?: string;
          lipides_100g?: number;
          name?: string | null;
          nom?: string;
          protein_per_100g?: number | null;
          proteines_100g?: number;
          salt_per_100g?: number | null;
          sel_100g?: number;
          source?: string;
          sucres_100g?: number;
          sugar_per_100g?: number | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      habit_logs: {
        Row: {
          created_at: string;
          habit_id: string;
          id: string;
          log_date: string;
          notes: string | null;
          status: string | null;
          updated_at: string;
          user_id: string;
          value: number | null;
        };
        Insert: {
          created_at?: string;
          habit_id: string;
          id?: string;
          log_date: string;
          notes?: string | null;
          status?: string | null;
          updated_at?: string;
          user_id: string;
          value?: number | null;
        };
        Update: {
          created_at?: string;
          habit_id?: string;
          id?: string;
          log_date?: string;
          notes?: string | null;
          status?: string | null;
          updated_at?: string;
          user_id?: string;
          value?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "habit_logs_habit_id_fkey";
            columns: ["habit_id"];
            isOneToOne: false;
            referencedRelation: "habits";
            referencedColumns: ["id"];
          },
        ];
      };
      habits: {
        Row: {
          category: string | null;
          created_at: string;
          habit_name: string;
          id: string;
          target_frequency: number | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          category?: string | null;
          created_at?: string;
          habit_name: string;
          id?: string;
          target_frequency?: number | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          category?: string | null;
          created_at?: string;
          habit_name?: string;
          id?: string;
          target_frequency?: number | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      meal_ingredients: {
        Row: {
          calories: number;
          carbs: number;
          created_at: string;
          custom_food_name: string | null;
          fats: number;
          food_item_id: string | null;
          grams: number;
          id: string;
          meal_id: string;
          protein: number;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          calories: number;
          carbs: number;
          created_at?: string;
          custom_food_name?: string | null;
          fats: number;
          food_item_id?: string | null;
          grams: number;
          id?: string;
          meal_id: string;
          protein: number;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          calories?: number;
          carbs?: number;
          created_at?: string;
          custom_food_name?: string | null;
          fats?: number;
          food_item_id?: string | null;
          grams?: number;
          id?: string;
          meal_id?: string;
          protein?: number;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "meal_ingredients_food_item_id_fkey";
            columns: ["food_item_id"];
            isOneToOne: false;
            referencedRelation: "food_items";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "meal_ingredients_meal_id_fkey";
            columns: ["meal_id"];
            isOneToOne: false;
            referencedRelation: "meals";
            referencedColumns: ["id"];
          },
        ];
      };
      meal_photo_analyses: {
        Row: {
          created_at: string;
          detected_ingredients: Json;
          error_message: string | null;
          id: string;
          photo_path: string;
          photo_url: string | null;
          raw_ai_response: Json | null;
          status: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          detected_ingredients?: Json;
          error_message?: string | null;
          id?: string;
          photo_path: string;
          photo_url?: string | null;
          raw_ai_response?: Json | null;
          status?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          detected_ingredients?: Json;
          error_message?: string | null;
          id?: string;
          photo_path?: string;
          photo_url?: string | null;
          raw_ai_response?: Json | null;
          status?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      meals: {
        Row: {
          created_at: string;
          id: string;
          meal_date: string;
          meal_type: string;
          notes: string | null;
          photo_url: string | null;
          total_calories: number;
          total_carbs: number;
          total_fats: number;
          total_protein: number;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          meal_date: string;
          meal_type: string;
          notes?: string | null;
          photo_url?: string | null;
          total_calories?: number;
          total_carbs?: number;
          total_fats?: number;
          total_protein?: number;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          meal_date?: string;
          meal_type?: string;
          notes?: string | null;
          photo_url?: string | null;
          total_calories?: number;
          total_carbs?: number;
          total_fats?: number;
          total_protein?: number;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      performed_exercises: {
        Row: {
          created_at: string;
          exercise_name: string;
          id: string;
          notes: string | null;
          order_index: number;
          session_id: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          exercise_name: string;
          id?: string;
          notes?: string | null;
          order_index?: number;
          session_id: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          exercise_name?: string;
          id?: string;
          notes?: string | null;
          order_index?: number;
          session_id?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "performed_exercises_session_id_fkey";
            columns: ["session_id"];
            isOneToOne: false;
            referencedRelation: "workout_sessions";
            referencedColumns: ["id"];
          },
        ];
      };
      planned_exercises: {
        Row: {
          created_at: string;
          exercise_name: string;
          id: string;
          notes: string | null;
          order_index: number;
          rest_time_seconds: number | null;
          target_reps: number | null;
          target_sets: number | null;
          target_weight: number | null;
          updated_at: string;
          user_id: string;
          workout_day_id: string;
        };
        Insert: {
          created_at?: string;
          exercise_name: string;
          id?: string;
          notes?: string | null;
          order_index?: number;
          rest_time_seconds?: number | null;
          target_reps?: number | null;
          target_sets?: number | null;
          target_weight?: number | null;
          updated_at?: string;
          user_id: string;
          workout_day_id: string;
        };
        Update: {
          created_at?: string;
          exercise_name?: string;
          id?: string;
          notes?: string | null;
          order_index?: number;
          rest_time_seconds?: number | null;
          target_reps?: number | null;
          target_sets?: number | null;
          target_weight?: number | null;
          updated_at?: string;
          user_id?: string;
          workout_day_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "planned_exercises_workout_day_id_fkey";
            columns: ["workout_day_id"];
            isOneToOne: false;
            referencedRelation: "workout_days";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          age: number | null;
          calories_objectif: number | null;
          created_at: string;
          glucides_objectif: number | null;
          id: string;
          lipides_objectif: number | null;
          objectif: string | null;
          poids_kg: number | null;
          proteines_objectif: number | null;
          sexe: string | null;
          taille_cm: number | null;
          updated_at: string;
        };
        Insert: {
          age?: number | null;
          calories_objectif?: number | null;
          created_at?: string;
          glucides_objectif?: number | null;
          id: string;
          lipides_objectif?: number | null;
          objectif?: string | null;
          poids_kg?: number | null;
          proteines_objectif?: number | null;
          sexe?: string | null;
          taille_cm?: number | null;
          updated_at?: string;
        };
        Update: {
          age?: number | null;
          calories_objectif?: number | null;
          created_at?: string;
          glucides_objectif?: number | null;
          id?: string;
          lipides_objectif?: number | null;
          objectif?: string | null;
          poids_kg?: number | null;
          proteines_objectif?: number | null;
          sexe?: string | null;
          taille_cm?: number | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      users_profiles: {
        Row: {
          age: number | null;
          average_sleep_hours: number | null;
          average_steps: number | null;
          created_at: string;
          current_daily_calories: number | null;
          experience_level: string | null;
          goal_duration_weeks: number | null;
          goal_type: string | null;
          height: number | null;
          id: string;
          sex: string | null;
          target_carbs: number | null;
          target_daily_calories: number | null;
          target_fats: number | null;
          target_protein: number | null;
          training_frequency: number | null;
          updated_at: string;
          user_id: string;
          weight: number | null;
        };
        Insert: {
          age?: number | null;
          average_sleep_hours?: number | null;
          average_steps?: number | null;
          created_at?: string;
          current_daily_calories?: number | null;
          experience_level?: string | null;
          goal_duration_weeks?: number | null;
          goal_type?: string | null;
          height?: number | null;
          id?: string;
          sex?: string | null;
          target_carbs?: number | null;
          target_daily_calories?: number | null;
          target_fats?: number | null;
          target_protein?: number | null;
          training_frequency?: number | null;
          updated_at?: string;
          user_id: string;
          weight?: number | null;
        };
        Update: {
          age?: number | null;
          average_sleep_hours?: number | null;
          average_steps?: number | null;
          created_at?: string;
          current_daily_calories?: number | null;
          experience_level?: string | null;
          goal_duration_weeks?: number | null;
          goal_type?: string | null;
          height?: number | null;
          id?: string;
          sex?: string | null;
          target_carbs?: number | null;
          target_daily_calories?: number | null;
          target_fats?: number | null;
          target_protein?: number | null;
          training_frequency?: number | null;
          updated_at?: string;
          user_id?: string;
          weight?: number | null;
        };
        Relationships: [];
      };
      workout_days: {
        Row: {
          created_at: string;
          day_of_week: number;
          id: string;
          is_rest_day: boolean;
          notes: string | null;
          program_id: string;
          updated_at: string;
          user_id: string;
          workout_name: string | null;
        };
        Insert: {
          created_at?: string;
          day_of_week: number;
          id?: string;
          is_rest_day?: boolean;
          notes?: string | null;
          program_id: string;
          updated_at?: string;
          user_id: string;
          workout_name?: string | null;
        };
        Update: {
          created_at?: string;
          day_of_week?: number;
          id?: string;
          is_rest_day?: boolean;
          notes?: string | null;
          program_id?: string;
          updated_at?: string;
          user_id?: string;
          workout_name?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "workout_days_program_id_fkey";
            columns: ["program_id"];
            isOneToOne: false;
            referencedRelation: "workout_programs";
            referencedColumns: ["id"];
          },
        ];
      };
      workout_programs: {
        Row: {
          created_at: string;
          description: string | null;
          end_date: string | null;
          id: string;
          is_active: boolean;
          name: string;
          start_date: string | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          end_date?: string | null;
          id?: string;
          is_active?: boolean;
          name: string;
          start_date?: string | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          end_date?: string | null;
          id?: string;
          is_active?: boolean;
          name?: string;
          start_date?: string | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      workout_sessions: {
        Row: {
          created_at: string;
          duration_minutes: number | null;
          id: string;
          notes: string | null;
          session_date: string;
          status: string;
          updated_at: string;
          user_id: string;
          workout_day_id: string | null;
          workout_name: string | null;
        };
        Insert: {
          created_at?: string;
          duration_minutes?: number | null;
          id?: string;
          notes?: string | null;
          session_date: string;
          status?: string;
          updated_at?: string;
          user_id: string;
          workout_day_id?: string | null;
          workout_name?: string | null;
        };
        Update: {
          created_at?: string;
          duration_minutes?: number | null;
          id?: string;
          notes?: string | null;
          session_date?: string;
          status?: string;
          updated_at?: string;
          user_id?: string;
          workout_day_id?: string | null;
          workout_name?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "workout_sessions_workout_day_id_fkey";
            columns: ["workout_day_id"];
            isOneToOne: false;
            referencedRelation: "workout_days";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;
