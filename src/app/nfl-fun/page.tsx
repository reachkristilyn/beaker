"use client";

import { useState, useEffect, useMemo } from "react";

type Tier = "Core" | "Watch" | "Fade";

interface Player {
  id: string;
  name: string;
  team: string;
  pos: string;
  salary: string;
  tier: Tier;
  note: string;
  espnId?: string;
}

interface Slip {
  id: string;
  label: string;
  mvp: string | null;
  flex: string[];
  spend: number;
  savedAt: string;
}

const STORE_KEY = "nfl-fun:board";
const TIERS: Tier[] = ["Core", "Watch", "Fade"];
interface RosterPlayer {
  id: string;
  name: string;
  pos: string;
}

const TEAMS: { abbr: string; name: string }[] = [
  { abbr: "ARI", name: "Arizona Cardinals" },
  { abbr: "ATL", name: "Atlanta Falcons" },
  { abbr: "BAL", name: "Baltimore Ravens" },
  { abbr: "BUF", name: "Buffalo Bills" },
  { abbr: "CAR", name: "Carolina Panthers" },
  { abbr: "CHI", name: "Chicago Bears" },
  { abbr: "CIN", name: "Cincinnati Bengals" },
  { abbr: "CLE", name: "Cleveland Browns" },
  { abbr: "DAL", name: "Dallas Cowboys" },
  { abbr: "DEN", name: "Denver Broncos" },
  { abbr: "DET", name: "Detroit Lions" },
  { abbr: "GB", name: "Green Bay Packers" },
  { abbr: "HOU", name: "Houston Texans" },
  { abbr: "IND", name: "Indianapolis Colts" },
  { abbr: "JAX", name: "Jacksonville Jaguars" },
  { abbr: "KC", name: "Kansas City Chiefs" },
  { abbr: "LV", name: "Las Vegas Raiders" },
  { abbr: "LAC", name: "Los Angeles Chargers" },
  { abbr: "LAR", name: "Los Angeles Rams" },
  { abbr: "MIA", name: "Miami Dolphins" },
  { abbr: "MIN", name: "Minnesota Vikings" },
  { abbr: "NE", name: "New England Patriots" },
  { abbr: "NO", name: "New Orleans Saints" },
  { abbr: "NYG", name: "New York Giants" },
  { abbr: "NYJ", name: "New York Jets" },
  { abbr: "PHI", name: "Philadelphia Eagles" },
  { abbr: "PIT", name: "Pittsburgh Steelers" },
  { abbr: "SF", name: "San Francisco 49ers" },
  { abbr: "SEA", name: "Seattle Seahawks" },
  { abbr: "TB", name: "Tampa Bay Buccaneers" },
  { abbr: "TEN", name: "Tennessee Titans" },
  { abbr: "WSH", name: "Washington Commanders" },
];

