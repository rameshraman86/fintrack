/**
 * Monthly budget category structure.
 * - Simple category: { id, name } (one budget amount for the whole category)
 * - Category with subcategories: { id, name, items: [ { id, name }, ... ] }
 * - Category with grouped sub-sections (e.g. Travelling): { id, name, groups: [ { id, name, items: [ ... ] }, ... ] }
 */

export const BUDGET_CATEGORIES = [
  {
    id: 'house',
    name: 'House',
    items: [
      { id: 'rent', name: 'Rent' },
      { id: 'electricity', name: 'Electricity' },
      { id: 'gas', name: 'Gas' },
      { id: 'water', name: 'Water' },
      { id: 'insurance', name: 'Insurance' },
    ],
  },
  {
    id: 'car',
    name: 'Car',
    items: [
      { id: 'loan', name: 'Loan' },
      { id: 'insurance', name: 'Insurance' },
      { id: 'fuel', name: 'Fuel' },
      { id: 'maintenance', name: 'Maintenance' },
    ],
  },
  { id: 'subscriptions', name: 'Subscriptions' },
  { id: 'groceries', name: 'Groceries and essentials' },
  { id: 'internet', name: 'Internet' },
  { id: 'going-out', name: 'Going out' },
  { id: 'personal-expenses', name: 'Personal expenses' },
  { id: 'common-shopping', name: 'Common shopping' },
  {
    id: 'travelling',
    name: 'Travelling',
    groups: [
      {
        id: 'travel-transport',
        name: 'Travel (flight, car, hotel, parking, gas, cab, visa)',
        items: [
          { id: 'flight', name: 'Flight' },
          { id: 'car', name: 'Car' },
          { id: 'hotel', name: 'Hotel' },
          { id: 'parking', name: 'Parking' },
          { id: 'gas', name: 'Gas' },
          { id: 'cab', name: 'Cab' },
          { id: 'visa', name: 'Visa' },
        ],
      },
      {
        id: 'travel-shopping-eating',
        name: 'Travel (shopping and eating out)',
        items: [
          { id: 'shopping', name: 'Shopping' },
          { id: 'eating-out', name: 'Eating out' },
        ],
      },
    ],
  },
  { id: 'miscellaneous', name: 'Miscellaneous' },
]

/** Get a flat list of { key, label } for every budget line (for state keys and display). */
export function getBudgetKeys(categories) {
  const result = []
  for (const cat of categories) {
    if (cat.items) {
      for (const item of cat.items) {
        result.push({ key: `${cat.id}_${item.id}`, label: item.name, categoryName: cat.name })
      }
    } else if (cat.groups) {
      for (const group of cat.groups) {
        for (const item of group.items) {
          result.push({
            key: `${cat.id}_${group.id}_${item.id}`,
            label: item.name,
            categoryName: cat.name,
            groupName: group.name,
          })
        }
      }
    } else {
      result.push({ key: cat.id, label: cat.name, categoryName: cat.name })
    }
  }
  return result
}

/** Build initial state: all keys with value 0. */
export function getInitialBudgetState(categories) {
  const keys = getBudgetKeys(categories)
  return Object.fromEntries(keys.map(({ key }) => [key, 0]))
}

/** Category IDs that show a notes field on the Expenses page. */
export const EXPENSE_NOTES_CATEGORY_IDS = [
  'subscriptions',
  'going-out',
  'personal-expenses',
  'common-shopping',
]

/**
 * New data model: categories with user-managed subCategories.
 * Converts legacy BUDGET_CATEGORIES into Category[] with subCategories (SubCategory = { id, name, amount }).
 */
export function getInitialCategories() {
  return BUDGET_CATEGORIES.map((cat) => {
    if (cat.items) {
      return {
        id: cat.id,
        name: cat.name,
        subCategories: cat.items.map((item) => ({
          id: item.id,
          name: item.name,
          amount: 0,
        })),
      }
    }
    if (cat.groups) {
      const subCategories = []
      for (const group of cat.groups) {
        for (const item of group.items) {
          subCategories.push({
            id: `${group.id}_${item.id}`,
            name: item.name,
            amount: 0,
          })
        }
      }
      return { id: cat.id, name: cat.name, subCategories }
    }
    return {
      id: cat.id,
      name: cat.name,
      subCategories: [{ id: cat.id, name: cat.name, amount: 0 }],
    }
  })
}

/** Get flat list of { key, label, categoryName } from new Category[] shape. Key = categoryId_subCategoryId. */
export function getBudgetKeysFromCategories(categories) {
  const result = []
  for (const cat of categories) {
    for (const sub of cat.subCategories) {
      result.push({
        key: `${cat.id}_${sub.id}`,
        label: sub.name,
        categoryName: cat.name,
      })
    }
  }
  return result
}

/** Build key -> budget amount map from categories (for Expenses totals and compatibility). */
export function getBudgetMapFromCategories(categories) {
  const map = {}
  for (const cat of categories) {
    for (const sub of cat.subCategories) {
      map[`${cat.id}_${sub.id}`] = Number(sub.amount) || 0
    }
  }
  return map
}
