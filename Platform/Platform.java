import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.atomic.AtomicInteger;
import java.io.*;
import java.net.*;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Date;
import java.util.Enumeration;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.StringTokenizer;
import java.util.TimeZone;
import java.text.SimpleDateFormat;
import java.time.Instant;
import java.time.ZoneOffset;
import java.time.ZonedDateTime;
import java.text.DateFormat;
import java.text.DecimalFormat;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.nio.file.Files;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.Properties;

import org.omg.CORBA.UNKNOWN;
import org.sqlite.SQLiteConnection;

import com.google.gson.Gson;

/**
 * Platform
 */
public class Platform {
    public static AtomicInteger correlative = new AtomicInteger(-1);
    public static AtomicInteger eventCorrelative = new AtomicInteger(0);

    private static String db = "default.db";
    private static Connection sqliteConnection;
    private static Statement statement;
    public static String id = "1234567890";
    public static String ip = "noip";
    public static int port = 80;
    public static HashSet<String> hardwareIds = new HashSet<String>();

    private static void setIpAddress() {
        try {
            Enumeration<NetworkInterface> interfaces = NetworkInterface.getNetworkInterfaces();
            boolean modified = false;
            while (interfaces.hasMoreElements()) {
                NetworkInterface networkInterface = interfaces.nextElement();
                if (!networkInterface.isUp())
                    continue;
                Enumeration<InetAddress> addresses = networkInterface.getInetAddresses();
                while(addresses.hasMoreElements()) {
                    InetAddress addr = addresses.nextElement();
                    if (networkInterface.getDisplayName().equals("Intel(R) Dual Band Wireless-AC 8265")) {
                        if (!modified) {
                            ip = addr.getHostAddress();
                            modified = true;
                        }
                    }
                }
            }
        } catch (SocketException e) {
            System.out.println(e);
        }
    }

    public static ResultSet executeQuery(String query) throws SQLException {
        if (Platform.sqliteConnection == null || Platform.sqliteConnection.isClosed() || Platform.statement == null) {
            Platform.sqliteConnection = Platform.connect();
            Platform.statement = sqliteConnection.createStatement();
            statement.setQueryTimeout(5);
        }
        String command = query.trim().split(" ")[0];
        if (command.equals("CREATE")) {
            statement.execute(query);
        } else if (command.equals("SELECT")) {
            return statement.executeQuery(query);
        } else if (command.equals("UPDATE") || command.equals("INSERT")) {
            statement.executeUpdate(query);
        } else {
            throw new SQLException(command + " is not supported.");
        }
        return null;
    }

    public static void main(String[] args) {
        setIpAddress();

        Platform platform = new Platform();
        platform.initializeServer();
    }

    public static Connection connect() {
        Connection conn = null;
        try {
            conn = DriverManager.getConnection("jdbc:sqlite:" + Platform.db);
        } catch (SQLException e) {
            System.out.println(e.getMessage());
        } 
        return conn;
    }

