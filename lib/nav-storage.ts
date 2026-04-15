import { NavItem, NAV_DATA } from './nav-data';

// localStorage keys
const STORAGE_KEYS = {
  CUSTOM_DATA: 'site-nav-custom-data',
  CUSTOM_ORDER: 'site-nav-order',
  STATUS_CACHE: 'site-nav-status',
  FAVORITES: 'site-nav-favorites',
  LAST_CHECK: 'site-nav-last-check',
  VIEWS: 'site-nav-views',
  LIKES: 'site-nav-likes',
} as const;

// 自定义网站数据类型
export interface CustomNavItem extends NavItem {
  isCustom?: boolean;
  status?: 'online' | 'offline' | 'unknown';
  lastChecked?: string;
  responseTime?: number;
}

// 获取自定义网站数据
export function getCustomData(): CustomNavItem[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.CUSTOM_DATA);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

// 保存自定义网站数据
export function saveCustomData(data: CustomNavItem[]): void {
  localStorage.setItem(STORAGE_KEYS.CUSTOM_DATA, JSON.stringify(data));
}

// 添加自定义网站（带去重）
export function addCustomSite(site: CustomNavItem): { success: boolean; message: string } {
  const customData = getCustomData();

  // 检查是否已存在相同 URL 的网站
  const existingIndex = customData.findIndex(
    (item) => item.url.toLowerCase() === site.url.toLowerCase()
  );

  if (existingIndex !== -1) {
    return {
      success: false,
      message: `该网站已存在：${customData[existingIndex].name}`,
    };
  }

  // 检查是否与默认数据中的网站重复
  const defaultDuplicate = NAV_DATA.find(
    (item) => item.url.toLowerCase() === site.url.toLowerCase()
  );

  if (defaultDuplicate) {
    return {
      success: false,
      message: `该网站已在默认列表中：${defaultDuplicate.name}`,
    };
  }

  customData.push(site);
  saveCustomData(customData);
  return {
    success: true,
    message: '添加成功',
  };
}

// 更新自定义网站
export function updateCustomSite(id: string, updates: Partial<CustomNavItem>): void {
  const customData = getCustomData();
  const index = customData.findIndex((item) => item.id === id);
  if (index !== -1) {
    customData[index] = { ...customData[index], ...updates };
    saveCustomData(customData);
  }
}

// 删除自定义网站
export function deleteCustomSite(id: string): void {
  const customData = getCustomData();
  const filtered = customData.filter((item) => item.id !== id);
  saveCustomData(filtered);
}

// 获取自定义排序
export function getCustomOrder(): string[] | null {
  try {
    const order = localStorage.getItem(STORAGE_KEYS.CUSTOM_ORDER);
    return order ? JSON.parse(order) : null;
  } catch {
    return null;
  }
}

// 保存自定义排序
export function saveCustomOrder(order: string[]): void {
  localStorage.setItem(STORAGE_KEYS.CUSTOM_ORDER, JSON.stringify(order));
}

// 清除自定义排序
export function clearCustomOrder(): void {
  localStorage.removeItem(STORAGE_KEYS.CUSTOM_ORDER);
}

// 获取网站状态缓存
export function getStatusCache(): Record<string, { status: string; responseTime?: number; lastChecked: string }> {
  try {
    const cache = localStorage.getItem(STORAGE_KEYS.STATUS_CACHE);
    return cache ? JSON.parse(cache) : {};
  } catch {
    return {};
  }
}

// 更新网站状态
export function updateSiteStatus(
  id: string,
  status: { status: string; responseTime?: number }
): void {
  const cache = getStatusCache();
  cache[id] = {
    ...status,
    lastChecked: new Date().toISOString(),
  };
  localStorage.setItem(STORAGE_KEYS.STATUS_CACHE, JSON.stringify(cache));
}

// 获取最后检测时间
export function getLastCheckTime(): string | null {
  return localStorage.getItem(STORAGE_KEYS.LAST_CHECK);
}

