// Supabase Edge Function for sending push notifications
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NotificationPayload {
  type: 'new_article' | 'event' | 'challenge' | 'announcement';
  title: string;
  body: string;
  url?: string;
  targetUsers?: string[]; // Optional: specific user IDs to notify
  data?: Record<string, any>;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get request payload
    const payload: NotificationPayload = await req.json();

    // Validate payload
    if (!payload.type || !payload.title || !payload.body) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: type, title, body' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get users to notify
    let query = supabaseClient
      .from('profiles')
      .select('id, fcm_token, notification_preferences');

    // Filter by specific users if provided
    if (payload.targetUsers && payload.targetUsers.length > 0) {
      query = query.in('id', payload.targetUsers);
    } else {
      // Otherwise, notify all users who have enabled this notification type
      query = query.not('fcm_token', 'is', null);
    }

    const { data: users, error: usersError } = await query;

    if (usersError) throw usersError;

    if (!users || users.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No users to notify' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Filter users based on their notification preferences
    const usersToNotify = users.filter(user => {
      const prefs = user.notification_preferences || {};
      const typeKey = payload.type === 'new_article' ? 'new_articles' : payload.type + 's';
      return prefs[typeKey] !== false && user.fcm_token;
    });

    // Send FCM notifications (you'll need to integrate with Firebase Admin SDK)
    // For now, we'll save to the notifications table
    const notifications = usersToNotify.map(user => ({
      user_id: user.id,
      type: payload.type,
      title: payload.title,
      body: payload.body,
      data: {
        url: payload.url,
        ...payload.data
      }
    }));

    const { error: insertError } = await supabaseClient
      .from('notifications')
      .insert(notifications);

    if (insertError) throw insertError;

    // TODO: Integrate Firebase Admin SDK to actually send push notifications
    // const admin = require('firebase-admin');
    // const messages = usersToNotify.map(user => ({
    //   token: user.fcm_token,
    //   notification: {
    //     title: payload.title,
    //     body: payload.body
    //   },
    //   data: payload.data
    // }));
    // await admin.messaging().sendAll(messages);

    return new Response(
      JSON.stringify({
        success: true,
        notificationsSent: notifications.length
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error sending notifications:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
