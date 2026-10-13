"use client";

import { useRef } from "react";
import { Camera, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { initials } from "@/lib/format";
import { AVATAR_TYPES, shrinkImage } from "@/lib/image";
import { useProfile, useRemoveAvatar, useSetAvatar } from "@/lib/queries/profile";
import { cn } from "@/lib/utils";

// The photo, or initials until one is uploaded. Used in the sidebar and on the profile pages.
export function AvatarPicture({ name, src, className }: { name: string; src?: string | null; className?: string }) {
  return src ? (
    // eslint-disable-next-line @next/next/no-img-element -- a data URL from the API, nothing for next/image to optimise
    <img src={src} alt={`${name}'s photo`} className={cn("shrink-0 object-cover", className)} />
  ) : (
    <span className={cn("flex shrink-0 items-center justify-center bg-sidebar-primary font-semibold text-sidebar-primary-foreground", className)}>
      {initials(name)}
    </span>
  );
}

// Big photo with "Change photo" / "Remove". The file is shrunk in the browser, then uploaded.
export function ProfilePhoto({ name }: { name: string }) {
  const input = useRef<HTMLInputElement>(null);
  const { data: profile } = useProfile();
  const setAvatar = useSetAvatar();
  const removeAvatar = useRemoveAvatar();
  const busy = setAvatar.isPending || removeAvatar.isPending;

  async function onPick(file: File | undefined) {
    if (input.current) input.current.value = ""; // picking the same file again still fires onChange
    if (!file) return;
    try {
      await setAvatar.mutateAsync(await shrinkImage(file));
      toast.success("Photo updated");
    } catch (err) {
      toast.error((err as Error).message);
    }
  }

  const remove = () =>
    removeAvatar.mutate(undefined, { onSuccess: () => toast.success("Photo removed"), onError: (e) => toast.error(e.message) });

  return (
    <div className="flex shrink-0 flex-col items-center gap-2 sm:w-44 sm:items-start">
      <button
        type="button"
        onClick={() => input.current?.click()}
        disabled={busy}
        className="group relative rounded-2xl ring-4 ring-card focus-visible:ring-ring focus-visible:outline-none"
        aria-label="Change photo"
      >
        <AvatarPicture name={name} src={profile?.avatar} className="size-24 rounded-2xl text-3xl" />
        <span className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/45 text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
          {busy ? <Spinner /> : <Camera className="size-6" />}
        </span>
      </button>
      <input ref={input} type="file" accept={AVATAR_TYPES.join(",")} className="sr-only" onChange={(e) => void onPick(e.target.files?.[0])} data-testid="avatar-input" />
      <div className="flex gap-1">
        <Button type="button" size="sm" variant="ghost" onClick={() => input.current?.click()} disabled={busy}>
          <Camera /> {profile?.avatar ? "Change" : "Add photo"}
        </Button>
        {profile?.avatar && (
          <Button type="button" size="sm" variant="ghost" onClick={remove} disabled={busy} className="text-destructive">
            <Trash2 /> Remove
          </Button>
        )}
      </div>
    </div>
  );
}

// The logged-in user's photo for server-rendered cards (fetched in the browser, initials until it loads).
export function MyAvatar({ name, className }: { name: string; className?: string }) {
  const { data: profile } = useProfile();
  return <AvatarPicture name={name} src={profile?.avatar} className={className} />;
}
