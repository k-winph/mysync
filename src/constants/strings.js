// Centralized UI strings. Keeping all copy in one place so a Thai translation
// (phase 3, via i18next) can be added later without touching components.
export const strings = {
  appName: 'MySync',

  nav: {
    dashboard: 'Dashboard',
    transactions: 'Transactions',
    settings: 'Settings',
  },

  common: {
    add: 'Add',
    edit: 'Edit',
    delete: 'Delete',
    save: 'Save',
    cancel: 'Cancel',
    confirm: 'Confirm',
    close: 'Close',
    optional: 'optional',
    all: 'All',
    none: 'None',
    today: 'Today',
  },

  dashboard: {
    title: 'This Month',
    income: 'Income',
    expense: 'Expense',
    balance: 'Balance',
    recent: 'Recent transactions',
    empty: 'No transactions yet. Tap + to add your first one.',
    topCategories: 'Top spending',
  },

  tx: {
    income: 'Income',
    expense: 'Expense',
    amount: 'Amount',
    category: 'Category',
    tags: 'Tags',
    tagsHint: 'Comma separated, e.g. trip, work',
    note: 'Note',
    date: 'Date',
    addTitle: 'Add transaction',
    editTitle: 'Edit transaction',
    deleteConfirm: 'Delete this transaction?',
    empty: 'No transactions.',
    pickCategory: 'Select a category',
  },

  category: {
    manage: 'Manage categories',
    name: 'Category name',
    type: 'Type',
    both: 'Both',
    addTitle: 'Add category',
    deleteConfirm: 'Delete this category? Transactions using it will keep their record but show as uncategorized.',
    defaultBadge: 'default',
  },

  settings: {
    title: 'Settings',
    appearance: 'Appearance',
    darkMode: 'Dark mode',
    hideBalances: 'Hide balances',
    data: 'Data',
    exportExcel: 'Export to Excel',
    exportCsv: 'Export to CSV',
    importFile: 'Import from file',
    importHint: 'Import a previously exported .xlsx or .csv backup.',
    importDone: 'Import complete.',
    importError: 'Could not read that file. Make sure it is a MySync export.',
    lastBackup: 'Last backup',
    never: 'never',
    about: 'About',
    aboutText: 'MySync keeps all your data on this device only. Back up regularly via export.',
  },
}
