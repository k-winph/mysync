import { useRef, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, FileSpreadsheet, FileText, Upload, Share2, Tags, Tag, LineChart, ExternalLink, Lock, Bell, Fingerprint, BookOpen, Download, ShieldAlert, Clock, CalendarClock, FlaskConical, Trash2, CreditCard, Brush, Settings as SettingsIcon } from 'lucide-react'
import { useStore } from '../store/useStore'
import { strings } from '../constants/strings'
import { formatDate } from '../utils/date'
import { usePwaInstall } from '../hooks/usePwaInstall'
import { exportExcel, exportCSV, importFile, shareBackup, canShareFiles, downloadBackupJSON } from '../services/exportImport'
import { PROVIDERS } from '../services/stockApi'
import { requestNotificationPermission } from '../utils/notify'
import { biometricAvailable, registerBiometric } from '../utils/webauthn'
import Card from '../components/ui/Card'
import PageHeader from '../components/PageHeader'
import { useToast } from '../components/ui/Feedback'
import CategoryManager from '../components/CategoryManager'
import TagManager from '../components/TagManager'
import PaymentMethodManager from '../components/PaymentMethodManager'
import PinSetupModal from '../components/PinSetupModal'
import ConfirmDialog from '../components/ConfirmDialog'
import AppearanceModal from '../components/AppearanceModal'

