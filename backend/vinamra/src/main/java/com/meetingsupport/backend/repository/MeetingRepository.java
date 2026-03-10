package com.meetingsupport.backend.repository;


import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.meetingsupport.backend.entity.Meeting;

@Repository
public interface MeetingRepository extends JpaRepository<Meeting, Long> {
}
