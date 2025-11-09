package com.helixhub.mobile;

public class PortalStatus {
    private String name;
    private String domain;
    private String description;
    private boolean deployed;
    private long deploymentTime;
    private int activeUsers;
    private double ucfScore;
    
    public PortalStatus(String name, String domain, String description, boolean deployed) {
        this.name = name;
        this.domain = domain;
        this.description = description;
        this.deployed = deployed;
        this.deploymentTime = System.currentTimeMillis();
        this.activeUsers = 0;
        this.ucfScore = 0.0;
    }
    
    // Getters and setters
    public String getName() { return name; }
    public String getDomain() { return domain; }
    public String getDescription() { return description; }
    public boolean isDeployed() { return deployed; }
    public void setDeployed(boolean deployed) { 
        this.deployed = deployed; 
        if (deployed) {
            this.deploymentTime = System.currentTimeMillis();
        }
    }
    public long getDeploymentTime() { return deploymentTime; }
    public int getActiveUsers() { return activeUsers; }
    public void setActiveUsers(int activeUsers) { this.activeUsers = activeUsers; }
    public double getUcfScore() { return ucfScore; }
    public void setUcfScore(double ucfScore) { this.ucfScore = ucfScore; }
    
    public String getDeploymentStatus() {
        if (deployed) {
            long uptime = System.currentTimeMillis() - deploymentTime;
            long hours = uptime / (1000 * 60 * 60);
            long minutes = (uptime % (1000 * 60 * 60)) / (1000 * 60);
            return "✅ Active (" + hours + "h " + minutes + "m)";
        } else {
            return "⏳ Pending Deployment";
        }
    }
}