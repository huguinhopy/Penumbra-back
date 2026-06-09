const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: Number(process.env.MAIL_PORT),
  secure: false,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

const enviarConviteAdmin = async ({ nome, email, senha_temporaria }) => {
    try {
        const info = await transporter.sendMail({
          from: `Penumbra <${process.env.MAIL_FROM}>`,
          to: email,
          subject: 'Seu acesso ao painel Penumbra',
          html: `
            <div style="font-family: Georgia, serif; max-width: 480px; margin: 0 auto; background: #0e0e0e; color: #e8dcc8; padding: 40px 32px;">
              <h1 style="font-size: 22px; color: #c9a84c; letter-spacing: 4px; text-transform: uppercase; margin-bottom: 4px;">Penumbra</h1>
              <p style="font-size: 11px; color: #444; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 32px;">Painel Administrativo</p>
      
              <p style="font-size: 16px; color: #e8dcc8; margin-bottom: 8px;">Olá, <strong style="color: #c9a84c;">${nome}</strong>.</p>
              <p style="font-size: 15px; color: #7a6a50; line-height: 1.7; margin-bottom: 28px;">
                Você foi convidado para acessar o painel administrativo do Penumbra. Suas credenciais de acesso estão abaixo.
              </p>
      
              <div style="background: #141414; border: 0.5px solid #2a2a2a; border-radius: 4px; padding: 20px 24px; margin-bottom: 28px;">
                <p style="font-size: 10px; color: #444; letter-spacing: 3px; text-transform: uppercase; margin-bottom: 12px;">Credenciais</p>
                <p style="font-size: 14px; color: #7a6a50; margin-bottom: 6px;">E-mail: <span style="color: #c9a84c;">${email}</span></p>
                <p style="font-size: 14px; color: #7a6a50;">Senha temporária: <span style="color: #c9a84c;">${senha_temporaria}</span></p>
              </div>
      
              <p style="font-size: 13px; color: #444; font-style: italic; line-height: 1.6;">
                Recomendamos que você altere sua senha após o primeiro acesso pelo painel, na área de perfil.
              </p>
      
              <hr style="border: none; border-top: 0.5px solid #1e1e1e; margin: 32px 0;">
              <p style="font-size: 11px; color: #2a2a2a; text-align: center; letter-spacing: 2px;">— PENUMBRA —</p>
            </div>
          `,
        });
        console.log('✅ E-mail enviado:', info.messageId);
    }
    catch (error) {
        console.error('❌ Erro ao enviar e-mail:', error.message);
    }
};

module.exports = { enviarConviteAdmin };