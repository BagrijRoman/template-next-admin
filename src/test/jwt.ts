const MS_IN_SECOND = 1000;

const encode = (value: unknown) => btoa(JSON.stringify(value)).replace(/=+$/, '');

/** Builds an unsigned JWT-shaped token; only the payload's `exp` matters to the client. */
export const makeJwt = (expiresInSeconds: number): string => {
  const exp = Math.floor(Date.now() / MS_IN_SECOND) + expiresInSeconds;
  return `${encode({ alg: 'none' })}.${encode({ exp })}.sig`;
};
