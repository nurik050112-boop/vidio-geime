import { LoginForm } from '../components/LoginForm';

export function HomePage() {
  return (
    <main className="landing-page">
      <header className="landing-header"><span className="brand-mark" aria-hidden="true">♜</span> Пылающий мир <span>3D RPG</span></header>
      <section className="landing-hero" aria-label="Начало приключения">
        <div className="landing-copy">
          <p className="landing-kicker">Твоя история начинается здесь</p>
          <h1>Один герой.<br />Целый мир<br /><em>приключений.</em></h1>
          <p>Подними меч против сыновей дракона. Освобождай города, находи редкое оружие и открывай тайны пылающего мира.</p>
          <div className="landing-features">
            <span><b>01</b> Исследуй мир</span><span><b>02</b> Побеждай боссов</span><span><b>03</b> Собирай легенды</span>
          </div>
          <p className="landing-device-note">На компьютере и телефоне · прямо в браузере</p>
        </div>
        <LoginForm />
      </section>
      <footer className="landing-footer">Меч против сыновей дракона <span>Создано в nFactorial Teens</span></footer>
    </main>
  );
}
