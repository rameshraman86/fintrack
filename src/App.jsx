import { Routes, Route, Navigate } from 'react-router-dom'
import { AppDataProvider } from './context/AppData'
import DashboardLayout from './layouts/DashboardLayout'
import Budget from './pages/Budget'
import Expenses from './pages/Expenses'
import Wealth from './pages/Wealth'

export default function App() {
  return (
    <AppDataProvider>
    <Routes>
      <Route path="/" element={<DashboardLayout />}>
        <Route index element={<Budget />} />
        <Route path="budget" element={<Budget />} />
        <Route path="expenses" element={<Expenses />} />
        <Route path="wealth" element={<Wealth />} />
      </Route>
      <Route path="*" element={<Navigate to="/budget" replace />} />
    </Routes>
    </AppDataProvider>
  )
}
