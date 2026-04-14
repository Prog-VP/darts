"use client";

import { ChangeEvent, FormEvent, useEffect, useState } from "react";

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

const FORM_FIELDS: Array<{
  id: keyof InviteFormData;
  label: string;
  autoComplete: string;
  placeholder: string;
  type?: "email" | "text";
}> = [
  {
    id: "prenom",
    label: "Prénom",
    autoComplete: "given-name",
    placeholder: "Ton prénom",
  },
  {
    id: "nom",
    label: "Nom",
    autoComplete: "family-name",
    placeholder: "Ton nom",
  },
  {
    id: "email",
    label: "Email",
    autoComplete: "email",
    placeholder: "ton@email.ch",
    type: "email",
  },
];

export default function InviteForm() {
  const [formData, setFormData] = useState<InviteFormData>(INITIAL_FORM);
  const [submittedFirstName, setSubmittedFirstName] = useState<string | null>(
    null
  );

  useEffect(() => {
    if (!submittedFirstName) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setSubmittedFirstName(null);
    }, 4200);

    return () => window.clearTimeout(timeoutId);
  }, [submittedFirstName]);

  const handleChange =
    (field: keyof InviteFormData) => (event: ChangeEvent<HTMLInputElement>) => {
      setFormData((current) => ({ ...current, [field]: event.target.value }));
    };

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedFirstName = formData.prenom.trim();

    setSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        throw new Error("Envoi échoué");
      }

      setSubmittedFirstName(trimmedFirstName || "toi");
      setFormData(INITIAL_FORM);
    } catch (err) {
      setErrorMessage("Oups, une erreur est survenue. Réessaie dans un instant.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="invite" aria-labelledby="invite-title">
      <div className="invite-header">
        <h2 id="invite-title">Ton e-mail</h2>
      </div>

      <form className="invite-form" onSubmit={handleSubmit}>
        <div className="invite-grid">
          {FORM_FIELDS.map((field) => (
            <div
              key={field.id}
              className={`field-group ${
                field.id === "email" ? "field-group-wide" : ""
              }`}
            >
              <label htmlFor={field.id}>{field.label}</label>
              <input
                id={field.id}
                name={field.id}
                type={field.type ?? "text"}
                autoComplete={field.autoComplete}
                placeholder={field.placeholder}
                inputMode={field.id === "email" ? "email" : "text"}
                required
                value={formData[field.id]}
                onChange={handleChange(field.id)}
              />
            </div>
          ))}
        </div>

        <p className="form-note">
          Un mail au lancement. Pas de spam.
        </p>

        <button type="submit" disabled={submitting}>
          {submitting ? "Envoi…" : "S’inscrire"}
        </button>

        {errorMessage && (
          <p className="form-error" role="alert">{errorMessage}</p>
        )}
      </form>

      {submittedFirstName ? (
        <div className="form-success-toast" role="status" aria-live="polite">
          <p className="form-success">
            {"Merci "}
            {submittedFirstName}
            {", c’est noté."}
          </p>
        </div>
      ) : null}
    </div>
  );
}
