import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';

export class WebSocketManager {
  private wss: WebSocketServer | null = null;
  private clients = new Set<WebSocket>();

  initialize(server: Server) {
    this.wss = new WebSocketServer({ server });
    
    this.wss.on('connection', (ws: WebSocket) => {
      console.log('Cliente WebSocket conectado');
      this.clients.add(ws);
      
      ws.on('close', () => {
        console.log('Cliente WebSocket desconectado');
        this.clients.delete(ws);
      });
      
      ws.on('error', (error) => {
        console.error('Error en WebSocket:', error);
        this.clients.delete(ws);
      });
      
      // Enviar mensaje de bienvenida
      ws.send(JSON.stringify({
        type: 'connected',
        message: 'Conectado al sistema de actualizaciones en tiempo real'
      }));
    });
  }

  // Notificar a todos los clientes que las estadísticas deben actualizarse
  notifyStatsUpdate() {
    const message = JSON.stringify({
      type: 'stats_update',
      timestamp: new Date().toISOString(),
      message: 'Las estadísticas han sido actualizadas'
    });
    
    this.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
    
    console.log(`Notificación de actualización enviada a ${this.clients.size} clientes`);
  }

  // Notificar cuando se agrega un nuevo match
  notifyNewMatch(matchId: number) {
    const message = JSON.stringify({
      type: 'new_match',
      matchId,
      timestamp: new Date().toISOString(),
      message: 'Nueva partida agregada'
    });
    
    this.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }

  // Notificar cuando se actualiza un match
  notifyMatchUpdate(matchId: number) {
    const message = JSON.stringify({
      type: 'match_update',
      matchId,
      timestamp: new Date().toISOString(),
      message: 'Partida actualizada'
    });
    
    this.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }

  // Notificar cuando se elimina un match
  notifyMatchDelete(matchId: number) {
    const message = JSON.stringify({
      type: 'match_delete',
      matchId,
      timestamp: new Date().toISOString(),
      message: 'Partida eliminada'
    });
    
    this.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }

  getConnectedClients(): number {
    return this.clients.size;
  }
}

export const wsManager = new WebSocketManager();