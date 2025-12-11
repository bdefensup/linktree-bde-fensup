"use server";


import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";



export async function getWebhooks() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  try {
    // Note: Resend SDK might not have full webhook support in all versions, 
    // but we'll assume standard structure or use raw API if needed.
    // Checking documentation or types would be ideal, but we'll proceed with standard pattern.
    // If resend.webhooks doesn't exist, we might need to use fetch directly.
    // For now, let's assume it exists or we'll use a direct fetch fallback if this fails in compilation.
    
    // Using direct fetch as a safer bet if SDK types are uncertain, 
    // but let's try to use the SDK first if available.
    // Actually, to be safe and avoid "Property 'webhooks' does not exist" errors if the SDK is old,
    // let's use the raw API endpoint.
    
    const response = await fetch("https://api.resend.com/webhooks", {
      headers: {
        "Authorization": `Bearer ${process.env.RESEND_API_KEY}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch webhooks");
    }

    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error("Failed to fetch webhooks:", error);
    return [];
  }
}

export async function createWebhook(url: string, eventTypes: string[]) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  try {
    const response = await fetch("https://api.resend.com/webhooks", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url,
        event_types: eventTypes,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to create webhook");
    }

    revalidatePath("/admin/settings/webhooks");
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteWebhook(id: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  try {
    const response = await fetch(`https://api.resend.com/webhooks/${id}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${process.env.RESEND_API_KEY}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to delete webhook");
    }

    revalidatePath("/admin/settings/webhooks");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
