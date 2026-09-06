import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE, verifySessionToken } from "@/lib/auth";
import { LogoutButton } from "./LogoutButton";

export default async function CmsLayout({ children }: { children: React.ReactNode }) {
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  if (!verifySessionToken(token)) {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen bg-cream text-ink">
      <header className="border-b border-ink/10 bg-white/80">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-5 py-4">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-gold">Højfynsspartel</p>
            <h1 className="display text-xl md:text-2xl">CMS</h1>
          </div>
          <nav className="flex flex-wrap items-center gap-3 text-sm">
            <a href="/admin" className="rounded-full bg-ink px-3 py-1.5 text-cream">
              Rediger
            </a>
            <a href="/" className="rounded-full border border-ink/20 px-3 py-1.5 hover:border-gold">
              Forside
            </a>
            <LogoutButton />
          </nav>
        </div>
      </header>
      <div className="mx-auto max-w-5xl px-5 py-8 md:py-10">{children}</div>
    </div>
  );
}
