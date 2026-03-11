'use client';

import { useState } from 'react';
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
import { Wallet, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    // TODO: wire Supabase auth here
    await new Promise((resolve) => setTimeout(resolve, 1000));

    if (email && password.length >= 6) {
      window.location.href = '/dashboard';
    } else {
      setError('Credenciales inválidas. Contraseña mínimo 6 caracteres.');
    }

    setIsLoading(false);
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
            <h1 className="text-2xl font-bold text-foreground">Interactuar</h1>
            <p className="text-sm text-muted-foreground">Panel de Asesores</p>
          </div>

          <Card className="border-border/50 shadow-lg">
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-xl">Iniciar Sesión</CardTitle>
              <CardDescription>
                Ingresa tus credenciales para acceder al sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin}>
                <div className="flex flex-col gap-5">
                  <div className="grid gap-2">
                    <Label htmlFor="email">Correo electrónico</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="asesor@interactuar.com"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-11"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="password">Contraseña</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Mínimo 6 caracteres"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-11"
                    />
                  </div>

                  {error && (
                    <p className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                      {error}
                    </p>
                  )}

                  <Button
                    type="submit"
                    className="w-full h-11 mt-2 bg-accent hover:bg-accent/90 text-accent-foreground"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Ingresando...
                      </>
                    ) : (
                      'Ingresar'
                    )}
                  </Button>

                  <div className="relative my-2">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-card px-2 text-muted-foreground">
                        O continúa con
                      </span>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-11 gap-2 opacity-60 cursor-not-allowed"
                    disabled
                  >
                    <Wallet className="h-4 w-4" />
                    Conectar Wallet
                    <span className="ml-auto text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded">
                      Próximamente
                    </span>
                  </Button>
                </div>
              </form>

              <p className="mt-6 text-center text-xs text-muted-foreground">
                Demo: usa cualquier email y contraseña (mín. 6 caracteres)
              </p>
            </CardContent>
          </Card>

          <p className="text-center text-xs text-muted-foreground">
            &copy; 2024 Interactuar. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </div>
  );
}
