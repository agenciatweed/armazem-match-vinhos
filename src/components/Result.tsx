import { useEffect, useRef, useState } from 'react';
import { CONFIG } from '../data/config.js';
import { PROFILES } from '../data/profiles.js';
import { discounted, formatBRL } from '../lib/format.js';
import type { ProfileResult } from '../lib/scoring.js';
import type { TrioEntry } from '../lib/selection.js';
import { Stamp } from './Stamp.js';
import { WineCard } from './WineCard.js';

interface Props {
  result: ProfileResult;
  trio: TrioEntry[];
  shared: boolean;
  storeMode: boolean;
  swapping: boolean;
  arrived: boolean;
  onNextTrio: () => void;
  onRestart: () => void;
  onDiscoverOwn: () => void;
  onInteract: () => void;
}

export function Result({ result, trio, shared, storeMode, swapping, arrived, onNextTrio, onRestart, onDiscoverOwn, onInteract }: Props) {
  const profile = PROFILES[result.profileId];
  const titleRef = useRef<HTMLHeadingElement>(null);
  const [shareMsg, setShareMsg] = useState('');

  useEffect(() => titleRef.current?.focus({ preventScroll: true }), []);

  const prices = trio.map((t) => t.wine.precoReferencia);
  const allPriced = prices.every((p): p is number => p !== null);
  const total = allPriced ? prices.reduce((a, b) => a + b, 0) : 0;
  const pct = CONFIG.trioDiscountPercent;
  const [seguro, descoberta, surpresa] = trio.map((t) => t.wine.nome);

  const whatsappText =
    `Oi! Fiz o Match do Vinho e meu perfil é ${profile.name}. Meu trio: ${seguro}, ${descoberta} e ${surpresa}. ` +
    (pct !== null ? `Quero reservar meu trio com os ${pct}% de desconto.` : 'Quero reservar meu trio.');

  async function share() {
    onInteract();
    const url = window.location.href;
    const text = `Meu match no Armazém dos Importados é ${profile.name}. Descubra o seu:`;
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Match do Vinho', text, url });
        return;
      }
      await navigator.clipboard.writeText(`${text} ${url}`);
      setShareMsg('Link copiado. É só colar onde quiser.');
    } catch (err) {
      if ((err as Error)?.name === 'AbortError') return;
      setShareMsg('Não deu para copiar. O link é o endereço desta página.');
    }
  }

  return (
    <div className={arrived ? 'result result--arrived' : 'result'}>
      <section className="sheet sheet--main sheet--profile" aria-labelledby="profile-title" style={{ ['--accent' as string]: profile.accent }}>
        <div className="sheet__rule" aria-hidden="true" />
        <Stamp color={profile.accent} />
        <h1 id="profile-title" ref={titleRef} tabIndex={-1} className="profile__title">
          <span className="profile__lead">Você é</span>
          <span className="display display--hero profile__name">{profile.name}</span>
        </h1>
        <p className="profile__tagline">{profile.tagline}</p>
        <p className="profile__desc">{profile.description}</p>
        <p className="colophon">Seu perfil · Ficha conferida pelo Armazém</p>
      </section>

      <section className="match" aria-labelledby="match-title">
        <header className="match__head">
          <h2 id="match-title" className="match__title">
            {CONFIG.campaignName}
          </h2>
          <p className="match__sub">{CONFIG.campaignSubtitle}</p>
          <p className="match__text">Montamos três vinhos que têm tudo para dar match com você.</p>
        </header>
        <div className={swapping ? 'trio is-swapping' : 'trio'} aria-live="polite">
          {trio.map((t, i) => (
            <WineCard key={`${t.tier}-${t.wine.id}`} tier={t.tier} wine={t.wine} index={i} />
          ))}
        </div>
      </section>

      <section className="deal" aria-label="Condição do trio">
        <p className="deal__line">
          {pct !== null ? `Na loja, o ${CONFIG.campaignName} sai com ${pct}% de desconto.` : `Na loja, o ${CONFIG.campaignName} tem condição especial.`}
        </p>
        {CONFIG.showPrices && allPriced && (
          <>
            <p className="deal__total">
              <span>Levando os três:</span> <strong>{formatBRL(pct !== null ? discounted(total, pct) : total)}</strong>
            </p>
            {pct !== null && (
              <p className="deal__full">
                Preço cheio {formatBRL(total)}, com {pct}% no trio.
              </p>
            )}
          </>
        )}
        <p className="deal__note">{CONFIG.priceNote}</p>
      </section>

      <section className="sheet sheet--store" aria-labelledby="store-title">
        <h2 id="store-title" className="display display--m">
          Quer descobrir se acertamos?
        </h2>
        {storeMode ? (
          <p className="store__text">
            <strong>Chame alguém da nossa equipe e leve seu trio hoje.</strong>
          </p>
        ) : (
          <p className="store__text">
            <strong>Prove seu match no Armazém.</strong> Mostre esta tela no balcão: a gente separa seu trio e te ajuda a escolher.
          </p>
        )}
        <address className="store__address">{CONFIG.storeAddress}</address>
        {!storeMode && (
          <div className="store__actions">
            <a className="btn btn--line" href={CONFIG.mapsUrl} target="_blank" rel="noopener noreferrer" onClick={onInteract}>
              Como chegar
            </a>
            {CONFIG.whatsappNumber && (
              <a
                className="btn btn--ink"
                href={`https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(whatsappText)}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={onInteract}
              >
                Reservar pelo WhatsApp
              </a>
            )}
          </div>
        )}
      </section>

      <nav className="actions" aria-label="Mais opções">
        {shared ? (
          <button type="button" className="btn btn--paper" onClick={onDiscoverOwn}>
            Descobrir o meu match
          </button>
        ) : (
          <>
            <button type="button" className="btn btn--paper" onClick={onNextTrio} disabled={swapping}>
              Ver outro trio
            </button>
            {!storeMode && (
              <button type="button" className="btn btn--ghost" onClick={share}>
                Compartilhar meu match
              </button>
            )}
            <button type="button" className="btn btn--ghost" onClick={onRestart}>
              Refazer o quiz
            </button>
          </>
        )}
        <p className="actions__msg" role="status">
          {shareMsg}
        </p>
      </nav>
    </div>
  );
}
