import javax.script.ScriptException;
import javax.script.ScriptEngineManager;
import javax.script.ScriptEngine;

public class Hardware {
    private static ScriptEngineManager mgr = new ScriptEngineManager();
    private static ScriptEngine engine = mgr.getEngineByName("JavaScript");

    public String id;
    public HardwareParams params;

    public Hardware(String id, HardwareParams params) {
        this.id = id;
        this.params = params;
    }

    public static boolean runHardwareComparison(Hardware[] hardwares, String operator, Right right) {
        boolean shouldRunTheConsequence = false;
        COMPARE_BY compareBy = null;
        
        if (hardwares.length > 0) {
            Hardware firstHardware = hardwares[0];
            if (firstHardware.params.type == HARDWARE_TYPE.INPUT) {
                if (right.sensor != 0 && firstHardware.params.sensor != 0) {
                    compareBy = COMPARE_BY.SENSOR;
                } else if (right.freq != 0 && firstHardware.params.freq != 0) {
                    compareBy = COMPARE_BY.FREQUENCY;
                }
            } else {
                if (operator.equals("==") || operator.equals("!=")) {
                    if (!right.text.equals("null") && !firstHardware.params.text.equals("null")) {
                        compareBy = COMPARE_BY.TEXT;
                    } else {
                        compareBy = COMPARE_BY.STATUS;
                    }
                }
            }

            if (compareBy != null) {
                for (Hardware hardware : hardwares) {
                    String valueA = "";
                    String valueB = "";

                    switch (compareBy) {
                        case SENSOR: {
                            valueA = "" + hardware.params.sensor;
                            valueB = "" + right.sensor;
                        } break;
                        case FREQUENCY: {
                            valueA = "" + hardware.params.freq;
                            valueB = "" + right.freq;
                        } break;
                        case TEXT: {
                            valueA = hardware.params.text;
                            valueB = right.text;
                        } break;
                        case STATUS: {
                            valueA = "" + hardware.params.status;
                            valueB = "" + right.status;
                        } break;
                    }

                    String operation = valueA + " " + operator + " " + valueB;

                    try {
                        shouldRunTheConsequence = Boolean.parseBoolean(Hardware.engine.eval(operation).toString());
                        System.out.println(operation + " = " + shouldRunTheConsequence);
                        if (shouldRunTheConsequence) {
                            break;
                        }
                    } catch (ScriptException e) {
                        System.out.println(e);
                    }
                }
            }
        }

        return shouldRunTheConsequence;
    }
}

enum HARDWARE_TYPE {
    INPUT,
    OUTPUT
}

class HardwareParams {
    public boolean status;
    public int freq;
    public String text;
    public String tag;
    public int sensor;
    public HARDWARE_TYPE type;

    public HardwareParams(boolean status, int freq, String text, String tag, int sensor, HARDWARE_TYPE type) {
        this.status = status;
        this.freq = freq;
        this.text = text;
        this.tag = tag;
        this.sensor = sensor;
        this.type = type;
    }
}