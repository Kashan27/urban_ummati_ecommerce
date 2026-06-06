"use client";

import { useState, useEffect } from "react";
import { Info, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface AdminUser {
  id: number;
  username: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  lastLoginAt: string | null;
}

export function AdminsSection() {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const fetchAdmins = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/admins", { credentials: "include" });
      if (response.ok) {
        const data = await response.json();
        setAdmins(data.admins || []);
      }
    } catch (error) {
      toast.error("Failed to load admin users");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleCreateAdmin = async () => {
    if (!newUsername || !newPassword) {
      toast.error("Username and password are required");
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch("/api/admin/admins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username: newUsername, password: newPassword })
      });

      if (response.ok) {
        toast.success("Admin user created");
        setIsAddDialogOpen(false);
        setNewUsername("");
        setNewPassword("");
        fetchAdmins();
      } else {
        const data = await response.json();
        throw new Error(data.error || "Failed to create admin");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create admin");
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleStatus = async (admin: AdminUser) => {
    try {
      const response = await fetch(`/api/admin/admins/${admin.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ isActive: !admin.isActive })
      });

      if (response.ok) {
        toast.success(`Admin ${admin.isActive ? 'deactivated' : 'activated'}`);
        fetchAdmins();
      } else {
        throw new Error("Failed to update status");
      }
    } catch (error) {
      toast.error("Failed to update admin status");
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] md:h-[calc(100vh-5rem)]">
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 space-y-4 pb-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-foreground">Admin Management</h2>
            <p className="text-xs text-muted-foreground">Manage authorized personnel and their access roles</p>
          </div>
          <Button
            size="sm"
            className="h-8 gap-1.5 px-3 text-xs font-medium bg-primary hover:bg-primary/90 text-primary-foreground"
            onClick={() => setIsAddDialogOpen(true)}
          >
            <Plus className="h-3.5 w-3.5" /> Add Admin
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto min-h-0 custom-scrollbar space-y-6">
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-primary mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-primary">Security Note</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Admins have full access to orders, products, and store settings. 
                  Ensure you only grant access to trusted individuals. You cannot deactivate your own account.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-border/60 shadow-sm">
          <CardContent className="p-0">
            <table className="w-full text-xs border-collapse">
              <thead className="sticky top-0 z-10 bg-muted/95 backdrop-blur-sm border-b shadow-sm text-muted-foreground font-medium">
                <tr>
                  <th className="p-3 text-left font-semibold">Administrator</th>
                  <th className="p-3 text-left font-semibold">Security Role</th>
                  <th className="p-3 text-left font-semibold">Account Status</th>
                  <th className="p-3 text-left font-semibold">Last Activity</th>
                  <th className="p-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {isLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="p-3"><div className="h-4 w-32 bg-muted rounded" /></td>
                      <td className="p-3"><div className="h-4 w-16 bg-muted rounded" /></td>
                      <td className="p-3"><div className="h-4 w-16 bg-muted rounded" /></td>
                      <td className="p-3"><div className="h-4 w-24 bg-muted rounded" /></td>
                      <td className="p-3 text-right"><div className="h-7 w-20 ml-auto bg-muted rounded" /></td>
                    </tr>
                  ))
                ) : admins.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="h-24 text-center text-muted-foreground">
                      No authorized admin users found
                    </td>
                  </tr>
                ) : (
                  admins.map((admin) => (
                    <tr key={admin.id} className="hover:bg-primary/[0.02] transition-colors group">
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-[10px] border border-primary/20">
                            {admin.username.substring(0, 2).toUpperCase()}
                          </div>
                          <span className="font-bold text-foreground">{admin.username}</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <Badge variant="secondary" className="capitalize text-[9px] font-bold px-1.5 py-0 bg-muted border-border/50">{admin.role}</Badge>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <div className={cn(
                            "h-2 w-2 rounded-full shadow-sm",
                            admin.isActive ? "bg-emerald-500 shadow-emerald-200" : "bg-amber-500 shadow-amber-200"
                          )} />
                          <span className="font-semibold capitalize text-foreground/80">
                            {admin.isActive ? "Active" : "Inactive"}
                          </span>
                        </div>
                      </td>
                      <td className="p-3 text-muted-foreground text-[10px] font-medium uppercase tracking-tighter">
                        {admin.lastLoginAt ? new Date(admin.lastLoginAt).toLocaleString() : "No Activity Recorded"}
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-7 px-2 text-[10px] font-bold uppercase tracking-wider text-primary hover:bg-primary/5"
                            onClick={() => handleToggleStatus(admin)}
                          >
                            {admin.isActive ? "Deactivate" : "Activate"}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Administrator</DialogTitle>
              <DialogDescription>
                Create a new account with administrative privileges.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Username</label>
                <Input 
                  placeholder="e.g. syed.ali" 
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Password</label>
                <Input 
                  type="password"
                  placeholder="Minimum 6 characters" 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleCreateAdmin} disabled={isSaving}>
                {isSaving ? "Creating..." : "Create Account"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
