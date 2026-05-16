package com.example.demo.controller;


import com.example.demo.model.Bike;
import com.example.demo.service.BikeService;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping({"/bike"})
public class BikeController {
    private BikeService service = new BikeService();

    @PostMapping({"/add"})
    public String addBike(@RequestParam String id, @RequestParam String model, @RequestParam String brand, @RequestParam double price) {
        Bike bike = new Bike(id, model, brand, price);
        this.service.addBike(bike);
        return "Bike Added!";
    }

    @GetMapping({"/all"})
    public List<String> getBikes() {
        return this.service.getAllBikes();
    }
}


