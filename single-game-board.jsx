import { useState, useEffect, useMemo } from "react";

const STORE_KEY = "sgb:board";
const TIERS = ["Core", "Watch", "Fade"];
const POSITIONS = ["QB", "RB", "WR", "TE", "K", "D"];

const css = `
@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500;600&display=swap');

.sgb {
  --ink: #16202b;
  --paper: #fbfaf7;
  --rule: #d9d5cd;
  --muted: #6b7580;
  --mvp: #c8102e;
  --good: #1f6f4a;
  --warn: #a2470f;
  font-family: 'IBM Plex Sans', system-ui, sans-serif;
  color: var(--ink);
  background: var(--paper);
  padding: 20px;
  min-height: 100%;
  line-height: 1.45;
}
.sgb * { box-sizing: border-box; }
.sgb h1 { font-size: 1.35rem; font-weight: 600; margin: 0; letter-spacing: -0.01em; }
.sgb h2 { font-size: 0.95rem; font-weight: 600; margin: 0 0 10px; }
.sgb .sub { color: var(--muted); font-size: 0.8rem; margin: 4px 0 0; }
.sgb .mono { font-family: 'IBM Plex Mono', ui-monospace, monospace; font-variant-numeric: tabular-nums; }

.sgb .head { display: flex; flex-wrap: wrap; gap: 12px; align-items: flex-end; justify-content: space-between; border-bottom: 2px solid var(--ink); padding-bottom: 12px; margin-bottom: 20px; }
.sgb .cols { display: grid; grid-template-columns: 1fr; gap: 24px; }
@media (min-width: 860px) { .sgb .cols { grid-template-columns: 1.15fr 1fr; gap: 32px; } }

.sgb input, .sgb select, .sgb textarea {
  font: inherit; color: inherit; background: #fff;
  border: 1px solid var(--rule); border-radius: 3px; padding: 7px 9px; width: 100%;
}
.sgb textarea { resize: vertical; min-height: 52px; }
.sgb input:focus-visible, .sgb select:focus-visible, .sgb textarea:focus-visible, .sgb button:focus-visible {
  outline: 2px solid var(--ink); outline-offset: 1px;
}
.sgb .row { display: grid; gap: 8px; margin-bottom: 8px; }
.sgb .r4 { grid-template-columns: 2fr 0.9fr 0.9fr 1.1fr; }
.sgb .r2 { grid-template-columns: 1fr 1fr; }
@media (max-width: 560px) { .sgb .r4 { grid-template-columns: 1fr 1fr; } }

.sgb button { font: inherit; cursor: pointer; border-radius: 3px; border: 1px solid var(--ink); background: var(--ink); color: #fff; padding: 7px 14px; }
.sgb button.ghost { background: transparent; color: var(--ink); border-color: var(--rule); }
.sgb button.ghost:hover { border-color: var(--ink); }
.sgb button.link { background: none; border: none; color: var(--muted); padding: 2px 4px; text-decoration: underline; font-size: 0.78rem; }
.sgb button.link:hover { color: var(--ink); }
.sgb button:disabled { opacity: 0.4; cursor: not-allowed; }

.sgb .tierhead { font-size: 0.78rem; font-weight: 600; color: var(--muted); border-bottom: 1px solid var(--rule); padding-bottom: 4px; margin: 18px 0 6px; display: flex; justify-content: space-between; }
.sgb .p { display: flex; gap: 10px; align-items: baseline; padding: 8px 0; border-bottom: 1px solid var(--rule); }
.sgb .p .name { font-weight: 500; }
.sgb .p .meta { color: var(--muted); font-size: 0.78rem; }
.sgb .p .note { color: var(--muted); font-size: 0.8rem; margin-top: 2px; }
.sgb .p .grow { flex: 1; min-width: 0; }
.sgb .p .acts { display: flex; gap: 2px; flex-shrink: 0; align-items: center; }
.sgb .p.used { opacity: 0.45; }
.sgb .dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; margin-top: 7px; }
.sgb .dot.Core { background: var(--mvp); }
.sgb .dot.Watch { background: var(--muted); }
.sgb .dot.Fade { background: transparent; border: 1px solid var(--rule); }

.sgb .slip { border: 1px solid var(--ink); border-radius: 3px; background: #fff; padding: 16px; }
.sgb .slot { display: flex; align-items: center; gap: 10px; padding: 9px 0; border-bottom: 1px dashed var(--rule); }
.sgb .slot .lab { font-size: 0.7rem; font-weight: 600; color: var(--muted); width: 40px; flex-shrink: 0; }
.sgb .slot.mvp { border-bottom: 1px solid var(--mvp); padding: 12px 0; }
.sgb .slot.mvp .lab { color: var(--mvp); font-size: 0.78rem; }
.sgb .slot.mvp .nm { font-size: 1.05rem; font-weight: 600; }
.sgb .slot .empty { color: var(--muted); font-size: 0.85rem; font-style: italic; }
.sgb .slot .grow { flex: 1; min-width: 0; }

.sgb .meter { height: 8px; background: #ece9e2; border-radius: 999px; overflow: hidden; margin: 6px 0 4px; }
.sgb .meter i { display: block; height: 100%; background: var(--good); transition: width 180ms ease; }
.sgb .meter i.over { background: var(--mvp); }
.sgb .capline { display: flex; justify-content: space-between; font-size: 0.82rem; }
.sgb .over { color: var(--mvp); font-weight: 600; }

.sgb .saved { border: 1px solid var(--rule); border-radius: 3px; padding: 10px 12px; margin-bottom: 8px; background: #fff; }
.sgb .saved .t { display: flex; justify-content: space-between; gap: 8px; align-items: baseline; }
.sgb .empty-state { color: var(--muted); font-size: 0.85rem; padding: 14px 0; }
.sgb .flag { font-size: 0.75rem; color: var(--warn); margin-top: 8px; }
`;

