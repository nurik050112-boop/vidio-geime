import { isSupabaseConfigured, supabase } from './supabase';

export async function authenticate(email: string, password: string, signup: boolean) {
  if (!isSupabaseConfigured) throw new Error('Вход в аккаунт пока недоступен. Можно играть как гость.');
  const credentials = { email: email.trim(), password };
  const result = signup
    ? await supabase.auth.signUp({ ...credentials, options: { emailRedirectTo: `${window.location.origin}/game` } })
    : await supabase.auth.signInWithPassword(credentials);
  if (result.error) {
    const messages: Record<string, string> = {
      invalid_credentials: 'Неверная почта или пароль.',
      email_not_confirmed: 'Подтверди почту по ссылке из письма и попробуй ещё раз.',
      user_already_exists: 'Аккаунт уже существует. Попробуй войти.',
      over_email_send_rate_limit: 'Слишком много запросов. Подожди немного и повтори.',
    };
    throw new Error(messages[result.error.code ?? ''] ?? 'Не удалось войти. Проверь интернет и повтори попытку.');
  }
  return Boolean(result.data.session);
}

export async function authenticateWithGoogle() {
  if (!isSupabaseConfigured) throw new Error('Вход в аккаунт пока недоступен. Можно играть как гость.');
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google', options: { redirectTo: `${window.location.origin}/game` },
  });
  if (error) throw new Error('Не удалось открыть вход Google. Попробуй войти по почте.');
}
