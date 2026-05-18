package com.oop.oop_web_proj.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "bikes")
public class Bike {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String model;
    private String color;
    private Double price;
    private String brand;
    private String engineCapacity;
    private String registrationNumber;
    private Integer year;
    private String status;

    public Bike() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getModel() { return model; }
    public void setModel(String model) { this.model = model; }

    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }

    public Double getPrice() { return price; }
    public void setPrice(Double price) { this.price = price; }

    public String getBrand() { return brand; }
    public void setBrand(String brand) { this.brand = brand; }

    public String getEngineCapacity() { return engineCapacity; }
    public void setEngineCapacity(String engineCapacity) { this.engineCapacity = engineCapacity; }

    public String getRegistrationNumber() { return registrationNumber; }
    public void setRegistrationNumber(String registrationNumber) { this.registrationNumber = registrationNumber; }

    public Integer getYear() { return year; }
    public void setYear(Integer year) { this.year = year; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
