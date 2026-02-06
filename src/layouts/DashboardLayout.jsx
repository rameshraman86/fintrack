import { Outlet } from 'react-router-dom'
import { NavLink } from 'react-router-dom'
import styles from './DashboardLayout.module.css'

const navItems = [
  { to: '/budget', label: 'Monthly budget', icon: 'Budget' },
  { to: '/expenses', label: 'Expenses', icon: 'Expenses' },
  { to: '/wealth', label: 'Wealth', icon: 'Wealth' },
]

function NavIcon({ name }) {
  if (name === 'Budget') {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <path d="M12 8v8M8 12h8" />
      </svg>
    )
  }
  if (name === 'Expenses') {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    )
  }
  if (name === 'Wealth') {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    )
  }
  return null
}

export default function DashboardLayout() {
  return (
    <div className={styles.wrapper}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <span className={styles.brandIcon}>◈</span>
          <span className={styles.brandName}>FinTrack</span>
        </div>
        <nav className={styles.nav}>
          {navItems.map(({ to, label, icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`
              }
              end={to !== '/'}
            >
              <span className={styles.navIcon}>
                <NavIcon name={icon} />
              </span>
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <div className={styles.sidebarFooter}>
          <span className={styles.footerText}>Budget & wealth</span>
        </div>
      </aside>
      <main className={`${styles.main} animate-fade-in`}>
        <Outlet />
      </main>
    </div>
  )
}
