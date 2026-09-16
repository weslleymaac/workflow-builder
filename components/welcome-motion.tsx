const CIRCLE = "M50 8 A 42 42 0 1 1 49.999 8"
const NODES = [
  { angle: 0, delay: "0s", label: "Início" },
  { angle: 60, delay: "0.8s", label: "Se" },
  { angle: 120, delay: "1.6s", label: "Repetir" },
  { angle: 180, delay: "2.2s", label: "Lista" },
  { angle: 240, delay: "1.1s", label: "Fim" },
  { angle: 300, delay: "2.8s", label: "Var" },
]

function nodeStyle(angle: number, delay: string) {
  const rad = (angle * Math.PI) / 180
  const x = 50 + 42 * Math.sin(rad)
  const y = 50 - 42 * Math.cos(rad)
  return {
    left: `${x}%`,
    top: `${y}%`,
    animationDelay: delay,
  }
}

export function WelcomeMotion() {
  return (
    <div className="welcome-motion pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div className="welcome-orb welcome-orb-a" />
      <div className="welcome-orb welcome-orb-b" />
      <div className="welcome-orb welcome-orb-c" />
      <div className="welcome-grid" />

      <div className="welcome-orbit">
        <svg className="welcome-flow" viewBox="0 0 100 100">
          <circle className="welcome-path" cx="50" cy="50" r="42" />
          <circle className="welcome-path welcome-path-slow" cx="50" cy="50" r="42" />
          <circle className="welcome-spark" r="0.7">
            <animateMotion dur="10s" repeatCount="indefinite" path={CIRCLE} />
          </circle>
          <circle className="welcome-spark" r="0.55">
            <animateMotion dur="10s" begin="2.5s" repeatCount="indefinite" path={CIRCLE} />
          </circle>
          <circle className="welcome-spark" r="0.5">
            <animateMotion dur="10s" begin="5s" repeatCount="indefinite" path={CIRCLE} />
          </circle>
          <circle className="welcome-spark" r="0.45">
            <animateMotion dur="10s" begin="7.5s" repeatCount="indefinite" path={CIRCLE} />
          </circle>
        </svg>

        {NODES.map((node) => (
          <span key={node.label} className="welcome-node" style={nodeStyle(node.angle, node.delay)}>
            {node.label}
          </span>
        ))}
      </div>
    </div>
  )
}
