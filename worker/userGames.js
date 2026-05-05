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
    // Forward migration: array columns for N opponents.
    try { this.sql.exec("ALTER TABLE user_games ADD COLUMN opponent_names_json TEXT DEFAULT '[]'"); } catch { /* exists */ }
    try { this.sql.exec("ALTER TABLE user_games ADD COLUMN opponent_scores_json TEXT DEFAULT '[]'"); } catch { /* exists */ }
  }

  async fetch(request) {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;
    try {
      if (path === '/upsert' && method === 'POST') {
        const b = await request.json();
        const oppNames = Array.isArray(b.opponentNames) ? b.opponentNames : (b.opponentName ? [b.opponentName] : []);
        const oppScores = Array.isArray(b.opponentScores) ? b.opponentScores : (Number.isFinite(b.opponentScore) ? [b.opponentScore] : []);
        this.sql.exec(`
          INSERT INTO user_games (game_id, lobby_name, opponent_name, your_score, opponent_score, status, last_activity, opponent_names_json, opponent_scores_json)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(game_id) DO UPDATE SET
            lobby_name = excluded.lobby_name,
            opponent_name = excluded.opponent_name,
            your_score = excluded.your_score,
            opponent_score = excluded.opponent_score,
            status = excluded.status,
            last_activity = excluded.last_activity,
            opponent_names_json = excluded.opponent_names_json,
            opponent_scores_json = excluded.opponent_scores_json
        `, b.gameId, b.lobbyName, oppNames[0] || null, b.yourScore || 0, oppScores[0] || 0, b.status, b.lastActivity, JSON.stringify(oppNames), JSON.stringify(oppScores));
        return new Response(JSON.stringify({ ok: true }), { headers: { 'Content-Type': 'application/json' } });
      }
      if (path === '/list' && method === 'GET') {
        const rows = this.sql.exec('SELECT * FROM user_games ORDER BY last_activity DESC').toArray();
        return new Response(JSON.stringify(rows.map(r => {
          let names = [];
          let scores = [];
          try { names = JSON.parse(r.opponent_names_json || '[]'); } catch { names = []; }
          try { scores = JSON.parse(r.opponent_scores_json || '[]'); } catch { scores = []; }
          // Legacy rows (created before migration) only have single opponent_name/score
          if (names.length === 0 && r.opponent_name) names = [r.opponent_name];
          if (scores.length === 0 && r.opponent_score) scores = [r.opponent_score];
          return {
            gameId: r.game_id,
            lobbyName: r.lobby_name,
            opponentName: r.opponent_name,
            opponentNames: names,
            yourScore: r.your_score,
            opponentScore: r.opponent_score,
            opponentScores: scores,
            status: r.status,
            lastActivity: r.last_activity
          };
        })), { headers: { 'Content-Type': 'application/json' } });
      }
      return new Response(JSON.stringify({ error: 'Not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
    } catch (err) {
      return new Response(JSON.stringify({ error: err.message || String(err) }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
  }
}
