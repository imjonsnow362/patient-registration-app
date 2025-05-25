import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { UserPlus, Search, Users, DatabaseIcon } from 'lucide-react';
import { useDatabaseContext } from '../state/DBState';
import { getAllPatients } from '../db/DbManager';

const Dashboard: React.FC = () => {
  const { isLoading, isInitialized, error: dbError } = useDatabaseContext(); // Renamed error to dbError for clarity
  const [patientCount, setPatientCount] = useState<number | null>(null); // Initialize as null for initial loading state

  useEffect(() => {
    const loadData = async () => {
      if (isInitialized) {
        try {
          const patients = await getAllPatients(); // Use the service layer
          setPatientCount(patients.length);
        } catch (err) {
          console.error('Error loading dashboard data:', err);
          setPatientCount(0); // Set to 0 or handle error state for count
        }
      }
    };

    // Only load data if not already loading and if DB is initialized
    if (!isLoading && isInitialized && patientCount === null) {
      loadData();
    }
  }, [isInitialized, isLoading, patientCount]); // Add isLoading and patientCount to dependency array

  // --- Loading State ---
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 font-inter p-6">
        <div className="animate-pulse rounded-full h-20 w-20 border-8 border-t-8 border-purple-500 border-opacity-75 mb-6"></div>
        <p className="text-xl font-medium text-gray-700">Connecting to secure systems...</p>
        <p className="text-sm text-gray-500 mt-2">Initializing dashboard features.</p>
      </div>
    );
  }

  // --- Database Error State ---
  if (dbError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-red-50 font-inter p-6 text-center">
        <svg className="h-24 w-24 text-red-600 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <h2 className="text-3xl font-bold text-red-800 mb-3">System Error!</h2>
        <p className="text-lg font-medium text-red-700 max-w-md mx-auto">
          <span className="font-semibold block mb-2">{dbError}</span>
          Dashboard features are unavailable due to a database connection issue. Please refresh or contact support.
        </p>
      </div>
    );
  }

  // --- Main Dashboard Render ---
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 font-inter antialiased">
      <div className="w-full max-w-6xl mx-auto space-y-10">
        <header className="text-center mb-10">
          <h1 className="text-6xl font-extrabold text-gray-900 leading-tight">
            HealthHub Dashboard
          </h1>
          <p className="mt-5 text-xl text-gray-600 max-w-2xl mx-auto">
            Your centralized hub for patient management and data insights.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Total Patients Card */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 flex flex-col justify-between transform transition-all duration-300 hover:scale-105 hover:shadow-2xl">
            <div>
              <div className="flex items-center mb-6">
                <div className="bg-indigo-100 rounded-full p-4 mr-4">
                  <Users className="h-8 w-8 text-indigo-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Total Patients</h3>
              </div>
              <p className="text-5xl font-extrabold text-indigo-700 mb-4">
                {patientCount !== null ? patientCount : '...'}
              </p>
              <p className="text-md text-gray-600">
                Current number of registered patients in the system.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-gray-200">
              <Link
                to="/patients" // Assuming you'll have a /patients route soon
                className="inline-flex items-center text-lg font-semibold text-indigo-600 hover:text-indigo-800 transition-colors duration-200"
              >
                View all patients
                <svg className="ml-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path>
                </svg>
              </Link>
            </div>
          </div>

          {/* Register New Patient Card */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 flex flex-col justify-between transform transition-all duration-300 hover:scale-105 hover:shadow-2xl">
            <div>
              <div className="flex items-center mb-6">
                <div className="bg-emerald-100 rounded-full p-4 mr-4">
                  <UserPlus className="h-8 w-8 text-emerald-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">New Patient Registration</h3>
              </div>
              <p className="text-md text-gray-600 mb-6">
                Quickly onboard new patients with their essential health and contact information.
              </p>
            </div>
            <div className="mt-auto pt-4 border-t border-gray-200">
              <Link
                to="/register"
                className="inline-flex items-center text-lg font-semibold text-emerald-600 hover:text-emerald-800 transition-colors duration-200"
              >
                Register a patient
                <svg className="ml-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path>
                </svg>
              </Link>
            </div>
          </div>

          {/* Query Records Card */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 flex flex-col justify-between transform transition-all duration-300 hover:scale-105 hover:shadow-2xl">
            <div>
              <div className="flex items-center mb-6">
                <div className="bg-rose-100 rounded-full p-4 mr-4">
                  <Search className="h-8 w-8 text-rose-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Query Patient Data</h3>
              </div>
              <p className="text-md text-gray-600 mb-6">
                Access and analyze patient records using powerful search and filter capabilities.
              </p>
            </div>
            <div className="mt-auto pt-4 border-t border-gray-200">
              <Link
                to="/query"
                className="inline-flex items-center text-lg font-semibold text-rose-600 hover:text-rose-800 transition-colors duration-200"
              >
                Go to query interface
                <svg className="ml-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path>
                </svg>
              </Link>
            </div>
          </div>

          {/* Database Status Card (more compact, always at the bottom) */}
          <div className="lg:col-span-3 bg-white rounded-2xl shadow-xl border border-gray-100 p-6 flex items-center justify-between transition-all duration-300 hover:shadow-2xl">
            <div className="flex items-center">
              <div className="bg-blue-100 rounded-full p-3 mr-4">
                <DatabaseIcon className="h-7 w-7 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">System Status</h3>
                <p className="mt-1 text-sm text-gray-600">
                  Pglite database is <span className="font-semibold">online</span> and ready for operations.
                </p>
              </div>
            </div>
            <div className="flex items-center text-sm font-medium text-gray-700">
              <span className="h-3 w-3 bg-green-500 rounded-full mr-2 animate-pulse-slow"></span> {/* Pulsing green dot */}
              Operational
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;