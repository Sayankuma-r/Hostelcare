import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Landing from './pages/public/Landing'

// Routes for Login, Register and the three role dashboards are added in later phases.
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
      </Routes>
    </BrowserRouter>
  )
}
