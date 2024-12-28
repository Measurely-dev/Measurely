--
-- PostgreSQL database dump
--

-- Dumped from database version 16.4 (Debian 16.4-1.pgdg120+2)
-- Dumped by pg_dump version 16.3

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
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: accountrecovery; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.accountrecovery (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    userid uuid NOT NULL
);


ALTER TABLE public.accountrecovery OWNER TO postgres;

--
-- Name: applications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.applications (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    apikey text NOT NULL,
    userid uuid NOT NULL,
    name character varying(50) NOT NULL,
    image text DEFAULT ''::text NOT NULL
);


ALTER TABLE public.applications OWNER TO postgres;

--
-- Name: emailchange; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.emailchange (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    userid uuid NOT NULL,
    newemail character varying(255) NOT NULL
);


ALTER TABLE public.emailchange OWNER TO postgres;

--
-- Name: feedbacks; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.feedbacks (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    date timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    email character varying(255) NOT NULL,
    content text NOT NULL
);


ALTER TABLE public.feedbacks OWNER TO postgres;

--
-- Name: metricevents; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.metricevents (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    metricid uuid NOT NULL,
    value integer NOT NULL,
    relativetotalpos bigint NOT NULL,
    relativetotalneg bigint NOT NULL,
    date timestamp without time zone DEFAULT timezone('UTC'::text, CURRENT_TIMESTAMP) NOT NULL
);


ALTER TABLE public.metricevents OWNER TO postgres;

--
-- Name: metrics; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.metrics (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    appid uuid NOT NULL,
    name character varying(50) NOT NULL,
    type smallint NOT NULL,
    totalpos bigint DEFAULT 0 NOT NULL,
    totalneg bigint DEFAULT 0 NOT NULL,
    namepos character varying(50) NOT NULL,
    nameneg character varying(50) NOT NULL,
    created timestamp without time zone DEFAULT timezone('UTC'::text, CURRENT_TIMESTAMP) NOT NULL
);


ALTER TABLE public.metrics OWNER TO postgres;

--
-- Name: plans; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.plans (
    identifier text NOT NULL,
    name character varying(50) NOT NULL,
    price text NOT NULL,
    applimit integer NOT NULL,
    metricperapplimit integer NOT NULL,
    requestlimit integer NOT NULL,
    monthlyeventlimit bigint NOT NULL,
    range integer NOT NULL
);


ALTER TABLE public.plans OWNER TO postgres;

--
-- Name: providers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.providers (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    userid uuid NOT NULL,
    type smallint NOT NULL,
    provideruserid text NOT NULL
);


ALTER TABLE public.providers OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    email character varying(255) NOT NULL,
    firstname character varying(50) NOT NULL,
    lastname character varying(50) NOT NULL,
    password text NOT NULL,
    stripecustomerid text NOT NULL,
    currentplan text NOT NULL,
    image text DEFAULT ''::text NOT NULL,
    monthlyeventcount bigint DEFAULT 0 NOT NULL,
    startcountdate timestamp without time zone DEFAULT timezone('UTC'::text, CURRENT_TIMESTAMP) NOT NULL
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Data for Name: accountrecovery; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.accountrecovery (id, userid) FROM stdin;
\.


--
-- Data for Name: applications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.applications (id, apikey, userid, name, image) FROM stdin;
2bde443f-e397-444d-8c5d-473a8006ebab	f617fcae43b8e28e85751bfde006ad81	0f787079-e0ad-4b6b-b6ec-adb9b81640cc	Measurely	
1abdbe80-404b-41c7-8877-a4a8d50596b6	59e2a4d8b9c4720900dee89da462a69f	310a79ef-8a7f-4615-8898-301a98cc319f	Measurely	https://media.measurely.dev/1abdbe80-404b-41c7-8877-a4a8d50596b6avatar-(ProfilePictureMaker.com).png
\.


--
-- Data for Name: emailchange; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.emailchange (id, userid, newemail) FROM stdin;
\.


--
-- Data for Name: feedbacks; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.feedbacks (id, date, email, content) FROM stdin;
\.


