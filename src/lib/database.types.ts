
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
          description: string
          parent_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string
          parent_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          parent_id?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
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
          is_active: boolean
          created_at: string
          updated_at: string | null
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
          stock_quantity?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string | null
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
          is_active?: boolean
          created_at?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          }
        ]
      }
      stock_adjustments: {
        Row: {
          id: string
          product_id: string
          adjustment_type: string
          quantity: number
          reason: string
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          product_id: string
          adjustment_type: string
          quantity: number
          reason: string
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          adjustment_type?: string
          quantity?: number
          reason?: string
          notes?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "stock_adjustments_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
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
          subtotal?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "transaction_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transaction_items_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          }
        ]
      }
      transactions: {
        Row: {
          id: string
          customer_name: string | null
          subtotal: number
          discount_amount: number
          tax_amount: number
          total_amount: number
          payment_method: string
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          customer_name?: string | null
          subtotal: number
          discount_amount?: number
          tax_amount?: number
          total_amount: number
          payment_method: string
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          customer_name?: string | null
          subtotal?: number
          discount_amount?: number
          tax_amount?: number
          total_amount?: number
          payment_method?: string
          notes?: string | null
          created_at?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          id: string
          email: string
          full_name: string
          role: string
          created_at: string
          last_sign_in_at: string | null
        }
        Insert: {
          id: string
          email: string
          full_name: string
          role: string
          created_at?: string
          last_sign_in_at?: string | null
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          role?: string
          created_at?: string
          last_sign_in_at?: string | null
        }
        Relationships: []
      }
      settings: {
        Row: {
          id: string
          store_name: string | null
          store_address: string | null
          store_phone: string | null
          enable_tax: boolean
          tax_percentage: number
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id: string
          store_name?: string | null
          store_address?: string | null
          store_phone?: string | null
          enable_tax?: boolean
          tax_percentage?: number
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          store_name?: string | null
          store_address?: string | null
          store_phone?: string | null
          enable_tax?: boolean
          tax_percentage?: number
          created_at?: string
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {}
    Functions: {}
    Enums: {}
    CompositeTypes: {}
  }
}
