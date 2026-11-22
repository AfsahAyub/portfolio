import { NextResponse } from "next/server";
import { sql } from "../../../../../../lib/db";

// Items dekhna
export async function GET(request, { params }) {
  try {
    const { id } = await params;

    const data = await sql`
      SELECT * FROM section_items
      WHERE section_id = ${id}
      ORDER BY position, id
    `;

    return NextResponse.json(data);
  } catch (error) {
    console.error("GET ERROR:", error);
    return NextResponse.json(
      { error: "Information load nahi hui" },
      { status: 500 }
    );
  }
}

// Naya item add karna
export async function POST(request, { params }) {
  try {
    const { id } = await params;
    const { name } = await request.json();

    if (typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        { error: "Information required" },
        { status: 400 }
      );
    }

    const content = JSON.stringify({
      name: name.trim()
    });

    const data = await sql`
      INSERT INTO section_items (section_id, content)
      VALUES (${id}, ${content}::jsonb)
      RETURNING *
    `;

    return NextResponse.json(data[0]);
  } catch (error) {
    console.error("ADD ITEM ERROR:", error);
    return NextResponse.json(
      { error: "Database mein save nahi hua" },
      { status: 500 }
    );
  }
}

// Existing item edit karna
export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const { itemId, name } = await request.json();

    if (!itemId || typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        { error: "Invalid information" },
        { status: 400 }
      );
    }

    const content = JSON.stringify({
      name: name.trim()
    });

    const data = await sql`
      UPDATE section_items
      SET content = ${content}::jsonb
      WHERE id = ${itemId} AND section_id = ${id}
      RETURNING *
    `;

    if (!data.length) {
      return NextResponse.json(
        { error: "Item not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(data[0]);
  } catch (error) {
    console.error("EDIT ITEM ERROR:", error);
    return NextResponse.json(
      { error: "Information edit nahi hui" },
      { status: 500 }
    );
  }
}

// Individual item delete karna
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const { itemId } = await request.json();

    const data = await sql`
      DELETE FROM section_items
      WHERE id = ${itemId} AND section_id = ${id}
      RETURNING id
    `;

    if (!data.length) {
      return NextResponse.json(
        { error: "Item not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE ITEM ERROR:", error);
    return NextResponse.json(
      { error: "Information delete nahi hui" },
      { status: 500 }
    );
  }
}
