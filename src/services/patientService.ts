// src/services/patientService.ts
import { registerPatient as dbRegisterPatient } from '../db/DbManager';
import { getAllPatients as dbGetAllPatients } from '../db/DbManager';
import { searchPatientsByName as dbSearchPatientsByName } from '../db/DbManager';
import type { Patient, PatientFormData } from '../interfaces/patient';

export const registerPatient = async (patientData: PatientFormData): Promise<void> => {
  console.log('Attempting to register patient:', patientData);
  try {
    // Call your actual database manager function here
    await dbRegisterPatient(patientData);
    console.log('Patient registered successfully via service.');
  } catch (error) {
    console.error('Failed to register patient in service:', error);
    throw new Error('Could not register patient. Please try again.');
  }
};

export const getAllPatients = async (): Promise<Patient[]> => {
  try {
    // Call the function from DbManager
    const result = await dbGetAllPatients();
    // Assuming DbManager returns rows that directly map to Patient interface or need slight mapping
    // If DbManager returns 'any[]', you might want to map it to Patient type here for type safety
    return result as Patient[];
  } catch (error) {
    console.error('Error in patientService.getAllPatients:', error);
    throw error; // Re-throw to be handled by the component
  }
};

export const searchPatientsByName = async (searchTerm: string): Promise<Patient[]> => {
  try {
    // Call the function from DbManager
    const result = await dbSearchPatientsByName(searchTerm);
    // Assuming DbManager returns rows that directly map to Patient interface or need slight mapping
    return result as Patient[];
  } catch (error) {
    console.error('Error in patientService.searchPatientsByName:', error);
    throw error; // Re-throw to be handled by the component
  }
};