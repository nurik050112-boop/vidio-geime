import { useGameModel } from '../../game/GameContext';




export function CreatorCreditsPageView() {
  const {
    setCreatorCreditsOpen, navigate
  } = useGameModel();
  return (<main className="creator-credits-page" aria-label="Создатель">
        <section className="creator-credits">
          <div className="creator-scroll">
            <p>Все концовки пройдены</p>
            <h1>Спасибо за игру</h1>
            <p>Помогавшие в разработке</p>
            <strong>Нурали</strong>
            <strong>Айсултан</strong>
            <strong>Мансур</strong>
            <strong>Арайлым</strong>
            <strong>Ануар</strong>
            <strong>Димаш</strong>
            <strong>Нурдаулет</strong>
            <p>Эти люди и мои учителя по поаити лагерю помогали, вдохновляли и были рядом.</p>
            <p>Примечание: создатель создал игру за 4 дня.</p>
            <h2>Нурдаулет</h2>
            <h3>создатель</h3>
          </div>
          <button onClick={() => {
            setCreatorCreditsOpen(false);
            navigate('/achievements');
          }} type="button">
            Выйти
          </button>
        </section>
      </main>);
}
