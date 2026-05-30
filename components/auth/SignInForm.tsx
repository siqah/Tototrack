"use client";
import { useState } from "react";
import { signIn } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GoogleSignInButton } from "./GoogleSignInButton";

export function SignInForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const result = await signIn.email({ email, password });
    setLoading(false);
    if (result.error) {
      setError(result.error.message ?? "Sign in failed");
    } else {
      router.push("/");
    }
  }

  return (
    <Card className="border-gray-800 bg-gray-900">
      <CardHeader>
        <CardTitle className="text-white">Sign in</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <GoogleSignInButton />
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-gray-700" />
          </div>
          <div className="relative flex justify-center text-xs text-gray-500">
            <span className="bg-gray-900 px-2">or continue with email</span>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1">
            <Label className="text-gray-300">Email</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="border-gray-700 bg-gray-800 text-white"
              placeholder="admin@school.ke"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-gray-300">Password</Label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="border-gray-700 bg-gray-800 text-white"
            />
          </div>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Signing in..." : "Sign in"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
