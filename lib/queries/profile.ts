"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import type { Profile } from "@/lib/types";
import type { ProfileInput } from "@/lib/schemas/profile";

type ProfileResponse = { profile: Profile };
const KEY = ["profile"];

// The logged-in user's own profile, with the photo (a data URL) for the sidebar and account pages.
export function useProfile() {
  return useQuery({ queryKey: KEY, queryFn: () => api<ProfileResponse>("/profile").then((r) => r.profile) });
}

// After a change: update the cache, and refresh the server layout so the name/phone from /auth/me match.
function useProfileMutation<T>(fn: (input: T) => Promise<ProfileResponse | undefined>) {
  const queryClient = useQueryClient();
  const router = useRouter();
  return useMutation({
    mutationFn: fn,
    onSuccess: (res) => {
      if (res) queryClient.setQueryData(KEY, res.profile);
      else void queryClient.invalidateQueries({ queryKey: KEY });
      router.refresh();
    },
  });
}

export const useUpdateProfile = () =>
  useProfileMutation((input: ProfileInput) => api<ProfileResponse>("/profile", { method: "PATCH", body: input }));

export const useSetAvatar = () =>
  useProfileMutation((image: string) => api<ProfileResponse>("/profile/avatar", { method: "PUT", body: { image } }));

export const useRemoveAvatar = () =>
  useProfileMutation(() => api<undefined>("/profile/avatar", { method: "DELETE" }));
