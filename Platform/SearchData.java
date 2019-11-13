import com.google.gson.Gson;

public class SearchData {
    private String encodedSearchData;

    public String date;
    public SearchDataParams params;

    public SearchData(String data) {
        String encodedSearchData = "[";
        data = data.substring(1, data.length() - 1);
        String[] searchDatas = data.split("\\}\\,");
        for (int i = 0; i < searchDatas.length; i++) {
            if (searchDatas[i].isEmpty()) {
                encodedSearchData += " ";
                break;
            }
            if (i != searchDatas.length - 1) searchDatas[i] += "}";
            String[] elements = searchDatas[i].split("\\=\\{");
            encodedSearchData += "{\"date\":\"" + elements[0].trim() + "\",";
            encodedSearchData += "\"params\":{";
            elements[1] = elements[1].substring(0, elements[1].length() - 1);
            String[] params = elements[1].split("\\,");
            for (String param : params) {
                String[] splittedParam = param.split("\\=");
                encodedSearchData += "\"" + splittedParam[0].trim() + "\":\"" + splittedParam[1] + "\",";
            }
            encodedSearchData = encodedSearchData.substring(0, encodedSearchData.length() - 1);
            encodedSearchData += "}},";
        }
        encodedSearchData = encodedSearchData.substring(0, encodedSearchData.length() - 1);
        encodedSearchData += "]";
        
        this.encodedSearchData = encodedSearchData;
    }

    public SearchData[] decode() {
        return new Gson().fromJson(this.encodedSearchData, SearchData[].class);
    }
}

class SearchDataParams {
    public boolean status;
    public int freq;
    public String text;
    public int sensor;
}