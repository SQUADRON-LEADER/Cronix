import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock, Loader2, Workflow, ArrowRight, CheckCircle2 } from 'lucide-react';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useAuth } from '@/context';

const DEMO_EMAIL    = 'demo@cronix.dev';
const DEMO_PASSWORD = 'demo1234';

const loginSchema = z.object({
  email:    z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});
type LoginFormValues = z.infer<typeof loginSchema>;

const features = [
  'Atomic job claiming — no duplicate execution',
  'Retry engine with linear & exponential backoffs',
  'Real-time WebSocket dashboard & stats telemetry',
  'Dead Letter Queue with one-click restoration',
];

const stats = [
  { value: '99.9%', label: 'Uptime SLA' },
  { value: '10K+',  label: 'Jobs / Hour' },
  { value: '<50ms', label: 'Latency' },
];

export function LoginPage() {
  const navigate = useNavigate();
  const { login: setAuth } = useAuth();
  const [error,    setError]    = useState<string | null>(null);
  const [loading,  setLoading]  = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: DEMO_EMAIL, password: DEMO_PASSWORD },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setError(null);
    setLoading(true);

    await new Promise((r) => setTimeout(r, 700));

    if (data.email === DEMO_EMAIL && data.password === DEMO_PASSWORD) {
      setAuth('demo-token-cronix-2024', {
        id:    'user-demo-1',
        email: DEMO_EMAIL,
        name:  'Alex Chen',
        role:  'admin',
      });
      navigate('/');
      return;
    }

    try {
      const res = await fetch('/api/v1/auth/login', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email: data.email, password: data.password }),
      });
      if (!res.ok) throw new Error('Invalid credentials');
      const body = await res.json();
      setAuth(body.token, body.user);
      navigate('/');
    } catch {
      setError('Invalid email or password. Use demo@cronix.dev / demo1234 to try the demo.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = () => {
    form.setValue('email',    DEMO_EMAIL);
    form.setValue('password', DEMO_PASSWORD);
  };

  return (
    <div className="min-h-screen relative flex select-none bg-cronix-bg-primary text-cronix-text overflow-hidden">
      {/* Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
        style={{ opacity: 0.15, filter: 'brightness(1.5) contrast(0.8)', zIndex: 0 }}
      >
        <source src="/bg.mp4" type="video/mp4" />
      </video>

      {/* ── Left panel (Cool Grey Neumorphic Showcase) ── */}
      <div className="hidden lg:flex lg:w-[50%] relative overflow-hidden flex-col justify-center px-16 py-12 z-10">
        {/* Background tactile concentric circles */}
        <div className="absolute top-[-100px] left-[-100px] w-[350px] h-[350px] rounded-full shadow-extruded bg-cronix-bg-primary opacity-50" />
        <div className="absolute top-[-50px] left-[-50px] w-[250px] h-[250px] rounded-full shadow-inset bg-cronix-bg-primary opacity-50" />

        <div className="relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Logo */}
            <div className="flex items-center gap-3 mb-12">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-cronix-bg-primary shadow-extruded text-[#6C63FF]">
                <Workflow className="w-6 h-6 fill-[#6C63FF]/10" />
              </div>
              <span className="text-2xl font-extrabold text-cronix-text tracking-tight font-display">Cronix</span>
            </div>

            <h2 className="text-4xl font-extrabold text-cronix-text mb-4 leading-tight font-display">
              Distributed Jobs,<br />
              <span className="text-[#6C63FF]">Zero Compromise.</span>
            </h2>
            <p className="text-base text-cronix-secondary font-medium mb-10 max-w-md">
              Schedule, retry, and monitor millions of concurrent background tasks across your infrastructure with visual telemetry.
            </p>

            {/* Features */}
            <div className="space-y-4 mb-12">
              {features.map((f) => (
                <div key={f} className="flex items-center gap-3 px-4 py-3 rounded-2xl shadow-extruded bg-cronix-bg-primary max-w-md">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-[#38B2AC]" />
                  <span className="text-xs font-bold text-cronix-secondary uppercase tracking-wider">{f}</span>
                </div>
              ))}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 max-w-md">
              {stats.map((s) => (
                <div key={s.label} className="rounded-2xl p-4 shadow-inset bg-cronix-bg-primary text-center">
                  <p className="text-2xl font-extrabold text-[#6C63FF] font-display">{s.value}</p>
                  <p className="text-[10px] uppercase font-bold text-cronix-secondary mt-1">{s.label}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── Right panel (Neumorphic Form Card) ── */}
      <div className="w-full lg:w-[50%] flex items-center justify-center px-6 py-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-[420px] glass-card p-8 md:p-10"
        >
          {/* Mobile Logo */}
          <div className="flex items-center gap-2.5 mb-8 lg:hidden">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-cronix-bg-primary shadow-extruded text-[#6C63FF]">
              <Workflow className="w-5 h-5" />
            </div>
            <span className="text-xl font-extrabold text-cronix-text font-display">Cronix</span>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-extrabold text-cronix-text font-display mb-1">Welcome back</h1>
            <p className="text-sm text-cronix-secondary font-medium">Sign in to your Cronix account to continue</p>
          </div>

          {/* Quick Demo Login Pill */}
          <button
            type="button"
            onClick={fillDemo}
            className="w-full mb-6 flex items-center justify-between px-4 py-3 rounded-2xl text-xs transition-all text-[#6C63FF] bg-cronix-bg-primary shadow-inset-small hover:shadow-inset"
          >
            <span>
              <span className="font-extrabold uppercase tracking-wider">Fill Demo Account</span>
              <span className="ml-2 font-medium text-cronix-secondary">(demo@cronix.dev / demo1234)</span>
            </span>
            <ArrowRight className="w-4 h-4 flex-shrink-0 animate-pulse" />
          </button>

          {/* Error display */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-5 px-4 py-3 rounded-xl text-xs font-bold text-center shadow-inset-small bg-cronix-bg-primary text-[#EF4444]"
            >
              {error}
            </motion.div>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold uppercase tracking-wider text-cronix-secondary">Email</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-cronix-secondary" />
                        <input {...field} type="email" placeholder="you@example.com"
                               className="pl-11 pr-4 py-3 input-field" />
                      </div>
                    </FormControl>
                    <FormMessage className="text-xs font-semibold text-[#EF4444]" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel className="text-xs font-bold uppercase tracking-wider text-cronix-secondary">Password</FormLabel>
                      <a href="#" className="text-xs font-bold text-[#6C63FF] hover:underline">
                        Forgot?
                      </a>
                    </div>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-cronix-secondary" />
                        <input {...field} type="password" placeholder="••••••••"
                               className="pl-11 pr-4 py-3 input-field" />
                      </div>
                    </FormControl>
                    <FormMessage className="text-xs font-semibold text-[#EF4444]" />
                  </FormItem>
                )}
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 btn-primary font-bold uppercase tracking-wider font-display"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Connecting…
                  </>
                ) : (
                  'Sign in to Cronix'
                )}
              </button>
            </form>
          </Form>

          <p className="mt-8 text-center text-xs font-bold text-cronix-secondary tracking-wide">
            Don't have an account?{' '}
            <Link to="/register" className="text-[#6C63FF] hover:underline ml-1">
              Create one free
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
