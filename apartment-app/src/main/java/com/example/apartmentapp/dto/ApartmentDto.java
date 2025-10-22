package com.example.apartmentapp.dto;

import java.time.LocalDate;

public class ApartmentDto {
    private Long id;
    private String apartmentName;
    private String address;
    private String minRent;
    private String maxRent;
    private String bed;
    private String bath;
    private String sqft;
    private String floorplan;
    private LocalDate availableDateFormatted;
    private String state;

    public ApartmentDto() {}

    public ApartmentDto(Long id, String apartmentName, String address, String minRent, String maxRent,
                        String bed, String bath, String sqft, String floorplan,
                        LocalDate availableDateFormatted, String state) {
        this.id = id;
        this.apartmentName = apartmentName;
        this.address = address;
        this.minRent = minRent;
        this.maxRent = maxRent;
        this.bed = bed;
        this.bath = bath;
        this.sqft = sqft;
        this.floorplan = floorplan;
        this.availableDateFormatted = availableDateFormatted;
        this.state = state;
    }

    // getters & setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getApartmentName() { return apartmentName; }
    public void setApartmentName(String apartmentName) { this.apartmentName = apartmentName; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getMinRent() { return minRent; }
    public void setMinRent(String minRent) { this.minRent = minRent; }

    public String getMaxRent() { return maxRent; }
    public void setMaxRent(String maxRent) { this.maxRent = maxRent; }

    public String getBed() { return bed; }
    public void setBed(String bed) { this.bed = bed; }

    public String getBath() { return bath; }
    public void setBath(String bath) { this.bath = bath; }

    public String getSqft() { return sqft; }
    public void setSqft(String sqft) { this.sqft = sqft; }

    public String getFloorplan() { return floorplan; }
    public void setFloorplan(String floorplan) { this.floorplan = floorplan; }

    public LocalDate getAvailableDateFormatted() { return availableDateFormatted; }
    public void setAvailableDateFormatted(LocalDate availableDateFormatted) { this.availableDateFormatted = availableDateFormatted; }

    public String getState() { return state; }
    public void setState(String state) { this.state = state; }
}
