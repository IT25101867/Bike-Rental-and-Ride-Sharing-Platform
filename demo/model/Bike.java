package com.example.demo.model;

public class Bike {

    private String id;
    private String model;
    private String brand;
    private double price;

    public Bike(String id, String model, String brand, double price) {
        this.id = id;
        this.model = model;
        this.brand = brand;
        this.price = price;
    }

    public String getId() {

        return this.id;
    }

    public String getModel() {

        return this.model;
    }

    public String getBrand() {

        return this.brand;
    }

    public double getPrice() {

        return this.price;
    }

    public String toFileString() {

        return this.id + "," + this.model + "," + this.brand + "," + this.price;
    }
}

