# Profile Query API

A TypeScript REST API built with Node.js, Express, and MySQL for querying, filtering, and analyzing demographic profile data. Designed for sales, marketing, and research teams that need structured demographic data to support audience segmentation, market research, and customer insights.

## Features

- **Profile enrichment:** Aggregates demographic data from Genderize, Agify, and Nationalize APIs.
- **Advanced filtering:** Combine gender, age, age group, country, and probability thresholds.
- **Natural-language search:** Convert supported English queries into structured filters using rule-based parsing.
- **Sorting and pagination:** Retrieve ordered results with configurable page sizes.
- **Reliable persistence:** Store profiles in MySQL and prevent duplicate names.
- **UUID v7:** Generate time-sortable identifiers for profile records.
- **Validation and error handling:** Return consistent API errors and handle upstream service failures.
- **CORS support:** Allow cross-origin API requests.

## Tech Stack

- **Language:** TypeScript
- **Runtime:** Node.js
- **Framework:** Express
- **Database:** MySQL 8.0+
- **Database driver:** mysql2
- **External APIs:** Genderize, Agify, Nationalize
- **Utilities:** Axios, UUID, dotenv, CORS
- **Testing:** Postman
- **Development tunneling:** ngrok

## Prerequisites

- Node.js and npm
- MySQL 8.0 or later
- Git
- An ngrok account for public local testing (optional)

## Installation

Clone the repository:

```bash
git clone https://github.com/Chidiogoezeh/Profile_query_API.git
cd Profile_query_API
npm install
```

Create a MySQL database:

```sql
CREATE DATABASE profile_db;
```

Configure the environment variables in a `.env` file at the project root:

```env
PORT=3000
DB_HOST=localhost
DB_USER=your_user
DB_PASSWORD=your_password
DB_NAME=profile_db
```

Apply the database schema:

```bash
mysql -u your_user -p profile_db < schema.sql
```

**Note:** The provided schema contains a `DROP TABLE IF EXISTS` statement. Run it only when creating a fresh database or when you have safely backed up existing data.

## Database Seeding

Place the supplied profile dataset in the location expected by the seed script. The dataset should contain the expected `profiles` array.

Run the seed command configured in `package.json`:

```bash
npm run seed
```

The seed process should populate the database with the 2,026 required profiles and avoid creating duplicate records when rerun.

Verify the record count:

```sql
SELECT COUNT(*) FROM profiles;
```

## Running the API

Start the development server using the configured development script:

```bash
npm run dev
```

Build and run the production version using the scripts configured in `package.json`:

```bash
npm run build
npm start
```

The API is available at:

`http://localhost:3000/api/profiles`

## API Endpoints

### 1. Create a profile

`POST /api/profiles`

Request body:

```json
{
  "name": "ella"
}
```

Retrieves demographic information from external APIs and stores the resulting profile. Existing profiles are returned without repeating enrichment requests.

### 2. Retrieve a profile

`GET /api/profiles/:id`

Returns a profile by its UUID.

### 3. Query profiles

`GET /api/profiles`

Supported query parameters:

| Parameter                 | Description                                  |
| ------------------------- | -------------------------------------------- |
| `gender`                  | `male` or `female`                           |
| `age_group`               | `child`, `teenager`, `adult`, or `senior`    |
| `country_id`              | Two-letter country code, such as `NG`        |
| `min_age`                 | Minimum age                                  |
| `max_age`                 | Maximum age                                  |
| `min_gender_probability`  | Minimum gender confidence                    |
| `min_country_probability` | Minimum country confidence                   |
| `sort_by`                 | `age`, `created_at`, or `gender_probability` |
| `order`                   | `asc` or `desc`                              |
| `page`                    | Page number; default `1`                     |
| `limit`                   | Results per page; default `10`, maximum `50` |

Example:

```http
GET /api/profiles?gender=male&country_id=NG&min_age=25&sort_by=age&order=desc&page=1&limit=10
```

Successful response:

```json
{
  "status": "success",
  "page": 1,
  "limit": 10,
  "total": 25,
  "data": []
}
```

The example `total` is illustrative; actual results depend on the database.

### 4. Natural-language search

`GET /api/profiles/search?q=young%20males%20from%20nigeria`

The parser converts supported English expressions into database filters.

| Query expression                     | Interpretation                                          |
| ------------------------------------ | ------------------------------------------------------- |
| `young males`                        | Male, ages 16–24                                        |
| `females above 30`                   | Female, age 30 or older                                 |
| `people from angola`                 | Country `AO`                                            |
| `adult males from kenya`             | Male, adult, country `KE`                               |
| `male and female teenagers above 17` | Teenager, age 17 or older, without a gender restriction |

Pagination is also supported through `page` and `limit`.

The parser uses predefined rules, not AI or an LLM. Supported country names depend on the country mappings implemented in the application.

### 5. Delete a profile

`DELETE /api/profiles/:id`

Deletes the profile identified by its UUID.

Successful response: `204 No Content`.

## Error Responses

Errors follow this structure:

```json
{
  "status": "error",
  "message": "Error description"
}
```

| HTTP status | Meaning                                                  |
| ----------- | -------------------------------------------------------- |
| `400`       | Missing or empty parameter, or unrecognized search query |
| `422`       | Invalid query parameter or parameter type                |
| `404`       | Profile or route not found                               |
| `500`       | Internal server error                                    |
| `502`       | External demographic API failure                         |

## Testing

Use Postman to verify:

- Profile creation, retrieval, and deletion
- Combined filters and sorting
- Pagination defaults and limits
- Natural-language query mappings
- Invalid inputs and error responses
- Seed idempotency and database integrity
- UUID v7 identifiers, UTC ISO 8601 timestamps, and CORS headers
- External API failure handling

Run the project's configured test and build scripts before deploying.

## Local Testing with ngrok

Start the API locally, then expose port 3000:

```bash
ngrok http 3000
```

Use the generated HTTPS URL to test the API from external clients. Keep environment variables and ngrok authentication credentials out of version control.

## Project Structure

```text
src/
  config/
  controllers/
  middleware/
  models/
  routes/
  services/
  types/
  utils/
scripts/
schema.sql
profiles.json
server.ts
package.json
tsconfig.json
README.md
```

## Intended Use Cases

- **Sales teams:** Segment audiences by demographic attributes.
- **Marketing teams:** Explore demographic patterns and refine audience targeting.
- **Research teams:** Query structured profile datasets using multiple conditions.
- **Product teams:** Investigate demographic distributions to support product research.

## License

MIT.
