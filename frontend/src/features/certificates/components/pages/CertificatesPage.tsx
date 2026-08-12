'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import type { ParsedCourseUpload } from '@/lib/course-upload';
import { useBatchIssueCourseCredentials } from '@/features/courses/hooks/useBatchIssueCourseCredentials';
import { UploadStep } from '../ui/UploadStep';
import { ReviewStep } from '../ui/ReviewStep';
import { SuccessStep } from '../ui/SuccessStep';
import { StudentsStep } from '../ui/StudentsStep';

type Step = 'upload' | 'review' | 'success' | 'students';

export function CertificatesPage() {
  const t = useTranslations('certificados');
  const [step, setStep] = useState<Step>('upload');
  const [course, setCourse] = useState<ParsedCourseUpload | null>(null);
  const [templateFile, setTemplateFile] = useState<File | null>(null);
  const [issuedCourseName, setIssuedCourseName] = useState('');

  const batch = useBatchIssueCourseCredentials();

  const handleUploaded = (
    parsed: ParsedCourseUpload,
    template: File,
  ) => {
    setCourse(parsed);
    setTemplateFile(template);
    setStep('review');
  };

  const handleIssued = (courseName: string) => {
    setIssuedCourseName(courseName);
    setStep('success');
  };

  const handleClear = () => {
    setCourse(null);
    setTemplateFile(null);
    setIssuedCourseName('');
    batch.reset();
    setStep('upload');
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground max-md:text-xl">
          {t('title')}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">{t('subtitle')}</p>
      </div>

      {step === 'upload' && <UploadStep onUploaded={handleUploaded} />}

      {step === 'review' && course && templateFile && (
        <ReviewStep
          course={course}
          templateFile={templateFile}
          batch={batch}
          onIssued={handleIssued}
          onBack={handleClear}
        />
      )}

      {step === 'success' && (
        <SuccessStep
          batch={batch}
          onViewStudents={() => setStep('students')}
        />
      )}

      {step === 'students' && course && (
        <StudentsStep
          course={course}
          courseName={issuedCourseName}
          batch={batch}
          onClear={handleClear}
        />
      )}
    </div>
  );
}
