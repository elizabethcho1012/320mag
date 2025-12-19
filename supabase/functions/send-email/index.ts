// Supabase Edge Function for sending emails
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EmailPayload {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  template?: 'welcome' | 'article' | 'event' | 'password_reset';
  templateData?: Record<string, any>;
}

// Email templates
const templates = {
  welcome: (data: Record<string, any>) => ({
    subject: 'Third Twenty에 오신 것을 환영합니다!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #7c3aed;">환영합니다, ${data.username || '회원'}님!</h1>
        <p>Third Twenty에 가입해 주셔서 감사합니다.</p>
        <p>40-60대를 위한 특별한 콘텐츠와 커뮤니티를 즐겨보세요.</p>
        <ul>
          <li>매주 새로운 패션, 뷰티, 컬처 콘텐츠</li>
          <li>음성 챌린지 참여</li>
          <li>오프라인 이벤트</li>
        </ul>
        <a href="${data.siteUrl || 'https://thirdtwenty.com'}"
           style="display: inline-block; background: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px;">
          지금 시작하기
        </a>
        <p style="color: #666; font-size: 12px; margin-top: 40px;">
          이 이메일은 Third Twenty 회원가입 시 자동으로 발송되었습니다.
        </p>
      </div>
    `,
  }),

  article: (data: Record<string, any>) => ({
    subject: `새 기사: ${data.title}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #7c3aed;">새로운 기사가 발행되었습니다</h2>
        ${data.image ? `<img src="${data.image}" style="width: 100%; border-radius: 8px; margin: 20px 0;" />` : ''}
        <h3>${data.title}</h3>
        <p>${data.excerpt || ''}</p>
        <a href="${data.url}"
           style="display: inline-block; background: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px;">
          기사 읽기
        </a>
        <p style="color: #666; font-size: 12px; margin-top: 40px;">
          이메일 알림을 받고 싶지 않으시면 <a href="${data.unsubscribeUrl}">여기</a>를 클릭하세요.
        </p>
      </div>
    `,
  }),

  event: (data: Record<string, any>) => ({
    subject: `이벤트 등록 확인: ${data.title}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #7c3aed;">이벤트 등록이 완료되었습니다</h2>
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>${data.title}</h3>
          <p><strong>날짜:</strong> ${data.date}</p>
          <p><strong>시간:</strong> ${data.time}</p>
          <p><strong>장소:</strong> ${data.location}</p>
        </div>
        <p>이벤트 당일 QR 코드를 보여주세요.</p>
        ${data.qrCode ? `<img src="${data.qrCode}" style="width: 200px; margin: 20px 0;" />` : ''}
        <p style="color: #666; font-size: 12px; margin-top: 40px;">
          참가 취소는 이벤트 3일 전까지 가능합니다.
        </p>
      </div>
    `,
  }),

  password_reset: (data: Record<string, any>) => ({
    subject: 'Third Twenty 비밀번호 재설정',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #7c3aed;">비밀번호 재설정</h2>
        <p>비밀번호 재설정을 요청하셨습니다.</p>
        <p>아래 링크를 클릭하여 새 비밀번호를 설정하세요.</p>
        <a href="${data.resetUrl}"
           style="display: inline-block; background: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px;">
          비밀번호 재설정
        </a>
        <p style="color: #666; margin-top: 20px;">
          이 링크는 24시간 동안 유효합니다.
        </p>
        <p style="color: #666; font-size: 12px; margin-top: 40px;">
          요청하지 않으셨다면 이 이메일을 무시하세요.
        </p>
      </div>
    `,
  }),
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const payload: EmailPayload = await req.json();

    // Validate payload
    if (!payload.to || (!payload.html && !payload.template)) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: to, html or template' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate email from template if provided
    let emailContent = {
      subject: payload.subject,
      html: payload.html,
      text: payload.text,
    };

    if (payload.template && payload.templateData) {
      const templateFn = templates[payload.template];
      if (templateFn) {
        const generated = templateFn(payload.templateData);
        emailContent = {
          ...emailContent,
          ...generated,
        };
      }
    }

    // In production, integrate with email service (SendGrid, Resend, etc.)
    // For now, we'll log and save to database
    console.log('Sending email:', {
      to: payload.to,
      subject: emailContent.subject,
    });

    // Save email log to database
    const recipients = Array.isArray(payload.to) ? payload.to : [payload.to];

    for (const recipient of recipients) {
      await supabaseClient.from('email_logs').insert({
        recipient,
        subject: emailContent.subject,
        html: emailContent.html,
        sent_at: new Date().toISOString(),
        status: 'sent',
      });
    }

    // TODO: Integrate with actual email service
    // Example with Resend:
    // const resend = new Resend(Deno.env.get('RESEND_API_KEY'));
    // await resend.emails.send({
    //   from: 'Third Twenty <noreply@thirdtwenty.com>',
    //   to: recipients,
    //   subject: emailContent.subject,
    //   html: emailContent.html,
    // });

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Email sent successfully',
        recipients: recipients.length,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error sending email:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
