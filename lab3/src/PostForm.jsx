import { useState } from 'react';

export default function PostForm({ onAdd, disabled, currentUser }) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();
    if (saving || disabled) return;
    if (!title.trim() || !body.trim()) {
      setError('Заполните заголовок и текст: одних пробелов недостаточно.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await onAdd(title.trim(), body.trim());
      setTitle('');
      setBody('');
    } catch (cause) {
      setError(cause.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="composer" aria-labelledby="composer-title">
      <div className="section-eyebrow"><span aria-hidden="true">✎</span> ЕСТЬ ЧТО СКАЗАТЬ?</div>
      <h2 id="composer-title">Новый пост</h2>
      <p className="composer-intro">Поделитесь мыслью.<br /> </p>
      <form onSubmit={handleSubmit} aria-busy={saving}>
        <fieldset disabled={disabled || saving}>
          <label htmlFor="post-title">Заголовок</label>
          <input id="post-title" value={title} onChange={event => setTitle(event.target.value)}
            placeholder="О чём ваш пост?" maxLength={150} required />
          <div className="field-heading">
            <label htmlFor="post-body">Текст поста</label>
            <span id="body-counter">{body.length} / 2000</span>
          </div>
          <textarea id="post-body" value={body} onChange={event => setBody(event.target.value)}
            placeholder="Ваша история начинается здесь…" maxLength={2000} rows={6}
            aria-describedby="body-counter" required />
          <p className="posting-as">Автор: <strong>{currentUser?.name || 'пользователь №1'}</strong></p>
          <button className="button primary publish" type="submit">
            {saving ? 'Публикация…' : 'Опубликовать'} <span aria-hidden="true">↗</span>
          </button>
        </fieldset>
        {error && <p className="form-error" role="alert">{error}</p>}
      </form>
     
    </section>
  );
}
