package com.chuyendeweb2.group05.entity;

import jakarta.persistence.Column;
import jakarta.persistence.MappedSuperclass;
import jakarta.persistence.EntityListeners;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.io.Serializable;
import java.time.LocalDateTime;

@MappedSuperclass
@Data
@EntityListeners(AuditingEntityListener.class)
public class BaseEntity implements Serializable {

    @Column(name = "Status", nullable = false)
    private boolean status = true; // Thiết lập mặc định trong Java

    @CreatedBy
    @Column(name = "CreatedBy", nullable = false, updatable = false)
    private String createdBy;

    @CreatedDate
    @CreationTimestamp
    @Column(name = "CreatedDate", nullable = false, updatable = false)
    private LocalDateTime createdDate;

    @LastModifiedBy
    @Column(name = "UpdatedBy")
    private String updatedBy;

    @LastModifiedDate
    @UpdateTimestamp
    @Column(name = "UpdatedDate")
    private LocalDateTime updatedDate;
}
