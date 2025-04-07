package com.chuyendeweb2.group05.exception;

import org.springframework.http.HttpStatus;

public class CategoryNotFoundException extends BaseException {

    public CategoryNotFoundException() {
        super("Danh mục không tồn tại.", HttpStatus.NOT_FOUND, "CATEGORY_NOT_FOUND");
    }
}
