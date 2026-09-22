import { GameDialog } from './GameDialog';

export function GameGuide({ onClose }: { onClose: () => void }) {
  return (
    <GameDialog title="Как играть" onClose={onClose} className="guide-dialog">
      <div className="game-modal-head"><div><p className="eyebrow">Первое приключение</p><h2>Как играть</h2></div>
        <button onClick={onClose} type="button" aria-label="Закрыть обучение">✕</button></div>
      <p>Освобождай города от монстров, собирай снаряжение и сразись с сыновьями дракона.</p>
      <div className="guide-steps">
        <section><h3>01 · Исследуй</h3><p><kbd>W A S D</kbd> или стрелки — движение. <kbd>Shift</kbd> — бег. <kbd>Space</kbd> — прыжок.</p>
          <p>На телефоне двигай джойстик. Проведи по сцене, чтобы повернуть камеру.</p></section>
        <section><h3>02 · Сражайся</h3><p>Подойди к монстру и нажми «Удар», <kbd>F</kbd> или коснись сцены. Меч достаёт на 5 метров.</p>
          <p>Когда в городе не останется монстров, появится босс.</p></section>
        <section><h3>03 · Становись сильнее</h3><p>Открой «Сумку», чтобы надеть оружие и броню. В «Мире» есть магазин, карта и награды.</p>
          <p>Кнопка «Магия» выдаёт посохи. Заклинания расходуют ману и восстанавливаются за 3 секунды.</p></section>
        <section><h3>04 · Сделай перерыв</h3><p>В гайде, сумке и на карте бой приостанавливается. Кнопка Ⅱ ставит игру на паузу.</p>
          <p>Прогресс сохраняется автоматически. У гостя он остаётся в этом браузере.</p></section>
      </div>
      <p className="guide-secret">Секрет для внимательных: код <code>ibb</code> в магазине даёт огненный меч.</p>
      <button onClick={onClose} type="button">Понял, играть</button>
    </GameDialog>
  );
}
