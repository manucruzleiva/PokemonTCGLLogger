import { MailService } from '@sendgrid/mail';

if (!process.env.SENDGRID_API_KEY) {
  throw new Error("SENDGRID_API_KEY environment variable must be set");
}

const mailService = new MailService();
mailService.setApiKey(process.env.SENDGRID_API_KEY);

interface FeatureRequestParams {
  userEmail: string;
  userName: string;
  subject: string;
  message: string;
}

export async function sendFeatureRequest(params: FeatureRequestParams): Promise<boolean> {
  try {
    const emailContent = `
Nueva solicitud de feature desde Pokemon TCG Match Logger

Usuario: ${params.userName}
Email: ${params.userEmail}
Asunto: ${params.subject}

Mensaje:
${params.message}

---
Enviado desde Pokemon TCG Match Logger
    `;

    await mailService.send({
      to: 'shieromanu@gmail.com',
      from: 'noreply@replit.dev', // Usar un email verificado en SendGrid
      subject: `[Pokemon TCG] ${params.subject}`,
      text: emailContent,
      html: emailContent.replace(/\n/g, '<br>')
    });

    console.log('Feature request email sent successfully');
    return true;
  } catch (error) {
    console.error('SendGrid email error:', error);
    return false;
  }
}

interface AssistanceRequestParams {
  userEmail: string;
  userName: string;
  claimedName: string;
  realName: string;
  description: string;
  evidenceImageUrl?: string;
}

export async function sendAssistanceRequest(params: AssistanceRequestParams): Promise<boolean> {
  try {
    console.log("Attempting to send assistance request email...");
    console.log("From:", params.userEmail);
    console.log("Claimed Name:", params.claimedName);
    
    const evidenceSection = params.evidenceImageUrl 
      ? `Evidencia adjunta: ${params.evidenceImageUrl}\n\n`
      : 'No se adjuntó evidencia\n\n';
    
    const emailContent = `
Solicitud de Asistencia por Conflicto de Nombre - Pokémon Trainer Academia

Usuario: ${params.userName}
Email: ${params.userEmail}
Nombre Reclamado: ${params.claimedName}
Nombre Real: ${params.realName}

Descripción de la Situación:
${params.description}

${evidenceSection}

---
Este usuario solicita asistencia manual para verificar la propiedad del nombre de jugador "${params.claimedName}".
Enviado desde Pokémon Trainer Academia
    `;
    
    await mailService.send({
      to: "shieromanu@gmail.com", // Target email for manual review
      from: "noreply@replit.dev", // From address (verified domain)
      replyTo: params.userEmail, // User's email for replies
      subject: `[Pokémon Trainer Academia] Conflicto de Nombre: ${params.claimedName}`,
      text: emailContent,
      html: emailContent.replace(/\n/g, '<br>')
    });
    
    console.log("Assistance request email sent successfully");
    return true;
    
  } catch (error) {
    console.error("Failed to send assistance request email:", error);
    return false;
  }
}