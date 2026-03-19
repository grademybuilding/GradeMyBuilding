import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const SYSTEM_PROMPT = `You are Beena, the AI Inspector Assistant for GradeMyBuilding.com. You help building inspectors via email with inspection procedures, building codes (IRC, IBC, NEC, UPC, IMC), defect identification, and report generation. Be professional but friendly. Include relevant code references. Always note guidance is informational. Sign off as Beena - AI Inspector Assistant, GradeMyBuilding.com`;

const FOOTER = `\n\n---\nGradeMyBuilding AI Inspector Assistant\nGradeMyBuilding.com\nEmail: grademybuilding@agentmail.to\n\nNote: This is an AI-generated response. Always consult with your local AHJ and applicable building codes.`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { event_type, message } = body;

    // Only process message.received events
    if (event_type !== 'message.received') {
      return new Response(JSON.stringify({ status: 'ignored', reason: 'not a message.received event' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!message) {
      return new Response(JSON.stringify({ status: 'error', reason: 'no message in payload' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Extract sender email from message.from_ (array of objects or strings)
    const fromField = message.from_ || message.from || [];
    let senderEmail = '';
    if (Array.isArray(fromField) && fromField.length > 0) {
      const first = fromField[0];
      senderEmail = typeof first === 'string' ? first : (first.email || first.address || '');
    } else if (typeof fromField === 'string') {
      senderEmail = fromField;
    }

    if (!senderEmail) {
      console.error('Could not extract sender email from:', JSON.stringify(fromField));
      return new Response(JSON.stringify({ status: 'error', reason: 'no sender email found' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Skip our own messages
    if (senderEmail.toLowerCase() === 'grademybuilding@agentmail.to' || senderEmail.toLowerCase() === 'beena@agentmail.to') {
      return new Response(JSON.stringify({ status: 'skipped', reason: 'own message' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const subject = message.subject || 'No Subject';
    const emailBody = message.text || message.preview || message.snippet || '';

    console.log(`Processing email from ${senderEmail}, subject: "${subject}"`);

    // Generate AI response
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      console.error('OPENAI_API_KEY not configured');
      return new Response(JSON.stringify({ status: 'error', reason: 'AI service not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: `Email from: ${senderEmail}\nSubject: ${subject}\n\n${emailBody}` },
        ],
        max_tokens: 1024,
        temperature: 0.7,
      }),
    });

    if (!openaiResponse.ok) {
      const errText = await openaiResponse.text();
      console.error('OpenAI API error:', openaiResponse.status, errText);
      return new Response(JSON.stringify({ status: 'error', reason: 'AI generation failed' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const aiResult = await openaiResponse.json();
    const aiReply = aiResult.choices?.[0]?.message?.content || 'I apologize, but I was unable to generate a response at this time.';

    // Send reply via AgentMail
    const AGENTMAIL_API_KEY = Deno.env.get('AGENTMAIL_API_KEY');
    if (!AGENTMAIL_API_KEY) {
      console.error('AGENTMAIL_API_KEY not configured');
      return new Response(JSON.stringify({ status: 'error', reason: 'Email service not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const replyBody = {
      to: [senderEmail],
      subject: `Re: ${subject}`,
      reply_to: 'beena@agentmail.to',
      text: aiReply + FOOTER,
    };

    const sendUrl = 'https://api.agentmail.to/v0/inboxes/beena%40agentmail.to/messages/send';
    const sendResponse = await fetch(sendUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AGENTMAIL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(replyBody),
    });

    if (!sendResponse.ok) {
      const errText = await sendResponse.text();
      console.error('AgentMail send error:', sendResponse.status, errText);
      return new Response(JSON.stringify({ status: 'error', reason: 'Failed to send reply' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Reply sent to ${senderEmail}`);

    return new Response(JSON.stringify({ status: 'ok', replied_to: senderEmail }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Email webhook error:', error);
    return new Response(JSON.stringify({ status: 'error', reason: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
