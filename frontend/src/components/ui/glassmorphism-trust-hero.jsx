import { ArrowUpRight, Play, Target, Star, BedDouble, ShieldCheck, Wrench } from 'lucide-react'
import { Link } from 'react-router-dom'

const ROLES = [
  { name: 'Students', icon: BedDouble },
  { name: 'Hostel staff', icon: Wrench },
  { name: 'Administrators', icon: ShieldCheck },
]

const StatItem = ({ value, label }) => (
  <div className="flex cursor-default flex-col items-center justify-center transition-transform hover:-translate-y-1">
    <span className="text-xl font-bold text-white sm:text-2xl">{value}</span>
    <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-500 sm:text-xs">
      {label}
    </span>
  </div>
)

export default function HeroSection() {
  return (
    <div className="relative w-full overflow-hidden bg-[#0d1c1a] font-sans text-white">
      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeSlideIn 0.8s ease-out forwards;
          opacity: 0;
        }
        .delay-100 { animation-delay: 0.1s; }
        .delay-200 { animation-delay: 0.2s; }
        .delay-300 { animation-delay: 0.3s; }
        .delay-400 { animation-delay: 0.4s; }
        .delay-500 { animation-delay: 0.5s; }
      `}</style>

      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,_rgba(255,187,92,0.18),_transparent_24%),linear-gradient(90deg,_rgba(12,28,25,0.86),_rgba(9,22,20,0.92)_35%,_rgba(13,27,23,0.72))]" />

      <div className="absolute inset-0 z-0 opacity-80" style={{
        background: 'linear-gradient(180deg, rgba(10,15,14,0.3), rgba(10,15,14,0.72))',
      }} />

      <div className="relative z-10 mx-auto w-full max-w-[1400px] px-4 pb-14 pt-8 sm:px-6 lg:px-10">
        <div className="grid min-w-0 grid-cols-1 items-center gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-10">
          <div className="relative flex min-w-0 flex-col justify-center py-10 lg:py-16">
            <div className="animate-fade-in delay-100 mb-7">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 backdrop-blur-md">
                <span className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-200 sm:text-xs">
                  A better way to care for your hostel
                  <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                </span>
              </div>
            </div>

            <h1
              className="animate-fade-in delay-200 max-w-[700px] text-[2.6rem] font-medium leading-[1.02] tracking-[-0.045em] text-white sm:text-[3.5rem] lg:text-[4.4rem]"
            >
              A better hostel
              <br />
              <span className="bg-gradient-to-br from-white via-[#f3f6f4] to-[#ffdc93] bg-clip-text text-transparent">starts with care.</span>
            </h1>

            <p className="animate-fade-in delay-300 mt-6 max-w-[580px] text-base leading-7 text-zinc-300 sm:text-lg">
              Report a repair, follow its progress, and hear when it’s resolved—all in one place.
              HostelCare keeps students and hostel teams on the same page.
            </p>

            <div className="animate-fade-in delay-400 mt-9 flex flex-col gap-4 sm:flex-row">
              <Link
                to="/register"
                className="group inline-flex items-center justify-center gap-2 rounded-full bg-white px-7 py-4 text-sm font-semibold text-zinc-950 shadow-lg shadow-white/10 transition-all hover:scale-[1.02] hover:bg-zinc-200"
              >
                Report an issue
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>

              <a href="#how-it-works" className="group inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-7 py-4 text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:border-white/20 hover:bg-white/10">
                <Play className="h-4 w-4 fill-current" />
                How it works
              </a>
            </div>

          </div>

          <div className="relative z-10 min-w-0">
            <div className="animate-fade-in delay-500 relative overflow-hidden rounded-[30px] border border-white/10 bg-[rgba(40,52,50,0.68)] p-8 shadow-[0_35px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl">
              <div className="pointer-events-none absolute -mr-16 -mt-16 right-0 top-0 h-64 w-64 rounded-full bg-white/5 blur-3xl" />

              <div className="relative z-10">
                <div className="mb-8 flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/20">
                    <Target className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold tracking-tight text-white">Your hostel</div>
                    <div className="text-sm text-zinc-300">Every request, in one place</div>
                  </div>
                </div>

                <div className="mb-8 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-zinc-300">From report to resolution</span>
                    <span className="font-medium text-white">Track every step</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-700/70">
                    <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-[#f6d58d] to-white" />
                  </div>
                </div>

                <div className="mb-5 h-px w-full bg-white/10" />

                <div className="grid grid-cols-3 gap-3 text-center">
                  <StatItem value="01" label="Report" />
                  <div className="mx-auto h-full w-px bg-white/10" />
                  <StatItem value="02" label="Track" />
                  <div className="mx-auto h-full w-px bg-white/10" />
                  <StatItem value="03" label="Resolve" />
                </div>

                <div className="mt-8 flex flex-wrap gap-2">
                  <div className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-medium tracking-wide text-zinc-200">
                    <ShieldCheck className="h-3 w-3 text-emerald-300" />
                    Clear updates
                  </div>
                </div>
              </div>
            </div>

            <div className="animate-fade-in delay-500 relative mt-6 overflow-hidden rounded-[30px] border border-white/10 bg-[rgba(40,52,50,0.68)] px-6 py-6 backdrop-blur-xl">
              <h3 className="mb-5 text-sm font-medium text-zinc-300">Made for everyone in your hostel</h3>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {ROLES.map(({ name, icon: Icon }) => (
                  <div key={name} className="flex min-w-0 items-center gap-2 rounded-2xl border border-white/5 bg-white/[0.03] px-3 py-3 text-sm text-zinc-200">
                    <Icon className="h-4 w-4 shrink-0 text-[#f6d58d]" />
                    <span>{name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
