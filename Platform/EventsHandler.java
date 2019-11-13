import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.ConnectException;
import java.net.HttpURLConnection;
import java.net.MalformedURLException;
import java.net.URL;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.Locale;

import com.google.gson.Gson;

enum COMPARE_BY {
    SENSOR,
    STATUS,
    FREQUENCY,
    TEXT
}

public class EventsHandler {
    public static SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.US);
    public static Gson gson = new Gson();
    public static HashMap<String, Event> localEvents, remoteEvents;
    public static LinkedList<Thread> remoteEventHandlers;

    Thread localEventsHandler;

    public EventsHandler() {
        localEvents = new HashMap<String, Event>();
        remoteEvents = new HashMap<String, Event>();

        remoteEventHandlers = new LinkedList<Thread>();

        try {
            HashMap<String, Event> events = Event.selectAllEvents();

            events.forEach((correlative, event) -> {
                if (Platform.isLocalIp(event.condition.left.url)) {
                    localEvents.put(correlative, event);
                } else {
                    remoteEvents.put(correlative, event);
                    Thread remoteEventHandler = new Thread(new RemoteEventHandler(correlative));
                    remoteEventHandlers.add(remoteEventHandler);
                }
            });
        } catch (SQLException e) {
            System.out.println(e);
        }

        this.localEventsHandler = new Thread(new LocalEventsHandler());
    }

    public void startEventsHandler() {
        this.localEventsHandler.start();
        remoteEventHandlers.forEach(remoteEvent -> {
            remoteEvent.start();
        });
    }

    private static void executeChangeRequest(Consequence consequence) {
        try {
            URL url = new URL ("http://" + consequence.url + "/change/");
            HttpURLConnection con = (HttpURLConnection)url.openConnection();
            con.setRequestMethod("POST");
            con.setRequestProperty("Content-Type", "application/json");
            con.setRequestProperty("Accept", "*/*");
            con.setDoOutput(true);

            String date = EventsHandler.dateFormat.format(new Date());

            String jsonInputString = "{\"id\": \"" + Platform.id + "\",\"url\": \"" + Platform.ip + "\",\"date\": \"" + date + "\",\"change\": {\"" + consequence.id + "\": {\"freq\": " + consequence.freq + ", \"status\": " + consequence.status + ", \"text\": \"" + consequence.text + "\"}}}";

            try(OutputStream os = con.getOutputStream()) {
                byte[] input = jsonInputString.getBytes("utf-8");
                os.write(input, 0, input.length);           
            }

            try(BufferedReader br = new BufferedReader(new InputStreamReader(con.getInputStream(), "utf-8"))) {
                StringBuilder response = new StringBuilder();
                String responseLine = null;
                while ((responseLine = br.readLine()) != null) {
                    response.append(responseLine.trim());
                }
                PlatformResponse platformResponse = EventsHandler.gson.fromJson(response.toString(), PlatformResponse.class);
            }
        } catch (MalformedURLException e) {
            System.out.println(e);
        } catch (IOException e) {
            System.out.println(e);
            System.out.println("No se puede conectar con la plataforma en " + consequence.url + ".");
        }
    }

    public static void runConsequence(Consequence consequence) {
        if (Platform.isLocalIp(consequence.url)) {
            String query = "UPDATE hardware SET frequency = " + consequence.freq + ", status = " + consequence.status + ", text = '" + consequence.text + "' WHERE id = '" + consequence.id + "';";

            try {
                Platform.executeQuery(query);
            } catch (SQLException e) {
                System.out.println(e);
            }
        } else {
            executeChangeRequest(consequence);
        }
    }
}

class RemoteEventHandler implements Runnable {
    
    HashMap<String, Event> remoteEvents;
    String eventCorrelative;

    public RemoteEventHandler(String eventCorrelative) {
        this.remoteEvents = EventsHandler.remoteEvents;
        this.eventCorrelative = eventCorrelative;
    }

