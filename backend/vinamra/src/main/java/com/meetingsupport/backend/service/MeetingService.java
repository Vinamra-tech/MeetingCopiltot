package com.meetingsupport.backend.service;


import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClient;

import com.meetingsupport.backend.dto.FastApiRequest;
import com.meetingsupport.backend.dto.FastApiResponse;
import com.meetingsupport.backend.entity.ActionItem;
import com.meetingsupport.backend.entity.Meeting;
import com.meetingsupport.backend.repository.MeetingRepository;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class MeetingService {

    private final MeetingRepository meetingRepository;
    private final RestClient restClient;

    public MeetingService(MeetingRepository meetingRepository, RestClient.Builder restClientBuilder, 
                          @Value("${fastapi.service.url}") String fastApiUrl) {
        this.meetingRepository = meetingRepository;
        this.restClient = restClientBuilder.baseUrl(fastApiUrl).build();
    }

    @Transactional
    public Meeting processAndSaveMeeting(String title, String transcript) {
        // 1. Send request to FastAPI
        FastApiResponse aiResponse = restClient.post()
                .uri("/analyze") // ensure this matches your teammate's route
                .body(new FastApiRequest(transcript))
                .retrieve()
                .body(FastApiResponse.class);

        // 2. Convert Lists to Bulleted Strings for the Database
        String formattedSummary = aiResponse.summary() != null ? 
            "- " + String.join("\n- ", aiResponse.summary()) : "";
            
        String formattedQuestions = aiResponse.open_questions() != null ? 
            "- " + String.join("\n- ", aiResponse.open_questions()) : "";

        // 3. Map to Meeting Entity
        Meeting meeting = Meeting.builder()
                .title(title)
                .originalTranscript(transcript)
                .summary(formattedSummary)
                .openQuestions(formattedQuestions)
                .emailDraft(aiResponse.followup_email()) // Updated field name
                .build();

        // 4. Map Action Items
        if (aiResponse.action_items() != null) {
            List<ActionItem> items = aiResponse.action_items().stream()
                    .map(dto -> ActionItem.builder()
                            .task(dto.task())             // Updated field
                            .owner(dto.owner())
                            .deadline(dto.deadline())
                            .priority(dto.priority())     // New field
                            .confidence(dto.confidence()) // New field
                            .status("PENDING")
                            .meeting(meeting)
                            .build())
                    .collect(Collectors.toList());
            meeting.setActionItems(items);
        }

        // 5. Save and return
        return meetingRepository.save(meeting);
    }
    
    public List<Meeting> getAllMeetings() {
        return meetingRepository.findAll();
    }
}