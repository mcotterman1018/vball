"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { FormCard } from "@/components/ui/FormCard";
import { AuthField } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import { PrimaryBtn } from "@/components/ui/Button";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [needsConfirmation, setNeedsConfirmation] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const supabase = createClient();
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
    });
    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }
    if (data.session) {
      router.push("/onboarding");
      router.refresh();
    } else {
      setNeedsConfirmation(true);
      setLoading(false);
    }
  }

  if (needsConfirmation) {
    return (
      <FormCard title="Check your email" backHref="/" sub="We sent a confirmation link to your inbox.">
        <div className="text-sm text-text-sec">
          Click the link in the email, then come back and sign in to finish setting up your organization.
        </div>
      </FormCard>
    );
  }

  return (
    <FormCard title="Create account" sub="Start coaching smarter." backHref="/">
      <form onSubmit={handleSubmit}>
        <AuthField label="Your name">
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Coach Smith" required />
        </AuthField>
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
            minLength={6}
            required
          />
        </AuthField>
        {error && <div className="text-sm text-red mb-4 -mt-2">{error}</div>}
        <PrimaryBtn type="submit" disabled={loading} className="w-full mt-2">
          {loading ? "Creating account…" : "Continue"}
        </PrimaryBtn>
      </form>
    </FormCard>
  );
}
