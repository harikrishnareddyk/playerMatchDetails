const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
let db = null;
app.use(express.json());
const dBpath = path.join(__dirname, "cricketMatchDetails.db");
const initializeDBandserver = async () => {
  try {
    db = await open({
      filename: dBpath,
      driver: sqlite3.Database,
    });
    app.listen(3005, () => {
      console.log("Server is running at http://locathost:3000/");
    });
  } catch (e) {
    console.log(`DB Error:${e.message}`);
    process.exit(1);
  }
};
initializeDBandserver();

const convertDBObjecttoresponse = (item) => {
  return {
    playerId: item.player_id,
    playerName: item.player_name,
  };
};

app.get("/players/", async (request, response) => {
  const getPlayersQuery = `SELECT player_id AS playerId,player_name AS playerName FROM player_details;`;
  const playerDetails = await db.all(getPlayersQuery);
  response.send(playerDetails);
});

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayersQuery = `SELECT player_id AS playerId,player_name AS playerName FROM player_details WHERE player_id=${playerId};`;
  const playerDetails = await db.get(getPlayersQuery);
  response.send(playerDetails);
});

app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const { playerName } = request.body;
  const getPlayersQuery = `UPDATE player_details SET player_name=${playerName} WHERE player_id=${playerId};`;
  const playerDetails = await db.run(getPlayersQuery);
  response.send("Player Details Updated");
});

app.get("/matches/:matchId/", async (request, response) => {
  const { matchId } = request.params;
  const getPlayersQuery = `SELECT match_id AS matchId,match,year FROM match_details WHERE match_id=(${matchId});`;
  const playerDetails = await db.get(getPlayersQuery);
  response.send(playerDetails);
});

app.get("/players/:playerId/matches", async (request, response) => {
  const { playerId } = request.params;
  const getPlayersQuery = `SELECT match_id AS matchId,match,year 
  FROM player_match_score NATURAL JOIN match_details
   WHERE player_id=${playerId};`;
  const playerDetails = await db.all(getPlayersQuery);
  response.send(playerDetails);
});

app.get("/matches/:matchId/players", async (request, response) => {
  const { matchId } = request.params;
  const getPlayersQuery = `SELECT
	      player_details.player_id AS playerId,
	      player_details.player_name AS playerName
	    FROM player_match_score NATURAL JOIN player_details
        WHERE match_id=${matchId};`;
  const playerDetails = await db.all(getPlayersQuery);
  response.send(playerDetails);
});

app.get("/players/:playerId/playerScores", async (request, response) => {
  const { playerId } = request.params;
  const getPlayersQuery = `SELECT
    player_details.player_id AS playerId,
    player_details.player_name AS playerName,
    SUM(player_match_score.score) AS totalScore,
    SUM(fours) AS totalFours,
    SUM(sixes) AS totalSixes FROM 
    player_details INNER JOIN player_match_score ON
    player_details.player_id = player_match_score.player_id
    WHERE player_details.player_id = ${playerId};`;
  const playerDetails = await db.get(getPlayersQuery);
  response.send(playerDetails);
});
module.exports = app;
