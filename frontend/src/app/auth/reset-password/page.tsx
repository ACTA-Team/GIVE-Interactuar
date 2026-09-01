'use client';

import { useEffect, useState, type FormEvent } from 'react';
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
import { Loader2, AlertTriangle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import Image from 'next/image';

// Reached only via the password-recovery email link, which /auth/callback
// exchanges for a temporary session before landing here (see its `next`
// param). Without that session, updateUser({ password }) below has
// nothing to act on — checked on mount so a direct visit to this URL (no
// recovery in progress) shows a clear error instead of a silent failure.
export default function ResetPasswordPage() {
  const t = useTranslations('login');
  const tc = useTranslations('common');
  const router = useRouter();

  const [checkingSession, setCheckingSession] = useState(true);
  const [hasSession, setHasSession] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data }) => {
      setHasSession(!!data.session);
      setCheckingSession(false);
    });
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

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
    const { error: authError } = await supabase.auth.updateUser({
      password,
    });
    setIsLoading(false);

    if (authError) {
      setError(t('resetPasswordError'));
      return;
    }

    router.push('/dashboard/certificados');
    router.refresh();
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
                {t('resetPasswordTitle')}
              </CardTitle>
              <CardDescription>
                {t('resetPasswordDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {checkingSession ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : !hasSession ? (
                <div className="flex flex-col gap-4">
                  <div className="flex items-start gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>{t('resetPasswordLinkExpired')}</span>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-11"
                    onClick={() => router.push('/')}
                  >
                    {t('backToLogin')}
                  </Button>
                </div>
              ) : (
                <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                  {error && (
                    <div className="flex items-start gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="password">
                      {t('newPasswordLabel')}
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      autoComplete="new-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>

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
                    ) : (
                      t('submitResetPassword')
                    )}
                  </Button>
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
