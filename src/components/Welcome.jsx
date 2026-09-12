import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { strings } from '../constants/strings'
import Button from './ui/Button'

// One-time first-run welcome. Shows until dismissed, then never again
// (settings.onboarded). Points the user to the in-app guide.
export default function Welcome() {
  const onboarded = useStore((s) => s.settings.onboarded)
  const updateSettings = useStore((s) => s.updateSettings)
  const navigate = useNavigate()

  if (onboarded) return null

  const done = () => updateSettings({ onboarded: true })
  const openGuide = () => {
    done()
    navigate('/guide')
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-6" role="dialog" aria-modal="true">
      <div className="fade-in absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div className="dialog-in relative z-10 w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-xl dark:bg-slate-900">
        <img
          src={`${import.meta.env.BASE_URL}icon-192.png`}
          alt="MySync"
          className="mx-auto h-16 w-16 rounded-2xl shadow-sm"
        />
        <h2 className="mt-4 text-xl font-bold">{strings.welcome.title}</h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-500">{strings.welcome.body}</p>
        <div className="mt-5 space-y-2">
          <Button className="w-full" onClick={done}>
            {strings.welcome.start}
          </Button>
          <Button variant="secondary" className="w-full" onClick={openGuide}>
            {strings.welcome.openGuide}
          </Button>
        </div>
      </div>
    </div>
  )
}
