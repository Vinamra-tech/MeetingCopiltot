package com.meetingsupport.backend.service;

import java.util.List;
import java.util.stream.Collectors;

import com.meetingsupport.backend.dto.FastApiRequest;
import com.meetingsupport.backend.dto.FastApiResponse;
import com.meetingsupport.backend.entity.ActionItem;
import com.meetingsupport.backend.entity.Meeting;
import com.meetingsupport.backend.repository.MeetingRepository;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClient;

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
        // 1. Send transcript to FastAPI
        FastApiResponse aiResponse = restClient.post()
                .uri("/api/analyze") // The endpoint your teammate builds
                .body(new FastApiRequest(transcript))
                .retrieve()
                .body(FastApiResponse.class);

        // 2. Map response to Meeting Entity
        Meeting meeting = Meeting.builder()
                .title(title)
                .originalTranscript(transcript)
                .summary(aiResponse.summary())
                .openQuestions(aiResponse.open_questions())
                .emailDraft(aiResponse.email_draft())
                .build();

        // 3. Map action items and link them to the meeting
        if (aiResponse.action_items() != null) {
            List<ActionItem> items = aiResponse.action_items().stream()
                    .map(dto -> ActionItem.builder()
                            .description(dto.description())
                            .owner(dto.owner())
                            .deadline(dto.deadline())
                            .status("PENDING")
                            .meeting(meeting)
                            .build())
                    .collect(Collectors.toList());
            meeting.setActionItems(items);
        }

        // 4. Save to PostgreSQL (Cascade will save action items too)
        return meetingRepository.save(meeting);
    }
    
    public List<Meeting> getAllMeetings() {
        return meetingRepository.findAll();
    }
}