--
-- Data for Name: metricevents; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.metricevents (id, metricid, value, relativetotalpos, relativetotalneg, date) FROM stdin;
e791dfa9-8a57-4445-9ec9-1f8bd25ce985	88f02565-f86a-4998-9265-d1b2d5858598	1	1	0	2024-12-28 01:06:50.442534
44526a3c-c1f5-453f-983a-47413dbddf1a	ea7771c9-7f92-49cb-8241-6ff1e5d806e2	1	1	0	2024-12-28 01:10:18.379036
72d45b4c-d81f-4a62-b779-1077898ec9d5	ea7771c9-7f92-49cb-8241-6ff1e5d806e2	-1	1	1	2024-12-28 01:10:22.391275
809936b6-a8ac-4edd-b338-86edb9235c07	88f02565-f86a-4998-9265-d1b2d5858598	1	2	0	2024-12-28 01:13:01.595471
2f1d76a0-143e-4cc8-b3c2-b5aee69c29df	88f02565-f86a-4998-9265-d1b2d5858598	1	3	0	2024-12-28 01:13:02.352689
b8e73e6d-1c4f-4225-b58e-9fbc8053b276	57d2421b-d6d3-4af7-8f09-6a50d7afec7a	1	1	0	2024-12-28 01:13:04.81035
f6a4ba83-37d6-41b5-a631-52faf1bacdf1	455f162f-2d1f-4837-9577-9c8bd4ce72c4	1	1	0	2024-12-28 01:13:24.945503
4070f4ca-7f44-4e63-9b40-0aa4f188c866	de7c5428-5ced-4535-bec5-ae0de3e5c82e	1	1	0	2024-12-28 01:13:25.295209
07db7def-279b-4711-8d47-3815c65738a1	2786b47e-5936-4c0a-94ca-56ddc6fe6ae9	1	1	0	2024-12-28 01:13:39.170344
3e8bea63-6da6-4e16-9670-a69777618709	ea7771c9-7f92-49cb-8241-6ff1e5d806e2	1	2	1	2024-12-28 01:14:03.684238
678c093b-af16-441f-bd6e-968b6001e6ee	ea7771c9-7f92-49cb-8241-6ff1e5d806e2	-1	2	2	2024-12-28 01:14:09.782888
e143fa8f-d9db-4a59-b13b-3db430b9e20a	08113d6f-e1be-48d5-9a50-7620d0324568	84	84	0	2024-12-28 01:14:22.987454
afbc08e2-d247-4817-8f32-e420f8cd5c9a	ea7771c9-7f92-49cb-8241-6ff1e5d806e2	1	3	2	2024-12-28 01:14:23.256148
504b9c90-0f4e-424d-8c46-5f2e52040c20	88f02565-f86a-4998-9265-d1b2d5858598	1	4	0	2024-12-28 01:15:15.606253
43d88319-c27f-4a6b-bb2f-5af8eb7e2321	88f02565-f86a-4998-9265-d1b2d5858598	1	5	0	2024-12-28 01:41:42.91348
e59a5918-aa19-4a3a-a003-12ce08e96e0e	88f02565-f86a-4998-9265-d1b2d5858598	1	6	0	2024-12-28 01:44:11.486999
ef9421c1-3749-4edc-b77a-f86aee3365c4	2786b47e-5936-4c0a-94ca-56ddc6fe6ae9	1	2	0	2024-12-28 01:44:21.595018
b15c9c23-4a6b-4612-aa15-34a98325029b	88f02565-f86a-4998-9265-d1b2d5858598	1	7	0	2024-12-28 01:46:05.602485
e7f126c4-cf05-4188-bd78-a1c5ec1a53ca	88f02565-f86a-4998-9265-d1b2d5858598	1	8	0	2024-12-28 01:46:11.177656
0e2a15dc-439a-4a27-83e3-e0bbb27d8e81	88f02565-f86a-4998-9265-d1b2d5858598	1	9	0	2024-12-28 01:46:25.253034
703592ab-1f96-4eb9-bd0c-e96ef6ad69ba	ea7771c9-7f92-49cb-8241-6ff1e5d806e2	1	4	2	2024-12-28 01:47:18.616257
c1bd73a1-f021-4933-bede-1a43c2df1c5e	ea7771c9-7f92-49cb-8241-6ff1e5d806e2	-1	4	3	2024-12-28 01:48:06.69867
4fafd8e4-7698-4d37-887b-0996f23ae5a3	88f02565-f86a-4998-9265-d1b2d5858598	1	10	0	2024-12-28 01:48:16.891312
fe8bcc55-c50d-4cdc-a98a-2b4ae509f1a8	ea7771c9-7f92-49cb-8241-6ff1e5d806e2	1	5	3	2024-12-28 01:48:48.671043
b315ab9a-6906-4bbd-8ae3-ddf29c9ac269	ea7771c9-7f92-49cb-8241-6ff1e5d806e2	-1	5	4	2024-12-28 01:49:04.564934
88174262-5a1d-4526-b58b-03c871fb08d7	88f02565-f86a-4998-9265-d1b2d5858598	1	11	0	2024-12-28 01:49:05.491161
e6b2303e-28ba-4cb6-81b9-3f77b3f21df8	ea7771c9-7f92-49cb-8241-6ff1e5d806e2	1	6	4	2024-12-28 01:49:39.687528
5229e381-aa56-4926-9852-d07d25dc6db5	ea7771c9-7f92-49cb-8241-6ff1e5d806e2	-1	6	5	2024-12-28 01:51:42.496139
4f72cc00-7044-475e-b5a3-ca18afbd6ca2	88f02565-f86a-4998-9265-d1b2d5858598	1	12	0	2024-12-28 01:51:42.997793
e9c7dda9-8e0f-427d-a7fa-5738656c67a2	ea7771c9-7f92-49cb-8241-6ff1e5d806e2	1	7	5	2024-12-28 01:53:34.723311
f1ef9252-a2d5-4733-8863-f78ab3c935a0	ea7771c9-7f92-49cb-8241-6ff1e5d806e2	-1	7	6	2024-12-28 01:54:16.602758
5ec32102-1c98-41b5-8ee8-19e00aca6044	88f02565-f86a-4998-9265-d1b2d5858598	1	13	0	2024-12-28 01:54:30.964104
993da5a4-bd4e-411c-a14f-78fbd55b9644	ea7771c9-7f92-49cb-8241-6ff1e5d806e2	1	8	6	2024-12-28 01:55:51.734397
9bf1d9fd-1e4f-4b6c-9b21-d3893ddbf1be	88f02565-f86a-4998-9265-d1b2d5858598	1	14	0	2024-12-28 02:07:45.120046
cb7797db-32ba-464e-b6a2-a93a77f4c762	ea7771c9-7f92-49cb-8241-6ff1e5d806e2	-1	8	7	2024-12-28 02:08:32.451627
2d93ea90-5d99-4f05-a42f-e0c1c6840951	88f02565-f86a-4998-9265-d1b2d5858598	1	15	0	2024-12-28 02:08:33.426596
0007bf6f-193a-40a6-9df8-ba785a4c5260	88f02565-f86a-4998-9265-d1b2d5858598	1	16	0	2024-12-28 02:12:59.313605
c136402d-8a85-4ad5-a3b2-8fd0e58b4bb1	88f02565-f86a-4998-9265-d1b2d5858598	1	17	0	2024-12-28 02:17:18.039714
c04248a6-8555-4752-a3e3-75c52504b5d5	ea7771c9-7f92-49cb-8241-6ff1e5d806e2	1	9	7	2024-12-28 02:19:26.564186
aba8c00d-3d86-47d6-9436-c3789f8737fc	88f02565-f86a-4998-9265-d1b2d5858598	1	18	0	2024-12-28 03:05:51.158021
494d93e5-e63e-4c27-8e69-3e40f4d18d4f	88f02565-f86a-4998-9265-d1b2d5858598	1	19	0	2024-12-28 03:06:07.050078
471b7b8c-6759-44a1-9fbc-10c3ba4775e6	88f02565-f86a-4998-9265-d1b2d5858598	1	20	0	2024-12-28 03:09:21.494112
768c48be-bf56-4096-bad8-f45fa6afa023	88f02565-f86a-4998-9265-d1b2d5858598	1	21	0	2024-12-28 03:18:48.78021
7b4fce7d-c69a-493a-8cfe-1c597f059b9e	88f02565-f86a-4998-9265-d1b2d5858598	1	22	0	2024-12-28 03:18:58.018159
756de21b-b184-4e3d-b8ea-ce04601b7725	88f02565-f86a-4998-9265-d1b2d5858598	1	23	0	2024-12-28 03:25:35.431102
aa0aa3ac-6329-4951-8fe1-ba8cef6c8fab	88f02565-f86a-4998-9265-d1b2d5858598	1	24	0	2024-12-28 03:38:01.409843
31bb7ec3-1624-4889-9867-87bc5de86f67	88f02565-f86a-4998-9265-d1b2d5858598	1	25	0	2024-12-28 04:07:30.847226
7438b296-66d0-4fb3-bf84-a14b77e39dc6	88f02565-f86a-4998-9265-d1b2d5858598	1	26	0	2024-12-28 04:13:37.983743
0e6f9c20-9011-44d0-b99e-a4ea4945cb19	88f02565-f86a-4998-9265-d1b2d5858598	1	27	0	2024-12-28 04:46:46.994349
81cec00e-c07b-472a-a0cb-bf4e57432cf8	88f02565-f86a-4998-9265-d1b2d5858598	1	28	0	2024-12-28 04:48:15.772921
6695cead-2bfd-4cd3-99a5-e8e6fbdde61b	88f02565-f86a-4998-9265-d1b2d5858598	1	29	0	2024-12-28 04:54:35.798951
3d77acfc-ab82-482b-b0a4-c61bbaf71073	88f02565-f86a-4998-9265-d1b2d5858598	1	30	0	2024-12-28 05:01:06.736358
e478f90e-4fb0-45e8-b73d-57b8f72c6d07	88f02565-f86a-4998-9265-d1b2d5858598	1	31	0	2024-12-28 05:01:07.145189
fe79ed51-495e-4521-b78a-5fc19ab3d14e	88f02565-f86a-4998-9265-d1b2d5858598	1	32	0	2024-12-28 05:01:11.346279
2fe7f784-1e1b-47f4-904b-e53f64e92c5b	88f02565-f86a-4998-9265-d1b2d5858598	1	33	0	2024-12-28 05:01:24.446075
0e8ca86c-988e-4052-90cc-2c4621b76f5a	88f02565-f86a-4998-9265-d1b2d5858598	1	34	0	2024-12-28 05:01:26.53515
f85e02e8-57e7-41d2-af51-c06e0d7a78aa	88f02565-f86a-4998-9265-d1b2d5858598	1	35	0	2024-12-28 05:01:34.122427
b6396387-8fac-4fe8-98da-7e2481018939	88f02565-f86a-4998-9265-d1b2d5858598	1	36	0	2024-12-28 05:01:34.360098
7f5c8249-bac9-416f-8769-cafb3512fd91	88f02565-f86a-4998-9265-d1b2d5858598	1	37	0	2024-12-28 05:01:50.664511
45e0ae22-0acc-49bc-8a44-3d41707d8da4	88f02565-f86a-4998-9265-d1b2d5858598	1	38	0	2024-12-28 05:02:02.981267
5e171d0e-fffb-4639-82a0-cb2231046c6e	88f02565-f86a-4998-9265-d1b2d5858598	1	39	0	2024-12-28 05:09:59.85369
d8b4d8e8-c786-436f-936c-34a3e55aae48	88f02565-f86a-4998-9265-d1b2d5858598	1	40	0	2024-12-28 05:10:39.760499
43b03236-5381-456f-b54d-9ace24e789ac	88f02565-f86a-4998-9265-d1b2d5858598	1	41	0	2024-12-28 05:12:49.99167
7abd08ab-ef37-454a-a0ff-627cec99e5e9	88f02565-f86a-4998-9265-d1b2d5858598	1	42	0	2024-12-28 05:12:51.076189
97cd7ab0-b4d0-4063-a3b6-b38af90c44de	88f02565-f86a-4998-9265-d1b2d5858598	1	43	0	2024-12-28 05:12:55.571048
8e9a01b3-3aec-4cd9-b90a-86e123a08e9a	88f02565-f86a-4998-9265-d1b2d5858598	1	44	0	2024-12-28 05:13:15.372279
6d2d3962-7151-4b92-a829-d2359fa8676e	88f02565-f86a-4998-9265-d1b2d5858598	1	45	0	2024-12-28 05:13:18.229358
522bdcc3-f32d-42b0-b2c7-87266180cfd1	88f02565-f86a-4998-9265-d1b2d5858598	1	46	0	2024-12-28 05:13:20.437926
36e003c9-1f70-4c86-ac5f-4a0acd29e734	88f02565-f86a-4998-9265-d1b2d5858598	1	47	0	2024-12-28 05:13:22.40666
9d6f8149-1c16-421a-942c-0e64bce46c0e	88f02565-f86a-4998-9265-d1b2d5858598	1	48	0	2024-12-28 05:13:22.94799
76d618f2-0ce7-44aa-91aa-77111a37b1f2	88f02565-f86a-4998-9265-d1b2d5858598	1	49	0	2024-12-28 05:13:35.936539
13283562-45c6-465c-8b2f-4a90e2285ce5	88f02565-f86a-4998-9265-d1b2d5858598	1	50	0	2024-12-28 05:14:10.105769
d47dc8e8-2b87-419f-977c-dd519e079a3b	88f02565-f86a-4998-9265-d1b2d5858598	1	51	0	2024-12-28 05:14:21.310548
67c76494-8a07-483a-a1ee-7f0213eebc5d	88f02565-f86a-4998-9265-d1b2d5858598	1	52	0	2024-12-28 05:16:01.88112
36caab0a-14fc-4c94-a90e-e5ff5406a62f	88f02565-f86a-4998-9265-d1b2d5858598	1	53	0	2024-12-28 05:18:01.839638
0508e195-488a-4ddc-99ce-f24f6542e1c6	88f02565-f86a-4998-9265-d1b2d5858598	1	54	0	2024-12-28 05:18:05.662055
e149532a-b328-4d0c-b99f-7fcce4d8970b	88f02565-f86a-4998-9265-d1b2d5858598	1	55	0	2024-12-28 05:18:06.183338
1898691b-74c2-4ee1-86cb-355274b4a57f	88f02565-f86a-4998-9265-d1b2d5858598	1	56	0	2024-12-28 05:18:14.089661
919e531a-8d26-4522-b484-8cec938dee43	88f02565-f86a-4998-9265-d1b2d5858598	1	57	0	2024-12-28 05:18:14.99731
75c8f180-0c41-428e-bd27-a35cec07e8e1	88f02565-f86a-4998-9265-d1b2d5858598	1	58	0	2024-12-28 05:18:26.17894
0122e4d9-1afa-4b44-addd-221899c69f51	88f02565-f86a-4998-9265-d1b2d5858598	1	59	0	2024-12-28 05:18:33.404359
8f4526e1-7f27-4dfd-b3f6-831942e4f53b	88f02565-f86a-4998-9265-d1b2d5858598	1	60	0	2024-12-28 05:18:40.188424
bc42e716-12f7-4c88-a6d2-f0d8c7820053	88f02565-f86a-4998-9265-d1b2d5858598	1	61	0	2024-12-28 05:23:07.99348
e264b197-a17f-4da7-a01b-81aaf37fcf95	88f02565-f86a-4998-9265-d1b2d5858598	1	62	0	2024-12-28 05:30:52.351335
333a6375-6a25-467e-993b-b3f7bee7832d	88f02565-f86a-4998-9265-d1b2d5858598	1	63	0	2024-12-28 05:30:52.627708
76e604a7-cae7-45ee-885d-5f71e89c7022	88f02565-f86a-4998-9265-d1b2d5858598	1	64	0	2024-12-28 05:31:30.667101
21aaef02-e62f-4f93-82e0-6dd489d47ad9	88f02565-f86a-4998-9265-d1b2d5858598	1	65	0	2024-12-28 05:35:20.864743
79726370-4efb-4a81-b895-ccf53f010868	88f02565-f86a-4998-9265-d1b2d5858598	1	66	0	2024-12-28 05:35:50.124786
6c8286a4-eb4a-41a3-a9df-c4b5171bdf50	88f02565-f86a-4998-9265-d1b2d5858598	1	67	0	2024-12-28 05:35:50.375449
c946d61c-3ae3-4fd4-955b-b2ed42ed6cab	88f02565-f86a-4998-9265-d1b2d5858598	1	68	0	2024-12-28 05:35:50.408792
2b5d3df2-bd54-453b-b124-275463ca91e4	88f02565-f86a-4998-9265-d1b2d5858598	1	69	0	2024-12-28 05:37:39.624266
846d5d62-76e9-44c8-8944-e2907084fe5b	88f02565-f86a-4998-9265-d1b2d5858598	1	70	0	2024-12-28 05:37:39.863765
9918b880-cfdb-45c0-badc-59a0af47ea92	88f02565-f86a-4998-9265-d1b2d5858598	1	71	0	2024-12-28 05:38:30.440261
4e16997c-7e88-4abf-a053-9039bb2a2621	88f02565-f86a-4998-9265-d1b2d5858598	1	72	0	2024-12-28 05:39:31.325331
2d682185-7241-45d4-a444-c7820a2826e5	88f02565-f86a-4998-9265-d1b2d5858598	1	73	0	2024-12-28 05:46:02.642447
51a20f9e-a474-4882-a84b-9815415170cf	88f02565-f86a-4998-9265-d1b2d5858598	1	74	0	2024-12-28 05:48:05.800712
a866c562-ce78-48f6-84c4-83a74588132d	88f02565-f86a-4998-9265-d1b2d5858598	1	75	0	2024-12-28 05:48:05.871283
720a9717-9b5a-4c7b-8c73-d383fa0a94ca	88f02565-f86a-4998-9265-d1b2d5858598	1	76	0	2024-12-28 05:48:24.576166
6886400f-723e-43dc-a018-9ee8ed52f0ab	88f02565-f86a-4998-9265-d1b2d5858598	1	77	0	2024-12-28 05:48:24.630215
ad30e2da-aab3-465a-913d-75137dccd2ee	88f02565-f86a-4998-9265-d1b2d5858598	1	78	0	2024-12-28 05:50:07.100646
b7852a35-ee6f-4293-8932-dfc4e34f37b2	88f02565-f86a-4998-9265-d1b2d5858598	1	79	0	2024-12-28 05:52:18.835415
3c1b8860-6ba7-44a9-9850-c14ea28d4c1b	88f02565-f86a-4998-9265-d1b2d5858598	1	80	0	2024-12-28 05:52:37.156799
cd506bff-bed8-488b-a531-b19edd929a80	88f02565-f86a-4998-9265-d1b2d5858598	1	81	0	2024-12-28 06:00:05.634947
bd2d3c74-c850-4b46-b313-fb6d076d028a	88f02565-f86a-4998-9265-d1b2d5858598	1	82	0	2024-12-28 06:02:11.562199
7cac776d-72c6-4c40-b7ef-8d477c279edf	88f02565-f86a-4998-9265-d1b2d5858598	1	83	0	2024-12-28 07:08:52.180915
6d586dd7-be62-4329-bb84-9c87ddcdff84	88f02565-f86a-4998-9265-d1b2d5858598	1	84	0	2024-12-28 07:08:53.437351
ff35c7a8-742d-4bb7-b180-71e7e0ef4840	88f02565-f86a-4998-9265-d1b2d5858598	1	85	0	2024-12-28 08:38:58.722884
c2766408-7917-4a54-87dd-4b2894a72c88	88f02565-f86a-4998-9265-d1b2d5858598	1	86	0	2024-12-28 08:40:53.10778
7f329b28-ebe2-4efd-8c48-15ce0cc8c0bd	88f02565-f86a-4998-9265-d1b2d5858598	1	87	0	2024-12-28 08:45:13.31612
affa9c05-4093-4259-bf64-3e6bf8ddf205	88f02565-f86a-4998-9265-d1b2d5858598	1	88	0	2024-12-28 08:45:17.342597
c5b1541c-7538-4bd6-b297-c1245595f186	88f02565-f86a-4998-9265-d1b2d5858598	1	89	0	2024-12-28 08:50:51.734229
1b6ac88a-c171-4afd-9794-06b2367638ac	88f02565-f86a-4998-9265-d1b2d5858598	1	90	0	2024-12-28 09:03:03.985389
6aab79f2-6c35-48e2-a83a-efb41e703708	88f02565-f86a-4998-9265-d1b2d5858598	1	91	0	2024-12-28 09:05:40.839554
000acf19-3724-4cea-a05c-392fcfb1fbcc	88f02565-f86a-4998-9265-d1b2d5858598	1	92	0	2024-12-28 09:06:20.138966
14a518ae-d553-41d6-92ab-1aa95dbf4c75	88f02565-f86a-4998-9265-d1b2d5858598	1	93	0	2024-12-28 09:17:55.822699
df3558e8-d673-4527-8526-f0b4fed85836	88f02565-f86a-4998-9265-d1b2d5858598	1	94	0	2024-12-28 09:25:41.623906
142a18ff-c539-4351-87bf-df97bbf93ab8	88f02565-f86a-4998-9265-d1b2d5858598	1	95	0	2024-12-28 09:30:22.803001
14dbda1c-c461-4622-ba8b-0d5f988f4c89	88f02565-f86a-4998-9265-d1b2d5858598	1	96	0	2024-12-28 09:46:24.488264
6cef3f79-095c-4325-b7e6-6178c75f4831	88f02565-f86a-4998-9265-d1b2d5858598	1	97	0	2024-12-28 09:59:38.787828
360129bb-d331-42d8-858e-0ccfe14445ef	88f02565-f86a-4998-9265-d1b2d5858598	1	98	0	2024-12-28 09:59:48.503579
e7c4fe86-b2b3-4253-ae5a-2e5ec3e96899	88f02565-f86a-4998-9265-d1b2d5858598	1	99	0	2024-12-28 10:26:04.699537
15acef1e-12e8-46dd-9d21-b40bbeefb511	88f02565-f86a-4998-9265-d1b2d5858598	1	100	0	2024-12-28 10:31:31.788739
2c0b9dc0-a936-4384-af13-a15bdf841684	88f02565-f86a-4998-9265-d1b2d5858598	1	101	0	2024-12-28 10:44:40.081563
04d8aea9-f105-456a-96bf-a86bf8f0de8c	88f02565-f86a-4998-9265-d1b2d5858598	1	102	0	2024-12-28 11:45:43.001207
650d3482-6b69-4ae9-b948-56aaea1ab587	88f02565-f86a-4998-9265-d1b2d5858598	1	103	0	2024-12-28 12:23:08.601017
bb78501d-fda7-4abc-a5ba-d1cf3bf79fa9	88f02565-f86a-4998-9265-d1b2d5858598	1	104	0	2024-12-28 12:44:51.318078
2d1bd2b2-1bd4-4f65-96eb-c98dbe063a58	88f02565-f86a-4998-9265-d1b2d5858598	1	105	0	2024-12-28 13:17:45.428273
6fb75935-6c86-4af5-a468-5c67cce52591	88f02565-f86a-4998-9265-d1b2d5858598	1	106	0	2024-12-28 14:58:36.741943
4c47de8e-d0da-455f-bd00-2d3e50e97720	ea7771c9-7f92-49cb-8241-6ff1e5d806e2	-1	9	8	2024-12-28 15:00:21.091907
487fcabe-ab82-4322-addd-d8822a063d4d	2786b47e-5936-4c0a-94ca-56ddc6fe6ae9	-1	2	1	2024-12-28 15:00:59.297138
7d4cbad5-976c-41ee-8bcf-edf14d256845	88f02565-f86a-4998-9265-d1b2d5858598	1	107	0	2024-12-28 15:01:38.830083
4d448f70-c321-4c22-97dc-13e22b1951c8	88f02565-f86a-4998-9265-d1b2d5858598	1	108	0	2024-12-28 15:12:55.409505
f59b62f7-5e06-4ea0-9041-54db2a3805e6	88f02565-f86a-4998-9265-d1b2d5858598	1	109	0	2024-12-28 15:12:56.828267
94e2821b-e8e3-4f50-b5ff-3af9129934fb	88f02565-f86a-4998-9265-d1b2d5858598	1	110	0	2024-12-28 15:14:38.28457
657f9fb5-9898-4a60-b87f-b8c1fe422c7c	88f02565-f86a-4998-9265-d1b2d5858598	1	111	0	2024-12-28 15:27:47.946784
2a12e5d8-b9d5-48b8-9bad-7b9ac17de1a8	88f02565-f86a-4998-9265-d1b2d5858598	1	112	0	2024-12-28 15:27:52.203204
0e2f8fe5-8850-43bf-be94-0c4b7702c35b	88f02565-f86a-4998-9265-d1b2d5858598	1	113	0	2024-12-28 15:27:55.646052
c768f395-d38d-4cc1-8e19-03b6e5606625	88f02565-f86a-4998-9265-d1b2d5858598	1	114	0	2024-12-28 15:28:38.732388
cc7c6261-6114-4a59-9f57-6622150683db	88f02565-f86a-4998-9265-d1b2d5858598	1	115	0	2024-12-28 15:37:57.926259
4229f780-e529-4837-a793-bf9a159e3f36	88f02565-f86a-4998-9265-d1b2d5858598	1	116	0	2024-12-28 15:38:05.435109
c32ab384-f18b-455d-a2ce-b2d4ed234e87	88f02565-f86a-4998-9265-d1b2d5858598	1	117	0	2024-12-28 15:41:19.509617
6b29666f-bfac-4a2f-a575-d028525eb6a7	88f02565-f86a-4998-9265-d1b2d5858598	1	118	0	2024-12-28 15:45:48.876208
22233d14-1ac2-4bd6-8b09-a5352a06390d	88f02565-f86a-4998-9265-d1b2d5858598	1	119	0	2024-12-28 15:46:23.581859
54b5486f-7d42-4b2e-bed8-245843e71bb5	88f02565-f86a-4998-9265-d1b2d5858598	1	120	0	2024-12-28 15:46:33.479212
d9025f4f-b589-43a4-9989-b15b7c5757ce	88f02565-f86a-4998-9265-d1b2d5858598	1	121	0	2024-12-28 15:52:13.214972
d86399c6-edac-4515-8348-60088ac460b1	88f02565-f86a-4998-9265-d1b2d5858598	1	122	0	2024-12-28 15:53:29.070306
8275573e-be85-4685-b0e8-10d24c63bb2a	88f02565-f86a-4998-9265-d1b2d5858598	1	123	0	2024-12-28 15:53:35.173189
31437f5d-0e87-43f3-81c1-ba0109170fd1	88f02565-f86a-4998-9265-d1b2d5858598	1	124	0	2024-12-28 15:56:56.235844
36018cc6-586c-4a45-a35b-3076a93108b2	88f02565-f86a-4998-9265-d1b2d5858598	1	125	0	2024-12-28 15:57:39.580684
3542bf9c-3fc8-43a0-946b-f7cf779e7053	88f02565-f86a-4998-9265-d1b2d5858598	1	126	0	2024-12-28 16:16:19.645451
7cd4b93a-5002-45a5-99e6-e1dc9fbc6c11	88f02565-f86a-4998-9265-d1b2d5858598	1	127	0	2024-12-28 16:26:09.675532
f806bb09-3d0a-4910-b9cd-d1564287e725	88f02565-f86a-4998-9265-d1b2d5858598	1	128	0	2024-12-28 17:02:55.742649
11eb2f84-4c1f-456f-bd97-f7ea5a7ae897	88f02565-f86a-4998-9265-d1b2d5858598	1	129	0	2024-12-28 17:03:13.665502
44dc1610-b72a-4c2c-8a4a-7143135e8839	88f02565-f86a-4998-9265-d1b2d5858598	1	130	0	2024-12-28 17:04:44.609011
71a9ba5d-99e1-4fc9-ae4c-4956189db598	88f02565-f86a-4998-9265-d1b2d5858598	1	131	0	2024-12-28 17:05:03.120387
6592e35d-ae69-404f-bcc7-006ea2aad1b6	88f02565-f86a-4998-9265-d1b2d5858598	1	132	0	2024-12-28 17:05:10.256064
9022c650-908e-4fc2-afe8-e35a572f4909	88f02565-f86a-4998-9265-d1b2d5858598	1	133	0	2024-12-28 17:05:13.00099
8c1ad004-2f40-4385-b958-8522f5fb6610	88f02565-f86a-4998-9265-d1b2d5858598	1	134	0	2024-12-28 17:05:16.314812
77722417-4461-4c06-87ab-758d274c71a6	88f02565-f86a-4998-9265-d1b2d5858598	1	135	0	2024-12-28 17:08:34.699395
2e761d81-ee73-4781-863e-947921836557	88f02565-f86a-4998-9265-d1b2d5858598	1	136	0	2024-12-28 17:08:35.413667
0bcc1bfe-2fe3-4eec-a560-664550e5fc58	88f02565-f86a-4998-9265-d1b2d5858598	1	137	0	2024-12-28 17:08:36.466021
8370d1ee-ffff-4460-9950-ad77c803fc0f	88f02565-f86a-4998-9265-d1b2d5858598	1	138	0	2024-12-28 17:14:26.300072
e54a9b11-d396-49f2-95f1-08dfd267c463	88f02565-f86a-4998-9265-d1b2d5858598	1	139	0	2024-12-28 17:16:19.594852
0d105c87-1adb-4f00-a8dc-ab121ea6b913	88f02565-f86a-4998-9265-d1b2d5858598	1	140	0	2024-12-28 17:20:48.703578
46f5c290-ca67-48de-a583-15ecaf72c605	88f02565-f86a-4998-9265-d1b2d5858598	1	141	0	2024-12-28 17:20:52.177383
\.


