import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { initDatabase } from '../db/DbManager';

type HealthHubDatabaseContextType = {
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
};

const DBContext = createContext<HealthHubDatabaseContextType>({
  isLoading: true,
  isInitialized: false,
  error: null,
});

export const useDatabaseContext = () => {
  const context = useContext(DBContext);
  if (context === undefined) {
    throw new Error('useDatabaseContext must be used within a DatabaseProvider');
  }
  return context;
};

export const DatabaseProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeHealthHubDatabase = async () => {
      console.log('Attempting to initialize HealthHub database...');
      setIsLoading(true);
      setIsInitialized(false);
      setError(null);

      try {
        await initDatabase();
        setIsInitialized(true);
        console.log('HealthHub database successfully initialized.');
      } catch (err: any) {
        console.error('HealthHub database initialization failed:', err);
        setError(
          err.message || 'Failed to initialize the HealthHub database. Please check your setup.'
        );
      } finally {
        setIsLoading(false);
      }
    };

    initializeHealthHubDatabase();
  }, []);

  const contextValue = {
    isLoading,
    isInitialized,
    error,
  };

  return (
    <DBContext.Provider value={contextValue}>
      {children}
    </DBContext.Provider>
  );
};