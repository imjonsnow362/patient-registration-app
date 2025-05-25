import React, { useEffect, useState } from 'react';
import { executeQuery } from '../db/DbManager';
import { useDatabaseContext } from '../state/DBState';
import { Database, Clipboard, Copy, Download, CheckCircle, XCircle, Eclipse } from 'lucide-react';

interface QueryResult {
  success: boolean;
  data: any[];
  error: string | null;
}

const PatientQuery: React.FC = () => {
  const { isInitialized, isLoading: dbLoading, error: dbError } = useDatabaseContext();
  const [sqlQuery, setSqlQuery] = useState<string>('SELECT * FROM patients LIMIT 10;'); // Added semicolon for good SQL practice
  const [queryResult, setQueryResult] = useState<QueryResult | null>(null);
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [queryExecutionError, setQueryExecutionError] = useState<string | null>(null); // Specific error for query execution

  // Initial query execution on component mount (optional, but good for demo)
  useEffect(() => {
    if (isInitialized && !dbLoading && !queryResult) {
      executeCustomQuery(sqlQuery);
    }
  }, [isInitialized, dbLoading, queryResult]); // Run when initialized and no result yet

  const handleQueryChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setSqlQuery(e.target.value);
  };

  const executeCustomQuery = async (queryToExecute: string = sqlQuery) => {
    if (!queryToExecute.trim()) {
      setQueryResult(null); // Clear previous results if query is empty
      setQueryExecutionError(null);
      return;
    }
    
    setIsExecuting(true);
    setQueryResult(null); // Clear previous results
    setQueryExecutionError(null); // Clear previous errors
    setCopied(false); // Reset copy status

    try {
      const result = await executeQuery(queryToExecute);
      setQueryResult(result);
      if (!result.success && result.error) {
        setQueryExecutionError(result.error);
      }
    } catch (error: any) {
      console.error('Error in executeCustomQuery:', error);
      setQueryResult({
        success: false,
        data: [],
        error: error.message || 'An unexpected error occurred.',
      });
      setQueryExecutionError(error.message || 'An unexpected error occurred during query execution.');
    } finally {
      setIsExecuting(false);
    }
  };

  const handleLoadExample = (example: string) => {
    setSqlQuery(example);
    // Optionally auto-execute example query
    // executeCustomQuery(example);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(err => {
      console.error('Failed to copy text:', err);
      // Optionally show a temporary error message to the user
    });
  };

  const downloadResults = () => {
    if (!queryResult?.data || queryResult.data.length === 0) return;
    
    // Convert BigInt to string for JSON.stringify compatibility
    const serializableData = queryResult.data.map(row => {
      const newRow: { [key: string]: any } = {};
      for (const key in row) {
        if (Object.prototype.hasOwnProperty.call(row, key)) {
          const value = row[key];
          newRow[key] = typeof value === 'bigint' ? value.toString() : value;
        }
      }
      return newRow;
    });

    const jsonStr = JSON.stringify(serializableData, null, 2);
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(jsonStr);
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `healthhub_query_results_${new Date().toISOString().slice(0,10)}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  // --- Initializing / DB Error State ---
  if (dbLoading || !isInitialized) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 font-inter p-6">
        <div className="animate-pulse rounded-full h-20 w-20 border-8 border-t-8 border-purple-500 border-opacity-75 mb-6"></div>
        <p className="text-xl font-medium text-gray-700">Loading query interface...</p>
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
          Cannot run queries. Please check your database connection.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8 font-inter antialiased">
      <div className="w-full max-w-7xl mx-auto space-y-10">
        <header className="text-center mb-10">
          <h1 className="text-5xl font-extrabold text-gray-900 leading-tight">
            Database Query Tool
          </h1>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            Execute custom SQL commands directly against the patient database and view results.
          </p>
        </header>

        {/* Query Input Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-8">
          <div className="mb-6">
            <label htmlFor="sqlQuery" className="block text-xl font-semibold text-gray-800 mb-3">
              Enter SQL Query
            </label>
            <textarea
              id="sqlQuery"
              rows={8} // Increased rows for more space
              className="form-input-alt font-mono text-base resize-y overflow-auto leading-relaxed" // Enhanced styling, resize-y
              value={sqlQuery}
              onChange={handleQueryChange}
              placeholder="e.g., SELECT first_name, last_name, email FROM patients WHERE gender = 'female';"
              spellCheck="false" // Disable spell check for SQL
            ></textarea>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6">
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => handleLoadExample('SELECT id, first_name, last_name, date_of_birth, gender FROM patients ORDER BY last_name LIMIT 10;')}
                className="inline-flex items-center px-5 py-2 border border-gray-300 text-sm font-medium rounded-full text-gray-700 bg-white hover:bg-gray-50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-sm"
              >
                <Eclipse className="h-4 w-4 mr-2"/> Basic Patient List
              </button>
              <button
                type="button"
                onClick={() => handleLoadExample("SELECT first_name, last_name, allergies FROM patients WHERE allergies IS NOT NULL AND allergies != '' ORDER BY last_name;")}
                className="inline-flex items-center px-5 py-2 border border-gray-300 text-sm font-medium rounded-full text-gray-700 bg-white hover:bg-gray-50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-sm"
              >
                <Eclipse className="h-4 w-4 mr-2"/> Allergies Only
              </button>
              <button
                type="button"
                onClick={() => handleLoadExample("SELECT gender, COUNT(*) as patient_count FROM patients GROUP BY gender;")}
                className="inline-flex items-center px-5 py-2 border border-gray-300 text-sm font-medium rounded-full text-gray-700 bg-white hover:bg-gray-50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-sm"
              >
                <Eclipse className="h-4 w-4 mr-2" /> Gender Statistics
              </button>
            </div>
            <button
              type="button"
              onClick={() => executeCustomQuery()}
              disabled={isExecuting}
              className="inline-flex items-center justify-center px-8 py-3 rounded-full text-base font-semibold text-white bg-purple-600 hover:bg-purple-700 transition-all duration-300 ease-in-out transform hover:scale-105 shadow-lg disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isExecuting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Executing...
                </>
              ) : (
                <>
                  <Database className="h-5 w-5 mr-3" /> Run Query
                </>
              )}
            </button>
          </div>
        </div>

        {/* Query Results Card */}
        {queryResult && (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
            <div className="px-8 py-6"> {/* Increased padding */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
                <h3 className="text-2xl font-bold text-gray-900">Query Results</h3>
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => copyToClipboard(JSON.stringify(queryResult.data, null, 2))}
                    className="inline-flex items-center px-5 py-2 border border-gray-300 text-sm font-medium rounded-full text-gray-700 bg-white hover:bg-gray-50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 shadow-sm"
                    disabled={!queryResult.success || queryResult.data.length === 0}
                  >
                    {copied ? (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2 text-emerald-500" /> Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-2" /> Copy JSON
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={downloadResults}
                    className="inline-flex items-center px-5 py-2 border border-gray-300 text-sm font-medium rounded-full text-gray-700 bg-white hover:bg-gray-50 transition-all duration-200 focus:outline-none focus:ring-2 focus://ring-offset-2 focus:ring-emerald-500 shadow-sm"
                    disabled={!queryResult.success || queryResult.data.length === 0}
                  >
                    <Download className="h-4 w-4 mr-2" /> Download JSON
                  </button>
                </div>
              </div>

              {/* Query Execution Error Display */}
              {queryExecutionError && (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg mb-6" role="alert">
                  <div className="flex items-center">
                    <XCircle className="h-6 w-6 mr-3 flex-shrink-0" />
                    <div>
                      <p className="font-bold text-lg">Query Error:</p>
                      <p className="text-base">{queryExecutionError}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* No Results / Successful Results */}
              {!queryResult.success && !queryExecutionError ? (
                <div className="text-center py-10">
                  <svg className="mx-auto h-20 w-20 text-gray-300 mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="mt-4 text-xl font-semibold text-gray-900">No results</h3>
                  <p className="mt-2 text-md text-gray-600">Your query did not return any results.</p>
                </div>
              ) : (queryResult.success && queryResult.data.length === 0) ? (
                <div className="text-center py-10">
                  <svg className="mx-auto h-20 w-20 text-gray-300 mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="mt-4 text-xl font-semibold text-gray-900">No results</h3>
                  <p className="mt-2 text-md text-gray-600">Your query returned no data. Try a different query!</p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-lg border border-gray-200">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        {Object.keys(queryResult.data[0]).map((column) => (
                          <th key={column} className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap">
                            {column}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                      {queryResult.data.map((row, rowIndex) => (
                        <tr key={rowIndex} className="hover:bg-gray-50 transition-colors duration-150">
                          {Object.values(row).map((value: any, colIndex) => (
                            <td key={colIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                              {value === null || value === undefined
                                ? <span className="text-gray-400 italic">NULL</span>
                                : typeof value === 'object' && value !== null
                                  ? JSON.stringify(value) // Handle objects/arrays in result
                                  : String(value)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            {queryResult.success && queryResult.data.length > 0 && (
              <div className="bg-gray-50 px-8 py-4 border-t border-gray-200 text-right">
                <p className="text-md text-gray-600">
                  <span className="font-semibold text-gray-800">{queryResult.data.length}</span> {queryResult.data.length === 1 ? 'record' : 'records'} retrieved
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientQuery;