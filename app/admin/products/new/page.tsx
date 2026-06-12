"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, Upload, X, Loader2 } from "lucide-react";
import Image from "next/image";

function slugify(str: string) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

type Variant = {
  size: string;
  color: string;
  colorHex: string;
  sku: string;
  stock: number;
  price: number | "";
};

type ProductForm = {
  name: string;
  slug: string;
  description: string;
  categoryId: string;
  price: number | "";
  comparePrice: number | "";
  sku: string;
  material: string;
  careInstructions: string;
  isActive: boolean;
  isFeatured: boolean;
  isNewArrival: boolean;
  isBestSeller: boolean;
  isTrending: boolean;
  images: { url: string; altText: string; isPrimary: boolean }[];
  variants: Variant[];
  metaTitle: string;
  metaDescription: string;
};

type Category = { id: string; name: string };

export default function NewProductPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProductForm>({
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      categoryId: "",
      price: "",
      comparePrice: "",
      sku: "",
      material: "",
      careInstructions: "",
      isActive: true,
      isFeatured: false,
      isNewArrival: false,
      isBestSeller: false,
      isTrending: false,
      images: [],
      variants: [
        { size: "", color: "", colorHex: "#000000", sku: "", stock: 0, price: "" },
      ],
      metaTitle: "",
      metaDescription: "",
    },
  });

  const { fields: variantFields, append: appendVariant, remove: removeVariant } =
    useFieldArray({ control, name: "variants" });

  const watchedName = watch("name");
  const watchedImages = watch("images");

  useEffect(() => {
    setValue("slug", slugify(watchedName));
  }, [watchedName, setValue]);

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((data) => setCategories(data))
      .catch(() => {});
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploadingImage(true);
    try {
      for (const file of Array.from(files)) {
        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch("/api/upload", { method: "POST", body: fd });
        if (res.ok) {
          const { url } = await res.json();
          const currentImages = watch("images");
          setValue("images", [
            ...currentImages,
            {
              url,
              altText: watchedName,
              isPrimary: currentImages.length === 0,
            },
          ]);
        }
      }
    } finally {
      setUploadingImage(false);
      e.target.value = "";
    }
  };

  const removeImage = (index: number) => {
    const imgs = watch("images").filter((_, i) => i !== index);
    if (imgs.length > 0 && !imgs.some((img) => img.isPrimary)) {
      imgs[0].isPrimary = true;
    }
    setValue("images", imgs);
  };

  const setPrimary = (index: number) => {
    const imgs = watch("images").map((img, i) => ({
      ...img,
      isPrimary: i === index,
    }));
    setValue("images", imgs);
  };

  const onSubmit = async (data: ProductForm) => {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message ?? "Failed to create product");
      }
      router.push("/admin/products");
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const fieldClass =
    "block text-sm font-medium text-zinc-700 mb-1.5";
  const inputClass = "h-9";

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900">New Product</h1>
          <p className="text-sm text-zinc-500 mt-0.5">
            Add a new product to your store
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => router.push("/admin/products")}
        >
          Cancel
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <Tabs defaultValue="basic" className="space-y-5">
          <TabsList className="grid grid-cols-4 w-full max-w-lg bg-zinc-100">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="images">Images</TabsTrigger>
            <TabsTrigger value="variants">Variants</TabsTrigger>
            <TabsTrigger value="seo">SEO</TabsTrigger>
          </TabsList>

          {/* ── Basic Info ── */}
          <TabsContent
            value="basic"
            className="bg-white rounded-xl border border-zinc-200 shadow-sm p-6 space-y-5"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2">
                <label className={fieldClass}>Product Name *</label>
                <Input
                  {...register("name", { required: "Name is required" })}
                  placeholder="e.g. Silk Kurta – Ivory"
                  className={inputClass}
                />
                {errors.name && (
                  <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label className={fieldClass}>Slug</label>
                <Input
                  {...register("slug")}
                  placeholder="auto-generated"
                  className={inputClass}
                />
              </div>

              <div>
                <label className={fieldClass}>SKU</label>
                <Input
                  {...register("sku")}
                  placeholder="NUE-001"
                  className={inputClass}
                />
              </div>

              <div className="md:col-span-2">
                <label className={fieldClass}>Description</label>
                <Textarea
                  {...register("description")}
                  placeholder="Product description..."
                  rows={4}
                  className="resize-none"
                />
              </div>

              <div>
                <label className={fieldClass}>Category *</label>
                <Controller
                  control={control}
                  name="categoryId"
                  rules={{ required: "Category is required" }}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger className={inputClass}>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.categoryId && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.categoryId.message}
                  </p>
                )}
              </div>

              <div>
                <label className={fieldClass}>Price (₹) *</label>
                <Input
                  type="number"
                  step="0.01"
                  {...register("price", { required: "Price is required", min: 0 })}
                  placeholder="0.00"
                  className={inputClass}
                />
                {errors.price && (
                  <p className="text-red-500 text-xs mt-1">{errors.price.message}</p>
                )}
              </div>

              <div>
                <label className={fieldClass}>Compare Price (₹)</label>
                <Input
                  type="number"
                  step="0.01"
                  {...register("comparePrice")}
                  placeholder="0.00 (original MRP)"
                  className={inputClass}
                />
              </div>

              <div>
                <label className={fieldClass}>Material</label>
                <Input
                  {...register("material")}
                  placeholder="e.g. 100% Pure Silk"
                  className={inputClass}
                />
              </div>

              <div className="md:col-span-2">
                <label className={fieldClass}>Care Instructions</label>
                <Textarea
                  {...register("careInstructions")}
                  placeholder="Dry clean only..."
                  rows={2}
                  className="resize-none"
                />
              </div>
            </div>

            {/* Toggles */}
            <div className="border-t border-zinc-100 pt-5">
              <p className="text-sm font-medium text-zinc-700 mb-4">
                Product Flags
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {(
                  [
                    { name: "isActive", label: "Active" },
                    { name: "isFeatured", label: "Featured" },
                    { name: "isNewArrival", label: "New Arrival" },
                    { name: "isBestSeller", label: "Best Seller" },
                    { name: "isTrending", label: "Trending" },
                  ] as const
                ).map((f) => (
                  <Controller
                    key={f.name}
                    control={control}
                    name={f.name}
                    render={({ field }) => (
                      <div className="flex items-center gap-3">
                        <Switch
                          checked={field.value as boolean}
                          onCheckedChange={field.onChange}
                        />
                        <label className="text-sm text-zinc-700">
                          {f.label}
                        </label>
                      </div>
                    )}
                  />
                ))}
              </div>
            </div>
          </TabsContent>

          {/* ── Images ── */}
          <TabsContent
            value="images"
            className="bg-white rounded-xl border border-zinc-200 shadow-sm p-6 space-y-5"
          >
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-3">
                Product Images
              </label>
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-zinc-200 rounded-xl cursor-pointer hover:border-zinc-400 hover:bg-zinc-50 transition-colors">
                <div className="flex flex-col items-center gap-2 text-zinc-400">
                  {uploadingImage ? (
                    <>
                      <Loader2 className="h-6 w-6 animate-spin" />
                      <span className="text-sm">Uploading...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="h-6 w-6" />
                      <span className="text-sm">
                        Click to upload or drag & drop
                      </span>
                      <span className="text-xs">PNG, JPG, WEBP up to 10MB</span>
                    </>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleImageUpload}
                  disabled={uploadingImage}
                />
              </label>
            </div>

            {watchedImages.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                {watchedImages.map((img, i) => (
                  <div key={i} className="relative group">
                    <div
                      className={`relative aspect-square rounded-lg overflow-hidden border-2 cursor-pointer transition-colors ${
                        img.isPrimary
                          ? "border-zinc-900"
                          : "border-zinc-200 hover:border-zinc-400"
                      }`}
                      onClick={() => setPrimary(i)}
                    >
                      <Image
                        src={img.url}
                        alt={img.altText ?? "Product"}
                        fill
                        className="object-cover"
                      />
                      {img.isPrimary && (
                        <div className="absolute bottom-0 left-0 right-0 bg-zinc-900/80 text-white text-[10px] text-center py-0.5">
                          Primary
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute -top-1.5 -right-1.5 h-5 w-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <p className="text-xs text-zinc-400">
              Click an image to set it as the primary image.
            </p>
          </TabsContent>

          {/* ── Variants ── */}
          <TabsContent
            value="variants"
            className="bg-white rounded-xl border border-zinc-200 shadow-sm p-6 space-y-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-zinc-900">
                  Product Variants
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Add size, color and stock information
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-1"
                onClick={() =>
                  appendVariant({
                    size: "",
                    color: "",
                    colorHex: "#000000",
                    sku: "",
                    stock: 0,
                    price: "",
                  })
                }
              >
                <Plus className="h-3.5 w-3.5" />
                Add Variant
              </Button>
            </div>

            <div className="space-y-3">
              {variantFields.map((field, index) => (
                <div
                  key={field.id}
                  className="grid grid-cols-6 gap-2 p-3 bg-zinc-50 rounded-lg border border-zinc-100"
                >
                  <div>
                    <label className="text-[11px] text-zinc-500 mb-1 block">
                      Size
                    </label>
                    <Input
                      {...register(`variants.${index}.size`)}
                      placeholder="M"
                      className="h-8 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-zinc-500 mb-1 block">
                      Color
                    </label>
                    <Input
                      {...register(`variants.${index}.color`)}
                      placeholder="Ivory"
                      className="h-8 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-zinc-500 mb-1 block">
                      Hex
                    </label>
                    <Input
                      type="color"
                      {...register(`variants.${index}.colorHex`)}
                      className="h-8 px-1 py-0.5 cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-zinc-500 mb-1 block">
                      SKU
                    </label>
                    <Input
                      {...register(`variants.${index}.sku`)}
                      placeholder="SKU-001"
                      className="h-8 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-zinc-500 mb-1 block">
                      Stock
                    </label>
                    <Input
                      type="number"
                      {...register(`variants.${index}.stock`, { min: 0 })}
                      placeholder="0"
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="flex items-end gap-2">
                    <div className="flex-1">
                      <label className="text-[11px] text-zinc-500 mb-1 block">
                        Price ₹
                      </label>
                      <Input
                        type="number"
                        step="0.01"
                        {...register(`variants.${index}.price`)}
                        placeholder="Override"
                        className="h-8 text-sm"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeVariant(index)}
                      className="h-8 w-8 flex items-center justify-center text-red-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors flex-shrink-0"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* ── SEO ── */}
          <TabsContent
            value="seo"
            className="bg-white rounded-xl border border-zinc-200 shadow-sm p-6 space-y-5"
          >
            <div>
              <label className={fieldClass}>Meta Title</label>
              <Input
                {...register("metaTitle")}
                placeholder="SEO page title"
                className={inputClass}
                maxLength={60}
              />
              <p className="text-xs text-zinc-400 mt-1">
                Recommended: 50–60 characters
              </p>
            </div>
            <div>
              <label className={fieldClass}>Meta Description</label>
              <Textarea
                {...register("metaDescription")}
                placeholder="Brief description for search engines..."
                rows={3}
                maxLength={160}
                className="resize-none"
              />
              <p className="text-xs text-zinc-400 mt-1">
                Recommended: 150–160 characters
              </p>
            </div>
          </TabsContent>
        </Tabs>

        {/* Submit */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/admin/products")}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={submitting}
            className="bg-zinc-900 hover:bg-zinc-800 gap-2 min-w-32"
          >
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {submitting ? "Creating..." : "Create Product"}
          </Button>
        </div>
      </form>
    </div>
  );
}
