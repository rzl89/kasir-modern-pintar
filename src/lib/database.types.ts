
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
      categories: {
        Row: {
          id: string
          name: string
          description: string | null
          parent_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          parent_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          parent_id?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            referencedRelation: "categories"
            referencedColumns: ["id"]
          }
        ]
      }
      products: {
        Row: {
          id: string
          name: string
          description: string | null
          price: number
          cost_price: number | null
          barcode: string | null
          sku: string | null
          image_url: string | null
          category_id: string | null
          stock_quantity: number
          min_stock_threshold: number | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          price: number
          cost_price?: number | null
          barcode?: string | null
          sku?: string | null
          image_url?: string | null
          category_id?: string | null
          stock_quantity: number
          min_stock_threshold?: number | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          price?: number
          cost_price?: number | null
          barcode?: string | null
          sku?: string | null
          image_url?: string | null
          category_id?: string | null
          stock_quantity?: number
          min_stock_threshold?: number | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            referencedRelation: "categories"
            referencedColumns: ["id"]
          }
        ]
      }
      stock_adjustments: {
        Row: {
          id: string
          product_id: string
          previous_quantity: number
          adjusted_quantity: number
          new_quantity: number
          adjustment_type: string
          reason: string | null
          adjusted_by: string
          created_at: string
        }
        Insert: {
          id?: string
          product_id: string
          previous_quantity: number
          adjusted_quantity: number
          new_quantity: number
          adjustment_type: string
          reason?: string | null
          adjusted_by: string
          created_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          previous_quantity?: number
          adjusted_quantity?: number
          new_quantity?: number
          adjustment_type?: string
          reason?: string | null
          adjusted_by?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "stock_adjustments_adjusted_by_fkey"
            columns: ["adjusted_by"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_adjustments_product_id_fkey"
            columns: ["product_id"]
            referencedRelation: "products"
            referencedColumns: ["id"]
          }
        ]
      }
      transaction_items: {
        Row: {
          id: string
          transaction_id: string
          product_id: string
          product_name: string
          quantity: number
          unit_price: number
          discount_amount: number | null
          subtotal: number
          created_at: string
        }
        Insert: {
          id?: string
          transaction_id: string
          product_id: string
          product_name: string
          quantity: number
          unit_price: number
          discount_amount?: number | null
          subtotal: number
          created_at?: string
        }
        Update: {
          id?: string
          transaction_id?: string
          product_id?: string
          product_name?: string
          quantity?: number
          unit_price?: number
          discount_amount?: number | null
          subtotal?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "transaction_items_product_id_fkey"
            columns: ["product_id"]
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transaction_items_transaction_id_fkey"
            columns: ["transaction_id"]
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          }
        ]
      }
      transactions: {
        Row: {
          id: string
          cashier_id: string
          customer_name: string | null
          subtotal: number
          discount_amount: number | null
          tax_amount: number | null
          total_amount: number
          payment_method: string
          payment_status: string
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          cashier_id: string
          customer_name?: string | null
          subtotal: number
          discount_amount?: number | null
          tax_amount?: number | null
          total_amount: number
          payment_method: string
          payment_status: string
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          cashier_id?: string
          customer_name?: string | null
          subtotal?: number
          discount_amount?: number | null
          tax_amount?: number | null
          total_amount?: number
          payment_method?: string
          payment_status?: string
          notes?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_cashier_id_fkey"
            columns: ["cashier_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      settings: {
        Row: {
          id: string
          business_name: string
          business_address: string | null
          business_phone: string | null
          business_email: string | null
          tax_rate: number
          receipt_footer: string | null
          currency: string
          updated_at: string
        }
        Insert: {
          id?: string
          business_name: string
          business_address?: string | null
          business_phone?: string | null
          business_email?: string | null
          tax_rate: number
          receipt_footer?: string | null
          currency: string
          updated_at?: string
        }
        Update: {
          id?: string
          business_name?: string
          business_address?: string | null
          business_phone?: string | null
          business_email?: string | null
          tax_rate?: number
          receipt_footer?: string | null
          currency?: string
          updated_at?: string
        }
        Relationships: []
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
