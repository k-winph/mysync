import { useMemo, useState } from 'react'
import { Info, Calculator } from 'lucide-react'
import { strings } from '../constants/strings'
import { calcTax } from '../utils/tax'
import { TAX_BRACKETS } from '../constants/taxBrackets'
import { useStore } from '../store/useStore'
import Card from '../components/ui/Card'
import Modal from '../components/ui/Modal'
import PageHeader from '../components/PageHeader'

// Format a whole-unit number for display (tax figures are whole, not minor).
function baht(n, currency = 'THB') {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      currencyDisplay: 'narrowSymbol',
      maximumFractionDigits: 0,
    }).format(Math.round(n || 0))
  } catch {
    return `${Math.round(n || 0).toLocaleString('en-US')} ${currency}`
  }
}

// Parse a user-typed money string into a number (baht).
function parseNum(text) {
  if (!text) return 0
  const v = parseFloat(String(text).replace(/[^0-9.]/g, ''))
  return Number.isNaN(v) ? 0 : v
}

// Format a raw input value with thousands separators as the user types,
// e.g. "500000" -> "500,000". Keeps only digits (whole baht).
function formatThousands(text) {
  const digits = String(text).replace(/[^0-9]/g, '')
  if (digits === '') return ''
  return Number(digits).toLocaleString('en-US')
}

function Line({ label, value, strong }) {
  return (
    <div className="flex items-center justify-between py-1 text-sm">
      <span className={strong ? 'font-semibold' : 'text-slate-600 dark:text-slate-300'}>
        {label}
      </span>
      <span className={strong ? 'font-bold' : 'font-medium'}>{value}</span>
    </div>
  )
}

