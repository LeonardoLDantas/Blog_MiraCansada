import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import PostDetail from './pages/PostDetail'
import Admin from './pages/Admin'
import MuralPage from './pages/MuralDaSaudade'

export default function App() {
  return (
    <div className="min-h-screen bg-discord-bg flex flex-col">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-8 w-full flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/post/:id" element={<PostDetail />} />
          <Route path="/mural" element={<MuralPage />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}
