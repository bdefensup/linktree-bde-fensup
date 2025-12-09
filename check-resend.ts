import { Resend } from 'resend';

const resend = new Resend('re_123');
console.log('Resend keys:', Object.keys(resend));
console.log('Has broadcasts:', !!resend.broadcasts);
console.log('Has segments:', !!(resend as any).segments);
