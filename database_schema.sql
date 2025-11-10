--
-- PostgreSQL database dump
--

-- Dumped from database version 16.9 (165f042)
-- Dumped by pg_dump version 16.9

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
-- Name: EXTENSION postgis; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION postgis IS 'PostGIS geometry and geography spatial types and functions';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: actuals; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.actuals (
    id bigint NOT NULL,
    tenant_id uuid NOT NULL,
    cost_center_id bigint NOT NULL,
    gl_account_id bigint NOT NULL,
    project_id bigint,
    scheme_id bigint,
    dma_id bigint,
    class character varying(255),
    period date NOT NULL,
    amount numeric(20,2) NOT NULL,
    source character varying(255) DEFAULT 'manual'::character varying NOT NULL,
    ref character varying(255),
    meta jsonb,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    CONSTRAINT actuals_class_check CHECK (((class)::text = ANY ((ARRAY['domestic'::character varying, 'commercial'::character varying, 'institutional'::character varying, 'kiosk'::character varying])::text[]))),
    CONSTRAINT actuals_source_check CHECK (((source)::text = ANY ((ARRAY['gl'::character varying, 'proc'::character varying, 'cmms'::character varying, 'manual'::character varying])::text[])))
);


--
-- Name: actuals_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.actuals_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: actuals_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.actuals_id_seq OWNED BY public.actuals.id;


--
-- Name: addresses; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: alloc_results; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.alloc_results (
    id bigint NOT NULL,
    run_id bigint NOT NULL,
    gl_account_id bigint NOT NULL,
    cost_center_id bigint NOT NULL,
    scheme_id bigint,
    dma_id bigint,
    class character varying(255),
    period date NOT NULL,
    amount numeric(20,2) NOT NULL,
    driver_value numeric(20,4),
    notes text,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    CONSTRAINT alloc_results_class_check CHECK (((class)::text = ANY ((ARRAY['domestic'::character varying, 'commercial'::character varying, 'institutional'::character varying, 'kiosk'::character varying])::text[])))
);


--
-- Name: alloc_results_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.alloc_results_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: alloc_results_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.alloc_results_id_seq OWNED BY public.alloc_results.id;


--
-- Name: alloc_runs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.alloc_runs (
    id bigint NOT NULL,
    tenant_id uuid NOT NULL,
    version_id bigint,
    forecast_id bigint,
    period_from date NOT NULL,
    period_to date NOT NULL,
    status character varying(255) DEFAULT 'queued'::character varying NOT NULL,
    meta jsonb,
    started_at timestamp(0) without time zone,
    completed_at timestamp(0) without time zone,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    CONSTRAINT alloc_runs_status_check CHECK (((status)::text = ANY ((ARRAY['queued'::character varying, 'running'::character varying, 'done'::character varying, 'failed'::character varying])::text[])))
);


--
-- Name: alloc_runs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.alloc_runs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: alloc_runs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.alloc_runs_id_seq OWNED BY public.alloc_runs.id;


--
-- Name: allocation_rules; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.allocation_rules (
    id bigint NOT NULL,
    tenant_id uuid NOT NULL,
    name character varying(255) NOT NULL,
    basis character varying(255) NOT NULL,
    driver_id bigint,
    percentage numeric(5,2),
    formula text,
    applies_to character varying(255) DEFAULT 'opex'::character varying NOT NULL,
    active boolean DEFAULT true NOT NULL,
    scope_filter jsonb,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    CONSTRAINT allocation_rules_applies_to_check CHECK (((applies_to)::text = ANY ((ARRAY['opex'::character varying, 'capex'::character varying, 'both'::character varying])::text[]))),
    CONSTRAINT allocation_rules_basis_check CHECK (((basis)::text = ANY ((ARRAY['volume'::character varying, 'connections'::character varying, 'km_pipe'::character varying, 'head_kwh'::character varying, 'tickets'::character varying, 'staff_time'::character varying, 'custom_driver'::character varying])::text[])))
);


--
-- Name: allocation_rules_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.allocation_rules_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: allocation_rules_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.allocation_rules_id_seq OWNED BY public.allocation_rules.id;


--
-- Name: api_keys; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: attachments; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: audit_events; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: budget_lines; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.budget_lines (
    id bigint NOT NULL,
    version_id bigint NOT NULL,
    cost_center_id bigint NOT NULL,
    gl_account_id bigint NOT NULL,
    project_id bigint,
    scheme_id bigint,
    dma_id bigint,
    class character varying(255),
    period date NOT NULL,
    amount numeric(20,2) NOT NULL,
    meta jsonb,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    CONSTRAINT budget_lines_class_check CHECK (((class)::text = ANY ((ARRAY['domestic'::character varying, 'commercial'::character varying, 'institutional'::character varying, 'kiosk'::character varying])::text[])))
);


--
-- Name: budget_lines_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.budget_lines_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: budget_lines_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.budget_lines_id_seq OWNED BY public.budget_lines.id;


--
-- Name: budget_versions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.budget_versions (
    id bigint NOT NULL,
    tenant_id uuid NOT NULL,
    name character varying(255) NOT NULL,
    fiscal_year integer NOT NULL,
    status character varying(255) DEFAULT 'draft'::character varying NOT NULL,
    is_rolling boolean DEFAULT false NOT NULL,
    base_version_id bigint,
    approved_by uuid,
    approved_at timestamp(0) without time zone,
    created_by uuid NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    CONSTRAINT budget_versions_status_check CHECK (((status)::text = ANY ((ARRAY['draft'::character varying, 'approved'::character varying, 'revised'::character varying, 'archived'::character varying])::text[])))
);


--
-- Name: budget_versions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.budget_versions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: budget_versions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.budget_versions_id_seq OWNED BY public.budget_versions.id;


--
-- Name: cache; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cache (
    key character varying(255) NOT NULL,
    value text NOT NULL,
    expiration integer NOT NULL
);


--
-- Name: cache_locks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cache_locks (
    key character varying(255) NOT NULL,
    owner character varying(255) NOT NULL,
    expiration integer NOT NULL
);


