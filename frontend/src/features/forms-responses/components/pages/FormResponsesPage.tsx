'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/Button';
import { useTranslations as useFormsTranslations } from 'next-intl';
import { createClient } from '@/lib/supabase/client';

type FormSubmissionRow = {
  id: string;
  form_source_id: string;
  external_response_id: string;
  submitted_at: string | null;
  responder_email: string | null;
  raw_answers: Record<string, unknown> | null;
};

function baseParsed(dateString: string) {
  const d = new Date(dateString);
  const day = String(d.getDate()).padStart(2, '0');
  const monthIdx = d.getMonth();
  const year = d.getFullYear();
  const hours24 = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, '0');

  const monthsShort = [
    'ene',
    'feb',
    'mar',
    'abr',
    'may',
    'jun',
    'jul',
    'ago',
    'sep',
    'oct',
    'nov',
    'dic',
  ] as const;

  const month = monthsShort[monthIdx] ?? '';

  const suffix = hours24 >= 12 ? 'p.m.' : 'a.m.';
  let hours12 = hours24 % 12;
  if (hours12 === 0) hours12 = 12;

  const hours = String(hours12).padStart(2, '0');

  return { day, month, year, hours, minutes, suffix };
}

function formatDate(dateString: string) {
  const { day, month, year } = baseParsed(dateString);
  return `${day} ${month} ${year}`;
}

function formatTime(dateString: string) {
  const { hours, minutes, suffix } = baseParsed(dateString);
  return `${hours}:${minutes} ${suffix}`;
}

function formatFull(dateString: string) {
  const { day, month, year, hours, minutes, suffix } = baseParsed(dateString);
  return `${day} ${month} ${year} - ${hours}:${minutes} ${suffix}`;
}

export function FormResponsesPage() {
  const t = useTranslations('dashboard.forms');
  const tf = useFormsTranslations('forms.forms');
  const [rows, setRows] = useState<FormSubmissionRow[]>([]);
  const [selected, setSelected] = useState<FormSubmissionRow | null>(null);

  useEffect(() => {
    const supabase = createClient();

    void (async () => {
      const { data, error } = await (supabase as any)
        .from('form_submissions_raw')
        .select(
          'id, form_source_id, external_response_id, submitted_at, responder_email, raw_answers',
        )
        .order('submitted_at', { ascending: false })
        .limit(100);

      if (!error && data) {
        setRows(data as FormSubmissionRow[]);
      } else {
        // eslint-disable-next-line no-console
        console.error('[FormResponsesPage] Failed to load submissions', error);
      }
    })();
  }, []);

  const getPrimaryAnswer = (row: FormSubmissionRow): string | null => {
    const answers = row.raw_answers as
      | Record<
          string,
          { textAnswers?: { answers: Array<{ value: string }> } } | unknown
        >
      | null;

    if (!answers) return null;

    for (const value of Object.values(answers)) {
      if (
        value &&
        typeof value === 'object' &&
        'textAnswers' in value &&
        (value as any).textAnswers?.answers?.[0]?.value
      ) {
        return String((value as any).textAnswers.answers[0].value);
      }
    }

    return null;
  };

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">{t('title')}</h1>
          <p className="mt-1 text-sm text-gray-500">{t('subtitle')}</p>
        </div>
      </header>

      <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
          <div className="flex flex-col gap-0.5">
            <h2 className="text-sm font-semibold text-gray-800">
              {t('latest')}
            </h2>
            <p className="text-xs text-gray-500">
              {t('count', { count: rows.length })}
            </p>
          </div>
        </div>

        <div className="px-4 py-3">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('columns.arrivalAt')}</TableHead>
                <TableHead>{t('columns.name')}</TableHead>
                <TableHead>{t('columns.email')}</TableHead>
                <TableHead>{t('columns.status')}</TableHead>
                <TableHead>{t('columns.source')}</TableHead>
                <TableHead className="text-right">
                  {t('columns.actions')}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((response) => (
                <TableRow key={response.id}>
                  <TableCell>
                    <span className="block text-xs text-gray-500">
                      {response.submitted_at
                        ? formatDate(response.submitted_at)
                        : '—'}
                    </span>
                    <span className="text-sm font-medium text-gray-800">
                      {response.submitted_at
                        ? formatTime(response.submitted_at)
                        : '—'}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-gray-900">
                    {getPrimaryAnswer(response) ?? '—'}
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">
                    {response.responder_email ?? '—'}
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                      {t('status.unknown')}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {tf('googleForms')}
                  </TableCell>
                  <TableCell className="text-right">
                    <Dialog open={selected?.id === response.id}>
                      <Button
                        size="xs"
                        variant="outline"
                        onClick={() => setSelected(response)}
                      >
                        {t('actions.view')}
                      </Button>
                      <DialogContent className="max-w-lg" showCloseButton>
                        <DialogHeader>
                          <DialogTitle>{t('detail.title')}</DialogTitle>
                          <DialogDescription>
                            {t('detail.description')}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 text-sm">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                                {t('detail.fields.name')}
                              </p>
                              <p className="mt-0.5 text-gray-900">
                                {getPrimaryAnswer(response) ?? '—'}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                                {t('detail.fields.email')}
                              </p>
                              <p className="mt-0.5 text-gray-900">
                                {response.responder_email ?? '—'}
                              </p>
                            </div>
                            {/* Phone is not currently stored separately; slot kept for future mapping */}
                            <div>
                              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                                {t('detail.fields.arrivalAt')}
                              </p>
                              <p className="mt-0.5 text-gray-900">
                                {response.submitted_at
                                  ? formatFull(response.submitted_at)
                                  : '—'}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                                {t('detail.fields.status')}
                              </p>
                              <p className="mt-0.5">
                                <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                                  {response.estado ?? 'Sin estado'}
                                </span>
                              </p>
                            </div>
                            <div>
                              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                                {t('detail.fields.source')}
                              </p>
                              <p className="mt-0.5 text-gray-900">
                                {tf('googleForms')}
                              </p>
                            </div>
                          </div>

                          <div className="border-t border-gray-100 pt-4">
                            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-500">
                              {t('detail.fields.payload')}
                            </p>
                            <div className="space-y-2 rounded-lg bg-gray-50 p-3">
                              {response.raw_answers
                                ? Object.entries(response.raw_answers).map(
                                    ([key, value]) => (
                                      <div
                                        key={key}
                                        className="flex items-start justify-between gap-4"
                                      >
                                        <span className="text-xs font-medium text-gray-500">
                                          {key}
                                        </span>
                                        <span className="flex-1 text-right text-xs text-gray-900 break-all">
                                          {JSON.stringify(value)}
                                        </span>
                                      </div>
                                    ),
                                  )
                                : null}
                            </div>
                          </div>
                        </div>
                        <DialogFooter>
                          <DialogClose>
                            <Button
                              type="button"
                              variant="outline"
                              className="w-full sm:w-auto"
                              onClick={() => setSelected(null)}
                            >
                              {t('actions.close')}
                            </Button>
                          </DialogClose>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>
    </div>
  );
}