// A row with a label and a right-aligned toggle switch.
function ToggleRow({ icon: Icon, label, checked, onChange }) {
  return (
    <label className="flex cursor-pointer items-center gap-3 py-2">
      <Icon size={20} className="text-muted" />
      <span className="flex-1 font-medium">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 rounded-full transition ${
          checked ? 'bg-brand-600' : 'bg-surface-4 dark:bg-surface-3'
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
      <Icon size={20} className="text-muted" />
      <span className="flex-1 font-medium">{label}</span>
    </button>
  )
}

export default function Settings() {
  const navigate = useNavigate()
  const toast = useToast()
  const settings = useStore((s) => s.settings)
  const updateSettings = useStore((s) => s.updateSettings)
  const markBackupNow = useStore((s) => s.markBackupNow)
  const replaceData = useStore((s) => s.replaceData)
  const loadSampleData = useStore((s) => s.loadSampleData)
  const clearAllData = useStore((s) => s.clearAllData)
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
  const [methodManageOpen, setMethodManageOpen] = useState(false)
  const [appearanceOpen, setAppearanceOpen] = useState(false)
  const [importMsg, setImportMsg] = useState('')
  const [pinModal, setPinModal] = useState(null) // 'set' | 'disable' | null
  const [notifMsg, setNotifMsg] = useState('')
  const [bioAvailable, setBioAvailable] = useState(false)
  const [bioMsg, setBioMsg] = useState('')
  const [showKey, setShowKey] = useState(false)
  const [demoDialog, setDemoDialog] = useState(null) // 'load' | 'clear1' | 'clear2' | 'exit' | null

  // True when there's anything worth protecting before a destructive action.
  // (Categories alone don't count — they're seeded defaults.)
  const hasData =
    transactions.length > 0 || debts.length > 0 || portfolios.length > 0 ||
    holdings.length > 0 || savingsGoals.length > 0

  const { canInstall, install } = usePwaInstall()
  const canShare = canShareFiles()

  // Backup is "stale" if it was never done or is older than 14 days (matches the
  // notification-bell backup reminder so the two never disagree).
  const backupStale = !settings.lastBackupAt ||
    (Date.now() - new Date(settings.lastBackupAt).getTime()) / 86400000 > 14

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

  const onToggleDailyReminder = async (on) => {
    setNotifMsg('')
    if (!on) return updateSettings({ dailyReminder: false })
    const perm = await requestNotificationPermission()
    if (perm === 'granted') updateSettings({ dailyReminder: true })
    else setNotifMsg(strings.settings.notifBlocked)
  }

  const doExportExcel = () => {
    exportExcel({ transactions, categories, tags, debts, portfolios, holdings, savingsGoals })
    markBackupNow()
    toast(strings.toast.backup)
  }
  const doExportCSV = () => {
    exportCSV({ transactions })
    markBackupNow()
    toast(strings.toast.backup)
  }

  // Build the backup file and open the OS share sheet (save to Drive/Files/etc.).
  // Only count it as a backup if the share actually goes through — a user who
  // dismisses the sheet (AbortError) gets no toast and no backup timestamp.
  const doShareBackup = async () => {
    const data = { transactions, categories, tags, debts, portfolios, holdings, savingsGoals }
    try {
      const how = await shareBackup(data)
      markBackupNow()
      // 'shared' opened the share sheet; 'downloaded' means the device couldn't
      // share the .xlsx, so it was saved to Downloads instead — say which.
      toast(how === 'downloaded' ? strings.settings.savedToDownloads : strings.toast.backup)
    } catch (e) {
      // User dismissed the share sheet — do nothing.
      const cancelled = e?.name === 'AbortError' || /abort|cancel/i.test(e?.message || '')
      if (cancelled) return
      // Share failed for another reason (some Android/PWA builds reject file
      // shares) — fall back to downloading the same complete JSON backup.
      try {
        downloadBackupJSON(data)
        markBackupNow()
        toast(strings.settings.savedToDownloads)
      } catch {
        toast(strings.settings.shareFailed)
      }
    }
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
      toast(strings.toast.imported)
    } catch {
      setImportMsg(strings.settings.importError)
    }
  }

  // --- Demo mode & reset -----------------------------------------------------
  // Save a complete JSON backup to the user's device before we overwrite/erase
  // real data. Best-effort: a failed download must never block the reset.
  const backupNow = () => {
    try {
      downloadBackupJSON({ transactions, categories, tags, debts, portfolios, holdings, savingsGoals })
      markBackupNow()
    } catch {
      /* ignore — the confirm dialog still lets the user proceed */
    }
  }

  // Load sample data. If the user already has real data, confirm first and back
  // it up; if the store is empty or already showing the demo, just (re)load.
  const onLoadSample = () => {
    if (settings.demoMode || !hasData) {
      loadSampleData()
      toast(strings.toast.demoLoaded)
      return
    }
    setDemoDialog('load')
  }

  // Clear everything. Three paths: demo data -> single confirm, no backup;
  // real data -> two confirmations with an automatic backup; nothing to lose
  // -> reset straight away.
  const onClearData = () => {
    if (settings.demoMode) return setDemoDialog('exit')
    if (hasData) return setDemoDialog('clear1')
    clearAllData()
    toast(strings.toast.allCleared)
  }

  return (
    <div className="space-y-5">
      <PageHeader icon={SettingsIcon} title={strings.settings.title} subtitle={strings.pageSub.settings} />

      {/* Install app — only shown when the browser says it's installable */}
      {canInstall && (
        <button onClick={install} className="block w-full text-left">
          <Card className="flex items-center gap-3 bg-gradient-to-br from-brand-600 to-brand-700 text-white">
            <Download size={22} className="shrink-0 opacity-90" />
            <div className="flex-1">
              <div className="font-semibold">{strings.settings.installApp}</div>
              <div className="text-sm text-white/80">{strings.settings.installHint}</div>
            </div>
          </Card>
        </button>
      )}

      {/* Appearance — opens a dedicated window with every UI/look setting */}
      <div>
        <h2 className="mb-2 text-sm font-semibold text-muted">
          {strings.settings.appearance}
        </h2>
        <Card>
          <button
            onClick={() => setAppearanceOpen(true)}
            className="flex w-full items-center gap-3 py-1 text-left hover:opacity-80"
          >
            <Brush size={20} className="shrink-0 text-muted" />
            <div className="min-w-0 flex-1">
              <div className="font-medium">{strings.settings.appearance}</div>
              <p className="text-xs text-faint">{strings.settings.appearanceHint}</p>
            </div>
            <ExternalLink size={18} className="shrink-0 text-faint" />
          </button>
        </Card>
      </div>

      {/* Security & alerts */}
      <div>
        <h2 className="mb-2 text-sm font-semibold text-muted">{strings.settings.security}</h2>
        <Card className="divide-y divide-line-2 dark:divide-line-2">
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
          {settings.pinEnabled && (
            <div className="flex items-center gap-3 py-2">
              <Clock size={20} className="text-muted" />
              <span className="flex-1 font-medium">{strings.settings.autoLock}</span>
              <div className="flex rounded-lg bg-surface-2 p-0.5 dark:bg-surface-2">
                {[0, 1, 5, 15].map((m) => (
                  <button
                    key={m}
                    onClick={() => updateSettings({ autoLockMinutes: m })}
                    className={`rounded-md px-2.5 py-1 text-xs font-semibold transition ${
                      (settings.autoLockMinutes || 0) === m
                        ? 'bg-surface text-brand-600 shadow-sm dark:bg-surface-3'
                        : 'text-muted'
                    }`}
                  >
                    {m === 0 ? strings.settings.autoLockOff : `${m} ${strings.settings.minuteShort}`}
                  </button>
                ))}
              </div>
            </div>
          )}
          <ToggleRow
            icon={Bell}
            label={strings.settings.debtReminders}
            checked={settings.debtNotify}
            onChange={onToggleDebtNotify}
          />
          <ToggleRow
            icon={CalendarClock}
            label={strings.settings.dailyReminder}
            checked={settings.dailyReminder}
            onChange={onToggleDailyReminder}
          />
          {settings.dailyReminder && (
            <div className="flex items-center gap-3 py-2.5">
              <CalendarClock size={20} className="text-transparent" />
              <span className="flex-1 font-medium text-ink-2 dark:text-ink-2">
                {strings.settings.dailyReminderTime}
              </span>
              <input
                type="time"
                value={settings.dailyReminderTime || '21:00'}
                onChange={(e) => updateSettings({ dailyReminderTime: e.target.value || '21:00' })}
                className="rounded-lg border border-line-3 bg-surface px-2 py-1 text-sm dark:border-line dark:bg-surface"
              />
            </div>
          )}
        </Card>
        {settings.pinEnabled && bioAvailable && (
          <p className="mt-1 px-1 text-xs text-muted">{strings.settings.biometricHint}</p>
        )}
        {bioMsg && <p className="mt-1 px-1 text-xs font-medium text-amber-600">{bioMsg}</p>}
        <p className="mt-1 px-1 text-xs text-muted">{strings.settings.debtRemindersHint}</p>
        {settings.dailyReminder && (
          <p className="mt-1 px-1 text-xs text-muted">{strings.settings.dailyReminderHint}</p>
        )}
        {notifMsg && <p className="mt-1 px-1 text-xs font-medium text-amber-600">{notifMsg}</p>}
      </div>

      {/* Categories & tags */}
      <div>
        <Card className="divide-y divide-line-2 dark:divide-line-2">
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
          <ActionRow
            icon={CreditCard}
            label={strings.methodManage.title}
            onClick={() => setMethodManageOpen(true)}
          />
        </Card>
      </div>

      {/* Stocks */}
      <div>
        <h2 className="mb-2 text-sm font-semibold text-muted">{strings.settings.stocks}</h2>
        <Card className="space-y-3">
          <div className="flex items-center gap-3">
            <LineChart size={20} className="text-muted" />
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
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-muted
                hover:bg-surface-2 dark:hover:bg-surface-2"
              aria-label={showKey ? strings.stock.hideKey : strings.stock.showKey}
            >
              {showKey ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <p className="text-xs text-muted">{strings.settings.stockApiKeyHint}</p>
          <a
            href={PROVIDERS[settings.stockProvider || 'finnhub']?.keyUrl || PROVIDERS.finnhub.keyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm font-medium text-brand-600"
          >
            {strings.settings.getFreeKey} ({PROVIDERS[settings.stockProvider || 'finnhub']?.label})
            <ExternalLink size={14} />
          </a>

          {/* Which market's calendar day a portfolio snapshot belongs to */}
          <div className="flex items-center gap-3 border-t border-line-2 pt-3 dark:border-line-2">
            <Clock size={20} className="shrink-0 text-muted" />
            <div className="min-w-0 flex-1">
              <div className="font-medium">{strings.settings.investMarket}</div>
              <p className="text-xs text-faint">{strings.settings.investMarketHint}</p>
            </div>
            <select
              value={settings.investMarket || 'us'}
              onChange={(e) => updateSettings({ investMarket: e.target.value })}
              className="shrink-0 rounded-lg border border-line-3 bg-surface px-2 py-1.5 text-sm
                dark:border-line dark:bg-surface"
            >
              <option value="us">{strings.settings.investMarketUs}</option>
              <option value="local">{strings.settings.investMarketLocal}</option>
            </select>
          </div>
        </Card>
      </div>

      {/* Data */}
      <div>
        <h2 className="mb-2 text-sm font-semibold text-muted">{strings.settings.data}</h2>
        {backupStale && (
          <div className="mb-2 flex items-start gap-3 rounded-2xl border border-amber-300 bg-amber-50 p-3
            text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
            <ShieldAlert size={20} className="mt-0.5 shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-semibold">{strings.reminder.backupTitle}</p>
              <p className="mt-0.5 text-xs opacity-90">{strings.reminder.backupBody}</p>
              <button
                onClick={doExportExcel}
                className="mt-2 rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-semibold text-white
                  transition hover:bg-amber-600 active:scale-95"
              >
                {strings.reminder.backupAction}
              </button>
            </div>
          </div>
        )}
        <Card className="divide-y divide-line-2 dark:divide-line-2">
          {canShare && (
            <ActionRow
              icon={Share2}
              label={strings.settings.shareBackup}
              onClick={doShareBackup}
            />
          )}
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
        <p className="mt-2 px-1 text-xs text-muted">{strings.settings.importHint}</p>
        {importMsg && <p className="mt-1 px-1 text-xs font-medium text-brand-600">{importMsg}</p>}
        <p className="mt-1 px-1 text-xs text-faint">
          {strings.settings.lastBackup}:{' '}
          {settings.lastBackupAt ? formatDate(settings.lastBackupAt) : strings.settings.never}
        </p>
        <input
          ref={fileRef}
          type="file"
          accept=".xlsx,.xls,.csv,.json,.txt"
          className="hidden"
          onChange={onPickFile}
        />
      </div>

      {/* Demo / reset */}
      <div>
        <h2 className="mb-2 text-sm font-semibold text-muted">{strings.demo.title}</h2>
        {settings.demoMode && (
          <div className="mb-2 flex items-center gap-2 rounded-xl bg-amber-100 px-3 py-2 text-sm font-medium text-amber-800 dark:bg-amber-500/15 dark:text-amber-300">
            <FlaskConical size={16} className="shrink-0" />
            <span>{strings.demo.banner}</span>
          </div>
        )}
        <Card className="divide-y divide-line-2 dark:divide-line-2">
          <ActionRow icon={FlaskConical} label={strings.demo.load} onClick={onLoadSample} />
          <button
            onClick={onClearData}
            className="flex w-full items-center gap-3 py-2.5 text-left text-red-600 hover:opacity-80 dark:text-red-400"
          >
            <Trash2 size={20} />
            <span className="flex-1 font-medium">{strings.demo.clear}</span>
          </button>
        </Card>
        <p className="mt-2 px-1 text-xs text-muted">{strings.demo.loadHint}</p>
      </div>

      {/* Help */}
      <div>
        <Card className="divide-y divide-line-2 dark:divide-line-2">
          <ActionRow icon={BookOpen} label={strings.guide.title} onClick={() => navigate('/guide')} />
        </Card>
      </div>

      {/* About */}
      <div>
        <h2 className="mb-2 text-sm font-semibold text-muted">{strings.settings.about}</h2>
        <Card className="text-sm text-muted">{strings.settings.aboutText}</Card>
      </div>

      <AppearanceModal open={appearanceOpen} onClose={() => setAppearanceOpen(false)} />
      <CategoryManager open={catOpen} onClose={() => setCatOpen(false)} />
      <TagManager open={tagManageOpen} onClose={() => setTagManageOpen(false)} />
      <PaymentMethodManager open={methodManageOpen} onClose={() => setMethodManageOpen(false)} />
      <PinSetupModal open={pinModal !== null} mode={pinModal} onClose={() => setPinModal(null)} />

      {/* Load sample data over existing real data (backs up first). */}
      <ConfirmDialog
        open={demoDialog === 'load'}
        onClose={() => setDemoDialog(null)}
        onConfirm={() => {
          backupNow()
          loadSampleData()
          setDemoDialog(null)
          toast(strings.toast.demoLoaded)
        }}
        title={strings.demo.loadTitle}
        message={strings.demo.loadBody}
        note={strings.demo.loadBackupNote}
        confirmLabel={strings.demo.loadConfirm}
      />

      {/* Clear all real data — step 1: back up on continue. */}
      <ConfirmDialog
        open={demoDialog === 'clear1'}
        onClose={() => setDemoDialog(null)}
        onConfirm={() => {
          backupNow()
          setDemoDialog('clear2')
        }}
        title={strings.demo.clearTitle}
        message={strings.demo.clearBody}
        confirmLabel={strings.demo.clearNext}
        danger
      />

      {/* Clear all real data — step 2: final, irreversible confirm. */}
      <ConfirmDialog
        open={demoDialog === 'clear2'}
        onClose={() => setDemoDialog(null)}
        onConfirm={() => {
          clearAllData()
          setDemoDialog(null)
          toast(strings.toast.allCleared)
        }}
        title={strings.demo.clearFinalTitle}
        message={strings.demo.clearFinalBody}
        note={strings.demo.clearBackupNote}
        confirmLabel={strings.demo.clearFinalConfirm}
        danger
      />

      {/* Exit demo — clearing sample data, no backup needed. */}
      <ConfirmDialog
        open={demoDialog === 'exit'}
        onClose={() => setDemoDialog(null)}
        onConfirm={() => {
          clearAllData()
          setDemoDialog(null)
          toast(strings.toast.allCleared)
        }}
        title={strings.demo.exitTitle}
        message={strings.demo.exitBody}
        confirmLabel={strings.demo.exitConfirm}
        danger
      />
    </div>
  )
}
