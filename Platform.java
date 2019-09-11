import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.atomic.AtomicInteger;
import java.io.*;
import java.net.*;
import java.util.Date;
import java.util.HashMap;
import java.util.StringTokenizer;
import java.text.SimpleDateFormat;
import java.text.DateFormat;
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

/**
 * Platform
 */
public class Platform {
    public static AtomicInteger correlative = new AtomicInteger(-1);

    private static String db = "default.db";
    private static Connection sqliteConnection;

    public static void main(String[] args) {
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
        int port = 80;

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
                    port = Integer.valueOf(String.valueOf(defaultProps.get("port")));
                } catch (Exception e) {
                    System.out.println("ALERTA\tLa configuración 'port' no es correcta. Se utilizará el default: " + port + ".");
                }
            else System.out.println("ALERTA:\tLa configuracion 'port' no se ha encontrado en server.conf. Se utilizara el default: " + port + ".");

            if (defaultProps.containsKey("db")) db = defaultProps.getProperty("db");
            else System.out.println("ALERTA:\tLa configuracion 'db' no se ha encontrado en server.conf. Se utilizara el default: " + db + ".");

        } catch (FileNotFoundException e) {
            System.out.println("ALERTA:\tNo existe el archivo server.conf. Si desea configurar el servidor, agrueguelo a la carpeta.");
        } catch (IOException e){
            System.out.println(e);
        }

        System.out.println("INFO:\t\tIniciando el servidor con " + nThreads + " threads en el puerto " + port + ". Utilizando la base de datos " + Platform.db + ". La configuracion puede ser cambiada en server.conf.");

        try {
            Platform.sqliteConnection = connect();
            Statement statement = sqliteConnection.createStatement();
            statement.setQueryTimeout(5);
            String query = "CREATE TABLE IF NOT EXISTS requests (id int primary key, date datetime, socket varchar, temperature double, motor_speed int, m1 int, m2 int);";
            statement.execute(query);
            
            query = "SELECT COUNT(id) as count, MAX(id) as max FROM requests;";
            ResultSet rs = statement.executeQuery(query);
            while (rs.next()) {
                int count = rs.getInt("count");
                int max = rs.getInt("max");
                if (count > 0 && max > Platform.correlative.get()) Platform.correlative.set(max);
            }
            rs.close();

            System.out.println("INFO:\tSiguiente correlativo: " + (Platform.correlative.get() + 1));
            NetworkService networkService = new NetworkService(port, nThreads, Platform.sqliteConnection);
    
            new Thread(networkService).start();
        } catch (BindException e) {
            System.out.println("ERROR:\tEl puerto " + port + " esta ocupado.");
        } catch (Exception e) {
            System.out.println(e);
        }
    }
}

class NetworkService implements Runnable {
    private final ServerSocket serverSocket;
    private final ExecutorService pool;
    private final Connection sqliteConnection;

    public NetworkService(int port, int nThreads, Connection sqliteConnection)
        throws IOException {
        this.serverSocket = new ServerSocket(port);
        this.pool = Executors.newFixedThreadPool(nThreads);
        this.sqliteConnection = sqliteConnection;
    }

    public void run() {
        try {
            for (;;) {
                pool.execute(new Handler(this.serverSocket.accept(), this.sqliteConnection));
            }
        } catch (IOException ex) {
            pool.shutdown();
        }
    }
}

class Handler implements Runnable {
    private final Socket s;
    static DateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
    private Connection sqliteConnection;
    private Statement statement;

