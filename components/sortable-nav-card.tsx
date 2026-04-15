"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, MoreVertical, Edit, Trash2, Copy, Star, StarOff, RefreshCw, Globe, Heart } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { NavCard } from "./nav-card";
import { CustomNavItem } from "@/lib/nav-storage";
import { getTagColor } from "@/lib/nav-data";

interface SortableNavCardProps {
  item: CustomNavItem;
  isEditing: boolean;
  isLiked?: boolean;
  isFavorite?: boolean;
  onLike?: (id: string) => void;
  onView?: (id: string) => void;
  onEdit?: (item: CustomNavItem) => void;
  onDelete?: (id: string) => void;
  onDuplicate?: (item: CustomNavItem) => void;
  onFavorite?: (id: string) => void;
  onCheck?: (id: string) => void;
  checking?: boolean;
}

export function SortableNavCard({
  item,
  isEditing,
  isLiked,
  isFavorite,
  onLike,
  onView,
  onEdit,
  onDelete,
  onDuplicate,
  onFavorite,
  onCheck,
  checking,
}: SortableNavCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // 点击外部关闭菜单
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    }

    if (showMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showMenu]);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const getStatusColor = () => {
    if (!item.status || item.status === "unknown") return "bg-gray-400";
    if (item.status === "online") return "bg-green-500";
    if (item.status === "offline") return "bg-red-500";
    return "bg-gray-400";
  };

  const getStatusText = () => {
    if (!item.status || item.status === "unknown") return "未检测";
    if (item.status === "online") return "在线";
    if (item.status === "offline") return "离线";
    return "未知";
  };

  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(!showMenu);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(false);
    onEdit?.(item);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(false);
    if (confirm(`确定要删除 "${item.name}" 吗？`)) {
      onDelete?.(item.id);
    }
  };

  const handleDuplicate = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(false);

    // 复制链接到剪贴板
    try {
      await navigator.clipboard.writeText(item.url);
      // 显示成功提示（可以使用 toast，这里简单用 alert）
      const originalText = e.currentTarget.innerHTML;
      e.currentTarget.innerHTML = '<span class="text-green-600">已复制!</span>';
      setTimeout(() => {
        e.currentTarget.innerHTML = originalText;
      }, 1500);
    } catch (err) {
      console.error('复制失败:', err);
      alert('复制失败，请手动复制');
    }
  };

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFavorite?.(item.id);
  };

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    onLike?.(item.id);
  };

  const handleCheck = (e: React.MouseEvent) => {
    e.stopPropagation();
    onCheck?.(item.id);
  };

  return (
    <div ref={setNodeRef} style={style} className="relative">
      <div
        className={`group relative rounded-xl border border-border bg-card transition-all duration-200 ${
          isDragging
            ? "shadow-2xl scale-105 z-50"
            : "hover:border-primary/50 hover:shadow-lg hover:-translate-y-1"
        }`}
      >
        {/* 拖拽手柄 */}
        {isEditing && (
          <div
            {...attributes}
            {...listeners}
            className="absolute left-2 top-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing z-10 p-2 rounded-lg hover:bg-accent transition-colors"
          >
            <GripVertical className="h-5 w-5 text-muted-foreground" />
          </div>
        )}

        {/* 网站状态指示器 */}
        {item.status && item.status !== "unknown" && (
          <div className="absolute top-3 left-3 z-10">
            <div className="relative">
              <div className={`w-3 h-3 rounded-full ${getStatusColor()}`} />
              <div
                className={`absolute inset-0 w-3 h-3 rounded-full ${getStatusColor()} animate-ping opacity-75`}
              />
            </div>
          </div>
        )}

        {/* 点赞按钮 */}
        {onLike && isLiked !== undefined && (
          <button
            onClick={handleLike}
            className={`absolute top-3 right-20 z-50 p-1.5 rounded-full transition-colors ${
              isLiked
                ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                : "bg-muted text-muted-foreground hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 opacity-0 group-hover:opacity-100"
            }`}
            aria-label={isLiked ? "取消点赞" : "点赞"}
          >
            <Heart className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
          </button>
        )}

        {/* 收藏按钮 */}
        {onFavorite && isFavorite !== undefined && (
          <button
            onClick={handleFavorite}
            className={`absolute top-3 right-12 z-50 p-1.5 rounded-full transition-colors ${
              isFavorite
                ? "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400"
                : "bg-muted text-muted-foreground hover:bg-yellow-50 hover:text-yellow-600 dark:hover:bg-yellow-900/20 opacity-0 group-hover:opacity-100"
            }`}
            aria-label={isFavorite ? "取消收藏" : "收藏"}
          >
            {isFavorite ? (
              <Star className="h-4 w-4 fill-current" />
            ) : (
              <StarOff className="h-4 w-4" />
            )}
          </button>
        )}

        {/* 操作菜单按钮 */}
        <div ref={menuRef} className="absolute top-3 right-3 z-50">
          <button
            onClick={handleMenuClick}
            className="p-1.5 rounded-full bg-muted text-muted-foreground hover:bg-accent transition-colors opacity-0 group-hover:opacity-100"
            aria-label="更多操作"
          >
            <MoreVertical className="h-4 w-4" />
          </button>

          {/* 下拉菜单 */}
          {showMenu && (
            <div
              className="absolute right-0 top-8 w-48 bg-card border border-border rounded-lg shadow-lg z-50 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={handleEdit}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-accent transition-colors"
              >
                <Edit className="h-4 w-4" />
                编辑
              </button>
              <button
                onClick={handleDuplicate}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-accent transition-colors"
              >
                <Copy className="h-4 w-4" />
                复制链接
              </button>
              <button
                onClick={handleCheck}
                disabled={checking}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-accent transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 ${checking ? "animate-spin" : ""}`} />
                {checking ? "检测中..." : "检测可用性"}
              </button>
              {onDelete && item.isCustom && (
                <button
                  onClick={handleDelete}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                  删除
                </button>
              )}
            </div>
          )}
        </div>

        {/* 卡片内容 */}
        <div className={isEditing ? "pl-12" : ""}>
          <NavCard
            item={item}
            onLike={onLike}
            onView={onView}
            isLiked={isLiked}
          />
        </div>

        {/* 检测时间信息 */}
        {item.lastChecked && (
          <div className="px-4 pb-3 text-xs text-muted-foreground">
            最后检测: {new Date(item.lastChecked).toLocaleString("zh-CN")}
            {item.responseTime && ` | 响应: ${item.responseTime}ms`}
          </div>
        )}
      </div>
    </div>
  );
}
