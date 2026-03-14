'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
  Loader2,
  AlertTriangle,
  Fingerprint,
  Vault,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { createClient } from '@/lib/supabase/client';
import { useSmartWallet } from '@/hooks/useSmartWallet';
import { useVaultSetup } from '@/features/vault/hooks/useVaultSetup';

type Phase = 'wallet' | 'vault_create' | 'vault_authorize' | 'saving';

const STEP_KEYS = ['wallet', 'vault_create', 'vault_authorize'] as const;
const STEP_LABEL_KEYS = [
  'steps.wallet',
  'steps.vault',
  'steps.permissions',
] as const;

export default function SetupWalletPage() {
  const t = useTranslations('setupWallet');
  const router = useRouter();
  const searchParams = useSearchParams();
  const isReconnect = searchParams.get('reconnect') === '1';
  const needsVaultSetup = searchParams.get('setup_vault') === '1';

  const supabase = createClient();
  const {
    createWallet,
    connect,
    disconnect,
    isCreating,
    isConnecting,
    error: walletError,
  } = useSmartWallet();
  const {
    handleCreateVault,
    handleAuthorizeIssuer,
    status: vaultStatus,
    error: vaultError,
  } = useVaultSetup();

  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>('wallet');
  const [walletContractId, setWalletContractId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.replace('/');
        return;
      }
      setUserEmail(data.user.email ?? null);
    });
  }, [router, supabase]);

  const saveWalletAndRedirect = useCallback(
    async (contractId: string, vaultDone: boolean) => {
      setPhase('saving');
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) throw new Error(t('errors.noSession'));

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const sb = supabase as any;

        if (isReconnect || needsVaultSetup) {
          // Row already exists — update vault flag
          await sb
            .from('user_wallets')
            .update({ vault_initialized: vaultDone })
            .eq('user_id', user.id);
        } else {
          const { error: dbError } = await sb.from('user_wallets').insert({
            user_id: user.id,
            stellar_address: contractId,
            passkey_name: user.email ?? user.id,
            vault_initialized: vaultDone,
          });
          if (dbError && dbError.code !== '23505') throw dbError;
        }

        router.replace('/dashboard');
      } catch (err) {
        setError(err instanceof Error ? err.message : t('errors.saveFailed'));
        setPhase('wallet');
      }
    },
    [supabase, router, isReconnect, needsVaultSetup, t],
  );

  const runVaultSetup = useCallback(
    async (contractId: string) => {
      setError(null);

      // Step 2: create vault
      setPhase('vault_create');
      const vaultTx = await handleCreateVault(contractId);
      if (vaultTx === null) {
        // "already exists" → continue; real errors → abort
        if (vaultStatus === 'error' && !isAlreadyDone(vaultError)) {
          setError(vaultError ?? t('errors.vaultFailed'));
          setPhase('wallet');
          return;
        }
      }

      // Step 3: authorize as issuer
      setPhase('vault_authorize');
      const authTx = await handleAuthorizeIssuer(contractId);
      if (authTx === null) {
        if (vaultStatus === 'error' && !isAlreadyDone(vaultError)) {
          setError(vaultError ?? t('errors.authFailed'));
          setPhase('wallet');
          return;
        }
      }

      await saveWalletAndRedirect(contractId, true);
    },
    [
      handleCreateVault,
      handleAuthorizeIssuer,
      vaultStatus,
      vaultError,
      saveWalletAndRedirect,
      t,
    ],
  );

  const handleCreate = async () => {
    setError(null);
    try {
      const result = await createWallet(userEmail ?? 'user');
      if (result?.contractId) {
        setWalletContractId(result.contractId);
        await runVaultSetup(result.contractId);
      }
    } catch (err) {
      const e = err as Error;
      setError(
        e.name === 'NotAllowedError'
          ? t('errors.createCancelled')
          : (e.message ?? t('errors.createFailed')),
      );
    }
  };

  const _handleConnect = async () => {
    setError(null);
    try {
      if (isReconnect) await disconnect();
      const result = await connect();
      if (!result?.contractId) return;

      setWalletContractId(result.contractId);

      if (isReconnect && !needsVaultSetup) {
        router.replace('/dashboard');
        return;
      }

      await runVaultSetup(result.contractId);
    } catch (err) {
      const e = err as Error;
      setError(
        e.name === 'NotAllowedError'
          ? t('errors.connectCancelled')
          : (e.message ?? t('errors.connectFailed')),
      );
    }
  };

  const handleRetry = () => {
    if (!walletContractId) return;
    runVaultSetup(walletContractId);
  };

  const isBusy =
    isCreating ||
    isConnecting ||
    phase === 'vault_create' ||
    phase === 'vault_authorize' ||
    phase === 'saving';

  const displayError = error ?? walletError ?? vaultError;
  const showVaultProgress = phase !== 'wallet';
  const currentStepIdx =
    phase === 'vault_create'
      ? 1
      : phase === 'vault_authorize'
        ? 2
        : phase === 'saving'
          ? 3
          : 0;

  return (
    <div className="flex min-h-svh w-full items-center justify-center bg-background p-6 md:p-10 max-sm:p-4">
      <div className="w-full max-w-md min-w-0">
        <div className="flex flex-col gap-8">
          {/* Header */}
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary">
              {showVaultProgress ? (
                <Vault className="h-8 w-8 text-primary-foreground" />
              ) : (
                <Fingerprint className="h-8 w-8 text-primary-foreground" />
              )}
            </div>
            <h1 className="text-2xl font-bold text-foreground">
              {showVaultProgress
                ? t('titleConfiguring')
                : isReconnect
                  ? t('titleReconnect')
                  : t('titleSetup')}
            </h1>
            <p className="text-sm text-muted-foreground">
              {showVaultProgress
                ? t('descConfiguring')
                : isReconnect
                  ? t('descReconnect')
                  : t('descNew')}
            </p>
          </div>

          {/* Progress Steps */}
          {showVaultProgress && (
            <div className="flex flex-wrap items-center justify-center gap-2 max-sm:gap-1.5">
              {STEP_KEYS.map((stepKey, idx) => {
                const done = idx < currentStepIdx;
                const active = idx === currentStepIdx - 1 && phase !== 'saving';
                return (
                  <div key={stepKey} className="flex items-center gap-2">
                    {idx > 0 && (
                      <div
                        className={`h-px w-6 ${done ? 'bg-primary' : 'bg-border'}`}
                      />
                    )}
                    <div className="flex items-center gap-1.5">
                      <div
                        className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium ${
                          done
                            ? 'bg-primary text-primary-foreground'
                            : active
                              ? 'bg-primary/20 text-primary ring-2 ring-primary'
                              : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {done ? (
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        ) : (
                          idx + 1
                        )}
                      </div>
                      <span
                        className={`text-xs ${active ? 'font-medium text-foreground' : 'text-muted-foreground'}`}
                      >
                        {t(STEP_LABEL_KEYS[idx])}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <Card className="border-border/50 shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="text-base">
                {userEmail && (
                  <span className="font-normal text-muted-foreground">
                    {t('account')}:{' '}
                  </span>
                )}
                {userEmail}
              </CardTitle>
              <CardDescription>
                {showVaultProgress
                  ? t('descCardConfiguring')
                  : isReconnect
                    ? t('descCardReconnect')
                    : t('descCardNew')}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {displayError && (
                <div className="flex items-start gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{displayError}</span>
                </div>
              )}

              {/* Vault setup in-progress state */}
              {showVaultProgress && isBusy && (
                <div className="flex items-center gap-3 rounded-md bg-muted p-4">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {phase === 'vault_create' && t('creatingVault')}
                      {phase === 'vault_authorize' &&
                        t('configuringPermissions')}
                      {phase === 'saving' && t('saving')}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {phase !== 'saving' && t('signPrompt')}
                    </p>
                  </div>
                </div>
              )}

              {/* Retry button when vault setup fails */}
              {displayError && walletContractId && phase === 'wallet' && (
                <Button
                  className="w-full h-11 gap-2"
                  onClick={handleRetry}
                  disabled={isBusy}
                >
                  <Vault className="h-4 w-4" />
                  {t('retrySetup')}
                </Button>
              )}

              {/* Wallet creation / connection buttons (initial phase only) */}
              {phase === 'wallet' && !walletContractId && (
                <>
                  {!isReconnect && (
                    <>
                      <Button
                        className="w-full h-11 gap-2"
                        disabled={isBusy}
                        onClick={handleCreate}
                      >
                        {isCreating ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            {t('creatingWallet')}
                          </>
                        ) : (
                          <>
                            <Fingerprint className="h-4 w-4" />
                            {t('createNewWallet')}
                          </>
                        )}
                      </Button>
                    </>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          <p className="text-center text-xs text-muted-foreground">
            {t('copyright', {
              year: new Date().getFullYear(),
            })}
          </p>
        </div>
      </div>
    </div>
  );
}

function isAlreadyDone(err: string | null): boolean {
  if (!err) return false;
  return (
    err.includes('ya existe') ||
    err.includes('already exists') ||
    err.includes('already initialized') ||
    err.includes('ya esta autorizado') ||
    err.includes('already authorized')
  );
}
