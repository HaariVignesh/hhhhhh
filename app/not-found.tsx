import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F5F0E8] px-4 text-center">
      <p className="font-serif text-[120px] font-bold leading-none text-[#2C2C2C]/10">
        404
      </p>
      <h1 className="font-serif text-3xl text-[#2C2C2C] -mt-8">
        Page Not Found
      </h1>
      <p className="text-[#8C7B6B] mt-4 max-w-md">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <div className="flex gap-4 mt-8">
        <Link
          href="/"
          className="bg-[#2C2C2C] text-white px-6 py-3 text-sm tracking-widest uppercase hover:bg-[#8C7B6B] transition-colors"
        >
          Go Home
        </Link>
        <Link
          href="/shop"
          className="border border-[#2C2C2C] text-[#2C2C2C] px-6 py-3 text-sm tracking-widest uppercase hover:bg-[#2C2C2C] hover:text-white transition-colors"
        >
          Shop Now
        </Link>
      </div>
    </div>
  );
}
