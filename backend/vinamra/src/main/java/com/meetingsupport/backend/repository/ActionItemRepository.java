package com.meetingsupport.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.meetingsupport.backend.entity.ActionItem;

public interface ActionItemRepository extends JpaRepository<ActionItem , Long> {

}
