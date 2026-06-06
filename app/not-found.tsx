import Link from 'next/link'

// Force dynamic to avoid static generation errors from CMS blob fetches
export const dynamic = 'force-dynamic'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A] text-[#F5F5F5] px-6">
      <div className="max-w-md text-center">
        <div className="text-6xl font-semibold tracking-[-2px] mb-4">404</div>
        <h1 className="text-2xl font-medium mb-2">Siden blev ikke fundet</h1>
        <p className="text-white/60 mb-8">Beklager, den side du leder efter findes ikke.</p>
        <Link href="/" className="inline-flex items-center px-6 py-3 rounded-full bg-[#C5A36E] text-[#0A0A0A] font-semibold hover:bg-[#D4B47F] transition-colors">
          Tilbage til forsiden →
        </Link>
      </div>
    </div>
  )
}
