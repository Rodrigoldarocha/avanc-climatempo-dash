import { useEffect, useState } from "react";
import { LogIn, LogOut, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { toast } from "sonner";
import type { User } from "@supabase/supabase-js";

interface GoogleAuthButtonProps {
  variant?: "compact" | "full";
  onDone?: () => void;
}

export const GoogleAuthButton = ({ variant = "compact", onDone }: GoogleAuthButtonProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    supabase.auth.getUser().then(({ data }) => setUser(data.user ?? null));
    return () => subscription.unsubscribe();
  }, []);

  const handleSignIn = async () => {
    setLoading(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });

    if (result.error) {
      setLoading(false);
      toast.error("Não foi possível entrar com o Google.");
      return;
    }
    if (result.redirected) return;

    setLoading(false);
    onDone?.();
  };

  const handleSignOut = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signOut();
    setLoading(false);
    if (error) {
      toast.error("Não foi possível sair.");
      return;
    }
    toast.success("Sessão encerrada.");
    onDone?.();
  };

  const isFull = variant === "full";
  const label = user ? "Sair" : "Entrar com Google";
  const Icon = user ? LogOut : LogIn;

  return (
    <Button
      variant={user ? "ghost" : "outline"}
      size={isFull ? "default" : "sm"}
      onClick={user ? handleSignOut : handleSignIn}
      disabled={loading}
      aria-label={label}
      className={isFull ? "h-11 w-full justify-start gap-3 px-3" : "h-11 gap-2 px-3"}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Icon className="h-4 w-4" />}
      <span className={isFull ? "" : "hidden md:inline text-xs"}>{label}</span>
    </Button>
  );
};