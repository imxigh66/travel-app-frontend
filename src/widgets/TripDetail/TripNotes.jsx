import { useState, useEffect } from 'react';
import { tripApi } from '../../entities/trip/api/tripApi';
import styles from './TripNotes.module.css';

export function TripNotes({ tripId }) {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ title: '', content: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    tripApi.getNotes(tripId)
      .then(data => setNotes(data ?? []))
      .finally(() => setLoading(false));
  }, [tripId]);

  const openCreate = () => {
    setForm({ title: '', content: '' });
    setIsCreating(true);
    setEditingId(null);
  };

  const openEdit = (note) => {
    setForm({ title: note.title, content: note.content });
    setEditingId(note.tripNoteId);
    setIsCreating(false);
  };

  const closeForm = () => {
    setIsCreating(false);
    setEditingId(null);
    setForm({ title: '', content: '' });
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.content.trim()) return;
    setSaving(true);
    try {
      if (isCreating) {
        const created = await tripApi.createNote(tripId, form);
        setNotes(prev => [created, ...prev]);
      } else {
        const updated = await tripApi.updateNote(tripId, editingId, form);
        setNotes(prev => prev.map(n => n.tripNoteId === editingId ? updated : n));
      }
      closeForm();
    } catch {
      alert('Не удалось сохранить заметку');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (noteId) => {
    if (!confirm('Удалить заметку?')) return;
    try {
      await tripApi.deleteNote(tripId, noteId);
      setNotes(prev => prev.filter(n => n.tripNoteId !== noteId));
    } catch {
      alert('Не удалось удалить заметку');
    }
  };

  if (loading) return (
    <div className={styles.skeletons}>
      {[1, 2].map(i => <div key={i} className={styles.skeleton} />)}
    </div>
  );

  return (
    <div className={styles.wrapper}>
      {/* Header */}
      <div className={styles.topRow}>
        <h3 className={styles.sectionTitle}>Заметки о поездке</h3>
        {!isCreating && !editingId && (
          <button className={styles.newBtn} onClick={openCreate}>
            <PlusIcon /> Новая заметка
          </button>
        )}
      </div>

      {/* Form */}
      {(isCreating || editingId) && (
        <div className={styles.form}>
          <input
            className={styles.formInput}
            placeholder="Заголовок"
            value={form.title}
            onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
          />
          <textarea
            className={styles.formTextarea}
            placeholder="Текст заметки..."
            value={form.content}
            rows={4}
            onChange={e => setForm(p => ({ ...p, content: e.target.value }))}
          />
          <div className={styles.formActions}>
            <button className={styles.cancelBtn} onClick={closeForm}>Отмена</button>
            <button className={styles.saveBtn} onClick={handleSave} disabled={saving}>
              {saving ? 'Сохранение...' : isCreating ? 'Создать' : 'Сохранить'}
            </button>
          </div>
        </div>
      )}

      {/* Notes list */}
      {notes.length === 0 && !isCreating ? (
        <div className={styles.empty}>
          <span>📝</span>
          <p>Заметок пока нет</p>
          <button className={styles.newBtn} onClick={openCreate}>
            <PlusIcon /> Создать заметку
          </button>
        </div>
      ) : (
        <div className={styles.list}>
          {notes.map(note => (
            <div key={note.tripNoteId} className={styles.noteCard}>
              <div className={styles.noteHeader}>
                <h4 className={styles.noteTitle}>{note.title}</h4>
                <div className={styles.noteActions}>
                  <button className={styles.editBtn} onClick={() => openEdit(note)}>
                    <EditIcon />
                  </button>
                  <button className={styles.deleteBtn} onClick={() => handleDelete(note.tripNoteId)}>
                    <TrashIcon />
                  </button>
                </div>
              </div>
              <p className={styles.noteContent}>{note.content}</p>
              <p className={styles.noteDate}>
                Обновлено: {new Date(note.updatedAt).toLocaleString('ru-RU')}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function PlusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}
function EditIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}
function TrashIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4h6v2" />
    </svg>
  );
}