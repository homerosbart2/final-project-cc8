CREATE TABLE "searchdata" (
	"correlativo"	INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
	"idhardware"	varchar NOT NULL,
	"idplataforma"	int NOT NULL,
	"fecha"	datetime NOT NULL,
	"sensor"	int,
	"status"	boolean,
	"frequency"	int,
	"text"	varchar,
	UNIQUE("idhardware","fecha","idplataforma")
);

CREATE TABLE "eventos" (
	"id" varchar NOT NULL,
	"idplataforma" int NOT NULL,
	"fecha" datetime NOT NULL,
	"if_left_url" varchar NOT NULL,
	"if_left_id" varchar NOT NULL,
	"if_left_freq" int NOT NULL,
	"if_condicion" varchar NOT NULL,
	"if_right_sensor" int,
	"if_right_status" boolean,
	"if_right_freq" int,
	"if_right_text" varchar,
	"then_url" varchar NOT NULL,
	"then_id" varchar NOT NULL,
	"then_status" boolean,
	"then_freq" int,
	"then_text" varchar,
	"else_url" varchar NOT NULL,
	"else_id" varchar NOT NULL,
	"else_status" boolean,
	"else_freq" int,
	"else_text" varchar,
	PRIMARY KEY("id", "idplataforma")
);