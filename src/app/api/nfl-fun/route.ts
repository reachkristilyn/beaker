import { NextResponse } from "next/server";

const KEEP: Record<string, string> = {
  QB: "QB", RB: "RB", FB: "RB", WR: "WR", TE: "TE", PK: "K", K: "K",
};
const ORDER = ["QB", "RB", "WR", "TE", "K"];

export async function GET(request: Request) {
  const team = new URL(request.url).searchParams.get("team");
  if (!team) {
    return NextResponse.json({ error: "team required" }, { status: 400 });
  }

  const url = `https://site.api.espn.com/apis/site/v2/sports/football/nfl/teams/${encodeURIComponent(
    team.toLowerCase()
  )}/roster`;

  try {
    const res = await fetch(url, { next: { revalidate: 43200 } });
    if (!res.ok) {
      return NextResponse.json({ error: `ESPN returned ${res.status}` }, { status: 502 });
    }
    const data = await res.json();

    type Athlete = {
      id?: string;
      fullName?: string;
      displayName?: string;
      position?: { abbreviation?: string };
    };

    const groups: { items?: Athlete[] }[] = data.athletes ?? [];
    const players = groups
      .flatMap((g) => g.items ?? [])
      .map((a) => ({
        id: String(a.id ?? ""),
        name: a.fullName || a.displayName || "",
        pos: KEEP[a.position?.abbreviation ?? ""] ?? "",
      }))
      .filter((p) => p.id && p.name && p.pos)
      .sort((a, b) =>
        ORDER.indexOf(a.pos) - ORDER.indexOf(b.pos) || a.name.localeCompare(b.name)
      );

    return NextResponse.json({ team: team.toUpperCase(), players });
  } catch {
    return NextResponse.json({ error: "Could not reach ESPN" }, { status: 502 });
  }
}