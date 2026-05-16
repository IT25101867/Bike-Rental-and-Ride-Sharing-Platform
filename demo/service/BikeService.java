package com.example.demo.service;

import com.example.demo.model.Bike;
import com.example.demo.util.FileUtil;
import java.util.List;

public class BikeService {
    public void addBike(Bike bike) {

        FileUtil.save(bike.toFileString());
    }

    public List<String> getAllBikes() {

        return FileUtil.read();
    }
}
