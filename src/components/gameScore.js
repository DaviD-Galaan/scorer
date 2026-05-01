import React, { useState, useRef, useEffect } from "react";
import Modal from "../tools/modal";
import Scorer from "./scorer";
import TableScore from "../components/tableScore";
import Menu       from "../components/menu";

export default function GameScore({http, game, isRencontreFinished = false}) {
    const matchId = game.id;
    const isDouble = game.type === "D";
    const isBuilt = matchId && matchId !== null;

    // Disable all interactions if rencontre is finished
    const isDisabled = isRencontreFinished;
    
    const playerAName = game.playerA?.trim() || null;
    const playerXName = game.playerX?.trim() || null;
    const doublePlayerAName = game.playerA?.trim() || null;
    const doublePlayerBName = game.playerB?.trim() || null;
    const doublePlayerXName = game.playerX?.trim() || null;
    const doublePlayerYName = game.playerY?.trim() || null;

    const timerRef = useRef(null);
    const scoreDataRef = useRef([]);

    const [scorer, setScorer] = useState({
            opened: false,
        });

    const [params, setParams] = useState({
            woAB: game.woAB,
            woXY: game.woXY,
            score: game.score,
            scoreAB: game.scoreAB,
            scoreXY: game.scoreXY
        });  
    
    useEffect(() => {
        setParams({
            woAB: game.woAB,
            woXY: game.woXY,
            score: game.score,
            scoreAB: game.scoreAB,
            scoreXY: game.scoreXY
        });
    }, [game.id]);

    useEffect(() => {
        const handlePopState = () => {
            closeMatchScorer(true);
        };

        window.addEventListener("popstate", handlePopState);

        return () => {
            window.removeEventListener("popstate", handlePopState);
        };
    }, []);

    const openMatchScorer = () => {
            setScorer({
                opened: true,
                game: game
            });
            window.history.pushState({ modal: true }, "");
        };

    const closeMatchScorer = (fromPopState = false) => {
        setScorer({
                opened: false,
                game: null
            });
        setParams({
            woAB: game.woAB,
            woXY: game.woXY,
            score: game.score,
            scoreAB: game.scoreAB,
            scoreXY: game.scoreXY
        });    
        game.reloadMatchData();
        
        if (!fromPopState) {
            window.history.back();
    }
    };    
    const handleWO = (target, matchId, side) => {
        const data = {};
        data[side] = target.checked ? 1 : 0;

        http.put(http.API + "game/" + matchId, data)
            .then((response) => {
                setParams(prev => ({...prev, [side]: data[side] }));
            })
            .catch((error) => {
                console.error("❌ Error updating WO:", error);
            });
    }
    const confirmGame = () => {
        http.get(http.API + "matchsTeam/" + game.rencontreId + "/confirm/" + matchId)
            .then((response) => {
                game.reloadMatchData();
            });
    }
    const reopenGame = () => {
        http.get(http.API + "matchsTeam/" + game.rencontreId + "/annul/" + matchId)
            .then((response) => {
                game.reloadMatchData();
            });
    }   
    const handleChangeScore = (line, set, value) => {
        const newScore = [...(params[line] || [])];
        newScore[set] = value;

        setParams(prev => ({
            ...prev,
            [line]: newScore
        }));

        scoreDataRef.current.push({
            pos: line === 'scoreAB' ? 'A' : 'X',
            set: set + 1,
            score: value
        });

        // clear previous timer
        clearTimeout(timerRef.current);

        timerRef.current = setTimeout(() => {
            http.put(http.API + "game/" + game.id + "/score/", scoreDataRef.current)
                .then((response) => {
                    setParams(prev => ({
                        ...prev,
                        scoreAB: response.resp?.scoreAB,
                        scoreXY: response.resp?.scoreXY
                    }));

                    game.reloadMatchData();
                    scoreDataRef.current = [];
                });
        }, 500);
    };
    return (
    <>
        <div
            key={game.index}
            className={`game-score-card ${isDisabled ? 'rencontre-finished' : ''}`}
        >
            {/* Match Header */}
            <div className="game-score-header">
                <div
                    className="match-label-badge"
                    onClick={() => !isDisabled && isBuilt && openMatchScorer()}
                    style={{
                        cursor: (!isDisabled && isBuilt) ? 'pointer' : 'default',
                        opacity: isDisabled ? 0.6 : 1
                    }}
                >
                    {game.label}
                </div>
                <div
                    className="match-label-badge"
                    onClick={() => !isDisabled && isBuilt && openMatchScorer()}
                    style={{
                        cursor: (!isDisabled && isBuilt) ? 'pointer' : 'default',
                        opacity: isDisabled ? 0.6 : 1
                    }}
                >
                    {http.dico["LIVE_SCORE"]}
                </div>
                <div className="game-score-actions">
                    {!isDisabled && isBuilt && game.winner == 0 && (
                        <button
                            className="game-action-btn confirm-btn"
                            onClick={confirmGame}
                            title={http.dico["CONFIRMATION"]}
                        >
                            ✓
                        </button>
                    )}
                    {!isDisabled && isBuilt && game.winner != 0 && (
                        <button
                            className="game-action-btn reopen-btn"
                            onClick={reopenGame}
                            title={http.dico["ANNULATION"]}
                        >
                            ↻
                        </button>
                    )}
                </div>
            </div>

            {/* Score Table */}
            <div className="game-score-table">
                {/* Team A/B Row */}
                <div className="game-score-row">
                    <div className="game-score-wo">
                        <input
                            type="checkbox"
                            className="wo-checkbox"
                            checked={params.woAB == 1}
                            onChange={() => {}}
                            onClick={(e) => handleWO(e.target, matchId, "woAB")}
                            disabled={isDisabled || !isBuilt || game.winner != 0}
                        />
                    </div>
                    <div className="game-score-player">
                        <span className="player-name">
                            {game.playerA || "-"}
                            {game.type === 'D' && game.playerB ? (
                                <>
                                    <span className="player-separator">/</span>
                                    {game.playerB}
                                </>
                            ) : ''}
                        </span>
                    </div>
                    <div className="game-score-sets">
                        {Array.from({ length: game.sets }).map((_, i) => (
                            <div key={i} className="set-score">
                                <span className="set-number">{i + 1}</span>
                                <input
                                    type="text"
                                    className="set-value-input"
                                    inputMode="numeric"
                                    pattern="-?[0-9]*"
                                    value={params.scoreAB?.[i] ?? ''}
                                    placeholder="-"
                                    disabled={isDisabled || !isBuilt || game.winner != 0}
                                    onFocus={(e) => e.target.select()}
                                    onChange={(e) => {
                                        handleChangeScore("scoreAB", i, e.target.value);
                                    }}
                                />
                            </div>
                        ))}
                        <div className="game-score-total">
                            <span className="total-value">{game.setAB || 0}</span>
                        </div>
                    </div>
                    
                </div>
                {/* Team X/Y Row */}
                <div className="game-score-row">
                    <div className="game-score-wo">
                        <input
                            type="checkbox"
                            className="wo-checkbox"
                            onChange={() => {}}
                            checked={params.woXY == 1}
                            onClick={(e) => handleWO(e.target, matchId, "woXY")}
                            disabled={isDisabled || !isBuilt || game.winner != 0}
                        />
                    </div>
                    <div className="game-score-player">
                        <span className="player-name">
                            {game.playerX || "-"}
                            {game.type === 'D' && game.playerY ? (
                                <>
                                    <span className="player-separator">/</span>
                                    {game.playerY}
                                </>
                            ) : ''}
                        </span>
                    </div>
                    <div className="game-score-sets">
                        {Array.from({ length: game.sets }).map((_, i) => (
                            <div key={i} className="set-score">
                                <span className="set-number">{i + 1}</span>
                                <input
                                    type="text"
                                    className="set-value-input"
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    value={params.scoreXY?.[i] ?? ''}
                                    placeholder="-"
                                    disabled={isDisabled || !isBuilt || game.winner != 0}
                                    onFocus={(e) => e.target.select()}
                                    onChange={(e) => {
                                        handleChangeScore("scoreXY", i, e.target.value);
                                    }}
                                />
                            </div>
                        ))}
                        <div className="game-score-total">
                            <span className="total-value">{game.setXY || 0}</span>
                        </div>
                    </div>
                    
                </div>
            </div>
        </div>
        {/* Match Scorer Modal */}
        {scorer.opened && (() => {
            
            return (
                <div className="match-scorer-overlay">
                    <div className="match-scorer-container">
                        <div className="match-scorer-content">
                            <Menu
                                http={http}
                                game={game}
                                updateGame={game.updateGame}
                                setTimeoutState={game.setTimeoutState}
                                onClose={closeMatchScorer}
                                />

                        <Scorer
                                http={http}
                                game={game}
                                updateGame={(timestamp) => {
                                    // Update the selected match game
                                    setScorer(prev => ({
                                        ...prev,
                                        game: prev.game
                                    }));
                                }}
                            />
                        <TableScore game={game} />    
                    </div>
                </div>
            </div>
            );
        })()}
    </>
    );
}