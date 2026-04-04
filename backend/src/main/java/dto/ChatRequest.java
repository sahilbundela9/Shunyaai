package com.shunyaai.backend.dto;
import java.util.List;

public class ChatRequest {
    private String query;
    private List<Long> paperIds;
    private String mode;

    public ChatRequest() {}

    public String getQuery() {
        return query;
    }

    public void setQuery(String query) {
        this.query = query;
    }

    public List<Long> getPaperIds() {
        return paperIds;
    }

    public void setPaperIds(List<Long> paperIds) {
        this.paperIds = paperIds;
    }

    public String getMode() {
        return mode;
    }

    public void setMode(String mode) {
        this.mode = mode;
    }
}