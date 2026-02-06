import { useState, useRef } from 'react'

/**
 * A controlled text input that allows typing decimal values (up to 2 places).
 * Stores the raw string locally while focused so the user can type "5." or "12.3"
 * without the dot/trailing digits being stripped. Commits the parsed number on blur.
 */
export default function DecimalInput({
  value,
  onChange,
  placeholder = '0.00',
  className,
  id,
  style,
  readOnly,
}) {
  const [focused, setFocused] = useState(false)
  const [raw, setRaw] = useState('')
  const inputRef = useRef(null)

  // What the user sees: while focused show their raw text; otherwise show the committed number
  const display = focused
    ? raw
    : value > 0
      ? value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      : ''

  const handleFocus = () => {
    setFocused(true)
    // Seed the raw buffer with the current numeric value
    setRaw(value > 0 ? String(value) : '')
  }

  const handleBlur = () => {
    setFocused(false)
    // Commit whatever is in the buffer
    const parsed = parseFloat(raw)
    onChange(Number.isFinite(parsed) && parsed >= 0 ? Math.round(parsed * 100) / 100 : 0)
  }

  const handleChange = (e) => {
    let v = e.target.value

    // Only allow digits, a single dot, and up to 2 decimal places
    // Strip everything except digits and dots
    v = v.replace(/[^0-9.]/g, '')

    // Prevent multiple dots
    const parts = v.split('.')
    if (parts.length > 2) {
      v = parts[0] + '.' + parts.slice(1).join('')
    }

    // Limit to 2 decimal places
    if (parts.length === 2 && parts[1].length > 2) {
      v = parts[0] + '.' + parts[1].slice(0, 2)
    }

    setRaw(v)

    // Also push intermediate value to parent so totals update live
    const parsed = parseFloat(v)
    if (Number.isFinite(parsed) && parsed >= 0) {
      onChange(Math.round(parsed * 100) / 100)
    } else if (v === '' || v === '0') {
      onChange(0)
    }
  }

  return (
    <input
      ref={inputRef}
      type="text"
      inputMode="decimal"
      id={id}
      className={className}
      style={style}
      value={display}
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      placeholder={placeholder}
      readOnly={readOnly}
      autoComplete="off"
    />
  )
}