const css = `
.nff {
  --ink: #16202b;
  --paper: #fbfaf7;
  --rule: #d9d5cd;
  --muted: #6b7580;
  --mvp: #c8102e;
  --good: #1f6f4a;
  --warn: #a2470f;
  font-family: var(--font-plex-sans), 'IBM Plex Sans', system-ui, sans-serif;
  color: var(--ink);
  background: var(--paper);
  padding: 24px 20px 48px;
  line-height: 1.45;
}
.nff * { box-sizing: border-box; }
.nff h1 { font-size: 1.35rem; font-weight: 600; margin: 0; letter-spacing: -0.01em; }
.nff h2 { font-size: 0.95rem; font-weight: 600; margin: 0 0 10px; }
.nff .sub { color: var(--muted); font-size: 0.8rem; margin: 4px 0 0; }
.nff .mono { font-family: var(--font-plex-mono), 'IBM Plex Mono', ui-monospace, monospace; font-variant-numeric: tabular-nums; }

.nff .wrap { max-width: 1080px; margin: 0 auto; }
.nff .head { display: flex; flex-wrap: wrap; gap: 12px; align-items: flex-end; justify-content: space-between; border-bottom: 2px solid var(--ink); padding-bottom: 12px; margin-bottom: 20px; }
.nff .cols { display: grid; grid-template-columns: 1fr; gap: 24px; }
@media (min-width: 860px) { .nff .cols { grid-template-columns: 1.15fr 1fr; gap: 32px; } }

.nff input, .nff select, .nff textarea {
  font: inherit; color: inherit; background: #fff;
  border: 1px solid var(--rule); border-radius: 3px; padding: 7px 9px; width: 100%;
}
.nff textarea { resize: vertical; min-height: 52px; }
.nff input:focus-visible, .nff select:focus-visible, .nff textarea:focus-visible, .nff button:focus-visible {
  outline: 2px solid var(--ink); outline-offset: 1px;
}
.nff .row { display: grid; gap: 8px; margin-bottom: 8px; }
.nff .r4 { grid-template-columns: 2fr 0.9fr 0.9fr 1.1fr; }
.nff .r2 { grid-template-columns: 1fr 1fr; }
.nff .r3 { grid-template-columns: 1fr 1fr auto; }
@media (max-width: 560px) { .nff .r4, .nff .r3 { grid-template-columns: 1fr 1fr; } }

.nff button { font: inherit; cursor: pointer; border-radius: 3px; border: 1px solid var(--ink); background: var(--ink); color: #fff; padding: 7px 14px; }
.nff button.ghost { background: transparent; color: var(--ink); border-color: var(--rule); }
.nff button.ghost:hover { border-color: var(--ink); }
.nff button.link { background: none; border: none; color: var(--muted); padding: 2px 4px; text-decoration: underline; font-size: 0.78rem; }
.nff button.link:hover { color: var(--ink); }
.nff button:disabled { opacity: 0.4; cursor: not-allowed; }

.nff .tierhead { font-size: 0.78rem; font-weight: 600; color: var(--muted); border-bottom: 1px solid var(--rule); padding-bottom: 4px; margin: 18px 0 6px; display: flex; justify-content: space-between; }
.nff .p { display: flex; gap: 10px; align-items: baseline; padding: 8px 0; border-bottom: 1px solid var(--rule); }
.nff .p .name { font-weight: 500; }
.nff .p .meta { color: var(--muted); font-size: 0.78rem; }
.nff .p .note { color: var(--muted); font-size: 0.8rem; margin-top: 2px; }
.nff .p .grow { flex: 1; min-width: 0; }
.nff .p .acts { display: flex; gap: 2px; flex-shrink: 0; align-items: center; }
.nff .p.used { opacity: 0.45; }
.nff .dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; margin-top: 7px; }
.nff .dot.Core { background: var(--mvp); }
.nff .dot.Watch { background: var(--muted); }
.nff .dot.Fade { background: transparent; border: 1px solid var(--rule); }

.nff .slip { border: 1px solid var(--ink); border-radius: 3px; background: #fff; padding: 16px; }
.nff .slot { display: flex; align-items: center; gap: 10px; padding: 9px 0; border-bottom: 1px dashed var(--rule); }
.nff .slot .lab { font-size: 0.7rem; font-weight: 600; color: var(--muted); width: 40px; flex-shrink: 0; }
.nff .slot.mvpslot { border-bottom: 1px solid var(--mvp); padding: 12px 0; }
.nff .slot.mvpslot .lab { color: var(--mvp); font-size: 0.78rem; }
.nff .slot.mvpslot .nm { font-size: 1.05rem; font-weight: 600; }
.nff .slot .empty { color: var(--muted); font-size: 0.85rem; font-style: italic; }
.nff .slot .grow { flex: 1; min-width: 0; }

.nff .meter { height: 8px; background: #ece9e2; border-radius: 999px; overflow: hidden; margin: 6px 0 4px; }
.nff .meter i { display: block; height: 100%; background: var(--good); transition: width 180ms ease; }
.nff .meter i.over { background: var(--mvp); }
.nff .capline { display: flex; justify-content: space-between; font-size: 0.82rem; }
.nff .over { color: var(--mvp); font-weight: 600; }

.nff .saved { border: 1px solid var(--rule); border-radius: 3px; padding: 10px 12px; margin-bottom: 8px; background: #fff; }
.nff .saved .t { display: flex; justify-content: space-between; gap: 8px; align-items: baseline; }
.nff .empty-state { color: var(--muted); font-size: 0.85rem; padding: 14px 0; }
.nff .flag { font-size: 0.75rem; color: var(--warn); margin-top: 8px; }
`;

const money = (n: string | number) => "$" + (Number(n) || 0).toLocaleString("en-US");
const uid = () => Math.random().toString(36).slice(2, 9);

