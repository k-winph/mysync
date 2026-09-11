import { useRef, useState, useEffect } from 'react'
import { Moon, Eye, EyeOff, FileSpreadsheet, FileText, Upload, Tags, Tag, LineChart, ExternalLink, Lock, Bell, Fingerprint, Languages, Coins } from 'lucide-react'
import { useStore } from '../store/useStore'
import { strings } from '../constants/strings'
import { CURRENCIES } from '../utils/money'
import { formatDate } from '../utils/date'
import { exportExcel, exportCSV, importFile } from '../services/exportImport'
import { PROVIDERS } from '../services/stockApi'
import { requestNotificationPermission } from '../utils/notify'
import { biometricAvailable, registerBiometric } from '../utils/webauthn'
import Card from '../components/ui/Card'
import CategoryManager from '../components/CategoryManager'
import TagManager from '../components/TagManager'
import PinSetupModal from '../components/PinSetupModal'

// A row with a label and a right-aligned toggle switch.
function ToggleRow({ icon: Icon, label, checked, onChange }) {
  return (
    <label className="flex cursor-pointer items-center gap-3 py-2">
      <Icon size={20} className="text-slate-500" />
      <span className="flex-1 font-medium">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 rounded-full transition ${
          checked ? 'bg-brand-600' : 'bg-slate-300 dark:bg-slate-700'
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition ${
            checked ? 'left-[22px]' : 'left-0.5'
          }`}
        />
      </button>
    </label>
  )
}

// A tappable action row (for export/import/manage).
function ActionRow({ icon: Icon, label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-3 py-2.5 text-left hover:opacity-80"
    >
      <Icon size={20} className="text-slate-500" />
      <span className="flex-1 font-medium">{label}</span>
    </button>
  )
}

export default function Settings() {
  const settings = useStore((s) => s.settings)
  const updateSettings = useStore((s) => s.updateSettings)
  const markBackupNow = useStore((s) => s.markBackupNow)
  const replaceData = useStore((s) => s.replaceData)
  const syncTagsFromTransactions = useStore((s) => s.syncTagsFromTransactions)
  const transactions = useStore((s) => s.transactions)
  const categories = useStore((s) => s.categories)
  const tags = useStore((s) => s.tags)
  const debts = useStore((s) => s.debts)
  const portfolios = useStore((s) => s.portfolios)
  const holdings = useStore((s) => s.holdings)
  const savingsGoals = useStore((s) => s.savingsGoals)

  const fileRef = useRef(null)
  const [catOpen, setCatOpen] = useState(false)
  const [tagManageOpen, setTagManageOpen] = useState(false)
  const [importMsg, setImportMsg] = useState('')
  const [pinModal, setPinModal] = useState(null) // 'set' | 'disable' | null
  const [notifMsg, setNotifMsg] = useState('')
  const [bioAvailable, setBioAvailable] = useState(false)
  const [bioMsg, setBioMsg] = useState('')
  const [showKey, setShowKey] = useState(false)

  useEffect(() => {
    biometricAvailable().then(setBioAvailable)
  }, [])

  const onToggleBiometric = async (on) => {
    setBioMsg('')
    if (!on) return updateSettings({ biometricEnabled: false, biometricCredId: null })
    if (!bioAvailable) return setBioMsg(strings.settings.biometricUnavailable)
    try {
      const credId = await registerBiometric()
      updateSettings({ biometricEnabled: true, biometricCredId: credId })
    } catch {
      setBioMsg(strings.settings.biometricFailed)
    }
  }

  // Turning the PIN on/off both go through the PIN modal (set requires entering
  // it twice; turning off requires the current PIN).
  const onToggleLock = (on) => setPinModal(on ? 'set' : 'disable')

  const onToggleDebtNotify = async (on) => {
    setNotifMsg('')
    if (!on) return updateSettings({ debtNotify: false })
    const perm = await requestNotificationPermission()
    if (perm === 'granted') updateSettings({ debtNotify: true })
    else setNotifMsg(strings.settings.notifBlocked)
  }

  const doExportExcel = () => {
    exportExcel({ transactions, categories, tags, debts, portfolios, holdings, savingsGoals })
    markBackupNow()
  }
  const doExportCSV = () => {
    exportCSV({ transactions })
    markBackupNow()
  }

  const onPickFile = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = '' // allow re-importing the same file
    if (!file) return
    try {
      const data = await importFile(file)
      // CSV imports only carry transactions -> keep current categories/tags.
      replaceData({
        transactions: data.transactions,
        categories: data.categories ?? categories,
        tags: data.tags ?? tags,
        debts: data.debts ?? debts,
        portfolios: data.portfolios ?? portfolios,
        holdings: data.holdings ?? holdings,
        savingsGoals: data.savingsGoals ?? savingsGoals,
      })
      // Make sure any tag names inside imported transactions become chips too.
      syncTagsFromTransactions()
      setImportMsg(strings.settings.importDone)
    } catch {
      setImportMsg(strings.settings.importError)
    }
  }

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold">{strings.settings.title}</h1>

      {/* Appearance */}
      <div>
        <h2 className="mb-2 text-sm font-semibold text-slate-500">
          {strings.settings.appearance}
        </h2>
        <Card className="divide-y divide-slate-100 dark:divide-slate-800">
          <ToggleRow
            icon={Moon}
            label={strings.settings.darkMode}
            checked={settings.theme === 'dark'}
            onChange={(v) => updateSettings({ theme: v ? 'dark' : 'light' })}
          />
          <ToggleRow
            icon={EyeOff}
            label={strings.settings.hideBalances}
            checked={settings.hideBalances}
            onChange={(v) => updateSettings({ hideBalances: v })}
          />

          {/* Language */}
          <div className="flex items-center gap-3 py-2">
            <Languages size={20} className="text-slate-500" />
            <span className="flex-1 font-medium">{strings.settings.language}</span>
            <div className="flex rounded-lg bg-slate-100 p-0.5 dark:bg-slate-800">
              {[
                ['en', 'EN'],
                ['th', 'ไทย'],
              ].map(([val, label]) => (
                <button
                  key={val}
                  onClick={() => updateSettings({ language: val })}
                  className={`rounded-md px-3 py-1 text-sm font-semibold transition ${
                    settings.language === val
                      ? 'bg-white text-brand-600 shadow-sm dark:bg-slate-700'
                      : 'text-slate-500'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Primary currency */}
          <div className="flex items-center gap-3 py-2">
            <Coins size={20} className="text-slate-500" />
            <span className="flex-1 font-medium">{strings.settings.currency}</span>
            <select
              value={settings.primaryCurrency}
              onChange={(e) => updateSettings({ primaryCurrency: e.target.value })}
              className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm
                dark:border-slate-700 dark:bg-slate-900"
            >
              {CURRENCIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </Card>
        <p className="mt-1 px-1 text-xs text-slate-500">{strings.settings.currencyNote}</p>
      </div>

      {/* Security & alerts */}
      <div>
        <h2 className="mb-2 text-sm font-semibold text-slate-500">{strings.settings.security}</h2>
        <Card className="divide-y divide-slate-100 dark:divide-slate-800">
          <ToggleRow
            icon={Lock}
            label={strings.settings.appLock}
            checked={settings.pinEnabled}
            onChange={onToggleLock}
          />
          {settings.pinEnabled && bioAvailable && (
            <ToggleRow
              icon={Fingerprint}
              label={strings.settings.biometric}
              checked={settings.biometricEnabled}
              onChange={onToggleBiometric}
            />
          )}
          <ToggleRow
            icon={Bell}
            label={strings.settings.debtReminders}
            checked={settings.debtNotify}
            onChange={onToggleDebtNotify}
          />
        </Card>
        {settings.pinEnabled && bioAvailable && (
          <p className="mt-1 px-1 text-xs text-slate-500">{strings.settings.biometricHint}</p>
        )}
        {bioMsg && <p className="mt-1 px-1 text-xs font-medium text-amber-600">{bioMsg}</p>}
        <p className="mt-1 px-1 text-xs text-slate-500">{strings.settings.debtRemindersHint}</p>
        {notifMsg && <p className="mt-1 px-1 text-xs font-medium text-amber-600">{notifMsg}</p>}
      </div>

      {/* Categories & tags */}
      <div>
        <Card className="divide-y divide-slate-100 dark:divide-slate-800">
          <ActionRow
            icon={Tags}
            label={strings.category.manage}
            onClick={() => setCatOpen(true)}
          />
          <ActionRow
            icon={Tag}
            label={strings.tagManage.title}
            onClick={() => setTagManageOpen(true)}
          />
        </Card>
      </div>

      {/* Stocks */}
      <div>
        <h2 className="mb-2 text-sm font-semibold text-slate-500">{strings.settings.stocks}</h2>
        <Card className="space-y-3">
          <div className="flex items-center gap-3">
            <LineChart size={20} className="text-slate-500" />
            <span className="flex-1 font-medium">{strings.settings.stockApiKey}</span>
          </div>
          <div className="relative">
            <input
              type={showKey ? 'text' : 'password'}
              value={settings.stockApiKey || ''}
              onChange={(e) => updateSettings({ stockApiKey: e.target.value.trim() })}
              placeholder="••••••••••••"
              autoCorrect="off"
              autoCapitalize="none"
              spellCheck={false}
              className="input-base pr-11 font-mono text-sm"
            />
            <button
              type="button"
              onClick={() => setShowKey((v) => !v)}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-slate-500
                hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label={showKey ? strings.stock.hideKey : strings.stock.showKey}
            >
              {showKey ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <p className="text-xs text-slate-500">{strings.settings.stockApiKeyHint}</p>
          <a
            href={PROVIDERS[settings.stockProvider || 'finnhub']?.keyUrl || PROVIDERS.finnhub.keyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm font-medium text-brand-600"
          >
            {strings.settings.getFreeKey} ({PROVIDERS[settings.stockProvider || 'finnhub']?.label})
            <ExternalLink size={14} />
          </a>
        </Card>
      </div>

      {/* Data */}
      <div>
        <h2 className="mb-2 text-sm font-semibold text-slate-500">{strings.settings.data}</h2>
        <Card className="divide-y divide-slate-100 dark:divide-slate-800">
          <ActionRow
            icon={FileSpreadsheet}
            label={strings.settings.exportExcel}
            onClick={doExportExcel}
          />
          <ActionRow icon={FileText} label={strings.settings.exportCsv} onClick={doExportCSV} />
          <ActionRow
            icon={Upload}
            label={strings.settings.importFile}
            onClick={() => fileRef.current?.click()}
          />
        </Card>
        <p className="mt-2 px-1 text-xs text-slate-500">{strings.settings.importHint}</p>
        {importMsg && <p className="mt-1 px-1 text-xs font-medium text-brand-600">{importMsg}</p>}
        <p className="mt-1 px-1 text-xs text-slate-400">
          {strings.settings.lastBackup}:{' '}
          {settings.lastBackupAt ? formatDate(settings.lastBackupAt) : strings.settings.never}
        </p>
        <input
          ref={fileRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          className="hidden"
          onChange={onPickFile}
        />
      </div>

      {/* About */}
      <div>
        <h2 className="mb-2 text-sm font-semibold text-slate-500">{strings.settings.about}</h2>
        <Card className="text-sm text-slate-500">{strings.settings.aboutText}</Card>
      </div>

      <CategoryManager open={catOpen} onClose={() => setCatOpen(false)} />
      <TagManager open={tagManageOpen} onClose={() => setTagManageOpen(false)} />
      <PinSetupModal open={pinModal !== null} mode={pinModal} onClose={() => setPinModal(null)} />
    </div>
  )
}