    private void initializeServer(){
        int nThreads = 20;
        Platform.port = 80;

        try {
            Properties defaultProps = new Properties();
            FileInputStream in = new FileInputStream("server.conf");
            defaultProps.load(in);
            in.close();
            
            if(defaultProps.containsKey("nThreads"))
                try {
                    nThreads = Integer.valueOf(String.valueOf(defaultProps.get("nThreads")));
                } catch (Exception e) {
                    System.out.println("ALERTA:\tLa configuracion 'nThreads' no es correcta. Se utilizara el default: 20.");
                }
            else System.out.println("ALERTA:\tLa configuracion 'nThreads' no se ha encontrado en server.conf. Se utilizara el default: 20.");
                

            if(defaultProps.containsKey("port"))
                try {
                    Platform.port = Integer.valueOf(String.valueOf(defaultProps.get("port")));
                } catch (Exception e) {
                    System.out.println("ALERTA\tLa configuración 'port' no es correcta. Se utilizará el default: " + Platform.port + ".");
                }
            else System.out.println("ALERTA:\tLa configuracion 'port' no se ha encontrado en server.conf. Se utilizara el default: " + Platform.port + ".");

            if (defaultProps.containsKey("db")) db = defaultProps.getProperty("db");
            else System.out.println("ALERTA:\tLa configuracion 'db' no se ha encontrado en server.conf. Se utilizara el default: " + db + ".");

            if (defaultProps.containsKey("id")) id = defaultProps.getProperty("id");
            else System.out.println("ALERTA:\tLa configuracion 'id' no se ha encontrado en server.conf. Se utilizara el default: " + id + ".");

        } catch (FileNotFoundException e) {
            System.out.println("ALERTA:\tNo existe el archivo server.conf. Si desea configurar el servidor, agrueguelo a la carpeta.");
        } catch (IOException e){
            System.out.println(e);
        }

        System.out.println("INFO:\t\tIniciando el servidor con " + nThreads + " threads en el puerto " + Platform.port + ". Utilizando la base de datos " + Platform.db + ". La configuracion puede ser cambiada en server.conf.");

        try {
            String query = "CREATE TABLE IF NOT EXISTS requests (correlative int primary key, date datetime, socket varchar, id varchar, type boolean, frequency int, sensor int, status boolean, text varchar);";
            Platform.executeQuery(query);
            query = "CREATE TABLE IF NOT EXISTS hardware(id varchar primary key, tag varchar, type boolean, status boolean, frequency int, text varchar);";
            Platform.executeQuery(query);
            query = "CREATE TABLE IF NOT EXISTS events (id varchar primary key, if_left_url varchar, if_left_id varchar, if_left_freq int, if_operator varchar, if_right_sensor int, if_right_status boolean, if_right_freq int, if_right_text varchar, then_url varchar, then_id varchar, then_status boolean, then_freq int, then_text varchar, else_url varchar, else_id varchar, else_status boolean, else_freq int, else_text varchar);";
            Platform.executeQuery(query);

            query = "SELECT id FROM events ORDER BY id DESC LIMIT 1;";
            ResultSet rs = Platform.executeQuery(query);
            while (rs.next()) {
                eventCorrelative.set(Integer.parseInt(rs.getString("id").substring(2, 8)));
            }

            query = "SELECT id FROM hardware;";
            rs = Platform.executeQuery(query);
            while (rs.next()) {
                Platform.hardwareIds.add(rs.getString("id"));
            }
            
            query = "SELECT COUNT(id) as count, MAX(correlative) as max FROM requests;";
            rs = Platform.executeQuery(query);
            while (rs.next()) {
                int count = rs.getInt("count");
                int max = rs.getInt("max");
                if (count > 0 && max > Platform.correlative.get()) Platform.correlative.set(max);
            }
            rs.close();
            System.out.println(query);

            System.out.println("INFO:\tSiguiente correlativo de reporte: " + (Platform.correlative.get() + 1));
            System.out.println("\tSiguiente correlativo de evento: " + Platform.eventCorrelative.get() + 1);
            System.out.println("\tDispositivos asociados a esta platoforma -> " + Platform.hardwareIds);
            NetworkService networkService = new NetworkService(nThreads);
    
            new Thread(networkService).start();
        } catch (BindException e) {
            System.out.println("ERROR:\tEl puerto " + Platform.port + " esta ocupado.");
        } catch (Exception e) {
            System.out.println(e);
        }
    }
}

class NetworkService implements Runnable {
    private final ServerSocket serverSocket;
    private final ExecutorService pool;

    public NetworkService(int nThreads)
        throws IOException {
        this.serverSocket = new ServerSocket(Platform.port);
        this.pool = Executors.newFixedThreadPool(nThreads);
    }

    public void run() {
        try {
            for (;;) {
                pool.execute(new Handler(this.serverSocket.accept()));
            }
        } catch (IOException ex) {
            pool.shutdown();
        }
    }
}

