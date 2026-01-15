import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { UserMenu } from "@/components/auth/user-menu";
import { Button } from "@/components/ui/button";
import { NavigationMenu } from "@/components/navigation/navigation-menu";

export async function SiteHeader() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let userProfile = null;
  if (user) {
    const { data } = await supabase
      .from("profile")
      .select("full_name, email")
      .eq("id", user.id)
      .single();
    userProfile = data;
  }

  return (
    <header className="border-b-2 border-border bg-background/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex flex-col">
            <h1 className="text-2xl font-bold rainbow-text">KetoMate</h1>
            <span className="text-[10px] text-muted-foreground hidden sm:block">
              Smart keto, simplified
            </span>
          </Link>
          <nav className="flex items-center gap-4">
            {user ? (
              <>
                <NavigationMenu />
                <UserMenu
                  userEmail={userProfile?.email || user.email || undefined}
                  userName={userProfile?.full_name || undefined}
                />
              </>
            ) : (
              <>
                <Button variant="outline" asChild>
                  <Link href="/login">Login</Link>
                </Button>
                <Button asChild>
                  <Link href="/signup">Sign Up</Link>
                </Button>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
