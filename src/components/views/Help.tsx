import { Search } from 'lucide-react';
import { useMemo, useState } from 'react';

interface HelpCategory {
  name: string;
  items: { q: string; a: string }[];
}

const HELP_CATEGORIES: HelpCategory[] = [
  {
    name: 'Enrollment & Admissions',
    items: [
      {
        q: 'How do enrollments work?',
        a: 'Apply through the portal. Seats open per cohort and you are notified by email in order of application.',
      },
      {
        q: 'When do new cohorts start?',
        a: 'Cohorts open on the first Monday of every other month. Exact dates are posted on the Catalog page two weeks in advance.',
      },
      {
        q: 'How many paths can I apply to at once?',
        a: 'Up to three paths per cohort. You are admitted to them in the order you ranked during application.',
      },
      {
        q: 'Is there an application fee?',
        a: 'No. Applying to any path, including the advanced tracks, is completely free.',
      },
      {
        q: 'What are the prerequisites for beginner paths?',
        a: 'None. Beginner paths assume zero prior experience and start from first principles.',
      },
      {
        q: 'Do you check my background before admission?',
        a: 'No formal checks. Advanced paths include a short placement quiz after signup so you can confirm the level fits you.',
      },
      {
        q: 'How will I know if I got a seat?',
        a: 'You receive an email with your cohort start date, plus a banner in your Dashboard the next time you sign in.',
      },
      {
        q: 'What if I miss the start of my cohort?',
        a: 'You can defer once, free of charge, to the next cohort of the same path from your Dashboard.',
      },
      {
        q: 'Is there a waitlist when a cohort is full?',
        a: 'Yes. Join the waitlist from the path page and you are notified the moment a seat opens up.',
      },
      {
        q: 'Can I take two paths in parallel?',
        a: 'Yes, though we recommend at most two. The pacing guidance on each path page assumes one path as your main focus.',
      },
    ],
  },
  {
    name: 'Courses & Learning Paths',
    items: [
      {
        q: 'Can I switch tracks mid-cohort?',
        a: 'Yes, during the first two weeks of any cohort, from your account settings.',
      },
      {
        q: 'Are courses self-paced?',
        a: 'Core content is self-paced; cohort critiques and certification exams run on a schedule.',
      },
      {
        q: 'How long do I have access to a course?',
        a: 'You keep lifetime access to the material of every path you have been admitted to, even after finishing it.',
      },
      {
        q: 'Do learning paths include exercises?',
        a: 'Every module ends with graded exercises and at least one larger project that goes into your portfolio.',
      },
      {
        q: 'Are the hour estimates accurate?',
        a: 'They are medians reported by past students. Plan for roughly 20% more if the topic is new to you.',
      },
      {
        q: 'Can I skip modules I already know?',
        a: 'Yes. Each module has a challenge at the start; passing it marks the module complete immediately.',
      },
      {
        q: 'Do paths ever get updated?',
        a: 'The curriculum team revises paths every quarter. Updates appear in your course as a changelog note.',
      },
      {
        q: 'What is the difference between a course and a path?',
        a: 'A course is a single topic. A path is a curated sequence of courses that builds toward one goal.',
      },
      {
        q: 'Is there a mobile app?',
        a: 'The site is fully responsive, so lessons work on any phone or tablet browser. A dedicated app is on the roadmap.',
      },
      {
        q: 'Do courses include video or text?',
        a: 'Both. Concepts are explained in short videos, and every video is paired with a written reference you can search.',
      },
    ],
  },
  {
    name: 'Certifications',
    items: [
      {
        q: 'How do I earn a certificate?',
        a: 'Complete all modules in a path, then pass the proctored certification exam offered at the end of each track.',
      },
      {
        q: 'How much does the exam cost?',
        a: 'One exam attempt is included with every cohort. Retakes are offered at a reduced fee after a 14-day waiting period.',
      },
      {
        q: 'How long is my certificate valid?',
        a: 'Certificates show the date you passed and do not expire. Hiring partners typically look for exams passed within the last three years.',
      },
      {
        q: 'Can I share my certificate on LinkedIn?',
        a: 'Yes. Every certificate has a public verification link and a share button that pre-fills a LinkedIn post.',
      },
      {
        q: 'What happens if I fail an exam?',
        a: 'You receive a breakdown of the areas to review and can schedule a retake after 14 days.',
      },
      {
        q: 'Are exams open book?',
        a: 'Yes. Exams test applied problem solving, so documentation is allowed. Collaboration with other people is not.',
      },
    ],
  },
  {
    name: 'Account & Profile',
    items: [
      {
        q: 'How do I reset my password?',
        a: 'Use the "Forgot password" link on the sign-in modal. A reset email arrives within a few minutes.',
      },
      {
        q: 'Can I change my email address?',
        a: 'Yes, from Settings after signing in. You must confirm the new address before the change takes effect.',
      },
      {
        q: 'How do I delete my account?',
        a: 'Request deletion from Settings. Your progress and enrollments are removed permanently after 30 days.',
      },
      {
        q: 'Why am I signed out automatically?',
        a: 'Sessions expire after 30 days for security. Sign in again to pick up exactly where you left off.',
      },
      {
        q: 'Can I have the same account on two devices?',
        a: 'Yes. Your progress syncs automatically, so you can study on your laptop and review on your phone.',
      },
      {
        q: 'How do I change my display name?',
        a: 'Open Settings, edit the name field, and save. The new name appears on certificates and in cohort rosters.',
      },
    ],
  },
  {
    name: 'Billing & Pricing',
    items: [
      {
        q: 'Is CodeForge Academy free?',
        a: 'All beginner paths are free. Intermediate and advanced paths are billed per cohort, with the price shown before you apply.',
      },
      {
        q: 'What payment methods do you accept?',
        a: 'Major credit cards and regional bank transfers. Payment happens through a secure checkout before the cohort starts.',
      },
      {
        q: 'Do you offer scholarships?',
        a: 'Yes. A limited number of partial and full scholarships are awarded each cohort based on a short written application.',
      },
      {
        q: 'What is the refund policy?',
        a: 'Full refund up to 14 days after your cohort starts, no questions asked, requested from your Dashboard.',
      },
      {
        q: 'Can my employer pay for a path?',
        a: 'Yes. We can issue an invoice to your company, and most teams reimburse certification exams directly.',
      },
      {
        q: 'Will I be charged automatically for the next cohort?',
        a: 'Never. Each cohort is a separate, one-time payment. There are no subscriptions and no auto-renewals.',
      },
    ],
  },
  {
    name: 'Community & Support',
    items: [
      {
        q: 'Is there a student community?',
        a: 'Yes — accepted students get access to the private discussion channels for their cohort.',
      },
      {
        q: 'How do I ask an instructor a question?',
        a: 'Post in your cohort channel with the "question" tag. Instructors answer within one business day.',
      },
      {
        q: 'Are there study groups?',
        a: 'Each cohort is automatically grouped into study pods of four to six students matched by timezone.',
      },
      {
        q: 'Can I talk to students from other cohorts?',
        a: 'Yes. The common channels are open across cohorts for anything not specific to one path.',
      },
      {
        q: 'How do I report a bug or broken lesson?',
        a: 'Use the flag icon next to any lesson. The curriculum team triages reports every weekday.',
      },
      {
        q: 'Is there mentorship available?',
        a: 'Advanced paths pair you with an industry mentor for biweekly one-on-one sessions.',
      },
    ],
  },
  {
    name: 'Technical Requirements',
    items: [
      {
        q: 'What computer do I need?',
        a: 'Any machine from the last five years that can run a modern browser. Advanced systems paths ask for at least 8 GB of memory.',
      },
      {
        q: 'Which browser works best?',
        a: 'Any current version of Chrome, Firefox, Safari, or Edge. Make sure the browser is up to date.',
      },
      {
        q: 'Do I need to install anything?',
        a: 'Beginner paths run entirely in the browser. Later paths include a one-command setup guide for your own machine.',
      },
      {
        q: 'Can I study offline?',
        a: 'Lesson text can be downloaded as PDF. Videos need a connection since they are streamed.',
      },
      {
        q: 'Is my progress saved if the browser crashes?',
        a: 'Yes. Progress is stored on our servers the moment you complete a step, not on your device.',
      },
      {
        q: 'The video player is not loading. What should I do?',
        a: 'Disable aggressive ad blockers for this site first, then try another browser. If it persists, report it from the lesson page.',
      },
    ],
  },
  {
    name: 'Policies & Privacy',
    items: [
      {
        q: 'How is my personal data handled?',
        a: 'We collect only what is needed to run your account and never sell data. The full policy is linked in the footer.',
      },
      {
        q: 'Can instructors see my exercise solutions?',
        a: 'Yes, instructors and your study pod can see submissions to give feedback. Nothing is shared outside the cohort.',
      },
      {
        q: 'Are certificates verifiable by employers?',
        a: 'Yes. Every certificate has a unique verification URL that employers can check without an account.',
      },
      {
        q: 'What is the academic integrity policy?',
        a: 'Collaboration is encouraged in exercises, but exams must be your own work. Violations revoke the certificate.',
      },
      {
        q: 'Can I use AI assistants while learning?',
        a: 'For exercises, yes — we teach you to use them well. Certification exams are taken without assistance.',
      },
    ],
  },
];

