import { useEffect, useMemo, useRef, useState } from 'react'
import dashboardData from './mock-data/dashboard.json'

const cardClass =
  'rounded-2xl border border-slate-800/90 bg-slate-900/75 p-4 shadow-lg shadow-slate-950/40 backdrop-blur'

const pieColors = ['#38bdf8', '#14b8a6', '#818cf8', '#a78bfa', '#f59e0b']

function SectionCard({ title, subtitle, children, className = '' }) {
  return (
    <section className={`${cardClass} ${className}`}>
      <header className="mb-4">
        <p className="text-sm font-semibold tracking-wide text-slate-100">{title}</p>
        {subtitle ? <p className="mt-1 text-xs text-slate-400">{subtitle}</p> : null}
      </header>
      {children}
    </section>
  )
}

function LineTrendChart({ labels, values }) {
  const width = 400
  const height = 170
  const padding = { top: 12, right: 12, bottom: 24, left: 12 }
  const minValue = Math.min(...values)
  const maxValue = Math.max(...values)
  const range = Math.max(maxValue - minValue, 1)
  const stepX = (width - padding.left - padding.right) / (values.length - 1)
  const baseY = height - padding.bottom

  const points = values.map((value, index) => {
    const x = padding.left + stepX * index
    const normalized = (value - minValue) / range
    const y = baseY - normalized * (baseY - padding.top)
    return { x, y, value, label: labels[index] }
  })

  const polylinePoints = points.map(({ x, y }) => `${x},${y}`).join(' ')
  const areaPath = `M ${points[0].x} ${baseY} L ${polylinePoints} L ${points.at(-1).x} ${baseY} Z`

  return (
    <div>
      <svg viewBox={`0 0 ${width} ${height}`} className="h-48 w-full">
        {[0, 1, 2, 3].map((idx) => {
          const y = padding.top + ((baseY - padding.top) / 3) * idx
          return (
            <line
              key={idx}
              x1={padding.left}
              y1={y}
              x2={width - padding.right}
              y2={y}
              stroke="rgba(148,163,184,0.25)"
              strokeWidth="1"
            />
          )
        })}
        <path d={areaPath} fill="rgba(56,189,248,0.2)" />
        <polyline
          points={polylinePoints}
          fill="none"
          stroke="#38bdf8"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {points.map(({ x, y, value }, index) => (
          <g key={`${x}-${y}`}>
            <circle cx={x} cy={y} r="4" fill="#0f172a" stroke="#38bdf8" strokeWidth="2" />
            {index % 3 === 0 ? (
              <text x={x} y={y - 10} textAnchor="middle" className="fill-slate-300 text-[10px]">
                {value}
              </text>
            ) : null}
          </g>
        ))}
      </svg>
      <div className="mt-1 grid grid-cols-6 gap-2 text-[11px] text-slate-500">
        {labels.filter((_, index) => index % 2 === 0).map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>
    </div>
  )
}

function heatColor(value, min, max) {
  const ratio = (value - min) / Math.max(max - min, 1)
  const hue = 220 - ratio * 80
  const lightness = 14 + ratio * 36
  return `hsl(${hue} 88% ${lightness}%)`
}

function HeatmapChart({ xLabels, yLabels, values }) {
  const flat = values.flat()
  const min = Math.min(...flat)
  const max = Math.max(...flat)

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-[3rem_repeat(12,minmax(0,1fr))] gap-1 text-[10px] text-slate-500">
        <span />
        {xLabels.map((label) => (
          <span key={label} className="text-center">
            {label}
          </span>
        ))}
      </div>
      {values.map((row, rowIndex) => (
        <div key={yLabels[rowIndex]} className="grid grid-cols-[3rem_repeat(12,minmax(0,1fr))] gap-1">
          <span className="self-center text-[11px] text-slate-400">{yLabels[rowIndex]}</span>
          {row.map((cell, cellIndex) => (
            <div
              key={`${rowIndex}-${cellIndex}`}
              className="h-4 rounded-sm border border-slate-900/50"
              style={{ backgroundColor: heatColor(cell, min, max) }}
              title={`${yLabels[rowIndex]} ${xLabels[cellIndex]}: ${cell}`}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

function BarChart({ items }) {
  const max = Math.max(...items.map((item) => item.value))

  return (
    <div className="flex h-48 items-end justify-between gap-3">
      {items.map((item) => (
        <div key={item.name} className="flex flex-1 flex-col items-center gap-2">
          <div className="text-xs text-slate-400">{item.value}</div>
          <div className="relative flex h-32 w-full items-end rounded-md bg-slate-800/80 p-1">
            <div
              className="w-full rounded bg-gradient-to-t from-sky-500 to-cyan-300 transition-all"
              style={{ height: `${Math.max((item.value / max) * 100, 8)}%` }}
            />
          </div>
          <div className="text-xs text-slate-500">{item.name}</div>
        </div>
      ))}
    </div>
  )
}

function DataTable({ rows }) {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-800">
      <table className="w-full border-collapse text-left text-xs">
        <thead className="bg-slate-800/80 text-slate-300">
          <tr>
            <th className="px-3 py-2 font-medium">事件ID</th>
            <th className="px-3 py-2 font-medium">城市</th>
            <th className="px-3 py-2 font-medium">等级</th>
            <th className="px-3 py-2 font-medium">状态</th>
            <th className="px-3 py-2 font-medium">时间</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-t border-slate-800/90 text-slate-300">
              <td className="px-3 py-2 text-sky-300">{row.id}</td>
              <td className="px-3 py-2">{row.city}</td>
              <td className="px-3 py-2">
                <span
                  className={`rounded px-2 py-1 ${
                    row.level === '高'
                      ? 'bg-red-500/20 text-red-300'
                      : row.level === '中'
                        ? 'bg-amber-400/20 text-amber-300'
                        : 'bg-emerald-500/20 text-emerald-300'
                  }`}
                >
                  {row.level}
                </span>
              </td>
              <td className="px-3 py-2 text-slate-400">{row.status}</td>
              <td className="px-3 py-2 text-slate-500">{row.time}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function sectorPath(cx, cy, radius, startAngle, endAngle) {
  const startX = cx + radius * Math.cos(startAngle)
  const startY = cy + radius * Math.sin(startAngle)
  const endX = cx + radius * Math.cos(endAngle)
  const endY = cy + radius * Math.sin(endAngle)
  const largeArc = endAngle - startAngle > Math.PI ? 1 : 0

  return `M ${cx} ${cy} L ${startX} ${startY} A ${radius} ${radius} 0 ${largeArc} 1 ${endX} ${endY} Z`
}

function PieChart({ items }) {
  const total = items.reduce((sum, item) => sum + item.value, 0)
  let current = -Math.PI / 2

  const segments = items.map((item, index) => {
    const delta = (item.value / total) * Math.PI * 2
    const start = current
    const end = start + delta
    current = end
    return { ...item, start, end, color: pieColors[index % pieColors.length] }
  })

  return (
    <div className="flex items-center gap-4">
      <svg viewBox="0 0 220 220" className="h-48 w-48 shrink-0">
        {segments.map((segment) => (
          <path
            key={segment.name}
            d={sectorPath(110, 110, 88, segment.start, segment.end)}
            fill={segment.color}
            stroke="#020617"
            strokeWidth="2"
          />
        ))}
        <circle cx="110" cy="110" r="44" fill="#0f172a" />
        <text x="110" y="107" textAnchor="middle" className="fill-slate-200 text-[16px] font-semibold">
          {total}
        </text>
        <text x="110" y="126" textAnchor="middle" className="fill-slate-500 text-[10px]">
          总占比
        </text>
      </svg>
      <ul className="space-y-2 text-xs">
        {segments.map((segment) => (
          <li key={segment.name} className="flex items-center gap-2 text-slate-300">
            <span
              className="inline-block h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: segment.color }}
            />
            <span className="min-w-16 text-slate-400">{segment.name}</span>
            <span className="font-medium text-slate-200">{segment.value}%</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function RadarChart({ indicators, values }) {
  const center = 110
  const radius = 82
  const ringCount = 5

  const axisPoints = indicators.map((_, index) => {
    const angle = (Math.PI * 2 * index) / indicators.length - Math.PI / 2
    return {
      x: center + radius * Math.cos(angle),
      y: center + radius * Math.sin(angle),
      labelX: center + (radius + 18) * Math.cos(angle),
      labelY: center + (radius + 18) * Math.sin(angle),
    }
  })

  const valuePolygon = values
    .map((value, index) => {
      const angle = (Math.PI * 2 * index) / values.length - Math.PI / 2
      const r = (value / 100) * radius
      return `${center + r * Math.cos(angle)},${center + r * Math.sin(angle)}`
    })
    .join(' ')

  return (
    <svg viewBox="0 0 220 220" className="h-56 w-full">
      {[...Array(ringCount)].map((_, index) => {
        const ringRadius = (radius / ringCount) * (index + 1)
        const ringPoints = indicators
          .map((_, pointIndex) => {
            const angle = (Math.PI * 2 * pointIndex) / indicators.length - Math.PI / 2
            return `${center + ringRadius * Math.cos(angle)},${center + ringRadius * Math.sin(angle)}`
          })
          .join(' ')
        return (
          <polygon
            key={ringRadius}
            points={ringPoints}
            fill="none"
            stroke="rgba(148,163,184,0.25)"
            strokeWidth="1"
          />
        )
      })}

      {axisPoints.map((point, index) => (
        <g key={indicators[index]}>
          <line
            x1={center}
            y1={center}
            x2={point.x}
            y2={point.y}
            stroke="rgba(148,163,184,0.3)"
            strokeWidth="1"
          />
          <text
            x={point.labelX}
            y={point.labelY}
            textAnchor="middle"
            className="fill-slate-400 text-[10px]"
          >
            {indicators[index]}
          </text>
        </g>
      ))}

      <polygon points={valuePolygon} fill="rgba(56,189,248,0.25)" stroke="#38bdf8" strokeWidth="2" />
    </svg>
  )
}

function buildArcPath(from, to) {
  const dx = to.x - from.x
  const dy = to.y - from.y
  const distance = Math.hypot(dx, dy)
  const normalX = distance === 0 ? 0 : -dy / distance
  const normalY = distance === 0 ? 0 : dx / distance
  const lift = Math.min(36, Math.max(16, distance * 0.22))
  const controlX = (from.x + to.x) / 2 + normalX * lift
  const controlY = (from.y + to.y) / 2 + normalY * lift
  return `M ${from.x} ${from.y} Q ${controlX} ${controlY} ${to.x} ${to.y}`
}

function RotatingGlobe({ kpi, events, connections }) {
  const [rotation, setRotation] = useState({ x: 18, y: 0 })
  const dragRef = useRef(null)
  const nodes = useMemo(
    () =>
      events.map((event, index) => ({
        ...event,
        x: event.x ?? 88 + index * 52,
        y: event.y ?? 88 + (index % 2) * 96,
      })),
    [events],
  )
  const nodeMap = useMemo(
    () => new Map(nodes.map((node) => [node.name, node])),
    [nodes],
  )
  const routePaths = useMemo(
    () =>
      (connections ?? [])
        .map(([fromName, toName]) => {
          const from = nodeMap.get(fromName)
          const to = nodeMap.get(toName)
          if (!from || !to) return null
          return {
            key: `${fromName}-${toName}`,
            path: buildArcPath(from, to),
          }
        })
        .filter(Boolean),
    [connections, nodeMap],
  )

  useEffect(() => {
    let frameId = 0

    const animate = () => {
      setRotation((prev) => {
        if (dragRef.current) return prev
        return { ...prev, y: (prev.y + 0.18) % 360 }
      })
      frameId = requestAnimationFrame(animate)
    }

    frameId = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frameId)
  }, [])

  const onPointerDown = (event) => {
    event.currentTarget.setPointerCapture(event.pointerId)
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      baseX: rotation.x,
      baseY: rotation.y,
    }
  }

  const onPointerMove = (event) => {
    const drag = dragRef.current
    if (!drag || drag.pointerId !== event.pointerId) return

    const deltaX = event.clientX - drag.startX
    const deltaY = event.clientY - drag.startY
    setRotation({
      x: Math.max(-30, Math.min(30, drag.baseX - deltaY * 0.2)),
      y: drag.baseY + deltaX * 0.3,
    })
  }

  const onPointerUp = (event) => {
    if (dragRef.current?.pointerId === event.pointerId) {
      dragRef.current = null
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div className="mx-auto mt-2 flex w-full max-w-xl items-center justify-between gap-3">
        {kpi.map((item) => (
          <div key={item.label} className="flex-1 rounded-xl border border-slate-800 bg-slate-900/90 p-3">
            <p className="text-xs text-slate-500">{item.label}</p>
            <p className="mt-1 text-lg font-semibold text-slate-100">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="relative mx-auto mt-4 flex w-full flex-1 items-center justify-center">
        <div className="pointer-events-none absolute h-96 w-96 rounded-full bg-sky-500/10 blur-3xl" />
        <div
          className="globe-wrapper relative h-[360px] w-[360px] cursor-grab active:cursor-grabbing"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          <div
            className="globe-shell"
            style={{ transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)` }}
          >
            <div className="globe-continents" />
            <div className="globe-grid" />
            <svg viewBox="0 0 360 360" className="globe-overlay" aria-hidden="true">
              {routePaths.map((route, index) => (
                <g key={route.key}>
                  <path d={route.path} className="flight-path-base" />
                  <path
                    d={route.path}
                    className="flight-path-active"
                    style={{ animationDelay: `${index * 0.45}s` }}
                  />
                </g>
              ))}

              {nodes.map((node, index) => (
                <g key={node.name}>
                  <circle cx={node.x} cy={node.y} r="3.2" className="globe-point-core" />
                  <circle cx={node.x} cy={node.y} r="4.8" className="globe-point-pulse">
                    <animate
                      attributeName="r"
                      values="4.8;12;4.8"
                      dur="2.6s"
                      begin={`${index * 0.35}s`}
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="opacity"
                      values="0.85;0.15;0.85"
                      dur="2.6s"
                      begin={`${index * 0.35}s`}
                      repeatCount="indefinite"
                    />
                  </circle>
                </g>
              ))}
            </svg>
            <div className="globe-glow" />
          </div>
        </div>
      </div>

      <div className="mx-auto mt-2 grid w-full max-w-xl grid-cols-5 gap-2 text-center text-xs">
        {events.map((event) => (
          <div key={event.name} className="rounded-lg border border-slate-800 bg-slate-900/70 p-2">
            <p className="text-slate-500">{event.name}</p>
            <p className="mt-1 font-semibold text-sky-300">{event.value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function App() {
  const { title, updatedAt, lineTrend, heatmap, barRanking, table, pieSource, radarCapability, globe } =
    dashboardData

  const totalAlertCount = useMemo(
    () => lineTrend.values.reduce((sum, value) => sum + value, 0),
    [lineTrend.values],
  )

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-4 text-slate-100 lg:px-6 lg:py-6">
      <div className="mx-auto mb-4 flex max-w-[1800px] items-end justify-between rounded-2xl border border-slate-800/80 bg-slate-900/70 px-4 py-3">
        <div>
          <p className="text-sm tracking-[0.28em] text-cyan-300/90">SITUATIONAL AWARENESS</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-wide">{title}</h1>
        </div>
        <div className="text-right text-xs text-slate-400">
          <p>总告警量：{totalAlertCount}</p>
          <p className="mt-1">最近更新：{updatedAt}</p>
        </div>
      </div>

      <div className="mx-auto grid max-w-[1800px] gap-4 xl:grid-cols-[24rem_minmax(0,1fr)_24rem] 2xl:grid-cols-[26rem_minmax(0,1fr)_26rem]">
        <div className="space-y-4">
          <SectionCard title="折线图" subtitle="24h 告警趋势">
            <LineTrendChart labels={lineTrend.labels} values={lineTrend.values} />
          </SectionCard>
          <SectionCard title="柱状图" subtitle="区域风险指数排名">
            <BarChart items={barRanking.items} />
          </SectionCard>
          <SectionCard title="饼状图" subtitle="告警来源占比">
            <PieChart items={pieSource.items} />
          </SectionCard>
        </div>

        <SectionCard title="三维地球" subtitle="拖拽可旋转，松开后自动旋转">
          <RotatingGlobe
            kpi={globe.kpi}
            events={globe.events}
            connections={globe.connections}
          />
        </SectionCard>

        <div className="space-y-4">
          <SectionCard title="热点图" subtitle="星期 / 时间分布热力">
            <HeatmapChart
              xLabels={heatmap.xLabels}
              yLabels={heatmap.yLabels}
              values={heatmap.values}
            />
          </SectionCard>
          <SectionCard title="表格" subtitle="实时事件明细">
            <DataTable rows={table.rows} />
          </SectionCard>
          <SectionCard title="雷达图" subtitle="系统能力画像">
            <RadarChart
              indicators={radarCapability.indicators}
              values={radarCapability.values}
            />
          </SectionCard>
        </div>
      </div>
    </main>
  )
}

export default App
