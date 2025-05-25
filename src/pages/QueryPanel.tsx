import React, { useCallback, useEffect, useState } from 'react';
import { executeQuery } from '../db/DbManager';
import { useDatabaseContext } from '../state/DBState';
import { Database, Copy, Download, CheckCircle, XCircle, Code, Lightbulb, ChevronUp, ChevronDown } from 'lucide-react';

interface QueryResult {
  success: boolean;
  data: any[];
  error: string | null;
}

const queryExamples = [
  {
    id: 'basic-patients',
    label: 'All Patients (Limit 10)',
    query: 'SELECT id, first_name, last_name, gender, date_of_birth FROM patients LIMIT 10;',
    description: 'Get basic details for the first 10 patients.',
  },
  {
    id: 'allergies',
    label: 'Patients with Allergies',
    query: "SELECT first_name, last_name, allergies FROM patients WHERE allergies IS NOT NULL AND allergies != '' ORDER BY last_name;",
    description: 'Find patients who have recorded allergies.',
  },
  {
    id: 'gender-count',
    label: 'Gender Distribution',
    query: "SELECT gender, COUNT(*) as patient_count FROM patients GROUP BY gender ORDER BY gender;",
    description: 'Count patients by gender to see the distribution.',
  },
  {
    id: 'adult-females',
    label: 'Adult Females (Age > 18)',
    query: "SELECT first_name, last_name, date_of_birth, gender FROM patients WHERE gender = 'female' AND (CAST(strftime('%Y', 'now') - strftime('%Y', date_of_birth) AS INTEGER)) > 18 LIMIT 20;",
    description: 'Find adult female patients. (Note: Age calculation might vary by DB/data format.)',
  },
  {
    id: 'bmi-over-30',
    label: 'Patients with BMI > 30 (Example)',
    query: "SELECT id, first_name, last_name, height_cm, weight_kg, (weight_kg / ( (height_cm / 100.0) * (height_cm / 100.0) )) as bmi FROM patients WHERE weight_kg IS NOT NULL AND height_cm IS NOT NULL AND (weight_kg / ( (height_cm / 100.0) * (height_cm / 100.0) )) > 30 LIMIT 10;",
    description: 'Calculate BMI and find patients with a BMI over 30 (requires height/weight data).',
  },
];

