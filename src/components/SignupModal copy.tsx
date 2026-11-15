import { useEffect, useState } from 'react';
import { X, Users, Clock3, Sparkles, CheckCircle2 } from 'lucide-react';

interface SignupModalProps {
  open: boolean;
  onClose: () => void;
}

const COHORT_SIZE = 250;

export default function SignupModal({ open, onClose }: SignupModalProps) {
  const [step, setStep] = useState<'form' | 'done'>('form');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [track, setTrack] = useState('Full-Stack TypeScript');
  const [position, setPosition] = useState(0);

  useEffect(() => {
    if (open) {
      setStep('form');
      setName('');
      setEmail('');
      setTrack('Full-Stack TypeScript');
      setPosition(0);
    }
  }, [open]);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const deterministic = 147 + ((name.trim() + email.trim()).length * 37) % 90;
    setPosition(deterministic);
    setStep('done');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Apply to CodeForge</h2>
            <p className="mt-1 text-sm text-slate-500">
              Enrollment is limited. Reserve your seat in the next cohort.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {step === 'form' ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="signup-name" className="mb-1.5 block text-sm font-medium text-slate-700">
                Full name
              </label>
              <input
                id="signup-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ada Lovelace"
                required
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div>
              <label htmlFor="signup-email" className="mb-1.5 block text-sm font-medium text-slate-700">
                Email
              </label>
              <input
                id="signup-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div>
              <label htmlFor="signup-track" className="mb-1.5 block text-sm font-medium text-slate-700">
                Preferred track
              </label>
              <select
                id="signup-track"
                value={track}
                onChange={(e) => setTrack(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              >
                <option>Full-Stack TypeScript</option>
                <option>Systems Programming in Rust</option>
                <option>Distributed Systems Architecture</option>
                <option>Modern Compiler Design</option>
                <option>Foundations of Computer Science</option>
              </select>
            </div>

            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
            >
              <Sparkles size={16} />
              Join the waitlist
            </button>
          </form>
        ) : (
          <div className="space-y-4 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
              <CheckCircle2 size={28} className="text-green-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">You're on the waitlist</h3>
            <p className="text-sm leading-relaxed text-slate-600">
              Thanks, {name.trim().split(' ')[0] || 'friend'}. Applications for the{' '}
              <span className="font-medium text-slate-900">{track}</span> cohort are reviewed
              in order received.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <div className="flex items-center justify-center gap-1.5 text-xs font-medium text-slate-500">
                  <Users size={13} />
                  Cohort size
                </div>
                <div className="mt-1 text-lg font-bold text-slate-900">{COHORT_SIZE}</div>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <div className="flex items-center justify-center gap-1.5 text-xs font-medium text-slate-500">
                  <Clock3 size={13} />
                  Your position
                </div>
                <div className="mt-1 text-lg font-bold text-slate-900">#{position}</div>
              </div>
            </div>
            <p className="text-xs text-slate-400">
              We'll notify you at <span className="text-slate-600">{email.trim()}</span> when
              your seat opens. No account has been created yet — you'll receive an
              enrollment link by email.
            </p>
            <button
              onClick={onClose}
              className="w-full rounded-lg border border-slate-300 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
