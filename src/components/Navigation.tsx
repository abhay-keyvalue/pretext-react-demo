type DemoType = 'performance' | 'virtualization' | 'canvas' | 'multilingual' | 'dynamic' | 'shrink-wrap'

interface NavigationProps {
  activeDemo: DemoType
  onDemoChange: (demo: DemoType) => void
}

export default function Navigation({ activeDemo, onDemoChange }: NavigationProps) {
  const demos: Array<{ id: DemoType; label: string }> = [
    { id: 'performance', label: 'Performance Comparison' },
    { id: 'virtualization', label: 'Smart Virtualization' },
    { id: 'canvas', label: 'Canvas Rendering' },
    { id: 'multilingual', label: 'Multilingual Layout' },
    { id: 'dynamic', label: 'Dynamic Width Layout' },
    { id: 'shrink-wrap', label: 'Shrink-Wrap Text' },
  ]

  return (
    <nav className="demo-nav">
      {demos.map(demo => (
        <button
          key={demo.id}
          className={`nav-btn ${activeDemo === demo.id ? 'active' : ''}`}
          onClick={() => onDemoChange(demo.id)}
        >
          {demo.label}
        </button>
      ))}
    </nav>
  )
}
