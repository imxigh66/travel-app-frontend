import { useState, useEffect, useRef } from 'react';
import { tripMemberApi } from '../../entities/tripMember/api/tripMemberApi';
import api from '../../shared/api/axios';
import styles from './TripMembers.module.css';

const ROLE_ICON  = { 0: '👑', 1: '✏️', 2: '👁' };
const ROLE_LABEL = { 0: 'Владелец', 1: 'Редактор', 2: 'Читатель' };

export function TripMembers({ tripId, currentUser, isOwner }) {
  const [members, setMembers]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [showAdd, setShowAdd]       = useState(false);
  const [addQuery, setAddQuery]     = useState('');
  const [addResults, setAddResults] = useState(null);
  const [searching, setSearching]   = useState(false);
  const [selected, setSelected]     = useState(null);
  const [addRole, setAddRole]       = useState(2);
  const [adding, setAdding]         = useState(false);

  const searchTimer = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    tripMemberApi.getMembers(tripId)
      .then(data => setMembers(Array.isArray(data) ? data : data?.items ?? []))
      .catch(() => setMembers([]))
      .finally(() => setLoading(false));
  }, [tripId]);

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setAddResults(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleQueryChange = (e) => {
    const val = e.target.value;
    setAddQuery(val);
    setSelected(null);
    clearTimeout(searchTimer.current);
    if (!val.trim()) { setAddResults(null); return; }
    searchTimer.current = setTimeout(() => searchUsers(val.trim()), 350);
  };

  const searchUsers = async (q) => {
    setSearching(true);
    try {
      const res = await api.get('/users', { params: { search: q, pageSize: 5 } });
      const all = res.data?.items ?? res.data?.data?.items ?? [];
      const memberIds = new Set(members.map(m => m.userId));
      setAddResults(all.filter(u => !memberIds.has(u.userId)));
    } catch {
      setAddResults([]);
    }
    setSearching(false);
  };

  const handleSelectUser = (user) => {
    setSelected(user);
    setAddQuery(user.name || user.username);
    setAddResults(null);
  };

  const handleAdd = async () => {
    if (!selected || adding) return;
    setAdding(true);
    try {
      await tripMemberApi.addMember(tripId, selected.userId, addRole);
      setMembers(prev => [...prev, {
        userId: selected.userId,
        username: selected.username,
        name: selected.name,
        profilePicture: selected.profilePicture,
        role: addRole,
        invitedAt: new Date().toISOString(),
      }]);
      setShowAdd(false);
      setAddQuery('');
      setSelected(null);
      setAddRole(2);
    } catch (e) {
      console.error(e);
    }
    setAdding(false);
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await tripMemberApi.updateRole(tripId, userId, newRole);
      setMembers(prev => prev.map(m => m.userId === userId ? { ...m, role: newRole } : m));
    } catch (e) {
      console.error(e);
    }
  };

  const handleRemove = async (userId) => {
    try {
      await tripMemberApi.removeMember(tripId, userId);
      setMembers(prev => prev.filter(m => m.userId !== userId));
    } catch (e) {
      console.error(e);
    }
  };

  const cancelAdd = () => {
    setShowAdd(false);
    setAddQuery('');
    setSelected(null);
    setAddResults(null);
  };

  if (loading) return (
    <div className={styles.loadingWrap}>
      {[1, 2, 3].map(i => <div key={i} className={styles.skeleton} />)}
    </div>
  );

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <h3 className={styles.title}>👥 Участники ({members.length})</h3>
        {isOwner && (
          <button className={styles.addBtn} onClick={() => setShowAdd(v => !v)}>
            {showAdd ? '✕ Отмена' : '+ Добавить'}
          </button>
        )}
      </div>

      <div className={styles.list}>
        {members.length === 0 ? (
          <div className={styles.empty}>Пока только вы. Пригласите друзей!</div>
        ) : members.map(member => (
          <div key={member.userId} className={styles.memberRow}>
            <div className={styles.avatar}>
              {member.profilePicture
                ? <img src={member.profilePicture} alt="" className={styles.avatarImg} />
                : <span>{member.username?.slice(0, 2).toUpperCase()}</span>}
            </div>

            <div className={styles.memberInfo}>
              <span className={styles.memberName}>
                {member.name || member.username}
                {member.userId === currentUser?.userId && (
                  <span className={styles.youBadge}> (Ты)</span>
                )}
              </span>
              <span className={styles.memberUsername}>@{member.username}</span>
            </div>

            {isOwner && member.role !== 0 && member.userId !== currentUser?.userId ? (
              <div className={styles.roleActions}>
                <select
                  className={styles.roleSelect}
                  value={member.role}
                  onChange={e => handleRoleChange(member.userId, Number(e.target.value))}
                >
                  <option value={1}>✏️ Редактор</option>
                  <option value={2}>👁 Читатель</option>
                </select>
                <button
                  className={styles.removeBtn}
                  onClick={() => handleRemove(member.userId)}
                  title="Удалить участника"
                >✕</button>
              </div>
            ) : (
              <span className={styles.roleBadge}>
                {ROLE_ICON[member.role]} {ROLE_LABEL[member.role]}
              </span>
            )}
          </div>
        ))}
      </div>

      {showAdd && isOwner && (
        <div className={styles.addForm}>
          <div className={styles.searchWrap} ref={dropdownRef}>
            <input
              className={styles.searchInput}
              placeholder="🔍 Поиск пользователя..."
              value={addQuery}
              onChange={handleQueryChange}
              autoFocus
            />
            {addResults !== null && (
              <div className={styles.searchDropdown}>
                {searching ? (
                  <div className={styles.dropPlaceholder}>Поиск…</div>
                ) : addResults.length === 0 ? (
                  <div className={styles.dropPlaceholder}>Ничего не найдено</div>
                ) : addResults.map(u => (
                  <button key={u.userId} className={styles.dropItem} onClick={() => handleSelectUser(u)}>
                    <div className={styles.dropAvatar}>
                      {u.profilePicture
                        ? <img src={u.profilePicture} alt="" />
                        : u.username?.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className={styles.dropName}>{u.name || u.username}</div>
                      <div className={styles.dropUsername}>@{u.username}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className={styles.roleRow}>
            <span className={styles.roleLabel}>Роль:</span>
            <label className={styles.roleOption}>
              <input type="radio" name="addRole" value={1} checked={addRole === 1} onChange={() => setAddRole(1)} />
              ✏️ Редактор
            </label>
            <label className={styles.roleOption}>
              <input type="radio" name="addRole" value={2} checked={addRole === 2} onChange={() => setAddRole(2)} />
              👁 Читатель
            </label>
          </div>

          <div className={styles.addActions}>
            <button className={styles.cancelBtn} onClick={cancelAdd}>Отмена</button>
            <button
              className={styles.confirmBtn}
              onClick={handleAdd}
              disabled={!selected || adding}
            >
              {adding ? 'Добавляем…' : 'Добавить'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
