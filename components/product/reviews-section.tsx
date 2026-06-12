"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Star, Loader2, User, MessageSquarePlus } from "lucide-react";
import { formatRelativeDate } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Review {
  id: string;
  rating: number;
  title?: string | null;
  body: string;
  createdAt: string;
  user: { name: string | null; image: string | null };
}

interface ReviewsSectionProps {
  productId: string;
  avgRating: number;
  reviewCount: number;
  reviews?: Review[]; // server-passed initial reviews
}

const reviewSchema = z.object({
  rating: z.number().min(1, "Please select a rating").max(5),
  title: z.string().max(100).optional(),
  body: z.string().min(10, "Review must be at least 10 characters").max(2000),
});

type ReviewFormData = z.infer<typeof reviewSchema>;

function StarRating({ rating, max = 5, size = "sm" }: { rating: number; max?: number; size?: "sm" | "lg" }) {
  const sz = size === "lg" ? "w-5 h-5" : "w-3.5 h-3.5";
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }, (_, i) => (
        <Star
          key={i}
          className={`${sz} ${i < Math.round(rating) ? "fill-nue-gold text-nue-gold" : "text-nue-charcoal/15"}`}
          strokeWidth={1.2}
        />
      ))}
    </div>
  );
}

function ClickableStarRating({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }, (_, i) => {
        const star = i + 1;
        const active = star <= (hovered || value);
        return (
          <button
            key={i}
            type="button"
            onClick={() => onChange(star)}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            aria-label={`Rate ${star} star${star === 1 ? "" : "s"}`}
            className="p-0.5"
          >
            <Star
              className={`w-7 h-7 transition-colors ${
                active ? "fill-nue-gold text-nue-gold" : "text-nue-charcoal/20 hover:text-nue-gold/50"
              }`}
              strokeWidth={1.2}
            />
          </button>
        );
      })}
    </div>
  );
}

function RatingBreakdown({ reviews }: { reviews: Review[] }) {
  const total = reviews.length;
  if (total === 0) return null;

  const counts = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => Math.round(r.rating) === star).length,
  }));

  return (
    <div className="space-y-1.5">
      {counts.map(({ star, count }) => {
        const pct = total > 0 ? (count / total) * 100 : 0;
        return (
          <div key={star} className="flex items-center gap-3 text-xs">
            <span className="w-4 text-nue-stone text-right">{star}</span>
            <Star className="w-3 h-3 fill-nue-gold text-nue-gold shrink-0" strokeWidth={0} />
            <div className="flex-1 h-1.5 bg-nue-charcoal/8 overflow-hidden">
              <div
                className="h-full bg-nue-gold transition-all duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="w-6 text-nue-stone">{count}</span>
          </div>
        );
      })}
    </div>
  );
}

