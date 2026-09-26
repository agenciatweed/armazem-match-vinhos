import { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import { CONFIG } from '../data/config.js';
import { PROFILES } from '../data/profiles.js';
import type { ProfileId } from '../data/questions.js';
import { formatDateTime, leadsToCsv } from '../lib/csv.js';
import { formatBRL, TYPE_LABEL } from '../lib/format.js';
import type { Channel, Lead, TrioItem, TrioShown } from '../lib/leadTypes.js';
import { PROFILE_IDS } from '../lib/scoring.js';
import './admin.css';

type Status = 'loading' | 'ready' | 'error' | 'unconfigured';

function WineCell({ item }: { item: TrioItem | undefined }) {
  if (!item) return <span className="muted">Sem registro</span>;
  return (
    <span className="winecell">
      <span className="winecell__name">{item.nome}</span>
      <span className="winecell__meta">
        {TYPE_LABEL[item.tipo]}
        {item.precoReferencia !== null && ` · ${formatBRL(item.precoReferencia)}`}
      </span>
    </span>
  );
}

const byTier = (t: TrioShown | undefined, tier: string) => t?.items.find((i) => i.tier === tier);

function OtherTrios({ trios }: { trios: TrioShown[] }) {
  const [open, setOpen] = useState(false);
  if (trios.length === 0) return null;
  const label = trios.length === 1 ? '+ 1 outro trio visto' : `+ ${trios.length} outros trios vistos`;
  return (
    <div className="others">
      <button type="button" className="others__toggle" aria-expanded={open} onClick={() => setOpen(!open)}>
        {open ? 'Esconder outros trios' : label}
      </button>
      {open && (
        <ol className="others__list">
          {trios.map((t) => (
            <li key={t.rotation}>
              {['seguro', 'descoberta', 'surpresa'].map((tier) => byTier(t, tier)?.nome ?? '').join(' · ')}
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

export default function AdminPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [status, setStatus] = useState<Status>('loading');
  const [query, setQuery] = useState('');
  const [profile, setProfile] = useState<ProfileId | ''>('');
  const [channel, setChannel] = useState<Channel | ''>('');
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);

  const load = useCallback(async () => {
    setStatus('loading');
    try {
      const res = await fetch('/api/leads', { cache: 'no-store' });
      if (res.status === 503) return setStatus('unconfigured');
      if (!res.ok) throw new Error(String(res.status));
      const data = (await res.json()) as { leads: Lead[] };
      setLeads(data.leads);
      setUpdatedAt(new Date());
      setStatus('ready');
    } catch {
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return leads.filter(
      (l) => (!q || l.email.includes(q)) && (!profile || l.profileId === profile) && (!channel || l.channel === channel),
    );
  }, [leads, query, profile, channel]);

  const people = useMemo(() => new Set(leads.map((l) => l.email)).size, [leads]);
  const perProfile = useMemo(() => {
    const c = Object.fromEntries(PROFILE_IDS.map((p) => [p, 0])) as Record<ProfileId, number>;
    leads.forEach((l) => c[l.profileId]++);
    return c;
  }, [leads]);

  function downloadCsv() {
    const blob = new Blob([leadsToCsv(filtered, location.origin)], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `matches-armazem-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }

  return (
    <div className="admin">
      <header className="admin__band">
        <img src="/logo.svg" alt="Armazém dos Importados" width="96" height="57" />
        <div className="admin__band-text">
          <h1>Matches registrados</h1>
          {status === 'ready' && (
            <p>
              {people} {people === 1 ? 'pessoa' : 'pessoas'}, {leads.length} {leads.length === 1 ? 'match' : 'matches'}
            </p>
          )}
        </div>
      </header>

      {CONFIG.isDemo && (
        <p className="admin__demo">Painel de demonstração, sem senha. Não compartilhe este endereço fora da equipe.</p>
      )}

      <main className="admin__main">
        {status === 'ready' && leads.length > 0 && (
          <ul className="tally" aria-label="Matches por perfil">
            {PROFILE_IDS.map((p) => (
              <li key={p} style={{ ['--accent' as string]: PROFILES[p].accent }}>
                <span className="tally__name">{PROFILES[p].name}</span>
                <span className="tally__n">{perProfile[p]}</span>
              </li>
            ))}
          </ul>
        )}

        <div className="controls" role="search">
          <label className="control control--grow">
            <span>Buscar por e-mail</span>
            <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="nome@email.com" />
          </label>
          <label className="control">
            <span>Perfil</span>
            <select value={profile} onChange={(e) => setProfile(e.target.value as ProfileId | '')}>
              <option value="">Todos</option>
              {PROFILE_IDS.map((p) => (
                <option key={p} value={p}>
                  {PROFILES[p].name}
                </option>
              ))}
            </select>
          </label>
          <label className="control">
            <span>Canal</span>
            <select value={channel} onChange={(e) => setChannel(e.target.value as Channel | '')}>
              <option value="">Todos</option>
              <option value="online">Online</option>
              <option value="loja">Loja</option>
            </select>
          </label>
          <div className="controls__buttons">
            <button type="button" className="abtn" onClick={() => void load()} disabled={status === 'loading'}>
              Atualizar
            </button>
            <button type="button" className="abtn abtn--ink" onClick={downloadCsv} disabled={filtered.length === 0}>
              Baixar CSV
            </button>
          </div>
        </div>
        {updatedAt && status === 'ready' && (
          <p className="admin__stamp">Atualizado às {updatedAt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
        )}

        {status === 'loading' && <p className="state">Carregando matches...</p>}
        {status === 'error' && (
          <div className="state">
            <p>Não foi possível carregar os matches. Tente atualizar.</p>
            <button type="button" className="abtn" onClick={() => void load()}>
              Tentar de novo
            </button>
          </div>
        )}
        {status === 'unconfigured' && <p className="state">Banco de dados não configurado.</p>}
        {status === 'ready' && leads.length === 0 && (
          <p className="state">Nenhum match registrado ainda. Assim que alguém concluir o quiz, ele aparece aqui.</p>
        )}
        {status === 'ready' && leads.length > 0 && filtered.length === 0 && (
          <p className="state">Nenhum match com esses filtros.</p>
        )}

        {status === 'ready' && filtered.length > 0 && (
          <table className="ledger">
            <thead>
              <tr>
                <th scope="col">Data e hora</th>
                <th scope="col">E-mail</th>
                <th scope="col">Perfil</th>
                <th scope="col">O Seguro</th>
                <th scope="col">A Descoberta</th>
                <th scope="col">A Surpresa</th>
                <th scope="col">Canal</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((l) => (
                <Fragment key={l.id}>
                  <tr>
                    <td data-label="Data e hora" className="ledger__date">
                      {formatDateTime(l.createdAt)}
                    </td>
                    <td data-label="E-mail" className="ledger__email">
                      <div>
                        {l.email}
                        <a className="ledger__link" href={`/?m=${l.shareCode}`} target="_blank" rel="noopener noreferrer">
                          Ver resultado
                        </a>
                      </div>
                    </td>
                    <td data-label="Perfil">
                      <span className="pill" style={{ ['--accent' as string]: PROFILES[l.profileId]?.accent }}>
                        {l.profileName}
                      </span>
                    </td>
                    <td data-label="O Seguro">
                      <WineCell item={byTier(l.trios[0], 'seguro')} />
                    </td>
                    <td data-label="A Descoberta">
                      <WineCell item={byTier(l.trios[0], 'descoberta')} />
                    </td>
                    <td data-label="A Surpresa">
                      <div>
                        <WineCell item={byTier(l.trios[0], 'surpresa')} />
                        <OtherTrios trios={l.trios.slice(1)} />
                      </div>
                    </td>
                    <td data-label="Canal">{l.channel === 'loja' ? 'Loja' : 'Online'}</td>
                  </tr>
                </Fragment>
              ))}
            </tbody>
          </table>
        )}
      </main>
    </div>
  );
}
