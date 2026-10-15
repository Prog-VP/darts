import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const CONTACT_EMAIL = "contact@lausanne-darts.ch";
const FROM = `Lausanne Darts <${CONTACT_EMAIL}>`;

export async function POST(request: NextRequest) {
  try {
    const { prenom, nom, email } = await request.json();

    if (!prenom || !nom || !email) {
      return NextResponse.json({ error: "Champs manquants" }, { status: 400 });
    }

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error("RESEND_API_KEY manquante");
      return NextResponse.json(
        { error: "Configuration serveur incomplète" },
        { status: 500 }
      );
    }

    const resend = new Resend(apiKey);

    await resend.emails.send({
      from: FROM,
      to: CONTACT_EMAIL,
      replyTo: email,
      subject: `Nouvelle demande de contact — ${prenom} ${nom}`,
      html: `
        <div style="font-family: sans-serif; color: #222;">
          <h2 style="margin:0 0 12px">Nouvelle demande de contact</h2>
          <p><strong>Prénom :</strong> ${escapeHtml(prenom)}</p>
          <p><strong>Nom :</strong> ${escapeHtml(nom)}</p>
          <p><strong>Email :</strong> <a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></p>
        </div>
      `,
    });

    await resend.emails.send({
      from: FROM,
      to: email,
      subject: "Merci pour ton message — Lausanne Darts 🎯",
      text: `Hello ${prenom},\n\nMerci pour ton message, on revient vers toi rapidement.\n\nPoint d'étape : on n'a malheureusement pas trouvé de local qui permette de rester à un prix raisonnable, avec un statut d'établissement commercial pour vendre de l'alcool, sans racheter un fonds de commerce. Le lieu n'ouvrira donc pas pour l'instant.\n\nOn reste disponibles pour la location de matériel et l'organisation de tournois.\n\nÀ très vite,\nL'équipe Lausanne Darts`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #1a1a1a; max-width: 560px; margin: 0 auto; padding: 32px 28px; background: #0a0a0a; color: #F0E6D2; border-radius: 12px;">
          <div style="text-align: center; margin-bottom: 24px;">
            <div style="font-family: 'Bebas Neue', sans-serif; font-size: 38px; letter-spacing: 0.02em; line-height: 1;">
              <div>LAUSANNE</div>
              <div style="letter-spacing: 0.38em; margin-left: 0.38em;">DARTS</div>
              <div style="height: 2px; background: #E63946; margin: 8px auto 2px; max-width: 220px; border-radius: 2px;"></div>
              <div style="height: 2px; background: #2D8B46; margin: 0 auto; max-width: 220px; border-radius: 2px;"></div>
            </div>
          </div>

          <h1 style="font-family: 'Bebas Neue', sans-serif; font-size: 28px; letter-spacing: 0.04em; margin: 24px 0 12px; color: #F0E6D2;">
            Merci pour ton message, ${escapeHtml(prenom)} 🎯
          </h1>

          <p style="font-size: 15px; line-height: 1.6; color: #cfcfc5;">
            On a bien reçu ta demande, l'équipe <strong style="color: #F0E6D2;">Lausanne Darts</strong> revient vers toi rapidement.
          </p>

          <p style="font-size: 15px; line-height: 1.6; color: #cfcfc5;">
            Point d'étape : on n'a malheureusement pas trouvé de local qui permette de rester à un prix raisonnable, avec un statut d'établissement commercial pour vendre de l'alcool, sans racheter un fonds de commerce. Le lieu n'ouvrira donc pas pour l'instant.
          </p>

          <div style="margin: 20px 0; padding: 16px 20px; border: 1px solid rgba(255,255,255,0.12); border-radius: 10px; background: #141414; text-align: center;">
            <div style="font-size: 11px; letter-spacing: 0.2em; color: #9a9a9a; text-transform: uppercase;">On reste disponibles</div>
            <div style="font-family: 'Bebas Neue', sans-serif; font-size: 24px; margin-top: 4px;">Location de matériel · Tournois</div>
            <div style="font-size: 13px; color: #9a9a9a; margin-top: 6px;">Lausanne et région</div>
          </div>

          <p style="font-size: 13px; color: #9a9a9a; margin-top: 28px; text-align: center;">
            À très vite,<br />
            <strong style="color: #F0E6D2;">L'équipe Lausanne Darts</strong>
          </p>
        </div>
      `,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
