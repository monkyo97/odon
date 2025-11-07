import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Patients } from './pages/Patients';
import { PatientDetail } from './pages/PatientDetail';
import { Appointments } from './pages/appointments/Appointments';
import { Settings } from './pages/settings/Settings';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Dentists } from './pages/dentists/Dentists';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            <Route index element={<Dashboard />} />
            <Route path="patients" element={<Patients />} />
            <Route path="appointments" element={<Appointments />} />
            <Route path="settings" element={<Settings />} />
            <Route path="patients/:id" element={<PatientDetail />} />
            <Route path="dentists" element={<Dentists />} />
          </Route>

          {/* <Route path="/" element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/patients" element={
            <ProtectedRoute>
              <Layout>
                <Patients />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/appointments" element={
            <ProtectedRoute>
              <Layout>
                <Appointments />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute>
              <Layout>
                <Settings />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/patients/:id" element={
            <ProtectedRoute>
              <Layout>
                <PatientDetail />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/dentists" element={
            <ProtectedRoute>
              <Layout>
                <Dentists />
              </Layout>
            </ProtectedRoute>
          } /> */}
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;