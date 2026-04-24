"use client";

import { Button } from "@/components/ui/button";

type Props = {
  username: string;
  password: string;
  passwordError: string;
  loginPending: boolean;
  onUsernameChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onLogin: () => void;
};

export function AdminLoginForm({
  username,
  password,
  passwordError,
  loginPending,
  onUsernameChange,
  onPasswordChange,
  onLogin,
}: Props) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm bg-card border border-border rounded-xl p-8 shadow-sm">
        <div className="text-center mb-8">
          <h1 className="font-serif text-3xl tracking-[0.14em] mb-1">URBAN UMMATI</h1>
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Admin Panel</p>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-xs uppercase tracking-wider block mb-1">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => onUsernameChange(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && onLogin()}
              className="w-full h-10 px-3 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              data-testid="input-admin-username"
              placeholder="Enter admin username"
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-wider block mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => onPasswordChange(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && onLogin()}
              className="w-full h-10 px-3 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              data-testid="input-admin-password"
              placeholder="Enter admin password"
            />
            {passwordError && <p className="text-xs text-destructive mt-1">{passwordError}</p>}
          </div>
          <Button
            onClick={onLogin}
            disabled={loginPending || !username || !password}
            className="w-full uppercase tracking-widest text-sm"
            data-testid="button-admin-login"
          >
            {loginPending ? "Signing In..." : "Sign In"}
          </Button>
        </div>
      </div>
    </div>
  );
}
