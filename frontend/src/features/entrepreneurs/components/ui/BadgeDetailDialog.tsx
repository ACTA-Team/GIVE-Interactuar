'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Shield, CheckCircle, Eye, Download, Copy } from 'lucide-react';
import type { BadgeData } from '../../types/stages';
import { BADGE_ICONS_LARGE, getBadgeColors } from '../../constants/badge-ui';

interface BadgeDetailDialogProps {
  badge: BadgeData;
  entrepreneurName: string;
  children: React.ReactNode;
}

export function BadgeDetailDialog({
  badge,
  entrepreneurName,
  children,
}: BadgeDetailDialogProps) {
  const [copiedHash, setCopiedHash] = useState(false);
  const colors = getBadgeColors(badge.id);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  return (
    <Dialog>
      <DialogTrigger render={<button type="button" />}>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-4">
            <div
              className={`h-16 w-16 rounded-2xl bg-gradient-to-br ${colors.bg} border ${colors.border} flex items-center justify-center shadow-lg ${colors.glow}`}
            >
              {BADGE_ICONS_LARGE[badge.id]}
            </div>
            <div>
              <DialogTitle>{badge.name}</DialogTitle>
              <DialogDescription>{badge.description}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="p-4 rounded-xl bg-muted/50 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Emisor</span>
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" />
                <span className="font-medium text-sm">Interactuar</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Fecha de emisión
              </span>
              <span className="font-medium text-sm">
                {badge.earnedAt &&
                  new Date(badge.earnedAt).toLocaleDateString('es-CO', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Estado</span>
              <Badge variant="success" className="gap-1">
                <CheckCircle className="h-3 w-3" />
                Verificado
              </Badge>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Dirección de transacción
            </label>
            <div className="flex items-center gap-2">
              <div className="flex-1 p-3 rounded-lg bg-muted font-mono text-xs break-all">
                {badge.credentialHash || '0x7f8a...3e4b'}
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={() => copyToClipboard(badge.credentialHash || '')}
              >
                {copiedHash ? (
                  <CheckCircle className="h-4 w-4 text-emerald-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          <div className="p-5 rounded-xl border-2 border-dashed bg-gradient-to-br from-primary/5 to-accent/5 flex flex-col items-center justify-center text-center">
            <div
              className={`h-16 w-16 rounded-2xl bg-gradient-to-br ${colors.bg} border ${colors.border} flex items-center justify-center shadow-xl mb-2`}
            >
              {BADGE_ICONS_LARGE[badge.id]}
            </div>
            <p className="font-bold">{badge.name}</p>
            <p className="text-sm text-muted-foreground">
              Otorgado a {entrepreneurName}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {badge.earnedAt &&
                new Date(badge.earnedAt).toLocaleDateString('es-CO')}
            </p>
          </div>
        </div>

        <DialogFooter className="flex-row gap-2 sm:gap-2">
          <Button variant="outline" className="flex-1 gap-2">
            <Eye className="h-4 w-4" />
            Ver en blockchain
          </Button>
          <Button className="flex-1 gap-2">
            <Download className="h-4 w-4" />
            Descargar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
