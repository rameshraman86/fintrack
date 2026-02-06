import { useState } from 'react'
import styles from './Wealth.module.css'

const DEFAULT_ASSETS = [
  { id: '1', name: 'Savings account', amount: 0 },
  { id: '2', name: 'Investments', amount: 0 },
  { id: '3', name: 'Property', amount: 0 },
  { id: '4', name: 'Other assets', amount: 0 },
]

const DEFAULT_LIABILITIES = [
  { id: '1', name: 'Credit cards', amount: 0 },
  { id: '2', name: 'Loans', amount: 0 },
  { id: '3', name: 'Mortgage', amount: 0 },
  { id: '4', name: 'Other debt', amount: 0 },
]

export default function Wealth() {
  const [assets, setAssets] = useState(DEFAULT_ASSETS)
  const [liabilities, setLiabilities] = useState(DEFAULT_LIABILITIES)

  const totalAssets = assets.reduce((sum, a) => sum + a.amount, 0)
  const totalLiabilities = liabilities.reduce((sum, l) => sum + l.amount, 0)
  const totalDebt = totalLiabilities
  const totalWealth = totalAssets - totalLiabilities

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Wealth Overview</h1>
        <p className={styles.subtitle}>
          See your net worth: assets minus liabilities and debt.
        </p>
      </header>

      <section className={styles.netWorth}>
        <div className={styles.netWorthCard}>
          <span className={styles.netWorthLabel}>Total wealth (net worth)</span>
          <span
            className={`${styles.netWorthValue} mono ${
              totalWealth >= 0 ? styles.positive : styles.negative
            }`}
          >
            ${totalWealth.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
      </section>

      <section className={styles.breakdown}>
        <div className={styles.breakdownGrid}>
          <div className={styles.breakdownCard}>
            <h2 className={styles.breakdownTitle}>
              <span className={styles.breakdownIcon} style={{ background: 'var(--success-soft)', color: 'var(--success)' }}>↑</span>
              Assets
            </h2>
            <p className={`${styles.breakdownAmount} mono`}>
              ${totalAssets.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
            <ul className={styles.itemList}>
              {assets.map((item) => (
                <li key={item.id} className={styles.itemRow}>
                  <span>{item.name}</span>
                  <span className="mono">
                    ${item.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className={styles.breakdownCard}>
            <h2 className={styles.breakdownTitle}>
              <span className={styles.breakdownIcon} style={{ background: 'var(--danger-soft)', color: 'var(--danger)' }}>↓</span>
              Liabilities & Debt
            </h2>
            <p className={`${styles.breakdownAmount} mono ${styles.amountNegative}`}>
              ${totalDebt.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
            <ul className={styles.itemList}>
              {liabilities.map((item) => (
                <li key={item.id} className={styles.itemRow}>
                  <span>{item.name}</span>
                  <span className="mono">
                    ${item.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className={styles.formula}>
        <div className={styles.formulaCard}>
          <span className={styles.formulaLabel}>Net worth formula</span>
          <p className={styles.formulaText}>
            <strong className={styles.formulaPositive}>Total assets</strong>
            {' − '}
            <strong className={styles.formulaNegative}>Total liabilities (debt)</strong>
            {' = '}
            <strong>Total wealth</strong>
          </p>
          <p className={`${styles.formulaResult} mono`}>
            ${totalAssets.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            {' − '}
            ${totalDebt.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            {' = '}
            <span className={totalWealth >= 0 ? styles.formulaPositive : styles.formulaNegative}>
              ${totalWealth.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </p>
        </div>
      </section>
    </div>
  )
}
