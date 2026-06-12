"use client";

import React, { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { Plus, Pencil, Trash2, Loader2, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Banner = {
  id: string;
  title: string;
  subtitle?: string | null;
  imageUrl: string;
  mobileImageUrl?: string | null;
  linkUrl?: string | null;
  linkText?: string | null;
  position: string;
  isActive: boolean;
  sortOrder: number;
};

type FormData = {
  title: string;
  subtitle: string;
  imageUrl: string;
  mobileImageUrl: string;
  linkUrl: string;
  linkText: string;
  position: string;
  isActive: boolean;
  sortOrder: number;
};

const DEFAULT_FORM: FormData = {
  title: "",
  subtitle: "",
  imageUrl: "",
  mobileImageUrl: "",
  linkUrl: "",
  linkText: "",
  position: "hero",
  isActive: true,
  sortOrder: 0,
};

const POSITIONS = [
  { value: "hero", label: "Hero Banner" },
  { value: "promotional", label: "Promotional" },
  { value: "category", label: "Category" },
  { value: "sidebar", label: "Sidebar" },
];

export default function ContentPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteTitle, setDeleteTitle] = useState("");
  const [form, setForm] = useState<FormData>(DEFAULT_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadingDesktop, setUploadingDesktop] = useState(false);
  const [uploadingMobile, setUploadingMobile] = useState(false);

  const fetchBanners = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/banners");
      const data = await res.json();
      setBanners(Array.isArray(data) ? data : []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBanners();
  }, [fetchBanners]);

  const openCreate = () => {
    setEditingId(null);
    setForm(DEFAULT_FORM);
    setError(null);
    setDialogOpen(true);
  };

  const openEdit = (banner: Banner) => {
    setEditingId(banner.id);
    setForm({
      title: banner.title,
      subtitle: banner.subtitle ?? "",
      imageUrl: banner.imageUrl,
      mobileImageUrl: banner.mobileImageUrl ?? "",
      linkUrl: banner.linkUrl ?? "",
      linkText: banner.linkText ?? "",
      position: banner.position,
      isActive: banner.isActive,
      sortOrder: banner.sortOrder,
    });
    setError(null);
    setDialogOpen(true);
  };

  const handleUpload = async (
    file: File,
    field: "imageUrl" | "mobileImageUrl"
  ) => {
    const setUploading =
      field === "imageUrl" ? setUploadingDesktop : setUploadingMobile;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      if (res.ok) {
        const { url } = await res.json();
        setForm((f) => ({ ...f, [field]: url }));
      }
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.imageUrl) {
      setError("Please upload a desktop image");
      return;
    }
    setSubmitting(true);
    setError(null);
    const payload = {
      ...form,
      subtitle: form.subtitle || null,
      mobileImageUrl: form.mobileImageUrl || null,
      linkUrl: form.linkUrl || null,
      linkText: form.linkText || null,
    };
    try {
      const res = await fetch(
        editingId ? `/api/admin/banners/${editingId}` : "/api/admin/banners",
        {
          method: editingId ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message ?? "Failed");
      }
      setDialogOpen(false);
      fetchBanners();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await fetch(`/api/admin/banners/${deleteId}`, { method: "DELETE" });
      fetchBanners();
    } finally {
      setDeleteId(null);
    }
  };

  const positionLabel = (pos: string) =>
    POSITIONS.find((p) => p.value === pos)?.label ?? pos;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900">Content</h1>
          <p className="text-sm text-zinc-500 mt-0.5">
            Manage banners and promotional content
          </p>
        </div>
        <Button
          className="gap-2 bg-zinc-900 hover:bg-zinc-800"
          onClick={openCreate}
        >
          <Plus className="h-4 w-4" />
          Add Banner
        </Button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-zinc-50 border-b border-zinc-100 text-xs text-zinc-500 uppercase tracking-wide">
                  <th className="px-5 py-3 text-left">Preview</th>
                  <th className="px-5 py-3 text-left">Title</th>
                  <th className="px-5 py-3 text-left">Position</th>
                  <th className="px-5 py-3 text-left">Status</th>
                  <th className="px-5 py-3 text-left">Sort Order</th>
                  <th className="px-5 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {banners.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-5 py-16 text-center text-zinc-400"
                    >
                      No banners yet. Add your first banner.
                    </td>
                  </tr>
                ) : (
                  banners.map((banner) => (
                    <tr
                      key={banner.id}
                      className="border-t border-zinc-100 hover:bg-zinc-50 transition-colors"
                    >
                      <td className="px-5 py-3.5">
                        <div className="h-14 w-24 rounded-lg overflow-hidden bg-zinc-100 flex-shrink-0">
                          <Image
                            src={banner.imageUrl}
                            alt={banner.title}
                            width={96}
                            height={56}
                            className="object-cover h-full w-full"
                          />
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="font-medium text-zinc-900">
                          {banner.title}
                        </p>
                        {banner.subtitle && (
                          <p className="text-xs text-zinc-400 truncate max-w-[200px] mt-0.5">
                            {banner.subtitle}
                          </p>
                        )}
                        {banner.linkUrl && (
                          <p className="text-xs text-blue-500 truncate max-w-[200px] mt-0.5">
                            {banner.linkUrl}
                          </p>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border bg-violet-50 text-violet-700 border-violet-200">
                          {positionLabel(banner.position)}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border ${
                            banner.isActive
                              ? "bg-green-50 text-green-700 border-green-200"
                              : "bg-zinc-100 text-zinc-500 border-zinc-200"
                          }`}
                        >
                          {banner.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-zinc-600 font-mono text-xs">
                        {banner.sortOrder}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => openEdit(banner)}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                            onClick={() => {
                              setDeleteId(banner.id);
                              setDeleteTitle(banner.title);
                            }}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Edit Banner" : "Add Banner"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-3 py-2 text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                Title *
              </label>
              <Input
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="e.g. Summer Collection 2026"
                required
                className="h-9"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                Subtitle
              </label>
              <Textarea
                value={form.subtitle}
                onChange={(e) =>
                  setForm((f) => ({ ...f, subtitle: e.target.value }))
                }
                placeholder="Short tagline or description..."
                rows={2}
                className="resize-none"
              />
            </div>

            {/* Desktop Image */}
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                Desktop Image *
              </label>
              {form.imageUrl ? (
                <div className="relative group">
                  <div className="relative h-32 rounded-lg overflow-hidden bg-zinc-100">
                    <Image
                      src={form.imageUrl}
                      alt="Banner preview"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, imageUrl: "" }))}
                    className="absolute top-2 right-2 h-6 w-6 bg-red-500 text-white rounded-full flex items-center justify-center"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center h-24 border-2 border-dashed border-zinc-200 rounded-lg cursor-pointer hover:border-zinc-400 transition-colors">
                  {uploadingDesktop ? (
                    <Loader2 className="h-5 w-5 animate-spin text-zinc-400" />
                  ) : (
                    <>
                      <Upload className="h-5 w-5 text-zinc-400" />
                      <span className="text-xs text-zinc-400 mt-1">
                        Upload desktop image
                      </span>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={uploadingDesktop}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleUpload(file, "imageUrl");
                      e.target.value = "";
                    }}
                  />
                </label>
              )}
            </div>

            {/* Mobile Image */}
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                Mobile Image
              </label>
              {form.mobileImageUrl ? (
                <div className="relative group">
                  <div className="relative h-24 rounded-lg overflow-hidden bg-zinc-100">
                    <Image
                      src={form.mobileImageUrl}
                      alt="Mobile banner preview"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, mobileImageUrl: "" }))}
                    className="absolute top-2 right-2 h-6 w-6 bg-red-500 text-white rounded-full flex items-center justify-center"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center h-20 border-2 border-dashed border-zinc-200 rounded-lg cursor-pointer hover:border-zinc-400 transition-colors">
                  {uploadingMobile ? (
                    <Loader2 className="h-5 w-5 animate-spin text-zinc-400" />
                  ) : (
                    <>
                      <Upload className="h-4 w-4 text-zinc-400" />
                      <span className="text-xs text-zinc-400 mt-1">
                        Upload mobile image (optional)
                      </span>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={uploadingMobile}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleUpload(file, "mobileImageUrl");
                      e.target.value = "";
                    }}
                  />
                </label>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                  Link URL
                </label>
                <Input
                  value={form.linkUrl}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, linkUrl: e.target.value }))
                  }
                  placeholder="/collections/new"
                  className="h-9"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                  Link Text
                </label>
                <Input
                  value={form.linkText}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, linkText: e.target.value }))
                  }
                  placeholder="Shop Now"
                  className="h-9"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                  Position
                </label>
                <Select
                  value={form.position}
                  onValueChange={(val) =>
                    setForm((f) => ({ ...f, position: val }))
                  }
                >
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {POSITIONS.map((p) => (
                      <SelectItem key={p.value} value={p.value}>
                        {p.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                  Sort Order
                </label>
                <Input
                  type="number"
                  value={form.sortOrder}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      sortOrder: parseInt(e.target.value) || 0,
                    }))
                  }
                  placeholder="0"
                  className="h-9"
                  min={0}
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-1">
              <Switch
                checked={form.isActive}
                onCheckedChange={(val) =>
                  setForm((f) => ({ ...f, isActive: val }))
                }
              />
              <label className="text-sm text-zinc-700">Active</label>
            </div>

            <DialogFooter className="gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="bg-zinc-900 hover:bg-zinc-800 gap-2"
              >
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {editingId ? "Save Changes" : "Add Banner"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <AlertDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Banner</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the banner &ldquo;{deleteTitle}
              &rdquo;?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
