import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_users_role" AS ENUM('admin', 'editor');
  CREATE TYPE "public"."enum_landing_blocks_cases_category" AS ENUM('medicine', 'e-commerce', 'education', 'manufacturing', 'services', 'culture');
  CREATE TABLE "media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"alt" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric
  );
  
  CREATE TABLE "page_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"t_header_16y4ug8" varchar DEFAULT 'Как работаем',
  	"t_header_1h3nhyc" varchar DEFAULT 'Кейсы',
  	"t_header_0jrilgg" varchar DEFAULT 'Стоимость',
  	"t_header_05z6bid" varchar DEFAULT 'Отзывы',
  	"t_header_1quyd57" varchar DEFAULT 'Вопросы',
  	"t_header_1yud1og" varchar DEFAULT 'Бесплатный медиаплан',
  	"t_header_0g5ccs0" varchar DEFAULT 'Меню',
  	"t_header_0ef0a5y" varchar DEFAULT 'Написать нам',
  	"t_hero_0ggomn9" varchar DEFAULT 'Контекстная реклама для бизнеса',
  	"t_hero_17uuuwp" varchar DEFAULT 'Приведём целевые заявки из Яндекс Директа',
  	"t_hero_1pwx7wz" varchar DEFAULT 'Берём на себя аудит, стратегию, запуск, оптимизацию и аналитику — чтобы вы понимали, как реклама влияет на обращения и продажи',
  	"t_hero_0dghjfn" varchar DEFAULT 'Получить медиаплан бесплатно',
  	"t_hero_047kpq6" varchar DEFAULT 'Обсудить продвижение',
  	"t_fit_0b6cpc4" varchar DEFAULT 'Вам подойдёт, если:',
  	"t_fit_07pimtn" varchar DEFAULT 'Хотите понимать не только цену, но и качество заявок?',
  	"t_quiz_0nud82c" varchar DEFAULT 'Бесплатный медиаплан',
  	"t_quiz_0pwb9vj" varchar DEFAULT 'Получите бесплатный медиаплан',
  	"t_quiz_1a47ml2" varchar DEFAULT 'Подготовим бесплатно — без обязательств. Поймёте, какой бюджет и сценарий продвижения подойдут вашей задаче',
  	"t_quiz_1m3b92y" varchar DEFAULT 'Пять коротких вопросов помогут собрать вводные и подготовить прогноз для вашего бизнеса',
  	"t_quiz_022d996" varchar DEFAULT 'Назад',
  	"t_quiz_0du0jd4" varchar DEFAULT 'Выберите один вариант',
  	"t_quiz_1mnkf5i" varchar DEFAULT 'Ответы сохранены',
  	"t_quiz_1r814k4" varchar DEFAULT 'Осталось оставить контакты',
  	"t_quiz_104x80x" varchar DEFAULT 'Имя',
  	"t_quiz_0vysykq" varchar DEFAULT 'Телефон',
  	"t_quiz_1rlagui" varchar DEFAULT 'Сайт или соцсети',
  	"t_quiz_12dllcx" varchar DEFAULT '(необязательно)',
  	"t_quiz_1d3bzsj" varchar DEFAULT 'Принимаю политику конфиденциальности',
  	"t_quiz_1w6im60" varchar DEFAULT 'Согласен на обработку персональных данных',
  	"t_quiz_01chigc" varchar DEFAULT 'Оставить заявку',
  	"t_quiz_0rob5zq" varchar DEFAULT 'Спасибо, заявка отправлена',
  	"t_quiz_14b5xg1" varchar DEFAULT 'Мы получили ваши данные и свяжемся с вами в ближайшее время',
  	"t_quiz_0eub6nu" varchar DEFAULT 'Не хотите ждать звонка? Начните диалог в удобном мессенджере — уточним детали там.',
  	"t_quiz_13rzsb1" varchar DEFAULT 'VK-бот',
  	"t_quiz_18pux9h" varchar DEFAULT 'Telegram-бот',
  	"t_quiz_0ezs5ug" varchar DEFAULT 'MAX-бот',
  	"t_experience_dark_1dq6k2i" varchar DEFAULT 'Типичные проблемы рынка',
  	"t_experience_dark_1cstrqg" varchar DEFAULT 'Ваша реклама часто не окупается?',
  	"t_experience_dark_1p3vwnx" varchar DEFAULT 'Церебро знает, как превратить проблемы рекламы в понятный план действий',
  	"t_experience_dark_080owmi" varchar DEFAULT 'Ответьте на несколько коротких вопросов — и подготовим основу медиаплана именно под вашу ситуацию.',
  	"t_experience_dark_07nhqii" varchar DEFAULT 'Получить медиаплан',
  	"t_experience_dark_0ezzil2" varchar DEFAULT 'Состав работы',
  	"t_experience_dark_0zxea3i" varchar DEFAULT 'Как мы работаем с вашим проектом',
  	"t_process_16qm1ph" varchar DEFAULT 'Понятный старт',
  	"t_process_18b0fw8" varchar DEFAULT 'Вы оставили заявку. Что дальше?',
  	"t_proof_01afd7s" varchar DEFAULT 'Практика по нишам',
  	"t_proof_19p2pbm" varchar DEFAULT 'Наши кейсы',
  	"t_proof_1ekzjuo" varchar DEFAULT 'Не нашли свою нишу? После заявки подберём кейсы, релевантные вашей задаче — часть портфеля закрыта NDA.',
  	"t_proof_1xv0mmj" varchar DEFAULT 'Нужны примеры из вашей ниши?',
  	"t_proof_0i84v22" varchar DEFAULT 'Подберём кейсы под вашу задачу',
  	"t_proof_0gjsxsn" varchar DEFAULT 'Получить бесплатный медиаплан',
  	"t_team_07gvuiu" varchar DEFAULT 'Эксперты Церебро',
  	"t_team_1ttuzow" varchar DEFAULT 'Команда, которая работает с рекламой каждый день',
  	"t_team_1xibfms" varchar DEFAULT 'В команде — специалисты по стратегии, запуску, аналитике и оптимизации рекламных кампаний.',
  	"t_conditions_044vglv" varchar DEFAULT 'Условия и стоимость',
  	"t_conditions_1k5w3nb" varchar DEFAULT 'Стоимость ведения',
  	"t_conditions_15y6p9q" varchar DEFAULT 'Рекламный бюджет',
  	"t_conditions_1xvz6f4" varchar DEFAULT 'от 100 000 до 500 000 ₽',
  	"t_conditions_1er02g1" varchar DEFAULT '50 000 ₽ / месяц',
  	"t_conditions_0nmnl2a" varchar DEFAULT 'от 501 000 ₽',
  	"t_conditions_1bbnxlk" varchar DEFAULT '50 000 ₽ / месяц + 7% рекламного бюджета',
  	"t_conditions_1g6sv4z" varchar DEFAULT 'Аудит, стратегия и запуск включены. Рекламный бюджет оплачивается отдельно.',
  	"t_conditions_15e906r" varchar DEFAULT 'Нужен только аудит рекламы?',
  	"t_conditions_0gpu0bl" varchar DEFAULT 'Разберём действующие кампании, найдём точки роста и подготовим рекомендации. Разовый аудит — 5 000 ₽',
  	"t_conditions_0at9rxw" varchar DEFAULT 'Заказать аудит',
  	"t_trust_0bo5z50" varchar DEFAULT 'О Церебро',
  	"t_trust_13wnhyd" varchar DEFAULT 'клиентов работают с Церебро',
  	"t_trust_0nkbyys" varchar DEFAULT 'Больше 10 лет ведём рекламу на российских площадках',
  	"t_trust_1g7znkx" varchar DEFAULT 'Разбираемся в особенностях каждого канала и помогаем выбрать подходящий сценарий продвижения',
  	"t_trust_10kry0o" varchar DEFAULT 'Официальный партнёр:',
  	"t_trust_055jotg" varchar DEFAULT 'VK',
  	"t_trust_1040999" varchar DEFAULT 'Яндекс',
  	"t_trust_1utui8n" varchar DEFAULT 'Авито',
  	"t_trust_058r5f5" varchar DEFAULT 'Отзывы клиентов',
  	"t_faq_0ndm1ej" varchar DEFAULT 'FAQ',
  	"t_faq_13wl8ia" varchar DEFAULT 'Важные вопросы до старта',
  	"t_contact_0rwlu9u" varchar DEFAULT 'Нужен бесплатный медиаплан?',
  	"t_contact_04rwusz" varchar DEFAULT 'Заявка на разовый аудит рекламы',
  	"t_contact_11mm6eq" varchar DEFAULT 'Имя',
  	"t_contact_1g543l1" varchar DEFAULT 'Телефон',
  	"t_contact_1d0bww7" varchar DEFAULT 'Общий рекламный бюджет',
  	"t_contact_01kdf1q" varchar DEFAULT 'Принимаю политику конфиденциальности',
  	"t_contact_1vpzdbf" varchar DEFAULT 'Согласен на обработку персональных данных',
  	"t_contact_1s8de5n" varchar DEFAULT 'Отправить заявку',
  	"t_lead_success_1jem5ft" varchar DEFAULT 'Спасибо, заявка отправлена',
  	"t_lead_success_1cg7jb8" varchar DEFAULT 'Мы получили ваши данные и свяжемся с вами в ближайшее время',
  	"t_lead_success_0viwzhl" varchar DEFAULT 'Не хотите ждать звонка? Начните диалог в удобном мессенджере — уточним детали там.',
  	"t_lead_success_1vdk5zu" varchar DEFAULT 'VK-бот',
  	"t_lead_success_1qkd45m" varchar DEFAULT 'Telegram-бот',
  	"t_lead_success_09cuf2x" varchar DEFAULT 'MAX-бот',
  	"t_footer_0tcheml" varchar DEFAULT '© 2026 Церебро. Все права защищены.',
  	"t_footer_0vbx99k" varchar DEFAULT 'Политика конфиденциальности',
  	"t_footer_01ju50l" varchar DEFAULT 'Согласие на обработку персональных данных',
  	"t_footer_0o8c9p1" varchar DEFAULT 'Наверх',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "landing_blocks_facts" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"text" varchar NOT NULL
  );
  
  CREATE TABLE "landing_blocks_fit" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "landing_blocks_problems" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"problem" varchar NOT NULL,
  	"solution" varchar
  );
  
  CREATE TABLE "landing_blocks_service_scope" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"text" varchar,
  	"partner_logo" varchar
  );
  
  CREATE TABLE "landing_blocks_process" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "landing_blocks_transparency" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "landing_blocks_case_filters" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL
  );
  
  CREATE TABLE "landing_blocks_cases_solution" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar NOT NULL
  );
  
  CREATE TABLE "landing_blocks_cases_results" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar NOT NULL,
  	"label" varchar
  );
  
  CREATE TABLE "landing_blocks_cases" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"category" "enum_landing_blocks_cases_category" NOT NULL,
  	"label" varchar,
  	"context" varchar,
  	"title" varchar NOT NULL,
  	"task" varchar,
  	"image_id" integer,
  	"default_image" varchar
  );
  
  CREATE TABLE "landing_blocks_team" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"role" varchar,
  	"photo_id" integer,
  	"photo_file" varchar
  );
  
  CREATE TABLE "landing_blocks_reviews_paragraphs" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar NOT NULL
  );
  
  CREATE TABLE "landing_blocks_reviews" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"detail" varchar
  );
  
  CREATE TABLE "landing_blocks_start_options" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"title" varchar NOT NULL,
  	"text" varchar,
  	"cta" varchar,
  	"cta_id" varchar
  );
  
  CREATE TABLE "landing_blocks_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"question" varchar NOT NULL,
  	"answer" varchar
  );
  
  CREATE TABLE "landing_blocks_quiz_steps_options" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"label" varchar NOT NULL
  );
  
  CREATE TABLE "landing_blocks_quiz_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"topic" varchar,
  	"question" varchar NOT NULL
  );
  
  CREATE TABLE "landing_blocks" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"seeded" boolean,
  	"contact_copy_promotion_eyebrow" varchar,
  	"contact_copy_promotion_title" varchar,
  	"contact_copy_promotion_description" varchar,
  	"contact_copy_audit_eyebrow" varchar,
  	"contact_copy_audit_title" varchar,
  	"contact_copy_audit_description" varchar,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "users" ADD COLUMN "role" "enum_users_role" DEFAULT 'admin' NOT NULL;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "media_id" integer;
  ALTER TABLE "site_settings" ADD COLUMN "color_brand" varchar DEFAULT '#0A238B';
  ALTER TABLE "site_settings" ADD COLUMN "color_brand_bright" varchar DEFAULT '#2F63F5';
  ALTER TABLE "site_settings" ADD COLUMN "color_brand_deep" varchar DEFAULT '#06195F';
  ALTER TABLE "site_settings" ADD COLUMN "color_accent" varchar DEFAULT '#FFD400';
  ALTER TABLE "site_settings" ADD COLUMN "color_paper" varchar DEFAULT '#F4F6FA';
  ALTER TABLE "site_settings" ADD COLUMN "color_surface" varchar DEFAULT '#FFFFFF';
  ALTER TABLE "site_settings" ADD COLUMN "color_blue_soft" varchar DEFAULT '#E9EEFF';
  ALTER TABLE "site_settings" ADD COLUMN "color_yellow_soft" varchar DEFAULT '#FFF7CC';
  ALTER TABLE "site_settings" ADD COLUMN "color_ink" varchar DEFAULT '#152038';
  ALTER TABLE "site_settings" ADD COLUMN "color_ink_muted" varchar DEFAULT '#526078';
  ALTER TABLE "site_settings" ADD COLUMN "color_border" varchar DEFAULT '#DCE3EE';
  ALTER TABLE "site_settings" ADD COLUMN "seo_title" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "seo_description" varchar;
  ALTER TABLE "landing_blocks_facts" ADD CONSTRAINT "landing_blocks_facts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."landing_blocks"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "landing_blocks_fit" ADD CONSTRAINT "landing_blocks_fit_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."landing_blocks"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "landing_blocks_problems" ADD CONSTRAINT "landing_blocks_problems_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."landing_blocks"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "landing_blocks_service_scope" ADD CONSTRAINT "landing_blocks_service_scope_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."landing_blocks"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "landing_blocks_process" ADD CONSTRAINT "landing_blocks_process_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."landing_blocks"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "landing_blocks_transparency" ADD CONSTRAINT "landing_blocks_transparency_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."landing_blocks"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "landing_blocks_case_filters" ADD CONSTRAINT "landing_blocks_case_filters_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."landing_blocks"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "landing_blocks_cases_solution" ADD CONSTRAINT "landing_blocks_cases_solution_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."landing_blocks_cases"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "landing_blocks_cases_results" ADD CONSTRAINT "landing_blocks_cases_results_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."landing_blocks_cases"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "landing_blocks_cases" ADD CONSTRAINT "landing_blocks_cases_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "landing_blocks_cases" ADD CONSTRAINT "landing_blocks_cases_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."landing_blocks"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "landing_blocks_team" ADD CONSTRAINT "landing_blocks_team_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "landing_blocks_team" ADD CONSTRAINT "landing_blocks_team_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."landing_blocks"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "landing_blocks_reviews_paragraphs" ADD CONSTRAINT "landing_blocks_reviews_paragraphs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."landing_blocks_reviews"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "landing_blocks_reviews" ADD CONSTRAINT "landing_blocks_reviews_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."landing_blocks"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "landing_blocks_start_options" ADD CONSTRAINT "landing_blocks_start_options_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."landing_blocks"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "landing_blocks_faq" ADD CONSTRAINT "landing_blocks_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."landing_blocks"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "landing_blocks_quiz_steps_options" ADD CONSTRAINT "landing_blocks_quiz_steps_options_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."landing_blocks_quiz_steps"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "landing_blocks_quiz_steps" ADD CONSTRAINT "landing_blocks_quiz_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."landing_blocks"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE INDEX "landing_blocks_facts_order_idx" ON "landing_blocks_facts" USING btree ("_order");
  CREATE INDEX "landing_blocks_facts_parent_id_idx" ON "landing_blocks_facts" USING btree ("_parent_id");
  CREATE INDEX "landing_blocks_fit_order_idx" ON "landing_blocks_fit" USING btree ("_order");
  CREATE INDEX "landing_blocks_fit_parent_id_idx" ON "landing_blocks_fit" USING btree ("_parent_id");
  CREATE INDEX "landing_blocks_problems_order_idx" ON "landing_blocks_problems" USING btree ("_order");
  CREATE INDEX "landing_blocks_problems_parent_id_idx" ON "landing_blocks_problems" USING btree ("_parent_id");
  CREATE INDEX "landing_blocks_service_scope_order_idx" ON "landing_blocks_service_scope" USING btree ("_order");
  CREATE INDEX "landing_blocks_service_scope_parent_id_idx" ON "landing_blocks_service_scope" USING btree ("_parent_id");
  CREATE INDEX "landing_blocks_process_order_idx" ON "landing_blocks_process" USING btree ("_order");
  CREATE INDEX "landing_blocks_process_parent_id_idx" ON "landing_blocks_process" USING btree ("_parent_id");
  CREATE INDEX "landing_blocks_transparency_order_idx" ON "landing_blocks_transparency" USING btree ("_order");
  CREATE INDEX "landing_blocks_transparency_parent_id_idx" ON "landing_blocks_transparency" USING btree ("_parent_id");
  CREATE INDEX "landing_blocks_case_filters_order_idx" ON "landing_blocks_case_filters" USING btree ("_order");
  CREATE INDEX "landing_blocks_case_filters_parent_id_idx" ON "landing_blocks_case_filters" USING btree ("_parent_id");
  CREATE INDEX "landing_blocks_cases_solution_order_idx" ON "landing_blocks_cases_solution" USING btree ("_order");
  CREATE INDEX "landing_blocks_cases_solution_parent_id_idx" ON "landing_blocks_cases_solution" USING btree ("_parent_id");
  CREATE INDEX "landing_blocks_cases_results_order_idx" ON "landing_blocks_cases_results" USING btree ("_order");
  CREATE INDEX "landing_blocks_cases_results_parent_id_idx" ON "landing_blocks_cases_results" USING btree ("_parent_id");
  CREATE INDEX "landing_blocks_cases_order_idx" ON "landing_blocks_cases" USING btree ("_order");
  CREATE INDEX "landing_blocks_cases_parent_id_idx" ON "landing_blocks_cases" USING btree ("_parent_id");
  CREATE INDEX "landing_blocks_cases_image_idx" ON "landing_blocks_cases" USING btree ("image_id");
  CREATE INDEX "landing_blocks_team_order_idx" ON "landing_blocks_team" USING btree ("_order");
  CREATE INDEX "landing_blocks_team_parent_id_idx" ON "landing_blocks_team" USING btree ("_parent_id");
  CREATE INDEX "landing_blocks_team_photo_idx" ON "landing_blocks_team" USING btree ("photo_id");
  CREATE INDEX "landing_blocks_reviews_paragraphs_order_idx" ON "landing_blocks_reviews_paragraphs" USING btree ("_order");
  CREATE INDEX "landing_blocks_reviews_paragraphs_parent_id_idx" ON "landing_blocks_reviews_paragraphs" USING btree ("_parent_id");
  CREATE INDEX "landing_blocks_reviews_order_idx" ON "landing_blocks_reviews" USING btree ("_order");
  CREATE INDEX "landing_blocks_reviews_parent_id_idx" ON "landing_blocks_reviews" USING btree ("_parent_id");
  CREATE INDEX "landing_blocks_start_options_order_idx" ON "landing_blocks_start_options" USING btree ("_order");
  CREATE INDEX "landing_blocks_start_options_parent_id_idx" ON "landing_blocks_start_options" USING btree ("_parent_id");
  CREATE INDEX "landing_blocks_faq_order_idx" ON "landing_blocks_faq" USING btree ("_order");
  CREATE INDEX "landing_blocks_faq_parent_id_idx" ON "landing_blocks_faq" USING btree ("_parent_id");
  CREATE INDEX "landing_blocks_quiz_steps_options_order_idx" ON "landing_blocks_quiz_steps_options" USING btree ("_order");
  CREATE INDEX "landing_blocks_quiz_steps_options_parent_id_idx" ON "landing_blocks_quiz_steps_options" USING btree ("_parent_id");
  CREATE INDEX "landing_blocks_quiz_steps_order_idx" ON "landing_blocks_quiz_steps" USING btree ("_order");
  CREATE INDEX "landing_blocks_quiz_steps_parent_id_idx" ON "landing_blocks_quiz_steps" USING btree ("_parent_id");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "media" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "page_texts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "landing_blocks_facts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "landing_blocks_fit" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "landing_blocks_problems" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "landing_blocks_service_scope" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "landing_blocks_process" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "landing_blocks_transparency" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "landing_blocks_case_filters" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "landing_blocks_cases_solution" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "landing_blocks_cases_results" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "landing_blocks_cases" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "landing_blocks_team" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "landing_blocks_reviews_paragraphs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "landing_blocks_reviews" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "landing_blocks_start_options" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "landing_blocks_faq" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "landing_blocks_quiz_steps_options" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "landing_blocks_quiz_steps" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "landing_blocks" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "media" CASCADE;
  DROP TABLE "page_texts" CASCADE;
  DROP TABLE "landing_blocks_facts" CASCADE;
  DROP TABLE "landing_blocks_fit" CASCADE;
  DROP TABLE "landing_blocks_problems" CASCADE;
  DROP TABLE "landing_blocks_service_scope" CASCADE;
  DROP TABLE "landing_blocks_process" CASCADE;
  DROP TABLE "landing_blocks_transparency" CASCADE;
  DROP TABLE "landing_blocks_case_filters" CASCADE;
  DROP TABLE "landing_blocks_cases_solution" CASCADE;
  DROP TABLE "landing_blocks_cases_results" CASCADE;
  DROP TABLE "landing_blocks_cases" CASCADE;
  DROP TABLE "landing_blocks_team" CASCADE;
  DROP TABLE "landing_blocks_reviews_paragraphs" CASCADE;
  DROP TABLE "landing_blocks_reviews" CASCADE;
  DROP TABLE "landing_blocks_start_options" CASCADE;
  DROP TABLE "landing_blocks_faq" CASCADE;
  DROP TABLE "landing_blocks_quiz_steps_options" CASCADE;
  DROP TABLE "landing_blocks_quiz_steps" CASCADE;
  DROP TABLE "landing_blocks" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_media_fk";
  
  DROP INDEX "payload_locked_documents_rels_media_id_idx";
  ALTER TABLE "users" DROP COLUMN "role";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "media_id";
  ALTER TABLE "site_settings" DROP COLUMN "color_brand";
  ALTER TABLE "site_settings" DROP COLUMN "color_brand_bright";
  ALTER TABLE "site_settings" DROP COLUMN "color_brand_deep";
  ALTER TABLE "site_settings" DROP COLUMN "color_accent";
  ALTER TABLE "site_settings" DROP COLUMN "color_paper";
  ALTER TABLE "site_settings" DROP COLUMN "color_surface";
  ALTER TABLE "site_settings" DROP COLUMN "color_blue_soft";
  ALTER TABLE "site_settings" DROP COLUMN "color_yellow_soft";
  ALTER TABLE "site_settings" DROP COLUMN "color_ink";
  ALTER TABLE "site_settings" DROP COLUMN "color_ink_muted";
  ALTER TABLE "site_settings" DROP COLUMN "color_border";
  ALTER TABLE "site_settings" DROP COLUMN "seo_title";
  ALTER TABLE "site_settings" DROP COLUMN "seo_description";
  DROP TYPE "public"."enum_users_role";
  DROP TYPE "public"."enum_landing_blocks_cases_category";`)
}
