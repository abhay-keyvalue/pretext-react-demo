import { useState } from 'react'
import './App.css'
import Hero from './components/Hero'
import Navigation from './components/Navigation'
import PerformanceDemo from './components/demos/PerformanceDemo'
import VirtualizationDemo from './components/demos/VirtualizationDemo'
import CanvasRenderingDemo from './components/demos/CanvasRenderingDemo'
import MultilingualDemo from './components/demos/MultilingualDemo'
import DynamicLayoutDemo from './components/demos/DynamicLayoutDemo'
import ShrinkWrapDemo from './components/demos/ShrinkWrapDemo'

type DemoType = 'performance' | 'virtualization' | 'canvas' | 'multilingual' | 'dynamic' | 'shrink-wrap'

function App() {
  const [activeDemo, setActiveDemo] = useState<DemoType>('performance')

  const renderDemo = () => {
    switch (activeDemo) {
      case 'performance':
        return <PerformanceDemo />
      case 'virtualization':
        return <VirtualizationDemo />
      case 'canvas':
        return <CanvasRenderingDemo />
      case 'multilingual':
        return <MultilingualDemo />
      case 'dynamic':
        return <DynamicLayoutDemo />
      case 'shrink-wrap':
        return <ShrinkWrapDemo />
    }
  }

  return (
    <div className="container">
      <Hero />
      <Navigation activeDemo={activeDemo} onDemoChange={setActiveDemo} />
      <main className="demo-container">
        {renderDemo()}
      </main>
      <footer className="footer">
        <p>
          Built with <a href="https://github.com/chenglou/pretext" target="_blank" rel="noopener noreferrer">Pretext</a> + React + Vite
        </p>
      </footer>
    </div>
  )
}

export default App
