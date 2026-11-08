import React, { useId, useLayoutEffect, useRef, useState } from "react";

import "./FlowChart.scss";

// Interactive "How it works" diagram for a project, drawn as SVG from data:
//
//   nodes: [{ id, title, sub?, detail, col: 0|1|2, row }]
//   edges: [[fromId, toId, { label?, via?: "lane" | "elbow", side? }?]]
//
// - Dots travel along every connector, staggered row by row, so the diagram
//   reads top to bottom like data flowing through the system.
// - Each step is a button. The selected step is highlighted, the connectors
//   touching it turn into animated accent dashes, and its `detail` shows in
//   the panel under the chart. The first step starts selected.
//
// Routing (keep the grid cells an edge passes through empty):
// - downward: straight in one column; otherwise down to the gap just above
//   the target, across, and down (branches fan out and merge cleanly);
// - same row: straight across between the facing sides;
// - upward (a loop back): out the side, along the outer lane on `side`
//   (default right), and into the target's same side. { via: "lane" } routes
//   a downward edge this way too, to keep it clear of other lines.
// - { via: "elbow" } (upward): across from the source's side to the target's
//   column, then up into its bottom.

const WIDTH = 720;
const PAD_Y = 30;
const NODE_W = 188;
const NODE_H = 48;
const COL_X = [140, 360, 580]; // column centres
const ROW_PITCH = 86;
const GAP_MID = (ROW_PITCH - NODE_H) / 2;
const LANE = { left: 28, right: WIDTH - 28 };
const PARTICLE_DUR = 1.8; // seconds per trip
const PARTICLE_STAGGER = 0.5; // seconds between rows

const cx = (n) => COL_X[n.col];
const left = (n) => cx(n) - NODE_W / 2;
const right = (n) => cx(n) + NODE_W / 2;
const top = (n) => PAD_Y + n.row * ROW_PITCH;
const bottom = (n) => top(n) + NODE_H;
const middle = (n) => top(n) + NODE_H / 2;

// Returns the path plus where its label goes ([x, y, text-anchor]).
function route(a, b, { side = "right", via } = {}) {
  if (via === "elbow" && b.row < a.row) {
    const toLeft = b.col < a.col;
    const x1 = toLeft ? left(a) : right(a);
    return {
      d: `M ${x1} ${middle(a)} H ${cx(b)} V ${bottom(b)}`,
      at: [(x1 + cx(b)) / 2, middle(a) - 6, "middle"],
    };
  }

  if (b.row > a.row && via !== "lane") {
    if (a.col === b.col) {
      return {
        d: `M ${cx(a)} ${bottom(a)} V ${top(b)}`,
        at: [cx(a) + 8, (bottom(a) + top(b)) / 2 + 4, "start"],
      };
    }
    const y = top(b) - GAP_MID;
    return {
      d: `M ${cx(a)} ${bottom(a)} V ${y} H ${cx(b)} V ${top(b)}`,
      at: [cx(b), y - 6, "middle"],
    };
  }

  if (b.row === a.row && via !== "lane") {
    const toLeft = b.col < a.col;
    const x1 = toLeft ? left(a) : right(a);
    const x2 = toLeft ? right(b) : left(b);
    return {
      d: `M ${x1} ${middle(a)} H ${x2}`,
      at: [(x1 + x2) / 2, middle(a) - 6, "middle"],
    };
  }

  const onRight = side !== "left";
  const lane = LANE[onRight ? "right" : "left"];
  const x1 = onRight ? right(a) : left(a);
  const x2 = onRight ? right(b) : left(b);
  // Label the longer of the two horizontal runs.
  const runA = Math.abs(lane - x1);
  const runB = Math.abs(lane - x2);
  const at =
    runA >= runB
      ? [(x1 + lane) / 2, middle(a) - 6, "middle"]
      : [(x2 + lane) / 2, middle(b) - 6, "middle"];
  return { d: `M ${x1} ${middle(a)} H ${lane} V ${middle(b)} H ${x2}`, at };
}