export default function NflFunPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [lineups, setLineups] = useState<Slip[]>([]);
  const [cap, setCap] = useState(60000);
  const [mvp, setMvp] = useState<string | null>(null);
  const [flex, setFlex] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [status, setStatus] = useState("");
  const [query, setQuery] = useState("");
  const [label, setLabel] = useState("");

  const [draft, setDraft] = useState({ salary: "", tier: "Core" as Tier, note: "" });
  const [team, setTeam] = useState("");
  const [pick, setPick] = useState("");
  const [teamRoster, setTeamRoster] = useState<RosterPlayer[]>([]);
  const [rosterState, setRosterState] = useState<"idle" | "loading" | "ready" | "error">("idle");

  useEffect(() => {
    if (!team) {
      setTeamRoster([]);
      setRosterState("idle");
      return;
    }
    let cancelled = false;
    setRosterState("loading");
    fetch(`/api/nfl-fun?team=${team}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((d) => {
        if (cancelled) return;
        setTeamRoster(d.players || []);
        setRosterState("ready");
      })
      .catch(() => {
        if (!cancelled) setRosterState("error");
      });
    return () => {
      cancelled = true;
    };
  }, [team]);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORE_KEY);
      if (raw) {
        const data = JSON.parse(raw);
        setPlayers(data.players || []);
        setLineups(data.lineups || []);
        if (data.cap) setCap(data.cap);
      }
    } catch {
      setStatus("Saved board could not be read. Starting fresh.");
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      window.localStorage.setItem(STORE_KEY, JSON.stringify({ players, lineups, cap }));
    } catch {
      setStatus("Could not save. Your last change is only in this tab.");
    }
  }, [players, lineups, cap, loaded]);

  const byId = useMemo(() => Object.fromEntries(players.map((p) => [p.id, p])) as Record<string, Player>, [players]);
  const inLineup = useMemo(() => new Set([mvp, ...flex].filter(Boolean) as string[]), [mvp, flex]);

  const roster = ([mvp, ...flex].filter(Boolean) as string[]).map((id) => byId[id]).filter(Boolean);
  const spend = roster.reduce((s, p) => s + (Number(p.salary) || 0), 0);
  const remaining = cap - spend;
  const teams = [...new Set(roster.map((p) => p.team).filter(Boolean))];

  const available = teamRoster.filter((r) => !players.some((p) => p.espnId === r.id));

  const filtered = players.filter((p) => {
    if (team && p.team !== team) return false;
    const q = query.trim().toLowerCase();
        if (!q) return true;
    return (p.name + " " + p.team + " " + p.pos + " " + p.note).toLowerCase().includes(q);
  });

  function addPlayer() {
    const src = teamRoster.find((r) => r.id === pick);
    if (!src) return;
    setPlayers([
      ...players,
      {
        id: uid(),
        espnId: src.id,
        name: src.name,
        team,
        pos: src.pos,
        salary: draft.salary,
        tier: draft.tier,
        note: draft.note,
      },
    ]);
    setPick("");
    setDraft({ salary: "", tier: draft.tier, note: "" });
  }

  function removePlayer(id: string) {
    setPlayers(players.filter((p) => p.id !== id));
    if (mvp === id) setMvp(null);
    setFlex(flex.filter((f) => f !== id));
  }

  function cycleTier(id: string) {
    setPlayers(players.map((p) => (p.id === id ? { ...p, tier: TIERS[(TIERS.indexOf(p.tier) + 1) % 3] } : p)));
  }

  function slotIn(id: string, asMvp: boolean) {
    if (asMvp) {
      setFlex(flex.filter((f) => f !== id));
      setMvp(mvp === id ? null : id);
      return;
    }
    if (mvp === id) setMvp(null);
    if (flex.includes(id)) setFlex(flex.filter((f) => f !== id));
    else if (flex.length < 4) setFlex([...flex, id]);
  }

  function saveLineup() {
    if (roster.length === 0) return;
    setLineups([
      { id: uid(), label: label.trim() || "Untitled slip", mvp, flex: [...flex], spend, savedAt: new Date().toISOString() },
      ...lineups,
    ]);
    setLabel("");
  }

  function loadLineup(l: Slip) {
    setMvp(l.mvp && byId[l.mvp] ? l.mvp : null);
    setFlex((l.flex || []).filter((id) => byId[id]));
    setLabel(l.label);
  }

  const slipText = () =>
    [
      label || "Slip",
      mvp && byId[mvp] ? `MVP  ${byId[mvp].name} (${byId[mvp].team}) ${money(byId[mvp].salary)}` : "MVP  empty",
      ...flex.map((id) => `FLEX ${byId[id].name} (${byId[id].team}) ${money(byId[id].salary)}`),
      `Total ${money(spend)} of ${money(cap)}`,
    ].join("\n");

  return (
    <div className="nff">
      <style>{css}</style>
      <div className="wrap">
        <div className="head">
          <div>
            <h1>NFL Fun</h1>
            <p className="sub">
              Player notes and slips for FanDuel single game NFL. MVP scores 1.5x and costs the same as any flex spot.
            </p>
          </div>
          <div style={{ minWidth: 140 }}>
            <label className="sub" htmlFor="cap">Salary cap</label>
            <input id="cap" className="mono" type="number" step="500" value={cap}
              onChange={(e) => setCap(Number(e.target.value) || 0)} />
          </div>
        </div>

        {status && <p className="sub" style={{ marginBottom: 12 }}>{status}</p>}

        <div className="cols">
          <section>
            <h2>Players you track</h2>

            <div className="row r2">
              <select value={team} onChange={(e) => { setTeam(e.target.value); setPick(""); }} aria-label="Team">
                <option value="">All teams</option>
                {TEAMS.map((t) => <option key={t.abbr} value={t.abbr}>{t.name}</option>)}
              </select>
              <select value={pick} onChange={(e) => setPick(e.target.value)} aria-label="Player"
                disabled={!team || rosterState !== "ready"}>
                <option value="">
                  {!team
                    ? "Pick a team first"
                    : rosterState === "loading"
                    ? "Loading roster"
                    : rosterState === "error"
                    ? "Roster unavailable"
                    : "Pick a player"}
                </option>
                {available.map((r) => (
                  <option key={r.id} value={r.id}>{r.pos} · {r.name}</option>
                ))}
              </select>
            </div>
            <div className="row r3">
              <input className="mono" placeholder="Salary" type="number" step="100" value={draft.salary}
                onChange={(e) => setDraft({ ...draft, salary: e.target.value })} aria-label="Salary" />
              <select value={draft.tier}
                onChange={(e) => setDraft({ ...draft, tier: e.target.value as Tier })} aria-label="Tier">
                {TIERS.map((t) => <option key={t}>{t}</option>)}
              </select>
              <button onClick={addPlayer} disabled={!pick}>Add player</button>
            </div>
                        
            <textarea placeholder="Why you like or avoid him. Volume, matchup, red zone role, whatever you keep forgetting."
              value={draft.note} onChange={(e) => setDraft({ ...draft, note: e.target.value })} aria-label="Note" />

            <div style={{ marginTop: 18 }}>
              <input placeholder="Search your players" value={query}
                onChange={(e) => setQuery(e.target.value)} aria-label="Search players" />
            </div>

            {players.length === 0 && (
              <p className="empty-state">
                Nothing here yet. Add the players you keep coming back to and the reason why, so next Sunday you are not starting from memory.
              </p>
            )}

            {TIERS.map((tier) => {
              const group = filtered.filter((p) => p.tier === tier);
              if (!group.length) return null;
              return (
                <div key={tier}>
                  <div className="tierhead"><span>{tier}</span><span className="mono">{group.length}</span></div>
                  {group.map((p) => (
                    <div key={p.id} className={"p" + (inLineup.has(p.id) ? " used" : "")}>
                      <span className={"dot " + p.tier} />
                      <div className="grow">
                        <div>
                          <span className="name">{p.name}</span>{" "}
                          <span className="meta mono">
                            {[p.team, p.pos, p.salary ? money(p.salary) : null].filter(Boolean).join(" · ")}
                          </span>
                        </div>
                        {p.note && <div className="note">{p.note}</div>}
                      </div>
                      <div className="acts">
                        <button className="ghost" style={{ padding: "3px 8px", fontSize: "0.75rem" }}
                          onClick={() => slotIn(p.id, true)}>{mvp === p.id ? "MVP ✓" : "MVP"}</button>
                        <button className="ghost" style={{ padding: "3px 8px", fontSize: "0.75rem" }}
                          onClick={() => slotIn(p.id, false)}
                          disabled={!flex.includes(p.id) && flex.length >= 4}>
                          {flex.includes(p.id) ? "Flex ✓" : "Flex"}
                        </button>
                        <button className="link" onClick={() => cycleTier(p.id)}>tier</button>
                        <button className="link" onClick={() => removePlayer(p.id)}>remove</button>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}
          </section>

          <section>
            <h2>Current slip</h2>
            <div className="slip">
              <div className="slot mvpslot">
                <span className="lab">MVP</span>
                <div className="grow">
                  {mvp && byId[mvp] ? (
                    <>
                      <span className="nm">{byId[mvp].name}</span>{" "}
                      <span className="mono" style={{ color: "var(--muted)", fontSize: "0.8rem" }}>
                        {byId[mvp].team} · {money(byId[mvp].salary)}
                      </span>
                    </>
                  ) : (
                    <span className="empty">Pick your 1.5x player</span>
                  )}
                </div>
                {mvp && <button className="link" onClick={() => setMvp(null)}>clear</button>}
              </div>

              {[0, 1, 2, 3].map((i) => {
                const p = byId[flex[i]];
                return (
                  <div className="slot" key={i}>
                    <span className="lab">FLEX</span>
                    <div className="grow">
                      {p ? (
                        <>
                          <span>{p.name}</span>{" "}
                          <span className="mono" style={{ color: "var(--muted)", fontSize: "0.8rem" }}>
                            {p.team} · {money(p.salary)}
                          </span>
                        </>
                      ) : (
                        <span className="empty">Empty</span>
                      )}
                    </div>
                    {p && <button className="link" onClick={() => setFlex(flex.filter((f) => f !== p.id))}>clear</button>}
                  </div>
                );
              })}

              <div style={{ marginTop: 14 }}>
                <div className="meter">
                  <i className={remaining < 0 ? "over" : ""}
                    style={{ width: Math.min(100, cap ? (spend / cap) * 100 : 0) + "%" }} />
                </div>
                <div className="capline">
                  <span className="mono">{money(spend)} of {money(cap)}</span>
                  <span className={"mono " + (remaining < 0 ? "over" : "")}>
                    {remaining < 0 ? money(-remaining) + " over" : money(remaining) + " left"}
                  </span>
                </div>
                {roster.length > 0 && (
                  <div className="capline" style={{ color: "var(--muted)", marginTop: 2 }}>
                    <span>{roster.length} of 5 filled</span>
                    <span>{teams.length ? teams.join(" / ") : "no teams set"}</span>
                  </div>
                )}
                {teams.length === 1 && roster.length > 1 && (
                  <p className="flag">
                    All five from one team. Most single game contests require players from both teams, so check the contest rules.
                  </p>
                )}
              </div>

              <div className="row r2" style={{ marginTop: 14, marginBottom: 0 }}>
                <input placeholder="Name this slip" value={label}
                  onChange={(e) => setLabel(e.target.value)} aria-label="Slip name" />
                <button onClick={saveLineup} disabled={roster.length === 0}>Save slip</button>
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                <button className="ghost" onClick={() => { setMvp(null); setFlex([]); setLabel(""); }}>Clear slip</button>
                <button className="ghost" onClick={() => navigator.clipboard?.writeText(slipText())}>Copy as text</button>
              </div>
            </div>

            <h2 style={{ marginTop: 24 }}>Saved slips</h2>
            {lineups.length === 0 && (
              <p className="empty-state">Slips you save show up here so you can reuse a build you liked.</p>
            )}
            {lineups.map((l) => (
              <div className="saved" key={l.id}>
                <div className="t">
                  <strong style={{ fontWeight: 500 }}>{l.label}</strong>
                  <span className="mono" style={{ fontSize: "0.8rem", color: "var(--muted)" }}>{money(l.spend)}</span>
                </div>
                <div className="sub" style={{ marginTop: 2 }}>
                  {([l.mvp, ...l.flex].filter((id): id is string => !!id && !!byId[id]))
                    .map((id, i) => (i === 0 && l.mvp ? byId[id].name + " (MVP)" : byId[id].name))
                    .join(", ") || "players no longer on your board"}
                </div>
                <div style={{ marginTop: 4 }}>
                  <button className="link" onClick={() => loadLineup(l)}>load</button>
                  <button className="link" onClick={() => setLineups(lineups.filter((x) => x.id !== l.id))}>delete</button>
                </div>
              </div>
            ))}
          </section>
        </div>
      </div>
    </div>
  );
}
