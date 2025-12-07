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

interface TicketConfirmationProps {
  name: string;
  subject: string;
  reference: string;
  ticketLink: string;
}

export const TicketConfirmationEmail = ({
  name,
  subject,
  reference,
  ticketLink,
}: TicketConfirmationProps) => (
  <Html>
    <Head />
    <Preview>Votre ticket {reference} a bien été reçu</Preview>
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
          <Heading style={h1}>Ticket Reçu ! 🎫</Heading>

          <Text style={text}>Bonjour {name},</Text>
          <Text style={text}>
            Nous avons bien reçu votre demande concernant "<strong>{subject}</strong>".
          </Text>
          <Text style={text}>
            Un membre de notre équipe va prendre connaissance de votre message et vous répondra dans
            les plus brefs délais.
          </Text>

          <Section style={infoBox}>
            <Text style={infoText}>
              <strong>Référence :</strong> {reference}
            </Text>
          </Section>

          <Text style={text}>
            Vous pouvez reprendre la discussion à tout moment en cliquant sur le bouton ci-dessous :
          </Text>

          <Section style={buttonContainer}>
            <a style={button} href={ticketLink}>
              Voir mon ticket
            </a>
          </Section>

          <Text style={text}>
            Si le bouton ne fonctionne pas, copiez et collez ce lien :
            <br />
            <Link href={ticketLink} style={{ ...link, textDecoration: "underline" }}>
              {ticketLink}
            </Link>
          </Text>

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
  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
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

const infoBox = {
  backgroundColor: "#f1f5f9",
  borderRadius: "8px",
  padding: "16px",
  marginBottom: "24px",
  textAlign: "center" as const,
};

const infoText = {
  fontSize: "18px",
  color: "#334155",
  margin: "0",
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



const logo = {
  margin: "0 auto 20px",
  display: "block",
};

export default TicketConfirmationEmail;
