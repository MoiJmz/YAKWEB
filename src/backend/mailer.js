const nodemailer = require('nodemailer');

let transporter = null;

async function getTransporter() {
    if (transporter) return transporter;

    const user = process.env.SMTP_USER ? process.env.SMTP_USER.trim() : '';
    const pass = process.env.SMTP_PASS ? process.env.SMTP_PASS.replace(/\s+/g, '') : '';

    if (user && pass) {
        console.log(`[MAILER] Configurando Gmail SMTP real con ${user}`);
        transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: user,
                pass: pass
            }
        });
        transporter.isTest = false;
    } else {
        // Crear cuenta de prueba SMTP real en Ethereal
        const testAccount = await nodemailer.createTestAccount();
        transporter = nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            secure: false,
            auth: {
                user: testAccount.user,
                pass: testAccount.pass
            }
        });
        transporter.isTest = true;
    }
    return transporter;
}

async function enviarCodigoCorreo(destinatario, codigo) {
    try {
        const mailTransporter = await getTransporter();

        const senderEmail = process.env.SMTP_USER || 'yakplataform@gmail.com';
        const mailOptions = {
            from: `"YAK Platform" <${senderEmail}>`,
            to: destinatario,
            subject: '🔐 Código de Verificación para restablecer tu contraseña - YAK Platform',
            html: `
                <div style="font-family: Arial, sans-serif; background-color: #0f172a; padding: 40px 20px; color: #f8fafc;">
                    <div style="max-width: 500px; margin: 0 auto; background: #1e293b; border-radius: 16px; padding: 32px; border: 1px solid #334155; box-shadow: 0 10px 25px rgba(0,0,0,0.5);">
                        <div style="text-align: center; margin-bottom: 24px;">
                            <h1 style="color: #10B981; font-size: 28px; margin: 0;">YAK Platform</h1>
                            <p style="color: #94a3b8; font-size: 14px; margin-top: 6px;">Recuperación de Contraseña</p>
                        </div>
                        
                        <p style="font-size: 16px; color: #e2e8f0; line-height: 1.5;">Hola,</p>
                        <p style="font-size: 15px; color: #94a3b8; line-height: 1.5;">Has solicitado restablecer la contraseña de tu cuenta en <strong>YAK Platform</strong>. Utiliza el siguiente código de verificación de 6 dígitos:</p>
                        
                        <div style="text-align: center; margin: 30px 0;">
                            <div style="display: inline-block; background: #064e3b; color: #34d399; font-size: 32px; font-weight: bold; letter-spacing: 8px; padding: 16px 32px; border-radius: 12px; border: 1px solid #059669;">
                                ${codigo}
                            </div>
                        </div>
                        
                        <p style="font-size: 13px; color: #64748b; text-align: center; line-height: 1.4;">Este código es válido durante <strong>10 minutos</strong>. Si no solicitaste este cambio, puedes ignorar este correo de forma segura.</p>
                        
                        <hr style="border: 0; border-top: 1px solid #334155; margin: 24px 0;">
                        
                        <p style="font-size: 12px; color: #475569; text-align: center;">© 2026 YAK Platform. Todos los derechos reservados.</p>
                    </div>
                </div>
            `
        };

        const info = await mailTransporter.sendMail(mailOptions);
        console.log(`[MAILER] Correo enviado a ${destinatario}. MessageId: ${info.messageId}`);
        
        let previewUrl = null;
        if (mailTransporter.isTest) {
            previewUrl = nodemailer.getTestMessageUrl(info);
            console.log(`[MAILER] Preview real disponible en: ${previewUrl}`);
        }

        return { success: true, messageId: info.messageId, previewUrl };
    } catch (error) {
        console.error('[MAILER ERROR]', error);
        throw error;
    }
}

module.exports = { enviarCodigoCorreo };
