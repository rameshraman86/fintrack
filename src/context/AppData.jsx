import { createContext, useContext, useCallback, useMemo, useState, useEffect } from 'react'
import {
  getInitialCategories,
  getBudgetKeysFromCategories,
  EXPENSE_NOTES_CATEGORY_IDS,
} from '../data/budgetCategories'

const STORAGE_KEY = 'fintrack-data'

function loadStored() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

function isPlainObject(v) {
  return v != null && typeof v === 'object' && !Array.isArray(v)
}

const EXCLUDED_CATEGORY_IDS = new Set(['phone-bill'])

function filterExcludedCategories(categories) {
  return categories.filter((c) => !EXCLUDED_CATEGORY_IDS.has(c.id))
}

/** Deep clone categories (for copying previous month's budget). */
function deepCloneCategories(categories) {
  return JSON.parse(JSON.stringify(categories))
}

export function getBudgetKey(year, month) {
  return `${year}-${month}`
}

/** App's "current" month for Past/Current/Future classification. */
export function getCurrentYearMonth() {
  const d = new Date()
  return { year: d.getFullYear(), month: d.getMonth() + 1 }
}

function getDefaultBudgetsAndSelection() {
  const initialCategories = filterExcludedCategories(getInitialCategories())
  const janKey = getBudgetKey(2026, 1)
  const febKey = getBudgetKey(2026, 2)
  const budgets = {
    [janKey]: { year: 2026, month: 1, categories: deepCloneCategories(initialCategories), grossIncome: 0, netIncome: 0 },
    [febKey]: { year: 2026, month: 2, categories: deepCloneCategories(initialCategories), grossIncome: 0, netIncome: 0 },
  }
  return { budgets, selectedBudgetKey: febKey }
}

function compareYearMonth(aYear, aMonth, bYear, bMonth) {
  if (aYear !== bYear) return aYear - bYear
  return aMonth - bMonth
}

/** Migrate from legacy single-categories state to budgets by year-month. */
function migrateToBudgets(data) {
  const { budgets, selectedBudgetKey } = getDefaultBudgetsAndSelection()
  const hadCategories = data?.categories && Array.isArray(data.categories) && data.categories.length > 0
  if (hadCategories) {
    const categories = filterExcludedCategories(data.categories)
    budgets[selectedBudgetKey] = { year: 2026, month: 2, categories, grossIncome: 0, netIncome: 0 }
    const janKey = getBudgetKey(2026, 1)
    budgets[janKey] = { year: 2026, month: 1, categories: deepCloneCategories(categories), grossIncome: 0, netIncome: 0 }
  }
  const validKeys = new Set(getBudgetKeysFromCategories(budgets[selectedBudgetKey].categories).map((k) => k.key))
  const expenseSpent = {}
  const expenseOtherSpent = {}
  if (isPlainObject(data?.expenseSpent)) {
    for (const [k, v] of Object.entries(data.expenseSpent)) {
      if (validKeys.has(k)) expenseSpent[k] = Number(v) || 0
    }
  }
  if (isPlainObject(data?.expenseOtherSpent)) {
    for (const [k, v] of Object.entries(data.expenseOtherSpent)) {
      if (validKeys.has(k)) expenseOtherSpent[k] = Number(v) || 0
    }
  }
  const defaultNotes = Object.fromEntries(EXPENSE_NOTES_CATEGORY_IDS.map((id) => [id, '']))
  const expenseNotes = { ...defaultNotes, ...(isPlainObject(data?.expenseNotes) ? data.expenseNotes : {}) }
  const otherPersonName = typeof data?.otherPersonName === 'string' ? data.otherPersonName : ''
  return { budgets, selectedBudgetKey, expenseSpent, expenseOtherSpent, expenseNotes, otherPersonName }
}

