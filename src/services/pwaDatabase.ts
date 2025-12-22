import { supabase } from '@/lib/supabase';
import type { PWAApp, PWACategory, PWAAppFilters, ReportReason } from '@/types/pwa.types';

/**
 * Convert database app to PWAApp type
 */
function dbAppToPWAApp(dbApp: any): PWAApp {
  return {
    id: dbApp.id,
    name: dbApp.name,
    description: dbApp.description,
    url: dbApp.url,
    category: dbApp.category,
    categories: dbApp.categories || [],
    pricing: dbApp.pricing,
    price: dbApp.price ? Number(dbApp.price) : undefined,
    targetAudience: dbApp.target_audience || undefined,
    developer: dbApp.developer,
    screenshots: dbApp.screenshots || [],
    icon: dbApp.icon || '',
    downloadCount: dbApp.download_count,
    reportCount: dbApp.report_count,
    reportedBy: dbApp.reported_by || [],
    lighthouseScore: dbApp.lighthouse_score,
    validationStatus: dbApp.validation_status,
    status: dbApp.status,
    isHidden: dbApp.is_hidden,
    submittedBy: dbApp.submitted_by || '',
    createdAt: dbApp.created_at ? new Date(dbApp.created_at) : new Date(),
    updatedAt: dbApp.updated_at ? new Date(dbApp.updated_at) : new Date(),
    publishedAt: dbApp.published_at ? new Date(dbApp.published_at) : undefined,
  };
}

/**
 * Get PWA apps with filters and pagination
 */
export async function getPWAApps(filters: PWAAppFilters = {}): Promise<{ apps: PWAApp[]; hasMore: boolean }> {
  const {
    category,
    sortBy = 'newest',
    search,
    limit = 20,
    offset = 0,
  } = filters;

  let query = supabase
    .from('pwa_apps')
    .select('*', { count: 'exact' })
    .eq('status', 'active')
    .eq('is_hidden', false)
    .eq('validation_status', 'approved');

  // Filter by category
  if (category) {
    query = query.eq('category', category);
  }

  // Search
  if (search) {
    query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
  }

  // Sorting
  switch (sortBy) {
    case 'newest':
      query = query.order('created_at', { ascending: false });
      break;
    case 'popular':
      query = query.order('download_count', { ascending: false });
      break;
    case 'recently_updated':
      query = query.order('updated_at', { ascending: false });
      break;
    default:
      query = query.order('created_at', { ascending: false });
  }

  // Pagination
  query = query.range(offset, offset + limit - 1);

  const { data, error, count } = await query;

  if (error) {
    console.error('Error fetching PWA apps:', error);
    throw error;
  }

  const apps = (data || []).map(dbAppToPWAApp);
  const hasMore = count ? offset + limit < count : false;

  return { apps, hasMore };
}

/**
 * Get a single PWA app by ID
 */
export async function getPWAAppById(id: string): Promise<PWAApp | null> {
  const { data, error } = await supabase
    .from('pwa_apps')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching PWA app:', error);
    return null;
  }

  return data ? dbAppToPWAApp(data) : null;
}

/**
 * Get PWA apps submitted by a specific user
 */
export async function getUserPWAApps(userId: string): Promise<PWAApp[]> {
  const { data, error } = await supabase
    .from('pwa_apps')
    .select('*')
    .eq('submitted_by', userId)
    .neq('status', 'removed')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching user PWA apps:', error);
    throw error;
  }

  return (data || []).map(dbAppToPWAApp);
}

/**
 * Submit a new PWA app
 */
export async function submitPWAApp(appData: Partial<PWAApp>, userId: string): Promise<string> {
  const insertData = {
    name: appData.name!,
    description: appData.description!,
    url: appData.url!,
    category: appData.category!,
    categories: appData.categories || [],
    pricing: appData.pricing || 'free',
    price: appData.price || null,
    target_audience: appData.targetAudience || null,
    developer: appData.developer,
    screenshots: appData.screenshots || [],
    icon: appData.icon || null,
    submitted_by: userId,
    validation_status: 'pending',
    status: 'active',
    is_hidden: false,
  };

  const { data, error } = await supabase
    .from('pwa_apps')
    .insert(insertData)
    .select()
    .single();

  if (error) {
    console.error('Error submitting PWA app:', error);
    throw error;
  }

  // Auto-approve for now (until validation is implemented)
  const { error: approveError } = await supabase
    .from('pwa_apps')
    .update({
      validation_status: 'approved',
      published_at: new Date().toISOString()
    })
    .eq('id', data.id);

  if (approveError) {
    console.error('Error auto-approving PWA app:', approveError);
  }

  return data.id;
}

/**
 * Update an existing PWA app
 */
