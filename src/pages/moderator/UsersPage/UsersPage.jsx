import { useState, useEffect } from 'react'
import { moderatorUserApi } from '../../../entities/moderator/api/moderatorApi'
import styles from './UsersPage.module.css'

const ACCOUNT_TYPE = { 0: 'Personal', 1: 'Business' }

const FILTER_OPTIONS = [
  { value: '', label: 'Все типы' },
  { value: '0', label: 'Personal' },
  { value: '1', label: 'Business' },
]

const SORT_OPTIONS = [
  { value: '', label: 'По умолчанию' },
  { value: 'followers', label: 'По подписчикам' },
  { value: 'newest', label: 'Сначала новые' },
  { value: 'oldest', label: 'Сначала старые' },
]

export default function UsersPage() {
  const [users, setUsers]           = useState([])
  const [loading, setLoading]       = useState(true)
  const [page, setPage]             = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)

  const [search, setSearch]         = useState('')
  const [accountType, setAccountType] = useState('')
  const [sortBy, setSortBy]         = useState('')

  const load = async (p = 1) => {
    setLoading(true)
    try {
      const params = { pageNumber: p, pageSize: 20 }
      if (search.trim()) params.search = search.trim()
      if (accountType !== '') params.accountType = accountType
      if (sortBy) params.sortBy = sortBy
      const data = await moderatorUserApi.getAll(params)
      setUsers(data.items ?? [])
      setTotalCount(data.totalCount ?? 0)
      setTotalPages(data.totalPages ?? 1)
      setPage(p)
    } catch {}
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const handleSearch = () => load(1)

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Пользователи</h1>
          <p className={styles.subtitle}>{totalCount} зарегистрировано</p>
        </div>
      </div>

      {/* Filters */}
      <div className={styles.filters}>
        <input
          className={styles.searchInput}
          placeholder="Поиск по имени, email, username..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
        />
        <select className={styles.select} value={accountType} onChange={e => setAccountType(e.target.value)}>
          {FILTER_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <select className={styles.select} value={sortBy} onChange={e => setSortBy(e.target.value)}>
          {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <button className={styles.filterBtn} onClick={handleSearch}>Найти</button>
        <button className={styles.resetBtn} onClick={() => { setSearch(''); setAccountType(''); setSortBy(''); setTimeout(() => load(1), 0) }}>
          Сбросить
        </button>
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Пользователь</th>
              <th>Email</th>
              <th>Тип аккаунта</th>
              <th>Подписчики</th>
              <th>Дата регистрации</th>
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i}>
                    {[1,2,3,4,5].map(j => <td key={j}><div className={styles.skeleton} /></td>)}
                  </tr>
                ))
              : users.length === 0
                ? <tr><td colSpan={5} className={styles.emptyRow}>Пользователи не найдены</td></tr>
                : users.map(user => (
                    <tr key={user.userId}>
                      <td>
                        <div className={styles.userCell}>
                          <div className={styles.avatar}>
                            {user.profilePicture
                              ? <img src={user.profilePicture} alt={user.username} />
                              : <span>{user.name?.[0]?.toUpperCase() ?? '?'}</span>
                            }
                          </div>
                          <div>
                            <div className={styles.userName}>{user.name}</div>
                            <div className={styles.userHandle}>@{user.username}</div>
                          </div>
                        </div>
                      </td>
                      <td className={styles.muted}>{user.email}</td>
                      <td>
                        <span className={`${styles.badge} ${user.accountType === 1 ? styles.business : styles.personal}`}>
                          {ACCOUNT_TYPE[user.accountType] ?? '—'}
                        </span>
                      </td>
                      <td className={styles.count}>{user.followersCount ?? 0}</td>
                      <td className={styles.muted}>
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString('ru-RU') : '—'}
                      </td>
                    </tr>
                  ))
            }
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button className={styles.pageBtn} disabled={page === 1} onClick={() => load(page - 1)}>← Назад</button>
          <span className={styles.pageInfo}>стр. {page} из {totalPages}</span>
          <button className={styles.pageBtn} disabled={page >= totalPages} onClick={() => load(page + 1)}>Вперёд →</button>
        </div>
      )}
    </div>
  )
}