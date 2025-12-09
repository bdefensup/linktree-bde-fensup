import { prisma } from "@/lib/prisma";
import { betterAuth } from "better-auth";

import { prismaAdapter } from "better-auth/adapters/prisma";
import { admin } from "better-auth/plugins";
import { Resend } from "resend";
import ResetPasswordEmail from "@/components/emails/auth/reset-password";
import VerifyEmail from "@/components/emails/auth/verify-email";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  baseURL:
    process.env.NODE_ENV === "development"
      ? "http://localhost:3000"
      : process.env.NEXT_PUBLIC_APP_URL || "https://www.bdefenelon.org",
  trustedOrigins: ["https://www.bdefenelon.org", "https://bdefenelon.org", "http://localhost:3000"],
  plugins: [admin()],
  emailAndPassword: {
    enabled: true,
    async sendResetPassword(data) {
      const resend = new Resend(process.env.RESEND_API_KEY);
      if (!process.env.RESEND_API_KEY) {
        console.error("RESEND_API_KEY is missing!");
        return;
      }
      try {
        await resend.emails.send({
          from: process.env.EMAIL_FROM || "BDE FENELON <onboarding@resend.dev>",
          to: data.user.email,
          subject: "Réinitialisation de votre mot de passe",
          react: ResetPasswordEmail({
            url: data.url,
            firstName: data.user.name.split(" ")[0],
          }),
          tags: [
            { name: "category", value: "auth" },
            { name: "action", value: "reset_password" },
          ],
        });
      } catch (error) {
        console.error("Error sending reset email:", error);
      }
    },
    requireEmailVerification: true,
  },
  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      // eslint-disable-next-line no-console
      console.log(`Attempting to send verification email to ${user.email}`);
      const resend = new Resend(process.env.RESEND_API_KEY);
      if (!process.env.RESEND_API_KEY) {
        console.error("RESEND_API_KEY is missing!");
        return;
      }
      try {
        const { data, error } = await resend.emails.send({
          from: process.env.EMAIL_FROM || "BDE FENELON <onboarding@resend.dev>",
          to: user.email,
          subject: "Vérifiez votre adresse email",
          react: VerifyEmail({
            url,
            firstName: user.name.split(" ")[0],
          }),
          tags: [
            { name: "category", value: "auth" },
            { name: "action", value: "verify_email" },
          ],
        });

        if (error) {
          console.error("Resend API Error:", error);
        } else {
          // eslint-disable-next-line no-console
          console.log("Verification email sent successfully:", data);
        }
      } catch (error) {
        console.error("Error sending verification email:", error);
      }
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // Update session every day
  },
});
