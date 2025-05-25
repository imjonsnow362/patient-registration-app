import type { PatientFormData } from "../interfaces/patient";

type FormErrors<T> = Partial<Record<keyof T, string>>;

export const validatePatientForm = (formData: PatientFormData): FormErrors<PatientFormData> => {
  const newErrors: FormErrors<PatientFormData> = {};

  if (!formData.first_name.trim()) {
    newErrors.first_name = 'First name is required.';
  }

  if (!formData.last_name.trim()) {
    newErrors.last_name = 'Last name is required.';
  }

  if (!formData.date_of_birth.trim()) {
    newErrors.date_of_birth = 'Date of birth is required.';
  }

  if (!formData.gender) {
    newErrors.gender = 'Gender is required.';
  }

  if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    newErrors.email = 'Invalid email format.';
  }

  // Add more specific validations as needed
  // Example: Phone number format validation
  // if (formData.phone && !/^\(\d{3}\) \d{3}-\d{4}$/.test(formData.phone)) {
  //   newErrors.phone = 'Invalid phone format. Expected (123) 456-7890';
  // }

  return newErrors;
};