import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import NodeDetail from './pages/NodeDetail';
import Study from './pages/Study';
import TextbookImporter from './pages/TextbookImporter';
import { ThemeProvider } from './contexts/ThemeContext';
import { ToastProvider } from './components/ToastContainer';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('token');
  return token ? <>{children}</> : <Navigate to="/login" />;
}

function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/nodes/:id"
              element={
                <PrivateRoute>
                  <NodeDetail />
                </PrivateRoute>
              }
            />
            <Route
              path="/study"
              element={
                <PrivateRoute>
                  <Study />
                </PrivateRoute>
              }
            />
            <Route
              path="/import"
              element={
                <PrivateRoute>
                  <TextbookImporter />
                </PrivateRoute>
              }
            />
          </Routes>
        </Router>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
