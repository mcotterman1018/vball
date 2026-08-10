"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { FormCard } from "@/components/ui/FormCard";
import { AuthField } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import { PrimaryBtn } from "@/components/ui/Button";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }
    // Hard navigation so the server picks up the fresh session cookie. /app
    // redirects to /onboarding if this user hasn't set up an org yet, so we
    // don't need a client-side membership lookup here.
    window.location.assign("/app");
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
