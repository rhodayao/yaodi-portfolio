import { Route, Routes } from 'react-router-dom'
import { PublicLayout } from './components/PublicLayout'
import { HomePage } from './pages/HomePage'
import { ProjectPage } from './pages/ProjectPage'
import { NotFound } from './pages/NotFound'
import { AdminPage } from './pages/AdminPage'

export default function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/work/:slug" element={<ProjectPage />} />
        <Route path="*" element={<NotFound />} />
      </Route>
      <Route path="/admin/*" element={<AdminPage />} />
    </Routes>
  )
}
