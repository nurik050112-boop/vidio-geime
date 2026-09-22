import { Component, type ReactNode } from 'react';
import { Link } from 'wouter';

export class GameErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() {
    if (this.state.failed) return (
      <main className="container"><section>
        <h1>Не удалось открыть игру</h1>
        <p>Попробуй ещё раз. Последнее сохранение останется в браузере.</p>
        <button onClick={() => this.setState({ failed: false })} type="button">Попробовать снова</button>
        <p><Link href="/">На главную</Link></p>
      </section></main>
    );
    return this.props.children;
  }
}
