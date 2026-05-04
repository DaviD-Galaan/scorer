import React from "react";
import Modal from "../tools/modal";

let intersetTime = 0;
let timerId = 0;

export default function Scorer({http, game, updateGame}) {

    const updateScore = (e) => {
        const player = e.target.attributes.getNamedItem('player').value;
        const point = parseInt(e.target.attributes.getNamedItem('point').value);
        if(game.changeScore(player, point))
            save();
        http.put(http.API +"game/" +  game.id + "/changeScore", {player:player,change:point});
        updateGame(Date.now());
    }
    const chooseServer = (server) => {
        if(game.type == "D") {
            game.firstServer = server;
            updateGame(Date.now());
        } else {
            http.get(http.API + "game/" +  game.id + "/firstServer/" + server).then( data => {
                game.get(data.resp);
                updateGame(Date.now());
            });
        }        
    }
    const chooseReceiver = (receiver) => {
        game.firstServer += receiver;
        game.serverReceiver[0] = game.firstServer;
        save();

        http.get(http.API + "game/" + game.id + "/firstServer/" + game.firstServer).then( data => {
            game.get(data.resp);
            game.serverReceiver[0] = game.firstServer;
            
            updateGame(Date.now());
        });
    }
    const startSet = (serverReceiver) => {
        clearTimeout(timerId);
        intersetTime = 0;
        game.serverReceiver[game.currentSet - 1] = serverReceiver;
        save();
        updateGame(Date.now());
    }
    const finishGame = () => {
        http.get(http.API + "game/" + game.id + "/confirmation").then( data => {
            game.get(data.resp);
            updateGame(Date.now());
        }); 
    }
    const save = () => {
        http.put(http.API + "game/" + game.id + "/details", game.getDetails()); 
      }
    const openGame = () => {
        http.get(http.API + "game/" + game.id + "/annulation").then( data => {
            game.get(data.resp);
            updateGame(Date.now());
        }); 
    }
    const startTimer = (e) => {
        intersetTime = 60;
        
        timerId = setInterval(() => {
            intersetTime--;
            if(intersetTime == 0) {
                clearTimeout(timerId);
            }
            updateGame(Date.now());
        }, 1000);
    }

    const handleRemoveCard = (playerId, index) => {
        const confirmDelete = window.confirm(http.dico["ARE_YOU_SURE_REMOVE_CARD"]);
        if (!confirmDelete) return;

        const updatedCards = { ...game.cards };
        const playerCards = [...(updatedCards[playerId] || [])];

        playerCards.splice(index, 1);
        updatedCards[playerId] = playerCards;

        game.cards = updatedCards;
        http.put(http.API + "game/" + game.id + "/details", game.getDetails());
        updateGame(Date.now());
    };

    
    
    return(
        <>
        <div className="scorer-container" dir={game.direction}>
            <div className="scorer fade-in">
                {/* Left vs Right Layout */}
                <div className="scorer-vs-layout">
                    {/* Left Side - Team AB */}
                    <div className="scorer-side left-side">
                        <div className="player-section">
                            <div className="player-name">
                                {game.cards[game.playerA_ID] && game.cards[game.playerA_ID].length > 0 && (
                                    <div className="player-cards-display">
                                        {game.cards[game.playerA_ID].map((card, index) => (
                                            <div
                                                key={`card-${game.playerA_ID}-${index}`}
                                                onClick={() => handleRemoveCard(game.playerA_ID, index)}
                                                className={`card-icon-small ${card === "Y" ? "yellow" : "red"}`}
                                                title={http.dico["REMOVE_CARD"]}
                                            ></div>
                                        ))}
                                    </div>
                                )}
                                {game.playerA}
                                {game.getCurrentServer()[0] === "A" &&
                                    <div className="server-indicator"></div>
                                }
                                {game.getCurrentServer()[1] === "A" &&
                                    <div className="receiver-indicator"></div>
                                }
                            </div>
                            <div className="player-club">{game.clubA}</div>

                            {/* Second player for doubles */}
                            {game.type === "D" && (
                                <>
                                    <div className="player-name">
                                        {game.cards[game.playerB_ID] && game.cards[game.playerB_ID].length > 0 && (
                                            <div className="player-cards-display">
                                                {game.cards[game.playerB_ID].map((card, index) => (
                                                    <div
                                                        key={`card-${game.playerB_ID}-${index}`}
                                                        onClick={() => handleRemoveCard(game.playerB_ID, index)}
                                                        className={`card-icon-small ${card === "Y" ? "yellow" : "red"}`}
                                                        title={http.dico["REMOVE_CARD"]}
                                                    ></div>
                                                ))}
                                            </div>
                                        )}
                                        {game.playerB}
                                        {game.getCurrentServer()[0] === "B" &&
                                            <div className="server-indicator"></div>
                                        }
                                        {game.getCurrentServer()[1] === "B" &&
                                            <div className="receiver-indicator"></div>
                                        }
                                    </div>
                                    <div className="player-club">{game.clubB}</div>
                                </>
                            )}
                        </div>

                        <div className="score-area">
                            <div
                                className="score-display clickable"
                                onClick={updateScore}
                                player="AB"
                                point="1"
                            >
                                {game.currentScoreAB}
                            </div>
                            <button
                                className="score-button minus"
                                onClick={updateScore}
                                player="AB"
                                point="-1"
                            >
                                -
                            </button>
                            <div className="set-score">{game.setAB}</div>
                        </div>

                        {/* Timeout indicator */}
                        <div className="events">
                        {game.events.includes("timeout.AB") && (
                            <div className="timeout-indicator">
                                <img src="https://dev.tttm.co.il/img/timeout.png" alt="Timeout" />
                            </div>
                        )}
                        </div>
                    </div>



                    {/* Right Side - Team XY */}
                    <div className="scorer-side right-side">
                        <div className="player-section">
                            <div className="player-name">
                                {game.cards[game.playerX_ID] && game.cards[game.playerX_ID].length > 0 && (
                                    <div className="player-cards-display">
                                        {game.cards[game.playerX_ID].map((card, index) => (
                                            <div
                                                key={`card-${game.playerX_ID}-${index}`}
                                                onClick={() => handleRemoveCard(game.playerX_ID, index)}
                                                className={`card-icon-small ${card === "Y" ? "yellow" : "red"}`}
                                                title={http.dico["REMOVE_CARD"]}
                                            ></div>
                                        ))}
                                    </div>
                                )}
                                {game.playerX}
                                {game.getCurrentServer()[0] === "X" &&
                                    <div className="server-indicator"></div>
                                }
                                {game.getCurrentServer()[1] === "X" &&
                                    <div className="receiver-indicator"></div>
                                }
                            </div>
                            <div className="player-club">{game.clubX}</div>

                            {/* Second player for doubles */}
                            {game.type === "D" && (
                                <>
                                    <div className="player-name">
                                        {game.cards[game.playerY_ID] && game.cards[game.playerY_ID].length > 0 && (
                                            <div className="player-cards-display">
                                                {game.cards[game.playerY_ID].map((card, index) => (
                                                    <div
                                                        key={`card-${game.playerY_ID}-${index}`}
                                                        onClick={() => handleRemoveCard(game.playerY_ID, index)}
                                                        className={`card-icon-small ${card === "Y" ? "yellow" : "red"}`}
                                                        title={http.dico["REMOVE_CARD"]}
                                                    ></div>
                                                ))}
                                            </div>
                                        )}
                                        {game.playerY}
                                        {game.getCurrentServer()[0] === "Y" &&
                                            <div className="server-indicator"></div>
                                        }
                                        {game.getCurrentServer()[1] === "Y" &&
                                            <div className="receiver-indicator"></div>
                                        }
                                    </div>
                                    <div className="player-club">{game.clubY}</div>
                                </>
                            )}
                        </div>

                        <div className="score-area">
                            <div
                                className="score-display clickable"
                                onClick={updateScore}
                                player="XY"
                                point="1"
                            >
                                {game.currentScoreXY}
                            </div>
                            <button
                                className="score-button minus"
                                onClick={updateScore}
                                player="XY"
                                point="-1"
                            >
                                -
                            </button>
                            <div className="set-score">{game.setXY}</div>
                        </div>

                        {/* Timeout indicator */}
                        <div className="events">
                        {game.events.includes("timeout.XY") && (
                            <div className="timeout-indicator">
                                <img src="https://dev.tttm.co.il/img/timeout.png" alt="Timeout" />
                            </div>
                        )}
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* Game Control Buttons */}
        { !game.teamMatchId &&
        <div className="game-controls">
            {game.endGame && game.winner == 0 && (
                <button className="btn btn-success btn-large finish-game" onClick={finishGame}>
                    Finish the game
                </button>
            )}
            {game.endGame && game.winner != 0 && (
                <button className="btn btn-danger btn-large open-game" onClick={openGame}>
                    Open the game
                </button>
            )}
        </div>
        }
        

        {/* Choose Server Modal for Singles */}
        {game.type === "S" && (
            <Modal
                id="ChooseServer"
                title="Choose Server"
                className="choose-server-container"
                opened={game.firstServer === ""}
            >
                <div className="server-options">
                    <button className="btn btn-primary btn-large" onClick={() => chooseServer("A")}>
                        {game.playerA}
                    </button>
                    <button className="btn btn-primary btn-large" onClick={() => chooseServer("X")}>
                        {game.playerX}
                    </button>
                </div>
            </Modal>
        )}
        {/* Choose Server/Receiver Modal for Doubles */}
        {game.type === "D" && (
            <Modal
                id="ChooseServer"
                title="Choose Server/Receiver"
                className="choose-server-container"
                opened={game.firstServer.length < 2}
            >
                {game.firstServer === "" && (
                    <>
                        <h3 style={{color: '#00d4ff', marginBottom: '1rem'}}>Choose Server</h3>
                        <div className="server-options">
                            <button className="btn btn-primary" onClick={() => chooseServer("A")}>
                                {game.playerA}
                            </button>
                            <button className="btn btn-primary" onClick={() => chooseServer("B")}>
                                {game.playerB}
                            </button>
                        </div>
                        <div className="server-options">
                            <button className="btn btn-primary" onClick={() => chooseServer("X")}>
                                {game.playerX}
                            </button>
                            <button className="btn btn-primary" onClick={() => chooseServer("Y")}>
                                {game.playerY}
                            </button>
                        </div>
                    </>
                )}

                {(game.firstServer === "A" || game.firstServer === "B") && (
                    <>
                        <h3 style={{color: '#00d4ff', marginBottom: '1rem'}}>Choose Receiver</h3>
                        <div className="server-options">
                            <button className="btn btn-primary" onClick={() => chooseReceiver("X")}>
                                {game.playerX}
                            </button>
                            <button className="btn btn-primary" onClick={() => chooseReceiver("Y")}>
                                {game.playerY}
                            </button>
                        </div>
                    </>
                )}

                {(game.firstServer === "X" || game.firstServer === "Y") && (
                    <>
                        <h3 style={{color: '#00d4ff', marginBottom: '1rem'}}>Choose Receiver</h3>
                        <div className="server-options">
                            <button className="btn btn-primary" onClick={() => chooseReceiver("A")}>
                                {game.playerA}
                            </button>
                            <button className="btn btn-primary" onClick={() => chooseReceiver("B")}>
                                {game.playerB}
                            </button>
                        </div>
                    </>
                )}
            </Modal>
        )}
        {/* Set Change Modal for Doubles */}
        {game.type === "D" && game.currentSet > 1 && (
            <Modal
                id="ChooseServerSet"
                title={`Set ${game.currentSet} - Choose Server/Receiver`}
                className="choose-server-container"
                opened={game.serverReceiver.length > 0 && !game.serverReceiver[game.currentSet - 1]}
            >
                <h3 style={{color: '#00d4ff', marginBottom: '1rem'}}>Set {game.currentSet}</h3>

                {intersetTime > 0 && (
                    <div className="time-display">
                        {intersetTime}
                    </div>
                )}

                {intersetTime === 0 && (
                    <button className="btn btn-primary btn-large" onClick={() => startTimer()}>
                        Start Interset
                    </button>
                )}

                <div className="server-options">
                    {((game.firstServer === "AX" || game.firstServer === "BY") && game.currentSet % 2 === 0 ||
                      (game.firstServer === "XA" || game.firstServer === "YB") && game.currentSet % 2 === 1) && (
                        <>
                            <button className="btn btn-primary" onClick={() => startSet("XA")}>
                                <div className="vertical-btn">
                                    <span>{game.playerX}</span>
                                    <span className="arrow">↓</span>
                                    <span>{game.playerA}</span>
                                </div>
                            </button>
                            <button className="btn btn-primary" onClick={() => startSet("YB")}>
                                <div className="vertical-btn">
                                    <span>{game.playerY}</span>
                                    <span className="arrow">↓</span>
                                    <span>{game.playerB}</span>
                                </div>
                            </button>
                        </>
                    )}

                    {((game.firstServer === "AX" || game.firstServer === "BY") && game.currentSet % 2 === 1 ||
                      (game.firstServer === "XA" || game.firstServer === "YB") && game.currentSet % 2 === 0) && (
                        <>
                            <button className="btn btn-primary" onClick={() => startSet("AX")}>
                                <div className="vertical-btn">
                                    <span>{game.playerA}</span>
                                    <span className="arrow">↓</span>
                                    <span>{game.playerX}</span>
                                </div>
                            </button>
                            <button className="btn btn-primary" onClick={() => startSet("BY")}>
                                <div className="vertical-btn">
                                    <span>{game.playerB}</span>
                                    <span className="arrow">↓</span>
                                    <span>{game.playerY}</span>
                                </div>
                            </button>
                        </>
                    )}

                    {((game.firstServer === "AY" || game.firstServer === "BX") && game.currentSet % 2 === 0 ||
                      (game.firstServer === "YA" || game.firstServer === "XB") && game.currentSet % 2 === 1) && (
                        <>
                            <button className="btn btn-primary" onClick={() => startSet("YA")}>
                                <div className="vertical-btn">
                                    <span>{game.playerY}</span>
                                    <span className="arrow">↓</span>
                                    <span>{game.playerA}</span>
                                </div>
                            </button>
                            <button className="btn btn-primary" onClick={() => startSet("XB")}>
                                <div className="vertical-btn">
                                    <span>{game.playerX}</span>
                                    <span className="arrow">↓</span>
                                    <span>{game.playerB}</span>
                                </div>
                            </button>
                        </>
                    )}

                    {((game.firstServer === "AY" || game.firstServer === "BX") && game.currentSet % 2 === 1 ||
                      (game.firstServer === "YA" || game.firstServer === "XB") && game.currentSet % 2 === 0) && (
                        <>
                            <button className="btn btn-primary" onClick={() => startSet("AY")}>
                                <div className="vertical-btn">
                                    <span>{game.playerA}</span>
                                    <span className="arrow">↓</span>
                                    <span>{game.playerY}</span>
                                </div>
                            </button>
                            <button className="btn btn-primary" onClick={() => startSet("BX")}>
                                <div className="vertical-btn">
                                    <span>{game.playerB}</span>
                                    <span className="arrow">↓</span>
                                    <span>{game.playerX}</span>
                                </div>
                            </button>
                        </>
                    )}
                </div>
            </Modal>
        )}
        </>
        )
}