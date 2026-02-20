import { Geist } from "next/font/google";

const geist = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`workflow-theme ${geist.variable}`}>
      <nav className="border-b border-zinc-800/60 px-6 py-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <span className="text-sm font-medium text-zinc-300">Solution Threads</span>
          <span className="text-xs text-zinc-600">Admin</span>
        </div>
      </nav>
      <main className="mx-auto max-w-5xl px-6 py-10">{children}</main>
    </div>
  );
}
