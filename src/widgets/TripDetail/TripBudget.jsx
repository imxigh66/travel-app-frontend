import { useState, useEffect } from 'react'
import { tripApi } from '../../entities/trip/api/tripApi'
import styles from './TripBudget.module.css'

const CATEGORIES = [
  {
    value: 'Hotel', label: 'Отель', color: '#6366f1',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M3 22V12a9 9 0 0 1 18 0v10"/><path d="M21 12H3"/><rect x="9" y="15" width="6" height="7"/></svg>,
  },
  {
    value: 'Food', label: 'Еда', color: '#f59e0b',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M3 11l19-9-9 19-2-8-8-2z"/></svg>,
  },
  {
    value: 'Transport', label: 'Транспорт', color: '#3b82f6',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4l3 5v3h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>,
  },
  {
    value: 'Activities', label: 'Активности', color: '#ec4899',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  },
  {
    value: 'Shopping', label: 'Шопинг', color: '#8b5cf6',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>,
  },
  {
    value: 'Other', label: 'Прочее', color: '#9E9690',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
  },
]

const getCat = (value) => CATEGORIES.find(c => c.value === value) ?? CATEGORIES[5]

function formatAmount(amount, currency = 'EUR') {
  const symbols = { EUR: '€', USD: '$', RUB: '₽', RON: 'lei', GBP: '£' }
  const sym = symbols[currency] ?? currency
  return `${sym}${Number(amount).toFixed(0)}`
}

