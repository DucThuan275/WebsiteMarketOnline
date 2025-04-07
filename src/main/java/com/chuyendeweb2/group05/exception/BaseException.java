package com.chuyendeweb2.group05.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

import com.chuyendeweb2.group05.response.ErrorResponse;

@Getter
public abstract class BaseException extends RuntimeException {
    private final HttpStatus status;
    private final String errorCode;

    protected BaseException(String message, HttpStatus status, String errorCode) {
        super(message);
        this.status = status;
        this.errorCode = errorCode;
    }

    public ErrorResponse toErrorResponse() {
        return new ErrorResponse(status.value(), getMessage(), errorCode);
    }
}
