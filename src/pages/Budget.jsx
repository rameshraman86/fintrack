import { useState, useCallback, useRef, useEffect } from 'react'
import { useAppData, getBudgetKey } from '../context/AppData'
import DecimalInput from '../components/DecimalInput'
import styles from './Budget.module.css'

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const CATEGORY_ICONS = {
  house: '🏠',
  car: '🚗',
  subscriptions: '📺',
  groceries: '🛒',
  internet: '🌐',
  'going-out': '🍻',
  'personal-expenses': '👤',
  'common-shopping': '🛍️',
  travelling: '✈️',
  miscellaneous: '📦',
}

function fmt(n) {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function ChevronIcon({ open }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`${styles.chevron} ${open ? styles.chevronOpen : ''}`}>
      <polyline points="6 9 12 15 18 9" />
    </svg>
  )
}

function PlusIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
    </svg>
  )
}

function getCategoryBudget(category) {
  return category.subCategories.reduce((sum, sub) => sum + (Number(sub.amount) || 0), 0)
}

function InlineEditableName({ value, onSave, className, placeholder = 'Name', disabled }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)
  const inputRef = useRef(null)

  useEffect(() => {
    if (editing && !disabled) {
      setDraft(value)
      inputRef.current?.focus()
      inputRef.current?.select()
    }
  }, [editing, value, disabled])

  const commit = useCallback(() => {
    if (disabled) return
    const trimmed = (draft || '').trim()
    if (trimmed && trimmed !== value) onSave(trimmed)
    setEditing(false)
  }, [draft, value, onSave, disabled])

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        commit()
      }
      if (e.key === 'Escape') {
        setDraft(value)
        setEditing(false)
      }
    },
    [commit, value]
  )

  if (disabled) {
    return <span className={className}>{value || placeholder}</span>
  }
  if (editing) {
    return (
      <input
        ref={inputRef}
        type="text"
        className={styles.inlineNameInput}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={handleKeyDown}
        onClick={(e) => e.stopPropagation()}
        placeholder={placeholder}
        aria-label="Edit name"
      />
    )
  }
  return (
    <span
      role="button"
      tabIndex={0}
      className={`${styles.inlineNameBtn} ${className || ''}`}
      onClick={(e) => {
        e.stopPropagation()
        setEditing(true)
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          setEditing(true)
        }
      }}
      title="Click to rename"
    >
      {value || placeholder}
    </span>
  )
}

function AddCategoryRow({ onAdd, onCancel }) {
  const [name, setName] = useState('')
  const inputRef = useRef(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleSave = useCallback(() => {
    const trimmed = name.trim()
    if (trimmed) {
      onAdd(trimmed)
      setName('')
    }
    onCancel?.()
  }, [name, onAdd, onCancel])

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        handleSave()
      }
      if (e.key === 'Escape') {
        setName('')
        onCancel?.()
      }
    },
    [handleSave, onCancel]
  )

  return (
    <div className={styles.addCategoryRow}>
      <input
        ref={inputRef}
        type="text"
        className={styles.addCategoryInput}
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="New category name"
        aria-label="New category name"
      />
      <button type="button" className={styles.saveSubBtn} onClick={handleSave}>
        Save
      </button>
      <button type="button" className={styles.cancelBtn} onClick={onCancel}>
        Cancel
      </button>
    </div>
  )
}

function AddSubCategoryRow({ categoryId, onAdd, onBlur }) {
  const [name, setName] = useState('')
  const inputRef = useRef(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleSave = useCallback(() => {
    const trimmed = name.trim()
    if (trimmed) {
      onAdd(trimmed)
      setName('')
    }
    onBlur?.()
  }, [name, onAdd, onBlur])

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        handleSave()
      }
      if (e.key === 'Escape') {
        setName('')
        onBlur?.()
      }
    },
    [handleSave, onBlur]
  )

  return (
    <div className={styles.addSubRow}>
      <input
        ref={inputRef}
        type="text"
        className={styles.addSubInput}
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => onBlur?.()}
        placeholder="New sub-category name"
        aria-label="New sub-category name"
      />
      <button type="button" className={styles.saveSubBtn} onClick={handleSave}>
        Save
      </button>
    </div>
  )
}

