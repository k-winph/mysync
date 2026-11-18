import { useStore } from '../store/useStore'
import { strings } from '../constants/strings'
import { ACCENTS } from '../constants/accents'
import { THEMES } from '../constants/themes'
import { CURRENCIES } from '../utils/money'
import {
  Moon, EyeOff, Vibrate, Palette, Zap, Snowflake, PartyPopper,
  Languages, Coins, LineChart, PiggyBank, TrendingUp, Check,
} from 'lucide-react'
import Modal from './ui/Modal'
import Card from './ui/Card'

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

// "Appearance" — one window gathering every UI/look setting. Opened from a
// single row in Settings so the Settings page stays tidy.
export default function AppearanceModal({ open, onClose }) {
  const settings = useStore((s) => s.settings)
  const updateSettings = useStore((s) => s.updateSettings)

  return (
    <Modal open={open} onClose={onClose} title={strings.settings.appearance}>
      <div className="space-y-5">
        <Card className="divide-y divide-line-2 dark:divide-line-2">
          {/* UI theme — visual preview picker (more themes can be added) */}
          <div className="py-2">
            <div className="mb-2 flex items-center gap-3">
              <Palette size={20} className="shrink-0 text-muted" />
              <span className="flex-1 font-medium">{strings.settings.uiTheme}</span>
            </div>
            <div className="no-scrollbar flex gap-3 overflow-x-auto pb-1">
              {THEMES.map((t) => {
                const active = (settings.uiTheme || 'default') === t.id
                const p = t.preview
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => updateSettings({ uiTheme: t.id })}
                    aria-pressed={active}
                    className={`shrink-0 rounded-xl border-2 p-1.5 transition ${active ? 'border-brand-500' : 'border-line'}`}
                  >
                    <div className="w-24 rounded-lg p-2" style={{ background: p.bg }}>
                      <div
                        className="p-2"
                        style={{
                          background: p.surface,
                          border: `2px solid ${p.ink}`,
                          borderRadius: p.radius,
                          boxShadow: p.pixel ? `2px 2px 0 ${p.ink}` : '0 1px 2px rgba(0,0,0,.12)',
                        }}
                      >
                        <div style={{ color: p.ink, fontFamily: p.pixel ? "'Silkscreen', monospace" : 'inherit', fontSize: 11, fontWeight: 700, lineHeight: 1.3 }}>
                          Aa 123
                        </div>
                        <div className="mt-1.5 h-1.5 w-3/4" style={{ background: p.accent, borderRadius: p.pixel ? 0 : 3 }} />
                        <div className="mt-1 h-1.5 w-1/2" style={{ background: p.ink, opacity: 0.25, borderRadius: p.pixel ? 0 : 3 }} />
                      </div>
                    </div>
                    <div className={`mt-1.5 text-center text-xs font-semibold ${active ? 'text-brand-600' : 'text-muted'}`}>
                      {t.label}{active ? ' ✓' : ''}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

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
          <ToggleRow
            icon={Vibrate}
            label={strings.settings.haptics}
            checked={settings.haptics !== false}
            onChange={(v) => updateSettings({ haptics: v })}
          />

          {/* Accent color */}
          <div className="flex items-center gap-3 py-2">
            <Palette size={20} className="shrink-0 text-muted" />
            <span className="flex-1 font-medium">{strings.settings.accentColor}</span>
            <div className="flex gap-2">
              {ACCENTS.map((a) => {
                const active = (settings.accent || 'indigo') === a.id
                return (
                  <button
                    key={a.id}
                    onClick={() => updateSettings({ accent: a.id })}
                    className={`flex h-7 w-7 items-center justify-center rounded-full transition ${
                      active ? 'ring-2 ring-offset-2 ring-line-strong dark:ring-offset-surface' : ''
                    }`}
                    style={{ backgroundColor: a.swatch }}
                    aria-label={a.label}
                  >
                    {active && <Check size={14} className="text-white" />}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Animation speed */}
          <div className="flex items-center gap-3 py-2">
            <Zap size={20} className="text-muted" />
            <span className="flex-1 font-medium">{strings.settings.animSpeed}</span>
            <div className="flex rounded-lg bg-surface-2 p-0.5 dark:bg-surface-2">
              {[
                ['off', strings.settings.animOff],
                ['normal', strings.settings.animNormal],
                ['fast', strings.settings.animFast],
              ].map(([val, label]) => (
                <button
                  key={val}
                  onClick={() => updateSettings({ animSpeed: val })}
                  className={`rounded-md px-3 py-1 text-sm font-semibold transition ${
                    (settings.animSpeed || 'fast') === val
                      ? 'bg-surface text-brand-600 shadow-sm dark:bg-surface-3'
                      : 'text-muted'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Seasonal background effect */}
          <div className="flex items-center gap-3 py-2">
            <Snowflake size={20} className="shrink-0 text-muted" />
            <div className="min-w-0 flex-1">
              <div className="font-medium">{strings.settings.seasonalEffect}</div>
              <p className="text-xs text-faint">{strings.settings.seasonalHint}</p>
            </div>
            <select
              value={settings.seasonalEffect || 'off'}
              onChange={(e) => updateSettings({ seasonalEffect: e.target.value })}
              className="shrink-0 rounded-lg border border-line-3 bg-surface px-2 py-1.5 text-sm
                dark:border-line dark:bg-surface"
            >
              <option value="off">{strings.settings.seasonOff}</option>
              <option value="auto">{strings.settings.seasonAuto}</option>
              <option value="snow">{strings.settings.seasonSnow}</option>
              <option value="leaves">{strings.settings.seasonLeaves}</option>
              <option value="sakura">{strings.settings.seasonSakura}</option>
              <option value="rain">{strings.settings.seasonRain}</option>
              <option value="hearts">{strings.settings.seasonHearts}</option>
            </select>
          </div>

          {/* Celebration confetti */}
          <div className="flex items-center gap-3 py-2">
            <PartyPopper size={20} className="shrink-0 text-muted" />
            <div className="min-w-0 flex-1">
              <div className="font-medium">{strings.settings.celebrations}</div>
              <p className="text-xs text-faint">{strings.settings.celebrationsHint}</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={settings.celebrations !== false}
              onClick={() => updateSettings({ celebrations: settings.celebrations === false })}
              className={`relative h-6 w-11 shrink-0 rounded-full transition ${
                settings.celebrations !== false ? 'bg-brand-600' : 'bg-surface-4 dark:bg-surface-3'
              }`}
            >
              <span
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition ${
                  settings.celebrations !== false ? 'left-[22px]' : 'left-0.5'
                }`}
              />
            </button>
          </div>

          {/* Language */}
          <div className="flex items-center gap-3 py-2">
            <Languages size={20} className="text-muted" />
            <span className="flex-1 font-medium">{strings.settings.language}</span>
            <div className="flex rounded-lg bg-surface-2 p-0.5 dark:bg-surface-2">
              {[
                ['en', 'EN'],
                ['th', 'ไทย'],
              ].map(([val, label]) => (
                <button
                  key={val}
                  onClick={() => updateSettings({ language: val })}
                  className={`rounded-md px-3 py-1 text-sm font-semibold transition ${
                    settings.language === val
                      ? 'bg-surface text-brand-600 shadow-sm dark:bg-surface-3'
                      : 'text-muted'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Primary currency */}
          <div className="flex items-center gap-3 py-2">
            <Coins size={20} className="text-muted" />
            <span className="flex-1 font-medium">{strings.settings.currency}</span>
            <select
              value={settings.primaryCurrency}
              onChange={(e) => updateSettings({ primaryCurrency: e.target.value })}
              className="rounded-lg border border-line-3 bg-surface px-2 py-1.5 text-sm
                dark:border-line dark:bg-surface"
            >
              {CURRENCIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </Card>
        <p className="-mt-3 px-1 text-xs text-muted">{strings.settings.currencyNote}</p>

        {/* Home screen cards — let people hide features they don't use */}
        <div>
          <h3 className="mb-2 text-sm font-semibold text-muted">{strings.settings.homeCards}</h3>
          <Card className="divide-y divide-line-2 dark:divide-line-2">
            <ToggleRow
              icon={LineChart}
              label={strings.settings.showInvestments}
              checked={settings.showInvestments !== false}
              onChange={(v) => updateSettings({ showInvestments: v })}
            />
            <ToggleRow
              icon={PiggyBank}
              label={strings.settings.showSavings}
              checked={settings.showSavings !== false}
              onChange={(v) => updateSettings({ showSavings: v })}
            />
            <ToggleRow
              icon={TrendingUp}
              label={strings.settings.showTrend}
              checked={settings.showTrend !== false}
              onChange={(v) => updateSettings({ showTrend: v })}
            />
          </Card>
        </div>
      </div>
    </Modal>
  )
}