class Handler implements Runnable {
    private final Socket s;
    private static SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.US);
    private static DecimalFormat decimalFormat = new DecimalFormat("000000");
    private static Gson gson = new Gson();

    Handler(Socket socket) { 
        this.s = socket;
    }

    private String getContentType(String fileRequested) {
		if (fileRequested.endsWith(".htm")  ||  fileRequested.endsWith(".html"))
            return "text/html";
        else if (fileRequested.endsWith(".css"))
            return "text/css";
        else if (fileRequested.endsWith(".json"))
            return "application/json";
        else if (fileRequested.endsWith(".js"))
            return "application/javascript";
        else if (fileRequested.endsWith(".ico"))
            return "image/x-icon";
        else if (fileRequested.endsWith(".png"))
            return "image/png";
        else if (fileRequested.endsWith(".jpg")  ||  fileRequested.endsWith(".jpeg"))
            return "image/jpeg";
		else
			return "text/plain";
    }

    public void run(){
        BufferedReader in = null;
        PrintWriter out = null;
        OutputStream bufferFileOut = null;
        String fileName, props, method, input, contentType, url;
        String[] splittedUrl;
        char[] body;
        int count, contentLength;
        HashMap<String, String> params = new HashMap<String, String>();

        try {
            in = new BufferedReader(new InputStreamReader(s.getInputStream()));  
            out = new PrintWriter(s.getOutputStream(), true);
            bufferFileOut = s.getOutputStream();
            fileName = "";
            url = "";
            props = "";
            method = "";
            input = "";
            contentType = "";
            count = 0;
            contentLength = 0;

            while(true){
                try{
                    input = in.readLine();
                    if (input.startsWith("GET") || input.startsWith("POST")) System.out.println(input);
                }catch(Exception e){
                    System.out.println("catch");
                } 
                StringTokenizer parse = null;
                if (input != null) {
                    parse = new StringTokenizer(input);
                } else {
                    System.out.println("input es null");
                }
                if(parse != null && parse.hasMoreTokens()){
                    // System.out.println("datos");
                    props = parse.nextToken().toUpperCase();
                    if(count == 0){
                        method = props;
                        url = parse.nextToken().toLowerCase();
                        System.out.println("URL:\t" + url);
                        splittedUrl = url.split("\\?");
                        fileName = splittedUrl[0];
                        System.out.println("FILE:\t" + fileName);
                        if (props.equals("GET")) {
                            if (splittedUrl.length > 1) {
                                System.out.println("PARAMS:\t" + splittedUrl[1]);
                                String[] keyValueParams = splittedUrl[1].split("&");
                                for (String param : keyValueParams) {
                                    String[] splittedParam = param.split("=");
                                    params.put(splittedParam[0], splittedParam[1]);
                                    System.out.println("\t" + splittedParam[0] + ":\t" + splittedParam[1]);
                                }
                            }
                        }
                        if(fileName.endsWith("/") && !method.equals("POST")) fileName = "index.html";
                        else fileName = fileName.substring(1, fileName.length());
                        contentType = getContentType(fileName);
                    }else{
                        switch(props){
                            case "CONTENT-TYPE:":{
                                contentType = parse.nextToken();
                                break;
                            }
                            case "CONTENT-LENGTH:":{
                                contentLength = Integer.parseInt(parse.nextToken());
                                break;
                            }
                        }
                    }
                    count++;
                }else{
                    body = new char[contentLength];
                    in.read(body, 0, contentLength);
                    System.out.println(new String(body));
                    break;
                }
            }
            
            if(method.equals("GET")) try{
                if(fileName.equals("index.html")){
                    File file = new File("web/" + fileName);
                    byte[] fileData = Files.readAllBytes(file.toPath());
                    contentLength = fileData.length;
                    out.println("HTTP/1.1 200 OK");
                    out.println("Server: MeshServer");
                    out.println("Date: " + new Date());
                    out.println("Content-type: " + contentType);
                    out.println("Content-length: " + contentLength);
                    out.println();
                    bufferFileOut.write(fileData);
                }else if(fileName.equals("request.json")){
                    String date =           dateFormat.format(new Date());
                    String socket =         this.s.getRemoteSocketAddress().toString();
                    socket =                socket.substring(1, socket.length());
                    String id =             params.containsKey("id") ? params.get("id") : "";
                    String type =           params.containsKey("type") ? params.get("type") : "false";
                    String frequency =      params.containsKey("frequency") ? params.get("frequency") : "-1";
                    String sensor =         params.containsKey("sensor") ? params.get("sensor") : "-1";
                    String status =         params.containsKey("status") ? params.get("status") : "false";
                    String text =           params.containsKey("text") ? params.get("text") : "";

                    if (!Platform.hardwareIds.contains(id)) {
                        Platform.hardwareIds.add(id);
                        String query = "INSERT INTO hardware VALUES ('"
                            + id + "','',"
                            + type + ","
                            + status + ","
                            + frequency + ",'"
                            + text + "');";

                        Platform.executeQuery(query);
                    }

                    String query = "INSERT INTO requests VALUES ("
                        + (Platform.correlative.getAndIncrement() + 1) + ",'"
                        + date + "','"
                        + socket + "','"
                        + id + "',"
                        + type + ","
                        + frequency + ","
                        + sensor + ","
                        + status + ",'"
                        + text + "');";

                    System.out.println("QUERY:\t" + query);

                    Platform.executeQuery(query);

                    query = "SELECT * FROM hardware WHERE id = '" + id + "';";
                    ResultSet rs = Platform.executeQuery(query);
                    while (rs.next()) {
                        status = rs.getBoolean("status") + "";
                        frequency = rs.getInt("frequency") + "";
                        text = rs.getString("text");
                        System.out.println("STATUS:\t" + status);
                    }
                    rs.close();
                    
                    String response = "{" + 
                        "\"status\": " + status +
                        ",\"frequency\": " + frequency +
                        ",\"text\": \"" + text + "\"" +
                    "}";

                    out.println("HTTP/1.1 200 OK");
                    out.println("Server: MeshServer");
                    out.println("Date: " + new Date());
                    out.println("Content-type: " + contentType);
                    out.println("Content-length: " + response.length());
                    out.println();
                    out.println(response);
                } else {
                    File file = new File("web/" + fileName);
                    if(file.exists()){
                        byte[] fileData = Files.readAllBytes(file.toPath());
                        contentLength = fileData.length;
                        out.println("HTTP/1.1 200 OK");
                        out.println("Server: MeshServer");
                        out.println("Date: " + new Date());
                        out.println("Content-type: " + contentType);
                        out.println("Content-length: " + contentLength);
                        out.println();
                        bufferFileOut.write(fileData);
                    }else{
                        out.println("HTTP/1.1 404 File Not Found");
                        out.println("Server: MeshServer");
                        out.println("Date: " + new Date());
                        out.println();
                    }
                }
            } catch (SQLException e) {
                System.out.println(e);
            } else if (method.equals("POST")) try {
                String stringBody = new String(body).replace("\"condition\"", "\"operator\"").replace("\"if\"", "\"condition\"").replace("\"then\"", "\"consequence\"").replace("\"else\"", "\"alternative\"");
                FrontendRequest frontendRequest = gson.fromJson(stringBody, FrontendRequest.class);
                Date now = new Date();
                String response = "{\"id\":\"" + Platform.id + "\", \"url\":\"" + Platform.ip + "\", \"date\": \"" + dateFormat.format(now) + "\"";
                if (fileName.equals("search/")) {
                    response += ", \"search\": {"; 

                    String query = "SELECT * FROM hardware WHERE id = '" + frontendRequest.search.id_hardware + "';";
                    ResultSet rs = Platform.executeQuery(query);
                    while (rs.next()) {
                        response += "\"id_hardware\": \"" + rs.getString("id") + "\", \"type\": \"";
                        response += rs.getBoolean("type") ? "input" : "output";
                        response += "\"";
                    }
                    response += "}, \"data\": {";
                    query = "SELECT * FROM requests WHERE id = '" + frontendRequest.search.id_hardware + "' AND date > '" + frontendRequest.search.start_date + "' AND date < '" + frontendRequest.search.finish_date + "';";
                    rs = Platform.executeQuery(query);
                    while (rs.next()) {
                        response += "\"" + rs.getString("date") + "\": {\"sensor\": " + rs.getString("sensor") + ", \"status\": " + rs.getBoolean("status") + ", \"freq\": " + rs.getInt("frequency") + ", \"text\": \"" + rs.getString("text");
                        response += "\"}, ";
                    }
                    response = response.substring(0, response.length() - 2);
                    response += "}";
                    rs.close();
                } else if (fileName.equals("info/")) {
                    response += ", \"hardware\": {"; 
                    String query = "SELECT * FROM hardware;";
                    ResultSet rs = Platform.executeQuery(query);
                    while (rs.next()) {
                        response += "\"" + rs.getString("id") + "\": {\"tag\": \"" + rs.getString("tag") + "\", \"type\": \"";
                        response += rs.getBoolean("type") ? "input" : "output";
                        response += "\"}, ";
                    }
                    rs.close();
                    response = response.substring(0, response.length() - 2);
                    response += "}";
                } else if (fileName.equals("change/")) {
                    try {
                        Hardware[] hardwareArray = frontendRequest.decodeHardware();
                        for (Hardware hardware : hardwareArray) {
                            String query = "UPDATE hardware SET ";
                            query += hardware.params.tag != null ? "tag = '" + hardware.params.tag + "', " : "";
                            query += hardware.params.text != null ? "text = '" + hardware.params.text + "', " : "";
                            query += hardware.params.freq != 0 ? "frequency = " + hardware.params.freq + ", " : "";
                            query += hardware.params.status != null ? "status = " + hardware.params.status + ", " : "";
                            query = query.substring(0, query.length() - 2);
                            query += " WHERE id = '" + hardware.id + "';";
                            System.out.println(query);
                            Platform.executeQuery(query);
                        }
                        response += ", \"status\": \"OK\""; 
                    } catch (SQLException e) {
                        System.out.println(e);
                        response += ", \"status\": \"ERROR\""; 
                    }
                   
                } else if (fileName.equals("create/")) {
                    try {
                        Create create = frontendRequest.create;
                        if (create != null) {
                            String eventCorrelative = "EV" + decimalFormat.format(Platform.eventCorrelative.getAndIncrement() + 1);
                            Condition condition = create.condition;
                            Left left = condition.left;
                            Right right = condition.right;
                            Consequence consequence = create.consequence;
                            Consequence alternative = create.alternative;

                            if (condition != null && consequence != null && alternative != null) {
                                String query = "INSERT INTO events VALUES ('"
                                    + eventCorrelative + "','"
                                    + left.url + "','"
                                    + left.id + "',"
                                    + left.freq + ",'"
                                    + condition.operator + "',"
                                    + right.sensor + ","
                                    + right.status + ","
                                    + right.freq + ",'"
                                    + right.text + "','"
                                    + consequence.url + "','"
                                    + consequence.id + "',"
                                    + consequence.status + ","
                                    + consequence.freq + ",'"
                                    + consequence.text + "','"
                                    + alternative.url + "','"
                                    + alternative.id + "',"
                                    + alternative.status + ","
                                    + alternative.freq + ",'"
                                    + alternative.text + "'"
                                    + ");";
    
                                System.out.println("QUERY:\t" + query);
            
                                Platform.executeQuery(query);
    
                                response += ", \"idEvent\": \"" + eventCorrelative + "\"";
                                response += ", \"status\": \"OK\""; 

                            } else {
                                response += ", \"status\": \"ERROR\"";
                            }
                        } else {
                            response += ", \"status\": \"ERROR\"";
                        }
                    } catch (SQLException e) {
                        System.out.println(e);
                        response += ", \"status\": \"ERROR\"";
                    }
                } else if (fileName.equals("update/")) {
                    Update update = frontendRequest.update;
                    if (update != null) {
                        String eventCorrelative = update.id;
                        Condition condition = update.condition;
                        Left left = condition.left;
                        Right right = condition.right;
                        Consequence consequence = update.consequence;
                        Consequence alternative = update.alternative;

                        String query = "UPDATE events SET ";
                        if (condition != null) {
                            if (left != null) {
                                query += left.url != null ? "if_left_url = '" + left.url + "', " : "";
                                query += left.id != null ? "if_left_id = '" + left.id + "', " : "";
                                query += left.freq != 0 ? "if_left_freq = " + left.freq + ", " : "";
                            }

                            query += condition.operator != null ? "if_operator = '" + condition.operator + "', " : "";

                            if (right != null) {
                                query += right.sensor != 0 ? "if_right_sensor = " + right.sensor + ", " : "";
                                query += "if_right_status = " + right.status + ", ";
                                query += right.freq != 0 ? "if_right_freq = " + right.freq + ", " : "";
                                query += right.text != null ? "if_right_text = '" + right.text + "', " : "";
                            }
                        }

                        if (consequence != null) {
                            query += consequence.url != null ? "then_url = '" + consequence.url + "', " : "";
                            query += consequence.id != null ? "then_id = '" + consequence.id + "', " : "";
                            query += "then_status = " + consequence.status + ", ";
                            query += consequence.freq != 0 ? "then_freq = " + consequence.freq + ", " : "";
                            query += consequence.text != null ? "then_text = '" + consequence.text + "', " : "";
                        }

                        if (alternative != null) {
                            query += alternative.url != null ? "else_url = '" + alternative.url + "', " : "";
                            query += alternative.id != null ? "else_id = '" + alternative.id + "', " : "";
                            query += "else_status = " + alternative.status + ", ";
                            query += alternative.freq != 0 ? "else_freq = " + alternative.freq + ", " : "";
                            query += alternative.text != null ? "else_text = '" + alternative.text + "', " : "";
                        }
                        query = query.substring(0, query.length() - 2);
                        query += " WHERE id = '" + eventCorrelative + "';";
                        System.out.println(query);
                        Platform.executeQuery(query);
                    } else {
                        response += ", \"status\": \"ERROR\"";
                    }
                }
                response += "}";
                out.println("HTTP/1.1 200 OK");
                out.println("Content-Type: application/json");
                out.println("Content-Length:" + response.length());
                out.println();
                out.println(response);
            } catch (SQLException e) {
                System.out.println(e);
            } else try {
                out.println("HTTP/1.1 501 Not Implemented");
                out.println("Server: MeshServer");
                out.println("Date: " + new Date());
                out.println();
            }catch(Exception e){}
            s.close();
            
        } catch (FileNotFoundException e) {
            System.out.println(e);
        } catch (IOException e) {
            System.out.println(e);
        }
    }
}