export default function Budget() {
  const {
    categories,
    budgets,
    selectedBudgetKey,
    setSubCategoryBudget,
    addSubCategory,
    removeSubCategory,
    setCategoryName,
    setSubCategoryName,
    removeCategory,
    addCategory,
    setSelectedBudget,
    addBudgetMonth,
    getYears,
    getMonthsForYear,
    getNextMonthToAdd,
    isPastMonth,
    isCurrentMonth,
    isFutureMonth,
    getCurrentYearMonth,
    canAddYear,
  } = useAppData()

  const [expanded, setExpanded] = useState({})
  const [addingForId, setAddingForId] = useState(null)
  const [addingNewCategory, setAddingNewCategory] = useState(false)

  // Initialize viewYear from selected budget or current date
  const [viewYear, setViewYear] = useState(() => {
    if (selectedBudgetKey) {
      return parseInt(selectedBudgetKey.split('-')[0], 10)
    }
    return getCurrentYearMonth().year
  })

  // Keep viewYear in sync if selectedBudgetKey changes (e.g. on load)
  useEffect(() => {
    if (selectedBudgetKey) {
      const y = parseInt(selectedBudgetKey.split('-')[0], 10)
      setViewYear(y)
    }
  }, [selectedBudgetKey])

  const selectedBudget = selectedBudgetKey ? budgets[selectedBudgetKey] : null
  const selectedYear = selectedBudget?.year
  const selectedMonth = selectedBudget?.month
  const isReadOnly = selectedBudget
    ? isPastMonth(selectedYear, selectedMonth) &&
      !(selectedYear === 2026 && selectedMonth === 1)
    : false

  const toggle = useCallback((id) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }))
  }, [])

  const allExpanded = categories.length > 0 && categories.every((c) => expanded[c.id])
  const toggleAll = useCallback(() => {
    if (allExpanded) {
      setExpanded({})
    } else {
      setExpanded(Object.fromEntries(categories.map((c) => [c.id, true])))
    }
  }, [allExpanded, categories])

  const totalMonthly = categories.reduce(
    (sum, cat) => sum + getCategoryBudget(cat),
    0
  )

  const handleAddSubCategory = useCallback(
    (categoryId, name) => {
      addSubCategory(categoryId, name)
      setAddingForId(null)
    },
    [addSubCategory]
  )

  const handleAddCategory = useCallback(
    (name) => {
      addCategory(name)
      setAddingNewCategory(false)
    },
    [addCategory]
  )

  const handleAddMonth = useCallback(
    (year) => {
      const nextMonth = getNextMonthToAdd(year)
      if (nextMonth != null) addBudgetMonth(year, nextMonth)
    },
    [getNextMonthToAdd, addBudgetMonth]
  )

  const { year: currentYear, month: currentMonth } = getCurrentYearMonth()
  const years = getYears()
  const displayYears = Array.from(new Set([...years, viewYear])).sort((a, b) => a - b)
  const maxDisplayYear = displayYears.length > 0 ? Math.max(...displayYears) : 0
  const canAddNextYear =
    canAddYear() &&
    currentMonth === 12 &&
    maxDisplayYear < currentYear + 1
  const nextYearToAdd = maxDisplayYear + 1

  const months = getMonthsForYear(viewYear)
  const nextMonth = getNextMonthToAdd(viewYear)
  const canAdd = nextMonth != null && !isPastMonth(viewYear, nextMonth)

  const selectedLabel = selectedBudget
    ? `${MONTH_NAMES[selectedBudget.month - 1]} ${selectedBudget.year}`
    : 'Select a month'

  return (
    <div className={`${styles.page} animate-fade-in`}>
      <header className={styles.header}>
        <h1 className={styles.title}>Monthly Budget</h1>
      </header>

      {/* Year / Month navigation */}
      <section className={styles.navSection}>
        {/* Years Row */}
        <div className={styles.yearTabs}>
          {displayYears.map((year) => (
            <button
              key={year}
              type="button"
              className={`${styles.yearTab} ${year === viewYear ? styles.yearTabActive : ''}`}
              onClick={() => setViewYear(year)}
            >
              {year}
            </button>
          ))}
          {canAddNextYear && (
            <button
              type="button"
              className={styles.yearTab}
              onClick={() => setViewYear(nextYearToAdd)}
              title={`Plan for ${nextYearToAdd}`}
            >
              + {nextYearToAdd}
            </button>
          )}
        </div>

        {/* Months Row */}
        <div className={styles.monthGrid}>
          {months.map((m) => {
            const key = getBudgetKey(viewYear, m)
            const isSelected = key === selectedBudgetKey
            const isPast = isPastMonth(viewYear, m)
            const isCurrent = isCurrentMonth(viewYear, m)
            const isFuture = isFutureMonth(viewYear, m)
            
            let btnClass = styles.monthBtn
            if (isSelected) btnClass += ` ${styles.monthBtnSelected}`
            else if (isPast) btnClass += ` ${styles.monthBtnPast}`
            else if (isCurrent) btnClass += ` ${styles.monthBtnCurrent}`
            else if (isFuture) btnClass += ` ${styles.monthBtnFuture}`

            return (
              <button
                key={key}
                type="button"
                className={btnClass}
                onClick={() => setSelectedBudget(key)}
              >
                {MONTH_NAMES[m - 1]}
              </button>
            )
          })}
          {canAdd && (
            <button
              type="button"
              className={styles.addMonthBtn}
              onClick={() => handleAddMonth(viewYear)}
            >
              + Add {MONTH_NAMES[nextMonth - 1]}
            </button>
          )}
        </div>
      </section>

      {/* Selected month budget */}
      {selectedBudgetKey && (
        <>
          <section className={styles.totalSection}>
            <div className={styles.totalCard}>
              <span className={styles.totalLabel}>
                {selectedLabel} — Total budget
              </span>
              <span className={`${styles.totalValue} mono`}>${fmt(totalMonthly)}</span>
              {isReadOnly && (
                <span className={styles.readOnlyBadge}>Read-only</span>
              )}
            </div>
          </section>

          <section className={styles.categories}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Categories</h2>
              {!isReadOnly && (
                <button className={styles.expandAllBtn} onClick={toggleAll} type="button">
                  {allExpanded ? 'Collapse all' : 'Expand all'}
                </button>
              )}
            </div>

            <div className={styles.accordionList}>
              {categories.map((category) => {
                const icon = CATEGORY_ICONS[category.id] || '💰'
                const isOpen = !!expanded[category.id]
                const catBudget = getCategoryBudget(category)
                const isAdding = addingForId === category.id

                return (
                  <div key={category.id} className={`${styles.accordion} ${isOpen ? styles.accordionOpen : ''}`}>
                    <div className={styles.accordionHeaderWrap}>
                      <button
                        className={styles.accordionHeader}
                        onClick={() => !isReadOnly && toggle(category.id)}
                        type="button"
                        aria-expanded={isOpen}
                        disabled={isReadOnly}
                      >
                        <span className={styles.accordionIcon}>{icon}</span>
                        <span className={styles.accordionNameWrap} onClick={(e) => !isReadOnly && e.stopPropagation()}>
                          <InlineEditableName
                            value={category.name}
                            onSave={(name) => setCategoryName(category.id, name)}
                            className={styles.accordionNameEditable}
                            disabled={isReadOnly}
                          />
                        </span>
                        <span className={styles.accordionMeta}>
                          <span className={`${styles.accordionAmount} mono`}>${fmt(catBudget)}</span>
                          {!isReadOnly && <ChevronIcon open={isOpen} />}
                        </span>
                      </button>
                      {!isReadOnly && (
                        <div className={styles.accordionActions}>
                          <button
                            type="button"
                            className={styles.iconBtn}
                            onClick={(e) => {
                              e.stopPropagation()
                              if (!expanded[category.id]) toggle(category.id)
                              setAddingForId(category.id)
                            }}
                            aria-label="Add sub-category"
                            title="Add sub-category"
                          >
                            <PlusIcon />
                          </button>
                          <button
                            type="button"
                            className={`${styles.iconBtn} ${styles.iconBtnDanger}`}
                            onClick={(e) => {
                              e.stopPropagation()
                              const message = `Delete "${category.name}"? This will remove all budget and expense data for this category.`
                              if (window.confirm(message)) {
                                removeCategory(category.id)
                              }
                            }}
                            aria-label="Delete category"
                            title="Delete category"
                          >
                            <TrashIcon />
                          </button>
                        </div>
                      )}
                    </div>

                    {isOpen && (
                      <div className={styles.accordionBody}>
                        <ul className={styles.itemList}>
                          {category.subCategories.map((sub) => {
                            const key = `${category.id}_${sub.id}`
                            return (
                              <li key={key} className={styles.subCategoryRow}>
                                <span className={styles.subCategoryNameWrap}>
                                  <InlineEditableName
                                    value={sub.name}
                                    onSave={(name) => setSubCategoryName(category.id, sub.id, name)}
                                    className={styles.subCategoryNameEditable}
                                    disabled={isReadOnly}
                                  />
                                </span>
                                <div className={styles.subCategoryActions}>
                                  <div className={styles.inputWrap}>
                                    <span className={styles.currency}>$</span>
                                    <DecimalInput
                                      id={`b-${key}`}
                                      className={styles.input}
                                      value={Number(sub.amount) || 0}
                                      onChange={(v) => setSubCategoryBudget(category.id, sub.id, v)}
                                      disabled={isReadOnly}
                                    />
                                  </div>
                                  {!isReadOnly && (
                                    <button
                                      type="button"
                                      className={`${styles.iconBtn} ${styles.iconBtnDanger} ${styles.removeSubBtn}`}
                                      onClick={() => removeSubCategory(category.id, sub.id)}
                                      aria-label={`Remove ${sub.name}`}
                                      title="Remove sub-category"
                                    >
                                      −
                                    </button>
                                  )}
                                </div>
                              </li>
                            )
                          })}
                        </ul>
                        {!isReadOnly && (
                          <>
                            {isAdding && (
                              <AddSubCategoryRow
                                categoryId={category.id}
                                onAdd={(name) => handleAddSubCategory(category.id, name)}
                                onBlur={() => setAddingForId(null)}
                              />
                            )}
                            {!isAdding && (
                              <button
                                type="button"
                                className={styles.addSubTrigger}
                                onClick={() => setAddingForId(category.id)}
                              >
                                + Add sub-category
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
              {!isReadOnly && (
                <>
                  {addingNewCategory && (
                    <AddCategoryRow
                      onAdd={handleAddCategory}
                      onCancel={() => setAddingNewCategory(false)}
                    />
                  )}
                  {!addingNewCategory && (
                    <button
                      type="button"
                      className={styles.addCategoryTrigger}
                      onClick={() => setAddingNewCategory(true)}
                    >
                      + Add category
                    </button>
                  )}
                </>
              )}
            </div>
          </section>
        </>
      )}

      {!selectedBudgetKey && (
        <p className={styles.selectMonthHint}>Select a month above to view or edit its budget.</p>
      )}
    </div>
  )
}
