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
      campaigns: {
        Row: {
          id: string
          name: string
          description: string
          po_number: string
          start_date: string
          end_date: string | null
          budget: number
          status: 'active' | 'completed' | 'planned'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          po_number: string
          start_date: string
          end_date?: string | null
          budget: number
          status: 'active' | 'completed' | 'planned'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          po_number?: string
          start_date?: string
          end_date?: string | null
          budget?: number
          status?: 'active' | 'completed' | 'planned'
          created_at?: string
          updated_at?: string
        }
      }
      customers: {
        Row: {
          id: string
          name: string
          email: string
          phone: string
          company: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          phone: string
          company: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          phone?: string
          company?: string
          created_at?: string
          updated_at?: string
        }
      }
      vendors: {
        Row: {
          id: string
          name: string
          email: string
          phone: string
          service_type: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          phone: string
          service_type: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          phone?: string
          service_type?: string
          created_at?: string
          updated_at?: string
        }
      }
      customer_invoices: {
        Row: {
          id: string
          campaign_id: string
          customer_id: string
          invoice_number: string
          amount: number
          status: 'paid' | 'pending' | 'overdue'
          issue_date: string
          due_date: string
          paid_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          campaign_id: string
          customer_id: string
          invoice_number: string
          amount: number
          status: 'paid' | 'pending' | 'overdue'
          issue_date: string
          due_date: string
          paid_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          campaign_id?: string
          customer_id?: string
          invoice_number?: string
          amount?: number
          status?: 'paid' | 'pending' | 'overdue'
          issue_date?: string
          due_date?: string
          paid_date?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      vendor_invoices: {
        Row: {
          id: string
          campaign_id: string | null
          vendor_id: string
          invoice_number: string
          amount: number
          status: 'paid' | 'pending' | 'overdue'
          issue_date: string
          due_date: string
          paid_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          campaign_id?: string | null
          vendor_id: string
          invoice_number: string
          amount: number
          status: 'paid' | 'pending' | 'overdue'
          issue_date: string
          due_date: string
          paid_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          campaign_id?: string | null
          vendor_id?: string
          invoice_number?: string
          amount?: number
          status?: 'paid' | 'pending' | 'overdue'
          issue_date?: string
          due_date?: string
          paid_date?: string | null
          created_at?: string
          updated_at?: string
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
