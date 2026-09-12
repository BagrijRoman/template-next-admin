const MS_IN_SECOND = 1000;

const encode = (value: unknown) => Buffer.from(JSON.stringify(value)).toString('base64url');

/** Unsigned JWT-shaped token; the client only reads `exp` to skip tokens that are already dead. */
export const makeJwt = (expiresInSeconds: number): string => {
  const exp = Math.floor(Date.now() / MS_IN_SECOND) + expiresInSeconds;
  return `${encode({ alg: 'none' })}.${encode({ exp })}.sig`;
};
