--
-- PostgreSQL database dump
--

\restrict 0FVCnTnFfjNZECmY7fq7jPHKB80IqDrl854kbMbv98KUfhJH3MFi3Fmjlhual0C

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.6

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
-- Name: booking_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.booking_status AS ENUM (
    'pending',
    'confirmed',
    'cancelled'
);


ALTER TYPE public.booking_status OWNER TO postgres;

--
-- Name: event_approval_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.event_approval_status AS ENUM (
    'approved',
    'pending',
    'rejected'
);


ALTER TYPE public.event_approval_status OWNER TO postgres;

--
-- Name: event_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.event_status AS ENUM (
    'pending',
    'approved',
    'unapproved'
);


ALTER TYPE public.event_status OWNER TO postgres;

--
-- Name: payment_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.payment_status AS ENUM (
    'pending',
    'completed',
    'failed'
);


ALTER TYPE public.payment_status OWNER TO postgres;

--
-- Name: user_roles; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.user_roles AS ENUM (
    'user',
    'organizer',
    'admin'
);


ALTER TYPE public.user_roles OWNER TO postgres;

--
-- Name: set_updated_at(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.set_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- Always update the timestamp
    NEW.updated_at := NOW();
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.set_updated_at() OWNER TO postgres;

--
-- Name: update_booking_status_from_payment(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_booking_status_from_payment() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- Payment completed → confirm booking
    IF NEW.payment_status = 'completed' THEN
        UPDATE bookings
        SET status = 'confirmed'
        WHERE booking_id = NEW.booking_id;

    -- Payment failed → cancel booking
    ELSIF NEW.payment_status = 'failed' THEN
        UPDATE bookings
        SET status = 'cancelled'
        WHERE booking_id = NEW.booking_id;
    END IF;

    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_booking_status_from_payment() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: booking_lines; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.booking_lines (
    booking_line_id bigint NOT NULL,
    booking_id integer NOT NULL,
    ticket_id integer NOT NULL,
    quantity integer NOT NULL,
    unit_price numeric(10,2) NOT NULL,
    CONSTRAINT booking_lines_quantity_check CHECK ((quantity > 0)),
    CONSTRAINT booking_lines_unit_price_check CHECK ((unit_price >= (0)::numeric))
);


ALTER TABLE public.booking_lines OWNER TO postgres;

--
-- Name: booking_lines_booking_line_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.booking_lines_booking_line_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.booking_lines_booking_line_id_seq OWNER TO postgres;

--
-- Name: booking_lines_booking_line_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.booking_lines_booking_line_id_seq OWNED BY public.booking_lines.booking_line_id;


--
-- Name: bookings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.bookings (
    booking_id integer NOT NULL,
    user_id integer NOT NULL,
    event_id integer NOT NULL,
    booking_date timestamp without time zone NOT NULL,
    status public.booking_status NOT NULL,
    booking_email character varying(100) NOT NULL,
    booking_phone character varying(20) NOT NULL,
    booking_full_name character varying(100)
);


ALTER TABLE public.bookings OWNER TO postgres;

--
-- Name: bookings_booking_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.bookings_booking_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.bookings_booking_id_seq OWNER TO postgres;

--
-- Name: bookings_booking_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.bookings_booking_id_seq OWNED BY public.bookings.booking_id;


--
-- Name: cancellations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cancellations (
    cancel_id integer NOT NULL,
    booking_id integer NOT NULL,
    cancelled_at timestamp without time zone NOT NULL,
    refund_amount numeric(10,2),
    reason character varying(255)
);


ALTER TABLE public.cancellations OWNER TO postgres;

--
-- Name: cancellations_cancel_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.cancellations_cancel_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.cancellations_cancel_id_seq OWNER TO postgres;

--
-- Name: cancellations_cancel_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.cancellations_cancel_id_seq OWNED BY public.cancellations.cancel_id;


--
-- Name: events; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.events (
    event_id integer NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    image_url character varying(255),
    start_time timestamp without time zone NOT NULL,
    end_time timestamp without time zone,
    category character varying(50),
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    organizer_id integer,
    province character varying(100),
    district character varying(100),
    ward character varying(100),
    address character varying(255),
    venue_name character varying(100),
    approved public.event_approval_status DEFAULT 'pending'::public.event_approval_status
);


ALTER TABLE public.events OWNER TO postgres;

--
-- Name: events_event_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.events_event_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.events_event_id_seq OWNER TO postgres;

--
-- Name: events_event_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.events_event_id_seq OWNED BY public.events.event_id;


--
-- Name: payments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.payments (
    payment_id integer NOT NULL,
    booking_id integer NOT NULL,
    payment_method character varying(50),
    payment_status public.payment_status NOT NULL,
    amount numeric(10,2) NOT NULL,
    created_at timestamp without time zone NOT NULL,
    transaction_id integer
);


ALTER TABLE public.payments OWNER TO postgres;

--
-- Name: payments_payment_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.payments_payment_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.payments_payment_id_seq OWNER TO postgres;

--
-- Name: payments_payment_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.payments_payment_id_seq OWNED BY public.payments.payment_id;


--
-- Name: tickets; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tickets (
    ticket_id integer NOT NULL,
    name character varying(255) NOT NULL,
    price numeric(10,2) NOT NULL,
    quantity integer NOT NULL,
    event_id integer NOT NULL
);


ALTER TABLE public.tickets OWNER TO postgres;

--
-- Name: tickets_ticket_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.tickets_ticket_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.tickets_ticket_id_seq OWNER TO postgres;

--
-- Name: tickets_ticket_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.tickets_ticket_id_seq OWNED BY public.tickets.ticket_id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    user_id integer NOT NULL,
    full_name character varying(100),
    email character varying(100) NOT NULL,
    phone_number character varying(20),
    role public.user_roles,
    password_hash character varying(255) NOT NULL,
    gender character varying(10),
    birth_date date,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: users_user_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_user_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_user_id_seq OWNER TO postgres;

--
-- Name: users_user_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_user_id_seq OWNED BY public.users.user_id;


--
-- Name: booking_lines booking_line_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.booking_lines ALTER COLUMN booking_line_id SET DEFAULT nextval('public.booking_lines_booking_line_id_seq'::regclass);


--
-- Name: bookings booking_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bookings ALTER COLUMN booking_id SET DEFAULT nextval('public.bookings_booking_id_seq'::regclass);


--
-- Name: cancellations cancel_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cancellations ALTER COLUMN cancel_id SET DEFAULT nextval('public.cancellations_cancel_id_seq'::regclass);


--
-- Name: events event_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.events ALTER COLUMN event_id SET DEFAULT nextval('public.events_event_id_seq'::regclass);


--
-- Name: payments payment_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments ALTER COLUMN payment_id SET DEFAULT nextval('public.payments_payment_id_seq'::regclass);


--
-- Name: tickets ticket_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tickets ALTER COLUMN ticket_id SET DEFAULT nextval('public.tickets_ticket_id_seq'::regclass);


--
-- Name: users user_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN user_id SET DEFAULT nextval('public.users_user_id_seq'::regclass);


--
-- Data for Name: booking_lines; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.booking_lines (booking_line_id, booking_id, ticket_id, quantity, unit_price) FROM stdin;
44	47	7	1	437500.00
45	47	8	1	595000.00
115	96	53	2	1000.00
116	96	54	2	1000.00
117	97	53	2	1000.00
118	97	54	2	1000.00
119	98	53	2	1000.00
120	98	54	2	1000.00
121	99	53	2	1000.00
122	99	54	2	1000.00
123	100	53	2	1000.00
124	100	54	2	1000.00
125	101	53	2	1000.00
126	101	54	2	1000.00
127	102	53	2	1000.00
128	102	54	2	1000.00
129	103	53	2	1000.00
130	103	54	2	1000.00
131	104	37	1	720000.00
132	105	53	1	1000.00
133	105	54	1	1000.00
134	106	34	1	300000.00
135	107	53	1	1000.00
136	107	54	1	1000.00
137	108	53	1	1000.00
138	108	54	1	1000.00
139	109	53	1	1000.00
140	109	54	1	1000.00
141	110	53	1	1000.00
142	110	54	1	1000.00
143	111	53	1	1000.00
144	111	54	1	1000.00
145	112	53	1	1000.00
146	112	54	1	1000.00
147	113	53	1	1000.00
148	113	54	1	1000.00
149	114	53	1	1000.00
150	114	54	1	1000.00
151	115	35	1	375000.00
152	115	36	1	510000.00
94	85	53	1	1000.00
95	85	54	1	1000.00
102	89	53	1	1000.00
103	89	54	1	1000.00
110	93	53	1	1000.00
111	93	54	1	1000.00
114	95	18	1	400000.00
\.


--
-- Data for Name: bookings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.bookings (booking_id, user_id, event_id, booking_date, status, booking_email, booking_phone, booking_full_name) FROM stdin;
89	1	31	2025-12-19 19:44:32.144046	cancelled	vokhoinguyen2017@gmail.com	0915538518	vo khoi nguyen
113	1	31	2025-12-22 15:21:45.34683	confirmed	vokhoinguyen2017@gmail.com	0915538518	vo khoi nguyen
93	1	31	2025-12-19 19:53:06.33613	cancelled	vokhoinguyen2017@gmail.com	0915538518	vo khoi nguyen
114	1	31	2025-12-22 15:23:28.9839	confirmed	vokhoinguyen2017@gmail.com	0915538518	vo khoi nguyen
95	1	12	2025-12-19 20:28:22.777909	pending	vokhoinguyen2017@gmail.com	0915538518	vo khoi nguyen
96	1	31	2025-12-20 20:35:49.376269	pending	vokhoinguyen2017@gmail.com	0915538518	vo khoi nguyen
97	1	31	2025-12-20 20:36:41.317538	pending	vokhoinguyen2017@gmail.com	0915538518	vo khoi nguyen
98	1	31	2025-12-20 20:36:55.216504	pending	vokhoinguyen2017@gmail.com	0915538518	vo khoi nguyen
99	1	31	2025-12-20 20:38:08.061736	pending	vokhoinguyen2017@gmail.com	0915538518	vo khoi nguyen
100	1	31	2025-12-20 20:38:29.961336	pending	vokhoinguyen2017@gmail.com	0915538518	vo khoi nguyen
101	1	31	2025-12-20 20:39:04.012274	pending	vokhoinguyen2017@gmail.com	0915538518	vo khoi nguyen
102	1	31	2025-12-20 20:39:55.722246	pending	vokhoinguyen2017@gmail.com	0915538518	vo khoi nguyen
47	2	2	2025-12-16 14:07:36.573852	confirmed	vokhoinguyen2017@gmail.com	0915538518	vo khoi nguyen
115	1	19	2025-12-22 16:36:12.712414	cancelled	vokhoinguyen2017@gmail.com	0915538518	vo khoi nguyen
85	1	31	2025-12-19 19:23:08.266136	confirmed	vokhoinguyen2017@gmail.com	0915538518	vo khoi nguyen
103	1	31	2025-12-20 20:40:47.869378	confirmed	vokhoinguyen2017@gmail.com	0915538518	vo khoi nguyen
104	1	19	2025-12-20 20:57:44.320234	cancelled	vokhoinguyen2017@gmail.com	0915538518	vo khoi nguyen
105	1	31	2025-12-20 20:58:20.000584	confirmed	vokhoinguyen2017@gmail.com	0915538518	vo khoi nguyen
106	1	19	2025-12-22 14:31:09.439105	cancelled	vokhoinguyen2017@gmail.com	0915538518	vo khoi nguyen
107	1	31	2025-12-22 14:36:07.66095	confirmed	vokhoinguyen2017@gmail.com	0915538518	vo khoi nguyen
108	1	31	2025-12-22 14:37:24.830878	cancelled	vokhoinguyen2017@gmail.com	0915538518	vo khoi nguyen
109	1	31	2025-12-22 15:06:50.874162	cancelled	vokhoinguyen2017@gmail.com	0915538518	vo khoi nguyen
110	1	31	2025-12-22 15:07:14.716806	cancelled	vokhoinguyen2017@gmail.com	0915538518	vo khoi nguyen
111	1	31	2025-12-22 15:08:10.694292	pending	vokhoinguyen2017@gmail.com	0915538518	vo khoi nguyen
112	1	31	2025-12-22 15:20:23.098522	pending	vokhoinguyen2017@gmail.com	0915538518	vo khoi nguyen
\.


--
-- Data for Name: cancellations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cancellations (cancel_id, booking_id, cancelled_at, refund_amount, reason) FROM stdin;
1	47	2025-12-16 22:27:38.626276	1032500.00	
\.


--
-- Data for Name: events; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.events (event_id, name, description, image_url, start_time, end_time, category, created_at, updated_at, organizer_id, province, district, ward, address, venue_name, approved) FROM stdin;
11	ANH TRAI "SAY HI" 2025 CONCERT	I. ĐIỀU KIỆN VÀ ĐIỀU KHOẢN MUA VÉ:\n●      Khi mua vé, tức là người mua đã đồng ý với các Điều Kiện và Điều Khoản của BTC và Quy Định Tham Gia Chương Trình được ghi rõ tại ticketbox.vn.\n\n●      Ticketbox là đơn vị phân phối vé độc quyền của sự kiện:\n\nAnh Trai “Say Hi” 2025 Concert. Diễn ra vào ngày 27.12.2025 tại Khu Đô Thị Vạn Phúc\n\nTicketbox chịu trách nhiệm giải quyết các vấn đề phát sinh liên quan đến vé mua và vé tặng thông qua hệ thống Ticketbox (bao gồm tính năng “Tặng vé” trên ứng dụng). Ticketbox không chịu trách nhiệm và có quyền từ chối giải quyết các tranh chấp liên quan đến việc trao tặng, chuyển nhượng giữa các bên ngoài hệ thống Ticketbox.\n\n●      Mỗi tài khoản được mua tối đa mười (10) Vé. Một (1) Mã Vé có giá trị sử dụng cho một (1) người và một (1) lần duy nhất.\n\n●      Quy định về độ tuổi:\n\n- Khu vực đứng (các hạng vé SUPERFAN, FANZONE, GA) dành cho Người Tham Dự từ đủ 14 tuổi.\n\n- Khu vực khán đài ngồi (các hạng vé SKY LOUNGE, SVIP, VIP, CAT) dành cho Người Tham Dự từ đủ 08 tuổi.\n\n- Người Tham Dự từ 08 đến dưới 18 tuổi phải mang giấy tờ tùy thân (căn cước công dân, khai sinh,...bản photocopy hoặc hình ảnh) và có người thân (trên 21 tuổi) đi cùng hạng vé  bảo lãnh trong suốt thời gian diễn ra chương trình. Một người thân được phép bảo lãnh tối đa 2 người.\n\n- Người bảo lãnh cam kết chịu hoàn toàn trách nhiệm về việc:\n\n+      Đảm bảo phòng ngừa, ngăn chặn người được bảo lãnh sử dụng các chất kích thích, rượu bia, thuốc lá, chất cháy nổ và các sản phẩm bị cấm theo Quy định tham gia chương trình;\n\n+      Chăm sóc, bảo vệ quyền, lợi ích hợp pháp của Người được bảo lãnh; chịu trách nhiệm chăm sóc y tế hoặc chi trả chi phí chăm sóc y tế cho Người được bảo lãnh hoặc người bị tổn hại sức khỏe do Người được bảo lãnh gây ra trong suốt thời gian bảo lãnh.\n\n- Người Tham Dự đi cùng người từ đủ 8 tuổi đến dưới 18 tuổi vui lòng tải và điền đầy đủ thông tin vào Đơn Bảo Lãnh trước khi đến check-in tại sự kiện. Ban Tổ Chức sẽ kiểm tra và xác nhận đơn tại quầy Thông tin BTC.\n\nhttps://drive.google.com/file/d/1UFXz2bt4SdKemgw-JqSzjoiDHiYJZDHC/view?usp=sharing\n\n- Trong khu vực SKY LOUNGE, Người bảo lãnh chịu hoàn toàn trách nhiệm đảm bảo người được bảo lãnh không sử dụng thức uống có cồn hoặc bất cứ hành động nào không phù hợp lứa tuổi.\n\n●      Vé đã mua KHÔNG đổi, trả, nâng cấp, hủy hay hoàn tiền trong bất kì trường hợp nào. Vé bị mất KHÔNG được xuất lại.\n\n●      Phụ nữ mang thai và người khuyết tật chỉ được mua vé Khu khán đài ngồi.\n\n●      Người Tham Dự cân nhắc và tự chịu trách nhiệm về sức khỏe khi tham gia Chương Trình.\n\n●      Ban Tổ Chức có quyền điều chỉnh, bổ sung nội dung Quy định tham gia chương trình, Điều Kiện và Điều Khoản nếu xét thấy cần thiết, đảm bảo không trái với nội dung mà Người Tham Dự đã đọc và đồng ý. Khi mua vé Người Tham Dự được hiểu là đã đọc, hiểu và đồng ý với Quy định tham gia chương trình, các Điều Kiện và Điều Khoản  cũng như bất kỳ thay đổi nào sau đó. Trường hợp có bất kỳ thay đổi nào đối với Chương trình, Ban Tổ Chức sẽ cung cấp thông tin tại website ticketbox.vn và trên các phương tiện truyền thông của BTC\n\n●      Người Tham Dự có trách nhiệm theo dõi thông báo chính thức từ Ban Tổ Chức/Ticketbox và kiểm tra lại thông tin vé (ngày, giờ, địa điểm, giá) trong trường hợp có thay đổi trước khi sự kiện diễn ra.\n\n●      Vé chỉ được sử dụng để tham gia Chương trình. Không mua vé cho mục đích kinh doanh và không sử dụng vé cho các hoạt động khuyến mãi của hàng hóa, dịch vụ của người mua. Trong trường hợp vi phạm, BTC có quyền thu hồi vé đã mua và không hoàn lại tiền, không cho phép tham dự chương trình bằng những vé này và yêu cầu bồi thường thiệt hại. Quy định này không áp dụng đối với các tổ chức, cá nhân đã đạt được thỏa thuận bằng văn bản với Công ty cổ phần Vie Channel về việc sử dụng vé để khuyến mãi.\n\n●      Trong mọi trường hợp, quyết định của BTC là quyết định cuối cùng.\n\nII. QUY ĐỊNH CHECK IN:\n\n●      Người Tham Dự làm thủ tục check-in đúng khu vực do BTC quy định.\n\n●      Chỉ chấp nhận cho phép người đầu tiên quét mã Vé Sự Kiện được tham dự Chương trình và không giải quyết trường hợp có nhiều hơn một (1) Người Tham Dự check-in cùng một (1) mã vé.\n\n●      Người Tham Dự chịu trách nhiệm bảo mật thông tin mã vé. Người Tham Dự check-in đúng mã vé của mình. BTC không chấp nhận cho Người Tham Dự check-in hộ người thân đi cùng.\n\n●      Khi làm thủ tục check-in, Người Tham Dự sau khi quét mã QR code thành công sẽ nhận được vòng đeo tay và quà tặng tương ứng hạng vé đã mua.\n\n●      Điều kiện hợp lệ tham gia Chương trình: (1) Đeo đúng vòng tay theo khu vực trong suốt Chương trình (còn nguyên vẹn) và (2) Xuất trình Vé Sự Kiện khi được BTC yêu cầu bất kỳ lúc nào. Người Tham Dự không được phép vào khu vực sự kiện nếu không thực hiện đủ hai điều kiện đã đề cập trên.\n\n●      BTC chỉ cấp một (1) vòng tay duy nhất cho một (1) vé, Người Tham Dự chịu trách nhiệm bảo quản cẩn thận.\n\n●      Người Tham Dự không được phép chuyển nhượng Vé Điện Tử hoặc Mã Vé Điện Tử ngoài tính năng “Tặng vé” chính thức trên Ticketbox. Vòng Đeo Tay được cấp phát tại sự kiện sau khi quét mã hợp lệ, không được phép chuyển nhượng cho người khác sử dụng để ra/vào sự kiện. Trường hợp BTC phát hiện, Người Tham Dự không được phép tiếp tục tham gia Chương Trình.\n\n●      BTC có quyền từ chối và không hoàn lại tiền vé trong trường hợp Người Tham Dự check-in chưa đủ tuổi, say xỉn, hoặc trong trạng thái mất kiểm soát hay vi phạm bất kỳ quy định nào trong Quy định tham gia Chương trình này.\n\nCác mốc thời gian check-in:\n\n·       Từ 11:30 -  Bắt đầu xếp hàng vào line check-in\n\n·       Từ 12:00 - 19:00 - Thời gian check-in\n\n·       19:00 - CHƯƠNG TRÌNH BẮT ĐẦU\n\n·       Từ 19:01 đến 19:59 - Làm thủ tục check-in bổ sung, Ban Tổ Chức được quyền thay đổi / sắp xếp lại chỗ đứng / ngồi của Người Tham Dự.\n\n·       Từ 20:00 - Đóng cổng check-in và không hoàn trả lại tiền vé\n\nIII. QUY ĐỊNH THAM GIA CHƯƠNG TRÌNH\n\n+ Chương Trình: là chương trình ANH TRAI “SAY HI” 2025 CONCERT\n\n+ Người Tham Dự: là người sở hữu Vé Điện Tử, Mã Vé Điện Tử và đủ điều kiện tham gia Chương Trình\n\nA.  QUY ĐỊNH CHUNG\n\n●      Quy định về độ tuổi:\n\n- Khu vực đứng (các hạng vé SUPERFAN, FANZONE, GA) dành cho Người Tham Dự từ đủ 14 tuổi.\n\n- Khu vực khán đài ngồi (các hạng vé SKY LOUNGE, SVIP, VIP, CAT) dành cho Người Tham Dự từ đủ 08 tuổi.\n\n- Người Tham Dự từ 08 đến dưới 18 tuổi phải mang giấy tờ tùy thân (căn cước công dân, khai sinh,...bản photocopy hoặc hình ảnh) và có người thân (trên 21 tuổi) đi cùng hạng vé  bảo lãnh trong suốt thời gian diễn ra chương trình. Một người thân được phép bảo lãnh tối đa 2 người\n\n- Người bảo lãnh cam kết chịu hoàn toàn trách nhiệm về việc:\n\n+      Đảm bảo phòng ngừa, ngăn chặn người được bảo lãnh sử dụng các chất kích thích, rượu bia, thuốc lá, chất cháy nổ và các sản phẩm bị cấm theo Quy định tham gia chương trình;\n\n+      Chăm sóc, bảo vệ quyền, lợi ích hợp pháp của Người được bảo lãnh; chịu trách nhiệm chăm sóc y tế hoặc chi trả chi phí chăm sóc y tế cho Người được bảo lãnh hoặc người bị tổn hại sức khỏe do Người được bảo lãnh gây ra trong suốt thời gian bảo lãnh.\n\n- Người Tham Dự đi cùng người từ đủ 8 tuổi đến dưới 18 tuổi vui lòng tải và điền đầy đủ thông tin vào Đơn Bảo Lãnh trước khi đến check-in tại sự kiện. Ban Tổ Chức sẽ kiểm tra và xác nhận đơn tại quầy Thông tin BTC.\n\nhttps://drive.google.com/file/d/1UFXz2bt4SdKemgw-JqSzjoiDHiYJZDHC/view?usp=sharing\n\n- Trong khu vực SKY LOUNGE, Người bảo lãnh chịu hoàn toàn trách nhiệm đảm bảo người được bảo lãnh không sử dụng thức uống có cồn hoặc bất cứ hành động nào không phù hợp lứa tuổi.\n\n●      Người Tham Dự có trách nhiệm theo dõi thông báo chính thức từ Ban Tổ Chức/Ticketbox và kiểm tra lại thông tin vé (ngày, giờ, địa điểm, giá) trong trường hợp có thay đổi trước khi sự kiện diễn ra.\n\n●      Phụ nữ mang thai và người khuyết tật chỉ được mua vé Khu khán đài ngồi.\n\n●      Người Tham Dự tự cân nhắc và chịu trách nhiệm về sức khỏe khi tham gia Chương Trình.\n\n●      Mỗi tài khoản được mua tối đa mười (10) Vé. Một (1) Mã Vé có giá trị sử dụng cho một (1) người và một (1) lần duy nhất.\n\n●      Vui lòng đứng/ngồi đúng khu vực và đúng vị trí số ghế ghi trên vé.\n\n●      Nghiêm cấm quay phim/ chụp hình/ live stream bằng các thiết bị quay chụp chuyên nghiệp các tiết mục biểu diễn dưới mọi hình thức trong khu vực của Chương Trình. Ban Tổ Chức của Chương trình (sau đây gọi tắt là “BTC”) có quyền yêu cầu người vi phạm ra khỏi khu vực biểu diễn và không hoàn trả lại tiền vé.\n\n●      Khi tham gia sự kiện, Người Tham Dự đã đồng ý hình ảnh của mình được sử dụng khai thác cho sản phẩm ghi hình, thu âm.\n\n●      Vé chỉ được sử dụng để tham gia Chương trình. Không mua vé cho mục đích kinh doanh và không sử dụng vé cho các hoạt động khuyến mãi của hàng hóa, dịch vụ của người mua. Trong trường hợp vi phạm, BTC được quyền thu hồi vé đã mua và không hoàn lại tiền, không cho phép tham dự chương trình bằng những vé này và yêu cầu bồi thường thiệt hại. Quy định này không áp dụng đối với các tổ chức, cá nhân đã đạt được thỏa thuận bằng văn bản với Công ty cổ phần Vie Channel về việc sử dụng vé để khuyến mãi.\n\n●      Mọi khiếu nại về vé và quyền lợi kèm vé phải được thực hiện trước thời điểm đóng cửa Check-in. Ban Tổ Chức không giải quyết đối với bất kỳ khiếu nại nào được đưa ra sau thời điểm đóng cửa Check-in.\n\n●      Tuyệt đối tuân thủ quy định của BTC và hướng dẫn của đội ngũ an ninh. Trong trường hợp Người Tham Dự có hành động quá khích, kích động đám đông, tự ý di chuyển vào khu vực sân khấu, khu vực cấm, gây mất trật tự, sử dụng chất kích thích, chất cấm, trong trạng thái mất kiểm soát hành vi … BTC có quyền yêu cầu người vi phạm ra khỏi khu vực biểu diễn hoặc nhờ cơ quan chức năng can thiệp và không hoàn trả lại tiền vé.\n\n●      Người Tham Dự đồng ý ủy quyền cho BTC/Nhân viên y tế/ An ninh/ Người đại diện/ Nhà thầu trợ giúp vận chuyển Người Tham Dự đến các cơ sở y tế để chữa trị (có thể bao gồm việc sơ tán, nhập viện, truyền máu, phẫu thuật và cấp thuốc). Người Tham Dự đồng ý chi trả toàn bộ chi phí liên quan đến việc chăm sóc, vận chuyển và điều trị của Cơ sở y tế (nếu có).\n\n●      Không phá hoại, gây thiệt hại hay trộm cắp bất kì tài sản nào trong khuôn viên sự kiện.\n\n●      Trong mọi trường hợp, quyết định của BTC là quyết định cuối cùng.\n\n●      Người Tham Dự chịu trách nhiệm theo dõi thông tin cập nhật về Chương trình tại website ticketbox.vn và các phương tiện truyền thông của BTC.\n\nB. QUYỀN HẠN CỦA BAN TỔ CHỨC\n\nBTC có quyền:\n\n●      Từ chối giải quyết các Vé Điện Tử và Mã Vé Điện Tử, Vòng Đeo Tay không do BTC trực tiếp phát hành.\n\n●      Chỉ chấp nhận cho phép người đầu tiên quét mã Vé Điện Tử được tham dự sự kiện. BTC từ chối giải quyết trường hợp có nhiều hơn một (1) Người Tham Dự check-in cùng một (1) mã vé. Người Tham Dự tự bảo mật Mã Vé.\n\n●      Tạm ngưng/ ngưng không cho Người Tham Dự tiếp tục tham gia Chương Trình nếu Người Tham Dự không tuân thủ những quy định của BTC.\n\n●      Không giải quyết bất kỳ tranh chấp nào liên quan đến việc trao tặng, chuyển nhượng Vé Điện Tử, bán lại Vé Điện Tử giữa các bên liên quan ngoài hệ thống Ticketbox.\n\n●      Yêu cầu không đem các hàng hóa, vật phẩm giả mạo, không chính thức liên quan đến chương trình buôn bán tại sự kiện.\n\n●      Yêu cầu không mang vật phẩm, quần áo, mũ nón, băng rôn…mang logo, biểu tượng của nhãn hàng hóa để quảng bá tại sự kiện. Ban Tổ Chức được quyền thu hồi các vật phẩm được quảng bá, bán tại sự kiện và không cho Người Tham Dự, nhân viên bán hàng, nhân viên tiếp thị có các hành động trên tiếp tục tham dự sự kiện.\n\n●      Kiểm tra Vòng Đeo Tay tại bất kỳ thời điểm nào trong lúc diễn ra sự kiện. BTC có quyền yêu cầu Người Tham Dự rời khỏi khu vực diễn ra chương trình nếu thiếu vòng đeo tay hoặc các phương tiện nhận diện khác mà Ban Tổ Chức đã cung cấp khi vào tham gia sự kiện.\n\n●      Từ chối phục vụ và không hoàn trả lại tiền vé bất kỳ trường hợp nào mà BTC đánh giá là Người Tham Dự có hành vi không phù hợp để tham gia Chương Trình.\n\n●      Ban Tổ Chức có quyền điều chỉnh, bổ sung nội dung Quy định tham gia chương trình, Điều Kiện và Điều Khoản nếu xét thấy cần thiết, đảm bảo không trái với nội dung mà Người Tham Dự đã đọc và đồng ý. Khi mua vé Người Tham Dự được hiểu là đã đọc, hiểu và đồng ý với Quy định tham gia chương trình, các Điều Kiện và Điều Khoản  cũng như bất kỳ thay đổi nào sau đó. Trường hợp có bất kỳ thay đổi nào đối với Chương trình, Ban Tổ Chức sẽ cung cấp thông tin tại website ticketbox.vn và trên các phương tiện truyền thông của BTC\n\nC. THỦ TỤC CHECK-IN, RA VÀO CỬA\n\nNgười Tham Dự khi làm thủ tục check-in, ra vào cửa phải tuân thủ những quy định sau đây:\n\n●      Chương trình sẽ chính thức bắt đầu lúc 19:00 (thời gian bắt đầu có thể thay đổi tuỳ thuộc vào sự sắp xếp của BTC và sẽ được thông báo tại sự kiện hoặc qua các kênh truyền thông chính thức của BTC, nếu có)\n\n●      Có mặt tại khu vực làm thủ tục check-in từ 12:00 đến 19:00. Từ 19:01 đến 19:59, làm thủ tục check-in bổ sung, Ban Tổ Chức được quyền thay đổi / sắp xếp lại chỗ đứng / ngồi của Người Tham Dự.\n\n●      Cửa check-in sẽ đóng vào 20:00. Đối với trường hợp chưa làm thủ tục sau 20:00 sẽ không được làm thủ tục check-in và sẽ không được phép tham gia Chương trình và không được hoàn trả lại tiền vé.\n\n●      Các quà tặng kèm vé sẽ được phát tại cổng sau khi check-in tại sự kiện. Người Tham Dự vui lòng kiểm tra trước khi rời khỏi khu vực check-in. BTC sẽ không giải quyết trường hợp khiếu nại phát sinh sau đó.\n\n●      Cung cấp giấy tờ tùy thân có năm sinh để chứng minh Người Tham Dự đủ tuổi tham gia khi BTC yêu cầu.\n\n●      Xuất trình Mã Vé Điện Tử và nhận Vòng Đeo Tay tương ứng với chỗ đứng/chỗ ngồi trên vé.\n\n●      Có đầy đủ Mã Vé Điện Tử, Vòng Đeo Tay, Dấu Mộc di chuyển mới được phép ra/vào khu vực biểu diễn.\n\n●      Tự bảo quản Vé Điện Tử, Mã Vé Điện Tử và Vòng Đeo Tay trong suốt quá trình tham gia Chương Trình.\n\n●      Người Tham Dự không được phép chuyển nhượng Vé Điện Tử hoặc Mã Vé Điện Tử ngoài tính năng “Tặng vé” chính thức trên Ticketbox. Vòng Đeo Tay được cấp phát tại sự kiện sau khi quét mã hợp lệ, không được phép chuyển nhượng cho người khác sử dụng để ra/vào sự kiện. Trường hợp BTC phát hiện, Người Tham Dự không được phép tiếp tục tham gia Chương Trình.\n\n●      Người Tham Dự phải tuân thủ quy định về vật dụng bị cấm tại Mục D.\n\n●      Làm thủ tục vào cửa đúng khu vực do BTC quy định.\n\n●      BTC có quyền từ chối và không hoàn lại tiền vé trong trường hợp Người Tham Dự check-in chưa đủ tuổi, say xỉn, hoặc trong trạng thái mất kiểm soát hay vi phạm bất kỳ quy định nào trong Quy định tham gia Chương trình này.\n\nD. CÁC VẬT DỤNG CẤM TẠI BUỔI DIỄN ANH TRAI “SAY HI” 2025 CONCERT\n\n●      Balo/túi xách có kích thước lớn hơn 25cm x 35cm x 15cm.\n\n●      Nghiêm cấm sử dụng thuốc lá trong khu vực sự kiện.\n\n●      Cấm không được mang các chất cấm (chất kích thích), nước uống có cồn, thuốc lá, thuốc lá điện tử vào khu vực sự kiện.\n\n●      Vũ khí dưới bất kỳ hình thức nào: đèn pin/ đèn laser/ các vật nhọn/ viết/ ô dù/ chân máy chụp ảnh monopod/ gậy selfie.\n\n●      Áp phích/ băng cổ vũ/ bảng chỉ dẫn mang tính chất chính trị, kích động, ngôn từ không phù hợp thuần phong mỹ tục và banner lớn hơn 15cm x 40cm.\n\n●      Các loại động vật/ thú nuôi.\n\n●      Máy tính bảng/ ipad/ go-pro/ ống kính chuyên nghiệp/ thiết bị chụp ảnh chuyên nghiệp hay máy ảnh có ống kính có thể tháo rời/ thiết bị ghi hình và thu âm chuyên nghiệp.\n\n●      Bật lửa/ nến/ pháo bông và các chất phát nổ.\n\n●      Chai thủy tinh/ chai nhựa/ chai nhôm/ lọ thiếc hay các vật chứa nhựa cứng.\n\n●      Thức ăn/ đồ uống/ ghế ngồi cá nhân từ bên ngoài vào khuôn viên sự kiện.\n\n●      Bất kỳ vật dụng dễ bốc cháy như rượu / nước hoa/ chai xịt khử mùi cơ thể/ xăng dầu…\n\nE. MIỄN TRỪ TRÁCH NHIỆM\n\nBTC cam kết nỗ lực tối đa và sử dụng tất cả các biện pháp cần thiết hợp lý để đảm bảo an toàn, an ninh chung của Sự kiện và đảm bảo tuân thủ pháp luật; tuy nhiên, trong phạm vi tối đa mà pháp luật cho phép, BTC sẽ được miễn trừ mọi trách nhiệm đối với:\n\n●      Các tai nạn, thương tích hoặc tổn thất tinh thần khác xảy ra tại Sự kiện do Người Tham Dự không tuân theo các quy định và hướng dẫn của BTC.\n\n●      Các tổn hại về sức khỏe, tinh thần hay nhân mạng xảy ra đối với Người Tham Dự trong thời gian và không gian tổ chức Sự kiện do (i) các bệnh lý nền, bệnh tật, rối loạn tâm thần, dịch bệnh, chấn thương tái phát hoặc trở nặng hơn, hay (ii) bất kì tổn thương nào khác hoàn toàn do Người Tham Dự tự gây ra trong quá trình tham dự.\n\n●      Sự an toàn của tài sản cá nhân tại Sự kiện: BTC không chịu trách nhiệm cho bất cứ sự mất mát nào khi xảy ra các sự kiện bất khả kháng, sự cố về thời tiết... ảnh hưởng đến buổi biểu diễn và chất lượng của buổi biểu diễn.\n\n●      Các trường hợp miễn trừ trách nhiệm khác phù hợp theo quy định pháp luật của Việt Nam.\n\nF. ĐỔI, TRẢ, HỦY VÉ\n\n●      Chương trình chỉ bán vé qua một hệ thống duy nhất là ticketbox.vn. Vé đã mua không được đổi, trả, nâng cấp, hủy hay hoàn tiền trong bất kỳ trường hợp nào. Vé bị mất không được xuất lại.\n\n●      Trường hợp Chương trình bị dời ngày do các sự kiện bất khả kháng:\n\n-          Sự kiện bất khả kháng là sự kiện xảy ra một cách khách quan không thể lường trước được và không thể khắc phục được mặc dù đã áp dụng mọi biện pháp cần thiết và khả năng cho phép, nằm ngoài khả năng kiểm soát của con người, bao gồm nhưng không giới hạn các trường hợp: thiên tai, dịch bệnh, hỏa hoạn, lũ lụt, cháy nổ, động đất, phá hoại, nổi dậy, bạo động, chiến tranh hoặc thảm họa tương tự khác, quốc tang, các trường hợp khẩn cấp quốc gia, lệnh cấm của cơ quan chức năng có thẩm quyền ngăn cấm việc tổ chức Chương trình.\n\n-          Sự kiện bất khả kháng bao gồm việc xảy ra hoặc tái bùng phát dịch bệnh SARS-CoV-2 hoặc các dịch bệnh có mức độ lây lan tương tự và cơ quan có thẩm quyền ban bố lệnh cấm tụ tập đông người, thực hiện giãn cách xã hội dẫn đến việc không thể tổ chức Chương trình mặc dù Các Bên đã áp dụng mọi biện pháp có thể.\n\n-          Trong trường hợp Chương trình bị dời ngày do các sự kiện bất khả kháng nói trên, đơn vị tổ chức Chương trình sẽ thông báo đến Người mua thông qua phương tiện truyền thông của BTC về lịch tổ chức mới và không hoàn trả tiền vé.\n\n-          Trường hợp Chương trình bị hủy do các sự kiện bất khả kháng đã đề cập tại Quy định này, Đơn vị tổ chức Chương trình và Đơn vị bán vé sẽ thông báo đến Người mua thông qua phương tiện truyền thông của BTC và sẽ hoàn trả lại tiền trong vòng 2 tuần qua chuyển khoản ngân hàng hoặc trả bằng tiền mặt phù hợp với sự sắp xếp của Ban Tổ Chức.\n\nNgười sở hữu Vé Điện Tử và Mã Vé Điện Tử được mặc định đã đọc, hiểu và đồng ý đối với các quy định này và cam kết tuân thủ các quy định tại đây và các quy định khác được niêm yết, thông báo tại buổi biểu diễn.\n\nNgười sở hữu Vé Điện Tử, Mã Vé Điện Tử đồng ý rằng BTC có toàn quyền áp dụng mọi biện pháp cần thiết khác không được quy định tại đây nhằm đảm bảo an ninh, an toàn và chất lượng của buổi biểu diễn	https://booking-ticket-web.s3.amazonaws.com/images/event_11.png	2025-11-21 17:30:00	\N	Music	2025-11-19 08:30:36.042073	2025-12-18 00:37:15.451815	1	\N	\N	\N	Khu đô thị Vạn Phúc, Phường Hiệp Bình Phước, Quận Thủ Đức, Thành Phố Hồ Chí Minh	Khu đô thị Vạn Phúc	approved
13	The “Traditional Water Puppet Show” - Múa rối nước	*Quý khách vui lòng tham dự đúng giờ, trường hợp quý khách đến trễ hơn giờ diễn chung tôi sẽ không hỗ trợ\r\n\r\n**Please attend on time, in case customer arrive later than the concert time, we will not support	https://booking-ticket-web.s3.amazonaws.com/images/event_13.png	2025-11-26 18:30:00	\N	Theatre	2025-11-19 08:37:38.966292	2025-12-18 00:22:31.353476	1	\N	\N	\N	55B Nguyễn Thị Minh Khai, Phường Bến Thành, Quận 1, Thành Phố Hồ Chí Minh	Cung Văn Hoá Lao Động TP.HCM	approved
19	PHAN ĐINH TÙNG: ĐINH SHOW IN HÀ NỘI 2025	<div><strong>PHAN ĐINH T&Ugrave;NG: ĐINH SHOW H&Agrave; NỘI 2025&nbsp;</strong></div>\r\n<div>&nbsp;</div>\r\n<div>Những th&aacute;ng ng&agrave;y chạy show, ghi h&igrave;nh, lưu diễn khiến thời gian tr&ocirc;i đi rất nhanh, nhưng trong những khoảnh khắc lắng lại, Phan Đinh T&ugrave;ng lu&ocirc;n nghĩ về một điều - đ&atilde; đến l&uacute;c cần c&oacute; một đ&ecirc;m nhạc đ&uacute;ng nghĩa đ&ecirc;m nhạc. Một đ&ecirc;m thật trọn vẹn để được t&acirc;m sự, để nh&igrave;n lại, để tri &acirc;n tất cả những y&ecirc;u thương m&agrave; mọi người đ&atilde; d&agrave;nh cho T&ugrave;ng suốt bao năm qua.</div>\r\n<div>Đ&oacute; l&agrave; l&yacute; do ĐINH SHOW ra đời.</div>\r\n<div>&nbsp;</div>\r\n<div>V&igrave; sao lại l&agrave; chữ &ldquo;ĐINH&rdquo;?</div>\r\n<div>Đầu ti&ecirc;n, "Đinh" cũng ch&iacute;nh l&agrave; họ Mẹ, người Mẹ k&iacute;nh y&ecirc;u v&agrave; l&agrave; thần tượng lớn nhất, c&oacute; sức ảnh hưởng nhất đến cuộc đời của T&ugrave;ng.</div>\r\n<div>Với T&ugrave;ng, &ldquo;Đinh&rdquo; kh&ocirc;ng chỉ l&agrave; t&ecirc;n đệm trong nghệ danh m&agrave; c&ograve;n gắn với nhiều c&acirc;u chuyện "dở kh&oacute;c dở cười". Bao năm đi h&aacute;t, đ&atilde; c&oacute; rất nhiều kh&aacute;n giả v&ocirc; t&igrave;nh gọi &ldquo;Phan Đ&igrave;nh T&ugrave;ng&rdquo; thay v&igrave; "Phan Đinh T&ugrave;ng". Điều đ&oacute; khiến T&ugrave;ng chợt nghĩ - đ&atilde; đến l&uacute;c T&ugrave;ng n&ecirc;n n&oacute;i thật r&otilde; r&agrave;ng, đầy tr&acirc;n trọng - rằng &ldquo;Đinh&rdquo; mới thực sự ch&iacute;nh l&agrave; con người nghệ sĩ của T&ugrave;ng, l&agrave; dấu ấn, niềm ki&ecirc;u h&atilde;nh, l&agrave; một phần kh&ocirc;ng thể thiếu trong h&agrave;nh tr&igrave;nh nghệ thuật của m&igrave;nh.&nbsp;</div>\r\n<div>Nhưng &ldquo;ĐINH&rdquo; c&ograve;n mang một &yacute; nghĩa kh&aacute;c nữa - đ&oacute; l&agrave; những g&igrave; tốt đẹp nhất, "đinh" nhất m&agrave; T&ugrave;ng c&ugrave;ng c&aacute;c cộng sự g&oacute;i gh&eacute;m để mang đến đ&ecirc;m nhạc n&agrave;y. Những ca kh&uacute;c "đinh" đ&atilde; đi c&ugrave;ng tuổi trẻ của bao thế hệ. Những s&acirc;n khấu "đinh" từng khiến T&ugrave;ng ch&aacute;y hết m&igrave;nh.&nbsp;</div>\r\n<div>3 nghệ sĩ kh&aacute;ch mời t&agrave;i năng: Anh T&agrave;i TỰ LONG - Anh T&agrave;i H&Agrave; L&Ecirc; - Anh T&agrave;i ĐỖ HO&Agrave;NG HIỆP c&ugrave;ng MC Ph&iacute; Linh, tất cả sẽ c&ugrave;ng T&ugrave;ng mang đến một trải nghiệm ĐINH SHOW thật đ&aacute;ng nhớ đến Qu&yacute; kh&aacute;n giả.</div>\r\n<div>Tất cả, gom lại, l&agrave;m n&ecirc;n một đ&ecirc;m T&ugrave;ng muốn gọi l&agrave; &ldquo;ĐINH&rdquo; - cũng sẽ l&agrave; cột mốc mở ra nhiều chặng đường mới, dự &aacute;n mới, những h&agrave;nh tr&igrave;nh mới của T&ugrave;ng sau n&agrave;y.</div>\r\n<div>Đ&ecirc;m 26/12/2025 cũng l&agrave; ng&agrave;y T&ugrave;ng bước sang tuổi 50. Một cột mốc đủ lớn để nh&igrave;n lại, đủ b&igrave;nh y&ecirc;n v&agrave; vững v&agrave;ng để mỉm cười với tất cả những g&igrave; đ&atilde; qua. H&agrave; Nội th&aacute;ng 12 c&oacute; c&aacute;i lạnh rất ri&ecirc;ng - se se, trầm lắng v&agrave; đầy ho&agrave;i niệm. T&ugrave;ng tin c&aacute;i kh&ocirc;ng kh&iacute; ấy sẽ khiến ĐINH SHOW trở th&agrave;nh một đ&ecirc;m để nhớ, đ&ecirc;m để tất cả ch&uacute;ng ta siết tay nhau, kề b&ecirc;n nhau v&agrave; để &acirc;m nhạc dẫn dắt trong những cảm x&uacute;c huyền diệu nhất của H&agrave; Nội những ng&agrave;y cuối năm.</div>\r\n<div>&nbsp;</div>\r\n<div>ĐINH SHOW đối với T&ugrave;ng l&agrave; lời cảm ơn. Lời cảm ơn d&agrave;nh cho từng người đ&atilde; ở lại, đ&atilde; lắng nghe, đ&atilde; y&ecirc;u mến Phan Đinh T&ugrave;ng suốt bao năm nay.</div>	https://booking-ticket-web.s3.amazonaws.com/images/event_19.jpg	2025-12-04 19:30:00	\N	Music	2025-11-19 22:55:26.497816	2025-12-18 00:22:31.353476	1	Thành phố Hà Nội	Quận Ba Đình	Phường Giảng Võ	08 Nguyễn Công Hoan	SOL8 LIVE STAGE	approved
12	VIETNAM PRO-AM BASKETBALL CHAMPIONSHIP 2025	GIỚI THIỆU SỰ KIỆN\r\nVBC 2025: Sân Chơi Bóng Rổ Chuyên Nghiệp & Bán Chuyên Hàng Đầu Việt Nam!\r\n\r\nGiải đấu quy tụ 10 đội bóng mạnh nhất từ 3 miền, với 140 VĐV tranh tài để giành ngôi vô địch. Cơ hội chiêm ngưỡng những trận cầu đỉnh cao, giao lưu cùng các VĐV nổi tiếng và trải nghiệm không gian sự kiện sôi động. Lý do không nên bỏ lỡ: Xem bóng rổ đỉnh cao, gặp gỡ thần tượng và hòa mình vào không khí lễ hội thể thao!\r\n\r\nCHI TIẾT SỰ KIỆN\r\nThời gian: 26/10/2025 – 05/11/2025.\r\n\r\nĐịa điểm: Nhà thi đấu Phường Cầu Giấy\r\n\r\nChương trình chính:\r\n\r\nGiải đấu VBC 2025: Các trận đấu vòng bảng, tứ kết, bán kết và chung kết gay cấn. Lịch thi đấu chi tiết sẽ được công bố trên Fanpage chính thức.\r\n\r\nKhách mời:\r\n\r\nCơ hội giao lưu, gặp gỡ các Khách mời đặc biệt, KOLs.\r\n\r\nTrải nghiệm đặc biệt:\r\n\r\nKhu Trải nghiệm/Gian hàng: Các quầy gian hàng đối tác với nhiều hoạt động tương tác, trò chơi, và khu vực chụp ảnh lưu niệm (photo booth) cho khách tham dự.\r\n\r\nĐIỀU KHOẢN VÀ ĐIỀU KIỆN\r\n[TnC] Sự kiện:\r\n\r\nTrẻ em: Dưới 3 tuổi được miễn phí vé, ngồi chung ghế với phụ huynh.\r\n\r\nQuy định cấm:\r\n\r\nTuyệt đối Không hút thuốc (thuốc lá thường và thuốc lá điện tử) trong nhà thi đấu.\r\n\r\nVật nuôi: Được phép mang vào nếu đặt trong balo/túi chuyên dụng. Không được thả rông trong nhà thi đấu.	https://booking-ticket-web.s3.amazonaws.com/images/event_12.jpg	2025-12-01 17:30:00	\N	Sports	2025-11-19 08:36:18.565742	2025-12-18 00:22:31.353476	1	\N	\N	\N	35 TRẦN QUÝ KIÊN, Quận Cầu Giấy, Thành Phố Hà Nội	NHÀ THI ĐẤU CẦU GIẤY	approved
22	Vở kịch rối: "Truyền Thuyết Sơn Tinh Thuỷ Tinh"		https://booking-ticket-web.s3.amazonaws.com/images/event_22.jpg	2025-11-27 00:00:00	\N	Theatre	2025-11-25 05:17:12.046095	2025-12-18 00:22:31.353476	1	Thành phố Hồ Chí Minh	Quận 1	Phường Bến Thành		Nhà Hát Thiếu Nhi NỤ CƯỜI	approved
10	Nhạc Kịch Không Gia Đình - Lễ Hội Tuyết Trắng	Nhạc kịch Không Gia Đình - Lễ Hội Tuyết Trắng\r\nDự án được lấy cảm hứng từ tiểu thuyết “Sans Famille” (Không Gia Đình) của nhà văn Pháp Hector Malot – câu chuyện về cậu bé Rémi trên hành trình đi tìm gia đình, tình thương và niềm tin vào con người. We Humanty – Sans Famille được thiết kế như một “lễ hội nghệ thuật đa giác quan” , nơi khán giả không chỉ xem mà còn sống trong câu chuyện. Làng Giáng sinh cổ: không gian ngoài trời tái hiện bầu không khí nước Pháp mùa đông, ánh đèn vàng, tuyết trắng, hương bánh ngọt và âm nhạc ấm áp. Vùng ký ức của Rémi: triển lãm nghệ thuật ánh sáng – âm thanh kể lại hành trình cảm xúc của cậu bé qua “những lá thư lòng nhân ái” . Nhà Milligan & Làng Chevenon: khu workshop “Stories that Heal” , nơi khán giả được trải nghiệm ẩm thực hương vị nước Pháp Nhà hát tình yêu: nơi diễn ra vở nhạc kịch “Không Gia Đình” (2 suất diễn) và Gala Vinh danh We Humanity Awards. The Humanity Lights: nghi lễ thắp nến – tuyết rơi – hợp xướng “O Holy Night” khép lại lễ hội bằng hình ảnh nhân văn đầy xúc động.	https://booking-ticket-web.s3.amazonaws.com/images/event_10.png	2025-11-29 10:30:00	\N	Theatre	2025-11-19 06:59:58.168203	2025-12-18 00:22:31.353476	1	\N	\N	\N	17 Phạm Hùng, Phường Mễ Trì, Quận Nam Từ Liêm, Thành Phố Hà Nội	Cung Thiếu Nhi Hà Nội	approved
21	Đêm Cổ Tích Cùng Vạn Phúc Water Show	<p style="text-align: center;"><strong>Đ&Ecirc;M CỔ T&Iacute;CH C&Ugrave;NG VAN PHUC WATER SHOW</strong></p>\r\n<p>Th&aacute;ng 11 khi th&agrave;nh phố bắt đầu kho&aacute;c l&ecirc;n m&igrave;nh hơi se lạnh, Van Phuc City lại chuẩn bị viết n&ecirc;n một &ldquo;đ&ecirc;m cổ t&iacute;ch&rdquo; c&oacute; thật. Nơi &aacute;nh s&aacute;ng, nhạc nước v&agrave; cảm x&uacute;c h&ograve;a quyện th&agrave;nh bản giao hưởng diệu kỳ.</p>\r\n<ul>\r\n<li>19h30 | Thứ bảy | 29/11/2025</li>\r\n<li>Quảng trường Diamond, Van Phuc City, Quốc lộ 13, P.Hiệp B&igrave;nh, TP.HCM</li>\r\n</ul>\r\n<p>H&agrave;ng ng&agrave;n tia nước nhảy m&uacute;a trong kh&ocirc;ng trung, vươn cao h&agrave;ng chục m&eacute;t theo từng nhịp nhạc sống động.</p>\r\n<p>Hệ thống laser &ndash; LED đa tầng b&ugrave;ng nổ &aacute;nh s&aacute;ng, biến quảng trường th&agrave;nh &ldquo;vũ trụ sắc m&agrave;u&rdquo; rực rỡ.</p>\r\n<p>&Acirc;m thanh s&ocirc;i động lan tỏa khắp kh&ocirc;ng gian, khuấy động cảm x&uacute;c h&agrave;ng trăm kh&aacute;n giả.&nbsp;</p>\r\n<p>Đ&acirc;y kh&ocirc;ng chỉ l&agrave; một buổi tr&igrave;nh diễn m&agrave; l&agrave; một đại tiệc thị gi&aacute;c đỉnh cao. Một đ&ecirc;m để sống trọn với &acirc;m nhạc, &aacute;nh s&aacute;ng v&agrave; cảm x&uacute;c.</p>	https://booking-ticket-web.s3.amazonaws.com/images/event_21.jpg	2025-12-05 18:30:00	\N	Theatre	2025-11-24 02:00:09.61002	2025-12-18 00:22:31.353476	1	Thành phố Hồ Chí Minh	Thành phố Thủ Đức	Phường Hiệp Bình Phước	Quảng Trường Nhạc Nước, KĐT Vạn Phúc City	Vạn Phúc Water Show	approved
20	The Vienna Concert: Chamber night by the Vienna Chamber Orchestra	<div>[MỞ B&Aacute;N V&Eacute;] Chamber Night by The Vienna Chamber Orchestra<br>🎼 Đ&ecirc;m thứ hai của The Vienna Concert, mang t&ecirc;n &ldquo;Chamber Night by The Vienna Chamber Orchestra&rdquo; mở ra chuyến du ngoạn đến với c&aacute;i n&ocirc;i của &acirc;m nhạc cổ điển &ndash; nơi tinh thần Vienna được t&aacute;i hiện trọn vẹn trong từng giai điệu.</div>\r\n<div>🎶🎼 D&agrave;n nhạc Th&iacute;nh ph&ograve;ng Vienna sẽ mang đến &acirc;m nhạc đạt đến đỉnh cao của sự c&acirc;n bằng, tinh tế v&agrave; sang trọng, dẫn lối kh&aacute;n giả đi từ những giai điệu tươi s&aacute;ng, rực rỡ của Mozart đến sự h&oacute;m hỉnh, uy&ecirc;n b&aacute;c của Haydn &ndash; hai trụ cột đ&atilde; l&agrave;m n&ecirc;n huy ho&agrave;ng cho Trường ph&aacute;i Cổ điển Vienna.</div>\r\n<div><br>🎼 Programs:<br>\r\n<p><strong>Johann Strauss II&nbsp;</strong>&mdash;<strong> </strong>Fledermaus Ouvert&uuml;re</p>\r\n<p><strong>Eduard Strauss </strong>&mdash;<strong> </strong>Mit Extrapost, Op. 259</p>\r\n<p><strong>Johann Strauss II </strong>&mdash; Wiener Blut, Op. 354</p>\r\n<p><strong>Johann &amp; Josef Strauss </strong>&mdash; &ldquo;Pizzicato&rdquo; Polka, Op. 449</p>\r\n<p><strong>Johann Strauss II </strong>&mdash; Geschichten aus dem Wienerwald, Op. 325</p>\r\n<p><strong>Johann Strauss II </strong>&mdash; Unter Donner und Blitz Polka, Op. 324</p>\r\n</div>\r\n<div>⏰ Thời gian: 20h00 | Thứ S&aacute;u ng&agrave;y 28/11/2025<br>📍 Địa điểm: Nh&agrave; h&aacute;t Hồ Gươm - 40 H&agrave;ng B&agrave;i, Cửa Nam, H&agrave; Nội</div>\r\n<div>🎶 Dàn nhạc Thính phòng Vienna được th&agrave;nh lập v&agrave;o năm 1946. Sau hơn 75 năm cống hiến cho nghệ thuật, d&agrave;n nhạc lu&ocirc;n khẳng định vững v&agrave;ng vị thế l&agrave; một trong những d&agrave;n nhạc th&iacute;nh ph&ograve;ng h&agrave;ng đầu thế giới.</div>\r\n<div>✨👏 H&atilde;y để những giai điệu cổ điển đưa bạn trở về với vẻ đẹp thuần khiết của &acirc;m nhạc ch&acirc;u &Acirc;u.<br>📞 Li&ecirc;n hệ đặt v&eacute; qua hotline v&agrave; fanpage Nh&agrave; h&aacute;t Hồ Gươm</div>	https://booking-ticket-web.s3.amazonaws.com/images/event_20.jpg	2025-11-26 00:00:00	\N	Music	2025-11-23 02:33:17.145208	2025-12-18 00:22:31.353476	1	Thành phố Hà Nội			40 Hàng Bài	Nhà hát Hồ Gươm	approved
2	[BẾN THÀNH] Đêm nhạc Chu Thúy Quỳnh - Nguyễn Kiều Oanh\n	​GHI CHÚ: Chỗ đặt sẽ được sắp xếp tự động theo thứ tự thanh toán (Một vài vị trí trung tâm sẽ hơi vướng cột)\n\nPhòng trà Bến Thành có phục vụ F&B, vui lòng không mang đồ ăn thức uống từ ngoài vào\n\n- Phòng trà có phục vụ nước uống,quý khách vui lòng không mang thức ăn và nước uống từ bên ngoài vào phòng trà.\n\n- Quý khách không gọi nước phòng trà sẽ tính phí phụ thu là 80.000VND/người.\n\n- Một vài vị trí trung tâm sẽ hơi vướng cột.\n\n- Chỗ đặt sẽ được xếp tự động theo thứ tự thanh toán.	https://salt.tkbcdn.com/ts/ds/4f/79/43/cf4511899ed56679c83fc46f27f23e18.jpg	2025-11-15 20:00:00	2025-11-15 22:00:00	Music	2025-11-15 23:00:13.629183	2025-12-18 00:36:31.412451	\N	\N	\N	\N	Lầu 3, Nhà hát Bến Thành\n\nSố 6 Mạc Đỉnh Chi, Phường Bến Nghé, Quận 1, Thành Phố Hồ Chí Minh	[BẾN THÀNH] Đêm nhạc Chu Thúy Quỳnh - Nguyễn Kiều Oanh	approved
26	ONE PIECE - MUSIC SYMPHONY	<div style="text-align: center;"><strong>ONE PIECE - MUSIC SYMPHONY</strong></div>\r\n<div>\r\n<div class="ace-line ace-line old-record-id-IXcQd4La2oSXHUxqsOdjXpn8p6c">Khởi động hơn 10 năm trước, ONE PIECE Music Symphony l&agrave; buổi h&ograve;a nhạc One Piece ch&iacute;nh thức duy nhất, với &acirc;m nhạc được phối kh&iacute; v&agrave; gi&aacute;m tuyển trực tiếp c&ugrave;ng nh&agrave; soạn nhạc nguy&ecirc;n t&aacute;c Kohei Tanaka, v&agrave; được cấp ph&eacute;p bởi TOEI ANIMATION.</div>\r\n<div class="ace-line ace-line old-record-id-IXcQd4La2oSXHUxqsOdjXpn8p6c">&nbsp;</div>\r\n<div class="ace-line ace-line old-record-id-IXcQd4La2oSXHUxqsOdjXpn8p6c">Năm 2024 đ&aacute;nh dấu năm thứ 11 chương tr&igrave;nh c&oacute; mặt tại ch&acirc;u &Aacute;, năm thứ 10 tại ch&acirc;u &Acirc;u v&agrave; năm thứ 2 tại Mỹ. Chương tr&igrave;nh đ&atilde; ch&aacute;y v&eacute; tại nhiều nh&agrave; h&aacute;t danh tiếng tr&ecirc;n thế giới như Nh&agrave; h&aacute;t Dolby Theatre (Los Angeles), Philharmonie (Paris) v&agrave; S&acirc;n vận động C&ocirc;ng nh&acirc;n Bắc Kinh (Beijing Workers&rsquo; Stadium).</div>\r\n<div class="ace-line ace-line old-record-id-IXcQd4La2oSXHUxqsOdjXpn8p6c">&nbsp;</div>\r\n<div class="ace-line ace-line old-record-id-IXcQd4La2oSXHUxqsOdjXpn8p6c">ONE PIECE Music Symphony cũng từng được biểu diễn bởi nhiều d&agrave;n nhạc giao hưởng quốc gia, bao gồm Royal Philharmonic Concert Orchestra, Aarhus Symfoniorkester, v&agrave; tại Ph&aacute;p l&agrave; c&aacute;c d&agrave;n nhạc quốc gia của Strasbourg, Marseille v&agrave; Mulhouse.</div>\r\n<div class="ace-line ace-line old-record-id-IXcQd4La2oSXHUxqsOdjXpn8p6c">&nbsp;</div>\r\n<div class="ace-line ace-line old-record-id-IXcQd4La2oSXHUxqsOdjXpn8p6c">Với h&igrave;nh ảnh được đồng bộ ho&agrave;n hảo c&ugrave;ng nhạc nền tuyển chọn v&agrave; tr&igrave;nh chiếu tr&ecirc;n m&agrave;n h&igrave;nh khổng lồ HD, chương tr&igrave;nh lu&ocirc;n tr&agrave;n ngập h&agrave;nh động &ndash; phi&ecirc;u lưu &ndash; cảm x&uacute;c! Dưới sự thăng hoa của d&agrave;n nhạc giao hưởng hơn 50 nghệ sĩ, mỗi buổi diễn l&agrave; cơ hội để kh&aacute;n giả tận hưởng những giai điệu nổi tiếng nhất của series One Piece ngay tr&ecirc;n s&acirc;n khấu.</div>\r\n</div>	https://booking-ticket-web.s3.amazonaws.com/images/event_26.jpg	2025-11-28 00:00:00	\N	Theatre	2025-11-27 02:30:28.435437	2025-12-18 00:35:39.341498	1	Tỉnh Quảng Ngãi	Thành phố Quảng Ngãi	Phường Chánh Lộ	240-242 Đường 3 Tháng 2	Nhà hát Hòa Bình	approved
30	New Year's Eve The Grand Countdown Party Xin Chào 2026	<p class="MsoNormal"><strong>THE GRAND COUNTDOWN PARTY - XIN CH&Agrave;O 2026</strong></p>\r\n<p class="MsoNormal"><strong>Đ&Ecirc;M CỦA NHỮNG KỲ QUAN</strong></p>\r\n<p class="MsoNormal">Sự kiện 31/12 năm nay sẽ c&oacute; nhiều hoạt động th&uacute; vị d&agrave;nh ri&ecirc;ng cho c&aacute;c b&eacute;, mang đến kh&ocirc;ng gian vui chơi an to&agrave;n v&agrave; đầy năng lượng. C&aacute;c con sẽ được tham gia những tr&ograve; chơi hấp dẫn như b&oacute;ng nhảy, xếp domino s&aacute;ng tạo, khu t&ocirc; m&agrave;u nghệ thuật, c&ugrave;ng thảm nhảy Audition s&ocirc;i động. Tất cả được thiết kế để c&aacute;c b&eacute; thỏa sức kh&aacute;m ph&aacute;, vận động v&agrave; tận hưởng một ng&agrave;y lễ tr&agrave;n đầy niềm vui.</p>\r\n<p class="MsoNormal"><strong>Thời khắc chuyển giao đ&atilde; điểm! Bạn đ&atilde; sẵn s&agrave;ng để trở th&agrave;nh một phần của đ&ecirc;m tiệc lộng lẫy nhất năm?</strong></p>\r\n<p class="MsoNormal">Khi kim đồng hồ nh&iacute;ch dần về những gi&acirc;y cuối c&ugrave;ng của năm 2025, h&atilde;y để The Grand Hồ Tr&agrave;m Resort &amp; Casino&nbsp;đ&aacute;nh thức mọi gi&aacute;c quan của bạn trong một đ&ecirc;m giao thừa b&ugrave;ng nổ cảm x&uacute;c. Ch&uacute;ng t&ocirc;i kh&ocirc;ng chỉ mang đến một bữa tiệc, m&agrave; l&agrave; một h&agrave;nh tr&igrave;nh đa trải nghiệm đỉnh cao để c&ugrave;ng bạn mở ra c&aacute;nh cửa năm 2026 đầy ki&ecirc;u h&atilde;nh.</p>\r\n<p class="MsoNormal"><strong>Đ&ecirc;m nay, huyền thoại được viết n&ecirc;n bởi ch&iacute;nh bạn:</strong></p>\r\n<ul>\r\n<li class="MsoNormal"><strong>M&atilde;n nh&atilde;n với Xiếc Nghệ Thuật:</strong>&nbsp;Bước v&agrave;o thế giới của những điều kỳ diệu với c&aacute;c tiết mục xiếc đẳng cấp, nơi ranh giới thực - ảo bị x&oacute;a nh&ograve;a, đưa cảm x&uacute;c của bạn đi từ ngỡ ng&agrave;ng đến thăng hoa tột độ.</li>\r\n<li class="MsoNormal"><strong>Đại tiệc &acirc;m nhạc "đốt ch&aacute;y" s&acirc;n khấu:</strong>&nbsp;H&ograve;a m&igrave;nh v&agrave;o những giai điệu s&ocirc;i động, c&aacute;c tiết mục biểu diễn ho&agrave;nh tr&aacute;ng được d&agrave;n dựng c&ocirc;ng phu, dẫn lối bạn đến với năng lượng bất tận của năm mới.</li>\r\n<li class="MsoNormal"><strong>Vận may g&otilde; cửa:</strong>&nbsp;Thử th&aacute;ch sự may mắn đầu năm tại c&aacute;c gian h&agrave;ng tr&ograve; chơi&nbsp;n&aacute;o nhiệt v&agrave; rinh về những phần qu&agrave; gi&aacute; trị - lộc đầu năm cho một năm mới hanh th&ocirc;ng, ph&aacute;t đạt.</li>\r\n<li class="MsoNormal"><strong>Tinh hoa ẩm thực:</strong> Thưởng thức tiệc Buffet thượng hạng, nơi hội tụ phong vị &Aacute; - &Acirc;u tinh tế, đ&aacute;nh thức vị gi&aacute;c để bạn c&oacute; đủ năng lượng "ch&aacute;y" hết m&igrave;nh suốt đ&ecirc;m tiệc.<img src="https://salt.tkbcdn.com/ts/ds/ce/34/2f/9cd6615921ef4c4240fb5fa7a2c53855.jpg"></li>\r\n</ul>	https://booking-ticket-web.s3.amazonaws.com/images/event_30.jpg	2026-01-02 00:00:00	\N	Music	2025-12-18 17:22:13.593098	2025-12-19 00:22:30.138181	1	Tỉnh Bà Rịa - Vũng Tàu	Huyện Xuyên Mộc	Xã Phước Thuận		The Grand Ho Tram	approved
31	Test event	<p>Test event with very low price</p>	https://booking-ticket-web.s3.amazonaws.com/images/event_31.png	2025-12-17 00:00:00	\N	Music	2025-12-19 16:48:20.343606	2025-12-19 23:48:32.200044	1	Tỉnh Phú Thọ	Huyện Thanh Sơn	Xã Tân Lập		HCMC,Vietnam	approved
32	123	<p>asdasd</p>	https://booking-ticket-web.s3.amazonaws.com/images/event_32.jpg	2025-12-25 00:00:00	\N	Theatre	2025-12-19 20:30:22.116075	2025-12-20 03:30:47.974245	2	Tỉnh Thái Nguyên	Thành phố Sông Công	Xã Bá Xuyên		Sân vận động Mỹ Đình	approved
33	Nguyenvo		\N	2025-12-24 00:00:00	\N	Theatre	2025-12-23 05:30:43.184965	2025-12-23 12:30:43.190937	1					Sân vận động Mỹ Đình	pending
\.


--
-- Data for Name: payments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.payments (payment_id, booking_id, payment_method, payment_status, amount, created_at, transaction_id) FROM stdin;
77	106	payos	failed	300000.00	2025-12-22 14:31:09.805945	106
29	47	momo	completed	1032500.00	2025-12-16 14:07:36.917804	\N
78	107	payos	completed	2000.00	2025-12-22 14:36:07.993982	107
79	108	payos	failed	2000.00	2025-12-22 14:37:25.164069	108
80	109	payos	failed	2000.00	2025-12-22 15:06:51.214883	109
81	110	payos	failed	2000.00	2025-12-22 15:07:15.047507	110
82	111	payos	pending	2000.00	2025-12-22 15:08:11.021923	111
83	112	payos	pending	2000.00	2025-12-22 15:20:23.449608	112
84	113	payos	completed	2000.00	2025-12-22 15:21:45.696533	113
85	114	payos	completed	2000.00	2025-12-22 15:23:29.314442	114
86	115	payos	failed	885000.00	2025-12-22 16:36:13.045551	115
64	85	payos	completed	2000.00	2025-12-19 19:23:08.594424	85
68	89	payos	failed	2000.00	2025-12-19 19:44:32.562504	89
71	93	payos	failed	2000.00	2025-12-19 19:53:06.662963	93
73	95	payos	pending	400000.00	2025-12-19 20:28:23.11307	95
74	103	payos	completed	4000.00	2025-12-20 20:40:48.464453	103
75	104	payos	failed	720000.00	2025-12-20 20:57:44.666467	104
76	105	payos	completed	2000.00	2025-12-20 20:58:20.317325	105
\.


--
-- Data for Name: tickets; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tickets (ticket_id, name, price, quantity, event_id) FROM stdin;
3	CLASSIC	900000.00	300	26
4	PREMIUM	1800000.00	199	26
5	VIP	3800000.00	200	26
6	GENERAL ADMISSION	350000.00	300	2
7	BALCONY	437500.00	200	2
8	FRONT ROW	595000.00	120	2
9	MEET & GREET	840000.00	30	2
10	GENERAL ADMISSION	300000.00	300	10
11	BALCONY	375000.00	200	10
12	FRONT ROW	510000.00	120	10
13	MEET & GREET	720000.00	30	10
14	GENERAL ADMISSION	350000.00	300	11
15	BALCONY	437500.00	200	11
16	FRONT ROW	595000.00	120	11
17	MEET & GREET	840000.00	30	11
18	GENERAL ADMISSION	400000.00	300	12
19	BALCONY	500000.00	200	12
20	FRONT ROW	680000.00	120	12
21	MEET & GREET	960000.00	30	12
22	GENERAL ADMISSION	450000.00	300	13
23	BALCONY	562500.00	200	13
24	FRONT ROW	765000.00	120	13
25	MEET & GREET	1080000.00	30	13
35	BALCONY	375000.00	200	19
36	FRONT ROW	510000.00	120	19
38	GENERAL ADMISSION	350000.00	300	20
39	BALCONY	437500.00	200	20
40	FRONT ROW	595000.00	120	20
41	MEET & GREET	840000.00	30	20
42	GENERAL ADMISSION	400000.00	300	21
43	BALCONY	500000.00	200	21
44	FRONT ROW	680000.00	120	21
45	MEET & GREET	960000.00	30	21
46	GENERAL ADMISSION	450000.00	300	22
47	BALCONY	562500.00	200	22
48	FRONT ROW	765000.00	120	22
49	MEET & GREET	1080000.00	30	22
51	Vé người lớn 	10000.00	200	30
52	Vé trẻ em	2000.00	10	30
55	test	5000.00	2	32
37	MEET & GREET	720000.00	29	19
34	GENERAL ADMISSION	300000.00	299	19
53	Test 1	1000.00	12	31
54	Test 2 	1000.00	22	31
56	test	30000.00	2	33
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (user_id, full_name, email, phone_number, role, password_hash, gender, birth_date, created_at, updated_at) FROM stdin;
2	vo khoi nguyen	nguyenvo10092004@gmail.com	0915538518	user	scrypt:32768:8:1$m4mJptQzT9cF0LVF$341117b39ebd430ca8ce0051e39a1b84f2fdac272fe925742151a8fb066ae89dd2f532a1de7c41656865f7525b1d5823facaab0e4dfce86c2a377108931e3f8e	Male	2025-11-09	2025-11-15 15:39:18.675797	2025-11-15 15:43:06.207266
1	Nguyên Võ	vokhoinguyen2017@gmail.com	0915538518	admin	scrypt:32768:8:1$C5qSlH6U8GIkXZou$08f113875bb32c5e9c69122a7b4fdb3c9f0ecf4acc564eed70e93051842227d60e0f6a6b755f59637db74347258d2b4d524d1947aded03fdeca9f5dd8bd9bdc7	female	2025-11-22	2025-11-15 15:25:36.550413	2025-12-17 16:06:46.624004
\.


--
-- Name: booking_lines_booking_line_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.booking_lines_booking_line_id_seq', 152, true);


--
-- Name: bookings_booking_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.bookings_booking_id_seq', 115, true);


--
-- Name: cancellations_cancel_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.cancellations_cancel_id_seq', 1, true);


--
-- Name: events_event_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.events_event_id_seq', 33, true);


--
-- Name: payments_payment_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.payments_payment_id_seq', 86, true);


--
-- Name: tickets_ticket_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.tickets_ticket_id_seq', 56, true);


--
-- Name: users_user_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_user_id_seq', 3, true);


--
-- Name: booking_lines booking_lines_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.booking_lines
    ADD CONSTRAINT booking_lines_pkey PRIMARY KEY (booking_line_id);


--
-- Name: bookings bookings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_pkey PRIMARY KEY (booking_id);


--
-- Name: cancellations cancellations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cancellations
    ADD CONSTRAINT cancellations_pkey PRIMARY KEY (cancel_id);


--
-- Name: events events_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_pkey PRIMARY KEY (event_id);


--
-- Name: payments payments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_pkey PRIMARY KEY (payment_id);


--
-- Name: tickets tickets_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tickets
    ADD CONSTRAINT tickets_pkey PRIMARY KEY (ticket_id);


--
-- Name: booking_lines uq_booking_ticket; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.booking_lines
    ADD CONSTRAINT uq_booking_ticket UNIQUE (booking_id, ticket_id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (user_id);


--
-- Name: payments trg_payment_status_update_booking; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_payment_status_update_booking AFTER UPDATE OF payment_status ON public.payments FOR EACH ROW WHEN ((old.payment_status IS DISTINCT FROM new.payment_status)) EXECUTE FUNCTION public.update_booking_status_from_payment();


--
-- Name: events trigger_set_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_set_updated_at BEFORE INSERT OR UPDATE ON public.events FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: bookings bookings_event_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(event_id);


--
-- Name: bookings bookings_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id);


--
-- Name: cancellations cancellations_booking_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cancellations
    ADD CONSTRAINT cancellations_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES public.bookings(booking_id);


--
-- Name: booking_lines fk_booking_lines_booking; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.booking_lines
    ADD CONSTRAINT fk_booking_lines_booking FOREIGN KEY (booking_id) REFERENCES public.bookings(booking_id) ON DELETE CASCADE;


--
-- Name: booking_lines fk_booking_lines_ticket; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.booking_lines
    ADD CONSTRAINT fk_booking_lines_ticket FOREIGN KEY (ticket_id) REFERENCES public.tickets(ticket_id) ON DELETE RESTRICT;


--
-- Name: tickets fk_event; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tickets
    ADD CONSTRAINT fk_event FOREIGN KEY (event_id) REFERENCES public.events(event_id) ON DELETE CASCADE;


--
-- Name: payments fk_payments_bookings; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT fk_payments_bookings FOREIGN KEY (booking_id) REFERENCES public.bookings(booking_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: tickets tickets_event_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tickets
    ADD CONSTRAINT tickets_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(event_id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict 0FVCnTnFfjNZECmY7fq7jPHKB80IqDrl854kbMbv98KUfhJH3MFi3Fmjlhual0C

