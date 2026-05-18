package com.oop.oop_web_proj.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class BikeRentalDto {
    private Long id;
    private String userEmail;
    private String userName;
    private String bikeId;
    private String bikeModel;
    private Integer days;
    private LocalDate rentalDate;
    private LocalDateTime returnTime;
    private String status;

    public BikeRentalDto() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getUserEmail() { return userEmail; }
    public void setUserEmail(String userEmail) { this.userEmail = userEmail; }
    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }
    public String getBikeId() { return bikeId; }
    public void setBikeId(String bikeId) { this.bikeId = bikeId; }
    public String getBikeModel() { return bikeModel; }
    public void setBikeModel(String bikeModel) { this.bikeModel = bikeModel; }
    public Integer getDays() { return days; }
    public void setDays(Integer days) { this.days = days; }
    public LocalDate getRentalDate() { return rentalDate; }
    public void setRentalDate(LocalDate rentalDate) { this.rentalDate = rentalDate; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public LocalDateTime getReturnTime() { return returnTime; }
    public void setReturnTime(LocalDateTime returnTime) { this.returnTime = returnTime; }
}
