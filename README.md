# DevTools API Usage Examples

### JSON Tools API Examples [[JSON Formatter]]

```bash
# 1. Format JSON
curl -X POST http://localhost:3000/api/v1/json/format \
  -H "Content-Type: application/json" \
  -d '{
    "json": {"name": "test", "nested": {"value": 123}},
    "spaces": 2,
    "minify": false
  }'

# 2. Validate JSON
curl -X POST http://localhost:3000/api/v1/json/validate \
  -H "Content-Type: application/json" \
  -d '{
    "json": "{\"name\": \"test\", \"value\": 123}"
  }'
```

### UUID Tools API Examples [[UUID Generator]]

```bash
# 1. Generate UUID v4
curl http://localhost:3000/api/v1/uuid/v4

# 2. Generate UUID v1
curl http://localhost:3000/api/v1/uuid/v1

# 3. Validate UUID
curl -X POST http://localhost:3000/api/v1/uuid/validate \
  -H "Content-Type: application/json" \
  -d '{
    "uuid": "123e4567-e89b-12d3-a456-426614174000"
  }'
```

### Time Tools API Examples [[Timestamp Converter]]

```bash
# 1. Convert Timestamp to Date
curl -X POST http://localhost:3000/api/v1/time/convert \
  -H "Content-Type: application/json" \
  -d '{
    "input": "1677686400000",
    "operation": "toDate",
    "timezone": "America/New_York"
  }'

# 2. Convert Date to Timestamp
curl -X POST http://localhost:3000/api/v1/time/convert \
  -H "Content-Type: application/json" \
  -d '{
    "input": "2023-03-01T12:00:00Z",
    "operation": "toTimestamp"
  }'

# 3. Get Current Time
curl "http://localhost:3000/api/v1/time/now?timezone=Europe/London"

# 4. List Available Timezones
curl http://localhost:3000/api/v1/time/timezones
```

### Encoding Tools API Examples [[Base64 Encoder]] & [[URL Encoder]]

```bash
# 1. Base64 Encode
curl -X POST http://localhost:3000/api/v1/encoding/base64 \
  -H "Content-Type: application/json" \
  -d '{
    "input": "Hello, World!",
    "operation": "encode"
  }'

# 2. Base64 Decode
curl -X POST http://localhost:3000/api/v1/encoding/base64 \
  -H "Content-Type: application/json" \
  -d '{
    "input": "SGVsbG8sIFdvcmxkIQ==",
    "operation": "decode"
  }'

# 3. URL Full Encode
curl -X POST http://localhost:3000/api/v1/encoding/url \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com/path?param=Hello World!",
    "operation": "encode",
    "mode": "full"
  }'

# 4. URL Component Encode
curl -X POST http://localhost:3000/api/v1/encoding/url \
  -H "Content-Type: application/json" \
  -d '{
    "url": "Hello World!",
    "operation": "encode",
    "mode": "component"
  }'

# 5. URL Decode
curl -X POST http://localhost:3000/api/v1/encoding/url \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com/path?param=Hello%20World%21",
    "operation": "decode"
  }'
```

### Root API Example 

```bash
# Get API Information
curl http://localhost:3000/api/v1
```

Each example includes:

- Full curl command
- Required headers
- Request body (if needed)
- Correct endpoint path
- Required parameters

You can test these endpoints using:

- cURL in command line
- Postman
- Any HTTP client that supports JSON

Remember to:

1. Start the server first
2. Use the correct port number
3. Include Content-Type header for POST requests
4. Properly escape JSON in curl commands
5. URL encode special characters in URLs

**Related:** [[API Authentication]]