export function TripBudget({ tripId, isOwner }) {
  const [budget, setBudget]       = useState(null)
  const [loading, setLoading]     = useState(true)
  const [showForm, setShowForm]   = useState(false)       // форма расхода
  const [showLimit, setShowLimit] = useState(false)       // форма лимита
  const [saving, setSaving]       = useState(false)
  const [deleting, setDeleting]   = useState(null)        // expenseId

  const [expenseForm, setExpenseForm] = useState({
    category: 'Food',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
  })

  const [limitForm, setLimitForm] = useState({ currency: 'EUR', totalLimit: '' })

  // ── Load ──────────────────────────────────────────────────────
  useEffect(() => {
    tripApi.getBudget(tripId)
      .then(data => {
        setBudget(data)
        setLimitForm({ currency: data.currency ?? 'EUR', totalLimit: data.totalLimit ?? '' })
      })
      .catch(() => setBudget({ currency: 'EUR', totalLimit: 0, totalSpent: 0, expenses: [] }))
      .finally(() => setLoading(false))
  }, [tripId])

  // ── Set limit ─────────────────────────────────────────────────
  const handleSaveLimit = async () => {
    if (!limitForm.totalLimit) return
    setSaving(true)
    try {
      const data = await tripApi.createOrUpdateBudget(tripId, {
        currency: limitForm.currency,
        totalLimit: Number(limitForm.totalLimit),
      })
      setBudget(data)
      setShowLimit(false)
    } catch {
      alert('Не удалось сохранить')
    } finally {
      setSaving(false)
    }
  }

  // ── Add expense ───────────────────────────────────────────────
  const handleAddExpense = async () => {
    if (!expenseForm.amount || Number(expenseForm.amount) <= 0) return
    setSaving(true)
    try {
      const data = await tripApi.addExpense(tripId, {
        category: expenseForm.category,
        amount: Number(expenseForm.amount),
        description: expenseForm.description.trim() || null,
        date: expenseForm.date,
      })
      // Пересчитываем локально
      setBudget(prev => ({
        ...prev,
        totalSpent: (prev.totalSpent ?? 0) + Number(expenseForm.amount),
        expenses: [data, ...(prev.expenses ?? [])],
      }))
      setExpenseForm(f => ({ ...f, amount: '', description: '' }))
      setShowForm(false)
    } catch {
      alert('Не удалось добавить расход')
    } finally {
      setSaving(false)
    }
  }

  // ── Delete expense ────────────────────────────────────────────
  const handleDelete = async (expenseId, amount) => {
    setDeleting(expenseId)
    try {
      await tripApi.deleteExpense(tripId, expenseId)
      setBudget(prev => ({
        ...prev,
        totalSpent: Math.max(0, (prev.totalSpent ?? 0) - amount),
        expenses: prev.expenses.filter(e => e.expenseId !== expenseId),
      }))
    } catch {
      alert('Не удалось удалить')
    } finally {
      setDeleting(null)
    }
  }

  if (loading) return (
    <div className={styles.loading}>
      {[1,2,3].map(i => <div key={i} className={styles.skeleton} />)}
    </div>
  )

  const { currency, totalLimit, totalSpent = 0, expenses = [] } = budget ?? {}
  const remaining = (totalLimit ?? 0) - (totalSpent ?? 0)
  const percent   = totalLimit > 0 ? Math.min(100, Math.round((totalSpent / totalLimit) * 100)) : 0
  const isOver    = remaining < 0

  // Группируем по категориям для диаграммы
  const byCategory = CATEGORIES.map(cat => ({
    ...cat,
    spent: expenses.filter(e => e.category === cat.value).reduce((s, e) => s + e.amount, 0),
  })).filter(c => c.spent > 0)

  return (
    <div className={styles.wrapper}>

      {/* ── Сводка ── */}
      <div className={styles.summary}>
        <div className={styles.summaryStats}>
          <div className={styles.statBlock}>
            <div className={styles.statVal}>{formatAmount(totalSpent, currency)}</div>
            <div className={styles.statLbl}>Потрачено</div>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.statBlock}>
            <div className={`${styles.statVal} ${isOver ? styles.statOver : styles.statGood}`}>
              {formatAmount(Math.abs(remaining), currency)}
            </div>
            <div className={styles.statLbl}>{isOver ? 'Перерасход' : 'Остаток'}</div>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.statBlock}>
            <div className={styles.statVal}>{formatAmount(totalLimit, currency)}</div>
            <div className={styles.statLbl}>Лимит</div>
          </div>
        </div>

        {/* Progress bar */}
        {totalLimit > 0 && (
          <div className={styles.progressWrap}>
            <div className={styles.progressBar}>
              <div
                className={`${styles.progressFill} ${isOver ? styles.progressOver : percent > 75 ? styles.progressWarn : ''}`}
                style={{ width: `${percent}%` }}
              />
            </div>
            <span className={styles.progressLabel}>{percent}%</span>
          </div>
        )}

        {/* Кнопки */}
        {isOwner && (
          <div className={styles.summaryActions}>
            <button className={styles.limitBtn} onClick={() => setShowLimit(v => !v)}>
              {totalLimit > 0 ? '✏️ Изменить лимит' : '💰 Установить лимит'}
            </button>
            <button className={styles.addBtn} onClick={() => setShowForm(v => !v)}>
              + Добавить расход
            </button>
          </div>
        )}
      </div>

      {/* ── Форма лимита ── */}
      {showLimit && isOwner && (
        <div className={styles.formCard}>
          <div className={styles.formTitle}>Бюджет поездки</div>
          <div className={styles.formRow}>
            <select
              className={styles.select}
              value={limitForm.currency}
              onChange={e => setLimitForm(f => ({ ...f, currency: e.target.value }))}
            >
              {['EUR','USD','RUB','RON','GBP','TRY'].map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <input
              className={styles.input}
              type="number"
              placeholder="Лимит, например 1500"
              value={limitForm.totalLimit}
              onChange={e => setLimitForm(f => ({ ...f, totalLimit: e.target.value }))}
              min="0"
            />
          </div>
          <div className={styles.formActions}>
            <button className={styles.cancelBtn} onClick={() => setShowLimit(false)}>Отмена</button>
            <button className={styles.saveBtn} onClick={handleSaveLimit} disabled={saving || !limitForm.totalLimit}>
              {saving ? 'Сохраняем...' : 'Сохранить'}
            </button>
          </div>
        </div>
      )}

      {/* ── Форма расхода ── */}
      {showForm && isOwner && (
        <div className={styles.formCard}>
          <div className={styles.formTitle}>Новый расход</div>

          {/* Категории */}
          <div className={styles.catGrid}>
            {CATEGORIES.map(cat => (
              <button
                key={cat.value}
                className={`${styles.catBtn} ${expenseForm.category === cat.value ? styles.catBtnActive : ''}`}
                onClick={() => setExpenseForm(f => ({ ...f, category: cat.value }))}
                style={expenseForm.category === cat.value ? { borderColor: cat.color, color: cat.color, background: `${cat.color}12` } : {}}
              >
                <span className={styles.catBtnIcon}>{cat.icon}</span>
                {cat.label}
              </button>
            ))}
          </div>

          <div className={styles.formRow}>
            <input
              className={styles.input}
              type="number"
              placeholder="Сумма"
              value={expenseForm.amount}
              onChange={e => setExpenseForm(f => ({ ...f, amount: e.target.value }))}
              min="0"
              step="0.01"
            />
            <input
              className={styles.input}
              type="date"
              value={expenseForm.date}
              onChange={e => setExpenseForm(f => ({ ...f, date: e.target.value }))}
            />
          </div>
          <input
            className={styles.input}
            placeholder="Описание (необязательно)"
            value={expenseForm.description}
            onChange={e => setExpenseForm(f => ({ ...f, description: e.target.value }))}
            maxLength={200}
          />
          <div className={styles.formActions}>
            <button className={styles.cancelBtn} onClick={() => setShowForm(false)}>Отмена</button>
            <button
              className={styles.saveBtn}
              onClick={handleAddExpense}
              disabled={saving || !expenseForm.amount}
            >
              {saving ? 'Добавляем...' : 'Добавить'}
            </button>
          </div>
        </div>
      )}

      {/* ── Разбивка по категориям ── */}
      {byCategory.length > 0 && (
        <div className={styles.section}>
          <div className={styles.sectionTitle}>По категориям</div>
          <div className={styles.catBreakdown}>
            {byCategory.map(cat => (
              <div key={cat.value} className={styles.catRow}>
                <div className={styles.catRowLeft}>
                  <div className={styles.catIconSmall} style={{ color: cat.color }}>
                    {cat.icon}
                  </div>
                  <span className={styles.catRowLabel}>{cat.label}</span>
                </div>
                <div className={styles.catRowRight}>
                  <span className={styles.catRowAmt}>{formatAmount(cat.spent, currency)}</span>
                  {totalSpent > 0 && (
                    <span className={styles.catRowPct}>{Math.round((cat.spent / totalSpent) * 100)}%</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Список расходов ── */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>
          Все расходы
          {expenses.length > 0 && <span className={styles.countBadge}>{expenses.length}</span>}
        </div>

        {expenses.length === 0 ? (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            </div>
            <p>Расходов пока нет</p>
            {isOwner && (
              <button className={styles.emptyAddBtn} onClick={() => setShowForm(true)}>
                + Добавить первый расход
              </button>
            )}
          </div>
        ) : (
          <div className={styles.expenseList}>
            {expenses.map(e => {
              const cat = getCat(e.category)
              return (
                <div key={e.expenseId} className={styles.expenseItem}>
                  <div className={styles.expenseIcon} style={{ background: `${cat.color}18`, color: cat.color }}>
                    {cat.icon}
                  </div>
                  <div className={styles.expenseInfo}>
                    <div className={styles.expenseName}>
                      {e.description || cat.label}
                    </div>
                    <div className={styles.expenseMeta}>
                      {cat.label} · {new Date(e.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
                    </div>
                  </div>
                  <div className={styles.expenseAmt}>{formatAmount(e.amount, currency)}</div>
                  {isOwner && (
                    <button
                      className={styles.delBtn}
                      onClick={() => handleDelete(e.expenseId, e.amount)}
                      disabled={deleting === e.expenseId}
                    >
                      {deleting === e.expenseId ? '...' : '×'}
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

    </div>
  )
}