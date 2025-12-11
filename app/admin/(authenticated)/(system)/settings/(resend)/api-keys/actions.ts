"use server";

import { Resend } from "resend";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function getApiKeys() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  try {
    const { data, error } = await resend.apiKeys.list();

    if (error) {
      throw new Error(error.message);
    }

    // Handle potential nested data structure from Resend SDK
    if (Array.isArray(data)) {
      return data;
    }
    
    return (data as any)?.data || [];
  } catch (error) {
    console.error("Failed to fetch API keys:", error);
    return [];
  }
}

export async function createApiKey(name: string, permission: "full_access" | "sending_access" = "full_access", domainId?: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  try {
    const { data, error } = await resend.apiKeys.create({
      name,
      permission,
      domain_id: domainId,
    });

    if (error) {
      throw new Error(error.message);
    }

    revalidatePath("/admin/settings/api-keys");
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteApiKey(id: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  try {
    const { error } = await resend.apiKeys.remove(id);

    if (error) {
      throw new Error(error.message);
    }

    revalidatePath("/admin/settings/api-keys");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
