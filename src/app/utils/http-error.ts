import {HttpErrorResponse} from '@angular/common/http';

export function errorMessage(error: HttpErrorResponse): string {
  if (error.status === 0) return 'Cannot connect to the server. Please try again.';
  if (error.status === 401) return 'Your session has expired. Please log in again.';
  if (error.status === 403) return 'You do not have permission to access this resource.';
  if (error.status === 404) return 'This resource is no longer available.';
  if (error.status === 429) {
    const seconds = error.headers?.get('Retry-After');
    return seconds ? `Too many attempts. Please wait ${seconds} seconds before trying again.`
      : 'Too many attempts. Please wait a moment before trying again.';
  }
  if (error.status >= 500) return 'The server could not complete the request. Please try again.';
  const message = typeof error.error === 'string' ? error.error : (error.error?.error ?? error.error?.message);
  if (message && message.length < 500 && !message.includes('<')) return message;
  if (error.status === 409) return 'This item has changed. Please reload and try again.';
  if (error.status === 400) return 'Please check the entered values and try again.';
  return 'The request could not be completed. Please try again.';
}
