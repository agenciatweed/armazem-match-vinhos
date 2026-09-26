import { useId, useRef, useState, type FormEvent } from 'react';
import { isValidEmail, normalizeEmail } from '../lib/email.js';

interface Props {
  shared: boolean;
  storeMode: boolean;
  savedEmail: string | null;
  onConfirm: (email: string | null) => void;
  onChangeEmail: () => void;
}

export function Intro({ shared, storeMode, savedEmail, onConfirm, onChangeEmail }: Props) {
  const [email, setEmail] = useState(savedEmail ?? '');
  const [error, setError] = useState(false);
  const [minor, setMinor] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const ids = { email: useId(), note: useId(), err: useId() };

  if (minor) {
    return (
      <section className="sheet sheet--main sheet--intro" aria-labelledby="minor-title">
        <div className="sheet__rule" aria-hidden="true" />
        <h1 id="minor-title" className="display display--m" tabIndex={-1}>
          Volte quando fizer 18. A gente guarda uma taça para você.
        </h1>
      </section>
    );
  }

  const submit = (e?: FormEvent) => {
    e?.preventDefault();
    if (shared) return onConfirm(null);
    if (!isValidEmail(email)) {
      setError(true);
      inputRef.current?.focus();
      return;
    }
    onConfirm(normalizeEmail(email));
  };

  return (
    <section className="sheet sheet--main sheet--intro" aria-labelledby="intro-title">
      <div className="sheet__rule" aria-hidden="true" />
      <h1 id="intro-title" className="display display--xl" tabIndex={-1}>
        Descubra seu match em 60&nbsp;segundos
      </h1>
      <p className="lede">
        Cinco perguntas sobre você. Nenhuma sobre vinho. No final, três garrafas escolhidas para o seu paladar.
      </p>

      <form className="intro__form" onSubmit={submit} noValidate>
        {!shared && (
          <div className="field">
            <label className="field__label" htmlFor={ids.email}>
              Seu e-mail
            </label>
            <input
              ref={inputRef}
              id={ids.email}
              className="field__input"
              type="email"
              inputMode="email"
              autoComplete={storeMode ? 'off' : 'email'}
              placeholder="voce@email.com"
              required
              value={email}
              aria-invalid={error || undefined}
              aria-describedby={error ? `${ids.err} ${ids.note}` : ids.note}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error && isValidEmail(e.target.value)) setError(false);
              }}
              onBlur={() => setError(email.trim() !== '' && !isValidEmail(email))}
            />
            <p id={ids.err} className="field__error" aria-live="polite">
              {error ? 'Confere o e-mail? Parece que falta alguma coisa.' : ''}
            </p>
            <p id={ids.note} className="field__note">
              Usamos seu e-mail só para guardar seu match e falar com você sobre ele. Nada de spam.
            </p>
            {savedEmail && (
              <button
                type="button"
                className="link"
                onClick={() => {
                  setEmail('');
                  onChangeEmail();
                  inputRef.current?.focus();
                }}
              >
                Não é você? Trocar e-mail
              </button>
            )}
          </div>
        )}

        <button type="submit" className="btn btn--ink btn--block">
          Tenho 18 anos ou mais, vamos lá
        </button>
        <button type="button" className="link link--quiet" onClick={() => setMinor(true)}>
          Tenho menos de 18
        </button>
      </form>
      <p className="colophon">Ficha de paladar · Match do Vinho</p>
    </section>
  );
}