    private Hardware[] executeSearchRequest(Condition condition) {
        Hardware[] hardwares = null;
        try {
            URL url = new URL ("http://" + condition.left.url + "/search/");
            HttpURLConnection con = (HttpURLConnection)url.openConnection();
            con.setRequestMethod("POST");
            con.setRequestProperty("Content-Type", "application/json; utf-8");
            con.setRequestProperty("Accept", "*/*");
            con.setDoOutput(true);

            Date date = new Date();
            String finishDate = EventsHandler.dateFormat.format(date);
            date.setTime(date.getTime() - condition.left.freq - 3000);
            String startDate = EventsHandler.dateFormat.format(date);

            String jsonInputString = "{\"id\": \"" + Platform.id + "\",\"url\": \"" + Platform.ip + "\",\"date\": \"" + finishDate + "\",\"search\": {\"finish_date\": \"" + finishDate + "\", \"start_date\": \"" + startDate + "\", \"id_hardware\": \"" + condition.left.id + "\"}}";

            try(OutputStream os = con.getOutputStream()) {
                byte[] input = jsonInputString.getBytes("utf-8");
                os.write(input, 0, input.length);           
            }

            try(BufferedReader br = new BufferedReader(new InputStreamReader(con.getInputStream(), "utf-8"))) {
                StringBuilder response = new StringBuilder();
                String responseLine = null;
                while ((responseLine = br.readLine()) != null) {
                    response.append(responseLine.trim());
                }
                PlatformResponse platformResponse = EventsHandler.gson.fromJson(response.toString(), PlatformResponse.class);
                platformResponse.decodeSearchData();

                hardwares = new Hardware[platformResponse.searchData.length];

                int j = platformResponse.searchData.length - 1;
                for (int i = platformResponse.searchData.length - 1; i >= 0; i--) {
                    SearchData searchData = platformResponse.searchData[i];
                    System.out.println(searchData.date);
                    HardwareParams params = new HardwareParams(searchData.params.status, searchData.params.freq, searchData.params.text, null, searchData.params.sensor, platformResponse.search.type.equals("input") ? HARDWARE_TYPE.INPUT : HARDWARE_TYPE.OUTPUT);
                    Hardware hardware = new Hardware(null, params);
                    hardwares[j - i] = hardware;
                }
            }
        } catch (MalformedURLException e) {
            System.out.println(e);
        } catch (IOException e) {
            System.out.println("No se puede conectar con la plataforma en " + condition.left.url + ".");
        }

        return hardwares;
    }

    @Override
    public void run() {
        while (true) {
            Event remoteEvent = this.remoteEvents.get(this.eventCorrelative);
            if (remoteEvent == null) {
                System.out.println("El evento remoto ha finalizado.");
                break;
            }

            System.out.println("Ciclo para el evento remoto " + this.eventCorrelative);

            Hardware[] hardwares = executeSearchRequest(remoteEvent.condition);

            if (hardwares != null) {
                if (Hardware.runHardwareComparison(hardwares, remoteEvent.condition.operator, remoteEvent.condition.right)) {
                    Consequence consequence = remoteEvent.consequence;
                    EventsHandler.runConsequence(consequence);
                } else {
                    Consequence alternative = remoteEvent.alternative;
                    EventsHandler.runConsequence(alternative);
                }
    
                try {
                    Thread.sleep(remoteEvent.condition.left.freq);
                } catch (InterruptedException e) {
                    System.out.println(e);
                }
            }
        }
    }
}

class LocalEventsHandler implements Runnable {
    HashMap<String, Event> localEvents;

    public LocalEventsHandler() {
        this.localEvents = EventsHandler.localEvents;
    }

    @Override
    public void run() {
        while (true) {
            if (this.localEvents != null && Platform.hardwareTable != null) {
                this.localEvents.forEach((id, event) -> {
                    Hardware hardware = Platform.hardwareTable.get(event.condition.left.id);

                    if (hardware != null) {
                        System.out.println("hardware: " + id + " | valor: " + hardware.params.sensor);

                        Hardware[] hardwares = {hardware};

                        if (Hardware.runHardwareComparison(hardwares, event.condition.operator, event.condition.right)) {
                            Consequence consequence = event.consequence;
                            EventsHandler.runConsequence(consequence);
                        } else {
                            Consequence alternative = event.alternative;
                            EventsHandler.runConsequence(alternative);
                        }
                    }
                });
            }

            try {
                Thread.sleep(5000);
            } catch (InterruptedException e) {
                System.out.println(e);
            }
        }
    }
}