import React, { useMemo, useState } from "react";

/**
 * IndoorNavigatorDemo.jsx
 * A self-contained React component (Tailwind CSS assumed) that shows
 * a two-floor indoor navigation demo using Dijkstra shortest-path.
 *
 * Usage: drop this file into a create-react-app / Next.js page that
 * already includes Tailwind CSS and render <IndoorNavigatorDemo />.
 */

// ------- DATA: Floors, Nodes, Edges ------- //
const FLOORS = {
  ground: {
    label: "Ground Floor",
    nodes: [
      { id: "g_accounts", name: "Accounts Section", x: 14, y: 28 },
      { id: "g_exam", name: "Exam Section", x: 25, y: 28 },
      { id: "g_principal", name: "Principal's Office", x: 42, y: 21 },
      { id: "g_reception", name: "Reception", x: 48, y: 34 },
      { id: "g_cafe", name: "Cafe", x: 86, y: 38 },
      { id: "g_stairs", name: "Stairs", x: 56, y: 38 },
      { id: "g_glh02", name: "GLH02", x: 18, y: 62 },
      { id: "g_glh03", name: "GLH03", x: 53, y: 62 },
      { id: "g_chem", name: "Chemistry Lab", x: 78, y: 34 },
    ],
    edges: [
      ["g_accounts", "g_exam"],
      ["g_exam", "g_principal"],
      ["g_principal", "g_reception"],
      ["g_reception", "g_stairs"],
      ["g_stairs", "g_chem"],
      ["g_chem", "g_cafe"],
      ["g_accounts", "g_glh02"],
      ["g_reception", "g_glh03"],
    ],
  },
  first: {
    label: "First Floor",
    nodes: [
      { id: "f_aiml", name: "AIML Department", x: 10, y: 44 },
      { id: "f_flh02", name: "FLH02", x: 18, y: 28 },
      { id: "f_flh01", name: "FLH01", x: 30, y: 28 },
      { id: "f_girls", name: "Girls Washroom", x: 41, y: 23 },
      { id: "f_boys", name: "Boys Washroom", x: 74, y: 23 },
      { id: "f_flh03", name: "FLH03", x: 85, y: 28 },
      { id: "f_flh04", name: "FLH04", x: 15, y: 70 },
      { id: "f_stairs", name: "Stairs", x: 56, y: 38 },
    ],
    edges: [
      ["f_flh02", "f_flh01"],
      ["f_flh01", "f_girls"],
      ["f_girls", "f_stairs"],
      ["f_stairs", "f_boys"],
      ["f_boys", "f_flh03"],
      ["f_aiml", "f_flh02"],
      ["f_aiml", "f_flh04"],
    ],
  },
};

// Cross-floor connection (stairs ↕)
const CROSS_FLOOR_EDGES = [["g_stairs", "f_stairs"]];

// Utility: build a graph (maps and weights)
function buildGraph() {
  const allNodes: any[] = [];
  const byId = new Map<string, any>();
  const edges = new Map<string, Map<string, number>>();

  Object.entries(FLOORS).forEach(([key, f]: any) => {
    f.nodes.forEach((n: any) => {
      const node = { ...n, floor: key };
      allNodes.push(node);
      byId.set(n.id, node);
    });
    f.edges.forEach((e: [string, string]) => {
      const [a, b] = e;
      const add = (u: string, v: string) => {
        if (!edges.has(u)) edges.set(u, new Map());
        const from = byId.get(u);
        const to = byId.get(v);
        if (!from || !to) return;
        const w = distance(from, to);
        edges.get(u)!.set(v, w);
      };
      add(a, b);
      add(b, a);
    });
  });

  // cross-floor edges
  CROSS_FLOOR_EDGES.forEach(([a, b]) => {
    if (!edges.has(a)) edges.set(a, new Map());
    if (!edges.has(b)) edges.set(b, new Map());
    const w = 12; // penalty for changing floors
    edges.get(a)!.set(b, w);
    edges.get(b)!.set(a, w);
  });

  return { allNodes, byId, edges };
}

function distance(a: any, b: any) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.hypot(dx, dy);
}

// Dijkstra shortest path
function dijkstra(graph: ReturnType<typeof buildGraph>, startId: string, endId: string) {
  const { edges } = graph;
  const dist = new Map<string, number>();
  const prev = new Map<string, string | null>();
  const visited = new Set<string>();
  const pq: [string, number][] = [];

  const push = (id: string, d: number) => {
    pq.push([id, d]);
    pq.sort((a, b) => a[1] - b[1]);
  };

  push(startId, 0);
  dist.set(startId, 0);
  prev.set(startId, null);

  while (pq.length) {
    const [u] = pq.shift()!;
    if (visited.has(u)) continue;
    visited.add(u);
    if (u === endId) break;
    const nbrs = edges.get(u) || new Map();
    for (const [v, w] of nbrs) {
      const nd = (dist.get(u) ?? Infinity) + w;
      if (nd < (dist.get(v) ?? Infinity)) {
        dist.set(v, nd);
        prev.set(v, u);
        push(v, nd);
      }
    }
  }

  if (!prev.has(endId)) return [];
  const path: string[] = [];
  let cur: string | null = endId;
  while (cur) {
    path.unshift(cur);
    cur = prev.get(cur) ?? null;
  }
  return path;
}

