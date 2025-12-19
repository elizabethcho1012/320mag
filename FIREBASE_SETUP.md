# Firebase Push Notification Setup Guide

## Overview
This guide will help you set up Firebase Cloud Messaging (FCM) for push notifications in the Third Twenty application.

---

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter project name: `third-twenty` (or your preferred name)
4. Disable Google Analytics (optional)
5. Click "Create project"

---

## Step 2: Register Web App

1. In Firebase Console, click on the web icon (`</>`) to add a web app
2. Register app with nickname: "Third Twenty Web"
3. DO NOT enable Firebase Hosting (we use Vercel)
4. Click "Register app"
5. Copy the Firebase configuration object (you'll need this later)

---

## Step 3: Enable Cloud Messaging

1. In Firebase Console, go to **Project Settings** (gear icon)
2. Click on **Cloud Messaging** tab
3. Under **Web Push certificates**, click **Generate key pair**
4. Copy the **VAPID key** (you'll need this for environment variables)

---

## Step 4: Update Environment Variables

Add these to your `.env` file:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_VAPID_KEY=your_vapid_key
```

Also update the same values in:
- **Vercel**: Project Settings > Environment Variables
- **GitHub Secrets**: For GitHub Actions

---

## Step 5: Update Service Worker

Update `/public/firebase-messaging-sw.js` with your Firebase config:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

---

## Step 6: Run Supabase Migration

Execute the notification migration in Supabase SQL Editor:

```sql
-- Run this in Supabase Dashboard > SQL Editor
-- File: supabase/migrations/004_add_notifications.sql

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS fcm_token TEXT,
ADD COLUMN IF NOT EXISTS notification_preferences JSONB DEFAULT '{"new_articles": true, "events": true, "challenges": true, "announcements": true}'::jsonb;

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('new_article', 'event', 'challenge', 'announcement')),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  data JSONB,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS notifications_user_id_idx ON notifications(user_id);
CREATE INDEX IF NOT EXISTS notifications_created_at_idx ON notifications(created_at DESC);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can create notifications"
  ON notifications FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );
```

---

## Step 7: Deploy Supabase Edge Function (Optional)

For server-side notification sending, deploy the Edge Function:

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref your_project_ref

# Deploy the function
supabase functions deploy send-notification
```

Then set the following secrets:

```bash
supabase secrets set SUPABASE_URL=your_supabase_url
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

---

## Step 8: Test Notifications

### Test in Browser:

1. Run the app locally: `npm run dev`
2. Log in to your account
3. Open browser DevTools > Console
4. You should see a notification permission prompt
5. Click "Allow"
6. Check the Console for your FCM token

### Send Test Notification:

Use the Firebase Console to send a test message:

1. Go to **Cloud Messaging** in Firebase Console
2. Click **Send your first message**
3. Enter notification title and text
4. Click **Send test message**
5. Paste your FCM token from the console
6. Click **Test**

---

## Notification Types

The app supports 4 notification types:

### 1. New Article (`new_article`)
```json
{
  "type": "new_article",
  "title": "새 기사가 발행되었습니다",
  "body": "패션: 2025 봄 트렌드",
  "data": {
    "url": "/article/abc123",
    "article_id": "abc123"
  }
}
```

### 2. Event (`event`)
```json
{
  "type": "event",
  "title": "새 이벤트 등록",
  "body": "시니어 패션쇼 2025 참가 신청 시작",
  "data": {
    "url": "/events/xyz789",
    "event_id": "xyz789"
  }
}
```

### 3. Challenge (`challenge`)
```json
{
  "type": "challenge",
  "title": "챌린지 참여 확인",
  "body": "음성 녹음이 성공적으로 제출되었습니다",
  "data": {
    "url": "/challenges"
  }
}
```

### 4. Announcement (`announcement`)
```json
{
  "type": "announcement",
  "title": "중요 공지",
  "body": "서비스 점검 안내",
  "data": {
    "url": "/"
  }
}
```

---

## Troubleshooting

### "Permission denied" error
- Check if user has granted notification permission
- Verify VAPID key is correct
- Ensure service worker is registered

### Service worker not loading
- Check `/public/firebase-messaging-sw.js` exists
- Verify Firebase config in service worker
- Check browser console for errors

### Token not saving to database
- Verify Supabase migration ran successfully
- Check RLS policies on `profiles` table
- Look for errors in browser console

### Notifications not appearing
- Test in different browsers (Chrome, Firefox)
- Check if Do Not Disturb is enabled
- Verify Firebase Cloud Messaging is enabled in Firebase Console

---

## Security Considerations

1. **NEVER** commit Firebase config to public repositories
2. Use environment variables for all sensitive data
3. RLS policies ensure users can only see their own notifications
4. Only admins can create notifications (enforced by RLS)

---

## Production Checklist

- [ ] Firebase project created
- [ ] Web app registered in Firebase
- [ ] Cloud Messaging enabled
- [ ] VAPID key generated
- [ ] Environment variables set (local, Vercel, GitHub)
- [ ] Service worker updated with config
- [ ] Supabase migration executed
- [ ] RLS policies verified
- [ ] Edge function deployed (optional)
- [ ] Test notifications sent successfully
- [ ] Notification bell appears in header
- [ ] Users can enable/disable notification types

---

## Next Steps

After Firebase is configured, you can:

1. **Send notifications from admin panel** - Build UI to send notifications
2. **Automate notifications** - Trigger on new article publish
3. **Schedule notifications** - Daily digest emails
4. **Track analytics** - Monitor notification open rates

---

## Support

If you encounter issues:
- Check [Firebase Documentation](https://firebase.google.com/docs/cloud-messaging)
- Review browser console logs
- Verify all environment variables are set correctly
- Test in incognito mode to rule out extension conflicts
