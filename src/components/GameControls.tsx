type Props = { disabled: boolean; onAttack: () => void; onJump: () => void; onPause: () => void };

export function GameControls({ disabled, onAttack, onJump, onPause }: Props) {
  return (
    <div className="battle-controls" aria-label="Управление героем" onClick={event => event.stopPropagation()}>
      <button className="pause-control" onClick={onPause} type="button" aria-label="Пауза">Ⅱ</button>
      <button className="jump-control" disabled={disabled} onClick={onJump} type="button">Прыжок <kbd>Space</kbd></button>
      <button className="attack-control" disabled={disabled} onClick={onAttack} type="button">Удар <kbd>F</kbd></button>
    </div>
  );
}
