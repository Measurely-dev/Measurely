package service

import (
	"encoding/json"
	"log"
	"time"
)

func (s *Service) ProcessEmails() {
	ticker := time.NewTicker(1 * time.Second)
	defer ticker.Stop()

	for {
		<-ticker.C

		for i := 0; i < s.emailprocessrate; i++ {
			emailBytes, err := s.redisClient.BRPop(s.redisCtx, 0, "emails:send").Result()
			if err != nil {
				log.Println("Failed to fetch emails from Redis:", err)
				continue
			}
			if len(emailBytes) < 2 {
				break
			}

			emailStr := emailBytes[1]

			go func() {
				var emailRequest SendEmailRequest
				if err := json.Unmarshal([]byte(emailStr), &emailRequest); err != nil {
					log.Println("Failed to unmarshal email request:", err)
					return
				}

				err := s.SendEmail(emailRequest.To, emailRequest.Fields)
				if err != nil {
					log.Println("Failed to send email:", err)
					return
				}
			}()
		}

		// Clear processed emails from Redis
		s.redisClient.LTrim(s.redisCtx, "emails:send", -int64(s.emailprocessrate), -1)

	}

}

func (s *Service) ScheduleEmail(request SendEmailRequest) error {
	// UNCOMMENT WHEN RELEASE
	return nil

	// bytes, jerr := json.Marshal(request)
	// if jerr != nil {
	// 	return jerr
	// }
	// if err := s.redisClient.RPush(s.redisCtx, "emails:send", bytes).Err(); err != nil {
	// 	return err
	// }
	// return nil
}
