import { supabase } from '../integrations/supabase/client';

export interface EmailOptions {
  to: string | string[];
  subject?: string;
  html?: string;
  text?: string;
  template?: 'welcome' | 'article' | 'event' | 'password_reset';
  templateData?: Record<string, any>;
}

export const emailService = {
  /**
   * Send email using Supabase Edge Function
   */
  async send(options: EmailOptions): Promise<{ success: boolean; error?: string }> {
    try {
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: options,
      });

      if (error) throw error;

      return { success: true };
    } catch (error: any) {
      console.error('Error sending email:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Send welcome email to new user
   */
  async sendWelcomeEmail(email: string, username: string): Promise<void> {
    await this.send({
      to: email,
      template: 'welcome',
      templateData: {
        username,
        siteUrl: window.location.origin,
      },
    });
  },

  /**
   * Send new article notification
   */
  async sendArticleNotification(
    recipients: string[],
    article: { title: string; excerpt: string; image?: string; slug: string }
  ): Promise<void> {
    await this.send({
      to: recipients,
      template: 'article',
      templateData: {
        title: article.title,
        excerpt: article.excerpt,
        image: article.image,
        url: `${window.location.origin}/article/${article.slug}`,
        unsubscribeUrl: `${window.location.origin}/settings/email`,
      },
    });
  },

  /**
   * Send event registration confirmation
   */
  async sendEventConfirmation(
    email: string,
    event: { title: string; date: string; time: string; location: string },
    qrCode?: string
  ): Promise<void> {
    await this.send({
      to: email,
      template: 'event',
      templateData: {
        title: event.title,
        date: event.date,
        time: event.time,
        location: event.location,
        qrCode,
      },
    });
  },

  /**
   * Send password reset email
   */
  async sendPasswordReset(email: string, resetUrl: string): Promise<void> {
    await this.send({
      to: email,
      template: 'password_reset',
      templateData: {
        resetUrl,
      },
    });
  },

  /**
   * Get user's email preferences
   */
  async getPreferences(userId: string): Promise<any> {
    const { data, error } = await supabase
      .from('email_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error fetching email preferences:', error);
      return null;
    }

    return data;
  },

  /**
   * Update user's email preferences
   */
  async updatePreferences(
    userId: string,
    preferences: {
      new_articles?: boolean;
      weekly_digest?: boolean;
      events?: boolean;
      challenges?: boolean;
      marketing?: boolean;
    }
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('email_preferences')
        .upsert({
          user_id: userId,
          ...preferences,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      return { success: true };
    } catch (error: any) {
      console.error('Error updating email preferences:', error);
      return { success: false, error: error.message };
    }
  },
};
