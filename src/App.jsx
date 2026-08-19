import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import CreatePostPage from './pages/CreatePostPage'
import LibraryPage from './pages/LibraryPage'
import ApprovalQueuePage from './pages/ApprovalQueuePage'
import EditContentPage from './pages/EditContentPage'
import CalendarPage from './pages/CalendarPage'
import NotificationsPage from './pages/NotificationsPage'
import PlaceholderPage from './pages/PlaceholderPage'
import IntegrationsPage from './pages/IntegrationsPage'
import DashboardLayout from './layouts/DashboardLayout'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />

        <Route element={<DashboardLayout />}>
          <Route
            path="/dashboard"
            element={<DashboardPage />}
          />
          <Route path="/create-post" element={<CreatePostPage />} />
          <Route path="/themes" element={<PlaceholderPage title="Themes" />} />
          <Route path="/library" element={<LibraryPage />} />
          <Route path="/approval-queue" element={<ApprovalQueuePage />} />
          <Route path="/approval-queue/:id/edit" element={<EditContentPage />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/integrations" element={<IntegrationsPage />} />
          <Route
            path="/settings"
            element={<PlaceholderPage title="Settings" />}
          />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
