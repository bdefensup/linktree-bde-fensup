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

interface PaymentReceivedEmailProps {
  firstName: string;
  eventName: string;
  bookingId: string;
}

export const PaymentReceivedEmail = ({
  firstName,
  eventName,
  bookingId,
}: PaymentReceivedEmailProps) => (
  <Html>
    <Head />
    <Preview>Confirmation de paiement pour {eventName} - Réservation validée !</Preview>
    <Body style={main}>
      <Container style={container}>
        {/* Header with Logo */}
        <Section style={header}>
          <Img
            src="https://toazsavunhtlhepwhnoe.supabase.co/storage/v1/object/public/campaign-images/logo-full.png"
            width="150"
            height="auto"
            alt="BDE FENELON"
            style={logo}
          />
          <Heading style={brandName}>BDE FENELON</Heading>
        </Section>

        <Section style={contentContainer}>
          <Heading style={h1}>Paiement validé ! 🎉</Heading>

          <Text style={text}>
            Bonjour <strong>{firstName}</strong>,
          </Text>
          <Text style={text}>
            Bonne nouvelle ! Nous avons bien reçu votre paiement (ou validé votre réservation
            manuellement).
          </Text>
          <Text style={text}>
            Votre place pour l'événement est désormais <strong>confirmée</strong>.
          </Text>

          <Section style={eventCard}>
            <Text style={eventNameStyle}>{eventName}</Text>
            <Text style={bookingIdStyle}>Référence : {bookingId}</Text>
          </Section>

          <Section style={highlightSection}>
            <Text style={highlightText}>✅ Réservation Confirmée</Text>
            <Text style={highlightSubText}>
              Présentez ce mail ou votre pièce d'identité à l'entrée de l'événement.
            </Text>
          </Section>

          <Text style={text}>Hâte de vous y voir !</Text>

          <Hr style={hr} />

          <Text style={footer}>
            © {new Date().getFullYear()} BDE FENELON - Bureau des Étudiants
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
  border: "1px solid #e2e8f0",
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

const eventCard = {
  backgroundColor: "#f1f5f9",
  borderRadius: "8px",
  padding: "20px",
  margin: "24px 0",
  textAlign: "center" as const,
  border: "1px solid #e2e8f0",
};

const eventNameStyle = {
  fontSize: "20px",
  fontWeight: "bold",
  color: "#292758",
  margin: "0 0 8px 0",
};

const bookingIdStyle = {
  fontSize: "14px",
  color: "#64748b",
  margin: "0",
  fontFamily: "monospace",
};

const highlightSection = {
  backgroundColor: "#f0fdf4", // Green 50
  borderLeft: "4px solid #22c55e", // Green 500
  padding: "16px",
  margin: "24px 0",
  borderRadius: "4px",
};

const highlightText = {
  fontSize: "16px",
  fontWeight: "bold",
  color: "#15803d", // Green 700
  margin: "0 0 8px 0",
};

const highlightSubText = {
  fontSize: "15px",
  color: "#15803d",
  margin: "0",
  lineHeight: "24px",
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



const logo = {
  margin: "0 auto 20px",
  display: "block",
};

export default PaymentReceivedEmail;
