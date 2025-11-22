pg_dump: last built-in OID is 16383
pg_dump: reading extensions
pg_dump: identifying extension members
pg_dump: reading schemas
pg_dump: reading user-defined tables
pg_dump: reading user-defined functions
pg_dump: reading user-defined types
pg_dump: reading procedural languages
pg_dump: reading user-defined aggregate functions
pg_dump: reading user-defined operators
pg_dump: reading user-defined access methods
pg_dump: reading user-defined operator classes
pg_dump: reading user-defined operator families
pg_dump: reading user-defined text search parsers
pg_dump: reading user-defined text search templates
pg_dump: reading user-defined text search dictionaries
pg_dump: reading user-defined text search configurations
pg_dump: reading user-defined foreign-data wrappers
pg_dump: reading user-defined foreign servers
pg_dump: reading default privileges
pg_dump: reading user-defined collations
pg_dump: reading user-defined conversions
pg_dump: reading type casts
pg_dump: reading transforms
pg_dump: reading table inheritance information
pg_dump: reading event triggers
pg_dump: finding extension tables
pg_dump: finding inheritance relationships
pg_dump: reading column info for interesting tables
pg_dump: finding table default expressions
pg_dump: finding table check constraints
pg_dump: flagging inherited columns in subtables
pg_dump: reading partitioning data
pg_dump: reading indexes
pg_dump: flagging indexes in partitioned tables
pg_dump: reading extended statistics
pg_dump: reading constraints
pg_dump: reading triggers
pg_dump: reading rewrite rules
pg_dump: reading policies
pg_dump: reading row-level security policies
pg_dump: reading publications
pg_dump: reading publication membership of tables
pg_dump: reading publication membership of schemas
pg_dump: reading subscriptions
pg_dump: reading large objects
pg_dump: reading dependency data
pg_dump: saving encoding = UTF8
pg_dump: saving standard_conforming_strings = on
pg_dump: saving search_path = 
pg_dump: creating EXTENSION "postgis"
pg_dump: creating COMMENT "EXTENSION postgis"
pg_dump: creating TABLE "public.addresses"
pg_dump: creating TABLE "public.api_keys"
pg_dump: creating TABLE "public.assessment_attempts"
pg_dump: creating SEQUENCE "public.assessment_attempts_id_seq"
pg_dump: creating SEQUENCE OWNED BY "public.assessment_attempts_id_seq"
pg_dump: creating TABLE "public.assessments"
--
-- PostgreSQL database dump
--

\restrict Xutv7XfT7g2aWg5IDX3THTmgomjFg8hqSclxlKjjc4B5JBtGJuPRwcNMVx7K6S7

-- Dumped from database version 16.9 (415ebe8)
-- Dumped by pg_dump version 16.10

-- Started on 2025-11-22 20:14:22 UTC

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
-- TOC entry 2 (class 3079 OID 16480)
-- Name: postgis; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS postgis WITH SCHEMA public;


--
-- TOC entry 5888 (class 0 OID 0)
-- Dependencies: 2
-- Name: EXTENSION postgis; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION postgis IS 'PostGIS geometry and geography spatial types and functions';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 240 (class 1259 OID 336093)
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
-- TOC entry 307 (class 1259 OID 337124)
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
-- TOC entry 261 (class 1259 OID 336404)
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
-- TOC entry 260 (class 1259 OID 336403)
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
-- TOC entry 5889 (class 0 OID 0)
-- Dependencies: 260
-- Name: assessment_attempts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.assessment_attempts_id_seq OWNED BY public.assessment_attempts.id;


--
-- TOC entry 257 (class 1259 OID 336370)
-- Name: assessments; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.assessments (
    id bigint NOT NULL,
    course_id bigint NOT NULL,
    title character varying(255) NOT NULL,
    type character varying(255) NOT NUpg_dump: creating SEQUENCE "public.assessments_id_seq"
pg_dump: creating SEQUENCE OWNED BY "public.assessments_id_seq"
pg_dump: creating TABLE "public.asset_boms"
pg_dump: creating SEQUENCE "public.asset_boms_id_seq"
pg_dump: creating SEQUENCE OWNED BY "public.asset_boms_id_seq"
pg_dump: creating TABLE "public.asset_classes"
pg_dump: creating SEQUENCE "public.asset_classes_id_seq"
pg_dump: creating SEQUENCE OWNED BY "public.asset_classes_id_seq"
pg_dump: creating TABLE "public.asset_locations"
pg_dump: creating SEQUENCE "public.asset_locations_id_seq"
pg_dump: creating SEQUENCE OWNED BY "public.asset_locations_id_seq"
LL,
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
-- TOC entry 256 (class 1259 OID 336369)
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
-- TOC entry 5890 (class 0 OID 0)
-- Dependencies: 256
-- Name: assessments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.assessments_id_seq OWNED BY public.assessments.id;


--
-- TOC entry 298 (class 1259 OID 337011)
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
-- TOC entry 297 (class 1259 OID 337010)
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
-- TOC entry 5891 (class 0 OID 0)
-- Dependencies: 297
-- Name: asset_boms_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.asset_boms_id_seq OWNED BY public.asset_boms.id;


--
-- TOC entry 286 (class 1259 OID 336873)
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
-- TOC entry 285 (class 1259 OID 336872)
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
-- TOC entry 5892 (class 0 OID 0)
-- Dependencies: 285
-- Name: asset_classes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.asset_classes_id_seq OWNED BY public.asset_classes.id;


--
-- TOC entry 290 (class 1259 OID 336941)
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
-- TOC entry 289 (class 1259 OID 336940)
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
-- TOC entry 5893 (class 0 OID 0)
-- Dependencies: 289
-- Name: asset_locations_id_seq; Type: SEQUENCE pg_dump: creating TABLE "public.asset_meters"
pg_dump: creating SEQUENCE "public.asset_meters_id_seq"
pg_dump: creating SEQUENCE OWNED BY "public.asset_meters_id_seq"
pg_dump: creating TABLE "public.assets"
pg_dump: creating SEQUENCE "public.assets_id_seq"
pg_dump: creating SEQUENCE OWNED BY "public.assets_id_seq"
pg_dump: creating TABLE "public.attachments"
pg_dump: creating TABLE "public.audit_events"
pg_dump: creating TABLE "public.cache"
OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.asset_locations_id_seq OWNED BY public.asset_locations.id;


--
-- TOC entry 292 (class 1259 OID 336958)
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
-- TOC entry 291 (class 1259 OID 336957)
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
-- TOC entry 5894 (class 0 OID 0)
-- Dependencies: 291
-- Name: asset_meters_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.asset_meters_id_seq OWNED BY public.asset_meters.id;


--
-- TOC entry 288 (class 1259 OID 336893)
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
-- TOC entry 287 (class 1259 OID 336892)
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
-- TOC entry 5895 (class 0 OID 0)
-- Dependencies: 287
-- Name: assets_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.assets_id_seq OWNED BY public.assets.id;


--
-- TOC entry 242 (class 1259 OID 336123)
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
-- TOC entry 324 (class 1259 OID 337355)
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
-- TOC entry 226 (class 1259 OID 335906)
-- Name: cache; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE pg_dump: creating TABLE "public.cache_locks"
pg_dump: creating TABLE "public.certificates"
pg_dump: creating SEQUENCE "public.certificates_id_seq"
pg_dump: creating SEQUENCE OWNED BY "public.certificates_id_seq"
pg_dump: creating TABLE "public.checklist_runs"
pg_dump: creating SEQUENCE "public.checklist_runs_id_seq"
pg_dump: creating SEQUENCE OWNED BY "public.checklist_runs_id_seq"
pg_dump: creating TABLE "public.checklists"
pg_dump: creating SEQUENCE "public.checklists_id_seq"
pg_dump: creating SEQUENCE OWNED BY "public.checklists_id_seq"
public.cache (
    key character varying(255) NOT NULL,
    value text NOT NULL,
    expiration integer NOT NULL
);


ALTER TABLE public.cache OWNER TO neondb_owner;

--
-- TOC entry 227 (class 1259 OID 335913)
-- Name: cache_locks; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.cache_locks (
    key character varying(255) NOT NULL,
    owner character varying(255) NOT NULL,
    expiration integer NOT NULL
);


ALTER TABLE public.cache_locks OWNER TO neondb_owner;

--
-- TOC entry 263 (class 1259 OID 336432)
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
-- TOC entry 262 (class 1259 OID 336431)
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
-- TOC entry 5896 (class 0 OID 0)
-- Dependencies: 262
-- Name: certificates_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.certificates_id_seq OWNED BY public.certificates.id;


--
-- TOC entry 333 (class 1259 OID 337470)
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
-- TOC entry 332 (class 1259 OID 337469)
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
-- TOC entry 5897 (class 0 OID 0)
-- Dependencies: 332
-- Name: checklist_runs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.checklist_runs_id_seq OWNED BY public.checklist_runs.id;


--
-- TOC entry 331 (class 1259 OID 337452)
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
-- TOC entry 330 (class 1259 OID 337451)
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
-- TOC entry 5898 (class 0 OID 0)
-- Dependencies: 330
-- Name: checklists_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.checklists_id_seq Opg_dump: creating TABLE "public.chemical_stocks"
pg_dump: creating TABLE "public.consents"
pg_dump: creating TABLE "public.courses"
pg_dump: creating SEQUENCE "public.courses_id_seq"
pg_dump: creating SEQUENCE OWNED BY "public.courses_id_seq"
pg_dump: creating TABLE "public.crm_balances"
pg_dump: creating SEQUENCE "public.crm_balances_id_seq"
pg_dump: creating SEQUENCE OWNED BY "public.crm_balances_id_seq"
pg_dump: creating TABLE "public.crm_customer_reads"
WNED BY public.checklists.id;


--
-- TOC entry 391 (class 1259 OID 338460)
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
-- TOC entry 322 (class 1259 OID 337317)
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
-- TOC entry 249 (class 1259 OID 336265)
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
-- TOC entry 248 (class 1259 OID 336264)
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
-- TOC entry 5899 (class 0 OID 0)
-- Dependencies: 248
-- Name: courses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.courses_id_seq OWNED BY public.courses.id;


--
-- TOC entry 381 (class 1259 OID 338243)
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
-- TOC entry 380 (class 1259 OID 338242)
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
-- TOC entry 5900 (class 0 OID 0)
-- Dependencies: 380
-- Name: crm_balances_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.crm_balances_id_seq OWNED BY public.crm_balances.id;


--
-- TOC entry 385 (class 1259 OID 338282)
-- Name: crm_customer_reads; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.crm_customer_reads (
    id bigint NOT NULL,
    meter_id bigint NOT NULL,
    read_at timestamppg_dump: creating SEQUENCE "public.crm_customer_reads_id_seq"
pg_dump: creating SEQUENCE OWNED BY "public.crm_customer_reads_id_seq"
pg_dump: creating TABLE "public.crm_customers"
pg_dump: creating SEQUENCE "public.crm_customers_id_seq"
pg_dump: creating SEQUENCE OWNED BY "public.crm_customers_id_seq"
pg_dump: creating TABLE "public.crm_invoice_lines"
pg_dump: creating SEQUENCE "public.crm_invoice_lines_id_seq"
pg_dump: creating SEQUENCE OWNED BY "public.crm_invoice_lines_id_seq"
(0) with time zone NOT NULL,
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
-- TOC entry 384 (class 1259 OID 338281)
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
-- TOC entry 5901 (class 0 OID 0)
-- Dependencies: 384
-- Name: crm_customer_reads_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.crm_customer_reads_id_seq OWNED BY public.crm_customer_reads.id;


--
-- TOC entry 371 (class 1259 OID 338145)
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
-- TOC entry 370 (class 1259 OID 338144)
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
-- TOC entry 5902 (class 0 OID 0)
-- Dependencies: 370
-- Name: crm_customers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.crm_customers_id_seq OWNED BY public.crm_customers.id;


--
-- TOC entry 377 (class 1259 OID 338208)
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
-- TOC entry 376 (class 1259 OID 338207)
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
-- TOC entry 5903 (class 0 OID 0)
-- Dependencies: 376
-- Name: crm_invoice_lines_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.crm_invoice_lines_id_seq OWNED BY public.crm_invoice_lines.pg_dump: creating TABLE "public.crm_invoices"
pg_dump: creating SEQUENCE "public.crm_invoices_id_seq"
pg_dump: creating SEQUENCE OWNED BY "public.crm_invoices_id_seq"
pg_dump: creating TABLE "public.crm_meters"
pg_dump: creating SEQUENCE "public.crm_meters_id_seq"
pg_dump: creating SEQUENCE OWNED BY "public.crm_meters_id_seq"
pg_dump: creating TABLE "public.crm_payment_plans"
pg_dump: creating SEQUENCE "public.crm_payment_plans_id_seq"
id;


--
-- TOC entry 375 (class 1259 OID 338189)
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
-- TOC entry 374 (class 1259 OID 338188)
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
-- TOC entry 5904 (class 0 OID 0)
-- Dependencies: 374
-- Name: crm_invoices_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.crm_invoices_id_seq OWNED BY public.crm_invoices.id;


--
-- TOC entry 367 (class 1259 OID 338094)
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
-- TOC entry 366 (class 1259 OID 338093)
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
-- TOC entry 5905 (class 0 OID 0)
-- Dependencies: 366
-- Name: crm_meters_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.crm_meters_id_seq OWNED BY public.crm_meters.id;


--
-- TOC entry 383 (class 1259 OID 338263)
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
-- TOC entry 382 (class 1259 OID 338262)
-- Name: crm_payment_plans_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.crm_payment_plans_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUpg_dump: creating SEQUENCE OWNED BY "public.crm_payment_plans_id_seq"
pg_dump: creating TABLE "public.crm_payments"
pg_dump: creating SEQUENCE "public.crm_payments_id_seq"
pg_dump: creating SEQUENCE OWNED BY "public.crm_payments_id_seq"
pg_dump: creating TABLE "public.crm_premises"
pg_dump: creating SEQUENCE "public.crm_premises_id_seq"
pg_dump: creating SEQUENCE OWNED BY "public.crm_premises_id_seq"
pg_dump: creating TABLE "public.crm_ra_rules"
ENCE public.crm_payment_plans_id_seq OWNER TO neondb_owner;

--
-- TOC entry 5906 (class 0 OID 0)
-- Dependencies: 382
-- Name: crm_payment_plans_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.crm_payment_plans_id_seq OWNED BY public.crm_payment_plans.id;


--
-- TOC entry 379 (class 1259 OID 338223)
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
-- TOC entry 378 (class 1259 OID 338222)
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
-- TOC entry 5907 (class 0 OID 0)
-- Dependencies: 378
-- Name: crm_payments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.crm_payments_id_seq OWNED BY public.crm_payments.id;


--
-- TOC entry 365 (class 1259 OID 338060)
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
-- TOC entry 364 (class 1259 OID 338059)
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
-- TOC entry 5908 (class 0 OID 0)
-- Dependencies: 364
-- Name: crm_premises_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.crm_premises_id_seq OWNED BY public.crm_premises.id;


--
-- TOC entry 387 (class 1259 OID 338309)
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


ALTER TApg_dump: creating SEQUENCE "public.crm_ra_rules_id_seq"
pg_dump: creating SEQUENCE OWNED BY "public.crm_ra_rules_id_seq"
pg_dump: creating TABLE "public.crm_service_connections"
pg_dump: creating SEQUENCE "public.crm_service_connections_id_seq"
pg_dump: creating SEQUENCE OWNED BY "public.crm_service_connections_id_seq"
pg_dump: creating TABLE "public.crm_tariffs"
pg_dump: creating SEQUENCE "public.crm_tariffs_id_seq"
pg_dump: creating SEQUENCE OWNED BY "public.crm_tariffs_id_seq"
pg_dump: creating TABLE "public.data_catalog"
BLE public.crm_ra_rules OWNER TO neondb_owner;

--
-- TOC entry 386 (class 1259 OID 338308)
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
-- TOC entry 5909 (class 0 OID 0)
-- Dependencies: 386
-- Name: crm_ra_rules_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.crm_ra_rules_id_seq OWNED BY public.crm_ra_rules.id;


--
-- TOC entry 369 (class 1259 OID 338117)
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
-- TOC entry 368 (class 1259 OID 338116)
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
-- TOC entry 5910 (class 0 OID 0)
-- Dependencies: 368
-- Name: crm_service_connections_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.crm_service_connections_id_seq OWNED BY public.crm_service_connections.id;


--
-- TOC entry 373 (class 1259 OID 338171)
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
-- TOC entry 372 (class 1259 OID 338170)
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
-- TOC entry 5911 (class 0 OID 0)
-- Dependencies: 372
-- Name: crm_tariffs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.crm_tariffs_id_seq OWNED BY public.crm_tariffs.id;


--
-- TOC entry 320 (class 1259 OID 337291)
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
    created_at timestamp(0) without time zonepg_dump: creating TABLE "public.data_classes"
pg_dump: creating TABLE "public.device_trust"
pg_dump: creating TABLE "public.dmas"
pg_dump: creating TABLE "public.dose_change_logs"
pg_dump: creating TABLE "public.dose_plans"
pg_dump: creating TABLE "public.dsr_requests"
pg_dump: creating TABLE "public.employee_skills"
,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.data_catalog OWNER TO neondb_owner;

--
-- TOC entry 319 (class 1259 OID 337282)
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
-- TOC entry 318 (class 1259 OID 337247)
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
-- TOC entry 237 (class 1259 OID 336027)
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
-- TOC entry 392 (class 1259 OID 338485)
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
-- TOC entry 390 (class 1259 OID 338435)
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
-- TOC entry 323 (class 1259 OID 337330)
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
-- TOC entry 271 (class 1259 OID 336535)
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
pg_dump: creating SEQUENCE "public.employee_skills_id_seq"
pg_dump: creating SEQUENCE OWNED BY "public.employee_skills_id_seq"
pg_dump: creating TABLE "public.enrollments"
pg_dump: creating SEQUENCE "public.enrollments_id_seq"
pg_dump: creating SEQUENCE OWNED BY "public.enrollments_id_seq"
pg_dump: creating TABLE "public.escalation_policies"
pg_dump: creating SEQUENCE "public.escalation_policies_id_seq"
pg_dump: creating SEQUENCE OWNED BY "public.escalation_policies_id_seq"
pg_dump: creating TABLE "public.event_actions"
pg_dump: creating SEQUENCE "public.event_actions_id_seq"
pg_dump: creating SEQUENCE OWNED BY "public.event_actions_id_seq"
pg_dump: creating TABLE "public.event_links"
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.employee_skills OWNER TO neondb_owner;

--
-- TOC entry 270 (class 1259 OID 336534)
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
-- TOC entry 5912 (class 0 OID 0)
-- Dependencies: 270
-- Name: employee_skills_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.employee_skills_id_seq OWNED BY public.employee_skills.id;


--
-- TOC entry 253 (class 1259 OID 336321)
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
-- TOC entry 252 (class 1259 OID 336320)
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
-- TOC entry 5913 (class 0 OID 0)
-- Dependencies: 252
-- Name: enrollments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.enrollments_id_seq OWNED BY public.enrollments.id;


--
-- TOC entry 343 (class 1259 OID 337605)
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
-- TOC entry 342 (class 1259 OID 337604)
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
-- TOC entry 5914 (class 0 OID 0)
-- Dependencies: 342
-- Name: escalation_policies_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.escalation_policies_id_seq OWNED BY public.escalation_policies.id;


--
-- TOC entry 341 (class 1259 OID 337583)
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
-- TOC entry 340 (class 1259 OID 337582)
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
-- TOC entry 5915 (class 0 OID 0)
-- Dependencies: 340
-- Name: event_actions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.event_actions_id_seq OWNED BY public.event_actions.id;


-pg_dump: creating SEQUENCE "public.event_links_id_seq"
pg_dump: creating SEQUENCE OWNED BY "public.event_links_id_seq"
pg_dump: creating TABLE "public.events"
pg_dump: creating SEQUENCE "public.events_id_seq"
pg_dump: creating SEQUENCE OWNED BY "public.events_id_seq"
pg_dump: creating TABLE "public.facilities"
-
-- TOC entry 337 (class 1259 OID 337550)
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
-- TOC entry 336 (class 1259 OID 337549)
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
-- TOC entry 5916 (class 0 OID 0)
-- Dependencies: 336
-- Name: event_links_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.event_links_id_seq OWNED BY public.event_links.id;


--
-- TOC entry 335 (class 1259 OID 337504)
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
-- TOC entry 334 (class 1259 OID 337503)
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
-- TOC entry 5917 (class 0 OID 0)
-- Dependencies: 334
-- Name: events_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.events_id_seq OWNED BY public.events.id;


--
-- TOC entry 236 (class 1259 OID 336004)
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
    CONSTRAINT facilities_category_check CHECK (((category)::text = ANY ((ARRAY['source'::character varying, 'treatment'::character varying, 'pumpstation'::character varyinpg_dump: creating TABLE "public.failed_jobs"
pg_dump: creating SEQUENCE "public.failed_jobs_id_seq"
pg_dump: creating SEQUENCE OWNED BY "public.failed_jobs_id_seq"
pg_dump: creating TABLE "public.failures"
pg_dump: creating SEQUENCE "public.failures_id_seq"
pg_dump: creating SEQUENCE OWNED BY "public.failures_id_seq"
pg_dump: creating TABLE "public.interventions"
pg_dump: creating TABLE "public.job_batches"
pg_dump: creating TABLE "public.jobs"
g, 'reservoir'::character varying, 'office'::character varying, 'workshop'::character varying, 'warehouse'::character varying, 'lab'::character varying])::text[]))),
    CONSTRAINT facilities_status_check CHECK (((status)::text = ANY ((ARRAY['active'::character varying, 'standby'::character varying, 'decommissioned'::character varying])::text[])))
);


ALTER TABLE public.facilities OWNER TO neondb_owner;

--
-- TOC entry 232 (class 1259 OID 335938)
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
-- TOC entry 231 (class 1259 OID 335937)
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
-- TOC entry 5918 (class 0 OID 0)
-- Dependencies: 231
-- Name: failed_jobs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.failed_jobs_id_seq OWNED BY public.failed_jobs.id;


--
-- TOC entry 315 (class 1259 OID 337213)
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
-- TOC entry 314 (class 1259 OID 337212)
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
-- TOC entry 5919 (class 0 OID 0)
-- Dependencies: 314
-- Name: failures_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.failures_id_seq OWNED BY public.failures.id;


--
-- TOC entry 389 (class 1259 OID 338409)
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
-- TOC entry 230 (class 1259 OID 335930)
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
-- TOC entry 229 (class 1259 OID 335921)
-- Name: jpg_dump: creating SEQUENCE "public.jobs_id_seq"
pg_dump: creating SEQUENCE OWNED BY "public.jobs_id_seq"
pg_dump: creating TABLE "public.kb_articles"
pg_dump: creating SEQUENCE "public.kb_articles_id_seq"
pg_dump: creating SEQUENCE OWNED BY "public.kb_articles_id_seq"
pg_dump: creating TABLE "public.kms_keys"
pg_dump: creating TABLE "public.lesson_progress"
pg_dump: creating SEQUENCE "public.lesson_progress_id_seq"
pg_dump: creating SEQUENCE OWNED BY "public.lesson_progress_id_seq"
pg_dump: creating TABLE "public.lessons"
obs; Type: TABLE; Schema: public; Owner: neondb_owner
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
-- TOC entry 228 (class 1259 OID 335920)
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
-- TOC entry 5920 (class 0 OID 0)
-- Dependencies: 228
-- Name: jobs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.jobs_id_seq OWNED BY public.jobs.id;


--
-- TOC entry 265 (class 1259 OID 336462)
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
-- TOC entry 264 (class 1259 OID 336461)
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
-- TOC entry 5921 (class 0 OID 0)
-- Dependencies: 264
-- Name: kb_articles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.kb_articles_id_seq OWNED BY public.kb_articles.id;


--
-- TOC entry 326 (class 1259 OID 337386)
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
-- TOC entry 255 (class 1259 OID 336349)
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
-- TOC entry 254 (class 1259 OID 336348)
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
-- TOC entry 5922 (class 0 OID 0)
-- Dependencies: 254
-- Name: lesson_progress_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.lesson_progress_id_seq OWNED BY public.lesson_progress.id;


--
-- TOC entry 251 (class 1259 OID 336303)
-- Name: lessons; Type: TABLE; Schema: public; Owner:pg_dump: creating SEQUENCE "public.lessons_id_seq"
pg_dump: creating SEQUENCE OWNED BY "public.lessons_id_seq"
pg_dump: creating TABLE "public.lookup_values"
pg_dump: creating TABLE "public.map_layer_configs"
pg_dump: creating TABLE "public.meter_captures"
pg_dump: creating SEQUENCE "public.meter_captures_id_seq"
pg_dump: creating SEQUENCE OWNED BY "public.meter_captures_id_seq"
pg_dump: creating TABLE "public.migrations"
pg_dump: creating SEQUENCE "public.migrations_id_seq"
pg_dump: creating SEQUENCE OWNED BY "public.migrations_id_seq"
 neondb_owner
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
-- TOC entry 250 (class 1259 OID 336302)
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
-- TOC entry 5923 (class 0 OID 0)
-- Dependencies: 250
-- Name: lessons_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.lessons_id_seq OWNED BY public.lessons.id;


--
-- TOC entry 241 (class 1259 OID 336112)
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
-- TOC entry 247 (class 1259 OID 336246)
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
-- TOC entry 294 (class 1259 OID 336972)
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
-- TOC entry 293 (class 1259 OID 336971)
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
-- TOC entry 5924 (class 0 OID 0)
-- Dependencies: 293
-- Name: meter_captures_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.meter_captures_id_seq OWNED BY public.meter_captures.id;


--
-- TOC entry 222 (class 1259 OID 335873)
-- Name: migrations; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.migrations (
    id integer NOT NULL,
    migration character varying(255) NOT NULL,
    batch integer NOT NULL
);


ALTER TABLE public.migrations OWNER TO neondb_owner;

--
-- TOC entry 221 (class 1259 OID 335872)
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
-- TOpg_dump: creating TABLE "public.model_has_permissions"
pg_dump: creating TABLE "public.model_has_roles"
pg_dump: creating TABLE "public.network_nodes"
pg_dump: creating TABLE "public.notifications"
pg_dump: creating SEQUENCE "public.notifications_id_seq"
pg_dump: creating SEQUENCE OWNED BY "public.notifications_id_seq"
pg_dump: creating TABLE "public.nrw_snapshots"
pg_dump: creating TABLE "public.oncall_schedules"
C entry 5925 (class 0 OID 0)
-- Dependencies: 221
-- Name: migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.migrations_id_seq OWNED BY public.migrations.id;


--
-- TOC entry 280 (class 1259 OID 336648)
-- Name: model_has_permissions; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.model_has_permissions (
    permission_id bigint NOT NULL,
    model_type character varying(255) NOT NULL,
    model_id bigint NOT NULL
);


ALTER TABLE public.model_has_permissions OWNER TO neondb_owner;

--
-- TOC entry 281 (class 1259 OID 336664)
-- Name: model_has_roles; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.model_has_roles (
    role_id bigint NOT NULL,
    model_type character varying(255) NOT NULL,
    model_id bigint NOT NULL
);


ALTER TABLE public.model_has_roles OWNER TO neondb_owner;

--
-- TOC entry 394 (class 1259 OID 338532)
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
-- TOC entry 345 (class 1259 OID 337620)
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
-- TOC entry 344 (class 1259 OID 337619)
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
-- TOC entry 5926 (class 0 OID 0)
-- Dependencies: 344
-- Name: notifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.notifications_id_seq OWNED BY public.notifications.id;


--
-- TOC entry 388 (class 1259 OID 338384)
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
-- TOC entry 275 (class 1259 OID 336584)
-- Name: oncall_schedules; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE publicpg_dump: creating SEQUENCE "public.oncall_schedules_id_seq"
pg_dump: creating SEQUENCE OWNED BY "public.oncall_schedules_id_seq"
pg_dump: creating TABLE "public.organizations"
pg_dump: creating TABLE "public.outages"
pg_dump: creating TABLE "public.parts"
pg_dump: creating SEQUENCE "public.parts_id_seq"
pg_dump: creating SEQUENCE OWNED BY "public.parts_id_seq"
pg_dump: creating TABLE "public.password_reset_tokens"
.oncall_schedules (
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
-- TOC entry 274 (class 1259 OID 336583)
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
-- TOC entry 5927 (class 0 OID 0)
-- Dependencies: 274
-- Name: oncall_schedules_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.oncall_schedules_id_seq OWNED BY public.oncall_schedules.id;


--
-- TOC entry 234 (class 1259 OID 335963)
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
-- TOC entry 395 (class 1259 OID 338552)
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
-- TOC entry 296 (class 1259 OID 336989)
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
-- TOC entry 295 (class 1259 OID 336988)
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
-- TOC entry 5928 (class 0 OID 0)
-- Dependencies: 295
-- Name: parts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.parts_id_seq OWNED BY public.parts.id;


--
-- TOC entry 224 (class 1259 OID 335890)
-- Name: password_reset_tokens; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.password_reset_tokens (
    email character varying(255) NOT NULL,
    token character varying(255) NOT NULL,
    created_at timestamp(0) without time pg_dump: creating TABLE "public.permissions"
pg_dump: creating SEQUENCE "public.permissions_id_seq"
pg_dump: creating SEQUENCE OWNED BY "public.permissions_id_seq"
pg_dump: creating TABLE "public.personal_access_tokens"
pg_dump: creating SEQUENCE "public.personal_access_tokens_id_seq"
pg_dump: creating SEQUENCE OWNED BY "public.personal_access_tokens_id_seq"
pg_dump: creating TABLE "public.pipelines"
pg_dump: creating TABLE "public.playbooks"
pg_dump: creating SEQUENCE "public.playbooks_id_seq"
zone
);


ALTER TABLE public.password_reset_tokens OWNER TO neondb_owner;

--
-- TOC entry 277 (class 1259 OID 336612)
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
-- TOC entry 276 (class 1259 OID 336610)
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
-- TOC entry 5929 (class 0 OID 0)
-- Dependencies: 276
-- Name: permissions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.permissions_id_seq OWNED BY public.permissions.id;


--
-- TOC entry 284 (class 1259 OID 336691)
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
-- TOC entry 283 (class 1259 OID 336690)
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
-- TOC entry 5930 (class 0 OID 0)
-- Dependencies: 283
-- Name: personal_access_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.personal_access_tokens_id_seq OWNED BY public.personal_access_tokens.id;


--
-- TOC entry 238 (class 1259 OID 336049)
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
-- TOC entry 339 (class 1259 OID 337566)
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
-- TOC entry 338 (class 1259 OID 337565)
-- Name: playbooks_id_seq; Type: SEQUpg_dump: creating SEQUENCE OWNED BY "public.playbooks_id_seq"
pg_dump: creating TABLE "public.pm_policies"
pg_dump: creating SEQUENCE "public.pm_policies_id_seq"
pg_dump: creating SEQUENCE OWNED BY "public.pm_policies_id_seq"
pg_dump: creating TABLE "public.pm_schedules"
pg_dump: creating SEQUENCE "public.pm_schedules_id_seq"
pg_dump: creating SEQUENCE OWNED BY "public.pm_schedules_id_seq"
pg_dump: creating TABLE "public.pump_schedules"
ENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.playbooks_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.playbooks_id_seq OWNER TO neondb_owner;

--
-- TOC entry 5931 (class 0 OID 0)
-- Dependencies: 338
-- Name: playbooks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.playbooks_id_seq OWNED BY public.playbooks.id;


--
-- TOC entry 302 (class 1259 OID 337047)
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
-- TOC entry 301 (class 1259 OID 337046)
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
-- TOC entry 5932 (class 0 OID 0)
-- Dependencies: 301
-- Name: pm_policies_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.pm_policies_id_seq OWNED BY public.pm_policies.id;


--
-- TOC entry 304 (class 1259 OID 337066)
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
-- TOC entry 303 (class 1259 OID 337065)
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
-- TOC entry 5933 (class 0 OID 0)
-- Dependencies: 303
-- Name: pm_schedules_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.pm_schedules_id_seq OWNED BY public.pm_schedules.id;


--
-- TOC entry 393 (class 1259 OID 338503)
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
    CONSTRAINT pump_schedupg_dump: creating TABLE "public.questions"
pg_dump: creating SEQUENCE "public.questions_id_seq"
pg_dump: creating SEQUENCE OWNED BY "public.questions_id_seq"
pg_dump: creating TABLE "public.redlines"
pg_dump: creating TABLE "public.retention_policies"
pg_dump: creating TABLE "public.role_has_permissions"
pg_dump: creating TABLE "public.roles"
pg_dump: creating SEQUENCE "public.roles_id_seq"
pg_dump: creating SEQUENCE OWNED BY "public.roles_id_seq"
les_status_check CHECK (((status)::text = ANY ((ARRAY['scheduled'::character varying, 'running'::character varying, 'completed'::character varying, 'cancelled'::character varying])::text[])))
);


ALTER TABLE public.pump_schedules OWNER TO neondb_owner;

--
-- TOC entry 259 (class 1259 OID 336388)
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
-- TOC entry 258 (class 1259 OID 336387)
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
-- TOC entry 5934 (class 0 OID 0)
-- Dependencies: 258
-- Name: questions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.questions_id_seq OWNED BY public.questions.id;


--
-- TOC entry 244 (class 1259 OID 336167)
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
-- TOC entry 321 (class 1259 OID 337308)
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
-- TOC entry 282 (class 1259 OID 336675)
-- Name: role_has_permissions; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.role_has_permissions (
    permission_id bigint NOT NULL,
    role_id bigint NOT NULL
);


ALTER TABLE public.role_has_permissions OWNER TO neondb_owner;

--
-- TOC entry 279 (class 1259 OID 336626)
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
-- TOC entry 278 (class 1259 OID 336625)
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
-- TOC entry 5935 (class 0 OID 0)
-- Dependencies: 278
-- Name: roles_id_seq; Type: SEQUENCE OWNED BY; Schema: pg_dump: creating TABLE "public.rosters"
pg_dump: creating SEQUENCE "public.rosters_id_seq"
pg_dump: creating SEQUENCE OWNED BY "public.rosters_id_seq"
pg_dump: creating TABLE "public.schemes"
pg_dump: creating TABLE "public.secrets"
pg_dump: creating TABLE "public.security_alerts"
pg_dump: creating TABLE "public.sessions"
pg_dump: creating TABLE "public.shift_entries"
public; Owner: neondb_owner
--

ALTER SEQUENCE public.roles_id_seq OWNED BY public.roles.id;


--
-- TOC entry 273 (class 1259 OID 336568)
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
-- TOC entry 272 (class 1259 OID 336567)
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
-- TOC entry 5936 (class 0 OID 0)
-- Dependencies: 272
-- Name: rosters_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.rosters_id_seq OWNED BY public.rosters.id;


--
-- TOC entry 235 (class 1259 OID 335979)
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
-- TOC entry 327 (class 1259 OID 337394)
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
-- TOC entry 325 (class 1259 OID 337371)
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
-- TOC entry 225 (class 1259 OID 335897)
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
-- TOC entry 329 (class 1259 OID 337427)
-- Name: shift_entries; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.shift_entries (
    id bigint NOT NULL,
    shift_id bigint NOTpg_dump: creating SEQUENCE "public.shift_entries_id_seq"
pg_dump: creating SEQUENCE OWNED BY "public.shift_entries_id_seq"
pg_dump: creating TABLE "public.shifts"
pg_dump: creating SEQUENCE "public.shifts_id_seq"
pg_dump: creating SEQUENCE OWNED BY "public.shifts_id_seq"
pg_dump: creating TABLE "public.skills"
pg_dump: creating SEQUENCE "public.skills_id_seq"
pg_dump: creating SEQUENCE OWNED BY "public.skills_id_seq"
pg_dump: creating TABLE "public.sops"
 NULL,
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
-- TOC entry 328 (class 1259 OID 337426)
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
-- TOC entry 5937 (class 0 OID 0)
-- Dependencies: 328
-- Name: shift_entries_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.shift_entries_id_seq OWNED BY public.shift_entries.id;


--
-- TOC entry 317 (class 1259 OID 337237)
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
-- TOC entry 316 (class 1259 OID 337236)
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
-- TOC entry 5938 (class 0 OID 0)
-- Dependencies: 316
-- Name: shifts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.shifts_id_seq OWNED BY public.shifts.id;


--
-- TOC entry 269 (class 1259 OID 336518)
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
-- TOC entry 268 (class 1259 OID 336517)
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
-- TOC entry 5939 (class 0 OID 0)
-- Dependencies: 268
-- Name: skills_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.skills_id_seq OWNED BY public.skills.id;


--
-- TOC entry 267 (class 1259 OID 336493)
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
    nepg_dump: creating SEQUENCE "public.sops_id_seq"
pg_dump: creating SEQUENCE OWNED BY "public.sops_id_seq"
pg_dump: creating TABLE "public.spatial_change_log"
pg_dump: creating TABLE "public.spatial_edit_layers"
pg_dump: creating TABLE "public.stock_txns"
pg_dump: creating SEQUENCE "public.stock_txns_id_seq"
pg_dump: creating SEQUENCE OWNED BY "public.stock_txns_id_seq"
pg_dump: creating TABLE "public.suppliers"
xt_review_due timestamp(0) without time zone,
    approver_id uuid,
    attestations json,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    deleted_at timestamp(0) without time zone
);


ALTER TABLE public.sops OWNER TO neondb_owner;

--
-- TOC entry 266 (class 1259 OID 336492)
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
-- TOC entry 5940 (class 0 OID 0)
-- Dependencies: 266
-- Name: sops_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.sops_id_seq OWNED BY public.sops.id;


--
-- TOC entry 246 (class 1259 OID 336222)
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
-- TOC entry 243 (class 1259 OID 336136)
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
-- TOC entry 309 (class 1259 OID 337149)
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
-- TOC entry 308 (class 1259 OID 337148)
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
-- TOC entry 5941 (class 0 OID 0)
-- Dependencies: 308
-- Name: stock_txns_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.stock_txns_id_seq OWNED BY public.stock_txns.id;


--
-- TOC entry 300 (class 1259 OID 337032)
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
    updated_at timepg_dump: creating SEQUENCE "public.suppliers_id_seq"
pg_dump: creating SEQUENCE OWNED BY "public.suppliers_id_seq"
pg_dump: creating TABLE "public.telemetry_measurements"
pg_dump: creating TABLE "public.telemetry_tags"
pg_dump: creating TABLE "public.tenants"
pg_dump: creating TABLE "public.topology_validations"
pg_dump: creating TABLE "public.users"
stamp(0) without time zone
);


ALTER TABLE public.suppliers OWNER TO neondb_owner;

--
-- TOC entry 299 (class 1259 OID 337031)
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
-- TOC entry 5942 (class 0 OID 0)
-- Dependencies: 299
-- Name: suppliers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.suppliers_id_seq OWNED BY public.suppliers.id;


--
-- TOC entry 397 (class 1259 OID 338607)
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
-- TOC entry 396 (class 1259 OID 338573)
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
-- TOC entry 233 (class 1259 OID 335949)
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
-- TOC entry 245 (class 1259 OID 336196)
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
-- TOC entry 223 (class 1259 OID 335879)
-- Name: users; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.users (
    id uuid NOT NULL,
    name character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    email_verified_at timestamp(0) without time zone,
    password character varypg_dump: creating TABLE "public.wo_labor"
pg_dump: creating SEQUENCE "public.wo_labor_id_seq"
pg_dump: creating SEQUENCE OWNED BY "public.wo_labor_id_seq"
pg_dump: creating TABLE "public.wo_parts"
pg_dump: creating SEQUENCE "public.wo_parts_id_seq"
pg_dump: creating SEQUENCE OWNED BY "public.wo_parts_id_seq"
pg_dump: creating TABLE "public.work_orders"
ing(255) NOT NULL,
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
-- TOC entry 313 (class 1259 OID 337194)
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
-- TOC entry 312 (class 1259 OID 337193)
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
-- TOC entry 5943 (class 0 OID 0)
-- Dependencies: 312
-- Name: wo_labor_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.wo_labor_id_seq OWNED BY public.wo_labor.id;


--
-- TOC entry 311 (class 1259 OID 337175)
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
-- TOC entry 310 (class 1259 OID 337174)
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
-- TOC entry 5944 (class 0 OID 0)
-- Dependencies: 310
-- Name: wo_parts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.wo_parts_id_seq OWNED BY public.wo_parts.id;


--
-- TOC entry 306 (class 1259 OID 337083)
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
    CONSTRAINT work_orders_status_check CHECK ((pg_dump: creating SEQUENCE "public.work_orders_id_seq"
pg_dump: creating SEQUENCE OWNED BY "public.work_orders_id_seq"
pg_dump: creating TABLE "public.wq_compliance"
pg_dump: creating SEQUENCE "public.wq_compliance_id_seq"
pg_dump: creating SEQUENCE OWNED BY "public.wq_compliance_id_seq"
pg_dump: creating TABLE "public.wq_parameters"
pg_dump: creating COMMENT "public.COLUMN wq_parameters.lod"
pg_dump: creating COMMENT "public.COLUMN wq_parameters.loi"
pg_dump: creating COMMENT "public.COLUMN wq_parameters.who_limit"
pg_dump: creating COMMENT "public.COLUMN wq_parameters.wasreb_limit"
pg_dump: creating COMMENT "public.COLUMN wq_parameters.local_limit"
(status)::text = ANY ((ARRAY['new'::character varying, 'assigned'::character varying, 'in_progress'::character varying, 'on_hold'::character varying, 'completed'::character varying, 'cancelled'::character varying])::text[])))
);


ALTER TABLE public.work_orders OWNER TO neondb_owner;

--
-- TOC entry 305 (class 1259 OID 337082)
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
-- TOC entry 5945 (class 0 OID 0)
-- Dependencies: 305
-- Name: work_orders_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.work_orders_id_seq OWNED BY public.work_orders.id;


--
-- TOC entry 361 (class 1259 OID 338002)
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
-- TOC entry 360 (class 1259 OID 338001)
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
-- TOC entry 5946 (class 0 OID 0)
-- Dependencies: 360
-- Name: wq_compliance_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.wq_compliance_id_seq OWNED BY public.wq_compliance.id;


--
-- TOC entry 347 (class 1259 OID 337635)
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
-- TOC entry 5947 (class 0 OID 0)
-- Dependencies: 347
-- Name: COLUMN wq_parameters.lod; Type: COMMENT; Schema: public; Owner: neondb_owner
--

COMMENT ON COLUMN public.wq_parameters.lod IS 'Limit of Detection';


--
-- TOC entry 5948 (class 0 OID 0)
-- Dependencies: 347
-- Name: COLUMN wq_parameters.loi; Type: COMMENT; Schema: public; Owner: neondb_owner
--

COMMENT ON COLUMN public.wq_parameters.loi IS 'Limit of Identification';


--
-- TOC entry 5949 (class 0 OID 0)
-- Dependencies: 347
-- Name: COLUMN wq_parameters.who_limit; Type: COMMENT; Schema: public; Owner: neondb_owner
--

COMMENT ON COLUMN public.wq_parameters.who_limit IS 'WHO Guideline Limit';


--
-- TOC entry 5950 (class 0 OID 0)
-- Dependencies: 347
-- Name: COLUMN wq_parameters.wasreb_limit; Type: COMMENT; Schema: public; Owner: neondb_owner
--

COMMENT ON COLUMN public.wq_parameters.wasreb_limit IS 'WASREB Limit';


pg_dump: creating SEQUENCE "public.wq_parameters_id_seq"
pg_dump: creating SEQUENCE OWNED BY "public.wq_parameters_id_seq"
pg_dump: creating TABLE "public.wq_plan_rules"
pg_dump: creating SEQUENCE "public.wq_plan_rules_id_seq"
pg_dump: creating SEQUENCE OWNED BY "public.wq_plan_rules_id_seq"
pg_dump: creating TABLE "public.wq_plans"
pg_dump: creating SEQUENCE "public.wq_plans_id_seq"
pg_dump: creating SEQUENCE OWNED BY "public.wq_plans_id_seq"
pg_dump: creating TABLE "public.wq_qc_controls"
--
-- TOC entry 5951 (class 0 OID 0)
-- Dependencies: 347
-- Name: COLUMN wq_parameters.local_limit; Type: COMMENT; Schema: public; Owner: neondb_owner
--

COMMENT ON COLUMN public.wq_parameters.local_limit IS 'Custom/Local Limit';


--
-- TOC entry 346 (class 1259 OID 337634)
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
-- TOC entry 5952 (class 0 OID 0)
-- Dependencies: 346
-- Name: wq_parameters_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.wq_parameters_id_seq OWNED BY public.wq_parameters.id;


--
-- TOC entry 353 (class 1259 OID 337898)
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
-- TOC entry 352 (class 1259 OID 337897)
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
-- TOC entry 5953 (class 0 OID 0)
-- Dependencies: 352
-- Name: wq_plan_rules_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.wq_plan_rules_id_seq OWNED BY public.wq_plan_rules.id;


--
-- TOC entry 349 (class 1259 OID 337651)
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
-- TOC entry 348 (class 1259 OID 337650)
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
-- TOC entry 5954 (class 0 OID 0)
-- Dependencies: 348
-- Name: wq_plans_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.wq_plans_id_seq OWNED BY public.wq_plans.id;


--
-- TOC entry 363 (class 1259 OID 338029)
-- Name: wq_qc_controls; Type: TABLE; Schpg_dump: creating SEQUENCE "public.wq_qc_controls_id_seq"
pg_dump: creating SEQUENCE OWNED BY "public.wq_qc_controls_id_seq"
pg_dump: creating TABLE "public.wq_results"
pg_dump: creating COMMENT "public.COLUMN wq_results.lod"
pg_dump: creating SEQUENCE "public.wq_results_id_seq"
pg_dump: creating SEQUENCE OWNED BY "public.wq_results_id_seq"
pg_dump: creating TABLE "public.wq_sample_params"
pg_dump: creating SEQUENCE "public.wq_sample_params_id_seq"
ema: public; Owner: neondb_owner
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
-- TOC entry 362 (class 1259 OID 338028)
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
-- TOC entry 5955 (class 0 OID 0)
-- Dependencies: 362
-- Name: wq_qc_controls_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.wq_qc_controls_id_seq OWNED BY public.wq_qc_controls.id;


--
-- TOC entry 359 (class 1259 OID 337978)
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
-- TOC entry 5956 (class 0 OID 0)
-- Dependencies: 359
-- Name: COLUMN wq_results.lod; Type: COMMENT; Schema: public; Owner: neondb_owner
--

COMMENT ON COLUMN public.wq_results.lod IS 'Limit of Detection for this result';


--
-- TOC entry 358 (class 1259 OID 337977)
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
-- TOC entry 5957 (class 0 OID 0)
-- Dependencies: 358
-- Name: wq_results_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.wq_results_id_seq OWNED BY public.wq_results.id;


--
-- TOC entry 357 (class 1259 OID 337952)
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
-- TOC entry 356 (class 1259 OID 337951)
-- Name: wq_sample_params_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.wq_sample_params_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.wq_samplpg_dump: creating SEQUENCE OWNED BY "public.wq_sample_params_id_seq"
pg_dump: creating TABLE "public.wq_samples"
pg_dump: creating COMMENT "public.COLUMN wq_samples.chain"
pg_dump: creating SEQUENCE "public.wq_samples_id_seq"
pg_dump: creating SEQUENCE OWNED BY "public.wq_samples_id_seq"
pg_dump: creating TABLE "public.wq_sampling_points"
pg_dump: creating SEQUENCE "public.wq_sampling_points_id_seq"
pg_dump: creating SEQUENCE OWNED BY "public.wq_sampling_points_id_seq"
pg_dump: creating TABLE "public.zones"
e_params_id_seq OWNER TO neondb_owner;

--
-- TOC entry 5958 (class 0 OID 0)
-- Dependencies: 356
-- Name: wq_sample_params_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.wq_sample_params_id_seq OWNED BY public.wq_sample_params.id;


--
-- TOC entry 355 (class 1259 OID 337918)
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
-- TOC entry 5959 (class 0 OID 0)
-- Dependencies: 355
-- Name: COLUMN wq_samples.chain; Type: COMMENT; Schema: public; Owner: neondb_owner
--

COMMENT ON COLUMN public.wq_samples.chain IS 'Chain of custody history';


--
-- TOC entry 354 (class 1259 OID 337917)
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
-- TOC entry 5960 (class 0 OID 0)
-- Dependencies: 354
-- Name: wq_samples_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.wq_samples_id_seq OWNED BY public.wq_samples.id;


--
-- TOC entry 351 (class 1259 OID 337863)
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
-- TOC entry 350 (class 1259 OID 337862)
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
-- TOC entry 5961 (class 0 OID 0)
-- Dependencies: 350
-- Name: wq_sampling_points_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.wq_sampling_points_id_seq OWNED BY public.wq_sampling_points.id;


--
-- TOC entry 239 (class 1259 OID 336073)
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
    deleted_at timestamp(0pg_dump: creating DEFAULT "public.assessment_attempts id"
pg_dump: creating DEFAULT "public.assessments id"
pg_dump: creating DEFAULT "public.asset_boms id"
pg_dump: creating DEFAULT "public.asset_classes id"
pg_dump: creating DEFAULT "public.asset_locations id"
pg_dump: creating DEFAULT "public.asset_meters id"
pg_dump: creating DEFAULT "public.assets id"
pg_dump: creating DEFAULT "public.certificates id"
pg_dump: creating DEFAULT "public.checklist_runs id"
pg_dump: creating DEFAULT "public.checklists id"
pg_dump: creating DEFAULT "public.courses id"
pg_dump: creating DEFAULT "public.crm_balances id"
pg_dump: creating DEFAULT "public.crm_customer_reads id"
pg_dump: creating DEFAULT "public.crm_customers id"
pg_dump: creating DEFAULT "public.crm_invoice_lines id"
pg_dump: creating DEFAULT "public.crm_invoices id"
pg_dump: creating DEFAULT "public.crm_meters id"
) without time zone,
    geom public.geometry(Polygon,4326)
);


ALTER TABLE public.zones OWNER TO neondb_owner;

--
-- TOC entry 4627 (class 2604 OID 336407)
-- Name: assessment_attempts id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.assessment_attempts ALTER COLUMN id SET DEFAULT nextval('public.assessment_attempts_id_seq'::regclass);


--
-- TOC entry 4619 (class 2604 OID 336373)
-- Name: assessments id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.assessments ALTER COLUMN id SET DEFAULT nextval('public.assessments_id_seq'::regclass);


--
-- TOC entry 4664 (class 2604 OID 337014)
-- Name: asset_boms id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.asset_boms ALTER COLUMN id SET DEFAULT nextval('public.asset_boms_id_seq'::regclass);


--
-- TOC entry 4651 (class 2604 OID 336876)
-- Name: asset_classes id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.asset_classes ALTER COLUMN id SET DEFAULT nextval('public.asset_classes_id_seq'::regclass);


--
-- TOC entry 4655 (class 2604 OID 336944)
-- Name: asset_locations id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.asset_locations ALTER COLUMN id SET DEFAULT nextval('public.asset_locations_id_seq'::regclass);


--
-- TOC entry 4656 (class 2604 OID 336961)
-- Name: asset_meters id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.asset_meters ALTER COLUMN id SET DEFAULT nextval('public.asset_meters_id_seq'::regclass);


--
-- TOC entry 4653 (class 2604 OID 336896)
-- Name: assets id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.assets ALTER COLUMN id SET DEFAULT nextval('public.assets_id_seq'::regclass);


--
-- TOC entry 4631 (class 2604 OID 336435)
-- Name: certificates id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.certificates ALTER COLUMN id SET DEFAULT nextval('public.certificates_id_seq'::regclass);


--
-- TOC entry 4695 (class 2604 OID 337473)
-- Name: checklist_runs id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.checklist_runs ALTER COLUMN id SET DEFAULT nextval('public.checklist_runs_id_seq'::regclass);


--
-- TOC entry 4693 (class 2604 OID 337455)
-- Name: checklists id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.checklists ALTER COLUMN id SET DEFAULT nextval('public.checklists_id_seq'::regclass);


--
-- TOC entry 4603 (class 2604 OID 336268)
-- Name: courses id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.courses ALTER COLUMN id SET DEFAULT nextval('public.courses_id_seq'::regclass);


--
-- TOC entry 4744 (class 2604 OID 338246)
-- Name: crm_balances id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.crm_balances ALTER COLUMN id SET DEFAULT nextval('public.crm_balances_id_seq'::regclass);


--
-- TOC entry 4747 (class 2604 OID 338285)
-- Name: crm_customer_reads id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.crm_customer_reads ALTER COLUMN id SET DEFAULT nextval('public.crm_customer_reads_id_seq'::regclass);


--
-- TOC entry 4734 (class 2604 OID 338148)
-- Name: crm_customers id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.crm_customers ALTER COLUMN id SET DEFAULT nextval('public.crm_customers_id_seq'::regclass);


--
-- TOC entry 4741 (class 2604 OID 338211)
-- Name: crm_invoice_lines id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.crm_invoice_lines ALTER COLUMN id SET DEFAULT nextval('public.crm_invoice_lines_id_seq'::regclass);


--
-- TOC entry 4739 (class 2604 OID 338192)
-- Name: crm_invoices id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.crm_invoices ALTER COLUMN id SET DEFAULT nextval('public.crm_invoices_id_seq'::regclass);


--
-- TOC entry 4728 (class 2604 OID 338097)
-- Name: crm_meters id; Type: DEFAULT;pg_dump: creating DEFAULT "public.crm_payment_plans id"
pg_dump: creating DEFAULT "public.crm_payments id"
pg_dump: creating DEFAULT "public.crm_premises id"
pg_dump: creating DEFAULT "public.crm_ra_rules id"
pg_dump: creating DEFAULT "public.crm_service_connections id"
pg_dump: creating DEFAULT "public.crm_tariffs id"
pg_dump: creating DEFAULT "public.employee_skills id"
pg_dump: creating DEFAULT "public.enrollments id"
pg_dump: creating DEFAULT "public.escalation_policies id"
pg_dump: creating DEFAULT "public.event_actions id"
pg_dump: creating DEFAULT "public.event_links id"
pg_dump: creating DEFAULT "public.events id"
pg_dump: creating DEFAULT "public.failed_jobs id"
pg_dump: creating DEFAULT "public.failures id"
pg_dump: creating DEFAULT "public.jobs id"
pg_dump: creating DEFAULT "public.kb_articles id"
pg_dump: creating DEFAULT "public.lesson_progress id"
 Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.crm_meters ALTER COLUMN id SET DEFAULT nextval('public.crm_meters_id_seq'::regclass);


--
-- TOC entry 4745 (class 2604 OID 338266)
-- Name: crm_payment_plans id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.crm_payment_plans ALTER COLUMN id SET DEFAULT nextval('public.crm_payment_plans_id_seq'::regclass);


--
-- TOC entry 4742 (class 2604 OID 338226)
-- Name: crm_payments id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.crm_payments ALTER COLUMN id SET DEFAULT nextval('public.crm_payments_id_seq'::regclass);


--
-- TOC entry 4725 (class 2604 OID 338063)
-- Name: crm_premises id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.crm_premises ALTER COLUMN id SET DEFAULT nextval('public.crm_premises_id_seq'::regclass);


--
-- TOC entry 4750 (class 2604 OID 338312)
-- Name: crm_ra_rules id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.crm_ra_rules ALTER COLUMN id SET DEFAULT nextval('public.crm_ra_rules_id_seq'::regclass);


--
-- TOC entry 4731 (class 2604 OID 338120)
-- Name: crm_service_connections id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.crm_service_connections ALTER COLUMN id SET DEFAULT nextval('public.crm_service_connections_id_seq'::regclass);


--
-- TOC entry 4736 (class 2604 OID 338174)
-- Name: crm_tariffs id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.crm_tariffs ALTER COLUMN id SET DEFAULT nextval('public.crm_tariffs_id_seq'::regclass);


--
-- TOC entry 4642 (class 2604 OID 336538)
-- Name: employee_skills id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.employee_skills ALTER COLUMN id SET DEFAULT nextval('public.employee_skills_id_seq'::regclass);


--
-- TOC entry 4613 (class 2604 OID 336324)
-- Name: enrollments id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.enrollments ALTER COLUMN id SET DEFAULT nextval('public.enrollments_id_seq'::regclass);


--
-- TOC entry 4702 (class 2604 OID 337608)
-- Name: escalation_policies id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.escalation_policies ALTER COLUMN id SET DEFAULT nextval('public.escalation_policies_id_seq'::regclass);


--
-- TOC entry 4701 (class 2604 OID 337586)
-- Name: event_actions id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.event_actions ALTER COLUMN id SET DEFAULT nextval('public.event_actions_id_seq'::regclass);


--
-- TOC entry 4699 (class 2604 OID 337553)
-- Name: event_links id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.event_links ALTER COLUMN id SET DEFAULT nextval('public.event_links_id_seq'::regclass);


--
-- TOC entry 4696 (class 2604 OID 337507)
-- Name: events id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.events ALTER COLUMN id SET DEFAULT nextval('public.events_id_seq'::regclass);


--
-- TOC entry 4581 (class 2604 OID 335941)
-- Name: failed_jobs id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.failed_jobs ALTER COLUMN id SET DEFAULT nextval('public.failed_jobs_id_seq'::regclass);


--
-- TOC entry 4682 (class 2604 OID 337216)
-- Name: failures id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.failures ALTER COLUMN id SET DEFAULT nextval('public.failures_id_seq'::regclass);


--
-- TOC entry 4580 (class 2604 OID 335924)
-- Name: jobs id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.jobs ALTER COLUMN id SET DEFAULT nextval('public.jobs_id_seq'::regclass);


--
-- TOC entry 4632 (class 2604 OID 336465)
-- Name: kb_articles id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.kb_articles ALTER COLUMN id SET DEFAULT nextval('public.kb_articles_id_seq'::regclass);


--
-- TOC entry 4616 (class 2604 OID 336352)
-- Name: lessopg_dump: creating DEFAULT "public.lessons id"
pg_dump: creating DEFAULT "public.meter_captures id"
pg_dump: creating DEFAULT "public.migrations id"
pg_dump: creating DEFAULT "public.notifications id"
pg_dump: creating DEFAULT "public.oncall_schedules id"
pg_dump: creating DEFAULT "public.parts id"
pg_dump: creating DEFAULT "public.permissions id"
pg_dump: creating DEFAULT "public.personal_access_tokens id"
pg_dump: creating DEFAULT "public.playbooks id"
pg_dump: creating DEFAULT "public.pm_policies id"
pg_dump: creating DEFAULT "public.pm_schedules id"
pg_dump: creating DEFAULT "public.questions id"
pg_dump: creating DEFAULT "public.roles id"
pg_dump: creating DEFAULT "public.rosters id"
pg_dump: creating DEFAULT "public.shift_entries id"
pg_dump: creating DEFAULT "public.shifts id"
pg_dump: creating DEFAULT "public.skills id"
n_progress id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.lesson_progress ALTER COLUMN id SET DEFAULT nextval('public.lesson_progress_id_seq'::regclass);


--
-- TOC entry 4609 (class 2604 OID 336306)
-- Name: lessons id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.lessons ALTER COLUMN id SET DEFAULT nextval('public.lessons_id_seq'::regclass);


--
-- TOC entry 4658 (class 2604 OID 336975)
-- Name: meter_captures id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.meter_captures ALTER COLUMN id SET DEFAULT nextval('public.meter_captures_id_seq'::regclass);


--
-- TOC entry 4578 (class 2604 OID 335876)
-- Name: migrations id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.migrations ALTER COLUMN id SET DEFAULT nextval('public.migrations_id_seq'::regclass);


--
-- TOC entry 4703 (class 2604 OID 337623)
-- Name: notifications id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.notifications ALTER COLUMN id SET DEFAULT nextval('public.notifications_id_seq'::regclass);


--
-- TOC entry 4646 (class 2604 OID 336587)
-- Name: oncall_schedules id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.oncall_schedules ALTER COLUMN id SET DEFAULT nextval('public.oncall_schedules_id_seq'::regclass);


--
-- TOC entry 4660 (class 2604 OID 336992)
-- Name: parts id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.parts ALTER COLUMN id SET DEFAULT nextval('public.parts_id_seq'::regclass);


--
-- TOC entry 4648 (class 2604 OID 336615)
-- Name: permissions id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.permissions ALTER COLUMN id SET DEFAULT nextval('public.permissions_id_seq'::regclass);


--
-- TOC entry 4650 (class 2604 OID 336694)
-- Name: personal_access_tokens id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.personal_access_tokens ALTER COLUMN id SET DEFAULT nextval('public.personal_access_tokens_id_seq'::regclass);


--
-- TOC entry 4700 (class 2604 OID 337569)
-- Name: playbooks id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.playbooks ALTER COLUMN id SET DEFAULT nextval('public.playbooks_id_seq'::regclass);


--
-- TOC entry 4666 (class 2604 OID 337050)
-- Name: pm_policies id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.pm_policies ALTER COLUMN id SET DEFAULT nextval('public.pm_policies_id_seq'::regclass);


--
-- TOC entry 4669 (class 2604 OID 337069)
-- Name: pm_schedules id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.pm_schedules ALTER COLUMN id SET DEFAULT nextval('public.pm_schedules_id_seq'::regclass);


--
-- TOC entry 4624 (class 2604 OID 336391)
-- Name: questions id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.questions ALTER COLUMN id SET DEFAULT nextval('public.questions_id_seq'::regclass);


--
-- TOC entry 4649 (class 2604 OID 336629)
-- Name: roles id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.roles ALTER COLUMN id SET DEFAULT nextval('public.roles_id_seq'::regclass);


--
-- TOC entry 4644 (class 2604 OID 336571)
-- Name: rosters id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.rosters ALTER COLUMN id SET DEFAULT nextval('public.rosters_id_seq'::regclass);


--
-- TOC entry 4692 (class 2604 OID 337430)
-- Name: shift_entries id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.shift_entries ALTER COLUMN id SET DEFAULT nextval('public.shift_entries_id_seq'::regclass);


--
-- TOC entry 4683 (class 2604 OID 337240)
-- Name: shifts id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.shifts ALTER COLUMN id SET DEFAULT nextval('public.shifts_id_seq'::regclass);


--
-- TOC entry 4641 (class 2604 OID 336521)
-- Name: skills id; Type: DEFAULT; Schema: public; Owpg_dump: creating DEFAULT "public.sops id"
pg_dump: creating DEFAULT "public.stock_txns id"
pg_dump: creating DEFAULT "public.suppliers id"
pg_dump: creating DEFAULT "public.wo_labor id"
pg_dump: creating DEFAULT "public.wo_parts id"
pg_dump: creating DEFAULT "public.work_orders id"
pg_dump: creating DEFAULT "public.wq_compliance id"
pg_dump: creating DEFAULT "public.wq_parameters id"
pg_dump: creating DEFAULT "public.wq_plan_rules id"
pg_dump: creating DEFAULT "public.wq_plans id"
pg_dump: creating DEFAULT "public.wq_qc_controls id"
pg_dump: creating DEFAULT "public.wq_results id"
pg_dump: creating DEFAULT "public.wq_sample_params id"
pg_dump: creating DEFAULT "public.wq_samples id"
pg_dump: creating DEFAULT "public.wq_sampling_points id"
pg_dump: processing data for table "public.addresses"
pg_dump: dumping contents of table "public.addresses"
ner: neondb_owner
--

ALTER TABLE ONLY public.skills ALTER COLUMN id SET DEFAULT nextval('public.skills_id_seq'::regclass);


--
-- TOC entry 4638 (class 2604 OID 336496)
-- Name: sops id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.sops ALTER COLUMN id SET DEFAULT nextval('public.sops_id_seq'::regclass);


--
-- TOC entry 4677 (class 2604 OID 337152)
-- Name: stock_txns id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.stock_txns ALTER COLUMN id SET DEFAULT nextval('public.stock_txns_id_seq'::regclass);


--
-- TOC entry 4665 (class 2604 OID 337035)
-- Name: suppliers id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.suppliers ALTER COLUMN id SET DEFAULT nextval('public.suppliers_id_seq'::regclass);


--
-- TOC entry 4681 (class 2604 OID 337197)
-- Name: wo_labor id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.wo_labor ALTER COLUMN id SET DEFAULT nextval('public.wo_labor_id_seq'::regclass);


--
-- TOC entry 4680 (class 2604 OID 337178)
-- Name: wo_parts id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.wo_parts ALTER COLUMN id SET DEFAULT nextval('public.wo_parts_id_seq'::regclass);


--
-- TOC entry 4671 (class 2604 OID 337086)
-- Name: work_orders id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.work_orders ALTER COLUMN id SET DEFAULT nextval('public.work_orders_id_seq'::regclass);


--
-- TOC entry 4719 (class 2604 OID 338005)
-- Name: wq_compliance id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.wq_compliance ALTER COLUMN id SET DEFAULT nextval('public.wq_compliance_id_seq'::regclass);


--
-- TOC entry 4705 (class 2604 OID 337638)
-- Name: wq_parameters id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.wq_parameters ALTER COLUMN id SET DEFAULT nextval('public.wq_parameters_id_seq'::regclass);


--
-- TOC entry 4711 (class 2604 OID 337901)
-- Name: wq_plan_rules id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.wq_plan_rules ALTER COLUMN id SET DEFAULT nextval('public.wq_plan_rules_id_seq'::regclass);


--
-- TOC entry 4707 (class 2604 OID 337654)
-- Name: wq_plans id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.wq_plans ALTER COLUMN id SET DEFAULT nextval('public.wq_plans_id_seq'::regclass);


--
-- TOC entry 4724 (class 2604 OID 338032)
-- Name: wq_qc_controls id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.wq_qc_controls ALTER COLUMN id SET DEFAULT nextval('public.wq_qc_controls_id_seq'::regclass);


--
-- TOC entry 4717 (class 2604 OID 337981)
-- Name: wq_results id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.wq_results ALTER COLUMN id SET DEFAULT nextval('public.wq_results_id_seq'::regclass);


--
-- TOC entry 4715 (class 2604 OID 337955)
-- Name: wq_sample_params id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.wq_sample_params ALTER COLUMN id SET DEFAULT nextval('public.wq_sample_params_id_seq'::regclass);


--
-- TOC entry 4713 (class 2604 OID 337921)
-- Name: wq_samples id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.wq_samples ALTER COLUMN id SET DEFAULT nextval('public.wq_samples_id_seq'::regclass);


--
-- TOC entry 4709 (class 2604 OID 337866)
-- Name: wq_sampling_points id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.wq_sampling_points ALTER COLUMN id SET DEFAULT nextval('public.wq_sampling_points_id_seq'::regclass);


--
-- TOC entry 5725 (class 0 OID 336093)
-- Dependencies: 240
-- Data for Name: addresses; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.addresses (id, tenant_id, scheme_id, premise_code, street, village, ward, subcounty, city, postcode, country, what3words, meta, created_at, updated_at, deleted_at, location) FROM stdin;
a06b8da0-0ee2-404f-9a07-92a7d24c92d4	pg_dump: processing data for table "public.api_keys"
pg_dump: dumping contents of table "public.api_keys"
pg_dump: processing data for table "public.assessment_attempts"
pg_dump: dumping contents of table "public.assessment_attempts"
pg_dump: processing data for table "public.assessments"
pg_dump: dumping contents of table "public.assessments"
a06b8d83-18d4-4241-95c6-66216c4dc431	a06b8d85-2ff6-467b-afc0-7854decad03b	ADDR-001	Kenyatta Avenue, Plot 45	\N	\N	\N	Nairobi	00100	KE	\N	\N	2025-11-22 21:59:40	2025-11-22 21:59:40	\N	0101000020E61000008FC2F5285C8FF4BF8C4AEA0434694240
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
-- TOC entry 5792 (class 0 OID 337124)
-- Dependencies: 307
-- Data for Name: api_keys; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.api_keys (id, tenant_id, name, hash, scopes, created_by, last_used_at, revoked, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- TOC entry 5746 (class 0 OID 336404)
-- Dependencies: 261
-- Data for Name: assessment_attempts; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.assessment_attempts (id, enrollment_id, assessment_id, attempt_number, answers, score, passed, started_at, submitted_at, evidence, assessor_id, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5742 (class 0 OID 336370)
-- Dependencies: 257
-- Data for Name: assessments; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.assessments (id, course_id, title, type, passing_score, max_attempts, time_limit_min, randomize_questions, show_answers, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5783 (class 0 OID 337011)
-- Dependencies: 298
-- Data for Name: asset_boms; Type: TABLE DATA; Schema: public; Owner: neondb_ownerpg_dump: processing data for table "public.asset_boms"
pg_dump: dumping contents of table "public.asset_boms"
pg_dump: processing data for table "public.asset_classes"
pg_dump: dumping contents of table "public.asset_classes"
pg_dump: processing data for table "public.asset_locations"
pg_dump: dumping contents of table "public.asset_locations"
pg_dump: processing data for table "public.asset_meters"
pg_dump: dumping contents of table "public.asset_meters"
pg_dump: processing data for table "public.assets"
pg_dump: dumping contents of table "public.assets"
pg_dump: processing data for table "public.attachments"
pg_dump: dumping contents of table "public.attachments"
pg_dump: processing data for table "public.audit_events"
pg_dump: dumping contents of table "public.audit_events"
pg_dump: processing data for table "public.cache"
pg_dump: dumping contents of table "public.cache"
pg_dump: processing data for table "public.cache_locks"
pg_dump: dumping contents of table "public.cache_locks"
pg_dump: processing data for table "public.certificates"
pg_dump: dumping contents of table "public.certificates"
pg_dump: processing data for table "public.checklist_runs"
pg_dump: dumping contents of table "public.checklist_runs"
pg_dump: processing data for table "public.checklists"
pg_dump: dumping contents of table "public.checklists"

--

COPY public.asset_boms (id, asset_id, part_id, qty, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5771 (class 0 OID 336873)
-- Dependencies: 286
-- Data for Name: asset_classes; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.asset_classes (id, code, name, parent_id, criticality, attributes_schema, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5775 (class 0 OID 336941)
-- Dependencies: 290
-- Data for Name: asset_locations; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.asset_locations (id, asset_id, effective_from, effective_to, geom, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5777 (class 0 OID 336958)
-- Dependencies: 292
-- Data for Name: asset_meters; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.asset_meters (id, asset_id, kind, unit, multiplier, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5773 (class 0 OID 336893)
-- Dependencies: 288
-- Data for Name: assets; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.assets (id, tenant_id, scheme_id, dma_id, class_id, parent_id, code, name, barcode, serial, manufacturer, model, status, install_date, warranty_expiry, geom, specs, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5727 (class 0 OID 336123)
-- Dependencies: 242
-- Data for Name: attachments; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.attachments (id, tenant_id, entity_type, entity_id, path, kind, title, uploaded_by, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- TOC entry 5809 (class 0 OID 337355)
-- Dependencies: 324
-- Data for Name: audit_events; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.audit_events (id, tenant_id, actor_id, actor_type, action, entity_type, entity_id, ip, ua, diff, occurred_at) FROM stdin;
\.


--
-- TOC entry 5711 (class 0 OID 335906)
-- Dependencies: 226
-- Data for Name: cache; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.cache (key, value, expiration) FROM stdin;
\.


--
-- TOC entry 5712 (class 0 OID 335913)
-- Dependencies: 227
-- Data for Name: cache_locks; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.cache_locks (key, owner, expiration) FROM stdin;
\.


--
-- TOC entry 5748 (class 0 OID 336432)
-- Dependencies: 263
-- Data for Name: certificates; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.certificates (id, tenant_id, user_id, course_id, code, qr_token, score, issued_at, expires_at, metadata, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5818 (class 0 OID 337470)
-- Dependencies: 333
-- Data for Name: checklist_runs; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.checklist_runs (id, checklist_id, shift_id, facility_id, performed_by, started_at, completed_at, data, score, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5816 (class 0 OID 337452)
-- Dependencies: 331
-- Data for Name: checklists; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.checklists (id, tenant_id, title, schema, frequency, created_at, updated_at) FROM stdin;
1	a06b8d84-2611-4230-ab4d-856119438db8	Shift Handover Checklist	{"items": [{"text": "Review active events and alarms", "required": true}, {"text": "Check critical asset statuses", "required": true}, {"text": "Review outstanding work orders", "required": true}, {"text": "Brief incoming operator on key issues", "required": true}, {"text": "Sign handover log", "required": true}]}	daily	2025-11-22 22:37:58	2025-11-22 22:37:58
2	a06b8d84-2611-4230-ab4d-856119438db8	Daily System Check	{"items": [{"text": "Verify reservoir levels", "required": true}, {"text": "Check pump station pressures", "required": true}, {"text": "Review water quality readings", "required": true}, {"text": "Inspect chlorine residuals", "required": true}, {"text": "Check DMA flow rates", "required": true}, {"text": "Review energy consumption", "required": false}]}	daily	2025-11-22 22:37:58	2025-11-22 22:37:58
\.


--
-- TOC entry 5876 (class 0pg_dump: processing data for table "public.chemical_stocks"
pg_dump: dumping contents of table "public.chemical_stocks"
pg_dump: processing data for table "public.consents"
pg_dump: dumping contents of table "public.consents"
pg_dump: processing data for table "public.courses"
pg_dump: dumping contents of table "public.courses"
pg_dump: processing data for table "public.crm_balances"
pg_dump: dumping contents of table "public.crm_balances"
pg_dump: processing data for table "public.crm_customer_reads"
pg_dump: dumping contents of table "public.crm_customer_reads"
pg_dump: processing data for table "public.crm_customers"
pg_dump: dumping contents of table "public.crm_customers"
pg_dump: processing data for table "public.crm_invoice_lines"
pg_dump: dumping contents of table "public.crm_invoice_lines"
pg_dump: processing data for table "public.crm_invoices"
pg_dump: dumping contents of table "public.crm_invoices"
pg_dump: processing data for table "public.crm_meters"
pg_dump: dumping contents of table "public.crm_meters"
pg_dump: processing data for table "public.crm_payment_plans"
pg_dump: dumping contents of table "public.crm_payment_plans"
pg_dump: processing data for table "public.crm_payments"
pg_dump: dumping contents of table "public.crm_payments"
pg_dump: processing data for table "public.crm_premises"
pg_dump: dumping contents of table "public.crm_premises"
pg_dump: processing data for table "public.crm_ra_rules"
pg_dump: dumping contents of table "public.crm_ra_rules"
 OID 338460)
-- Dependencies: 391
-- Data for Name: chemical_stocks; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.chemical_stocks (id, tenant_id, scheme_id, facility_id, chemical, qty_on_hand_kg, reorder_level_kg, max_stock_kg, as_of, unit_cost, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- TOC entry 5807 (class 0 OID 337317)
-- Dependencies: 322
-- Data for Name: consents; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.consents (id, user_id, purpose, granted_at, revoked_at, meta, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5734 (class 0 OID 336265)
-- Dependencies: 249
-- Data for Name: courses; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.courses (id, tenant_id, title, code, domain, level, format, credits, duration_min, prerequisites, expiry_days, owner_id, syllabus, description, thumbnail_url, rating, enrollments_count, status, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- TOC entry 5866 (class 0 OID 338243)
-- Dependencies: 381
-- Data for Name: crm_balances; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.crm_balances (id, tenant_id, account_no, as_of, balance, aging, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5870 (class 0 OID 338282)
-- Dependencies: 385
-- Data for Name: crm_customer_reads; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.crm_customer_reads (id, meter_id, read_at, value, photo_path, read_source, quality, reader_id, meta, created_at, updated_at, geom) FROM stdin;
\.


--
-- TOC entry 5856 (class 0 OID 338145)
-- Dependencies: 371
-- Data for Name: crm_customers; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.crm_customers (id, tenant_id, customer_no, name, id_type, id_no, phone, email, premise_id, contact_address, kyc, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5862 (class 0 OID 338208)
-- Dependencies: 377
-- Data for Name: crm_invoice_lines; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.crm_invoice_lines (id, invoice_id, description, quantity, unit_price, amount, tariff_block, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5860 (class 0 OID 338189)
-- Dependencies: 375
-- Data for Name: crm_invoices; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.crm_invoices (id, tenant_id, account_no, period_start, period_end, due_date, total_amount, status, meta, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5852 (class 0 OID 338094)
-- Dependencies: 367
-- Data for Name: crm_meters; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.crm_meters (id, tenant_id, serial_no, make, model, size_mm, meter_type, install_date, status, last_read_at, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5868 (class 0 OID 338263)
-- Dependencies: 383
-- Data for Name: crm_payment_plans; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.crm_payment_plans (id, tenant_id, account_no, status, schedule, next_due, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5864 (class 0 OID 338223)
-- Dependencies: 379
-- Data for Name: crm_payments; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.crm_payments (id, tenant_id, account_no, paid_at, amount, channel, ref, meta, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5850 (class 0 OID 338060)
-- Dependencies: 365
-- Data for Name: crm_premises; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.crm_premises (id, tenant_id, scheme_id, dma_id, premise_id, address, occupancy, status, meta, created_at, updated_at, location) FROM stdin;
\.


--
-- TOC entry 5872 (class 0 OID 338309)
-- Dependencies: 387
-- Data for Name: crm_ra_rules; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.crm_ra_rules (id, tenant_id, code, name, severity, params, active, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5854 (class 0 OID 338117)
-- Dependencies: 369
-- Data for Name: crm_service_connections; Type: TApg_dump: processing data for table "public.crm_service_connections"
pg_dump: dumping contents of table "public.crm_service_connections"
pg_dump: processing data for table "public.crm_tariffs"
pg_dump: dumping contents of table "public.crm_tariffs"
pg_dump: processing data for table "public.data_catalog"
pg_dump: dumping contents of table "public.data_catalog"
pg_dump: processing data for table "public.data_classes"
pg_dump: dumping contents of table "public.data_classes"
pg_dump: processing data for table "public.device_trust"
pg_dump: dumping contents of table "public.device_trust"
pg_dump: processing data for table "public.dmas"
pg_dump: dumping contents of table "public.dmas"
BLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.crm_service_connections (id, premise_id, connection_no, status, connection_type, install_date, meter_id, notes, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5858 (class 0 OID 338171)
-- Dependencies: 373
-- Data for Name: crm_tariffs; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.crm_tariffs (id, tenant_id, name, valid_from, valid_to, blocks, fixed_charge, currency, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5805 (class 0 OID 337291)
-- Dependencies: 320
-- Data for Name: data_catalog; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.data_catalog (id, table_name, column_name, data_class_id, encryption, mask, purpose_tags, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5804 (class 0 OID 337282)
-- Dependencies: 319
-- Data for Name: data_classes; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.data_classes (id, code, description, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5803 (class 0 OID 337247)
-- Dependencies: 318
-- Data for Name: device_trust; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.device_trust (id, user_id, device_fingerprint, platform, registered_at, last_seen_at, revoked, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5722 (class 0 OID 336027)
-- Dependencies: 237
-- Data for Name: dmas; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.dmas (id, tenant_id, scheme_id, code, name, status, nightline_threshold_m3h, pressure_target_bar, meta, created_at, updated_at, deleted_at, geom) FROM stdin;
a06b8d89-c850-49a3-9d8f-1ae553d61221	a06b8d83-18d4-4241-95c6-66216c4dc431	a06b8d85-2ff6-467b-afc0-7854decad03b	DMA-Z1-CBD	DMA Zone 1 - CBD	active	12.50	3.50	\N	2025-11-22 21:59:25	2025-11-22 21:59:25	\N	0103000020E610000001000000050000007B14AE47E17AF4BF66666666666642407B14AE47E17AF4BF0AD7A3703D6A4240CDCCCCCCCCCCF4BF0AD7A3703D6A4240CDCCCCCCCCCCF4BF66666666666642407B14AE47E17AF4BF6666666666664240
a06b8d8a-cbe5-4ba7-b149-dc6739893ba2	a06b8d83-18d4-4241-95c6-66216c4dc431	a06b8d85-2ff6-467b-afc0-7854decad03b	DMA-Z2-KLM	DMA Zone 2 - Kilimani	active	15.00	4.00	\N	2025-11-22 21:59:26	2025-11-22 21:59:26	\N	0103000020E61000000100000005000000A4703D0AD7A3F4BFE17A14AE47614240A4703D0AD7A3F4BF66666666666642401F85EB51B81EF5BF66666666666642401F85EB51B81EF5BFE17A14AE47614240A4703D0AD7A3F4BFE17A14AE47614240
a06b8d8b-ceb2-4102-86c3-7d4baaf3904a	a06b8d83-18d4-4241-95c6-66216c4dc431	a06b8d85-2ff6-467b-afc0-7854decad03b	DMA-Z3-EST	DMA Zone 3 - Eastleigh	planned	18.00	3.00	\N	2025-11-22 21:59:26	2025-11-22 21:59:26	\N	0103000020E61000000100000005000000295C8FC2F528F4BFCDCCCCCCCC6C4240295C8FC2F528F4BF3333333333734240CDCCCCCCCCCCF4BF3333333333734240CDCCCCCCCCCCF4BFCDCCCCCCCC6C4240295C8FC2F528F4BFCDCCCCCCCC6C4240
a06b992e-9ce9-4d8f-bc1b-fe16f971ac22	a06b9928-048c-43c7-8284-5885a4aa40f1	a06b992a-0c2f-437d-b92e-b0b93d5b0eeb	DMA-G1-TOWN	DMA Zone 1 - Garissa Town	active	8.50	3.00	\N	2025-11-22 22:31:59	2025-11-22 22:31:59	\N	0103000020E61000000100000005000000295C8FC2F528DCBF52B81E85EBD14340295C8FC2F528DCBF14AE47E17AD44340713D0AD7A370DDBF14AE47E17AD44340713D0AD7A370DDBF52B81E85EBD14340295C8FC2F528DCBF52B81E85EBD14340
a06b992f-a0fc-45d9-aa0e-9bac82cddf1d	a06b9928-048c-43c7-8284-5885a4aa40f1	a06b992a-0c2f-437d-b92e-b0b93d5b0eeb	DMA-G2-WEST	DMA Zone 2 - West Garissa	active	5.20	2.80	\N	2025-11-22 22:31:59	2025-11-22 22:31:59	\N	0103000020E6100000010000000500000085EB51B81E85DBBF713D0AD7A3D0434085EB51B81E85DBBFC3F5285C8FD24340B81E85EB51B8DEBFC3F5285C8FD24340B81E85EB51B8DEBF713D0AD7A3D0434085EB51B81E85DBBF713D0AD7A3D04340
a06b9930-a41c-4f6a-9322-b262c5a86436	a06b9928-048c-43c7-8284-5885a4aa40f1	a06b992a-0c2f-437d-b92e-b0b93d5b0eeb	DMA-G3-EAST	DMA Zone 3 - East Garissa	active	6.80	3.20	\N	2025-11-22 22:32:00	2025-11-22 22:32:00	\N	0103000020E6100000010000000500000085EB51B81E85DBBFA4703D0AD7D3434085EB51B81E85DBBFD7A3703D0AD74340B81E85EB51B8DEBFD7A3703D0AD74340B81E85EB51B8DEBFA4703D0AD7D3434085EB51B81E85DBBFA4703D0AD7D34340
\.


-pg_dump: processing data for table "public.dose_change_logs"
pg_dump: dumping contents of table "public.dose_change_logs"
pg_dump: processing data for table "public.dose_plans"
pg_dump: dumping contents of table "public.dose_plans"
pg_dump: processing data for table "public.dsr_requests"
pg_dump: dumping contents of table "public.dsr_requests"
pg_dump: processing data for table "public.employee_skills"
pg_dump: dumping contents of table "public.employee_skills"
pg_dump: processing data for table "public.enrollments"
pg_dump: dumping contents of table "public.enrollments"
pg_dump: processing data for table "public.escalation_policies"
pg_dump: dumping contents of table "public.escalation_policies"
pg_dump: processing data for table "public.event_actions"
pg_dump: dumping contents of table "public.event_actions"
pg_dump: processing data for table "public.event_links"
pg_dump: dumping contents of table "public.event_links"
pg_dump: processing data for table "public.events"
pg_dump: dumping contents of table "public.events"
pg_dump: processing data for table "public.facilities"
pg_dump: dumping contents of table "public.facilities"
-
-- TOC entry 5877 (class 0 OID 338485)
-- Dependencies: 392
-- Data for Name: dose_change_logs; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.dose_change_logs (id, dose_plan_id, user_id, before, after, reason, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5875 (class 0 OID 338435)
-- Dependencies: 390
-- Data for Name: dose_plans; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.dose_plans (id, tenant_id, scheme_id, asset_id, chemical, flow_bands, thresholds, active, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- TOC entry 5808 (class 0 OID 337330)
-- Dependencies: 323
-- Data for Name: dsr_requests; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.dsr_requests (id, tenant_id, requester_id, type, target_user_id, status, submitted_at, completed_at, artifacts, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5756 (class 0 OID 336535)
-- Dependencies: 271
-- Data for Name: employee_skills; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.employee_skills (id, tenant_id, user_id, skill_id, level_index, evidence, assessed_at, assessor_id, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5738 (class 0 OID 336321)
-- Dependencies: 253
-- Data for Name: enrollments; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.enrollments (id, tenant_id, user_id, course_id, status, progress_percent, started_at, due_at, completed_at, final_score, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5828 (class 0 OID 337605)
-- Dependencies: 343
-- Data for Name: escalation_policies; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.escalation_policies (id, tenant_id, name, rules, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5826 (class 0 OID 337583)
-- Dependencies: 341
-- Data for Name: event_actions; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.event_actions (id, event_id, action, actor_id, payload, occurred_at, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5822 (class 0 OID 337550)
-- Dependencies: 337
-- Data for Name: event_links; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.event_links (id, event_id, entity_type, entity_id, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5820 (class 0 OID 337504)
-- Dependencies: 335
-- Data for Name: events; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.events (id, tenant_id, source, external_id, facility_id, scheme_id, dma_id, category, subcategory, severity, detected_at, acknowledged_at, resolved_at, status, description, attributes, location, correlation_key, sla_due_at, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5721 (class 0 OID 336004)
-- Dependencies: 236
-- Data for Name: facilities; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.facilities (id, tenant_id, scheme_id, code, name, category, status, address, commissioned_on, meta, created_at, updated_at, deleted_at, location) FROM stdin;
a06b8d8d-52f3-4490-acc8-fa61e88c791e	a06b8d83-18d4-4241-95c6-66216c4dc431	a06b8d85-2ff6-467b-afc0-7854decad03b	FAC-SWTP-001	Sasumua Water Treatment Plant	treatment	active	\N	\N	\N	2025-11-22 21:59:27	2025-11-22 21:59:27	\N	0101000020E61000009A9999999999F1BF3333333333534240
a06b8d8e-55f6-4d4e-a8ca-7ce32f78fe1f	a06b8d83-18d4-4241-95c6-66216c4dc431	a06b8d85-2ff6-467b-afc0-7854decad03b	FAC-NSS-002	Ngethu Spring Source	source	active	\N	\N	\N	2025-11-22 21:59:28	2025-11-22 21:59:28	\N	0101000020E610000048E17A14AE47F1BFD7A3703D0A574240
a06b8d8f-5921-4f4b-8f2e-39a56f8d94af	a06b8d83-18d4-4241-95c6-66216c4dc431	a06b8d85-2ff6-467b-afc0-7854decad03b	FAC-GPS-003	Gigiri Pumping Station	pumpstation	active	\N	\N	\N	2025-11-22 21:59:29	2025-11-22 21:59:29	\N	0101000020E6100000D7A3703D0AD7F3BFA4703D0AD7634240
a06b8d90-5b6b-4c33-ae28-cb25582eca2c	a06b8d83-18d4-4241-95c6-66216c4dc431	a06b8d85-2ff6-467b-afc0-7854decad03b	FAC-RSR-004	Ruaraka Service Reservoir	reservoir	active	\N	\N	\N	2025-11-22 21:59:29	2025-11-22 21:59:29	\N	pg_dump: processing data for table "public.failed_jobs"
pg_dump: dumping contents of table "public.failed_jobs"
pg_dump: processing data for table "public.failures"
pg_dump: dumping contents of table "public.failures"
pg_dump: processing data for table "public.interventions"
pg_dump: dumping contents of table "public.interventions"
0101000020E6100000000000000000F4BF713D0AD7A3704240
a06b8d91-5ddb-4764-93b7-b0d7802e120c	a06b8d83-18d4-4241-95c6-66216c4dc431	a06b8d85-2ff6-467b-afc0-7854decad03b	FAC-KBS-005	Kabete Booster Station	pumpstation	standby	\N	\N	\N	2025-11-22 21:59:30	2025-11-22 21:59:30	\N	0101000020E6100000295C8FC2F528F4BF3D0AD7A3705D4240
a06b8d92-62db-4742-8600-36cef001a202	a06b8d83-18d4-4241-95c6-66216c4dc431	a06b8d85-2ff6-467b-afc0-7854decad03b	FAC-KWQL-006	Karura Water Quality Lab	lab	active	\N	\N	\N	2025-11-22 21:59:31	2025-11-22 21:59:31	\N	0101000020E6100000000000000000F4BF295C8FC2F5684240
a06b8d93-6641-402f-9f43-36cf8529325f	a06b8d83-18d4-4241-95c6-66216c4dc431	a06b8d85-2ff6-467b-afc0-7854decad03b	FAC-NDS-007	Ndakaini Dam Source	source	active	\N	\N	\N	2025-11-22 21:59:31	2025-11-22 21:59:31	\N	0101000020E6100000000000000000E8BF6666666666864240
a06b8d94-689c-4eab-bcbd-7a89c6a97c5f	a06b8d83-18d4-4241-95c6-66216c4dc431	a06b8d85-2ff6-467b-afc0-7854decad03b	FAC-CPR-008	City Park Reservoir	reservoir	active	\N	\N	\N	2025-11-22 21:59:32	2025-11-22 21:59:32	\N	0101000020E610000052B81E85EB51F4BF0AD7A3703D6A4240
a06b9971-3d0c-47bd-b805-ea16ae64c6ba	a06b9928-048c-43c7-8284-5885a4aa40f1	a06b992a-0c2f-437d-b92e-b0b93d5b0eeb	GAR-SRC-001	Tana River Water Source	source	active	Garissa-Lamu Road	\N	{"capacity_m3d": 2400}	2025-11-22 22:32:42	2025-11-22 22:32:42	\N	0101000020E6100000000000000000E0BF6666666666C64340
a06b99aa-dc0a-4ab7-a383-6f42c0bbf35b	a06b9928-048c-43c7-8284-5885a4aa40f1	a06b992a-0c2f-437d-b92e-b0b93d5b0eeb	GAR-WTP-001	Garissa Water Treatment Plant	treatment	active	Tana River Road	\N	{"capacity_m3d": 2000}	2025-11-22 22:33:20	2025-11-22 22:33:20	\N	0101000020E6100000CDCCCCCCCCCCDCBF52B81E85EBD14340
a06b99ab-e458-4681-b025-72ede90f46e1	a06b9928-048c-43c7-8284-5885a4aa40f1	a06b992a-0c2f-437d-b92e-b0b93d5b0eeb	GAR-RES-001	Garissa Main Reservoir	reservoir	active	Garissa Town	\N	{"capacity_m3d": 1200}	2025-11-22 22:33:21	2025-11-22 22:33:21	\N	0101000020E61000001F85EB51B81EDDBFA4703D0AD7D34340
a06b99ac-e907-465a-a65f-0aa2745cfcf1	a06b9928-048c-43c7-8284-5885a4aa40f1	a06b992a-0c2f-437d-b92e-b0b93d5b0eeb	GAR-PS-001	Garissa Pumping Station 1	pumpstation	active	East Garissa	\N	{"capacity_m3d": 800}	2025-11-22 22:33:21	2025-11-22 22:33:21	\N	0101000020E6100000713D0AD7A370DDBF14AE47E17AD44340
a06b99ad-fd34-4248-9640-e33eedb9d75f	a06b9928-048c-43c7-8284-5885a4aa40f1	a06b992a-0c2f-437d-b92e-b0b93d5b0eeb	GAR-PS-002	Garissa Pumping Station 2	pumpstation	active	West Garissa	\N	{"capacity_m3d": 600}	2025-11-22 22:33:22	2025-11-22 22:33:22	\N	0101000020E6100000295C8FC2F528DCBF713D0AD7A3D04340
\.


--
-- TOC entry 5717 (class 0 OID 335938)
-- Dependencies: 232
-- Data for Name: failed_jobs; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.failed_jobs (id, uuid, connection, queue, payload, exception, failed_at) FROM stdin;
\.


--
-- TOC entry 5800 (class 0 OID 337213)
-- Dependencies: 315
-- Data for Name: failures; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.failures (id, work_order_id, code, mode, cause, effect, remarks, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5874 (class 0 OID 338409)
-- Dependencies: 389
-- Data for Name: interventions; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.interventions (id, tenant_id, dma_id, asset_id, type, date, estimated_savings_m3d, realized_savings_m3d, cost, responsible, follow_up_at, evidence, notes, created_at, updated_at, deleted_at) FROM stdin;
ffce1a40-f074-4b41-b60b-1fb35b96c9b9	a06b8d83-18d4-4241-95c6-66216c4dc431	a06b8d89-c850-49a3-9d8f-1ae553d61221	\N	campaign	2025-09-09	40.00	47.20	6584.00	Operations Team	\N	\N	Campaign in DMA Zone 1 - CBD	2025-11-22 22:03:08	2025-11-22 22:03:08	\N
6d730039-1d6e-40d0-89ad-87a885258183	a06b8d83-18d4-4241-95c6-66216c4dc431	a06b8d89-c850-49a3-9d8f-1ae553d61221	\N	campaign	2025-10-26	31.00	\N	5484.00	Operations Team	\N	\N	Campaign in DMA Zone 1 - CBD	2025-11-22 22:03:08	2025-11-22 22:03:08	\N
d84b4a40-0ce6-4048-ac30-d41682c6f405	a06b8d83-18d4-4241-95c6-66216c4dc431	a06b8d89-c850-49a3-9d8f-1ae55pg_dump: processing data for table "public.job_batches"
pg_dump: dumping contents of table "public.job_batches"
pg_dump: processing data for table "public.jobs"
pg_dump: dumping contents of table "public.jobs"
pg_dump: processing data for table "public.kb_articles"
pg_dump: dumping contents of table "public.kb_articles"
pg_dump: processing data for table "public.kms_keys"
pg_dump: dumping contents of table "public.kms_keys"
pg_dump: processing data for table "public.lesson_progress"
pg_dump: dumping contents of table "public.lesson_progress"
pg_dump: processing data for table "public.lessons"
pg_dump: dumping contents of table "public.lessons"
pg_dump: processing data for table "public.lookup_values"
pg_dump: dumping contents of table "public.lookup_values"
pg_dump: processing data for table "public.map_layer_configs"
3d61221	\N	prv_tuning	2025-09-10	89.00	80.10	4916.00	Operations Team	\N	\N	Prv tuning in DMA Zone 1 - CBD	2025-11-22 22:03:08	2025-11-22 22:03:08	\N
a9bbd669-f309-4824-b79c-134bf7d349e8	a06b8d83-18d4-4241-95c6-66216c4dc431	a06b8d8a-cbe5-4ba7-b149-dc6739893ba2	\N	sectorization	2025-09-14	150.00	135.00	10862.00	Operations Team	\N	\N	Sectorization in DMA Zone 2 - Kilimani	2025-11-22 22:03:09	2025-11-22 22:03:09	\N
cd062615-4fc9-4bcb-85f9-506fdf59fe55	a06b8d83-18d4-4241-95c6-66216c4dc431	a06b8d8a-cbe5-4ba7-b149-dc6739893ba2	\N	sectorization	2025-10-26	122.00	\N	18163.00	Operations Team	\N	\N	Sectorization in DMA Zone 2 - Kilimani	2025-11-22 22:03:09	2025-11-22 22:03:09	\N
cb71e70e-7e49-4df6-a69c-3e7156f29050	a06b8d83-18d4-4241-95c6-66216c4dc431	a06b8d8a-cbe5-4ba7-b149-dc6739893ba2	\N	campaign	2025-10-29	23.00	\N	4329.00	Operations Team	\N	\N	Campaign in DMA Zone 2 - Kilimani	2025-11-22 22:03:09	2025-11-22 22:03:09	\N
c82b8ec4-4638-4892-a9e4-3958042bb404	a06b8d83-18d4-4241-95c6-66216c4dc431	a06b8d8b-ceb2-4102-86c3-7d4baaf3904a	\N	meter_replacement	2025-07-19	36.00	39.24	7312.00	Operations Team	\N	\N	Meter replacement in DMA Zone 3 - Eastleigh	2025-11-22 22:03:10	2025-11-22 22:03:10	\N
ecb77c23-9ee5-4b7c-85f1-03bf9a40efbb	a06b8d83-18d4-4241-95c6-66216c4dc431	a06b8d8b-ceb2-4102-86c3-7d4baaf3904a	\N	campaign	2025-06-12	35.00	37.45	7703.00	Operations Team	\N	\N	Campaign in DMA Zone 3 - Eastleigh	2025-11-22 22:03:10	2025-11-22 22:03:10	\N
9454d9b2-679d-4edc-8b8d-7c3c380f09b3	a06b8d83-18d4-4241-95c6-66216c4dc431	a06b8d8b-ceb2-4102-86c3-7d4baaf3904a	\N	leak_repair	2025-08-11	187.00	222.53	10650.00	Operations Team	\N	\N	Leak repair in DMA Zone 3 - Eastleigh	2025-11-22 22:03:10	2025-11-22 22:03:10	\N
\.


--
-- TOC entry 5715 (class 0 OID 335930)
-- Dependencies: 230
-- Data for Name: job_batches; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.job_batches (id, name, total_jobs, pending_jobs, failed_jobs, failed_job_ids, options, cancelled_at, created_at, finished_at) FROM stdin;
\.


--
-- TOC entry 5714 (class 0 OID 335921)
-- Dependencies: 229
-- Data for Name: jobs; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.jobs (id, queue, payload, attempts, reserved_at, available_at, created_at) FROM stdin;
\.


--
-- TOC entry 5750 (class 0 OID 336462)
-- Dependencies: 265
-- Data for Name: kb_articles; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.kb_articles (id, tenant_id, title, category, tags, content, attachments, version, status, author_id, reviewers, approver_id, reviewed_at, published_at, views_count, helpful_count, not_helpful_count, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- TOC entry 5811 (class 0 OID 337386)
-- Dependencies: 326
-- Data for Name: kms_keys; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.kms_keys (id, name, purpose, key_ref, rotated_at, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5740 (class 0 OID 336349)
-- Dependencies: 255
-- Data for Name: lesson_progress; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.lesson_progress (id, enrollment_id, lesson_id, is_completed, time_spent_seconds, completed_at, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5736 (class 0 OID 336303)
-- Dependencies: 251
-- Data for Name: lessons; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.lessons (id, course_id, title, type, content_url, content_json, order_index, duration_min, is_mandatory, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5726 (class 0 OID 336112)
-- Dependencies: 241
-- Data for Name: lookup_values; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.lookup_values (id, domain, code, label, "order", active, meta, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5732 (class 0 OID 336246)
-- Dependencies: 247
-- Data for Name: map_layer_configs; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.map_layer_configs (id, tenant_id, layer_name, display_name, is_visible, z_index, style_rules, filterspg_dump: dumping contents of table "public.map_layer_configs"
pg_dump: processing data for table "public.meter_captures"
pg_dump: dumping contents of table "public.meter_captures"
pg_dump: processing data for table "public.migrations"
pg_dump: dumping contents of table "public.migrations"
pg_dump: processing data for table "public.model_has_permissions"
pg_dump: dumping contents of table "public.model_has_permissions"
pg_dump: processing data for table "public.model_has_roles"
pg_dump: dumping contents of table "public.model_has_roles"
pg_dump: processing data for table "public.network_nodes"
pg_dump: dumping contents of table "public.network_nodes"
, tile_endpoint, min_zoom, max_zoom, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5779 (class 0 OID 336972)
-- Dependencies: 294
-- Data for Name: meter_captures; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.meter_captures (id, asset_meter_id, captured_at, value, source, meta, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5707 (class 0 OID 335873)
-- Dependencies: 222
-- Data for Name: migrations; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.migrations (id, migration, batch) FROM stdin;
1	0001_01_01_000000_create_users_table	1
2	0001_01_01_000001_create_cache_table	1
3	0001_01_01_000002_create_jobs_table	1
4	2024_12_01_000000_create_core_registry_tables	1
5	2025_01_24_create_gis_versioning_tables	1
6	2025_01_24_create_training_tables	1
7	2025_11_07_124144_create_permission_tables	1
8	2025_11_07_124145_create_personal_access_tokens_table	1
10	2025_11_08_041927_create_cmms_tables	1
11	2025_11_07_124152_create_security_and_compliance_tables	2
12	2025_11_09_131454_create_operations_shifts_tables	1
13	2025_11_09_131500_create_operations_events_tables	1
14	2025_11_09_131500_create_operations_notifications_tables	1
15	2025_11_08_041927_create_cmms_tables	2
22	2025_11_09_223404_create_wq_parameters_table	1
23	2025_11_09_223405_create_wq_plans_table	1
24	2025_11_09_223405_create_wq_sampling_points_table	3
25	2025_11_09_223406_create_wq_plan_rules_table	3
26	2025_11_09_223407_create_wq_samples_table	3
27	2025_11_09_223408_create_wq_sample_params_table	3
28	2025_11_09_223409_create_wq_results_table	3
29	2025_11_09_223410_create_wq_compliance_table	3
30	2025_11_09_223410_create_wq_qc_controls_table	3
31	2025_11_09_225857_add_facility_id_to_wq_sampling_points_table	3
32	2025_11_09_232828_create_crm_premises_table	3
33	2025_11_09_232829_create_crm_meters_table	3
34	2025_11_09_232830_create_crm_service_connections_table	3
35	2025_11_09_232832_create_crm_customers_table	3
36	2025_11_09_232934_create_crm_tariffs_table	3
37	2025_11_09_232935_create_crm_invoices_table	3
38	2025_11_09_232936_create_crm_invoice_lines_table	3
39	2025_11_09_232936_create_crm_payments_table	3
40	2025_11_09_232937_create_crm_balances_table	3
41	2025_11_09_232938_create_crm_payment_plans_table	3
42	2025_11_09_234712_create_crm_customer_reads_table	3
43	2025_11_09_234713_create_crm_ra_rules_table	3
44	2025_11_20_173923_create_core_ops_nrw_interventions_tables	4
45	2025_11_20_173925_create_core_ops_dosing_control_tables	5
46	2025_11_20_173926_create_core_ops_pump_scheduling_tables	6
47	2025_11_20_173922_create_core_ops_telemetry_scada_tables	7
\.


--
-- TOC entry 5765 (class 0 OID 336648)
-- Dependencies: 280
-- Data for Name: model_has_permissions; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.model_has_permissions (permission_id, model_type, model_id) FROM stdin;
\.


--
-- TOC entry 5766 (class 0 OID 336664)
-- Dependencies: 281
-- Data for Name: model_has_roles; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.model_has_roles (role_id, model_type, model_id) FROM stdin;
\.


--
-- TOC entry 5879 (class 0 OID 338532)
-- Dependencies: 394
-- Data for Name: network_nodes; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.network_nodes (id, tenant_id, scheme_id, type, code, elevation_m, geom, created_at, updated_at, deleted_at) FROM stdin;
283335d7-405b-435e-be34-5899c07f396c	a06b8d83-18d4-4241-95c6-66216c4dc431	a06b8d87-3fe2-4e26-80ec-e65eacd1ddca	junction	FAC-CPR-008_NODE	1390.00	0101000020E6100000A69BC420B072F4BF9EEFA7C64B674240	2025-11-22 22:02:24	2025-11-22 22:02:24	\N
9d23f6be-e14c-4594-801d-485a19a2be87	a06b8d83-18d4-4241-95c6-66216c4dc431	a06b8d87-3fe2-4e26-80ec-e65eacd1ddca	junction	FAC-GPS-003_NODE	1532.00	0101000020E61000000E2DB29DEFA7F4BF48E17A14AE674240	2025-11-22 22:02:24	2025-11-22 22:02:24	\N
34fe99f1-f06b-47cb-b60f-edb32bdc5e02	a06b8d83-18d4-4241-95c6-66216c4dc431	a06b8d87-3fe2-4e26-80ec-e65eacd1ddca	junction	FAC-KBS-005_NODE	1214.00	0101000020E6100000A4703D0AD7A3F4BF0C022B8716694240	2025-11-22 22:02:25	2025-11-2pg_dump: processing data for table "public.notifications"
pg_dump: dumping contents of table "public.notifications"
pg_dump: processing data for table "public.nrw_snapshots"
pg_dump: dumping contents of table "public.nrw_snapshots"
2 22:02:25	\N
e8a57822-9ec3-49bd-be6f-a4f8468a2916	a06b8d83-18d4-4241-95c6-66216c4dc431	a06b8d87-3fe2-4e26-80ec-e65eacd1ddca	junction	FAC-KWQL-006_NODE	1703.00	0101000020E610000039B4C876BE9FF4BF60E5D022DB694240	2025-11-22 22:02:25	2025-11-22 22:02:25	\N
2ee02083-4ab1-4150-a254-91c322e54c51	a06b8d83-18d4-4241-95c6-66216c4dc431	a06b8d87-3fe2-4e26-80ec-e65eacd1ddca	junction	FAC-NDS-007_NODE	1714.00	0101000020E6100000E3A59BC420B0F4BF46B6F3FDD4684240	2025-11-22 22:02:25	2025-11-22 22:02:25	\N
51777cbb-8c13-4c0b-96b2-ca94d01b57ea	a06b8d83-18d4-4241-95c6-66216c4dc431	a06b8d87-3fe2-4e26-80ec-e65eacd1ddca	junction	FAC-NSS-002_NODE	1416.00	0101000020E61000000E2DB29DEFA7F4BFF0A7C64B37694240	2025-11-22 22:02:26	2025-11-22 22:02:26	\N
2c73c524-e230-45e9-ae93-5cebb17fd068	a06b8d83-18d4-4241-95c6-66216c4dc431	a06b8d87-3fe2-4e26-80ec-e65eacd1ddca	junction	FAC-RSR-004_NODE	1583.00	0101000020E6100000B81E85EB51B8F4BFD34D621058694240	2025-11-22 22:02:26	2025-11-22 22:02:26	\N
2425346d-86f5-4ebf-9e2f-13dcf1a40171	a06b8d83-18d4-4241-95c6-66216c4dc431	a06b8d87-3fe2-4e26-80ec-e65eacd1ddca	junction	FAC-SWTP-001_NODE	1467.00	0101000020E610000079E9263108ACF4BF295C8FC2F5684240	2025-11-22 22:02:26	2025-11-22 22:02:26	\N
\.


--
-- TOC entry 5830 (class 0 OID 337620)
-- Dependencies: 345
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.notifications (id, channel, "to", subject, body, sent_at, status, meta, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5873 (class 0 OID 338384)
-- Dependencies: 388
-- Data for Name: nrw_snapshots; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.nrw_snapshots (id, tenant_id, dma_id, as_of, system_input_volume_m3, billed_authorized_m3, unbilled_authorized_m3, apparent_losses_m3, real_losses_m3, nrw_m3, nrw_pct, created_at, updated_at, deleted_at) FROM stdin;
e1692e43-653b-42b2-8547-345211a48091	a06b8d83-18d4-4241-95c6-66216c4dc431	a06b8d89-c850-49a3-9d8f-1ae553d61221	2025-11-30	12624.00	9089.28	252.48	1050.32	2231.92	3282.24	26.000	2025-11-22 22:03:02	2025-11-22 22:03:02	\N
313a3364-c570-4104-ab39-ac298e150802	a06b8d83-18d4-4241-95c6-66216c4dc431	a06b8d89-c850-49a3-9d8f-1ae553d61221	2025-10-31	13812.00	9115.92	414.36	1712.69	2569.03	4281.72	31.000	2025-11-22 22:03:02	2025-11-22 22:03:02	\N
6a6a20cc-1ec8-4c17-aa59-98a1b1b29f44	a06b8d83-18d4-4241-95c6-66216c4dc431	a06b8d89-c850-49a3-9d8f-1ae553d61221	2025-09-30	11963.00	8254.47	478.52	969.00	2261.01	3230.01	27.000	2025-11-22 22:03:02	2025-11-22 22:03:02	\N
c34a41cd-6bc3-4f4f-bfae-13ef0413f28e	a06b8d83-18d4-4241-95c6-66216c4dc431	a06b8d89-c850-49a3-9d8f-1ae553d61221	2025-08-31	14473.00	11578.40	723.65	868.38	1302.57	2170.95	15.000	2025-11-22 22:03:03	2025-11-22 22:03:03	\N
3dffcfed-bb99-485c-a1db-f68213bce67d	a06b8d83-18d4-4241-95c6-66216c4dc431	a06b8d89-c850-49a3-9d8f-1ae553d61221	2025-07-31	8799.00	6159.30	175.98	911.58	1552.14	2463.72	28.000	2025-11-22 22:03:03	2025-11-22 22:03:03	\N
bc5e57c4-4892-46d3-8850-24c94afe7324	a06b8d83-18d4-4241-95c6-66216c4dc431	a06b8d89-c850-49a3-9d8f-1ae553d61221	2025-06-30	13076.00	9545.48	523.04	1142.84	1864.64	3007.48	23.000	2025-11-22 22:03:03	2025-11-22 22:03:03	\N
68562b1f-7b93-4614-8013-5d84c6a086c6	a06b8d83-18d4-4241-95c6-66216c4dc431	a06b8d8a-cbe5-4ba7-b149-dc6739893ba2	2025-11-30	10660.00	7995.00	426.40	850.67	1387.93	2238.60	21.000	2025-11-22 22:03:04	2025-11-22 22:03:04	\N
e271dd27-71af-45e8-a06a-70219a19b026	a06b8d83-18d4-4241-95c6-66216c4dc431	a06b8d8a-cbe5-4ba7-b149-dc6739893ba2	2025-10-31	9458.00	6431.44	189.16	936.34	1901.06	2837.40	30.000	2025-11-22 22:03:04	2025-11-22 22:03:04	\N
9707214e-c1a8-4371-8aed-7cc3ffe1c7fd	a06b8d83-18d4-4241-95c6-66216c4dc431	a06b8d8a-cbe5-4ba7-b149-dc6739893ba2	2025-09-30	12796.00	9724.96	511.84	1023.68	1535.52	2559.20	20.000	2025-11-22 22:03:04	2025-11-22 22:03:04	\N
26c10b68-718f-40c4-91f7-ab9535f61335	a06b8d83-18d4-4241-95c6-66216c4dc431	a06b8d8a-cbe5-4ba7-b149-dc6739893ba2	2025-08-31	13208.00	10302.24	264.16	1030.22	1611.38	2641.60	20.000	2025-11-22 22:03:05	2025-11-22 22:03:05	\N
b22dff79-41b9-4869-80e7-pg_dump: processing data for table "public.oncall_schedules"
pg_dump: dumping contents of table "public.oncall_schedules"
pg_dump: processing data for table "public.organizations"
pg_dump: dumping contents of table "public.organizations"
pg_dump: processing data for table "public.outages"
pg_dump: dumping contents of table "public.outages"
eea1940417d2	a06b8d83-18d4-4241-95c6-66216c4dc431	a06b8d8a-cbe5-4ba7-b149-dc6739893ba2	2025-07-31	12390.00	10035.90	619.50	520.38	1214.22	1734.60	14.000	2025-11-22 22:03:05	2025-11-22 22:03:05	\N
3f6b1b72-c37d-4393-9899-b1e2f29bd24a	a06b8d83-18d4-4241-95c6-66216c4dc431	a06b8d8a-cbe5-4ba7-b149-dc6739893ba2	2025-06-30	8608.00	6025.60	344.32	738.57	1499.51	2238.08	26.000	2025-11-22 22:03:05	2025-11-22 22:03:05	\N
73ef4e44-ae53-4df8-91b7-e3c2ae52485c	a06b8d83-18d4-4241-95c6-66216c4dc431	a06b8d8b-ceb2-4102-86c3-7d4baaf3904a	2025-11-30	13151.00	10652.31	526.04	690.43	1282.22	1972.65	15.000	2025-11-22 22:03:06	2025-11-22 22:03:06	\N
e1ceaec1-2e7f-4d27-bf6f-a4f158d572c0	a06b8d83-18d4-4241-95c6-66216c4dc431	a06b8d8b-ceb2-4102-86c3-7d4baaf3904a	2025-10-31	13146.00	10516.80	525.84	799.28	1304.08	2103.36	16.000	2025-11-22 22:03:06	2025-11-22 22:03:06	\N
33890eaa-d1f6-45fb-ae9c-f9731f113b41	a06b8d83-18d4-4241-95c6-66216c4dc431	a06b8d8b-ceb2-4102-86c3-7d4baaf3904a	2025-09-30	12214.00	8671.94	610.70	879.41	2051.95	2931.36	24.000	2025-11-22 22:03:06	2025-11-22 22:03:06	\N
fbf987ae-eae3-4421-8d13-9ff6dd2ede04	a06b8d83-18d4-4241-95c6-66216c4dc431	a06b8d8b-ceb2-4102-86c3-7d4baaf3904a	2025-08-31	11104.00	7439.68	555.20	1212.56	1896.56	3109.12	28.000	2025-11-22 22:03:07	2025-11-22 22:03:07	\N
ca70a896-edeb-4466-a629-53af6d3094b7	a06b8d83-18d4-4241-95c6-66216c4dc431	a06b8d8b-ceb2-4102-86c3-7d4baaf3904a	2025-07-31	13987.00	10909.86	419.61	1063.01	1594.52	2657.53	19.000	2025-11-22 22:03:07	2025-11-22 22:03:07	\N
0fc37b41-18e9-43a9-99a0-0bc991b5446e	a06b8d83-18d4-4241-95c6-66216c4dc431	a06b8d8b-ceb2-4102-86c3-7d4baaf3904a	2025-06-30	10021.00	7114.91	400.84	926.94	1578.31	2505.25	25.000	2025-11-22 22:03:07	2025-11-22 22:03:07	\N
\.


--
-- TOC entry 5760 (class 0 OID 336584)
-- Dependencies: 275
-- Data for Name: oncall_schedules; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.oncall_schedules (id, tenant_id, team, ladder, start_date, rotation_days, escalation_rules, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5719 (class 0 OID 335963)
-- Dependencies: 234
-- Data for Name: organizations; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.organizations (id, tenant_id, org_code, name, type, email, phone, address, meta, created_at, updated_at, deleted_at, geom) FROM stdin;
a06b8d84-2611-4230-ab4d-856119438db8	a06b8d83-18d4-4241-95c6-66216c4dc431	NWSC	Nairobi Water & Sewerage Company	utility	\N	\N	\N	\N	2025-11-22 21:59:21	2025-11-22 21:59:21	\N	\N
a06b9929-073f-4654-96a9-2af34ac707d3	a06b9928-048c-43c7-8284-5885a4aa40f1	GWC	Garissa Water & Sanitation Company	utility	\N	\N	\N	\N	2025-11-22 22:31:55	2025-11-22 22:31:55	\N	\N
\.


--
-- TOC entry 5880 (class 0 OID 338552)
-- Dependencies: 395
-- Data for Name: outages; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.outages (id, tenant_id, dma_id, code, cause, state, starts_at, ends_at, actual_restored_at, customers_affected, geom, created_at, updated_at, deleted_at) FROM stdin;
82956f29-67d1-46b5-a3a9-aad3e1a40da3	a06b8d83-18d4-4241-95c6-66216c4dc431	a06b8d89-c850-49a3-9d8f-1ae553d61221	OUT-L3BX5N	Emergency leak repair	in_progress	2025-12-06 22:03:11+00	2025-12-07 06:03:11+00	\N	276	0103000020E61000000100000005000000FA7E6ABC7493F4BF7F6ABC7493684240FA7E6ABC7493F4BF62105839B4684240643BDF4F8D97F4BF62105839B4684240643BDF4F8D97F4BF7F6ABC7493684240FA7E6ABC7493F4BF7F6ABC7493684240	2025-11-22 22:03:11	2025-11-22 22:03:11	\N
223bd722-ee33-4eb6-9f95-857697cfed3e	a06b8d83-18d4-4241-95c6-66216c4dc431	a06b8d89-c850-49a3-9d8f-1ae553d61221	OUT-IBTZN3	Emergency leak repair	scheduled	2025-12-08 22:03:11+00	2025-12-09 05:03:11+00	\N	135	0103000020E61000000100000005000000FA7E6ABC7493F4BF7F6ABC7493684240FA7E6ABC7493F4BF62105839B4684240643BDF4F8D97F4BF62105839B4684240643BDF4F8D97F4BF7F6ABC7493684240FA7E6ABC7493F4BF7F6ABC7493684240	2025-11-22 22:03:11	2025-11-22 22:03:11	\N
09ae237c-b7a2-4125-9ab3-19b9e9f05dca	a06b8d83-18d4-4241-95c6-66216c4dc431	a06b8d8a-cbe5-4ba7-b149-dc6739893ba2	OUT-93PGLY	Emergency leak repair	scheduled	2025-11-22 17:03:11+0pg_dump: processing data for table "public.parts"
pg_dump: dumping contents of table "public.parts"
pg_dump: processing data for table "public.password_reset_tokens"
pg_dump: dumping contents of table "public.password_reset_tokens"
pg_dump: processing data for table "public.permissions"
pg_dump: dumping contents of table "public.permissions"
0	2025-11-22 22:03:11+00	\N	255	0103000020E61000000100000005000000FA7E6ABC7493F4BF7F6ABC7493684240FA7E6ABC7493F4BF62105839B4684240643BDF4F8D97F4BF62105839B4684240643BDF4F8D97F4BF7F6ABC7493684240FA7E6ABC7493F4BF7F6ABC7493684240	2025-11-22 22:03:11	2025-11-22 22:03:11	\N
00c71a95-8252-4a8c-93f1-13e8535d284b	a06b8d83-18d4-4241-95c6-66216c4dc431	a06b8d8a-cbe5-4ba7-b149-dc6739893ba2	OUT-LEB904	Emergency leak repair	in_progress	2025-12-07 22:03:12+00	2025-12-08 10:03:12+00	\N	301	0103000020E61000000100000005000000FA7E6ABC7493F4BF7F6ABC7493684240FA7E6ABC7493F4BF62105839B4684240643BDF4F8D97F4BF62105839B4684240643BDF4F8D97F4BF7F6ABC7493684240FA7E6ABC7493F4BF7F6ABC7493684240	2025-11-22 22:03:12	2025-11-22 22:03:12	\N
da53cdd2-2a3c-481b-99ec-e20a16f4197c	a06b8d83-18d4-4241-95c6-66216c4dc431	a06b8d8b-ceb2-4102-86c3-7d4baaf3904a	OUT-JEGX5X	Pump maintenance	scheduled	2025-12-19 22:03:12+00	2025-12-20 08:03:12+00	\N	103	0103000020E61000000100000005000000FA7E6ABC7493F4BF7F6ABC7493684240FA7E6ABC7493F4BF62105839B4684240643BDF4F8D97F4BF62105839B4684240643BDF4F8D97F4BF7F6ABC7493684240FA7E6ABC7493F4BF7F6ABC7493684240	2025-11-22 22:03:12	2025-11-22 22:03:12	\N
05d898c3-603f-41a9-b623-252281aaefd1	a06b8d83-18d4-4241-95c6-66216c4dc431	a06b8d8b-ceb2-4102-86c3-7d4baaf3904a	OUT-BMFL5Y	Emergency leak repair	completed	2025-12-16 22:03:12+00	2025-12-17 09:03:12+00	2025-12-17 09:14:12+00	425	0103000020E61000000100000005000000FA7E6ABC7493F4BF7F6ABC7493684240FA7E6ABC7493F4BF62105839B4684240643BDF4F8D97F4BF62105839B4684240643BDF4F8D97F4BF7F6ABC7493684240FA7E6ABC7493F4BF7F6ABC7493684240	2025-11-22 22:03:12	2025-11-22 22:03:12	\N
3bfa368d-833b-4585-937d-599e9fb31d11	a06b8d83-18d4-4241-95c6-66216c4dc431	a06b8d8b-ceb2-4102-86c3-7d4baaf3904a	OUT-7EX8OH	Emergency leak repair	draft	2025-12-11 22:03:13+00	2025-12-12 06:03:13+00	\N	294	0103000020E61000000100000005000000FA7E6ABC7493F4BF7F6ABC7493684240FA7E6ABC7493F4BF62105839B4684240643BDF4F8D97F4BF62105839B4684240643BDF4F8D97F4BF7F6ABC7493684240FA7E6ABC7493F4BF7F6ABC7493684240	2025-11-22 22:03:13	2025-11-22 22:03:13	\N
\.


--
-- TOC entry 5781 (class 0 OID 336989)
-- Dependencies: 296
-- Data for Name: parts; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.parts (id, tenant_id, code, name, category, unit, min_qty, reorder_qty, cost, location, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5709 (class 0 OID 335890)
-- Dependencies: 224
-- Data for Name: password_reset_tokens; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.password_reset_tokens (email, token, created_at) FROM stdin;
\.


--
-- TOC entry 5762 (class 0 OID 336612)
-- Dependencies: 277
-- Data for Name: permissions; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.permissions (id, name, guard_name, created_at, updated_at) FROM stdin;
1	view events	web	2025-11-22 22:37:22	2025-11-22 22:37:22
2	create events	web	2025-11-22 22:37:23	2025-11-22 22:37:23
3	ingest events	web	2025-11-22 22:37:24	2025-11-22 22:37:24
4	acknowledge events	web	2025-11-22 22:37:25	2025-11-22 22:37:25
5	resolve events	web	2025-11-22 22:37:26	2025-11-22 22:37:26
6	escalate events	web	2025-11-22 22:37:27	2025-11-22 22:37:27
7	edit events	web	2025-11-22 22:37:28	2025-11-22 22:37:28
8	delete events	web	2025-11-22 22:37:29	2025-11-22 22:37:29
9	view shifts	web	2025-11-22 22:37:30	2025-11-22 22:37:30
10	create shifts	web	2025-11-22 22:37:31	2025-11-22 22:37:31
11	edit shifts	web	2025-11-22 22:37:32	2025-11-22 22:37:32
12	close shifts	web	2025-11-22 22:37:33	2025-11-22 22:37:33
13	view handover reports	web	2025-11-22 22:37:34	2025-11-22 22:37:34
14	create handover reports	web	2025-11-22 22:37:35	2025-11-22 22:37:35
15	view playbooks	web	2025-11-22 22:37:36	2025-11-22 22:37:36
16	create playbooks	web	2025-11-22 22:37:37	2025-11-22 22:37:37
17	edit playbooks	web	2025-11-22 22:37:38	2025-11-22 22:37:38
18	delete playbooks	web	2025-11-22 22:37:39	2025-11-22 22:37:39
19	approve playbooks	web	2025-11-22 22:37:40	2025-11-22 22:37:40
20	execute playbooks	web	2025-11-22 22:37:41	2025-11-22 22:37:41
21	view checklists	webpg_dump: processing data for table "public.personal_access_tokens"
pg_dump: dumping contents of table "public.personal_access_tokens"
pg_dump: processing data for table "public.pipelines"
pg_dump: dumping contents of table "public.pipelines"
	2025-11-22 22:37:42	2025-11-22 22:37:42
22	create checklists	web	2025-11-22 22:37:43	2025-11-22 22:37:43
23	edit checklists	web	2025-11-22 22:37:44	2025-11-22 22:37:44
24	delete checklists	web	2025-11-22 22:37:45	2025-11-22 22:37:45
25	run checklists	web	2025-11-22 22:37:46	2025-11-22 22:37:46
26	view escalation policies	web	2025-11-22 22:37:47	2025-11-22 22:37:47
27	manage escalation policies	web	2025-11-22 22:37:48	2025-11-22 22:37:48
28	view notifications	web	2025-11-22 22:37:49	2025-11-22 22:37:49
29	manage notifications	web	2025-11-22 22:37:50	2025-11-22 22:37:50
\.


--
-- TOC entry 5769 (class 0 OID 336691)
-- Dependencies: 284
-- Data for Name: personal_access_tokens; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.personal_access_tokens (id, tokenable_type, tokenable_id, name, token, abilities, last_used_at, expires_at, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5723 (class 0 OID 336049)
-- Dependencies: 238
-- Data for Name: pipelines; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.pipelines (id, tenant_id, scheme_id, code, material, diameter_mm, install_year, status, meta, created_at, updated_at, deleted_at, geom) FROM stdin;
a06b8d9a-7ee8-4ded-89ea-517ab55df96f	a06b8d83-18d4-4241-95c6-66216c4dc431	a06b8d85-2ff6-467b-afc0-7854decad03b	PIPE-TR-001	DI	800	2015	active	\N	2025-11-22 21:59:36	2025-11-22 21:59:36	\N	0102000020E6100000030000009A9999999999F1BF3333333333534240B81E85EB51B8F2BF7B14AE47E15A4240D7A3703D0AD7F3BFA4703D0AD7634240
a06b8d9b-81ed-4e42-93db-30bb44dcef9a	a06b8d83-18d4-4241-95c6-66216c4dc431	a06b8d85-2ff6-467b-afc0-7854decad03b	PIPE-DS-002	uPVC	300	2018	active	\N	2025-11-22 21:59:37	2025-11-22 21:59:37	\N	0102000020E6100000030000007B14AE47E17AF4BF48E17A14AE674240A4703D0AD7A3F4BF295C8FC2F5684240CDCCCCCCCCCCF4BF295C8FC2F5684240
a06b8d9c-846f-4a4b-b775-f361f2560699	a06b8d83-18d4-4241-95c6-66216c4dc431	a06b8d85-2ff6-467b-afc0-7854decad03b	PIPE-DS-003	HDPE	200	2020	active	\N	2025-11-22 21:59:37	2025-11-22 21:59:37	\N	0102000020E610000003000000A4703D0AD7A3F4BFC3F5285C8F624240CDCCCCCCCCCCF4BFA4703D0AD7634240F6285C8FC2F5F4BF85EB51B81E654240
a06b8d9d-8751-482e-857c-761cd6b8c8a0	a06b8d83-18d4-4241-95c6-66216c4dc431	a06b8d85-2ff6-467b-afc0-7854decad03b	PIPE-TR-004	Steel	600	2012	active	\N	2025-11-22 21:59:38	2025-11-22 21:59:38	\N	0102000020E610000003000000D7A3703D0AD7F3BFA4703D0AD7634240000000000000F4BFEC51B81E856B4240000000000000F4BF713D0AD7A3704240
a06b8d9e-8a11-41ad-9d56-f11cc59308ad	a06b8d83-18d4-4241-95c6-66216c4dc431	a06b8d85-2ff6-467b-afc0-7854decad03b	PIPE-DS-005	DI	400	2016	active	\N	2025-11-22 21:59:39	2025-11-22 21:59:39	\N	0102000020E610000003000000F6285C8FC2F5F4BFEC51B81E856B42401F85EB51B81EF5BFCDCCCCCCCC6C4240713D0AD7A370F5BFAE47E17A146E4240
a06b9a26-fa16-4ada-beac-5b12092f3fb7	a06b9928-048c-43c7-8284-5885a4aa40f1	a06b992a-0c2f-437d-b92e-b0b93d5b0eeb	PIPE-G-001	DI	400	2015	active	{"type": "primary_main", "length_km": 15.5, "description": "Tana River to WTP Primary Main"}	2025-11-22 22:34:41	2025-11-22 22:34:41	\N	0102000020E610000003000000000000000000E0BF6666666666C64340B81E85EB51B8DEBFCDCCCCCCCCCC4340CDCCCCCCCCCCDCBF52B81E85EBD14340
a06b9a28-0df4-421a-af7a-b86f2edc198f	a06b9928-048c-43c7-8284-5885a4aa40f1	a06b992a-0c2f-437d-b92e-b0b93d5b0eeb	PIPE-G-002	AC	300	2016	active	{"type": "secondary_main", "length_km": 2, "description": "WTP to Main Reservoir Pipeline"}	2025-11-22 22:34:42	2025-11-22 22:34:42	\N	0102000020E610000002000000CDCCCCCCCCCCDCBF52B81E85EBD143401F85EB51B81EDDBFA4703D0AD7D34340
a06b9a29-0f98-4837-b378-d8f598032411	a06b9928-048c-43c7-8284-5885a4aa40f1	a06b992a-0c2f-437d-b92e-b0b93d5b0eeb	PIPE-G-003	uPVC	200	2017	active	{"type": "distribution_main", "length_km": 45.8, "description": "Distribution Main - Town Network"}	2025-11-22 22:34:43	2025-11-22 22:34:43	\N	0102000020E6100000030000001F85EB51B81EDDBFA4703D0AD7D34340713D0AD7A370DDBF14AE47E17AD44340295C8FC2F528DCBF3333333333D34340
\.


--
-- TOC entry 5824 (class 0 OID 337566)
-- Dependencies: 339
-- Data for Name: playbooks; Type: TABLE DATA; Schema: public; Owner: neondpg_dump: processing data for table "public.playbooks"
pg_dump: dumping contents of table "public.playbooks"
pg_dump: processing data for table "public.pm_policies"
pg_dump: dumping contents of table "public.pm_policies"
pg_dump: processing data for table "public.pm_schedules"
pg_dump: dumping contents of table "public.pm_schedules"
pg_dump: processing data for table "public.pump_schedules"
pg_dump: dumping contents of table "public.pump_schedules"
pg_dump: processing data for table "public.questions"
pg_dump: dumping contents of table "public.questions"
pg_dump: processing data for table "public.redlines"
pg_dump: dumping contents of table "public.redlines"
pg_dump: processing data for table "public.retention_policies"
pg_dump: dumping contents of table "public.retention_policies"
pg_dump: processing data for table "public.role_has_permissions"
pg_dump: dumping contents of table "public.role_has_permissions"
pg_dump: processing data for table "public.roles"
pg_dump: dumping contents of table "public.roles"
pg_dump: processing data for table "public.rosters"
pg_dump: dumping contents of table "public.rosters"
pg_dump: processing data for table "public.schemes"
pg_dump: dumping contents of table "public.schemes"
b_owner
--

COPY public.playbooks (id, tenant_id, name, for_category, for_severity, steps, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5787 (class 0 OID 337047)
-- Dependencies: 302
-- Data for Name: pm_policies; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.pm_policies (id, asset_id, strategy, interval_value, interval_unit, task, instructions, is_active, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5789 (class 0 OID 337066)
-- Dependencies: 304
-- Data for Name: pm_schedules; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.pm_schedules (id, pm_policy_id, next_due, last_done, status, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5878 (class 0 OID 338503)
-- Dependencies: 393
-- Data for Name: pump_schedules; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.pump_schedules (id, tenant_id, asset_id, scheme_id, start_at, end_at, status, constraints, source, target_volume_m3, actual_volume_m3, energy_cost, notes, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- TOC entry 5744 (class 0 OID 336388)
-- Dependencies: 259
-- Data for Name: questions; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.questions (id, assessment_id, type, question_text, options, correct_answer, explanation, points, order_index, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5729 (class 0 OID 336167)
-- Dependencies: 244
-- Data for Name: redlines; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.redlines (id, tenant_id, edit_layer_id, entity_type, entity_id, operation, attributes_before, attributes_after, captured_by, captured_at, capture_method, gps_accuracy_m, evidence, field_notes, created_at, updated_at, geom_before, geom_after) FROM stdin;
\.


--
-- TOC entry 5806 (class 0 OID 337308)
-- Dependencies: 321
-- Data for Name: retention_policies; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.retention_policies (id, entity_type, keep_for_days, action, legal_hold, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5767 (class 0 OID 336675)
-- Dependencies: 282
-- Data for Name: role_has_permissions; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.role_has_permissions (permission_id, role_id) FROM stdin;
3	1
6	1
20	1
\.


--
-- TOC entry 5764 (class 0 OID 336626)
-- Dependencies: 279
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.roles (id, name, guard_name, created_at, updated_at) FROM stdin;
1	System	web	2025-11-22 22:37:52	2025-11-22 22:37:52
\.


--
-- TOC entry 5758 (class 0 OID 336568)
-- Dependencies: 273
-- Data for Name: rosters; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.rosters (id, tenant_id, name, site, start_date, end_date, calendar, rules, status, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5720 (class 0 OID 335979)
-- Dependencies: 235
-- Data for Name: schemes; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.schemes (id, tenant_id, org_id, code, name, type, population_estimate, status, elevation_m, meta, created_at, updated_at, deleted_at, geom, centroid) FROM stdin;
a06b8d85-2ff6-467b-afc0-7854decad03b	a06b8d83-18d4-4241-95c6-66216c4dc431	a06b8d84-2611-4230-ab4d-856119438db8	NCWSS-001	Nairobi Central Water Supply Scheme	urban	1500000	active	\N	\N	2025-11-22 21:59:22	2025-11-22 21:59:22	\N	0103000020E61000000100000005000000000000000000F4BF0000000000604240000000000000F4BFCDCCCCCCCC6C42409A9999999999F5BFCDCCCCCCCC6C42409A9999999999F5BF0000000000604240000000000000F4BF0000000000604240	0101000020E6100000CDCCCCCCCCCCF4BF6666666666664240
a06b8d86-3cc3-48b7-b54e-7c3e4c99826c	a06b8d83-18d4-4241-95c6-66216c4dc431	a06b8d84-2611-4230-ab4d-856119438db8	WWSS-002	Westlands Water Supply Scheme	urban	450000	active	\N	\N	2025-11-22 21:59:23	2025-11-22 21:59:23	\N	0103000020E61000000100000005000000D7A3703D0AD7F3BFA4703D0AD7634240D7A3703D0AD7F3BF0AD7A3703D6A42407B14AE47E17AF4BF0AD7A3703D6A42407B14AE47E17AF4BFA4703D0AD7634240D7A3703D0ADpg_dump: processing data for table "public.secrets"
pg_dump: dumping contents of table "public.secrets"
pg_dump: processing data for table "public.security_alerts"
pg_dump: dumping contents of table "public.security_alerts"
pg_dump: processing data for table "public.sessions"
pg_dump: dumping contents of table "public.sessions"
pg_dump: processing data for table "public.shift_entries"
pg_dump: dumping contents of table "public.shift_entries"
7F3BFA4703D0AD7634240	0101000020E6100000295C8FC2F528F4BFD7A3703D0A674240
a06b8d87-3fe2-4e26-80ec-e65eacd1ddca	a06b8d83-18d4-4241-95c6-66216c4dc431	a06b8d84-2611-4230-ab4d-856119438db8	KRWP-003	Kikuyu Rural Water Project	rural	85000	active	\N	\N	2025-11-22 21:59:23	2025-11-22 21:59:23	\N	0103000020E61000000100000005000000333333333333F3BF8FC2F5285C4F4240333333333333F3BF5C8FC2F5285C42407B14AE47E17AF4BF5C8FC2F5285C42407B14AE47E17AF4BF8FC2F5285C4F4240333333333333F3BF8FC2F5285C4F4240	0101000020E6100000D7A3703D0AD7F3BFF6285C8FC2554240
a06b8d88-4259-4fbb-a729-023027b26971	a06b8d83-18d4-4241-95c6-66216c4dc431	a06b8d84-2611-4230-ab4d-856119438db8	TWSS-004	Thika Water & Sanitation Scheme	urban	250000	planning	\N	\N	2025-11-22 21:59:24	2025-11-22 21:59:24	\N	0103000020E61000000100000005000000000000000000F0BF6666666666864240000000000000F0BF333333333393424048E17A14AE47F1BF333333333393424048E17A14AE47F1BF6666666666864240000000000000F0BF6666666666864240	0101000020E6100000A4703D0AD7A3F0BFCDCCCCCCCC8C4240
a06b992a-0c2f-437d-b92e-b0b93d5b0eeb	a06b9928-048c-43c7-8284-5885a4aa40f1	a06b9929-073f-4654-96a9-2af34ac707d3	GCWSS-001	Garissa Central Water Supply Scheme	urban	120000	active	\N	\N	2025-11-22 22:31:56	2025-11-22 22:31:56	\N	0103000020E6100000010000000500000085EB51B81E85DBBF713D0AD7A3D0434085EB51B81E85DBBFD7A3703D0AD74340B81E85EB51B8DEBFD7A3703D0AD74340B81E85EB51B8DEBF713D0AD7A3D0434085EB51B81E85DBBF713D0AD7A3D04340	0101000020E61000001F85EB51B81EDDBFA4703D0AD7D34340
a06b992b-113c-4f9d-8d4d-7e5ebc770879	a06b9928-048c-43c7-8284-5885a4aa40f1	a06b9929-073f-4654-96a9-2af34ac707d3	GRWP-002	Garissa Rural Water Project	rural	45000	active	\N	\N	2025-11-22 22:31:56	2025-11-22 22:31:56	\N	0103000020E61000000100000005000000000000000000E0BF0000000000C04340000000000000E0BF6666666666E643409A9999999999C9BF6666666666E643409A9999999999C9BF0000000000C04340000000000000E0BF0000000000C04340	0101000020E6100000666666666666D6BF3333333333D34340
a06b992c-1474-418c-bf6d-10f448661cca	a06b9928-048c-43c7-8284-5885a4aa40f1	a06b9929-073f-4654-96a9-2af34ac707d3	IJWSP-003	Ijara Water Supply Project	rural	32000	planning	\N	\N	2025-11-22 22:31:57	2025-11-22 22:31:57	\N	0103000020E61000000100000005000000333333333333E3BF6666666666E64340333333333333E3BF9A99999999F94340000000000000E8BF9A99999999F94340000000000000E8BF6666666666E64340333333333333E3BF6666666666E64340	0101000020E61000009A9999999999E5BF0000000000F04340
a06b992d-191b-4b29-b6a7-7f714b1c93ba	a06b9928-048c-43c7-8284-5885a4aa40f1	a06b9929-073f-4654-96a9-2af34ac707d3	FWSS-004	Fafi Water Supply Scheme	rural	28000	active	\N	\N	2025-11-22 22:31:58	2025-11-22 22:31:58	\N	0103000020E61000000100000005000000333333333333D3BF3333333333B34340333333333333D3BFCDCCCCCCCCCC4340000000000000E0BFCDCCCCCCCCCC4340000000000000E0BF3333333333B34340333333333333D3BF3333333333B34340	0101000020E61000009A9999999999D9BF0000000000C04340
\.


--
-- TOC entry 5812 (class 0 OID 337394)
-- Dependencies: 327
-- Data for Name: secrets; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.secrets (id, tenant_id, key, value_ciphertext, created_by, rotated_at, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5810 (class 0 OID 337371)
-- Dependencies: 325
-- Data for Name: security_alerts; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.security_alerts (id, tenant_id, category, severity, message, details, raised_at, acknowledged_at, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5710 (class 0 OID 335897)
-- Dependencies: 225
-- Data for Name: sessions; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.sessions (id, user_id, ip_address, user_agent, payload, last_activity) FROM stdin;
\.


--
-- TOC entry 5814 (class 0 OID 337427)
-- Dependencies: 329
-- Data for Name: shift_entries; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.shift_entries (id, shift_id, kind, title, body, tags, created_by, geom, attachments, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5802 (class 0 OID 337237)
-- Dependencies: 317
-- Data for Name: shifts; Type: TABLE DATA; Schepg_dump: processing data for table "public.shifts"
pg_dump: dumping contents of table "public.shifts"
pg_dump: processing data for table "public.skills"
pg_dump: dumping contents of table "public.skills"
pg_dump: processing data for table "public.sops"
pg_dump: dumping contents of table "public.sops"
pg_dump: processing data for table "public.spatial_change_log"
pg_dump: dumping contents of table "public.spatial_change_log"
pg_dump: processing data for table "public.spatial_edit_layers"
pg_dump: dumping contents of table "public.spatial_edit_layers"
pg_dump: processing data for table "public.spatial_ref_sys"
pg_dump: dumping contents of table "public.spatial_ref_sys"
pg_dump: processing data for table "public.stock_txns"
pg_dump: dumping contents of table "public.stock_txns"
pg_dump: processing data for table "public.suppliers"
pg_dump: dumping contents of table "public.suppliers"
pg_dump: processing data for table "public.telemetry_measurements"
pg_dump: dumping contents of table "public.telemetry_measurements"
ma: public; Owner: neondb_owner
--

COPY public.shifts (id, tenant_id, facility_id, scheme_id, dma_id, name, starts_at, ends_at, supervisor_id, status, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5754 (class 0 OID 336518)
-- Dependencies: 269
-- Data for Name: skills; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.skills (id, tenant_id, code, name, description, levels, category, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5752 (class 0 OID 336493)
-- Dependencies: 267
-- Data for Name: sops; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.sops (id, tenant_id, code, title, category, metadata, content, version, status, reviewed_at, published_at, next_review_due, approver_id, attestations, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- TOC entry 5731 (class 0 OID 336222)
-- Dependencies: 246
-- Data for Name: spatial_change_log; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.spatial_change_log (id, tenant_id, entity_type, entity_id, action, changes, changed_by, change_source, redline_id, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5728 (class 0 OID 336136)
-- Dependencies: 243
-- Data for Name: spatial_edit_layers; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.spatial_edit_layers (id, tenant_id, name, layer_type, description, status, created_by, reviewed_by, approved_by, submitted_at, reviewed_at, approved_at, review_notes, metadata, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- TOC entry 4577 (class 0 OID 16793)
-- Dependencies: 217
-- Data for Name: spatial_ref_sys; Type: TABLE DATA; Schema: public; Owner: cloud_admin
--

COPY public.spatial_ref_sys (srid, auth_name, auth_srid, srtext, proj4text) FROM stdin;
\.


--
-- TOC entry 5794 (class 0 OID 337149)
-- Dependencies: 309
-- Data for Name: stock_txns; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.stock_txns (id, part_id, kind, qty, unit_cost, ref, work_order_id, occurred_at, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5785 (class 0 OID 337032)
-- Dependencies: 300
-- Data for Name: suppliers; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.suppliers (id, tenant_id, name, email, phone, address, terms, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5882 (class 0 OID 338607)
-- Dependencies: 397
-- Data for Name: telemetry_measurements; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.telemetry_measurements (id, telemetry_tag_id, ts, value, meta, created_at, updated_at) FROM stdin;
1526e891-c2cb-46a8-8c84-e9a9690fc46f	7443608a-7187-4f99-8a16-3634fe4607cc	2025-11-22 22:02:30+00	37.85	{"source": "scada", "quality": 192}	2025-11-22 22:02:30	2025-11-22 22:02:30
c8e45913-0adb-4ef9-919b-d8f097d785a7	7443608a-7187-4f99-8a16-3634fe4607cc	2025-11-22 21:02:30+00	57.96	{"source": "scada", "quality": 192}	2025-11-22 22:02:30	2025-11-22 22:02:30
8961b856-72b9-4d37-b5b0-0dcb37bc7dcc	7443608a-7187-4f99-8a16-3634fe4607cc	2025-11-22 20:02:30+00	80.35	{"source": "scada", "quality": 192}	2025-11-22 22:02:30	2025-11-22 22:02:30
1656a11f-3555-4a25-a33c-b413c51b7fe7	7443608a-7187-4f99-8a16-3634fe4607cc	2025-11-22 19:02:30+00	52.75	{"source": "scada", "quality": 192}	2025-11-22 22:02:31	2025-11-22 22:02:31
726286a7-6f26-4cd8-a85f-7630abca65fc	7443608a-7187-4f99-8a16-3634fe4607cc	2025-11-22 18:02:30+00	74.28	{"source": "scada", "quality": 192}	2025-11-22 22:02:31	2025-11-22 22:02:31
cdb09cfd-94a4-4dac-94ad-4c4eec18b959	7443608a-7187-4f99-8a16-3634fe4607cc	2025-11-22 17:02:30+00	51.73	{"source": "scada", "quality": 192}	2025-11-22 22:02:31	2025-11-22 22:02:31
be6d8b94-7e60-4a94-ab48-87bc459185a4	7443608a-7187-4f99-8a16-3634fe4607cc	2025-11-22 16:02:30+00	22.41	{"source": "scada", "quality": 192}	2025-11-22 22:02:32	2025-11-22 22:02:32
e38c19b9-d0bd-49a5-8df9-d42b441967cc	7443608a-7187-4f99-8a16-3634fe4607cc	2025-11-22 15:02:30+00	48.3	{"source": "scada", "quality": 192}	2025-11-22 22:02:32	2025-11-22 22:02:32
388c820a-4109-457e-a107-0540e95c6d23	7443608a-7187-4f99-8a16-3634fe4607cc	2025-11-22 14:02:30+00	32.04	{"source": "scada", "quality": 192}	2025-11-22 22:02:32	2025-11-22 22:02:32
e6b6f0b6-8d49-43e6-867f-0dffb37a363b	7443608a-7187-4f99-8a16-3634fe4607cc	2025-11-22 13:02:30+00	77.19	{"source": "scada", "quality": 192}	2025-11-22 22:02:33	2025-11-22 22:02:33
ed7f5bd2-0091-44ab-8134-04951ded166c	7443608a-7187-4f99-8a16-3634fe4607cc	2025-11-22 12:02:30+00	64.9	{"source": "scada", "quality": 192}	2025-11-22 22:02:33	2025-11-22 22:02:33
7c50ccdf-74a0-4f02-b18e-8eaf7e9909b2	7443608a-7187-4f99-8a16-3634fe4607cc	2025-11-22 11:02:30+00	34.69	{"source": "scada", "quality": 192}	2025-11-22 22:02:33	2025-11-22 22:02:33
db4f70e7-26c3-48b7-bc75-d8fbabb184d5	f3cd9369-49fa-454b-9073-b4c5b6482235	2025-11-22 22:02:30+00	3.93	{"source": "scada", "quality": 192}	2025-11-22 22:02:34	2025-11-22 22:02:34
dd93ffa9-d349-4ab7-941d-5859f99e472b	f3cd9369-49fa-454b-9073-b4c5b6482235	2025-11-22 21:02:30+00	2.57	{"source": "scada", "quality": 192}	2025-11-22 22:02:34	2025-11-22 22:02:34
68b4dd3d-a877-470f-ac1f-7590f5ad7ded	f3cd9369-49fa-454b-9073-b4c5b6482235	2025-11-22 20:02:30+00	4.31	{"source": "scada", "quality": 192}	2025-11-22 22:02:34	2025-11-22 22:02:34
979c1666-5506-4583-90b5-bbb74908e39c	f3cd9369-49fa-454b-9073-b4c5b6482235	2025-11-22 19:02:30+00	2.66	{"source": "scada", "quality": 192}	2025-11-22 22:02:35	2025-11-22 22:02:35
692f60de-7864-4787-9212-fdca4967d0b5	f3cd9369-49fa-454b-9073-b4c5b6482235	2025-11-22 18:02:30+00	6.85	{"source": "scada", "quality": 192}	2025-11-22 22:02:35	2025-11-22 22:02:35
27d8435f-fe0d-4ddc-80d6-9d02a12d1691	f3cd9369-49fa-454b-9073-b4c5b6482235	2025-11-22 17:02:30+00	5.21	{"source": "scada", "quality": 192}	2025-11-22 22:02:35	2025-11-22 22:02:35
af1212b8-9712-4d79-a7ac-a3dcff2d0014	f3cd9369-49fa-454b-9073-b4c5b6482235	2025-11-22 16:02:30+00	3.03	{"source": "scada", "quality": 192}	2025-11-22 22:02:36	2025-11-22 22:02:36
41ec8a44-8cce-4677-809b-6cd99e27f1cf	f3cd9369-49fa-454b-9073-b4c5b6482235	2025-11-22 15:02:30+00	3.96	{"source": "scada", "quality": 192}	2025-11-22 22:02:36	2025-11-22 22:02:36
a33b2bd1-c866-420f-919d-552cfdfb9e45	f3cd9369-49fa-454b-9073-b4c5b6482235	2025-11-22 14:02:30+00	4.18	{"source": "scada", "quality": 192}	2025-11-22 22:02:36	2025-11-22 22:02:36
d3222ce7-a870-45fa-b6cf-59a2efd96977	f3cd9369-49fa-454b-9073-b4c5b6482235	2025-11-22 13:02:30+00	6.66	{"source": "scada", "quality": 192}	2025-11-22 22:02:37	2025-11-22 22:02:37
e332e593-9325-4675-8eb0-66f9967f9331	f3cd9369-49fa-454b-9073-b4c5b6482235	2025-11-22 12:02:30+00	5.5	{"source": "scada", "quality": 192}	2025-11-22 22:02:37	2025-11-22 22:02:37
ee92286f-76bd-4f55-9073-a15e2cc7a5de	f3cd9369-49fa-454b-9073-b4c5b6482235	2025-11-22 11:02:30+00	3.59	{"source": "scada", "quality": 192}	2025-11-22 22:02:37	2025-11-22 22:02:37
20175e23-3890-4513-aa44-cf75bc1847bf	979c4db5-c5a1-41a6-bab8-dec05a76358b	2025-11-22 22:02:30+00	1	{"source": "scada", "quality": 192}	2025-11-22 22:02:38	2025-11-22 22:02:38
fc4dfa9b-4a3a-49e8-a820-ce8f7a07e19c	979c4db5-c5a1-41a6-bab8-dec05a76358b	2025-11-22 21:02:30+00	1	{"source": "scada", "quality": 192}	2025-11-22 22:02:38	2025-11-22 22:02:38
7200b281-ad2f-4e11-a8ff-756c2ad631e4	979c4db5-c5a1-41a6-bab8-dec05a76358b	2025-11-22 20:02:30+00	1	{"source": "scada", "quality": 192}	2025-11-22 22:02:38	2025-11-22 22:02:38
4c998f98-72fb-4b4d-9c3a-e5d51143abdf	979c4db5-c5a1-41a6-bab8-dec05a76358b	2025-11-22 19:02:30+00	1	{"source": "scada", "quality": 192}	2025-11-22 22:02:39	2025-11-22 22:02:39
7ea1880a-fa99-4647-898d-baaa3097fb88	979c4db5-c5a1-41a6-bab8-dec05a76358b	2025-11-22 18:02:30+00	0	{"source": "scada", "quality": 192}	2025-11-22 22:02:39	2025-11-22 22:02:39
f0aa7aa3-d4be-4577-9be2-f74577f1274f	979c4db5-c5a1-41a6-bab8-dec05a76358b	2025-11-22 17:02:30+00	0	{"source": "scada", "quality": 192}	2025-11-22 22:02:39	2025-11-22 22:02:39
3ccea46c-7182-4b99-ac61-6b4c293748ee	979c4db5-c5a1-41a6-bab8-dec05a76358b	2025-11-22 16:02:30+00	1	{"source": "scada", "quality": 192}	2025-11-22 22:02:40	2025-11-22 22:02:40
9b649921-20ec-4e97-9236-9c4bc25037e4	979c4db5-c5a1-41a6-bab8-dec05a76358b	2025-11-22 15:02:30+00	1	{"source": "scada", "quality": 192}	2025-11-22 22:02:40	2025-11-22 22:02:40
22d5e81b-33ca-412a-9918-723b7250370d	979c4db5-c5a1-41a6-bab8-dec05a76358b	2025-11-22 14:02:30+00	1	{"source": "scada", "quality": 192}	2025-11-22 22:02:40	2025-11-22 22:02:40
6214652c-6d6f-4fda-8079-6bcbfc5f5276	979c4db5-c5a1-41a6-bab8-dec05a76358b	2025-11-22 13:02:30+00	1	{"source": "scada", "quality": 192}	2025-11-22 22:02:41	2025-11-22 22:02:41
c5bdf9cf-b47f-4919-b3e2-ea3abc578fb5	979c4db5-c5a1-41a6-bab8-dec05a76358b	2025-11-22 12:02:30+00	1	{"source": "scada", "quality": 192}	2025-11-22 22:02:41	2025-11-22 22:02:41
8d6b5add-f026-4ed4-8b95-068988e8f092	979c4db5-c5a1-41a6-bab8-dec05a76358b	2025-11-22 11:02:30+00	0	{"source": "scada", "quality": 192}	2025-11-22 22:02:41	2025-11-22 22:02:41
074a0dc7-62df-4cb3-9b28-48f9a4afdb4a	f311c673-a755-41ff-b12c-b12400507c32	2025-11-22 22:02:30+00	37.98	{"source": "scada", "quality": 192}	2025-11-22 22:02:42	2025-11-22 22:02:42
29b94700-bb21-4ad5-bd78-2e8aa2e9bca8	f311c673-a755-41ff-b12c-b12400507c32	2025-11-22 21:02:30+00	24.87	{"source": "scada", "quality": 192}	2025-11-22 22:02:42	2025-11-22 22:02:42
e475cb49-3568-4ea0-9f59-e033a9479535	f311c673-a755-41ff-b12c-b12400507c32	2025-11-22 20:02:30+00	27.03	{"source": "scada", "quality": 192}	2025-11-22 22:02:42	2025-11-22 22:02:42
323abb01-b936-43e1-a728-521845afe956	f311c673-a755-41ff-b12c-b12400507c32	2025-11-22 19:02:30+00	12.63	{"source": "scada", "quality": 192}	2025-11-22 22:02:43	2025-11-22 22:02:43
7759662e-cdfa-4c33-8e79-d60db7830ca4	f311c673-a755-41ff-b12c-b12400507c32	2025-11-22 18:02:30+00	32.13	{"source": "scada", "quality": 192}	2025-11-22 22:02:43	2025-11-22 22:02:43
f3219a80-505a-4e9a-a5c1-573d41b91084	f311c673-a755-41ff-b12c-b12400507c32	2025-11-22 17:02:30+00	43.73	{"source": "scada", "quality": 192}	2025-11-22 22:02:43	2025-11-22 22:02:43
f6b0c699-0bb4-4ada-945e-cc695d760113	f311c673-a755-41ff-b12c-b12400507c32	2025-11-22 16:02:30+00	30.2	{"source": "scada", "quality": 192}	2025-11-22 22:02:44	2025-11-22 22:02:44
fbb56eb5-4607-47be-9609-3ad9282495d1	f311c673-a755-41ff-b12c-b12400507c32	2025-11-22 15:02:30+00	12.58	{"source": "scada", "quality": 192}	2025-11-22 22:02:44	2025-11-22 22:02:44
2b858f90-5368-476c-b367-b45845173e02	f311c673-a755-41ff-b12c-b12400507c32	2025-11-22 14:02:30+00	31.08	{"source": "scada", "quality": 192}	2025-11-22 22:02:44	2025-11-22 22:02:44
cff3a367-d97b-4a49-b872-79b08224b669	f311c673-a755-41ff-b12c-b12400507c32	2025-11-22 13:02:30+00	30.77	{"source": "scada", "quality": 192}	2025-11-22 22:02:45	2025-11-22 22:02:45
b5aeccd9-fd79-48fa-91ff-b6991956af98	f311c673-a755-41ff-b12c-b12400507c32	2025-11-22 12:02:30+00	39.64	{"source": "scada", "quality": 192}	2025-11-22 22:02:45	2025-11-22 22:02:45
52751741-ca17-49e2-9d41-4c020726d16e	f311c673-a755-41ff-b12c-b12400507c32	2025-11-22 11:02:30+00	35.24	{"source": "scada", "quality": 192}	2025-11-22 22:02:45	2025-11-22 22:02:45
21de6e07-edbe-4322-8c0f-d9754cba719f	310cce7f-b9f7-448c-9369-c084473a5b19	2025-11-22 22:02:30+00	5.75	{"source": "scada", "quality": 192}	2025-11-22 22:02:46	2025-11-22 22:02:46
92af1d29-54b2-4a2b-8bde-88adccae53b0	310cce7f-b9f7-448c-9369-c084473a5b19	2025-11-22 21:02:30+00	4.72	{"source": "scada", "quality": 192}	2025-11-22 22:02:46	2025-11-22 22:02:46
cdea4085-213d-4489-9f20-783b796d9eed	310cce7f-b9f7-448c-9369-c084473a5b19	2025-11-22 20:02:30+00	7.32	{"source": "scada", "quality": 192}	2025-11-22 22:02:46	2025-11-22 22:02:46
9066ecb8-4473-429d-8922-a0448d125e10	310cce7f-b9f7-448c-9369-c084473a5b19	2025-11-22 19:02:30+00	8.48	{"source": "scada", "quality": 192}	2025-11-22 22:02:47	2025-11-22 22:02:47
ef0ca5e5-9b5b-40f7-b13b-daff92feb8da	310cce7f-b9f7-448c-9369-c084473a5b19	2025-11-22 18:02:30+00	3.71	{"source": "scada", "quality": 192}	2025-11-22 22:02:47	2025-11-22 22:02:47
e2f5ef71-ee77-4adf-9ab6-661812225622	310cce7f-b9f7-448c-9369-c084473a5b19	2025-11-22 17:02:30+00	8.77	{"source": "scada", "quality": 192}	2025-11-22 22:02:47	2025-11-22 22:02:47
a3ce7b28-6bdf-4ccf-a6dc-93b24be2a7ab	310cce7f-b9f7-448c-9369-c084473a5b19	2025-11-22 16:02:30+00	6.11	{"source": "scada", "quality": 192}	2025-11-22 22:02:48	2025-11-22 22:02:48
e5564658-52ac-4ce1-ab7c-8d97af88f572	310cce7f-b9f7-448c-9369-c084473a5b19	2025-11-22 15:02:30+00	7.44	{"source": "scada", "quality": 192}	2025-11-22 22:02:48	2025-11-22 22:02:48
5fac4f59-e4bd-4bb9-b976-f2a992bf928f	310cce7f-b9f7-448c-9369-c084473a5b19	2025-11-22 14:02:30+00	3.18	{"source": "scada", "quality": 192}	2025-11-22 22:02:48	2025-11-22 22:02:48
0b80c3f1-fac3-438d-a5e7-f3992c1885f6	310cce7f-b9f7-448c-9369-c084473a5b19	2025-11-22 13:02:30+00	6.88	{"source": "scada", "quality": 192}	2025-11-22 22:02:49	2025-11-22 22:02:49
f9022a53-b1db-49c3-9b3e-1ab1d3ff433f	310cce7f-b9f7-448c-9369-c084473a5b19	2025-11-22 12:02:30+00	5.12	{"source": "scada", "quality": 192}	2025-11-22 22:02:49	2025-11-22 22:02:49
dd751a9e-a0ad-4763-9d77-82d9f6b95ffa	310cce7f-b9f7-448c-9369-c084473a5b19	2025-11-22 11:02:30+00	6.33	{"source": "scada", "quality": 192}	2025-11-22 22:02:49	2025-11-22 22:02:49
d4d6ccda-7be5-463a-a7ef-4e3069ab0ea8	89b3a0e6-a32f-4b31-beb9-a87a483be4a2	2025-11-22 22:02:30+00	1.3	{"source": "scada", "quality": 192}	2025-11-22 22:02:50	2025-11-22 22:02:50
5c88b2f2-a519-484d-987f-5071749fae41	89b3a0e6-a32f-4b31-beb9-a87a483be4a2	2025-11-22 21:02:30+00	1.2	{"source": "scada", "quality": 192}	2025-11-22 22:02:50	2025-11-22 22:02:50
2147405d-a195-4680-ab9e-209fb82fde4a	89b3a0e6-a32f-4b31-beb9-a87a483be4a2	2025-11-22 20:02:30+00	0.9	{"source": "scada", "quality": 192}	2025-11-22 22:02:50	2025-11-22 22:02:50
f1093c0b-195d-45ac-9b5f-58da8518360e	89b3a0e6-a32f-4b31-beb9-a87a483be4a2	2025-11-22 19:02:30+00	1.1	{"source": "scada", "quality": 192}	2025-11-22 22:02:51	2025-11-22 22:02:51
25b890b3-b831-4c19-a0a9-3c02d4d850af	89b3a0e6-a32f-4b31-beb9-a87a483be4a2	2025-11-22 18:02:30+00	1.4	{"source": "scada", "quality": 192}	2025-11-22 22:02:51	2025-11-22 22:02:51
3c7723a4-10c5-47fb-852c-ca710053faef	89b3a0e6-a32f-4b31-beb9-a87a483be4a2	2025-11-22 17:02:30+00	0.9	{"source": "scada", "quality": 192}	2025-11-22 22:02:51	2025-11-22 22:02:51
9a993eb1-9227-4b79-85f7-5c62aac571c9	89b3a0e6-a32f-4b31-beb9-a87a483be4a2	2025-11-22 16:02:30+00	0.6	{"source": "scada", "quality": 192}	2025-11-22 22:02:52	2025-11-22 22:02:52
71a596fb-b940-4c63-aae6-578343027cf4	89b3a0e6-a32f-4b31-beb9-a87a483be4a2	2025-11-22 15:02:30+00	1.5	{"source": "scada", "quality": 192}	2025-11-22 22:02:52	2025-11-22 22:02:52
351c5ed5-0aa2-4c69-b2d5-17456e2257c6	89b3a0e6-a32f-4b31-beb9-a87a483be4a2	2025-11-22 14:02:30+00	1.1	{"source": "scada", "quality": 192}	2025-11-22 22:02:52	2025-11-22 22:02:52
ec9aebda-6985-47af-b4d0-7b93bbd558de	89b3a0e6-a32f-4b31-beb9-a87a483be4a2	2025-11-22 13:02:30+00	0.5	{"source": "scada", "quality": 192}	2025-11-22 22:02:53	2025-11-22 22:02:53
31e95f4a-291c-471e-b9b1-03aa2c7582a5	89b3a0e6-a32f-4b31-beb9-a87a483be4a2	2025-11-22 12:02:30+00	1.1	{"source": "scada", "quality": 192}	2025-11-22 22:02:53	2025-11-22 22:02:53
13fc87da-c9be-4093-b9cc-ab724690ac1a	89b3a0e6-a32f-4b31-beb9-a87a483be4a2	2025-11-22 11:02:30+00	0.9	{"source": "scada", "quality": 192}	2025-11-22 22:02:53	2025-11-22 22:02:53
1c32a0cd-cf5d-4bd5-801f-c361c337f639	3f35d4eb-240b-461f-a79b-402a7241ed33	2025-11-22 22:02:30+00	5.98	{"source": "scada", "quality": 192}	2025-11-22 22:02:54	2025-11-22 22:02:54
e748318b-62b4-4d0e-9fab-ac08b585f9bf	3f35d4eb-240b-461f-a79b-402a7241ed33	2025-11-22 21:02:30+00	5.39	{"source": "scada", "quality": 192}	2025-11-22 22:02:54	2025-11-22 22:02:54
809c3180-da71-46a1-8dab-58058f09d5dc	3f35d4eb-240b-461f-a79b-402a7241ed33	2025-11-22 20:02:30+00	4.64	{"source": "scada", "quality": 192}	2025-11-22 22:02:54	2025-11-22 22:02:54
50db4700-36fa-4c9f-aac9-3bff874253bf	3f35d4eb-240b-461f-a79b-402a7241ed33	2025-11-22 19:02:30+00	1.43	{"source": "scada", "quality": 192}	2025-11-22 22:02:55	2025-11-22 22:02:55
8eb6d1a6-a5a4-43b9-b29b-9927b6cf94f7	3f35d4eb-240b-461f-a79b-402a7241ed33	2025-11-22 18:02:30+00	3.14	{"source": "scada", "quality": 192}	2025-11-22 22:02:55	2025-11-22 22:02:55
a8e91455-a3fe-4087-b9cb-58846d632e0a	3f35d4eb-240b-461f-a79b-402a7241ed33	2025-11-22 17pg_dump: processing data for table "public.telemetry_tags"
pg_dump: dumping contents of table "public.telemetry_tags"
:02:30+00	2.98	{"source": "scada", "quality": 192}	2025-11-22 22:02:55	2025-11-22 22:02:55
e2188b6e-edfa-469b-aa3b-a121dc26b665	3f35d4eb-240b-461f-a79b-402a7241ed33	2025-11-22 16:02:30+00	5.15	{"source": "scada", "quality": 192}	2025-11-22 22:02:56	2025-11-22 22:02:56
258983a1-2d17-41da-b451-faa48ff2ee25	3f35d4eb-240b-461f-a79b-402a7241ed33	2025-11-22 15:02:30+00	3.66	{"source": "scada", "quality": 192}	2025-11-22 22:02:56	2025-11-22 22:02:56
4807cfb4-7706-455e-8bbb-b3d506d73e18	3f35d4eb-240b-461f-a79b-402a7241ed33	2025-11-22 14:02:30+00	3.58	{"source": "scada", "quality": 192}	2025-11-22 22:02:56	2025-11-22 22:02:56
86565c3d-2939-447e-a142-483b5ece8248	3f35d4eb-240b-461f-a79b-402a7241ed33	2025-11-22 13:02:30+00	5.76	{"source": "scada", "quality": 192}	2025-11-22 22:02:57	2025-11-22 22:02:57
9c4ff053-e568-491a-a203-a767e90d2a86	3f35d4eb-240b-461f-a79b-402a7241ed33	2025-11-22 12:02:30+00	1.14	{"source": "scada", "quality": 192}	2025-11-22 22:02:57	2025-11-22 22:02:57
65b54d71-b766-4bd2-b392-e1fee0ffd86a	3f35d4eb-240b-461f-a79b-402a7241ed33	2025-11-22 11:02:30+00	2.6	{"source": "scada", "quality": 192}	2025-11-22 22:02:57	2025-11-22 22:02:57
6e39efa0-5cbf-4ac6-b9c9-34fae3a45c53	a9b981fc-6f44-4c09-b16a-c435052eb582	2025-11-22 22:02:30+00	7.8	{"source": "scada", "quality": 192}	2025-11-22 22:02:58	2025-11-22 22:02:58
b32852df-aa2a-49b7-82f8-07bf987ec6f4	a9b981fc-6f44-4c09-b16a-c435052eb582	2025-11-22 21:02:30+00	7.1	{"source": "scada", "quality": 192}	2025-11-22 22:02:58	2025-11-22 22:02:58
f2a3e192-a035-4626-bd57-0a21cf295a84	a9b981fc-6f44-4c09-b16a-c435052eb582	2025-11-22 20:02:30+00	7.6	{"source": "scada", "quality": 192}	2025-11-22 22:02:58	2025-11-22 22:02:58
c101f449-678a-4e3b-80c8-430876e35599	a9b981fc-6f44-4c09-b16a-c435052eb582	2025-11-22 19:02:30+00	7.2	{"source": "scada", "quality": 192}	2025-11-22 22:02:59	2025-11-22 22:02:59
47aaad74-d248-4a25-8553-b35e20a46c75	a9b981fc-6f44-4c09-b16a-c435052eb582	2025-11-22 18:02:30+00	7	{"source": "scada", "quality": 192}	2025-11-22 22:02:59	2025-11-22 22:02:59
f40cbe57-d455-4b19-875e-ab4011a8b19d	a9b981fc-6f44-4c09-b16a-c435052eb582	2025-11-22 17:02:30+00	7.2	{"source": "scada", "quality": 192}	2025-11-22 22:02:59	2025-11-22 22:02:59
39ecbfcf-7c39-4e60-82c4-2a95b7b9048f	a9b981fc-6f44-4c09-b16a-c435052eb582	2025-11-22 16:02:30+00	7	{"source": "scada", "quality": 192}	2025-11-22 22:03:00	2025-11-22 22:03:00
448aca9e-1a76-4e58-8954-84729c26cc37	a9b981fc-6f44-4c09-b16a-c435052eb582	2025-11-22 15:02:30+00	7	{"source": "scada", "quality": 192}	2025-11-22 22:03:00	2025-11-22 22:03:00
293cc807-5f5f-4964-91f6-63b050219b31	a9b981fc-6f44-4c09-b16a-c435052eb582	2025-11-22 14:02:30+00	7	{"source": "scada", "quality": 192}	2025-11-22 22:03:00	2025-11-22 22:03:00
abb2382f-292b-44d5-a09f-b9d9fe97765d	a9b981fc-6f44-4c09-b16a-c435052eb582	2025-11-22 13:02:30+00	7.5	{"source": "scada", "quality": 192}	2025-11-22 22:03:01	2025-11-22 22:03:01
149b99e4-32a3-4a4c-9f86-62dc77cdca94	a9b981fc-6f44-4c09-b16a-c435052eb582	2025-11-22 12:02:30+00	7.8	{"source": "scada", "quality": 192}	2025-11-22 22:03:01	2025-11-22 22:03:01
79cbd6ce-69cf-496f-87d6-b9583c33eb86	a9b981fc-6f44-4c09-b16a-c435052eb582	2025-11-22 11:02:30+00	7.8	{"source": "scada", "quality": 192}	2025-11-22 22:03:01	2025-11-22 22:03:01
\.


--
-- TOC entry 5881 (class 0 OID 338573)
-- Dependencies: 396
-- Data for Name: telemetry_tags; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.telemetry_tags (id, tenant_id, scheme_id, asset_id, network_node_id, tag, io_type, unit, scale, thresholds, enabled, created_at, updated_at, deleted_at) FROM stdin;
7443608a-7187-4f99-8a16-3634fe4607cc	a06b8d83-18d4-4241-95c6-66216c4dc431	a06b8d87-3fe2-4e26-80ec-e65eacd1ddca	\N	\N	SCADA.PS1.FLOW_IN	AI	m3/h	{"max": 100, "min": 0}	{"hi": 85, "lo": 10, "hiHi": 95, "loLo": 5}	t	2025-11-22 22:02:27	2025-11-22 22:02:27	\N
f3cd9369-49fa-454b-9073-b4c5b6482235	a06b8d83-18d4-4241-95c6-66216c4dc431	a06b8d87-3fe2-4e26-80ec-e65eacd1ddca	\N	\N	SCADA.PS1.PRESSURE_IN	AI	bar	{"max": 100, "min": 0}	{"hi": 85, "lo": 10, "hiHi": 95, "loLo": 5}	t	2025-11-22 22:0pg_dump: processing data for table "public.tenants"
pg_dump: dumping contents of table "public.tenants"
pg_dump: processing data for table "public.topology_validations"
pg_dump: dumping contents of table "public.topology_validations"
pg_dump: processing data for table "public.users"
pg_dump: dumping contents of table "public.users"
pg_dump: processing data for table "public.wo_labor"
pg_dump: dumping contents of table "public.wo_labor"
pg_dump: processing data for table "public.wo_parts"
pg_dump: dumping contents of table "public.wo_parts"
pg_dump: processing data for table "public.work_orders"
pg_dump: dumping contents of table "public.work_orders"
2:27	2025-11-22 22:02:27	\N
979c4db5-c5a1-41a6-bab8-dec05a76358b	a06b8d83-18d4-4241-95c6-66216c4dc431	a06b8d87-3fe2-4e26-80ec-e65eacd1ddca	\N	\N	SCADA.PS1.PUMP1_STATUS	DI	\N	{"max": 100, "min": 0}	{"hi": 85, "lo": 10, "hiHi": 95, "loLo": 5}	t	2025-11-22 22:02:27	2025-11-22 22:02:27	\N
f311c673-a755-41ff-b12c-b12400507c32	a06b8d83-18d4-4241-95c6-66216c4dc431	a06b8d87-3fe2-4e26-80ec-e65eacd1ddca	\N	\N	SCADA.PS1.PUMP1_POWER	AI	kW	{"max": 100, "min": 0}	{"hi": 85, "lo": 10, "hiHi": 95, "loLo": 5}	t	2025-11-22 22:02:28	2025-11-22 22:02:28	\N
310cce7f-b9f7-448c-9369-c084473a5b19	a06b8d83-18d4-4241-95c6-66216c4dc431	a06b8d87-3fe2-4e26-80ec-e65eacd1ddca	\N	\N	SCADA.RES1.LEVEL	AI	m	{"max": 100, "min": 0}	{"hi": 85, "lo": 10, "hiHi": 95, "loLo": 5}	t	2025-11-22 22:02:28	2025-11-22 22:02:28	\N
89b3a0e6-a32f-4b31-beb9-a87a483be4a2	a06b8d83-18d4-4241-95c6-66216c4dc431	a06b8d87-3fe2-4e26-80ec-e65eacd1ddca	\N	\N	SCADA.WTP1.CHLORINE	AI	mg/L	{"max": 100, "min": 0}	{"hi": 85, "lo": 10, "hiHi": 95, "loLo": 5}	t	2025-11-22 22:02:28	2025-11-22 22:02:28	\N
3f35d4eb-240b-461f-a79b-402a7241ed33	a06b8d83-18d4-4241-95c6-66216c4dc431	a06b8d87-3fe2-4e26-80ec-e65eacd1ddca	\N	\N	SCADA.WTP1.TURBIDITY	AI	NTU	{"max": 100, "min": 0}	{"hi": 85, "lo": 10, "hiHi": 95, "loLo": 5}	t	2025-11-22 22:02:29	2025-11-22 22:02:29	\N
a9b981fc-6f44-4c09-b16a-c435052eb582	a06b8d83-18d4-4241-95c6-66216c4dc431	a06b8d87-3fe2-4e26-80ec-e65eacd1ddca	\N	\N	SCADA.WTP1.PH	AI	pH	{"max": 100, "min": 0}	{"hi": 85, "lo": 10, "hiHi": 95, "loLo": 5}	t	2025-11-22 22:02:29	2025-11-22 22:02:29	\N
\.


--
-- TOC entry 5718 (class 0 OID 335949)
-- Dependencies: 233
-- Data for Name: tenants; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.tenants (id, name, short_code, country, timezone, currency, logo_path, status, meta, created_at, updated_at, deleted_at) FROM stdin;
a06b8d83-18d4-4241-95c6-66216c4dc431	Nairobi Water & Sewerage Company	NWSC	KE	Africa/Nairobi	KES	\N	active	\N	2025-11-22 21:59:21	2025-11-22 21:59:21	\N
a06b9914-0379-4c39-9f76-a31a166f1186	Kenya Water Utilities	KWU	KE	Africa/Nairobi	KES	\N	active	\N	2025-11-22 22:31:41	2025-11-22 22:31:41	\N
a06b9928-048c-43c7-8284-5885a4aa40f1	Garissa Water & Sanitation Company	GWC	KE	Africa/Nairobi	KES	\N	active	\N	2025-11-22 22:31:54	2025-11-22 22:31:54	\N
\.


--
-- TOC entry 5730 (class 0 OID 336196)
-- Dependencies: 245
-- Data for Name: topology_validations; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.topology_validations (id, tenant_id, edit_layer_id, validation_type, severity, entity_type, entity_id, message, details, resolved, resolved_by, resolved_at, created_at, updated_at, location) FROM stdin;
\.


--
-- TOC entry 5708 (class 0 OID 335879)
-- Dependencies: 223
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.users (id, name, email, email_verified_at, password, google2fa_secret, two_factor_enabled, backup_codes, current_tenant_id, remember_token, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- TOC entry 5798 (class 0 OID 337194)
-- Dependencies: 313
-- Data for Name: wo_labor; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.wo_labor (id, work_order_id, user_id, hours, rate, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5796 (class 0 OID 337175)
-- Dependencies: 311
-- Data for Name: wo_parts; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.wo_parts (id, work_order_id, part_id, qty, unit_cost, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5791 (class 0 OID 337083)
-- Dependencies: 306
-- Data for Name: work_orders; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.work_orders (id, tenant_id, wo_num, kind, asset_id, title, description, priority, status, created_by, assigned_to, scheduled_for, started_at, completed_at, completion_notes, pm_policy_id, geom, source, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5846 (class 0 OID 338002)
-- Dependencies: 361
-- Data for Name: wq_compliance; Type: TABLE DATA; Schema: public; Owner: neopg_dump: processing data for table "public.wq_compliance"
pg_dump: dumping contents of table "public.wq_compliance"
pg_dump: processing data for table "public.wq_parameters"
pg_dump: dumping contents of table "public.wq_parameters"
pg_dump: processing data for table "public.wq_plan_rules"
pg_dump: dumping contents of table "public.wq_plan_rules"
pg_dump: processing data for table "public.wq_plans"
pg_dump: dumping contents of table "public.wq_plans"
pg_dump: processing data for table "public.wq_qc_controls"
pg_dump: dumping contents of table "public.wq_qc_controls"
pg_dump: processing data for table "public.wq_results"
pg_dump: dumping contents of table "public.wq_results"
pg_dump: processing data for table "public.wq_sample_params"
pg_dump: dumping contents of table "public.wq_sample_params"
pg_dump: processing data for table "public.wq_samples"
pg_dump: dumping contents of table "public.wq_samples"
pg_dump: processing data for table "public.wq_sampling_points"
pg_dump: dumping contents of table "public.wq_sampling_points"
pg_dump: processing data for table "public.zones"
pg_dump: dumping contents of table "public.zones"
ndb_owner
--

COPY public.wq_compliance (id, sampling_point_id, parameter_id, period, granularity, samples_taken, samples_compliant, compliance_pct, worst_value, breaches, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5832 (class 0 OID 337635)
-- Dependencies: 347
-- Data for Name: wq_parameters; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.wq_parameters (id, code, name, "group", unit, method, lod, loi, who_limit, wasreb_limit, local_limit, advisory, is_active, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5838 (class 0 OID 337898)
-- Dependencies: 353
-- Data for Name: wq_plan_rules; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.wq_plan_rules (id, plan_id, point_kind, parameter_group, frequency, sample_count, container_type, preservatives, holding_time_hrs, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5834 (class 0 OID 337651)
-- Dependencies: 349
-- Data for Name: wq_plans; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.wq_plans (id, tenant_id, name, period_start, period_end, status, notes, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5848 (class 0 OID 338029)
-- Dependencies: 363
-- Data for Name: wq_qc_controls; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.wq_qc_controls (id, sample_id, parameter_id, type, target_value, accepted_range, outcome, details, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5844 (class 0 OID 337978)
-- Dependencies: 359
-- Data for Name: wq_results; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.wq_results (id, sample_param_id, value, value_qualifier, unit, analyzed_at, analyst_id, instrument, lod, uncertainty, qc_flags, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5842 (class 0 OID 337952)
-- Dependencies: 357
-- Data for Name: wq_sample_params; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.wq_sample_params (id, sample_id, parameter_id, status, method, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5840 (class 0 OID 337918)
-- Dependencies: 355
-- Data for Name: wq_samples; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.wq_samples (id, sampling_point_id, plan_id, barcode, scheduled_for, collected_at, collected_by, temp_c_on_receipt, custody_state, photos, chain, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5836 (class 0 OID 337863)
-- Dependencies: 351
-- Data for Name: wq_sampling_points; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.wq_sampling_points (id, tenant_id, scheme_id, dma_id, name, code, kind, location, elevation_m, meta, is_active, created_at, updated_at, facility_id) FROM stdin;
\.


--
-- TOC entry 5724 (class 0 OID 336073)
-- Dependencies: 239
-- Data for Name: zones; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.zones (id, tenant_id, scheme_id, type, code, name, meta, created_at, updated_at, deleted_at, geom) FROM stdin;
a06b8d95-ef63-469d-8874-1d9c5e7b9b10	a06b8d83-18d4-4241-95c6-66216c4dc431	a06b8d85-2ff6-467b-afc0-7854decad03b	commercial	ZONE-WEST-01	Westlands Commercial Zone	\N	2025-11-22 21:59:33	2025-11-22 21:59:33	\N	0103000020E61000000100000005000000295C8FC2F528F4BF6666666666664240295C8FC2F528F4BF295C8FC2F56842407B14AE47E17AF4BF295C8FC2F56842407B14AE47E17AF4BF6666666666664240295C8FC2F528F4BF6666666666664240
a06b8d96-f273-4971-b8f1-5bf9f6b28c12	a06b8d83-18d4-4241-95c6-66216c4dc431	a06b8d85-2ff6-467b-afc0-7854decad03b	residential	ZONE-RES-02	Kilimani Residential Zone	\N	2025-11-22 21:59:34	2025-11-22 21:59:34	\N	0103000020E61000000100000005000000A4703D0AD7A3F4BFC3F5285C8F624240A4703D0AD7A3F4BF85EB51B81E654240F6285C8FC2F5F4BF85EB51B81E654240F6285C8FC2F5F4BFC3F5285C8F624240A4703D0AD7A3F4BFC3F5285C8F624240
a06b8d97-f4db-4f6e-afb6-e9bbd6ce1102	a06b8d83-18d4-4241-95c6-66216c4dc431	a06b8d85-2ff6-467b-afc0-7854decad03b	industrial	ZONE-IND-03	Industrial Area Zone	\N	2025-11-22 21:59:34	2025-11-22 21:59:34	\N	0103000020E61000000100000005000000F6285C8FC2F5F4BFEC51B81E856B4240F62pg_dump: executing SEQUENCE SET assessment_attempts_id_seq
pg_dump: executing SEQUENCE SET assessments_id_seq
pg_dump: executing SEQUENCE SET asset_boms_id_seq
pg_dump: executing SEQUENCE SET asset_classes_id_seq
pg_dump: executing SEQUENCE SET asset_locations_id_seq
pg_dump: executing SEQUENCE SET asset_meters_id_seq
pg_dump: executing SEQUENCE SET assets_id_seq
pg_dump: executing SEQUENCE SET certificates_id_seq
pg_dump: executing SEQUENCE SET checklist_runs_id_seq
pg_dump: executing SEQUENCE SET checklists_id_seq
pg_dump: executing SEQUENCE SET courses_id_seq
pg_dump: executing SEQUENCE SET crm_balances_id_seq
pg_dump: executing SEQUENCE SET crm_customer_reads_id_seq
pg_dump: executing SEQUENCE SET crm_customers_id_seq
85C8FC2F5F4BF8FC2F5285C6F4240713D0AD7A370F5BF8FC2F5285C6F4240713D0AD7A370F5BFEC51B81E856B4240F6285C8FC2F5F4BFEC51B81E856B4240
a06b8d98-f9c9-401d-92cb-9602e75055ed	a06b8d83-18d4-4241-95c6-66216c4dc431	a06b8d85-2ff6-467b-afc0-7854decad03b	mixed	ZONE-MIX-04	Upperhill Mixed-Use Zone	\N	2025-11-22 21:59:35	2025-11-22 21:59:35	\N	0103000020E610000001000000050000007B14AE47E17AF4BF48E17A14AE6742407B14AE47E17AF4BF0AD7A3703D6A4240CDCCCCCCCCCCF4BF0AD7A3703D6A4240CDCCCCCCCCCCF4BF48E17A14AE6742407B14AE47E17AF4BF48E17A14AE674240
a06b99af-0412-42b2-a6e7-3e7cf8b06089	a06b9928-048c-43c7-8284-5885a4aa40f1	\N	urban	ZONE-G-TOWN	Garissa Town Zone	\N	2025-11-22 22:33:23	2025-11-22 22:33:23	\N	0103000020E61000000100000005000000295C8FC2F528DCBF52B81E85EBD14340295C8FC2F528DCBFF6285C8FC2D5434014AE47E17A14DEBFF6285C8FC2D5434014AE47E17A14DEBF52B81E85EBD14340295C8FC2F528DCBF52B81E85EBD14340
a06b99b0-0878-453c-8c5e-6adb20892b50	a06b9928-048c-43c7-8284-5885a4aa40f1	\N	rural	ZONE-G-RURAL	Garissa Rural Zone	\N	2025-11-22 22:33:23	2025-11-22 22:33:23	\N	0103000020E61000000100000005000000000000000000E0BF0000000000C04340000000000000E0BF6666666666E643409A9999999999C9BF6666666666E643409A9999999999C9BF0000000000C04340000000000000E0BF0000000000C04340
\.


--
-- TOC entry 5962 (class 0 OID 0)
-- Dependencies: 260
-- Name: assessment_attempts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.assessment_attempts_id_seq', 1, false);


--
-- TOC entry 5963 (class 0 OID 0)
-- Dependencies: 256
-- Name: assessments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.assessments_id_seq', 1, false);


--
-- TOC entry 5964 (class 0 OID 0)
-- Dependencies: 297
-- Name: asset_boms_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.asset_boms_id_seq', 1, false);


--
-- TOC entry 5965 (class 0 OID 0)
-- Dependencies: 285
-- Name: asset_classes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.asset_classes_id_seq', 1, false);


--
-- TOC entry 5966 (class 0 OID 0)
-- Dependencies: 289
-- Name: asset_locations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.asset_locations_id_seq', 1, false);


--
-- TOC entry 5967 (class 0 OID 0)
-- Dependencies: 291
-- Name: asset_meters_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.asset_meters_id_seq', 1, false);


--
-- TOC entry 5968 (class 0 OID 0)
-- Dependencies: 287
-- Name: assets_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.assets_id_seq', 1, false);


--
-- TOC entry 5969 (class 0 OID 0)
-- Dependencies: 262
-- Name: certificates_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.certificates_id_seq', 1, false);


--
-- TOC entry 5970 (class 0 OID 0)
-- Dependencies: 332
-- Name: checklist_runs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.checklist_runs_id_seq', 1, false);


--
-- TOC entry 5971 (class 0 OID 0)
-- Dependencies: 330
-- Name: checklists_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.checklists_id_seq', 2, true);


--
-- TOC entry 5972 (class 0 OID 0)
-- Dependencies: 248
-- Name: courses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.courses_id_seq', 1, false);


--
-- TOC entry 5973 (class 0 OID 0)
-- Dependencies: 380
-- Name: crm_balances_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.crm_balances_id_seq', 1, false);


--
-- TOC entry 5974 (class 0 OID 0)
-- Dependencies: 384
-- Name: crm_customer_reads_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.crm_customer_reads_id_seq', 1, false);


--
-- TOC entry 5975 (class 0 OID 0)
-- Dependepg_dump: executing SEQUENCE SET crm_invoice_lines_id_seq
pg_dump: executing SEQUENCE SET crm_invoices_id_seq
pg_dump: executing SEQUENCE SET crm_meters_id_seq
pg_dump: executing SEQUENCE SET crm_payment_plans_id_seq
pg_dump: executing SEQUENCE SET crm_payments_id_seq
pg_dump: executing SEQUENCE SET crm_premises_id_seq
pg_dump: executing SEQUENCE SET crm_ra_rules_id_seq
pg_dump: executing SEQUENCE SET crm_service_connections_id_seq
pg_dump: executing SEQUENCE SET crm_tariffs_id_seq
pg_dump: executing SEQUENCE SET employee_skills_id_seq
pg_dump: executing SEQUENCE SET enrollments_id_seq
pg_dump: executing SEQUENCE SET escalation_policies_id_seq
pg_dump: executing SEQUENCE SET event_actions_id_seq
pg_dump: executing SEQUENCE SET event_links_id_seq
pg_dump: executing SEQUENCE SET events_id_seq
pg_dump: executing SEQUENCE SET failed_jobs_id_seq
pg_dump: executing SEQUENCE SET failures_id_seq
pg_dump: executing SEQUENCE SET jobs_id_seq
pg_dump: executing SEQUENCE SET kb_articles_id_seq
ncies: 370
-- Name: crm_customers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.crm_customers_id_seq', 1, false);


--
-- TOC entry 5976 (class 0 OID 0)
-- Dependencies: 376
-- Name: crm_invoice_lines_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.crm_invoice_lines_id_seq', 1, false);


--
-- TOC entry 5977 (class 0 OID 0)
-- Dependencies: 374
-- Name: crm_invoices_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.crm_invoices_id_seq', 1, false);


--
-- TOC entry 5978 (class 0 OID 0)
-- Dependencies: 366
-- Name: crm_meters_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.crm_meters_id_seq', 1, false);


--
-- TOC entry 5979 (class 0 OID 0)
-- Dependencies: 382
-- Name: crm_payment_plans_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.crm_payment_plans_id_seq', 1, false);


--
-- TOC entry 5980 (class 0 OID 0)
-- Dependencies: 378
-- Name: crm_payments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.crm_payments_id_seq', 1, false);


--
-- TOC entry 5981 (class 0 OID 0)
-- Dependencies: 364
-- Name: crm_premises_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.crm_premises_id_seq', 1, false);


--
-- TOC entry 5982 (class 0 OID 0)
-- Dependencies: 386
-- Name: crm_ra_rules_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.crm_ra_rules_id_seq', 1, false);


--
-- TOC entry 5983 (class 0 OID 0)
-- Dependencies: 368
-- Name: crm_service_connections_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.crm_service_connections_id_seq', 1, false);


--
-- TOC entry 5984 (class 0 OID 0)
-- Dependencies: 372
-- Name: crm_tariffs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.crm_tariffs_id_seq', 1, false);


--
-- TOC entry 5985 (class 0 OID 0)
-- Dependencies: 270
-- Name: employee_skills_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.employee_skills_id_seq', 1, false);


--
-- TOC entry 5986 (class 0 OID 0)
-- Dependencies: 252
-- Name: enrollments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.enrollments_id_seq', 1, false);


--
-- TOC entry 5987 (class 0 OID 0)
-- Dependencies: 342
-- Name: escalation_policies_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.escalation_policies_id_seq', 1, false);


--
-- TOC entry 5988 (class 0 OID 0)
-- Dependencies: 340
-- Name: event_actions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.event_actions_id_seq', 1, false);


--
-- TOC entry 5989 (class 0 OID 0)
-- Dependencies: 336
-- Name: event_links_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.event_links_id_seq', 1, false);


--
-- TOC entry 5990 (class 0 OID 0)
-- Dependencies: 334
-- Name: events_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.events_id_seq', 1, false);


--
-- TOC entry 5991 (class 0 OID 0)
-- Dependencies: 231
-- Name: failed_jobs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.failed_jobs_id_seq', 1, false);


--
-- TOC entry 5992 (class 0 OID 0)
-- Dependencies: 314
-- Name: failures_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.failures_id_seq', 1, false);


--
-- TOC entry 5993 (class 0 OID 0)
-- Dependencies: 228
-- Name: jobs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.jobs_id_seq', 1, false);


--
-- TOC entry 5994 pg_dump: executing SEQUENCE SET lesson_progress_id_seq
pg_dump: executing SEQUENCE SET lessons_id_seq
pg_dump: executing SEQUENCE SET meter_captures_id_seq
pg_dump: executing SEQUENCE SET migrations_id_seq
pg_dump: executing SEQUENCE SET notifications_id_seq
pg_dump: executing SEQUENCE SET oncall_schedules_id_seq
pg_dump: executing SEQUENCE SET parts_id_seq
pg_dump: executing SEQUENCE SET permissions_id_seq
pg_dump: executing SEQUENCE SET personal_access_tokens_id_seq
pg_dump: executing SEQUENCE SET playbooks_id_seq
pg_dump: executing SEQUENCE SET pm_policies_id_seq
pg_dump: executing SEQUENCE SET pm_schedules_id_seq
pg_dump: executing SEQUENCE SET questions_id_seq
pg_dump: executing SEQUENCE SET roles_id_seq
pg_dump: executing SEQUENCE SET rosters_id_seq
pg_dump: executing SEQUENCE SET shift_entries_id_seq
pg_dump: executing SEQUENCE SET shifts_id_seq
pg_dump: executing SEQUENCE SET skills_id_seq
pg_dump: executing SEQUENCE SET sops_id_seq
(class 0 OID 0)
-- Dependencies: 264
-- Name: kb_articles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.kb_articles_id_seq', 1, false);


--
-- TOC entry 5995 (class 0 OID 0)
-- Dependencies: 254
-- Name: lesson_progress_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.lesson_progress_id_seq', 1, false);


--
-- TOC entry 5996 (class 0 OID 0)
-- Dependencies: 250
-- Name: lessons_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.lessons_id_seq', 1, false);


--
-- TOC entry 5997 (class 0 OID 0)
-- Dependencies: 293
-- Name: meter_captures_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.meter_captures_id_seq', 1, false);


--
-- TOC entry 5998 (class 0 OID 0)
-- Dependencies: 221
-- Name: migrations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.migrations_id_seq', 47, true);


--
-- TOC entry 5999 (class 0 OID 0)
-- Dependencies: 344
-- Name: notifications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.notifications_id_seq', 1, false);


--
-- TOC entry 6000 (class 0 OID 0)
-- Dependencies: 274
-- Name: oncall_schedules_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.oncall_schedules_id_seq', 1, false);


--
-- TOC entry 6001 (class 0 OID 0)
-- Dependencies: 295
-- Name: parts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.parts_id_seq', 1, false);


--
-- TOC entry 6002 (class 0 OID 0)
-- Dependencies: 276
-- Name: permissions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.permissions_id_seq', 29, true);


--
-- TOC entry 6003 (class 0 OID 0)
-- Dependencies: 283
-- Name: personal_access_tokens_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.personal_access_tokens_id_seq', 1, false);


--
-- TOC entry 6004 (class 0 OID 0)
-- Dependencies: 338
-- Name: playbooks_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.playbooks_id_seq', 1, false);


--
-- TOC entry 6005 (class 0 OID 0)
-- Dependencies: 301
-- Name: pm_policies_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.pm_policies_id_seq', 1, false);


--
-- TOC entry 6006 (class 0 OID 0)
-- Dependencies: 303
-- Name: pm_schedules_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.pm_schedules_id_seq', 1, false);


--
-- TOC entry 6007 (class 0 OID 0)
-- Dependencies: 258
-- Name: questions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.questions_id_seq', 1, false);


--
-- TOC entry 6008 (class 0 OID 0)
-- Dependencies: 278
-- Name: roles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.roles_id_seq', 1, true);


--
-- TOC entry 6009 (class 0 OID 0)
-- Dependencies: 272
-- Name: rosters_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.rosters_id_seq', 1, false);


--
-- TOC entry 6010 (class 0 OID 0)
-- Dependencies: 328
-- Name: shift_entries_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.shift_entries_id_seq', 1, false);


--
-- TOC entry 6011 (class 0 OID 0)
-- Dependencies: 316
-- Name: shifts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.shifts_id_seq', 1, false);


--
-- TOC entry 6012 (class 0 OID 0)
-- Dependencies: 268
-- Name: skills_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.skills_id_seq', 1, false);


--
-- TOC entry 6013 (class 0 OID 0)
-- Dependencies: 266
-- Name:pg_dump: executing SEQUENCE SET stock_txns_id_seq
pg_dump: executing SEQUENCE SET suppliers_id_seq
pg_dump: executing SEQUENCE SET wo_labor_id_seq
pg_dump: executing SEQUENCE SET wo_parts_id_seq
pg_dump: executing SEQUENCE SET work_orders_id_seq
pg_dump: executing SEQUENCE SET wq_compliance_id_seq
pg_dump: executing SEQUENCE SET wq_parameters_id_seq
pg_dump: executing SEQUENCE SET wq_plan_rules_id_seq
pg_dump: executing SEQUENCE SET wq_plans_id_seq
pg_dump: executing SEQUENCE SET wq_qc_controls_id_seq
pg_dump: executing SEQUENCE SET wq_results_id_seq
pg_dump: executing SEQUENCE SET wq_sample_params_id_seq
pg_dump: executing SEQUENCE SET wq_samples_id_seq
pg_dump: executing SEQUENCE SET wq_sampling_points_id_seq
pg_dump: creating CONSTRAINT "public.addresses addresses_pkey"
pg_dump: creating CONSTRAINT "public.api_keys api_keys_pkey"
pg_dump: creating CONSTRAINT "public.assessment_attempts assessment_attempts_pkey"
pg_dump: creating CONSTRAINT "public.assessments assessments_pkey"
pg_dump: creating CONSTRAINT "public.asset_boms asset_boms_asset_id_part_id_unique"
 sops_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.sops_id_seq', 1, false);


--
-- TOC entry 6014 (class 0 OID 0)
-- Dependencies: 308
-- Name: stock_txns_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.stock_txns_id_seq', 1, false);


--
-- TOC entry 6015 (class 0 OID 0)
-- Dependencies: 299
-- Name: suppliers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.suppliers_id_seq', 1, false);


--
-- TOC entry 6016 (class 0 OID 0)
-- Dependencies: 312
-- Name: wo_labor_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.wo_labor_id_seq', 1, false);


--
-- TOC entry 6017 (class 0 OID 0)
-- Dependencies: 310
-- Name: wo_parts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.wo_parts_id_seq', 1, false);


--
-- TOC entry 6018 (class 0 OID 0)
-- Dependencies: 305
-- Name: work_orders_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.work_orders_id_seq', 1, false);


--
-- TOC entry 6019 (class 0 OID 0)
-- Dependencies: 360
-- Name: wq_compliance_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.wq_compliance_id_seq', 1, false);


--
-- TOC entry 6020 (class 0 OID 0)
-- Dependencies: 346
-- Name: wq_parameters_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.wq_parameters_id_seq', 1, false);


--
-- TOC entry 6021 (class 0 OID 0)
-- Dependencies: 352
-- Name: wq_plan_rules_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.wq_plan_rules_id_seq', 1, false);


--
-- TOC entry 6022 (class 0 OID 0)
-- Dependencies: 348
-- Name: wq_plans_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.wq_plans_id_seq', 1, false);


--
-- TOC entry 6023 (class 0 OID 0)
-- Dependencies: 362
-- Name: wq_qc_controls_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.wq_qc_controls_id_seq', 1, false);


--
-- TOC entry 6024 (class 0 OID 0)
-- Dependencies: 358
-- Name: wq_results_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.wq_results_id_seq', 1, false);


--
-- TOC entry 6025 (class 0 OID 0)
-- Dependencies: 356
-- Name: wq_sample_params_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.wq_sample_params_id_seq', 1, false);


--
-- TOC entry 6026 (class 0 OID 0)
-- Dependencies: 354
-- Name: wq_samples_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.wq_samples_id_seq', 1, false);


--
-- TOC entry 6027 (class 0 OID 0)
-- Dependencies: 350
-- Name: wq_sampling_points_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.wq_sampling_points_id_seq', 1, false);


--
-- TOC entry 4891 (class 2606 OID 336110)
-- Name: addresses addresses_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.addresses
    ADD CONSTRAINT addresses_pkey PRIMARY KEY (id);


--
-- TOC entry 5078 (class 2606 OID 337235)
-- Name: api_keys api_keys_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.api_keys
    ADD CONSTRAINT api_keys_pkey PRIMARY KEY (id);


--
-- TOC entry 4948 (class 2606 OID 336414)
-- Name: assessment_attempts assessment_attempts_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.assessment_attempts
    ADD CONSTRAINT assessment_attempts_pkey PRIMARY KEY (id);


--
-- TOC entry 4943 (class 2606 OID 336381)
-- Name: assessments assessments_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.assessments
    ADD CONSTRAINT assessments_pkey PRIMARY KEY (id);


--
-pg_dump: creating CONSTRAINT "public.asset_boms asset_boms_pkey"
pg_dump: creating CONSTRAINT "public.asset_classes asset_classes_code_unique"
pg_dump: creating CONSTRAINT "public.asset_classes asset_classes_pkey"
pg_dump: creating CONSTRAINT "public.asset_locations asset_locations_pkey"
pg_dump: creating CONSTRAINT "public.asset_meters asset_meters_pkey"
pg_dump: creating CONSTRAINT "public.assets assets_barcode_unique"
pg_dump: creating CONSTRAINT "public.assets assets_code_unique"
pg_dump: creating CONSTRAINT "public.assets assets_pkey"
pg_dump: creating CONSTRAINT "public.attachments attachments_pkey"
pg_dump: creating CONSTRAINT "public.audit_events audit_events_pkey"
pg_dump: creating CONSTRAINT "public.cache_locks cache_locks_pkey"
pg_dump: creating CONSTRAINT "public.cache cache_pkey"
pg_dump: creating CONSTRAINT "public.certificates certificates_code_unique"
pg_dump: creating CONSTRAINT "public.certificates certificates_pkey"
pg_dump: creating CONSTRAINT "public.certificates certificates_qr_token_unique"
pg_dump: creating CONSTRAINT "public.checklist_runs checklist_runs_pkey"
pg_dump: creating CONSTRAINT "public.checklists checklists_pkey"
- TOC entry 5046 (class 2606 OID 337030)
-- Name: asset_boms asset_boms_asset_id_part_id_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.asset_boms
    ADD CONSTRAINT asset_boms_asset_id_part_id_unique UNIQUE (asset_id, part_id);


--
-- TOC entry 5049 (class 2606 OID 337016)
-- Name: asset_boms asset_boms_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.asset_boms
    ADD CONSTRAINT asset_boms_pkey PRIMARY KEY (id);


--
-- TOC entry 5007 (class 2606 OID 336891)
-- Name: asset_classes asset_classes_code_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.asset_classes
    ADD CONSTRAINT asset_classes_code_unique UNIQUE (code);


--
-- TOC entry 5010 (class 2606 OID 336882)
-- Name: asset_classes asset_classes_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.asset_classes
    ADD CONSTRAINT asset_classes_pkey PRIMARY KEY (id);


--
-- TOC entry 5029 (class 2606 OID 336948)
-- Name: asset_locations asset_locations_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.asset_locations
    ADD CONSTRAINT asset_locations_pkey PRIMARY KEY (id);


--
-- TOC entry 5032 (class 2606 OID 336964)
-- Name: asset_meters asset_meters_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.asset_meters
    ADD CONSTRAINT asset_meters_pkey PRIMARY KEY (id);


--
-- TOC entry 5012 (class 2606 OID 336939)
-- Name: assets assets_barcode_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.assets
    ADD CONSTRAINT assets_barcode_unique UNIQUE (barcode);


--
-- TOC entry 5016 (class 2606 OID 336937)
-- Name: assets assets_code_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.assets
    ADD CONSTRAINT assets_code_unique UNIQUE (code);


--
-- TOC entry 5021 (class 2606 OID 336902)
-- Name: assets assets_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.assets
    ADD CONSTRAINT assets_pkey PRIMARY KEY (id);


--
-- TOC entry 4898 (class 2606 OID 336135)
-- Name: attachments attachments_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.attachments
    ADD CONSTRAINT attachments_pkey PRIMARY KEY (id);


--
-- TOC entry 5133 (class 2606 OID 337370)
-- Name: audit_events audit_events_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.audit_events
    ADD CONSTRAINT audit_events_pkey PRIMARY KEY (id);


--
-- TOC entry 4844 (class 2606 OID 335919)
-- Name: cache_locks cache_locks_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.cache_locks
    ADD CONSTRAINT cache_locks_pkey PRIMARY KEY (key);


--
-- TOC entry 4842 (class 2606 OID 335912)
-- Name: cache cache_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.cache
    ADD CONSTRAINT cache_pkey PRIMARY KEY (key);


--
-- TOC entry 4950 (class 2606 OID 336458)
-- Name: certificates certificates_code_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.certificates
    ADD CONSTRAINT certificates_code_unique UNIQUE (code);


--
-- TOC entry 4953 (class 2606 OID 336439)
-- Name: certificates certificates_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.certificates
    ADD CONSTRAINT certificates_pkey PRIMARY KEY (id);


--
-- TOC entry 4955 (class 2606 OID 336460)
-- Name: certificates certificates_qr_token_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.certificates
    ADD CONSTRAINT certificates_qr_token_unique UNIQUE (qr_token);


--
-- TOC entry 5161 (class 2606 OID 337477)
-- Name: checklist_runs checklist_runs_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.checklist_runs
    ADD CONSTRAINT checklist_runs_pkey PRIMARY KEY (id);


--
-- TOC entry 5155 (clpg_dump: creating CONSTRAINT "public.chemical_stocks chemical_stocks_pkey"
pg_dump: creating CONSTRAINT "public.chemical_stocks chemical_stocks_tenant_id_scheme_id_chemical_as_of_unique"
pg_dump: creating CONSTRAINT "public.consents consents_pkey"
pg_dump: creating CONSTRAINT "public.courses courses_code_unique"
pg_dump: creating CONSTRAINT "public.courses courses_pkey"
pg_dump: creating CONSTRAINT "public.crm_balances crm_balances_pkey"
pg_dump: creating CONSTRAINT "public.crm_balances crm_balances_tenant_id_account_no_as_of_unique"
pg_dump: creating CONSTRAINT "public.crm_customer_reads crm_customer_reads_pkey"
pg_dump: creating CONSTRAINT "public.crm_customers crm_customers_customer_no_unique"
pg_dump: creating CONSTRAINT "public.crm_customers crm_customers_pkey"
pg_dump: creating CONSTRAINT "public.crm_invoice_lines crm_invoice_lines_pkey"
pg_dump: creating CONSTRAINT "public.crm_invoices crm_invoices_pkey"
pg_dump: creating CONSTRAINT "public.crm_meters crm_meters_pkey"
pg_dump: creating CONSTRAINT "public.crm_meters crm_meters_serial_no_unique"
pg_dump: creating CONSTRAINT "public.crm_payment_plans crm_payment_plans_pkey"
pg_dump: creating CONSTRAINT "public.crm_payments crm_payments_pkey"
ass 2606 OID 337461)
-- Name: checklists checklists_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.checklists
    ADD CONSTRAINT checklists_pkey PRIMARY KEY (id);


--
-- TOC entry 5347 (class 2606 OID 338484)
-- Name: chemical_stocks chemical_stocks_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.chemical_stocks
    ADD CONSTRAINT chemical_stocks_pkey PRIMARY KEY (id);


--
-- TOC entry 5350 (class 2606 OID 338481)
-- Name: chemical_stocks chemical_stocks_tenant_id_scheme_id_chemical_as_of_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.chemical_stocks
    ADD CONSTRAINT chemical_stocks_tenant_id_scheme_id_chemical_as_of_unique UNIQUE (tenant_id, scheme_id, chemical, as_of);


--
-- TOC entry 5124 (class 2606 OID 337329)
-- Name: consents consents_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.consents
    ADD CONSTRAINT consents_pkey PRIMARY KEY (id);


--
-- TOC entry 4924 (class 2606 OID 336301)
-- Name: courses courses_code_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.courses
    ADD CONSTRAINT courses_code_unique UNIQUE (code);


--
-- TOC entry 4927 (class 2606 OID 336277)
-- Name: courses courses_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.courses
    ADD CONSTRAINT courses_pkey PRIMARY KEY (id);


--
-- TOC entry 5312 (class 2606 OID 338250)
-- Name: crm_balances crm_balances_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.crm_balances
    ADD CONSTRAINT crm_balances_pkey PRIMARY KEY (id);


--
-- TOC entry 5314 (class 2606 OID 338257)
-- Name: crm_balances crm_balances_tenant_id_account_no_as_of_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.crm_balances
    ADD CONSTRAINT crm_balances_tenant_id_account_no_as_of_unique UNIQUE (tenant_id, account_no, as_of);


--
-- TOC entry 5325 (class 2606 OID 338293)
-- Name: crm_customer_reads crm_customer_reads_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.crm_customer_reads
    ADD CONSTRAINT crm_customer_reads_pkey PRIMARY KEY (id);


--
-- TOC entry 5287 (class 2606 OID 338169)
-- Name: crm_customers crm_customers_customer_no_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.crm_customers
    ADD CONSTRAINT crm_customers_customer_no_unique UNIQUE (customer_no);


--
-- TOC entry 5290 (class 2606 OID 338154)
-- Name: crm_customers crm_customers_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.crm_customers
    ADD CONSTRAINT crm_customers_pkey PRIMARY KEY (id);


--
-- TOC entry 5303 (class 2606 OID 338215)
-- Name: crm_invoice_lines crm_invoice_lines_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.crm_invoice_lines
    ADD CONSTRAINT crm_invoice_lines_pkey PRIMARY KEY (id);


--
-- TOC entry 5298 (class 2606 OID 338198)
-- Name: crm_invoices crm_invoices_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.crm_invoices
    ADD CONSTRAINT crm_invoices_pkey PRIMARY KEY (id);


--
-- TOC entry 5272 (class 2606 OID 338105)
-- Name: crm_meters crm_meters_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.crm_meters
    ADD CONSTRAINT crm_meters_pkey PRIMARY KEY (id);


--
-- TOC entry 5275 (class 2606 OID 338115)
-- Name: crm_meters crm_meters_serial_no_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.crm_meters
    ADD CONSTRAINT crm_meters_serial_no_unique UNIQUE (serial_no);


--
-- TOC entry 5318 (class 2606 OID 338272)
-- Name: crm_payment_plans crm_payment_plans_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.crm_payment_plans
    ADD CONSTRAINT crm_payment_plans_pkey PRIMARY KEY (id);


--
-- TOC entry 5307 (class 2606 OID 338232)pg_dump: creating CONSTRAINT "public.crm_premises crm_premises_pkey"
pg_dump: creating CONSTRAINT "public.crm_premises crm_premises_premise_id_unique"
pg_dump: creating CONSTRAINT "public.crm_ra_rules crm_ra_rules_code_unique"
pg_dump: creating CONSTRAINT "public.crm_ra_rules crm_ra_rules_pkey"
pg_dump: creating CONSTRAINT "public.crm_service_connections crm_service_connections_connection_no_unique"
pg_dump: creating CONSTRAINT "public.crm_service_connections crm_service_connections_pkey"
pg_dump: creating CONSTRAINT "public.crm_tariffs crm_tariffs_pkey"
pg_dump: creating CONSTRAINT "public.data_catalog data_catalog_pkey"
pg_dump: creating CONSTRAINT "public.data_catalog data_catalog_table_name_column_name_unique"
pg_dump: creating CONSTRAINT "public.data_classes data_classes_code_unique"
pg_dump: creating CONSTRAINT "public.data_classes data_classes_pkey"
pg_dump: creating CONSTRAINT "public.device_trust device_trust_pkey"
pg_dump: creating CONSTRAINT "public.dmas dmas_pkey"
pg_dump: creating CONSTRAINT "public.dmas dmas_tenant_id_code_unique"
pg_dump: creating CONSTRAINT "public.dose_change_logs dose_change_logs_pkey"
pg_dump: creating CONSTRAINT "public.dose_plans dose_plans_pkey"

-- Name: crm_payments crm_payments_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.crm_payments
    ADD CONSTRAINT crm_payments_pkey PRIMARY KEY (id);


--
-- TOC entry 5265 (class 2606 OID 338071)
-- Name: crm_premises crm_premises_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.crm_premises
    ADD CONSTRAINT crm_premises_pkey PRIMARY KEY (id);


--
-- TOC entry 5267 (class 2606 OID 338091)
-- Name: crm_premises crm_premises_premise_id_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.crm_premises
    ADD CONSTRAINT crm_premises_premise_id_unique UNIQUE (premise_id);


--
-- TOC entry 5329 (class 2606 OID 338328)
-- Name: crm_ra_rules crm_ra_rules_code_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.crm_ra_rules
    ADD CONSTRAINT crm_ra_rules_code_unique UNIQUE (code);


--
-- TOC entry 5331 (class 2606 OID 338319)
-- Name: crm_ra_rules crm_ra_rules_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.crm_ra_rules
    ADD CONSTRAINT crm_ra_rules_pkey PRIMARY KEY (id);


--
-- TOC entry 5280 (class 2606 OID 338143)
-- Name: crm_service_connections crm_service_connections_connection_no_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.crm_service_connections
    ADD CONSTRAINT crm_service_connections_connection_no_unique UNIQUE (connection_no);


--
-- TOC entry 5282 (class 2606 OID 338128)
-- Name: crm_service_connections crm_service_connections_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.crm_service_connections
    ADD CONSTRAINT crm_service_connections_pkey PRIMARY KEY (id);


--
-- TOC entry 5293 (class 2606 OID 338180)
-- Name: crm_tariffs crm_tariffs_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.crm_tariffs
    ADD CONSTRAINT crm_tariffs_pkey PRIMARY KEY (id);


--
-- TOC entry 5117 (class 2606 OID 337307)
-- Name: data_catalog data_catalog_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.data_catalog
    ADD CONSTRAINT data_catalog_pkey PRIMARY KEY (id);


--
-- TOC entry 5119 (class 2606 OID 337304)
-- Name: data_catalog data_catalog_table_name_column_name_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.data_catalog
    ADD CONSTRAINT data_catalog_table_name_column_name_unique UNIQUE (table_name, column_name);


--
-- TOC entry 5112 (class 2606 OID 337290)
-- Name: data_classes data_classes_code_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.data_classes
    ADD CONSTRAINT data_classes_code_unique UNIQUE (code);


--
-- TOC entry 5114 (class 2606 OID 337288)
-- Name: data_classes data_classes_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.data_classes
    ADD CONSTRAINT data_classes_pkey PRIMARY KEY (id);


--
-- TOC entry 5109 (class 2606 OID 337281)
-- Name: device_trust device_trust_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.device_trust
    ADD CONSTRAINT device_trust_pkey PRIMARY KEY (id);


--
-- TOC entry 4876 (class 2606 OID 336047)
-- Name: dmas dmas_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.dmas
    ADD CONSTRAINT dmas_pkey PRIMARY KEY (id);


--
-- TOC entry 4878 (class 2606 OID 336045)
-- Name: dmas dmas_tenant_id_code_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.dmas
    ADD CONSTRAINT dmas_tenant_id_code_unique UNIQUE (tenant_id, code);


--
-- TOC entry 5353 (class 2606 OID 338502)
-- Name: dose_change_logs dose_change_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.dose_change_logs
    ADD CONSTRAINT dose_change_logs_pkey PRIMARY KEY (id);


--
-- TOC entry 5344 (class 2606 OID 338459)
-- Name: dose_plans dose_plans_pkey; Type: CONSTRAINT;pg_dump: creating CONSTRAINT "public.dsr_requests dsr_requests_pkey"
pg_dump: creating CONSTRAINT "public.employee_skills employee_skills_pkey"
pg_dump: creating CONSTRAINT "public.employee_skills employee_skills_user_id_skill_id_unique"
pg_dump: creating CONSTRAINT "public.enrollments enrollments_pkey"
pg_dump: creating CONSTRAINT "public.enrollments enrollments_user_id_course_id_unique"
pg_dump: creating CONSTRAINT "public.escalation_policies escalation_policies_pkey"
pg_dump: creating CONSTRAINT "public.event_actions event_actions_pkey"
pg_dump: creating CONSTRAINT "public.event_links event_links_event_id_entity_type_entity_id_unique"
pg_dump: creating CONSTRAINT "public.event_links event_links_pkey"
pg_dump: creating CONSTRAINT "public.events events_pkey"
pg_dump: creating CONSTRAINT "public.facilities facilities_pkey"
pg_dump: creating CONSTRAINT "public.facilities facilities_tenant_id_code_unique"
pg_dump: creating CONSTRAINT "public.failed_jobs failed_jobs_pkey"
pg_dump: creating CONSTRAINT "public.failed_jobs failed_jobs_uuid_unique"
pg_dump: creating CONSTRAINT "public.failures failures_pkey"
pg_dump: creating CONSTRAINT "public.interventions interventions_pkey"
 Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.dose_plans
    ADD CONSTRAINT dose_plans_pkey PRIMARY KEY (id);


--
-- TOC entry 5127 (class 2606 OID 337354)
-- Name: dsr_requests dsr_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.dsr_requests
    ADD CONSTRAINT dsr_requests_pkey PRIMARY KEY (id);


--
-- TOC entry 4973 (class 2606 OID 336543)
-- Name: employee_skills employee_skills_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.employee_skills
    ADD CONSTRAINT employee_skills_pkey PRIMARY KEY (id);


--
-- TOC entry 4976 (class 2606 OID 336565)
-- Name: employee_skills employee_skills_user_id_skill_id_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.employee_skills
    ADD CONSTRAINT employee_skills_user_id_skill_id_unique UNIQUE (user_id, skill_id);


--
-- TOC entry 4934 (class 2606 OID 336328)
-- Name: enrollments enrollments_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.enrollments
    ADD CONSTRAINT enrollments_pkey PRIMARY KEY (id);


--
-- TOC entry 4937 (class 2606 OID 336345)
-- Name: enrollments enrollments_user_id_course_id_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.enrollments
    ADD CONSTRAINT enrollments_user_id_course_id_unique UNIQUE (user_id, course_id);


--
-- TOC entry 5193 (class 2606 OID 337612)
-- Name: escalation_policies escalation_policies_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.escalation_policies
    ADD CONSTRAINT escalation_policies_pkey PRIMARY KEY (id);


--
-- TOC entry 5191 (class 2606 OID 337590)
-- Name: event_actions event_actions_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.event_actions
    ADD CONSTRAINT event_actions_pkey PRIMARY KEY (id);


--
-- TOC entry 5178 (class 2606 OID 337564)
-- Name: event_links event_links_event_id_entity_type_entity_id_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.event_links
    ADD CONSTRAINT event_links_event_id_entity_type_entity_id_unique UNIQUE (event_id, entity_type, entity_id);


--
-- TOC entry 5181 (class 2606 OID 337555)
-- Name: event_links event_links_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.event_links
    ADD CONSTRAINT event_links_pkey PRIMARY KEY (id);


--
-- TOC entry 5170 (class 2606 OID 337516)
-- Name: events events_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_pkey PRIMARY KEY (id);


--
-- TOC entry 4871 (class 2606 OID 336025)
-- Name: facilities facilities_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.facilities
    ADD CONSTRAINT facilities_pkey PRIMARY KEY (id);


--
-- TOC entry 4873 (class 2606 OID 336023)
-- Name: facilities facilities_tenant_id_code_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.facilities
    ADD CONSTRAINT facilities_tenant_id_code_unique UNIQUE (tenant_id, code);


--
-- TOC entry 4851 (class 2606 OID 335946)
-- Name: failed_jobs failed_jobs_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.failed_jobs
    ADD CONSTRAINT failed_jobs_pkey PRIMARY KEY (id);


--
-- TOC entry 4853 (class 2606 OID 335948)
-- Name: failed_jobs failed_jobs_uuid_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.failed_jobs
    ADD CONSTRAINT failed_jobs_uuid_unique UNIQUE (uuid);


--
-- TOC entry 5096 (class 2606 OID 337220)
-- Name: failures failures_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.failures
    ADD CONSTRAINT failures_pkey PRIMARY KEY (id);


--
-- TOC entry 5339 (class 2606 OID 338434)
-- Name: interventions interventions_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.intervpg_dump: creating CONSTRAINT "public.job_batches job_batches_pkey"
pg_dump: creating CONSTRAINT "public.jobs jobs_pkey"
pg_dump: creating CONSTRAINT "public.kb_articles kb_articles_pkey"
pg_dump: creating CONSTRAINT "public.kms_keys kms_keys_pkey"
pg_dump: creating CONSTRAINT "public.lesson_progress lesson_progress_enrollment_id_lesson_id_unique"
pg_dump: creating CONSTRAINT "public.lesson_progress lesson_progress_pkey"
pg_dump: creating CONSTRAINT "public.lessons lessons_pkey"
pg_dump: creating CONSTRAINT "public.lookup_values lookup_values_domain_code_unique"
pg_dump: creating CONSTRAINT "public.lookup_values lookup_values_pkey"
pg_dump: creating CONSTRAINT "public.map_layer_configs map_layer_configs_pkey"
pg_dump: creating CONSTRAINT "public.map_layer_configs map_layer_configs_tenant_id_layer_name_unique"
pg_dump: creating CONSTRAINT "public.meter_captures meter_captures_pkey"
pg_dump: creating CONSTRAINT "public.migrations migrations_pkey"
pg_dump: creating CONSTRAINT "public.model_has_permissions model_has_permissions_pkey"
pg_dump: creating CONSTRAINT "public.model_has_roles model_has_roles_pkey"
pg_dump: creating CONSTRAINT "public.network_nodes network_nodes_code_key"
entions
    ADD CONSTRAINT interventions_pkey PRIMARY KEY (id);


--
-- TOC entry 4849 (class 2606 OID 335936)
-- Name: job_batches job_batches_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.job_batches
    ADD CONSTRAINT job_batches_pkey PRIMARY KEY (id);


--
-- TOC entry 4846 (class 2606 OID 335928)
-- Name: jobs jobs_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT jobs_pkey PRIMARY KEY (id);


--
-- TOC entry 4958 (class 2606 OID 336474)
-- Name: kb_articles kb_articles_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.kb_articles
    ADD CONSTRAINT kb_articles_pkey PRIMARY KEY (id);


--
-- TOC entry 5140 (class 2606 OID 337393)
-- Name: kms_keys kms_keys_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.kms_keys
    ADD CONSTRAINT kms_keys_pkey PRIMARY KEY (id);


--
-- TOC entry 4939 (class 2606 OID 336368)
-- Name: lesson_progress lesson_progress_enrollment_id_lesson_id_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.lesson_progress
    ADD CONSTRAINT lesson_progress_enrollment_id_lesson_id_unique UNIQUE (enrollment_id, lesson_id);


--
-- TOC entry 4941 (class 2606 OID 336356)
-- Name: lesson_progress lesson_progress_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.lesson_progress
    ADD CONSTRAINT lesson_progress_pkey PRIMARY KEY (id);


--
-- TOC entry 4931 (class 2606 OID 336313)
-- Name: lessons lessons_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.lessons
    ADD CONSTRAINT lessons_pkey PRIMARY KEY (id);


--
-- TOC entry 4893 (class 2606 OID 336120)
-- Name: lookup_values lookup_values_domain_code_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.lookup_values
    ADD CONSTRAINT lookup_values_domain_code_unique UNIQUE (domain, code);


--
-- TOC entry 4895 (class 2606 OID 336122)
-- Name: lookup_values lookup_values_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.lookup_values
    ADD CONSTRAINT lookup_values_pkey PRIMARY KEY (id);


--
-- TOC entry 4920 (class 2606 OID 336263)
-- Name: map_layer_configs map_layer_configs_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.map_layer_configs
    ADD CONSTRAINT map_layer_configs_pkey PRIMARY KEY (id);


--
-- TOC entry 4922 (class 2606 OID 336261)
-- Name: map_layer_configs map_layer_configs_tenant_id_layer_name_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.map_layer_configs
    ADD CONSTRAINT map_layer_configs_tenant_id_layer_name_unique UNIQUE (tenant_id, layer_name);


--
-- TOC entry 5036 (class 2606 OID 336980)
-- Name: meter_captures meter_captures_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.meter_captures
    ADD CONSTRAINT meter_captures_pkey PRIMARY KEY (id);


--
-- TOC entry 4829 (class 2606 OID 335878)
-- Name: migrations migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.migrations
    ADD CONSTRAINT migrations_pkey PRIMARY KEY (id);


--
-- TOC entry 4993 (class 2606 OID 336663)
-- Name: model_has_permissions model_has_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.model_has_permissions
    ADD CONSTRAINT model_has_permissions_pkey PRIMARY KEY (permission_id, model_id, model_type);


--
-- TOC entry 4996 (class 2606 OID 336674)
-- Name: model_has_roles model_has_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.model_has_roles
    ADD CONSTRAINT model_has_roles_pkey PRIMARY KEY (role_id, model_id, model_type);


--
-- TOC entry 5361 (class 2606 OID 338540)
-- Name: network_nodes network_nodes_code_key; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.network_nodes
    ADpg_dump: creating CONSTRAINT "public.network_nodes network_nodes_pkey"
pg_dump: creating CONSTRAINT "public.notifications notifications_pkey"
pg_dump: creating CONSTRAINT "public.nrw_snapshots nrw_snapshots_pkey"
pg_dump: creating CONSTRAINT "public.nrw_snapshots nrw_snapshots_tenant_id_dma_id_as_of_unique"
pg_dump: creating CONSTRAINT "public.oncall_schedules oncall_schedules_pkey"
pg_dump: creating CONSTRAINT "public.organizations organizations_pkey"
pg_dump: creating CONSTRAINT "public.organizations organizations_tenant_id_org_code_unique"
pg_dump: creating CONSTRAINT "public.outages outages_code_key"
pg_dump: creating CONSTRAINT "public.outages outages_pkey"
pg_dump: creating CONSTRAINT "public.parts parts_code_unique"
pg_dump: creating CONSTRAINT "public.parts parts_pkey"
pg_dump: creating CONSTRAINT "public.password_reset_tokens password_reset_tokens_pkey"
pg_dump: creating CONSTRAINT "public.permissions permissions_name_guard_name_unique"
pg_dump: creating CONSTRAINT "public.permissions permissions_pkey"
pg_dump: creating CONSTRAINT "public.personal_access_tokens personal_access_tokens_pkey"
pg_dump: creating CONSTRAINT "public.personal_access_tokens personal_access_tokens_token_unique"
D CONSTRAINT network_nodes_code_key UNIQUE (code);


--
-- TOC entry 5363 (class 2606 OID 338538)
-- Name: network_nodes network_nodes_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.network_nodes
    ADD CONSTRAINT network_nodes_pkey PRIMARY KEY (id);


--
-- TOC entry 5197 (class 2606 OID 337630)
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- TOC entry 5335 (class 2606 OID 338408)
-- Name: nrw_snapshots nrw_snapshots_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.nrw_snapshots
    ADD CONSTRAINT nrw_snapshots_pkey PRIMARY KEY (id);


--
-- TOC entry 5337 (class 2606 OID 338405)
-- Name: nrw_snapshots nrw_snapshots_tenant_id_dma_id_as_of_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.nrw_snapshots
    ADD CONSTRAINT nrw_snapshots_tenant_id_dma_id_as_of_unique UNIQUE (tenant_id, dma_id, as_of);


--
-- TOC entry 4981 (class 2606 OID 336592)
-- Name: oncall_schedules oncall_schedules_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.oncall_schedules
    ADD CONSTRAINT oncall_schedules_pkey PRIMARY KEY (id);


--
-- TOC entry 4860 (class 2606 OID 335977)
-- Name: organizations organizations_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.organizations
    ADD CONSTRAINT organizations_pkey PRIMARY KEY (id);


--
-- TOC entry 4862 (class 2606 OID 335975)
-- Name: organizations organizations_tenant_id_org_code_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.organizations
    ADD CONSTRAINT organizations_tenant_id_org_code_unique UNIQUE (tenant_id, org_code);


--
-- TOC entry 5366 (class 2606 OID 338561)
-- Name: outages outages_code_key; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.outages
    ADD CONSTRAINT outages_code_key UNIQUE (code);


--
-- TOC entry 5368 (class 2606 OID 338559)
-- Name: outages outages_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.outages
    ADD CONSTRAINT outages_pkey PRIMARY KEY (id);


--
-- TOC entry 5040 (class 2606 OID 337009)
-- Name: parts parts_code_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.parts
    ADD CONSTRAINT parts_code_unique UNIQUE (code);


--
-- TOC entry 5042 (class 2606 OID 336999)
-- Name: parts parts_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.parts
    ADD CONSTRAINT parts_pkey PRIMARY KEY (id);


--
-- TOC entry 4836 (class 2606 OID 335896)
-- Name: password_reset_tokens password_reset_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT password_reset_tokens_pkey PRIMARY KEY (email);


--
-- TOC entry 4984 (class 2606 OID 336622)
-- Name: permissions permissions_name_guard_name_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_name_guard_name_unique UNIQUE (name, guard_name);


--
-- TOC entry 4986 (class 2606 OID 336619)
-- Name: permissions permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_pkey PRIMARY KEY (id);


--
-- TOC entry 5001 (class 2606 OID 336698)
-- Name: personal_access_tokens personal_access_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.personal_access_tokens
    ADD CONSTRAINT personal_access_tokens_pkey PRIMARY KEY (id);


--
-- TOC entry 5003 (class 2606 OID 336701)
-- Name: personal_access_tokens personal_access_tokens_token_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.personal_access_tokens
    ADD CONSTRAINT personal_access_tokens_token_unique UNpg_dump: creating CONSTRAINT "public.pipelines pipelines_pkey"
pg_dump: creating CONSTRAINT "public.pipelines pipelines_tenant_id_code_unique"
pg_dump: creating CONSTRAINT "public.playbooks playbooks_pkey"
pg_dump: creating CONSTRAINT "public.pm_policies pm_policies_pkey"
pg_dump: creating CONSTRAINT "public.pm_schedules pm_schedules_pkey"
pg_dump: creating CONSTRAINT "public.pump_schedules pump_schedules_pkey"
pg_dump: creating CONSTRAINT "public.questions questions_pkey"
pg_dump: creating CONSTRAINT "public.redlines redlines_pkey"
pg_dump: creating CONSTRAINT "public.retention_policies retention_policies_pkey"
pg_dump: creating CONSTRAINT "public.role_has_permissions role_has_permissions_pkey"
pg_dump: creating CONSTRAINT "public.roles roles_name_guard_name_unique"
pg_dump: creating CONSTRAINT "public.roles roles_pkey"
pg_dump: creating CONSTRAINT "public.rosters rosters_pkey"
pg_dump: creating CONSTRAINT "public.schemes schemes_pkey"
pg_dump: creating CONSTRAINT "public.schemes schemes_tenant_id_code_unique"
pg_dump: creating CONSTRAINT "public.secrets secrets_pkey"
pg_dump: creating CONSTRAINT "public.secrets secrets_tenant_id_key_unique"
pg_dump: creating CONSTRAINT "public.security_alerts security_alerts_pkey"
IQUE (token);


--
-- TOC entry 4881 (class 2606 OID 336071)
-- Name: pipelines pipelines_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.pipelines
    ADD CONSTRAINT pipelines_pkey PRIMARY KEY (id);


--
-- TOC entry 4883 (class 2606 OID 336069)
-- Name: pipelines pipelines_tenant_id_code_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.pipelines
    ADD CONSTRAINT pipelines_tenant_id_code_unique UNIQUE (tenant_id, code);


--
-- TOC entry 5185 (class 2606 OID 337573)
-- Name: playbooks playbooks_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.playbooks
    ADD CONSTRAINT playbooks_pkey PRIMARY KEY (id);


--
-- TOC entry 5056 (class 2606 OID 337057)
-- Name: pm_policies pm_policies_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.pm_policies
    ADD CONSTRAINT pm_policies_pkey PRIMARY KEY (id);


--
-- TOC entry 5059 (class 2606 OID 337073)
-- Name: pm_schedules pm_schedules_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.pm_schedules
    ADD CONSTRAINT pm_schedules_pkey PRIMARY KEY (id);


--
-- TOC entry 5356 (class 2606 OID 338531)
-- Name: pump_schedules pump_schedules_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.pump_schedules
    ADD CONSTRAINT pump_schedules_pkey PRIMARY KEY (id);


--
-- TOC entry 4945 (class 2606 OID 336397)
-- Name: questions questions_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.questions
    ADD CONSTRAINT questions_pkey PRIMARY KEY (id);


--
-- TOC entry 4908 (class 2606 OID 336193)
-- Name: redlines redlines_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.redlines
    ADD CONSTRAINT redlines_pkey PRIMARY KEY (id);


--
-- TOC entry 5122 (class 2606 OID 337316)
-- Name: retention_policies retention_policies_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.retention_policies
    ADD CONSTRAINT retention_policies_pkey PRIMARY KEY (id);


--
-- TOC entry 4998 (class 2606 OID 336689)
-- Name: role_has_permissions role_has_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.role_has_permissions
    ADD CONSTRAINT role_has_permissions_pkey PRIMARY KEY (permission_id, role_id);


--
-- TOC entry 4988 (class 2606 OID 336642)
-- Name: roles roles_name_guard_name_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_name_guard_name_unique UNIQUE (name, guard_name);


--
-- TOC entry 4990 (class 2606 OID 336633)
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- TOC entry 4978 (class 2606 OID 336576)
-- Name: rosters rosters_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.rosters
    ADD CONSTRAINT rosters_pkey PRIMARY KEY (id);


--
-- TOC entry 4866 (class 2606 OID 336001)
-- Name: schemes schemes_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.schemes
    ADD CONSTRAINT schemes_pkey PRIMARY KEY (id);


--
-- TOC entry 4868 (class 2606 OID 335999)
-- Name: schemes schemes_tenant_id_code_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.schemes
    ADD CONSTRAINT schemes_tenant_id_code_unique UNIQUE (tenant_id, code);


--
-- TOC entry 5143 (class 2606 OID 337412)
-- Name: secrets secrets_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.secrets
    ADD CONSTRAINT secrets_pkey PRIMARY KEY (id);


--
-- TOC entry 5145 (class 2606 OID 337410)
-- Name: secrets secrets_tenant_id_key_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.secrets
    ADD CONSTRAINT secrets_tenant_id_key_unique UNIQUE (tenant_id, key);


--
-- pg_dump: creating CONSTRAINT "public.sessions sessions_pkey"
pg_dump: creating CONSTRAINT "public.shift_entries shift_entries_pkey"
pg_dump: creating CONSTRAINT "public.shifts shifts_pkey"
pg_dump: creating CONSTRAINT "public.skills skills_code_unique"
pg_dump: creating CONSTRAINT "public.skills skills_pkey"
pg_dump: creating CONSTRAINT "public.sops sops_code_unique"
pg_dump: creating CONSTRAINT "public.sops sops_pkey"
pg_dump: creating CONSTRAINT "public.spatial_change_log spatial_change_log_pkey"
pg_dump: creating CONSTRAINT "public.spatial_edit_layers spatial_edit_layers_pkey"
pg_dump: creating CONSTRAINT "public.stock_txns stock_txns_pkey"
pg_dump: creating CONSTRAINT "public.suppliers suppliers_pkey"
pg_dump: creating CONSTRAINT "public.telemetry_measurements telemetry_measurements_pkey"
pg_dump: creating CONSTRAINT "public.telemetry_tags telemetry_tags_pkey"
pg_dump: creating CONSTRAINT "public.telemetry_tags telemetry_tags_tag_unique"
pg_dump: creating CONSTRAINT "public.tenants tenants_pkey"
pg_dump: creating CONSTRAINT "public.tenants tenants_short_code_unique"
pg_dump: creating CONSTRAINT "public.topology_validations topology_validations_pkey"
TOC entry 5137 (class 2606 OID 337385)
-- Name: security_alerts security_alerts_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.security_alerts
    ADD CONSTRAINT security_alerts_pkey PRIMARY KEY (id);


--
-- TOC entry 4839 (class 2606 OID 335903)
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- TOC entry 5151 (class 2606 OID 337435)
-- Name: shift_entries shift_entries_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.shift_entries
    ADD CONSTRAINT shift_entries_pkey PRIMARY KEY (id);


--
-- TOC entry 5101 (class 2606 OID 337246)
-- Name: shifts shifts_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.shifts
    ADD CONSTRAINT shifts_pkey PRIMARY KEY (id);


--
-- TOC entry 4968 (class 2606 OID 336533)
-- Name: skills skills_code_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.skills
    ADD CONSTRAINT skills_code_unique UNIQUE (code);


--
-- TOC entry 4970 (class 2606 OID 336525)
-- Name: skills skills_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.skills
    ADD CONSTRAINT skills_pkey PRIMARY KEY (id);


--
-- TOC entry 4962 (class 2606 OID 336516)
-- Name: sops sops_code_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.sops
    ADD CONSTRAINT sops_code_unique UNIQUE (code);


--
-- TOC entry 4965 (class 2606 OID 336502)
-- Name: sops sops_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.sops
    ADD CONSTRAINT sops_pkey PRIMARY KEY (id);


--
-- TOC entry 4917 (class 2606 OID 336245)
-- Name: spatial_change_log spatial_change_log_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.spatial_change_log
    ADD CONSTRAINT spatial_change_log_pkey PRIMARY KEY (id);


--
-- TOC entry 4901 (class 2606 OID 336166)
-- Name: spatial_edit_layers spatial_edit_layers_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.spatial_edit_layers
    ADD CONSTRAINT spatial_edit_layers_pkey PRIMARY KEY (id);


--
-- TOC entry 5084 (class 2606 OID 337159)
-- Name: stock_txns stock_txns_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.stock_txns
    ADD CONSTRAINT stock_txns_pkey PRIMARY KEY (id);


--
-- TOC entry 5051 (class 2606 OID 337039)
-- Name: suppliers suppliers_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.suppliers
    ADD CONSTRAINT suppliers_pkey PRIMARY KEY (id);


--
-- TOC entry 5376 (class 2606 OID 338620)
-- Name: telemetry_measurements telemetry_measurements_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.telemetry_measurements
    ADD CONSTRAINT telemetry_measurements_pkey PRIMARY KEY (id);


--
-- TOC entry 5371 (class 2606 OID 338604)
-- Name: telemetry_tags telemetry_tags_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.telemetry_tags
    ADD CONSTRAINT telemetry_tags_pkey PRIMARY KEY (id);


--
-- TOC entry 5373 (class 2606 OID 338606)
-- Name: telemetry_tags telemetry_tags_tag_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.telemetry_tags
    ADD CONSTRAINT telemetry_tags_tag_unique UNIQUE (tag);


--
-- TOC entry 4855 (class 2606 OID 335960)
-- Name: tenants tenants_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.tenants
    ADD CONSTRAINT tenants_pkey PRIMARY KEY (id);


--
-- TOC entry 4857 (class 2606 OID 335962)
-- Name: tenants tenants_short_code_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.tenants
    ADD CONSTRAINT tenants_short_code_unique UNIQUE (short_code);


--
-- TOC entry 4913 (class 2606 OID 336220)
-- Name: topology_validations topology_vpg_dump: creating CONSTRAINT "public.users users_email_unique"
pg_dump: creating CONSTRAINT "public.users users_pkey"
pg_dump: creating CONSTRAINT "public.wo_labor wo_labor_pkey"
pg_dump: creating CONSTRAINT "public.wo_parts wo_parts_pkey"
pg_dump: creating CONSTRAINT "public.work_orders work_orders_pkey"
pg_dump: creating CONSTRAINT "public.work_orders work_orders_wo_num_unique"
pg_dump: creating CONSTRAINT "public.wq_compliance wq_compliance_pkey"
pg_dump: creating CONSTRAINT "public.wq_compliance wq_compliance_unique"
pg_dump: creating CONSTRAINT "public.wq_parameters wq_parameters_code_unique"
pg_dump: creating CONSTRAINT "public.wq_parameters wq_parameters_pkey"
pg_dump: creating CONSTRAINT "public.wq_plan_rules wq_plan_rules_pkey"
pg_dump: creating CONSTRAINT "public.wq_plans wq_plans_pkey"
pg_dump: creating CONSTRAINT "public.wq_qc_controls wq_qc_controls_pkey"
pg_dump: creating CONSTRAINT "public.wq_results wq_results_pkey"
pg_dump: creating CONSTRAINT "public.wq_sample_params wq_sample_params_pkey"
pg_dump: creating CONSTRAINT "public.wq_sample_params wq_sample_params_sample_id_parameter_id_unique"
pg_dump: creating CONSTRAINT "public.wq_samples wq_samples_barcode_unique"
alidations_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.topology_validations
    ADD CONSTRAINT topology_validations_pkey PRIMARY KEY (id);


--
-- TOC entry 4832 (class 2606 OID 335889)
-- Name: users users_email_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_unique UNIQUE (email);


--
-- TOC entry 4834 (class 2606 OID 335887)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 5091 (class 2606 OID 337199)
-- Name: wo_labor wo_labor_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.wo_labor
    ADD CONSTRAINT wo_labor_pkey PRIMARY KEY (id);


--
-- TOC entry 5088 (class 2606 OID 337180)
-- Name: wo_parts wo_parts_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.wo_parts
    ADD CONSTRAINT wo_parts_pkey PRIMARY KEY (id);


--
-- TOC entry 5069 (class 2606 OID 337098)
-- Name: work_orders work_orders_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.work_orders
    ADD CONSTRAINT work_orders_pkey PRIMARY KEY (id);


--
-- TOC entry 5076 (class 2606 OID 337146)
-- Name: work_orders work_orders_wo_num_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.work_orders
    ADD CONSTRAINT work_orders_wo_num_unique UNIQUE (wo_num);


--
-- TOC entry 5253 (class 2606 OID 338012)
-- Name: wq_compliance wq_compliance_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.wq_compliance
    ADD CONSTRAINT wq_compliance_pkey PRIMARY KEY (id);


--
-- TOC entry 5256 (class 2606 OID 338027)
-- Name: wq_compliance wq_compliance_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.wq_compliance
    ADD CONSTRAINT wq_compliance_unique UNIQUE (sampling_point_id, parameter_id, period, granularity);


--
-- TOC entry 5202 (class 2606 OID 337649)
-- Name: wq_parameters wq_parameters_code_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.wq_parameters
    ADD CONSTRAINT wq_parameters_code_unique UNIQUE (code);


--
-- TOC entry 5206 (class 2606 OID 337644)
-- Name: wq_parameters wq_parameters_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.wq_parameters
    ADD CONSTRAINT wq_parameters_pkey PRIMARY KEY (id);


--
-- TOC entry 5225 (class 2606 OID 337909)
-- Name: wq_plan_rules wq_plan_rules_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.wq_plan_rules
    ADD CONSTRAINT wq_plan_rules_pkey PRIMARY KEY (id);


--
-- TOC entry 5209 (class 2606 OID 337660)
-- Name: wq_plans wq_plans_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.wq_plans
    ADD CONSTRAINT wq_plans_pkey PRIMARY KEY (id);


--
-- TOC entry 5260 (class 2606 OID 338038)
-- Name: wq_qc_controls wq_qc_controls_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.wq_qc_controls
    ADD CONSTRAINT wq_qc_controls_pkey PRIMARY KEY (id);


--
-- TOC entry 5248 (class 2606 OID 337987)
-- Name: wq_results wq_results_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.wq_results
    ADD CONSTRAINT wq_results_pkey PRIMARY KEY (id);


--
-- TOC entry 5240 (class 2606 OID 337961)
-- Name: wq_sample_params wq_sample_params_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.wq_sample_params
    ADD CONSTRAINT wq_sample_params_pkey PRIMARY KEY (id);


--
-- TOC entry 5243 (class 2606 OID 337976)
-- Name: wq_sample_params wq_sample_params_sample_id_parameter_id_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.wq_sample_params
    ADD CONSTRAINT wq_sample_params_sample_id_parameter_id_unique UNIQUE (sample_id, parameter_id);


--
-- pg_dump: creating CONSTRAINT "public.wq_samples wq_samples_pkey"
pg_dump: creating CONSTRAINT "public.wq_sampling_points wq_sampling_points_code_unique"
pg_dump: creating CONSTRAINT "public.wq_sampling_points wq_sampling_points_pkey"
pg_dump: creating CONSTRAINT "public.zones zones_pkey"
pg_dump: creating CONSTRAINT "public.zones zones_tenant_id_code_unique"
pg_dump: creating INDEX "public.addresses_location_idx"
pg_dump: creating INDEX "public.api_keys_tenant_id_revoked_index"
pg_dump: creating INDEX "public.assessment_attempts_enrollment_id_attempt_number_index"
pg_dump: creating INDEX "public.asset_boms_asset_id_index"
pg_dump: creating INDEX "public.asset_boms_part_id_index"
pg_dump: creating INDEX "public.asset_classes_code_index"
pg_dump: creating INDEX "public.asset_classes_parent_id_index"
pg_dump: creating INDEX "public.asset_locations_asset_id_index"
pg_dump: creating INDEX "public.asset_locations_effective_from_effective_to_index"
pg_dump: creating INDEX "public.asset_locations_geom_spatialindex"
pg_dump: creating INDEX "public.asset_meters_asset_id_index"
TOC entry 5230 (class 2606 OID 337950)
-- Name: wq_samples wq_samples_barcode_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.wq_samples
    ADD CONSTRAINT wq_samples_barcode_unique UNIQUE (barcode);


--
-- TOC entry 5234 (class 2606 OID 337927)
-- Name: wq_samples wq_samples_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.wq_samples
    ADD CONSTRAINT wq_samples_pkey PRIMARY KEY (id);


--
-- TOC entry 5214 (class 2606 OID 337896)
-- Name: wq_sampling_points wq_sampling_points_code_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.wq_sampling_points
    ADD CONSTRAINT wq_sampling_points_code_unique UNIQUE (code);


--
-- TOC entry 5221 (class 2606 OID 337872)
-- Name: wq_sampling_points wq_sampling_points_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.wq_sampling_points
    ADD CONSTRAINT wq_sampling_points_pkey PRIMARY KEY (id);


--
-- TOC entry 4886 (class 2606 OID 336091)
-- Name: zones zones_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.zones
    ADD CONSTRAINT zones_pkey PRIMARY KEY (id);


--
-- TOC entry 4888 (class 2606 OID 336089)
-- Name: zones zones_tenant_id_code_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.zones
    ADD CONSTRAINT zones_tenant_id_code_unique UNIQUE (tenant_id, code);


--
-- TOC entry 4889 (class 1259 OID 336111)
-- Name: addresses_location_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX addresses_location_idx ON public.addresses USING gist (location);


--
-- TOC entry 5079 (class 1259 OID 337233)
-- Name: api_keys_tenant_id_revoked_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX api_keys_tenant_id_revoked_index ON public.api_keys USING btree (tenant_id, revoked);


--
-- TOC entry 4946 (class 1259 OID 336430)
-- Name: assessment_attempts_enrollment_id_attempt_number_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX assessment_attempts_enrollment_id_attempt_number_index ON public.assessment_attempts USING btree (enrollment_id, attempt_number);


--
-- TOC entry 5044 (class 1259 OID 337027)
-- Name: asset_boms_asset_id_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX asset_boms_asset_id_index ON public.asset_boms USING btree (asset_id);


--
-- TOC entry 5047 (class 1259 OID 337028)
-- Name: asset_boms_part_id_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX asset_boms_part_id_index ON public.asset_boms USING btree (part_id);


--
-- TOC entry 5005 (class 1259 OID 336889)
-- Name: asset_classes_code_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX asset_classes_code_index ON public.asset_classes USING btree (code);


--
-- TOC entry 5008 (class 1259 OID 336888)
-- Name: asset_classes_parent_id_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX asset_classes_parent_id_index ON public.asset_classes USING btree (parent_id);


--
-- TOC entry 5025 (class 1259 OID 336954)
-- Name: asset_locations_asset_id_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX asset_locations_asset_id_index ON public.asset_locations USING btree (asset_id);


--
-- TOC entry 5026 (class 1259 OID 336955)
-- Name: asset_locations_effective_from_effective_to_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX asset_locations_effective_from_effective_to_index ON public.asset_locations USING btree (effective_from, effective_to);


--
-- TOC entry 5027 (class 1259 OID 336956)
-- Name: asset_locations_geom_spatialindex; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX asset_locations_geom_spatialindex ON public.asset_locations USING gist (geom);


--
-- TOC entry 5030 (class 1259 OID 336970)
-- Name: asset_meters_asset_id_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX asset_meters_asset_id_index ON public.asset_meters USING btree (pg_dump: creating INDEX "public.assets_class_id_index"
pg_dump: creating INDEX "public.assets_code_index"
pg_dump: creating INDEX "public.assets_dma_id_index"
pg_dump: creating INDEX "public.assets_geom_spatialindex"
pg_dump: creating INDEX "public.assets_parent_id_index"
pg_dump: creating INDEX "public.assets_scheme_id_index"
pg_dump: creating INDEX "public.assets_status_index"
pg_dump: creating INDEX "public.assets_tenant_id_index"
pg_dump: creating INDEX "public.attachments_entity_type_entity_id_index"
pg_dump: creating INDEX "public.audit_events_action_index"
pg_dump: creating INDEX "public.audit_events_entity_type_entity_id_index"
pg_dump: creating INDEX "public.audit_events_tenant_id_occurred_at_actor_id_index"
pg_dump: creating INDEX "public.certificates_expires_at_index"
pg_dump: creating INDEX "public.certificates_tenant_id_user_id_index"
pg_dump: creating INDEX "public.checklist_runs_checklist_id_index"
pg_dump: creating INDEX "public.checklist_runs_facility_id_index"
pg_dump: creating INDEX "public.checklist_runs_performed_by_index"
pg_dump: creating INDEX "public.checklist_runs_shift_id_index"
asset_id);


--
-- TOC entry 5013 (class 1259 OID 336931)
-- Name: assets_class_id_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX assets_class_id_index ON public.assets USING btree (class_id);


--
-- TOC entry 5014 (class 1259 OID 336934)
-- Name: assets_code_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX assets_code_index ON public.assets USING btree (code);


--
-- TOC entry 5017 (class 1259 OID 336930)
-- Name: assets_dma_id_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX assets_dma_id_index ON public.assets USING btree (dma_id);


--
-- TOC entry 5018 (class 1259 OID 336935)
-- Name: assets_geom_spatialindex; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX assets_geom_spatialindex ON public.assets USING gist (geom);


--
-- TOC entry 5019 (class 1259 OID 336932)
-- Name: assets_parent_id_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX assets_parent_id_index ON public.assets USING btree (parent_id);


--
-- TOC entry 5022 (class 1259 OID 336929)
-- Name: assets_scheme_id_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX assets_scheme_id_index ON public.assets USING btree (scheme_id);


--
-- TOC entry 5023 (class 1259 OID 336933)
-- Name: assets_status_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX assets_status_index ON public.assets USING btree (status);


--
-- TOC entry 5024 (class 1259 OID 336928)
-- Name: assets_tenant_id_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX assets_tenant_id_index ON public.assets USING btree (tenant_id);


--
-- TOC entry 4896 (class 1259 OID 336133)
-- Name: attachments_entity_type_entity_id_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX attachments_entity_type_entity_id_index ON public.attachments USING btree (entity_type, entity_id);


--
-- TOC entry 5130 (class 1259 OID 337368)
-- Name: audit_events_action_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX audit_events_action_index ON public.audit_events USING btree (action);


--
-- TOC entry 5131 (class 1259 OID 337367)
-- Name: audit_events_entity_type_entity_id_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX audit_events_entity_type_entity_id_index ON public.audit_events USING btree (entity_type, entity_id);


--
-- TOC entry 5134 (class 1259 OID 337366)
-- Name: audit_events_tenant_id_occurred_at_actor_id_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX audit_events_tenant_id_occurred_at_actor_id_index ON public.audit_events USING btree (tenant_id, occurred_at, actor_id);


--
-- TOC entry 4951 (class 1259 OID 336456)
-- Name: certificates_expires_at_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX certificates_expires_at_index ON public.certificates USING btree (expires_at);


--
-- TOC entry 4956 (class 1259 OID 336455)
-- Name: certificates_tenant_id_user_id_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX certificates_tenant_id_user_id_index ON public.certificates USING btree (tenant_id, user_id);


--
-- TOC entry 5157 (class 1259 OID 337498)
-- Name: checklist_runs_checklist_id_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX checklist_runs_checklist_id_index ON public.checklist_runs USING btree (checklist_id);


--
-- TOC entry 5158 (class 1259 OID 337500)
-- Name: checklist_runs_facility_id_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX checklist_runs_facility_id_index ON public.checklist_runs USING btree (facility_id);


--
-- TOC entry 5159 (class 1259 OID 337501)
-- Name: checklist_runs_performed_by_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX checklist_runs_performed_by_index ON public.checklist_runs USING btree (performed_by);


--
-- TOC entry 5162 (class 1259 OID 337499)
-- Name: checklist_runs_shift_id_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX checklist_runs_shift_id_pg_dump: creating INDEX "public.checklist_runs_started_at_completed_at_index"
pg_dump: creating INDEX "public.checklists_frequency_index"
pg_dump: creating INDEX "public.checklists_tenant_id_index"
pg_dump: creating INDEX "public.chemical_stocks_scheme_id_chemical_index"
pg_dump: creating INDEX "public.consents_user_id_granted_at_index"
pg_dump: creating INDEX "public.courses_domain_level_index"
pg_dump: creating INDEX "public.courses_tenant_id_status_index"
pg_dump: creating INDEX "public.crm_balances_account_no_index"
pg_dump: creating INDEX "public.crm_balances_tenant_id_index"
pg_dump: creating INDEX "public.crm_customer_reads_geom_gist"
pg_dump: creating INDEX "public.crm_customer_reads_meter_id_index"
pg_dump: creating INDEX "public.crm_customer_reads_meter_id_read_at_index"
pg_dump: creating INDEX "public.crm_customer_reads_read_source_index"
pg_dump: creating INDEX "public.crm_customers_customer_no_index"
pg_dump: creating INDEX "public.crm_customers_name_tenant_id_index"
pg_dump: creating INDEX "public.crm_customers_tenant_id_index"
pg_dump: creating INDEX "public.crm_invoice_lines_invoice_id_index"
index ON public.checklist_runs USING btree (shift_id);


--
-- TOC entry 5163 (class 1259 OID 337502)
-- Name: checklist_runs_started_at_completed_at_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX checklist_runs_started_at_completed_at_index ON public.checklist_runs USING btree (started_at, completed_at);


--
-- TOC entry 5153 (class 1259 OID 337468)
-- Name: checklists_frequency_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX checklists_frequency_index ON public.checklists USING btree (frequency);


--
-- TOC entry 5156 (class 1259 OID 337467)
-- Name: checklists_tenant_id_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX checklists_tenant_id_index ON public.checklists USING btree (tenant_id);


--
-- TOC entry 5348 (class 1259 OID 338482)
-- Name: chemical_stocks_scheme_id_chemical_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX chemical_stocks_scheme_id_chemical_index ON public.chemical_stocks USING btree (scheme_id, chemical);


--
-- TOC entry 5125 (class 1259 OID 337327)
-- Name: consents_user_id_granted_at_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX consents_user_id_granted_at_index ON public.consents USING btree (user_id, granted_at);


--
-- TOC entry 4925 (class 1259 OID 336289)
-- Name: courses_domain_level_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX courses_domain_level_index ON public.courses USING btree (domain, level);


--
-- TOC entry 4928 (class 1259 OID 336288)
-- Name: courses_tenant_id_status_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX courses_tenant_id_status_index ON public.courses USING btree (tenant_id, status);


--
-- TOC entry 5310 (class 1259 OID 338259)
-- Name: crm_balances_account_no_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX crm_balances_account_no_index ON public.crm_balances USING btree (account_no);


--
-- TOC entry 5315 (class 1259 OID 338258)
-- Name: crm_balances_tenant_id_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX crm_balances_tenant_id_index ON public.crm_balances USING btree (tenant_id);


--
-- TOC entry 5321 (class 1259 OID 338307)
-- Name: crm_customer_reads_geom_gist; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX crm_customer_reads_geom_gist ON public.crm_customer_reads USING gist (geom);


--
-- TOC entry 5322 (class 1259 OID 338304)
-- Name: crm_customer_reads_meter_id_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX crm_customer_reads_meter_id_index ON public.crm_customer_reads USING btree (meter_id);


--
-- TOC entry 5323 (class 1259 OID 338305)
-- Name: crm_customer_reads_meter_id_read_at_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX crm_customer_reads_meter_id_read_at_index ON public.crm_customer_reads USING btree (meter_id, read_at);


--
-- TOC entry 5326 (class 1259 OID 338306)
-- Name: crm_customer_reads_read_source_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX crm_customer_reads_read_source_index ON public.crm_customer_reads USING btree (read_source);


--
-- TOC entry 5285 (class 1259 OID 338166)
-- Name: crm_customers_customer_no_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX crm_customers_customer_no_index ON public.crm_customers USING btree (customer_no);


--
-- TOC entry 5288 (class 1259 OID 338167)
-- Name: crm_customers_name_tenant_id_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX crm_customers_name_tenant_id_index ON public.crm_customers USING btree (name, tenant_id);


--
-- TOC entry 5291 (class 1259 OID 338165)
-- Name: crm_customers_tenant_id_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX crm_customers_tenant_id_index ON public.crm_customers USING btree (tenant_id);


--
-- TOC entry 5301 (class 1259 OID 338221)
-- Name: crm_invoice_lines_invoice_id_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX crm_invoice_lipg_dump: creating INDEX "public.crm_invoices_account_no_index"
pg_dump: creating INDEX "public.crm_invoices_status_due_date_index"
pg_dump: creating INDEX "public.crm_invoices_tenant_id_index"
pg_dump: creating INDEX "public.crm_meters_serial_no_index"
pg_dump: creating INDEX "public.crm_meters_status_index"
pg_dump: creating INDEX "public.crm_meters_tenant_id_index"
pg_dump: creating INDEX "public.crm_payment_plans_account_no_index"
pg_dump: creating INDEX "public.crm_payment_plans_status_next_due_index"
pg_dump: creating INDEX "public.crm_payment_plans_tenant_id_index"
pg_dump: creating INDEX "public.crm_payments_account_no_index"
pg_dump: creating INDEX "public.crm_payments_paid_at_index"
pg_dump: creating INDEX "public.crm_payments_ref_index"
pg_dump: creating INDEX "public.crm_payments_tenant_id_index"
pg_dump: creating INDEX "public.crm_premises_location_gist"
pg_dump: creating INDEX "public.crm_premises_scheme_id_index"
pg_dump: creating INDEX "public.crm_premises_status_index"
pg_dump: creating INDEX "public.crm_premises_tenant_id_index"
pg_dump: creating INDEX "public.crm_ra_rules_active_severity_index"
nes_invoice_id_index ON public.crm_invoice_lines USING btree (invoice_id);


--
-- TOC entry 5296 (class 1259 OID 338205)
-- Name: crm_invoices_account_no_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX crm_invoices_account_no_index ON public.crm_invoices USING btree (account_no);


--
-- TOC entry 5299 (class 1259 OID 338206)
-- Name: crm_invoices_status_due_date_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX crm_invoices_status_due_date_index ON public.crm_invoices USING btree (status, due_date);


--
-- TOC entry 5300 (class 1259 OID 338204)
-- Name: crm_invoices_tenant_id_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX crm_invoices_tenant_id_index ON public.crm_invoices USING btree (tenant_id);


--
-- TOC entry 5273 (class 1259 OID 338112)
-- Name: crm_meters_serial_no_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX crm_meters_serial_no_index ON public.crm_meters USING btree (serial_no);


--
-- TOC entry 5276 (class 1259 OID 338113)
-- Name: crm_meters_status_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX crm_meters_status_index ON public.crm_meters USING btree (status);


--
-- TOC entry 5277 (class 1259 OID 338111)
-- Name: crm_meters_tenant_id_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX crm_meters_tenant_id_index ON public.crm_meters USING btree (tenant_id);


--
-- TOC entry 5316 (class 1259 OID 338279)
-- Name: crm_payment_plans_account_no_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX crm_payment_plans_account_no_index ON public.crm_payment_plans USING btree (account_no);


--
-- TOC entry 5319 (class 1259 OID 338280)
-- Name: crm_payment_plans_status_next_due_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX crm_payment_plans_status_next_due_index ON public.crm_payment_plans USING btree (status, next_due);


--
-- TOC entry 5320 (class 1259 OID 338278)
-- Name: crm_payment_plans_tenant_id_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX crm_payment_plans_tenant_id_index ON public.crm_payment_plans USING btree (tenant_id);


--
-- TOC entry 5304 (class 1259 OID 338239)
-- Name: crm_payments_account_no_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX crm_payments_account_no_index ON public.crm_payments USING btree (account_no);


--
-- TOC entry 5305 (class 1259 OID 338240)
-- Name: crm_payments_paid_at_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX crm_payments_paid_at_index ON public.crm_payments USING btree (paid_at);


--
-- TOC entry 5308 (class 1259 OID 338241)
-- Name: crm_payments_ref_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX crm_payments_ref_index ON public.crm_payments USING btree (ref);


--
-- TOC entry 5309 (class 1259 OID 338238)
-- Name: crm_payments_tenant_id_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX crm_payments_tenant_id_index ON public.crm_payments USING btree (tenant_id);


--
-- TOC entry 5263 (class 1259 OID 338092)
-- Name: crm_premises_location_gist; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX crm_premises_location_gist ON public.crm_premises USING gist (location);


--
-- TOC entry 5268 (class 1259 OID 338088)
-- Name: crm_premises_scheme_id_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX crm_premises_scheme_id_index ON public.crm_premises USING btree (scheme_id);


--
-- TOC entry 5269 (class 1259 OID 338089)
-- Name: crm_premises_status_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX crm_premises_status_index ON public.crm_premises USING btree (status);


--
-- TOC entry 5270 (class 1259 OID 338087)
-- Name: crm_premises_tenant_id_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX crm_premises_tenant_id_index ON public.crm_premises USING btree (tenant_id);


--
-- TOC entry 5327 (class 1259 OID 338326)
-- Name: crm_ra_rules_active_severity_index; Type: INDEpg_dump: creating INDEX "public.crm_ra_rules_tenant_id_index"
pg_dump: creating INDEX "public.crm_service_connections_connection_no_index"
pg_dump: creating INDEX "public.crm_service_connections_premise_id_index"
pg_dump: creating INDEX "public.crm_service_connections_status_index"
pg_dump: creating INDEX "public.crm_tariffs_tenant_id_index"
pg_dump: creating INDEX "public.crm_tariffs_tenant_id_valid_from_valid_to_index"
pg_dump: creating INDEX "public.data_catalog_data_class_id_index"
pg_dump: creating INDEX "public.device_trust_device_fingerprint_index"
pg_dump: creating INDEX "public.device_trust_user_id_revoked_index"
pg_dump: creating INDEX "public.dmas_geom_idx"
pg_dump: creating INDEX "public.dose_change_logs_dose_plan_id_created_at_index"
pg_dump: creating INDEX "public.dose_plans_asset_id_active_index"
pg_dump: creating INDEX "public.dose_plans_tenant_id_scheme_id_index"
pg_dump: creating INDEX "public.dsr_requests_target_user_id_index"
pg_dump: creating INDEX "public.dsr_requests_tenant_id_status_index"
pg_dump: creating INDEX "public.employee_skills_tenant_id_level_index_index"
X; Schema: public; Owner: neondb_owner
--

CREATE INDEX crm_ra_rules_active_severity_index ON public.crm_ra_rules USING btree (active, severity);


--
-- TOC entry 5332 (class 1259 OID 338325)
-- Name: crm_ra_rules_tenant_id_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX crm_ra_rules_tenant_id_index ON public.crm_ra_rules USING btree (tenant_id);


--
-- TOC entry 5278 (class 1259 OID 338140)
-- Name: crm_service_connections_connection_no_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX crm_service_connections_connection_no_index ON public.crm_service_connections USING btree (connection_no);


--
-- TOC entry 5283 (class 1259 OID 338139)
-- Name: crm_service_connections_premise_id_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX crm_service_connections_premise_id_index ON public.crm_service_connections USING btree (premise_id);


--
-- TOC entry 5284 (class 1259 OID 338141)
-- Name: crm_service_connections_status_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX crm_service_connections_status_index ON public.crm_service_connections USING btree (status);


--
-- TOC entry 5294 (class 1259 OID 338186)
-- Name: crm_tariffs_tenant_id_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX crm_tariffs_tenant_id_index ON public.crm_tariffs USING btree (tenant_id);


--
-- TOC entry 5295 (class 1259 OID 338187)
-- Name: crm_tariffs_tenant_id_valid_from_valid_to_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX crm_tariffs_tenant_id_valid_from_valid_to_index ON public.crm_tariffs USING btree (tenant_id, valid_from, valid_to);


--
-- TOC entry 5115 (class 1259 OID 337305)
-- Name: data_catalog_data_class_id_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX data_catalog_data_class_id_index ON public.data_catalog USING btree (data_class_id);


--
-- TOC entry 5107 (class 1259 OID 337274)
-- Name: device_trust_device_fingerprint_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX device_trust_device_fingerprint_index ON public.device_trust USING btree (device_fingerprint);


--
-- TOC entry 5110 (class 1259 OID 337268)
-- Name: device_trust_user_id_revoked_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX device_trust_user_id_revoked_index ON public.device_trust USING btree (user_id, revoked);


--
-- TOC entry 4874 (class 1259 OID 336048)
-- Name: dmas_geom_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX dmas_geom_idx ON public.dmas USING gist (geom);


--
-- TOC entry 5351 (class 1259 OID 338500)
-- Name: dose_change_logs_dose_plan_id_created_at_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX dose_change_logs_dose_plan_id_created_at_index ON public.dose_change_logs USING btree (dose_plan_id, created_at);


--
-- TOC entry 5342 (class 1259 OID 338457)
-- Name: dose_plans_asset_id_active_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX dose_plans_asset_id_active_index ON public.dose_plans USING btree (asset_id, active);


--
-- TOC entry 5345 (class 1259 OID 338456)
-- Name: dose_plans_tenant_id_scheme_id_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX dose_plans_tenant_id_scheme_id_index ON public.dose_plans USING btree (tenant_id, scheme_id);


--
-- TOC entry 5128 (class 1259 OID 337352)
-- Name: dsr_requests_target_user_id_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX dsr_requests_target_user_id_index ON public.dsr_requests USING btree (target_user_id);


--
-- TOC entry 5129 (class 1259 OID 337351)
-- Name: dsr_requests_tenant_id_status_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX dsr_requests_tenant_id_status_index ON public.dsr_requests USING btree (tenant_id, status);


--
-- TOC entry 4974 (class 1259 OID 336566)
-- Name: employee_skills_tenant_id_level_index_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX employee_skills_tenant_id_level_index_indexpg_dump: creating INDEX "public.enrollments_due_at_index"
pg_dump: creating INDEX "public.enrollments_tenant_id_status_index"
pg_dump: creating INDEX "public.escalation_policies_tenant_id_index"
pg_dump: creating INDEX "public.event_actions_actor_id_index"
pg_dump: creating INDEX "public.event_actions_event_id_index"
pg_dump: creating INDEX "public.event_actions_occurred_at_index"
pg_dump: creating INDEX "public.event_links_entity_type_entity_id_index"
pg_dump: creating INDEX "public.event_links_event_id_index"
pg_dump: creating INDEX "public.events_correlation_key_index"
pg_dump: creating INDEX "public.events_dma_id_index"
pg_dump: creating INDEX "public.events_facility_id_index"
pg_dump: creating INDEX "public.events_location_spatialindex"
pg_dump: creating INDEX "public.events_open_partial"
pg_dump: creating INDEX "public.events_scheme_id_index"
pg_dump: creating INDEX "public.events_sla_due_at_index"
pg_dump: creating INDEX "public.events_status_severity_detected_at_index"
pg_dump: creating INDEX "public.events_tenant_id_index"
pg_dump: creating INDEX "public.events_unique_external_id"
 ON public.employee_skills USING btree (tenant_id, level_index);


--
-- TOC entry 4932 (class 1259 OID 336347)
-- Name: enrollments_due_at_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX enrollments_due_at_index ON public.enrollments USING btree (due_at);


--
-- TOC entry 4935 (class 1259 OID 336346)
-- Name: enrollments_tenant_id_status_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX enrollments_tenant_id_status_index ON public.enrollments USING btree (tenant_id, status);


--
-- TOC entry 5194 (class 1259 OID 337618)
-- Name: escalation_policies_tenant_id_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX escalation_policies_tenant_id_index ON public.escalation_policies USING btree (tenant_id);


--
-- TOC entry 5187 (class 1259 OID 337602)
-- Name: event_actions_actor_id_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX event_actions_actor_id_index ON public.event_actions USING btree (actor_id);


--
-- TOC entry 5188 (class 1259 OID 337601)
-- Name: event_actions_event_id_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX event_actions_event_id_index ON public.event_actions USING btree (event_id);


--
-- TOC entry 5189 (class 1259 OID 337603)
-- Name: event_actions_occurred_at_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX event_actions_occurred_at_index ON public.event_actions USING btree (occurred_at);


--
-- TOC entry 5176 (class 1259 OID 337562)
-- Name: event_links_entity_type_entity_id_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX event_links_entity_type_entity_id_index ON public.event_links USING btree (entity_type, entity_id);


--
-- TOC entry 5179 (class 1259 OID 337561)
-- Name: event_links_event_id_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX event_links_event_id_index ON public.event_links USING btree (event_id);


--
-- TOC entry 5164 (class 1259 OID 337544)
-- Name: events_correlation_key_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX events_correlation_key_index ON public.events USING btree (correlation_key);


--
-- TOC entry 5165 (class 1259 OID 337542)
-- Name: events_dma_id_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX events_dma_id_index ON public.events USING btree (dma_id);


--
-- TOC entry 5166 (class 1259 OID 337540)
-- Name: events_facility_id_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX events_facility_id_index ON public.events USING btree (facility_id);


--
-- TOC entry 5167 (class 1259 OID 337546)
-- Name: events_location_spatialindex; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX events_location_spatialindex ON public.events USING gist (location);


--
-- TOC entry 5168 (class 1259 OID 337548)
-- Name: events_open_partial; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX events_open_partial ON public.events USING btree (status, severity) WHERE ((status)::text = ANY ((ARRAY['new'::character varying, 'ack'::character varying, 'in_progress'::character varying])::text[]));


--
-- TOC entry 5171 (class 1259 OID 337541)
-- Name: events_scheme_id_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX events_scheme_id_index ON public.events USING btree (scheme_id);


--
-- TOC entry 5172 (class 1259 OID 337545)
-- Name: events_sla_due_at_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX events_sla_due_at_index ON public.events USING btree (sla_due_at);


--
-- TOC entry 5173 (class 1259 OID 337543)
-- Name: events_status_severity_detected_at_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX events_status_severity_detected_at_index ON public.events USING btree (status, severity, detected_at);


--
-- TOC entry 5174 (class 1259 OID 337539)
-- Name: events_tenant_id_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX events_tenant_id_index ON public.events USING btree (tenant_id);


--
-- TOC entrypg_dump: creating INDEX "public.facilities_location_idx"
pg_dump: creating INDEX "public.failures_code_index"
pg_dump: creating INDEX "public.failures_work_order_id_index"
pg_dump: creating INDEX "public.idx_network_nodes_tenant_scheme"
pg_dump: creating INDEX "public.idx_outages_tenant_state"
pg_dump: creating INDEX "public.interventions_tenant_id_dma_id_date_index"
pg_dump: creating INDEX "public.interventions_type_date_index"
pg_dump: creating INDEX "public.jobs_queue_index"
pg_dump: creating INDEX "public.kb_articles_tenant_id_status_category_index"
pg_dump: creating INDEX "public.kb_articles_title_content_fulltext"
pg_dump: creating INDEX "public.kms_keys_purpose_index"
pg_dump: creating INDEX "public.lessons_course_id_order_index_index"
pg_dump: creating INDEX "public.meter_captures_asset_meter_id_index"
pg_dump: creating INDEX "public.meter_captures_captured_at_index"
pg_dump: creating INDEX "public.model_has_permissions_model_id_model_type_index"
pg_dump: creating INDEX "public.model_has_roles_model_id_model_type_index"
 5175 (class 1259 OID 337547)
-- Name: events_unique_external_id; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX events_unique_external_id ON public.events USING btree (tenant_id, source, external_id) WHERE (external_id IS NOT NULL);


--
-- TOC entry 4869 (class 1259 OID 336026)
-- Name: facilities_location_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX facilities_location_idx ON public.facilities USING gist (location);


--
-- TOC entry 5094 (class 1259 OID 337227)
-- Name: failures_code_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX failures_code_index ON public.failures USING btree (code);


--
-- TOC entry 5097 (class 1259 OID 337226)
-- Name: failures_work_order_id_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX failures_work_order_id_index ON public.failures USING btree (work_order_id);


--
-- TOC entry 5359 (class 1259 OID 338551)
-- Name: idx_network_nodes_tenant_scheme; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_network_nodes_tenant_scheme ON public.network_nodes USING btree (tenant_id, scheme_id);


--
-- TOC entry 5364 (class 1259 OID 338572)
-- Name: idx_outages_tenant_state; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_outages_tenant_state ON public.outages USING btree (tenant_id, state);


--
-- TOC entry 5340 (class 1259 OID 338431)
-- Name: interventions_tenant_id_dma_id_date_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX interventions_tenant_id_dma_id_date_index ON public.interventions USING btree (tenant_id, dma_id, date);


--
-- TOC entry 5341 (class 1259 OID 338432)
-- Name: interventions_type_date_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX interventions_type_date_index ON public.interventions USING btree (type, date);


--
-- TOC entry 4847 (class 1259 OID 335929)
-- Name: jobs_queue_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX jobs_queue_index ON public.jobs USING btree (queue);


--
-- TOC entry 4959 (class 1259 OID 336490)
-- Name: kb_articles_tenant_id_status_category_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX kb_articles_tenant_id_status_category_index ON public.kb_articles USING btree (tenant_id, status, category);


--
-- TOC entry 4960 (class 1259 OID 336491)
-- Name: kb_articles_title_content_fulltext; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX kb_articles_title_content_fulltext ON public.kb_articles USING gin (((to_tsvector('english'::regconfig, (title)::text) || to_tsvector('english'::regconfig, content))));


--
-- TOC entry 5141 (class 1259 OID 337391)
-- Name: kms_keys_purpose_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX kms_keys_purpose_index ON public.kms_keys USING btree (purpose);


--
-- TOC entry 4929 (class 1259 OID 336319)
-- Name: lessons_course_id_order_index_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX lessons_course_id_order_index_index ON public.lessons USING btree (course_id, order_index);


--
-- TOC entry 5033 (class 1259 OID 336986)
-- Name: meter_captures_asset_meter_id_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX meter_captures_asset_meter_id_index ON public.meter_captures USING btree (asset_meter_id);


--
-- TOC entry 5034 (class 1259 OID 336987)
-- Name: meter_captures_captured_at_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX meter_captures_captured_at_index ON public.meter_captures USING btree (captured_at);


--
-- TOC entry 4991 (class 1259 OID 336651)
-- Name: model_has_permissions_model_id_model_type_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX model_has_permissions_model_id_model_type_index ON public.model_has_permissions USING btree (model_id, model_type);


--
-- TOC entry 4994 (class 1259 OID 336667)
-- Name: model_has_roles_model_id_model_type_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX model_has_roles_pg_dump: creating INDEX "public.notifications_channel_index"
pg_dump: creating INDEX "public.notifications_sent_at_index"
pg_dump: creating INDEX "public.notifications_status_index"
pg_dump: creating INDEX "public.nrw_snapshots_dma_id_as_of_index"
pg_dump: creating INDEX "public.oncall_schedules_tenant_id_team_index"
pg_dump: creating INDEX "public.organizations_geom_idx"
pg_dump: creating INDEX "public.parts_category_index"
pg_dump: creating INDEX "public.parts_code_index"
pg_dump: creating INDEX "public.parts_tenant_id_index"
pg_dump: creating INDEX "public.personal_access_tokens_expires_at_index"
pg_dump: creating INDEX "public.personal_access_tokens_tokenable_type_tokenable_id_index"
pg_dump: creating INDEX "public.pipelines_geom_idx"
pg_dump: creating INDEX "public.playbooks_for_category_index"
pg_dump: creating INDEX "public.playbooks_for_severity_index"
pg_dump: creating INDEX "public.playbooks_tenant_id_index"
pg_dump: creating INDEX "public.pm_policies_asset_id_index"
pg_dump: creating INDEX "public.pm_policies_is_active_index"
pg_dump: creating INDEX "public.pm_schedules_next_due_index"
model_id_model_type_index ON public.model_has_roles USING btree (model_id, model_type);


--
-- TOC entry 5195 (class 1259 OID 337633)
-- Name: notifications_channel_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX notifications_channel_index ON public.notifications USING btree (channel);


--
-- TOC entry 5198 (class 1259 OID 337632)
-- Name: notifications_sent_at_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX notifications_sent_at_index ON public.notifications USING btree (sent_at);


--
-- TOC entry 5199 (class 1259 OID 337631)
-- Name: notifications_status_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX notifications_status_index ON public.notifications USING btree (status);


--
-- TOC entry 5333 (class 1259 OID 338406)
-- Name: nrw_snapshots_dma_id_as_of_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX nrw_snapshots_dma_id_as_of_index ON public.nrw_snapshots USING btree (dma_id, as_of);


--
-- TOC entry 4982 (class 1259 OID 336598)
-- Name: oncall_schedules_tenant_id_team_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX oncall_schedules_tenant_id_team_index ON public.oncall_schedules USING btree (tenant_id, team);


--
-- TOC entry 4858 (class 1259 OID 335978)
-- Name: organizations_geom_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX organizations_geom_idx ON public.organizations USING gist (geom);


--
-- TOC entry 5037 (class 1259 OID 337007)
-- Name: parts_category_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX parts_category_index ON public.parts USING btree (category);


--
-- TOC entry 5038 (class 1259 OID 337006)
-- Name: parts_code_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX parts_code_index ON public.parts USING btree (code);


--
-- TOC entry 5043 (class 1259 OID 337005)
-- Name: parts_tenant_id_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX parts_tenant_id_index ON public.parts USING btree (tenant_id);


--
-- TOC entry 4999 (class 1259 OID 336702)
-- Name: personal_access_tokens_expires_at_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX personal_access_tokens_expires_at_index ON public.personal_access_tokens USING btree (expires_at);


--
-- TOC entry 5004 (class 1259 OID 336699)
-- Name: personal_access_tokens_tokenable_type_tokenable_id_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX personal_access_tokens_tokenable_type_tokenable_id_index ON public.personal_access_tokens USING btree (tokenable_type, tokenable_id);


--
-- TOC entry 4879 (class 1259 OID 336072)
-- Name: pipelines_geom_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX pipelines_geom_idx ON public.pipelines USING gist (geom);


--
-- TOC entry 5182 (class 1259 OID 337580)
-- Name: playbooks_for_category_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX playbooks_for_category_index ON public.playbooks USING btree (for_category);


--
-- TOC entry 5183 (class 1259 OID 337581)
-- Name: playbooks_for_severity_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX playbooks_for_severity_index ON public.playbooks USING btree (for_severity);


--
-- TOC entry 5186 (class 1259 OID 337579)
-- Name: playbooks_tenant_id_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX playbooks_tenant_id_index ON public.playbooks USING btree (tenant_id);


--
-- TOC entry 5053 (class 1259 OID 337063)
-- Name: pm_policies_asset_id_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX pm_policies_asset_id_index ON public.pm_policies USING btree (asset_id);


--
-- TOC entry 5054 (class 1259 OID 337064)
-- Name: pm_policies_is_active_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX pm_policies_is_active_index ON public.pm_policies USING btree (is_active);


--
-- TOC entry 5057 (class 1259 OID 337080)
-- Name: pm_schedules_next_due_index; Type: INDEX; Schema: public;pg_dump: creating INDEX "public.pm_schedules_pm_policy_id_index"
pg_dump: creating INDEX "public.pm_schedules_status_index"
pg_dump: creating INDEX "public.pump_schedules_asset_id_start_at_index"
pg_dump: creating INDEX "public.pump_schedules_scheme_id_status_index"
pg_dump: creating INDEX "public.pump_schedules_start_at_end_at_index"
pg_dump: creating INDEX "public.redlines_edit_layer_id_operation_index"
pg_dump: creating INDEX "public.redlines_entity_type_entity_id_index"
pg_dump: creating INDEX "public.redlines_geom_after_idx"
pg_dump: creating INDEX "public.redlines_geom_before_idx"
pg_dump: creating INDEX "public.redlines_tenant_id_entity_type_index"
pg_dump: creating INDEX "public.retention_policies_entity_type_index"
pg_dump: creating INDEX "public.rosters_tenant_id_start_date_end_date_index"
pg_dump: creating INDEX "public.schemes_centroid_idx"
pg_dump: creating INDEX "public.schemes_geom_idx"
pg_dump: creating INDEX "public.security_alerts_category_index"
pg_dump: creating INDEX "public.security_alerts_tenant_id_severity_raised_at_index"
pg_dump: creating INDEX "public.sessions_last_activity_index"
 Owner: neondb_owner
--

CREATE INDEX pm_schedules_next_due_index ON public.pm_schedules USING btree (next_due);


--
-- TOC entry 5060 (class 1259 OID 337079)
-- Name: pm_schedules_pm_policy_id_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX pm_schedules_pm_policy_id_index ON public.pm_schedules USING btree (pm_policy_id);


--
-- TOC entry 5061 (class 1259 OID 337081)
-- Name: pm_schedules_status_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX pm_schedules_status_index ON public.pm_schedules USING btree (status);


--
-- TOC entry 5354 (class 1259 OID 338527)
-- Name: pump_schedules_asset_id_start_at_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX pump_schedules_asset_id_start_at_index ON public.pump_schedules USING btree (asset_id, start_at);


--
-- TOC entry 5357 (class 1259 OID 338528)
-- Name: pump_schedules_scheme_id_status_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX pump_schedules_scheme_id_status_index ON public.pump_schedules USING btree (scheme_id, status);


--
-- TOC entry 5358 (class 1259 OID 338529)
-- Name: pump_schedules_start_at_end_at_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX pump_schedules_start_at_end_at_index ON public.pump_schedules USING btree (start_at, end_at);


--
-- TOC entry 4903 (class 1259 OID 336190)
-- Name: redlines_edit_layer_id_operation_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX redlines_edit_layer_id_operation_index ON public.redlines USING btree (edit_layer_id, operation);


--
-- TOC entry 4904 (class 1259 OID 336191)
-- Name: redlines_entity_type_entity_id_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX redlines_entity_type_entity_id_index ON public.redlines USING btree (entity_type, entity_id);


--
-- TOC entry 4905 (class 1259 OID 336195)
-- Name: redlines_geom_after_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX redlines_geom_after_idx ON public.redlines USING gist (geom_after);


--
-- TOC entry 4906 (class 1259 OID 336194)
-- Name: redlines_geom_before_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX redlines_geom_before_idx ON public.redlines USING gist (geom_before);


--
-- TOC entry 4909 (class 1259 OID 336189)
-- Name: redlines_tenant_id_entity_type_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX redlines_tenant_id_entity_type_index ON public.redlines USING btree (tenant_id, entity_type);


--
-- TOC entry 5120 (class 1259 OID 337314)
-- Name: retention_policies_entity_type_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX retention_policies_entity_type_index ON public.retention_policies USING btree (entity_type);


--
-- TOC entry 4979 (class 1259 OID 336582)
-- Name: rosters_tenant_id_start_date_end_date_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX rosters_tenant_id_start_date_end_date_index ON public.rosters USING btree (tenant_id, start_date, end_date);


--
-- TOC entry 4863 (class 1259 OID 336003)
-- Name: schemes_centroid_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX schemes_centroid_idx ON public.schemes USING gist (centroid);


--
-- TOC entry 4864 (class 1259 OID 336002)
-- Name: schemes_geom_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX schemes_geom_idx ON public.schemes USING gist (geom);


--
-- TOC entry 5135 (class 1259 OID 337383)
-- Name: security_alerts_category_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX security_alerts_category_index ON public.security_alerts USING btree (category);


--
-- TOC entry 5138 (class 1259 OID 337382)
-- Name: security_alerts_tenant_id_severity_raised_at_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX security_alerts_tenant_id_severity_raised_at_index ON public.security_alerts USING btree (tenant_id, severity, raised_at);


--
-- TOC entry 4837 (class 1259 OID 335905)
-- Name: sessions_last_activity_index; Type: pg_dump: creating INDEX "public.sessions_user_id_index"
pg_dump: creating INDEX "public.shift_entries_created_at_index"
pg_dump: creating INDEX "public.shift_entries_created_by_index"
pg_dump: creating INDEX "public.shift_entries_geom_spatialindex"
pg_dump: creating INDEX "public.shift_entries_kind_index"
pg_dump: creating INDEX "public.shift_entries_shift_id_index"
pg_dump: creating INDEX "public.shifts_dma_id_index"
pg_dump: creating INDEX "public.shifts_facility_id_index"
pg_dump: creating INDEX "public.shifts_scheme_id_index"
pg_dump: creating INDEX "public.shifts_starts_at_ends_at_index"
pg_dump: creating INDEX "public.shifts_status_index"
pg_dump: creating INDEX "public.shifts_supervisor_id_index"
pg_dump: creating INDEX "public.shifts_tenant_id_index"
pg_dump: creating INDEX "public.skills_tenant_id_category_index"
pg_dump: creating INDEX "public.sops_next_review_due_index"
pg_dump: creating INDEX "public.sops_tenant_id_status_index"
pg_dump: creating INDEX "public.spatial_change_log_changed_by_created_at_index"
pg_dump: creating INDEX "public.spatial_change_log_tenant_id_entity_type_entity_id_index"
INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX sessions_last_activity_index ON public.sessions USING btree (last_activity);


--
-- TOC entry 4840 (class 1259 OID 335904)
-- Name: sessions_user_id_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX sessions_user_id_index ON public.sessions USING btree (user_id);


--
-- TOC entry 5146 (class 1259 OID 337449)
-- Name: shift_entries_created_at_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX shift_entries_created_at_index ON public.shift_entries USING btree (created_at);


--
-- TOC entry 5147 (class 1259 OID 337448)
-- Name: shift_entries_created_by_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX shift_entries_created_by_index ON public.shift_entries USING btree (created_by);


--
-- TOC entry 5148 (class 1259 OID 337450)
-- Name: shift_entries_geom_spatialindex; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX shift_entries_geom_spatialindex ON public.shift_entries USING gist (geom);


--
-- TOC entry 5149 (class 1259 OID 337447)
-- Name: shift_entries_kind_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX shift_entries_kind_index ON public.shift_entries USING btree (kind);


--
-- TOC entry 5152 (class 1259 OID 337446)
-- Name: shift_entries_shift_id_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX shift_entries_shift_id_index ON public.shift_entries USING btree (shift_id);


--
-- TOC entry 5098 (class 1259 OID 337422)
-- Name: shifts_dma_id_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX shifts_dma_id_index ON public.shifts USING btree (dma_id);


--
-- TOC entry 5099 (class 1259 OID 337419)
-- Name: shifts_facility_id_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX shifts_facility_id_index ON public.shifts USING btree (facility_id);


--
-- TOC entry 5102 (class 1259 OID 337421)
-- Name: shifts_scheme_id_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX shifts_scheme_id_index ON public.shifts USING btree (scheme_id);


--
-- TOC entry 5103 (class 1259 OID 337425)
-- Name: shifts_starts_at_ends_at_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX shifts_starts_at_ends_at_index ON public.shifts USING btree (starts_at, ends_at);


--
-- TOC entry 5104 (class 1259 OID 337424)
-- Name: shifts_status_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX shifts_status_index ON public.shifts USING btree (status);


--
-- TOC entry 5105 (class 1259 OID 337423)
-- Name: shifts_supervisor_id_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX shifts_supervisor_id_index ON public.shifts USING btree (supervisor_id);


--
-- TOC entry 5106 (class 1259 OID 337418)
-- Name: shifts_tenant_id_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX shifts_tenant_id_index ON public.shifts USING btree (tenant_id);


--
-- TOC entry 4971 (class 1259 OID 336531)
-- Name: skills_tenant_id_category_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX skills_tenant_id_category_index ON public.skills USING btree (tenant_id, category);


--
-- TOC entry 4963 (class 1259 OID 336514)
-- Name: sops_next_review_due_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX sops_next_review_due_index ON public.sops USING btree (next_review_due);


--
-- TOC entry 4966 (class 1259 OID 336513)
-- Name: sops_tenant_id_status_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX sops_tenant_id_status_index ON public.sops USING btree (tenant_id, status);


--
-- TOC entry 4915 (class 1259 OID 336243)
-- Name: spatial_change_log_changed_by_created_at_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX spatial_change_log_changed_by_created_at_index ON public.spatial_change_log USING btree (changed_by, created_at);


--
-- TOC entry 4918 (class 1259 OID 336242)
-- Name: spatial_change_log_tenant_id_entity_type_entity_id_index; Type: INDEX; pg_dump: creating INDEX "public.spatial_edit_layers_layer_type_status_index"
pg_dump: creating INDEX "public.spatial_edit_layers_tenant_id_status_index"
pg_dump: creating INDEX "public.stock_txns_kind_index"
pg_dump: creating INDEX "public.stock_txns_occurred_at_index"
pg_dump: creating INDEX "public.stock_txns_part_id_index"
pg_dump: creating INDEX "public.stock_txns_work_order_id_index"
pg_dump: creating INDEX "public.suppliers_tenant_id_index"
pg_dump: creating INDEX "public.telemetry_measurements_telemetry_tag_id_ts_index"
pg_dump: creating INDEX "public.telemetry_measurements_ts_index"
pg_dump: creating INDEX "public.telemetry_tags_asset_id_io_type_index"
pg_dump: creating INDEX "public.telemetry_tags_tenant_id_scheme_id_index"
pg_dump: creating INDEX "public.topology_validations_entity_type_entity_id_index"
pg_dump: creating INDEX "public.topology_validations_location_idx"
pg_dump: creating INDEX "public.topology_validations_tenant_id_severity_resolved_index"
pg_dump: creating INDEX "public.users_current_tenant_id_index"
pg_dump: creating INDEX "public.wo_labor_user_id_index"
Schema: public; Owner: neondb_owner
--

CREATE INDEX spatial_change_log_tenant_id_entity_type_entity_id_index ON public.spatial_change_log USING btree (tenant_id, entity_type, entity_id);


--
-- TOC entry 4899 (class 1259 OID 336164)
-- Name: spatial_edit_layers_layer_type_status_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX spatial_edit_layers_layer_type_status_index ON public.spatial_edit_layers USING btree (layer_type, status);


--
-- TOC entry 4902 (class 1259 OID 336163)
-- Name: spatial_edit_layers_tenant_id_status_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX spatial_edit_layers_tenant_id_status_index ON public.spatial_edit_layers USING btree (tenant_id, status);


--
-- TOC entry 5080 (class 1259 OID 337171)
-- Name: stock_txns_kind_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX stock_txns_kind_index ON public.stock_txns USING btree (kind);


--
-- TOC entry 5081 (class 1259 OID 337173)
-- Name: stock_txns_occurred_at_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX stock_txns_occurred_at_index ON public.stock_txns USING btree (occurred_at);


--
-- TOC entry 5082 (class 1259 OID 337170)
-- Name: stock_txns_part_id_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX stock_txns_part_id_index ON public.stock_txns USING btree (part_id);


--
-- TOC entry 5085 (class 1259 OID 337172)
-- Name: stock_txns_work_order_id_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX stock_txns_work_order_id_index ON public.stock_txns USING btree (work_order_id);


--
-- TOC entry 5052 (class 1259 OID 337045)
-- Name: suppliers_tenant_id_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX suppliers_tenant_id_index ON public.suppliers USING btree (tenant_id);


--
-- TOC entry 5377 (class 1259 OID 338617)
-- Name: telemetry_measurements_telemetry_tag_id_ts_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX telemetry_measurements_telemetry_tag_id_ts_index ON public.telemetry_measurements USING btree (telemetry_tag_id, ts);


--
-- TOC entry 5378 (class 1259 OID 338618)
-- Name: telemetry_measurements_ts_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX telemetry_measurements_ts_index ON public.telemetry_measurements USING btree (ts);


--
-- TOC entry 5369 (class 1259 OID 338602)
-- Name: telemetry_tags_asset_id_io_type_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX telemetry_tags_asset_id_io_type_index ON public.telemetry_tags USING btree (asset_id, io_type);


--
-- TOC entry 5374 (class 1259 OID 338601)
-- Name: telemetry_tags_tenant_id_scheme_id_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX telemetry_tags_tenant_id_scheme_id_index ON public.telemetry_tags USING btree (tenant_id, scheme_id);


--
-- TOC entry 4910 (class 1259 OID 336218)
-- Name: topology_validations_entity_type_entity_id_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX topology_validations_entity_type_entity_id_index ON public.topology_validations USING btree (entity_type, entity_id);


--
-- TOC entry 4911 (class 1259 OID 336221)
-- Name: topology_validations_location_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX topology_validations_location_idx ON public.topology_validations USING gist (location);


--
-- TOC entry 4914 (class 1259 OID 336217)
-- Name: topology_validations_tenant_id_severity_resolved_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX topology_validations_tenant_id_severity_resolved_index ON public.topology_validations USING btree (tenant_id, severity, resolved);


--
-- TOC entry 4830 (class 1259 OID 335885)
-- Name: users_current_tenant_id_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX users_current_tenant_id_index ON public.users USING btree (current_tenant_id);


--
-- TOC entry 5092 (class 1259 OID 337211)
-- Name: wo_labor_user_id_index; Type: INDEX; Schema: public; Owner: neondb_owpg_dump: creating INDEX "public.wo_labor_work_order_id_index"
pg_dump: creating INDEX "public.wo_parts_part_id_index"
pg_dump: creating INDEX "public.wo_parts_work_order_id_index"
pg_dump: creating INDEX "public.work_orders_asset_id_index"
pg_dump: creating INDEX "public.work_orders_assigned_to_index"
pg_dump: creating INDEX "public.work_orders_created_by_index"
pg_dump: creating INDEX "public.work_orders_geom_spatialindex"
pg_dump: creating INDEX "public.work_orders_kind_index"
pg_dump: creating INDEX "public.work_orders_open_status_idx"
pg_dump: creating INDEX "public.work_orders_priority_index"
pg_dump: creating INDEX "public.work_orders_scheduled_for_index"
pg_dump: creating INDEX "public.work_orders_status_index"
pg_dump: creating INDEX "public.work_orders_tenant_id_index"
pg_dump: creating INDEX "public.work_orders_wo_num_index"
pg_dump: creating INDEX "public.wq_compliance_parameter_id_index"
pg_dump: creating INDEX "public.wq_compliance_period_granularity_index"
pg_dump: creating INDEX "public.wq_compliance_sampling_point_id_index"
ner
--

CREATE INDEX wo_labor_user_id_index ON public.wo_labor USING btree (user_id);


--
-- TOC entry 5093 (class 1259 OID 337210)
-- Name: wo_labor_work_order_id_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX wo_labor_work_order_id_index ON public.wo_labor USING btree (work_order_id);


--
-- TOC entry 5086 (class 1259 OID 337192)
-- Name: wo_parts_part_id_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX wo_parts_part_id_index ON public.wo_parts USING btree (part_id);


--
-- TOC entry 5089 (class 1259 OID 337191)
-- Name: wo_parts_work_order_id_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX wo_parts_work_order_id_index ON public.wo_parts USING btree (work_order_id);


--
-- TOC entry 5062 (class 1259 OID 337136)
-- Name: work_orders_asset_id_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX work_orders_asset_id_index ON public.work_orders USING btree (asset_id);


--
-- TOC entry 5063 (class 1259 OID 337141)
-- Name: work_orders_assigned_to_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX work_orders_assigned_to_index ON public.work_orders USING btree (assigned_to);


--
-- TOC entry 5064 (class 1259 OID 337140)
-- Name: work_orders_created_by_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX work_orders_created_by_index ON public.work_orders USING btree (created_by);


--
-- TOC entry 5065 (class 1259 OID 337144)
-- Name: work_orders_geom_spatialindex; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX work_orders_geom_spatialindex ON public.work_orders USING gist (geom);


--
-- TOC entry 5066 (class 1259 OID 337138)
-- Name: work_orders_kind_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX work_orders_kind_index ON public.work_orders USING btree (kind);


--
-- TOC entry 5067 (class 1259 OID 337147)
-- Name: work_orders_open_status_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX work_orders_open_status_idx ON public.work_orders USING btree (status) WHERE ((status)::text = ANY ((ARRAY['new'::character varying, 'assigned'::character varying, 'in_progress'::character varying])::text[]));


--
-- TOC entry 5070 (class 1259 OID 337139)
-- Name: work_orders_priority_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX work_orders_priority_index ON public.work_orders USING btree (priority);


--
-- TOC entry 5071 (class 1259 OID 337142)
-- Name: work_orders_scheduled_for_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX work_orders_scheduled_for_index ON public.work_orders USING btree (scheduled_for);


--
-- TOC entry 5072 (class 1259 OID 337137)
-- Name: work_orders_status_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX work_orders_status_index ON public.work_orders USING btree (status);


--
-- TOC entry 5073 (class 1259 OID 337130)
-- Name: work_orders_tenant_id_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX work_orders_tenant_id_index ON public.work_orders USING btree (tenant_id);


--
-- TOC entry 5074 (class 1259 OID 337143)
-- Name: work_orders_wo_num_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX work_orders_wo_num_index ON public.work_orders USING btree (wo_num);


--
-- TOC entry 5250 (class 1259 OID 338024)
-- Name: wq_compliance_parameter_id_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX wq_compliance_parameter_id_index ON public.wq_compliance USING btree (parameter_id);


--
-- TOC entry 5251 (class 1259 OID 338025)
-- Name: wq_compliance_period_granularity_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX wq_compliance_period_granularity_index ON public.wq_compliance USING btree (period, granularity);


--
-- TOC entry 5254 (class 1259 OID 338023)
-- Name: wq_compliance_sampling_point_id_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX wq_compliance_sampling_point_id_index ON public.wq_compliance USING btree (sampg_dump: creating INDEX "public.wq_parameters_code_index"
pg_dump: creating INDEX "public.wq_parameters_group_index"
pg_dump: creating INDEX "public.wq_parameters_is_active_index"
pg_dump: creating INDEX "public.wq_plan_rules_plan_id_index"
pg_dump: creating INDEX "public.wq_plan_rules_point_kind_parameter_group_index"
pg_dump: creating INDEX "public.wq_plans_period_start_period_end_index"
pg_dump: creating INDEX "public.wq_plans_status_index"
pg_dump: creating INDEX "public.wq_plans_tenant_id_index"
pg_dump: creating INDEX "public.wq_qc_controls_outcome_index"
pg_dump: creating INDEX "public.wq_qc_controls_parameter_id_index"
pg_dump: creating INDEX "public.wq_qc_controls_sample_id_index"
pg_dump: creating INDEX "public.wq_qc_controls_type_index"
pg_dump: creating INDEX "public.wq_results_analyst_id_index"
pg_dump: creating INDEX "public.wq_results_analyzed_at_index"
pg_dump: creating INDEX "public.wq_results_sample_param_id_index"
pg_dump: creating INDEX "public.wq_sample_params_parameter_id_index"
pg_dump: creating INDEX "public.wq_sample_params_sample_id_index"
pg_dump: creating INDEX "public.wq_sample_params_status_index"
pling_point_id);


--
-- TOC entry 5200 (class 1259 OID 337645)
-- Name: wq_parameters_code_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX wq_parameters_code_index ON public.wq_parameters USING btree (code);


--
-- TOC entry 5203 (class 1259 OID 337646)
-- Name: wq_parameters_group_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX wq_parameters_group_index ON public.wq_parameters USING btree ("group");


--
-- TOC entry 5204 (class 1259 OID 337647)
-- Name: wq_parameters_is_active_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX wq_parameters_is_active_index ON public.wq_parameters USING btree (is_active);


--
-- TOC entry 5226 (class 1259 OID 337915)
-- Name: wq_plan_rules_plan_id_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX wq_plan_rules_plan_id_index ON public.wq_plan_rules USING btree (plan_id);


--
-- TOC entry 5227 (class 1259 OID 337916)
-- Name: wq_plan_rules_point_kind_parameter_group_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX wq_plan_rules_point_kind_parameter_group_index ON public.wq_plan_rules USING btree (point_kind, parameter_group);


--
-- TOC entry 5207 (class 1259 OID 337668)
-- Name: wq_plans_period_start_period_end_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX wq_plans_period_start_period_end_index ON public.wq_plans USING btree (period_start, period_end);


--
-- TOC entry 5210 (class 1259 OID 337667)
-- Name: wq_plans_status_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX wq_plans_status_index ON public.wq_plans USING btree (status);


--
-- TOC entry 5211 (class 1259 OID 337666)
-- Name: wq_plans_tenant_id_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX wq_plans_tenant_id_index ON public.wq_plans USING btree (tenant_id);


--
-- TOC entry 5257 (class 1259 OID 338052)
-- Name: wq_qc_controls_outcome_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX wq_qc_controls_outcome_index ON public.wq_qc_controls USING btree (outcome);


--
-- TOC entry 5258 (class 1259 OID 338050)
-- Name: wq_qc_controls_parameter_id_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX wq_qc_controls_parameter_id_index ON public.wq_qc_controls USING btree (parameter_id);


--
-- TOC entry 5261 (class 1259 OID 338049)
-- Name: wq_qc_controls_sample_id_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX wq_qc_controls_sample_id_index ON public.wq_qc_controls USING btree (sample_id);


--
-- TOC entry 5262 (class 1259 OID 338051)
-- Name: wq_qc_controls_type_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX wq_qc_controls_type_index ON public.wq_qc_controls USING btree (type);


--
-- TOC entry 5245 (class 1259 OID 337999)
-- Name: wq_results_analyst_id_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX wq_results_analyst_id_index ON public.wq_results USING btree (analyst_id);


--
-- TOC entry 5246 (class 1259 OID 338000)
-- Name: wq_results_analyzed_at_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX wq_results_analyzed_at_index ON public.wq_results USING btree (analyzed_at);


--
-- TOC entry 5249 (class 1259 OID 337998)
-- Name: wq_results_sample_param_id_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX wq_results_sample_param_id_index ON public.wq_results USING btree (sample_param_id);


--
-- TOC entry 5238 (class 1259 OID 337973)
-- Name: wq_sample_params_parameter_id_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX wq_sample_params_parameter_id_index ON public.wq_sample_params USING btree (parameter_id);


--
-- TOC entry 5241 (class 1259 OID 337972)
-- Name: wq_sample_params_sample_id_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX wq_sample_params_sample_id_index ON public.wq_sample_params USING btree (sample_id);


--
-- TOC entry 5244 (class 1259 OID 337974)
-- Name: wq_sample_params_status_index; Type: INDEXpg_dump: creating INDEX "public.wq_samples_barcode_index"
pg_dump: creating INDEX "public.wq_samples_collected_by_index"
pg_dump: creating INDEX "public.wq_samples_custody_state_index"
pg_dump: creating INDEX "public.wq_samples_plan_id_index"
pg_dump: creating INDEX "public.wq_samples_sampling_point_id_index"
pg_dump: creating INDEX "public.wq_samples_scheduled_for_collected_at_index"
pg_dump: creating INDEX "public.wq_sampling_points_code_index"
pg_dump: creating INDEX "public.wq_sampling_points_dma_id_index"
pg_dump: creating INDEX "public.wq_sampling_points_facility_id_index"
pg_dump: creating INDEX "public.wq_sampling_points_is_active_index"
pg_dump: creating INDEX "public.wq_sampling_points_kind_index"
pg_dump: creating INDEX "public.wq_sampling_points_location_spatialindex"
pg_dump: creating INDEX "public.wq_sampling_points_scheme_id_index"
pg_dump: creating INDEX "public.wq_sampling_points_tenant_id_index"
pg_dump: creating INDEX "public.zones_geom_idx"
pg_dump: creating FK CONSTRAINT "public.addresses addresses_scheme_id_foreign"
pg_dump: creating FK CONSTRAINT "public.addresses addresses_tenant_id_foreign"
; Schema: public; Owner: neondb_owner
--

CREATE INDEX wq_sample_params_status_index ON public.wq_sample_params USING btree (status);


--
-- TOC entry 5228 (class 1259 OID 337945)
-- Name: wq_samples_barcode_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX wq_samples_barcode_index ON public.wq_samples USING btree (barcode);


--
-- TOC entry 5231 (class 1259 OID 337947)
-- Name: wq_samples_collected_by_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX wq_samples_collected_by_index ON public.wq_samples USING btree (collected_by);


--
-- TOC entry 5232 (class 1259 OID 337946)
-- Name: wq_samples_custody_state_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX wq_samples_custody_state_index ON public.wq_samples USING btree (custody_state);


--
-- TOC entry 5235 (class 1259 OID 337944)
-- Name: wq_samples_plan_id_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX wq_samples_plan_id_index ON public.wq_samples USING btree (plan_id);


--
-- TOC entry 5236 (class 1259 OID 337943)
-- Name: wq_samples_sampling_point_id_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX wq_samples_sampling_point_id_index ON public.wq_samples USING btree (sampling_point_id);


--
-- TOC entry 5237 (class 1259 OID 337948)
-- Name: wq_samples_scheduled_for_collected_at_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX wq_samples_scheduled_for_collected_at_index ON public.wq_samples USING btree (scheduled_for, collected_at);


--
-- TOC entry 5212 (class 1259 OID 337891)
-- Name: wq_sampling_points_code_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX wq_sampling_points_code_index ON public.wq_sampling_points USING btree (code);


--
-- TOC entry 5215 (class 1259 OID 337890)
-- Name: wq_sampling_points_dma_id_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX wq_sampling_points_dma_id_index ON public.wq_sampling_points USING btree (dma_id);


--
-- TOC entry 5216 (class 1259 OID 338058)
-- Name: wq_sampling_points_facility_id_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX wq_sampling_points_facility_id_index ON public.wq_sampling_points USING btree (facility_id);


--
-- TOC entry 5217 (class 1259 OID 337893)
-- Name: wq_sampling_points_is_active_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX wq_sampling_points_is_active_index ON public.wq_sampling_points USING btree (is_active);


--
-- TOC entry 5218 (class 1259 OID 337892)
-- Name: wq_sampling_points_kind_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX wq_sampling_points_kind_index ON public.wq_sampling_points USING btree (kind);


--
-- TOC entry 5219 (class 1259 OID 337894)
-- Name: wq_sampling_points_location_spatialindex; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX wq_sampling_points_location_spatialindex ON public.wq_sampling_points USING gist (location);


--
-- TOC entry 5222 (class 1259 OID 337889)
-- Name: wq_sampling_points_scheme_id_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX wq_sampling_points_scheme_id_index ON public.wq_sampling_points USING btree (scheme_id);


--
-- TOC entry 5223 (class 1259 OID 337888)
-- Name: wq_sampling_points_tenant_id_index; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX wq_sampling_points_tenant_id_index ON public.wq_sampling_points USING btree (tenant_id);


--
-- TOC entry 4884 (class 1259 OID 336092)
-- Name: zones_geom_idx; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX zones_geom_idx ON public.zones USING gist (geom);


--
-- TOC entry 5390 (class 2606 OID 336104)
-- Name: addresses addresses_scheme_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.addresses
    ADD CONSTRAINT addresses_scheme_id_foreign FOREIGN KEY (scheme_id) REFERENCES public.schemes(id) ON DELETE SET NULL;


--
-- TOC entry 5391 (class 2606 OID 336099)
-- Name: addresses addresses_tenant_id_fpg_dump: creating FK CONSTRAINT "public.api_keys api_keys_created_by_foreign"
pg_dump: creating FK CONSTRAINT "public.api_keys api_keys_tenant_id_foreign"
pg_dump: creating FK CONSTRAINT "public.assessment_attempts assessment_attempts_assessment_id_foreign"
pg_dump: creating FK CONSTRAINT "public.assessment_attempts assessment_attempts_assessor_id_foreign"
pg_dump: creating FK CONSTRAINT "public.assessment_attempts assessment_attempts_enrollment_id_foreign"
pg_dump: creating FK CONSTRAINT "public.assessments assessments_course_id_foreign"
pg_dump: creating FK CONSTRAINT "public.asset_boms asset_boms_asset_id_foreign"
pg_dump: creating FK CONSTRAINT "public.asset_boms asset_boms_part_id_foreign"
pg_dump: creating FK CONSTRAINT "public.asset_classes asset_classes_parent_id_foreign"
pg_dump: creating FK CONSTRAINT "public.asset_locations asset_locations_asset_id_foreign"
pg_dump: creating FK CONSTRAINT "public.asset_meters asset_meters_asset_id_foreign"
pg_dump: creating FK CONSTRAINT "public.assets assets_class_id_foreign"
oreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.addresses
    ADD CONSTRAINT addresses_tenant_id_foreign FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- TOC entry 5459 (class 2606 OID 337228)
-- Name: api_keys api_keys_created_by_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.api_keys
    ADD CONSTRAINT api_keys_created_by_foreign FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 5460 (class 2606 OID 337131)
-- Name: api_keys api_keys_tenant_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.api_keys
    ADD CONSTRAINT api_keys_tenant_id_foreign FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- TOC entry 5417 (class 2606 OID 336420)
-- Name: assessment_attempts assessment_attempts_assessment_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.assessment_attempts
    ADD CONSTRAINT assessment_attempts_assessment_id_foreign FOREIGN KEY (assessment_id) REFERENCES public.assessments(id) ON DELETE CASCADE;


--
-- TOC entry 5418 (class 2606 OID 336425)
-- Name: assessment_attempts assessment_attempts_assessor_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.assessment_attempts
    ADD CONSTRAINT assessment_attempts_assessor_id_foreign FOREIGN KEY (assessor_id) REFERENCES public.users(id);


--
-- TOC entry 5419 (class 2606 OID 336415)
-- Name: assessment_attempts assessment_attempts_enrollment_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.assessment_attempts
    ADD CONSTRAINT assessment_attempts_enrollment_id_foreign FOREIGN KEY (enrollment_id) REFERENCES public.enrollments(id) ON DELETE CASCADE;


--
-- TOC entry 5415 (class 2606 OID 336382)
-- Name: assessments assessments_course_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.assessments
    ADD CONSTRAINT assessments_course_id_foreign FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE;


--
-- TOC entry 5449 (class 2606 OID 337017)
-- Name: asset_boms asset_boms_asset_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.asset_boms
    ADD CONSTRAINT asset_boms_asset_id_foreign FOREIGN KEY (asset_id) REFERENCES public.assets(id) ON DELETE CASCADE;


--
-- TOC entry 5450 (class 2606 OID 337022)
-- Name: asset_boms asset_boms_part_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.asset_boms
    ADD CONSTRAINT asset_boms_part_id_foreign FOREIGN KEY (part_id) REFERENCES public.parts(id) ON DELETE CASCADE;


--
-- TOC entry 5439 (class 2606 OID 336883)
-- Name: asset_classes asset_classes_parent_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.asset_classes
    ADD CONSTRAINT asset_classes_parent_id_foreign FOREIGN KEY (parent_id) REFERENCES public.asset_classes(id) ON DELETE CASCADE;


--
-- TOC entry 5445 (class 2606 OID 336949)
-- Name: asset_locations asset_locations_asset_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.asset_locations
    ADD CONSTRAINT asset_locations_asset_id_foreign FOREIGN KEY (asset_id) REFERENCES public.assets(id) ON DELETE CASCADE;


--
-- TOC entry 5446 (class 2606 OID 336965)
-- Name: asset_meters asset_meters_asset_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.asset_meters
    ADD CONSTRAINT asset_meters_asset_id_foreign FOREIGN KEY (asset_id) REFERENCES public.assets(id) ON DELETE CASCADE;


--
-- TOC entry 5440 (class 2606 OID 336918)
-- Name: assets assets_class_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.assets
    ADD CONSTRAINT assets_class_id_foreign FOREIGN KEY (class_id) REFERENCES public.asset_classes(pg_dump: creating FK CONSTRAINT "public.assets assets_dma_id_foreign"
pg_dump: creating FK CONSTRAINT "public.assets assets_parent_id_foreign"
pg_dump: creating FK CONSTRAINT "public.assets assets_scheme_id_foreign"
pg_dump: creating FK CONSTRAINT "public.assets assets_tenant_id_foreign"
pg_dump: creating FK CONSTRAINT "public.attachments attachments_tenant_id_foreign"
pg_dump: creating FK CONSTRAINT "public.audit_events audit_events_tenant_id_foreign"
pg_dump: creating FK CONSTRAINT "public.certificates certificates_course_id_foreign"
pg_dump: creating FK CONSTRAINT "public.certificates certificates_tenant_id_foreign"
pg_dump: creating FK CONSTRAINT "public.certificates certificates_user_id_foreign"
pg_dump: creating FK CONSTRAINT "public.checklist_runs checklist_runs_checklist_id_foreign"
pg_dump: creating FK CONSTRAINT "public.checklist_runs checklist_runs_facility_id_foreign"
pg_dump: creating FK CONSTRAINT "public.checklist_runs checklist_runs_performed_by_foreign"
pg_dump: creating FK CONSTRAINT "public.checklist_runs checklist_runs_shift_id_foreign"
id) ON DELETE RESTRICT;


--
-- TOC entry 5441 (class 2606 OID 336913)
-- Name: assets assets_dma_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.assets
    ADD CONSTRAINT assets_dma_id_foreign FOREIGN KEY (dma_id) REFERENCES public.dmas(id) ON DELETE SET NULL;


--
-- TOC entry 5442 (class 2606 OID 336923)
-- Name: assets assets_parent_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.assets
    ADD CONSTRAINT assets_parent_id_foreign FOREIGN KEY (parent_id) REFERENCES public.assets(id) ON DELETE CASCADE;


--
-- TOC entry 5443 (class 2606 OID 336908)
-- Name: assets assets_scheme_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.assets
    ADD CONSTRAINT assets_scheme_id_foreign FOREIGN KEY (scheme_id) REFERENCES public.schemes(id) ON DELETE SET NULL;


--
-- TOC entry 5444 (class 2606 OID 336903)
-- Name: assets assets_tenant_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.assets
    ADD CONSTRAINT assets_tenant_id_foreign FOREIGN KEY (tenant_id) REFERENCES public.organizations(id) ON DELETE CASCADE;


--
-- TOC entry 5392 (class 2606 OID 336128)
-- Name: attachments attachments_tenant_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.attachments
    ADD CONSTRAINT attachments_tenant_id_foreign FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- TOC entry 5479 (class 2606 OID 337361)
-- Name: audit_events audit_events_tenant_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.audit_events
    ADD CONSTRAINT audit_events_tenant_id_foreign FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- TOC entry 5420 (class 2606 OID 336450)
-- Name: certificates certificates_course_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.certificates
    ADD CONSTRAINT certificates_course_id_foreign FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE;


--
-- TOC entry 5421 (class 2606 OID 336440)
-- Name: certificates certificates_tenant_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.certificates
    ADD CONSTRAINT certificates_tenant_id_foreign FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- TOC entry 5422 (class 2606 OID 336445)
-- Name: certificates certificates_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.certificates
    ADD CONSTRAINT certificates_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 5486 (class 2606 OID 337478)
-- Name: checklist_runs checklist_runs_checklist_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.checklist_runs
    ADD CONSTRAINT checklist_runs_checklist_id_foreign FOREIGN KEY (checklist_id) REFERENCES public.checklists(id) ON DELETE CASCADE;


--
-- TOC entry 5487 (class 2606 OID 337488)
-- Name: checklist_runs checklist_runs_facility_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.checklist_runs
    ADD CONSTRAINT checklist_runs_facility_id_foreign FOREIGN KEY (facility_id) REFERENCES public.facilities(id) ON DELETE SET NULL;


--
-- TOC entry 5488 (class 2606 OID 337493)
-- Name: checklist_runs checklist_runs_performed_by_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.checklist_runs
    ADD CONSTRAINT checklist_runs_performed_by_foreign FOREIGN KEY (performed_by) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 5489 (class 2606 OID 337483)
-- Name: checklist_runs checklist_runs_shift_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.checklist_runs
    ADD CONSTRAINT checklist_runs_shift_id_foreign FOREIGN KEY (pg_dump: creating FK CONSTRAINT "public.checklists checklists_tenant_id_foreign"
pg_dump: creating FK CONSTRAINT "public.chemical_stocks chemical_stocks_facility_id_foreign"
pg_dump: creating FK CONSTRAINT "public.chemical_stocks chemical_stocks_scheme_id_foreign"
pg_dump: creating FK CONSTRAINT "public.chemical_stocks chemical_stocks_tenant_id_foreign"
pg_dump: creating FK CONSTRAINT "public.consents consents_user_id_foreign"
pg_dump: creating FK CONSTRAINT "public.courses courses_owner_id_foreign"
pg_dump: creating FK CONSTRAINT "public.courses courses_tenant_id_foreign"
pg_dump: creating FK CONSTRAINT "public.crm_balances crm_balances_tenant_id_foreign"
pg_dump: creating FK CONSTRAINT "public.crm_customer_reads crm_customer_reads_meter_id_foreign"
pg_dump: creating FK CONSTRAINT "public.crm_customer_reads crm_customer_reads_reader_id_foreign"
pg_dump: creating FK CONSTRAINT "public.crm_customers crm_customers_premise_id_foreign"
pg_dump: creating FK CONSTRAINT "public.crm_customers crm_customers_tenant_id_foreign"
pg_dump: creating FK CONSTRAINT "public.crm_invoice_lines crm_invoice_lines_invoice_id_foreign"
shift_id) REFERENCES public.shifts(id) ON DELETE SET NULL;


--
-- TOC entry 5485 (class 2606 OID 337462)
-- Name: checklists checklists_tenant_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.checklists
    ADD CONSTRAINT checklists_tenant_id_foreign FOREIGN KEY (tenant_id) REFERENCES public.organizations(id) ON DELETE CASCADE;


--
-- TOC entry 5541 (class 2606 OID 338475)
-- Name: chemical_stocks chemical_stocks_facility_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.chemical_stocks
    ADD CONSTRAINT chemical_stocks_facility_id_foreign FOREIGN KEY (facility_id) REFERENCES public.facilities(id) ON DELETE SET NULL;


--
-- TOC entry 5542 (class 2606 OID 338470)
-- Name: chemical_stocks chemical_stocks_scheme_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.chemical_stocks
    ADD CONSTRAINT chemical_stocks_scheme_id_foreign FOREIGN KEY (scheme_id) REFERENCES public.schemes(id) ON DELETE CASCADE;


--
-- TOC entry 5543 (class 2606 OID 338465)
-- Name: chemical_stocks chemical_stocks_tenant_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.chemical_stocks
    ADD CONSTRAINT chemical_stocks_tenant_id_foreign FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- TOC entry 5475 (class 2606 OID 337322)
-- Name: consents consents_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.consents
    ADD CONSTRAINT consents_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 5407 (class 2606 OID 336283)
-- Name: courses courses_owner_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.courses
    ADD CONSTRAINT courses_owner_id_foreign FOREIGN KEY (owner_id) REFERENCES public.users(id) ON DELETE RESTRICT;


--
-- TOC entry 5408 (class 2606 OID 336278)
-- Name: courses courses_tenant_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.courses
    ADD CONSTRAINT courses_tenant_id_foreign FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- TOC entry 5528 (class 2606 OID 338251)
-- Name: crm_balances crm_balances_tenant_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.crm_balances
    ADD CONSTRAINT crm_balances_tenant_id_foreign FOREIGN KEY (tenant_id) REFERENCES public.organizations(id) ON DELETE CASCADE;


--
-- TOC entry 5530 (class 2606 OID 338294)
-- Name: crm_customer_reads crm_customer_reads_meter_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.crm_customer_reads
    ADD CONSTRAINT crm_customer_reads_meter_id_foreign FOREIGN KEY (meter_id) REFERENCES public.crm_meters(id) ON DELETE CASCADE;


--
-- TOC entry 5531 (class 2606 OID 338299)
-- Name: crm_customer_reads crm_customer_reads_reader_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.crm_customer_reads
    ADD CONSTRAINT crm_customer_reads_reader_id_foreign FOREIGN KEY (reader_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- TOC entry 5522 (class 2606 OID 338160)
-- Name: crm_customers crm_customers_premise_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.crm_customers
    ADD CONSTRAINT crm_customers_premise_id_foreign FOREIGN KEY (premise_id) REFERENCES public.crm_premises(id) ON DELETE SET NULL;


--
-- TOC entry 5523 (class 2606 OID 338155)
-- Name: crm_customers crm_customers_tenant_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.crm_customers
    ADD CONSTRAINT crm_customers_tenant_id_foreign FOREIGN KEY (tenant_id) REFERENCES public.organizations(id) ON DELETE CASCADE;


--
-- TOC entry 5526 (class 2606 OID 338216)
-- Name: crm_invoice_lines crm_invoice_lines_invoice_id_foreign; Type: FK pg_dump: creating FK CONSTRAINT "public.crm_invoices crm_invoices_tenant_id_foreign"
pg_dump: creating FK CONSTRAINT "public.crm_meters crm_meters_tenant_id_foreign"
pg_dump: creating FK CONSTRAINT "public.crm_payment_plans crm_payment_plans_tenant_id_foreign"
pg_dump: creating FK CONSTRAINT "public.crm_payments crm_payments_tenant_id_foreign"
pg_dump: creating FK CONSTRAINT "public.crm_premises crm_premises_dma_id_foreign"
pg_dump: creating FK CONSTRAINT "public.crm_premises crm_premises_scheme_id_foreign"
pg_dump: creating FK CONSTRAINT "public.crm_premises crm_premises_tenant_id_foreign"
pg_dump: creating FK CONSTRAINT "public.crm_ra_rules crm_ra_rules_tenant_id_foreign"
pg_dump: creating FK CONSTRAINT "public.crm_service_connections crm_service_connections_meter_id_foreign"
pg_dump: creating FK CONSTRAINT "public.crm_service_connections crm_service_connections_premise_id_foreign"
pg_dump: creating FK CONSTRAINT "public.crm_tariffs crm_tariffs_tenant_id_foreign"
pg_dump: creating FK CONSTRAINT "public.data_catalog data_catalog_data_class_id_foreign"
CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.crm_invoice_lines
    ADD CONSTRAINT crm_invoice_lines_invoice_id_foreign FOREIGN KEY (invoice_id) REFERENCES public.crm_invoices(id) ON DELETE CASCADE;


--
-- TOC entry 5525 (class 2606 OID 338199)
-- Name: crm_invoices crm_invoices_tenant_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.crm_invoices
    ADD CONSTRAINT crm_invoices_tenant_id_foreign FOREIGN KEY (tenant_id) REFERENCES public.organizations(id) ON DELETE CASCADE;


--
-- TOC entry 5519 (class 2606 OID 338106)
-- Name: crm_meters crm_meters_tenant_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.crm_meters
    ADD CONSTRAINT crm_meters_tenant_id_foreign FOREIGN KEY (tenant_id) REFERENCES public.organizations(id) ON DELETE CASCADE;


--
-- TOC entry 5529 (class 2606 OID 338273)
-- Name: crm_payment_plans crm_payment_plans_tenant_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.crm_payment_plans
    ADD CONSTRAINT crm_payment_plans_tenant_id_foreign FOREIGN KEY (tenant_id) REFERENCES public.organizations(id) ON DELETE CASCADE;


--
-- TOC entry 5527 (class 2606 OID 338233)
-- Name: crm_payments crm_payments_tenant_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.crm_payments
    ADD CONSTRAINT crm_payments_tenant_id_foreign FOREIGN KEY (tenant_id) REFERENCES public.organizations(id) ON DELETE CASCADE;


--
-- TOC entry 5516 (class 2606 OID 338082)
-- Name: crm_premises crm_premises_dma_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.crm_premises
    ADD CONSTRAINT crm_premises_dma_id_foreign FOREIGN KEY (dma_id) REFERENCES public.dmas(id) ON DELETE SET NULL;


--
-- TOC entry 5517 (class 2606 OID 338077)
-- Name: crm_premises crm_premises_scheme_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.crm_premises
    ADD CONSTRAINT crm_premises_scheme_id_foreign FOREIGN KEY (scheme_id) REFERENCES public.schemes(id) ON DELETE SET NULL;


--
-- TOC entry 5518 (class 2606 OID 338072)
-- Name: crm_premises crm_premises_tenant_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.crm_premises
    ADD CONSTRAINT crm_premises_tenant_id_foreign FOREIGN KEY (tenant_id) REFERENCES public.organizations(id) ON DELETE CASCADE;


--
-- TOC entry 5532 (class 2606 OID 338320)
-- Name: crm_ra_rules crm_ra_rules_tenant_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.crm_ra_rules
    ADD CONSTRAINT crm_ra_rules_tenant_id_foreign FOREIGN KEY (tenant_id) REFERENCES public.organizations(id) ON DELETE CASCADE;


--
-- TOC entry 5520 (class 2606 OID 338134)
-- Name: crm_service_connections crm_service_connections_meter_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.crm_service_connections
    ADD CONSTRAINT crm_service_connections_meter_id_foreign FOREIGN KEY (meter_id) REFERENCES public.crm_meters(id) ON DELETE SET NULL;


--
-- TOC entry 5521 (class 2606 OID 338129)
-- Name: crm_service_connections crm_service_connections_premise_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.crm_service_connections
    ADD CONSTRAINT crm_service_connections_premise_id_foreign FOREIGN KEY (premise_id) REFERENCES public.crm_premises(id) ON DELETE CASCADE;


--
-- TOC entry 5524 (class 2606 OID 338181)
-- Name: crm_tariffs crm_tariffs_tenant_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.crm_tariffs
    ADD CONSTRAINT crm_tariffs_tenant_id_foreign FOREIGN KEY (tenant_id) REFERENCES public.organizations(id) ON DELETE CASCADE;


--
-- TOC entry 5474 (class 2606 OID 337298)
-- Name: data_catalog data_catalog_data_class_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY publipg_dump: creating FK CONSTRAINT "public.device_trust device_trust_user_id_foreign"
pg_dump: creating FK CONSTRAINT "public.dmas dmas_scheme_id_foreign"
pg_dump: creating FK CONSTRAINT "public.dmas dmas_tenant_id_foreign"
pg_dump: creating FK CONSTRAINT "public.dose_change_logs dose_change_logs_dose_plan_id_foreign"
pg_dump: creating FK CONSTRAINT "public.dose_change_logs dose_change_logs_user_id_foreign"
pg_dump: creating FK CONSTRAINT "public.dose_plans dose_plans_asset_id_foreign"
pg_dump: creating FK CONSTRAINT "public.dose_plans dose_plans_scheme_id_foreign"
pg_dump: creating FK CONSTRAINT "public.dose_plans dose_plans_tenant_id_foreign"
pg_dump: creating FK CONSTRAINT "public.dsr_requests dsr_requests_requester_id_foreign"
pg_dump: creating FK CONSTRAINT "public.dsr_requests dsr_requests_target_user_id_foreign"
pg_dump: creating FK CONSTRAINT "public.dsr_requests dsr_requests_tenant_id_foreign"
pg_dump: creating FK CONSTRAINT "public.employee_skills employee_skills_assessor_id_foreign"
pg_dump: creating FK CONSTRAINT "public.employee_skills employee_skills_skill_id_foreign"
c.data_catalog
    ADD CONSTRAINT data_catalog_data_class_id_foreign FOREIGN KEY (data_class_id) REFERENCES public.data_classes(id) ON DELETE CASCADE;


--
-- TOC entry 5473 (class 2606 OID 337258)
-- Name: device_trust device_trust_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.device_trust
    ADD CONSTRAINT device_trust_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 5384 (class 2606 OID 336039)
-- Name: dmas dmas_scheme_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.dmas
    ADD CONSTRAINT dmas_scheme_id_foreign FOREIGN KEY (scheme_id) REFERENCES public.schemes(id) ON DELETE CASCADE;


--
-- TOC entry 5385 (class 2606 OID 336034)
-- Name: dmas dmas_tenant_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.dmas
    ADD CONSTRAINT dmas_tenant_id_foreign FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- TOC entry 5544 (class 2606 OID 338490)
-- Name: dose_change_logs dose_change_logs_dose_plan_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.dose_change_logs
    ADD CONSTRAINT dose_change_logs_dose_plan_id_foreign FOREIGN KEY (dose_plan_id) REFERENCES public.dose_plans(id) ON DELETE CASCADE;


--
-- TOC entry 5545 (class 2606 OID 338495)
-- Name: dose_change_logs dose_change_logs_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.dose_change_logs
    ADD CONSTRAINT dose_change_logs_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- TOC entry 5538 (class 2606 OID 338451)
-- Name: dose_plans dose_plans_asset_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.dose_plans
    ADD CONSTRAINT dose_plans_asset_id_foreign FOREIGN KEY (asset_id) REFERENCES public.assets(id) ON DELETE SET NULL;


--
-- TOC entry 5539 (class 2606 OID 338446)
-- Name: dose_plans dose_plans_scheme_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.dose_plans
    ADD CONSTRAINT dose_plans_scheme_id_foreign FOREIGN KEY (scheme_id) REFERENCES public.schemes(id) ON DELETE CASCADE;


--
-- TOC entry 5540 (class 2606 OID 338441)
-- Name: dose_plans dose_plans_tenant_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.dose_plans
    ADD CONSTRAINT dose_plans_tenant_id_foreign FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- TOC entry 5476 (class 2606 OID 337341)
-- Name: dsr_requests dsr_requests_requester_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.dsr_requests
    ADD CONSTRAINT dsr_requests_requester_id_foreign FOREIGN KEY (requester_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 5477 (class 2606 OID 337346)
-- Name: dsr_requests dsr_requests_target_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.dsr_requests
    ADD CONSTRAINT dsr_requests_target_user_id_foreign FOREIGN KEY (target_user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 5478 (class 2606 OID 337336)
-- Name: dsr_requests dsr_requests_tenant_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.dsr_requests
    ADD CONSTRAINT dsr_requests_tenant_id_foreign FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- TOC entry 5429 (class 2606 OID 336559)
-- Name: employee_skills employee_skills_assessor_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.employee_skills
    ADD CONSTRAINT employee_skills_assessor_id_foreign FOREIGN KEY (assessor_id) REFERENCES public.users(id);


--
-- TOC entry 5430 (class 2606 OID 336554)
-- Name: employee_skills employee_skills_skill_id_foreign; Type: FK CONSTRAINTpg_dump: creating FK CONSTRAINT "public.employee_skills employee_skills_tenant_id_foreign"
pg_dump: creating FK CONSTRAINT "public.employee_skills employee_skills_user_id_foreign"
pg_dump: creating FK CONSTRAINT "public.enrollments enrollments_course_id_foreign"
pg_dump: creating FK CONSTRAINT "public.enrollments enrollments_tenant_id_foreign"
pg_dump: creating FK CONSTRAINT "public.enrollments enrollments_user_id_foreign"
pg_dump: creating FK CONSTRAINT "public.escalation_policies escalation_policies_tenant_id_foreign"
pg_dump: creating FK CONSTRAINT "public.event_actions event_actions_actor_id_foreign"
pg_dump: creating FK CONSTRAINT "public.event_actions event_actions_event_id_foreign"
pg_dump: creating FK CONSTRAINT "public.event_links event_links_event_id_foreign"
pg_dump: creating FK CONSTRAINT "public.events events_dma_id_foreign"
pg_dump: creating FK CONSTRAINT "public.events events_facility_id_foreign"
pg_dump: creating FK CONSTRAINT "public.events events_scheme_id_foreign"
pg_dump: creating FK CONSTRAINT "public.events events_tenant_id_foreign"
; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.employee_skills
    ADD CONSTRAINT employee_skills_skill_id_foreign FOREIGN KEY (skill_id) REFERENCES public.skills(id) ON DELETE CASCADE;


--
-- TOC entry 5431 (class 2606 OID 336544)
-- Name: employee_skills employee_skills_tenant_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.employee_skills
    ADD CONSTRAINT employee_skills_tenant_id_foreign FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- TOC entry 5432 (class 2606 OID 336549)
-- Name: employee_skills employee_skills_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.employee_skills
    ADD CONSTRAINT employee_skills_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 5410 (class 2606 OID 336339)
-- Name: enrollments enrollments_course_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.enrollments
    ADD CONSTRAINT enrollments_course_id_foreign FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE;


--
-- TOC entry 5411 (class 2606 OID 336329)
-- Name: enrollments enrollments_tenant_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.enrollments
    ADD CONSTRAINT enrollments_tenant_id_foreign FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- TOC entry 5412 (class 2606 OID 336334)
-- Name: enrollments enrollments_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.enrollments
    ADD CONSTRAINT enrollments_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 5498 (class 2606 OID 337613)
-- Name: escalation_policies escalation_policies_tenant_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.escalation_policies
    ADD CONSTRAINT escalation_policies_tenant_id_foreign FOREIGN KEY (tenant_id) REFERENCES public.organizations(id) ON DELETE CASCADE;


--
-- TOC entry 5496 (class 2606 OID 337596)
-- Name: event_actions event_actions_actor_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.event_actions
    ADD CONSTRAINT event_actions_actor_id_foreign FOREIGN KEY (actor_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- TOC entry 5497 (class 2606 OID 337591)
-- Name: event_actions event_actions_event_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.event_actions
    ADD CONSTRAINT event_actions_event_id_foreign FOREIGN KEY (event_id) REFERENCES public.events(id) ON DELETE CASCADE;


--
-- TOC entry 5494 (class 2606 OID 337556)
-- Name: event_links event_links_event_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.event_links
    ADD CONSTRAINT event_links_event_id_foreign FOREIGN KEY (event_id) REFERENCES public.events(id) ON DELETE CASCADE;


--
-- TOC entry 5490 (class 2606 OID 337534)
-- Name: events events_dma_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_dma_id_foreign FOREIGN KEY (dma_id) REFERENCES public.dmas(id) ON DELETE SET NULL;


--
-- TOC entry 5491 (class 2606 OID 337524)
-- Name: events events_facility_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_facility_id_foreign FOREIGN KEY (facility_id) REFERENCES public.facilities(id) ON DELETE SET NULL;


--
-- TOC entry 5492 (class 2606 OID 337529)
-- Name: events events_scheme_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_scheme_id_foreign FOREIGN KEY (scheme_id) REFERENCES public.schemes(id) ON DELETE SET NULL;


--
-- TOC entry 5493 (class 2606 OID 337517)
-- Name: events events_tenant_pg_dump: creating FK CONSTRAINT "public.facilities facilities_scheme_id_foreign"
pg_dump: creating FK CONSTRAINT "public.facilities facilities_tenant_id_foreign"
pg_dump: creating FK CONSTRAINT "public.failures failures_work_order_id_foreign"
pg_dump: creating FK CONSTRAINT "public.interventions interventions_asset_id_foreign"
pg_dump: creating FK CONSTRAINT "public.interventions interventions_dma_id_foreign"
pg_dump: creating FK CONSTRAINT "public.interventions interventions_tenant_id_foreign"
pg_dump: creating FK CONSTRAINT "public.kb_articles kb_articles_approver_id_foreign"
pg_dump: creating FK CONSTRAINT "public.kb_articles kb_articles_author_id_foreign"
pg_dump: creating FK CONSTRAINT "public.kb_articles kb_articles_tenant_id_foreign"
pg_dump: creating FK CONSTRAINT "public.lesson_progress lesson_progress_enrollment_id_foreign"
pg_dump: creating FK CONSTRAINT "public.lesson_progress lesson_progress_lesson_id_foreign"
pg_dump: creating FK CONSTRAINT "public.lessons lessons_course_id_foreign"
pg_dump: creating FK CONSTRAINT "public.map_layer_configs map_layer_configs_tenant_id_foreign"
id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_tenant_id_foreign FOREIGN KEY (tenant_id) REFERENCES public.organizations(id) ON DELETE CASCADE;


--
-- TOC entry 5382 (class 2606 OID 336017)
-- Name: facilities facilities_scheme_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.facilities
    ADD CONSTRAINT facilities_scheme_id_foreign FOREIGN KEY (scheme_id) REFERENCES public.schemes(id) ON DELETE CASCADE;


--
-- TOC entry 5383 (class 2606 OID 336012)
-- Name: facilities facilities_tenant_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.facilities
    ADD CONSTRAINT facilities_tenant_id_foreign FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- TOC entry 5467 (class 2606 OID 337221)
-- Name: failures failures_work_order_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.failures
    ADD CONSTRAINT failures_work_order_id_foreign FOREIGN KEY (work_order_id) REFERENCES public.work_orders(id) ON DELETE CASCADE;


--
-- TOC entry 5535 (class 2606 OID 338426)
-- Name: interventions interventions_asset_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.interventions
    ADD CONSTRAINT interventions_asset_id_foreign FOREIGN KEY (asset_id) REFERENCES public.assets(id) ON DELETE SET NULL;


--
-- TOC entry 5536 (class 2606 OID 338421)
-- Name: interventions interventions_dma_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.interventions
    ADD CONSTRAINT interventions_dma_id_foreign FOREIGN KEY (dma_id) REFERENCES public.dmas(id) ON DELETE SET NULL;


--
-- TOC entry 5537 (class 2606 OID 338416)
-- Name: interventions interventions_tenant_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.interventions
    ADD CONSTRAINT interventions_tenant_id_foreign FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- TOC entry 5423 (class 2606 OID 336485)
-- Name: kb_articles kb_articles_approver_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.kb_articles
    ADD CONSTRAINT kb_articles_approver_id_foreign FOREIGN KEY (approver_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- TOC entry 5424 (class 2606 OID 336480)
-- Name: kb_articles kb_articles_author_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.kb_articles
    ADD CONSTRAINT kb_articles_author_id_foreign FOREIGN KEY (author_id) REFERENCES public.users(id) ON DELETE RESTRICT;


--
-- TOC entry 5425 (class 2606 OID 336475)
-- Name: kb_articles kb_articles_tenant_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.kb_articles
    ADD CONSTRAINT kb_articles_tenant_id_foreign FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- TOC entry 5413 (class 2606 OID 336357)
-- Name: lesson_progress lesson_progress_enrollment_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.lesson_progress
    ADD CONSTRAINT lesson_progress_enrollment_id_foreign FOREIGN KEY (enrollment_id) REFERENCES public.enrollments(id) ON DELETE CASCADE;


--
-- TOC entry 5414 (class 2606 OID 336362)
-- Name: lesson_progress lesson_progress_lesson_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.lesson_progress
    ADD CONSTRAINT lesson_progress_lesson_id_foreign FOREIGN KEY (lesson_id) REFERENCES public.lessons(id) ON DELETE CASCADE;


--
-- TOC entry 5409 (class 2606 OID 336314)
-- Name: lessons lessons_course_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.lessons
    ADD CONSTRAINT lessons_course_id_foreign FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE;


--
-- TOCpg_dump: creating FK CONSTRAINT "public.meter_captures meter_captures_asset_meter_id_foreign"
pg_dump: creating FK CONSTRAINT "public.model_has_permissions model_has_permissions_permission_id_foreign"
pg_dump: creating FK CONSTRAINT "public.model_has_roles model_has_roles_role_id_foreign"
pg_dump: creating FK CONSTRAINT "public.network_nodes network_nodes_scheme_id_fkey"
pg_dump: creating FK CONSTRAINT "public.network_nodes network_nodes_tenant_id_fkey"
pg_dump: creating FK CONSTRAINT "public.nrw_snapshots nrw_snapshots_dma_id_foreign"
pg_dump: creating FK CONSTRAINT "public.nrw_snapshots nrw_snapshots_tenant_id_foreign"
pg_dump: creating FK CONSTRAINT "public.oncall_schedules oncall_schedules_tenant_id_foreign"
pg_dump: creating FK CONSTRAINT "public.organizations organizations_tenant_id_foreign"
pg_dump: creating FK CONSTRAINT "public.outages outages_dma_id_fkey"
pg_dump: creating FK CONSTRAINT "public.outages outages_tenant_id_fkey"
pg_dump: creating FK CONSTRAINT "public.parts parts_tenant_id_foreign"
 entry 5406 (class 2606 OID 336255)
-- Name: map_layer_configs map_layer_configs_tenant_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.map_layer_configs
    ADD CONSTRAINT map_layer_configs_tenant_id_foreign FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- TOC entry 5447 (class 2606 OID 336981)
-- Name: meter_captures meter_captures_asset_meter_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.meter_captures
    ADD CONSTRAINT meter_captures_asset_meter_id_foreign FOREIGN KEY (asset_meter_id) REFERENCES public.asset_meters(id) ON DELETE CASCADE;


--
-- TOC entry 5435 (class 2606 OID 336657)
-- Name: model_has_permissions model_has_permissions_permission_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.model_has_permissions
    ADD CONSTRAINT model_has_permissions_permission_id_foreign FOREIGN KEY (permission_id) REFERENCES public.permissions(id) ON DELETE CASCADE;


--
-- TOC entry 5436 (class 2606 OID 336668)
-- Name: model_has_roles model_has_roles_role_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.model_has_roles
    ADD CONSTRAINT model_has_roles_role_id_foreign FOREIGN KEY (role_id) REFERENCES public.roles(id) ON DELETE CASCADE;


--
-- TOC entry 5549 (class 2606 OID 338546)
-- Name: network_nodes network_nodes_scheme_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.network_nodes
    ADD CONSTRAINT network_nodes_scheme_id_fkey FOREIGN KEY (scheme_id) REFERENCES public.schemes(id) ON DELETE CASCADE;


--
-- TOC entry 5550 (class 2606 OID 338541)
-- Name: network_nodes network_nodes_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.network_nodes
    ADD CONSTRAINT network_nodes_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- TOC entry 5533 (class 2606 OID 338399)
-- Name: nrw_snapshots nrw_snapshots_dma_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.nrw_snapshots
    ADD CONSTRAINT nrw_snapshots_dma_id_foreign FOREIGN KEY (dma_id) REFERENCES public.dmas(id) ON DELETE CASCADE;


--
-- TOC entry 5534 (class 2606 OID 338394)
-- Name: nrw_snapshots nrw_snapshots_tenant_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.nrw_snapshots
    ADD CONSTRAINT nrw_snapshots_tenant_id_foreign FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- TOC entry 5434 (class 2606 OID 336593)
-- Name: oncall_schedules oncall_schedules_tenant_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.oncall_schedules
    ADD CONSTRAINT oncall_schedules_tenant_id_foreign FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- TOC entry 5379 (class 2606 OID 335969)
-- Name: organizations organizations_tenant_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.organizations
    ADD CONSTRAINT organizations_tenant_id_foreign FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- TOC entry 5551 (class 2606 OID 338567)
-- Name: outages outages_dma_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.outages
    ADD CONSTRAINT outages_dma_id_fkey FOREIGN KEY (dma_id) REFERENCES public.dmas(id) ON DELETE SET NULL;


--
-- TOC entry 5552 (class 2606 OID 338562)
-- Name: outages outages_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.outages
    ADD CONSTRAINT outages_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- TOC entry 5448 (class 2606 OID 337000)
-- Name: parts parts_tenant_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.parts
    ADD CONSpg_dump: creating FK CONSTRAINT "public.pipelines pipelines_scheme_id_foreign"
pg_dump: creating FK CONSTRAINT "public.pipelines pipelines_tenant_id_foreign"
pg_dump: creating FK CONSTRAINT "public.playbooks playbooks_tenant_id_foreign"
pg_dump: creating FK CONSTRAINT "public.pm_policies pm_policies_asset_id_foreign"
pg_dump: creating FK CONSTRAINT "public.pm_schedules pm_schedules_pm_policy_id_foreign"
pg_dump: creating FK CONSTRAINT "public.pump_schedules pump_schedules_asset_id_foreign"
pg_dump: creating FK CONSTRAINT "public.pump_schedules pump_schedules_scheme_id_foreign"
pg_dump: creating FK CONSTRAINT "public.pump_schedules pump_schedules_tenant_id_foreign"
pg_dump: creating FK CONSTRAINT "public.questions questions_assessment_id_foreign"
pg_dump: creating FK CONSTRAINT "public.redlines redlines_captured_by_foreign"
pg_dump: creating FK CONSTRAINT "public.redlines redlines_edit_layer_id_foreign"
pg_dump: creating FK CONSTRAINT "public.redlines redlines_tenant_id_foreign"
pg_dump: creating FK CONSTRAINT "public.role_has_permissions role_has_permissions_permission_id_foreign"
TRAINT parts_tenant_id_foreign FOREIGN KEY (tenant_id) REFERENCES public.organizations(id) ON DELETE CASCADE;


--
-- TOC entry 5386 (class 2606 OID 336063)
-- Name: pipelines pipelines_scheme_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.pipelines
    ADD CONSTRAINT pipelines_scheme_id_foreign FOREIGN KEY (scheme_id) REFERENCES public.schemes(id) ON DELETE CASCADE;


--
-- TOC entry 5387 (class 2606 OID 336058)
-- Name: pipelines pipelines_tenant_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.pipelines
    ADD CONSTRAINT pipelines_tenant_id_foreign FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- TOC entry 5495 (class 2606 OID 337574)
-- Name: playbooks playbooks_tenant_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.playbooks
    ADD CONSTRAINT playbooks_tenant_id_foreign FOREIGN KEY (tenant_id) REFERENCES public.organizations(id) ON DELETE CASCADE;


--
-- TOC entry 5452 (class 2606 OID 337058)
-- Name: pm_policies pm_policies_asset_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.pm_policies
    ADD CONSTRAINT pm_policies_asset_id_foreign FOREIGN KEY (asset_id) REFERENCES public.assets(id) ON DELETE CASCADE;


--
-- TOC entry 5453 (class 2606 OID 337074)
-- Name: pm_schedules pm_schedules_pm_policy_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.pm_schedules
    ADD CONSTRAINT pm_schedules_pm_policy_id_foreign FOREIGN KEY (pm_policy_id) REFERENCES public.pm_policies(id) ON DELETE CASCADE;


--
-- TOC entry 5546 (class 2606 OID 338517)
-- Name: pump_schedules pump_schedules_asset_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.pump_schedules
    ADD CONSTRAINT pump_schedules_asset_id_foreign FOREIGN KEY (asset_id) REFERENCES public.assets(id) ON DELETE CASCADE;


--
-- TOC entry 5547 (class 2606 OID 338522)
-- Name: pump_schedules pump_schedules_scheme_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.pump_schedules
    ADD CONSTRAINT pump_schedules_scheme_id_foreign FOREIGN KEY (scheme_id) REFERENCES public.schemes(id) ON DELETE CASCADE;


--
-- TOC entry 5548 (class 2606 OID 338512)
-- Name: pump_schedules pump_schedules_tenant_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.pump_schedules
    ADD CONSTRAINT pump_schedules_tenant_id_foreign FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- TOC entry 5416 (class 2606 OID 336398)
-- Name: questions questions_assessment_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.questions
    ADD CONSTRAINT questions_assessment_id_foreign FOREIGN KEY (assessment_id) REFERENCES public.assessments(id) ON DELETE CASCADE;


--
-- TOC entry 5397 (class 2606 OID 336184)
-- Name: redlines redlines_captured_by_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.redlines
    ADD CONSTRAINT redlines_captured_by_foreign FOREIGN KEY (captured_by) REFERENCES public.users(id) ON DELETE RESTRICT;


--
-- TOC entry 5398 (class 2606 OID 336179)
-- Name: redlines redlines_edit_layer_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.redlines
    ADD CONSTRAINT redlines_edit_layer_id_foreign FOREIGN KEY (edit_layer_id) REFERENCES public.spatial_edit_layers(id) ON DELETE CASCADE;


--
-- TOC entry 5399 (class 2606 OID 336174)
-- Name: redlines redlines_tenant_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.redlines
    ADD CONSTRAINT redlines_tenant_id_foreign FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- TOC entry 5437 (class 2606 OID 336678)
-- Name: role_has_permissions role_has_permissions_permission_id_foreign; Type: FK CONSTRAINT; pg_dump: creating FK CONSTRAINT "public.role_has_permissions role_has_permissions_role_id_foreign"
pg_dump: creating FK CONSTRAINT "public.rosters rosters_tenant_id_foreign"
pg_dump: creating FK CONSTRAINT "public.schemes schemes_org_id_foreign"
pg_dump: creating FK CONSTRAINT "public.schemes schemes_tenant_id_foreign"
pg_dump: creating FK CONSTRAINT "public.secrets secrets_created_by_foreign"
pg_dump: creating FK CONSTRAINT "public.secrets secrets_tenant_id_foreign"
pg_dump: creating FK CONSTRAINT "public.security_alerts security_alerts_tenant_id_foreign"
pg_dump: creating FK CONSTRAINT "public.shift_entries shift_entries_created_by_foreign"
pg_dump: creating FK CONSTRAINT "public.shift_entries shift_entries_shift_id_foreign"
pg_dump: creating FK CONSTRAINT "public.shifts shifts_dma_id_foreign"
pg_dump: creating FK CONSTRAINT "public.shifts shifts_facility_id_foreign"
pg_dump: creating FK CONSTRAINT "public.shifts shifts_scheme_id_foreign"
pg_dump: creating FK CONSTRAINT "public.shifts shifts_supervisor_id_foreign"
Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.role_has_permissions
    ADD CONSTRAINT role_has_permissions_permission_id_foreign FOREIGN KEY (permission_id) REFERENCES public.permissions(id) ON DELETE CASCADE;


--
-- TOC entry 5438 (class 2606 OID 336683)
-- Name: role_has_permissions role_has_permissions_role_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.role_has_permissions
    ADD CONSTRAINT role_has_permissions_role_id_foreign FOREIGN KEY (role_id) REFERENCES public.roles(id) ON DELETE CASCADE;


--
-- TOC entry 5433 (class 2606 OID 336577)
-- Name: rosters rosters_tenant_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.rosters
    ADD CONSTRAINT rosters_tenant_id_foreign FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- TOC entry 5380 (class 2606 OID 335993)
-- Name: schemes schemes_org_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.schemes
    ADD CONSTRAINT schemes_org_id_foreign FOREIGN KEY (org_id) REFERENCES public.organizations(id) ON DELETE SET NULL;


--
-- TOC entry 5381 (class 2606 OID 335988)
-- Name: schemes schemes_tenant_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.schemes
    ADD CONSTRAINT schemes_tenant_id_foreign FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- TOC entry 5481 (class 2606 OID 337404)
-- Name: secrets secrets_created_by_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.secrets
    ADD CONSTRAINT secrets_created_by_foreign FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 5482 (class 2606 OID 337399)
-- Name: secrets secrets_tenant_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.secrets
    ADD CONSTRAINT secrets_tenant_id_foreign FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- TOC entry 5480 (class 2606 OID 337377)
-- Name: security_alerts security_alerts_tenant_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.security_alerts
    ADD CONSTRAINT security_alerts_tenant_id_foreign FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- TOC entry 5483 (class 2606 OID 337441)
-- Name: shift_entries shift_entries_created_by_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.shift_entries
    ADD CONSTRAINT shift_entries_created_by_foreign FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 5484 (class 2606 OID 337436)
-- Name: shift_entries shift_entries_shift_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.shift_entries
    ADD CONSTRAINT shift_entries_shift_id_foreign FOREIGN KEY (shift_id) REFERENCES public.shifts(id) ON DELETE CASCADE;


--
-- TOC entry 5468 (class 2606 OID 337275)
-- Name: shifts shifts_dma_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.shifts
    ADD CONSTRAINT shifts_dma_id_foreign FOREIGN KEY (dma_id) REFERENCES public.dmas(id) ON DELETE SET NULL;


--
-- TOC entry 5469 (class 2606 OID 337263)
-- Name: shifts shifts_facility_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.shifts
    ADD CONSTRAINT shifts_facility_id_foreign FOREIGN KEY (facility_id) REFERENCES public.facilities(id) ON DELETE SET NULL;


--
-- TOC entry 5470 (class 2606 OID 337269)
-- Name: shifts shifts_scheme_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.shifts
    ADD CONSTRAINT shifts_scheme_id_foreign FOREIGN KEY (scheme_id) REFERENCES public.schemes(id) ON DELETE SET NULL;


--
-- TOC entry 5471 (class 2606 OID 337413)
-- Name: shifts shifts_supervisor_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner:pg_dump: creating FK CONSTRAINT "public.shifts shifts_tenant_id_foreign"
pg_dump: creating FK CONSTRAINT "public.skills skills_tenant_id_foreign"
pg_dump: creating FK CONSTRAINT "public.sops sops_approver_id_foreign"
pg_dump: creating FK CONSTRAINT "public.sops sops_tenant_id_foreign"
pg_dump: creating FK CONSTRAINT "public.spatial_change_log spatial_change_log_changed_by_foreign"
pg_dump: creating FK CONSTRAINT "public.spatial_change_log spatial_change_log_redline_id_foreign"
pg_dump: creating FK CONSTRAINT "public.spatial_change_log spatial_change_log_tenant_id_foreign"
pg_dump: creating FK CONSTRAINT "public.spatial_edit_layers spatial_edit_layers_approved_by_foreign"
pg_dump: creating FK CONSTRAINT "public.spatial_edit_layers spatial_edit_layers_created_by_foreign"
pg_dump: creating FK CONSTRAINT "public.spatial_edit_layers spatial_edit_layers_reviewed_by_foreign"
pg_dump: creating FK CONSTRAINT "public.spatial_edit_layers spatial_edit_layers_tenant_id_foreign"
pg_dump: creating FK CONSTRAINT "public.stock_txns stock_txns_part_id_foreign"
 neondb_owner
--

ALTER TABLE ONLY public.shifts
    ADD CONSTRAINT shifts_supervisor_id_foreign FOREIGN KEY (supervisor_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- TOC entry 5472 (class 2606 OID 337253)
-- Name: shifts shifts_tenant_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.shifts
    ADD CONSTRAINT shifts_tenant_id_foreign FOREIGN KEY (tenant_id) REFERENCES public.organizations(id) ON DELETE CASCADE;


--
-- TOC entry 5428 (class 2606 OID 336526)
-- Name: skills skills_tenant_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.skills
    ADD CONSTRAINT skills_tenant_id_foreign FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- TOC entry 5426 (class 2606 OID 336508)
-- Name: sops sops_approver_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.sops
    ADD CONSTRAINT sops_approver_id_foreign FOREIGN KEY (approver_id) REFERENCES public.users(id);


--
-- TOC entry 5427 (class 2606 OID 336503)
-- Name: sops sops_tenant_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.sops
    ADD CONSTRAINT sops_tenant_id_foreign FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- TOC entry 5403 (class 2606 OID 336232)
-- Name: spatial_change_log spatial_change_log_changed_by_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.spatial_change_log
    ADD CONSTRAINT spatial_change_log_changed_by_foreign FOREIGN KEY (changed_by) REFERENCES public.users(id) ON DELETE RESTRICT;


--
-- TOC entry 5404 (class 2606 OID 336237)
-- Name: spatial_change_log spatial_change_log_redline_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.spatial_change_log
    ADD CONSTRAINT spatial_change_log_redline_id_foreign FOREIGN KEY (redline_id) REFERENCES public.redlines(id) ON DELETE SET NULL;


--
-- TOC entry 5405 (class 2606 OID 336227)
-- Name: spatial_change_log spatial_change_log_tenant_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.spatial_change_log
    ADD CONSTRAINT spatial_change_log_tenant_id_foreign FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- TOC entry 5393 (class 2606 OID 336158)
-- Name: spatial_edit_layers spatial_edit_layers_approved_by_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.spatial_edit_layers
    ADD CONSTRAINT spatial_edit_layers_approved_by_foreign FOREIGN KEY (approved_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- TOC entry 5394 (class 2606 OID 336148)
-- Name: spatial_edit_layers spatial_edit_layers_created_by_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.spatial_edit_layers
    ADD CONSTRAINT spatial_edit_layers_created_by_foreign FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE RESTRICT;


--
-- TOC entry 5395 (class 2606 OID 336153)
-- Name: spatial_edit_layers spatial_edit_layers_reviewed_by_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.spatial_edit_layers
    ADD CONSTRAINT spatial_edit_layers_reviewed_by_foreign FOREIGN KEY (reviewed_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- TOC entry 5396 (class 2606 OID 336143)
-- Name: spatial_edit_layers spatial_edit_layers_tenant_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.spatial_edit_layers
    ADD CONSTRAINT spatial_edit_layers_tenant_id_foreign FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- TOC entry 5461 (class 2606 OID 337160)
-- Name: stock_txns stock_txns_part_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.stock_txns
    ADD CONSTRAINT stock_txns_part_id_foreign FOREIGN KEY (part_id) REFERENCES public.parts(id) ON DELETE Cpg_dump: creating FK CONSTRAINT "public.stock_txns stock_txns_work_order_id_foreign"
pg_dump: creating FK CONSTRAINT "public.suppliers suppliers_tenant_id_foreign"
pg_dump: creating FK CONSTRAINT "public.telemetry_measurements telemetry_measurements_telemetry_tag_id_foreign"
pg_dump: creating FK CONSTRAINT "public.telemetry_tags telemetry_tags_asset_id_foreign"
pg_dump: creating FK CONSTRAINT "public.telemetry_tags telemetry_tags_network_node_id_foreign"
pg_dump: creating FK CONSTRAINT "public.telemetry_tags telemetry_tags_scheme_id_foreign"
pg_dump: creating FK CONSTRAINT "public.telemetry_tags telemetry_tags_tenant_id_foreign"
pg_dump: creating FK CONSTRAINT "public.topology_validations topology_validations_edit_layer_id_foreign"
pg_dump: creating FK CONSTRAINT "public.topology_validations topology_validations_resolved_by_foreign"
pg_dump: creating FK CONSTRAINT "public.topology_validations topology_validations_tenant_id_foreign"
pg_dump: creating FK CONSTRAINT "public.wo_labor wo_labor_user_id_foreign"
pg_dump: creating FK CONSTRAINT "public.wo_labor wo_labor_work_order_id_foreign"
ASCADE;


--
-- TOC entry 5462 (class 2606 OID 337165)
-- Name: stock_txns stock_txns_work_order_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.stock_txns
    ADD CONSTRAINT stock_txns_work_order_id_foreign FOREIGN KEY (work_order_id) REFERENCES public.work_orders(id) ON DELETE SET NULL;


--
-- TOC entry 5451 (class 2606 OID 337040)
-- Name: suppliers suppliers_tenant_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.suppliers
    ADD CONSTRAINT suppliers_tenant_id_foreign FOREIGN KEY (tenant_id) REFERENCES public.organizations(id) ON DELETE CASCADE;


--
-- TOC entry 5557 (class 2606 OID 338612)
-- Name: telemetry_measurements telemetry_measurements_telemetry_tag_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.telemetry_measurements
    ADD CONSTRAINT telemetry_measurements_telemetry_tag_id_foreign FOREIGN KEY (telemetry_tag_id) REFERENCES public.telemetry_tags(id) ON DELETE CASCADE;


--
-- TOC entry 5553 (class 2606 OID 338591)
-- Name: telemetry_tags telemetry_tags_asset_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.telemetry_tags
    ADD CONSTRAINT telemetry_tags_asset_id_foreign FOREIGN KEY (asset_id) REFERENCES public.assets(id) ON DELETE SET NULL;


--
-- TOC entry 5554 (class 2606 OID 338596)
-- Name: telemetry_tags telemetry_tags_network_node_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.telemetry_tags
    ADD CONSTRAINT telemetry_tags_network_node_id_foreign FOREIGN KEY (network_node_id) REFERENCES public.network_nodes(id) ON DELETE SET NULL;


--
-- TOC entry 5555 (class 2606 OID 338586)
-- Name: telemetry_tags telemetry_tags_scheme_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.telemetry_tags
    ADD CONSTRAINT telemetry_tags_scheme_id_foreign FOREIGN KEY (scheme_id) REFERENCES public.schemes(id) ON DELETE SET NULL;


--
-- TOC entry 5556 (class 2606 OID 338581)
-- Name: telemetry_tags telemetry_tags_tenant_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.telemetry_tags
    ADD CONSTRAINT telemetry_tags_tenant_id_foreign FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- TOC entry 5400 (class 2606 OID 336207)
-- Name: topology_validations topology_validations_edit_layer_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.topology_validations
    ADD CONSTRAINT topology_validations_edit_layer_id_foreign FOREIGN KEY (edit_layer_id) REFERENCES public.spatial_edit_layers(id) ON DELETE SET NULL;


--
-- TOC entry 5401 (class 2606 OID 336212)
-- Name: topology_validations topology_validations_resolved_by_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.topology_validations
    ADD CONSTRAINT topology_validations_resolved_by_foreign FOREIGN KEY (resolved_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- TOC entry 5402 (class 2606 OID 336202)
-- Name: topology_validations topology_validations_tenant_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.topology_validations
    ADD CONSTRAINT topology_validations_tenant_id_foreign FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- TOC entry 5465 (class 2606 OID 337205)
-- Name: wo_labor wo_labor_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.wo_labor
    ADD CONSTRAINT wo_labor_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE RESTRICT;


--
-- TOC entry 5466 (class 2606 OID 337200)
-- Name: wo_labor wo_labor_work_order_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.wo_labor
    ADD CONSTRAINT wo_labor_work_order_id_foreign FOREIGN KEY (work_order_id) REFERENCES public.work_orders(id) ON DELETE CASCpg_dump: creating FK CONSTRAINT "public.wo_parts wo_parts_part_id_foreign"
pg_dump: creating FK CONSTRAINT "public.wo_parts wo_parts_work_order_id_foreign"
pg_dump: creating FK CONSTRAINT "public.work_orders work_orders_asset_id_foreign"
pg_dump: creating FK CONSTRAINT "public.work_orders work_orders_assigned_to_foreign"
pg_dump: creating FK CONSTRAINT "public.work_orders work_orders_created_by_foreign"
pg_dump: creating FK CONSTRAINT "public.work_orders work_orders_pm_policy_id_foreign"
pg_dump: creating FK CONSTRAINT "public.work_orders work_orders_tenant_id_foreign"
pg_dump: creating FK CONSTRAINT "public.wq_compliance wq_compliance_parameter_id_foreign"
pg_dump: creating FK CONSTRAINT "public.wq_compliance wq_compliance_sampling_point_id_foreign"
pg_dump: creating FK CONSTRAINT "public.wq_plan_rules wq_plan_rules_plan_id_foreign"
pg_dump: creating FK CONSTRAINT "public.wq_plans wq_plans_tenant_id_foreign"
pg_dump: creating FK CONSTRAINT "public.wq_qc_controls wq_qc_controls_parameter_id_foreign"
pg_dump: creating FK CONSTRAINT "public.wq_qc_controls wq_qc_controls_sample_id_foreign"
ADE;


--
-- TOC entry 5463 (class 2606 OID 337186)
-- Name: wo_parts wo_parts_part_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.wo_parts
    ADD CONSTRAINT wo_parts_part_id_foreign FOREIGN KEY (part_id) REFERENCES public.parts(id) ON DELETE CASCADE;


--
-- TOC entry 5464 (class 2606 OID 337181)
-- Name: wo_parts wo_parts_work_order_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.wo_parts
    ADD CONSTRAINT wo_parts_work_order_id_foreign FOREIGN KEY (work_order_id) REFERENCES public.work_orders(id) ON DELETE CASCADE;


--
-- TOC entry 5454 (class 2606 OID 337104)
-- Name: work_orders work_orders_asset_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.work_orders
    ADD CONSTRAINT work_orders_asset_id_foreign FOREIGN KEY (asset_id) REFERENCES public.assets(id) ON DELETE SET NULL;


--
-- TOC entry 5455 (class 2606 OID 337114)
-- Name: work_orders work_orders_assigned_to_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.work_orders
    ADD CONSTRAINT work_orders_assigned_to_foreign FOREIGN KEY (assigned_to) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- TOC entry 5456 (class 2606 OID 337109)
-- Name: work_orders work_orders_created_by_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.work_orders
    ADD CONSTRAINT work_orders_created_by_foreign FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE RESTRICT;


--
-- TOC entry 5457 (class 2606 OID 337119)
-- Name: work_orders work_orders_pm_policy_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.work_orders
    ADD CONSTRAINT work_orders_pm_policy_id_foreign FOREIGN KEY (pm_policy_id) REFERENCES public.pm_policies(id) ON DELETE SET NULL;


--
-- TOC entry 5458 (class 2606 OID 337099)
-- Name: work_orders work_orders_tenant_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.work_orders
    ADD CONSTRAINT work_orders_tenant_id_foreign FOREIGN KEY (tenant_id) REFERENCES public.organizations(id) ON DELETE CASCADE;


--
-- TOC entry 5512 (class 2606 OID 338018)
-- Name: wq_compliance wq_compliance_parameter_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.wq_compliance
    ADD CONSTRAINT wq_compliance_parameter_id_foreign FOREIGN KEY (parameter_id) REFERENCES public.wq_parameters(id) ON DELETE CASCADE;


--
-- TOC entry 5513 (class 2606 OID 338013)
-- Name: wq_compliance wq_compliance_sampling_point_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.wq_compliance
    ADD CONSTRAINT wq_compliance_sampling_point_id_foreign FOREIGN KEY (sampling_point_id) REFERENCES public.wq_sampling_points(id) ON DELETE CASCADE;


--
-- TOC entry 5504 (class 2606 OID 337910)
-- Name: wq_plan_rules wq_plan_rules_plan_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.wq_plan_rules
    ADD CONSTRAINT wq_plan_rules_plan_id_foreign FOREIGN KEY (plan_id) REFERENCES public.wq_plans(id) ON DELETE CASCADE;


--
-- TOC entry 5499 (class 2606 OID 337661)
-- Name: wq_plans wq_plans_tenant_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.wq_plans
    ADD CONSTRAINT wq_plans_tenant_id_foreign FOREIGN KEY (tenant_id) REFERENCES public.organizations(id) ON DELETE CASCADE;


--
-- TOC entry 5514 (class 2606 OID 338044)
-- Name: wq_qc_controls wq_qc_controls_parameter_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.wq_qc_controls
    ADD CONSTRAINT wq_qc_controls_parameter_id_foreign FOREIGN KEY (parameter_id) REFERENCES public.wq_parameters(id) ON DELETE CASCADE;


--
-- TOC entry 5515 (class 2606 OID 338039)
-- Name: wq_qc_controls wq_qc_controls_sample_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLEpg_dump: creating FK CONSTRAINT "public.wq_results wq_results_analyst_id_foreign"
pg_dump: creating FK CONSTRAINT "public.wq_results wq_results_sample_param_id_foreign"
pg_dump: creating FK CONSTRAINT "public.wq_sample_params wq_sample_params_parameter_id_foreign"
pg_dump: creating FK CONSTRAINT "public.wq_sample_params wq_sample_params_sample_id_foreign"
pg_dump: creating FK CONSTRAINT "public.wq_samples wq_samples_collected_by_foreign"
pg_dump: creating FK CONSTRAINT "public.wq_samples wq_samples_plan_id_foreign"
pg_dump: creating FK CONSTRAINT "public.wq_samples wq_samples_sampling_point_id_foreign"
pg_dump: creating FK CONSTRAINT "public.wq_sampling_points wq_sampling_points_dma_id_foreign"
pg_dump: creating FK CONSTRAINT "public.wq_sampling_points wq_sampling_points_facility_id_foreign"
pg_dump: creating FK CONSTRAINT "public.wq_sampling_points wq_sampling_points_scheme_id_foreign"
pg_dump: creating FK CONSTRAINT "public.wq_sampling_points wq_sampling_points_tenant_id_foreign"
pg_dump: creating FK CONSTRAINT "public.zones zones_scheme_id_foreign"
 ONLY public.wq_qc_controls
    ADD CONSTRAINT wq_qc_controls_sample_id_foreign FOREIGN KEY (sample_id) REFERENCES public.wq_samples(id) ON DELETE CASCADE;


--
-- TOC entry 5510 (class 2606 OID 337993)
-- Name: wq_results wq_results_analyst_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.wq_results
    ADD CONSTRAINT wq_results_analyst_id_foreign FOREIGN KEY (analyst_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- TOC entry 5511 (class 2606 OID 337988)
-- Name: wq_results wq_results_sample_param_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.wq_results
    ADD CONSTRAINT wq_results_sample_param_id_foreign FOREIGN KEY (sample_param_id) REFERENCES public.wq_sample_params(id) ON DELETE CASCADE;


--
-- TOC entry 5508 (class 2606 OID 337967)
-- Name: wq_sample_params wq_sample_params_parameter_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.wq_sample_params
    ADD CONSTRAINT wq_sample_params_parameter_id_foreign FOREIGN KEY (parameter_id) REFERENCES public.wq_parameters(id) ON DELETE CASCADE;


--
-- TOC entry 5509 (class 2606 OID 337962)
-- Name: wq_sample_params wq_sample_params_sample_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.wq_sample_params
    ADD CONSTRAINT wq_sample_params_sample_id_foreign FOREIGN KEY (sample_id) REFERENCES public.wq_samples(id) ON DELETE CASCADE;


--
-- TOC entry 5505 (class 2606 OID 337938)
-- Name: wq_samples wq_samples_collected_by_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.wq_samples
    ADD CONSTRAINT wq_samples_collected_by_foreign FOREIGN KEY (collected_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- TOC entry 5506 (class 2606 OID 337933)
-- Name: wq_samples wq_samples_plan_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.wq_samples
    ADD CONSTRAINT wq_samples_plan_id_foreign FOREIGN KEY (plan_id) REFERENCES public.wq_plans(id) ON DELETE SET NULL;


--
-- TOC entry 5507 (class 2606 OID 337928)
-- Name: wq_samples wq_samples_sampling_point_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.wq_samples
    ADD CONSTRAINT wq_samples_sampling_point_id_foreign FOREIGN KEY (sampling_point_id) REFERENCES public.wq_sampling_points(id) ON DELETE CASCADE;


--
-- TOC entry 5500 (class 2606 OID 337883)
-- Name: wq_sampling_points wq_sampling_points_dma_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.wq_sampling_points
    ADD CONSTRAINT wq_sampling_points_dma_id_foreign FOREIGN KEY (dma_id) REFERENCES public.dmas(id) ON DELETE SET NULL;


--
-- TOC entry 5501 (class 2606 OID 338053)
-- Name: wq_sampling_points wq_sampling_points_facility_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.wq_sampling_points
    ADD CONSTRAINT wq_sampling_points_facility_id_foreign FOREIGN KEY (facility_id) REFERENCES public.facilities(id) ON DELETE SET NULL;


--
-- TOC entry 5502 (class 2606 OID 337878)
-- Name: wq_sampling_points wq_sampling_points_scheme_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.wq_sampling_points
    ADD CONSTRAINT wq_sampling_points_scheme_id_foreign FOREIGN KEY (scheme_id) REFERENCES public.schemes(id) ON DELETE SET NULL;


--
-- TOC entry 5503 (class 2606 OID 337873)
-- Name: wq_sampling_points wq_sampling_points_tenant_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.wq_sampling_points
    ADD CONSTRAINT wq_sampling_points_tenant_id_foreign FOREIGN KEY (tenant_id) REFERENCES public.organizations(id) ON DELETE CASCADE;


--
-- TOC entry 5388 (class 2606 OID 336083)
-- Name: zones zones_scheme_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.zones
    ADD CONSTRAINT zones_scheme_id_foreipg_dump: creating FK CONSTRAINT "public.zones zones_tenant_id_foreign"
pg_dump: creating DEFAULT ACL "public.DEFAULT PRIVILEGES FOR SEQUENCES"
pg_dump: creating DEFAULT ACL "public.DEFAULT PRIVILEGES FOR TABLES"
gn FOREIGN KEY (scheme_id) REFERENCES public.schemes(id) ON DELETE SET NULL;


--
-- TOC entry 5389 (class 2606 OID 336078)
-- Name: zones zones_tenant_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.zones
    ADD CONSTRAINT zones_tenant_id_foreign FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- TOC entry 3410 (class 826 OID 16394)
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO neon_superuser WITH GRANT OPTION;


--
-- TOC entry 3409 (class 826 OID 16393)
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON TABLES TO neon_superuser WITH GRANT OPTION;


-- Completed on 2025-11-22 20:15:01 UTC

--
-- PostgreSQL database dump complete
--

\unrestrict Xutv7XfT7g2aWg5IDX3THTmgomjFg8hqSclxlKjjc4B5JBtGJuPRwcNMVx7K6S7

