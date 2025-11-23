--
-- PostgreSQL database dump
--

\restrict 1HAGKq3fm2BgG7NwMVbzuV1jsmS6g7Dt2SGhlzhNFpzVaQhcettfiXTWvhHTG2z

-- Dumped from database version 16.9 (415ebe8)
-- Dumped by pg_dump version 16.10

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: postgis; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS postgis WITH SCHEMA public;


--
-- Name: EXTENSION postgis; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION postgis IS 'PostGIS geometry and geography spatial types and functions';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: addresses; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.addresses (
    id uuid NOT NULL,
    tenant_id uuid NOT NULL,
    scheme_id uuid,
    premise_code character varying(50),
    street character varying(255),
    village character varying(255),
    ward character varying(255),
    subcounty character varying(255),
    city character varying(255),
    postcode character varying(20),
    country character varying(2) DEFAULT 'KE'::character varying NOT NULL,
    what3words character varying(255),
    meta jsonb,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    deleted_at timestamp(0) without time zone,
    location public.geometry(Point,4326)
);


ALTER TABLE public.addresses OWNER TO neondb_owner;

--
-- Name: api_keys; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.api_keys (
    id uuid NOT NULL,
    tenant_id uuid NOT NULL,
    name character varying(255) NOT NULL,
    hash character varying(255) NOT NULL,
    scopes jsonb,
    created_by uuid NOT NULL,
    last_used_at timestamp(0) without time zone,
    revoked boolean DEFAULT false NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    deleted_at timestamp(0) without time zone
);


ALTER TABLE public.api_keys OWNER TO neondb_owner;

