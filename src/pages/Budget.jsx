import { useState, useCallback } from 'react'
import {
  BUDGET_CATEGORIES,
  getInitialBudgetState,
} from '../data/budgetCategories'
import styles from './Budget.module.css'

function formatAmount(value) {
  const n = Number(value)
  if (Number.isNaN(n) || n === 0) return ''
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function BudgetInput({ value, onChange, id, placeholder = '0.00' }) {
  const [focused, setFocused] = useState(false)
  const displayValue = focused ? String(value) : (value > 0 ? formatAmount(value) : '')
  const handleChange = (e) => {
    const raw = e.target.value.replace(/[^0-9.]/g, '')
    const parsed = raw === '' ? 0 : parseFloat(raw)
    onChange(Number.isNaN(parsed) ? 0 : parsed)
  }
  return (
    <div className={styles.inputWrap}>
      <span className={styles.currency}>$</span>
      <input
        type="text"
        inputMode="decimal"
        id={id}
        className={styles.input}
        value={displayValue}
        onChange={handleChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
      />
    </div>
  )
}

export default function Budget() {
  const [amounts, setAmounts] = useState(() => getInitialBudgetState(BUDGET_CATEGORIES))

  const setAmount = useCallback((key, value) => {
    setAmounts((prev) => ({ ...prev, [key]: value }))
  }, [])

  const totalMonthly = Object.values(amounts).reduce((sum, v) => sum + (Number(v) || 0), 0)

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Monthly budget</h1>
        <p className={styles.subtitle}>
          Set your budget per category. Use sub-items for House, Car, and Travelling.
        </p>
      </header>

      <section className={styles.totalSection}>
        <div className={styles.totalCard}>
          <span className={styles.totalLabel}>Total monthly budget</span>
          <span className={`${styles.totalValue} mono`}>
            ${formatAmount(totalMonthly) || '0.00'}
          </span>
        </div>
      </section>

      <section className={styles.categories}>
        {BUDGET_CATEGORIES.map((category) => {
          if (category.items) {
            return (
              <div key={category.id} className={styles.categoryBlock}>
                <h2 className={styles.categoryTitle}>{category.name}</h2>
                <ul className={styles.itemList}>
                  {category.items.map((item) => {
                    const key = `${category.id}_${item.id}`
                    return (
                      <li key={key} className={styles.itemRow}>
                        <label htmlFor={`budget-${key}`} className={styles.itemLabel}>
                          {item.name}
                        </label>
                        <BudgetInput
                          id={`budget-${key}`}
                          value={amounts[key] ?? 0}
                          onChange={(v) => setAmount(key, v)}
                        />
                      </li>
                    )
                  })}
                </ul>
              </div>
            )
          }
          if (category.groups) {
            return (
              <div key={category.id} className={styles.categoryBlock}>
                <h2 className={styles.categoryTitle}>{category.name}</h2>
                {category.groups.map((group) => (
                  <div key={group.id} className={styles.group}>
                    <h3 className={styles.groupTitle}>{group.name}</h3>
                    <ul className={styles.itemList}>
                      {group.items.map((item) => {
                        const key = `${category.id}_${group.id}_${item.id}`
                        return (
                          <li key={key} className={styles.itemRow}>
                            <label htmlFor={`budget-${key}`} className={styles.itemLabel}>
                              {item.name}
                            </label>
                            <BudgetInput
                              id={`budget-${key}`}
                              value={amounts[key] ?? 0}
                              onChange={(v) => setAmount(key, v)}
                            />
                          </li>
                        )
                      })}
                    </ul>
                  </div>
                ))}
              </div>
            )
          }
          return (
            <div key={category.id} className={styles.categoryBlock}>
              <div className={styles.singleRow}>
                <label htmlFor={`budget-${category.id}`} className={styles.categoryTitleInline}>
                  {category.name}
                </label>
                <BudgetInput
                  id={`budget-${category.id}`}
                  value={amounts[category.id] ?? 0}
                  onChange={(v) => setAmount(category.id, v)}
                />
              </div>
            </div>
          )
        })}
      </section>
    </div>
  )
}
