const CIRCLE = "M50 8 A 42 42 0 1 1 49.999 8"
const CIRCLE_BACK = "M50 8 A 42 42 0 1 0 50.001 8"
const SPARK_EASE = "0.42 0 0.58 1; 0.37 0 0.63 1; 0.45 0.05 0.55 0.95; 0.4 0 0.6 1"
const SPARK_TIMES = "0; 0.25; 0.5; 0.75; 1"
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

export function WelcomeMotion({ departing = false }: { departing?: boolean }) {
  return (
    <div
      className={`welcome-motion pointer-events-none absolute inset-0 overflow-hidden${departing ? " welcome-motion-depart" : ""}`}
      aria-hidden
    >
      <div className="welcome-orb welcome-orb-a" />
      <div className="welcome-orb welcome-orb-b" />
      <div className="welcome-orb welcome-orb-c" />
      <div className="welcome-grid" />

      <div className="welcome-orbit">
        <svg className="welcome-flow" viewBox="0 0 100 100">
          <circle className="welcome-path" cx="50" cy="50" r="42" />
          <circle className="welcome-path welcome-path-slow" cx="50" cy="50" r="42" />
          <circle className="welcome-spark welcome-spark-a" r="0.62">
            <animateMotion
              dur="36s"
              repeatCount="indefinite"
              path={CIRCLE}
              calcMode="spline"
              keyTimes={SPARK_TIMES}
              keySplines={SPARK_EASE}
            />
          </circle>
          <circle className="welcome-spark welcome-spark-b" r="0.48">
            <animateMotion
              dur="48s"
              begin="-12s"
              repeatCount="indefinite"
              path={CIRCLE_BACK}
              calcMode="spline"
              keyTimes={SPARK_TIMES}
              keySplines={SPARK_EASE}
            />
          </circle>
          <circle className="welcome-spark welcome-spark-c" r="0.4">
            <animateMotion
              dur="42s"
              begin="-22s"
              repeatCount="indefinite"
              path={CIRCLE}
              calcMode="spline"
              keyTimes={SPARK_TIMES}
              keySplines={SPARK_EASE}
            />
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
