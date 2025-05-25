import React from 'react';
import type { PatientFormData } from '../interfaces/patient';
import { useDatabaseContext } from '../state/DBState';
import { registerPatient } from '../services/patientService';
import { validatePatientForm } from '../utils/validations';
import { useForm } from '../hooks/useForm';

interface PatientRegistrationFormProps {
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
}

const initialFormData: PatientFormData = {
  first_name: '',
  last_name: '',
  date_of_birth: '',
  gender: '',
  email: '',
  phone: '',
  address: '',
  height_cm: '', 
  weight_kg: '', 
  allergies: '', 
  medical_notes: '', 
};

const AddPatient: React.FC<PatientRegistrationFormProps> = () => {
  const { isLoading, error: dbError } = useDatabaseContext();
  const { formData, errors, handleChange, handleSubmit, isSubmitting, submitSuccess, resetForm } = useForm<PatientFormData>(
    initialFormData,
    validatePatientForm, // This function in utils/validations.ts MUST be updated!
    async (data) => {
      await registerPatient(data);
    }
  );

  // --- Loading State ---
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 font-sans p-6">
        <div className="animate-pulse rounded-full h-20 w-20 border-8 border-t-8 border-emerald-500 border-opacity-75 mb-6"></div>
        <p className="text-xl font-medium text-gray-700">Connecting to secure records...</p>
        <p className="text-sm text-gray-500 mt-2">Please wait a moment while we initialize the database.</p>
      </div>
    );
  }

  // --- Database Error State ---
  if (dbError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-red-50 font-sans p-6">
        <svg className="h-24 w-24 text-red-600 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <h2 className="text-3xl font-bold text-red-800 text-center mb-3">Database Connection Failed!</h2>
        <p className="text-lg font-medium text-red-700 text-center max-w-md">
          <span className="font-semibold block mb-2">{dbError}</span>
          It seems there's an issue connecting to our systems. Please refresh the page or contact support.
        </p>
      </div>
    );
  }

  // --- Main Form Render ---
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center py-10 px-4 sm:px-6 lg:px-8 font-inter antialiased">
      <div className="w-full max-w-6xl mx-auto bg-white rounded-3xl shadow-xl transform transition-all duration-300 hover:shadow-2xl overflow-hidden border border-gray-100">
        <div className="grid grid-cols-1 lg:grid-cols-3">
          {/* Left Section - Hero/Branding */}
          <div className="lg:col-span-1 bg-gradient-to-tl from-purple-300 to-indigo-500 p-8 lg:p-12 text-white flex flex-col justify-between relative overflow-hidden">
            <div className="absolute inset-0 bg-pattern-dots opacity-20 transform scale-150"></div> {/* Background pattern */}
            <h1 className="text-5xl font-extrabold tracking-tight leading-tight z-10">
              New Patient <br /> Enrollment
            </h1>
            <p className="mt-6 text-xl font-light opacity-90 z-10">
              Streamline the registration process with our intuitive and secure patient intake form.
            </p>
            <div className="mt-auto pt-8 z-10">
              <p className="text-lg font-semibold flex items-center">
                <svg className="h-6 w-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.279a8.958 8.958 0 013.482 1.31M6.712 19.26C3.957 17.009 2 13.513 2 9.5a8.961 8.961 0 011.801-5.367m6.308 1.487l-2.755 1.579M13 14l-2 2-4-4m0-7.071c-.751.218-1.46.577-2.113 1.059M16 17H4a2 2 0 00-2 2v2a2 2 0 002 2h12a2 2 0 002-2v-2a2 2 0 00-2-2z"></path>
                </svg>
                Secure & Confidential
              </p>
            </div>
          </div>

          {/* Right Section - Form */}
          <div className="lg:col-span-2 p-8 sm:p-10 lg:p-12">
            {submitSuccess && (
              <div className="rounded-lg bg-green-50 p-6 mb-8 shadow-md border border-green-200 animate-slide-in-down flex items-center space-x-4">
                <svg className="h-8 w-8 text-green-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <p className="text-lg font-medium text-green-800">
                  Patient record successfully created! Ready for the next steps.
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-10">
              {/* Personal Information Section */}
              <div className="border-b border-gray-200 pb-8">
                <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
                  <span className="text-purple-600 text-4xl mr-3 font-extrabold">01</span> Personal Details
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="form-group">
                    <label htmlFor="first_name" className="form-label required">First Name</label>
                    <input
                      type="text" id="first_name" name="first_name" value={formData.first_name} onChange={handleChange}
                      className={`form-input-alt ${errors.first_name ? 'border-red-500 ring-red-500' : ''}`}
                      aria-invalid={errors.first_name ? "true" : "false"} aria-describedby="first_name-error"
                      placeholder="e.g., John"
                    />
                    {errors.first_name && (<p id="first_name-error" className="error-message">{errors.first_name}</p>)}
                  </div>

                  <div className="form-group">
                    <label htmlFor="last_name" className="form-label required">Last Name</label>
                    <input
                      type="text" id="last_name" name="last_name" value={formData.last_name} onChange={handleChange}
                      className={`form-input-alt ${errors.last_name ? 'border-red-500 ring-red-500' : ''}`}
                      aria-invalid={errors.last_name ? "true" : "false"} aria-describedby="last_name-error"
                      placeholder="e.g., Doe"
                    />
                    {errors.last_name && (<p id="last_name-error" className="error-message">{errors.last_name}</p>)}
                  </div>

                  <div className="form-group">
                    <label htmlFor="date_of_birth" className="form-label required">Date of Birth</label>
                    <input
                      type="date" id="date_of_birth" name="date_of_birth" value={formData.date_of_birth} onChange={handleChange}
                      className={`form-input-alt ${errors.date_of_birth ? 'border-red-500 ring-red-500' : ''}`}
                      aria-invalid={errors.date_of_birth ? "true" : "false"} aria-describedby="date_of_birth-error"
                    />
                    {errors.date_of_birth && (<p id="date_of_birth-error" className="error-message">{errors.date_of_birth}</p>)}
                  </div>

                  <div className="form-group">
                    <label htmlFor="gender" className="form-label required">Gender</label>
                    <select
                      id="gender" name="gender" value={formData.gender} onChange={handleChange}
                      className={`form-input-alt ${errors.gender ? 'border-red-500 ring-red-500' : ''}`}
                      aria-invalid={errors.gender ? "true" : "false"} aria-describedby="gender-error"
                    >
                      <option value="">Select gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                      <option value="prefer_not_to_say">Prefer not to say</option>
                    </select>
                    {errors.gender && (<p id="gender-error" className="error-message">{errors.gender}</p>)}
                  </div>
                </div>
              </div>

              {/* Contact Information Section */}
              <div className="border-b border-gray-200 pb-8">
                <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
                  <span className="text-purple-600 text-4xl mr-3 font-extrabold">02</span> Contact Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="form-group">
                    <label htmlFor="email" className="form-label">Email Address</label>
                    <input
                      type="email" id="email" name="email" value={formData.email} onChange={handleChange}
                      className={`form-input-alt ${errors.email ? 'border-red-500 ring-red-500' : ''}`}
                      aria-invalid={errors.email ? "true" : "false"} aria-describedby="email-error"
                      placeholder="e.g., patient@example.com"
                    />
                    {errors.email && (<p id="email-error" className="error-message">{errors.email}</p>)}
                  </div>

                  <div className="form-group">
                    <label htmlFor="phone" className="form-label">Phone Number</label>
                    <input
                      type="tel" id="phone" name="phone" value={formData.phone} onChange={handleChange}
                      className="form-input-alt"
                      placeholder="(123) 456-7890"
                    />
                  </div>

                  <div className="col-span-full form-group">
                    <label htmlFor="address" className="form-label">Address</label>
                    <input
                      type="text" id="address" name="address" value={formData.address} onChange={handleChange}
                      className="form-input-alt"
                      placeholder="Street address, city, state, zip code"
                    />
                  </div>
                </div>
              </div>

              {/* --- UPDATED: Health Metrics Section --- */}
              <div>
                <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
                  <span className="text-purple-600 text-4xl mr-3 font-extrabold">03</span> Health Metrics
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="form-group">
                    <label htmlFor="height_cm" className="form-label">Height (cm)</label>
                    <input
                      type="number" id="height_cm" name="height_cm" value={formData.height_cm} onChange={handleChange}
                      className={`form-input-alt ${errors.height_cm ? 'border-red-500 ring-red-500' : ''}`}
                      aria-invalid={errors.height_cm ? "true" : "false"} aria-describedby="height_cm-error"
                      placeholder="e.g., 175"
                    />
                    {errors.height_cm && (<p id="height_cm-error" className="error-message">{errors.height_cm}</p>)}
                  </div>

                  <div className="form-group">
                    <label htmlFor="weight_kg" className="form-label">Weight (kg)</label>
                    <input
                      type="number" id="weight_kg" name="weight_kg" value={formData.weight_kg} onChange={handleChange}
                      className={`form-input-alt ${errors.weight_kg ? 'border-red-500 ring-red-500' : ''}`}
                      aria-invalid={errors.weight_kg ? "true" : "false"} aria-describedby="weight_kg-error"
                      placeholder="e.g., 70"
                    />
                    {errors.weight_kg && (<p id="weight_kg-error" className="error-message">{errors.weight_kg}</p>)}
                  </div>

                  <div className="col-span-full form-group">
                    <label htmlFor="allergies" className="form-label">Allergies</label>
                    <textarea
                      id="allergies" name="allergies" rows={2} value={formData.allergies} onChange={handleChange}
                      className="form-input-alt resize-y"
                      placeholder="List any known allergies (e.g., Penicillin, Peanuts, Dust Mites)"
                    ></textarea>
                  </div>

                  <div className="col-span-full form-group">
                    <label htmlFor="medical_notes" className="form-label">Other Medical Notes</label>
                    <textarea
                      id="medical_notes" name="medical_notes" rows={3} value={formData.medical_notes} onChange={handleChange}
                      className="form-input-alt resize-y"
                      placeholder="Any relevant medical history, previous conditions, or additional notes."
                    ></textarea>
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex flex-col sm:flex-row justify-end items-center gap-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  className="w-full sm:w-auto px-8 py-3 rounded-full text-base font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300 shadow-sm"
                  onClick={resetForm}
                  disabled={isSubmitting}
                >
                  Clear Form
                </button>
                <button
                  type="submit"
                  className="w-full sm:w-auto inline-flex items-center justify-center px-10 py-3 rounded-full text-base font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800 transition-all duration-300 ease-in-out transform hover:scale-105 shadow-lg disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Submitting...
                    </>
                  ) : (
                    'Complete Registration'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddPatient;