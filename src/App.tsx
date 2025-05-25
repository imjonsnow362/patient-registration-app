import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import AddPatient from './pages/AddPatient';
import PatientQuery from './pages/QueryPanel';
import PatientRecords from './pages/PatientRecords';
import { DatabaseProvider } from './state/DBState';
import AppShell from './components/AppShell';

function App() {
  return (
    <DatabaseProvider>
      <Router>
        <Routes>
          <Route path="/" element={<AppShell />}>
            <Route index element={<Dashboard />} />
            <Route path="register" element={<AddPatient />} />
            <Route path="query" element={<PatientQuery />} />
            <Route path="patients" element={<PatientRecords />} />
          </Route>
        </Routes>
      </Router>
    </DatabaseProvider>
  );
}

export default App;