'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Wallet, Loader2, AlertTriangle } from 'lucide-react';
import { useWalletKit } from '@/lib/stellar/useWalletKit';

export default function LoginPage() {
  const t = useTranslations('login');
  const tc = useTranslations('common');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const { connectWithWalletKit } = useWalletKit();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    await new Promise((resolve) => setTimeout(resolve, 1000));

    if (email && password.length >= 6) {
      window.location.href = '/dashboard';
    } else {
      setError(t('invalidCredentials'));
    }

    setIsLoading(false);
  };

  const handleWalletLogin = async () => {
    setError(null);
    setIsConnecting(true);
    try {
      await connectWithWalletKit();
      window.location.href = '/dashboard';
    } catch (err) {
      setError(err instanceof Error ? err.message : t('walletError'));
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="flex min-h-svh w-full items-center justify-center bg-background p-6 md:p-10">
      <div className="w-full max-w-md">
        <div className="flex flex-col gap-8">
          {/* Logo and Brand */}
          <div className="flex flex-col items-center gap-2">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="h-8 w-8 text-primary-foreground"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-foreground">{t('brand')}</h1>
            <p className="text-sm text-muted-foreground">{t('subtitle')}</p>
          </div>

          <Card className="border-border/50 shadow-lg">
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-xl">{t('title')}</CardTitle>
              <CardDescription>{t('description')}</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin}>
                <div className="flex flex-col gap-5">
                  <div className="grid gap-2">
                    <Label htmlFor="email">{t('email')}</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder={t('emailPlaceholder')}
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-11"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="password">{t('password')}</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder={t('passwordPlaceholder')}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-11"
                    />
                  </div>

                  {error && (
                    <div className="flex items-start gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full h-11 mt-2 bg-accent hover:bg-accent/90 text-accent-foreground"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t('submitting')}
                      </>
                    ) : (
                      t('submit')
                    )}
                  </Button>

                  <div className="relative my-2">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-card px-2 text-muted-foreground">
                        {t('orContinueWith')}
                      </span>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-11 gap-2"
                    disabled={isConnecting}
                    onClick={handleWalletLogin}
                  >
                    {isConnecting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {tc('wallet.connecting')}
                      </>
                    ) : (
                      <>
                        <Wallet className="h-4 w-4" />
                        {tc('wallet.connectStellar')}
                      </>
                    )}
                  </Button>
                </div>
              </form>

              <p className="mt-6 text-center text-xs text-muted-foreground">
                {tc.rich('wallet.needFreighter', {
                  link: (chunks) => (
                    <a
                      href="https://freighter.app"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline hover:text-foreground"
                    >
                      {chunks}
                    </a>
                  ),
                })}
              </p>
            </CardContent>
          </Card>

          <p className="text-center text-xs text-muted-foreground">
            {tc('footer.copyright')}
          </p>
        </div>
      </div>
    </div>
  );
}
