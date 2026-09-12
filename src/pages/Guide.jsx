import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useStore } from '../store/useStore'
import { strings } from '../constants/strings'
import { GUIDE_META, GUIDE } from '../constants/guide'
import Card from '../components/ui/Card'

// A labelled block used in the detail view.
function Section({ label, children }) {
  return (
    <div>
      <h2 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</h2>
      <Card>{children}</Card>
    </div>
  )
}

export default function Guide() {
  const navigate = useNavigate()
  const lang = useStore((s) => s.settings.language)
  const content = GUIDE[lang] || GUIDE.en
  const g = strings.guide
  const [selected, setSelected] = useState(null)

  // --- Detail view ---
  if (selected) {
    const e = content[selected]
    return (
      <div className="space-y-5">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setSelected(null)}
            className="-ml-2 rounded-full p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Back"
          >
            <ChevronLeft size={22} />
          </button>
          <h1 className="flex-1 text-xl font-bold">{e.title}</h1>
        </div>

        <Section label={g.whatFor}>
          <p className="text-sm leading-relaxed">{e.whatFor}</p>
        </Section>

        <Section label={g.location}>
          <p className="text-sm leading-relaxed">{e.location}</p>
        </Section>

        <Section label={g.howTo}>
          <ol className="list-decimal space-y-2 pl-5 text-sm leading-relaxed">
            {e.steps.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ol>
        </Section>

        {e.example && (
          <Section label={g.example}>
            <p className="whitespace-pre-line text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              {e.example}
            </p>
          </Section>
        )}

        {e.notes?.length > 0 && (
          <Section label={g.notes}>
            <ul className="list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              {e.notes.map((n, i) => (
                <li key={i}>{n}</li>
              ))}
            </ul>
          </Section>
        )}
      </div>
    )
  }

  // --- List view ---
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-1">
        <button
          onClick={() => navigate('/settings')}
          className="-ml-2 rounded-full p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          aria-label="Back"
        >
          <ChevronLeft size={22} />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{g.title}</h1>
          <p className="text-sm text-slate-500">{g.subtitle}</p>
        </div>
      </div>

      <Card className="divide-y divide-slate-100 dark:divide-slate-800">
        {GUIDE_META.map((m) => {
          const e = content[m.id]
          const Icon = m.icon
          return (
            <button
              key={m.id}
              onClick={() => setSelected(m.id)}
              className="flex w-full items-center gap-3 px-1 py-3 text-left hover:opacity-80"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600 dark:bg-brand-600/15">
                <Icon size={18} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="font-medium">{e.title}</div>
                <div className="truncate text-xs text-slate-500">{e.whatFor}</div>
              </div>
              <ChevronRight size={16} className="shrink-0 text-slate-400" />
            </button>
          )
        })}
      </Card>
    </div>
  )
}
