import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import NodeDetail from './pages/NodeDetail';
import NodeNew from './pages/NodeNew';
import Study from './pages/Study';
import TextbookImporter from './pages/TextbookImporter';
import QuickNotes from './pages/QuickNotes';
import BulkImport from './pages/BulkImport';
import Settings from './pages/Settings';
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
              path="/nodes/new"
              element={
                <PrivateRoute>
                  <NodeNew />
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
            <Route
              path="/quick-notes"
              element={
                <PrivateRoute>
                  <QuickNotes />
                </PrivateRoute>
              }
            />
            <Route
              path="/nodes/bulk-import"
              element={
                <PrivateRoute>
                  <BulkImport />
                </PrivateRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <PrivateRoute>
                  <Settings />
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
