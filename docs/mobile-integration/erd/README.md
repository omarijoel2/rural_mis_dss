Mobile Integration ERD - Draft

Overview
- This ERD models the core database tables needed for sync, device management, submissions, media, conflicts, telemetry and mobile forms.

Tables

1) mobile_devices
- id: uuid (PK)
- device_id: string (unique external device identifier)
- user_id: uuid (nullable)
- device_type: string
- os_version: string
- app_version: string
- push_token: string (nullable)
- status: enum (active, suspended, revoked)
- trust_score: float
- metadata: jsonb
- last_seen: timestamptz
- created_at, updated_at

2) sync_batches
- id: uuid (PK)
- batch_token: string (unique)
- device_id: fk -> mobile_devices.id
- client_sync_token: string
- server_sync_token: string
- status: enum (received, processing, completed, failed)
- items_count: int
- created_at, processed_at

3) sync_items
- id: uuid (PK)
- batch_id: fk -> sync_batches.id
- client_temp_id: string (nullable)
- resource_type: string
- action: enum(create, update, delete)
- payload: jsonb
- client_version: integer
- server_version: integer (nullable)
- status: enum(pending, ok, conflict, error)
- error_message: text (nullable)
- created_at, updated_at

4) submissions
- id: uuid (PK)
- form_id: uuid or string
- form_version: string
- data: jsonb
- device_id: fk -> mobile_devices.id
- status: enum(pending, approved, rejected)
- metadata: jsonb
- created_at, reviewed_at, updated_at

5) submission_media
- id: uuid (PK)
- submission_id: fk -> submissions.id
- key: string (object store key)
- filename: string
- content_type: string
- size_bytes: bigint
- gps: geography(POINT) or jsonb
- captured_at: timestamptz
- uploaded_at: timestamptz
- created_at

6) conflicts
- id: uuid (PK)
- resource_type: string
- resource_id: uuid
- server_payload: jsonb
- client_payload: jsonb
- resolution: enum(pending, resolved)
- resolution_action: enum(accept_server, accept_client, merged)
- resolved_by: uuid (user)
- resolved_at: timestamptz
- notes: text
- created_at

7) telemetry
- id: uuid (PK)
- device_id: fk -> mobile_devices.id
- metrics: jsonb (array of {name, value, timestamp, meta})
- created_at

8) mobile_forms
- id: uuid (PK)
- code: string (unique)
- name: string
- schema: jsonb (JSON Schema)
- version: string
- published: boolean
- draft: boolean
- created_by: uuid
- created_at, updated_at

Indexes & constraints
- Index mobile_devices(device_id)
- Index sync_batches(batch_token)
- Index sync_items(batch_id, status)
- GIST index for submission_media(gps) if using PostGIS

Relationships
- mobile_devices 1 - many sync_batches
- sync_batches 1 - many sync_items
- submissions 1 - many submission_media
- submissions many - 1 mobile_devices

Notes
- Keep payloads normalized where possible but accept jsonb for flexible client payloads.
- Consider separate history tables (audit) for sync_items and submissions to facilitate forensic investigations.