--
-- Name: chemical_tariffs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.chemical_tariffs (
    id bigint NOT NULL,
    tenant_id uuid NOT NULL,
    name character varying(255) NOT NULL,
    valid_from date NOT NULL,
    valid_to date,
    item_code character varying(50) NOT NULL,
    unit_cost numeric(10,4) NOT NULL,
    unit character varying(20) NOT NULL,
    currency character varying(3) DEFAULT 'KES'::character varying NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


--
-- Name: chemical_tariffs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.chemical_tariffs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: chemical_tariffs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.chemical_tariffs_id_seq OWNED BY public.chemical_tariffs.id;


--
-- Name: consents; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: cost_centers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cost_centers (
    id bigint NOT NULL,
    tenant_id uuid NOT NULL,
    code character varying(50) NOT NULL,
    name character varying(255) NOT NULL,
    parent_id bigint,
    owner_id uuid,
    active boolean DEFAULT true NOT NULL,
    meta jsonb,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    deleted_at timestamp(0) without time zone
);


--
-- Name: cost_centers_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.cost_centers_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: cost_centers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.cost_centers_id_seq OWNED BY public.cost_centers.id;


--
-- Name: cost_to_serve; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cost_to_serve (
    id bigint NOT NULL,
    tenant_id uuid NOT NULL,
    period date NOT NULL,
    scheme_id bigint,
    dma_id bigint,
    class character varying(255),
    production_m3 numeric(20,2) DEFAULT '0'::numeric NOT NULL,
    billed_m3 numeric(20,2) DEFAULT '0'::numeric NOT NULL,
    opex_cost numeric(20,2) DEFAULT '0'::numeric NOT NULL,
    capex_depr numeric(20,2) DEFAULT '0'::numeric NOT NULL,
    energy_kwh numeric(20,2) DEFAULT '0'::numeric NOT NULL,
    energy_cost numeric(20,2) DEFAULT '0'::numeric NOT NULL,
    chemical_cost numeric(20,2) DEFAULT '0'::numeric NOT NULL,
    other_cost numeric(20,2) DEFAULT '0'::numeric NOT NULL,
    cost_per_m3 numeric(20,4) DEFAULT '0'::numeric NOT NULL,
    revenue_per_m3 numeric(20,4) DEFAULT '0'::numeric NOT NULL,
    margin_per_m3 numeric(20,4) DEFAULT '0'::numeric NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    CONSTRAINT cost_to_serve_class_check CHECK (((class)::text = ANY ((ARRAY['domestic'::character varying, 'commercial'::character varying, 'institutional'::character varying, 'kiosk'::character varying])::text[])))
);


--
-- Name: cost_to_serve_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.cost_to_serve_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: cost_to_serve_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.cost_to_serve_id_seq OWNED BY public.cost_to_serve.id;


--
-- Name: data_catalog; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: data_classes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.data_classes (
    id uuid NOT NULL,
    code character varying(255) NOT NULL,
    description text NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


--
-- Name: device_trust; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: dmas; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: driver_values; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.driver_values (
    id bigint NOT NULL,
    driver_id bigint NOT NULL,
    period date NOT NULL,
    value numeric(20,4) NOT NULL,
    scope character varying(255) NOT NULL,
    scope_id bigint,
    meta jsonb,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    CONSTRAINT driver_values_scope_check CHECK (((scope)::text = ANY ((ARRAY['tenant'::character varying, 'scheme'::character varying, 'dma'::character varying, 'class'::character varying])::text[])))
);


--
-- Name: driver_values_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.driver_values_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: driver_values_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.driver_values_id_seq OWNED BY public.driver_values.id;


--
-- Name: drivers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.drivers (
    id bigint NOT NULL,
    tenant_id uuid NOT NULL,
    code character varying(50) NOT NULL,
    name character varying(255) NOT NULL,
    formula text,
    unit character varying(50),
    source character varying(255) NOT NULL,
    params jsonb,
    description text,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    CONSTRAINT drivers_source_check CHECK (((source)::text = ANY ((ARRAY['static'::character varying, 'sql'::character varying, 'api'::character varying])::text[])))
);


--
-- Name: drivers_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.drivers_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: drivers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.drivers_id_seq OWNED BY public.drivers.id;


--
-- Name: dsr_requests; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: encumbrances; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.encumbrances (
    id bigint NOT NULL,
    tenant_id uuid NOT NULL,
    entity_type character varying(255) NOT NULL,
    entity_id bigint NOT NULL,
    cost_center_id bigint NOT NULL,
    period date NOT NULL,
    amount numeric(20,2) NOT NULL,
    released boolean DEFAULT false NOT NULL,
    released_at timestamp(0) without time zone,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    CONSTRAINT encumbrances_entity_type_check CHECK (((entity_type)::text = ANY ((ARRAY['requisition'::character varying, 'po'::character varying, 'contract'::character varying])::text[])))
);


--
-- Name: encumbrances_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.encumbrances_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: encumbrances_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.encumbrances_id_seq OWNED BY public.encumbrances.id;


--
-- Name: energy_tariffs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.energy_tariffs (
    id bigint NOT NULL,
    tenant_id uuid NOT NULL,
    name character varying(255) NOT NULL,
    valid_from date NOT NULL,
    valid_to date,
    peak_rate numeric(10,4) NOT NULL,
    offpeak_rate numeric(10,4) NOT NULL,
    demand_charge numeric(10,4),
    currency character varying(3) DEFAULT 'KES'::character varying NOT NULL,
    meta jsonb,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


--
-- Name: energy_tariffs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.energy_tariffs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: energy_tariffs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.energy_tariffs_id_seq OWNED BY public.energy_tariffs.id;


--
-- Name: facilities; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: failed_jobs; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: failed_jobs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.failed_jobs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: failed_jobs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.failed_jobs_id_seq OWNED BY public.failed_jobs.id;


--
-- Name: forecast_lines; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.forecast_lines (
    id bigint NOT NULL,
    forecast_id bigint NOT NULL,
    cost_center_id bigint NOT NULL,
    gl_account_id bigint NOT NULL,
    scheme_id bigint,
    dma_id bigint,
    class character varying(255),
    period date NOT NULL,
    amount numeric(20,2) NOT NULL,
    method_meta jsonb,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    CONSTRAINT forecast_lines_class_check CHECK (((class)::text = ANY ((ARRAY['domestic'::character varying, 'commercial'::character varying, 'institutional'::character varying, 'kiosk'::character varying])::text[])))
);


--
-- Name: forecast_lines_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.forecast_lines_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: forecast_lines_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.forecast_lines_id_seq OWNED BY public.forecast_lines.id;


--
-- Name: forecasts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.forecasts (
    id bigint NOT NULL,
    tenant_id uuid NOT NULL,
    name character varying(255) NOT NULL,
    method character varying(255) DEFAULT 'manual'::character varying NOT NULL,
    horizon_months integer DEFAULT 12 NOT NULL,
    base_version_id bigint,
    created_by uuid NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    CONSTRAINT forecasts_method_check CHECK (((method)::text = ANY ((ARRAY['manual'::character varying, 'naive'::character varying, 'ets'::character varying, 'arima'::character varying, 'prophet_stub'::character varying])::text[])))
);


--
-- Name: forecasts_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.forecasts_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: forecasts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.forecasts_id_seq OWNED BY public.forecasts.id;


--
-- Name: gl_accounts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.gl_accounts (
    id bigint NOT NULL,
    tenant_id uuid NOT NULL,
    code character varying(50) NOT NULL,
    name character varying(255) NOT NULL,
    type character varying(255) NOT NULL,
    parent_id bigint,
    active boolean DEFAULT true NOT NULL,
    meta jsonb,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    deleted_at timestamp(0) without time zone,
    CONSTRAINT gl_accounts_type_check CHECK (((type)::text = ANY ((ARRAY['revenue'::character varying, 'opex'::character varying, 'capex'::character varying, 'inventory'::character varying, 'cogs'::character varying, 'other'::character varying])::text[])))
);


--
-- Name: gl_accounts_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.gl_accounts_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: gl_accounts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.gl_accounts_id_seq OWNED BY public.gl_accounts.id;


--
-- Name: job_batches; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: jobs; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: jobs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.jobs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: jobs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.jobs_id_seq OWNED BY public.jobs.id;


--
-- Name: kms_keys; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: lookup_values; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.migrations (
    id integer NOT NULL,
    migration character varying(255) NOT NULL,
    batch integer NOT NULL
);


--
-- Name: migrations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.migrations_id_seq OWNED BY public.migrations.id;


--
-- Name: model_has_permissions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.model_has_permissions (
    permission_id bigint NOT NULL,
    model_type character varying(255) NOT NULL,
    model_id bigint NOT NULL
);


--
-- Name: model_has_roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.model_has_roles (
    role_id bigint NOT NULL,
    model_type character varying(255) NOT NULL,
    model_id bigint NOT NULL
);


--
-- Name: organizations; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: password_reset_tokens; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.password_reset_tokens (
    email character varying(255) NOT NULL,
    token character varying(255) NOT NULL,
    created_at timestamp(0) without time zone
);


--
-- Name: permissions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.permissions (
    id bigint NOT NULL,
    name character varying(255) NOT NULL,
    guard_name character varying(255) NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


--
-- Name: permissions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.permissions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: permissions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.permissions_id_seq OWNED BY public.permissions.id;


--
-- Name: personal_access_tokens; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: personal_access_tokens_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.personal_access_tokens_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: personal_access_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.personal_access_tokens_id_seq OWNED BY public.personal_access_tokens.id;


--
-- Name: pipelines; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: retention_policies; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: role_has_permissions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.role_has_permissions (
    permission_id bigint NOT NULL,
    role_id bigint NOT NULL
);


--
-- Name: roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.roles (
    id bigint NOT NULL,
    name character varying(255) NOT NULL,
    guard_name character varying(255) NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


--
-- Name: roles_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.roles_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: roles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.roles_id_seq OWNED BY public.roles.id;


--
-- Name: schemes; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: secrets; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: security_alerts; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sessions (
    id character varying(255) NOT NULL,
    user_id uuid,
    ip_address character varying(45),
    user_agent text,
    payload text NOT NULL,
    last_activity integer NOT NULL
);


--
-- Name: tenants; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: unit_costs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.unit_costs (
    id bigint NOT NULL,
    tenant_id uuid NOT NULL,
    item_code character varying(50) NOT NULL,
    name character varying(255) NOT NULL,
    unit character varying(20) NOT NULL,
    method character varying(255) DEFAULT 'wap'::character varying NOT NULL,
    period date NOT NULL,
    unit_cost numeric(20,4) NOT NULL,
    meta jsonb,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    CONSTRAINT unit_costs_method_check CHECK (((method)::text = ANY ((ARRAY['wap'::character varying, 'fifo'::character varying])::text[])))
);


--
-- Name: unit_costs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.unit_costs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: unit_costs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.unit_costs_id_seq OWNED BY public.unit_costs.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: zones; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: actuals id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.actuals ALTER COLUMN id SET DEFAULT nextval('public.actuals_id_seq'::regclass);


--
-- Name: alloc_results id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.alloc_results ALTER COLUMN id SET DEFAULT nextval('public.alloc_results_id_seq'::regclass);


--
-- Name: alloc_runs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.alloc_runs ALTER COLUMN id SET DEFAULT nextval('public.alloc_runs_id_seq'::regclass);


--
-- Name: allocation_rules id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.allocation_rules ALTER COLUMN id SET DEFAULT nextval('public.allocation_rules_id_seq'::regclass);


--
-- Name: budget_lines id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.budget_lines ALTER COLUMN id SET DEFAULT nextval('public.budget_lines_id_seq'::regclass);


--
-- Name: budget_versions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.budget_versions ALTER COLUMN id SET DEFAULT nextval('public.budget_versions_id_seq'::regclass);


--
-- Name: chemical_tariffs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chemical_tariffs ALTER COLUMN id SET DEFAULT nextval('public.chemical_tariffs_id_seq'::regclass);


--
-- Name: cost_centers id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cost_centers ALTER COLUMN id SET DEFAULT nextval('public.cost_centers_id_seq'::regclass);


--
-- Name: cost_to_serve id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cost_to_serve ALTER COLUMN id SET DEFAULT nextval('public.cost_to_serve_id_seq'::regclass);


--
-- Name: driver_values id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.driver_values ALTER COLUMN id SET DEFAULT nextval('public.driver_values_id_seq'::regclass);


--
-- Name: drivers id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.drivers ALTER COLUMN id SET DEFAULT nextval('public.drivers_id_seq'::regclass);


--
-- Name: encumbrances id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.encumbrances ALTER COLUMN id SET DEFAULT nextval('public.encumbrances_id_seq'::regclass);


--
-- Name: energy_tariffs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.energy_tariffs ALTER COLUMN id SET DEFAULT nextval('public.energy_tariffs_id_seq'::regclass);


--
-- Name: failed_jobs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.failed_jobs ALTER COLUMN id SET DEFAULT nextval('public.failed_jobs_id_seq'::regclass);


--
-- Name: forecast_lines id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.forecast_lines ALTER COLUMN id SET DEFAULT nextval('public.forecast_lines_id_seq'::regclass);


--
-- Name: forecasts id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.forecasts ALTER COLUMN id SET DEFAULT nextval('public.forecasts_id_seq'::regclass);


--
-- Name: gl_accounts id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gl_accounts ALTER COLUMN id SET DEFAULT nextval('public.gl_accounts_id_seq'::regclass);


--
-- Name: jobs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.jobs ALTER COLUMN id SET DEFAULT nextval('public.jobs_id_seq'::regclass);


--
-- Name: migrations id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.migrations ALTER COLUMN id SET DEFAULT nextval('public.migrations_id_seq'::regclass);


--
-- Name: permissions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.permissions ALTER COLUMN id SET DEFAULT nextval('public.permissions_id_seq'::regclass);


--
-- Name: personal_access_tokens id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.personal_access_tokens ALTER COLUMN id SET DEFAULT nextval('public.personal_access_tokens_id_seq'::regclass);


--
-- Name: roles id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roles ALTER COLUMN id SET DEFAULT nextval('public.roles_id_seq'::regclass);


--
-- Name: unit_costs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.unit_costs ALTER COLUMN id SET DEFAULT nextval('public.unit_costs_id_seq'::regclass);


--
-- Name: actuals actuals_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.actuals
    ADD CONSTRAINT actuals_pkey PRIMARY KEY (id);


--
-- Name: addresses addresses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.addresses
    ADD CONSTRAINT addresses_pkey PRIMARY KEY (id);


--
-- Name: alloc_results alloc_results_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.alloc_results
    ADD CONSTRAINT alloc_results_pkey PRIMARY KEY (id);


--
-- Name: alloc_runs alloc_runs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.alloc_runs
    ADD CONSTRAINT alloc_runs_pkey PRIMARY KEY (id);


--
-- Name: allocation_rules allocation_rules_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.allocation_rules
    ADD CONSTRAINT allocation_rules_pkey PRIMARY KEY (id);


--
-- Name: api_keys api_keys_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.api_keys
    ADD CONSTRAINT api_keys_pkey PRIMARY KEY (id);


--
-- Name: attachments attachments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.attachments
    ADD CONSTRAINT attachments_pkey PRIMARY KEY (id);


--
-- Name: audit_events audit_events_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_events
    ADD CONSTRAINT audit_events_pkey PRIMARY KEY (id);


--
-- Name: budget_lines budget_lines_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.budget_lines
    ADD CONSTRAINT budget_lines_pkey PRIMARY KEY (id);


--
-- Name: budget_versions budget_versions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.budget_versions
    ADD CONSTRAINT budget_versions_pkey PRIMARY KEY (id);


--
-- Name: cache_locks cache_locks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cache_locks
    ADD CONSTRAINT cache_locks_pkey PRIMARY KEY (key);


--
-- Name: cache cache_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cache
    ADD CONSTRAINT cache_pkey PRIMARY KEY (key);


--
-- Name: chemical_tariffs chemical_tariffs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chemical_tariffs
    ADD CONSTRAINT chemical_tariffs_pkey PRIMARY KEY (id);


--
-- Name: consents consents_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.consents
    ADD CONSTRAINT consents_pkey PRIMARY KEY (id);


--
-- Name: cost_centers cost_centers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cost_centers
    ADD CONSTRAINT cost_centers_pkey PRIMARY KEY (id);


--
-- Name: cost_centers cost_centers_tenant_id_code_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cost_centers
    ADD CONSTRAINT cost_centers_tenant_id_code_unique UNIQUE (tenant_id, code);


--
-- Name: cost_to_serve cost_to_serve_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cost_to_serve
    ADD CONSTRAINT cost_to_serve_pkey PRIMARY KEY (id);


--
-- Name: data_catalog data_catalog_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.data_catalog
    ADD CONSTRAINT data_catalog_pkey PRIMARY KEY (id);


--
-- Name: data_catalog data_catalog_table_name_column_name_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.data_catalog
    ADD CONSTRAINT data_catalog_table_name_column_name_unique UNIQUE (table_name, column_name);


--
-- Name: data_classes data_classes_code_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.data_classes
    ADD CONSTRAINT data_classes_code_unique UNIQUE (code);


--
-- Name: data_classes data_classes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.data_classes
    ADD CONSTRAINT data_classes_pkey PRIMARY KEY (id);


--
-- Name: device_trust device_trust_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.device_trust
    ADD CONSTRAINT device_trust_pkey PRIMARY KEY (id);


--
-- Name: dmas dmas_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dmas
    ADD CONSTRAINT dmas_pkey PRIMARY KEY (id);


--
-- Name: dmas dmas_tenant_id_code_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dmas
    ADD CONSTRAINT dmas_tenant_id_code_unique UNIQUE (tenant_id, code);


--
-- Name: driver_values driver_values_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.driver_values
    ADD CONSTRAINT driver_values_pkey PRIMARY KEY (id);


--
-- Name: drivers drivers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.drivers
    ADD CONSTRAINT drivers_pkey PRIMARY KEY (id);


--
-- Name: drivers drivers_tenant_id_code_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.drivers
    ADD CONSTRAINT drivers_tenant_id_code_unique UNIQUE (tenant_id, code);


--
-- Name: dsr_requests dsr_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dsr_requests
    ADD CONSTRAINT dsr_requests_pkey PRIMARY KEY (id);


--
-- Name: encumbrances encumbrances_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.encumbrances
    ADD CONSTRAINT encumbrances_pkey PRIMARY KEY (id);


--
-- Name: energy_tariffs energy_tariffs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.energy_tariffs
    ADD CONSTRAINT energy_tariffs_pkey PRIMARY KEY (id);


--
-- Name: facilities facilities_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.facilities
    ADD CONSTRAINT facilities_pkey PRIMARY KEY (id);


--
-- Name: facilities facilities_tenant_id_code_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.facilities
    ADD CONSTRAINT facilities_tenant_id_code_unique UNIQUE (tenant_id, code);


--
-- Name: failed_jobs failed_jobs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.failed_jobs
    ADD CONSTRAINT failed_jobs_pkey PRIMARY KEY (id);


--
-- Name: failed_jobs failed_jobs_uuid_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.failed_jobs
    ADD CONSTRAINT failed_jobs_uuid_unique UNIQUE (uuid);


--
-- Name: forecast_lines forecast_lines_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.forecast_lines
    ADD CONSTRAINT forecast_lines_pkey PRIMARY KEY (id);


--
-- Name: forecasts forecasts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.forecasts
    ADD CONSTRAINT forecasts_pkey PRIMARY KEY (id);


--
-- Name: gl_accounts gl_accounts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gl_accounts
    ADD CONSTRAINT gl_accounts_pkey PRIMARY KEY (id);


--
-- Name: gl_accounts gl_accounts_tenant_id_code_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gl_accounts
    ADD CONSTRAINT gl_accounts_tenant_id_code_unique UNIQUE (tenant_id, code);


--
-- Name: job_batches job_batches_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.job_batches
    ADD CONSTRAINT job_batches_pkey PRIMARY KEY (id);


--
-- Name: jobs jobs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT jobs_pkey PRIMARY KEY (id);


--
-- Name: kms_keys kms_keys_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.kms_keys
    ADD CONSTRAINT kms_keys_pkey PRIMARY KEY (id);


--
-- Name: lookup_values lookup_values_domain_code_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lookup_values
    ADD CONSTRAINT lookup_values_domain_code_unique UNIQUE (domain, code);


--
-- Name: lookup_values lookup_values_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lookup_values
    ADD CONSTRAINT lookup_values_pkey PRIMARY KEY (id);


--
-- Name: migrations migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.migrations
    ADD CONSTRAINT migrations_pkey PRIMARY KEY (id);


--
-- Name: model_has_permissions model_has_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.model_has_permissions
    ADD CONSTRAINT model_has_permissions_pkey PRIMARY KEY (permission_id, model_id, model_type);


--
-- Name: model_has_roles model_has_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.model_has_roles
    ADD CONSTRAINT model_has_roles_pkey PRIMARY KEY (role_id, model_id, model_type);


--
-- Name: organizations organizations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.organizations
    ADD CONSTRAINT organizations_pkey PRIMARY KEY (id);


--
-- Name: organizations organizations_tenant_id_org_code_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.organizations
    ADD CONSTRAINT organizations_tenant_id_org_code_unique UNIQUE (tenant_id, org_code);


--
-- Name: password_reset_tokens password_reset_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT password_reset_tokens_pkey PRIMARY KEY (email);


--
-- Name: permissions permissions_name_guard_name_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_name_guard_name_unique UNIQUE (name, guard_name);


--
-- Name: permissions permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_pkey PRIMARY KEY (id);


--
-- Name: personal_access_tokens personal_access_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.personal_access_tokens
    ADD CONSTRAINT personal_access_tokens_pkey PRIMARY KEY (id);


--
-- Name: personal_access_tokens personal_access_tokens_token_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.personal_access_tokens
    ADD CONSTRAINT personal_access_tokens_token_unique UNIQUE (token);


--
-- Name: pipelines pipelines_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pipelines
    ADD CONSTRAINT pipelines_pkey PRIMARY KEY (id);


--
-- Name: pipelines pipelines_tenant_id_code_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pipelines
    ADD CONSTRAINT pipelines_tenant_id_code_unique UNIQUE (tenant_id, code);


--
-- Name: retention_policies retention_policies_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.retention_policies
    ADD CONSTRAINT retention_policies_pkey PRIMARY KEY (id);


--
-- Name: role_has_permissions role_has_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.role_has_permissions
    ADD CONSTRAINT role_has_permissions_pkey PRIMARY KEY (permission_id, role_id);


--
-- Name: roles roles_name_guard_name_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_name_guard_name_unique UNIQUE (name, guard_name);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- Name: schemes schemes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.schemes
    ADD CONSTRAINT schemes_pkey PRIMARY KEY (id);


--
-- Name: schemes schemes_tenant_id_code_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.schemes
    ADD CONSTRAINT schemes_tenant_id_code_unique UNIQUE (tenant_id, code);


--
-- Name: secrets secrets_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.secrets
    ADD CONSTRAINT secrets_pkey PRIMARY KEY (id);


--
-- Name: secrets secrets_tenant_id_key_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.secrets
    ADD CONSTRAINT secrets_tenant_id_key_unique UNIQUE (tenant_id, key);


--
-- Name: security_alerts security_alerts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.security_alerts
    ADD CONSTRAINT security_alerts_pkey PRIMARY KEY (id);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- Name: tenants tenants_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tenants
    ADD CONSTRAINT tenants_pkey PRIMARY KEY (id);


--
-- Name: tenants tenants_short_code_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tenants
    ADD CONSTRAINT tenants_short_code_unique UNIQUE (short_code);


--
-- Name: unit_costs unit_costs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.unit_costs
    ADD CONSTRAINT unit_costs_pkey PRIMARY KEY (id);


--
-- Name: users users_email_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_unique UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: zones zones_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.zones
    ADD CONSTRAINT zones_pkey PRIMARY KEY (id);


--
-- Name: zones zones_tenant_id_code_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.zones
    ADD CONSTRAINT zones_tenant_id_code_unique UNIQUE (tenant_id, code);


--
-- Name: actuals_cost_center_id_gl_account_id_period_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX actuals_cost_center_id_gl_account_id_period_index ON public.actuals USING btree (cost_center_id, gl_account_id, period);


--
-- Name: actuals_source_ref_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX actuals_source_ref_index ON public.actuals USING btree (source, ref);


--
-- Name: actuals_tenant_id_period_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX actuals_tenant_id_period_index ON public.actuals USING btree (tenant_id, period);


--
-- Name: addresses_location_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX addresses_location_idx ON public.addresses USING gist (location);


--
-- Name: alloc_results_gl_account_id_cost_center_id_period_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX alloc_results_gl_account_id_cost_center_id_period_index ON public.alloc_results USING btree (gl_account_id, cost_center_id, period);


--
-- Name: alloc_results_run_id_period_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX alloc_results_run_id_period_index ON public.alloc_results USING btree (run_id, period);


--
-- Name: alloc_results_scheme_id_period_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX alloc_results_scheme_id_period_index ON public.alloc_results USING btree (scheme_id, period);


--
-- Name: alloc_runs_tenant_id_status_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX alloc_runs_tenant_id_status_index ON public.alloc_runs USING btree (tenant_id, status);


--
-- Name: allocation_rules_tenant_id_active_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX allocation_rules_tenant_id_active_index ON public.allocation_rules USING btree (tenant_id, active);


--
-- Name: api_keys_tenant_id_revoked_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX api_keys_tenant_id_revoked_index ON public.api_keys USING btree (tenant_id, revoked);


--
-- Name: attachments_entity_type_entity_id_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX attachments_entity_type_entity_id_index ON public.attachments USING btree (entity_type, entity_id);


--
-- Name: audit_events_action_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX audit_events_action_index ON public.audit_events USING btree (action);


--
-- Name: audit_events_entity_type_entity_id_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX audit_events_entity_type_entity_id_index ON public.audit_events USING btree (entity_type, entity_id);


--
-- Name: audit_events_tenant_id_occurred_at_actor_id_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX audit_events_tenant_id_occurred_at_actor_id_index ON public.audit_events USING btree (tenant_id, occurred_at, actor_id);


--
-- Name: budget_lines_cost_center_id_gl_account_id_period_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX budget_lines_cost_center_id_gl_account_id_period_index ON public.budget_lines USING btree (cost_center_id, gl_account_id, period);


--
-- Name: budget_lines_dma_id_period_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX budget_lines_dma_id_period_index ON public.budget_lines USING btree (dma_id, period);


--
-- Name: budget_lines_scheme_id_period_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX budget_lines_scheme_id_period_index ON public.budget_lines USING btree (scheme_id, period);


--
-- Name: budget_lines_version_id_period_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX budget_lines_version_id_period_index ON public.budget_lines USING btree (version_id, period);


--
-- Name: budget_versions_tenant_id_fiscal_year_status_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX budget_versions_tenant_id_fiscal_year_status_index ON public.budget_versions USING btree (tenant_id, fiscal_year, status);


--
-- Name: chemical_tariffs_tenant_id_item_code_valid_from_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX chemical_tariffs_tenant_id_item_code_valid_from_index ON public.chemical_tariffs USING btree (tenant_id, item_code, valid_from);


--
-- Name: consents_user_id_granted_at_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX consents_user_id_granted_at_index ON public.consents USING btree (user_id, granted_at);


--
-- Name: cost_centers_code_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX cost_centers_code_index ON public.cost_centers USING btree (code);


--
-- Name: cost_to_serve_dma_id_period_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX cost_to_serve_dma_id_period_index ON public.cost_to_serve USING btree (dma_id, period);


--
-- Name: cost_to_serve_scheme_id_period_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX cost_to_serve_scheme_id_period_index ON public.cost_to_serve USING btree (scheme_id, period);


--
-- Name: cost_to_serve_tenant_id_period_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX cost_to_serve_tenant_id_period_index ON public.cost_to_serve USING btree (tenant_id, period);


--
-- Name: data_catalog_data_class_id_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX data_catalog_data_class_id_index ON public.data_catalog USING btree (data_class_id);


--
-- Name: device_trust_device_fingerprint_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX device_trust_device_fingerprint_index ON public.device_trust USING btree (device_fingerprint);


--
-- Name: device_trust_user_id_revoked_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX device_trust_user_id_revoked_index ON public.device_trust USING btree (user_id, revoked);


--
-- Name: dmas_geom_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX dmas_geom_idx ON public.dmas USING gist (geom);


--
-- Name: driver_values_driver_id_period_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX driver_values_driver_id_period_index ON public.driver_values USING btree (driver_id, period);


--
-- Name: driver_values_driver_id_scope_scope_id_period_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX driver_values_driver_id_scope_scope_id_period_index ON public.driver_values USING btree (driver_id, scope, scope_id, period);


--
-- Name: drivers_code_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX drivers_code_index ON public.drivers USING btree (code);


--
-- Name: dsr_requests_target_user_id_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX dsr_requests_target_user_id_index ON public.dsr_requests USING btree (target_user_id);


--
-- Name: dsr_requests_tenant_id_status_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX dsr_requests_tenant_id_status_index ON public.dsr_requests USING btree (tenant_id, status);


--
-- Name: encumbrances_cost_center_id_period_released_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX encumbrances_cost_center_id_period_released_index ON public.encumbrances USING btree (cost_center_id, period, released);


--
-- Name: encumbrances_tenant_id_entity_type_entity_id_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX encumbrances_tenant_id_entity_type_entity_id_index ON public.encumbrances USING btree (tenant_id, entity_type, entity_id);


--
-- Name: energy_tariffs_tenant_id_valid_from_valid_to_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX energy_tariffs_tenant_id_valid_from_valid_to_index ON public.energy_tariffs USING btree (tenant_id, valid_from, valid_to);


--
-- Name: facilities_location_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX facilities_location_idx ON public.facilities USING gist (location);


--
-- Name: forecast_lines_cost_center_id_gl_account_id_period_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX forecast_lines_cost_center_id_gl_account_id_period_index ON public.forecast_lines USING btree (cost_center_id, gl_account_id, period);


--
-- Name: forecast_lines_forecast_id_period_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX forecast_lines_forecast_id_period_index ON public.forecast_lines USING btree (forecast_id, period);


--
-- Name: forecasts_tenant_id_created_at_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX forecasts_tenant_id_created_at_index ON public.forecasts USING btree (tenant_id, created_at);


--
-- Name: gl_accounts_code_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX gl_accounts_code_index ON public.gl_accounts USING btree (code);


--
-- Name: gl_accounts_tenant_id_type_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX gl_accounts_tenant_id_type_index ON public.gl_accounts USING btree (tenant_id, type);


--
-- Name: jobs_queue_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX jobs_queue_index ON public.jobs USING btree (queue);


--
-- Name: kms_keys_purpose_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX kms_keys_purpose_index ON public.kms_keys USING btree (purpose);


--
-- Name: model_has_permissions_model_id_model_type_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX model_has_permissions_model_id_model_type_index ON public.model_has_permissions USING btree (model_id, model_type);


--
-- Name: model_has_roles_model_id_model_type_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX model_has_roles_model_id_model_type_index ON public.model_has_roles USING btree (model_id, model_type);


--
-- Name: organizations_geom_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX organizations_geom_idx ON public.organizations USING gist (geom);


--
-- Name: personal_access_tokens_expires_at_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX personal_access_tokens_expires_at_index ON public.personal_access_tokens USING btree (expires_at);


--
-- Name: personal_access_tokens_tokenable_type_tokenable_id_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX personal_access_tokens_tokenable_type_tokenable_id_index ON public.personal_access_tokens USING btree (tokenable_type, tokenable_id);


--
-- Name: pipelines_geom_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX pipelines_geom_idx ON public.pipelines USING gist (geom);


--
-- Name: retention_policies_entity_type_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX retention_policies_entity_type_index ON public.retention_policies USING btree (entity_type);


--
-- Name: schemes_centroid_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX schemes_centroid_idx ON public.schemes USING gist (centroid);


--
-- Name: schemes_geom_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX schemes_geom_idx ON public.schemes USING gist (geom);


--
-- Name: security_alerts_category_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX security_alerts_category_index ON public.security_alerts USING btree (category);


--
-- Name: security_alerts_tenant_id_severity_raised_at_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX security_alerts_tenant_id_severity_raised_at_index ON public.security_alerts USING btree (tenant_id, severity, raised_at);


--
-- Name: sessions_last_activity_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX sessions_last_activity_index ON public.sessions USING btree (last_activity);


--
-- Name: sessions_user_id_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX sessions_user_id_index ON public.sessions USING btree (user_id);


--
-- Name: unit_costs_tenant_id_item_code_period_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX unit_costs_tenant_id_item_code_period_index ON public.unit_costs USING btree (tenant_id, item_code, period);


--
-- Name: users_current_tenant_id_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX users_current_tenant_id_index ON public.users USING btree (current_tenant_id);


--
-- Name: zones_geom_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX zones_geom_idx ON public.zones USING gist (geom);


--
-- Name: actuals actuals_cost_center_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.actuals
    ADD CONSTRAINT actuals_cost_center_id_foreign FOREIGN KEY (cost_center_id) REFERENCES public.cost_centers(id);


--
-- Name: actuals actuals_gl_account_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.actuals
    ADD CONSTRAINT actuals_gl_account_id_foreign FOREIGN KEY (gl_account_id) REFERENCES public.gl_accounts(id);


--
-- Name: actuals actuals_tenant_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.actuals
    ADD CONSTRAINT actuals_tenant_id_foreign FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: addresses addresses_scheme_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.addresses
    ADD CONSTRAINT addresses_scheme_id_foreign FOREIGN KEY (scheme_id) REFERENCES public.schemes(id) ON DELETE SET NULL;


--
-- Name: addresses addresses_tenant_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.addresses
    ADD CONSTRAINT addresses_tenant_id_foreign FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: alloc_results alloc_results_cost_center_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.alloc_results
    ADD CONSTRAINT alloc_results_cost_center_id_foreign FOREIGN KEY (cost_center_id) REFERENCES public.cost_centers(id);


--
-- Name: alloc_results alloc_results_gl_account_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.alloc_results
    ADD CONSTRAINT alloc_results_gl_account_id_foreign FOREIGN KEY (gl_account_id) REFERENCES public.gl_accounts(id);


--
-- Name: alloc_results alloc_results_run_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.alloc_results
    ADD CONSTRAINT alloc_results_run_id_foreign FOREIGN KEY (run_id) REFERENCES public.alloc_runs(id) ON DELETE CASCADE;


--
-- Name: alloc_runs alloc_runs_forecast_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.alloc_runs
    ADD CONSTRAINT alloc_runs_forecast_id_foreign FOREIGN KEY (forecast_id) REFERENCES public.forecasts(id) ON DELETE SET NULL;


--
-- Name: alloc_runs alloc_runs_tenant_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.alloc_runs
    ADD CONSTRAINT alloc_runs_tenant_id_foreign FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: alloc_runs alloc_runs_version_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.alloc_runs
    ADD CONSTRAINT alloc_runs_version_id_foreign FOREIGN KEY (version_id) REFERENCES public.budget_versions(id) ON DELETE SET NULL;


--
-- Name: allocation_rules allocation_rules_driver_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.allocation_rules
    ADD CONSTRAINT allocation_rules_driver_id_foreign FOREIGN KEY (driver_id) REFERENCES public.drivers(id) ON DELETE SET NULL;


--
-- Name: allocation_rules allocation_rules_tenant_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.allocation_rules
    ADD CONSTRAINT allocation_rules_tenant_id_foreign FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: api_keys api_keys_created_by_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.api_keys
    ADD CONSTRAINT api_keys_created_by_foreign FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: api_keys api_keys_tenant_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.api_keys
    ADD CONSTRAINT api_keys_tenant_id_foreign FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: attachments attachments_tenant_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.attachments
    ADD CONSTRAINT attachments_tenant_id_foreign FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: audit_events audit_events_tenant_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_events
    ADD CONSTRAINT audit_events_tenant_id_foreign FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: budget_lines budget_lines_cost_center_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.budget_lines
    ADD CONSTRAINT budget_lines_cost_center_id_foreign FOREIGN KEY (cost_center_id) REFERENCES public.cost_centers(id);


--
-- Name: budget_lines budget_lines_gl_account_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.budget_lines
    ADD CONSTRAINT budget_lines_gl_account_id_foreign FOREIGN KEY (gl_account_id) REFERENCES public.gl_accounts(id);


--
-- Name: budget_lines budget_lines_version_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.budget_lines
    ADD CONSTRAINT budget_lines_version_id_foreign FOREIGN KEY (version_id) REFERENCES public.budget_versions(id) ON DELETE CASCADE;


--
-- Name: budget_versions budget_versions_approved_by_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.budget_versions
    ADD CONSTRAINT budget_versions_approved_by_foreign FOREIGN KEY (approved_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: budget_versions budget_versions_base_version_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.budget_versions
    ADD CONSTRAINT budget_versions_base_version_id_foreign FOREIGN KEY (base_version_id) REFERENCES public.budget_versions(id) ON DELETE SET NULL;


--
-- Name: budget_versions budget_versions_created_by_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.budget_versions
    ADD CONSTRAINT budget_versions_created_by_foreign FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: budget_versions budget_versions_tenant_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.budget_versions
    ADD CONSTRAINT budget_versions_tenant_id_foreign FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: chemical_tariffs chemical_tariffs_tenant_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chemical_tariffs
    ADD CONSTRAINT chemical_tariffs_tenant_id_foreign FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: consents consents_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.consents
    ADD CONSTRAINT consents_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: cost_centers cost_centers_owner_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cost_centers
    ADD CONSTRAINT cost_centers_owner_id_foreign FOREIGN KEY (owner_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: cost_centers cost_centers_parent_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cost_centers
    ADD CONSTRAINT cost_centers_parent_id_foreign FOREIGN KEY (parent_id) REFERENCES public.cost_centers(id) ON DELETE CASCADE;


--
-- Name: cost_centers cost_centers_tenant_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cost_centers
    ADD CONSTRAINT cost_centers_tenant_id_foreign FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: cost_to_serve cost_to_serve_tenant_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cost_to_serve
    ADD CONSTRAINT cost_to_serve_tenant_id_foreign FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: data_catalog data_catalog_data_class_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.data_catalog
    ADD CONSTRAINT data_catalog_data_class_id_foreign FOREIGN KEY (data_class_id) REFERENCES public.data_classes(id) ON DELETE CASCADE;


--
-- Name: device_trust device_trust_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.device_trust
    ADD CONSTRAINT device_trust_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: dmas dmas_scheme_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dmas
    ADD CONSTRAINT dmas_scheme_id_foreign FOREIGN KEY (scheme_id) REFERENCES public.schemes(id) ON DELETE CASCADE;


--
-- Name: dmas dmas_tenant_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dmas
    ADD CONSTRAINT dmas_tenant_id_foreign FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: driver_values driver_values_driver_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.driver_values
    ADD CONSTRAINT driver_values_driver_id_foreign FOREIGN KEY (driver_id) REFERENCES public.drivers(id) ON DELETE CASCADE;


--
-- Name: drivers drivers_tenant_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.drivers
    ADD CONSTRAINT drivers_tenant_id_foreign FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: dsr_requests dsr_requests_requester_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dsr_requests
    ADD CONSTRAINT dsr_requests_requester_id_foreign FOREIGN KEY (requester_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: dsr_requests dsr_requests_target_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dsr_requests
    ADD CONSTRAINT dsr_requests_target_user_id_foreign FOREIGN KEY (target_user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: dsr_requests dsr_requests_tenant_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dsr_requests
    ADD CONSTRAINT dsr_requests_tenant_id_foreign FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: encumbrances encumbrances_cost_center_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.encumbrances
    ADD CONSTRAINT encumbrances_cost_center_id_foreign FOREIGN KEY (cost_center_id) REFERENCES public.cost_centers(id);


--
-- Name: encumbrances encumbrances_tenant_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.encumbrances
    ADD CONSTRAINT encumbrances_tenant_id_foreign FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: energy_tariffs energy_tariffs_tenant_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.energy_tariffs
    ADD CONSTRAINT energy_tariffs_tenant_id_foreign FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: facilities facilities_scheme_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.facilities
    ADD CONSTRAINT facilities_scheme_id_foreign FOREIGN KEY (scheme_id) REFERENCES public.schemes(id) ON DELETE CASCADE;


--
-- Name: facilities facilities_tenant_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.facilities
    ADD CONSTRAINT facilities_tenant_id_foreign FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: forecast_lines forecast_lines_cost_center_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.forecast_lines
    ADD CONSTRAINT forecast_lines_cost_center_id_foreign FOREIGN KEY (cost_center_id) REFERENCES public.cost_centers(id);


--
-- Name: forecast_lines forecast_lines_forecast_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.forecast_lines
    ADD CONSTRAINT forecast_lines_forecast_id_foreign FOREIGN KEY (forecast_id) REFERENCES public.forecasts(id) ON DELETE CASCADE;


--
-- Name: forecast_lines forecast_lines_gl_account_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.forecast_lines
    ADD CONSTRAINT forecast_lines_gl_account_id_foreign FOREIGN KEY (gl_account_id) REFERENCES public.gl_accounts(id);


--
-- Name: forecasts forecasts_base_version_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.forecasts
    ADD CONSTRAINT forecasts_base_version_id_foreign FOREIGN KEY (base_version_id) REFERENCES public.budget_versions(id) ON DELETE SET NULL;


--
-- Name: forecasts forecasts_created_by_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.forecasts
    ADD CONSTRAINT forecasts_created_by_foreign FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: forecasts forecasts_tenant_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.forecasts
    ADD CONSTRAINT forecasts_tenant_id_foreign FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: gl_accounts gl_accounts_parent_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gl_accounts
    ADD CONSTRAINT gl_accounts_parent_id_foreign FOREIGN KEY (parent_id) REFERENCES public.gl_accounts(id) ON DELETE CASCADE;


--
-- Name: gl_accounts gl_accounts_tenant_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gl_accounts
    ADD CONSTRAINT gl_accounts_tenant_id_foreign FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: model_has_permissions model_has_permissions_permission_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.model_has_permissions
    ADD CONSTRAINT model_has_permissions_permission_id_foreign FOREIGN KEY (permission_id) REFERENCES public.permissions(id) ON DELETE CASCADE;


--
-- Name: model_has_roles model_has_roles_role_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.model_has_roles
    ADD CONSTRAINT model_has_roles_role_id_foreign FOREIGN KEY (role_id) REFERENCES public.roles(id) ON DELETE CASCADE;


--
-- Name: organizations organizations_tenant_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.organizations
    ADD CONSTRAINT organizations_tenant_id_foreign FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: pipelines pipelines_scheme_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pipelines
    ADD CONSTRAINT pipelines_scheme_id_foreign FOREIGN KEY (scheme_id) REFERENCES public.schemes(id) ON DELETE CASCADE;


--
-- Name: pipelines pipelines_tenant_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pipelines
    ADD CONSTRAINT pipelines_tenant_id_foreign FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: role_has_permissions role_has_permissions_permission_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.role_has_permissions
    ADD CONSTRAINT role_has_permissions_permission_id_foreign FOREIGN KEY (permission_id) REFERENCES public.permissions(id) ON DELETE CASCADE;


--
-- Name: role_has_permissions role_has_permissions_role_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.role_has_permissions
    ADD CONSTRAINT role_has_permissions_role_id_foreign FOREIGN KEY (role_id) REFERENCES public.roles(id) ON DELETE CASCADE;


--
-- Name: schemes schemes_org_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.schemes
    ADD CONSTRAINT schemes_org_id_foreign FOREIGN KEY (org_id) REFERENCES public.organizations(id) ON DELETE SET NULL;


--
-- Name: schemes schemes_tenant_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.schemes
    ADD CONSTRAINT schemes_tenant_id_foreign FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: secrets secrets_created_by_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.secrets
    ADD CONSTRAINT secrets_created_by_foreign FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: secrets secrets_tenant_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.secrets
    ADD CONSTRAINT secrets_tenant_id_foreign FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: security_alerts security_alerts_tenant_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.security_alerts
    ADD CONSTRAINT security_alerts_tenant_id_foreign FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: unit_costs unit_costs_tenant_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.unit_costs
    ADD CONSTRAINT unit_costs_tenant_id_foreign FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: zones zones_scheme_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.zones
    ADD CONSTRAINT zones_scheme_id_foreign FOREIGN KEY (scheme_id) REFERENCES public.schemes(id) ON DELETE SET NULL;


--
-- Name: zones zones_tenant_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.zones
    ADD CONSTRAINT zones_tenant_id_foreign FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

--
-- PostgreSQL database dump
--

-- Dumped from database version 16.9 (165f042)
-- Dumped by pg_dump version 16.9

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
-- Name: EXTENSION postgis; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION postgis IS 'PostGIS geometry and geography spatial types and functions';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: actuals; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.actuals (
    id bigint NOT NULL,
    tenant_id uuid NOT NULL,
    cost_center_id bigint NOT NULL,
    gl_account_id bigint NOT NULL,
    project_id bigint,
    scheme_id bigint,
    dma_id bigint,
    class character varying(255),
    period date NOT NULL,
    amount numeric(20,2) NOT NULL,
    source character varying(255) DEFAULT 'manual'::character varying NOT NULL,
    ref character varying(255),
    meta jsonb,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    CONSTRAINT actuals_class_check CHECK (((class)::text = ANY ((ARRAY['domestic'::character varying, 'commercial'::character varying, 'institutional'::character varying, 'kiosk'::character varying])::text[]))),
    CONSTRAINT actuals_source_check CHECK (((source)::text = ANY ((ARRAY['gl'::character varying, 'proc'::character varying, 'cmms'::character varying, 'manual'::character varying])::text[])))
);


--
-- Name: actuals_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.actuals_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: actuals_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.actuals_id_seq OWNED BY public.actuals.id;


--
-- Name: addresses; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: alloc_results; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.alloc_results (
    id bigint NOT NULL,
    run_id bigint NOT NULL,
    gl_account_id bigint NOT NULL,
    cost_center_id bigint NOT NULL,
    scheme_id bigint,
    dma_id bigint,
    class character varying(255),
    period date NOT NULL,
    amount numeric(20,2) NOT NULL,
    driver_value numeric(20,4),
    notes text,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    CONSTRAINT alloc_results_class_check CHECK (((class)::text = ANY ((ARRAY['domestic'::character varying, 'commercial'::character varying, 'institutional'::character varying, 'kiosk'::character varying])::text[])))
);


--
-- Name: alloc_results_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.alloc_results_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: alloc_results_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.alloc_results_id_seq OWNED BY public.alloc_results.id;


--
-- Name: alloc_runs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.alloc_runs (
    id bigint NOT NULL,
    tenant_id uuid NOT NULL,
    version_id bigint,
    forecast_id bigint,
    period_from date NOT NULL,
    period_to date NOT NULL,
    status character varying(255) DEFAULT 'queued'::character varying NOT NULL,
    meta jsonb,
    started_at timestamp(0) without time zone,
    completed_at timestamp(0) without time zone,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    CONSTRAINT alloc_runs_status_check CHECK (((status)::text = ANY ((ARRAY['queued'::character varying, 'running'::character varying, 'done'::character varying, 'failed'::character varying])::text[])))
);


--
-- Name: alloc_runs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.alloc_runs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: alloc_runs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.alloc_runs_id_seq OWNED BY public.alloc_runs.id;


--
-- Name: allocation_rules; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.allocation_rules (
    id bigint NOT NULL,
    tenant_id uuid NOT NULL,
    name character varying(255) NOT NULL,
    basis character varying(255) NOT NULL,
    driver_id bigint,
    percentage numeric(5,2),
    formula text,
    applies_to character varying(255) DEFAULT 'opex'::character varying NOT NULL,
    active boolean DEFAULT true NOT NULL,
    scope_filter jsonb,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    CONSTRAINT allocation_rules_applies_to_check CHECK (((applies_to)::text = ANY ((ARRAY['opex'::character varying, 'capex'::character varying, 'both'::character varying])::text[]))),
    CONSTRAINT allocation_rules_basis_check CHECK (((basis)::text = ANY ((ARRAY['volume'::character varying, 'connections'::character varying, 'km_pipe'::character varying, 'head_kwh'::character varying, 'tickets'::character varying, 'staff_time'::character varying, 'custom_driver'::character varying])::text[])))
);


--
-- Name: allocation_rules_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.allocation_rules_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: allocation_rules_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.allocation_rules_id_seq OWNED BY public.allocation_rules.id;


--
-- Name: api_keys; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: attachments; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: audit_events; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: budget_lines; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.budget_lines (
    id bigint NOT NULL,
    version_id bigint NOT NULL,
    cost_center_id bigint NOT NULL,
    gl_account_id bigint NOT NULL,
    project_id bigint,
    scheme_id bigint,
    dma_id bigint,
    class character varying(255),
    period date NOT NULL,
    amount numeric(20,2) NOT NULL,
    meta jsonb,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    CONSTRAINT budget_lines_class_check CHECK (((class)::text = ANY ((ARRAY['domestic'::character varying, 'commercial'::character varying, 'institutional'::character varying, 'kiosk'::character varying])::text[])))
);


--
-- Name: budget_lines_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.budget_lines_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: budget_lines_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.budget_lines_id_seq OWNED BY public.budget_lines.id;


--
-- Name: budget_versions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.budget_versions (
    id bigint NOT NULL,
    tenant_id uuid NOT NULL,
    name character varying(255) NOT NULL,
    fiscal_year integer NOT NULL,
    status character varying(255) DEFAULT 'draft'::character varying NOT NULL,
    is_rolling boolean DEFAULT false NOT NULL,
    base_version_id bigint,
    approved_by uuid,
    approved_at timestamp(0) without time zone,
    created_by uuid NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    CONSTRAINT budget_versions_status_check CHECK (((status)::text = ANY ((ARRAY['draft'::character varying, 'approved'::character varying, 'revised'::character varying, 'archived'::character varying])::text[])))
);


--
-- Name: budget_versions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.budget_versions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: budget_versions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.budget_versions_id_seq OWNED BY public.budget_versions.id;


--
-- Name: cache; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cache (
    key character varying(255) NOT NULL,
    value text NOT NULL,
    expiration integer NOT NULL
);


--
-- Name: cache_locks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cache_locks (
    key character varying(255) NOT NULL,
    owner character varying(255) NOT NULL,
    expiration integer NOT NULL
);


--
-- Name: chemical_tariffs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.chemical_tariffs (
    id bigint NOT NULL,
    tenant_id uuid NOT NULL,
    name character varying(255) NOT NULL,
    valid_from date NOT NULL,
    valid_to date,
    item_code character varying(50) NOT NULL,
    unit_cost numeric(10,4) NOT NULL,
    unit character varying(20) NOT NULL,
    currency character varying(3) DEFAULT 'KES'::character varying NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


--
-- Name: chemical_tariffs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.chemical_tariffs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: chemical_tariffs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.chemical_tariffs_id_seq OWNED BY public.chemical_tariffs.id;


--
-- Name: consents; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: cost_centers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cost_centers (
    id bigint NOT NULL,
    tenant_id uuid NOT NULL,
    code character varying(50) NOT NULL,
    name character varying(255) NOT NULL,
    parent_id bigint,
    owner_id uuid,
    active boolean DEFAULT true NOT NULL,
    meta jsonb,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    deleted_at timestamp(0) without time zone
);


--
-- Name: cost_centers_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.cost_centers_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: cost_centers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.cost_centers_id_seq OWNED BY public.cost_centers.id;


--
-- Name: cost_to_serve; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cost_to_serve (
    id bigint NOT NULL,
    tenant_id uuid NOT NULL,
    period date NOT NULL,
    scheme_id bigint,
    dma_id bigint,
    class character varying(255),
    production_m3 numeric(20,2) DEFAULT '0'::numeric NOT NULL,
    billed_m3 numeric(20,2) DEFAULT '0'::numeric NOT NULL,
    opex_cost numeric(20,2) DEFAULT '0'::numeric NOT NULL,
    capex_depr numeric(20,2) DEFAULT '0'::numeric NOT NULL,
    energy_kwh numeric(20,2) DEFAULT '0'::numeric NOT NULL,
    energy_cost numeric(20,2) DEFAULT '0'::numeric NOT NULL,
    chemical_cost numeric(20,2) DEFAULT '0'::numeric NOT NULL,
    other_cost numeric(20,2) DEFAULT '0'::numeric NOT NULL,
    cost_per_m3 numeric(20,4) DEFAULT '0'::numeric NOT NULL,
    revenue_per_m3 numeric(20,4) DEFAULT '0'::numeric NOT NULL,
    margin_per_m3 numeric(20,4) DEFAULT '0'::numeric NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    CONSTRAINT cost_to_serve_class_check CHECK (((class)::text = ANY ((ARRAY['domestic'::character varying, 'commercial'::character varying, 'institutional'::character varying, 'kiosk'::character varying])::text[])))
);


--
-- Name: cost_to_serve_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.cost_to_serve_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: cost_to_serve_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.cost_to_serve_id_seq OWNED BY public.cost_to_serve.id;


--
-- Name: data_catalog; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: data_classes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.data_classes (
    id uuid NOT NULL,
    code character varying(255) NOT NULL,
    description text NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


--
-- Name: device_trust; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: dmas; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: driver_values; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.driver_values (
    id bigint NOT NULL,
    driver_id bigint NOT NULL,
    period date NOT NULL,
    value numeric(20,4) NOT NULL,
    scope character varying(255) NOT NULL,
    scope_id bigint,
    meta jsonb,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    CONSTRAINT driver_values_scope_check CHECK (((scope)::text = ANY ((ARRAY['tenant'::character varying, 'scheme'::character varying, 'dma'::character varying, 'class'::character varying])::text[])))
);


--
-- Name: driver_values_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.driver_values_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: driver_values_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.driver_values_id_seq OWNED BY public.driver_values.id;


--
-- Name: drivers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.drivers (
    id bigint NOT NULL,
    tenant_id uuid NOT NULL,
    code character varying(50) NOT NULL,
    name character varying(255) NOT NULL,
    formula text,
    unit character varying(50),
    source character varying(255) NOT NULL,
    params jsonb,
    description text,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    CONSTRAINT drivers_source_check CHECK (((source)::text = ANY ((ARRAY['static'::character varying, 'sql'::character varying, 'api'::character varying])::text[])))
);


--
-- Name: drivers_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.drivers_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: drivers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.drivers_id_seq OWNED BY public.drivers.id;


--
-- Name: dsr_requests; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: encumbrances; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.encumbrances (
    id bigint NOT NULL,
    tenant_id uuid NOT NULL,
    entity_type character varying(255) NOT NULL,
    entity_id bigint NOT NULL,
    cost_center_id bigint NOT NULL,
    period date NOT NULL,
    amount numeric(20,2) NOT NULL,
    released boolean DEFAULT false NOT NULL,
    released_at timestamp(0) without time zone,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    CONSTRAINT encumbrances_entity_type_check CHECK (((entity_type)::text = ANY ((ARRAY['requisition'::character varying, 'po'::character varying, 'contract'::character varying])::text[])))
);


--
-- Name: encumbrances_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.encumbrances_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: encumbrances_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.encumbrances_id_seq OWNED BY public.encumbrances.id;


--
-- Name: energy_tariffs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.energy_tariffs (
    id bigint NOT NULL,
    tenant_id uuid NOT NULL,
    name character varying(255) NOT NULL,
    valid_from date NOT NULL,
    valid_to date,
    peak_rate numeric(10,4) NOT NULL,
    offpeak_rate numeric(10,4) NOT NULL,
    demand_charge numeric(10,4),
    currency character varying(3) DEFAULT 'KES'::character varying NOT NULL,
    meta jsonb,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


--
-- Name: energy_tariffs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.energy_tariffs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: energy_tariffs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.energy_tariffs_id_seq OWNED BY public.energy_tariffs.id;


--
-- Name: facilities; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: failed_jobs; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: failed_jobs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.failed_jobs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: failed_jobs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.failed_jobs_id_seq OWNED BY public.failed_jobs.id;


--
-- Name: forecast_lines; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.forecast_lines (
    id bigint NOT NULL,
    forecast_id bigint NOT NULL,
    cost_center_id bigint NOT NULL,
    gl_account_id bigint NOT NULL,
    scheme_id bigint,
    dma_id bigint,
    class character varying(255),
    period date NOT NULL,
    amount numeric(20,2) NOT NULL,
    method_meta jsonb,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    CONSTRAINT forecast_lines_class_check CHECK (((class)::text = ANY ((ARRAY['domestic'::character varying, 'commercial'::character varying, 'institutional'::character varying, 'kiosk'::character varying])::text[])))
);


--
-- Name: forecast_lines_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.forecast_lines_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: forecast_lines_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.forecast_lines_id_seq OWNED BY public.forecast_lines.id;


--
-- Name: forecasts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.forecasts (
    id bigint NOT NULL,
    tenant_id uuid NOT NULL,
    name character varying(255) NOT NULL,
    method character varying(255) DEFAULT 'manual'::character varying NOT NULL,
    horizon_months integer DEFAULT 12 NOT NULL,
    base_version_id bigint,
    created_by uuid NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    CONSTRAINT forecasts_method_check CHECK (((method)::text = ANY ((ARRAY['manual'::character varying, 'naive'::character varying, 'ets'::character varying, 'arima'::character varying, 'prophet_stub'::character varying])::text[])))
);


--
-- Name: forecasts_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.forecasts_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: forecasts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.forecasts_id_seq OWNED BY public.forecasts.id;


--
-- Name: gl_accounts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.gl_accounts (
    id bigint NOT NULL,
    tenant_id uuid NOT NULL,
    code character varying(50) NOT NULL,
    name character varying(255) NOT NULL,
    type character varying(255) NOT NULL,
    parent_id bigint,
    active boolean DEFAULT true NOT NULL,
    meta jsonb,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    deleted_at timestamp(0) without time zone,
    CONSTRAINT gl_accounts_type_check CHECK (((type)::text = ANY ((ARRAY['revenue'::character varying, 'opex'::character varying, 'capex'::character varying, 'inventory'::character varying, 'cogs'::character varying, 'other'::character varying])::text[])))
);


--
-- Name: gl_accounts_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.gl_accounts_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: gl_accounts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.gl_accounts_id_seq OWNED BY public.gl_accounts.id;


--
-- Name: job_batches; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: jobs; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: jobs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.jobs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: jobs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.jobs_id_seq OWNED BY public.jobs.id;


--
-- Name: kms_keys; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: lookup_values; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.migrations (
    id integer NOT NULL,
    migration character varying(255) NOT NULL,
    batch integer NOT NULL
);


--
-- Name: migrations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.migrations_id_seq OWNED BY public.migrations.id;


--
-- Name: model_has_permissions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.model_has_permissions (
    permission_id bigint NOT NULL,
    model_type character varying(255) NOT NULL,
    model_id bigint NOT NULL
);


--
-- Name: model_has_roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.model_has_roles (
    role_id bigint NOT NULL,
    model_type character varying(255) NOT NULL,
    model_id bigint NOT NULL
);


--
-- Name: organizations; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: password_reset_tokens; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.password_reset_tokens (
    email character varying(255) NOT NULL,
    token character varying(255) NOT NULL,
    created_at timestamp(0) without time zone
);


--
-- Name: permissions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.permissions (
    id bigint NOT NULL,
    name character varying(255) NOT NULL,
    guard_name character varying(255) NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


--
-- Name: permissions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.permissions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: permissions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.permissions_id_seq OWNED BY public.permissions.id;


--
-- Name: personal_access_tokens; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: personal_access_tokens_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.personal_access_tokens_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: personal_access_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.personal_access_tokens_id_seq OWNED BY public.personal_access_tokens.id;


--
-- Name: pipelines; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: retention_policies; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: role_has_permissions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.role_has_permissions (
    permission_id bigint NOT NULL,
    role_id bigint NOT NULL
);


--
-- Name: roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.roles (
    id bigint NOT NULL,
    name character varying(255) NOT NULL,
    guard_name character varying(255) NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


--
-- Name: roles_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.roles_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: roles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.roles_id_seq OWNED BY public.roles.id;


--
-- Name: schemes; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: secrets; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: security_alerts; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sessions (
    id character varying(255) NOT NULL,
    user_id uuid,
    ip_address character varying(45),
    user_agent text,
    payload text NOT NULL,
    last_activity integer NOT NULL
);


--
-- Name: tenants; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: unit_costs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.unit_costs (
    id bigint NOT NULL,
    tenant_id uuid NOT NULL,
    item_code character varying(50) NOT NULL,
    name character varying(255) NOT NULL,
    unit character varying(20) NOT NULL,
    method character varying(255) DEFAULT 'wap'::character varying NOT NULL,
    period date NOT NULL,
    unit_cost numeric(20,4) NOT NULL,
    meta jsonb,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    CONSTRAINT unit_costs_method_check CHECK (((method)::text = ANY ((ARRAY['wap'::character varying, 'fifo'::character varying])::text[])))
);


--
-- Name: unit_costs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.unit_costs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: unit_costs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.unit_costs_id_seq OWNED BY public.unit_costs.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: zones; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: actuals id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.actuals ALTER COLUMN id SET DEFAULT nextval('public.actuals_id_seq'::regclass);


--
-- Name: alloc_results id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.alloc_results ALTER COLUMN id SET DEFAULT nextval('public.alloc_results_id_seq'::regclass);


--
-- Name: alloc_runs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.alloc_runs ALTER COLUMN id SET DEFAULT nextval('public.alloc_runs_id_seq'::regclass);


--
-- Name: allocation_rules id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.allocation_rules ALTER COLUMN id SET DEFAULT nextval('public.allocation_rules_id_seq'::regclass);


--
-- Name: budget_lines id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.budget_lines ALTER COLUMN id SET DEFAULT nextval('public.budget_lines_id_seq'::regclass);


--
-- Name: budget_versions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.budget_versions ALTER COLUMN id SET DEFAULT nextval('public.budget_versions_id_seq'::regclass);


--
-- Name: chemical_tariffs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chemical_tariffs ALTER COLUMN id SET DEFAULT nextval('public.chemical_tariffs_id_seq'::regclass);


--
-- Name: cost_centers id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cost_centers ALTER COLUMN id SET DEFAULT nextval('public.cost_centers_id_seq'::regclass);


--
-- Name: cost_to_serve id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cost_to_serve ALTER COLUMN id SET DEFAULT nextval('public.cost_to_serve_id_seq'::regclass);


--
-- Name: driver_values id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.driver_values ALTER COLUMN id SET DEFAULT nextval('public.driver_values_id_seq'::regclass);


--
-- Name: drivers id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.drivers ALTER COLUMN id SET DEFAULT nextval('public.drivers_id_seq'::regclass);


--
-- Name: encumbrances id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.encumbrances ALTER COLUMN id SET DEFAULT nextval('public.encumbrances_id_seq'::regclass);


--
-- Name: energy_tariffs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.energy_tariffs ALTER COLUMN id SET DEFAULT nextval('public.energy_tariffs_id_seq'::regclass);


--
-- Name: failed_jobs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.failed_jobs ALTER COLUMN id SET DEFAULT nextval('public.failed_jobs_id_seq'::regclass);


--
-- Name: forecast_lines id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.forecast_lines ALTER COLUMN id SET DEFAULT nextval('public.forecast_lines_id_seq'::regclass);


--
-- Name: forecasts id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.forecasts ALTER COLUMN id SET DEFAULT nextval('public.forecasts_id_seq'::regclass);


--
-- Name: gl_accounts id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gl_accounts ALTER COLUMN id SET DEFAULT nextval('public.gl_accounts_id_seq'::regclass);


--
-- Name: jobs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.jobs ALTER COLUMN id SET DEFAULT nextval('public.jobs_id_seq'::regclass);


--
-- Name: migrations id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.migrations ALTER COLUMN id SET DEFAULT nextval('public.migrations_id_seq'::regclass);


--
-- Name: permissions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.permissions ALTER COLUMN id SET DEFAULT nextval('public.permissions_id_seq'::regclass);


--
-- Name: personal_access_tokens id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.personal_access_tokens ALTER COLUMN id SET DEFAULT nextval('public.personal_access_tokens_id_seq'::regclass);


--
-- Name: roles id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roles ALTER COLUMN id SET DEFAULT nextval('public.roles_id_seq'::regclass);


--
-- Name: unit_costs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.unit_costs ALTER COLUMN id SET DEFAULT nextval('public.unit_costs_id_seq'::regclass);


--
-- Name: actuals actuals_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.actuals
    ADD CONSTRAINT actuals_pkey PRIMARY KEY (id);


--
-- Name: addresses addresses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.addresses
    ADD CONSTRAINT addresses_pkey PRIMARY KEY (id);


--
-- Name: alloc_results alloc_results_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.alloc_results
    ADD CONSTRAINT alloc_results_pkey PRIMARY KEY (id);


--
-- Name: alloc_runs alloc_runs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.alloc_runs
    ADD CONSTRAINT alloc_runs_pkey PRIMARY KEY (id);


--
-- Name: allocation_rules allocation_rules_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.allocation_rules
    ADD CONSTRAINT allocation_rules_pkey PRIMARY KEY (id);


--
-- Name: api_keys api_keys_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.api_keys
    ADD CONSTRAINT api_keys_pkey PRIMARY KEY (id);


--
-- Name: attachments attachments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.attachments
    ADD CONSTRAINT attachments_pkey PRIMARY KEY (id);


--
-- Name: audit_events audit_events_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_events
    ADD CONSTRAINT audit_events_pkey PRIMARY KEY (id);


--
-- Name: budget_lines budget_lines_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.budget_lines
    ADD CONSTRAINT budget_lines_pkey PRIMARY KEY (id);


--
-- Name: budget_versions budget_versions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.budget_versions
    ADD CONSTRAINT budget_versions_pkey PRIMARY KEY (id);


--
-- Name: cache_locks cache_locks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cache_locks
    ADD CONSTRAINT cache_locks_pkey PRIMARY KEY (key);


--
-- Name: cache cache_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cache
    ADD CONSTRAINT cache_pkey PRIMARY KEY (key);


--
-- Name: chemical_tariffs chemical_tariffs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chemical_tariffs
    ADD CONSTRAINT chemical_tariffs_pkey PRIMARY KEY (id);


--
-- Name: consents consents_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.consents
    ADD CONSTRAINT consents_pkey PRIMARY KEY (id);


--
-- Name: cost_centers cost_centers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cost_centers
    ADD CONSTRAINT cost_centers_pkey PRIMARY KEY (id);


--
-- Name: cost_centers cost_centers_tenant_id_code_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cost_centers
    ADD CONSTRAINT cost_centers_tenant_id_code_unique UNIQUE (tenant_id, code);


--
-- Name: cost_to_serve cost_to_serve_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cost_to_serve
    ADD CONSTRAINT cost_to_serve_pkey PRIMARY KEY (id);


--
-- Name: data_catalog data_catalog_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.data_catalog
    ADD CONSTRAINT data_catalog_pkey PRIMARY KEY (id);


--
-- Name: data_catalog data_catalog_table_name_column_name_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.data_catalog
    ADD CONSTRAINT data_catalog_table_name_column_name_unique UNIQUE (table_name, column_name);


--
-- Name: data_classes data_classes_code_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.data_classes
    ADD CONSTRAINT data_classes_code_unique UNIQUE (code);


--
-- Name: data_classes data_classes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.data_classes
    ADD CONSTRAINT data_classes_pkey PRIMARY KEY (id);


--
-- Name: device_trust device_trust_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.device_trust
    ADD CONSTRAINT device_trust_pkey PRIMARY KEY (id);


--
-- Name: dmas dmas_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dmas
    ADD CONSTRAINT dmas_pkey PRIMARY KEY (id);


--
-- Name: dmas dmas_tenant_id_code_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dmas
    ADD CONSTRAINT dmas_tenant_id_code_unique UNIQUE (tenant_id, code);


--
-- Name: driver_values driver_values_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.driver_values
    ADD CONSTRAINT driver_values_pkey PRIMARY KEY (id);


--
-- Name: drivers drivers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.drivers
    ADD CONSTRAINT drivers_pkey PRIMARY KEY (id);


--
-- Name: drivers drivers_tenant_id_code_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.drivers
    ADD CONSTRAINT drivers_tenant_id_code_unique UNIQUE (tenant_id, code);


--
-- Name: dsr_requests dsr_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dsr_requests
    ADD CONSTRAINT dsr_requests_pkey PRIMARY KEY (id);


--
-- Name: encumbrances encumbrances_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.encumbrances
    ADD CONSTRAINT encumbrances_pkey PRIMARY KEY (id);


--
-- Name: energy_tariffs energy_tariffs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.energy_tariffs
    ADD CONSTRAINT energy_tariffs_pkey PRIMARY KEY (id);


--
-- Name: facilities facilities_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.facilities
    ADD CONSTRAINT facilities_pkey PRIMARY KEY (id);


--
-- Name: facilities facilities_tenant_id_code_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.facilities
    ADD CONSTRAINT facilities_tenant_id_code_unique UNIQUE (tenant_id, code);


--
-- Name: failed_jobs failed_jobs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.failed_jobs
    ADD CONSTRAINT failed_jobs_pkey PRIMARY KEY (id);


--
-- Name: failed_jobs failed_jobs_uuid_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.failed_jobs
    ADD CONSTRAINT failed_jobs_uuid_unique UNIQUE (uuid);


--
-- Name: forecast_lines forecast_lines_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.forecast_lines
    ADD CONSTRAINT forecast_lines_pkey PRIMARY KEY (id);


--
-- Name: forecasts forecasts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.forecasts
    ADD CONSTRAINT forecasts_pkey PRIMARY KEY (id);


--
-- Name: gl_accounts gl_accounts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gl_accounts
    ADD CONSTRAINT gl_accounts_pkey PRIMARY KEY (id);


--
-- Name: gl_accounts gl_accounts_tenant_id_code_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gl_accounts
    ADD CONSTRAINT gl_accounts_tenant_id_code_unique UNIQUE (tenant_id, code);


--
-- Name: job_batches job_batches_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.job_batches
    ADD CONSTRAINT job_batches_pkey PRIMARY KEY (id);


--
-- Name: jobs jobs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT jobs_pkey PRIMARY KEY (id);


--
-- Name: kms_keys kms_keys_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.kms_keys
    ADD CONSTRAINT kms_keys_pkey PRIMARY KEY (id);


--
-- Name: lookup_values lookup_values_domain_code_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lookup_values
    ADD CONSTRAINT lookup_values_domain_code_unique UNIQUE (domain, code);


--
-- Name: lookup_values lookup_values_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lookup_values
    ADD CONSTRAINT lookup_values_pkey PRIMARY KEY (id);


--
-- Name: migrations migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.migrations
    ADD CONSTRAINT migrations_pkey PRIMARY KEY (id);


--
-- Name: model_has_permissions model_has_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.model_has_permissions
    ADD CONSTRAINT model_has_permissions_pkey PRIMARY KEY (permission_id, model_id, model_type);


--
-- Name: model_has_roles model_has_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.model_has_roles
    ADD CONSTRAINT model_has_roles_pkey PRIMARY KEY (role_id, model_id, model_type);


--
-- Name: organizations organizations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.organizations
    ADD CONSTRAINT organizations_pkey PRIMARY KEY (id);


--
-- Name: organizations organizations_tenant_id_org_code_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.organizations
    ADD CONSTRAINT organizations_tenant_id_org_code_unique UNIQUE (tenant_id, org_code);


--
-- Name: password_reset_tokens password_reset_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT password_reset_tokens_pkey PRIMARY KEY (email);


--
-- Name: permissions permissions_name_guard_name_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_name_guard_name_unique UNIQUE (name, guard_name);


--
-- Name: permissions permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_pkey PRIMARY KEY (id);


--
-- Name: personal_access_tokens personal_access_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.personal_access_tokens
    ADD CONSTRAINT personal_access_tokens_pkey PRIMARY KEY (id);


--
-- Name: personal_access_tokens personal_access_tokens_token_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.personal_access_tokens
    ADD CONSTRAINT personal_access_tokens_token_unique UNIQUE (token);


--
-- Name: pipelines pipelines_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pipelines
    ADD CONSTRAINT pipelines_pkey PRIMARY KEY (id);


--
-- Name: pipelines pipelines_tenant_id_code_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pipelines
    ADD CONSTRAINT pipelines_tenant_id_code_unique UNIQUE (tenant_id, code);


--
-- Name: retention_policies retention_policies_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.retention_policies
    ADD CONSTRAINT retention_policies_pkey PRIMARY KEY (id);


--
-- Name: role_has_permissions role_has_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.role_has_permissions
    ADD CONSTRAINT role_has_permissions_pkey PRIMARY KEY (permission_id, role_id);


--
-- Name: roles roles_name_guard_name_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_name_guard_name_unique UNIQUE (name, guard_name);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- Name: schemes schemes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.schemes
    ADD CONSTRAINT schemes_pkey PRIMARY KEY (id);


--
-- Name: schemes schemes_tenant_id_code_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.schemes
    ADD CONSTRAINT schemes_tenant_id_code_unique UNIQUE (tenant_id, code);


--
-- Name: secrets secrets_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.secrets
    ADD CONSTRAINT secrets_pkey PRIMARY KEY (id);


--
-- Name: secrets secrets_tenant_id_key_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.secrets
    ADD CONSTRAINT secrets_tenant_id_key_unique UNIQUE (tenant_id, key);


--
-- Name: security_alerts security_alerts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.security_alerts
    ADD CONSTRAINT security_alerts_pkey PRIMARY KEY (id);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- Name: tenants tenants_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tenants
    ADD CONSTRAINT tenants_pkey PRIMARY KEY (id);


--
-- Name: tenants tenants_short_code_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tenants
    ADD CONSTRAINT tenants_short_code_unique UNIQUE (short_code);


--
-- Name: unit_costs unit_costs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.unit_costs
    ADD CONSTRAINT unit_costs_pkey PRIMARY KEY (id);


--
-- Name: users users_email_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_unique UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: zones zones_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.zones
    ADD CONSTRAINT zones_pkey PRIMARY KEY (id);


--
-- Name: zones zones_tenant_id_code_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.zones
    ADD CONSTRAINT zones_tenant_id_code_unique UNIQUE (tenant_id, code);


--
-- Name: actuals_cost_center_id_gl_account_id_period_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX actuals_cost_center_id_gl_account_id_period_index ON public.actuals USING btree (cost_center_id, gl_account_id, period);


--
-- Name: actuals_source_ref_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX actuals_source_ref_index ON public.actuals USING btree (source, ref);


--
-- Name: actuals_tenant_id_period_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX actuals_tenant_id_period_index ON public.actuals USING btree (tenant_id, period);


--
-- Name: addresses_location_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX addresses_location_idx ON public.addresses USING gist (location);


--
-- Name: alloc_results_gl_account_id_cost_center_id_period_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX alloc_results_gl_account_id_cost_center_id_period_index ON public.alloc_results USING btree (gl_account_id, cost_center_id, period);


--
-- Name: alloc_results_run_id_period_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX alloc_results_run_id_period_index ON public.alloc_results USING btree (run_id, period);


--
-- Name: alloc_results_scheme_id_period_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX alloc_results_scheme_id_period_index ON public.alloc_results USING btree (scheme_id, period);


--
-- Name: alloc_runs_tenant_id_status_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX alloc_runs_tenant_id_status_index ON public.alloc_runs USING btree (tenant_id, status);


--
-- Name: allocation_rules_tenant_id_active_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX allocation_rules_tenant_id_active_index ON public.allocation_rules USING btree (tenant_id, active);


--
-- Name: api_keys_tenant_id_revoked_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX api_keys_tenant_id_revoked_index ON public.api_keys USING btree (tenant_id, revoked);


--
-- Name: attachments_entity_type_entity_id_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX attachments_entity_type_entity_id_index ON public.attachments USING btree (entity_type, entity_id);


--
-- Name: audit_events_action_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX audit_events_action_index ON public.audit_events USING btree (action);


--
-- Name: audit_events_entity_type_entity_id_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX audit_events_entity_type_entity_id_index ON public.audit_events USING btree (entity_type, entity_id);


--
-- Name: audit_events_tenant_id_occurred_at_actor_id_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX audit_events_tenant_id_occurred_at_actor_id_index ON public.audit_events USING btree (tenant_id, occurred_at, actor_id);


--
-- Name: budget_lines_cost_center_id_gl_account_id_period_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX budget_lines_cost_center_id_gl_account_id_period_index ON public.budget_lines USING btree (cost_center_id, gl_account_id, period);


--
-- Name: budget_lines_dma_id_period_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX budget_lines_dma_id_period_index ON public.budget_lines USING btree (dma_id, period);


--
-- Name: budget_lines_scheme_id_period_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX budget_lines_scheme_id_period_index ON public.budget_lines USING btree (scheme_id, period);


--
-- Name: budget_lines_version_id_period_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX budget_lines_version_id_period_index ON public.budget_lines USING btree (version_id, period);


--
-- Name: budget_versions_tenant_id_fiscal_year_status_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX budget_versions_tenant_id_fiscal_year_status_index ON public.budget_versions USING btree (tenant_id, fiscal_year, status);


--
-- Name: chemical_tariffs_tenant_id_item_code_valid_from_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX chemical_tariffs_tenant_id_item_code_valid_from_index ON public.chemical_tariffs USING btree (tenant_id, item_code, valid_from);


--
-- Name: consents_user_id_granted_at_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX consents_user_id_granted_at_index ON public.consents USING btree (user_id, granted_at);


--
-- Name: cost_centers_code_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX cost_centers_code_index ON public.cost_centers USING btree (code);


--
-- Name: cost_to_serve_dma_id_period_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX cost_to_serve_dma_id_period_index ON public.cost_to_serve USING btree (dma_id, period);


--
-- Name: cost_to_serve_scheme_id_period_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX cost_to_serve_scheme_id_period_index ON public.cost_to_serve USING btree (scheme_id, period);


--
-- Name: cost_to_serve_tenant_id_period_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX cost_to_serve_tenant_id_period_index ON public.cost_to_serve USING btree (tenant_id, period);


--
-- Name: data_catalog_data_class_id_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX data_catalog_data_class_id_index ON public.data_catalog USING btree (data_class_id);


--
-- Name: device_trust_device_fingerprint_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX device_trust_device_fingerprint_index ON public.device_trust USING btree (device_fingerprint);


--
-- Name: device_trust_user_id_revoked_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX device_trust_user_id_revoked_index ON public.device_trust USING btree (user_id, revoked);


--
-- Name: dmas_geom_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX dmas_geom_idx ON public.dmas USING gist (geom);


--
-- Name: driver_values_driver_id_period_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX driver_values_driver_id_period_index ON public.driver_values USING btree (driver_id, period);


--
-- Name: driver_values_driver_id_scope_scope_id_period_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX driver_values_driver_id_scope_scope_id_period_index ON public.driver_values USING btree (driver_id, scope, scope_id, period);


--
-- Name: drivers_code_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX drivers_code_index ON public.drivers USING btree (code);


--
-- Name: dsr_requests_target_user_id_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX dsr_requests_target_user_id_index ON public.dsr_requests USING btree (target_user_id);


--
-- Name: dsr_requests_tenant_id_status_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX dsr_requests_tenant_id_status_index ON public.dsr_requests USING btree (tenant_id, status);


--
-- Name: encumbrances_cost_center_id_period_released_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX encumbrances_cost_center_id_period_released_index ON public.encumbrances USING btree (cost_center_id, period, released);


--
-- Name: encumbrances_tenant_id_entity_type_entity_id_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX encumbrances_tenant_id_entity_type_entity_id_index ON public.encumbrances USING btree (tenant_id, entity_type, entity_id);


--
-- Name: energy_tariffs_tenant_id_valid_from_valid_to_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX energy_tariffs_tenant_id_valid_from_valid_to_index ON public.energy_tariffs USING btree (tenant_id, valid_from, valid_to);


--
-- Name: facilities_location_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX facilities_location_idx ON public.facilities USING gist (location);


--
-- Name: forecast_lines_cost_center_id_gl_account_id_period_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX forecast_lines_cost_center_id_gl_account_id_period_index ON public.forecast_lines USING btree (cost_center_id, gl_account_id, period);


--
-- Name: forecast_lines_forecast_id_period_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX forecast_lines_forecast_id_period_index ON public.forecast_lines USING btree (forecast_id, period);


--
-- Name: forecasts_tenant_id_created_at_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX forecasts_tenant_id_created_at_index ON public.forecasts USING btree (tenant_id, created_at);


--
-- Name: gl_accounts_code_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX gl_accounts_code_index ON public.gl_accounts USING btree (code);


--
-- Name: gl_accounts_tenant_id_type_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX gl_accounts_tenant_id_type_index ON public.gl_accounts USING btree (tenant_id, type);


--
-- Name: jobs_queue_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX jobs_queue_index ON public.jobs USING btree (queue);


--
-- Name: kms_keys_purpose_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX kms_keys_purpose_index ON public.kms_keys USING btree (purpose);


--
-- Name: model_has_permissions_model_id_model_type_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX model_has_permissions_model_id_model_type_index ON public.model_has_permissions USING btree (model_id, model_type);


--
-- Name: model_has_roles_model_id_model_type_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX model_has_roles_model_id_model_type_index ON public.model_has_roles USING btree (model_id, model_type);


--
-- Name: organizations_geom_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX organizations_geom_idx ON public.organizations USING gist (geom);


--
-- Name: personal_access_tokens_expires_at_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX personal_access_tokens_expires_at_index ON public.personal_access_tokens USING btree (expires_at);


--
-- Name: personal_access_tokens_tokenable_type_tokenable_id_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX personal_access_tokens_tokenable_type_tokenable_id_index ON public.personal_access_tokens USING btree (tokenable_type, tokenable_id);


--
-- Name: pipelines_geom_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX pipelines_geom_idx ON public.pipelines USING gist (geom);


--
-- Name: retention_policies_entity_type_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX retention_policies_entity_type_index ON public.retention_policies USING btree (entity_type);


--
-- Name: schemes_centroid_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX schemes_centroid_idx ON public.schemes USING gist (centroid);


--
-- Name: schemes_geom_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX schemes_geom_idx ON public.schemes USING gist (geom);


--
-- Name: security_alerts_category_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX security_alerts_category_index ON public.security_alerts USING btree (category);


--
-- Name: security_alerts_tenant_id_severity_raised_at_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX security_alerts_tenant_id_severity_raised_at_index ON public.security_alerts USING btree (tenant_id, severity, raised_at);


--
-- Name: sessions_last_activity_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX sessions_last_activity_index ON public.sessions USING btree (last_activity);


--
-- Name: sessions_user_id_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX sessions_user_id_index ON public.sessions USING btree (user_id);


--
-- Name: unit_costs_tenant_id_item_code_period_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX unit_costs_tenant_id_item_code_period_index ON public.unit_costs USING btree (tenant_id, item_code, period);


--
-- Name: users_current_tenant_id_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX users_current_tenant_id_index ON public.users USING btree (current_tenant_id);


--
-- Name: zones_geom_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX zones_geom_idx ON public.zones USING gist (geom);


--
-- Name: actuals actuals_cost_center_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.actuals
    ADD CONSTRAINT actuals_cost_center_id_foreign FOREIGN KEY (cost_center_id) REFERENCES public.cost_centers(id);


--
-- Name: actuals actuals_gl_account_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.actuals
    ADD CONSTRAINT actuals_gl_account_id_foreign FOREIGN KEY (gl_account_id) REFERENCES public.gl_accounts(id);


--
-- Name: actuals actuals_tenant_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.actuals
    ADD CONSTRAINT actuals_tenant_id_foreign FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: addresses addresses_scheme_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.addresses
    ADD CONSTRAINT addresses_scheme_id_foreign FOREIGN KEY (scheme_id) REFERENCES public.schemes(id) ON DELETE SET NULL;


--
-- Name: addresses addresses_tenant_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.addresses
    ADD CONSTRAINT addresses_tenant_id_foreign FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: alloc_results alloc_results_cost_center_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.alloc_results
    ADD CONSTRAINT alloc_results_cost_center_id_foreign FOREIGN KEY (cost_center_id) REFERENCES public.cost_centers(id);


--
-- Name: alloc_results alloc_results_gl_account_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.alloc_results
    ADD CONSTRAINT alloc_results_gl_account_id_foreign FOREIGN KEY (gl_account_id) REFERENCES public.gl_accounts(id);


--
-- Name: alloc_results alloc_results_run_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.alloc_results
    ADD CONSTRAINT alloc_results_run_id_foreign FOREIGN KEY (run_id) REFERENCES public.alloc_runs(id) ON DELETE CASCADE;


--
-- Name: alloc_runs alloc_runs_forecast_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.alloc_runs
    ADD CONSTRAINT alloc_runs_forecast_id_foreign FOREIGN KEY (forecast_id) REFERENCES public.forecasts(id) ON DELETE SET NULL;


--
-- Name: alloc_runs alloc_runs_tenant_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.alloc_runs
    ADD CONSTRAINT alloc_runs_tenant_id_foreign FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: alloc_runs alloc_runs_version_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.alloc_runs
    ADD CONSTRAINT alloc_runs_version_id_foreign FOREIGN KEY (version_id) REFERENCES public.budget_versions(id) ON DELETE SET NULL;


--
-- Name: allocation_rules allocation_rules_driver_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.allocation_rules
    ADD CONSTRAINT allocation_rules_driver_id_foreign FOREIGN KEY (driver_id) REFERENCES public.drivers(id) ON DELETE SET NULL;


--
-- Name: allocation_rules allocation_rules_tenant_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.allocation_rules
    ADD CONSTRAINT allocation_rules_tenant_id_foreign FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: api_keys api_keys_created_by_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.api_keys
    ADD CONSTRAINT api_keys_created_by_foreign FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: api_keys api_keys_tenant_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.api_keys
    ADD CONSTRAINT api_keys_tenant_id_foreign FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: attachments attachments_tenant_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.attachments
    ADD CONSTRAINT attachments_tenant_id_foreign FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: audit_events audit_events_tenant_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_events
    ADD CONSTRAINT audit_events_tenant_id_foreign FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: budget_lines budget_lines_cost_center_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.budget_lines
    ADD CONSTRAINT budget_lines_cost_center_id_foreign FOREIGN KEY (cost_center_id) REFERENCES public.cost_centers(id);


--
-- Name: budget_lines budget_lines_gl_account_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.budget_lines
    ADD CONSTRAINT budget_lines_gl_account_id_foreign FOREIGN KEY (gl_account_id) REFERENCES public.gl_accounts(id);


--
-- Name: budget_lines budget_lines_version_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.budget_lines
    ADD CONSTRAINT budget_lines_version_id_foreign FOREIGN KEY (version_id) REFERENCES public.budget_versions(id) ON DELETE CASCADE;


--
-- Name: budget_versions budget_versions_approved_by_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.budget_versions
    ADD CONSTRAINT budget_versions_approved_by_foreign FOREIGN KEY (approved_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: budget_versions budget_versions_base_version_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.budget_versions
    ADD CONSTRAINT budget_versions_base_version_id_foreign FOREIGN KEY (base_version_id) REFERENCES public.budget_versions(id) ON DELETE SET NULL;


--
-- Name: budget_versions budget_versions_created_by_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.budget_versions
    ADD CONSTRAINT budget_versions_created_by_foreign FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: budget_versions budget_versions_tenant_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.budget_versions
    ADD CONSTRAINT budget_versions_tenant_id_foreign FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: chemical_tariffs chemical_tariffs_tenant_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chemical_tariffs
    ADD CONSTRAINT chemical_tariffs_tenant_id_foreign FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: consents consents_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.consents
    ADD CONSTRAINT consents_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: cost_centers cost_centers_owner_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cost_centers
    ADD CONSTRAINT cost_centers_owner_id_foreign FOREIGN KEY (owner_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: cost_centers cost_centers_parent_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cost_centers
    ADD CONSTRAINT cost_centers_parent_id_foreign FOREIGN KEY (parent_id) REFERENCES public.cost_centers(id) ON DELETE CASCADE;


--
-- Name: cost_centers cost_centers_tenant_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cost_centers
    ADD CONSTRAINT cost_centers_tenant_id_foreign FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: cost_to_serve cost_to_serve_tenant_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cost_to_serve
    ADD CONSTRAINT cost_to_serve_tenant_id_foreign FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: data_catalog data_catalog_data_class_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.data_catalog
    ADD CONSTRAINT data_catalog_data_class_id_foreign FOREIGN KEY (data_class_id) REFERENCES public.data_classes(id) ON DELETE CASCADE;


--
-- Name: device_trust device_trust_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.device_trust
    ADD CONSTRAINT device_trust_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: dmas dmas_scheme_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dmas
    ADD CONSTRAINT dmas_scheme_id_foreign FOREIGN KEY (scheme_id) REFERENCES public.schemes(id) ON DELETE CASCADE;


--
-- Name: dmas dmas_tenant_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dmas
    ADD CONSTRAINT dmas_tenant_id_foreign FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: driver_values driver_values_driver_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.driver_values
    ADD CONSTRAINT driver_values_driver_id_foreign FOREIGN KEY (driver_id) REFERENCES public.drivers(id) ON DELETE CASCADE;


--
-- Name: drivers drivers_tenant_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.drivers
    ADD CONSTRAINT drivers_tenant_id_foreign FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: dsr_requests dsr_requests_requester_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dsr_requests
    ADD CONSTRAINT dsr_requests_requester_id_foreign FOREIGN KEY (requester_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: dsr_requests dsr_requests_target_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dsr_requests
    ADD CONSTRAINT dsr_requests_target_user_id_foreign FOREIGN KEY (target_user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: dsr_requests dsr_requests_tenant_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dsr_requests
    ADD CONSTRAINT dsr_requests_tenant_id_foreign FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: encumbrances encumbrances_cost_center_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.encumbrances
    ADD CONSTRAINT encumbrances_cost_center_id_foreign FOREIGN KEY (cost_center_id) REFERENCES public.cost_centers(id);


--
-- Name: encumbrances encumbrances_tenant_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.encumbrances
    ADD CONSTRAINT encumbrances_tenant_id_foreign FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: energy_tariffs energy_tariffs_tenant_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.energy_tariffs
    ADD CONSTRAINT energy_tariffs_tenant_id_foreign FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: facilities facilities_scheme_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.facilities
    ADD CONSTRAINT facilities_scheme_id_foreign FOREIGN KEY (scheme_id) REFERENCES public.schemes(id) ON DELETE CASCADE;


--
-- Name: facilities facilities_tenant_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.facilities
    ADD CONSTRAINT facilities_tenant_id_foreign FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: forecast_lines forecast_lines_cost_center_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.forecast_lines
    ADD CONSTRAINT forecast_lines_cost_center_id_foreign FOREIGN KEY (cost_center_id) REFERENCES public.cost_centers(id);


--
-- Name: forecast_lines forecast_lines_forecast_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.forecast_lines
    ADD CONSTRAINT forecast_lines_forecast_id_foreign FOREIGN KEY (forecast_id) REFERENCES public.forecasts(id) ON DELETE CASCADE;


--
-- Name: forecast_lines forecast_lines_gl_account_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.forecast_lines
    ADD CONSTRAINT forecast_lines_gl_account_id_foreign FOREIGN KEY (gl_account_id) REFERENCES public.gl_accounts(id);


--
-- Name: forecasts forecasts_base_version_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.forecasts
    ADD CONSTRAINT forecasts_base_version_id_foreign FOREIGN KEY (base_version_id) REFERENCES public.budget_versions(id) ON DELETE SET NULL;


--
-- Name: forecasts forecasts_created_by_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.forecasts
    ADD CONSTRAINT forecasts_created_by_foreign FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: forecasts forecasts_tenant_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.forecasts
    ADD CONSTRAINT forecasts_tenant_id_foreign FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: gl_accounts gl_accounts_parent_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gl_accounts
    ADD CONSTRAINT gl_accounts_parent_id_foreign FOREIGN KEY (parent_id) REFERENCES public.gl_accounts(id) ON DELETE CASCADE;


--
-- Name: gl_accounts gl_accounts_tenant_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gl_accounts
    ADD CONSTRAINT gl_accounts_tenant_id_foreign FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: model_has_permissions model_has_permissions_permission_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.model_has_permissions
    ADD CONSTRAINT model_has_permissions_permission_id_foreign FOREIGN KEY (permission_id) REFERENCES public.permissions(id) ON DELETE CASCADE;


--
-- Name: model_has_roles model_has_roles_role_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.model_has_roles
    ADD CONSTRAINT model_has_roles_role_id_foreign FOREIGN KEY (role_id) REFERENCES public.roles(id) ON DELETE CASCADE;


--
-- Name: organizations organizations_tenant_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.organizations
    ADD CONSTRAINT organizations_tenant_id_foreign FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: pipelines pipelines_scheme_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pipelines
    ADD CONSTRAINT pipelines_scheme_id_foreign FOREIGN KEY (scheme_id) REFERENCES public.schemes(id) ON DELETE CASCADE;


--
-- Name: pipelines pipelines_tenant_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pipelines
    ADD CONSTRAINT pipelines_tenant_id_foreign FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: role_has_permissions role_has_permissions_permission_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.role_has_permissions
    ADD CONSTRAINT role_has_permissions_permission_id_foreign FOREIGN KEY (permission_id) REFERENCES public.permissions(id) ON DELETE CASCADE;


--
-- Name: role_has_permissions role_has_permissions_role_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.role_has_permissions
    ADD CONSTRAINT role_has_permissions_role_id_foreign FOREIGN KEY (role_id) REFERENCES public.roles(id) ON DELETE CASCADE;


--
-- Name: schemes schemes_org_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.schemes
    ADD CONSTRAINT schemes_org_id_foreign FOREIGN KEY (org_id) REFERENCES public.organizations(id) ON DELETE SET NULL;


--
-- Name: schemes schemes_tenant_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.schemes
    ADD CONSTRAINT schemes_tenant_id_foreign FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: secrets secrets_created_by_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.secrets
    ADD CONSTRAINT secrets_created_by_foreign FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: secrets secrets_tenant_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.secrets
    ADD CONSTRAINT secrets_tenant_id_foreign FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: security_alerts security_alerts_tenant_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.security_alerts
    ADD CONSTRAINT security_alerts_tenant_id_foreign FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: unit_costs unit_costs_tenant_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.unit_costs
    ADD CONSTRAINT unit_costs_tenant_id_foreign FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: zones zones_scheme_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.zones
    ADD CONSTRAINT zones_scheme_id_foreign FOREIGN KEY (scheme_id) REFERENCES public.schemes(id) ON DELETE SET NULL;


--
-- Name: zones zones_tenant_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.zones
    ADD CONSTRAINT zones_tenant_id_foreign FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

--
-- PostgreSQL database dump
--

-- Dumped from database version 16.9 (165f042)
-- Dumped by pg_dump version 16.9

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
-- Data for Name: migrations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.migrations (id, migration, batch) FROM stdin;
1	0001_01_01_000000_create_users_table	1
2	0001_01_01_000001_create_cache_table	1
3	0001_01_01_000002_create_jobs_table	1
4	2025_10_28_105028_create_core_registry_tables	1
5	2025_11_07_124144_create_permission_tables	1
6	2025_11_07_124145_create_personal_access_tokens_table	1
7	2025_11_07_124152_create_security_and_compliance_tables	1
8	2025_11_10_060000_create_costing_master_tables	2
9	2025_11_10_060100_create_budgets_forecasts_tables	3
10	2025_11_10_060200_create_actuals_encumbrances_tables	4
11	2025_11_10_060300_create_tariffs_allocations_tables	5
\.


--
-- Name: migrations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.migrations_id_seq', 11, true);


--
-- PostgreSQL database dump complete
--

