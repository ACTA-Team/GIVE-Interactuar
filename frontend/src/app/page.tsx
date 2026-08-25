'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Loader2, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import Image from 'next/image';

const AUTH_DISABLED = process.env.NEXT_PUBLIC_DISABLE_AUTH === 'true';
const ALLOWED_DOMAIN = '@interactuar.org.co';

type Mode = 'login' | 'signup';

export default function LoginPage() {
  const t = useTranslations('login');
  const tc = useTranslations('common');
  const router = useRouter();

  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [signupDone, setSignupDone] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const switchMode = (next: Mode) => {
    setMode(next);
    setError(null);
    setSignupDone(false);
    setPassword('');
    setConfirmPassword('');
  };

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(t('loginError'));
      setIsLoading(false);
      return;
    }

    router.push('/dashboard/certificados');
    router.refresh();
  };

  const handleSignup = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.toLowerCase().endsWith(ALLOWED_DOMAIN)) {
      setError(t('domainError', { domain: ALLOWED_DOMAIN }));
      return;
    }
    if (password.length < 8) {
      setError(t('passwordTooShort'));
      return;
    }
    if (password !== confirmPassword) {
      setError(t('passwordMismatch'));
      return;
    }

    setIsLoading(true);
    const supabase = createClient();
    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    setIsLoading(false);

    if (authError) {
      // The domain is also enforced server-side (Postgres trigger on
      // auth.users) — this branch covers that rejection too, since a
      // client-side check alone can't be trusted.
      setError(t('signupError'));
      return;
    }

    setSignupDone(true);
  };

  return (
    <div className="flex min-h-svh w-full items-center justify-center bg-background p-6 md:p-10">
      <div className="w-full max-w-md">
        <div className="flex flex-col gap-8">
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center justify-center -mb-12">
              <Image
                src="/assets/interactuar/interactuar-logo.svg"
                alt="Interactuar"
                width={180}
                height={56}
                className="h-28 w-auto md:h-32 lg:h-40"
              />
            </div>
          </div>

          <Card className="border-border/50 shadow-lg">
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-xl">
                {mode === 'login' ? t('title') : t('signupTitle')}
              </CardTitle>
              <CardDescription>
                {mode === 'login' ? t('description') : t('signupDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {signupDone ? (
                <div className="flex flex-col gap-4">
                  <div className="flex items-start gap-2 rounded-md bg-emerald-500/10 p-3 text-sm text-emerald-700 dark:text-emerald-400">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>{t('signupSuccess')}</span>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-11"
                    onClick={() => switchMode('login')}
                  >
                    {t('backToLogin')}
                  </Button>
                </div>
              ) : (
                <form
                  className="flex flex-col gap-4"
                  onSubmit={mode === 'login' ? handleLogin : handleSignup}
                >
                  {error && (
                    <div className="flex items-start gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="email">{t('emailLabel')}</Label>
                    <Input
                      id="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={`nombre${ALLOWED_DOMAIN}`}
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="password">{t('passwordLabel')}</Label>
                    <Input
                      id="password"
                      type="password"
                      autoComplete={
                        mode === 'login' ? 'current-password' : 'new-password'
                      }
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>

                  {mode === 'signup' && (
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="confirmPassword">
                        {t('confirmPasswordLabel')}
                      </Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        autoComplete="new-password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full h-11"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {t('signingIn')}
                      </>
                    ) : mode === 'login' ? (
                      t('submitLogin')
                    ) : (
                      t('submitSignup')
                    )}
                  </Button>

                  <button
                    type="button"
                    className="text-center text-sm text-muted-foreground hover:text-foreground underline-offset-4 hover:underline"
                    onClick={() =>
                      switchMode(mode === 'login' ? 'signup' : 'login')
                    }
                  >
                    {mode === 'login' ? t('goToSignup') : t('goToLogin')}
                  </button>

                  {AUTH_DISABLED && (
                    <Button
                      type="button"
                      variant="ghost"
                      className="w-full h-11"
                      onClick={() => router.push('/dashboard')}
                    >
                      Continuar sin iniciar sesión (dev)
                    </Button>
                  )}
                </form>
              )}
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
