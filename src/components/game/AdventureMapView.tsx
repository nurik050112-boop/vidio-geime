import { useGameModel } from '../../game/GameContext';

import { type CSSProperties } from 'react';
import { dragonSons } from '../../game/data/arcaneSpells';



export function AdventureMapView() {
  const {
    savedCities, enemy, chapter
  } = useGameModel();
  return (<div className="adventure-map">
          <div className="map-header">
            <div>
              <p className="label">Карта похода</p>
              <strong>{savedCities.length} / {dragonSons.length} мест пройдено</strong>
            </div>
            <span>{enemy.city}</span>
          </div>
          <div className="map-art" aria-label="Карта пройденных мест">
            <span className="map-sea" />
            <span className="map-river" />
            <span className="map-lake" />
            <span className="map-road main" />
            <span className="map-road branch-one" />
            <span className="map-road branch-two" />
            <span className="map-road branch-three" />
            <span className="map-mountains" />
            <span className="map-hills" />
            <span className="map-forest left" />
            <span className="map-forest middle" />
            <span className="map-forest right" />
            <span className="map-castle" />
            <span className="map-compass">N</span>
            {Array.from({ length: 18 }).map((_, index) => (
              <span className={`map-trail-dot dot-${index}`} key={`trail-${index}`} />
            ))}
            {dragonSons.map((son, index) => {
              const mapPoints = [
                { x: 14, y: 69 },
                { x: 24, y: 45 },
                { x: 40, y: 63 },
                { x: 48, y: 33 },
                { x: 61, y: 73 },
                { x: 70, y: 45 },
                { x: 84, y: 59 },
                { x: 33, y: 82 },
                { x: 57, y: 51 },
                { x: 76, y: 23 },
              ];
              const point = mapPoints[index % mapPoints.length];
              const status = index < savedCities.length ? 'saved' : index === chapter ? 'active' : 'locked';
              return (
                <div
                  className={`map-place ${status}`}
                  key={son.name}
                  style={{ '--x': `${point.x}%`, '--y': `${point.y}%` } as CSSProperties}
                >
                  <span>{index + 1}</span>
                  <strong>{son.city}</strong>
                  <small>{status === 'saved' ? 'Пройдено' : status === 'active' ? 'Сейчас тут' : son.monsterName}</small>
                </div>
              );
            })}
          </div>
        </div>);
}
