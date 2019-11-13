public class PlatformResponse {
    public String id;
    public String url;
    public String date;
    public String status;
    public Object data;
    public SearchResponse search;
    public SearchData[] searchData;
    
    public void decodeSearchData() {
        this.searchData = (new SearchData(this.data.toString())).decode();
    }
}

class SearchResponse {
    public String id_hardware;
    public String type;
}