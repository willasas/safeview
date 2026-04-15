"use client";

import { ExternalLink, Eye, Heart } from "lucide-react";
import { NavItem, getTagColor } from "@/lib/nav-data";

interface NavCardProps {
  item: NavItem;
  onLike?: (id: string) => void;
  onView?: (id: string) => void;
  isLiked?: boolean;
}

export function NavCard({ item, onLike, onView, isLiked }: NavCardProps) {
  const handleCardClick = () => {
    onView?.(item.id);
    window.open(item.url, "_blank", "noopener,noreferrer");
  };

  const handleLikeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onLike?.(item.id);
  };

  const formatNumber = (num: number): string => {
    if (num >= 10000) {
      return (num / 10000).toFixed(1) + "w";
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + "k";
    }
    return num.toString();
  };

  return (
    <div
      onClick={handleCardClick}
      className="group relative rounded-xl border border-border bg-card p-4 hover:border-primary/50 hover:shadow-lg transition-all duration-200 cursor-pointer hover:-translate-y-1"
    >
      {/* 顶部操作按钮 - 已移至 SortableNavCard */}
      {/* <div className="absolute top-3 right-3 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        {onLike && (
          <button
            onClick={handleLikeClick}
            className={`p-1.5 rounded-full transition-colors ${
              isLiked
                ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                : "bg-muted text-muted-foreground hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
            }`}
            aria-label={isLiked ? "取消点赞" : "点赞"}
          >
            <Heart
              className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`}
            />
          </button>
        )}
      </div> */}

      {/* 图标和内容 */}
      <div className="flex items-start gap-3">
        {/* 图标 */}
        <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-2xl">
          {item.icon}
        </div>

        {/* 信息 */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground text-base mb-1 line-clamp-1">
            {item.name}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {item.description}
          </p>

          {/* 标签 */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {item.tags.map((tag) => (
              <span
                key={tag}
                className={`px-2 py-0.5 rounded-full text-xs font-medium ${getTagColor(
                  tag
                )}`}
              >
                {tag}
              </span>
            ))}
          </div>

          {/* 统计数据 */}
          {item.stats && (
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Eye className="h-3.5 w-3.5" />
                <span>{formatNumber(Math.max(0, item.stats.views || 0))}</span>
              </div>
              {item.stats.likes !== undefined && (
                <div className="flex items-center gap-1">
                  <Heart
                    className={`h-3.5 w-3.5 ${
                      isLiked ? "fill-red-500 text-red-500" : ""
                    }`}
                  />
                  <span>{formatNumber(Math.max(0, item.stats.likes))}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 悬停时的渐变遮罩 */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
    </div>
  );
}
