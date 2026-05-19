package com.oop.oop_web_proj.controller;

import com.oop.oop_web_proj.dto.BikeRentalDto;
import com.oop.oop_web_proj.dto.RideBookingDto;
import com.oop.oop_web_proj.dto.UserHistoryDto;
import com.oop.oop_web_proj.service.BookingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/bookings")
@CrossOrigin(origins = "*")
public class BookingController {

    @Autowired
    private BookingService bookingService;

    @PostMapping("/rent-bike")
    public ResponseEntity<BikeRentalDto> rentBike(@RequestBody BikeRentalDto rentalDto) {
        BikeRentalDto saved = bookingService.rentBike(rentalDto);
        return ResponseEntity.ok(saved);
    }

    @PostMapping("/book-ride")
    public ResponseEntity<RideBookingDto> bookRide(@RequestBody RideBookingDto rideDto) {
        RideBookingDto saved = bookingService.bookRide(rideDto);
        return ResponseEntity.ok(saved);
    }

    @GetMapping("/history/{email}")
    public ResponseEntity<UserHistoryDto> getUserHistory(@PathVariable String email) {
        UserHistoryDto history = bookingService.getUserHistory(email);
        return ResponseEntity.ok(history);
    }

    @GetMapping("/all-rentals")
    public ResponseEntity<java.util.List<BikeRentalDto>> getAllRentals() {
        return ResponseEntity.ok(bookingService.getAllRentals());
    }

    @DeleteMapping("/rentals/{id}")
    public ResponseEntity<?> deleteRental(@PathVariable Long id) {
        if (bookingService.deleteRental(id)) {
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }

    @PutMapping("/rentals/{id}")
    public ResponseEntity<BikeRentalDto> updateRental(@PathVariable Long id, @RequestBody BikeRentalDto rentalDto) {
        BikeRentalDto updated = bookingService.updateRental(id, rentalDto);
        if (updated != null) {
            return ResponseEntity.ok(updated);
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping("/schedule-handover/{rentalId}")
    public ResponseEntity<BikeRentalDto> scheduleHandover(@PathVariable Long rentalId, @RequestParam String returnTime) {
        BikeRentalDto dto = bookingService.scheduleHandover(rentalId, LocalDateTime.parse(returnTime));
        if (dto != null) return ResponseEntity.ok(dto);
        return ResponseEntity.notFound().build();
    }

    @PostMapping("/complete-handover/{rentalId}")
    public ResponseEntity<BikeRentalDto> completeHandover(@PathVariable Long rentalId) {
        BikeRentalDto dto = bookingService.completeHandover(rentalId);
        if (dto != null) return ResponseEntity.ok(dto);
        return ResponseEntity.notFound().build();
    }
    @GetMapping("/all-rides")
    public ResponseEntity<java.util.List<RideBookingDto>> getAllRides() {
        return ResponseEntity.ok(bookingService.getAllRides());
    }

    @PostMapping("/accept-ride/{id}")
    public ResponseEntity<RideBookingDto> acceptRide(@PathVariable Long id, @RequestParam String driverName) {
        RideBookingDto result = bookingService.acceptRide(id, driverName);
        if (result != null) return ResponseEntity.ok(result);
        return ResponseEntity.notFound().build();
    }

    @PostMapping("/start-ride/{id}")
    public ResponseEntity<RideBookingDto> startRide(@PathVariable Long id) {
        RideBookingDto result = bookingService.startRide(id);
        if (result != null) return ResponseEntity.ok(result);
        return ResponseEntity.notFound().build();
    }

    @PostMapping("/decline-ride/{id}")
    public ResponseEntity<RideBookingDto> declineRide(@PathVariable Long id) {
        RideBookingDto result = bookingService.declineRide(id);
        if (result != null) return ResponseEntity.ok(result);
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/driver-rides/{driverName}")
    public ResponseEntity<java.util.List<RideBookingDto>> getDriverRides(@PathVariable String driverName) {
        return ResponseEntity.ok(bookingService.getDriverRides(driverName));
    }

    @PostMapping("/complete-ride/{id}")
    public ResponseEntity<RideBookingDto> completeRide(@PathVariable Long id) {
        RideBookingDto result = bookingService.completeRide(id);
        if (result != null) return ResponseEntity.ok(result);
        return ResponseEntity.notFound().build();
    }
}