export default function Tax() {
  const currency = useStore((s) => s.settings.primaryCurrency)

  const [income, setIncome] = useState('')
  const [extra, setExtra] = useState('')
  const [infoOpen, setInfoOpen] = useState(false)

  const r = useMemo(
    () => calcTax({ income: parseNum(income), extra: parseNum(extra) }),
    [income, extra]
  )

  return (
    <div className="space-y-5">
      <PageHeader
        icon={Calculator}
        title={strings.tax.title}
        subtitle={strings.tax.subtitle}
        right={
          <button
            onClick={() => setInfoOpen(true)}
            className="rounded-full p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label={strings.tax.infoAria}
          >
            <Info size={22} />
          </button>
        }
      />

      {/* Inputs */}
      <Card className="space-y-3">
        <div>
          <label className="mb-1 block text-sm font-medium">
            {strings.tax.annualIncome}{' '}
            <span className="font-normal text-slate-400">({strings.tax.perYear})</span>
          </label>
          <input
            type="text"
            inputMode="numeric"
            value={income}
            onChange={(e) => setIncome(formatThousands(e.target.value))}
            placeholder="0"
            className="input-base text-lg font-semibold"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">{strings.tax.extraDeductions}</label>
          <input
            type="text"
            inputMode="numeric"
            value={extra}
            onChange={(e) => setExtra(formatThousands(e.target.value))}
            placeholder="0"
            className="input-base"
          />
          <p className="mt-1 text-xs text-slate-400">{strings.tax.extraHint}</p>
        </div>
      </Card>

      {/* Result */}
      <Card className="bg-gradient-to-br from-brand-600 to-brand-700 text-white">
        <p className="text-sm opacity-80">{strings.tax.result}</p>
        <p className="text-3xl font-bold">{baht(r.tax, currency)}</p>
        <div className="mt-2 flex gap-4 text-sm opacity-90">
          <span>
            {strings.tax.effectiveRate}: {r.effectiveRate.toFixed(1)}%
          </span>
          <span>
            {strings.tax.afterTax}: {baht(r.income - r.tax, currency)}
          </span>
        </div>
      </Card>

      {/* Deductions breakdown */}
      <div>
        <h2 className="mb-2 text-sm font-semibold text-slate-500">{strings.tax.breakdownTitle}</h2>
        <Card>
          <Line label={strings.tax.personal} value={baht(r.personal, currency)} />
          <Line label={strings.tax.expense} value={baht(r.expense, currency)} />
          <Line label={strings.tax.extra} value={baht(r.extra, currency)} />
          <div className="my-1 border-t border-slate-100 dark:border-slate-800" />
          <Line label={strings.tax.totalDeductions} value={baht(r.deductions, currency)} strong />
          <Line label={strings.tax.taxableIncome} value={baht(r.taxable, currency)} strong />
        </Card>
      </div>

      {/* Per-bracket breakdown */}
      <div>
        <h2 className="mb-2 text-sm font-semibold text-slate-500">{strings.tax.bracketsTitle}</h2>
        <Card>
          {r.breakdown.length === 0 ? (
            <p className="py-4 text-center text-sm text-slate-500">{strings.tax.noTax}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-slate-400">
                    <th className="pb-2 font-medium">{strings.tax.band}</th>
                    <th className="pb-2 text-center font-medium">{strings.tax.rate}</th>
                    <th className="pb-2 text-right font-medium">{strings.tax.taxedAmount}</th>
                    <th className="pb-2 text-right font-medium">{strings.tax.taxAmount}</th>
                  </tr>
                </thead>
                <tbody>
                  {r.breakdown.map((b, i) => (
                    <tr key={i} className="border-t border-slate-100 dark:border-slate-800">
                      <td className="py-1.5 text-xs text-slate-500">
                        {b.from.toLocaleString()}–
                        {b.to === Infinity ? '∞' : b.to.toLocaleString()}
                      </td>
                      <td className="py-1.5 text-center">{Math.round(b.rate * 100)}%</td>
                      <td className="py-1.5 text-right">{baht(b.taxable, currency)}</td>
                      <td className="py-1.5 text-right font-semibold">{baht(b.tax, currency)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      {/* Disclaimer */}
      <div className="flex gap-2 rounded-xl bg-amber-50 p-3 text-xs text-amber-800
        dark:bg-amber-900/20 dark:text-amber-300">
        <Info size={16} className="mt-0.5 shrink-0" />
        <p>{strings.tax.disclaimer}</p>
      </div>

      {/* Info modal — quick primer on Thai personal income tax */}
      <Modal open={infoOpen} onClose={() => setInfoOpen(false)} title={strings.taxInfo.title}>
        <div className="space-y-4 text-sm leading-relaxed">
          <section>
            <h3 className="mb-1 font-semibold">{strings.taxInfo.formulaTitle}</h3>
            <p className="text-slate-600 dark:text-slate-300">{strings.taxInfo.formula}</p>
            <p className="mt-1 rounded-lg bg-slate-100 px-3 py-2 text-center text-xs font-medium
              dark:bg-slate-800">
              {strings.taxInfo.formulaLine}
            </p>
          </section>

          <section>
            <h3 className="mb-1 font-semibold">{strings.taxInfo.bracketsTitle}</h3>
            <div className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700">
              <table className="w-full text-xs">
                <tbody>
                  {TAX_BRACKETS.map((b, i) => {
                    const prev = i === 0 ? 0 : TAX_BRACKETS[i - 1].limit
                    const range =
                      b.limit === Infinity
                        ? `${prev.toLocaleString()}+`
                        : `${prev.toLocaleString()}–${b.limit.toLocaleString()}`
                    return (
                      <tr key={i} className="border-b border-slate-100 last:border-0 dark:border-slate-800">
                        <td className="px-3 py-1.5 text-slate-600 dark:text-slate-300">{range}</td>
                        <td className="px-3 py-1.5 text-right font-semibold">
                          {b.rate === 0 ? 'ยกเว้น' : `${Math.round(b.rate * 100)}%`}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h3 className="mb-1 font-semibold">{strings.taxInfo.thresholdTitle}</h3>
            <p className="text-slate-600 dark:text-slate-300">{strings.taxInfo.threshold}</p>
          </section>

          <section>
            <h3 className="mb-1 font-semibold">{strings.taxInfo.deductionsTitle}</h3>
            <p className="text-slate-600 dark:text-slate-300">{strings.taxInfo.deductions}</p>
          </section>

          <section>
            <h3 className="mb-1 font-semibold">{strings.taxInfo.otherIncomeTitle}</h3>
            <p className="text-slate-600 dark:text-slate-300">{strings.taxInfo.otherIncome}</p>
          </section>

          <section>
            <h3 className="mb-1 font-semibold">{strings.taxInfo.usageTitle}</h3>
            <p className="text-slate-600 dark:text-slate-300">{strings.taxInfo.usage}</p>
          </section>

          <div className="flex gap-2 rounded-xl bg-amber-50 p-3 text-xs text-amber-800
            dark:bg-amber-900/20 dark:text-amber-300">
            <Info size={16} className="mt-0.5 shrink-0" />
            <p>{strings.taxInfo.disclaimer}</p>
          </div>
        </div>
      </Modal>
    </div>
  )
}
