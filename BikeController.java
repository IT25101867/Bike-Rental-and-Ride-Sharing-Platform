package com.oop.oop_web_proj.controller;

import com.oop.oop_web_proj.dto.BikeDTO;
import com.oop.oop_web_proj.service.BikeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bikes")
@CrossOrigin(origins = "*")
public class BikeController {

    @Autowired
    private BikeService bikeService;

    @PostMapping("/add")
    public ResponseEntity<String> addBike(@RequestBody BikeDTO bikeDto) {
        String result = bikeService.addBike(bikeDto);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/all")
    public ResponseEntity<List<BikeDTO>> getAllBikes() {
        return ResponseEntity.ok(bikeService.getAllBikes());
    }

    @GetMapping("/{id}")
    public ResponseEntity<BikeDTO> getBikeById(@PathVariable Long id) {
        BikeDTO bike = bikeService.getBikeById(id);
        if (bike != null) {
            return ResponseEntity.ok(bike);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteBike(@PathVariable Long id) {
        boolean deleted = bikeService.deleteBike(id);
        if (deleted) {
            return ResponseEntity.ok("Bike deleted successfully");
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<BikeDTO> updateBike(@PathVariable Long id, @RequestBody BikeDTO updatedDto) {
        BikeDTO updatedBike = bikeService.updateBike(id, updatedDto);
        if (updatedBike != null) {
            return ResponseEntity.ok(updatedBike);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/search")
    public ResponseEntity<List<BikeDTO>> searchBikes(@RequestParam String query) {
        return ResponseEntity.ok(bikeService.searchBikes(query));
    }
}
