export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string
          role: 'funcionario' | 'gestor'
          created_at: string
        }
        Insert: {
          id: string
          full_name: string
          role: 'funcionario' | 'gestor'
          created_at?: string
        }
        Update: {
          id?: string
          full_name?: string
          role?: 'funcionario' | 'gestor'
          created_at?: string
        }
      }
      clock_events: {
        Row: {
          id: string
          user_id: string
          event_type: 'entrada' | 'saida_almoco' | 'volta_almoco' | 'saida_final' | 'hora_extra_inicio' | 'hora_extra_fim'
          occurred_at: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          event_type: 'entrada' | 'saida_almoco' | 'volta_almoco' | 'saida_final' | 'hora_extra_inicio' | 'hora_extra_fim'
          occurred_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          event_type?: 'entrada' | 'saida_almoco' | 'volta_almoco' | 'saida_final' | 'hora_extra_inicio' | 'hora_extra_fim'
          occurred_at?: string
          created_at?: string
        }
      }
      absence_justifications: {
        Row: {
          id: string
          user_id: string
          date: string
          reason: string
          created_by: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          date: string
          reason: string
          created_by: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          date?: string
          reason?: string
          created_by?: string
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      handle_new_user: {
        Args: {
          new: Record<string, unknown>
        }
        Returns: unknown
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
