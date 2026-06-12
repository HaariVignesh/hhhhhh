export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F0E8]">
      <div className="flex flex-col items-center gap-4">
        <div className="font-serif text-2xl tracking-[0.3em] text-[#2C2C2C]">
          NUE
        </div>
        <div className="w-8 h-8 border-2 border-[#2C2C2C] border-t-transparent rounded-full animate-spin" />
      </div>
    </div>
  );
}
