"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

// ponytail: one query, one check, done
export function PremiumGate({ children }: { children: React.ReactNode }) {
  const [isPremium, setIsPremium] = useState<boolean | null>(null);
  const supabase = createClient();

  useEffect(() => {
    async function check() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsPremium(false);
        return;
      }

      const { data } = await supabase
        .from("subscriptions")
        .select("status")
        .eq("user_id", user.id)
        .eq("status", "active")
        .maybeSingle();

      setIsPremium(!!data);
    }
    check();
  }, [supabase]);

  if (isPremium === null) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isPremium) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-2xl font-bold mb-2">Premium Access</p>
        <p className="text-muted-foreground mb-6">
          Fitur ini butuh langganan aktif
        </p>
        <Link
          href="/pricing"
          className="bg-gold text-background font-semibold px-6 py-3 rounded-lg hover:bg-gold-light transition-colors"
        >
          Upgrade →
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}