export default function Help() {
  const [search, setSearch] = useState('');
  const query = search.trim().toLowerCase();

  const filtered = useMemo(() => {
    if (!query) return HELP_CATEGORIES;
    return HELP_CATEGORIES.map((cat) => ({
      ...cat,
      items: cat.items.filter(
        (item) =>
          item.q.toLowerCase().includes(query) || item.a.toLowerCase().includes(query),
      ),
    })).filter((cat) => cat.items.length > 0);
  }, [query]);

  const totalItems = HELP_CATEGORIES.reduce((sum, c) => sum + c.items.length, 0);

  return (
    <section className="max-w-3xl">
      <h1 className="text-2xl font-bold tracking-tight text-slate-900">Help Center</h1>
      <p className="mt-1 text-sm text-slate-600">
        {totalItems} answers across {HELP_CATEGORIES.length} topics.
      </p>

      <div className="relative mt-5">
        <Search
          size={16}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search the help center…"
          aria-label="Search the help center"
          className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed border-slate-300 bg-white py-16 text-center">
          <p className="text-sm font-medium text-slate-700">No answers match</p>
          <p className="mt-1 text-sm text-slate-500">Try a different keyword.</p>
        </div>
      ) : (
        <div className="mt-8 space-y-10">
          {filtered.map((cat) => (
            <div key={cat.name}>
              <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-slate-400">
                {cat.name} · {cat.items.length}
              </h2>
              <div className="space-y-3">
                {cat.items.map((item) => (
                  <details
                    key={item.q}
                    className="group rounded-xl border border-slate-200 bg-white p-4 transition-colors hover:border-slate-300 [&_summary::-webkit-details-marker]:hidden"
                  >
                    <summary className="flex cursor-pointer items-center justify-between gap-4 text-sm font-semibold text-slate-900">
                      {item.q}
                      <span className="text-slate-400 transition-transform group-open:rotate-45">
                        +
                      </span>
                    </summary>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.a}</p>
                  </details>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
