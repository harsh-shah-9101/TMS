/** Reads the token stored by the existing auth store (tms_token key). */
export function readSession(): { accessToken: string } | null {
  try {
    const token = localStorage.getItem('tms_token');
    return token ? { accessToken: token } : null;
  } catch {
    return null;
  }
}

export function writeSession(token: string | null): void {
  if (token) localStorage.setItem('tms_token', token);
  else {
    localStorage.removeItem('tms_token');
    localStorage.removeItem('tms_user');
  }
}
