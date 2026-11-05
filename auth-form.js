"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AuthForm({ mode, next = "/account" }) {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const isRegister = mode === "register";

  async function handleSubmit(event) {
    event.preventDefault();
    setBusy(true);
    setMessage("");

    const supabase = createClient();
    if (!supabase) {
      setMessage("Authentication is not configured. Check the Supabase environment variables.");
      setBusy(false);
      return;
    }

    if (isRegister) {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: { full_name: fullName.trim() },
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) {
        setMessage(error.message);
      } else if (data.session) {
        router.replace("/account");
        router.refresh();
      } else {
        setMessage("Account created. Check your email to confirm your address, then sign in.");
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password
      });

      if (error) {
        setMessage(error.message);
      } else {
        router.replace(next);
        router.refresh();
      }
    }

    setBusy(false);
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      {isRegister && (
        <label>
          Full name
          <input
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            autoComplete="name"
            maxLength={100}
            required
          />
        </label>
      )}
      <label>
        Email
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="email"
          required
        />
      </label>
      <label>
        Password
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete={isRegister ? "new-password" : "current-password"}
          minLength={8}
          required
        />
      </label>
      <button className="button primary auth-submit" type="submit" disabled={busy}>
        {busy ? "Please wait..." : isRegister ? "Create account" : "Sign in"}
      </button>
      {message && <p className="auth-message" role="status">{message}</p>}
      {isRegister && (
        <p className="auth-terms">
          Use an email address you can access. Passwords are handled by Supabase Auth.
        </p>
      )}
    </form>
  );
}
