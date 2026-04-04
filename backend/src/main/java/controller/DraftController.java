package com.shunyaai.backend.controller;

import com.shunyaai.backend.service.DraftService;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.apache.poi.xwpf.usermodel.XWPFParagraph;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.ByteArrayOutputStream;
import java.util.List;

@RestController
@RequestMapping("/api/draft")
@CrossOrigin(origins = "*")
public class DraftController {

    private final DraftService draftService;

    public DraftController(DraftService draftService) {
        this.draftService = draftService;
    }

    @PostMapping("/generate")
    public ResponseEntity<String> generateDraft(@RequestBody List<Long> paperIds) {
        String draft = draftService.generateDraft(paperIds);
        return ResponseEntity.ok(draft);
    }

    @PostMapping("/export-docx")
    public ResponseEntity<byte[]> exportDocx(@RequestBody String content) {
        try (XWPFDocument document = new XWPFDocument();
             ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            String[] paragraphs = content.split("\\n\\n");

            for (String paraText : paragraphs) {
                XWPFParagraph para = document.createParagraph();
                para.createRun().setText(paraText);
            }

            document.write(out);

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=research-draft.docx")
                    .contentType(MediaType.parseMediaType(
                            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"))
                    .body(out.toByteArray());

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
}