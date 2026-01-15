"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "@/lib/actions/auth";
import { LogOut, User } from "lucide-react";

import { Button } from "@/components/ui/button";

interface UserMenuProps {
  userEmail?: string;
  userName?: string;
}

export function UserMenu({ userEmail, userName }: UserMenuProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSignOut = async () => {
    setIsLoading(true);
    await signOut();
    router.refresh();
  };

  return (
    <div className="flex items-center gap-3">
      <div className="hidden text-right sm:block">
        <p className="text-sm font-medium text-foreground">
          {userName || "User"}
        </p>
        <p className="text-xs text-muted-foreground">{userEmail}</p>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={handleSignOut}
        disabled={isLoading}
      >
        <LogOut className="mr-2 h-4 w-4" />
        {isLoading ? "Signing out..." : "Sign Out"}
      </Button>
    </div>
  );
}
