import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'KRISHILINK — From Demand to Delivery',
  description: 'AI-powered agricultural supply chain connecting farmers, buyers and logistics',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
