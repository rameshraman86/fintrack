import { useState, useCallback } from 'react'
import {
  BUDGET_CATEGORIES,
  getBudgetKeys,
  getInitialBudgetState,
  EXPENSE_NOTES_CATEGORY_IDS,
} from '../data/budgetCategories'
import styles from './Expenses.module.css'

const CATEGORY_COLORS = [
  '#22c55e', '#3b82f6', '#8b5cf6', '#f59e0b', '#ec4899', '#06b6d4',
  '#14b8a6', '#a855f7', '#eab308', '#ef4444', '#64748b',
]

function getCategoryColor(index) {
  return CATEGORY_COLORS[index % CATEGORY_COLORS.length]
}

export default function Expenses() {
  const [otherPersonName, setOtherPersonName] = useState('')
  const [spent, setSpent] = useState(() => getInitialBudgetState(BUDGET_CATEGORIES))
  const [otherSpent, setOtherSpent] = useState(() => getInitialBudgetState(BUDGET_CATEGORIES))
  const [budget, setBudget] = useState(() => getInitialBudgetState(BUDGET_CATEGORIES))
  const [notes, setNotes] = useState(() =>
    Object.fromEntries(EXPENSE_NOTES_CATEGORY_IDS.map((id) => [id, '']))
  )

  const otherLabel = otherPersonName.trim() || 'Them'
  const otherLabelPossessive = otherPersonName.trim() ? `${otherPersonName.trim()}'s` : 'Their'

  const setSpentAmount = useCallback((key, value) => {
    setSpent((prev) => ({ ...prev, [key]: value }))
  }, [])
  const setOtherSpentAmount = useCallback((key, value) => {
    setOtherSpent((prev) => ({ ...prev, [key]: value }))
  }, [])
  const setBudgetAmount = useCallback((key, value) => {
    setBudget((prev) => ({ ...prev, [key]: value }))
  }, [])
  const setNote = useCallback((categoryId, value) => {
    setNotes((prev) => ({ ...prev, [categoryId]: value }))
  }, [])

  const allKeys = getBudgetKeys(BUDGET_CATEGORIES)
  const totalSpentMine = allKeys.reduce((sum, { key }) => sum + (spent[key] ?? 0), 0)
  const totalSpentOther = allKeys.reduce((sum, { key }) => sum + (otherSpent[key] ?? 0), 0)
  const totalSpent = totalSpentMine + totalSpentOther
  const totalBudget = allKeys.reduce((sum, { key }) => sum + (budget[key] ?? 0), 0)
  const remaining = totalBudget - totalSpent

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Expenses by Category</h1>
        <p className={styles.subtitle}>
          Track your spending and, if sharing expenses, how much the other person spent per category.
        </p>
        <label className={styles.nameField}>
          <span className={styles.nameLabel}>Sharing expenses with</span>
          <input
            type="text"
            className={styles.nameInput}
            value={otherPersonName}
            onChange={(e) => setOtherPersonName(e.target.value)}
            placeholder="e.g. Partner, Roommate"
            maxLength={40}
          />
        </label>
      </header>

      <section className={styles.summary}>
        <div className={styles.summaryCard}>
          <span className={styles.summaryLabel}>Your spent</span>
          <span className={`${styles.summaryValue} mono`}>
            ${totalSpentMine.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </span>
        </div>
        <div className={styles.summaryCard}>
          <span className={styles.summaryLabel}>{otherLabelPossessive} spent</span>
          <span className={`${styles.summaryValue} mono`}>
            ${totalSpentOther.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </span>
        </div>
        <div className={styles.summaryCard}>
          <span className={styles.summaryLabel}>Total spent</span>
          <span className={`${styles.summaryValue} mono`}>
            ${totalSpent.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </span>
        </div>
        <div className={styles.summaryCard}>
          <span className={styles.summaryLabel}>Total budget</span>
          <span className={`${styles.summaryValue} mono`}>
            ${totalBudget.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </span>
        </div>
        <div className={`${styles.summaryCard} ${remaining >= 0 ? styles.summaryPositive : styles.summaryNegative}`}>
          <span className={styles.summaryLabel}>Remaining</span>
          <span className={`${styles.summaryValue} mono`}>
            ${remaining.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </span>
        </div>
      </section>

      <section className={styles.categories}>
        <h2 className={styles.sectionTitle}>Categories</h2>
        <p className={styles.legend}>
          For shared expenses, enter your amount in <strong>You</strong> and the other person’s in <strong>{otherLabel}</strong>. Category totals and progress use both.
        </p>
        <div className={styles.categoryGrid}>
          {BUDGET_CATEGORIES.map((category, catIndex) => {
            const color = getCategoryColor(catIndex)
            const hasNotes = EXPENSE_NOTES_CATEGORY_IDS.includes(category.id)

            if (category.items) {
              const categorySpentMine = category.items.reduce(
                (sum, item) => sum + (spent[`${category.id}_${item.id}`] ?? 0),
                0
              )
              const categorySpentOther = category.items.reduce(
                (sum, item) => sum + (otherSpent[`${category.id}_${item.id}`] ?? 0),
                0
              )
              const categorySpent = categorySpentMine + categorySpentOther
              const categoryBudget = category.items.reduce(
                (sum, item) => sum + (budget[`${category.id}_${item.id}`] ?? 0),
                0
              )
              const pct = categoryBudget > 0 ? Math.min(100, (categorySpent / categoryBudget) * 100) : 0
              return (
                <article key={category.id} className={styles.categoryCard}>
                  <div className={styles.categoryHeader}>
                    <span className={styles.categoryDot} style={{ background: color }} aria-hidden />
                    <span className={styles.categoryName}>{category.name}</span>
                  </div>
                  <div className={styles.categoryAmounts}>
                    <span className="mono">${categorySpent.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                    <span className={styles.categorySeparator}>/</span>
                    <span className={`mono ${styles.categoryBudget}`}>
                      ${categoryBudget.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className={styles.progressTrack}>
                    <div className={styles.progressFill} style={{ width: `${pct}%`, background: color }} />
                  </div>
                  <ul className={styles.subList}>
                    {category.items.map((item) => {
                      const key = `${category.id}_${item.id}`
                      const itemSpent = spent[key] ?? 0
                      const itemOther = otherSpent[key] ?? 0
                      const itemBudget = budget[key] ?? 0
                      return (
                        <li key={key} className={styles.subRow}>
                          <span className={styles.subLabel}>{item.name}</span>
                          <span className={styles.subInputs}>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              placeholder="You"
                              className={styles.amountInput}
                              value={itemSpent || ''}
                              onChange={(e) => setSpentAmount(key, parseFloat(e.target.value) || 0)}
                            />
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              placeholder={otherLabel}
                              className={styles.amountInput}
                              value={itemOther || ''}
                              onChange={(e) => setOtherSpentAmount(key, parseFloat(e.target.value) || 0)}
                            />
                            <span className={styles.subSeparator}>/</span>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              placeholder="Budget"
                              className={styles.amountInput}
                              value={itemBudget || ''}
                              onChange={(e) => setBudgetAmount(key, parseFloat(e.target.value) || 0)}
                            />
                          </span>
                        </li>
                      )
                    })}
                  </ul>
                </article>
              )
            }

            if (category.groups) {
              const categorySpent = category.groups.reduce(
                (sum, group) =>
                  sum + group.items.reduce(
                    (s, item) =>
                      s +
                      (spent[`${category.id}_${group.id}_${item.id}`] ?? 0) +
                      (otherSpent[`${category.id}_${group.id}_${item.id}`] ?? 0),
                    0
                  ),
                0
              )
              const categoryBudget = category.groups.reduce(
                (sum, group) =>
                  sum + group.items.reduce((s, item) => s + (budget[`${category.id}_${group.id}_${item.id}`] ?? 0), 0),
                0
              )
              const pct = categoryBudget > 0 ? Math.min(100, (categorySpent / categoryBudget) * 100) : 0
              return (
                <article key={category.id} className={styles.categoryCard}>
                  <div className={styles.categoryHeader}>
                    <span className={styles.categoryDot} style={{ background: color }} aria-hidden />
                    <span className={styles.categoryName}>{category.name}</span>
                  </div>
                  <div className={styles.categoryAmounts}>
                    <span className="mono">${categorySpent.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                    <span className={styles.categorySeparator}>/</span>
                    <span className={`mono ${styles.categoryBudget}`}>
                      ${categoryBudget.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className={styles.progressTrack}>
                    <div className={styles.progressFill} style={{ width: `${pct}%`, background: color }} />
                  </div>
                  {category.groups.map((group) => (
                    <div key={group.id} className={styles.group}>
                      <div className={styles.groupTitle}>{group.name}</div>
                      <ul className={styles.subList}>
                        {group.items.map((item) => {
                          const key = `${category.id}_${group.id}_${item.id}`
                          const itemSpent = spent[key] ?? 0
                          const itemOther = otherSpent[key] ?? 0
                          const itemBudget = budget[key] ?? 0
                          return (
                            <li key={key} className={styles.subRow}>
                              <span className={styles.subLabel}>{item.name}</span>
                              <span className={styles.subInputs}>
                                <input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  placeholder="You"
                                  className={styles.amountInput}
                                  value={itemSpent || ''}
                                  onChange={(e) => setSpentAmount(key, parseFloat(e.target.value) || 0)}
                                />
                                <input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  placeholder={otherLabel}
                                  className={styles.amountInput}
                                  value={itemOther || ''}
                                  onChange={(e) => setOtherSpentAmount(key, parseFloat(e.target.value) || 0)}
                                />
                                <span className={styles.subSeparator}>/</span>
                                <input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  placeholder="Budget"
                                  className={styles.amountInput}
                                  value={itemBudget || ''}
                                  onChange={(e) => setBudgetAmount(key, parseFloat(e.target.value) || 0)}
                                />
                              </span>
                            </li>
                          )
                        })}
                      </ul>
                    </div>
                  ))}
                </article>
              )
            }

            const key = category.id
            const categorySpentMine = spent[key] ?? 0
            const categorySpentOther = otherSpent[key] ?? 0
            const categorySpent = categorySpentMine + categorySpentOther
            const categoryBudget = budget[key] ?? 0
            const pct = categoryBudget > 0 ? Math.min(100, (categorySpent / categoryBudget) * 100) : 0
            return (
              <article key={category.id} className={styles.categoryCard}>
                <div className={styles.categoryHeader}>
                  <span className={styles.categoryDot} style={{ background: color }} aria-hidden />
                  <span className={styles.categoryName}>{category.name}</span>
                </div>
                <div className={styles.categoryAmounts}>
                  <span className="mono">${categorySpent.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  <span className={styles.categorySeparator}>/</span>
                  <span className={`mono ${styles.categoryBudget}`}>
                    ${categoryBudget.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className={styles.progressTrack}>
                  <div className={styles.progressFill} style={{ width: `${pct}%`, background: color }} />
                </div>
                <div className={styles.singleCategoryInputs}>
                  <label className={styles.inlineLabel}>
                    You
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      className={styles.amountInput}
                      value={categorySpentMine || ''}
                      onChange={(e) => setSpentAmount(key, parseFloat(e.target.value) || 0)}
                    />
                  </label>
                  <label className={styles.inlineLabel}>
                    {otherLabel}
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      className={styles.amountInput}
                      value={categorySpentOther || ''}
                      onChange={(e) => setOtherSpentAmount(key, parseFloat(e.target.value) || 0)}
                    />
                  </label>
                  <label className={styles.inlineLabel}>
                    Budget
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      className={styles.amountInput}
                      value={categoryBudget || ''}
                      onChange={(e) => setBudgetAmount(key, parseFloat(e.target.value) || 0)}
                    />
                  </label>
                </div>
                {hasNotes && (
                  <div className={styles.notesBlock}>
                    <label htmlFor={`notes-${category.id}`} className={styles.notesLabel}>
                      Notes (e.g. what you spent on)
                    </label>
                    <textarea
                      id={`notes-${category.id}`}
                      className={styles.notesInput}
                      value={notes[category.id] ?? ''}
                      onChange={(e) => setNote(category.id, e.target.value)}
                      placeholder="e.g. gym (56.49), gdrive (13.2), utube (146.89/12)..."
                      rows={4}
                    />
                  </div>
                )}
              </article>
            )
          })}
        </div>
      </section>
    </div>
  )
}