const FlowChart = ({ flow, title }) => {
  const uid = useId().replace(/:/g, "");
  const scroller = useRef(null);
  const svgRef = useRef(null);
  const [selectedId, setSelectedId] = useState(flow.nodes[0]?.id);

  // A different project reuses this component: reset to its first step.
  useLayoutEffect(() => {
    setSelectedId(flow.nodes[0]?.id);
  }, [flow]);

  // On narrow screens the chart scrolls sideways; start on the centre column,
  // where every flow's main path runs.
  useLayoutEffect(() => {
    const el = scroller.current;
    if (el && el.scrollWidth > el.clientWidth) {
      el.scrollLeft = (el.scrollWidth - el.clientWidth) / 2;
    }
  }, [flow]);

  // Animate only while the chart is on screen: once it scrolls out of view the
  // dots and dashes stop, so they cost nothing while reading the rest.
  useLayoutEffect(() => {
    const card = scroller.current;
    const svg = svgRef.current;
    if (!card || !svg || !("IntersectionObserver" in window)) return undefined;
    const observer = new IntersectionObserver(([entry]) => {
      const visible = entry.isIntersecting;
      card.classList.toggle("is-paused", !visible);
      if (visible) svg.unpauseAnimations();
      else svg.pauseAnimations();
    });
    observer.observe(card);
    return () => observer.disconnect();
  }, []);

  const byId = Object.fromEntries(flow.nodes.map((n) => [n.id, n]));
  const rows = Math.max(...flow.nodes.map((n) => n.row)) + 1;
  const height = PAD_Y * 2 + (rows - 1) * ROW_PITCH + NODE_H;
  const selected = byId[selectedId] || flow.nodes[0];

  const edges = flow.edges
    .map(([from, to, opts = {}]) => {
      const a = byId[from];
      const b = byId[to];
      if (!a || !b) return null;
      return {
        key: `${from}-${to}`,
        ...route(a, b, opts),
        label: opts.label,
        active: from === selected.id || to === selected.id,
        begin: `${(a.row * PARTICLE_STAGGER).toFixed(1)}s`,
      };
    })
    .filter(Boolean);

  const select = (id) => setSelectedId(id);
  const onKey = (event, id) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      select(id);
    }
  };

  return (
    <div className="app__flow">
      <div className="app__flow-card" ref={scroller}>
        <svg
          ref={svgRef}
          className="app__flow-svg"
          viewBox={`0 0 ${WIDTH} ${height}`}
          role="img"
          aria-label={`${title} flow`}
        >
          <defs>
            <marker
              id={`${uid}-arrow`}
              viewBox="0 0 10 10"
              refX="9"
              refY="5"
              markerWidth="7"
              markerHeight="7"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" className="app__flow-arrow" />
            </marker>
            <marker
              id={`${uid}-arrow-active`}
              viewBox="0 0 10 10"
              refX="9"
              refY="5"
              markerWidth="7"
              markerHeight="7"
              orient="auto-start-reverse"
            >
              <path
                d="M 0 0 L 10 5 L 0 10 z"
                className="app__flow-arrow is-active"
              />
            </marker>
          </defs>

          {edges.map((e) => (
            <g key={e.key}>
              <path
                d={e.d}
                fill="none"
                strokeWidth={e.active ? 1.75 : 1.25}
                className={`app__flow-edge${e.active ? " is-active" : ""}`}
                markerEnd={`url(#${uid}-arrow${e.active ? "-active" : ""})`}
              />
              <circle r="3" className="app__flow-particle" opacity="0">
                <animateMotion
                  path={e.d}
                  dur={`${PARTICLE_DUR}s`}
                  begin={e.begin}
                  repeatCount="indefinite"
                  keyPoints="0;1"
                  keyTimes="0;1"
                  calcMode="linear"
                />
                <animate
                  attributeName="opacity"
                  values="0;0.9;0.9;0"
                  keyTimes="0;0.15;0.8;1"
                  dur={`${PARTICLE_DUR}s`}
                  begin={e.begin}
                  repeatCount="indefinite"
                />
              </circle>
            </g>
          ))}

          {edges
            .filter((e) => e.label)
            .map((e) => (
              <text
                key={`${e.key}-label`}
                x={e.at[0]}
                y={e.at[1]}
                textAnchor={e.at[2]}
                className="app__flow-label"
              >
                {e.label}
              </text>
            ))}

          {flow.nodes.map((n) => {
            const isSelected = n.id === selected.id;
            return (
              <g
                key={n.id}
                role="button"
                tabIndex={0}
                aria-pressed={isSelected}
                aria-label={n.title}
                className={`app__flow-node${isSelected ? " is-selected" : ""}`}
                onClick={() => select(n.id)}
                onKeyDown={(event) => onKey(event, n.id)}
              >
                <rect
                  x={left(n)}
                  y={top(n)}
                  width={NODE_W}
                  height={NODE_H}
                  rx="8"
                  strokeWidth="1"
                />
                <text
                  x={cx(n)}
                  y={top(n) + (n.sub ? 20 : 28.5)}
                  textAnchor="middle"
                  className="app__flow-title"
                >
                  {n.title}
                </text>
                {n.sub && (
                  <text
                    x={cx(n)}
                    y={top(n) + 37}
                    textAnchor="middle"
                    className="app__flow-sub"
                  >
                    {n.sub}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      <div className="app__flow-detail" aria-live="polite">
        <p className="app__flow-detail-title">{selected.title}</p>
        <p className="app__flow-detail-text">{selected.detail}</p>
      </div>
      <p className="app__flow-hint">Click any step to see what it does.</p>
    </div>
  );
};

export default FlowChart;
