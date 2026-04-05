'use client';

import Link from 'next/link';
import { Suspense, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { PublicNav } from '@/components/public/public-nav';

function PaymentCompleteContent() {
  const searchParams = useSearchParams();
  const ref = searchParams.get('ref');
  const paid = searchParams.get('paid');
  const error = searchParams.get('error');

  const state = useMemo(() => {
    if (error) {
      return {
        title: 'Payment could not be verified',
        tone: 'rose' as const,
        body: error,
      };
    }
    if (paid === '1') {
      return {
        title: 'Payment successful',
        tone: 'emerald' as const,
        body: ref
          ? `Your booking reference is ${ref}. We have confirmed your reservation.`
          : 'Your reservation has been confirmed.',
      };
    }
    if (paid === '0') {
      return {
        title: 'Payment not completed',
        tone: 'amber' as const,
        body: ref
          ? `Reference ${ref}: the transaction was not authorized. You can try again from the booking page or contact the hotel.`
          : 'The transaction was not completed.',
      };
    }
    return {
      title: 'Payment status',
      tone: 'slate' as const,
      body: 'If you closed the window before returning from the bank, check your email or contact the hotel with your booking reference.',
    };
  }, [error, paid, ref]);

  const border =
    state.tone === 'emerald'
      ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
      : state.tone === 'rose'
        ? 'border-rose-200 bg-rose-50 text-rose-900'
        : state.tone === 'amber'
          ? 'border-amber-200 bg-amber-50 text-amber-900'
          : 'border-slate-200 bg-slate-50 text-slate-800';

  return (
    <div className="mx-auto max-w-lg px-6 py-16">
      <div className={`rounded-2xl border px-6 py-8 ${border}`}>
        <h1 className="text-2xl font-bold">{state.title}</h1>
        <p className="mt-4 text-sm leading-relaxed opacity-90">{state.body}</p>
        <Link href="/" className="button-primary mt-8 inline-flex">
          Back to booking
        </Link>
      </div>
    </div>
  );
}

export default function PaymentCompletePage() {
  return (
    <div className="min-h-screen bg-canvas">
      <PublicNav />
      <main>
        <Suspense
          fallback={
            <div className="mx-auto max-w-lg px-6 py-16 text-center text-slate-600">Loading…</div>
          }>
          <PaymentCompleteContent />
        </Suspense>
      </main>
    </div>
  );
}
