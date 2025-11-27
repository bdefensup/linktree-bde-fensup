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
} from "@react-email/components";

interface BookingConfirmationEmailProps {
  firstName: string;
  eventName: string;
  bookingId: string;
}

export const BookingConfirmationEmail = ({
  firstName,
  eventName,
  bookingId,
}: BookingConfirmationEmailProps) => (
  <Html>
    <Head />
    <Preview>
      Confirmation de votre demande de réservation pour {eventName}
    </Preview>
    <Body style={main}>
      <Container style={container}>
        {/* Header with Logo Placeholder and Brand Name */}
        <Section style={header}>
          <Img
            src={`${baseUrl}/logo-full.png`}
            width="80"
            height="80"
            alt="BDE FEN'SUP"
            style={logo}
          />
          <Heading style={brandName}>BDE FEN'SUP</Heading>
        </Section>

        <Section style={contentContainer}>
          <Heading style={h1}>Demande de réservation reçue !</Heading>

          <Text style={text}>
            Bonjour <strong>{firstName}</strong>,
          </Text>
          <Text style={text}>
            Nous avons bien reçu votre demande de réservation pour l'événement :
          </Text>

          <Section style={eventCard}>
            <Text style={eventNameStyle}>{eventName}</Text>
            <Text style={bookingIdStyle}>Référence : {bookingId}</Text>
          </Section>

          <Section style={highlightSection}>
            <Text style={highlightText}>
              ⚠️ Important : Votre place n'est pas encore validée.
            </Text>
            <Text style={highlightSubText}>
              Nous reviendrons vers vous 48h avant l'événement pour vous
              confirmer le paiement et la réservation définitive par mail et
              SMS.
            </Text>
          </Section>

          <Text style={text}>
            Si vous avez des questions, n'hésitez pas à nous contacter sur nos
            réseaux sociaux.
          </Text>

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
  backgroundColor: "#f8fafc", // Slate 50
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
  color: "#f47231", // Brand Orange
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
  color: "#292758", // Brand Blue
  marginBottom: "24px",
  textAlign: "center" as const,
};

const text = {
  fontSize: "16px",
  color: "#475569", // Slate 600
  lineHeight: "26px",
  marginBottom: "16px",
};

const eventCard = {
  backgroundColor: "#f1f5f9", // Slate 100
  borderRadius: "8px",
  padding: "20px",
  margin: "24px 0",
  textAlign: "center" as const,
  border: "1px solid #e2e8f0",
};

const eventNameStyle = {
  fontSize: "20px",
  fontWeight: "bold",
  color: "#292758", // Brand Blue
  margin: "0 0 8px 0",
};

const bookingIdStyle = {
  fontSize: "14px",
  color: "#64748b", // Slate 500
  margin: "0",
  fontFamily: "monospace",
};

const highlightSection = {
  backgroundColor: "#fff7ed", // Orange 50
  borderLeft: "4px solid #f47231", // Brand Orange
  padding: "16px",
  margin: "24px 0",
  borderRadius: "4px",
};

const highlightText = {
  fontSize: "16px",
  fontWeight: "bold",
  color: "#9a3412", // Dark Orange
  margin: "0 0 8px 0",
};

const highlightSubText = {
  fontSize: "15px",
  color: "#9a3412", // Dark Orange
  margin: "0",
  lineHeight: "24px",
};

const hr = {
  borderColor: "#e2e8f0",
  margin: "32px 0",
};

const footer = {
  color: "#94a3b8", // Slate 400
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

export default BookingConfirmationEmail;
