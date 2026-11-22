
import { NextResponse } from "next/server";
import { sql } from "../../../../lib/db";

export async function GET() {
  try {
    const data = await sql`
      SELECT * FROM sections ORDER BY position, id
    `;
    return NextResponse.json(data);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Sections load nahi hue" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const { title } = await request.json();

    if (!title?.trim()) {
      return NextResponse.json(
        { error: "Title required" },
        { status: 400 }
      );
    }

    const data = await sql`
      INSERT INTO sections (title, type)
      VALUES (${title.trim()}, 'custom')
      RETURNING *
    `;

    return NextResponse.json(data[0]);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Section add nahi hua" },
      { status: 500 }
    );
  }
}

// Section ka naam edit
export async function PATCH(request) {
  try {
    const { id, title } = await request.json();

    if (!id || typeof title !== "string" || !title.trim()) {
      return NextResponse.json(
        { error: "Invalid section" },
        { status: 400 }
      );
    }

    const data = await sql`
      UPDATE sections
      SET title = ${title.trim()}
      WHERE id = ${id}
      RETURNING *
    `;

    if (!data.length) {
      return NextResponse.json(
        { error: "Section not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(data[0]);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Section edit nahi hua" },
      { status: 500 }
    );
  }
}

// Section delete
export async function DELETE(request) {
  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: "Section ID required" },
        { status: 400 }
      );
    }

    const data = await sql`
      DELETE FROM sections
      WHERE id = ${id}
      RETURNING id
    `;

    if (!data.length) {
      return NextResponse.json(
        { error: "Section not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Section delete nahi hua" },
      { status: 500 }
    );
  }
}
