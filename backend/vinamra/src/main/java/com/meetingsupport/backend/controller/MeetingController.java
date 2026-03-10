package com.meetingsupport.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.meetingsupport.backend.entity.Meeting;
import com.meetingsupport.backend.service.MeetingService;

import java.util.List;

@RestController
@RequestMapping("/api/meetings")
@CrossOrigin(origins = "http://localhost:3000") // Allow React to call this API
public class MeetingController {

    private final MeetingService meetingService;

    public MeetingController(MeetingService meetingService) {
        this.meetingService = meetingService;
    }

    // React calls this to submit a new transcript
    @PostMapping("/process")
    public ResponseEntity<Meeting> processMeeting(
            @RequestParam String title, 
            @RequestBody String transcript) {
        
        Meeting savedMeeting = meetingService.processAndSaveMeeting(title, transcript);
        return ResponseEntity.ok(savedMeeting);
    }

    // React calls this to load the dashboard
    @GetMapping
    public ResponseEntity<List<Meeting>> getDashboard() {
        return ResponseEntity.ok(meetingService.getAllMeetings());
    }
}
