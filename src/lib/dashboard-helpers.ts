import type { Plan, Drop, DropItem, ContentItem, Subscriber, Conversation, Message, BusinessSettings } from "@/contexts/DashboardContext";

// ===== PLAN TRANSFORMERS =====
export function planToRow(plan: Plan, producerId: string) {
  return {
    id: plan.id,
    producer_id: producerId,
    name: plan.name,
    price_num: plan.priceNum,
    is_free: plan.isFree,
    benefits: plan.benefits,
    description: plan.description,
    active: plan.active,
    show_on_public_page: plan.showOnPublicPage,
    subscriber_limit: plan.subscriberLimit || null,
  };
}

export function rowToPlan(row: any, subCount = 0): Plan {
  return {
    id: row.id,
    name: row.name,
    price: row.is_free ? "Free" : `£${Number(row.price_num)}/mo`,
    priceNum: Number(row.price_num),
    subscribers: subCount,
    isFree: row.is_free,
    benefits: row.benefits || [],
    description: row.description || "",
    active: row.active,
    showOnPublicPage: row.show_on_public_page,
    subscriberLimit: row.subscriber_limit,
  };
}

// ===== DROP TRANSFORMERS =====
export function dropToRow(drop: Drop, producerId: string) {
  return {
    id: drop.id,
    producer_id: producerId,
    title: drop.title,
    description: drop.description,
    status: drop.status,
    total: drop.total,
    remaining: drop.remaining,
    price_num: drop.priceNum,
    drop_date: drop.dropDate || null,
    drop_time: drop.dropTime || "09:00",
    end_date: drop.endDate || null,
    end_time: drop.endTime || "18:00",
    eligible_plans: drop.eligiblePlans,
    items: drop.items as any,
    notify: drop.notify,
  };
}

export function rowToDrop(row: any): Drop {
  const sold = row.total - row.remaining;
  const rev = sold * Number(row.price_num);
  return {
    id: row.id,
    title: row.title,
    description: row.description || "",
    status: row.status,
    total: row.total,
    remaining: row.remaining,
    price: `£${Number(row.price_num).toFixed(2)}`,
    priceNum: Number(row.price_num),
    revenue: `£${rev.toLocaleString()}`,
    endsIn: computeEndsIn(row),
    dropDate: row.drop_date || "",
    dropTime: row.drop_time || "09:00",
    endDate: row.end_date || "",
    endTime: row.end_time || "18:00",
    eligiblePlans: row.eligible_plans || [],
    items: (row.items as DropItem[]) || [],
    notify: row.notify ?? true,
  };
}

function computeEndsIn(row: any): string {
  if (row.status === "ended" || row.status === "sold_out") return "Ended";
  if (row.status === "draft") return "—";
  if (row.status === "scheduled") {
    if (!row.drop_date) return "—";
    const start = new Date(row.drop_date);
    const now = new Date();
    const diff = Math.ceil((start.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (diff <= 0) return "Starting soon";
    return `Starts in ${diff} day${diff > 1 ? "s" : ""}`;
  }
  if (!row.end_date) return "—";
  const end = new Date(row.end_date);
  const now = new Date();
  const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (diff <= 0) return "Ending soon";
  return `${diff} day${diff > 1 ? "s" : ""}`;
}

// ===== CONTENT TRANSFORMERS =====
export function contentToRow(item: ContentItem, producerId: string) {
  return {
    id: item.id,
    producer_id: producerId,
    title: item.title,
    type: item.type,
    body: item.body,
    status: item.status,
    tier: item.tier,
    views: item.views,
    published_at: item.date === "—" ? null : item.date,
    ai: item.ai,
    prep_time: item.prepTime || null,
    cook_time: item.cookTime || null,
    serves: item.serves || null,
    ingredients: (item.ingredients || []) as any,
    method_steps: item.methodSteps || [],
    eligible_plans: item.eligiblePlans,
  };
}

export function rowToContent(row: any): ContentItem {
  return {
    id: row.id,
    title: row.title,
    type: row.type,
    body: row.body || "",
    status: row.status,
    tier: row.tier || "Free",
    views: row.views || 0,
    date: row.published_at || "—",
    ai: row.ai || false,
    prepTime: row.prep_time,
    cookTime: row.cook_time,
    serves: row.serves,
    ingredients: row.ingredients || [],
    methodSteps: row.method_steps || [],
    eligiblePlans: row.eligible_plans || [],
  };
}

// ===== SUBSCRIBER TRANSFORMERS =====
export function subscriberToRow(sub: Subscriber, producerId: string) {
  return {
    id: sub.id,
    producer_id: producerId,
    name: sub.name,
    email: sub.email,
    phone: sub.phone,
    plan: sub.plan,
    status: sub.status,
    joined_at: sub.joined,
    revenue: sub.revenue,
  };
}

export function rowToSubscriber(row: any): Subscriber {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone || "",
    plan: row.plan,
    status: row.status,
    joined: row.joined_at || "",
    revenue: row.revenue || "£0",
  };
}

// ===== CONVERSATION TRANSFORMERS =====
export function conversationToRow(conv: Conversation, producerId: string) {
  return {
    id: conv.id,
    producer_id: producerId,
    name: conv.name,
    plan: conv.plan,
    avatar: conv.avatar,
    unread: conv.unread,
  };
}

export function rowToConversation(row: any): Conversation {
  return {
    id: row.id,
    name: row.name,
    plan: row.plan,
    avatar: row.avatar || "",
    unread: row.unread || false,
    messages: (row.messages || []).map((m: any) => ({
      id: m.id,
      text: m.text,
      sender: m.sender,
      time: m.sent_at || "",
    })),
  };
}

export function messageToRow(msg: Message, conversationId: string) {
  return {
    id: msg.id,
    conversation_id: conversationId,
    text: msg.text,
    sender: msg.sender,
    sent_at: msg.time,
  };
}

// ===== SETTINGS ↔ PROFILE =====
export function profileToSettings(profile: any, currentSettings: BusinessSettings): BusinessSettings {
  return {
    ...currentSettings,
    businessName: profile.business_name || currentSettings.businessName,
    businessType: profile.business_type || currentSettings.businessType,
    description: profile.description || profile.tagline || currentSettings.description,
    email: profile.email || currentSettings.email,
    phone: profile.phone || currentSettings.phone,
    website: profile.website || currentSettings.website,
    instagram: profile.instagram || currentSettings.instagram,
    facebook: profile.facebook || currentSettings.facebook,
    twitter: profile.twitter || currentSettings.twitter,
    urlSlug: profile.url_slug || currentSettings.urlSlug,
    publicVisible: profile.public_visible ?? currentSettings.publicVisible,
    accentColor: profile.accent_color || currentSettings.accentColor,
    logoUrl: profile.logo_url,
    coverUrl: profile.cover_url,
    notifications: profile.notification_prefs
      ? { ...currentSettings.notifications, ...profile.notification_prefs }
      : currentSettings.notifications,
  };
}

export function settingsToProfile(settings: BusinessSettings) {
  return {
    business_name: settings.businessName,
    business_type: settings.businessType,
    description: settings.description,
    email: settings.email,
    phone: settings.phone,
    website: settings.website,
    instagram: settings.instagram,
    facebook: settings.facebook,
    twitter: settings.twitter,
    url_slug: settings.urlSlug,
    public_visible: settings.publicVisible,
    accent_color: settings.accentColor,
    logo_url: settings.logoUrl,
    cover_url: settings.coverUrl,
    notification_prefs: settings.notifications,
  };
}
