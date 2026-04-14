import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

const CONTACT_EMAIL = process.env.SMTP_USER ?? "contact@lausanne-darts.ch";

export async function POST(request: NextRequest) {
  try {
    const { prenom, nom, email } = await request.json();

    if (!prenom || !nom || !email) {
      return NextResponse.json({ error: "Champs manquants" }, { status: 400 });
    }

    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT ?? 465);
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (!host || !user || !pass) {
      console.error("Config SMTP manquante");
      return NextResponse.json(
        { error: "Configuration serveur incomplète" },
        { status: 500 }
      );
    }

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });

    await transporter.sendMail({
      from: `"Lausanne Darts" <${CONTACT_EMAIL}>`,
      to: CONTACT_EMAIL,
      replyTo: email,
      subject: `Nouvelle inscription — ${prenom} ${nom}`,
      text: `Prénom : ${prenom}\nNom : ${nom}\nEmail : ${email}`,
      html: `
        <div style="font-family: sans-serif; color: #222;">
          <h2 style="margin:0 0 12px">Nouvelle inscription</h2>
          <p><strong>Prénom :</strong> ${escapeHtml(prenom)}</p>
          <p><strong>Nom :</strong> ${escapeHtml(nom)}</p>
          <p><strong>Email :</strong> <a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></p>
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
