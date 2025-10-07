import { useState, useEffect } from "react";
import { createClient, User } from "@supabase/supabase-js";

interface Profile {
  id: string;
  username: string;
  display_name: string;
  email: string;
  avatar_url: string;
  bio: string;
  watchlist: any;
  liked: any;
  watched: any;
  data: any;
}

const supabase = createClient(
  import.meta.env.PUBLIC_SUPABASE_URL as string,
  import.meta.env.PUBLIC_SUPABASE_KEY as string
);

export function useUserProfile() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      setLoading(true);
      const { data: authData } = await supabase.auth.getUser();
      setUser(authData.user ?? null);

      if (authData.user) {
        const { data: profileData } = await supabase
          .from<Profile>("profiles")
          .select("*")
          .eq("id", authData.user.id)
          .single();
        setProfile(profileData ?? null);
      } else {
        setProfile(null);
      }
      setLoading(false);
    };

    fetchUserProfile();

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);

      if (session?.user) {
        const { data: profileData } = await supabase
          .from<Profile>("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();
        setProfile(profileData ?? null);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  return { user, profile, loading, supabase };
}
