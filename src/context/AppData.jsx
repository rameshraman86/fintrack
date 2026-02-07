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

function toNumberMap(obj) {
  if (!isPlainObject(obj)) return {}
  return Object.fromEntries(
    Object.entries(obj).map(([k, v]) => {
      const n = Number(v)
      return [k, Number.isFinite(n) ? n : 0]
    })
  )
}

const EXCLUDED_CATEGORY_IDS = new Set(['phone-bill'])

function filterExcludedCategories(categories) {
  return categories.filter((c) => !EXCLUDED_CATEGORY_IDS.has(c.id))
}

/** Migrate legacy storage (budget map) to categories-based state. */
function migrateFromLegacy(data) {
  const categories = filterExcludedCategories(getInitialCategories())
  const legacyBudget = isPlainObject(data?.budget) ? data.budget : {}
  for (const cat of categories) {
    for (const sub of cat.subCategories) {
      const key = `${cat.id}_${sub.id}`
      const val = legacyBudget[key]
      if (val != null) sub.amount = Number(val) || 0
    }
  }
  const validKeys = new Set(getBudgetKeysFromCategories(categories).map((k) => k.key))
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
  return { categories, expenseSpent, expenseOtherSpent, expenseNotes, otherPersonName }
}

function mergeWithDefaults(data) {
  if (data?.categories && Array.isArray(data.categories) && data.categories.length > 0) {
    const categories = filterExcludedCategories(data.categories)
    const validKeys = new Set(getBudgetKeysFromCategories(categories).map((k) => k.key))
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
      categories,
      expenseSpent,
      expenseOtherSpent,
      expenseNotes,
      otherPersonName: typeof data.otherPersonName === 'string' ? data.otherPersonName : '',
    }
  }
  return migrateFromLegacy(data)
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

  const setSubCategoryBudget = useCallback((categoryId, subCategoryId, value) => {
    setState((prev) => {
      const categories = prev.categories.map((cat) => {
        if (cat.id !== categoryId) return cat
        return {
          ...cat,
          subCategories: cat.subCategories.map((sub) =>
            sub.id !== subCategoryId ? sub : { ...sub, amount: Number(value) || 0 }
          ),
        }
      })
      return { ...prev, categories }
    })
  }, [])

  const addSubCategory = useCallback((categoryId, name) => {
    const trimmed = (name || '').trim()
    if (!trimmed) return
    setState((prev) => {
      const categories = prev.categories.map((cat) => {
        if (cat.id !== categoryId) return cat
        const names = new Set(cat.subCategories.map((s) => s.name.toLowerCase()))
        if (names.has(trimmed.toLowerCase())) return cat
        const newSub = { id: makeSubCategoryId(), name: trimmed, amount: 0 }
        return { ...cat, subCategories: [...cat.subCategories, newSub] }
      })
      return { ...prev, categories }
    })
  }, [])

  const removeSubCategory = useCallback((categoryId, subCategoryId) => {
    const key = `${categoryId}_${subCategoryId}`
    setState((prev) => {
      const categories = prev.categories.map((cat) => {
        if (cat.id !== categoryId) return cat
        const next = cat.subCategories.filter((s) => s.id !== subCategoryId)
        if (next.length === 0) return cat
        return { ...cat, subCategories: next }
      })
      const { [key]: _s, ...expenseSpent } = prev.expenseSpent
      const { [key]: _o, ...expenseOtherSpent } = prev.expenseOtherSpent
      return { ...prev, categories, expenseSpent, expenseOtherSpent }
    })
  }, [])

  const setCategoryName = useCallback((categoryId, name) => {
    const trimmed = (name || '').trim()
    if (!trimmed) return
    setState((prev) => ({
      ...prev,
      categories: prev.categories.map((cat) =>
        cat.id !== categoryId ? cat : { ...cat, name: trimmed }
      ),
    }))
  }, [])

  const setSubCategoryName = useCallback((categoryId, subCategoryId, name) => {
    const trimmed = (name || '').trim()
    if (!trimmed) return
    setState((prev) => ({
      ...prev,
      categories: prev.categories.map((cat) => {
        if (cat.id !== categoryId) return cat
        return {
          ...cat,
          subCategories: cat.subCategories.map((sub) =>
            sub.id !== subCategoryId ? sub : { ...sub, name: trimmed }
          ),
        }
      }),
    }))
  }, [])

  const removeCategory = useCallback((categoryId) => {
    setState((prev) => {
      const categories = prev.categories.filter((c) => c.id !== categoryId)
      const prefix = `${categoryId}_`
      const expenseSpent = Object.fromEntries(
        Object.entries(prev.expenseSpent).filter(([k]) => !k.startsWith(prefix))
      )
      const expenseOtherSpent = Object.fromEntries(
        Object.entries(prev.expenseOtherSpent).filter(([k]) => !k.startsWith(prefix))
      )
      const { [categoryId]: _, ...expenseNotes } = prev.expenseNotes
      return { ...prev, categories, expenseSpent, expenseOtherSpent, expenseNotes }
    })
  }, [])

  const addCategory = useCallback((name) => {
    const trimmed = (name || '').trim()
    if (!trimmed) return
    setState((prev) => {
      const newCategory = {
        id: makeCategoryId(),
        name: trimmed,
        subCategories: [],
      }
      return { ...prev, categories: [...prev.categories, newCategory] }
    })
  }, [])

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
      categories: state.categories,
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
      setExpenseSpent,
      setExpenseOtherSpent,
      setExpenseNote,
      setOtherPersonName,
    }),
    [
      state.categories,
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
