package com.onside_app.onside.common.controller;

import com.onside_app.onside.club.repository.ClubRepository;
import com.onside_app.onside.common.dto.PlatformStatsDto;
import com.onside_app.onside.league.repository.LeagueRepository;
import com.onside_app.onside.users.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/stats")
public class StatsController {

    private final LeagueRepository leagueRepository;
    private final ClubRepository clubRepository;
    private final UserRepository userRepository;

    public StatsController(LeagueRepository leagueRepository,
                           ClubRepository clubRepository,
                           UserRepository userRepository) {
        this.leagueRepository = leagueRepository;
        this.clubRepository = clubRepository;
        this.userRepository = userRepository;
    }

    @GetMapping
    public ResponseEntity<PlatformStatsDto> getStats() {
        long leagues = leagueRepository.countByIsActiveTrue();
        long clubs = clubRepository.countByIsActiveTrue();
        long players = userRepository.countByIsActiveTrue();
        long states = clubRepository.countDistinctStates();

        return ResponseEntity.ok(new PlatformStatsDto(leagues, clubs, players, states));
    }
}
