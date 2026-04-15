"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import {
  Search,
  Compass,
  Plus,
  Grid3X3,
  List,
  BarChart3,
  Download,
  Upload,
  RotateCcw,
  Eye,
  Globe,
} from "lucide-react";
import { useI18n } from "@/contexts/i18n-context";
import { NAV_DATA, getSortedNavData, getAllTags } from "@/lib/nav-data";
import {
  CustomNavItem,
  getCustomData,
  saveCustomData,
  addCustomSite,
  updateCustomSite,
  deleteCustomSite,
  getCustomOrder,
  saveCustomOrder,
  clearCustomOrder,
  getStatusCache,
  updateSiteStatus,
  getLastCheckTime,
  updateLastCheckTime,
  getFavorites,
  toggleFavorite,
  isFavorite,
  recordView,
  getLikedIds,
  toggleLike,
  exportAllData,
  importAllData,
  getViewCount,
  getViewCounts,
} from "@/lib/nav-storage";
import {
  checkWebsiteStatus,
  checkWebsitesBatch,
  shouldAutoCheck,
  formatResponseTime,
  isValidUrl,
} from "@/lib/nav-utils";
import { SortableNavCard } from "@/components/sortable-nav-card";
import { NavCardEditor } from "@/components/nav-card-editor";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

const ITEMS_PER_PAGE = 8;

