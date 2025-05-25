import { useState } from 'react';

type Errors<T> = Partial<Record<keyof T, string>>;
type Validator<T> = (data: T) => Errors<T>;
type SubmitCallback<T> = (data: T) => Promise<void>;

export const useForm = <T extends Record<string, any>>(
  initialState: T,
  validator: Validator<T>,
  onSubmitCallback: SubmitCallback<T>
) => {
  const [formData, setFormData] = useState<T>(initialState);
  const [errors, setErrors] = useState<Errors<T>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error for the field being changed
    if (errors[name as keyof T]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors = validator(formData);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitSuccess(false); // Reset success state on new submission attempt

    try {
      await onSubmitCallback(formData);
      setSubmitSuccess(true);
      setFormData(initialState); // Reset form after successful submission

      // Optionally hide success message after a few seconds
      setTimeout(() => {
        setSubmitSuccess(false);
      }, 3000);
    } catch (error) {
      console.error('Submission error:', error);
      // You might want to set a generic error state here
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData(initialState);
    setErrors({});
    setSubmitSuccess(false);
    setIsSubmitting(false);
  };

  return {
    formData,
    errors,
    handleChange,
    handleSubmit,
    isSubmitting,
    submitSuccess,
    resetForm,
    setFormData // Useful if you need to programmatically update form data
  };
};