--
-- Data for Name: metrics; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.metrics (id, appid, name, type, totalpos, totalneg, namepos, nameneg, created) FROM stdin;
ea7771c9-7f92-49cb-8241-6ff1e5d806e2	2bde443f-e397-444d-8c5d-473a8006ebab	Metrics	1	9	8	added	removed	2024-12-28 00:59:13.319785
2786b47e-5936-4c0a-94ca-56ddc6fe6ae9	2bde443f-e397-444d-8c5d-473a8006ebab	Applications	1	2	1	added	removed	2024-12-28 00:59:05.635302
93158292-fb11-4c35-8b83-91c638ddd367	2bde443f-e397-444d-8c5d-473a8006ebab	Feedbacks	0	0	0			2024-12-28 00:56:07.748693
6b97e30e-3a97-4f0f-8cf6-20193913400c	2bde443f-e397-444d-8c5d-473a8006ebab	Team Requests Count	0	0	0			2024-12-28 00:57:33.385922
65ffc0c9-de5c-43eb-8a97-88a8592558b5	2bde443f-e397-444d-8c5d-473a8006ebab	Plus Users	1	0	0	added	removed	2024-12-28 00:58:49.777874
180150ac-ea14-4f42-bae7-650ce10ac155	2bde443f-e397-444d-8c5d-473a8006ebab	Pro Users	1	0	0	added	removed	2024-12-28 00:58:56.114529
57d2421b-d6d3-4af7-8f09-6a50d7afec7a	2bde443f-e397-444d-8c5d-473a8006ebab	Signup Sessions	0	1	0			2024-12-28 00:57:44.865887
455f162f-2d1f-4837-9577-9c8bd4ce72c4	2bde443f-e397-444d-8c5d-473a8006ebab	Starter Users	1	1	0	added	removed	2024-12-28 00:58:41.454164
de7c5428-5ced-4535-bec5-ae0de3e5c82e	2bde443f-e397-444d-8c5d-473a8006ebab	Signups	0	1	0			2024-12-28 00:57:53.787979
08113d6f-e1be-48d5-9a50-7620d0324568	1abdbe80-404b-41c7-8877-a4a8d50596b6	New users	0	84	0			2024-12-28 01:14:22.823075
88f02565-f86a-4998-9265-d1b2d5858598	2bde443f-e397-444d-8c5d-473a8006ebab	Page Views	0	141	0			2024-12-28 00:55:53.273221
\.


