import { useState } from 'react';

export default function PostItem({ post, user, onDelete }) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const name = user?.name || `Пользователь ${post.userId}`;
  const initials = name.split(' ').slice(0, 2).map(part => part[0]).join('');

  async function handleDelete() {
    if (deleting) return;
    setDeleting(true);
    setError('');
    try {
      await onDelete(post);
    } catch (cause) {
      setError(cause.message);
      setDeleting(false);
    }
  }

  return (
    <li>
      <article className="post" aria-labelledby={`title-${post.key}`} aria-busy={deleting}>
        <header className="post-header">
          <span className={`avatar tone-${post.userId % 4}`} aria-hidden="true">{initials}</span>
          <div className="author">
            <span className="author-name">{name}</span>
            <span className="author-handle">{user ? `@${user.username}` : `Автор №${post.userId}`}</span>
          </div>
          {post.isLocal && <span className="new-badge">Ваш пост</span>}
          <span className="post-number">#{String(post.id).padStart(3, '0')}</span>
        </header>
        <h3 id={`title-${post.key}`}>{post.title}</h3>
        <p className="post-body">{post.body}</p>
        <footer className="post-footer">
          <span className="post-source">{post.isLocal ? 'Добавлено вами' : 'Из JSONPlaceholder'}</span>
          <button className="delete-button" type="button" onClick={handleDelete} disabled={deleting}
            aria-label={`Удалить пост «${post.title}»`}>
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v5m4-5v5" /></svg>
            {deleting ? 'Удаление…' : 'Удалить'}
          </button>
        </footer>
        {error && <p className="form-error" role="alert">{error}</p>}
      </article>
    </li>
  );
}
