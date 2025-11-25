import * as React from "react";
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
  Section,
  Hr,
  Img,
  Link,
  Button,
} from "@react-email/components";

interface ResetPasswordEmailProps {
  url: string;
  firstName?: string;
}

export const ResetPasswordEmail = ({
  url,
  firstName,
}: ResetPasswordEmailProps) => (
  <Html>
    <Head />
    <Preview>Réinitialisation de votre mot de passe BDE FEN'SUP</Preview>
    <Body style={main}>
      <Container style={container}>
        {/* Header with Logo */}
        <Section style={header}>
          <Img
            src={`${baseUrl}/logo.png`}
            width="80"
            height="80"
            alt="BDE FEN'SUP"
            style={logo}
          />
          <Heading style={brandName}>BDE FEN'SUP</Heading>
        </Section>

        <Section style={contentContainer}>
          <Heading style={h1}>Mot de passe oublié ? 🔒</Heading>

          <Text style={text}>
            Bonjour {firstName ? <strong>{firstName}</strong> : "!"},
          </Text>
          <Text style={text}>
            Nous avons reçu une demande de réinitialisation de mot de passe pour
            votre compte. Si vous n'êtes pas à l'origine de cette demande, vous
            pouvez ignorer cet email.
          </Text>

          <Section style={buttonContainer}>
            <Button style={button} href={url}>
              Réinitialiser mon mot de passe
            </Button>
          </Section>

          <Text style={text}>Ce lien est valide pendant 1 heure.</Text>

          <Hr style={hr} />

          <Text style={footer}>
            © {new Date().getFullYear()} BDE FEN'SUP - Bureau des Étudiants
            <br />
            <Link href="https://BDE-FENSUP.short.gy/Instagram" style={link}>
              Instagram
            </Link>{" "}
            •{" "}
            <Link href="https://BDE-FENSUP.short.gy/TikTok" style={link}>
              TikTok
            </Link>
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
);

// Styles
const main = {
  backgroundColor: "#f8fafc",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  margin: "0 auto",
  padding: "40px 20px",
  maxWidth: "600px",
};

const header = {
  textAlign: "center" as const,
  marginBottom: "30px",
};

const brandName = {
  fontSize: "28px",
  fontWeight: "bold",
  color: "#f47231",
  margin: "0",
  letterSpacing: "-0.5px",
};

const contentContainer = {
  backgroundColor: "#ffffff",
  borderRadius: "12px",
  padding: "40px",
  boxShadow:
    "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
};

const h1 = {
  fontSize: "24px",
  fontWeight: "bold",
  color: "#292758",
  marginBottom: "24px",
  textAlign: "center" as const,
};

const text = {
  fontSize: "16px",
  color: "#475569",
  lineHeight: "26px",
  marginBottom: "16px",
};

const buttonContainer = {
  textAlign: "center" as const,
  margin: "32px 0",
};

const button = {
  backgroundColor: "#f47231",
  borderRadius: "50px",
  color: "#fff",
  fontSize: "16px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "12px 32px",
  boxShadow: "0 4px 6px -1px rgba(244, 114, 49, 0.2)",
};

const hr = {
  borderColor: "#e2e8f0",
  margin: "32px 0",
};

const footer = {
  color: "#94a3b8",
  fontSize: "12px",
  textAlign: "center" as const,
  lineHeight: "20px",
};

const link = {
  color: "#f47231",
  textDecoration: "none",
};

const baseUrl = process.env.NEXT_PUBLIC_APP_URL
  ? process.env.NEXT_PUBLIC_APP_URL
  : "";

const logo = {
  margin: "0 auto 20px",
  display: "block",
};

export default ResetPasswordEmail;
