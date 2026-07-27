'use client';

import { Linkedin } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function LinkedInShareButton({ url }: { url: string }) {
  const shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;

  return (
    <Button
      className="w-full"
      variant="outline"
      render={<a href={shareUrl} target="_blank" rel="noopener noreferrer" />}
    >
      <Linkedin className="mr-1.5 h-4 w-4" />
      Compartir en LinkedIn
    </Button>
  );
}
