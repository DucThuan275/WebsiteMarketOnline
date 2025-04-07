package com.chuyendeweb2.group05.exception;

import org.springframework.http.HttpStatus;

public class ProductNotFoundException extends BaseException {

    public ProductNotFoundException(long id) {
        super("Sản phẩm không tồn tại. ID = " + id, HttpStatus.NOT_FOUND, "PRODUCT_NOT_FOUND");
    }
}
