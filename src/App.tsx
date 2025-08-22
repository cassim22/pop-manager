import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import Layout from './components/layout/Layout'
import { Toaster } from './components/ui/toaster'
import { NotificationProvider } from './contexts/NotificationContext'
import Dashboard from './pages/Dashboard'
import POPs from './pages/POPs'
import Activities from './pages/Activities'
import Team from './pages/Team'
import Generators from './pages/Generators'
import Supplies from './pages/Supplies'
import Maintenance from './pages/Maintenance'
import Map from './pages/Map'
import Gallery from './pages/Gallery'
import Reports from './pages/Reports'
import Settings from './pages/Settings'
import GLPI from './pages/GLPI'
import './index.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

function App() {
  
  return (
    <QueryClientProvider client={queryClient}>
      <NotificationProvider>
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/pops" element={<POPs />} />
              <Route path="/activities" element={<Activities />} />
              <Route path="/team" element={<Team />} />
              <Route path="/generators" element={<Generators />} />
              <Route path="/supplies" element={<Supplies />} />
              <Route path="/maintenance" element={<Maintenance />} />
              <Route path="/glpi" element={<GLPI />} />
              <Route path="/map" element={<Map />} />
              <Route path="/gallery" element={<Gallery />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </Layout>
          <Toaster />
          <ReactQueryDevtools initialIsOpen={false} />
        </Router>
      </NotificationProvider>
    </QueryClientProvider>
  )
}

export default App