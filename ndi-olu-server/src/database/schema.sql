-- ============================================
-- NDI-OLU DATABASE SCHEMA
-- ============================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;


-- ============================================
-- USERS
-- ============================================

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    full_name VARCHAR(150) NOT NULL,

    email VARCHAR(255) UNIQUE NOT NULL,

    password_hash TEXT NOT NULL,

    phone VARCHAR(30),

    role VARCHAR(20) NOT NULL DEFAULT 'customer'
        CHECK (role IN ('customer', 'worker', 'admin')),

    is_verified BOOLEAN NOT NULL DEFAULT FALSE,

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE users
ALTER COLUMN password_hash DROP NOT NULL;

ALTER TABLE users
ADD COLUMN IF NOT EXISTS google_id VARCHAR(255) UNIQUE;

ALTER TABLE users
ADD COLUMN IF NOT EXISTS auth_provider VARCHAR(20) NOT NULL DEFAULT 'local';

ALTER TABLE users
ADD CONSTRAINT users_auth_provider_check
CHECK (auth_provider IN ('local', 'google'));

-- ============================================
-- WORKER PROFILES
-- ============================================

CREATE TABLE IF NOT EXISTS worker_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID UNIQUE NOT NULL
        REFERENCES users(id)
        ON DELETE CASCADE,

    profile_image_url TEXT,

    bio TEXT,

    years_experience INTEGER NOT NULL DEFAULT 0
        CHECK (years_experience >= 0),

    location VARCHAR(150),

    availability VARCHAR(100) DEFAULT 'Available this week',

    jobs_completed INTEGER NOT NULL DEFAULT 0
        CHECK (jobs_completed >= 0),

    rating NUMERIC(3,2) NOT NULL DEFAULT 0.00
        CHECK (rating >= 0 AND rating <= 5),

    review_count INTEGER NOT NULL DEFAULT 0
        CHECK (review_count >= 0),

    is_approved BOOLEAN NOT NULL DEFAULT FALSE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- WORKER PORTFOLIO
-- ============================================

CREATE TABLE IF NOT EXISTS worker_portfolio (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    worker_id UUID NOT NULL
        REFERENCES worker_profiles(id)
        ON DELETE CASCADE,

    media_type VARCHAR(20) NOT NULL DEFAULT 'image'
        CHECK (media_type IN ('image', 'video')),

    media_url TEXT NOT NULL,

    title VARCHAR(150),

    description TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- SERVICES
-- ============================================

CREATE TABLE IF NOT EXISTS services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    name VARCHAR(100) NOT NULL,

    slug VARCHAR(100) UNIQUE NOT NULL,

    description TEXT,

    icon VARCHAR(100),

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- WORKER SERVICES
-- ============================================

CREATE TABLE IF NOT EXISTS worker_services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    worker_id UUID NOT NULL
        REFERENCES worker_profiles(id)
        ON DELETE CASCADE,

    service_id UUID NOT NULL
        REFERENCES services(id)
        ON DELETE CASCADE,

    is_primary BOOLEAN NOT NULL DEFAULT FALSE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE (worker_id, service_id)
);
-- ============================================
-- JOBS
-- ============================================

CREATE TABLE IF NOT EXISTS jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    customer_id UUID NOT NULL
        REFERENCES users(id)
        ON DELETE CASCADE,

    service_id UUID NOT NULL
        REFERENCES services(id)
        ON DELETE RESTRICT,

    title VARCHAR(200) NOT NULL,

    description TEXT NOT NULL,

    location VARCHAR(150) NOT NULL,

    address_note VARCHAR(255),

    timing VARCHAR(50) NOT NULL
        CHECK (timing IN ('today', 'this-week', 'flexible')),

    budget_type VARCHAR(30) NOT NULL DEFAULT 'discuss'
        CHECK (budget_type IN ('fixed', 'hourly', 'discuss')),

    budget_amount NUMERIC(12,2),

    status VARCHAR(30) NOT NULL DEFAULT 'open'
        CHECK (
            status IN (
                'draft',
                'open',
                'in_progress',
                'completed',
                'cancelled'
            )
        ),

    preferred_worker_id UUID
        REFERENCES worker_profiles(id)
        ON DELETE SET NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- JOB PROPOSALS
-- ============================================

CREATE TABLE IF NOT EXISTS proposals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    job_id UUID NOT NULL
        REFERENCES jobs(id)
        ON DELETE CASCADE,

    worker_id UUID NOT NULL
        REFERENCES worker_profiles(id)
        ON DELETE CASCADE,

    message TEXT NOT NULL,

    proposed_amount NUMERIC(12,2),

    estimated_duration VARCHAR(100),

    status VARCHAR(30) NOT NULL DEFAULT 'pending'
        CHECK (
            status IN (
                'pending',
                'accepted',
                'rejected',
                'withdrawn'
            )
        ),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT unique_worker_job_proposal
        UNIQUE (job_id, worker_id)
);

-- ============================================
-- REVIEWS
-- ============================================

CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    job_id UUID NOT NULL
        REFERENCES jobs(id)
        ON DELETE CASCADE,

    customer_id UUID NOT NULL
        REFERENCES users(id)
        ON DELETE CASCADE,

    worker_id UUID NOT NULL
        REFERENCES worker_profiles(id)
        ON DELETE CASCADE,

    rating INTEGER NOT NULL
        CHECK (rating >= 1 AND rating <= 5),

    comment TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT unique_job_review
        UNIQUE (job_id)
);

INSERT INTO services (name, slug, description)
VALUES
    (
        'Plumbing',
        'plumbing',
        'Pipe repairs, leaks, installations, drainage and other plumbing services.'
    ),
    (
        'Electrical',
        'electrical',
        'Electrical repairs, wiring, installations, sockets, lighting and related services.'
    ),
    (
        'Cleaning',
        'cleaning',
        'Home, office and general cleaning services.'
    ),
    (
        'Painting',
        'painting',
        'Interior and exterior painting, repainting and finishing services.'
    ),
    (
        'Carpentry',
        'carpentry',
        'Furniture repairs, woodwork, doors, cabinets and carpentry services.'
    ),
    (
        'Tiling',
        'tiling',
        'Floor, wall and bathroom tiling and related finishing work.'
    ),
    (
        'Air Conditioning',
        'air-conditioning',
        'Air conditioner installation, servicing, maintenance and repairs.'
    ),
    (
        'Generator Repair',
        'generator-repair',
        'Generator servicing, maintenance, troubleshooting and repairs.'
    );