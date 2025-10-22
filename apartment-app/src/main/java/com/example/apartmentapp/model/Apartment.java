package com.example.apartmentapp.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "apartment_details")
public class Apartment {

    @Id
    @Column(name = "id")
    private Long id;

    @Column(name = "refid")
    private String refid;

    @Column(name = "association_code")
    private String associationCode;

    @Column(name = "source_name")
    private String sourceName;

    @Column(name = "group_name")
    private String groupName;

    @Column(name = "agg_datetime")
    private LocalDateTime aggDatetime;

    @Column(name = "machine_name")
    private String machineName;

    @Column(name = "apt_result_apartment_name", length = 500)
    private String apartmentName;

    @Column(name = "apt_result_address", length = 500)
    private String address;

    @Column(name = "apt_result_unit_number")
    private String unitNumber;

    @Column(name = "apt_result_available_date")
    private String availableDate;

    @Column(name = "apt_result_available_date_formatted")
    private LocalDate availableDateFormatted;

    @Column(name = "apt_result_floorplan")
    private String floorplan;

    @Column(name = "apt_result_min_rent")
    private String minRent;

    @Column(name = "apt_result_max_rent")
    private String maxRent;

    @Column(name = "apt_result_sqft")
    private String sqft;

    @Column(name = "apt_result_bed")
    private String bed;

    @Column(name = "apt_result_bath")
    private String bath;

    @Column(name = "state")
    private String state;

    // Constructors
    public Apartment() {}

    // Getters & Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getRefid() { return refid; }
    public void setRefid(String refid) { this.refid = refid; }

    public String getAssociationCode() { return associationCode; }
    public void setAssociationCode(String associationCode) { this.associationCode = associationCode; }

    public String getSourceName() { return sourceName; }
    public void setSourceName(String sourceName) { this.sourceName = sourceName; }

    public String getGroupName() { return groupName; }
    public void setGroupName(String groupName) { this.groupName = groupName; }

    public LocalDateTime getAggDatetime() { return aggDatetime; }
    public void setAggDatetime(LocalDateTime aggDatetime) { this.aggDatetime = aggDatetime; }

    public String getMachineName() { return machineName; }
    public void setMachineName(String machineName) { this.machineName = machineName; }

    public String getApartmentName() { return apartmentName; }
    public void setApartmentName(String apartmentName) { this.apartmentName = apartmentName; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getUnitNumber() { return unitNumber; }
    public void setUnitNumber(String unitNumber) { this.unitNumber = unitNumber; }

    public String getAvailableDate() { return availableDate; }
    public void setAvailableDate(String availableDate) { this.availableDate = availableDate; }

    public LocalDate getAvailableDateFormatted() { return availableDateFormatted; }
    public void setAvailableDateFormatted(LocalDate availableDateFormatted) { this.availableDateFormatted = availableDateFormatted; }

    public String getFloorplan() { return floorplan; }
    public void setFloorplan(String floorplan) { this.floorplan = floorplan; }

    public String getMinRent() { return minRent; }
    public void setMinRent(String minRent) { this.minRent = minRent; }

    public String getMaxRent() { return maxRent; }
    public void setMaxRent(String maxRent) { this.maxRent = maxRent; }

    public String getSqft() { return sqft; }
    public void setSqft(String sqft) { this.sqft = sqft; }

    public String getBed() { return bed; }
    public void setBed(String bed) { this.bed = bed; }

    public String getBath() { return bath; }
    public void setBath(String bath) { this.bath = bath; }

    public String getState() { return state; }
    public void setState(String state) { this.state = state; }
}
