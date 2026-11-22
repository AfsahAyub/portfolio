
import { connection } from "next/server";
import { sql } from "../../lib/db";
import PortfolioClient from "./PortfolioClient";

export default async function Home() {
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
