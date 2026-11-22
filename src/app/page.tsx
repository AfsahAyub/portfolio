
import { Suspense } from "react";
import { connection } from "next/server";
import { sql } from "../../lib/db";
import PortfolioClient from "./PortfolioClient";

// Dynamic database content
async function PortfolioData() {
  await connection();

  const sections = await sql`
    SELECT id, title, type, position, is_visible
    FROM sections
    WHERE is_visible = true
    ORDER BY position, id
  `;

  const items = await sql`
    SELECT id, section_id, content, position
    FROM section_items
    ORDER BY position, id
  `;

  return (
    <PortfolioClient
      initialSections={sections}
      initialItems={items}
    />
  );
}

// Main page with Suspense
export default function Home() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-[#080B1D] text-white">
          <div className="text-center">
            <div className="mx-auto mb-5 h-12 w-12 animate-spin rounded-full border-4 border-violet-300 border-t-transparent" />
            <h1 className="text-2xl font-bold text-violet-300">
              Afsah Ayub
            </h1>
            <p className="mt-3 text-slate-300">
              Loading portfolio...
            </p>
          </div>
        </main>
      }
    >
      <PortfolioData />
    </Suspense>
  );
}
