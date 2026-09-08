import * as Lucide from 'lucide-react'

// Convert a kebab-case lucide icon name ("shopping-bag") to the PascalCase
// export name lucide-react uses ("ShoppingBag").
function toPascal(name) {
  return String(name || '')
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join('')
}

// Renders a lucide icon by category icon name, with a sensible fallback.
export default function CategoryIcon({ name, size = 18, className = '' }) {
  const Icon = Lucide[toPascal(name)] || Lucide.Circle
  return <Icon size={size} className={className} />
}