--
-- Data for Name: plans; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.plans (identifier, name, price, applimit, metricperapplimit, requestlimit, monthlyeventlimit, range) FROM stdin;
starter	Starter		1	2	25	10000	30
plus	Plus	price_1QZGv5KSu0h3NTsFhbcZ2t4k	3	15	1000	1000000	365
pro	Pro	price_1QZGvGKSu0h3NTsFOR0ZxCPc	10	30	10000	10000000	365
\.


--
-- Data for Name: providers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.providers (id, userid, type, provideruserid) FROM stdin;
ee5dc14d-cb29-42f8-b2a7-a88e66f6d983	0f787079-e0ad-4b6b-b6ec-adb9b81640cc	1	114780142989566219312
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, email, firstname, lastname, password, stripecustomerid, currentplan, image, monthlyeventcount, startcountdate) FROM stdin;
310a79ef-8a7f-4615-8898-301a98cc319f	zakaryfofana@gmail.com	zakary	fofana	$2a$04$hmmQcGmEuGXysCZcDohiCOPB7Ly784hm7tL2LC9Z72GwZFk.t2ZV6	cus_RTm9AMty6FkCdh	starter		1	2024-12-28 01:13:24.672318
0f787079-e0ad-4b6b-b6ec-adb9b81640cc	info@measurely.dev	Measurely		""	cus_RTlrbREWjgiO3I	pro	""	170	2024-12-27 19:55:29
\.