// 更新最后检测时间
export function updateLastCheckTime(): void {
  localStorage.setItem(STORAGE_KEYS.LAST_CHECK, new Date().toISOString());
}

// 获取收藏列表
export function getFavorites(): string[] {
  try {
    const favorites = localStorage.getItem(STORAGE_KEYS.FAVORITES);
    return favorites ? JSON.parse(favorites) : [];
  } catch {
    return [];
  }
}

// 切换收藏状态
export function toggleFavorite(id: string): boolean {
  const favorites = getFavorites();
  const index = favorites.indexOf(id);

  if (index > -1) {
    // 取消收藏
    favorites.splice(index, 1);
    localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favorites));
    return false;
  } else {
    // 添加收藏
    favorites.push(id);
    localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favorites));
    return true;
  }
}

// 检查是否已收藏
export function isFavorite(id: string): boolean {
  return getFavorites().includes(id);
}

// 记录浏览（每个会话中同一网站只计一次）
export function recordView(id: string): void {
  // 检查当前会话是否已经查看过该网站
  const sessionKey = `session_viewed_${id}`;
  const alreadyViewedInSession = sessionStorage.getItem(sessionKey);

  if (alreadyViewedInSession) {
    return; // 当前会话已查看，不重复计数
  }

  // 标记当前会话已查看
  sessionStorage.setItem(sessionKey, 'true');

  // 增加总浏览次数
  const views = getViewCounts();
  views[id] = (views[id] || 0) + 1;
  localStorage.setItem(STORAGE_KEYS.VIEWS, JSON.stringify(views));
}

// 获取所有网站的浏览次数
export function getViewCounts(): Record<string, number> {
  try {
    const views = localStorage.getItem(STORAGE_KEYS.VIEWS);
    const parsed = views ? JSON.parse(views) : {};
    return typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

// 获取单个网站的浏览次数
export function getViewCount(id: string): number {
  const views = getViewCounts();
  return views[id] || 0;
}

// 获取点赞的 ID 列表
export function getLikedIds(): string[] {
  try {
    const likes = localStorage.getItem(STORAGE_KEYS.LIKES);
    const parsed = likes ? JSON.parse(likes) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

// 切换点赞
export function toggleLike(id: string): boolean {
  const likedIds = getLikedIds();
  const index = likedIds.indexOf(id);

  if (index > -1) {
    likedIds.splice(index, 1);
    localStorage.setItem(STORAGE_KEYS.LIKES, JSON.stringify(likedIds));
    return false;
  } else {
    likedIds.push(id);
    localStorage.setItem(STORAGE_KEYS.LIKES, JSON.stringify(likedIds));
    return true;
  }
}

// 导出所有数据为 JSON
export function exportAllData(): string {
  const data = {
    customData: getCustomData(),
    customOrder: getCustomOrder(),
    statusCache: getStatusCache(),
    favorites: getFavorites(),
    lastCheck: getLastCheckTime(),
    exportDate: new Date().toISOString(),
  };
  return JSON.stringify(data, null, 2);
}

// 从 JSON 导入数据
export function importAllData(jsonString: string): void {
  try {
    const data = JSON.parse(jsonString);
    if (data.customData) saveCustomData(data.customData);
    if (data.customOrder) saveCustomOrder(data.customOrder);
    if (data.statusCache) localStorage.setItem(STORAGE_KEYS.STATUS_CACHE, JSON.stringify(data.statusCache));
    if (data.favorites) localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(data.favorites));
    if (data.lastCheck) localStorage.setItem(STORAGE_KEYS.LAST_CHECK, data.lastCheck);
  } catch (error) {
    console.error('Failed to import data:', error);
    throw new Error('Invalid data format');
  }
}

// 重置所有数据
export function resetAllData(): void {
  Object.values(STORAGE_KEYS).forEach((key) => {
    localStorage.removeItem(key);
  });
}
