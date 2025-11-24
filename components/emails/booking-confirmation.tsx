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
        <Heading style={h1}>Confirmation de réservation</Heading>
        <Text style={text}>Bonjour {firstName},</Text>
        <Text style={text}>
          Votre demande de réservation pour l'événement{" "}
          <strong>{eventName}</strong> a bien été prise en compte.
        </Text>
        <Section style={highlightSection}>
          <Text style={highlightText}>
            Nous reviendrons vers vous 48h avant l'événement pour vous confirmer
            le paiement et la réservation par mail et SMS.
          </Text>
        </Section>
        <Text style={text}>Référence de réservation : {bookingId}</Text>
        <Hr style={hr} />
        <Text style={footer}>L'équipe BDE FEN'SUP</Text>
      </Container>
    </Body>
  </Html>
);

const main = {
  backgroundColor: "#ffffff",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  margin: "0 auto",
  padding: "20px 0 48px",
  maxWidth: "560px",
};

const h1 = {
  fontSize: "24px",
  fontWeight: "bold",
  color: "#292758",
  marginBottom: "24px",
};

const text = {
  fontSize: "16px",
  color: "#484848",
  lineHeight: "26px",
};

const highlightSection = {
  backgroundColor: "#f47231",
  borderRadius: "8px",
  padding: "16px",
  margin: "24px 0",
};

const highlightText = {
  ...text,
  color: "#ffffff",
  fontWeight: "bold",
  margin: 0,
};

const hr = {
  borderColor: "#e6ebf1",
  margin: "20px 0",
};

const footer = {
  color: "#8898aa",
  fontSize: "12px",
};

export default BookingConfirmationEmail;
