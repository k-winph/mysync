import { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Plus, RefreshCw, Pencil, KeyRound, ChevronRight, LineChart } from 'lucide-react'
import { useStore } from '../store/useStore'
import { strings } from '../constants/strings'
import { holdingMetrics, totalsByCurrency, combineToPrimary, singleToPrimary, sumField } from '../utils/portfolio'
import { formatMoney } from '../utils/money'
import { useQuotes } from '../hooks/useQuotes'
import { useFx } from '../hooks/useFx'
import Card from '../components/ui/Card'
import MoneyText from '../components/MoneyText'
import DualMoney from '../components/DualMoney'
import FxChange from '../components/FxChange'
import PortfolioModal from '../components/PortfolioModal'
import HoldingModal from '../components/HoldingModal'
import PageHeader from '../components/PageHeader'

// Value & gain convert to the primary currency (native shown smaller); the
// per-share price stays in the stock's own currency.
function HoldingRow({ holding, quote, onEdit, convert, primary }) {
  const m = holdingMetrics(holding, quote)
  const todayUp = m.changePct != null && m.changePct >= 0
  return (
    <button onClick={() => onEdit(holding)} className="flex w-full items-center gap-3 px-2 py-3 text-left">
      <div className="min-w-0 flex-1">
        <div className="font-mono font-semibold">{holding.symbol}</div>
        <div className="truncate text-xs text-slate-500">
          {holding.shares} × {formatMoney(holding.avgCost, holding.currency)}
        </div>
        {m.hasPrice && (
          <div className="text-xs text-slate-400">
            {strings.stock.price}: {formatMoney(m.priceCents, holding.currency)}
            {m.changePct != null && (
              <span className={todayUp ? 'text-green-600' : 'text-red-600'}>
                {' '}({todayUp ? '+' : ''}{m.changePct.toFixed(2)}%)
              </span>
            )}
          </div>
        )}
      </div>
      <div className="text-right">
        {m.hasPrice ? (
          <>
            <DualMoney
              combined={singleToPrimary(m.value, holding.currency, convert, primary)}
              primary={primary}
              className="font-semibold"
              nativeClassName="text-slate-400"
              stacked
            />
            <div className="mt-0.5 flex justify-end">
              <FxChange
                combined={singleToPrimary(m.gain, holding.currency, convert, primary)}
                pct={m.gainPct}
                primary={primary}
              />
            </div>
          </>
        ) : (
          <span className="text-xs text-slate-400">{strings.stock.notFetched}</span>
        )}
      </div>
    </button>
  )
}

