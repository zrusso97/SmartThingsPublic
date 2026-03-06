# Steward - Database Schema Overview

## Entity Relationship Diagram

```
┌──────────────────┐       ┌──────────────────────┐       ┌──────────────────────┐
│    profiles       │       │       tasks           │       │    submissions       │
├──────────────────┤       ├──────────────────────┤       ├──────────────────────┤
│ id (PK, FK→auth) │◄──┐   │ id (PK)              │       │ id (PK)              │
│ username (unique) │   ├───│ created_by (FK)      │   ┌───│ task_id (FK)         │
│ avatar_url        │   │   │ title                │   │   │ user_id (FK)         │──┐
│ civic_credits     │   │   │ description          │   │   │ before_photo_url     │  │
│ tasks_completed   │   │   │ latitude             │   │   │ after_photo_url      │  │
│ created_at        │   │   │ longitude            │   │   │ notes                │  │
│ updated_at        │   │   │ location_name        │   │   │ status (enum)        │  │
└──────────────────┘   │   │ effort (enum)        │   │   │ reviewed_at          │  │
                        │   │ reward_points        │   │   │ created_at           │  │
                        │   │ estimated_minutes    │   │   └──────────────────────┘  │
                        │   │ status (enum)        │◄──┘                             │
                        └───│ claimed_by (FK)      │                                 │
                            │ created_at           │       ┌────────────────────┐    │
                            │ updated_at           │       │   profiles         │    │
                            └──────────────────────┘       │   (user_id FK)     │◄───┘
                                                           └────────────────────┘
```

## Tables

### 1. `profiles`
Extends Supabase `auth.users`. Auto-created on sign-up via trigger.

| Column           | Type        | Notes                        |
|------------------|-------------|------------------------------|
| `id`             | uuid (PK)   | References `auth.users(id)`  |
| `username`       | text        | Unique, auto-generated       |
| `avatar_url`     | text        | Optional profile picture     |
| `civic_credits`  | integer     | Running total, starts at 0   |
| `tasks_completed`| integer     | Counter, starts at 0         |
| `created_at`     | timestamptz | Auto-set                     |
| `updated_at`     | timestamptz | Auto-updated via trigger     |

### 2. `tasks`
Civic maintenance tasks shown as pins on the map.

| Column             | Type           | Notes                              |
|--------------------|----------------|------------------------------------|
| `id`               | uuid (PK)      | Auto-generated                     |
| `created_by`       | uuid (FK)      | References `profiles(id)`          |
| `title`            | text           | Task title                         |
| `description`      | text           | What needs to be done              |
| `latitude`         | double         | GPS coordinate                     |
| `longitude`        | double         | GPS coordinate                     |
| `location_name`    | text           | Optional readable address          |
| `effort`           | enum           | `easy` / `medium` / `hard`         |
| `reward_points`    | integer        | Civic Credits awarded (default 10) |
| `estimated_minutes`| integer        | Time estimate (default 15)         |
| `status`           | enum           | `open` / `in_progress` / `completed` / `expired` |
| `claimed_by`       | uuid (FK)      | Null until someone claims it       |
| `created_at`       | timestamptz    | Auto-set                           |
| `updated_at`       | timestamptz    | Auto-updated via trigger           |

### 3. `submissions`
Proof-of-work: before/after photos submitted for completed tasks.

| Column            | Type        | Notes                              |
|-------------------|-------------|------------------------------------|
| `id`              | uuid (PK)   | Auto-generated                     |
| `task_id`         | uuid (FK)   | References `tasks(id)`             |
| `user_id`         | uuid (FK)   | References `profiles(id)`          |
| `before_photo_url`| text        | Supabase Storage URL               |
| `after_photo_url` | text        | Supabase Storage URL               |
| `notes`           | text        | Optional completion notes          |
| `status`          | enum        | `pending` / `approved` / `rejected`|
| `reviewed_at`     | timestamptz | When reviewed                      |
| `created_at`      | timestamptz | Auto-set                           |

## Enums

- **`effort_level`**: `easy` (green pin), `medium` (yellow pin), `hard` (red pin)
- **`task_status`**: `open` → `in_progress` → `completed` | `expired`
- **`submission_status`**: `pending` → `approved` | `rejected`

## Automated Behaviors (Triggers)

1. **`on_auth_user_created`** — Auto-creates a `profiles` row when a user signs up
2. **`profiles_updated_at` / `tasks_updated_at`** — Auto-updates `updated_at` on row changes
3. **`on_submission_approved`** — When a submission status changes to `approved`:
   - Adds `reward_points` to the user's `civic_credits`
   - Increments `tasks_completed` counter
   - Sets the task `status` to `completed`

## Row-Level Security Summary

| Table       | SELECT              | INSERT                 | UPDATE                      |
|-------------|---------------------|------------------------|-----------------------------|
| profiles    | Everyone            | Auto (trigger)         | Own profile only            |
| tasks       | Everyone            | Authenticated (own)    | Creator or claimer          |
| submissions | Own + task creator   | Authenticated (own)    | —                           |
