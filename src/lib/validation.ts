export const PHONE_REGEX = /^[0-9]{10}$/;
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const isValidPhone = (value: string) => PHONE_REGEX.test(value.trim());
export const isValidEmail = (value: string) => EMAIL_REGEX.test(value.trim());