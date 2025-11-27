import { prisma } from "@/lib/prisma";
import { betterAuth } from "better-auth";
import { createAuthMiddleware, APIError } from "better-auth/api";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { Resend } from "resend";
import ResetPasswordEmail from "@/components/emails/reset-password";
import VerifyEmail from "@/components/emails/verify-email";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    async sendResetPassword(data, request) {
      const resend = new Resend(process.env.RESEND_API_KEY);
      if (!process.env.RESEND_API_KEY) {
        console.error("RESEND_API_KEY is missing!");
        return;
      }
      try {
        const result = await resend.emails.send({
          from: "onboarding@resend.dev",
          to: data.user.email,
          subject: "Réinitialisation de votre mot de passe",
          react: ResetPasswordEmail({
            url: data.url,
            firstName: data.user.name.split(" ")[0],
          }),
        });
      } catch (error) {
        console.error("Error sending reset email:", error);
      }
    },
    requireEmailVerification: true,
  },
  emailVerification: {
    sendVerificationEmail: async ({ user, url, token }, request) => {
      const resend = new Resend(process.env.RESEND_API_KEY);
      if (!process.env.RESEND_API_KEY) {
        console.error("RESEND_API_KEY is missing!");
        return;
      }
      try {
        const result = await resend.emails.send({
          from: "onboarding@resend.dev", // Using test email until domain is verified
          to: user.email,
          subject: "Vérifiez votre adresse email",
          react: VerifyEmail({
            url,
            firstName: user.name.split(" ")[0],
          }),
        });
      } catch (error) {
        console.error("Error sending verification email:", error);
      }
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // Update session every day
  },
  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      if (ctx.path === "/sign-up/email") {
        const email = ctx.body?.email;
        const allowedEmail = "bdefensup@gmail.com";
        const allowedDomain = "@edufenelon.org";

        if (email !== allowedEmail && !email?.endsWith(allowedDomain)) {
          throw new APIError("BAD_REQUEST", {
            message:
              "Seules les adresses @edufenelon.org ou bdefensup@gmail.com sont autorisées.",
          });
        }
      }
    }),
  },
});
