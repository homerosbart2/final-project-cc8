import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.HashMap;

public class Event {
    public Condition condition;
    public Consequence consequence;
    public Consequence alternative;

    public Event(Condition condition, Consequence consequence, Consequence alternative) {
        this.condition = condition;
        this.consequence = consequence;
        this.alternative = alternative;
    }

    private static Event getEventFromResultSet(ResultSet resultSet) throws SQLException {
        Left left = new Left(
            resultSet.getString("if_left_url"),
            resultSet.getString("if_left_id"),
            resultSet.getInt("if_left_freq")
        );

        Right right = new Right(
            resultSet.getInt("if_right_sensor"),
            resultSet.getBoolean("if_right_status"),
            resultSet.getInt("if_right_freq"),
            resultSet.getString("if_right_text")
        );

        Condition condition = new Condition(
            left,
            resultSet.getString("if_operator"),
            right
        );

        Consequence consequence = new Consequence(
            resultSet.getString("then_url"),
            resultSet.getString("then_id"),
            resultSet.getBoolean("then_status"),
            resultSet.getInt("then_freq"),
            resultSet.getString("then_text")
        );

        Consequence alternative = new Consequence(
            resultSet.getString("else_url"),
            resultSet.getString("else_id"),
            resultSet.getBoolean("else_status"),
            resultSet.getInt("else_freq"),
            resultSet.getString("else_text")
        );

        return new Event(condition, consequence, alternative);
    }

    public static Event selectEvent(String correlative) throws SQLException{
        String query = "SELECT * FROM events WHERE id = '" + correlative + "';";
        
        ResultSet resultSet = Platform.executeQuery(query);

        while (resultSet.next()) {
            return getEventFromResultSet(resultSet);
        }

        return null;
    }

    public static HashMap<String, Event> selectAllEvents() throws SQLException {
        HashMap<String, Event> events = new HashMap<String, Event>();

        String query = "SELECT * FROM events;";

        ResultSet resultSet = Platform.executeQuery(query);

        while (resultSet.next()) {
            String id = resultSet.getString("id");

            Event event = getEventFromResultSet(resultSet);

            events.put(id, event);
        }

        return events;
    }
}

class Condition {
    public Left left;
    public String operator;
    public Right right;

    public Condition(Left left, String operator, Right right) {
        this.left = left;
        this.operator = operator;
        this.right = right;
    }
}

class Consequence {
    public String url;
    public String id;
    public boolean status;
    public int freq;
    public String text;

    public Consequence(String url, String id, boolean status, int freq, String text) {
        this.url = url;
        this.id = id;
        this.status = status;
        this.freq = freq;
        this.text = text;
    }
}

class Left {
    public String url;
    public String id;
    public int freq;

    public Left(String url, String id, int freq) {
        this.url = url;
        this.id = id;
        this.freq = freq;
    }
}

class Right {
    public int sensor;
    public boolean status;
    public int freq;
    public String text;

    public Right(int sensor, boolean status, int freq, String text) {
        this.sensor = sensor;
        this.status = status;
        this.freq = freq;
        this.text = text;
    }
}