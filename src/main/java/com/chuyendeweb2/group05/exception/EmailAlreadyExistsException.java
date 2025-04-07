package com.chuyendeweb2.group05.exception;

import org.springframework.http.HttpStatus;

public class EmailAlreadyExistsException extends BaseException {
    public EmailAlreadyExistsException() {
        super("Email đã tồn tại.", HttpStatus.CONFLICT, "EMAIL_ALREADY_EXISTS");
    }
}
