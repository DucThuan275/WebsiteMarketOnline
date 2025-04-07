package com.chuyendeweb2.group05.exception;

public class APIException extends RuntimeException {
    public APIException(String message) {
        super(message);
    }
}