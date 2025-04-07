package com.chuyendeweb2.group05.exception;

import org.springframework.http.HttpStatus;

public class CategoryAlreadyExistsException extends BaseException {
    public CategoryAlreadyExistsException() {
        super("Tên danh mục đã tồn tại.", HttpStatus.CONFLICT, "CATEGORY_ALREADY_EXISTS");
    }
}
