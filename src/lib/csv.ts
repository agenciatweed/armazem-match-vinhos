import type { Lead, TrioShown } from './leadTypes.js';

const TZ = 'America/Sao_Paulo';

export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  const date = d.toLocaleDateString('pt-BR', { timeZone: TZ, day: '2-digit', month: '2-digit', year: 'numeric' });
  const time = d.toLocaleTimeString('pt-BR', { timeZone: TZ, hour: '2-digit', minute: '2-digit' });
  return `${date} ${time}`;
}

function cell(v: string | number): string {
  const s = String(v);
  return /[;"\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function trioNames(t: TrioShown | undefined) {
  const find = (tier: string) => t?.items.find((i) => i.tier === tier)?.nome ?? '';
  return [find('seguro'), find('descoberta'), find('surpresa')];
}

/** CSV com BOM e separador ";" para abrir direto no Excel em pt-BR. */
export function leadsToCsv(leads: Lead[], origin: string): string {
  const header = ['data', 'email', 'perfil', 'seguro', 'descoberta', 'surpresa', 'canal', 'outros_trios', 'link_resultado'];
  const rows = leads.map((l) => {
    const others = l.trios
      .slice(1)
      .map((t) => trioNames(t).join(' + '))
      .join(' / ');
    return [
      formatDateTime(l.createdAt),
      l.email,
      l.profileName,
      ...trioNames(l.trios[0]),
      l.channel,
      others,
      `${origin}/?m=${l.shareCode}`,
    ]
      .map(cell)
      .join(';');
  });
  return '﻿' + [header.join(';'), ...rows].join('\r\n') + '\r\n';
}
