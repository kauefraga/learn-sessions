import { defineController } from "../server.js";

export const StatusController = defineController(http => {
  http.get('/v1/status', () => ({ ok: true }));
});
