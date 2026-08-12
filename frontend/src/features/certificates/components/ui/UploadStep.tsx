'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Upload } from 'lucide-react';
import type { ParsedCourseUpload } from '@/lib/course-upload';
import { parseCourseExcel } from '../../lib/uploadClient';

export function UploadStep({
  onUploaded,
}: {
  onUploaded: (course: ParsedCourseUpload, templateFile: File) => void;
}) {
  const t = useTranslations('certificados');
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [templateFile, setTemplateFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setError(null);

    if (!excelFile) {
      setError(t('upload.missingExcel'));
      return;
    }
    if (!templateFile) {
      setError(t('upload.missingTemplate'));
      return;
    }

    setLoading(true);
    try {
      const course = await parseCourseExcel(excelFile);
      onUploaded(course, templateFile);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('upload.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardContent className="space-y-6 pt-6">
        <div className="grid gap-2">
          <Label htmlFor="excel-file">{t('upload.excelLabel')}</Label>
          <Input
            id="excel-file"
            type="file"
            accept=".xlsx,.csv"
            onChange={(e) => setExcelFile(e.target.files?.[0] ?? null)}
          />
          <p className="text-xs text-muted-foreground">
            {t('upload.excelHint')}
          </p>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="template-file">{t('upload.templateLabel')}</Label>
          <Input
            id="template-file"
            type="file"
            accept=".pdf"
            onChange={(e) => setTemplateFile(e.target.files?.[0] ?? null)}
          />
          <p className="text-xs text-muted-foreground">
            {t('upload.templateHint')}
          </p>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <Button onClick={handleSubmit} disabled={loading}>
          {loading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Upload className="mr-2 h-4 w-4" />
          )}
          {loading ? t('upload.loading') : t('upload.submit')}
        </Button>
      </CardContent>
    </Card>
  );
}
