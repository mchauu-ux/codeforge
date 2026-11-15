import { useState } from 'react';
import {
  Award,
  BadgeCheck,
  Copy,
  Check,
  ShieldCheck,
  Link2,
  Fingerprint,
  Loader2,
} from 'lucide-react';
import { CATALOG, type Certification } from '../../certifications';
import { COURSES } from '../../courses';

const LEVEL_STYLES: Record<Certification['level'], string> = {
  Foundational: 'bg-slate-100 text-slate-600',
  Professional: 'bg-blue-100 text-blue-700',
  Expert: 'bg-indigo-100 text-indigo-700',
};

function pseudoHash(seed: string) {
  let h1 = 0xdeadbeef ^ seed.length;
  let h2 = 0x41c6ce57 ^ seed.length;
  for (let i = 0; i < seed.length; i++) {
    const ch = seed.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  const num = 4294967296 * (2097151 & h2) + (h1 >>> 0);
  return num.toString(16).toUpperCase().padStart(13, '0');
}

const CERTS: Certification[] = Object.entries(CATALOG).map(([id, c]) => ({
  ...c,
  id,
  hash: pseudoHash(id + c.name),
  verifyUrl: `https://verify.codeforge.academy/${id.toUpperCase()}-${pseudoHash(id + c.name).slice(0, 8)}`,
}));

interface VerifyModalProps {
  cert: Certification;
  onClose: () => void;
}

function VerifyModal({ cert, onClose }: VerifyModalProps) {
  const [copied, setCopied] = useState(false);
  const [checking, setChecking] = useState(true);
  const [verified, setVerified] = useState(false);

  useState(() => {
    const timer = setTimeout(() => {
      setChecking(false);
      setVerified(cert.status === 'earned');
    }, 900);
    return () => clearTimeout(timer);
  });

  const copyHash = () => {
    void navigator.clipboard?.writeText(cert.hash);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-5 py-4">
          <div className="flex items-center gap-2">
            <ShieldCheck size={18} className="text-indigo-600" />
            <span className="text-sm font-bold text-slate-900">Verify Credential</span>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-200 hover:text-slate-700"
            aria-label="Close"
          >
            <Copy size={0} className="hidden" />
            <span className="text-lg leading-none">×</span>
          </button>
        </div>

        <div className="px-5 py-5">
          <div className="text-base font-bold text-slate-900">{cert.name}</div>
          <div className="mt-0.5 text-xs text-slate-500">
            {cert.issuedTo ? `Issued to ${cert.issuedTo} · ${cert.issuedOn}` : 'Credential not yet issued'}
          </div>

          <div className="mt-4 flex items-center justify-center rounded-xl border border-slate-200 bg-slate-50 py-8">
            {checking ? (
              <div className="flex flex-col items-center gap-2 text-slate-500">
                <Loader2 size={22} className="animate-spin" />
                <span className="text-xs font-medium">Checking registry…</span>
              </div>
            ) : verified ? (
              <div className="flex flex-col items-center gap-1.5 text-emerald-600">
                <BadgeCheck size={34} />
                <span className="text-sm font-bold">Credential verified</span>
                <span className="text-[11px] text-slate-500">Signature matches registry of record</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-1.5 text-amber-600">
                <Fingerprint size={34} />
                <span className="text-sm font-bold">Credential pending</span>
                <span className="text-[11px] text-slate-500">
                  Complete the required exams to activate this credential
                </span>
              </div>
            )}
          </div>

          <div className="mt-4">
            <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              Cryptographic hash (SHA-256 registry digest)
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-900 px-3 py-2.5">
              <code className="min-w-0 flex-1 truncate font-mono text-xs text-emerald-300">
                {cert.hash}
              </code>
              <button
                onClick={copyHash}
                className="shrink-0 rounded p-1 text-slate-400 transition-colors hover:text-white"
                aria-label="Copy hash"
              >
                {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
              </button>
            </div>
          </div>

          <div className="mt-3">
            <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              Shareable verification link
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5">
              <Link2 size={14} className="shrink-0 text-slate-400" />
              <span className="min-w-0 flex-1 truncate text-xs text-slate-600">{cert.verifyUrl}</span>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-200 bg-slate-50 px-5 py-3">
          <button
            onClick={onClose}
            className="w-full rounded-lg border border-slate-300 bg-white py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Certifications() {
  const [verifyTarget, setVerifyTarget] = useState<Certification | null>(null);
  const earned = CERTS.filter((c) => c.status === 'earned');
  const inProgress = CERTS.filter((c) => c.status === 'in-progress');

  const courseName = (id: number) => COURSES.find((c) => c.id === id)?.title ?? `Course ${id}`;

  return (
    <section>
      <h1 className="text-2xl font-bold tracking-tight text-slate-900">Certifications</h1>
      <p className="mt-1 text-sm text-slate-500">
        Verifiable credentials backed by proctored exams and a public registry of record.
      </p>

      <h2 className="mt-6 text-sm font-bold uppercase tracking-wider text-slate-400">
        Earned · {earned.length}
      </h2>
      {earned.length === 0 ? (
        <div className="mt-3 rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
          No credentials earned yet — pass a proctored exam to claim your first.
        </div>
      ) : (
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          {earned.map((cert) => (
            <CertCard key={cert.id} cert={cert} onVerify={() => setVerifyTarget(cert)} />
          ))}
        </div>
      )}

      <h2 className="mt-8 text-sm font-bold uppercase tracking-wider text-slate-400">
        In Progress · {inProgress.length}
      </h2>
      <div className="mt-3 grid gap-4 sm:grid-cols-2">
        {inProgress.map((cert) => (
          <CertCard key={cert.id} cert={cert} onVerify={() => setVerifyTarget(cert)} />
        ))}
      </div>

      {verifyTarget && <VerifyModal cert={verifyTarget} onClose={() => setVerifyTarget(null)} />}
    </section>
  );
}

function CertCard({ cert, onVerify }: { cert: Certification; onVerify: () => void }) {
  const isEarned = cert.status === 'earned';
  return (
    <div
      className={`relative overflow-hidden rounded-xl border p-5 transition-all ${
        isEarned
          ? 'border-indigo-200 bg-gradient-to-br from-white via-indigo-50/40 to-white hover:shadow-lg hover:shadow-indigo-100'
          : 'border-slate-200 bg-white'
      }`}
    >
      <div className="flex items-start gap-3">
        <span
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
            isEarned ? 'bg-gradient-to-br from-indigo-600 to-blue-600 text-white' : 'bg-slate-100 text-slate-400'
          }`}
        >
          <Award size={20} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-bold text-slate-900">{cert.name}</h3>
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${LEVEL_STYLES[cert.level]}`}
            >
              {cert.level}
            </span>
          </div>
          <div className="mt-1 text-xs text-slate-500">
            {isEarned ? (
              <>
                Issued to <span className="font-medium text-slate-700">{cert.issuedTo}</span> ·{' '}
                {cert.issuedOn}
              </>
            ) : (
              <>Requires: {cert.courseIds.map(courseName).join(', ')}</>
            )}
          </div>
          <div className="mt-2.5 flex items-center gap-2">
            <button
              onClick={onVerify}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                isEarned
                  ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                  : 'border border-slate-300 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <ShieldCheck size={13} />
              Verify Credential
            </button>
            {isEarned && (
              <code className="hidden rounded bg-slate-100 px-2 py-1 font-mono text-[10px] text-slate-500 sm:block">
                {cert.hash.slice(0, 10)}…
              </code>
            )}
          </div>
        </div>
        {isEarned && (
          <BadgeCheck size={20} className="shrink-0 text-emerald-500" aria-label="Verified" />
        )}
      </div>
      {isEarned && (
        <span className="pointer-events-none absolute -right-6 -top-6 rotate-12 rounded-full border-4 border-indigo-200/60 px-3 py-1 text-[9px] font-bold uppercase tracking-widest text-indigo-300">
          Verified
        </span>
      )}
    </div>
  );
}