function mergeWithDefaults(data) {
  if (data?.budgets && isPlainObject(data.budgets) && typeof data?.selectedBudgetKey === 'string') {
    const budgets = { ...data.budgets }
    const janKey = getBudgetKey(2026, 1)
    const febKey = getBudgetKey(2026, 2)
    const febBudget = budgets[febKey]
    const janBudget = budgets[janKey]
    if (febBudget && (!janBudget || !Array.isArray(janBudget.categories) || janBudget.categories.length === 0)) {
      budgets[janKey] = {
        year: 2026,
        month: 1,
        categories: deepCloneCategories(febBudget.categories),
        grossIncome: febBudget.grossIncome ?? 0,
        netIncome: febBudget.netIncome ?? 0,
      }
    }
    const selectedBudgetKey = data.selectedBudgetKey
    const categories = budgets[selectedBudgetKey]?.categories
    const validKeys = categories
      ? new Set(getBudgetKeysFromCategories(categories).map((k) => k.key))
      : new Set()
    const expenseSpent = {}
    const expenseOtherSpent = {}
    if (isPlainObject(data.expenseSpent)) {
      for (const [k, v] of Object.entries(data.expenseSpent)) {
        if (validKeys.has(k)) expenseSpent[k] = Number(v) || 0
      }
    }
    if (isPlainObject(data.expenseOtherSpent)) {
      for (const [k, v] of Object.entries(data.expenseOtherSpent)) {
        if (validKeys.has(k)) expenseOtherSpent[k] = Number(v) || 0
      }
    }
    const defaultNotes = Object.fromEntries(EXPENSE_NOTES_CATEGORY_IDS.map((id) => [id, '']))
    const expenseNotes = { ...defaultNotes, ...(isPlainObject(data.expenseNotes) ? data.expenseNotes : {}) }
    return {
      budgets,
      selectedBudgetKey,
      expenseSpent,
      expenseOtherSpent,
      expenseNotes,
      otherPersonName: typeof data.otherPersonName === 'string' ? data.otherPersonName : '',
    }
  }
  return migrateToBudgets(data)
}

function saveStored(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (e) {
    console.warn('Failed to save to localStorage', e)
  }
}

function makeSubCategoryId() {
  return `sc_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
}

function makeCategoryId() {
  return `cat_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
}

const AppDataContext = createContext(null)