export default function ReviewsSection({
  productId,
  avgRating,
  reviewCount,
  reviews: initialReviews = [],
}: ReviewsSectionProps) {
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [isLoading, setIsLoading] = useState(initialReviews.length === 0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: { rating: 0 },
  });

  const watchedRating = watch("rating");

  // Fetch reviews on mount if not pre-populated
  useEffect(() => {
    if (initialReviews.length > 0) {
      setIsLoading(false);
      return;
    }

    const fetchReviews = async () => {
      try {
        const res = await fetch(
          `/api/reviews?productId=${productId}&approved=true`
        );
        if (res.ok) {
          const data = await res.json();
          setReviews(Array.isArray(data) ? data : data.data ?? []);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchReviews();
  }, [productId, initialReviews.length]);

  const onSubmit = async (data: ReviewFormData) => {
    setSubmitError(null);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, productId }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setSubmitError(body.message || "Failed to submit review.");
        return;
      }

      setSubmitSuccess(true);
      reset({ rating: 0, title: "", body: "" });
      setTimeout(() => {
        setIsDialogOpen(false);
        setSubmitSuccess(false);
      }, 2500);
    } catch {
      setSubmitError("Unable to submit review. Please try again.");
    }
  };

  const displayAvg = reviews.length > 0
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : avgRating;

  return (
    <div>
      <h2 className="text-2xl font-serif text-nue-charcoal tracking-tight mb-8">
        Customer Reviews
      </h2>

      {/* Summary */}
      <div className="flex flex-col sm:flex-row gap-8 mb-10">
        {/* Big number */}
        <div className="flex flex-col items-center sm:items-start shrink-0">
          <span className="text-6xl font-serif text-nue-charcoal leading-none">
            {displayAvg.toFixed(1)}
          </span>
          <StarRating rating={displayAvg} size="lg" />
          <p className="text-xs text-nue-stone mt-1.5 tracking-widest uppercase">
            {reviews.length || reviewCount} review{(reviews.length || reviewCount) !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Breakdown */}
        <div className="flex-1 max-w-xs">
          <RatingBreakdown reviews={reviews} />
        </div>

        {/* Write review CTA */}
        <div className="sm:ml-auto flex items-start">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <button className="flex items-center gap-2 px-5 py-2.5 border border-nue-charcoal/20 text-nue-charcoal text-xs tracking-widest uppercase hover:bg-nue-charcoal hover:text-white transition-colors">
                <MessageSquarePlus className="w-4 h-4" />
                Write a Review
              </button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle className="font-serif text-nue-charcoal">Write a Review</DialogTitle>
              </DialogHeader>

              {submitSuccess ? (
                <div className="text-center py-8 space-y-3">
                  <div className="w-12 h-12 rounded-full bg-nue-charcoal flex items-center justify-center mx-auto">
                    <Star className="w-5 h-5 fill-nue-gold text-nue-gold" />
                  </div>
                  <p className="font-serif text-nue-charcoal">Thank you for your review!</p>
                  <p className="text-sm text-nue-stone">
                    Your review will appear after moderation.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                  {submitError && (
                    <p className="text-sm text-red-600">{submitError}</p>
                  )}

                  {/* Star rating */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-medium tracking-widest uppercase text-nue-charcoal/70">
                      Rating
                    </label>
                    <ClickableStarRating
                      value={watchedRating}
                      onChange={(v) => setValue("rating", v, { shouldValidate: true })}
                    />
                    {errors.rating && (
                      <p className="text-xs text-red-500">{errors.rating.message}</p>
                    )}
                  </div>

                  {/* Title */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-medium tracking-widest uppercase text-nue-charcoal/70">
                      Title <span className="normal-case font-normal text-nue-stone">(optional)</span>
                    </label>
                    <input
                      {...register("title")}
                      className="w-full px-4 py-3 border border-nue-charcoal/15 text-nue-charcoal text-sm placeholder:text-nue-stone/40 focus:outline-none focus:border-nue-gold focus:ring-1 focus:ring-nue-gold"
                      placeholder="Summarise your experience"
                    />
                  </div>

                  {/* Body */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-medium tracking-widest uppercase text-nue-charcoal/70">
                      Review
                    </label>
                    <textarea
                      {...register("body")}
                      rows={5}
                      className="w-full px-4 py-3 border border-nue-charcoal/15 text-nue-charcoal text-sm placeholder:text-nue-stone/40 focus:outline-none focus:border-nue-gold focus:ring-1 focus:ring-nue-gold resize-none"
                      placeholder="Share details about the fit, quality, and your overall experience..."
                    />
                    {errors.body && (
                      <p className="text-xs text-red-500">{errors.body.message}</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-nue-charcoal text-white text-sm tracking-widest uppercase hover:bg-nue-gold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      "Submit Review"
                    )}
                  </button>
                </form>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Reviews list */}
      {isLoading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="w-5 h-5 animate-spin text-nue-stone" />
        </div>
      ) : reviews.length === 0 ? (
        <div className="border border-nue-charcoal/8 p-8 text-center">
          <MessageSquarePlus className="w-8 h-8 text-nue-stone mx-auto mb-3" strokeWidth={1.2} />
          <p className="text-sm text-nue-stone">
            No reviews yet. Be the first to share your thoughts!
          </p>
        </div>
      ) : (
        <div className="space-y-6 divide-y divide-nue-charcoal/6">
          {reviews.map((review) => (
            <div key={review.id} className="pt-6 first:pt-0">
              <div className="flex items-start gap-3">
                {/* Avatar */}
                <div className="w-9 h-9 rounded-full bg-nue-cream flex items-center justify-center shrink-0 overflow-hidden">
                  {review.user.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={review.user.image}
                      alt={review.user.name || "User"}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-sm font-serif text-nue-charcoal">
                      {(review.user.name || "A").charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <p className="text-sm font-medium text-nue-charcoal">
                        {review.user.name || "Anonymous"}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <StarRating rating={review.rating} />
                        <span className="text-xs text-nue-stone">
                          {formatRelativeDate(review.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {review.title && (
                    <p className="mt-2 text-sm font-medium text-nue-charcoal">{review.title}</p>
                  )}
                  <p className="mt-1.5 text-sm text-nue-stone leading-relaxed">{review.body}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
