import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import { Providers } from './providers';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';

const manrope = localFont({
  src: [
    {
      path: './fonts/manrope/Manrope-ExtraLight.otf',
      weight: '200',
      style: 'normal',
    },
    {
      path: './fonts/manrope/Manrope-Light.otf',
      weight: '300',
      style: 'normal',
    },
    {
      path: './fonts/manrope/Manrope-Regular.otf',
      weight: '400',
      style: 'normal',
    },
    {
      path: './fonts/manrope/Manrope-Medium.otf',
      weight: '500',
      style: 'normal',
    },
    {
      path: './fonts/manrope/Manrope-SemiBold.otf',
      weight: '600',
      style: 'normal',
    },
    {
      path: './fonts/manrope/Manrope-Bold.otf',
      weight: '700',
      style: 'normal',
    },
    {
      path: './fonts/manrope/Manrope-ExtraBold.otf',
      weight: '800',
      style: 'normal',
    },
  ],
  variable: '--font-manrope',
  display: 'swap',
});

// Required for og:image/twitter:image URLs to resolve as absolute — without
// it Next.js falls back to inferring the host (localhost in dev, or
// Vercel's internal *.vercel.app deployment URL in production), so
// LinkedIn's/other crawlers' preview fetch either hits the wrong domain
// or fails outright.
const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: 'Interactuar',
  description: 'Plataforma de credenciales verificables para emprendedores',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={`${manrope.variable} font-sans antialiased`}>
        <NextIntlClientProvider messages={messages}>
          <Providers>{children}</Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
