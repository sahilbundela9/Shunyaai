package com.shunyaai.backend.controller;

import com.shunyaai.backend.dto.ChatRequest;
import com.shunyaai.backend.dto.ChatResponse;
import com.shunyaai.backend.dto.SuggestionRequest;
import com.shunyaai.backend.dto.SuggestionResponse;
import com.shunyaai.backend.service.ChatService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chat")
@CrossOrigin(origins = "*")
public class ChatController {

    private final ChatService chatService;

    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }

    @PostMapping("/ask")
    public ResponseEntity<ChatResponse> ask(@RequestBody ChatRequest request) {
        String answer = chatService.askQuestion(
                request.getQuery(),
                request.getPaperIds(),
                request.getMode()
        );

        return ResponseEntity.ok(new ChatResponse(answer));
    }

    @PostMapping("/suggest")
    public ResponseEntity<SuggestionResponse> suggest(@RequestBody SuggestionRequest request) {
        List<String> suggestions = chatService.generateSuggestions(request.getPartialQuery());
        return ResponseEntity.ok(new SuggestionResponse(suggestions));
    }
}