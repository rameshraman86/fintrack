import { useState, useCallback, useRef, useEffect } from 'react'
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

function InlineEditableName({ value, onSave, className, placeholder = 'Name' }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)
  const inputRef = useRef(null)

  useEffect(() => {
    if (editing) {
      setDraft(value)
      inputRef.current?.focus()
      inputRef.current?.select()
    }
  }, [editing, value])

  const commit = useCallback(() => {
    const trimmed = (draft || '').trim()
    if (trimmed && trimmed !== value) onSave(trimmed)
    setEditing(false)
  }, [draft, value, onSave])

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
    setSubCategoryBudget,
    addSubCategory,
    removeSubCategory,
    setCategoryName,
    setSubCategoryName,
    removeCategory,
  } = useAppData()
  const [expanded, setExpanded] = useState({})
  const [addingForId, setAddingForId] = useState(null)

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

  return (
    <div className={`${styles.page} animate-fade-in`}>
      <header className={styles.header}>
        <h1 className={styles.title}>Monthly Budget</h1>
        <p className={styles.subtitle}>
          Set your budget per category. Click names to rename; add or remove sub-categories and categories.
        </p>
      </header>

      <section className={styles.totalSection}>
        <div className={styles.totalCard}>
          <span className={styles.totalLabel}>Total monthly budget</span>
          <span className={`${styles.totalValue} mono`}>${fmt(totalMonthly)}</span>
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
                    onClick={() => toggle(category.id)}
                    type="button"
                    aria-expanded={isOpen}
                  >
                    <span className={styles.accordionIcon}>{icon}</span>
                    <span className={styles.accordionNameWrap} onClick={(e) => e.stopPropagation()}>
                      <InlineEditableName
                        value={category.name}
                        onSave={(name) => setCategoryName(category.id, name)}
                        className={styles.accordionNameEditable}
                      />
                    </span>
                    <span className={styles.accordionMeta}>
                      <span className={`${styles.accordionAmount} mono`}>${fmt(catBudget)}</span>
                      <ChevronIcon open={isOpen} />
                    </span>
                  </button>
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
                                />
                              </div>
                              <button
                                type="button"
                                className={`${styles.iconBtn} ${styles.iconBtnDanger} ${styles.removeSubBtn}`}
                                onClick={() => removeSubCategory(category.id, sub.id)}
                                aria-label={`Remove ${sub.name}`}
                                title="Remove sub-category"
                              >
                                −
                              </button>
                            </div>
                          </li>
                        )
                      })}
                    </ul>
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
