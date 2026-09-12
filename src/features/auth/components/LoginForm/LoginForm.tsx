'use client';

import { inputClassName, submitClassName } from './LoginForm.styles';
import { useLoginForm } from './useLoginForm';

export const LoginForm = () => {
  const { email, setEmail, password, setPassword, error, isSubmitting, handleSubmit } = useLoginForm();

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      <label className="flex flex-col gap-1 text-sm font-medium">
        Email
        <input
          type="email"
          name="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className={inputClassName}
        />
      </label>
      <label className="flex flex-col gap-1 text-sm font-medium">
        Password
        <input
          type="password"
          name="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className={inputClassName}
        />
      </label>
      {error && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
      <button type="submit" disabled={isSubmitting} className={submitClassName}>
        {isSubmitting ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  );
};
