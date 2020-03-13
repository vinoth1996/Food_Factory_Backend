--
-- PostgreSQL database dump
--

-- Dumped from database version 12.1
-- Dumped by pg_dump version 12.1

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

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Food; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Food" (
    name text,
    "createdAt" text,
    cuisine text,
    ingredients text,
    "lotNumber" text,
    "costOfProduction" bigint,
    "sellingCost" bigint
);


ALTER TABLE public."Food" OWNER TO postgres;

--
-- Name: Ingredients; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Ingredients" (
    name text,
    lotnumber text,
    "availableQuantity" bigint,
    "thresholdQuantity" bigint,
    price bigint,
    "vendorName" text,
    "vendorEmail" text
);


ALTER TABLE public."Ingredients" OWNER TO postgres;

--
-- Name: Login; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Login" (
);


ALTER TABLE public."Login" OWNER TO postgres;

--
-- Name: Order; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Order" (
    status text,
    "orderDate" text,
    "dateOfdelivery" text,
    "modeOfTransport" text,
    "orderNum" integer NOT NULL,
    email text,
    food text,
    quantity bigint
);


ALTER TABLE public."Order" OWNER TO postgres;

--
-- Name: Order_orderNum_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Order_orderNum_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Order_orderNum_seq" OWNER TO postgres;

--
-- Name: Order_orderNum_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Order_orderNum_seq" OWNED BY public."Order"."orderNum";


--
-- Name: User; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."User" (
    name text,
    email text,
    password text,
    status text,
    "lastLoginAt" text,
    "createdAt" text,
    "updatedAt" text
);


ALTER TABLE public."User" OWNER TO postgres;

--
-- Name: Order orderNum; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Order" ALTER COLUMN "orderNum" SET DEFAULT nextval('public."Order_orderNum_seq"'::regclass);


--
-- Name: User email; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT email UNIQUE (email);


--
-- Name: Food lotNumber; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Food"
    ADD CONSTRAINT "lotNumber" UNIQUE ("lotNumber");


--
-- Name: Ingredients lotnumber; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Ingredients"
    ADD CONSTRAINT lotnumber UNIQUE (lotnumber);


--
-- PostgreSQL database dump complete
--