export default function PortfolioDetail() {
  const { portfolioId } = useParams()
  const navigate = useNavigate()
  const portfolio = useStore((s) => s.portfolios.find((p) => p.id === portfolioId))
  // Select the stable holdings array, then derive this portfolio's slice with
  // useMemo. Filtering inside the selector returns a new array each render,
  // which makes Zustand v5 think the store changed every time (infinite loop).
  const allHoldings = useStore((s) => s.holdings)
  const holdings = useMemo(
    () => allHoldings.filter((h) => h.portfolioId === portfolioId),
    [allHoldings, portfolioId]
  )

  const primary = useStore((s) => s.settings.primaryCurrency)
  const { quoteMap, loading, hasKey, error, refresh } = useQuotes(holdings)
  const { convert } = useFx(holdings.map((h) => h.currency), primary)

  const [editPf, setEditPf] = useState(false)
  const [holdingOpen, setHoldingOpen] = useState(false)
  const [editingHolding, setEditingHolding] = useState(null)
  const [sortKey, setSortKey] = useState('default')

  // Sort holdings by a metric converted to the primary currency so different
  // currencies compare fairly. Holdings missing the needed data sink to the
  // bottom regardless of direction.
  const sortedHoldings = useMemo(() => {
    if (sortKey === 'default') return holdings
    const toPrimary = (minor, cur) => {
      if (minor == null) return null
      if (cur === primary) return minor
      const c = convert(minor, cur)
      return c == null ? minor : c
    }
    const rows = holdings.map((h) => {
      const m = holdingMetrics(h, quoteMap[(h.symbol || '').toUpperCase()])
      return {
        h,
        gain: toPrimary(m.gain, h.currency),
        value: toPrimary(m.value ?? m.cost, h.currency),
        today: toPrimary(m.todayChange, h.currency),
      }
    })
    const field = sortKey.startsWith('gain') ? 'gain' : sortKey.startsWith('value') ? 'value' : 'today'
    const dir = sortKey.endsWith('Asc') ? 'asc' : 'desc'
    rows.sort((a, b) => {
      const av = a[field]
      const bv = b[field]
      if (av == null && bv == null) return 0
      if (av == null) return 1 // missing -> bottom
      if (bv == null) return -1
      return dir === 'asc' ? av - bv : bv - av
    })
    return rows.map((r) => r.h)
  }, [holdings, quoteMap, sortKey, convert, primary])

  // Portfolio removed (e.g. deleted from edit modal) -> go back to overview.
  if (!portfolio) {
    return (
      <div className="space-y-4">
        <button onClick={() => navigate('/stocks')} className="text-brand-600">
          ← {strings.stock.title}
        </button>
        <p className="text-sm text-slate-500">—</p>
      </div>
    )
  }

  const totals = totalsByCurrency(holdings, quoteMap)
  const valueC = combineToPrimary(totals, 'value', convert, primary)
  const gainC = combineToPrimary(totals, 'gain', convert, primary)
  const priced = totals.some((g) => g.priced > 0)
  const rawCost = sumField(totals, 'cost')
  const gainPct = rawCost > 0 ? (sumField(totals, 'gain') / rawCost) * 100 : 0

  const openNewHolding = () => {
    setEditingHolding(null)
    setHoldingOpen(true)
  }
  const openEditHolding = (h) => {
    setEditingHolding(h)
    setHoldingOpen(true)
  }

  return (
    <div className="space-y-5">
      <PageHeader
        icon={LineChart}
        title={portfolio.name}
        subtitle={strings.stock.positions(holdings.length)}
        onBack={() => navigate('/stocks')}
        right={
          <div className="flex items-center gap-1">
            <button
              onClick={() => setEditPf(true)}
              className="rounded-full p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label={strings.stock.editPortfolio}
            >
              <Pencil size={18} />
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

      {/* Totals */}
      <Card className="bg-gradient-to-br from-brand-600 to-brand-700 text-white">
        <p className="text-sm opacity-80">{strings.stock.totalValue}</p>
        {totals.length === 0 ? (
          <MoneyText satang={0} currency={primary} className="text-3xl font-bold" />
        ) : (
          <>
            <DualMoney combined={valueC} primary={primary} className="text-3xl font-bold" nativeClassName="text-white/70" stacked />
            {priced && (
              <div className="mt-1">
                <FxChange combined={gainC} pct={gainPct} primary={primary} onGradient />
              </div>
            )}
          </>
        )}
      </Card>

      {/* Holdings */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-500">{strings.stock.holdings}</h2>
          {holdings.length > 1 && (
            <select
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs
                dark:border-slate-700 dark:bg-slate-900"
              aria-label={strings.stock.sortLabel}
            >
              <option value="default">{strings.stock.sortLabel}</option>
              <option value="gainDesc">{strings.stock.sortGainDesc}</option>
              <option value="gainAsc">{strings.stock.sortGainAsc}</option>
              <option value="valueDesc">{strings.stock.sortValueDesc}</option>
              <option value="valueAsc">{strings.stock.sortValueAsc}</option>
              <option value="todayDesc">{strings.stock.sortTodayDesc}</option>
              <option value="todayAsc">{strings.stock.sortTodayAsc}</option>
            </select>
          )}
        </div>
        {holdings.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center
            text-sm text-slate-500 dark:border-slate-700">
            {strings.stock.emptyHoldings}
          </div>
        ) : (
          <Card className="divide-y divide-slate-100 dark:divide-slate-800">
            {sortedHoldings.map((h) => (
              <HoldingRow
                key={h.id}
                holding={h}
                quote={quoteMap[(h.symbol || '').toUpperCase()]}
                onEdit={openEditHolding}
                convert={convert}
                primary={primary}
              />
            ))}
          </Card>
        )}
      </div>

      {/* Add holding */}
      <button
        onClick={openNewHolding}
        className="fixed bottom-20 right-4 z-30 flex h-14 w-14 items-center justify-center
          rounded-full bg-brand-600 text-white shadow-lg shadow-brand-600/30
          transition hover:bg-brand-700 active:scale-95"
        style={{ marginBottom: 'env(safe-area-inset-bottom)' }}
        aria-label={strings.stock.addHolding}
      >
        <Plus size={26} />
      </button>

      <PortfolioModal
        open={editPf}
        editing={portfolio}
        onClose={() => setEditPf(false)}
        onDeleted={() => navigate('/stocks')}
      />
      <HoldingModal
        open={holdingOpen}
        portfolioId={portfolioId}
        editing={editingHolding}
        onClose={() => {
          setHoldingOpen(false)
          setEditingHolding(null)
        }}
      />
    </div>
  )
}
