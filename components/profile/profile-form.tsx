"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FieldGroup } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { TextField } from "@/components/form/text-field";
import { PhoneField } from "@/components/form/phone-field";
import { FormAlert } from "@/components/form/form-alert";
import { showApiError } from "@/lib/form";
import { formatDate } from "@/lib/format";
import type { Role, User } from "@/lib/auth";
import { useProfile, useUpdateProfile } from "@/lib/queries/profile";
import { profileSchema, type ProfileInput } from "@/lib/schemas/profile";
import { ProfilePhoto } from "./profile-photo";

const ROLE_LABEL: Record<Role, string> = { OWNER: "Owner", MANAGER: "Service Manager", TECHNICIAN: "Technician", CUSTOMER: "Customer" };

// Your own photo, name and phone, for every role. Email and role are shown but not editable
// (a new email would need verifying again, and roles are set by the owner).
export function ProfileForm({ user }: { user: User }) {
  const { data: profile } = useProfile();
  const update = useUpdateProfile();
  const form = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user.name, phone: user.phone ?? "" },
    mode: "onTouched",
  });

  const submit = (values: ProfileInput) =>
    update.mutate(values, {
      onSuccess: (res) => {
        toast.success("Profile saved");
        form.reset({ name: res!.profile.name, phone: res!.profile.phone ?? "" });
      },
      onError: (err) => showApiError(form, err),
    });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile</CardTitle>
        <CardDescription>Your photo, name and mobile number. Our team sees these on your bookings.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6 sm:flex-row sm:items-start">
        <ProfilePhoto name={user.name} />
        <form onSubmit={form.handleSubmit(submit)} noValidate className="flex-1">
          <FieldGroup>
            <FormAlert message={form.formState.errors.root?.server?.message} />
            <TextField control={form.control} name="name" label="Full name" autoComplete="name" />
            <PhoneField control={form.control} name="phone" label="Mobile number" description="Leave empty to remove it." />
            <dl className="grid gap-3 text-sm sm:grid-cols-3">
              <div>
                <dt className="text-muted-foreground">Email</dt>
                <dd className="truncate font-medium">{user.email ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Role</dt>
                <dd className="font-medium">{ROLE_LABEL[user.role]}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Member since</dt>
                <dd className="font-medium">{profile ? formatDate(profile.memberSince) : "…"}</dd>
              </div>
            </dl>
            <div>
              <Button type="submit" disabled={update.isPending || !form.formState.isDirty} aria-busy={update.isPending}>
                {update.isPending && <Spinner />}
                Save changes
              </Button>
            </div>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
