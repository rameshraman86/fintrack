import { Outlet } from 'react-router-dom'
import { NavLink } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import styles from './DashboardLayout.module.css'

const navItems = [
  { to: '/budget', label: 'Budget', icon: 'Budget' },
  { to: '/expenses', label: 'Expenses', icon: 'Expenses' },
  { to: '/wealth', label: 'Wealth', icon: 'Wealth' },
]

function NavIcon({ name }) {
  if (name === 'Budget') {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="3" />
        <path d="M3 9h18M9 21V9" />
      </svg>
    )
  }
  if (name === 'Expenses') {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 17l3-3 4 4 6-8 7 7" />
        <path d="M22 7v5h-5" />
      </svg>
    )
  }
  if (name === 'Wealth') {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M16 8h-4a2 2 0 100 4h2a2 2 0 110 4H8" />
        <path d="M12 6v2m0 8v2" />
      </svg>
    )
  }
  return null
}

function SunIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5" />
      <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
    </svg>
  )
}

export default function DashboardLayout() {
  const { theme, toggleTheme } = useTheme()

  return (
    <div className={styles.wrapper}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <div className={styles.brandLogo}>
            <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
              <defs>
                <linearGradient id="logo-grad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#8B5CF6" />
                  <stop offset="1" stopColor="#06B6D4" />
                </linearGradient>
              </defs>
              <rect width="32" height="32" rx="8" fill="url(#logo-grad)" />
              <path d="M10 22V14l6-4 6 4v8" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              <path d="M14 22v-4h4v4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            </svg>
          </div>
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
              <span className={styles.navLabel}>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className={styles.sidebarBottom}>
          <button
            className={styles.themeToggle}
            onClick={toggleTheme}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            <span className={styles.themeToggleTrack}>
              <span className={styles.themeToggleThumb}>
                {theme === 'dark' ? <MoonIcon /> : <SunIcon />}
              </span>
            </span>
            <span className={styles.themeToggleLabel}>
              {theme === 'dark' ? 'Dark' : 'Light'}
            </span>
          </button>
        </div>
      </aside>

      <main className={`${styles.main} animate-fade-in`}>
        <Outlet />
      </main>
    </div>
  )
}
