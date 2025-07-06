import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './components/Home'
import About from './components/About'
import Contact from './components/Contact'
import Services from './components/Services'
import DragDropDemo from './components/DragDropDemo'
import DragToNewWindow from './components/DragToNewWindow'
import BrowserCompatibilityTest from './components/BrowserCompatibilityTest'
import './App.css'

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/services" element={<Services />} />
          <Route path="/demo" element={<DragDropDemo />} />
          <Route path="/new-window" element={<DragToNewWindow />} />
          <Route path="/compatibility" element={<BrowserCompatibilityTest />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
