import { CONFIG } from '../data/config.js';
import { TIER_COPY, type Tier } from '../data/profiles.js';
import type { Wine } from '../data/wines.js';
import { formatBRL, TYPE_LABEL } from '../lib/format.js';
import { Bottle } from './Bottle.js';

export function WineCard({ tier, wine, index }: { tier: Tier; wine: Wine; index: number }) {
  const copy = TIER_COPY[tier];
  return (
    <article className="wine" style={{ ['--i' as string]: index }}>
      <header className="wine__tier">
        <h3>{copy.label}</h3>
        <p>{copy.hint}</p>
      </header>
      <div className="wine__plate">
        <Bottle tipo={wine.tipo} />
      </div>
      <div className="wine__body">
        <p className="wine__type">{TYPE_LABEL[wine.tipo]}</p>
        <h4 className="wine__name">{wine.nome}</h4>
        <p className="wine__origin">
          {wine.pais} · {wine.uva}
        </p>
        <dl className="wine__fields">
          <div>
            <dt>Por que dá match</dt>
            <dd>{wine.porQueDaMatch}</dd>
          </div>
          <div>
            <dt>Sirva com</dt>
            <dd>{wine.sirvaCom}</dd>
          </div>
          <div className="wine__temp">
            <dt>Temperatura</dt>
            <dd>{wine.temperatura}</dd>
          </div>
        </dl>
      </div>
      {CONFIG.showPrices && wine.precoReferencia !== null && (
        <p className="wine__price">
          <span>Preço de referência</span>
          <strong>{formatBRL(wine.precoReferencia)}</strong>
        </p>
      )}
    </article>
  );
}
