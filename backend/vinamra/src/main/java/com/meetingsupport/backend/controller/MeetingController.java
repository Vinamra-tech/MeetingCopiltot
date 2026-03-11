package com.meetingsupport.backend.controller;

import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.meetingsupport.backend.entity.ActionItem;
import com.meetingsupport.backend.entity.Meeting;
import com.meetingsupport.backend.repository.ActionItemRepository;
import com.meetingsupport.backend.repository.MeetingRepository;
import com.meetingsupport.backend.service.MeetingService;

import lombok.RequiredArgsConstructor;

import java.util.List;

@RestController
@RequestMapping("/api/meetings")
@CrossOrigin(origins = "*") // Allow React to call this API
@RequiredArgsConstructor
public class MeetingController {

    private final MeetingService meetingService;
    private final ActionItemRepository actionItemRepository;
    private final MeetingRepository meetingRepository;

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


// In your MeetingController
@DeleteMapping("/{meetingId}")
public ResponseEntity<Void> deleteMeeting(@PathVariable Long meetingId) {
    meetingRepository.deleteById(meetingId);
    return ResponseEntity.noContent().build();
}

// In your MeetingController
@PutMapping("/{meetingId}/summary")
public ResponseEntity<Void> updateSummary(
        @PathVariable Long meetingId, 
        @RequestBody String newSummary) {
    
    Meeting meeting = meetingRepository.findById(meetingId)
        .orElseThrow(() -> new RuntimeException("Meeting not found"));
        
    meeting.setSummary(newSummary);
    meetingRepository.save(meeting);
    
    return ResponseEntity.ok().build();
}

@PatchMapping("/action-items/{itemId}/status")
    public ResponseEntity<Void> updateActionItemStatus(
            @PathVariable Long itemId, 
            @RequestParam String status) {
        
        ActionItem item = actionItemRepository.findById(itemId)
            .orElseThrow(() -> new RuntimeException("Action item not found"));
            
        item.setStatus(status); // "COMPLETED" or "PENDING"
        actionItemRepository.save(item);
        
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}/download-csv")
    public ResponseEntity<String> downloadActionItemsCsv(@PathVariable Long id) {
        Meeting meeting = meetingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Meeting not found"));

        String csvData = meeting.getCsvExport();
        
        // Safety check in case the AI didn't generate CSV data
        if (csvData == null || csvData.trim().isEmpty()) {
            return ResponseEntity.noContent().build();
        }

        // Set the headers to trigger a file download in the browser
        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=action_items_" + id + ".csv");
        headers.setContentType(MediaType.parseMediaType("text/csv"));

        return ResponseEntity.ok()
                .headers(headers)
                .body(csvData);
    }
}
