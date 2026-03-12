import { getRequestConfig } from 'next-intl/server';
import { cookies } from 'next/headers';
import { defaultLocale, type Locale, locales } from './config';

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const raw = cookieStore.get('NEXT_LOCALE')?.value;
  const locale: Locale = locales.includes(raw as Locale)
    ? (raw as Locale)
    : defaultLocale;

  const messages = {
    common: (await import(`../../messages/${locale}/common.json`)).default,
    login: (await import(`../../messages/${locale}/login.json`)).default,
    dashboard: (await import(`../../messages/${locale}/dashboard.json`))
      .default,
    entrepreneurs: (await import(`../../messages/${locale}/entrepreneurs.json`))
      .default,
    credentials: (await import(`../../messages/${locale}/credentials.json`))
      .default,
    forms: (await import(`../../messages/${locale}/forms.json`)).default,
    verification: (await import(`../../messages/${locale}/verification.json`))
      .default,
    errors: (await import(`../../messages/${locale}/errors.json`)).default,
  };

  return { locale, messages };
});
