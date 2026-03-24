"use client";

import { FormEvent, useState } from "react";

type InviteFormData = {
  nom: string;
  prenom: string;
  email: string;
};

const INITIAL_FORM: InviteFormData = {
  nom: "",
  prenom: "",
  email: "",
};

export default function InviteForm() {
  const [formData, setFormData] = useState<InviteFormData>(INITIAL_FORM);
  const [submittedFirstName, setSubmittedFirstName] = useState<string | null>(null);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmittedFirstName(formData.prenom.trim());
    setFormData(INITIAL_FORM);

    window.setTimeout(() => {
      setSubmittedFirstName(null);
    }, 4200);
  };

  return (
    <section className="invite" aria-labelledby="invite-title">
      <h2 id="invite-title">Soyez invité à l&apos;ouverture</h2>
      <p>Laissez vos infos pour recevoir les prochaines annonces.</p>

      <form className="invite-form" onSubmit={handleSubmit}>
        <label htmlFor="nom">Nom</label>
        <input
          id="nom"
          name="nom"
          type="text"
          autoComplete="family-name"
          required
          value={formData.nom}
          onChange={(event) =>
            setFormData((current) => ({ ...current, nom: event.target.value }))
          }
        />

        <label htmlFor="prenom">Prénom</label>
        <input
          id="prenom"
          name="prenom"
          type="text"
          autoComplete="given-name"
          required
          value={formData.prenom}
          onChange={(event) =>
            setFormData((current) => ({ ...current, prenom: event.target.value }))
          }
        />

        <label htmlFor="email">Adresse mail</label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={formData.email}
          onChange={(event) =>
            setFormData((current) => ({ ...current, email: event.target.value }))
          }
        />

        <button type="submit">Enter</button>
      </form>

      {submittedFirstName ? (
        <div className="form-success-toast" role="status" aria-live="polite">
          <span className="spark spark-1" aria-hidden="true">
            ✨
          </span>
          <span className="spark spark-2" aria-hidden="true">
            ✦
          </span>
          <p className="form-success">
            Merci {submittedFirstName} ! On se réjouit de te donner plus
            d&apos;infos.
          </p>
        </div>
      ) : null}
    </section>
  );
}
