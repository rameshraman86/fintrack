import { useState, useCallback } from 'react'
import { BUDGET_CATEGORIES } from '../data/budgetCategories'
import { useAppData } from '../context/AppData'
import DecimalInput from '../components/DecimalInput'
import styles from './Budget.module.css'

const CATEGORY_ICONS = {
  house: '🏠',
  car: '🚗',
  subscriptions: '📺',
  groceries: '🛒',
  internet: '🌐',
  'going-out': '🍻',
  'personal-expenses': '👤',
  'phone-bill': '📱',
  'common-shopping': '🛍️',
  travelling: '✈️',
  miscellaneous: '📦',
}

function fmt(n) {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function ChevronIcon({ open }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`${styles.chevron} ${open ? styles.chevronOpen : ''}`}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  )
}

/** Sum the budget for a single category */
function getCategoryBudget(category, budget) {
  if (category.items) {
    return category.items.reduce(
      (sum, item) => sum + (Number(budget[`${category.id}_${item.id}`]) || 0), 0)
  }
  if (category.groups) {
    let total = 0
    for (const group of category.groups) {
      for (const item of group.items) {
        total += Number(budget[`${category.id}_${group.id}_${item.id}`]) || 0
      }
    }
    return total
  }
  return Number(budget[category.id]) || 0
}

export default function Budget() {
  const { budget, setBudget } = useAppData()

  const [expanded, setExpanded] = useState({})

  const toggle = useCallback((id) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }))
  }, [])

  const allExpanded = BUDGET_CATEGORIES.every((c) => expanded[c.id])
  const toggleAll = useCallback(() => {
    if (allExpanded) {
      setExpanded({})
    } else {
      setExpanded(Object.fromEntries(BUDGET_CATEGORIES.map((c) => [c.id, true])))
    }
  }, [allExpanded])

  const totalMonthly = Object.values(budget).reduce((sum, v) => sum + (Number(v) || 0), 0)

  return (
    <div className={`${styles.page} animate-fade-in`}>
      <header className={styles.header}>
        <h1 className={styles.title}>Monthly Budget</h1>
        <p className={styles.subtitle}>
          Set your budget per category. Click a row to expand and edit amounts.
        </p>
      </header>

      <section className={styles.totalSection}>
        <div className={styles.totalCard}>
          <span className={styles.totalLabel}>Total monthly budget</span>
          <span className={`${styles.totalValue} mono`}>
            ${fmt(totalMonthly)}
          </span>
        </div>
      </section>

      <section className={styles.categories}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Categories</h2>
          <button className={styles.expandAllBtn} onClick={toggleAll} type="button">
            {allExpanded ? 'Collapse all' : 'Expand all'}
          </button>
        </div>

        <div className={styles.accordionList}>
          {BUDGET_CATEGORIES.map((category) => {
            const icon = CATEGORY_ICONS[category.id] || '💰'
            const isOpen = !!expanded[category.id]
            const catBudget = getCategoryBudget(category, budget)
            const isSimple = !category.items && !category.groups

            return (
              <div key={category.id} className={`${styles.accordion} ${isOpen ? styles.accordionOpen : ''}`}>
                {/* --- Header row --- */}
                <button
                  className={styles.accordionHeader}
                  onClick={() => toggle(category.id)}
                  type="button"
                  aria-expanded={isOpen}
                >
                  <span className={styles.accordionIcon}>{icon}</span>
                  <span className={styles.accordionName}>{category.name}</span>
                  <span className={styles.accordionMeta}>
                    <span className={`${styles.accordionAmount} mono`}>
                      ${fmt(catBudget)}
                    </span>
                    <ChevronIcon open={isOpen} />
                  </span>
                </button>

                {/* --- Expanded body --- */}
                {isOpen && (
                  <div className={styles.accordionBody}>
                    {/* Categories with items (House, Car) */}
                    {category.items && (
                      <ul className={styles.itemList}>
                        {category.items.map((item) => {
                          const key = `${category.id}_${item.id}`
                          return (
                            <li key={key} className={styles.itemRow}>
                              <label htmlFor={`b-${key}`} className={styles.itemLabel}>
                                {item.name}
                              </label>
                              <div className={styles.inputWrap}>
                                <span className={styles.currency}>$</span>
                                <DecimalInput
                                  id={`b-${key}`}
                                  className={styles.input}
                                  value={Number(budget[key]) || 0}
                                  onChange={(v) => setBudget(key, v)}
                                />
                              </div>
                            </li>
                          )
                        })}
                      </ul>
                    )}

                    {/* Categories with groups (Travelling) */}
                    {category.groups && category.groups.map((group) => (
                      <div key={group.id} className={styles.group}>
                        <h3 className={styles.groupTitle}>{group.name}</h3>
                        <ul className={styles.itemList}>
                          {group.items.map((item) => {
                            const key = `${category.id}_${group.id}_${item.id}`
                            return (
                              <li key={key} className={styles.itemRow}>
                                <label htmlFor={`b-${key}`} className={styles.itemLabel}>
                                  {item.name}
                                </label>
                                <div className={styles.inputWrap}>
                                  <span className={styles.currency}>$</span>
                                  <DecimalInput
                                    id={`b-${key}`}
                                    className={styles.input}
                                    value={Number(budget[key]) || 0}
                                    onChange={(v) => setBudget(key, v)}
                                  />
                                </div>
                              </li>
                            )
                          })}
                        </ul>
                      </div>
                    ))}

                    {/* Simple categories — single input */}
                    {isSimple && (
                      <div className={styles.simpleRow}>
                        <label htmlFor={`b-${category.id}`} className={styles.itemLabel}>
                          Amount
                        </label>
                        <div className={styles.inputWrap}>
                          <span className={styles.currency}>$</span>
                          <DecimalInput
                            id={`b-${category.id}`}
                            className={styles.input}
                            value={Number(budget[category.id]) || 0}
                            onChange={(v) => setBudget(category.id, v)}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}
