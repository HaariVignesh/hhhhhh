"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Loader2,
  Plus,
  Pencil,
  Trash2,
  Star,
  MapPin,
  ChevronLeft,
  AlertCircle,
} from "lucide-react";
import { addressSchema, type AddressInput } from "@/lib/validations/order";
import { INDIAN_STATES } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface Address extends AddressInput {
  id: string;
  label?: string;
  isDefault: boolean;
}

const labelSchema = addressSchema.extend({
  label: addressSchema.shape.fullName.optional(),
});
type AddressFormData = AddressInput & { label?: string };

function AddressForm({
  onSubmit,
  defaultValues,
  isSubmitting,
}: {
  onSubmit: (data: AddressFormData) => Promise<void>;
  defaultValues?: Partial<Address>;
  isSubmitting: boolean;
}) {
  const { register, handleSubmit, formState: { errors } } = useForm<AddressFormData>({
    resolver: zodResolver(labelSchema),
    defaultValues: { country: "India", ...defaultValues },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Label */}
      <div className="space-y-1.5">
        <label className="block text-xs font-medium tracking-widest uppercase text-nue-charcoal/70">
          Label <span className="normal-case font-normal text-nue-stone">(optional)</span>
        </label>
        <input
          {...register("label")}
          className="w-full px-3 py-2.5 border border-nue-charcoal/15 text-nue-charcoal text-sm focus:outline-none focus:border-nue-gold focus:ring-1 focus:ring-nue-gold"
          placeholder="Home, Office..."
        />
      </div>

      {/* Full Name */}
      <div className="space-y-1.5">
        <label className="block text-xs font-medium tracking-widest uppercase text-nue-charcoal/70">
          Full Name
        </label>
        <input
          {...register("fullName")}
          className="w-full px-3 py-2.5 border border-nue-charcoal/15 text-nue-charcoal text-sm focus:outline-none focus:border-nue-gold focus:ring-1 focus:ring-nue-gold"
          placeholder="Jane Doe"
        />
        {errors.fullName && <p className="text-xs text-red-500">{errors.fullName.message}</p>}
      </div>

      {/* Phone */}
      <div className="space-y-1.5">
        <label className="block text-xs font-medium tracking-widest uppercase text-nue-charcoal/70">
          Phone
        </label>
        <input
          {...register("phone")}
          type="tel"
          className="w-full px-3 py-2.5 border border-nue-charcoal/15 text-nue-charcoal text-sm focus:outline-none focus:border-nue-gold focus:ring-1 focus:ring-nue-gold"
          placeholder="+91 9876543210"
        />
        {errors.phone && <p className="text-xs text-red-500">{errors.phone.message}</p>}
      </div>

      {/* Address Line 1 */}
      <div className="space-y-1.5">
        <label className="block text-xs font-medium tracking-widest uppercase text-nue-charcoal/70">
          Address Line 1
        </label>
        <input
          {...register("addressLine1")}
          className="w-full px-3 py-2.5 border border-nue-charcoal/15 text-nue-charcoal text-sm focus:outline-none focus:border-nue-gold focus:ring-1 focus:ring-nue-gold"
          placeholder="Flat no., Street, Area"
        />
        {errors.addressLine1 && <p className="text-xs text-red-500">{errors.addressLine1.message}</p>}
      </div>

      {/* Address Line 2 */}
      <div className="space-y-1.5">
        <label className="block text-xs font-medium tracking-widest uppercase text-nue-charcoal/70">
          Address Line 2 <span className="normal-case font-normal text-nue-stone">(optional)</span>
        </label>
        <input
          {...register("addressLine2")}
          className="w-full px-3 py-2.5 border border-nue-charcoal/15 text-nue-charcoal text-sm focus:outline-none focus:border-nue-gold focus:ring-1 focus:ring-nue-gold"
          placeholder="Landmark"
        />
      </div>

      {/* City + Postal Code */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="block text-xs font-medium tracking-widest uppercase text-nue-charcoal/70">
            City
          </label>
          <input
            {...register("city")}
            className="w-full px-3 py-2.5 border border-nue-charcoal/15 text-nue-charcoal text-sm focus:outline-none focus:border-nue-gold focus:ring-1 focus:ring-nue-gold"
            placeholder="Mumbai"
          />
          {errors.city && <p className="text-xs text-red-500">{errors.city.message}</p>}
        </div>
        <div className="space-y-1.5">
          <label className="block text-xs font-medium tracking-widest uppercase text-nue-charcoal/70">
            Postal Code
          </label>
          <input
            {...register("postalCode")}
            className="w-full px-3 py-2.5 border border-nue-charcoal/15 text-nue-charcoal text-sm focus:outline-none focus:border-nue-gold focus:ring-1 focus:ring-nue-gold"
            placeholder="400001"
            maxLength={6}
          />
          {errors.postalCode && <p className="text-xs text-red-500">{errors.postalCode.message}</p>}
        </div>
      </div>

      {/* State */}
      <div className="space-y-1.5">
        <label className="block text-xs font-medium tracking-widest uppercase text-nue-charcoal/70">
          State
        </label>
        <select
          {...register("state")}
          className="w-full px-3 py-2.5 border border-nue-charcoal/15 text-nue-charcoal text-sm focus:outline-none focus:border-nue-gold focus:ring-1 focus:ring-nue-gold bg-white"
        >
          <option value="">Select state</option>
          {INDIAN_STATES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        {errors.state && <p className="text-xs text-red-500">{errors.state.message}</p>}
      </div>

      <DialogFooter>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center justify-center gap-2 px-6 py-2.5 bg-nue-charcoal text-white text-sm tracking-widest uppercase hover:bg-nue-gold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Address"}
        </button>
      </DialogFooter>
    </form>
  );
}

export default function AddressesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editAddress, setEditAddress] = useState<Address | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/profile/addresses");
    }
  }, [status, router]);

  useEffect(() => {
    if (!session?.user) return;
    fetch("/api/user/addresses")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setAddresses(data);
      })
      .catch(() => setError("Unable to load addresses."))
      .finally(() => setIsLoading(false));
  }, [session]);

  const handleAdd = async (data: AddressFormData) => {
    setIsSubmitting(true);
    setFormError(null);
    try {
      const res = await fetch("/api/user/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const body = await res.json();
      if (!res.ok) {
        setFormError(body.message || "Failed to add address.");
        return;
      }
      setAddresses((prev) => [...prev, body]);
      setIsAddOpen(false);
    } catch {
      setFormError("Unable to add address.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async (data: AddressFormData) => {
    if (!editAddress) return;
    setIsSubmitting(true);
    setFormError(null);
    try {
      const res = await fetch(`/api/user/addresses/${editAddress.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const body = await res.json();
      if (!res.ok) {
        setFormError(body.message || "Failed to update address.");
        return;
      }
      setAddresses((prev) => prev.map((a) => (a.id === editAddress.id ? body : a)));
      setEditAddress(null);
    } catch {
      setFormError("Unable to update address.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/user/addresses/${id}`, { method: "DELETE" });
      if (res.ok) {
        setAddresses((prev) => prev.filter((a) => a.id !== id));
      }
    } catch {
      // silent
    } finally {
      setDeleteId(null);
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      const res = await fetch(`/api/user/addresses/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isDefault: true }),
      });
      if (res.ok) {
        setAddresses((prev) =>
          prev.map((a) => ({ ...a, isDefault: a.id === id }))
        );
      }
    } catch {
      // silent
    }
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-nue-stone" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-12 max-w-3xl">
        <Link
          href="/profile"
          className="inline-flex items-center gap-1.5 text-sm text-nue-stone hover:text-nue-charcoal transition-colors mb-8"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          Back to Profile
        </Link>

        <div className="flex items-center justify-between mb-10">
          <h1 className="text-3xl font-serif text-nue-charcoal tracking-tight">Addresses</h1>
          <button
            onClick={() => { setIsAddOpen(true); setFormError(null); }}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-nue-charcoal text-white text-xs tracking-widest uppercase hover:bg-nue-gold transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Add New
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm mb-6">
            {error}
          </div>
        )}

        {addresses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 rounded-full bg-nue-cream flex items-center justify-center mb-6">
              <MapPin className="w-9 h-9 text-nue-stone" strokeWidth={1.2} />
            </div>
            <h2 className="text-xl font-serif text-nue-charcoal mb-2">No addresses saved</h2>
            <p className="text-sm text-nue-stone mb-6">Add a shipping address to speed up checkout.</p>
            <button
              onClick={() => setIsAddOpen(true)}
              className="inline-flex items-center gap-1.5 px-6 py-3 bg-nue-charcoal text-white text-sm tracking-widest uppercase hover:bg-nue-gold transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Address
            </button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {addresses.map((addr) => (
              <div
                key={addr.id}
                className={`relative p-5 border bg-white transition-colors ${
                  addr.isDefault ? "border-nue-gold" : "border-nue-charcoal/8"
                }`}
              >
                {addr.isDefault && (
                  <div className="absolute top-3 right-3">
                    <span className="text-[10px] tracking-widest uppercase bg-nue-gold text-white px-2 py-0.5">
                      Default
                    </span>
                  </div>
                )}

                {addr.label && (
                  <p className="text-[10px] tracking-widest uppercase text-nue-stone mb-2">
                    {addr.label}
                  </p>
                )}

                <p className="text-sm font-medium text-nue-charcoal">{addr.fullName}</p>
                <p className="text-xs text-nue-stone mt-1 leading-relaxed">
                  {addr.addressLine1}
                  {addr.addressLine2 && <>, {addr.addressLine2}</>}
                  <br />
                  {addr.city}, {addr.state} — {addr.postalCode}
                </p>
                <p className="text-xs text-nue-stone mt-0.5">{addr.phone}</p>

                <div className="flex items-center gap-3 mt-4 pt-4 border-t border-nue-charcoal/8">
                  <button
                    onClick={() => { setEditAddress(addr); setFormError(null); }}
                    className="flex items-center gap-1 text-xs text-nue-stone hover:text-nue-charcoal transition-colors"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    Edit
                  </button>
                  <button
                    onClick={() => setDeleteId(addr.id)}
                    className="flex items-center gap-1 text-xs text-nue-stone hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete
                  </button>
                  {!addr.isDefault && (
                    <button
                      onClick={() => handleSetDefault(addr.id)}
                      className="flex items-center gap-1 text-xs text-nue-stone hover:text-nue-gold transition-colors ml-auto"
                    >
                      <Star className="w-3.5 h-3.5" />
                      Set Default
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add Address Dialog */}
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-serif text-nue-charcoal">Add New Address</DialogTitle>
            </DialogHeader>
            {formError && (
              <div className="flex items-start gap-1.5 text-red-600 text-sm">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                {formError}
              </div>
            )}
            <AddressForm onSubmit={handleAdd} isSubmitting={isSubmitting} />
          </DialogContent>
        </Dialog>

        {/* Edit Address Dialog */}
        <Dialog open={!!editAddress} onOpenChange={() => setEditAddress(null)}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-serif text-nue-charcoal">Edit Address</DialogTitle>
            </DialogHeader>
            {formError && (
              <div className="flex items-start gap-1.5 text-red-600 text-sm">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                {formError}
              </div>
            )}
            {editAddress && (
              <AddressForm
                onSubmit={handleEdit}
                defaultValues={editAddress}
                isSubmitting={isSubmitting}
              />
            )}
          </DialogContent>
        </Dialog>

        {/* Delete confirm Dialog */}
        <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle className="font-serif text-nue-charcoal">Delete Address</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-nue-stone">
              Are you sure you want to delete this address? This action cannot be undone.
            </p>
            <DialogFooter>
              <button
                onClick={() => deleteId && handleDelete(deleteId)}
                className="px-5 py-2.5 bg-red-600 text-white text-sm hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
              <button
                onClick={() => setDeleteId(null)}
                className="px-5 py-2.5 border border-nue-charcoal/20 text-nue-charcoal text-sm hover:bg-nue-cream transition-colors"
              >
                Cancel
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
