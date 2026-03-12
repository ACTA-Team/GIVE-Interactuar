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

export const metadata: Metadata = {
  title: 'GIVE Interactuar',
  description: 'Plataforma de credenciales verificables para emprendedores',
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