--
-- Name: assessment_attempts; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.assessment_attempts (
    id bigint NOT NULL,
    enrollment_id bigint NOT NULL,
    assessment_id bigint NOT NULL,
    attempt_number integer DEFAULT 1 NOT NULL,
    answers json,
    score numeric(5,2) DEFAULT '0'::numeric NOT NULL,
    passed boolean DEFAULT false NOT NULL,
    started_at timestamp(0) without time zone NOT NULL,
    submitted_at timestamp(0) without time zone,
    evidence json,
    assessor_id uuid,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.assessment_attempts OWNER TO neondb_owner;

--
-- Name: assessment_attempts_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.assessment_attempts_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.assessment_attempts_id_seq OWNER TO neondb_owner;

--
-- Name: assessment_attempts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.assessment_attempts_id_seq OWNED BY public.assessment_attempts.id;


--
-- Name: assessments; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.assessments (
    id bigint NOT NULL,
    course_id bigint NOT NULL,
    title character varying(255) NOT NULL,
    type character varying(255) NOT NULL,
    passing_score integer DEFAULT 70 NOT NULL,
    max_attempts integer DEFAULT 3 NOT NULL,
    time_limit_min integer,
    randomize_questions boolean DEFAULT false NOT NULL,
    show_answers boolean DEFAULT false NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.assessments OWNER TO neondb_owner;

--
-- Name: assessments_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.assessments_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.assessments_id_seq OWNER TO neondb_owner;

--
-- Name: assessments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.assessments_id_seq OWNED BY public.assessments.id;


--
-- Name: asset_boms; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.asset_boms (
    id bigint NOT NULL,
    asset_id bigint NOT NULL,
    part_id bigint NOT NULL,
    qty numeric(10,4) NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.asset_boms OWNER TO neondb_owner;

--
-- Name: asset_boms_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.asset_boms_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.asset_boms_id_seq OWNER TO neondb_owner;

--
-- Name: asset_boms_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.asset_boms_id_seq OWNED BY public.asset_boms.id;


--
-- Name: asset_classes; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.asset_classes (
    id bigint NOT NULL,
    code character varying(50) NOT NULL,
    name character varying(255) NOT NULL,
    parent_id bigint,
    criticality character varying(255) DEFAULT 'medium'::character varying NOT NULL,
    attributes_schema jsonb,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    CONSTRAINT asset_classes_criticality_check CHECK (((criticality)::text = ANY ((ARRAY['low'::character varying, 'medium'::character varying, 'high'::character varying])::text[])))
);


ALTER TABLE public.asset_classes OWNER TO neondb_owner;

--
-- Name: asset_classes_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.asset_classes_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.asset_classes_id_seq OWNER TO neondb_owner;

--
-- Name: asset_classes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.asset_classes_id_seq OWNED BY public.asset_classes.id;


--
-- Name: asset_locations; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.asset_locations (
    id bigint NOT NULL,
    asset_id bigint NOT NULL,
    effective_from date NOT NULL,
    effective_to date,
    geom public.geometry(Point,4326) NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.asset_locations OWNER TO neondb_owner;

--
-- Name: asset_locations_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.asset_locations_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.asset_locations_id_seq OWNER TO neondb_owner;

--
-- Name: asset_locations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.asset_locations_id_seq OWNED BY public.asset_locations.id;


--
-- Name: asset_meters; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.asset_meters (
    id bigint NOT NULL,
    asset_id bigint NOT NULL,
    kind character varying(50) NOT NULL,
    unit character varying(20) NOT NULL,
    multiplier numeric(10,4) DEFAULT '1'::numeric NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.asset_meters OWNER TO neondb_owner;

--
-- Name: asset_meters_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.asset_meters_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.asset_meters_id_seq OWNER TO neondb_owner;

--
-- Name: asset_meters_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.asset_meters_id_seq OWNED BY public.asset_meters.id;


--
-- Name: assets; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.assets (
    id bigint NOT NULL,
    tenant_id uuid NOT NULL,
    scheme_id uuid,
    dma_id uuid,
    class_id bigint NOT NULL,
    parent_id bigint,
    code character varying(50) NOT NULL,
    name character varying(255) NOT NULL,
    barcode character varying(100),
    serial character varying(100),
    manufacturer character varying(255),
    model character varying(255),
    status character varying(255) DEFAULT 'active'::character varying NOT NULL,
    install_date date,
    warranty_expiry date,
    geom public.geometry(Point,4326),
    specs jsonb,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    CONSTRAINT assets_status_check CHECK (((status)::text = ANY ((ARRAY['active'::character varying, 'inactive'::character varying, 'retired'::character varying, 'under_maintenance'::character varying])::text[])))
);


ALTER TABLE public.assets OWNER TO neondb_owner;

--
-- Name: assets_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.assets_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.assets_id_seq OWNER TO neondb_owner;

--
-- Name: assets_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.assets_id_seq OWNED BY public.assets.id;


--
-- Name: attachments; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.attachments (
    id uuid NOT NULL,
    tenant_id uuid NOT NULL,
    entity_type character varying(255) NOT NULL,
    entity_id uuid NOT NULL,
    path character varying(255) NOT NULL,
    kind character varying(50),
    title character varying(255),
    uploaded_by bigint,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    deleted_at timestamp(0) without time zone
);


ALTER TABLE public.attachments OWNER TO neondb_owner;

--
-- Name: audit_events; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.audit_events (
    id uuid NOT NULL,
    tenant_id uuid,
    actor_id uuid,
    actor_type character varying(255) NOT NULL,
    action character varying(255) NOT NULL,
    entity_type character varying(255),
    entity_id character varying(255),
    ip character varying(255),
    ua text,
    diff jsonb,
    occurred_at timestamp(0) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.audit_events OWNER TO neondb_owner;

--
-- Name: cache; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.cache (
    key character varying(255) NOT NULL,
    value text NOT NULL,
    expiration integer NOT NULL
);


ALTER TABLE public.cache OWNER TO neondb_owner;

--
-- Name: cache_locks; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.cache_locks (
    key character varying(255) NOT NULL,
    owner character varying(255) NOT NULL,
    expiration integer NOT NULL
);


ALTER TABLE public.cache_locks OWNER TO neondb_owner;

--
-- Name: certificates; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.certificates (
    id bigint NOT NULL,
    tenant_id uuid NOT NULL,
    user_id uuid NOT NULL,
    course_id bigint NOT NULL,
    code character varying(255) NOT NULL,
    qr_token character varying(255) NOT NULL,
    score numeric(5,2) NOT NULL,
    issued_at timestamp(0) without time zone NOT NULL,
    expires_at timestamp(0) without time zone,
    metadata json,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.certificates OWNER TO neondb_owner;

--
-- Name: certificates_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.certificates_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.certificates_id_seq OWNER TO neondb_owner;

--
-- Name: certificates_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.certificates_id_seq OWNED BY public.certificates.id;


--
-- Name: checklist_runs; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.checklist_runs (
    id bigint NOT NULL,
    checklist_id bigint NOT NULL,
    shift_id bigint,
    facility_id uuid,
    performed_by uuid NOT NULL,
    started_at timestamp(0) with time zone NOT NULL,
    completed_at timestamp(0) with time zone,
    data jsonb NOT NULL,
    score numeric(5,2),
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.checklist_runs OWNER TO neondb_owner;

--
-- Name: checklist_runs_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.checklist_runs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.checklist_runs_id_seq OWNER TO neondb_owner;

--
-- Name: checklist_runs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.checklist_runs_id_seq OWNED BY public.checklist_runs.id;


--
-- Name: checklists; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.checklists (
    id bigint NOT NULL,
    tenant_id uuid NOT NULL,
    title character varying(255) NOT NULL,
    schema jsonb NOT NULL,
    frequency character varying(255) DEFAULT 'daily'::character varying NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    CONSTRAINT checklists_frequency_check CHECK (((frequency)::text = ANY ((ARRAY['hourly'::character varying, 'daily'::character varying, 'weekly'::character varying, 'custom'::character varying])::text[])))
);


ALTER TABLE public.checklists OWNER TO neondb_owner;

--
-- Name: checklists_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.checklists_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.checklists_id_seq OWNER TO neondb_owner;

--
-- Name: checklists_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.checklists_id_seq OWNED BY public.checklists.id;


--
-- Name: chemical_stocks; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.chemical_stocks (
    id uuid NOT NULL,
    tenant_id uuid NOT NULL,
    scheme_id uuid NOT NULL,
    facility_id uuid,
    chemical character varying(255) NOT NULL,
    qty_on_hand_kg numeric(12,2) DEFAULT '0'::numeric NOT NULL,
    reorder_level_kg numeric(12,2) DEFAULT '0'::numeric NOT NULL,
    max_stock_kg numeric(12,2),
    as_of date NOT NULL,
    unit_cost numeric(12,2),
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    deleted_at timestamp(0) without time zone
);


ALTER TABLE public.chemical_stocks OWNER TO neondb_owner;

--
-- Name: consents; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.consents (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    purpose text NOT NULL,
    granted_at timestamp(0) without time zone NOT NULL,
    revoked_at timestamp(0) without time zone,
    meta jsonb,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.consents OWNER TO neondb_owner;

--
-- Name: courses; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.courses (
    id bigint NOT NULL,
    tenant_id uuid NOT NULL,
    title character varying(255) NOT NULL,
    code character varying(255) NOT NULL,
    domain character varying(255) NOT NULL,
    level character varying(255) NOT NULL,
    format character varying(255) NOT NULL,
    credits integer DEFAULT 0 NOT NULL,
    duration_min integer DEFAULT 0 NOT NULL,
    prerequisites json,
    expiry_days integer,
    owner_id uuid NOT NULL,
    syllabus json,
    description text,
    thumbnail_url character varying(255),
    rating numeric(3,2) DEFAULT '0'::numeric NOT NULL,
    enrollments_count integer DEFAULT 0 NOT NULL,
    status character varying(255) DEFAULT 'draft'::character varying NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    deleted_at timestamp(0) without time zone
);


ALTER TABLE public.courses OWNER TO neondb_owner;

--
-- Name: courses_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.courses_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.courses_id_seq OWNER TO neondb_owner;

--
-- Name: courses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.courses_id_seq OWNED BY public.courses.id;


--
-- Name: crm_balances; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.crm_balances (
    id bigint NOT NULL,
    tenant_id uuid NOT NULL,
    account_no character varying(255) NOT NULL,
    as_of date NOT NULL,
    balance numeric(12,2) NOT NULL,
    aging jsonb,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.crm_balances OWNER TO neondb_owner;

--
-- Name: crm_balances_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.crm_balances_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.crm_balances_id_seq OWNER TO neondb_owner;

--
-- Name: crm_balances_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.crm_balances_id_seq OWNED BY public.crm_balances.id;


--
-- Name: crm_customer_reads; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.crm_customer_reads (
    id bigint NOT NULL,
    meter_id bigint NOT NULL,
    read_at timestamp(0) with time zone NOT NULL,
    value numeric(10,2) NOT NULL,
    photo_path character varying(255),
    read_source character varying(255) DEFAULT 'manual'::character varying NOT NULL,
    quality character varying(255) DEFAULT 'good'::character varying NOT NULL,
    reader_id uuid,
    meta jsonb,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    geom public.geometry(Point,4326),
    CONSTRAINT crm_customer_reads_quality_check CHECK (((quality)::text = ANY ((ARRAY['good'::character varying, 'estimated'::character varying, 'bad'::character varying])::text[]))),
    CONSTRAINT crm_customer_reads_read_source_check CHECK (((read_source)::text = ANY ((ARRAY['manual'::character varying, 'app'::character varying, 'ami'::character varying, 'import'::character varying])::text[])))
);


ALTER TABLE public.crm_customer_reads OWNER TO neondb_owner;

--
-- Name: crm_customer_reads_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.crm_customer_reads_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.crm_customer_reads_id_seq OWNER TO neondb_owner;

--
-- Name: crm_customer_reads_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.crm_customer_reads_id_seq OWNED BY public.crm_customer_reads.id;


--
-- Name: crm_customers; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.crm_customers (
    id bigint NOT NULL,
    tenant_id uuid NOT NULL,
    customer_no character varying(255) NOT NULL,
    name character varying(255) NOT NULL,
    id_type character varying(255) DEFAULT 'nat_id'::character varying NOT NULL,
    id_no character varying(255) NOT NULL,
    phone character varying(255),
    email character varying(255),
    premise_id bigint,
    contact_address text,
    kyc jsonb,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    CONSTRAINT crm_customers_id_type_check CHECK (((id_type)::text = ANY ((ARRAY['nat_id'::character varying, 'passport'::character varying, 'org'::character varying])::text[])))
);


ALTER TABLE public.crm_customers OWNER TO neondb_owner;

--
-- Name: crm_customers_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.crm_customers_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.crm_customers_id_seq OWNER TO neondb_owner;

--
-- Name: crm_customers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.crm_customers_id_seq OWNED BY public.crm_customers.id;


--
-- Name: crm_invoice_lines; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.crm_invoice_lines (
    id bigint NOT NULL,
    invoice_id bigint NOT NULL,
    description character varying(255) NOT NULL,
    quantity numeric(10,2) NOT NULL,
    unit_price numeric(10,2) NOT NULL,
    amount numeric(12,2) NOT NULL,
    tariff_block character varying(255),
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.crm_invoice_lines OWNER TO neondb_owner;

--
-- Name: crm_invoice_lines_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.crm_invoice_lines_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.crm_invoice_lines_id_seq OWNER TO neondb_owner;

--
-- Name: crm_invoice_lines_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.crm_invoice_lines_id_seq OWNED BY public.crm_invoice_lines.id;


--
-- Name: crm_invoices; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.crm_invoices (
    id bigint NOT NULL,
    tenant_id uuid NOT NULL,
    account_no character varying(255) NOT NULL,
    period_start date NOT NULL,
    period_end date NOT NULL,
    due_date date NOT NULL,
    total_amount numeric(12,2) NOT NULL,
    status character varying(255) DEFAULT 'open'::character varying NOT NULL,
    meta jsonb,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    CONSTRAINT crm_invoices_status_check CHECK (((status)::text = ANY ((ARRAY['open'::character varying, 'paid'::character varying, 'part_paid'::character varying, 'written_off'::character varying])::text[])))
);


ALTER TABLE public.crm_invoices OWNER TO neondb_owner;

--
-- Name: crm_invoices_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.crm_invoices_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.crm_invoices_id_seq OWNER TO neondb_owner;

--
-- Name: crm_invoices_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.crm_invoices_id_seq OWNED BY public.crm_invoices.id;


--
-- Name: crm_meters; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.crm_meters (
    id bigint NOT NULL,
    tenant_id uuid NOT NULL,
    serial_no character varying(255) NOT NULL,
    make character varying(255),
    model character varying(255),
    size_mm integer,
    meter_type character varying(255) DEFAULT 'mechanical'::character varying NOT NULL,
    install_date date,
    status character varying(255) DEFAULT 'in_service'::character varying NOT NULL,
    last_read_at timestamp(0) with time zone,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    CONSTRAINT crm_meters_meter_type_check CHECK (((meter_type)::text = ANY ((ARRAY['mechanical'::character varying, 'ultrasonic'::character varying, 'prepaid'::character varying])::text[]))),
    CONSTRAINT crm_meters_status_check CHECK (((status)::text = ANY ((ARRAY['in_service'::character varying, 'faulty'::character varying, 'replaced'::character varying, 'lost'::character varying])::text[])))
);


ALTER TABLE public.crm_meters OWNER TO neondb_owner;

--
-- Name: crm_meters_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.crm_meters_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.crm_meters_id_seq OWNER TO neondb_owner;

--
-- Name: crm_meters_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.crm_meters_id_seq OWNED BY public.crm_meters.id;


--
-- Name: crm_payment_plans; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.crm_payment_plans (
    id bigint NOT NULL,
    tenant_id uuid NOT NULL,
    account_no character varying(255) NOT NULL,
    status character varying(255) DEFAULT 'active'::character varying NOT NULL,
    schedule jsonb NOT NULL,
    next_due date,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    CONSTRAINT crm_payment_plans_status_check CHECK (((status)::text = ANY ((ARRAY['active'::character varying, 'completed'::character varying, 'defaulted'::character varying])::text[])))
);


ALTER TABLE public.crm_payment_plans OWNER TO neondb_owner;

--
-- Name: crm_payment_plans_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.crm_payment_plans_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.crm_payment_plans_id_seq OWNER TO neondb_owner;

--
-- Name: crm_payment_plans_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.crm_payment_plans_id_seq OWNED BY public.crm_payment_plans.id;


--
-- Name: crm_payments; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.crm_payments (
    id bigint NOT NULL,
    tenant_id uuid NOT NULL,
    account_no character varying(255) NOT NULL,
    paid_at timestamp(0) with time zone NOT NULL,
    amount numeric(12,2) NOT NULL,
    channel character varying(255) DEFAULT 'cash'::character varying NOT NULL,
    ref character varying(255),
    meta jsonb,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    CONSTRAINT crm_payments_channel_check CHECK (((channel)::text = ANY ((ARRAY['cash'::character varying, 'bank'::character varying, 'mpesa'::character varying, 'online'::character varying, 'adjustment'::character varying])::text[])))
);


ALTER TABLE public.crm_payments OWNER TO neondb_owner;

--
-- Name: crm_payments_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.crm_payments_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.crm_payments_id_seq OWNER TO neondb_owner;

--
-- Name: crm_payments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.crm_payments_id_seq OWNED BY public.crm_payments.id;


--
-- Name: crm_premises; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.crm_premises (
    id bigint NOT NULL,
    tenant_id uuid NOT NULL,
    scheme_id uuid,
    dma_id uuid,
    premise_id character varying(255) NOT NULL,
    address text,
    occupancy character varying(255) DEFAULT 'residential'::character varying NOT NULL,
    status character varying(255) DEFAULT 'active'::character varying NOT NULL,
    meta jsonb,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    location public.geometry(Point,4326),
    CONSTRAINT crm_premises_occupancy_check CHECK (((occupancy)::text = ANY ((ARRAY['residential'::character varying, 'commercial'::character varying, 'institutional'::character varying, 'mixed'::character varying])::text[]))),
    CONSTRAINT crm_premises_status_check CHECK (((status)::text = ANY ((ARRAY['active'::character varying, 'vacant'::character varying, 'demolished'::character varying])::text[])))
);


ALTER TABLE public.crm_premises OWNER TO neondb_owner;

--
-- Name: crm_premises_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.crm_premises_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.crm_premises_id_seq OWNER TO neondb_owner;

--
-- Name: crm_premises_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.crm_premises_id_seq OWNED BY public.crm_premises.id;


--
-- Name: crm_ra_rules; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.crm_ra_rules (
    id bigint NOT NULL,
    tenant_id uuid NOT NULL,
    code character varying(255) NOT NULL,
    name character varying(255) NOT NULL,
    severity character varying(255) DEFAULT 'medium'::character varying NOT NULL,
    params jsonb NOT NULL,
    active boolean DEFAULT true NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    CONSTRAINT crm_ra_rules_severity_check CHECK (((severity)::text = ANY ((ARRAY['low'::character varying, 'medium'::character varying, 'high'::character varying])::text[])))
);


ALTER TABLE public.crm_ra_rules OWNER TO neondb_owner;

--
-- Name: crm_ra_rules_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.crm_ra_rules_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.crm_ra_rules_id_seq OWNER TO neondb_owner;

--
-- Name: crm_ra_rules_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.crm_ra_rules_id_seq OWNED BY public.crm_ra_rules.id;


--
-- Name: crm_service_connections; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.crm_service_connections (
    id bigint NOT NULL,
    premise_id bigint NOT NULL,
    connection_no character varying(255) NOT NULL,
    status character varying(255) DEFAULT 'pending'::character varying NOT NULL,
    connection_type character varying(255) DEFAULT 'individual'::character varying NOT NULL,
    install_date date,
    meter_id bigint,
    notes text,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    CONSTRAINT crm_service_connections_connection_type_check CHECK (((connection_type)::text = ANY ((ARRAY['individual'::character varying, 'shared'::character varying, 'kiosk'::character varying, 'yard_tap'::character varying])::text[]))),
    CONSTRAINT crm_service_connections_status_check CHECK (((status)::text = ANY ((ARRAY['active'::character varying, 'pending'::character varying, 'disconnected'::character varying, 'illegal'::character varying, 'abandoned'::character varying])::text[])))
);


ALTER TABLE public.crm_service_connections OWNER TO neondb_owner;

--
-- Name: crm_service_connections_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.crm_service_connections_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.crm_service_connections_id_seq OWNER TO neondb_owner;

--
-- Name: crm_service_connections_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.crm_service_connections_id_seq OWNED BY public.crm_service_connections.id;


--
-- Name: crm_tariffs; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.crm_tariffs (
    id bigint NOT NULL,
    tenant_id uuid NOT NULL,
    name character varying(255) NOT NULL,
    valid_from date NOT NULL,
    valid_to date,
    blocks jsonb NOT NULL,
    fixed_charge numeric(10,2) DEFAULT '0'::numeric NOT NULL,
    currency character varying(3) DEFAULT 'KES'::character varying NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.crm_tariffs OWNER TO neondb_owner;

--
-- Name: crm_tariffs_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.crm_tariffs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.crm_tariffs_id_seq OWNER TO neondb_owner;

--
-- Name: crm_tariffs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.crm_tariffs_id_seq OWNED BY public.crm_tariffs.id;


--
-- Name: data_catalog; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.data_catalog (
    id uuid NOT NULL,
    table_name character varying(255) NOT NULL,
    column_name character varying(255) NOT NULL,
    data_class_id uuid NOT NULL,
    encryption character varying(255) DEFAULT 'none'::character varying NOT NULL,
    mask character varying(255) DEFAULT 'none'::character varying NOT NULL,
    purpose_tags jsonb,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.data_catalog OWNER TO neondb_owner;

--
-- Name: data_classes; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.data_classes (
    id uuid NOT NULL,
    code character varying(255) NOT NULL,
    description text NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.data_classes OWNER TO neondb_owner;

--
-- Name: device_trust; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.device_trust (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    device_fingerprint character varying(255) NOT NULL,
    platform character varying(255),
    registered_at timestamp(0) without time zone NOT NULL,
    last_seen_at timestamp(0) without time zone,
    revoked boolean DEFAULT false NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.device_trust OWNER TO neondb_owner;

--
-- Name: dmas; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.dmas (
    id uuid NOT NULL,
    tenant_id uuid NOT NULL,
    scheme_id uuid NOT NULL,
    code character varying(32) NOT NULL,
    name character varying(255) NOT NULL,
    status character varying(255) DEFAULT 'active'::character varying NOT NULL,
    nightline_threshold_m3h numeric(10,2),
    pressure_target_bar numeric(5,2),
    meta jsonb,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    deleted_at timestamp(0) without time zone,
    geom public.geometry(Polygon,4326),
    CONSTRAINT dmas_status_check CHECK (((status)::text = ANY ((ARRAY['active'::character varying, 'planned'::character varying, 'retired'::character varying])::text[])))
);


ALTER TABLE public.dmas OWNER TO neondb_owner;

--
-- Name: dose_change_logs; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.dose_change_logs (
    id uuid NOT NULL,
    dose_plan_id uuid NOT NULL,
    user_id uuid,
    before jsonb,
    after jsonb,
    reason text,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.dose_change_logs OWNER TO neondb_owner;

--
-- Name: dose_plans; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.dose_plans (
    id uuid NOT NULL,
    tenant_id uuid NOT NULL,
    scheme_id uuid NOT NULL,
    asset_id bigint,
    chemical character varying(255),
    flow_bands jsonb,
    thresholds jsonb,
    active boolean DEFAULT true NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    deleted_at timestamp(0) without time zone
);


ALTER TABLE public.dose_plans OWNER TO neondb_owner;

--
-- Name: dsr_requests; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.dsr_requests (
    id uuid NOT NULL,
    tenant_id uuid NOT NULL,
    requester_id uuid NOT NULL,
    type character varying(255) NOT NULL,
    target_user_id uuid NOT NULL,
    status character varying(255) DEFAULT 'new'::character varying NOT NULL,
    submitted_at timestamp(0) without time zone NOT NULL,
    completed_at timestamp(0) without time zone,
    artifacts jsonb,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.dsr_requests OWNER TO neondb_owner;

--
-- Name: employee_skills; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.employee_skills (
    id bigint NOT NULL,
    tenant_id uuid NOT NULL,
    user_id uuid NOT NULL,
    skill_id bigint NOT NULL,
    level_index integer DEFAULT 0 NOT NULL,
    evidence json,
    assessed_at timestamp(0) without time zone,
    assessor_id uuid,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.employee_skills OWNER TO neondb_owner;

--
-- Name: employee_skills_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.employee_skills_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.employee_skills_id_seq OWNER TO neondb_owner;

--
-- Name: employee_skills_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.employee_skills_id_seq OWNED BY public.employee_skills.id;


--
-- Name: enrollments; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.enrollments (
    id bigint NOT NULL,
    tenant_id uuid NOT NULL,
    user_id uuid NOT NULL,
    course_id bigint NOT NULL,
    status character varying(255) DEFAULT 'enrolled'::character varying NOT NULL,
    progress_percent integer DEFAULT 0 NOT NULL,
    started_at timestamp(0) without time zone,
    due_at timestamp(0) without time zone,
    completed_at timestamp(0) without time zone,
    final_score numeric(5,2),
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.enrollments OWNER TO neondb_owner;

--
-- Name: enrollments_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.enrollments_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.enrollments_id_seq OWNER TO neondb_owner;

--
-- Name: enrollments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.enrollments_id_seq OWNED BY public.enrollments.id;


--
-- Name: escalation_policies; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.escalation_policies (
    id bigint NOT NULL,
    tenant_id uuid NOT NULL,
    name character varying(255) NOT NULL,
    rules jsonb NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.escalation_policies OWNER TO neondb_owner;

--
-- Name: escalation_policies_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.escalation_policies_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.escalation_policies_id_seq OWNER TO neondb_owner;

--
-- Name: escalation_policies_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.escalation_policies_id_seq OWNED BY public.escalation_policies.id;


--
-- Name: event_actions; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.event_actions (
    id bigint NOT NULL,
    event_id bigint NOT NULL,
    action character varying(255) NOT NULL,
    actor_id uuid,
    payload jsonb,
    occurred_at timestamp(0) with time zone NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.event_actions OWNER TO neondb_owner;

--
-- Name: event_actions_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.event_actions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.event_actions_id_seq OWNER TO neondb_owner;

--
-- Name: event_actions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.event_actions_id_seq OWNED BY public.event_actions.id;


--
-- Name: event_links; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.event_links (
    id bigint NOT NULL,
    event_id bigint NOT NULL,
    entity_type character varying(255) NOT NULL,
    entity_id bigint NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.event_links OWNER TO neondb_owner;

--
-- Name: event_links_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.event_links_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.event_links_id_seq OWNER TO neondb_owner;

--
-- Name: event_links_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.event_links_id_seq OWNED BY public.event_links.id;


--
-- Name: events; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.events (
    id bigint NOT NULL,
    tenant_id uuid NOT NULL,
    source character varying(255) NOT NULL,
    external_id character varying(255),
    facility_id uuid,
    scheme_id uuid,
    dma_id uuid,
    category character varying(255) NOT NULL,
    subcategory character varying(255),
    severity character varying(255) DEFAULT 'medium'::character varying NOT NULL,
    detected_at timestamp(0) with time zone NOT NULL,
    acknowledged_at timestamp(0) with time zone,
    resolved_at timestamp(0) with time zone,
    status character varying(255) DEFAULT 'new'::character varying NOT NULL,
    description text,
    attributes jsonb,
    location public.geometry(Point,4326),
    correlation_key character varying(100),
    sla_due_at timestamp(0) with time zone,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    CONSTRAINT events_severity_check CHECK (((severity)::text = ANY ((ARRAY['low'::character varying, 'medium'::character varying, 'high'::character varying, 'critical'::character varying])::text[]))),
    CONSTRAINT events_source_check CHECK (((source)::text = ANY ((ARRAY['scada'::character varying, 'ami'::character varying, 'nrw'::character varying, 'energy'::character varying, 'manual'::character varying, 'webhook'::character varying])::text[]))),
    CONSTRAINT events_status_check CHECK (((status)::text = ANY ((ARRAY['new'::character varying, 'ack'::character varying, 'in_progress'::character varying, 'resolved'::character varying, 'closed'::character varying])::text[])))
);


ALTER TABLE public.events OWNER TO neondb_owner;

--
-- Name: events_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.events_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.events_id_seq OWNER TO neondb_owner;

--
-- Name: events_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.events_id_seq OWNED BY public.events.id;


--
-- Name: facilities; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.facilities (
    id uuid NOT NULL,
    tenant_id uuid NOT NULL,
    scheme_id uuid NOT NULL,
    code character varying(32) NOT NULL,
    name character varying(255) NOT NULL,
    category character varying(255) NOT NULL,
    status character varying(255) DEFAULT 'active'::character varying NOT NULL,
    address text,
    commissioned_on date,
    meta jsonb,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    deleted_at timestamp(0) without time zone,
    location public.geometry(Point,4326),
    CONSTRAINT facilities_category_check CHECK (((category)::text = ANY ((ARRAY['source'::character varying, 'treatment'::character varying, 'pumpstation'::character varying, 'reservoir'::character varying, 'office'::character varying, 'workshop'::character varying, 'warehouse'::character varying, 'lab'::character varying])::text[]))),
    CONSTRAINT facilities_status_check CHECK (((status)::text = ANY ((ARRAY['active'::character varying, 'standby'::character varying, 'decommissioned'::character varying])::text[])))
);


ALTER TABLE public.facilities OWNER TO neondb_owner;

--
-- Name: failed_jobs; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.failed_jobs (
    id bigint NOT NULL,
    uuid character varying(255) NOT NULL,
    connection text NOT NULL,
    queue text NOT NULL,
    payload text NOT NULL,
    exception text NOT NULL,
    failed_at timestamp(0) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.failed_jobs OWNER TO neondb_owner;

--
-- Name: failed_jobs_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.failed_jobs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.failed_jobs_id_seq OWNER TO neondb_owner;

--
-- Name: failed_jobs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.failed_jobs_id_seq OWNED BY public.failed_jobs.id;


--
-- Name: failures; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.failures (
    id bigint NOT NULL,
    work_order_id bigint NOT NULL,
    code character varying(50),
    mode character varying(255),
    cause character varying(255),
    effect character varying(255),
    remarks text,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.failures OWNER TO neondb_owner;

--
-- Name: failures_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.failures_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.failures_id_seq OWNER TO neondb_owner;

--
-- Name: failures_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.failures_id_seq OWNED BY public.failures.id;


--
-- Name: interventions; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.interventions (
    id uuid NOT NULL,
    tenant_id uuid NOT NULL,
    dma_id uuid,
    asset_id bigint,
    type character varying(255) DEFAULT 'leak_repair'::character varying NOT NULL,
    date date NOT NULL,
    estimated_savings_m3d numeric(10,2),
    realized_savings_m3d numeric(10,2),
    cost numeric(12,2),
    responsible character varying(255),
    follow_up_at date,
    evidence jsonb,
    notes text,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    deleted_at timestamp(0) without time zone,
    CONSTRAINT interventions_type_check CHECK (((type)::text = ANY ((ARRAY['leak_repair'::character varying, 'meter_replacement'::character varying, 'prv_tuning'::character varying, 'sectorization'::character varying, 'campaign'::character varying, 'other'::character varying])::text[])))
);


ALTER TABLE public.interventions OWNER TO neondb_owner;

--
-- Name: job_batches; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.job_batches (
    id character varying(255) NOT NULL,
    name character varying(255) NOT NULL,
    total_jobs integer NOT NULL,
    pending_jobs integer NOT NULL,
    failed_jobs integer NOT NULL,
    failed_job_ids text NOT NULL,
    options text,
    cancelled_at integer,
    created_at integer NOT NULL,
    finished_at integer
);


ALTER TABLE public.job_batches OWNER TO neondb_owner;

--
-- Name: jobs; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.jobs (
    id bigint NOT NULL,
    queue character varying(255) NOT NULL,
    payload text NOT NULL,
    attempts smallint NOT NULL,
    reserved_at integer,
    available_at integer NOT NULL,
    created_at integer NOT NULL
);


ALTER TABLE public.jobs OWNER TO neondb_owner;

--
-- Name: jobs_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.jobs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.jobs_id_seq OWNER TO neondb_owner;

--
-- Name: jobs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.jobs_id_seq OWNED BY public.jobs.id;


--
-- Name: kb_articles; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.kb_articles (
    id bigint NOT NULL,
    tenant_id uuid NOT NULL,
    title character varying(255) NOT NULL,
    category character varying(255) NOT NULL,
    tags json,
    content text NOT NULL,
    attachments json,
    version integer DEFAULT 1 NOT NULL,
    status character varying(255) DEFAULT 'draft'::character varying NOT NULL,
    author_id uuid NOT NULL,
    reviewers json,
    approver_id uuid,
    reviewed_at timestamp(0) without time zone,
    published_at timestamp(0) without time zone,
    views_count integer DEFAULT 0 NOT NULL,
    helpful_count integer DEFAULT 0 NOT NULL,
    not_helpful_count integer DEFAULT 0 NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    deleted_at timestamp(0) without time zone
);


ALTER TABLE public.kb_articles OWNER TO neondb_owner;

--
-- Name: kb_articles_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.kb_articles_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.kb_articles_id_seq OWNER TO neondb_owner;

--
-- Name: kb_articles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.kb_articles_id_seq OWNED BY public.kb_articles.id;


--
-- Name: kms_keys; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.kms_keys (
    id uuid NOT NULL,
    name character varying(255) NOT NULL,
    purpose character varying(255) NOT NULL,
    key_ref text NOT NULL,
    rotated_at timestamp(0) without time zone,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.kms_keys OWNER TO neondb_owner;

--
-- Name: lesson_progress; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.lesson_progress (
    id bigint NOT NULL,
    enrollment_id bigint NOT NULL,
    lesson_id bigint NOT NULL,
    is_completed boolean DEFAULT false NOT NULL,
    time_spent_seconds integer DEFAULT 0 NOT NULL,
    completed_at timestamp(0) without time zone,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.lesson_progress OWNER TO neondb_owner;

--
-- Name: lesson_progress_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.lesson_progress_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.lesson_progress_id_seq OWNER TO neondb_owner;

--
-- Name: lesson_progress_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.lesson_progress_id_seq OWNED BY public.lesson_progress.id;


--
-- Name: lessons; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.lessons (
    id bigint NOT NULL,
    course_id bigint NOT NULL,
    title character varying(255) NOT NULL,
    type character varying(255) NOT NULL,
    content_url text,
    content_json json,
    order_index integer DEFAULT 0 NOT NULL,
    duration_min integer DEFAULT 0 NOT NULL,
    is_mandatory boolean DEFAULT true NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.lessons OWNER TO neondb_owner;

--
-- Name: lessons_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.lessons_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.lessons_id_seq OWNER TO neondb_owner;

--
-- Name: lessons_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.lessons_id_seq OWNED BY public.lessons.id;


--
-- Name: lookup_values; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.lookup_values (
    id uuid NOT NULL,
    domain character varying(50) NOT NULL,
    code character varying(50) NOT NULL,
    label character varying(255) NOT NULL,
    "order" integer DEFAULT 0 NOT NULL,
    active boolean DEFAULT true NOT NULL,
    meta jsonb,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.lookup_values OWNER TO neondb_owner;

--
-- Name: map_layer_configs; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.map_layer_configs (
    id uuid NOT NULL,
    tenant_id uuid NOT NULL,
    layer_name character varying(255) NOT NULL,
    display_name character varying(255) NOT NULL,
    is_visible boolean DEFAULT true NOT NULL,
    z_index integer DEFAULT 0 NOT NULL,
    style_rules jsonb,
    filters jsonb,
    tile_endpoint character varying(255),
    min_zoom integer DEFAULT 0 NOT NULL,
    max_zoom integer DEFAULT 22 NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.map_layer_configs OWNER TO neondb_owner;

--
-- Name: meter_captures; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.meter_captures (
    id bigint NOT NULL,
    asset_meter_id bigint NOT NULL,
    captured_at timestamp(0) with time zone NOT NULL,
    value numeric(12,4) NOT NULL,
    source character varying(50) DEFAULT 'manual'::character varying NOT NULL,
    meta jsonb,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.meter_captures OWNER TO neondb_owner;

--
-- Name: meter_captures_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.meter_captures_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.meter_captures_id_seq OWNER TO neondb_owner;

--
-- Name: meter_captures_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.meter_captures_id_seq OWNED BY public.meter_captures.id;


--
-- Name: migrations; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.migrations (
    id integer NOT NULL,
    migration character varying(255) NOT NULL,
    batch integer NOT NULL
);


ALTER TABLE public.migrations OWNER TO neondb_owner;

--
-- Name: migrations_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.migrations_id_seq OWNER TO neondb_owner;

--
-- Name: migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.migrations_id_seq OWNED BY public.migrations.id;


--
-- Name: model_has_permissions; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.model_has_permissions (
    permission_id bigint NOT NULL,
    model_type character varying(255) NOT NULL,
    model_id bigint NOT NULL
);


ALTER TABLE public.model_has_permissions OWNER TO neondb_owner;

--
-- Name: model_has_roles; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.model_has_roles (
    role_id bigint NOT NULL,
    model_type character varying(255) NOT NULL,
    model_id bigint NOT NULL
);


ALTER TABLE public.model_has_roles OWNER TO neondb_owner;

--
-- Name: network_nodes; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.network_nodes (
    id uuid NOT NULL,
    tenant_id uuid NOT NULL,
    scheme_id uuid,
    type character varying(50) NOT NULL,
    code character varying(100) NOT NULL,
    elevation_m numeric(8,2),
    geom public.geometry(Point,4326),
    created_at timestamp without time zone,
    updated_at timestamp without time zone,
    deleted_at timestamp without time zone
);


ALTER TABLE public.network_nodes OWNER TO neondb_owner;

--
-- Name: notifications; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.notifications (
    id bigint NOT NULL,
    channel character varying(255) NOT NULL,
    "to" character varying(255) NOT NULL,
    subject character varying(255),
    body text NOT NULL,
    sent_at timestamp(0) with time zone,
    status character varying(255) DEFAULT 'queued'::character varying NOT NULL,
    meta jsonb,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    CONSTRAINT notifications_channel_check CHECK (((channel)::text = ANY ((ARRAY['email'::character varying, 'sms'::character varying, 'webhook'::character varying, 'push'::character varying])::text[]))),
    CONSTRAINT notifications_status_check CHECK (((status)::text = ANY ((ARRAY['queued'::character varying, 'sent'::character varying, 'failed'::character varying])::text[])))
);


ALTER TABLE public.notifications OWNER TO neondb_owner;

--
-- Name: notifications_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.notifications_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.notifications_id_seq OWNER TO neondb_owner;

--
-- Name: notifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.notifications_id_seq OWNED BY public.notifications.id;


--
-- Name: nrw_snapshots; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.nrw_snapshots (
    id uuid NOT NULL,
    tenant_id uuid NOT NULL,
    dma_id uuid NOT NULL,
    as_of date NOT NULL,
    system_input_volume_m3 numeric(14,2) DEFAULT '0'::numeric NOT NULL,
    billed_authorized_m3 numeric(14,2) DEFAULT '0'::numeric NOT NULL,
    unbilled_authorized_m3 numeric(14,2) DEFAULT '0'::numeric NOT NULL,
    apparent_losses_m3 numeric(14,2) DEFAULT '0'::numeric NOT NULL,
    real_losses_m3 numeric(14,2) DEFAULT '0'::numeric NOT NULL,
    nrw_m3 numeric(14,2) DEFAULT '0'::numeric NOT NULL,
    nrw_pct numeric(6,3) DEFAULT '0'::numeric NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    deleted_at timestamp(0) without time zone
);


ALTER TABLE public.nrw_snapshots OWNER TO neondb_owner;

--
-- Name: oncall_schedules; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.oncall_schedules (
    id bigint NOT NULL,
    tenant_id uuid NOT NULL,
    team character varying(255) NOT NULL,
    ladder json NOT NULL,
    start_date date NOT NULL,
    rotation_days integer DEFAULT 7 NOT NULL,
    escalation_rules json,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.oncall_schedules OWNER TO neondb_owner;

--
-- Name: oncall_schedules_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.oncall_schedules_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.oncall_schedules_id_seq OWNER TO neondb_owner;

--
-- Name: oncall_schedules_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.oncall_schedules_id_seq OWNED BY public.oncall_schedules.id;


--
-- Name: organizations; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.organizations (
    id uuid NOT NULL,
    tenant_id uuid NOT NULL,
    org_code character varying(32) NOT NULL,
    name character varying(255) NOT NULL,
    type character varying(255) NOT NULL,
    email character varying(255),
    phone character varying(255),
    address text,
    meta jsonb,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    deleted_at timestamp(0) without time zone,
    geom public.geometry(Polygon,4326),
    CONSTRAINT organizations_type_check CHECK (((type)::text = ANY ((ARRAY['authority'::character varying, 'utility'::character varying, 'department'::character varying])::text[])))
);


ALTER TABLE public.organizations OWNER TO neondb_owner;

--
-- Name: outages; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.outages (
    id uuid NOT NULL,
    tenant_id uuid NOT NULL,
    dma_id uuid,
    code character varying(50) NOT NULL,
    cause text,
    state character varying(50) DEFAULT 'draft'::character varying NOT NULL,
    starts_at timestamp with time zone,
    ends_at timestamp with time zone,
    actual_restored_at timestamp with time zone,
    customers_affected integer,
    geom public.geometry(Polygon,4326),
    created_at timestamp without time zone,
    updated_at timestamp without time zone,
    deleted_at timestamp without time zone
);


ALTER TABLE public.outages OWNER TO neondb_owner;

--
-- Name: parts; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.parts (
    id bigint NOT NULL,
    tenant_id uuid NOT NULL,
    code character varying(50) NOT NULL,
    name character varying(255) NOT NULL,
    category character varying(100),
    unit character varying(50) NOT NULL,
    min_qty numeric(10,4) DEFAULT '0'::numeric NOT NULL,
    reorder_qty numeric(10,4) DEFAULT '0'::numeric NOT NULL,
    cost numeric(12,2) DEFAULT '0'::numeric NOT NULL,
    location character varying(255),
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.parts OWNER TO neondb_owner;

--
-- Name: parts_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.parts_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.parts_id_seq OWNER TO neondb_owner;

--
-- Name: parts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.parts_id_seq OWNED BY public.parts.id;


--
-- Name: password_reset_tokens; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.password_reset_tokens (
    email character varying(255) NOT NULL,
    token character varying(255) NOT NULL,
    created_at timestamp(0) without time zone
);


ALTER TABLE public.password_reset_tokens OWNER TO neondb_owner;

--
-- Name: permissions; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.permissions (
    id bigint NOT NULL,
    name character varying(255) NOT NULL,
    guard_name character varying(255) NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.permissions OWNER TO neondb_owner;

--
-- Name: permissions_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.permissions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.permissions_id_seq OWNER TO neondb_owner;

--
-- Name: permissions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.permissions_id_seq OWNED BY public.permissions.id;


--
-- Name: personal_access_tokens; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.personal_access_tokens (
    id bigint NOT NULL,
    tokenable_type character varying(255) NOT NULL,
    tokenable_id bigint NOT NULL,
    name text NOT NULL,
    token character varying(64) NOT NULL,
    abilities text,
    last_used_at timestamp(0) without time zone,
    expires_at timestamp(0) without time zone,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.personal_access_tokens OWNER TO neondb_owner;

--
-- Name: personal_access_tokens_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.personal_access_tokens_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.personal_access_tokens_id_seq OWNER TO neondb_owner;

--
-- Name: personal_access_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.personal_access_tokens_id_seq OWNED BY public.personal_access_tokens.id;


--
-- Name: pipelines; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.pipelines (
    id uuid NOT NULL,
    tenant_id uuid NOT NULL,
    scheme_id uuid NOT NULL,
    code character varying(32) NOT NULL,
    material character varying(255) DEFAULT 'uPVC'::character varying NOT NULL,
    diameter_mm integer NOT NULL,
    install_year integer,
    status character varying(255) DEFAULT 'active'::character varying NOT NULL,
    meta jsonb,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    deleted_at timestamp(0) without time zone,
    geom public.geometry(LineString,4326),
    CONSTRAINT pipelines_material_check CHECK (((material)::text = ANY ((ARRAY['uPVC'::character varying, 'HDPE'::character varying, 'DI'::character varying, 'AC'::character varying, 'GI'::character varying, 'Steel'::character varying, 'Other'::character varying])::text[]))),
    CONSTRAINT pipelines_status_check CHECK (((status)::text = ANY ((ARRAY['active'::character varying, 'leak'::character varying, 'rehab'::character varying, 'abandoned'::character varying])::text[])))
);


ALTER TABLE public.pipelines OWNER TO neondb_owner;

--
-- Name: playbooks; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.playbooks (
    id bigint NOT NULL,
    tenant_id uuid NOT NULL,
    name character varying(255) NOT NULL,
    for_category character varying(255),
    for_severity character varying(255),
    steps jsonb NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.playbooks OWNER TO neondb_owner;

--
-- Name: playbooks_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.playbooks_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.playbooks_id_seq OWNER TO neondb_owner;

--
-- Name: playbooks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.playbooks_id_seq OWNED BY public.playbooks.id;


--
-- Name: pm_policies; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.pm_policies (
    id bigint NOT NULL,
    asset_id bigint NOT NULL,
    strategy character varying(255) DEFAULT 'time'::character varying NOT NULL,
    interval_value integer,
    interval_unit character varying(20),
    task character varying(255) NOT NULL,
    instructions text,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    CONSTRAINT pm_policies_strategy_check CHECK (((strategy)::text = ANY ((ARRAY['time'::character varying, 'meter'::character varying, 'condition'::character varying])::text[])))
);


ALTER TABLE public.pm_policies OWNER TO neondb_owner;

--
-- Name: pm_policies_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.pm_policies_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.pm_policies_id_seq OWNER TO neondb_owner;

--
-- Name: pm_policies_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.pm_policies_id_seq OWNED BY public.pm_policies.id;


--
-- Name: pm_schedules; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.pm_schedules (
    id bigint NOT NULL,
    pm_policy_id bigint NOT NULL,
    next_due timestamp(0) with time zone,
    last_done timestamp(0) with time zone,
    status character varying(255) DEFAULT 'scheduled'::character varying NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    CONSTRAINT pm_schedules_status_check CHECK (((status)::text = ANY ((ARRAY['scheduled'::character varying, 'overdue'::character varying, 'completed'::character varying, 'skipped'::character varying])::text[])))
);


ALTER TABLE public.pm_schedules OWNER TO neondb_owner;

--
-- Name: pm_schedules_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.pm_schedules_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.pm_schedules_id_seq OWNER TO neondb_owner;

--
-- Name: pm_schedules_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.pm_schedules_id_seq OWNED BY public.pm_schedules.id;


--
-- Name: pump_schedules; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.pump_schedules (
    id uuid NOT NULL,
    tenant_id uuid NOT NULL,
    asset_id bigint NOT NULL,
    scheme_id uuid NOT NULL,
    start_at timestamp(0) with time zone NOT NULL,
    end_at timestamp(0) with time zone NOT NULL,
    status character varying(255) DEFAULT 'scheduled'::character varying NOT NULL,
    constraints jsonb,
    source character varying(255) DEFAULT 'manual'::character varying NOT NULL,
    target_volume_m3 numeric(12,2),
    actual_volume_m3 numeric(12,2),
    energy_cost numeric(12,2),
    notes text,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    deleted_at timestamp(0) without time zone,
    CONSTRAINT pump_schedules_source_check CHECK (((source)::text = ANY ((ARRAY['manual'::character varying, 'optimizer'::character varying])::text[]))),
    CONSTRAINT pump_schedules_status_check CHECK (((status)::text = ANY ((ARRAY['scheduled'::character varying, 'running'::character varying, 'completed'::character varying, 'cancelled'::character varying])::text[])))
);


ALTER TABLE public.pump_schedules OWNER TO neondb_owner;

--
-- Name: questions; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.questions (
    id bigint NOT NULL,
    assessment_id bigint NOT NULL,
    type character varying(255) NOT NULL,
    question_text text NOT NULL,
    options json,
    correct_answer json NOT NULL,
    explanation text,
    points integer DEFAULT 1 NOT NULL,
    order_index integer DEFAULT 0 NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.questions OWNER TO neondb_owner;

--
-- Name: questions_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.questions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.questions_id_seq OWNER TO neondb_owner;

--
-- Name: questions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.questions_id_seq OWNED BY public.questions.id;


--
-- Name: redlines; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.redlines (
    id uuid NOT NULL,
    tenant_id uuid NOT NULL,
    edit_layer_id uuid NOT NULL,
    entity_type character varying(255) NOT NULL,
    entity_id uuid,
    operation character varying(255) DEFAULT 'create'::character varying NOT NULL,
    attributes_before jsonb,
    attributes_after jsonb,
    captured_by uuid NOT NULL,
    captured_at timestamp(0) without time zone NOT NULL,
    capture_method character varying(255),
    gps_accuracy_m numeric(8,2),
    evidence jsonb,
    field_notes text,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    geom_before public.geometry(Geometry,4326),
    geom_after public.geometry(Geometry,4326),
    CONSTRAINT redlines_operation_check CHECK (((operation)::text = ANY ((ARRAY['create'::character varying, 'update'::character varying, 'delete'::character varying])::text[])))
);


ALTER TABLE public.redlines OWNER TO neondb_owner;

--
-- Name: retention_policies; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.retention_policies (
    id uuid NOT NULL,
    entity_type character varying(255) NOT NULL,
    keep_for_days integer NOT NULL,
    action character varying(255) NOT NULL,
    legal_hold boolean DEFAULT false NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.retention_policies OWNER TO neondb_owner;

--
-- Name: role_has_permissions; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.role_has_permissions (
    permission_id bigint NOT NULL,
    role_id bigint NOT NULL
);


ALTER TABLE public.role_has_permissions OWNER TO neondb_owner;

--
-- Name: roles; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.roles (
    id bigint NOT NULL,
    name character varying(255) NOT NULL,
    guard_name character varying(255) NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.roles OWNER TO neondb_owner;

--
-- Name: roles_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.roles_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.roles_id_seq OWNER TO neondb_owner;

--
-- Name: roles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.roles_id_seq OWNED BY public.roles.id;


--
-- Name: rosters; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.rosters (
    id bigint NOT NULL,
    tenant_id uuid NOT NULL,
    name character varying(255) NOT NULL,
    site character varying(255),
    start_date date NOT NULL,
    end_date date NOT NULL,
    calendar json,
    rules json,
    status character varying(255) DEFAULT 'draft'::character varying NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.rosters OWNER TO neondb_owner;

--
-- Name: rosters_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.rosters_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.rosters_id_seq OWNER TO neondb_owner;

--
-- Name: rosters_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.rosters_id_seq OWNED BY public.rosters.id;


--
-- Name: schemes; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.schemes (
    id uuid NOT NULL,
    tenant_id uuid NOT NULL,
    org_id uuid,
    code character varying(32) NOT NULL,
    name character varying(255) NOT NULL,
    type character varying(255) DEFAULT 'rural'::character varying NOT NULL,
    population_estimate integer,
    status character varying(255) DEFAULT 'active'::character varying NOT NULL,
    elevation_m numeric(8,2),
    meta jsonb,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    deleted_at timestamp(0) without time zone,
    geom public.geometry(Polygon,4326),
    centroid public.geometry(Point,4326),
    CONSTRAINT schemes_status_check CHECK (((status)::text = ANY ((ARRAY['active'::character varying, 'planning'::character varying, 'decommissioned'::character varying])::text[]))),
    CONSTRAINT schemes_type_check CHECK (((type)::text = ANY ((ARRAY['urban'::character varying, 'rural'::character varying, 'mixed'::character varying])::text[])))
);


ALTER TABLE public.schemes OWNER TO neondb_owner;

--
-- Name: secrets; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.secrets (
    id uuid NOT NULL,
    tenant_id uuid NOT NULL,
    key character varying(255) NOT NULL,
    value_ciphertext text NOT NULL,
    created_by uuid NOT NULL,
    rotated_at timestamp(0) without time zone,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.secrets OWNER TO neondb_owner;

--
-- Name: security_alerts; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.security_alerts (
    id uuid NOT NULL,
    tenant_id uuid NOT NULL,
    category character varying(255) NOT NULL,
    severity character varying(255) NOT NULL,
    message text NOT NULL,
    details jsonb,
    raised_at timestamp(0) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    acknowledged_at timestamp(0) without time zone,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.security_alerts OWNER TO neondb_owner;

--
-- Name: sessions; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.sessions (
    id character varying(255) NOT NULL,
    user_id uuid,
    ip_address character varying(45),
    user_agent text,
    payload text NOT NULL,
    last_activity integer NOT NULL
);


ALTER TABLE public.sessions OWNER TO neondb_owner;

--
-- Name: shape_files; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.shape_files (
    id uuid NOT NULL,
    tenant_id uuid NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    file_path character varying(255) NOT NULL,
    file_size bigint NOT NULL,
    geom_type character varying(255),
    projection_crs character varying(255) DEFAULT 'EPSG:4326'::character varying NOT NULL,
    bounds json,
    feature_count integer,
    properties_schema json,
    status character varying(255) DEFAULT 'uploading'::character varying NOT NULL,
    uploaded_by uuid,
    uploaded_at timestamp(0) without time zone,
    metadata json,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    CONSTRAINT shape_files_status_check CHECK (((status)::text = ANY ((ARRAY['uploading'::character varying, 'processing'::character varying, 'processed'::character varying, 'failed'::character varying])::text[])))
);


ALTER TABLE public.shape_files OWNER TO neondb_owner;

--
-- Name: shift_entries; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.shift_entries (
    id bigint NOT NULL,
    shift_id bigint NOT NULL,
    kind character varying(255) NOT NULL,
    title character varying(255) NOT NULL,
    body text,
    tags jsonb,
    created_by uuid NOT NULL,
    geom public.geometry(Point,4326),
    attachments jsonb,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    CONSTRAINT shift_entries_kind_check CHECK (((kind)::text = ANY ((ARRAY['note'::character varying, 'reading'::character varying, 'checklist'::character varying, 'handover'::character varying])::text[])))
);


ALTER TABLE public.shift_entries OWNER TO neondb_owner;

--
-- Name: shift_entries_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.shift_entries_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.shift_entries_id_seq OWNER TO neondb_owner;

--
-- Name: shift_entries_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.shift_entries_id_seq OWNED BY public.shift_entries.id;


--
-- Name: shifts; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.shifts (
    id bigint NOT NULL,
    tenant_id uuid NOT NULL,
    facility_id uuid,
    scheme_id uuid,
    dma_id uuid,
    name character varying(255) NOT NULL,
    starts_at timestamp(0) with time zone NOT NULL,
    ends_at timestamp(0) with time zone NOT NULL,
    supervisor_id uuid,
    status character varying(255) DEFAULT 'planned'::character varying NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    CONSTRAINT shifts_status_check CHECK (((status)::text = ANY ((ARRAY['planned'::character varying, 'active'::character varying, 'closed'::character varying])::text[])))
);


ALTER TABLE public.shifts OWNER TO neondb_owner;

--
-- Name: shifts_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.shifts_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.shifts_id_seq OWNER TO neondb_owner;

--
-- Name: shifts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.shifts_id_seq OWNED BY public.shifts.id;


--
-- Name: skills; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.skills (
    id bigint NOT NULL,
    tenant_id uuid NOT NULL,
    code character varying(255) NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    levels json NOT NULL,
    category character varying(255) NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.skills OWNER TO neondb_owner;

--
-- Name: skills_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.skills_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.skills_id_seq OWNER TO neondb_owner;

--
-- Name: skills_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.skills_id_seq OWNED BY public.skills.id;


--
-- Name: sops; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.sops (
    id bigint NOT NULL,
    tenant_id uuid NOT NULL,
    code character varying(255) NOT NULL,
    title character varying(255) NOT NULL,
    category character varying(255) NOT NULL,
    metadata json,
    content json,
    version integer DEFAULT 1 NOT NULL,
    status character varying(255) DEFAULT 'draft'::character varying NOT NULL,
    reviewed_at timestamp(0) without time zone,
    published_at timestamp(0) without time zone,
    next_review_due timestamp(0) without time zone,
    approver_id uuid,
    attestations json,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    deleted_at timestamp(0) without time zone
);


ALTER TABLE public.sops OWNER TO neondb_owner;

--
-- Name: sops_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.sops_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.sops_id_seq OWNER TO neondb_owner;

--
-- Name: sops_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.sops_id_seq OWNED BY public.sops.id;


--
-- Name: spatial_change_log; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.spatial_change_log (
    id uuid NOT NULL,
    tenant_id uuid NOT NULL,
    entity_type character varying(255) NOT NULL,
    entity_id uuid NOT NULL,
    action character varying(255) NOT NULL,
    changes jsonb,
    changed_by uuid NOT NULL,
    change_source character varying(255),
    redline_id uuid,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.spatial_change_log OWNER TO neondb_owner;

--
-- Name: spatial_edit_layers; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.spatial_edit_layers (
    id uuid NOT NULL,
    tenant_id uuid NOT NULL,
    name character varying(255) NOT NULL,
    layer_type character varying(255) NOT NULL,
    description text,
    status character varying(255) DEFAULT 'draft'::character varying NOT NULL,
    created_by uuid NOT NULL,
    reviewed_by uuid,
    approved_by uuid,
    submitted_at timestamp(0) without time zone,
    reviewed_at timestamp(0) without time zone,
    approved_at timestamp(0) without time zone,
    review_notes text,
    metadata jsonb,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    deleted_at timestamp(0) without time zone
);


ALTER TABLE public.spatial_edit_layers OWNER TO neondb_owner;

--
-- Name: stock_txns; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.stock_txns (
    id bigint NOT NULL,
    part_id bigint NOT NULL,
    kind character varying(255) DEFAULT 'receipt'::character varying NOT NULL,
    qty numeric(10,4) NOT NULL,
    unit_cost numeric(12,2) DEFAULT '0'::numeric NOT NULL,
    ref character varying(255),
    work_order_id bigint,
    occurred_at timestamp(0) with time zone NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    CONSTRAINT stock_txns_kind_check CHECK (((kind)::text = ANY ((ARRAY['receipt'::character varying, 'issue'::character varying, 'adjustment'::character varying, 'transfer'::character varying])::text[])))
);


ALTER TABLE public.stock_txns OWNER TO neondb_owner;

--
-- Name: stock_txns_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.stock_txns_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.stock_txns_id_seq OWNER TO neondb_owner;

--
-- Name: stock_txns_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.stock_txns_id_seq OWNED BY public.stock_txns.id;


--
-- Name: suppliers; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.suppliers (
    id bigint NOT NULL,
    tenant_id uuid NOT NULL,
    name character varying(255) NOT NULL,
    email character varying(255),
    phone character varying(255),
    address text,
    terms character varying(255),
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.suppliers OWNER TO neondb_owner;

--
-- Name: suppliers_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.suppliers_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.suppliers_id_seq OWNER TO neondb_owner;

--
-- Name: suppliers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.suppliers_id_seq OWNED BY public.suppliers.id;


--
-- Name: telemetry_measurements; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.telemetry_measurements (
    id uuid NOT NULL,
    telemetry_tag_id uuid NOT NULL,
    ts timestamp(0) with time zone NOT NULL,
    value double precision,
    meta jsonb,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.telemetry_measurements OWNER TO neondb_owner;

--
-- Name: telemetry_tags; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.telemetry_tags (
    id uuid NOT NULL,
    tenant_id uuid NOT NULL,
    scheme_id uuid,
    asset_id bigint,
    network_node_id uuid,
    tag character varying(255) NOT NULL,
    io_type character varying(255) DEFAULT 'AI'::character varying NOT NULL,
    unit character varying(255),
    scale jsonb,
    thresholds jsonb,
    enabled boolean DEFAULT true NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    deleted_at timestamp(0) without time zone,
    CONSTRAINT telemetry_tags_io_type_check CHECK (((io_type)::text = ANY ((ARRAY['AI'::character varying, 'DI'::character varying, 'DO'::character varying, 'AO'::character varying])::text[])))
);


ALTER TABLE public.telemetry_tags OWNER TO neondb_owner;

--
-- Name: tenants; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.tenants (
    id uuid NOT NULL,
    name character varying(255) NOT NULL,
    short_code character varying(32) NOT NULL,
    country character varying(2) DEFAULT 'KE'::character varying NOT NULL,
    timezone character varying(255) DEFAULT 'Africa/Nairobi'::character varying NOT NULL,
    currency character varying(3) DEFAULT 'KES'::character varying NOT NULL,
    logo_path character varying(255),
    status character varying(255) DEFAULT 'active'::character varying NOT NULL,
    meta jsonb,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    deleted_at timestamp(0) without time zone,
    CONSTRAINT tenants_status_check CHECK (((status)::text = ANY ((ARRAY['active'::character varying, 'suspended'::character varying])::text[])))
);


ALTER TABLE public.tenants OWNER TO neondb_owner;

--
-- Name: topology_validations; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.topology_validations (
    id uuid NOT NULL,
    tenant_id uuid NOT NULL,
    edit_layer_id uuid,
    validation_type character varying(255) NOT NULL,
    severity character varying(255) NOT NULL,
    entity_type character varying(255) NOT NULL,
    entity_id uuid,
    message text NOT NULL,
    details jsonb,
    resolved boolean DEFAULT false NOT NULL,
    resolved_by uuid,
    resolved_at timestamp(0) without time zone,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    location public.geometry(Point,4326)
);


ALTER TABLE public.topology_validations OWNER TO neondb_owner;

--
-- Name: users; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.users (
    id uuid NOT NULL,
    name character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    email_verified_at timestamp(0) without time zone,
    password character varying(255) NOT NULL,
    google2fa_secret character varying(255),
    two_factor_enabled boolean DEFAULT false NOT NULL,
    backup_codes text,
    current_tenant_id uuid,
    remember_token character varying(100),
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    deleted_at timestamp(0) without time zone
);


ALTER TABLE public.users OWNER TO neondb_owner;

--
-- Name: wo_labor; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.wo_labor (
    id bigint NOT NULL,
    work_order_id bigint NOT NULL,
    user_id uuid NOT NULL,
    hours numeric(8,2) NOT NULL,
    rate numeric(12,2) NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.wo_labor OWNER TO neondb_owner;

--
-- Name: wo_labor_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.wo_labor_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.wo_labor_id_seq OWNER TO neondb_owner;

--
-- Name: wo_labor_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.wo_labor_id_seq OWNED BY public.wo_labor.id;


--
-- Name: wo_parts; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.wo_parts (
    id bigint NOT NULL,
    work_order_id bigint NOT NULL,
    part_id bigint NOT NULL,
    qty numeric(10,4) NOT NULL,
    unit_cost numeric(12,2) NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.wo_parts OWNER TO neondb_owner;

--
-- Name: wo_parts_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.wo_parts_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.wo_parts_id_seq OWNER TO neondb_owner;

--
-- Name: wo_parts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.wo_parts_id_seq OWNED BY public.wo_parts.id;


--
-- Name: work_orders; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.work_orders (
    id bigint NOT NULL,
    tenant_id uuid NOT NULL,
    wo_num character varying(50) NOT NULL,
    kind character varying(255) DEFAULT 'cm'::character varying NOT NULL,
    asset_id bigint,
    title character varying(255) NOT NULL,
    description text,
    priority character varying(255) DEFAULT 'medium'::character varying NOT NULL,
    status character varying(255) DEFAULT 'new'::character varying NOT NULL,
    created_by uuid NOT NULL,
    assigned_to uuid,
    scheduled_for timestamp(0) with time zone,
    started_at timestamp(0) with time zone,
    completed_at timestamp(0) with time zone,
    completion_notes text,
    pm_policy_id bigint,
    geom public.geometry(Point,4326),
    source character varying(255) DEFAULT 'manual'::character varying NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    CONSTRAINT work_orders_kind_check CHECK (((kind)::text = ANY ((ARRAY['pm'::character varying, 'cm'::character varying, 'emergency'::character varying, 'project'::character varying])::text[]))),
    CONSTRAINT work_orders_priority_check CHECK (((priority)::text = ANY ((ARRAY['low'::character varying, 'medium'::character varying, 'high'::character varying, 'critical'::character varying])::text[]))),
    CONSTRAINT work_orders_source_check CHECK (((source)::text = ANY ((ARRAY['manual'::character varying, 'nrw_anomaly'::character varying, 'energy_alert'::character varying, 'inspection'::character varying, 'pm_schedule'::character varying])::text[]))),
    CONSTRAINT work_orders_status_check CHECK (((status)::text = ANY ((ARRAY['new'::character varying, 'assigned'::character varying, 'in_progress'::character varying, 'on_hold'::character varying, 'completed'::character varying, 'cancelled'::character varying])::text[])))
);


ALTER TABLE public.work_orders OWNER TO neondb_owner;

--
-- Name: work_orders_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.work_orders_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.work_orders_id_seq OWNER TO neondb_owner;

--
-- Name: work_orders_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.work_orders_id_seq OWNED BY public.work_orders.id;


--
-- Name: wq_compliance; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.wq_compliance (
    id bigint NOT NULL,
    sampling_point_id bigint NOT NULL,
    parameter_id bigint NOT NULL,
    period date NOT NULL,
    granularity character varying(255) NOT NULL,
    samples_taken integer DEFAULT 0 NOT NULL,
    samples_compliant integer DEFAULT 0 NOT NULL,
    compliance_pct numeric(5,2) DEFAULT '0'::numeric NOT NULL,
    worst_value numeric(12,4),
    breaches integer DEFAULT 0 NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    CONSTRAINT wq_compliance_granularity_check CHECK (((granularity)::text = ANY ((ARRAY['week'::character varying, 'month'::character varying, 'quarter'::character varying])::text[])))
);


ALTER TABLE public.wq_compliance OWNER TO neondb_owner;

--
-- Name: wq_compliance_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.wq_compliance_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.wq_compliance_id_seq OWNER TO neondb_owner;

--
-- Name: wq_compliance_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.wq_compliance_id_seq OWNED BY public.wq_compliance.id;


--
-- Name: wq_parameters; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.wq_parameters (
    id bigint NOT NULL,
    code character varying(50) NOT NULL,
    name character varying(255) NOT NULL,
    "group" character varying(255) NOT NULL,
    unit character varying(50),
    method text,
    lod numeric(10,4),
    loi numeric(10,4),
    who_limit numeric(10,4),
    wasreb_limit numeric(10,4),
    local_limit numeric(10,4),
    advisory text,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    CONSTRAINT wq_parameters_group_check CHECK ((("group")::text = ANY ((ARRAY['physical'::character varying, 'chemical'::character varying, 'biological'::character varying])::text[])))
);


ALTER TABLE public.wq_parameters OWNER TO neondb_owner;

--
-- Name: COLUMN wq_parameters.lod; Type: COMMENT; Schema: public; Owner: neondb_owner
--

COMMENT ON COLUMN public.wq_parameters.lod IS 'Limit of Detection';


--
-- Name: COLUMN wq_parameters.loi; Type: COMMENT; Schema: public; Owner: neondb_owner
--

COMMENT ON COLUMN public.wq_parameters.loi IS 'Limit of Identification';


--
-- Name: COLUMN wq_parameters.who_limit; Type: COMMENT; Schema: public; Owner: neondb_owner
--

COMMENT ON COLUMN public.wq_parameters.who_limit IS 'WHO Guideline Limit';


--
-- Name: COLUMN wq_parameters.wasreb_limit; Type: COMMENT; Schema: public; Owner: neondb_owner
--

COMMENT ON COLUMN public.wq_parameters.wasreb_limit IS 'WASREB Limit';


--
-- Name: COLUMN wq_parameters.local_limit; Type: COMMENT; Schema: public; Owner: neondb_owner
--

COMMENT ON COLUMN public.wq_parameters.local_limit IS 'Custom/Local Limit';


--
-- Name: wq_parameters_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.wq_parameters_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.wq_parameters_id_seq OWNER TO neondb_owner;

--
-- Name: wq_parameters_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.wq_parameters_id_seq OWNED BY public.wq_parameters.id;


--
-- Name: wq_plan_rules; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.wq_plan_rules (
    id bigint NOT NULL,
    plan_id bigint NOT NULL,
    point_kind character varying(255) NOT NULL,
    parameter_group character varying(255) NOT NULL,
    frequency character varying(255) NOT NULL,
    sample_count integer DEFAULT 1 NOT NULL,
    container_type character varying(255),
    preservatives character varying(255),
    holding_time_hrs integer,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    CONSTRAINT wq_plan_rules_frequency_check CHECK (((frequency)::text = ANY ((ARRAY['daily'::character varying, 'weekly'::character varying, 'monthly'::character varying, 'quarterly'::character varying, 'adhoc'::character varying])::text[]))),
    CONSTRAINT wq_plan_rules_parameter_group_check CHECK (((parameter_group)::text = ANY ((ARRAY['physical'::character varying, 'chemical'::character varying, 'biological'::character varying])::text[]))),
    CONSTRAINT wq_plan_rules_point_kind_check CHECK (((point_kind)::text = ANY ((ARRAY['source'::character varying, 'treatment'::character varying, 'reservoir'::character varying, 'distribution'::character varying, 'kiosk'::character varying, 'household'::character varying])::text[])))
);


ALTER TABLE public.wq_plan_rules OWNER TO neondb_owner;

--
-- Name: wq_plan_rules_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.wq_plan_rules_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.wq_plan_rules_id_seq OWNER TO neondb_owner;

--
-- Name: wq_plan_rules_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.wq_plan_rules_id_seq OWNED BY public.wq_plan_rules.id;


--
-- Name: wq_plans; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.wq_plans (
    id bigint NOT NULL,
    tenant_id uuid NOT NULL,
    name character varying(255) NOT NULL,
    period_start date NOT NULL,
    period_end date NOT NULL,
    status character varying(255) DEFAULT 'draft'::character varying NOT NULL,
    notes text,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    CONSTRAINT wq_plans_status_check CHECK (((status)::text = ANY ((ARRAY['draft'::character varying, 'active'::character varying, 'closed'::character varying])::text[])))
);


ALTER TABLE public.wq_plans OWNER TO neondb_owner;

--
-- Name: wq_plans_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.wq_plans_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.wq_plans_id_seq OWNER TO neondb_owner;

--
-- Name: wq_plans_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.wq_plans_id_seq OWNED BY public.wq_plans.id;


--
-- Name: wq_qc_controls; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.wq_qc_controls (
    id bigint NOT NULL,
    sample_id bigint,
    parameter_id bigint,
    type character varying(255) NOT NULL,
    target_value numeric(12,4),
    accepted_range character varying(255),
    outcome character varying(255),
    details jsonb,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    CONSTRAINT wq_qc_controls_outcome_check CHECK (((outcome)::text = ANY ((ARRAY['pass'::character varying, 'fail'::character varying, 'warn'::character varying])::text[]))),
    CONSTRAINT wq_qc_controls_type_check CHECK (((type)::text = ANY ((ARRAY['blank'::character varying, 'duplicate'::character varying, 'spike'::character varying, 'control_sample'::character varying])::text[])))
);


ALTER TABLE public.wq_qc_controls OWNER TO neondb_owner;

--
-- Name: wq_qc_controls_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.wq_qc_controls_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.wq_qc_controls_id_seq OWNER TO neondb_owner;

--
-- Name: wq_qc_controls_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.wq_qc_controls_id_seq OWNED BY public.wq_qc_controls.id;


--
-- Name: wq_results; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.wq_results (
    id bigint NOT NULL,
    sample_param_id bigint NOT NULL,
    value numeric(12,4),
    value_qualifier character varying(255),
    unit character varying(50),
    analyzed_at timestamp(0) with time zone NOT NULL,
    analyst_id uuid,
    instrument character varying(255),
    lod numeric(10,4),
    uncertainty numeric(10,4),
    qc_flags jsonb DEFAULT '[]'::jsonb NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    CONSTRAINT wq_results_value_qualifier_check CHECK (((value_qualifier)::text = ANY ((ARRAY['<'::character varying, '>'::character varying, '~'::character varying])::text[])))
);


ALTER TABLE public.wq_results OWNER TO neondb_owner;

--
-- Name: COLUMN wq_results.lod; Type: COMMENT; Schema: public; Owner: neondb_owner
--

COMMENT ON COLUMN public.wq_results.lod IS 'Limit of Detection for this result';


--
-- Name: wq_results_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.wq_results_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.wq_results_id_seq OWNER TO neondb_owner;

--
-- Name: wq_results_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.wq_results_id_seq OWNED BY public.wq_results.id;


--
-- Name: wq_sample_params; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.wq_sample_params (
    id bigint NOT NULL,
    sample_id bigint NOT NULL,
    parameter_id bigint NOT NULL,
    status character varying(255) DEFAULT 'pending'::character varying NOT NULL,
    method character varying(255),
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    CONSTRAINT wq_sample_params_status_check CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'in_analysis'::character varying, 'resulted'::character varying, 'invalid'::character varying])::text[])))
);


ALTER TABLE public.wq_sample_params OWNER TO neondb_owner;

--
-- Name: wq_sample_params_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.wq_sample_params_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.wq_sample_params_id_seq OWNER TO neondb_owner;

--
-- Name: wq_sample_params_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.wq_sample_params_id_seq OWNED BY public.wq_sample_params.id;


--
-- Name: wq_samples; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.wq_samples (
    id bigint NOT NULL,
    sampling_point_id bigint NOT NULL,
    plan_id bigint,
    barcode character varying(255) NOT NULL,
    scheduled_for timestamp(0) with time zone,
    collected_at timestamp(0) with time zone,
    collected_by uuid,
    temp_c_on_receipt numeric(4,1),
    custody_state character varying(255) DEFAULT 'scheduled'::character varying NOT NULL,
    photos jsonb,
    chain jsonb,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    CONSTRAINT wq_samples_custody_state_check CHECK (((custody_state)::text = ANY ((ARRAY['scheduled'::character varying, 'collected'::character varying, 'received_lab'::character varying, 'in_analysis'::character varying, 'reported'::character varying, 'invalid'::character varying])::text[])))
);


ALTER TABLE public.wq_samples OWNER TO neondb_owner;

--
-- Name: COLUMN wq_samples.chain; Type: COMMENT; Schema: public; Owner: neondb_owner
--

COMMENT ON COLUMN public.wq_samples.chain IS 'Chain of custody history';


--
-- Name: wq_samples_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.wq_samples_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.wq_samples_id_seq OWNER TO neondb_owner;

--
-- Name: wq_samples_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.wq_samples_id_seq OWNED BY public.wq_samples.id;


--
-- Name: wq_sampling_points; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.wq_sampling_points (
    id bigint NOT NULL,
    tenant_id uuid NOT NULL,
    scheme_id uuid,
    dma_id uuid,
    name character varying(255) NOT NULL,
    code character varying(50) NOT NULL,
    kind character varying(255) NOT NULL,
    location public.geometry(Point,4326) NOT NULL,
    elevation_m numeric(8,2),
    meta jsonb,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    facility_id uuid,
    CONSTRAINT wq_sampling_points_kind_check CHECK (((kind)::text = ANY ((ARRAY['source'::character varying, 'treatment'::character varying, 'reservoir'::character varying, 'distribution'::character varying, 'kiosk'::character varying, 'household'::character varying])::text[])))
);


ALTER TABLE public.wq_sampling_points OWNER TO neondb_owner;

--
-- Name: wq_sampling_points_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.wq_sampling_points_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.wq_sampling_points_id_seq OWNER TO neondb_owner;

--
-- Name: wq_sampling_points_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.wq_sampling_points_id_seq OWNED BY public.wq_sampling_points.id;


--
-- Name: zones; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.zones (
    id uuid NOT NULL,
    tenant_id uuid NOT NULL,
    scheme_id uuid,
    type character varying(50) NOT NULL,
    code character varying(32) NOT NULL,
    name character varying(255) NOT NULL,
    meta jsonb,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    deleted_at timestamp(0) without time zone,
    geom public.geometry(Polygon,4326)
);


ALTER TABLE public.zones OWNER TO neondb_owner;

--
-- Name: assessment_attempts id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.assessment_attempts ALTER COLUMN id SET DEFAULT nextval('public.assessment_attempts_id_seq'::regclass);


--
-- Name: assessments id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.assessments ALTER COLUMN id SET DEFAULT nextval('public.assessments_id_seq'::regclass);


--
-- Name: asset_boms id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.asset_boms ALTER COLUMN id SET DEFAULT nextval('public.asset_boms_id_seq'::regclass);


--
-- Name: asset_classes id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.asset_classes ALTER COLUMN id SET DEFAULT nextval('public.asset_classes_id_seq'::regclass);


--
-- Name: asset_locations id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.asset_locations ALTER COLUMN id SET DEFAULT nextval('public.asset_locations_id_seq'::regclass);


--
-- Name: asset_meters id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.asset_meters ALTER COLUMN id SET DEFAULT nextval('public.asset_meters_id_seq'::regclass);


--
-- Name: assets id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.assets ALTER COLUMN id SET DEFAULT nextval('public.assets_id_seq'::regclass);


--
-- Name: certificates id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.certificates ALTER COLUMN id SET DEFAULT nextval('public.certificates_id_seq'::regclass);


--
-- Name: checklist_runs id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.checklist_runs ALTER COLUMN id SET DEFAULT nextval('public.checklist_runs_id_seq'::regclass);


--
-- Name: checklists id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.checklists ALTER COLUMN id SET DEFAULT nextval('public.checklists_id_seq'::regclass);


--
-- Name: courses id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.courses ALTER COLUMN id SET DEFAULT nextval('public.courses_id_seq'::regclass);


--
-- Name: crm_balances id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.crm_balances ALTER COLUMN id SET DEFAULT nextval('public.crm_balances_id_seq'::regclass);


--
-- Name: crm_customer_reads id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.crm_customer_reads ALTER COLUMN id SET DEFAULT nextval('public.crm_customer_reads_id_seq'::regclass);


--
-- Name: crm_customers id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.crm_customers ALTER COLUMN id SET DEFAULT nextval('public.crm_customers_id_seq'::regclass);


--
-- Name: crm_invoice_lines id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.crm_invoice_lines ALTER COLUMN id SET DEFAULT nextval('public.crm_invoice_lines_id_seq'::regclass);


--
-- Name: crm_invoices id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.crm_invoices ALTER COLUMN id SET DEFAULT nextval('public.crm_invoices_id_seq'::regclass);


--
-- Name: crm_meters id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.crm_meters ALTER COLUMN id SET DEFAULT nextval('public.crm_meters_id_seq'::regclass);


--
-- Name: crm_payment_plans id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.crm_payment_plans ALTER COLUMN id SET DEFAULT nextval('public.crm_payment_plans_id_seq'::regclass);


--
-- Name: crm_payments id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.crm_payments ALTER COLUMN id SET DEFAULT nextval('public.crm_payments_id_seq'::regclass);


--
-- Name: crm_premises id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.crm_premises ALTER COLUMN id SET DEFAULT nextval('public.crm_premises_id_seq'::regclass);


--
-- Name: crm_ra_rules id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.crm_ra_rules ALTER COLUMN id SET DEFAULT nextval('public.crm_ra_rules_id_seq'::regclass);


--
-- Name: crm_service_connections id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.crm_service_connections ALTER COLUMN id SET DEFAULT nextval('public.crm_service_connections_id_seq'::regclass);


--
-- Name: crm_tariffs id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.crm_tariffs ALTER COLUMN id SET DEFAULT nextval('public.crm_tariffs_id_seq'::regclass);


--
-- Name: employee_skills id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.employee_skills ALTER COLUMN id SET DEFAULT nextval('public.employee_skills_id_seq'::regclass);


--
-- Name: enrollments id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.enrollments ALTER COLUMN id SET DEFAULT nextval('public.enrollments_id_seq'::regclass);


--
-- Name: escalation_policies id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.escalation_policies ALTER COLUMN id SET DEFAULT nextval('public.escalation_policies_id_seq'::regclass);


--
-- Name: event_actions id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.event_actions ALTER COLUMN id SET DEFAULT nextval('public.event_actions_id_seq'::regclass);


--
-- Name: event_links id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.event_links ALTER COLUMN id SET DEFAULT nextval('public.event_links_id_seq'::regclass);


--
-- Name: events id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.events ALTER COLUMN id SET DEFAULT nextval('public.events_id_seq'::regclass);


--
-- Name: failed_jobs id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.failed_jobs ALTER COLUMN id SET DEFAULT nextval('public.failed_jobs_id_seq'::regclass);


--
-- Name: failures id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.failures ALTER COLUMN id SET DEFAULT nextval('public.failures_id_seq'::regclass);


--
-- Name: jobs id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.jobs ALTER COLUMN id SET DEFAULT nextval('public.jobs_id_seq'::regclass);


--
-- Name: kb_articles id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.kb_articles ALTER COLUMN id SET DEFAULT nextval('public.kb_articles_id_seq'::regclass);


--
-- Name: lesson_progress id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.lesson_progress ALTER COLUMN id SET DEFAULT nextval('public.lesson_progress_id_seq'::regclass);


--
-- Name: lessons id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.lessons ALTER COLUMN id SET DEFAULT nextval('public.lessons_id_seq'::regclass);


--
-- Name: meter_captures id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.meter_captures ALTER COLUMN id SET DEFAULT nextval('public.meter_captures_id_seq'::regclass);


--
-- Name: migrations id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.migrations ALTER COLUMN id SET DEFAULT nextval('public.migrations_id_seq'::regclass);


--
-- Name: notifications id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.notifications ALTER COLUMN id SET DEFAULT nextval('public.notifications_id_seq'::regclass);


--
-- Name: oncall_schedules id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.oncall_schedules ALTER COLUMN id SET DEFAULT nextval('public.oncall_schedules_id_seq'::regclass);


--
-- Name: parts id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.parts ALTER COLUMN id SET DEFAULT nextval('public.parts_id_seq'::regclass);


--
-- Name: permissions id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.permissions ALTER COLUMN id SET DEFAULT nextval('public.permissions_id_seq'::regclass);


--
-- Name: personal_access_tokens id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.personal_access_tokens ALTER COLUMN id SET DEFAULT nextval('public.personal_access_tokens_id_seq'::regclass);


--
-- Name: playbooks id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.playbooks ALTER COLUMN id SET DEFAULT nextval('public.playbooks_id_seq'::regclass);


--
-- Name: pm_policies id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.pm_policies ALTER COLUMN id SET DEFAULT nextval('public.pm_policies_id_seq'::regclass);


--
-- Name: pm_schedules id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.pm_schedules ALTER COLUMN id SET DEFAULT nextval('public.pm_schedules_id_seq'::regclass);


--
-- Name: questions id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.questions ALTER COLUMN id SET DEFAULT nextval('public.questions_id_seq'::regclass);


--
-- Name: roles id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.roles ALTER COLUMN id SET DEFAULT nextval('public.roles_id_seq'::regclass);


--
-- Name: rosters id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.rosters ALTER COLUMN id SET DEFAULT nextval('public.rosters_id_seq'::regclass);


--
-- Name: shift_entries id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.shift_entries ALTER COLUMN id SET DEFAULT nextval('public.shift_entries_id_seq'::regclass);


--
-- Name: shifts id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.shifts ALTER COLUMN id SET DEFAULT nextval('public.shifts_id_seq'::regclass);


--
-- Name: skills id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.skills ALTER COLUMN id SET DEFAULT nextval('public.skills_id_seq'::regclass);


--
-- Name: sops id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.sops ALTER COLUMN id SET DEFAULT nextval('public.sops_id_seq'::regclass);


--
-- Name: stock_txns id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.stock_txns ALTER COLUMN id SET DEFAULT nextval('public.stock_txns_id_seq'::regclass);


--
-- Name: suppliers id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.suppliers ALTER COLUMN id SET DEFAULT nextval('public.suppliers_id_seq'::regclass);


--
-- Name: wo_labor id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.wo_labor ALTER COLUMN id SET DEFAULT nextval('public.wo_labor_id_seq'::regclass);


--
-- Name: wo_parts id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.wo_parts ALTER COLUMN id SET DEFAULT nextval('public.wo_parts_id_seq'::regclass);


--
-- Name: work_orders id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.work_orders ALTER COLUMN id SET DEFAULT nextval('public.work_orders_id_seq'::regclass);


--
-- Name: wq_compliance id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.wq_compliance ALTER COLUMN id SET DEFAULT nextval('public.wq_compliance_id_seq'::regclass);


--
-- Name: wq_parameters id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.wq_parameters ALTER COLUMN id SET DEFAULT nextval('public.wq_parameters_id_seq'::regclass);


--
-- Name: wq_plan_rules id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.wq_plan_rules ALTER COLUMN id SET DEFAULT nextval('public.wq_plan_rules_id_seq'::regclass);


--
-- Name: wq_plans id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.wq_plans ALTER COLUMN id SET DEFAULT nextval('public.wq_plans_id_seq'::regclass);


--
-- Name: wq_qc_controls id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.wq_qc_controls ALTER COLUMN id SET DEFAULT nextval('public.wq_qc_controls_id_seq'::regclass);


--
-- Name: wq_results id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.wq_results ALTER COLUMN id SET DEFAULT nextval('public.wq_results_id_seq'::regclass);


--
-- Name: wq_sample_params id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.wq_sample_params ALTER COLUMN id SET DEFAULT nextval('public.wq_sample_params_id_seq'::regclass);


--
-- Name: wq_samples id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.wq_samples ALTER COLUMN id SET DEFAULT nextval('public.wq_samples_id_seq'::regclass);


--
-- Name: wq_sampling_points id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.wq_sampling_points ALTER COLUMN id SET DEFAULT nextval('public.wq_sampling_points_id_seq'::regclass);


--
-- Data for Name: addresses; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.addresses (id, tenant_id, scheme_id, premise_code, street, village, ward, subcounty, city, postcode, country, what3words, meta, created_at, updated_at, deleted_at, location) FROM stdin;
a06b8da0-0ee2-404f-9a07-92a7d24c92d4	a06b8d83-18d4-4241-95c6-66216c4dc431	a06b8d85-2ff6-467b-afc0-7854decad03b	ADDR-001	Kenyatta Avenue, Plot 45	\N	\N	\N	Nairobi	00100	KE	\N	\N	2025-11-22 21:59:40	2025-11-22 21:59:40	\N	0101000020E61000008FC2F5285C8FF4BF8C4AEA0434694240
a06b8da1-1184-4b7e-b885-c57f90162156	a06b8d83-18d4-4241-95c6-66216c4dc431	a06b8d85-2ff6-467b-afc0-7854decad03b	ADDR-002	Waiyaki Way, Westlands	\N	\N	\N	Nairobi	00600	KE	\N	\N	2025-11-22 21:59:40	2025-11-22 21:59:40	\N	0101000020E61000001D5A643BDF4FF4BF48BF7D1D38674240
a06b8da2-1435-4335-b93a-747f5b73cd92	a06b8d83-18d4-4241-95c6-66216c4dc431	a06b8d85-2ff6-467b-afc0-7854decad03b	ADDR-003	Ngong Road, Kilimani Estate	\N	\N	\N	Nairobi	00100	KE	\N	\N	2025-11-22 21:59:41	2025-11-22 21:59:41	\N	0101000020E610000052499D8026C2F4BFC0EC9E3C2C644240
a06b8da3-16a6-4aac-b3fe-0316fee06f7d	a06b8d83-18d4-4241-95c6-66216c4dc431	a06b8d85-2ff6-467b-afc0-7854decad03b	ADDR-004	Industrial Area, Enterprise Road	\N	\N	\N	Nairobi	00100	KE	\N	\N	2025-11-22 21:59:42	2025-11-22 21:59:42	\N	0101000020E61000005EBA490C022BF5BF304CA60A466D4240
a06b8da4-19c6-48cc-a86a-8238ac3f54fe	a06b8d83-18d4-4241-95c6-66216c4dc431	a06b8d85-2ff6-467b-afc0-7854decad03b	ADDR-005	Upperhill, Ralph Bunche Road	\N	\N	\N	Nairobi	00100	KE	\N	\N	2025-11-22 21:59:42	2025-11-22 21:59:42	\N	0101000020E61000006F1283C0CAA1F4BF0E4FAF9465684240
a06b8da5-1cb1-43b8-8c59-7d66f78b4c71	a06b8d83-18d4-4241-95c6-66216c4dc431	a06b8d85-2ff6-467b-afc0-7854decad03b	ADDR-006	Riverside Drive, Westlands	\N	\N	\N	Nairobi	00600	KE	\N	\N	2025-11-22 21:59:43	2025-11-22 21:59:43	\N	0101000020E6100000265305A3923AF4BFC898BB9690674240
a06b9b19-d003-4539-b0f0-02e135755d89	a06b9928-048c-43c7-8284-5885a4aa40f1	\N	HQ-001	Kenyatta Avenue	\N	\N	\N	Garissa	70100	KE	\N	\N	2025-11-22 22:37:21	2025-11-22 22:37:21	\N	0101000020E61000001F85EB51B81EDDBFA4703D0AD7D34340
a06b9b1a-56b9-4474-8210-e51931763ad6	a06b9928-048c-43c7-8284-5885a4aa40f1	\N	WTP-001	Tana River Road	\N	\N	\N	Garissa	70100	KE	\N	\N	2025-11-22 22:37:21	2025-11-22 22:37:21	\N	0101000020E6100000CDCCCCCCCCCCDCBF52B81E85EBD14340
a06b9b1a-d867-4d30-8ee0-34ff7efc5ea6	a06b9928-048c-43c7-8284-5885a4aa40f1	\N	SRC-001	Garissa-Lamu Road	\N	\N	\N	Garissa	70100	KE	\N	\N	2025-11-22 22:37:21	2025-11-22 22:37:21	\N	0101000020E6100000000000000000E0BF6666666666C64340
a06ba6cb-a4f2-4c55-a353-20d84687312d	a06b9928-048c-43c7-8284-5885a4aa40f1	\N	HQ-001	Kenyatta Avenue	\N	\N	\N	Garissa	70100	KE	\N	\N	2025-11-22 23:10:03	2025-11-22 23:10:03	\N	0101000020E61000001F85EB51B81EDDBFA4703D0AD7D34340
a06ba6cc-4110-4198-aee8-281b795e896d	a06b9928-048c-43c7-8284-5885a4aa40f1	\N	WTP-001	Tana River Road	\N	\N	\N	Garissa	70100	KE	\N	\N	2025-11-22 23:10:03	2025-11-22 23:10:03	\N	0101000020E6100000CDCCCCCCCCCCDCBF52B81E85EBD14340
a06ba6cc-c399-453e-8bc3-403a0b6d6ef8	a06b9928-048c-43c7-8284-5885a4aa40f1	\N	SRC-001	Garissa-Lamu Road	\N	\N	\N	Garissa	70100	KE	\N	\N	2025-11-22 23:10:03	2025-11-22 23:10:03	\N	0101000020E6100000000000000000E0BF6666666666C64340
\.


--
-- Data for Name: api_keys; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.api_keys (id, tenant_id, name, hash, scopes, created_by, last_used_at, revoked, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: assessment_attempts; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.assessment_attempts (id, enrollment_id, assessment_id, attempt_number, answers, score, passed, started_at, submitted_at, evidence, assessor_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: assessments; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.assessments (id, course_id, title, type, passing_score, max_attempts, time_limit_min, randomize_questions, show_answers, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: asset_boms; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.asset_boms (id, asset_id, part_id, qty, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: asset_classes; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.asset_classes (id, code, name, parent_id, criticality, attributes_schema, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: asset_locations; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.asset_locations (id, asset_id, effective_from, effective_to, geom, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: asset_meters; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.asset_meters (id, asset_id, kind, unit, multiplier, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: assets; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.assets (id, tenant_id, scheme_id, dma_id, class_id, parent_id, code, name, barcode, serial, manufacturer, model, status, install_date, warranty_expiry, geom, specs, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: attachments; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.attachments (id, tenant_id, entity_type, entity_id, path, kind, title, uploaded_by, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: audit_events; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.audit_events (id, tenant_id, actor_id, actor_type, action, entity_type, entity_id, ip, ua, diff, occurred_at) FROM stdin;
\.


--
-- Data for Name: cache; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.cache (key, value, expiration) FROM stdin;
\.


--
-- Data for Name: cache_locks; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.cache_locks (key, owner, expiration) FROM stdin;
\.


--
-- Data for Name: certificates; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.certificates (id, tenant_id, user_id, course_id, code, qr_token, score, issued_at, expires_at, metadata, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: checklist_runs; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.checklist_runs (id, checklist_id, shift_id, facility_id, performed_by, started_at, completed_at, data, score, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: checklists; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.checklists (id, tenant_id, title, schema, frequency, created_at, updated_at) FROM stdin;
1	a06b8d84-2611-4230-ab4d-856119438db8	Shift Handover Checklist	{"items": [{"text": "Review active events and alarms", "required": true}, {"text": "Check critical asset statuses", "required": true}, {"text": "Review outstanding work orders", "required": true}, {"text": "Brief incoming operator on key issues", "required": true}, {"text": "Sign handover log", "required": true}]}	daily	2025-11-22 22:37:58	2025-11-22 22:37:58
2	a06b8d84-2611-4230-ab4d-856119438db8	Daily System Check	{"items": [{"text": "Verify reservoir levels", "required": true}, {"text": "Check pump station pressures", "required": true}, {"text": "Review water quality readings", "required": true}, {"text": "Inspect chlorine residuals", "required": true}, {"text": "Check DMA flow rates", "required": true}, {"text": "Review energy consumption", "required": false}]}	daily	2025-11-22 22:37:58	2025-11-22 22:37:58
\.


--
-- Data for Name: chemical_stocks; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.chemical_stocks (id, tenant_id, scheme_id, facility_id, chemical, qty_on_hand_kg, reorder_level_kg, max_stock_kg, as_of, unit_cost, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: consents; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.consents (id, user_id, purpose, granted_at, revoked_at, meta, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: courses; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.courses (id, tenant_id, title, code, domain, level, format, credits, duration_min, prerequisites, expiry_days, owner_id, syllabus, description, thumbnail_url, rating, enrollments_count, status, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: crm_balances; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.crm_balances (id, tenant_id, account_no, as_of, balance, aging, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: crm_customer_reads; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.crm_customer_reads (id, meter_id, read_at, value, photo_path, read_source, quality, reader_id, meta, created_at, updated_at, geom) FROM stdin;
\.


--
-- Data for Name: crm_customers; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.crm_customers (id, tenant_id, customer_no, name, id_type, id_no, phone, email, premise_id, contact_address, kyc, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: crm_invoice_lines; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.crm_invoice_lines (id, invoice_id, description, quantity, unit_price, amount, tariff_block, created_at, updated_at) FROM stdin;
\.


--
-- Data f