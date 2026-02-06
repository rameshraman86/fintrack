import { useState, useCallback } from 'react'
import {
  BUDGET_CATEGORIES,
  getBudgetKeys,
  EXPENSE_NOTES_CATEGORY_IDS,
} from '../data/budgetCategories'
import { useAppData } from '../context/AppData'
import DecimalInput from '../components/DecimalInput'
import styles from './Expenses.module.css'

const CATEGORY_COLORS = [
  '#22c55e', '#3b82f6', '#8b5cf6', '#f59e0b', '#ec4899', '#06b6d4',
  '#14b8a6', '#a855f7', '#eab308', '#ef4444', '#64748b',
]

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

function getCategoryColor(index) {
  return CATEGORY_COLORS[index % CATEGORY_COLORS.length]
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

/* ---------- helpers ---------- */

function getCategoryTotals(category, budget, spent, otherSpent) {
  if (category.items) {
    const mine = category.items.reduce(
      (sum, item) => sum + (Number(spent[`${category.id}_${item.id}`]) || 0), 0)
    const other = category.items.reduce(
      (sum, item) => sum + (Number(otherSpent[`${category.id}_${item.id}`]) || 0), 0)
    const bgt = category.items.reduce(
      (sum, item) => sum + (Number(budget[`${category.id}_${item.id}`]) || 0), 0)
    return { mine, other, total: mine + other, budget: bgt }
  }
  if (category.groups) {
    let mine = 0, other = 0, bgt = 0
    for (const group of category.groups) {
      for (const item of group.items) {
        const key = `${category.id}_${group.id}_${item.id}`
        mine += Number(spent[key]) || 0
        other += Number(otherSpent[key]) || 0
        bgt += Number(budget[key]) || 0
      }
    }
    return { mine, other, total: mine + other, budget: bgt }
  }
  const key = category.id
  const mine = Number(spent[key]) || 0
  const other = Number(otherSpent[key]) || 0
  const bgt = Number(budget[key]) || 0
  return { mine, other, total: mine + other, budget: bgt }
}

function fmt(n) {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

/* ================================================================ */

export default function Expenses() {
  const {
    budget,
    expenseSpent: spent,
    expenseOtherSpent: otherSpent,
    expenseNotes: notes,
    otherPersonName,
    setExpenseSpent: setSpentAmount,
    setExpenseOtherSpent: setOtherSpentAmount,
    setExpenseNote,
    setOtherPersonName,
  } = useAppData()

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

  const otherLabel = otherPersonName.trim() || 'Them'
  const otherLabelPossessive = otherPersonName.trim() ? `${otherPersonName.trim()}'s` : 'Their'

  const allKeys = getBudgetKeys(BUDGET_CATEGORIES)
  const totalSpentMine = allKeys.reduce((sum, { key }) => sum + (Number(spent[key]) || 0), 0)
  const totalSpentOther = allKeys.reduce((sum, { key }) => sum + (Number(otherSpent[key]) || 0), 0)
  const totalSpent = totalSpentMine + totalSpentOther
  const totalBudget = allKeys.reduce((sum, { key }) => sum + (Number(budget[key]) || 0), 0)
  const remaining = totalBudget - totalSpent

  return (
    <div className={`${styles.page} animate-fade-in`}>
      <header className={styles.header}>
        <h1 className={styles.title}>Expenses</h1>
        <p className={styles.subtitle}>
          Track spending per category. Click a row to expand details.
        </p>
        <div className={styles.nameField}>
          <span className={styles.nameLabel}>Sharing with</span>
          <input
            type="text"
            className={styles.nameInput}
            value={otherPersonName}
            onChange={(e) => setOtherPersonName(e.target.value)}
            placeholder="e.g. Partner, Roommate"
            maxLength={40}
          />
        </div>
      </header>

      {/* ---------- Summary ---------- */}
      <section className={styles.summary}>
        <div className={styles.summaryCard}>
          <span className={styles.summaryLabel}>Your spent</span>
          <span className={`${styles.summaryValue} mono`}>${fmt(totalSpentMine)}</span>
        </div>
        <div className={styles.summaryCard}>
          <span className={styles.summaryLabel}>{otherLabelPossessive} spent</span>
          <span className={`${styles.summaryValue} mono`}>${fmt(totalSpentOther)}</span>
        </div>
        <div className={styles.summaryCard}>
          <span className={styles.summaryLabel}>Total spent</span>
          <span className={`${styles.summaryValue} mono`}>${fmt(totalSpent)}</span>
        </div>
        <div className={styles.summaryCard}>
          <span className={styles.summaryLabel}>Budget</span>
          <span className={`${styles.summaryValue} mono`}>${fmt(totalBudget)}</span>
        </div>
        <div className={`${styles.summaryCard} ${remaining >= 0 ? styles.summaryPositive : styles.summaryNegative}`}>
          <span className={styles.summaryLabel}>Remaining</span>
          <span className={`${styles.summaryValue} mono`}>${fmt(remaining)}</span>
        </div>
      </section>

      {/* ---------- Accordion ---------- */}
      <section className={styles.categories}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Categories</h2>
          <button className={styles.expandAllBtn} onClick={toggleAll} type="button">
            {allExpanded ? 'Collapse all' : 'Expand all'}
          </button>
        </div>

        <div className={styles.accordionList}>
          {BUDGET_CATEGORIES.map((category, catIndex) => {
            const color = getCategoryColor(catIndex)
            const hasNotes = EXPENSE_NOTES_CATEGORY_IDS.includes(category.id)
            const icon = CATEGORY_ICONS[category.id] || '💰'
            const isOpen = !!expanded[category.id]
            const totals = getCategoryTotals(category, budget, spent, otherSpent)
            const balance = totals.budget - totals.total
            const pct = totals.budget > 0 ? Math.min(100, (totals.total / totals.budget) * 100) : 0

            return (
              <div key={category.id} className={`${styles.accordion} ${isOpen ? styles.accordionOpen : ''}`}>
                {/* --- Header row --- */}
                <button
                  className={styles.accordionHeader}
                  onClick={() => toggle(category.id)}
                  type="button"
                  aria-expanded={isOpen}
                >
                  <span className={styles.accordionDot} style={{ background: color, boxShadow: `0 0 6px ${color}` }} />
                  <span className={styles.accordionIcon}>{icon}</span>
                  <span className={styles.accordionName}>{category.name}</span>

                  <span className={styles.accordionMeta}>
                    <span className={`${styles.accordionAmounts} mono`}>
                      ${fmt(totals.total)}
                      <span className={styles.accordionSep}>/</span>
                      <span className={styles.accordionBudgetAmt}>${fmt(totals.budget)}</span>
                    </span>
                    <span className={`${styles.accordionBadge} ${balance >= 0 ? styles.badgePositive : styles.badgeNegative}`}>
                      ${fmt(balance)}
                    </span>
                    <span className={styles.accordionProgress}>
                      <span className={styles.accordionProgressFill} style={{ width: `${pct}%`, background: color }} />
                    </span>
                    <ChevronIcon open={isOpen} />
                  </span>
                </button>

                {/* --- Expanded body --- */}
                {isOpen && (
                  <div className={styles.accordionBody}>
                    {/* Categories with items (House, Car) */}
                    {category.items && (
                      <ul className={styles.subList}>
                        {category.items.map((item) => {
                          const key = `${category.id}_${item.id}`
                          const itemBudget = Number(budget[key]) || 0
                          return (
                            <li key={key} className={styles.subRow}>
                              <span className={styles.subLabel}>{item.name}</span>
                              <span className={styles.subInputs}>
                                <DecimalInput
                                  placeholder="You"
                                  className={styles.amountInput}
                                  value={Number(spent[key]) || 0}
                                  onChange={(v) => setSpentAmount(key, v)}
                                />
                                <DecimalInput
                                  placeholder={otherLabel}
                                  className={styles.amountInput}
                                  value={Number(otherSpent[key]) || 0}
                                  onChange={(v) => setOtherSpentAmount(key, v)}
                                />
                                <span className={styles.subSep}>/</span>
                                <span className={styles.budgetReadOnly} title="Set on Budget page">
                                  ${fmt(itemBudget)}
                                </span>
                              </span>
                            </li>
                          )
                        })}
                      </ul>
                    )}

                    {/* Categories with groups (Travelling) */}
                    {category.groups && category.groups.map((group) => (
                      <div key={group.id} className={styles.group}>
                        <div className={styles.groupTitle}>{group.name}</div>
                        <ul className={styles.subList}>
                          {group.items.map((item) => {
                            const key = `${category.id}_${group.id}_${item.id}`
                            const itemBudget = Number(budget[key]) || 0
                            return (
                              <li key={key} className={styles.subRow}>
                                <span className={styles.subLabel}>{item.name}</span>
                                <span className={styles.subInputs}>
                                  <DecimalInput
                                    placeholder="You"
                                    className={styles.amountInput}
                                    value={Number(spent[key]) || 0}
                                    onChange={(v) => setSpentAmount(key, v)}
                                  />
                                  <DecimalInput
                                    placeholder={otherLabel}
                                    className={styles.amountInput}
                                    value={Number(otherSpent[key]) || 0}
                                    onChange={(v) => setOtherSpentAmount(key, v)}
                                  />
                                  <span className={styles.subSep}>/</span>
                                  <span className={styles.budgetReadOnly} title="Set on Budget page">
                                    ${fmt(itemBudget)}
                                  </span>
                                </span>
                              </li>
                            )
                          })}
                        </ul>
                      </div>
                    ))}

                    {/* Simple categories — inline inputs */}
                    {!category.items && !category.groups && (
                      <div className={styles.simpleInputs}>
                        <label className={styles.inlineLabel}>
                          You
                          <DecimalInput
                            className={styles.amountInput}
                            value={totals.mine}
                            onChange={(v) => setSpentAmount(category.id, v)}
                          />
                        </label>
                        <label className={styles.inlineLabel}>
                          {otherLabel}
                          <DecimalInput
                            className={styles.amountInput}
                            value={totals.other}
                            onChange={(v) => setOtherSpentAmount(category.id, v)}
                          />
                        </label>
                        <label className={styles.inlineLabel}>
                          Budget
                          <span className={styles.budgetReadOnly} title="Set on Budget page">
                            ${fmt(totals.budget)}
                          </span>
                        </label>
                      </div>
                    )}

                    {/* Notes */}
                    {hasNotes && (
                      <div className={styles.notesBlock}>
                        <label htmlFor={`notes-${category.id}`} className={styles.notesLabel}>
                          Notes
                        </label>
                        <textarea
                          id={`notes-${category.id}`}
                          className={styles.notesInput}
                          value={notes[category.id] ?? ''}
                          onChange={(e) => setExpenseNote(category.id, e.target.value)}
                          placeholder="e.g. gym (56.49), gdrive (13.2)..."
                          rows={3}
                        />
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
