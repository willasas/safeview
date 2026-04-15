"use client";

import { useState, useEffect } from "react";
import { X, Save, Plus, Tag } from "lucide-react";
import { CustomNavItem } from "@/lib/nav-storage";
import { generateId, isValidUrl } from "@/lib/nav-utils";

interface NavCardEditorProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: CustomNavItem) => void;
  editItem?: CustomNavItem | null;
  existingTags: string[];
}

const COMMON_EMOJIS = [
  "💬", "🤖", "🧠", "🎨", "🎬", "✍️", "📝",
  "📊", "💻", "🖱️", "🌐", "🚀", "⭐", "🔍", "💡",
  "📱", "🎮", "🎯", "🎪", "🎭", "🎸", "🎺", "🎻",
  "⚙️", "🛠️", "💾", "📦", "🎁", "✨", "🌟",
];

export function NavCardEditor({
  isOpen,
  onClose,
  onSave,
  editItem,
  existingTags,
}: NavCardEditorProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [url, setUrl] = useState("");
  const [icon, setIcon] = useState("🌐");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // 当编辑项变化时更新表单
  useEffect(() => {
    if (editItem) {
      setName(editItem.name || "");
      setDescription(editItem.description || "");
      setUrl(editItem.url || "");
      setIcon(editItem.icon || "🌐");
      setTags(editItem.tags || []);
    } else {
      // 新增模式，重置表单
      setName("");
      setDescription("");
      setUrl("");
      setIcon("🌐");
      setTags([]);
    }
    setErrors({});
  }, [editItem, isOpen]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = "网站名称不能为空";
    }

    if (!description.trim()) {
      newErrors.description = "描述不能为空";
    }

    if (!url.trim()) {
      newErrors.url = "URL 不能为空";
    } else if (!isValidUrl(url)) {
      newErrors.url = "请输入有效的 URL（以 http:// 或 https:// 开头）";
    }

    if (tags.length === 0) {
      newErrors.tags = "至少添加一个标签";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;

    const item: CustomNavItem = {
      id: editItem?.id || generateId(),
      name: name.trim(),
      description: description.trim(),
      url: url.trim(),
      icon,
      tags,
      isCustom: !editItem || editItem.isCustom,
      stats: editItem?.stats || { views: 0, likes: 0 },
    };

    onSave(item);
    onClose();
  };

  const handleAddTag = () => {
    const tag = tagInput.trim();
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleSelectEmoji = (emoji: string) => {
    setIcon(emoji);
    setShowEmojiPicker(false);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    // 只有点击背景层才关闭，点击内容区域不关闭
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-card border border-border rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative">
        {/* 头部 */}
        <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-xl font-semibold">
            {editItem ? "编辑网站" : "新增网站"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-accent transition-colors"
            aria-label="关闭"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* 表单内容 */}
        <div className="p-6 space-y-6">
          {/* 网站名称 */}
          <div>
            <label className="block text-sm font-medium mb-2">
              网站名称 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`w-full px-4 py-2 rounded-lg border ${
                errors.name ? "border-red-500" : "border-border"
              } bg-background focus:outline-none focus:ring-2 focus:ring-primary/50`}
              placeholder="例如：ChatGPT"
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1">{errors.name}</p>
            )}
          </div>

          {/* 描述 */}
          <div>
            <label className="block text-sm font-medium mb-2">
              描述 <span className="text-red-500">*</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className={`w-full px-4 py-2 rounded-lg border ${
                errors.description ? "border-red-500" : "border-border"
              } bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none`}
              placeholder="简短描述这个网站的功能和特色"
            />
            {errors.description && (
              <p className="text-red-500 text-xs mt-1">{errors.description}</p>
            )}
          </div>

          {/* URL */}
          <div>
            <label className="block text-sm font-medium mb-2">
              网站链接 <span className="text-red-500">*</span>
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className={`w-full px-4 py-2 rounded-lg border ${
                errors.url ? "border-red-500" : "border-border"
              } bg-background focus:outline-none focus:ring-2 focus:ring-primary/50`}
              placeholder="https://example.com"
            />
            {errors.url && (
              <p className="text-red-500 text-xs mt-1">{errors.url}</p>
            )}
          </div>

          {/* 图标选择 */}
          <div>
            <label className="block text-sm font-medium mb-2">图标</label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="w-16 h-16 rounded-xl border border-border bg-background flex items-center justify-center text-3xl hover:border-primary/50 transition-colors"
              >
                {icon}
              </button>

              {/* Emoji 选择器 */}
              {showEmojiPicker && (
                <div className="absolute top-full left-0 mt-2 p-3 bg-card border border-border rounded-xl shadow-lg z-10 grid grid-cols-8 gap-2 max-w-xs">
                  {COMMON_EMOJIS.map((emoji, index) => (
                    <button
                      key={`${emoji}-${index}`}
                      type="button"
                      onClick={() => handleSelectEmoji(emoji)}
                      className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl hover:bg-accent transition-colors ${
                        icon === emoji ? "bg-primary/20 ring-2 ring-primary" : ""
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              点击图标选择，或使用 Emoji 作为网站图标
            </p>
          </div>

          {/* 标签 */}
          <div>
            <label className="block text-sm font-medium mb-2">
              标签 <span className="text-red-500">*</span>
            </label>

            {/* 已添加的标签 */}
            <div className="flex flex-wrap gap-2 mb-3">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm"
                >
                  <Tag className="h-3 w-3" />
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-1 hover:text-red-500 transition-colors"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>

            {/* 标签输入 */}
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagInputKeyDown}
                className="flex-1 px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="输入标签后按回车添加"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                aria-label="添加标签"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            {/* 推荐标签 */}
            {existingTags.length > 0 && (
              <div className="mt-3">
                <p className="text-xs text-muted-foreground mb-2">推荐标签：</p>
                <div className="flex flex-wrap gap-2">
                  {existingTags.slice(0, 8).map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => {
                        if (!tags.includes(tag)) {
                          setTags([...tags, tag]);
                        }
                      }}
                      className={`px-3 py-1 rounded-full text-xs transition-colors ${
                        tags.includes(tag)
                          ? "bg-primary/10 text-primary"
                          : "bg-muted text-muted-foreground hover:bg-accent"
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {errors.tags && (
              <p className="text-red-500 text-xs mt-1">{errors.tags}</p>
            )}
          </div>
        </div>

        {/* 底部按钮 */}
        <div className="sticky bottom-0 bg-card border-t border-border px-6 py-4 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-lg border border-border hover:bg-accent transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {editItem ? "保存修改" : "添加网站"}
          </button>
        </div>
      </div>
    </div>
  );
}