// Dot (node marker)
const Dot = ({ x, y, active, label, onClick }: any) => {
  return (
    <div
      onClick={onClick}
      className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer ${active ? "z-20" : "z-10"}`}
      style={{ left: `${x}%`, top: `${y}%` }}
      title={label}
    >
      <div className={`w-3 h-3 rounded-full ${active ? "bg-blue-600" : "bg-gray-700"}`} />
      <div className="text-xs mt-1 px-1 bg-white/90 rounded shadow whitespace-nowrap">{label}</div>
    </div>
  );
};

function FloorCanvas({ floorKey, graph, path, onNodeClick }: any) {
  const floor = FLOORS[floorKey as keyof typeof FLOORS];
  const nodesById: Map<string, any> = graph.byId;

  // Build lines belonging to this floor
  const lines: { x1: number; y1: number; x2: number; y2: number }[] = [];
  if (path?.length) {
    for (let i = 0; i < path.length - 1; i++) {
      const a = nodesById.get(path[i]);
      const b = nodesById.get(path[i + 1]);
      if (!a || !b) continue;
      // only draw the segment on a floor if at least one endpoint belongs to this floor
      if (a.floor !== floorKey && b.floor !== floorKey) continue;
      lines.push({ x1: a.x, y1: a.y, x2: b.x, y2: b.y });
    }
  }

  return (
    <div className="relative w-full aspect-[16/9] bg-white border rounded-2xl shadow overflow-hidden">
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs>
          <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
            <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#e5e7eb" strokeWidth="0.3" />
          </pattern>
        </defs>
        <rect width="100" height="100" fill="url(#grid)" />
        {lines.map((ln, idx) => (
          <line key={idx} x1={ln.x1} y1={ln.y1} x2={ln.x2} y2={ln.y2} stroke="#2563eb" strokeWidth={1.2} />
        ))}
      </svg>

      {/* Nodes */}
      {floor.nodes.map((n: any) => (
        <Dot
          key={n.id}
          x={n.x}
          y={n.y}
          label={n.name}
          active={path?.includes(n.id)}
          onClick={() => onNodeClick(n.id)}
        />
      ))}

      <div className="absolute left-3 top-3 text-xs px-2 py-1 rounded bg-white/90 border">{floor.label}</div>
    </div>
  );
}

export default function IndoorNavigatorDemo() {
  const graph = useMemo(() => buildGraph(), []);
  const allOptions = useMemo(() => {
    return Array.from(graph.byId.values()).map((n: any) => ({ id: n.id, label: `${n.name} (${FLOORS[n.floor].label})` }));
  }, [graph]);

  const [start, setStart] = useState<string>("g_accounts");
  const [end, setEnd] = useState<string>("f_flh03");
  const [path, setPath] = useState<string[]>([]);
  const [floorKey, setFloorKey] = useState<keyof typeof FLOORS>("ground");

  const handleRoute = () => {
    const p = dijkstra(graph, start, end);
    setPath(p);
    const startFloor = graph.byId.get(start)?.floor || "ground";
    setFloorKey(startFloor);
  };

  // click node on canvas: if ctrlKey pressed make it destination, else make it start
  const handleNodeClick = (id: string) => {
    // simple toggle logic: first click sets start, second sets end if start is same
    if (id === start) return;
    // if user clicks while holding Shift -> set end, else set start
    // Note: we can't reliably read keyboard state here, so keep straightforward: if id==end -> set start, else if id==start -> set end
    // For convenience: if id equals end -> set start to id, otherwise if id not start set start
    setStart(id);
  };

  const switchToOtherFloorInPath = () => {
    if (!path?.length) return;
    const current = floorKey;
    for (const id of path) {
      const f = graph.byId.get(id)?.floor;
      if (f && f !== current) {
        setFloorKey(f);
        return;
      }
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-4">
      <h1 className="text-2xl font-semibold">Indoor Navigation – Ground & First Floor (Demo)</h1>
      <p className="text-sm text-gray-600">Uses your labeled points only (no AR). Edit coordinates in the code to fine‑tune positions on your map.</p>

      <div className="grid md:grid-cols-3 gap-3 items-end">
        <div>
          <label className="text-xs text-gray-600">Start</label>
          <select value={start} onChange={(e) => setStart(e.target.value)} className="w-full border rounded-lg px-3 py-2">
            {allOptions.map((o) => (
              <option key={o.id} value={o.id}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-600">Destination</label>
          <select value={end} onChange={(e) => setEnd(e.target.value)} className="w-full border rounded-lg px-3 py-2">
            {allOptions.map((o) => (
              <option key={o.id} value={o.id}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex gap-2">
          <button onClick={handleRoute} className="px-4 py-2 rounded-xl bg-blue-600 text-white shadow">Route</button>
          <select value={floorKey} onChange={(e) => setFloorKey(e.target.value as any)} className="border rounded-lg px-3 py-2">
            {Object.keys(FLOORS).map((k) => (
              <option key={k} value={k}>
                {FLOORS[k as keyof typeof FLOORS].label}
              </option>
            ))}
          </select>
          <button onClick={switchToOtherFloorInPath} className="px-3 py-2 rounded-xl border">Next Floor in Path</button>
        </div>
      </div>

      <FloorCanvas floorKey={floorKey} graph={graph} path={path} onNodeClick={handleNodeClick} />

      <details className="text-sm text-gray-700">
        <summary className="cursor-pointer">How to customize (click)</summary>
        <ol className="list-decimal ml-5 space-y-1 mt-2">
          <li>Edit <code>FLOORS.ground.nodes</code> and <code>FLOORS.first.nodes</code> to add/remove rooms. Use meaningful IDs.</li>
          <li>Update each floor's <code>edges</code> array to reflect corridor connections. Edges are undirected.</li>
          <li>Use the grid to estimate coordinates (x,y in %). The stairs cross‑floor link is defined in <code>CROSS_FLOOR_EDGES</code>.</li>
          <li>Styling: This demo uses Tailwind utility classes; adjust as you like.</li>
        </ol>
      </details>
    </div>
  );
}
