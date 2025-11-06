export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          phone: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          phone?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          phone?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      properties: {
        Row: {
          id: string;
          owner_id: string;
          name: string;
          description: string | null;
          location: string;
          address: string | null;
          image_url: string | null;
          status: 'active' | 'maintenance' | 'inactive';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          name: string;
          description?: string | null;
          location: string;
          address?: string | null;
          image_url?: string | null;
          status?: 'active' | 'maintenance' | 'inactive';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          owner_id?: string;
          name?: string;
          description?: string | null;
          location?: string;
          address?: string | null;
          image_url?: string | null;
          status?: 'active' | 'maintenance' | 'inactive';
          created_at?: string;
          updated_at?: string;
        };
      };
      platform_integrations: {
        Row: {
          id: string;
          property_id: string;
          platform_name: 'airbnb' | 'booking' | 'vrbo' | 'other';
          platform_url: string | null;
          ical_url: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          property_id: string;
          platform_name: 'airbnb' | 'booking' | 'vrbo' | 'other';
          platform_url?: string | null;
          ical_url?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          property_id?: string;
          platform_name?: 'airbnb' | 'booking' | 'vrbo' | 'other';
          platform_url?: string | null;
          ical_url?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      reservations: {
        Row: {
          id: string;
          property_id: string;
          platform_integration_id: string | null;
          guest_name: string | null;
          guest_email: string | null;
          guest_phone: string | null;
          check_in: string;
          check_out: string;
          nights: number;
          total_amount: number | null;
          status: 'confirmed' | 'cancelled' | 'completed';
          source: string | null;
          external_id: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          property_id: string;
          platform_integration_id?: string | null;
          guest_name?: string | null;
          guest_email?: string | null;
          guest_phone?: string | null;
          check_in: string;
          check_out: string;
          nights: number;
          total_amount?: number | null;
          status?: 'confirmed' | 'cancelled' | 'completed';
          source?: string | null;
          external_id?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          property_id?: string;
          platform_integration_id?: string | null;
          guest_name?: string | null;
          guest_email?: string | null;
          guest_phone?: string | null;
          check_in?: string;
          check_out?: string;
          nights?: number;
          total_amount?: number | null;
          status?: 'confirmed' | 'cancelled' | 'completed';
          source?: string | null;
          external_id?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      income_records: {
        Row: {
          id: string;
          property_id: string;
          reservation_id: string | null;
          amount: number;
          date: string;
          description: string | null;
          type: 'rental' | 'cleaning_fee' | 'extra' | 'other';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          property_id: string;
          reservation_id?: string | null;
          amount: number;
          date: string;
          description?: string | null;
          type?: 'rental' | 'cleaning_fee' | 'extra' | 'other';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          property_id?: string;
          reservation_id?: string | null;
          amount?: number;
          date?: string;
          description?: string | null;
          type?: 'rental' | 'cleaning_fee' | 'extra' | 'other';
          created_at?: string;
          updated_at?: string;
        };
      };
      reviews: {
        Row: {
          id: string;
          property_id: string;
          reservation_id: string | null;
          guest_name: string;
          rating: number;
          comment: string | null;
          platform: string | null;
          review_date: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          property_id: string;
          reservation_id?: string | null;
          guest_name: string;
          rating: number;
          comment?: string | null;
          platform?: string | null;
          review_date: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          property_id?: string;
          reservation_id?: string | null;
          guest_name?: string;
          rating?: number;
          comment?: string | null;
          platform?: string | null;
          review_date?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      cleaners: {
        Row: {
          id: string;
          name: string;
          phone: string;
          type: 'individual' | 'company';
          active: boolean;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          phone: string;
          type: 'individual' | 'company';
          active?: boolean;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          phone?: string;
          type?: 'individual' | 'company';
          active?: boolean;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      cleaning_tasks: {
        Row: {
          id: string;
          reservation_id: string | null;
          property_id: string;
          cleaner_id: string | null;
          cleaning_date: string;
          cleaning_time_start: string;
          cleaning_time_end: string;
          status: 'pending' | 'assigned' | 'completed' | 'cancelled';
          priority: 'normal' | 'urgent';
          notes: string | null;
          whatsapp_sent: boolean;
          whatsapp_sent_at: string | null;
          completed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          reservation_id?: string | null;
          property_id: string;
          cleaner_id?: string | null;
          cleaning_date: string;
          cleaning_time_start?: string;
          cleaning_time_end?: string;
          status?: 'pending' | 'assigned' | 'completed' | 'cancelled';
          priority?: 'normal' | 'urgent';
          notes?: string | null;
          whatsapp_sent?: boolean;
          whatsapp_sent_at?: string | null;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          reservation_id?: string | null;
          property_id?: string;
          cleaner_id?: string | null;
          cleaning_date?: string;
          cleaning_time_start?: string;
          cleaning_time_end?: string;
          status?: 'pending' | 'assigned' | 'completed' | 'cancelled';
          priority?: 'normal' | 'urgent';
          notes?: string | null;
          whatsapp_sent?: boolean;
          whatsapp_sent_at?: string | null;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}
