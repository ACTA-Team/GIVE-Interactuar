import Link from 'next/link';
import { useTranslations } from 'next-intl';

export default function NotFound() {
  const t = useTranslations('errors');

  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center px-6"
      style={{ backgroundColor: '#ffffff' }}
    >
      {/* 404 number */}
      <p
        className="text-[10rem] sm:text-[14rem] font-extrabold leading-none select-none"
        style={{
          color: '#000000',
          fontFamily: 'var(--font-display)',
          letterSpacing: '-0.04em',
        }}
      >
        404
      </p>

      {/* Divider */}
      <div
        className="w-16 h-px my-6"
        style={{ backgroundColor: '#000000', opacity: 0.4 }}
      />

      {/* Headline */}
      <h1
        className="text-2xl sm:text-3xl font-bold text-white text-center"
        style={{ fontFamily: 'var(--font-display)' }}
      >
        {t('notFound.title')}
      </h1>

      {/* Description */}
      <p
        className="mt-3 text-base text-center max-w-sm"
        style={{ color: '#000000' }}
      >
        {t('notFound.description')}
      </p>

      {/* CTA */}
      <Link
        href="/dashboard"
        className="mt-10 inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-white transition-opacity hover:opacity-85 active:opacity-70"
        style={{
          backgroundColor: '#000000',
          fontFamily: 'var(--font-display)',
        }}
      >
        {t('notFound.backToDashboard')}
      </Link>
    </main>
  );
}
