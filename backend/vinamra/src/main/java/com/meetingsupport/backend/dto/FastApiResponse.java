package com.meetingsupport.backend.dto;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public record FastApiResponse(
    List<String> summary,
    List<ActionItemDTO> action_items,
    List<String> decisions,
    List<String> open_questions,
    String followup_email,
    String csv_export
) {
    @JsonIgnoreProperties(ignoreUnknown = true)
    public record ActionItemDTO(
        String task,
        String owner,
        String deadline,
        String priority,
        Double confidence
    ) {}
}