--
-- Name: accountrecovery accountrecovery_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.accountrecovery
    ADD CONSTRAINT accountrecovery_pkey PRIMARY KEY (id);


--
-- Name: applications applications_apikey_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.applications
    ADD CONSTRAINT applications_apikey_key UNIQUE (apikey);


--
-- Name: applications applications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.applications
    ADD CONSTRAINT applications_pkey PRIMARY KEY (id);


--
-- Name: emailchange emailchange_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.emailchange
    ADD CONSTRAINT emailchange_pkey PRIMARY KEY (id);


--
-- Name: feedbacks feedbacks_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.feedbacks
    ADD CONSTRAINT feedbacks_pkey PRIMARY KEY (id);


--
-- Name: metricevents metricevents_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.metricevents
    ADD CONSTRAINT metricevents_pkey PRIMARY KEY (id);


--
-- Name: metrics metrics_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.metrics
    ADD CONSTRAINT metrics_pkey PRIMARY KEY (id);


--
-- Name: plans plans_identifier_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.plans
    ADD CONSTRAINT plans_identifier_key UNIQUE (identifier);


--
-- Name: providers providers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.providers
    ADD CONSTRAINT providers_pkey PRIMARY KEY (id);


--
-- Name: providers providers_type_provideruserid_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.providers
    ADD CONSTRAINT providers_type_provideruserid_key UNIQUE (type, provideruserid);


