// Per-player game index. One DO per playerId. Updated by Game on mutation.

export class UserGames {
  constructor(state, env) {
    this.state = state;
    this.env = env;
    this.sql = state.storage.sql;
    this.initSchema();
  }

  initSchema() {
    this.sql.exec(`
      CREATE TABLE IF NOT EXISTS user_games (
        game_id TEXT PRIMARY KEY,
        lobby_name TEXT,
        opponent_name TEXT,
        your_score INTEGER DEFAULT 0,
        opponent_score INTEGER DEFAULT 0,
        status TEXT,
        last_activity INTEGER
      );
    `);
  }

  async fetch(request) {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;
    try {
      if (path === '/upsert' && method === 'POST') {
        const b = await request.json();
        this.sql.exec(`
          INSERT INTO user_games (game_id, lobby_name, opponent_name, your_score, opponent_score, status, last_activity)
          VALUES (?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(game_id) DO UPDATE SET
            lobby_name = excluded.lobby_name,
            opponent_name = excluded.opponent_name,
            your_score = excluded.your_score,
            opponent_score = excluded.opponent_score,
            status = excluded.status,
            last_activity = excluded.last_activity
        `, b.gameId, b.lobbyName, b.opponentName, b.yourScore || 0, b.opponentScore || 0, b.status, b.lastActivity);
        return new Response(JSON.stringify({ ok: true }), { headers: { 'Content-Type': 'application/json' } });
      }
      if (path === '/list' && method === 'GET') {
        const rows = this.sql.exec('SELECT * FROM user_games ORDER BY last_activity DESC').toArray();
        return new Response(JSON.stringify(rows.map(r => ({
          gameId: r.game_id,
          lobbyName: r.lobby_name,
          opponentName: r.opponent_name,
          yourScore: r.your_score,
          opponentScore: r.opponent_score,
          status: r.status,
          lastActivity: r.last_activity
        }))), { headers: { 'Content-Type': 'application/json' } });
      }
      return new Response(JSON.stringify({ error: 'Not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
    } catch (err) {
      return new Response(JSON.stringify({ error: err.message || String(err) }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
  }
}
