import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Método não permitido" });
  }

  const { name, email, phone, company, message } = req.body || {};

  if (!email) {
    return res.status(400).json({
      success: false,
      error: "O campo de email é obrigatório.",
    });
  }

  try {
    const result = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL,
      to: [process.env.RESEND_TO_EMAIL],
      replyTo: email,
      subject: `Novo contato de ${name || "Pessoa"}${
        company ? ` — ${company}` : ""
      }`,
      html: `
        <h1>Novo contato recebido</h1>

        <p><strong>Nome:</strong> ${name || "Não informado"}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Empresa:</strong> ${company || "Não informada"}</p>
        <p><strong>Telefone:</strong> ${phone || "Não informado"}</p>

        <hr />

        <h2>Mensagem</h2>
        <p>${message || "Sem mensagem."}</p>

        <hr />

        <p>
          Clique em "Responder" no seu email para responder diretamente ao cliente.
        </p>
      `,
      text: `
Novo contato recebido

Nome: ${name || "Não informado"}
Email: ${email}
Empresa: ${company || "Não informada"}
Telefone: ${phone || "Não informado"}

Mensagem:
${message || "Sem mensagem."}

Clique em responder para falar diretamente com o cliente.
      `,
    });

    if (result.error) {
      console.error("Resend error:", result.error);
      return res.status(500).json({
        success: false,
        error: result.error.message,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Email enviado com sucesso!",
    });
  } catch (error) {
    console.error("Erro ao enviar email:", error);
    return res.status(500).json({
      success: false,
      error: "Erro ao enviar email",
    });
  }
}
