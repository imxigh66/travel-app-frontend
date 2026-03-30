import { useState } from 'react'
import styles from './SettingsPage.module.css'

const SECTIONS = [
  { id: 'account',   label: 'Аккаунт',          icon: <UserIcon /> },
  { id: 'security',  label: 'Безопасность',      icon: <LockIcon /> },
  { id: 'privacy',   label: 'Конфиденциальность', icon: <ShieldIcon /> },
  { id: 'notifications', label: 'Уведомления',   icon: <BellIcon /> },
  { id: 'language',  label: 'Язык',              icon: <GlobeIcon /> },
]

export default function SettingsPage() {
  const [active, setActive] = useState('account')

  return (
    <div className={styles.page}>

      {/* ── Sidebar ── */}
      <aside className={styles.sidebar}>
        <h2 className={styles.sidebarTitle}>Настройки</h2>
        <nav className={styles.nav}>
          {SECTIONS.map(s => (
            <button
              key={s.id}
              className={`${styles.navItem} ${active === s.id ? styles.navActive : ''}`}
              onClick={() => setActive(s.id)}
            >
              <span className={styles.navIcon}>{s.icon}</span>
              {s.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* ── Content ── */}
      <div className={styles.content}>

        {active === 'account' && (
          <Section title="Аккаунт">
            <Field label="Имя пользователя" value="lara" />
            <Field label="Полное имя" value="Lara" />
            <Field label="Email" value="lara@mail.ru" />
            <Field label="Город" value="Кишинёв" />
            <Field label="Страна" value="MD" />
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>Тип аккаунта</label>
              <div className={styles.typeToggle}>
                <button className={`${styles.typeBtn} ${styles.typeBtnActive}`}>Personal</button>
                <button className={styles.typeBtn}>Business</button>
              </div>
            </div>
            <div className={styles.actions}>
              <button className={styles.saveBtn}>Сохранить изменения</button>
            </div>
          </Section>
        )}

        {active === 'security' && (
          <Section title="Безопасность">
            <Field label="Текущий пароль" type="password" value="••••••••" />
            <Field label="Новый пароль" type="password" value="" placeholder="Минимум 8 символов" />
            <Field label="Подтвердите пароль" type="password" value="" placeholder="Повторите новый пароль" />
            <div className={styles.actions}>
              <button className={styles.saveBtn}>Изменить пароль</button>
            </div>
            <div className={styles.divider} />
            <div className={styles.dangerZone}>
              <div className={styles.dangerTitle}>Опасная зона</div>
              <div className={styles.dangerRow}>
                <div>
                  <div className={styles.dangerLabel}>Удалить аккаунт</div>
                  <div className={styles.dangerDesc}>Это действие необратимо. Все данные будут удалены.</div>
                </div>
                <button className={styles.dangerBtn}>Удалить</button>
              </div>
            </div>
          </Section>
        )}

        {active === 'privacy' && (
          <Section title="Конфиденциальность">
            <Toggle label="Закрытый аккаунт" desc="Только подписчики могут видеть ваши публикации" />
            <Toggle label="Скрывать в поиске" desc="Ваш профиль не будет отображаться в результатах поиска" />
            <Toggle label="Показывать активность" desc="Другие пользователи видят когда вы были онлайн" defaultOn />
          </Section>
        )}

        {active === 'notifications' && (
          <Section title="Уведомления">
            <Toggle label="Новые подписчики" desc="Уведомлять когда кто-то подписывается на вас" defaultOn />
            <Toggle label="Лайки" desc="Уведомлять о новых лайках на ваши публикации" defaultOn />
            <Toggle label="Комментарии" desc="Уведомлять о новых комментариях" defaultOn />
            <Toggle label="Сообщения" desc="Уведомлять о новых личных сообщениях" defaultOn />
            <Toggle label="Обновления системы" desc="Новости и обновления платформы TravelFlow" />
          </Section>
        )}

        {active === 'language' && (
          <Section title="Язык интерфейса">
            <div className={styles.langList}>
              {[
                { code: 'RU', label: 'Русский', flag: '🇷🇺' },
                { code: 'RO', label: 'Română',  flag: '🇷🇴' },
                { code: 'EN', label: 'English', flag: '🇬🇧' },
              ].map(l => (
                <button
                  key={l.code}
                  className={`${styles.langItem} ${l.code === 'RU' ? styles.langActive : ''}`}
                >
                  <span className={styles.langFlag}>{l.flag}</span>
                  <span className={styles.langLabel}>{l.label}</span>
                  {l.code === 'RU' && <span className={styles.langCheck}>✓</span>}
                </button>
              ))}
            </div>
          </Section>
        )}

      </div>
    </div>
  )
}

// ── Sub-components ────────────────────────────────────────────

function Section({ title, children }) {
  return (
    <div className={styles.section}>
      <h3 className={styles.sectionTitle}>{title}</h3>
      <div className={styles.sectionBody}>{children}</div>
    </div>
  )
}

function Field({ label, value, type = 'text', placeholder }) {
  const [val, setVal] = useState(value || '')
  return (
    <div className={styles.fieldGroup}>
      <label className={styles.fieldLabel}>{label}</label>
      <input
        className={styles.fieldInput}
        type={type}
        value={val}
        placeholder={placeholder}
        onChange={e => setVal(e.target.value)}
      />
    </div>
  )
}

function Toggle({ label, desc, defaultOn = false }) {
  const [on, setOn] = useState(defaultOn)
  return (
    <div className={styles.toggleRow}>
      <div className={styles.toggleInfo}>
        <div className={styles.toggleLabel}>{label}</div>
        <div className={styles.toggleDesc}>{desc}</div>
      </div>
      <button
        className={`${styles.toggle} ${on ? styles.toggleOn : ''}`}
        onClick={() => setOn(!on)}
      >
        <span className={styles.toggleThumb} />
      </button>
    </div>
  )
}

// ── Icons ─────────────────────────────────────────────────────
function UserIcon()   { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> }
function LockIcon()   { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg> }
function ShieldIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> }
function BellIcon()   { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg> }
function GlobeIcon()  { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg> }