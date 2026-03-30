import { supabase } from "@/integrations/supabase/client";

export type AuthRole = "admin" | "producer" | "customer";

export interface AuthRoutingState {
  role: AuthRole | null;
  onboardingCompleted: boolean | null;
  redirectPath: "/dashboard" | "/onboarding" | "/my-account" | "/login";
}

export async function getUserRole(userId: string): Promise<AuthRole | null> {
  const { data: roles } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId);

  return (roles?.[0]?.role as AuthRole | undefined) ?? null;
}

export async function getAuthRoutingState(userId: string): Promise<AuthRoutingState> {
  const role = await getUserRole(userId);

  if (role === "admin") {
    return { role, onboardingCompleted: true, redirectPath: "/dashboard" };
  }

  if (role === "producer") {
    const { data: profile } = await supabase
      .from("profiles")
      .select("onboarding_completed")
      .eq("id", userId)
      .single();

    const onboardingCompleted = Boolean(profile?.onboarding_completed);

    return {
      role,
      onboardingCompleted,
      redirectPath: onboardingCompleted ? "/dashboard" : "/onboarding",
    };
  }

  if (role === "customer") {
    return { role, onboardingCompleted: true, redirectPath: "/my-account" };
  }

  // No role found — send to login (not /my-account, which requires "customer" role)
  return { role: null, onboardingCompleted: null, redirectPath: "/login" };
}

export async function getRedirectPath(userId: string) {
  const { redirectPath } = await getAuthRoutingState(userId);
  return redirectPath;
}