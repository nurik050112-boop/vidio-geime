import { useState, type FormEvent } from 'react';
import { useLocation } from 'wouter';
import { authenticate, authenticateWithGoogle } from '../lib/auth';
import { useSession } from './SessionProvider';

export function LoginForm() {
  const [, navigate] = useLocation();
  const { enterGuest, user, guest } = useSession();
  const [signup, setSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setMessage('');
    try {
      if (await authenticate(email, password, signup)) navigate('/game');
      else setMessage('Аккаунт создан. Подтверди почту по ссылке из письма, затем войди.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Проверь интернет и попробуй ещё раз.');
    } finally { setBusy(false); }
  }

  async function googleLogin() {
    if (busy) return;
    setBusy(true);
    setMessage('');
    try { await authenticateWithGoogle(); }
    catch (error) { setMessage(error instanceof Error ? error.message : 'Не удалось войти.'); }
    finally { setBusy(false); }
  }

  return (
    <section className="landing-auth" aria-labelledby="login-title">
      <p className="landing-kicker">Твоё приключение</p>
      <h2 id="login-title">{signup ? 'Создать аккаунт' : 'Войти в игру'}</h2>
      {(user || guest) && <button className="continue-button" type="button" onClick={() => navigate('/game')}>Продолжить игру →</button>}
      <button className="google-button" onClick={googleLogin} disabled={busy} type="button"><span>G</span> Войти через Google</button>
      <div className="auth-divider">или по почте</div>
      <form className="landing-form" onSubmit={submit} aria-busy={busy}>
        <label htmlFor="login-email">Почта</label>
        <input id="login-email" name="email" autoComplete="email" placeholder="you@example.com" type="email"
          value={email} onChange={event => setEmail(event.target.value)} required />
        <label htmlFor="login-password">Пароль</label>
        <input id="login-password" name="password" autoComplete={signup ? 'new-password' : 'current-password'}
          minLength={6} placeholder="Не менее 6 символов" type="password" value={password}
          onChange={event => setPassword(event.target.value)} required />
        <button type="submit" disabled={busy}>{busy ? 'Подождите…' : signup ? 'Создать аккаунт' : 'Войти'}</button>
        <button className="auth-mode-switch" type="button" disabled={busy} onClick={() => { setSignup(!signup); setMessage(''); }}>
          {signup ? 'Уже есть аккаунт? Войти' : 'Нет аккаунта? Зарегистрироваться'}
        </button>
      </form>
      {message && <p className="auth-message" role="status">{message}</p>}
      <div className="auth-divider">сразу к приключению</div>
      <button className="guest-button" type="button" disabled={busy} onClick={() => { enterGuest(); navigate('/game'); }}>
        <strong>Играть как гость →</strong><small>Без регистрации · прогресс на этом устройстве</small>
      </button>
    </section>
  );
}
