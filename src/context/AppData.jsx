import { createContext, useContext, useCallback, useMemo, useState, useEffect } from 'react'
import {
  BUDGET_CATEGORIES,
  getInitialBudgetState,
  EXPENSE_NOTES_CATEGORY_IDS,
} from '../data/budgetCategories'

const STORAGE_KEY = 'fintrack-data'

function loadStored() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const data = JSON.parse(raw)
    return data
  } catch {
    return null
  }
}

function isPlainObject(v) {
  return v != null && typeof v === 'object' && !Array.isArray(v)
}

/** Coerce object values to numbers so localStorage string values don't cause string concatenation in arithmetic. */
function toNumberMap(obj) {
  if (!isPlainObject(obj)) return {}
  return Object.fromEntries(
    Object.entries(obj).map(([k, v]) => {
      const n = Number(v)
      return [k, Number.isFinite(n) ? n : 0]
    })
  )
}

function mergeWithDefaults(data) {
  const defaultBudget = getInitialBudgetState(BUDGET_CATEGORIES)
  const defaultNotes = Object.fromEntries(EXPENSE_NOTES_CATEGORY_IDS.map((id) => [id, '']))
  return {
    budget: { ...defaultBudget, ...toNumberMap(isPlainObject(data?.budget) ? data.budget : {}) },
    expenseSpent: { ...defaultBudget, ...toNumberMap(isPlainObject(data?.expenseSpent) ? data.expenseSpent : {}) },
    expenseOtherSpent: { ...defaultBudget, ...toNumberMap(isPlainObject(data?.expenseOtherSpent) ? data.expenseOtherSpent : {}) },
    expenseNotes: { ...defaultNotes, ...(isPlainObject(data?.expenseNotes) ? data.expenseNotes : {}) },
    otherPersonName: typeof data?.otherPersonName === 'string' ? data.otherPersonName : '',
  }
}

function saveStored(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (e) {
    console.warn('Failed to save to localStorage', e)
  }
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

  const setBudget = useCallback((key, value) => {
    setState((prev) => ({
      ...prev,
      budget: { ...prev.budget, [key]: value },
    }))
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
      budget: state.budget,
      expenseSpent: state.expenseSpent,
      expenseOtherSpent: state.expenseOtherSpent,
      expenseNotes: state.expenseNotes,
      otherPersonName: state.otherPersonName,
      setBudget,
      setExpenseSpent,
      setExpenseOtherSpent,
      setExpenseNote,
      setOtherPersonName,
    }),
    [
      state.budget,
      state.expenseSpent,
      state.expenseOtherSpent,
      state.expenseNotes,
      state.otherPersonName,
      setBudget,
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
