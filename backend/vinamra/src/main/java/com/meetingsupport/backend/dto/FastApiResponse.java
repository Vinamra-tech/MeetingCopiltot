package com.meetingsupport.backend.dto;

import java.util.List;

public record FastApiResponse(
    String summary,
    List<ActionItemDTO> action_items,
    String open_questions,
    String email_draft
) {
    public record ActionItemDTO(String description, String owner, String deadline) {}
}
