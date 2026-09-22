import { Route, Switch } from 'wouter';
import { lazy, Suspense } from 'react';
import { HomePage } from './pages/HomePage';
import { NotFoundPage } from './pages/NotFoundPage';
import { SessionProvider } from './components/SessionProvider';

const GamePage = lazy(() => import('./pages/GamePage'));

// Здесь живут только маршруты. Сами экраны складывай в src/pages/.
export default function App() {
  return (
    <SessionProvider>
    <Suspense fallback={<main className="route-loading" role="status">Загружаем приключение…</main>}>
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/game" component={GamePage} />
      <Route path="/world" component={GamePage} />
      <Route path="/achievements" component={GamePage} />
      <Route component={NotFoundPage} />
    </Switch>
    </Suspense>
    </SessionProvider>
  );
}
