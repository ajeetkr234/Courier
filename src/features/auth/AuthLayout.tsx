import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Package, Plane, ShieldCheck, Truck, Zap } from 'lucide-react';
import { ShipFasterLogo } from '../../components/ui/ShipFasterLogo';

interface AuthLayoutProps {
  mode: 'login' | 'register';
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ mode, title, subtitle, children }) => (
  <main className="relative min-h-dvh overflow-x-hidden bg-[linear-gradient(135deg,#eff6ff_0%,#f8f7ff_45%,#eefcfb_100%)] text-slate-900">
    <div className="pointer-events-none absolute inset-0 opacity-60 [background-image:linear-gradient(rgba(99,102,241,.06)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,.06)_1px,transparent_1px)] [background-size:64px_64px]" />
    <div className="pointer-events-none absolute -left-32 bottom-0 h-72 w-72 rounded-full bg-amber-200/40 blur-3xl" />
    <div className="pointer-events-none absolute -right-24 top-16 h-80 w-80 rounded-full bg-cyan-200/40 blur-3xl" />

    <div className="relative mx-auto grid min-h-dvh w-full max-w-[1440px] grid-cols-1 lg:grid-cols-[minmax(0,1.15fr)_minmax(420px,.85fr)]">
      <section className="flex min-w-0 flex-col px-4 py-5 sm:px-8 lg:px-12 lg:py-10 xl:px-20">
        <Link to="/" className="inline-flex w-fit">
          <ShipFasterLogo size="lg" variant="dark" />
        </Link>

        <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center py-8 lg:py-12">
          <div className="max-w-xl space-y-4 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/80 px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-wider text-blue-700 shadow-sm backdrop-blur">
              <Zap className="h-3.5 w-3.5" /> One account. Every shipment.
            </div>
            <h1 className="text-3xl font-black leading-tight tracking-tight text-slate-950 sm:text-4xl xl:text-5xl">
              More than shipping—
              <span className="block bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">
                your growth partner.
              </span>
            </h1>
            <p className="mx-auto max-w-lg text-sm font-medium leading-relaxed text-slate-600 sm:text-base lg:mx-0">
              Manage orders, compare courier rates, print labels, track deliveries, and reconcile COD from one logistics control center.
            </p>
          </div>

          <div className="relative mx-auto mt-8 hidden h-[300px] w-full max-w-[620px] lg:block" aria-hidden="true">
            <div className="absolute inset-x-10 bottom-6 h-20 rounded-[50%] bg-indigo-300/20 blur-2xl" />
            <div className="absolute bottom-10 left-8 right-8 h-32 rounded-[32px] border border-slate-300 bg-white/75 shadow-xl backdrop-blur-sm" />
            <div className="absolute bottom-24 left-[12%] flex h-32 w-40 flex-col items-center justify-center rounded-3xl border border-blue-200 bg-white shadow-xl">
              <div className="absolute -top-9 flex h-20 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg">
                <Package className="h-10 w-10 text-white" />
              </div>
              <span className="mt-8 text-xs font-black text-slate-800">ORDER HUB</span>
              <span className="text-[10px] font-semibold text-slate-400">Store sync active</span>
            </div>
            <div className="absolute bottom-12 left-[43%] flex h-24 w-36 items-center justify-center rounded-3xl border border-slate-300 bg-white shadow-lg">
              <Plane className="h-14 w-14 -rotate-12 text-indigo-500" />
            </div>
            <div className="absolute bottom-16 right-[4%] flex h-20 w-40 items-center gap-3 rounded-2xl border border-emerald-200 bg-white px-4 shadow-xl">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50"><Truck className="h-6 w-6 text-emerald-600" /></span>
              <span><strong className="block text-xs text-slate-800">On the way</strong><small className="text-[10px] text-slate-400">Live tracking</small></span>
            </div>
          </div>

          <div className="mt-5 hidden grid-cols-3 gap-3 lg:grid">
            {['7+ courier partners', 'Secure tenant data', 'Real-time tracking'].map((item, index) => (
              <div key={item} className="flex items-center justify-center gap-2 rounded-xl border border-white/80 bg-white/60 px-3 py-2.5 text-[11px] font-bold text-slate-600 backdrop-blur">
                {index === 1 ? <ShieldCheck className="h-4 w-4 text-emerald-600" /> : <span className="h-2 w-2 rounded-full bg-blue-500" />}
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="flex items-center justify-center px-3 pb-6 sm:px-8 lg:px-10 lg:py-10">
        <div className="w-full max-w-[500px] rounded-3xl border border-white/90 bg-white/95 p-4 shadow-[0_24px_80px_-30px_rgba(30,41,59,.35)] backdrop-blur-xl sm:p-7">
          <div className="mb-6 grid grid-cols-2 rounded-xl bg-slate-100 p-1">
            <Link to="/login" className={`rounded-lg px-3 py-2.5 text-center text-xs font-extrabold transition ${mode === 'login' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>Log in</Link>
            <Link to="/register" className={`rounded-lg px-3 py-2.5 text-center text-xs font-extrabold transition ${mode === 'register' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>Create account</Link>
          </div>

          <div className="mb-5">
            <p className="text-[11px] font-extrabold uppercase tracking-[.16em] text-blue-600">For business</p>
            <h2 className="mt-1 text-2xl font-black text-slate-950">{title}</h2>
            <p className="mt-1.5 text-xs font-medium leading-relaxed text-slate-500">{subtitle}</p>
          </div>

          {children}

          <div className="my-6 flex items-center gap-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            <span className="h-px flex-1 bg-slate-200" /> Shipment tracking <span className="h-px flex-1 bg-slate-200" />
          </div>
          <div className="rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50 to-blue-50 p-4">
            <div className="flex items-center justify-between gap-3">
              <span><strong className="block text-sm text-slate-900">Know where your order is</strong><small className="text-[11px] text-slate-500">Track by AWB or order number</small></span>
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-indigo-600 shadow-sm"><Package className="h-5 w-5" /></span>
            </div>
            <Link to="/track" className="mt-3 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-extrabold text-white transition hover:bg-indigo-700">
              Track shipment <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  </main>
);
