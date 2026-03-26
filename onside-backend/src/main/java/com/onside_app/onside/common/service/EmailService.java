package com.onside_app.onside.common.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

/**
 * EmailService
 *
 * Sends plain-text notification emails via Gmail SMTP (JavaMailSender).
 * Used by RequestController for league and admin access requests.
 *
 * Config is read from application.properties:
 *   app.mail.to   — destination address (onsideussoccer.com@onsideussoccer.com)
 *   app.mail.from — sender address (jimmyleenoel@gmail.com)
 */
@Service
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.mail.to}")
    private String mailTo;

    @Value("${app.mail.from}")
    private String mailFrom;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    /**
     * Sends a plain-text email notification.
     *
     * @param subject the email subject line
     * @param body    the plain-text email body
     */
    public void sendNotification(String subject, String body) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(mailFrom);
        message.setTo(mailTo);
        message.setSubject(subject);
        message.setText(body);
        mailSender.send(message);
    }
}