--
-- Name: providers providers_type_userid_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.providers
    ADD CONSTRAINT providers_type_userid_key UNIQUE (type, userid);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_stripecustomerid_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_stripecustomerid_key UNIQUE (stripecustomerid);


--
-- Name: idx_accountrecovery_userid; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_accountrecovery_userid ON public.accountrecovery USING btree (userid);


--
-- Name: idx_applications_userid; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_applications_userid ON public.applications USING btree (userid);


--
-- Name: idx_emailchange_userid; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_emailchange_userid ON public.emailchange USING btree (userid);


--
-- Name: idx_metrics_appid; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_metrics_appid ON public.metrics USING btree (appid);


--
-- Name: idx_metriquevents_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_metriquevents_date ON public.metricevents USING btree (date);


--
-- Name: idx_metriquevents_metricid; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_metriquevents_metricid ON public.metricevents USING btree (metricid);


--
-- Name: idx_providers_userid_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_providers_userid_type ON public.providers USING btree (userid, type);


--
-- Name: idx_users_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_email ON public.users USING btree (email);


--
-- Name: accountrecovery accountrecovery_userid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.accountrecovery
    ADD CONSTRAINT accountrecovery_userid_fkey FOREIGN KEY (userid) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: applications applications_userid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.applications
    ADD CONSTRAINT applications_userid_fkey FOREIGN KEY (userid) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: emailchange emailchange_userid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.emailchange
    ADD CONSTRAINT emailchange_userid_fkey FOREIGN KEY (userid) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: metricevents metricevents_metricid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.metricevents
    ADD CONSTRAINT metricevents_metricid_fkey FOREIGN KEY (metricid) REFERENCES public.metrics(id) ON DELETE CASCADE;


--
-- Name: metrics metrics_appid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.metrics
    ADD CONSTRAINT metrics_appid_fkey FOREIGN KEY (appid) REFERENCES public.applications(id) ON DELETE CASCADE;


--
-- Name: providers providers_userid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.providers
    ADD CONSTRAINT providers_userid_fkey FOREIGN KEY (userid) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: users users_currentplan_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_currentplan_fkey FOREIGN KEY (currentplan) REFERENCES public.plans(identifier);


--
-- PostgreSQL database dump complete
--