const money = (n) => "$" + (Number(n) || 0).toLocaleString("en-US");
const uid = () => Math.random().toString(36).slice(2, 9);

export default function SingleGameBoard() {
  const [players, setPlayers] = useState([]);
  const [lineups, setLineups] = useState([]);
  const [cap, setCap] = useState(60000);
  const [mvp, setMvp] = useState(null);
  const [flex, setFlex] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [status, setStatus] = useState("Loading your board");
  const [query, setQuery] = useState("");
  const [label, setLabel] = useState("");

  const [draft, setDraft] = useState({ name: "", team: "", pos: "WR", salary: "", tier: "Core", note: "" });

  useEffect(() => {
    (async () => {
      try {
        const res = await window.storage.get(STORE_KEY);
        const data = res ? JSON.parse(res.value) : null;
        if (data) {
          setPlayers(data.players || []);
          setLineups(data.lineups || []);
          if (data.cap) setCap(data.cap);
        }
        setStatus("");
      } catch {
        setStatus("");
      }
      setLoaded(true);
    })();
  }, []);

  useEffect(() => {
    if (!loaded) return;
    (async () => {
      try {
        await window.storage.set(STORE_KEY, JSON.stringify({ players, lineups, cap }));
      } catch {
        setStatus("Could not save. Your last change is only in this tab.");
      }
    })();
  }, [players, lineups, cap, loaded]);

  const byId = useMemo(() => Object.fromEntries(players.map((p) => [p.id, p])), [players]);
  const inLineup = useMemo(() => new Set([mvp, ...flex].filter(Boolean)), [mvp, flex]);

  const roster = [mvp, ...flex].filter(Boolean).map((id) => byId[id]).filter(Boolean);
  const spend = roster.reduce((s, p) => s + (Number(p.salary) || 0), 0);
  const remaining = cap - spend;
  const teams = [...new Set(roster.map((p) => p.team).filter(Boolean))];

  const filtered = players.filter((p) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (p.name + " " + p.team + " " + p.pos + " " + p.note).toLowerCase().includes(q);
  });

  function addPlayer() {
    if (!draft.name.trim()) return;
    setPlayers([...players, { ...draft, name: draft.name.trim(), team: draft.team.trim().toUpperCase(), id: uid() }]);
    setDraft({ name: "", team: draft.team, pos: draft.pos, salary: "", tier: "Core", note: "" });
  }

  function removePlayer(id) {
    setPlayers(players.filter((p) => p.id !== id));
    if (mvp === id) setMvp(null);
    setFlex(flex.filter((f) => f !== id));
  }

  function cycleTier(id) {
    setPlayers(players.map((p) => (p.id === id ? { ...p, tier: TIERS[(TIERS.indexOf(p.tier) + 1) % 3] } : p)));
  }

  function slotIn(id, asMvp) {
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

  function loadLineup(l) {
    setMvp(l.mvp && byId[l.mvp] ? l.mvp : null);
    setFlex((l.flex || []).filter((id) => byId[id]));
    setLabel(l.label);
  }

  const slipText = () =>
    [
      label || "Slip",
      mvp && byId[mvp] ? `MVP  ${byId[mvp].name} (${byId[mvp].team}) ${money(byId[mvp].salary)}` : "MVP  empty",
      ...flex.map((id, i) => `FLEX ${byId[id].name} (${byId[id].team}) ${money(byId[id].salary)}`),
      `Total ${money(spend)} of ${money(cap)}`,
    ].join("\n");

  return (
    <div className="sgb">
      <style>{css}</style>

      <div className="head">
        <div>
          <h1>Single game board</h1>
          <p className="sub">Your player notes and slips for FanDuel single game NFL. MVP scores 1.5x and costs the same as any flex spot.</p>
        </div>
        <div style={{ minWidth: 140 }}>
          <label className="sub" htmlFor="cap">Salary cap</label>
          <input id="cap" className="mono" type="number" step="500" value={cap} onChange={(e) => setCap(Number(e.target.value) || 0)} />
        </div>
      </div>

      {status && <p className="sub" style={{ marginBottom: 12 }}>{status}</p>}

      <div className="cols">
        <section>
          <h2>Players you track</h2>

          <div className="row r4">
            <input placeholder="Player name" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              onKeyDown={(e) => e.key === "Enter" && addPlayer()} aria-label="Player name" />
            <input placeholder="Team" value={draft.team} onChange={(e) => setDraft({ ...draft, team: e.target.value })} aria-label="Team" />
            <select value={draft.pos} onChange={(e) => setDraft({ ...draft, pos: e.target.value })} aria-label="Position">
              {POSITIONS.map((p) => <option key={p}>{p}</option>)}
            </select>
            <input className="mono" placeholder="Salary" type="number" step="100" value={draft.salary}
              onChange={(e) => setDraft({ ...draft, salary: e.target.value })} aria-label="Salary" />
          </div>
          <div className="row r2">
            <select value={draft.tier} onChange={(e) => setDraft({ ...draft, tier: e.target.value })} aria-label="Tier">
              {TIERS.map((t) => <option key={t}>{t}</option>)}
            </select>
            <button onClick={addPlayer}>Add player</button>
          </div>
          <textarea placeholder="Why you like or avoid him. Volume, matchup, red zone role, whatever you keep forgetting."
            value={draft.note} onChange={(e) => setDraft({ ...draft, note: e.target.value })} aria-label="Note" />

          <div style={{ marginTop: 18 }}>
            <input placeholder="Search your players" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search players" />
          </div>

          {players.length === 0 && (
            <p className="empty-state">Nothing here yet. Add the players you keep coming back to and the reason why, so next Sunday you are not starting from memory.</p>
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
                      <div><span className="name">{p.name}</span>{" "}
                        <span className="meta mono">{[p.team, p.pos, p.salary ? money(p.salary) : null].filter(Boolean).join(" · ")}</span>
                      </div>
                      {p.note && <div className="note">{p.note}</div>}
                    </div>
                    <div className="acts">
                      <button className="ghost" style={{ padding: "3px 8px", fontSize: "0.75rem" }}
                        onClick={() => slotIn(p.id, true)}>{mvp === p.id ? "MVP ✓" : "MVP"}</button>
                      <button className="ghost" style={{ padding: "3px 8px", fontSize: "0.75rem" }}
                        onClick={() => slotIn(p.id, false)} disabled={!flex.includes(p.id) && flex.length >= 4}>
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
            <div className="slot mvp">
              <span className="lab">MVP</span>
              <div className="grow">
                {mvp && byId[mvp]
                  ? <><span className="nm">{byId[mvp].name}</span> <span className="meta mono" style={{ color: "var(--muted)", fontSize: "0.8rem" }}>{byId[mvp].team} · {money(byId[mvp].salary)}</span></>
                  : <span className="empty">Pick your 1.5x player</span>}
              </div>
              {mvp && <button className="link" onClick={() => setMvp(null)}>clear</button>}
            </div>

            {[0, 1, 2, 3].map((i) => {
              const p = byId[flex[i]];
              return (
                <div className="slot" key={i}>
                  <span className="lab">FLEX</span>
                  <div className="grow">
                    {p ? <><span>{p.name}</span> <span className="mono" style={{ color: "var(--muted)", fontSize: "0.8rem" }}>{p.team} · {money(p.salary)}</span></>
                      : <span className="empty">Empty</span>}
                  </div>
                  {p && <button className="link" onClick={() => setFlex(flex.filter((f) => f !== p.id))}>clear</button>}
                </div>
              );
            })}

            <div style={{ marginTop: 14 }}>
              <div className="meter"><i className={remaining < 0 ? "over" : ""} style={{ width: Math.min(100, cap ? (spend / cap) * 100 : 0) + "%" }} /></div>
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
                <p className="flag">All five from one team. Most single game contests require players from both teams, so check the contest rules.</p>
              )}
            </div>

            <div className="row r2" style={{ marginTop: 14, marginBottom: 0 }}>
              <input placeholder="Name this slip" value={label} onChange={(e) => setLabel(e.target.value)} aria-label="Slip name" />
              <button onClick={saveLineup} disabled={roster.length === 0}>Save slip</button>
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              <button className="ghost" onClick={() => { setMvp(null); setFlex([]); setLabel(""); }}>Clear slip</button>
              <button className="ghost" onClick={() => navigator.clipboard?.writeText(slipText())}>Copy as text</button>
            </div>
          </div>

          <h2 style={{ marginTop: 24 }}>Saved slips</h2>
          {lineups.length === 0 && <p className="empty-state">Slips you save show up here so you can reuse a build you liked.</p>}
          {lineups.map((l) => (
            <div className="saved" key={l.id}>
              <div className="t">
                <strong style={{ fontWeight: 500 }}>{l.label}</strong>
                <span className="mono" style={{ fontSize: "0.8rem", color: "var(--muted)" }}>{money(l.spend)}</span>
              </div>
              <div className="sub" style={{ marginTop: 2 }}>
                {[l.mvp, ...l.flex].filter((id) => byId[id]).map((id, i) => (i === 0 && l.mvp ? byId[id].name + " (MVP)" : byId[id].name)).join(", ") || "players no longer on your board"}
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
  );
}
