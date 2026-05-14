import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import i18n from '../../shared/i18n'
import styles from './SettingsPage.module.css'

const LANGUAGES = [
  { code: 'ru', label: 'Русский', flag: '🇷🇺' },
  { code: 'ro', label: 'Română',  flag: '🇷🇴' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
]

export default function SettingsPage() {
  const { t } = useTranslation()
  const [active, setActive] = useState('account')
  const [currentLang, setCurrentLang] = useState(i18n.language?.slice(0, 2) || 'ru')

  const SECTIONS = [
    { id: 'account',       label: t('settings.account'),       icon: <UserIcon /> },
    { id: 'security',      label: t('settings.security'),      icon: <LockIcon /> },
    { id: 'privacy',       label: t('settings.privacy'),       icon: <ShieldIcon /> },
    { id: 'notifications', label: t('settings.notifications'), icon: <BellIcon /> },
    { id: 'language',      label: t('settings.language'),      icon: <GlobeIcon /> },
  ]

  const handleLangChange = (code) => {
    setCurrentLang(code)
    i18n.changeLanguage(code)
  }

  return (
    <div className={styles.page}>

      {/* ── Sidebar ── */}
      <aside className={styles.sidebar}>
        <h2 className={styles.sidebarTitle}>{t('settings.title')}</h2>
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
          <Section title={t('settings.account')}>
            <Field label={t('settings.username')} value="lara" />
            <Field label={t('settings.fullName')} value="Lara" />
            <Field label={t('settings.email')} value="lara@mail.ru" />
            <Field label={t('settings.city')} value="Кишинёв" />
            <Field label={t('settings.country')} value="MD" />
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>{t('settings.accountType')}</label>
              <div className={styles.typeToggle}>
                <button className={`${styles.typeBtn} ${styles.typeBtnActive}`}>{t('settings.personal')}</button>
                <button className={styles.typeBtn}>{t('settings.business')}</button>
              </div>
            </div>
            <div className={styles.actions}>
              <button className={styles.saveBtn}>{t('settings.saveChanges')}</button>
            </div>
          </Section>
        )}

        {active === 'security' && (
          <Section title={t('settings.security')}>
            <Field label={t('settings.currentPassword')} type="password" value="••••••••" />
            <Field label={t('settings.newPassword')} type="password" value="" placeholder={t('settings.minChars')} />
            <Field label={t('settings.confirmPassword')} type="password" value="" placeholder={t('settings.repeatPassword')} />
            <div className={styles.actions}>
              <button className={styles.saveBtn}>{t('settings.changePassword')}</button>
            </div>
            <div className={styles.divider} />
            <div className={styles.dangerZone}>
              <div className={styles.dangerTitle}>{t('settings.dangerZone')}</div>
              <div className={styles.dangerRow}>
                <div>
                  <div className={styles.dangerLabel}>{t('settings.deleteAccount')}</div>
                  <div className={styles.dangerDesc}>{t('settings.deleteWarning')}</div>
                </div>
                <button className={styles.dangerBtn}>{t('settings.delete')}</button>
              </div>
            </div>
          </Section>
        )}

        {active === 'privacy' && (
          <Section title={t('settings.privacy')}>
            <Toggle label={t('settings.privateAccount')} desc={t('settings.privateAccountDesc')} />
            <Toggle label={t('settings.hideFromSearch')} desc={t('settings.hideFromSearchDesc')} />
            <Toggle label={t('settings.showActivity')} desc={t('settings.showActivityDesc')} defaultOn />
          </Section>
        )}

        {active === 'notifications' && (
          <Section title={t('settings.notifications')}>
            <Toggle label={t('settings.notifFollowers')} desc={t('settings.notifFollowersDesc')} defaultOn />
            <Toggle label={t('settings.notifLikes')} desc={t('settings.notifLikesDesc')} defaultOn />
            <Toggle label={t('settings.notifComments')} desc={t('settings.notifCommentsDesc')} defaultOn />
            <Toggle label={t('settings.notifMessages')} desc={t('settings.notifMessagesDesc')} defaultOn />
            <Toggle label={t('settings.notifSystem')} desc={t('settings.notifSystemDesc')} />
          </Section>
        )}

        {active === 'language' && (
          <Section title={t('settings.interfaceLang')}>
            <div className={styles.langList}>
              {LANGUAGES.map(l => (
                <button
                  key={l.code}
                  className={`${styles.langItem} ${currentLang === l.code ? styles.langActive : ''}`}
                  onClick={() => handleLangChange(l.code)}
                >
                  <span className={styles.langFlag}>{l.flag}</span>
                  <span className={styles.langLabel}>{l.label}</span>
                  {currentLang === l.code && <span className={styles.langCheck}>✓</span>}
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
