import java.time.Instant;
import java.time.ZoneOffset;
import java.time.ZonedDateTime;

import com.google.gson.Gson;

public class FrontendRequest {
    public String id;
    public String url;
    public String date;
    public Search search;
    public Create create;
    public Update update;
    private Object change;
    public Hardware[] hardware;

    private String hardwareToArray() {
        String hardware = this.change.toString();
        String hardwareObject = "[";
        hardware = hardware.substring(1, hardware.length() - 1);
        String[] hardwares = hardware.split("\\}\\,");
        for (int i = 0; i < hardwares.length; i++) {
            if (i != hardwares.length - 1) hardwares[i] += "}";
            String[] elements = hardwares[i].split("\\=\\{");
            hardwareObject += "{\"id\":\"" + elements[0].trim() + "\",";
            hardwareObject += "\"params\":{";
            elements[1] = elements[1].substring(0, elements[1].length() - 1);
            String[] params = elements[1].split("\\,");
            for (String param : params) {
                String[] splittedParam = param.split("\\=");
                hardwareObject += "\"" + splittedParam[0].trim() + "\":\"" + splittedParam[1] + "\",";
            }
            hardwareObject = hardwareObject.substring(0, hardwareObject.length() - 1);
            hardwareObject += "}},";
        }
        hardwareObject = hardwareObject.substring(0, hardwareObject.length() - 1);
        hardwareObject += "]";
        return hardwareObject;
    }

    public Hardware[] decodeHardware() {
        String jsonHardware = hardwareToArray();
        this.hardware = new Gson().fromJson(jsonHardware, Hardware[].class);
        return this.hardware;
    }

    public ZonedDateTime getDate() {
        return getDate(this.date);
    }

    public ZonedDateTime getDate(String date) {
        return ZonedDateTime.ofInstant(Instant.parse(date), ZoneOffset.UTC);
    }
}

class Search {
    public String id_hardware;
    public String start_date;
    public String finish_date;
}

class Hardware {
    public String id;
    public HardwareParams params;
}

class HardwareParams {
    public String status;
    public int freq;
    public String text;
    public String tag;
}

class Create {
    public Condition condition;
    public Consequence consequence;
    public Consequence alternative;
}

class Update extends Create {
    public String id;
}

class Condition {
    public Left left;
    public String operator;
    public Right right;
}

class Consequence {
    public String url;
    public String id;
    public boolean status;
    public int freq;
    public String text;
}

class Left {
    public String url;
    public String id;
    public int freq;
}

class Right {
    public int sensor;
    public boolean status;
    public int freq;
    public String text;
}