import {
  Body,
  Container,
  Head,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
  Hr,
  Column,
  Row,
} from "@react-email/components";
import * as React from "react";

interface CampaignEmailProps {
  content: string;
  subject: string;
}

export const CampaignEmail = ({ content, subject }: CampaignEmailProps) => {
  return (
    <Html>
      <Head>
        <style>
          {`
            @media only screen and (max-width: 600px) {
              .container {
                width: 100% !important;
                max-width: 100% !important;
                border-radius: 0 !important;
                margin-bottom: 0 !important;
                padding: 20px 10px !important;
              }
              .content-section {
                padding: 0 15px !important;
                font-size: 11px !important;
              }
              .footer {
                padding: 20px 15px !important;
                margin-top: 20px !important;
              }
            }
          `}
        </style>
      </Head>
      <Preview>{subject}</Preview>
      <Body style={main}>
        <Container style={container} className="container">
          <Section style={header}>
            <Row>
              <Column align="center">
                <Img
                  src="https://toazsavunhtlhepwhnoe.supabase.co/storage/v1/object/public/campaign-images/logo-full.png"
                  width="150"
                  height="auto"
                  alt="BDE Fénelon Sup"
                  style={logo}
                />
              </Column>
            </Row>
          </Section>

          {/* Content */}
          <Section style={contentSection} className="content-section">
            <div dangerouslySetInnerHTML={{ __html: content }} />
          </Section>

          {/* Footer */}
          <Section style={footer} className="footer">
            <Hr style={hr} />
            <Text style={footerText}>
              Fénelon Sup, 9 Boulevard de Courcelles, 75008 Paris - 01 43 87 54 86 - fenelonsup@groupefenelon.org
            </Text>
            <div style={socials}>
              <Link href="https://www.instagram.com/bde_fenelon" style={socialLink}>
                <Img src="https://img.icons8.com/?size=100&id=nj0Uj45LGUYh&format=png&color=000000" width="24" height="24" alt="Instagram" style={socialIcon} />
              </Link>
              <Link href="https://www.tiktok.com/@bde.fenelon" style={socialLink}>
                <Img src="https://img.icons8.com/?size=100&id=oKHadYScUe2I&format=png&color=000000" width="24" height="24" alt="TikTok" style={socialIcon} />
              </Link>
              <Link href="https://www.linkedin.com/company/bde-fenelon-sup" style={socialLink}>
                <Img src="https://img.icons8.com/?size=100&id=kBCrQMzpQDLQ&format=png&color=000000" width="24" height="24" alt="LinkedIn" style={socialIcon} />
              </Link>
              <Link href="https://wa.me/33143875486" style={socialLink}>
                <Img src="https://img.icons8.com/ios-filled/50/000000/whatsapp.png" width="24" height="24" alt="WhatsApp" style={socialIcon} />
              </Link>
            </div>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default CampaignEmail;

const main = {
  backgroundColor: "#f3f4f6",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0 48px",
  marginBottom: "64px",
  maxWidth: "850px",
  borderRadius: "5px",
  boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
};

const header = {
  padding: "20px 0",
  textAlign: "center" as const,
};

const logo = {
  margin: "0 auto",
  marginBottom: "10px",
};

const contentSection = {
  padding: "0 40px",
  color: "#333",
  fontSize: "16px",
  lineHeight: "1.5",
};

const footer = {
  padding: "24px 40px",
  marginTop: "40px",
  textAlign: "center" as const,
  backgroundColor: "#f3f4f6",
  borderRadius: "8px",
};

const hr = {
  borderColor: "#e6ebf1",
  margin: "20px 0",
};

const footerText = {
  color: "#8898aa",
  fontSize: "12px",
  lineHeight: "16px",
};

const socials = {
  marginTop: "20px",
};

const socialLink = {
  margin: "0 8px",
  display: "inline-block",
  textDecoration: "none",
};

const socialIcon = {
  display: "inline-block",
  verticalAlign: "middle",
};