export async function updatePWAApp(id: string, appData: Partial<PWAApp>): Promise<void> {
  const updateData: any = {
    ...(appData.name && { name: appData.name }),
    ...(appData.description && { description: appData.description }),
    ...(appData.url && { url: appData.url }),
    ...(appData.category && { category: appData.category }),
    ...(appData.categories && { categories: appData.categories }),
    ...(appData.pricing && { pricing: appData.pricing }),
    ...(appData.price !== undefined && { price: appData.price }),
    ...(appData.targetAudience !== undefined && { target_audience: appData.targetAudience }),
    ...(appData.developer && { developer: appData.developer }),
    ...(appData.screenshots && { screenshots: appData.screenshots }),
    ...(appData.icon !== undefined && { icon: appData.icon }),
    ...(appData.validationStatus && { validation_status: appData.validationStatus }),
    ...(appData.status && { status: appData.status }),
    ...(appData.isHidden !== undefined && { is_hidden: appData.isHidden }),
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from('pwa_apps')
    .update(updateData)
    .eq('id', id);

  if (error) {
    console.error('Error updating PWA app:', error);
    throw error;
  }
}

/**
 * Delete a PWA app
 */
export async function deletePWAApp(id: string): Promise<void> {
  const { error } = await supabase
    .from('pwa_apps')
    .update({ status: 'removed' })
    .eq('id', id);

  if (error) {
    console.error('Error deleting PWA app:', error);
    throw error;
  }
}

/**
 * Get all PWA categories
 */
export async function getPWACategories(): Promise<PWACategory[]> {
  const { data, error } = await supabase
    .from('pwa_categories')
    .select('*')
    .order('order', { ascending: true });

  if (error) {
    console.error('Error fetching PWA categories:', error);
    throw error;
  }

  return (data || []).map(cat => ({
    id: cat.id,
    name: cat.name,
    description: cat.description || '',
    icon: cat.icon || '',
    appCount: cat.app_count,
    order: cat.order,
    createdAt: cat.created_at ? new Date(cat.created_at) : new Date(),
  }));
}

/**
 * Track a PWA app download
 */
export async function trackPWADownload(appId: string, sessionId: string): Promise<boolean> {
  const { data, error } = await supabase.rpc('track_pwa_download', {
    p_app_id: appId,
    p_session_id: sessionId,
    p_user_agent: navigator.userAgent,
  });

  if (error) {
    console.error('Error tracking PWA download:', error);
    return false;
  }

  return data || false;
}

/**
 * Submit a report for a PWA app
 */
export async function submitPWAReport(
  appId: string,
  userId: string,
  reason: ReportReason,
  comment?: string
): Promise<boolean> {
  const { data, error } = await supabase.rpc('submit_pwa_report', {
    p_app_id: appId,
    p_user_id: userId,
    p_reason: reason,
    p_comment: comment || null,
    p_ip_hash: null,
  });

  if (error) {
    console.error('Error submitting PWA report:', error);
    return false;
  }

  return data || false;
}

/**
 * Search PWA apps
 */
export async function searchPWAApps(searchQuery: string): Promise<PWAApp[]> {
  const { data, error } = await supabase
    .from('pwa_apps')
    .select('*')
    .eq('status', 'active')
    .eq('is_hidden', false)
    .eq('validation_status', 'approved')
    .or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`)
    .order('download_count', { ascending: false })
    .limit(20);

  if (error) {
    console.error('Error searching PWA apps:', error);
    throw error;
  }

  return (data || []).map(dbAppToPWAApp);
}

/**
 * Get PWA apps by category
 */
export async function getPWAAppsByCategory(categoryName: string): Promise<PWAApp[]> {
  const { data, error } = await supabase
    .from('pwa_apps')
    .select('*')
    .eq('status', 'active')
    .eq('is_hidden', false)
    .eq('validation_status', 'approved')
    .eq('category', categoryName)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching PWA apps by category:', error);
    throw error;
  }

  return (data || []).map(dbAppToPWAApp);
}

/**
 * Get all PWA apps (for admin)
 */
export async function getAllPWAApps(): Promise<PWAApp[]> {
  const { data, error } = await supabase
    .from('pwa_apps')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching all PWA apps:', error);
    throw error;
  }

  return (data || []).map(dbAppToPWAApp);
}

/**
 * Hide a PWA app
 */
export async function hidePWAApp(id: string): Promise<void> {
  const { error } = await supabase
    .from('pwa_apps')
    .update({ is_hidden: true })
    .eq('id', id);

  if (error) {
    console.error('Error hiding PWA app:', error);
    throw error;
  }
}

/**
 * Restore a hidden PWA app
 */
export async function restorePWAApp(id: string): Promise<void> {
  const { error } = await supabase
    .from('pwa_apps')
    .update({ is_hidden: false })
    .eq('id', id);

  if (error) {
    console.error('Error restoring PWA app:', error);
    throw error;
  }
}
