import React, { useState, useEffect } from "react";

import './App.css';
import myhttp     from "./classes/myhttp";
import Game       from "./classes/game";
import TeamGame   from "./classes/teamGame";
import Login      from "./components/login";
import Scorer     from "./components/scorer";
import TeamScorer from "./components/teamScorer";
import Menu       from "./components/menu";
import TableScore from "./components/tableScore";

const http = new myhttp();
const game = new Game();
const teamGame = new TeamGame();

// Configuration de l'API
if(document.location.href.search("http://localhost") > -1) {
  // En développement: utilise le proxy configuré dans setupProxy.js
  //http.API = "/api.1.0/";
  http.API = "https://dev.tttm.co.il/api.1.0/";
} else {
  // En production: utilise le chemin relatif depuis /scorer/
  http.API = "/api.1.0/";
}

const getIdFromUrl = () => {
  // Handle URLs like ?469403 (no key-value pair, just the ID)
  const search = window.location.search;
  if (search && search.startsWith('?')) {
    const id = search.substring(1); // Remove the '?'
    // Return the ID if it's a number (all digits)
    if (id && /^\d+$/.test(id)) {
      return id;
    }
  }
  // Fallback: try to get from query params like ?id=469403
  const searchParams = new URLSearchParams(window.location.search);
  return searchParams.get('id') || searchParams.keys().next().value;
};

function App() {

  const matchId = getIdFromUrl();
  const [, updateGame] = useState(0);
  
  useEffect(() => {
  console.log('id', matchId);

    if(!http.dico) {
      http.get(http.API + "game/dico" ).then( data => {
        console.log(data);
        if(data && data.resp) {
          http.dico = data.resp;
          updateGame(Date.now());
        }
      })
      .catch(error => {
        console.error("Error loading dictionary:", error);
      });
    }
    if(matchId) {
      console.log("get Game !");
    }
  });

  useEffect(() => {
    if (!matchId) return;

    console.log("get Game !");
    http.get(http.API + "game/" + matchId ).then( data => {
        console.log("game", data);
        if(data && data.resp && data.resp.id) {
          initGame(data.resp);
        }
      })
      .catch(error => {
        console.error("Error loading game:", error);
      });
  }, [matchId]);
  
  const initGame = (data) => {
    if(["S","D"].includes(data.type)) {
      game.get(data);
    }
    if(["T","C"].includes(data.type)) {
      teamGame.get(data);
    }
    
    updateGame(Date.now());
    console.log("game", game);
  }  
  if(!http.dico) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <div className="loading-text">Loading...</div>
      </div>
    )
  }
  if(!game.id && !teamGame.id) {
    return (<Login http={http} initGame={initGame} matchId={matchId} />)
  }

  return (
    <div className="app-container">
      {game.id && (
        <div className="app-content">
          {/* Game type indicator */}
          {/* <div className="game-type-indicator">
            {game.type === "S" ? "Singles" : game.type === "D" ? "Doubles" : "Match"}
          </div> */}

          <Menu
            http={http}
            game={game}
            updateGame={updateGame}
          />

          <Scorer
            http={http}
            game={game}
            updateGame={updateGame}
          />

          <TableScore game={game} />
        </div>
      )}

      {teamGame.id && (
        <div className="app-content">
          {/* <div className="game-type-indicator">Team Match</div> */}

          <TeamScorer
            http={http}
            teamGame={teamGame}
            updateGame={updateGame}
          />
        </div>
      )}
    </div>
  );
}

export default App;
