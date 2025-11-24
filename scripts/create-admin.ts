import "dotenv/config";
import { auth } from "../lib/auth";
import { headers } from "next/headers"; // Mocking headers might be needed if auth relies on it, but usually api calls don't for internal use?
// Actually better-auth api calls usually require a request object or context if they are meant to be called from an API route.
// But let's try calling it directly. If it fails, we might need to use the internal database adapter directly or mock the request.

// Better approach: Use the internal adapter to create the user if the API is restricted to HTTP context.
// But better-auth doesn't expose the adapter easily on the `auth` object in all versions.
// Let's try the API first.

async function main() {
  const email = "admin@bdefensup.fr";
  const password = "password123";
  const name = "Admin";

  console.log(`Creating admin user: ${email}`);

  try {
    // We need to pass a mock request if required, but let's try without first.
    // In recent better-auth, api methods might be callable.
    // However, signUpEmail usually sets a session cookie, which requires a response object.
    // We just want to create the user.

    // If this fails, we will use a direct prisma insertion with a hashed password.
    // But we don't know the hashing config easily.

    // Let's try to use the exposed 'api' which is meant for server-side calls.
    const response = await auth.api.signUpEmail({
      body: {
        email,
        password,
        name,
      },
      asResponse: false, // We don't want a Response object, just the data?
      // Actually, let's see what happens.
    });

    console.log("User created:", response);
  } catch (error) {
    console.error("Failed to create user:", error);
  }
}

main();
