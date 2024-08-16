package service

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	"os"
	"sync"

	"github.com/go-redis/redis/v8"
	"github.com/google/uuid"
	"github.com/gorilla/websocket"
)

// WebSocket Upgrader
var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return r.Header.Get("Origin") == os.Getenv("ORIGIN")
	},
}

// Struct to manage connections
type ConnectionManager struct {
	connections map[uuid.UUID]map[*websocket.Conn]bool // Map of appID to connections
	channels    map[uuid.UUID]*redis.PubSub
	mu          sync.Mutex
}

func NewConnectionManager() *ConnectionManager {
	return &ConnectionManager{
		connections: make(map[uuid.UUID]map[*websocket.Conn]bool),
		channels:    make(map[uuid.UUID]*redis.PubSub),
	}
}

func (cm *ConnectionManager) AddConnection(appID uuid.UUID, conn *websocket.Conn, redisClient *redis.Client, redisCtx context.Context) {
	cm.mu.Lock()
	defer cm.mu.Unlock()
	if cm.connections[appID] == nil {
		cm.connections[appID] = make(map[*websocket.Conn]bool)

		cm.channels[appID] = redisClient.Subscribe(redisCtx, appID.String())
		go cm.ListenToChannel(appID)
	}
	cm.connections[appID][conn] = true
}

func (cm *ConnectionManager) RemoveConnection(appID uuid.UUID, conn *websocket.Conn) {
	cm.mu.Lock()
	defer cm.mu.Unlock()
	if cm.connections[appID] != nil {
		delete(cm.connections[appID], conn)
		if len(cm.connections[appID]) == 0 {
			cm.channels[appID].Close()
			delete(cm.connections, appID)
		}
	}
}

func (cm *ConnectionManager) BroadcastMessage(appID uuid.UUID, message []byte) {
	cm.mu.Lock()
	defer cm.mu.Unlock()
	for conn := range cm.connections[appID] {
		err := conn.WriteMessage(websocket.BinaryMessage, message)
		if err != nil {
			log.Println("WriteMessage error:", err)
			conn.Close()
			delete(cm.connections[appID], conn)
		}
	}
}

func (cm *ConnectionManager) ListenToChannel(appID uuid.UUID) {
	for msg := range cm.channels[appID].Channel() {
		bytes, err := json.Marshal(msg.Payload)
		if err != nil {
			log.Println("Failed to marshal message:", err)
			continue
		}
		cm.BroadcastMessage(appID, bytes)
	}

	cm.channels[appID].Close()
	delete(cm.channels, appID)
}

func (s *Service) HandleWebSocket(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("Upgrade error:", err)
		return
	}

	appId := r.URL.Query().Get("appid")
	appUUID, err := uuid.Parse(appId)
	if err != nil {
		http.Error(w, "Invalid appId", http.StatusBadRequest)
		return
	}

	s.connManager.AddConnection(appUUID, conn, s.redisClient, s.redisCtx)

	defer func() {
		s.connManager.RemoveConnection(appUUID, conn)
		conn.Close()
	}()

	// Simply block until an error occurs (e.g., client disconnects)
	if _, _, err := conn.NextReader(); err != nil {
		log.Println("Client disconnected")
	}
}

func (cm *ConnectionManager) PublishMessage(channel string, message string, redisClient *redis.Client, redisCtx context.Context) {
	err := redisClient.Publish(redisCtx, channel, message).Err()
	if err != nil {
		log.Println("Failed to publish message:", err)
	}
}
