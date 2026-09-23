import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from '@/components/ui';
import { ApiError, ERROR_CODES } from '@/lib/apiError';
import { getErrorMessage } from '@/lib/errors';
import { applyFieldErrors } from '@/lib/forms';
import { useChangePasswordMutation } from '../../auth.mutations';
import { type ChangePasswordFormValues, changePasswordSchema } from '../../auth.schemas';

const DEFAULT_VALUES: ChangePasswordFormValues = { currentPassword: '', newPassword: '', confirmPassword: '' };
const FIELDS = ['currentPassword', 'newPassword', 'confirmPassword'] as const;
const CURRENT_PASSWORD_FIELD = 'currentPassword';

export const useChangePasswordForm = () => {
  const form = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: DEFAULT_VALUES,
  });
  const changePasswordMutation = useChangePasswordMutation();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const onSubmit = form.handleSubmit(async ({ currentPassword, newPassword }) => {
    setSubmitError(null);
    try {
      await changePasswordMutation.mutateAsync({ currentPassword, newPassword });
      form.reset(DEFAULT_VALUES);
      toast.success('Password changed', 'Every other device has been signed out.');
    } catch (error) {
      // A wrong current password is a business error, not a validation detail, so it carries no
      // field: put it under the input it belongs to instead of in the form-level alert.
      if (error instanceof ApiError && error.is(ERROR_CODES.WRONG_CURRENT_PASSWORD)) {
        form.setError(CURRENT_PASSWORD_FIELD, {
          type: ERROR_CODES.WRONG_CURRENT_PASSWORD,
          message: getErrorMessage(error),
        });
        return;
      }
      setSubmitError(applyFieldErrors(form.setError, error, FIELDS));
    }
  });

  return { form, onSubmit, isSubmitting: changePasswordMutation.isPending, submitError };
};
