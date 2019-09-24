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