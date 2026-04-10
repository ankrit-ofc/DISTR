import { Response } from 'express';

const clients = new Map<string, Response>();

export function addClient(clientId: string, res: Response): void {
  clients.set(clientId, res);
}

export function removeClient(clientId: string): void {
  clients.delete(clientId);
}

export function sendToClient(clientId: string, event: string, data: unknown): void {
  const res = clients.get(clientId);
  if (res) {
    res.write(`event: ${event}\n`);
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  }
}

export function sendToAllAdmins(event: string, data: unknown): void {
  clients.forEach((res, id) => {
    if (id.startsWith('admin_')) {
      res.write(`event: ${event}\n`);
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    }
  });
}

export function hasAdminConnected(): boolean {
  for (const id of clients.keys()) {
    if (id.startsWith('admin_')) return true;
  }
  return false;
}

export function hasBuyerConnected(buyerId: string): boolean {
  return clients.has(buyerId);
}
