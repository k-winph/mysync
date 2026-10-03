// Persisted-store version + migration, kept in its own module so it can be
// unit-tested without pulling in the whole zustand store (which touches
// localStorage at import time).
//
// Bump STORE_VERSION whenever the persisted shape changes, and add a step to
// migratePersisted so existing users' saved data upgrades cleanly instead of
// breaking. Migrations run in order from the saved version up to STORE_VERSION.

export const STORE_VERSION = 2

// v1 -> v2: debts gained `kind` (once / recurring / installment). Old debts used
// `recurrence` ('none' | weekly | monthly | yearly); map it forward so existing
// subscriptions become 'recurring' and everything else 'once'.
export function migratePersisted(state, version) {
  if (state && version < 2 && Array.isArray(state.debts)) {
    state.debts = state.debts.map((d) => {
      const rec = d.recurrence
      return {
        ...d,
        kind: d.kind || (rec && rec !== 'none' ? 'recurring' : 'once'),
        frequency: d.frequency || (rec && rec !== 'none' ? rec : 'monthly'),
        totalInstallments: d.totalInstallments || 0,
        paidInstallments: d.paidInstallments || 0,
      }
    })
  }
  return state
}
