import { Redirect } from 'wouter';
import { useSession } from '../components/SessionProvider';
import { GameRuntime } from '../game/GameRuntime';
import { GameErrorBoundary } from '../components/GameErrorBoundary';

export default function GamePage() {
  const { user, guest, ready } = useSession();
  if (!ready) return <main className="route-loading" role="status">Загружаем приключение…</main>;
  if (!user && !guest) return <Redirect to="/" />;
  return <GameErrorBoundary><GameRuntime key={guest ? 'guest' : user?.id} authUser={guest ? null : user} guestMode={guest} /></GameErrorBoundary>;
}