const PatientQuery: React.FC = () => {
  const { isInitialized, isLoading: dbLoading, error: dbError } = useDatabaseContext();
  const [sqlQuery, setSqlQuery] = useState<string>(queryExamples[0].query);
  const [queryResult, setQueryResult] = useState<QueryResult | null>(null);
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [queryExecutionError, setQueryExecutionError] = useState<string | null>(null);
  const [showExamples, setShowExamples] = useState<boolean>(false); // State to toggle example visibility

  // Auto-execute default query on mount if DB is ready and no result yet
  useEffect(() => {
    if (isInitialized && !dbLoading && !queryResult) {
      executeCustomQuery(sqlQuery);
    }
  }, [isInitialized, dbLoading, queryResult, sqlQuery]); // sqlQuery added to deps for auto-exec if default changes

  const handleQueryChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setSqlQuery(e.target.value);
  };

  const executeCustomQuery = useCallback(async (queryToExecute: string) => {
    if (!queryToExecute.trim()) {
      setQueryResult(null);
      setQueryExecutionError(null);
      return;
    }

    setIsExecuting(true);
    setQueryResult(null);
    setQueryExecutionError(null);
    setCopied(false);

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
  }, []); // useCallback memoizes the function to prevent unnecessary re-renders

  const handleLoadExample = (exampleQuery: string) => {
    setSqlQuery(exampleQuery);
    executeCustomQuery(exampleQuery); // Auto-execute example on load
    setShowExamples(false); // Optionally hide examples after selecting one
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(err => {
      console.error('Failed to copy text:', err);
      // Optionally show a temporary error message to the user, e.g., a toast
    });
  };

  const downloadResults = () => {
    if (!queryResult?.data || queryResult.data.length === 0) return;

    const serializableData = queryResult.data.map(row => {
      const newRow: { [key: string]: any } = {};
      for (const key in row) {
        if (Object.prototype.hasOwnProperty.call(row, key)) {
          const value = row[key];
          newRow[key] = typeof value === 'bigint' ? value.toString() : value; // Handle BigInt
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

  // --- Initializing / DB Error State (unchanged as per request) ---
  if (dbLoading || !isInitialized) {
    return (
      <div className="flex flex-col items-center justify-center min-h-full py-12 px-4 sm:px-6 lg:px-8">
        <div className="animate-pulse rounded-full h-20 w-20 border-8 border-t-8 border-purple-500 border-opacity-75 mb-6"></div>
        <p className="text-xl font-medium text-gray-700">Loading query interface...</p>
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
          Queries cannot be executed. Ensure the database is accessible.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col items-center font-inter antialiased">
      <header className="text-center mb-10 w-full max-w-7xl">
        <h1 className="text-5xl font-extrabold text-gray-900 leading-tight">
          Advanced Query Console
        </h1>
        <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
          Directly interact with the patient database using custom SQL commands.
        </p>
      </header>

      <div className="w-full max-w-7xl mx-auto space-y-8">
        {/* SQL Editor Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <Code className="h-6 w-6 text-purple-600 mr-3" />
              SQL Editor
            </h2>
            <div className="flex space-x-3">
                <button
                    type="button"
                    onClick={() => setShowExamples(!showExamples)}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-full text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-sm"
                >
                    <Lightbulb className="h-4 w-4 mr-2" />
                    {showExamples ? 'Hide Examples' : 'Show Examples'}
                    {showExamples ? <ChevronUp className="h-4 w-4 ml-2" /> : <ChevronDown className="h-4 w-4 ml-2" />}
                </button>
                <button
                    type="button"
                    onClick={() => setSqlQuery('')}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-full text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors duration-200 shadow-sm"
                >
                    <XCircle className="h-4 w-4 mr-2" /> Clear
                </button>
            </div>
          </div>

          <textarea
            id="sqlQuery"
            rows={10} // Optimized rows
            className="form-input-alt font-mono text-base resize-y overflow-auto leading-relaxed h-auto w-full min-h-[180px]"
            value={sqlQuery}
            onChange={handleQueryChange}
            placeholder="e.g., SELECT * FROM patients WHERE gender = 'female';"
            spellCheck="false"
          ></textarea>

          {/* Query Examples Section - Collapsible */}
          <div className={`transition-all duration-300 ease-in-out overflow-hidden ${showExamples ? 'max-h-[500px] mt-6' : 'max-h-0'}`}>
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <Lightbulb className="h-5 w-5 text-indigo-600 mr-2" />
                Quick Examples
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {queryExamples.map((example) => (
                <button
                  key={example.id}
                  onClick={() => handleLoadExample(example.query)}
                  className="block w-full text-left p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors duration-200 border border-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 group"
                >
                  <span className="text-md font-semibold text-gray-800 group-hover:text-indigo-700 block mb-1">
                    {example.label}
                  </span>
                  <p className="text-sm text-gray-600 group-hover:text-gray-700 leading-snug">
                    {example.description}
                  </p>
                  <pre className="mt-2 text-xs text-gray-500 font-mono overflow-x-auto whitespace-pre-wrap break-words">{example.query}</pre>
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end mt-8">
            <button
              type="button"
              onClick={() => executeCustomQuery(sqlQuery)}
              disabled={isExecuting || !sqlQuery.trim()}
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
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
          <div className="px-8 py-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
              <h3 className="text-2xl font-bold text-gray-900">Query Results</h3>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => copyToClipboard(JSON.stringify(queryResult?.data || [], null, 2))}
                  className="inline-flex items-center px-5 py-2 border border-gray-300 text-sm font-medium rounded-full text-gray-700 bg-white hover:bg-gray-50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 shadow-sm"
                  disabled={!queryResult?.success || queryResult.data.length === 0}
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
                  className="inline-flex items-center px-5 py-2 border border-gray-300 text-sm font-medium rounded-full text-gray-700 bg-white hover:bg-gray-50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 shadow-sm"
                  disabled={!queryResult?.success || queryResult.data.length === 0}
                >
                  <Download className="h-4 w-4 mr-2" /> Download JSON
                </button>
              </div>
            </div>

            {/* Query Execution Loading State */}
            {isExecuting && (
              <div className="flex flex-col items-center justify-center py-20 text-gray-600">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-t-4 border-purple-500 border-opacity-75 mb-6"></div>
                <p className="text-xl font-medium">Executing Query...</p>
                <p className="text-sm text-gray-500 mt-2">Retrieving data from the database.</p>
              </div>
            )}

            {/* Query Execution Error Display */}
            {!isExecuting && queryExecutionError && (
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
            {!isExecuting && queryResult && queryResult.success && queryResult.data.length === 0 ? (
              <div className="text-center py-10">
                <svg className="mx-auto h-20 w-20 text-gray-300 mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="mt-4 text-xl font-semibold text-gray-900">No results found</h3>
                <p className="mt-2 text-md text-gray-600">Your query executed successfully but returned no data. Try a different query!</p>
              </div>
            ) : !isExecuting && queryResult && queryResult.success && queryResult.data.length > 0 ? (
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
                                  ? JSON.stringify(value)
                                  : String(value)}
                            </td>
                          ))}
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            ) : null /* If not executing, no error, and no results, perhaps show an initial message or nothing */ }
          </div>
          {!isExecuting && queryResult?.success && queryResult.data.length > 0 && (
            <div className="bg-gray-50 px-8 py-4 border-t border-gray-200 text-right">
              <p className="text-md text-gray-600">
                <span className="font-semibold text-gray-800">{queryResult.data.length}</span> {queryResult.data.length === 1 ? 'record' : 'records'} retrieved
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientQuery;