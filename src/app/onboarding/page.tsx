'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function Onboarding() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [currentRole, setCurrentRole] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [experienceYears, setExperienceYears] = useState(1);
  const [resumeText, setResumeText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const steps = ['currentRole', 'targetRole', 'experience', 'resume'] as const;

  async function submit() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentRole, targetRole, experienceYears, resumeText }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.formErrors?.[0] ?? data.error ?? 'Something went wrong');
      router.push('/dashboard');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="max-w-xl mx-auto px-6 py-20">
      <p className="font-mono text-xs tracking-widest text-brass uppercase mb-2">
        Step {step + 1} of {steps.length}
      </p>
      <div className="h-1 bg-chart-line rounded-full mb-10 overflow-hidden">
        <motion.div
          className="h-full bg-brass"
          animate={{ width: `${((step + 1) / steps.length) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {step === 0 && (
        <Question
          label="What's your current role?"
          value={currentRole}
          onChange={setCurrentRole}
          placeholder="e.g. Junior Frontend Developer"
          onNext={() => setStep(1)}
          disabled={!currentRole.trim()}
        />
      )}

      {step === 1 && (
        <Question
          label="What role are you aiming for?"
          value={targetRole}
          onChange={setTargetRole}
          placeholder="e.g. Senior Full-Stack Engineer"
          onNext={() => setStep(2)}
          onBack={() => setStep(0)}
          disabled={!targetRole.trim()}
        />
      )}

      {step === 2 && (
        <div>
          <h2 className="font-display text-2xl mb-6">How many years of experience do you have?</h2>
          <input
            type="number"
            min={0}
            max={50}
            value={experienceYears}
            onChange={(e) => setExperienceYears(Number(e.target.value))}
            className="w-full bg-chart-panel border border-chart-line rounded-md px-4 py-3 text-ink mb-6"
          />
          <StepNav onBack={() => setStep(1)} onNext={() => setStep(3)} />
        </div>
      )}

      {step === 3 && (
        <div>
          <h2 className="font-display text-2xl mb-2">Paste your resume text</h2>
          <p className="text-ink-dim text-sm mb-6">
            Plain text is fine — we'll pull the skills out for you.
          </p>
          <textarea
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            rows={10}
            placeholder="Paste your experience, projects, and skills here..."
            className="w-full bg-chart-panel border border-chart-line rounded-md px-4 py-3 text-ink mb-4 resize-none"
          />
          {error && <p className="text-sm text-red-400 mb-4">{error}</p>}
          <div className="flex items-center justify-between">
            <button onClick={() => setStep(2)} className="text-ink-dim text-sm hover:text-ink">
              ← Back
            </button>
            <button
              onClick={submit}
              disabled={loading || resumeText.trim().length < 20}
              className="bg-brass text-chart-bg font-medium px-6 py-3 rounded-md disabled:opacity-40 hover:bg-brass-dim transition-colors"
            >
              {loading ? 'Reading your resume…' : 'Analyze my gap'}
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

function Question({
  label,
  value,
  onChange,
  placeholder,
  onNext,
  onBack,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  onNext: () => void;
  onBack?: () => void;
  disabled?: boolean;
}) {
  return (
    <div>
      <h2 className="font-display text-2xl mb-6">{label}</h2>
      <input
        autoFocus
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        onKeyDown={(e) => e.key === 'Enter' && !disabled && onNext()}
        className="w-full bg-chart-panel border border-chart-line rounded-md px-4 py-3 text-ink mb-6"
      />
      <StepNav onBack={onBack} onNext={onNext} disabled={disabled} />
    </div>
  );
}

function StepNav({
  onBack,
  onNext,
  disabled,
}: {
  onBack?: () => void;
  onNext: () => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      {onBack ? (
        <button onClick={onBack} className="text-ink-dim text-sm hover:text-ink">
          ← Back
        </button>
      ) : (
        <span />
      )}
      <button
        onClick={onNext}
        disabled={disabled}
        className="bg-brass text-chart-bg font-medium px-6 py-3 rounded-md disabled:opacity-40 hover:bg-brass-dim transition-colors"
      >
        Next
      </button>
    </div>
  );
}
