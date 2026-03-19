import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, company, role, category, message } = await req.json();

    if (!name || !email || !role || !category || !message) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const AGENTMAIL_API_KEY = Deno.env.get('AGENTMAIL_API_KEY');
    if (!AGENTMAIL_API_KEY) {
      console.error('AGENTMAIL_API_KEY not configured');
      return new Response(JSON.stringify({ error: 'Email service not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const sendUrl = 'https://api.agentmail.to/v0/inboxes/grademybuilding%40agentmail.to/messages/send';
    const authHeaders = {
      'Authorization': `Bearer ${AGENTMAIL_API_KEY}`,
      'Content-Type': 'application/json',
    };

    // 1. Send confirmation email to the user
    const userEmailBody = {
      to: [email],
      subject: 'Thanks for contacting GradeMyBuilding!',
      reply_to: 'beena@agentmail.to',
      text: `Hi ${name},

Thank you for reaching out to GradeMyBuilding! We've received your message about ${category}.

Beena, our AI Inspector Assistant, will review your question and send you a detailed response shortly at this email address.

If you need immediate help, you can also chat with Beena directly at www.grademybuilding.com/contact

Best regards,
The GradeMyBuilding Team`,
    };

    const userEmailRes = await fetch(sendUrl, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify(userEmailBody),
    });

    if (!userEmailRes.ok) {
      const errText = await userEmailRes.text();
      console.error('Failed to send user email:', userEmailRes.status, errText);
    }

    // 2. Send copy to grademybuilding@gmail.com
    const formData = `Name: ${name}
Email: ${email}
Company: ${company || 'N/A'}
Role: ${role}
Category: ${category}

Message:
${message}`;

    const internalEmailBody = {
      to: ['grademybuilding@gmail.com'],
      subject: `[GradeMyBuilding Contact] ${category} - ${name}`,
      reply_to: email,
      text: formData,
    };

    const internalEmailRes = await fetch(sendUrl, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify(internalEmailBody),
    });

    if (!internalEmailRes.ok) {
      const errText = await internalEmailRes.text();
      console.error('Failed to send internal email:', internalEmailRes.status, errText);
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Contact form error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