    Handler(Socket socket, Connection sqliteConnection) { 
        this.s = socket;
        this.sqliteConnection = sqliteConnection;
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
        String fileName, method, input, contentType, connection, url;
        String[] splittedUrl;
        int count, fileLength;
        HashMap<String, String> params = new HashMap<String, String>();

        try {
            in = new BufferedReader(new InputStreamReader(s.getInputStream()));  
            out = new PrintWriter(s.getOutputStream(), true);
            bufferFileOut = s.getOutputStream();
            fileName = "";
            url = "";
            method = "";
            input = "";
            contentType = "";
            connection = "";
            count = 0;

            while(true){
                try{
                    input = in.readLine();
                    if (input.startsWith("GET")) System.out.println(input);
                }catch(Exception e){

                } 
                StringTokenizer parse = null;
                if (input != null) parse = new StringTokenizer(input);
                if(parse != null && parse.hasMoreTokens()){
                    if(count == 0){
                        method = parse.nextToken().toUpperCase();
                        url = parse.nextToken().toLowerCase();
                        System.out.println("URL:\t" + url);
                        splittedUrl = url.split("\\?");
                        fileName = splittedUrl[0];
                        System.out.println("FILE:\t" + fileName);
                        if (splittedUrl.length > 1) {
                            System.out.println("PARAMS:\t" + splittedUrl[1]);
                            String[] keyValueParams = splittedUrl[1].split("&");
                            for (String param : keyValueParams) {
                                String[] splittedParam = param.split("=");
                                params.put(splittedParam[0], splittedParam[1]);
                                System.out.println("\t" + splittedParam[0] + ":\t" + splittedParam[1]);
                            }
                        }
                        if(fileName.endsWith("/")) fileName = "index.html";
                        else fileName = fileName.substring(1, fileName.length());
                        contentType = getContentType(fileName);
                    }else{
                        switch(method){
                            case "Connection:":{
                                connection = parse.nextToken();
                                break;
                            }
                        }
                    }
                    count++;
                }else{
                    break;
                }
            }
            
            if(method.equals("GET")) try{
                if(fileName.equals("index.html")){
                    File file = new File("web/" + fileName);
                    byte[] fileData = Files.readAllBytes(file.toPath());
                    fileLength = fileData.length;
                    out.println("HTTP/1.1 200 OK");
                    out.println("Server: MeshServer");
                    out.println("Date: " + new Date());
                    out.println("Content-type: " + contentType);
                    out.println("Content-length: " + fileLength);
                    out.println();
                    bufferFileOut.write(fileData);
                }else if(fileName.equals("request.json")){
                    String temperature =    params.containsKey("temperature") ? params.get("temperature") : "";
                    String motorSpeed =     params.containsKey("motor_speed") ? params.get("motor_speed") : "";
                    String m1 =             params.containsKey("m1") ? params.get("m1") : "";
                    String m2 =             params.containsKey("m2") ? params.get("m2") : "";
                    String date =           dateFormat.format(new Date());
                    String ip =             this.s.getRemoteSocketAddress().toString();

                    String query = "INSERT INTO requests VALUES ("
                        + (Platform.correlative.getAndIncrement() + 1) + ",'"
                        + date + "','"
                        + ip + "',"
                        + temperature + ","
                        + motorSpeed + ","
                        + m1 + ","
                        + m2 + ");";

                    System.out.println("QUERY:\t" + query);

                    try {
                        if (this.sqliteConnection.isClosed() || statement == null) {
                            this.sqliteConnection = Platform.connect();
                            this.statement = sqliteConnection.createStatement();
                            statement.setQueryTimeout(5);
                        }
                        statement.executeUpdate(query);
                    } catch (SQLException e) {
                        System.out.println(e);
                    }
                    
                    String response = "{" + 
                        "\"motor_speed\": 175," + 
                        "\"success\": true," + 
                        "\"m1\": " + temperature.substring(1,2) + "," +
                        "\"m2\": " + temperature.substring(0,1) +
                    "}";

                    out.println("HTTP/1.1 200 OK");
                    out.println("Server: MeshServer");
                    out.println("Date: " + new Date());
                    out.println("Content-type: " + contentType);
                    out.println("Content-length: " + response.length());
                    out.println();
                    out.println(response);
                }else{
                    File file = new File("web/" + fileName);
                    if(file.exists()){
                        byte[] fileData = Files.readAllBytes(file.toPath());
                        fileLength = fileData.length;
                        out.println("HTTP/1.1 200 OK");
                        out.println("Server: MeshServer");
                        out.println("Date: " + new Date());
                        out.println("Content-type: " + contentType);
                        out.println("Content-length: " + fileLength);
                        out.println();
                        bufferFileOut.write(fileData);
                    }else{
                        out.println("HTTP/1.1 404 File Not Found");
                        out.println("Server: MeshServer");
                        out.println("Date: " + new Date());
                        out.println();
                    }
                }
            } catch (Exception e) {
                System.out.println(e);
            }
            else try{
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