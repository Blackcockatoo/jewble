import { useEffect, useMemo } from 'react';
import { useStore } from './store';
import { getVitalsAverage, getVitalsStatus, type Vitals } from '@metapet/core/vitals';

const vitalDescriptors: Array<{
  key: keyof Vitals;
  label: string;
  colors: [string, string];
}> = [
  { key: 'hunger', label: 'Hunger', colors: ['#facc15', '#f97316'] },
  { key: 'hygiene', label: 'Hygiene', colors: ['#38bdf8', '#22d3ee'] },
  { key: 'mood', label: 'Mood', colors: ['#a855f7', '#ec4899'] },
  { key: 'energy', label: 'Energy', colors: ['#34d399', '#22c55e'] },
];

export default function App() {
  const vitals = useStore(state => state.vitals);
  const evolution = useStore(state => state.evolution);
  const achievements = useStore(state => state.achievements);

  const feed = useStore(state => state.feed);
  const clean = useStore(state => state.clean);
  const play = useStore(state => state.play);
  const sleep = useStore(state => state.sleep);

  const startTick = useStore(state => state.startTick);
  const stopTick = useStore(state => state.stopTick);

  useEffect(() => {
    startTick();
    return () => {
      stopTick();
    };
  }, [startTick, stopTick]);

  const vitalsStatus = useMemo(() => getVitalsStatus(vitals), [vitals]);
  const vitalsAverage = useMemo(() => Math.round(getVitalsAverage(vitals)), [vitals]);

  return (
    <div className="app-shell">
      <header>
        <p>Meta-Pet Control Deck</p>
        <h1>Your Companion&apos;s Status</h1>
        <div className="status-strip">
          <span className="status-chip">Evolution: <strong>{evolution.state}</strong></span>
          <span className="status-chip">Vitals: <strong>{vitalsStatus}</strong></span>
          <span className="status-chip">Avg Vital Score: <strong>{vitalsAverage}%</strong></span>
          <span className="status-chip">Achievements: <strong>{achievements.length}</strong></span>
          {evolution.canEvolve && (
            <span className="status-chip" style={{ borderColor: 'rgba(250, 204, 21, 0.6)' }}>
              Ready to evolve
            </span>
          )}
        </div>
      </header>

      <section className="vitals-grid">
        {vitalDescriptors.map(vital => (
          <article className="vital-card" key={vital.key}>
            <h3>{vital.label}</h3>
            <div className="progress-track">
              <div
                className="progress-fill"
                style={{
                  width: `${Math.round(vitals[vital.key])}%`,
                  background: `linear-gradient(90deg, ${vital.colors[0]}, ${vital.colors[1]})`,
                }}
              />
            </div>
          </article>
        ))}
      </section>

      <section className="actions">
        <button className="action" onClick={feed}>Feed</button>
        <button className="action" onClick={clean}>Clean</button>
        <button className="action" onClick={play}>Play</button>
        <button className="action" onClick={sleep}>Sleep</button>
      </section>

      <footer>
        <span>
          Meta-Pet Web Shell powered by <strong>@metapet/core</strong>
        </span>
        <span>{new Date().toLocaleDateString()}</span>
      </footer>
    </div>
  );
}
