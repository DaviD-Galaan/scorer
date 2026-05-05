import React, { useState } from "react";

export default function TableScore({http,game}) {

    return(
        <div className="table-score-container">
            <div className="table-score">
                <div className="table-score-header">
                    <h2 className="table-score-title">{http.dico["SCORE"]}</h2>
                </div>

                {/* Team AB */}
                <div className="score-row">
                    <div className="score-player-info">
                        <div className="score-player-name">
                            {game.playerA}
                            {game.getCurrentServer()[0] === "A" && (
                                <div className="server-indicator" style={{display: 'inline-block', marginLeft: '10px'}}></div>
                            )}
                            {game.getCurrentServer()[1] === "A" && (
                                <div className="receiver-indicator" style={{display: 'inline-block', marginLeft: '10px'}}></div>
                            )}
                        </div>
                        <div className="score-player-club">{game.clubA}</div>
                        {game.type === "D" && (
                            <>
                                <div className="score-player-name" style={{marginTop: '0.5rem'}}>
                                    {game.playerB}
                                    {game.getCurrentServer()[0] === "B" && (
                                        <div className="server-indicator" style={{display: 'inline-block', marginLeft: '10px'}}></div>
                                    )}
                                    {game.getCurrentServer()[1] === "B" && (
                                        <div className="receiver-indicator" style={{display: 'inline-block', marginLeft: '10px'}}></div>
                                    )}
                                </div>
                                <div className="score-player-club">{game.clubB}</div>
                            </>
                        )}
                    </div>
                    <div className="score-sets">
                        <div className="score-total">{game.setAB}</div>
                        {[...Array(game.sets)].map((_, i) => (
                            <div key={i} className="score-set">
                                {game.scoreAB[i] !== undefined ? game.scoreAB[i] : '-'}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Team XY */}
                <div className="score-row">
                    <div className="score-player-info">
                        <div className="score-player-name">
                            {game.playerX}
                            {game.getCurrentServer()[0] === "X" && (
                                <div className="server-indicator" style={{display: 'inline-block', marginLeft: '10px'}}></div>
                            )}
                            {game.getCurrentServer()[1] === "X" && (
                                <div className="receiver-indicator" style={{display: 'inline-block', marginLeft: '10px'}}></div>
                            )}
                        </div>
                        <div className="score-player-club">{game.clubX}</div>
                        {game.type === "D" && (
                            <>
                                <div className="score-player-name" style={{marginTop: '0.5rem'}}>
                                    {game.playerY}
                                    {game.getCurrentServer()[0] === "Y" && (
                                        <div className="server-indicator" style={{display: 'inline-block', marginLeft: '10px'}}></div>
                                    )}
                                    {game.getCurrentServer()[1] === "Y" && (
                                        <div className="receiver-indicator" style={{display: 'inline-block', marginLeft: '10px'}}></div>
                                    )}
                                </div>
                                <div className="score-player-club">{game.clubY}</div>
                            </>
                        )}
                    </div>
                    <div className="score-sets">
                        <div className="score-total">{game.setXY}</div>
                        {[...Array(game.sets)].map((_, i) => (
                            <div key={i} className="score-set">
                                {game.scoreXY[i] !== undefined ? game.scoreXY[i] : '-'}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}