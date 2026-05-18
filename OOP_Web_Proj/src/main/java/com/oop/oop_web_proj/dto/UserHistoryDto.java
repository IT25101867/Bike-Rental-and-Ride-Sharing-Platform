package com.oop.oop_web_proj.dto;

import java.util.List;

public class UserHistoryDto {
    private List<BikeRentalDto> rentals;
    private List<RideBookingDto> rides;

    public UserHistoryDto() {}

    public UserHistoryDto(List<BikeRentalDto> rentals, List<RideBookingDto> rides) {
        this.rentals = rentals;
        this.rides = rides;
    }

    public List<BikeRentalDto> getRentals() { return rentals; }
    public void setRentals(List<BikeRentalDto> rentals) { this.rentals = rentals; }
    public List<RideBookingDto> getRides() { return rides; }
    public void setRides(List<RideBookingDto> rides) { this.rides = rides; }
}
