package com.chuyendeweb2.group05.response;

public class ErrorResponseDTO {
    private String error;
    private String message;

    public ErrorResponseDTO(String error, String message) {
        this.error = error;
        this.message = message;
    }

    // Getter and Setter methods
    public String getError() {
        return error;
    }

    public void setError(String error) {
        this.error = error;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