export function AppDataProvider({ children }) {
  const [state, setState] = useState(() => {
    const stored = loadStored()
    return mergeWithDefaults(stored)
  })

  useEffect(() => {
    saveStored(state)
  }, [state])

  const selectedBudgetKey = state.selectedBudgetKey
  const categories = state.budgets[selectedBudgetKey]?.categories ?? []

  const updateSelectedBudgetCategories = useCallback((updater) => {
    setState((prev) => {
      const key = prev.selectedBudgetKey
      const budget = prev.budgets[key]
      if (!budget) return prev
      const nextCategories = updater(budget.categories)
      return {
        ...prev,
        budgets: { ...prev.budgets, [key]: { ...budget, categories: nextCategories } },
      }
    })
  }, [])

  const setSubCategoryBudget = useCallback((categoryId, subCategoryId, value) => {
    updateSelectedBudgetCategories((cats) =>
      cats.map((cat) => {
        if (cat.id !== categoryId) return cat
        return {
          ...cat,
          subCategories: cat.subCategories.map((sub) =>
            sub.id !== subCategoryId ? sub : { ...sub, amount: Number(value) || 0 }
          ),
        }
      })
    )
  }, [updateSelectedBudgetCategories])

  const addSubCategory = useCallback((categoryId, name) => {
    const trimmed = (name || '').trim()
    if (!trimmed) return
    updateSelectedBudgetCategories((cats) => {
      return cats.map((cat) => {
        if (cat.id !== categoryId) return cat
        const names = new Set(cat.subCategories.map((s) => s.name.toLowerCase()))
        if (names.has(trimmed.toLowerCase())) return cat
        const newSub = { id: makeSubCategoryId(), name: trimmed, amount: 0 }
        return { ...cat, subCategories: [...cat.subCategories, newSub] }
      })
    })
  }, [updateSelectedBudgetCategories])

  const removeSubCategory = useCallback((categoryId, subCategoryId) => {
    const key = `${categoryId}_${subCategoryId}`
    setState((prev) => {
      const budgetKey = prev.selectedBudgetKey
      const budget = prev.budgets[budgetKey]
      if (!budget) return prev
      const categories = budget.categories.map((cat) => {
        if (cat.id !== categoryId) return cat
        const next = cat.subCategories.filter((s) => s.id !== subCategoryId)
        if (next.length === 0) return cat
        return { ...cat, subCategories: next }
      })
      const { [key]: _s, ...expenseSpent } = prev.expenseSpent
      const { [key]: _o, ...expenseOtherSpent } = prev.expenseOtherSpent
      return {
        ...prev,
        budgets: { ...prev.budgets, [budgetKey]: { ...budget, categories } },
        expenseSpent,
        expenseOtherSpent,
      }
    })
  }, [])

  const setCategoryName = useCallback((categoryId, name) => {
    const trimmed = (name || '').trim()
    if (!trimmed) return
    updateSelectedBudgetCategories((cats) =>
      cats.map((cat) => (cat.id !== categoryId ? cat : { ...cat, name: trimmed }))
    )
  }, [updateSelectedBudgetCategories])

  const setSubCategoryName = useCallback((categoryId, subCategoryId, name) => {
    const trimmed = (name || '').trim()
    if (!trimmed) return
    updateSelectedBudgetCategories((cats) =>
      cats.map((cat) => {
        if (cat.id !== categoryId) return cat
        return {
          ...cat,
          subCategories: cat.subCategories.map((sub) =>
            sub.id !== subCategoryId ? sub : { ...sub, name: trimmed }
          ),
        }
      })
    )
  }, [updateSelectedBudgetCategories])

  const removeCategory = useCallback((categoryId) => {
    setState((prev) => {
      const budgetKey = prev.selectedBudgetKey
      const budget = prev.budgets[budgetKey]
      if (!budget) return prev
      const categories = prev.budgets[budgetKey].categories.filter((c) => c.id !== categoryId)
      const prefix = `${categoryId}_`
      const expenseSpent = Object.fromEntries(
        Object.entries(prev.expenseSpent).filter(([k]) => !k.startsWith(prefix))
      )
      const expenseOtherSpent = Object.fromEntries(
        Object.entries(prev.expenseOtherSpent).filter(([k]) => !k.startsWith(prefix))
      )
      const { [categoryId]: _, ...expenseNotes } = prev.expenseNotes
      return {
        ...prev,
        budgets: { ...prev.budgets, [budgetKey]: { ...budget, categories } },
        expenseSpent,
        expenseOtherSpent,
        expenseNotes,
      }
    })
  }, [])

  const addCategory = useCallback((name) => {
    const trimmed = (name || '').trim()
    if (!trimmed) return
    updateSelectedBudgetCategories((cats) => [
      ...cats,
      { id: makeCategoryId(), name: trimmed, subCategories: [] },
    ])
  }, [updateSelectedBudgetCategories])

  const setSelectedBudget = useCallback((key) => {
    setState((prev) => (prev.selectedBudgetKey === key ? prev : { ...prev, selectedBudgetKey: key }))
  }, [])

  const setBudgetGrossIncome = useCallback((value) => {
    setState((prev) => {
      const key = prev.selectedBudgetKey
      const budget = prev.budgets[key]
      if (!budget) return prev
      const num = Number(value)
      const grossIncome = Number.isFinite(num) && num >= 0 ? num : 0
      return {
        ...prev,
        budgets: { ...prev.budgets, [key]: { ...budget, grossIncome } },
      }
    })
  }, [])

  const setBudgetNetIncome = useCallback((value) => {
    setState((prev) => {
      const key = prev.selectedBudgetKey
      const budget = prev.budgets[key]
      if (!budget) return prev
      const num = Number(value)
      const netIncome = Number.isFinite(num) && num >= 0 ? num : 0
      return {
        ...prev,
        budgets: { ...prev.budgets, [key]: { ...budget, netIncome } },
      }
    })
  }, [])

  const addBudgetMonth = useCallback((year, month) => {
    const key = getBudgetKey(year, month)
    setState((prev) => {
      const candidates = Object.values(prev.budgets)
        .filter((b) => compareYearMonth(b.year, b.month, year, month) < 0)
        .sort((a, b) => compareYearMonth(b.year, b.month, a.year, a.month))
      const mostRecent = candidates[0]
      const categories = mostRecent
        ? deepCloneCategories(mostRecent.categories)
        : deepCloneCategories(filterExcludedCategories(getInitialCategories()))
      const grossIncome = mostRecent?.grossIncome ?? 0
      const netIncome = mostRecent?.netIncome ?? 0
      const newBudget = { year, month, categories, grossIncome, netIncome }
      return {
        ...prev,
        budgets: { ...prev.budgets, [key]: newBudget },
        selectedBudgetKey: key,
      }
    })
  }, [])

  const removeBudgetMonth = useCallback((key) => {
    setState((prev) => {
      if (!prev.budgets[key]) return prev
      const nextBudgets = { ...prev.budgets }
      delete nextBudgets[key]
      let nextSelected = prev.selectedBudgetKey
      if (prev.selectedBudgetKey === key) {
        const remaining = Object.keys(nextBudgets)
          .map((k) => ({ key: k, year: nextBudgets[k].year, month: nextBudgets[k].month }))
          .sort((a, b) => compareYearMonth(a.year, a.month, b.year, b.month))
        nextSelected = remaining.length > 0 ? remaining[remaining.length - 1].key : null
      }
      return {
        ...prev,
        budgets: nextBudgets,
        selectedBudgetKey: nextSelected,
      }
    })
  }, [])

  const { year: currentYear, month: currentMonth } = getCurrentYearMonth()
  const maxYear = currentYear + 1

  const getYears = useCallback(() => {
    const keys = Object.keys(state.budgets)
    const fromBudgets = new Set(keys.map((k) => parseInt(k.split('-')[0], 10)))
    return Array.from(fromBudgets).filter((y) => y <= maxYear).sort((a, b) => a - b)
  }, [state.budgets, maxYear])

  const getMonthsForYear = useCallback(
    (year) => {
      const keys = Object.keys(state.budgets).filter((k) => k.startsWith(`${year}-`))
      return keys
        .map((k) => parseInt(k.split('-')[1], 10))
        .sort((a, b) => a - b)
    },
    [state.budgets]
  )

  const canAddYear = useCallback(() => {
    const keys = Object.keys(state.budgets)
    const years = keys.map((k) => parseInt(k.split('-')[0], 10))
    const maxExisting = years.length ? Math.max(...years) : 0
    return maxExisting < maxYear
  }, [state.budgets, maxYear])

  const getNextMonthToAdd = useCallback(
    (year) => {
      const existing = getMonthsForYear(year)
      if (existing.length === 0) return 1
      const maxMonth = Math.max(...existing)
      if (maxMonth >= 12) return null
      return maxMonth + 1
    },
    [getMonthsForYear]
  )

  const isPastMonth = useCallback(
    (y, m) => {
      if (y < currentYear) return true
      if (y > currentYear) return false
      return m < currentMonth
    },
    [currentYear, currentMonth]
  )

  const isCurrentMonth = useCallback(
    (y, m) => y === currentYear && m === currentMonth,
    [currentYear, currentMonth]
  )

  const isFutureMonth = useCallback(
    (y, m) => {
      if (y > currentYear) return true
      if (y < currentYear) return false
      return m > currentMonth
    },
    [currentYear, currentMonth]
  )

  const setExpenseSpent = useCallback((key, value) => {
    setState((prev) => ({
      ...prev,
      expenseSpent: { ...prev.expenseSpent, [key]: value },
    }))
  }, [])

  const setExpenseOtherSpent = useCallback((key, value) => {
    setState((prev) => ({
      ...prev,
      expenseOtherSpent: { ...prev.expenseOtherSpent, [key]: value },
    }))
  }, [])

  const setExpenseNote = useCallback((categoryId, value) => {
    setState((prev) => ({
      ...prev,
      expenseNotes: { ...prev.expenseNotes, [categoryId]: value },
    }))
  }, [])

  const setOtherPersonName = useCallback((value) => {
    setState((prev) => ({ ...prev, otherPersonName: value }))
  }, [])

  const value = useMemo(
    () => ({
      categories,
      budgets: state.budgets,
      selectedBudgetKey: state.selectedBudgetKey,
      expenseSpent: state.expenseSpent,
      expenseOtherSpent: state.expenseOtherSpent,
      expenseNotes: state.expenseNotes,
      otherPersonName: state.otherPersonName,
      setSubCategoryBudget,
      addSubCategory,
      removeSubCategory,
      setCategoryName,
      setSubCategoryName,
      removeCategory,
      addCategory,
      setSelectedBudget,
      setBudgetGrossIncome,
      setBudgetNetIncome,
      addBudgetMonth,
      removeBudgetMonth,
      getYears,
      getMonthsForYear,
      canAddYear,
      getNextMonthToAdd,
      isPastMonth,
      isCurrentMonth,
      isFutureMonth,
      getCurrentYearMonth,
      maxYear,
      setExpenseSpent,
      setExpenseOtherSpent,
      setExpenseNote,
      setOtherPersonName,
    }),
    [
      categories,
      state.budgets,
      state.selectedBudgetKey,
      state.expenseSpent,
      state.expenseOtherSpent,
      state.expenseNotes,
      state.otherPersonName,
      setSubCategoryBudget,
      addSubCategory,
      removeSubCategory,
      setCategoryName,
      setSubCategoryName,
      removeCategory,
      addCategory,
      setSelectedBudget,
      setBudgetGrossIncome,
      setBudgetNetIncome,
      addBudgetMonth,
      removeBudgetMonth,
      getYears,
      getMonthsForYear,
      canAddYear,
      getNextMonthToAdd,
      isPastMonth,
      isCurrentMonth,
      isFutureMonth,
      maxYear,
      setExpenseSpent,
      setExpenseOtherSpent,
      setExpenseNote,
      setOtherPersonName,
    ]
  )

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>
}

export function useAppData() {
  const ctx = useContext(AppDataContext)
  if (!ctx) throw new Error('useAppData must be used within AppDataProvider')
  return ctx
}
