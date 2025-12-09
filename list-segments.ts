import { Resend } from 'resend';
import * as fs from 'fs';

const envFile = fs.readFileSync('.env', 'utf8');
const apiKeyMatch = envFile.match(/RESEND_API_KEY=(.*)/);
const apiKey = apiKeyMatch ? apiKeyMatch[1].trim() : '';

const resend = new Resend(apiKey);

async function listSegments() {
  try {
    const response = await resend.segments.list();
    console.log('Segments:', JSON.stringify(response, null, 2));
  } catch (error) {
    console.error('Error listing segments:', error);
  }
}

listSegments();
