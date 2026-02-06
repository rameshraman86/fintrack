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
  { id: 'phone-bill', name: 'My phone bill' },
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