export default function SiteNavPage() {
  const { t } = useI18n();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [displayCount, setDisplayCount] = useState(ITEMS_PER_PAGE);
  const [likedIds, setLikedIds] = useState<string[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [viewCounts, setViewCounts] = useState<Record<string, number>>({});

  // 编辑和拖拽相关状态
  const [isEditing, setIsEditing] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [editingItem, setEditingItem] = useState<CustomNavItem | null>(null);
  const [checkingId, setCheckingId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showStats, setShowStats] = useState(false);
  const [customItems, setCustomItems] = useState<CustomNavItem[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // 初始化加载
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // 确保在客户端执行
    if (typeof window !== "undefined") {
      try {
        const liked = getLikedIds();
        const favorites = getFavorites();
        const custom = getCustomData();

        // 确保是数组类型
        setLikedIds(Array.isArray(liked) ? liked : []);
        setFavoriteIds(Array.isArray(favorites) ? favorites : []);
        setCustomItems(Array.isArray(custom) ? custom : []);
      } catch (error) {
        console.error("Failed to load data from localStorage:", error);
        setLikedIds([]);
        setFavoriteIds([]);
        setCustomItems([]);
      }
    }
  }, []);

  // 拖拽传感器
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // 合并默认数据和自定义数据
  const allItems = useMemo(() => {
    const customIds = new Set(customItems.map((item) => item.id));
    const defaultItems = NAV_DATA.filter((item) => !customIds.has(item.id));
    return [...defaultItems, ...customItems];
  }, [customItems]);

  // 获取所有唯一标签
  const allTags = useMemo(() => getAllTags(), []);

  // 应用自定义排序
  const sortedData = useMemo(() => {
    const customOrder = getCustomOrder();
    if (!customOrder || customOrder.length === 0) {
      return getSortedNavData(allItems);
    }

    // 按自定义顺序排序
    const orderMap = new Map(customOrder.map((id, index) => [id, index]));
    return [...allItems].sort((a, b) => {
      const indexA = orderMap.get(a.id);
      const indexB = orderMap.get(b.id);

      if (indexA !== undefined && indexB !== undefined) {
        return indexA - indexB;
      }
      if (indexA !== undefined) return -1;
      if (indexB !== undefined) return 1;

      // 未排序的按 views 降序
      const viewsA = a.stats?.views || 0;
      const viewsB = b.stats?.views || 0;
      return viewsB - viewsA;
    });
  }, [allItems]);

  // 应用状态缓存和统计数据
  const itemsWithStatus = useMemo(() => {
    const statusCache = getStatusCache();
    return sortedData.map((item) => {
      const viewCount = getViewCount(item.id);
      const likedIdsArray = Array.isArray(likedIds) ? likedIds : [];
      // 确保点赞数不为负数：基础值至少为0，如果用户点了赞则+1
      const baseLikes = Math.max(0, item.stats?.likes || 0);
      const likeCount = likedIdsArray.includes(item.id)
        ? baseLikes + 1
        : baseLikes;

      return {
        ...item,
        status: (statusCache[item.id]?.status || "unknown") as "online" | "offline" | "unknown",
        lastChecked: statusCache[item.id]?.lastChecked,
        responseTime: statusCache[item.id]?.responseTime,
        stats: {
          ...item.stats,
          // 确保查看数和点赞数都不为负数，默认值为0
          views: Math.max(0, viewCount > 0 ? viewCount : (item.stats?.views || 0)),
          likes: Math.max(0, likeCount),
        },
      };
    });
  }, [sortedData, likedIds, viewCounts]);

  // 过滤数据
  const filteredData = useMemo(() => {
    return itemsWithStatus.filter((item) => {
      const matchSearch =
        !searchTerm ||
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchTag = !selectedTag || item.tags.includes(selectedTag);

      return matchSearch && matchTag;
    });
  }, [itemsWithStatus, searchTerm, selectedTag]);

  // 显示的数据（分页）
  const displayedData = filteredData.slice(0, displayCount);

  // 统计数据
  const stats = useMemo(() => {
    const statusCache = getStatusCache();
    const total = allItems.length;
    const online = Object.values(statusCache).filter((s) => s.status === "online").length;
    const offline = Object.values(statusCache).filter((s) => s.status === "offline").length;
    const unknown = total - online - offline;

    return { total, online, offline, unknown, custom: customItems.length };
  }, [allItems, customItems]);

  // 处理拖拽结束
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = filteredData.findIndex((item) => item.id === active.id);
      const newIndex = filteredData.findIndex((item) => item.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        const newItems = arrayMove(filteredData, oldIndex, newIndex);
        const newOrder = newItems.map((item) => item.id);
        saveCustomOrder(newOrder);

        // 触发重新渲染
        setCustomItems([...customItems]);
      }
    }
  };

  // 处理浏览
  const handleView = (id: string) => {
    recordView(id);
    // 更新查看次数状态以触发重新渲染
    setViewCounts(getViewCounts());
  };

  // 处理点赞
  const handleLike = (id: string) => {
    const isLiked = toggleLike(id);
    setLikedIds((prev) => {
      if (isLiked) {
        return [...prev, id];
      } else {
        return prev.filter((likedId) => likedId !== id);
      }
    });
  };

  // 处理收藏
  const handleFavorite = (id: string) => {
    const isFavorited = toggleFavorite(id);
    setFavoriteIds((prev) => {
      if (isFavorited) {
        return [...prev, id];
      } else {
        return prev.filter((favId) => favId !== id);
      }
    });
  };

  // 编辑网站
  const handleEdit = (item: CustomNavItem) => {
    setEditingItem(item);
    setShowEditor(true);
  };

  // 保存网站
  const handleSave = (item: CustomNavItem) => {
    if (editingItem) {
      // 更新现有网站
      if (editingItem.isCustom) {
        // 如果是自定义网站，直接更新
        updateCustomSite(item.id, item);
      } else {
        // 如果是默认网站，将其转换为自定义网站并更新
        addCustomSite({ ...item, isCustom: true });
      }
      setCustomItems(getCustomData());
    } else {
      // 添加新网站（带去重检查）
      const result = addCustomSite(item);
      if (!result.success) {
        alert(result.message);
        return; // 不关闭编辑器，让用户修改
      }
      setCustomItems(getCustomData());
    }
    setEditingItem(null);
    setShowEditor(false);
  };

  // 删除网站
  const handleDelete = (id: string) => {
    deleteCustomSite(id);
    setCustomItems(getCustomData());
  };

  // 复制网站
  const handleDuplicate = (item: CustomNavItem) => {
    const newItem: CustomNavItem = {
      ...item,
      id: `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: `${item.name} (副本)`,
      isCustom: true,
    };
    addCustomSite(newItem);
    setCustomItems(getCustomData());
  };

  // 检测单个网站
  const handleCheck = async (id: string) => {
    const item = filteredData.find((item) => item.id === id);
    if (!item) return;

    setCheckingId(id);
    const result = await checkWebsiteStatus(item.url);
    updateSiteStatus(id, result);
    setCheckingId(null);

    // 刷新状态显示
    setCustomItems([...customItems]);
  };

  // 批量检测所有网站
  const handleCheckAll = async () => {
    const urls = filteredData.map((item) => ({ id: item.id, url: item.url }));
    const results = await checkWebsitesBatch(urls);

    results.forEach((result, id) => {
      updateSiteStatus(id, result);
    });

    updateLastCheckTime();
    setCustomItems([...customItems]);
  };

  // 恢复默认排序
  const handleResetOrder = () => {
    clearCustomOrder();
    setCustomItems([...customItems]);
  };

  // 导出数据
  const handleExport = () => {
    const data = exportAllData();
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `site-nav-export-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // 导入数据
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      try {
        importAllData(text);
        setCustomItems(getCustomData());
        setFavoriteIds(getFavorites());
        alert("数据导入成功！");
      } catch (error) {
        alert("数据导入失败，请检查文件格式");
      }
    };
    reader.readAsText(file);
  };

  // 自动检测
  useEffect(() => {
    const lastCheck = getLastCheckTime();
    if (shouldAutoCheck(lastCheck) && filteredData.length > 0) {
      handleCheckAll();
    }
  }, []);

  // 使用 IntersectionObserver 实现滚动自动加载
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && displayCount < filteredData.length) {
          // 当加载更多元素进入视口时，自动加载更多内容
          setDisplayCount((prev) => prev + ITEMS_PER_PAGE);
        }
      },
      {
        root: null, // 使用视口作为根
        rootMargin: '200px', // 提前200px开始加载
        threshold: 0, // 只要有1像素可见就触发
      }
    );

    const currentRef = loadMoreRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [displayCount, filteredData.length]);

  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-12 md:py-16 px-4">
        <div className="max-w-6xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium">
            <Compass className="h-4 w-4" />
            {t("sitenav.pageTitle")}
          </div>

          <h1 className="text-3xl md:text-5xl font-bold text-foreground leading-tight">
            {t("sitenav.pageTitle")}
          </h1>

          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t("sitenav.pageSubtitle")}
          </p>
        </div>
      </section>

      {/* 工具栏 */}
      <section className="px-4 pb-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            {/* 左侧：统计和视图切换 */}
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => setShowStats(!showStats)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-card hover:bg-accent transition-colors text-sm whitespace-nowrap"
              >
                <BarChart3 className="h-4 w-4" />
                <span>{stats.total} 个网站</span>
              </button>

              <button
                onClick={handleCheckAll}
                className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-card hover:bg-accent transition-colors text-sm whitespace-nowrap"
              >
                <Globe className="h-4 w-4" />
                <span>检测全部</span>
              </button>

              {/* 视图切换 */}
              <div className="flex items-center border border-border rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 transition-colors ${
                    viewMode === "grid" ? "bg-accent" : "bg-card hover:bg-accent/50"
                  }`}
                  aria-label="网格视图"
                >
                  <Grid3X3 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 transition-colors ${
                    viewMode === "list" ? "bg-accent" : "bg-card hover:bg-accent/50"
                  }`}
                  aria-label="列表视图"
                >
                  <List className="h-4 w-4" />
                </button>
              </div>

              {/* 编辑模式 */}
              <button
                onClick={() => setIsEditing(!isEditing)}
                className={`px-3 py-2 rounded-lg border transition-colors text-sm whitespace-nowrap ${
                  isEditing
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border bg-card hover:bg-accent"
                }`}
              >
                {isEditing ? "完成编辑" : "编辑排序"}
              </button>
            </div>

            {/* 右侧：导入导出 */}
            <div className="flex items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
                aria-label="导入数据文件"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-card hover:bg-accent transition-colors"
              >
                <Upload className="h-4 w-4" />
                <span className="text-sm hidden sm:inline">导入</span>
              </button>
              <button
                onClick={handleExport}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-card hover:bg-accent transition-colors"
              >
                <Download className="h-4 w-4" />
                <span className="text-sm hidden sm:inline">导出</span>
              </button>
              <button
                onClick={() => {
                  setEditingItem(null);
                  setShowEditor(true);
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span className="text-sm hidden sm:inline">添加网站</span>
              </button>
            </div>
          </div>

          {/* 统计面板 */}
          {showStats && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6 p-4 rounded-xl border border-border bg-card">
              <div className="text-center">
                <div className="text-2xl font-bold">{stats.total}</div>
                <div className="text-xs text-muted-foreground">总数</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-500">{stats.online}</div>
                <div className="text-xs text-muted-foreground">在线</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-500">{stats.offline}</div>
                <div className="text-xs text-muted-foreground">离线</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-500">{stats.unknown}</div>
                <div className="text-xs text-muted-foreground">未检测</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-500">{stats.custom}</div>
                <div className="text-xs text-muted-foreground">自定义</div>
              </div>
            </div>
          )}

          {/* 排序控制 */}
          {isEditing && (
            <div className="flex items-center justify-between mb-6 p-3 rounded-lg bg-accent/50 border border-border">
              <span className="text-sm text-muted-foreground">
                拖拽卡片可调整顺序，点击左侧手柄拖动
              </span>
              <button
                onClick={handleResetOrder}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm hover:bg-accent transition-colors"
              >
                <RotateCcw className="h-4 w-4" />
                恢复默认排序
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Search and Filter */}
      <section className="px-4 pb-8">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Search Box */}
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              type="text"
              placeholder={t("sitenav.searchPlaceholder")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
            />
          </div>

          {/* Tag Filter */}
          <div className="flex flex-wrap gap-2 justify-center">
            <button
              onClick={() => setSelectedTag(null)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedTag === null
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {t("sitenav.allTags")}
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedTag === tag
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Navigation Cards */}
      <section className="px-4 pb-16">
        <div className="max-w-6xl mx-auto">
          {!isClient ? (
            // 服务端渲染时显示加载状态
            <div className="text-center py-16">
              <div className="animate-pulse text-muted-foreground">加载中...</div>
            </div>
          ) : displayedData.length > 0 ? (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={displayedData.map((item) => item.id)}
                strategy={verticalListSortingStrategy}
              >
                <div
                  className={
                    viewMode === "grid"
                      ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                      : "flex flex-col gap-4"
                  }
                >
                  {displayedData.map((item) => (
                    <SortableNavCard
                      key={item.id}
                      item={item}
                      isEditing={isEditing}
                      isLiked={likedIds.includes(item.id)}
                      isFavorite={favoriteIds.includes(item.id)}
                      onLike={handleLike}
                      onView={handleView}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      onDuplicate={handleDuplicate}
                      onFavorite={handleFavorite}
                      onCheck={handleCheck}
                      checking={checkingId === item.id}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          ) : (
            <div className="text-center py-16">
              <Compass className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-lg text-muted-foreground">
                {t("sitenav.noResults")}
              </p>
            </div>
          )}

          {/* 加载更多指示器（使用 IntersectionObserver 自动触发） */}
          {displayCount < filteredData.length && (
            <div ref={loadMoreRef} className="flex justify-center mt-8 py-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                <span className="text-sm">{t("sitenav.loading") || "加载中..."}</span>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 编辑器对话框 */}
      <NavCardEditor
        isOpen={showEditor}
        onClose={() => {
          setShowEditor(false);
          setEditingItem(null);
        }}
        onSave={handleSave}
        editItem={editingItem}
        existingTags={allTags}
      />
    </main>
  );
}
