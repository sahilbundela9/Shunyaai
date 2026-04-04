package com.shunyaai.backend.dto;

public class SuggestionRequest {
    private String partialQuery;

    public SuggestionRequest() {}

    public String getPartialQuery() {
        return partialQuery;
    }

    public void setPartialQuery(String partialQuery) {
        this.partialQuery = partialQuery;
    }
}