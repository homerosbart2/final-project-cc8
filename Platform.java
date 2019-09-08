import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
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
import java.util.Properties;

/**
 * Platform
 */
public class Platform {
    public static void main(String[] args) {
        Platform platform = new Platform();
        platform.initializeServer();
    }

    public void initializeServer(){
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
                

            if(defaultProps.containsKey("nThreads"))
                try {
                    port = Integer.valueOf(String.valueOf(defaultProps.get("port")));
                } catch (Exception e) {
                    System.out.println("ALERTA\tLa configuración 'port' no es correcta. Se utilizará el default: 2407.");
                }
            else System.out.println("ALERTA:\tLa configuracion 'port' no se ha encontrado en server.conf. Se utilizara el default: 2407.");

        } catch (FileNotFoundException e) {
            System.out.println("ALERTA:\tNo existe el archivo server.conf. Si desea configurar el servidor, agrueguelo a la carpeta.");
        } catch (IOException e){
            System.out.println(e);
        }

        System.out.println("INFO:\t\tIniciando el servidor con " + nThreads + " threads en el puerto " + port + ". La configuracion puede ser cambiada en server.conf.");

        try {
            NetworkService networkService = new NetworkService(port, nThreads);
    
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

    public NetworkService(int port, int nThreads)
        throws IOException {
        serverSocket = new ServerSocket(port);
        pool = Executors.newFixedThreadPool(nThreads);
    }

    public void run() {
        try {
            for (;;) {
                pool.execute(new Handler(serverSocket.accept()));
            }
        } catch (IOException ex) {
            pool.shutdown();
        }
    }
}

class Handler implements Runnable {
    private final Socket s;
    static DateFormat dateFormat = new SimpleDateFormat("dd/MM/yyyy HH:mm:ss");

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
                        if (splittedUrl.length > 2) {
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
                    String response = "{" + 
                        "\"motor_speed\": 175," + 
                        " \"success\": true" + 
                    "}";
                    if (params.containsKey("temperature")) System.out.println("TMP:\t" + params.get("temperature"));
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