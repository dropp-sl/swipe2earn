// Account related errors
export const ACCOUNT_INACTIVE =
  'Account is inactive. Please contact support for assistance.';
export const ACCOUNT_NOT_EXIST =
  'Account does not exist please create a new account';
export const USER_ACCOUNT_NOT_FOUND = 'User account not found';
export const USER_ACCOUNT_STATUS_INACTIVE =
  'Your account is inactive. Please contact support for assistance.';
export const USER_ALREADY_INACTIVE = 'Account is inactive.';
export const USER_ALREADY_DELETED = 'Account is already deleted.';

// User related errors
export const USER_ALREADY_EXIST_WITH_EMAIL =
  'This email is already in use try with different email';
export const USERNAME_ALREADY_TAKEN = 'Username is already taken';
export const USER_NOT_FOUND = 'User not found';
export const NAME_LENGTH_SHORT = 'Name must be at least 2 characters long';

// Authentication related errors
export const CREDIENTIAL_NOT_VALID = 'Credientals are not valid';
export const INVALID_PASSWORD = 'Incorrect Password';
export const INVALID_CREDENTIALS = 'Incorrect Credentials';
export const EMAIL_ALREADY_VERIFIED = 'Email is already verified.';
export const EMAIL_NOT_VERIFIED =
  'Email is not verified. Please check your inbox';
export const ONE_TIME_TOKEN_EXPIRED = 'One time token expired';
export const OLD_PASSWORD_NOT_MATCH = 'Old password is incorrect';
export const NEW_PASSWORD_SAME_AS_OLD =
  'New password should be different from old password';
export const UNAUTHORIZED = 'Only admin can access this resource';

// AWS S3 related errors
export const ERROR_UPLOAD = 'Error while uploading file';
export const ERROR_DELETE = 'Error while file deletion';
export const ERROR_DOWNLOAD = 'Error while downloading file';
export const INVALID_FILE_ONLY_PDF_ALLOWED =
  'Invalid file type, only PDFs are allowed';

// General errors
export const SOMETHING_WENT_WRONG_TRY_AGAIN =
  'Something went wrong. Please try again later';

// Report related errors
export const REPORT_ALREADY_ACCEPTED =
  'Report is already accepted. Issues cannot be added.';

// Stripe related errors
export const SESSION_ID_MISSING = 'Session ID is missing';
export const SESSION_NOT_FOUND = 'Stripe session not found';
export const STRIPE_CUSTOMER_CREATION_FAILED = 'Failed to create customer';
