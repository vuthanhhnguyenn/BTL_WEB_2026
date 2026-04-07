package com.troxinh.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "rooms")
public class Room {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, length = 500)
    private String address;

    @Column(nullable = false, length = 100)
    private String district;

    @Column(nullable = false, length = 100)
    private String city;

    @Column(name = "map_address", length = 500)
    private String mapAddress;

    @Column(name = "price_from", nullable = false)
    private Long priceFrom;

    @Column(name = "price_to", nullable = false)
    private Long priceTo;

    @Column(nullable = false, precision = 8, scale = 2)
    private BigDecimal area;

    @Column(length = 50)
    private String direction;

    @Column(nullable = false)
    private Integer bedrooms;

    @Column(nullable = false)
    private Integer bathrooms;

    @Column(columnDefinition = "text")
    private String description;

    @Column(nullable = false, length = 20)
    private String status;

    @Column(name = "view_count", nullable = false)
    private Integer viewCount;

    @Column(name = "is_featured", nullable = false)
    private Boolean isFeatured;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", insertable = false, updatable = false)
    private LocalDateTime updatedAt;

    public Long getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public String getAddress() {
        return address;
    }

    public String getDistrict() {
        return district;
    }

    public String getCity() {
        return city;
    }

    public String getMapAddress() {
        return mapAddress;
    }

    public Long getPriceFrom() {
        return priceFrom;
    }

    public Long getPriceTo() {
        return priceTo;
    }

    public BigDecimal getArea() {
        return area;
    }

    public String getDirection() {
        return direction;
    }

    public Integer getBedrooms() {
        return bedrooms;
    }

    public Integer getBathrooms() {
        return bathrooms;
    }

    public String getDescription() {
        return description;
    }
}