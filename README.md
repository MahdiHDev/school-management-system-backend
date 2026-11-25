# School Management System Backend

REST API for managing school users, students, employees, classes, subjects, attendance, salaries, grading, and school settings.

## Contents

- [Technology](#technology)
- [Requirements](#requirements)
- [Setup](#setup)
- [Environment variables](#environment-variables)
- [Run and build](#run-and-build)
- [API conventions](#api-conventions)
- [Endpoints](#endpoints)
- [Request examples](#request-examples)
- [Errors](#errors)

## Technology

- Node.js, TypeScript, and Express
- PostgreSQL with Prisma ORM
- Better Auth for authentication and email OTP flows
- Cloudinary for uploaded images and documents

## Requirements

- Node.js and pnpm
- PostgreSQL database
- Cloudinary account
- SMTP credentials for email and OTP delivery
- Google OAuth credentials (required by the application configuration)

## Setup

1. Install dependencies:

   ```sh
   pnpm install
   ```

2. Create a `.env` file in the project root and set the variables listed below.

3. Apply Prisma migrations:

   ```sh
   pnpm migrate
   ```

4. Start the development server:

   ```sh
   pnpm dev
   ```

The server connects to the configured database, seeds a super-admin account if one does not exist, and initializes student and employee ID sequences during local startup.

## Environment variables

All of these variables are required when the application loads its environment configuration. Use your own local or deployment values; do not commit secrets.

| Variable | Purpose |
| --- | --- |
| `NODE_ENV` | Runtime environment (`development` enables detailed error output) |
| `PORT` | HTTP port |
| `DATABASE_URL` | PostgreSQL connection URL |
| `BETTER_AUTH_URL` | Public/base URL used by Better Auth |
| `BETTER_AUTH_SECRET` | Better Auth signing secret |
| `ACCESS_TOKEN_SECRET` | Access JWT signing secret |
| `REFRESH_TOKEN_SECRET` | Refresh JWT signing secret |
| `ACCESS_TOKEN_EXPIRES_IN` | Access token lifetime |
| `REFRESH_TOKEN_EXPIRES_IN` | Refresh token lifetime |
| `BETTER_AUTH_SESSION_TOKEN_EXPIRES_IN` | Better Auth session token lifetime |
| `BETTER_AUTH_SESSION_TOKEN_UPDATE_AGE` | Better Auth session refresh/update age |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `FRONTEND_URL` | Allowed frontend origin |
| `EMAIL_SENDER_SMTP_USER` | SMTP username |
| `EMAIL_SENDER_SMTP_PASS` | SMTP password |
| `EMAIL_SENDER_SMTP_HOST` | SMTP host |
| `EMAIL_SENDER_SMTP_PORT` | SMTP port |
| `EMAIL_SENDER_SMTP_FROM` | Sender address/name |
| `SUPER_ADMIN_EMAIL` | Email for the first seeded super-admin |
| `SUPER_ADMIN_PASSWORD` | Password for the first seeded super-admin |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |

## Run and build

| Command | Description |
| --- | --- |
| `pnpm dev` | Run the API with TypeScript watch mode |
| `pnpm build` | Generate the Prisma client and build to `dist/` |
| `pnpm start` | Run the compiled server |
| `pnpm migrate` | Run `prisma migrate dev` |
| `pnpm generate` | Generate the Prisma client |
| `pnpm lint` | Lint source files |

The API base path is `http://localhost:<PORT>/api/v1`. The root `GET /` health/welcome endpoint is outside this prefix. In production, the server module exports the Express app for the deployment platform rather than listening locally.

## API conventions

### Authentication

Unless an endpoint is marked public, send an access token in either:

```http
Authorization: Bearer <accessToken>
```

or the `accessToken` cookie. Login also sets authentication cookies. Most school-management routes are restricted to `ADMIN` and `SUPER_ADMIN`; exceptions are called out in the endpoint table.

### Response format

Most successful endpoints use this JSON shape:

```json
{
  "success": true,
  "message": "Request completed",
  "data": {},
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 0,
    "totalPages": 0
  }
}
```

`meta` is returned by paginated list endpoints. Some endpoints omit `data` or `meta` when they have nothing to return.

### List query parameters

Paginated list endpoints accept:

| Parameter | Meaning |
| --- | --- |
| `page` | Page number; defaults to `1` |
| `limit` | Page size; defaults to `10` |
| `sortBy` | Model field to sort by; defaults to `createdAt` |
| `sortOrder` | `asc` or `desc`; defaults to `desc` |
| `searchTerm` | Search text on endpoints that enable search |

Search-enabled endpoints:

| Endpoint | Search fields | Additional filters |
| --- | --- | --- |
| `GET /student` | `fullName`, `user.email`, `birthRegistrationNumber` | `classId`, `user.role` |
| `GET /employees` | `fullName`, `user.email`, `employeeId` | `user.role` |
| `GET /settings/bank-informations` | `nameOfBank`, `accountNumber` | None |

For example:

```http
GET /api/v1/settings/bank-informations?searchTerm=city&page=1&limit=20
```

The bank-information search parameter is `searchTerm`; the searchable fields are database field names, even though the response exposes `nameOfBank` as `bankName`.

The student list also accepts `fields` as a comma-separated selection of fields. Other endpoints may accept pagination/sorting without supporting search or filters.

### Upload requests

For endpoints that upload files, use `multipart/form-data`. JSON data is sent in a text field named `data`; its value must be a JSON string. Attach files using the exact field names listed for that endpoint. Do not manually set the multipart `Content-Type` boundary in clients such as Postman.

## Endpoints

All paths below are relative to `/api/v1`, except `GET /` and the Better Auth handler.

### Health and authentication

| Method | Path | Access | Description |
| --- | --- | --- | --- |
| `GET` | `/` | Public; outside `/api/v1` | Welcome/health response |
| `POST` | `/auth/login` | Public | Sign in with email and password; returns tokens and sets cookies |
| `POST` | `/auth/change-password` | Authenticated user | Change the current user's password |
| `POST` | `/auth/forget-password` | Public | Request a password-reset OTP by email |
| `POST` | `/auth/reset-password` | Public | Reset a password using an OTP |
| `GET` | `/auth/me` | Authenticated user | Return the current user |
| `*` | `/api/auth/*` | Better Auth | Better Auth handler for its built-in authentication endpoints |

`POST /auth/change-password` is available to `SUPER_ADMIN`, `ADMIN`, `ACCOUNTANT`, `LIBRARIAN`, `STUDENT`, and `TEACHER`. `GET /auth/me` additionally permits `OTHER`.

### Students

All student endpoints require `ADMIN` or `SUPER_ADMIN`.

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/student` | List/search/filter students |
| `GET` | `/student/:id/update` | Fetch a student's update form data |
| `POST` | `/student` | Create a student; requires profile/signature files |
| `PATCH` | `/student/:id` | Update a student and optionally replace files |
| `PATCH` | `/student/promote` | Promote selected students to another class |
| `DELETE` | `/student/:id` | Soft-delete a student |

Student list search/filter/query options are described under [List query parameters](#list-query-parameters).

### Employees

All employee endpoints require `ADMIN` or `SUPER_ADMIN`.

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/employees` | List/search/filter employees |
| `GET` | `/employees/:id` | Fetch an employee |
| `GET` | `/employees/:id/update` | Fetch employee update form data |
| `POST` | `/employees` | Create an employee; requires profile/signature files |
| `PATCH` | `/employees/:id` | Update an employee and optionally replace files |
| `DELETE` | `/employees/:id` | Soft-delete an employee |

Employee list search/filter/query options are described under [List query parameters](#list-query-parameters).

### Classes

All class endpoints require `ADMIN` or `SUPER_ADMIN`.

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/classes` | Paginated classes with student counts |
| `GET` | `/classes/teachers` | List teachers available for classes |
| `GET` | `/classes/classes-for-update` | Return class IDs/names in label/value form |
| `GET` | `/classes/:id` | Fetch one class |
| `POST` | `/classes` | Create a class |
| `PATCH` | `/classes/:id` | Update a class |
| `DELETE` | `/classes/:id` | Soft-delete a class |

### Subjects

All subject endpoints require `ADMIN` or `SUPER_ADMIN`.

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/subjects` | Paginated classes with their subjects and mark totals |
| `POST` | `/subjects` | Add subjects to a class |
| `PATCH` | `/subjects` | Update a class's subject list |
| `DELETE` | `/subjects/:classId` | Delete the subjects belonging to a class |

### Attendance

All attendance endpoints require `ADMIN` or `SUPER_ADMIN`.

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/attendance?classId=<id>&date=DD/MM/YYYY` | Fetch students and attendance for a class/date |
| `GET` | `/attendance/employee?date=DD/MM/YYYY` | Fetch employee attendance for a date |
| `PATCH` | `/attendance` | Save student attendance |
| `PATCH` | `/attendance/employee` | Save employee attendance |

Dates in attendance requests and queries must be valid calendar dates in `DD/MM/YYYY` format.

### Salary

All salary endpoints require `ADMIN` or `SUPER_ADMIN`.

| Method | Path | Description |
| --- | --- | --- |
| `POST` | `/salary` | Create an employee salary record |

### Settings

All settings endpoints require `ADMIN` or `SUPER_ADMIN`.

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/settings/general-setting` | Fetch general institute settings |
| `PATCH` | `/settings/general-setting` | Create a general-settings record |
| `PATCH` | `/settings/general-setting/:id` | Update settings by ID |
| `GET` | `/settings/rules-regulations` | Fetch student and employee rules |
| `PATCH` | `/settings/student-rules-regulations` | Create/update student rules |
| `PATCH` | `/settings/employee-rules-regulations` | Create/update employee rules |
| `GET` | `/settings/bank-informations` | List/search bank accounts |
| `POST` | `/settings/bank-information` | Create bank information; requires a logo |
| `GET` | `/settings/bank-information/:id` | Fetch one bank-information record |
| `PATCH` | `/settings/bank-information/:id` | Update bank information and optionally replace its logo |
| `DELETE` | `/settings/bank-information/:id` | Soft-delete bank information |

### Grading configuration

All grading endpoints require `ADMIN` or `SUPER_ADMIN`.

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/settings/grades` | Fetch grading configuration |
| `PUT` | `/settings/grades` | Update grading configuration |
| `GET` | `/settings/grades/fail-criteria` | Fetch fail criteria |
| `PUT` | `/settings/grades/fail-criteria` | Update fail criteria |

The standalone user router in the source tree is not mounted by the root router, so it currently does not expose an active `/users` endpoint.

## Request examples

Use the base URL `http://localhost:<PORT>/api/v1` in the examples below. Replace IDs with IDs returned by the API.

### Authentication

```http
POST /auth/login
Content-Type: application/json
```

```json
{
  "email": "admin@example.com",
  "password": "your-password"
}
```

```http
POST /auth/change-password
Authorization: Bearer <accessToken>
Content-Type: application/json
```

```json
{
  "currentPassword": "current-password",
  "newPassword": "new-password"
}
```

If the Better Auth session cookie is unavailable for the change-password request, pass the session token in `x-session-token` or as a `sessionToken` body property.

Password reset requests:

```json
{
  "email": "admin@example.com"
}
```

Send that body to `POST /auth/forget-password`, then use the received OTP with:

```json
{
  "email": "admin@example.com",
  "otp": "123456",
  "newPassword": "new-password"
}
```

### Student create/update

`POST /student` expects `multipart/form-data` with a `data` field containing JSON and all four required files: `picture`, `authoritySign`, `studentSign`, and `guardianSign`.

Required `data` properties are: `fullName`, `fullNameBangla`, `dateOfBirth`, `birthRegistrationNumber`, `religion`, `gender`, `classId`, `fatherName`, `fatherNameBangla`, `fatherMobileNumber`, `whatsappNumber`, `fatherOccupation`, `motherName`, `motherNameBangla`, `motherMobileNumber`, `motherOccupation`, `email`, `guardianName`, `guardianRelationship`, `guardianMobile`, `admissionTotalFees`, `admissionDate`, and `address`. `bloodGroup`, `previousInstitute`, `endingClass`, `result`, and `testimonialNumber` are optional.

`address` contains `present` and `permanent` objects. Each address object requires `village`, `postOffice`, `postCode`, and `district`.

```json
{
  "fullName": "A Student",
  "fullNameBangla": "শিক্ষার্থী",
  "dateOfBirth": "2015-03-20",
  "birthRegistrationNumber": "1234567890",
  "religion": "ISLAM",
  "gender": "MALE",
  "classId": "<class-id>",
  "fatherName": "Parent One",
  "fatherNameBangla": "অভিভাবক",
  "fatherMobileNumber": "01700000000",
  "whatsappNumber": "01700000000",
  "fatherOccupation": "Teacher",
  "motherName": "Parent Two",
  "motherNameBangla": "অভিভাবক",
  "motherMobileNumber": "01800000000",
  "motherOccupation": "Business",
  "email": "student@example.com",
  "guardianName": "Parent One",
  "guardianRelationship": "Father",
  "guardianMobile": "01700000000",
  "admissionTotalFees": 5000,
  "admissionDate": "2026-01-01",
  "address": {
    "present": {
      "village": "Example village",
      "postOffice": "Example post office",
      "postCode": "1000",
      "district": "Example district"
    },
    "permanent": {
      "village": "Example village",
      "postOffice": "Example post office",
      "postCode": "1000",
      "district": "Example district"
    }
  }
}
```

Valid `religion` values: `ISLAM`, `HINDUISM`, `CHRISTIANITY`, `BUDDHISM`, `OTHER`. Valid `gender` values: `MALE`, `FEMALE`, `OTHER`. Valid `bloodGroup` values: `A_POSITIVE`, `A_NEGATIVE`, `B_POSITIVE`, `B_NEGATIVE`, `AB_POSITIVE`, `AB_NEGATIVE`, `O_POSITIVE`, `O_NEGATIVE`.

For `PATCH /student/:id`, send a multipart `data` field with any supported student properties to change. Address objects may be partial, and uploaded files are optional.

Promote students with `PATCH /student/promote`:

```json
{
  "sourceClassId": "<source-class-id>",
  "targetClassId": "<target-class-id>",
  "studentIds": ["<student-id>"]
}
```

### Employee create/update

`POST /employees` expects multipart `data` JSON plus required `picture`, `authoritySign`, and `employeeSign` files. `experience` is optional.

Required `data` properties: `fullName`, `fatherName`, `motherName`, `phone`, `gender`, `bloodGroup`, `religion`, `employeeRole`, `dateOfJoining`, `monthlySalary`, `email`, `nid`, and `address`. `emergencyContact` and `birthRegistrationNumber` are optional. `address.present` and `address.permanent` each require `village`, `postOffice`, `postCode`, and `district`.

`employeeRole` accepts a `UserRole` value: `SUPER_ADMIN`, `ADMIN`, `TEACHER`, `STUDENT`, `PRINCIPAL`, `MANAGEMENT_STAFF`, `ACCOUNTANT`, `STORE_MANAGER`, `LIBRARIAN`, or `OTHER`. Gender, religion, and blood group use the same values listed in the student section.

For `PATCH /employees/:id`, the multipart `data` field and all file fields are optional; send only the properties/files to update.

### Classes and subjects

Create a class with `POST /classes`:

```json
{
  "className": "Class 1",
  "classTeacher": "<employee-id>",
  "tuitionFee": 1500
}
```

For `PATCH /classes/:id`, send any subset of `className`, `classTeacher`, and `tuitionFee`.

Create or replace a subject list with `POST /subjects` or `PATCH /subjects`:

```json
{
  "classId": "<class-id>",
  "subjects": [
    {
      "subjectName": "Mathematics",
      "marks": 100
    }
  ]
}
```

Subject marks must be positive whole numbers. For updates, each subject may also include its existing `id`.

### Attendance

Save student attendance with `PATCH /attendance`:

```json
{
  "classId": "<class-id>",
  "date": "25/11/2026",
  "records": [
    {
      "studentId": "<student-id>",
      "status": "PRESENT"
    }
  ]
}
```

Student attendance statuses: `PRESENT`, `ABSENT`, `LEAVE`.

Save employee attendance with `PATCH /attendance/employee`:

```json
{
  "date": "25/11/2026",
  "records": [
    {
      "employeeId": "<employee-id>",
      "status": "PRESENT"
    }
  ]
}
```

Employee attendance statuses: `PRESENT`, `ABSENT`, `LATE`, `HALF_DAY`, `LEAVE`.

### Salary

Create a salary record with `POST /salary`:

```json
{
  "employeeId": "<employee-id>",
  "salaryMonth": "11/2026",
  "paymentDate": "25/11/2026",
  "bonus": 0,
  "deduction": 0
}
```

`salaryMonth` uses `MM/YYYY`; `paymentDate` uses `DD/MM/YYYY`. `bonus` and `deduction` are non-negative numbers and default to `0`.

### Settings and grading

Create a general-settings record by sending a multipart `PATCH /settings/general-setting` request with:

- `data`: JSON containing `instituteName`, `institutePhoneNumber`, `instituteEmail`, `instituteAddress`, and `instituteCountry`
- `instituteLogo`: the logo file
- Optional JSON properties: `instituteWebsite`

To update an existing setting, use `PATCH /settings/general-setting/:id`; the same fields and file are optional. JSON properties accepted by the API are `instituteName`, `institutePhoneNumber`, `instituteEmail`, `instituteWebsite`, `instituteAddress`, and `instituteCountry`.

Update rules using JSON:

```json
{ "studentRules": "Student rules and regulations..." }
```

Send this to `PATCH /settings/student-rules-regulations`. Use `{ "employeeRules": "..." }` for `PATCH /settings/employee-rules-regulations`.

Create bank information using multipart `POST /settings/bank-information` with `data` JSON and a required `bankLogo` file:

```json
{
  "bankName": "Example Bank",
  "bankAddress": "Main branch",
  "accountNumber": "000123456",
  "instructions": "Payment instructions"
}
```

For `PATCH /settings/bank-information/:id`, include a `data` JSON field with any subset of those properties; the logo file is optional. The bank list response uses `bankName` for the stored `nameOfBank` and returns `id`, `accountNumber`, and `bankLogo`. The detail endpoint returns the bank address and instructions as well.

Update grading configuration with `PUT /settings/grades`:

```json
{
  "name": "Default",
  "grades": [
    {
      "grade": "A+",
      "minMarks": 80,
      "maxMarks": 100,
      "status": "Pass"
    }
  ]
}
```

Each grade may include an existing `id`. Marks must be integers from `0` to `100`; `status` accepts `Pass`, `Fail`, `PASS`, or `FAIL`.

Update fail criteria with `PUT /settings/grades/fail-criteria`:

```json
{
  "overall": 33,
  "subject": 33,
  "number": 1
}
```

`overall` and `subject` are percentages from `0` to `100`; `number` is an integer of at least `1`.

## Errors

Errors use this general shape:

```json
{
  "success": false,
  "message": "Validation failed",
  "errorSources": [
    {
      "path": "fieldName",
      "message": "Explanation of the problem"
    }
  ]
}
```

The HTTP status reflects the error category (for example, `400` for invalid input, `401` for missing/invalid authentication, and `403` for insufficient role access). In development, the response may also include error and stack details.

## License

This project is licensed under the [ISC License](https://opensource.org/license/isc-license-txt), as declared in `package.json`.
