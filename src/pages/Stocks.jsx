import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, RefreshCw, Eye, EyeOff, ChevronRight, KeyRound, LineChart } from 'lucide-react'
import { useStore } from '../store/useStore'
import { strings } from '../constants/strings'
import { totalsByCurrency, combineToPrimary, sumField } from '../utils/portfolio'
import { useQuotes } from '../hooks/useQuotes'
import { useFx } from '../hooks/useFx'
import Card from '../components/ui/Card'
import MoneyText from '../components/MoneyText'
import DualMoney from '../components/DualMoney'
import FxChange from '../components/FxChange'
import PortfolioModal from '../components/PortfolioModal'
import PageHeader from '../components/PageHeader'

export default function Stocks() {
  const navigate = useNavigate()
  const portfolios = useStore((s) => s.portfolios)
  const holdings = useStore((s) => s.holdings)
  const settings = useStore((s) => s.settings)
  const updateSettings = useStore((s) => s.updateSettings)
  const primary = settings.primaryCurrency

  const { quoteMap, loading, error, hasKey, refresh } = useQuotes(holdings)
  const { convert } = useFx(holdings.map((h) => h.currency), primary)

  const [addOpen, setAddOpen] = useState(false)

  const grand = totalsByCurrency(holdings, quoteMap)
  const valueC = combineToPrimary(grand, 'value', convert, primary)
  const gainC = combineToPrimary(grand, 'gain', convert, primary)
  const costC = combineToPrimary(grand, 'cost', convert, primary)
  const todayC = combineToPrimary(grand, 'todayChange', convert, primary)
  const hasToday = grand.some((g) => g.hasTodayChange)
  const priced = grand.some((g) => g.priced > 0)
  // Percentages come from native sums (currency-agnostic) so they're correct
  // even before/without FX rates.
  const rawCost = sumField(grand, 'cost')
  const rawToday = sumField(grand, 'todayChange')
  const rawValue = sumField(grand, 'value')
  const gainPct = rawCost > 0 ? (sumField(grand, 'gain') / rawCost) * 100 : 0
  const todayPct = rawValue - rawToday > 0 ? (rawToday / (rawValue - rawToday)) * 100 : 0

  return (
    <div className="space-y-5">
      <PageHeader
        icon={LineChart}
        title={strings.stock.title}
        subtitle={strings.pageSub.stocks}
        onBack={() => navigate('/')}
        right={
          <div className="flex items-center gap-1">
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
        }
      />

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
      {error && hasKey && <p className="px-1 text-xs text-amber-600">{strings.stock.fetchError}</p>}

      {/* Grand total hero — primary currency (converted) + native breakdown */}
      <Card className="bg-gradient-to-br from-brand-600 to-brand-700 text-white">
        <p className="text-sm opacity-80">{strings.stock.totalValue}</p>
        {grand.length === 0 ? (
          <MoneyText satang={0} currency={primary} className="text-3xl font-bold" />
        ) : (
          <>
            <DualMoney combined={valueC} primary={primary} className="text-3xl font-bold" nativeClassName="text-white/70" stacked />
            <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1">
              {hasToday && <FxChange combined={todayC} pct={todayPct} primary={primary} onGradient label={strings.stock.today} />}
              {priced && <FxChange combined={gainC} pct={gainPct} primary={primary} onGradient label={strings.stock.allGainLoss} />}
            </div>
          </>
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
            const pv = combineToPrimary(totals, 'value', convert, primary)
            const pt = combineToPrimary(totals, 'todayChange', convert, primary)
            const pfHasToday = totals.some((g) => g.hasTodayChange)
            const rawV = sumField(totals, 'value')
            const rawT = sumField(totals, 'todayChange')
            const ptPct = rawV - rawT > 0 ? (rawT / (rawV - rawT)) * 100 : 0
            return (
              <button key={pf.id} onClick={() => navigate(`/stocks/${pf.id}`)} className="block w-full text-left">
                <Card className="flex items-center gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-semibold">{pf.name}</div>
                    <div className="text-xs text-slate-500">{strings.stock.positions(pfHoldings.length)}</div>
                  </div>
                  <div className="text-right">
                    {totals.length === 0 ? (
                      <MoneyText satang={0} currency={primary} className="font-bold" />
                    ) : (
                      <>
                        <DualMoney combined={pv} primary={primary} className="font-bold" nativeClassName="text-slate-400" />
                        {pfHasToday && (
                          <div className="text-xs">
                            <FxChange combined={pt} pct={ptPct} primary={primary} />
                          </div>
                        )}
                      </>
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
