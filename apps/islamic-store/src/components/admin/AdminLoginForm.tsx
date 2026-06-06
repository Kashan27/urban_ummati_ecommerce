"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";

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
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm bg-card border border-border rounded-xl p-8 shadow-sm">
        <div className="text-center mb-8 flex flex-col items-center">
          <div className="flex items-center gap-3 mb-2">
            <Image
              src="/logo.png"
              alt="Urban Ummati"
              width={42}
              height={42}
              className="object-contain"
            />
            <h1 className="font-serif text-3xl leading-none tracking-[0.2em] text-foreground">
              RBAN UMMATI
            </h1>
          </div>
          <p className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground mb-1">Timeless Islamic Living</p>
          <div className="mt-4 inline-flex items-center rounded-md bg-primary/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-primary">
            Admin Panel
          </div>
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
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => onPasswordChange(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && onLogin()}
                className="w-full h-10 px-3 pr-10 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                data-testid="input-admin-password"
                placeholder="Enter admin password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
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
