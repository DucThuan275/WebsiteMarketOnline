package com.chuyendeweb2.group05.exception;

import org.springframework.http.HttpStatus;

public class MemberNotFoundException extends BaseException {
    public MemberNotFoundException() {
        super("Người dùng không tồn tại.", HttpStatus.NOT_FOUND, "USER_NOT_FOUND");
    }
}
