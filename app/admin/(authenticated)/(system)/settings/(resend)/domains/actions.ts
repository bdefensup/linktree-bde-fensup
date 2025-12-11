"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function getDomains() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  try {
    const { data, error } = await resend.domains.list();

    if (error) {
      throw new Error(error.message);
    }

    // Resend SDK returns { data: Domain[] } structure for list
    return (data as any)?.data || [];
  } catch (error) {
    console.error("Failed to fetch domains:", error);
    return [];
  }
}

export async function getDomain(id: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  try {
    const { data, error } = await resend.domains.get(id);

    if (error) {
      throw new Error(error.message);
    }

    return data;
  } catch (error) {
    console.error(`Failed to fetch domain ${id}:`, error);
    return null;
  }
}
