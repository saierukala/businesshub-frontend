"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useLogout } from "@/lib/queries/auth";

export function LogoutButton() {
  const router = useRouter();
  const logout = useLogout();

  return (
    <Button
      variant="ghost"
      size="sm"
      disabled={logout.isPending}
      onClick={() =>
        logout.mutate(undefined, {
          onSuccess: () => {
            router.replace("/login");
            router.refresh();
          },
          onError: (err) => toast.error(err.message),
        })
      }
    >
      {logout.isPending ? <Spinner /> : <LogOut />}
      Log out
    </Button>
  );
}
