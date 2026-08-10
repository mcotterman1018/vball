"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { FormCard } from "@/components/ui/FormCard";
import { AuthField } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import { PrimaryBtn } from "@/components/ui/Button";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const supabase = createClient();
    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }
    const { data: membership } = await supabase
      .from("org_members")
      .select("org_id")
      .eq("user_id", data.user.id)
      .limit(1)
      .maybeSingle();
    router.push(membership ? "/app" : "/onboarding");
    router.refresh();
  }

  return (
    <FormCard title="Sign in" backHref="/">
      <form onSubmit={handleSubmit}>
        <AuthField label="Email">
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="coach@school.edu"
            required
          />
        </AuthField>
        <AuthField label="Password">
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
        </AuthField>
        {error && <div className="text-sm text-red mb-4 -mt-2">{error}</div>}
        <PrimaryBtn type="submit" disabled={loading} className="w-full mt-2">
          {loading ? "Signing in…" : "Sign in"}
        </PrimaryBtn>
      </form>
    </FormCard>
  );
}
