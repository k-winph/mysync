import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ChevronLeft, Plus, RefreshCw, Eye, EyeOff, ChevronRight,
  TrendingUp, TrendingDown, KeyRound,
} from 'lucide-react'
import { useStore } from '../store/useStore'
import { strings } from '../constants/strings'
import { totalsByCurrency } from '../utils/portfolio'
import { useQuotes } from '../hooks/useQuotes'
import Card from '../components/ui/Card'
import MoneyText from '../components/MoneyText'
import PortfolioModal from '../components/PortfolioModal'

// Colored gain/today figure: value (in cents of `currency`) + percentage.
function ChangeLine({ cents, pct, currency, label }) {
  if (cents == null) return null
  const up = cents >= 0
  const Icon = up ? TrendingUp : TrendingDown
  const cls = up ? 'text-green-600' : 'text-red-600'
  return (
    <span className={`inline-flex items-center gap-1 text-sm font-medium ${cls}`}>
      <Icon size={14} />
      <MoneyText satang={Math.abs(cents)} currency={currency} />
      {pct != null && <span>({up ? '+' : '-'}{Math.abs(pct).toFixed(2)}%)</span>}
      {label && <span className="text-slate-400">{label}</span>}
    </span>
  )
}

export default function Stocks() {
  const navigate = useNavigate()
  const portfolios = useStore((s) => s.portfolios)
  const holdings = useStore((s) => s.holdings)
  const settings = useStore((s) => s.settings)
  const updateSettings = useStore((s) => s.updateSettings)

  const { quoteMap, loading, error, hasKey, refresh } = useQuotes(holdings)

  const [addOpen, setAddOpen] = useState(false)

  const grand = totalsByCurrency(holdings, quoteMap)

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => navigate('/')}
          className="-ml-2 rounded-full p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          aria-label="Back"
        >
          <ChevronLeft size={22} />
        </button>
        <h1 className="flex-1 text-2xl font-bold">{strings.stock.title}</h1>
        <button
          onClick={() => updateSettings({ hideBalances: !settings.hideBalances })}
          className="rounded-full p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          aria-label={strings.settings.hideBalances}
        >
          {settings.hideBalances ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
        <button
          onClick={refresh}
          disabled={loading || !hasKey}
          className="rounded-full p-2 text-slate-500 hover:bg-slate-100 disabled:opacity-40 dark:hover:bg-slate-800"
          aria-label={strings.stock.refresh}
        >
          <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* No API key banner */}
      {!hasKey && (
        <button onClick={() => navigate('/settings')} className="block w-full text-left">
          <Card className="flex items-center gap-2 border-amber-300 bg-amber-50 text-sm
            text-amber-800 dark:border-amber-900/40 dark:bg-amber-900/15 dark:text-amber-300">
            <KeyRound size={16} className="shrink-0" />
            <span className="flex-1">{strings.stock.noKey}</span>
            <ChevronRight size={16} />
          </Card>
        </button>
      )}
      {error && hasKey && (
        <p className="px-1 text-xs text-amber-600">{strings.stock.fetchError}</p>
      )}

      {/* Grand total hero (per currency) */}
      <Card className="bg-gradient-to-br from-brand-600 to-brand-700 text-white">
        <p className="text-sm opacity-80">{strings.stock.totalValue}</p>
        {grand.length === 0 ? (
          <MoneyText satang={0} currency={settings.primaryCurrency} className="text-3xl font-bold" />
        ) : (
          grand.map((g) => (
            <div key={g.currency} className="mb-2 last:mb-0">
              <MoneyText satang={g.value} currency={g.currency} className="text-3xl font-bold" />
              <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1">
                {g.hasTodayChange && (
                  <ChangeLineWhite cents={g.todayChange} pct={g.todayPct} currency={g.currency} label={strings.stock.today} />
                )}
                {g.priced > 0 && (
                  <ChangeLineWhite cents={g.gain} pct={g.gainPct} currency={g.currency} label={strings.stock.allGainLoss} />
                )}
              </div>
            </div>
          ))
        )}
      </Card>

      {/* Portfolios */}
      {portfolios.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center
          text-sm text-slate-500 dark:border-slate-700">
          {strings.stock.emptyPortfolios}
        </div>
      ) : (
        <div className="space-y-3">
          {portfolios.map((pf) => {
            const pfHoldings = holdings.filter((h) => h.portfolioId === pf.id)
            const totals = totalsByCurrency(pfHoldings, quoteMap)
            return (
              <button
                key={pf.id}
                onClick={() => navigate(`/stocks/${pf.id}`)}
                className="block w-full text-left"
              >
                <Card className="flex items-center gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-semibold">{pf.name}</div>
                    <div className="text-xs text-slate-500">
                      {strings.stock.positions(pfHoldings.length)}
                    </div>
                  </div>
                  <div className="text-right">
                    {totals.length === 0 ? (
                      <MoneyText satang={0} currency={settings.primaryCurrency} className="font-bold" />
                    ) : (
                      totals.map((g) => (
                        <div key={g.currency}>
                          <MoneyText satang={g.value} currency={g.currency} className="font-bold" />
                          {g.hasTodayChange && (
                            <div className="text-xs">
                              <ChangeLine cents={g.todayChange} pct={g.todayPct} currency={g.currency} />
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                  <ChevronRight size={18} className="shrink-0 text-slate-400" />
                </Card>
              </button>
            )
          })}
        </div>
      )}

      {/* Add portfolio */}
      <button
        onClick={() => setAddOpen(true)}
        className="fixed bottom-20 right-4 z-30 flex h-14 w-14 items-center justify-center
          rounded-full bg-brand-600 text-white shadow-lg shadow-brand-600/30
          transition hover:bg-brand-700 active:scale-95"
        style={{ marginBottom: 'env(safe-area-inset-bottom)' }}
        aria-label={strings.stock.addPortfolio}
      >
        <Plus size={26} />
      </button>

      <PortfolioModal open={addOpen} onClose={() => setAddOpen(false)} />
    </div>
  )
}

// Change line for the colored hero card — green/red, tuned for contrast on the
// brand gradient.
function ChangeLineWhite({ cents, pct, currency, label }) {
  if (cents == null) return null
  const up = cents >= 0
  return (
    <span className={`inline-flex items-center gap-1 text-sm font-medium ${up ? 'text-emerald-300' : 'text-rose-300'}`}>
      {up ? '▲' : '▼'}
      <MoneyText satang={Math.abs(cents)} currency={currency} />
      {pct != null && <span>({up ? '+' : '-'}{Math.abs(pct).toFixed(2)}%)</span>}
      {label && <span className="text-white/70">{label}</span>}
    </span>
  )
}
