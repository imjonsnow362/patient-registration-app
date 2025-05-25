import React, { useEffect, useState } from 'react';
import { getAllPatients, searchPatientsByName } from '../db/DbManager';
import { useDatabaseContext } from '../state/DBState';
import { Search, Download, UserPlus, Link, ArrowUp, ArrowDown } from 'lucide-react';
import type { Patient } from '../interfaces/patient';

const PatientRecords: React.FC = () => {
  const { isInitialized, isLoading: dbLoading, error: dbError } = useDatabaseContext(); // Renamed for clarity
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true); // For component-specific loading (data fetching)
  const [sortField, setSortField] = useState<keyof Patient>('last_name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [fetchError, setFetchError] = useState<string | null>(null); // State for data fetching errors

  useEffect(() => {
    // Only load patients if DB is initialized AND not currently loading from DB context
    if (isInitialized && !dbLoading) {
      loadPatients();
    }
  }, [isInitialized, dbLoading]); // Added dbLoading to dependencies

  const loadPatients = async () => {
    setIsLoading(true);
    setFetchError(null); // Clear any previous errors
    try {
      const patientData = await getAllPatients();
      setPatients(patientData);
    } catch (error: any) { // Catching 'any' type for console.error clarity
      console.error('Error loading patients:', error);
      setFetchError(`Failed to load patient data: ${error.message || 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      await loadPatients(); // If search term is empty, reload all patients
      return;
    }

    setIsLoading(true);
    setFetchError(null);
    try {
      const results = await searchPatientsByName(searchTerm);
      setPatients(results);
    } catch (error: any) {
      console.error('Error searching patients:', error);
      setFetchError(`Failed to search patients: ${error.message || 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSort = (field: keyof Patient) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedPatients = [...patients].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];

    // Handle null/undefined values for robust sorting
    if (aValue === null || aValue === undefined) return sortDirection === 'asc' ? 1 : -1;
    if (bValue === null || bValue === undefined) return sortDirection === 'asc' ? -1 : 1;

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === 'asc'
        ? aValue.localeCompare(bValue, undefined, { numeric: true, sensitivity: 'base' })
        : bValue.localeCompare(aValue, undefined, { numeric: true, sensitivity: 'base' });
    }

    if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    }
    
    // Fallback for other types or mixed types, though string comparison is usually preferred for display
    if (String(aValue) < String(bValue)) return sortDirection === 'asc' ? -1 : 1;
    if (String(aValue) > String(bValue)) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const downloadPatientData = () => {
    if (patients.length === 0) return;
    
    // Exclude 'id' and 'created_at' if they are internal DB fields not needed in export
    const exportPatients = patients.map(({ id, created_at, ...rest }) => ({ ...rest, created_at: new Date(created_at).toLocaleString() }));

    const jsonStr = JSON.stringify(exportPatients, null, 2);
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(jsonStr);
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `healthhub_patients_${new Date().toISOString().slice(0,10)}.json`); // Dynamic filename
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  // --- Initializing / DB Error State ---
  if (dbLoading || !isInitialized) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 font-inter p-6">
        <div className="animate-pulse rounded-full h-20 w-20 border-8 border-t-8 border-purple-500 border-opacity-75 mb-6"></div>
        <p className="text-xl font-medium text-gray-700">Loading patient records...</p>
        <p className="text-sm text-gray-500 mt-2">Connecting to the secure database.</p>
      </div>
    );
  }

  if (dbError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-red-50 font-inter p-6 text-center">
        <svg className="h-24 w-24 text-red-600 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <h2 className="text-3xl font-bold text-red-800 mb-3">Database Connection Failed!</h2>
        <p className="text-lg font-medium text-red-700 max-w-md mx-auto">
          <span className="font-semibold block mb-2">{dbError}</span>
          Cannot load patient data. Please check your database connection.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8 font-inter antialiased">
      <div className="w-full max-w-7xl mx-auto space-y-10">
        <header className="text-center mb-10">
          <h1 className="text-5xl font-extrabold text-gray-900 leading-tight">
            Patient Directory
          </h1>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            Manage and explore comprehensive details of all registered patients.
          </p>
        </header>

        {/* Search and Actions Bar */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-6 w-6 text-gray-400" />
            </div>
            <input
              type="text"
              className="form-input-alt pl-12 py-3 pr-4 text-lg" // Larger input
              placeholder="Search patients by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={handleSearch}
              className="inline-flex items-center justify-center px-6 py-3 rounded-full text-base font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-all duration-300 ease-in-out transform hover:scale-105 shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Search
            </button>
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                loadPatients();
              }}
              className="inline-flex items-center justify-center px-6 py-3 rounded-full text-base font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300 shadow-md"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={downloadPatientData}
              className="inline-flex items-center justify-center px-6 py-3 rounded-full text-base font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition-all duration-300 ease-in-out transform hover:scale-105 shadow-md disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
              disabled={patients.length === 0}
            >
              <Download className="h-5 w-5 mr-2" /> Export JSON
            </button>
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
          </div>
        ) : patients.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center min-h-[300px] flex flex-col items-center justify-center">
            <svg className="mx-auto h-20 w-20 text-gray-300 mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="mt-4 text-xl font-semibold text-gray-900">No patients found</h3>
            <p className="mt-2 text-md text-gray-600 max-w-md">
              {searchTerm ? 'Your search returned no results. Try a different name.' : 'No patients are currently registered. Get started by adding a new patient!'}
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
            <div className="overflow-x-auto"> {/* Added for better responsiveness on small screens */}
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-150"
                      onClick={() => handleSort('last_name')}
                    >
                      <div className="flex items-center whitespace-nowrap">
                        Patient Name
                        {sortField === 'last_name' && (
                          <span className="ml-2 text-gray-500">
                            {sortDirection === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
                          </span>
                        )}
                      </div>
                    </th>
                    <th
                      className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-150"
                      onClick={() => handleSort('date_of_birth')}
                    >
                      <div className="flex items-center whitespace-nowrap">
                        Date of Birth
                        {sortField === 'date_of_birth' && (
                          <span className="ml-2 text-gray-500">
                            {sortDirection === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
                          </span>
                        )}
                      </div>
                    </th>
                    <th
                      className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-150"
                      onClick={() => handleSort('gender')}
                    >
                      <div className="flex items-center whitespace-nowrap">
                        Gender
                        {sortField === 'gender' && (
                          <span className="ml-2 text-gray-500">
                            {sortDirection === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
                          </span>
                        )}
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Height (cm)
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Weight (kg)
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Allergies
                    </th>
                    <th
                      className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-150"
                      onClick={() => handleSort('phone')}
                    >
                      <div className="flex items-center whitespace-nowrap">
                        Contact
                        {sortField === 'phone' && (
                          <span className="ml-2 text-gray-500">
                            {sortDirection === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
                          </span>
                        )}
                      </div>
                    </th>
                    <th
                      className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-150"
                      onClick={() => handleSort('created_at')}
                    >
                      <div className="flex items-center whitespace-nowrap">
                        Registered On
                        {sortField === 'created_at' && (
                          <span className="ml-2 text-gray-500">
                            {sortDirection === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
                          </span>
                        )}
                      </div>
                    </th>
                    {/* Actions column if you add edit/delete functionality */}
                    {/* <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Actions</th> */}
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
                        {new Date(patient.created_at).toLocaleDateString()}
                      </td>
                      {/* Action buttons would go here if uncommented */}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="mt-8 text-center text-lg text-gray-600">
          <span className="font-semibold text-gray-800">{patients.length}</span> {patients.length === 1 ? 'patient' : 'patients'} found
        </div>
      </div>
    </div>
  );
};

export default PatientRecords;