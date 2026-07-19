import { createClient, SupabaseClient, RealtimeChannel } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

// Single Supabase client instance shared across the app
let supabase: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }
  if (!supabase) {
    supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
  }
  return supabase;
}

export interface RealtimePayload {
  new: {
    sensor_id?: string;
    timestamp?: string;
    crowd_count?: number;
    status_level?: string;
    id?: string;
    title?: string;
    description?: string;
    priority?: string;
    status?: string;
    incident_type?: string;
    location_lat?: number;
    location_lng?: number;
    created_at?: string;
  };
}

class SupabaseService {
  private channels: Map<string, RealtimeChannel> = new Map();

  /**
   * Listen to real-time database row events on a specific table channel.
   * Falls back to simulating periodic events if Supabase is not configured.
   */
  subscribeToChannel(
    channelName: string,
    event: string,
    callback: (payload: RealtimePayload) => void
  ): () => void {
    const client = getSupabaseClient();

    if (!client) {
      // Simulate realtime telemetry events for dev mode
      const timer = setInterval(() => {
        if (channelName === "crowd-updates") {
          callback({
            new: {
              sensor_id: "turnstile-gate-3",
              timestamp: new Date().toISOString(),
              crowd_count: Math.floor(Math.random() * 80) + 20,
              status_level: Math.random() > 0.8 ? "Crowded" : "Normal",
            },
          });
        } else if (channelName === "incident-alerts" && Math.random() > 0.75) {
          callback({
            new: {
              id: Math.random().toString(36).substring(7),
              title: "Crowd congestion detected",
              description: "Turnstile load balancing recommended at Gate 3",
              priority: "High",
              status: "Reported",
              incident_type: "Security",
              location_lat: 40.8135,
              location_lng: -74.0744,
              created_at: new Date().toISOString(),
            },
          });
        }
      }, 7000);

      return () => clearInterval(timer);
    }

    // Real Supabase realtime subscription
    type PostgresPayload = { new: RealtimePayload["new"] };
    const channel = client
      .channel(channelName)
      .on<RealtimePayload["new"]>(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        "postgres_changes" as any,
        { event: event === "INSERT" ? "INSERT" : "*", schema: "public" },
        (payload: PostgresPayload) => {
          callback({ new: payload.new });
        }
      )
      .subscribe();

    this.channels.set(channelName, channel);

    return () => {
      client.removeChannel(channel);
      this.channels.delete(channelName);
    };
  }

  /**
   * Store user profile details in Supabase public.profiles table.
   */
  async upsertUserProfile(profile: {
    id: string;
    email: string;
    full_name: string;
    role: string;
    avatar_url?: string;
  }): Promise<void> {
    const client = getSupabaseClient();
    if (!client) return;

    const { error } = await client.from("profiles").upsert(profile, {
      onConflict: "id",
    });

    if (error) {
      console.error("[Supabase] Failed to upsert user profile:", error.message);
    }
  }
}

export const supabaseClient = new SupabaseService();
