import { useMemo, useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Plus, SlidersHorizontal, Search, Tag, X, Filter, Wallet } from 'lucide-react'
import { useStore } from '../store/useStore'
import { strings } from '../constants/strings'
import { formatDate, isWithin } from '../utils/date'
import Button from '../components/ui/Button'
import TransactionItem from '../components/TransactionItem'
import TransactionModal from '../components/TransactionModal'
import CategoryManager from '../components/CategoryManager'
import TagSummary from '../components/TagSummary'
import PageHeader from '../components/PageHeader'
import EmptyState from '../components/ui/EmptyState'

const EMPTY_FILTERS = { q: '', type: 'all', categoryId: 'all', from: '', to: '' }

export default function Transactions() {
  const transactions = useStore((s) => s.transactions)
  const categories = useStore((s) => s.categories)

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [catOpen, setCatOpen] = useState(false)
  const [tagOpen, setTagOpen] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState(EMPTY_FILTERS)
  const [searchParams, setSearchParams] = useSearchParams()

  // Preset the date filter when arriving with ?from&to (e.g. from a month card
  // on the Balance page). Runs once, then clears the params from the URL.
  useEffect(() => {
    const from = searchParams.get('from')
    const to = searchParams.get('to')
    if (from || to) {
      setFilters((f) => ({ ...f, from: from || '', to: to || '' }))
      setShowFilters(true)
      searchParams.delete('from')
      searchParams.delete('to')
      setSearchParams(searchParams, { replace: true })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const setFilter = (patch) => setFilters((f) => ({ ...f, ...patch }))
  const hasActiveFilters =
    filters.q !== '' ||
    filters.type !== 'all' ||
    filters.categoryId !== 'all' ||
    filters.from !== '' ||
    filters.to !== ''

  // Quick lookup for category names (used by search).
  const catNameById = useMemo(() => {
    const m = {}
    for (const c of categories) m[c.id] = c.name
    return m
  }, [categories])

  // Apply all filters, then group by date (newest first).
  const { grouped, count } = useMemo(() => {
    const q = filters.q.trim().toLowerCase()
    const matches = transactions.filter((t) => {
      if (filters.type !== 'all' && t.type !== filters.type) return false
      if (filters.categoryId !== 'all' && t.categoryId !== filters.categoryId) return false
      if (filters.from && t.date < filters.from) return false
      if (filters.to && t.date > filters.to) return false
      if (q) {
        const haystack = [
          t.note || '',
          (t.tags || []).join(' '),
          catNameById[t.categoryId] || '',
        ]
          .join(' ')
          .toLowerCase()
        if (!haystack.includes(q)) return false
      }
      return true
    })

    // Newest first: by date, then by creation time within the same day.
    const sorted = [...matches].sort((a, b) =>
      a.date !== b.date
        ? a.date < b.date ? 1 : -1
        : (a.createdAt || '') < (b.createdAt || '') ? 1 : -1
    )
    const groups = {}
    for (const t of sorted) (groups[t.date] ||= []).push(t)
    return { grouped: Object.entries(groups), count: matches.length }
  }, [transactions, filters, catNameById])

  const openNew = () => {
    setEditing(null)
    setFormOpen(true)
  }
  const openEdit = (tx) => {
    setEditing(tx)
    setFormOpen(true)
  }

  return (
    <div className="space-y-4">
      <PageHeader
        icon={Wallet}
        title={strings.nav.transactions}
        subtitle={strings.pageSub.records}
        right={
          <div className="flex items-center gap-1">
            <button
              onClick={() => setTagOpen(true)}
              className="rounded-full p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label={strings.tag.title}
            >
              <Tag size={20} />
            </button>
            <button
              onClick={() => setCatOpen(true)}
              className="rounded-full p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label={strings.category.manage}
            >
              <SlidersHorizontal size={20} />
            </button>
          </div>
        }
      />

      {/* Search bar + filter toggle */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search
            size={18}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            value={filters.q}
            onChange={(e) => setFilter({ q: e.target.value })}
            placeholder={strings.filter.searchHint}
            className="input-base pl-10"
          />
        </div>
        <button
          onClick={() => setShowFilters((v) => !v)}
          className={`relative rounded-xl border px-3 transition ${
            showFilters || hasActiveFilters
              ? 'border-brand-500 text-brand-600'
              : 'border-slate-300 text-slate-500 dark:border-slate-700'
          }`}
          aria-label={strings.filter.filters}
        >
          <Filter size={18} />
          {hasActiveFilters && (
            <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-brand-600" />
          )}
        </button>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-3
          dark:border-slate-800 dark:bg-slate-900">
          {/* Type */}
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-500">
              {strings.filter.type}
            </label>
            <div className="grid grid-cols-3 gap-2 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
              {[
                ['all', strings.filter.allTypes],
                ['expense', strings.tx.expense],
                ['income', strings.tx.income],
              ].map(([val, label]) => (
                <button
                  key={val}
                  onClick={() => setFilter({ type: val })}
                  className={`rounded-lg py-1.5 text-xs font-semibold transition ${
                    filters.type === val
                      ? 'bg-brand-600 text-white'
                      : 'text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-500">
              {strings.filter.category}
            </label>
            <select
              value={filters.categoryId}
              onChange={(e) => setFilter({ categoryId: e.target.value })}
              className="input-base"
            >
              <option value="all">{strings.filter.allCategories}</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Date range */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-500">
                {strings.filter.from}
              </label>
              <input
                type="date"
                value={filters.from}
                onChange={(e) => setFilter({ from: e.target.value })}
                className="input-base"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-500">
                {strings.filter.to}
              </label>
              <input
                type="date"
                value={filters.to}
                onChange={(e) => setFilter({ to: e.target.value })}
                className="input-base"
              />
            </div>
          </div>

          {hasActiveFilters && (
            <button
              onClick={() => setFilters(EMPTY_FILTERS)}
              className="flex items-center gap-1 text-sm font-medium text-brand-600"
            >
              <X size={14} /> {strings.filter.clear}
            </button>
          )}
        </div>
      )}

      {/* Result count when filtering */}
      {hasActiveFilters && (
        <p className="px-1 text-xs text-slate-500">{strings.filter.resultCount(count)}</p>
      )}

      {/* List */}
      {grouped.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
          <EmptyState
            icon={hasActiveFilters ? Search : Wallet}
            message={hasActiveFilters ? strings.tx.noResults : strings.tx.empty}
          />
        </div>
      ) : (
        <div className="space-y-4">
          {grouped.map(([date, items]) => (
            <div key={date}>
              <p className="mb-1 px-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                {formatDate(date)}
              </p>
              <div className="rounded-2xl border border-slate-200 bg-white p-1
                dark:border-slate-800 dark:bg-slate-900">
                {items.map((tx) => (
                  <TransactionItem key={tx.id} tx={tx} onEdit={openEdit} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Floating add button */}
      <button
        onClick={openNew}
        className="fixed bottom-20 right-4 z-30 flex h-14 w-14 items-center justify-center
          rounded-full bg-brand-600 text-white shadow-lg shadow-brand-600/30
          transition hover:bg-brand-700 active:scale-95"
        style={{ marginBottom: 'env(safe-area-inset-bottom)' }}
        aria-label={strings.tx.addTitle}
      >
        <Plus size={26} />
      </button>

      <TransactionModal
        open={formOpen}
        editing={editing}
        onClose={() => {
          setFormOpen(false)
          setEditing(null)
        }}
      />
      <CategoryManager open={catOpen} onClose={() => setCatOpen(false)} />
      <TagSummary open={tagOpen} onClose={() => setTagOpen(false)} />
    </div>
  )
}
