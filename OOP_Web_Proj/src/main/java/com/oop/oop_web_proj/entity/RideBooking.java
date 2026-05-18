package com.oop.oop_web_proj.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity(name = "RideBooking")
@Table(name = "ride_bookings")
public class RideBooking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String userEmail;
    private String startLocation;
    private String endLocation;
    private LocalDate rideDate;
    private String rideTime;
    private String status;
    private String driverName;
    private String vehicleType;

    public RideBooking() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getUserEmail() { return userEmail; }
    public void setUserEmail(String userEmail) { this.userEmail = userEmail; }
    public String getStartLocation() { return startLocation; }
    public void setStartLocation(String startLocation) { this.startLocation = startLocation; }
    public String getEndLocation() { return endLocation; }
    public void setEndLocation(String endLocation) { this.endLocation = endLocation; }
    public LocalDate getRideDate() { return rideDate; }
    public void setRideDate(LocalDate rideDate) { this.rideDate = rideDate; }
    public String getRideTime() { return rideTime; }
    public void setRideTime(String rideTime) { this.rideTime = rideTime; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getDriverName() { return driverName; }
    public void setDriverName(String driverName) { this.driverName = driverName; }
    public String getVehicleType() { return vehicleType; }
    public void setVehicleType(String vehicleType) { this.vehicleType = vehicleType; }
}
