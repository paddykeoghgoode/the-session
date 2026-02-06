import Link from 'next/link';

interface QuickAction {
  href: string;
  icon: string;
  label: string;
  sublabel: string;
  gradient: string;
  borderColor: string;
}

const actions: QuickAction[] = [
  {
    href: '/pubs?sports=true',
    icon: '\u26BD',
    label: 'Watch Sports',
    sublabel: 'Best screens',
    gradient: 'from-blue-900/40 to-stout-800',
    borderColor: 'border-blue-700/40',
  },
  {
    href: '/pubs?sort=price',
    icon: '\uD83D\uDCB0',
    label: 'Cheap Pints',
    sublabel: 'Best value',
    gradient: 'from-irish-green-700/30 to-stout-800',
    borderColor: 'border-irish-green-700/40',
  },
  {
    href: '/deals',
    icon: '\u26A1',
    label: 'Deals',
    sublabel: 'Active now',
    gradient: 'from-amber-900/40 to-stout-800',
    borderColor: 'border-amber-700/40',
  },
  {
    href: '/pubs?music=true',
    icon: '\uD83C\uDFB5',
    label: 'Live Music',
    sublabel: 'Trad & gigs',
    gradient: 'from-purple-900/40 to-stout-800',
    borderColor: 'border-purple-700/40',
  },
  {
    href: '/pubs?latebar=true',
    icon: '\uD83C\uDF19',
    label: 'Late Night',
    sublabel: 'Open late',
    gradient: 'from-indigo-900/40 to-stout-800',
    borderColor: 'border-indigo-700/40',
  },
  {
    href: '/nearby',
    icon: '\uD83D\uDCCD',
    label: 'Near Me',
    sublabel: 'Closest pubs',
    gradient: 'from-rose-900/40 to-stout-800',
    borderColor: 'border-rose-700/40',
  },
];

export default function QuickActionGrid() {
  return (
    <section className="py-4 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
        {actions.map(action => (
          <Link
            key={action.href}
            href={action.href}
            className={`group relative rounded-xl p-3 sm:p-4 bg-gradient-to-br ${action.gradient} border ${action.borderColor} hover:border-irish-green-500/50 transition-all active:scale-95`}
          >
            <div className="text-center">
              <span className="text-2xl sm:text-3xl block mb-1">{action.icon}</span>
              <p className="text-cream-100 text-xs sm:text-sm font-semibold leading-tight">{action.label}</p>
              <p className="text-stout-400 text-[10px] sm:text-xs mt-0.5 hidden sm:block">{action.sublabel}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
