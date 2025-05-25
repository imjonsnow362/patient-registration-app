import React, { useEffect, useState, useCallback } from 'react';
import { getAllPatients, searchPatientsByName } from '../db/DbManager';
import { useDatabaseContext } from '../state/DBState';
import { Search, Download, UserPlus, Link, ArrowUp, ArrowDown, RefreshCw, XCircle } from 'lucide-react';
import type { Patient } from '../interfaces/patient';


const PatientRecords: React.FC = () => {
  const { isInitialized, isLoading: dbLoading, error: dbError } = useDatabaseContext();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true); // For component-specific data fetching
  const [sortField, setSortField] = useState<keyof Patient>('last_name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Memoized function for fetching data
  const loadPatients = useCallback(async (currentSearchTerm: string = '') => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const patientData = currentSearchTerm.trim()
        ? await searchPatientsByName(currentSearchTerm)
        : await getAllPatients();
      setPatients(patientData);
    } catch (error: any) {
      console.error('Error loading/searching patients:', error);
      setFetchError(`Failed to retrieve patient data: ${error.message || 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  }, []); // Empty dependency array means this function is created once

  // Initial load or when DB state changes
  useEffect(() => {
    if (isInitialized && !dbLoading) {
      loadPatients(searchTerm); // Use the current search term for initial load too
    }
  }, [isInitialized, dbLoading, loadPatients, searchTerm]); // Add searchTerm to trigger reload if it changes while DB is ready

  const handleSearchClick = () => {
    loadPatients(searchTerm);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    loadPatients(''); // Load all patients after clearing search
  };

  const handleSort = (field: keyof Patient) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Memoize sortedPatients to prevent re-sorting on every render if patients array hasn't changed
  const sortedPatients = React.useMemo(() => {
    const sortablePatients = [...patients]; // Create a shallow copy to avoid mutating state directly

    return sortablePatients.sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];

      // Handle null/undefined values for robust sorting
      if (aValue === null || aValue === undefined) return sortDirection === 'asc' ? 1 : -1;
      if (bValue === null || bValue === undefined) return sortDirection === 'asc' ? -1 : 1;

      // Type-specific comparison
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc'
          ? aValue.localeCompare(bValue, undefined, { numeric: true, sensitivity: 'base' })
          : bValue.localeCompare(aValue, undefined, { numeric: true, sensitivity: 'base' });
      }

      if (typeof aValue === 'number' && typeof bValue === 'number') {
          return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }

      // Fallback: convert to string and compare (less precise for non-strings)
      const aStr = String(aValue);
      const bStr = String(bValue);
      if (aStr < bStr) return sortDirection === 'asc' ? -1 : 1;
      if (aStr > bStr) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [patients, sortField, sortDirection]); // Re-sort only when these dependencies change

  const downloadPatientData = () => {
    if (patients.length === 0) return;

    // Filter out `id` and `created_at` or format `created_at` for export
    const exportPatients = patients.map(({ id, created_at, ...rest }) => ({
      ...rest,
      // Format date for better readability in export
      registered_on: new Date(created_at).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
    }));

    const jsonStr = JSON.stringify(exportPatients, null, 2);
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(jsonStr);
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `healthhub_patients_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  // --- Initializing / DB Error State (unchanged as per request) ---
  if (dbLoading || !isInitialized) {
    return (
      <div className="flex flex-col items-center justify-center min-h-full py-12 px-4 sm:px-6 lg:px-8">
        <div className="animate-pulse rounded-full h-20 w-20 border-8 border-t-8 border-purple-500 border-opacity-75 mb-6"></div>
        <p className="text-xl font-medium text-gray-700">Loading patient records...</p>
        <p className="text-sm text-gray-500 mt-2">Connecting to the secure database.</p>
      </div>
    );
  }

  if (dbError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-full py-12 px-4 sm:px-6 lg:px-8 text-center bg-red-50 rounded-lg shadow-lg">
        <XCircle className="h-24 w-24 text-red-600 mb-6" />
        <h2 className="text-3xl font-bold text-red-800 mb-3">Database Connection Failed!</h2>
        <p className="text-lg font-medium text-red-700 max-w-lg mx-auto">
          <span className="font-semibold block mb-2">{dbError}</span>
          Cannot load patient data. Please check your database connection.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col items-center font-inter antialiased">
      <header className="text-center mb-10 w-full max-w-7xl">
        <h1 className="text-5xl font-extrabold text-gray-900 leading-tight">
          Patient Directory
        </h1>
        <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
          Manage and explore comprehensive details of all registered patients.
        </p>
      </header>

      <div className="w-full max-w-7xl mx-auto space-y-8">
        {/* Search and Actions Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="relative flex-grow w-full md:w-auto">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-6 w-6 text-gray-400" />
              </div>
              <input
                type="text"
                className="form-input-alt pl-12 pr-4 py-3 text-lg rounded-full" // Rounded input
                placeholder="Search by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearchClick()}
              />
            </div>
            <div className="flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={handleSearchClick}
                className="inline-flex items-center justify-center px-6 py-3 rounded-full text-base font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-all duration-300 ease-in-out transform hover:scale-105 shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <Search className="h-5 w-5 mr-2" /> Search
              </button>
              <button
                type="button"
                onClick={handleClearSearch}
                className="inline-flex items-center justify-center px-6 py-3 rounded-full text-base font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300 shadow-md"
              >
                <RefreshCw className="h-5 w-5 mr-2" /> Reset
              </button>
              {/* <Link
                to="/register"
                className="inline-flex items-center justify-center px-6 py-3 rounded-full text-base font-semibold text-white bg-purple-600 hover:bg-purple-700 transition-all duration-300 ease-in-out transform hover:scale-105 shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                <UserPlus className="h-5 w-5 mr-2" /> New Patient
              </Link> */}
              <button
                type="button"
                onClick={downloadPatientData}
                className="inline-flex items-center justify-center px-6 py-3 rounded-full text-base font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition-all duration-300 ease-in-out transform hover:scale-105 shadow-md disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
                disabled={patients.length === 0}
              >
                <Download className="h-5 w-5 mr-2" /> Export
              </button>
            </div>
          </div>
        </div>

        {/* Data Fetching Error Message */}
        {fetchError && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg mb-8" role="alert">
            <p className="font-bold">Error:</p>
            <p>{fetchError}</p>
          </div>
        )}

        {/* Loading State for Patient Data */}
        {isLoading ? (
          <div className="bg-white rounded-2xl shadow-lg p-10 flex flex-col items-center justify-center min-h-[300px]">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-500 mb-6"></div>
            <p className="text-xl font-medium text-gray-700">Fetching patient records...</p>
            <p className="text-sm text-gray-500 mt-2">Hang tight, almost there!</p>
          </div>
        ) : sortedPatients.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center min-h-[300px] flex flex-col items-center justify-center">
            <svg className="mx-auto h-20 w-20 text-gray-300 mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="mt-4 text-xl font-semibold text-gray-900">No patients found</h3>
            <p className="mt-2 text-md text-gray-600 max-w-md">
              {searchTerm ? 'Your search returned no results. Try a different name or reset the search.' : 'No patients are currently registered. Let\'s add the first one!'}
            </p>
            {!searchTerm && (
              <Link
                to="/register"
                className="mt-6 inline-flex items-center px-8 py-3 border border-transparent text-base font-semibold rounded-full shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-300 ease-in-out transform hover:scale-105"
              >
                <UserPlus className="h-5 w-5 mr-2" /> Register New Patient
              </Link>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {[
                      { key: 'last_name', label: 'Patient Name' },
                      { key: 'date_of_birth', label: 'Date of Birth' },
                      { key: 'gender', label: 'Gender' },
                      { key: 'height_cm', label: 'Height (cm)' },
                      { key: 'weight_kg', label: 'Weight (kg)' },
                      { key: 'allergies', label: 'Allergies' },
                      { key: 'phone', label: 'Contact' },
                      { key: 'created_at', label: 'Registered On' },
                    ].map((col) => (
                      <th
                        key={col.key}
                        className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-150 whitespace-nowrap"
                        onClick={() => handleSort(col.key as keyof Patient)}
                      >
                        <div className="flex items-center">
                          {col.label}
                          {sortField === col.key && (
                            <span className="ml-2 text-gray-500">
                              {sortDirection === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
                            </span>
                          )}
                        </div>
                      </th>
                    ))}
                    {/* Add an empty header for potential actions column if needed later */}
                    {/* <th className="px-6 py-4"></th> */}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sortedPatients.map((patient) => (
                    <tr key={patient.id} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                        {patient.last_name}, {patient.first_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {patient.date_of_birth}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 capitalize">
                        {patient.gender}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {patient.height_cm ? `${patient.height_cm} cm` : '—'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {patient.weight_kg ? `${patient.weight_kg} kg` : '—'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700 max-w-xs truncate" title={patient.allergies || 'No allergies listed'}>
                        {patient.allergies || '—'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {patient.email || patient.phone ? (
                          <>
                            {patient.email && <div className="text-blue-600 hover:underline">{patient.email}</div>}
                            {patient.phone && <div className="text-gray-600">{patient.phone}</div>}
                          </>
                        ) : '—'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {new Date(patient.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </td>
                      {/* Action buttons would go here if uncommented */}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {sortedPatients.length > 0 && !isLoading && !fetchError && (
          <div className="mt-8 text-center text-lg text-gray-600">
            <span className="font-semibold text-gray-800">{sortedPatients.length}</span> {sortedPatients.length === 1 ? 'patient' : 'patients'} found
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientRecords;