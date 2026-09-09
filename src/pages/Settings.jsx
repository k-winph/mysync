import { useRef, useState } from 'react'
import { Moon, EyeOff, FileSpreadsheet, FileText, Upload, Tags, Tag } from 'lucide-react'
import { useStore } from '../store/useStore'
import { strings } from '../constants/strings'
import { formatDate } from '../utils/date'
import { exportExcel, exportCSV, importFile } from '../services/exportImport'
import Card from '../components/ui/Card'
import CategoryManager from '../components/CategoryManager'
import TagManager from '../components/TagManager'

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

  const fileRef = useRef(null)
  const [catOpen, setCatOpen] = useState(false)
  const [tagManageOpen, setTagManageOpen] = useState(false)
  const [importMsg, setImportMsg] = useState('')

  const doExportExcel = () => {
    exportExcel({ transactions, categories, tags })
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
        </Card>
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
    </div>
  )
}
