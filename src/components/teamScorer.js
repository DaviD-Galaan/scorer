import React, { useState } from "react";
import Modal            from "../tools/modal";
import Scorer           from "./scorer";
import Game             from "../classes/game";
import Menu             from "../components/menu";
import GameScore        from "../components/gameScore";
import ImageUploader    from "../components/imageUploader";
import { useRef }       from "react";

export default function TeamScorer({http, teamGame, updateGame}) {

    const debounceRef = useRef({});
    const lastSentRef = useRef({});

    // State for player selection modal
    const [playerModal, setPlayerModal] = useState({
        opened: false,
        place: '',
        teamId: '',
        players: []
    });

    // timeoutState and setTimeoutState are now passed as props from App.js

    // State for team selections (to force re-render)
    const [teamSelections, setTeamSelections] = useState({
        teamA: teamGame.rencontre?.teamA || "",
        teamX: teamGame.rencontre?.teamX || ""
    });

    // State for selected match (to open scorer)
    const [selectedMatch, setSelectedMatch] = useState({
        opened: false,
        game: null,
        matchId: null,
        loading: false
    });

    // State for selected match (to open scorer)
    const [matchHeader, setMatchHeader] = useState({
        teamA: teamGame.rencontre?.teamA || (http.dico["TEAM"] + " A"),
        teamX: teamGame.rencontre?.teamX || (http.dico["TEAM"] + " X"),
        scoreA: teamGame.rencontre?.scoreA || 0,
        scoreX: teamGame.rencontre?.scoreX || 0
    });

    // State for rencontre data (to force re-render when players are assigned)
    // Note: status, winner, and matches are at teamGame level (resp), not rencontre level
    const [rencontreState, setRencontreState] = useState({
        playersA: teamGame.rencontre?.playersA || [],
        playersX: teamGame.rencontre?.playersX || [],
        players: teamGame.rencontre?.players || {},
        matches: teamGame.matches || [],  // matches is at resp level
        status: parseInt(teamGame.status) || 0,  // status is at resp level
        winner: parseInt(teamGame.winner) || 0   // winner is at resp level
    });

    // Check if rencontre is built (status === 1)
    const isRencontreBuilt = rencontreState.status === 1;

    // Check if rencontre is finished (winner !== 0)
    const isRencontreFinished = rencontreState.winner !== 0;

    // Helper function to get player name from ID
    const getPlayerName = (playerId) => {
        if (!playerId || playerId === "0") return null;

        // Get player from rencontreState.players (updated by API)
        const player = rencontreState.players?.[playerId];

        if (!player) {
            return `Player ${playerId}`;
        }

        const firstName = player.PLAYER_FNAME || "";
        const lastName = player.PLAYER_NAME || "";
        const fullName = `${firstName} ${lastName}`.trim();

        return fullName || `Player ${playerId}`;
    };

    // Handler for opening player selection modal
    // doublePosition: 1 or 2 for doubles, null for singles
    const openPlayerModal = (index, side, doublePosition = null) => {
        
        // Determine which team to get players from based on side
        const teamId = side === 'A' ? teamSelections.teamA : teamSelections.teamX;

        if (!teamId || teamId === "0") {
            alert("Please select a team for this side first");
            return;
        }

        // Get the exact label from formule (e.g., "A", "B", "double", "double1", "double2")
        const playerLabels = side === 'A' ? teamGame.formule?.playersA : teamGame.formule?.playersX;
        let place = playerLabels?.[index] || '';

        // For doubles, append the side and position number
        // Format: "double_A_1", "double_A_2", "double1_X_1", "double1_X_2", etc.
        if (doublePosition) {
            place = `${place}_${side}_${doublePosition}`;
        }

        // Fetch players from API
        http.get(http.API + "team/" + teamId + "/players").then((response) => {
            const players = response.resp || response || [];

            setPlayerModal({
                opened: true,
                place: place,
                teamId: teamId,
                players: players
            });
        }).catch((error) => {
            console.error("Error loading players:", error);
            alert("Error loading players");
        });
    };

    // Handler for opening a match scorer
    const openMatchScorer = (matchId) => {
        if (!matchId) {
            console.log("❌ No match ID provided");
            return;
        }

        console.log("🎾 Opening match scorer for matchId:", matchId);

        // Show loading state
        setSelectedMatch({
            opened: true,
            game: null,
            matchId: matchId,
            loading: true
        });

        // Load match data from API
        http.get(http.API + "game/" + matchId + "/manage").then((response) => {
            console.log("✅ Match data loaded:", response);
            const data = response.resp || response;

            // Create new Game instance
            const matchGame = new Game();
            matchGame.get(data);

            console.log("✅ Game initialized:", matchGame);

            setSelectedMatch({
                opened: true,
                game: matchGame,
                matchId: matchId,
                loading: false
            });
        }).catch((error) => {
            console.error("❌ Error loading match:", error);
            alert("Error loading match");
            setSelectedMatch({
                opened: false,
                game: null,
                matchId: null,
                loading: false
            });
        });
    };

    // Handler for closing match scorer
    const closeMatchScorer = () => {
        setSelectedMatch({
            opened: false,
            game: null,
            matchId: null,
            loading: false
        });

        // Reload match data to update scores in the list
        reloadMatchData();
    };

    // Helper function to reload match data (used after placing double players when rencontre is built)
    const reloadMatchData = () => {
        const matchTeamId = teamGame.MATCHS_TEAM_ID ||
                          teamGame.matchTeam?.ID ||
                          teamGame.rencontre?.id;

        if (!matchTeamId || rencontreState.status !== 1) {
            return; // Only reload if rencontre is built
        }

        console.log("🔄 Reloading match data after double player change...");

        //http.get(http.API + "matchsTeam/" + matchTeamId )
        http.get(http.API + "game/" + teamGame.vars.MATCHS_ID + "/manage" )
        .then((response) => {
            const data = response.resp || response;
            console.log("🔄 Match data reloaded:", data.matches);

            if (data.matches) {
                setRencontreState(prev => ({
                    ...prev,
                    matches: data.matches
                }));
            }
            setMatchHeader({
            teamA: data.rencontre?.teamA,
            teamX: data.rencontre?.teamX,
            scoreA: data.rencontre?.scoreA,
            scoreX: data.rencontre?.scoreX,
        });
        }).catch((error) => {
            console.error("❌ Error reloading match data:", error);
        });
    };

    // Handler for selecting a player
    const selectPlayer = (playerId) => {
        console.log("🎯 selectPlayer called with playerId:", playerId);
        console.log("🎯 playerModal:", playerModal);

        const matchTeamId = teamGame.MATCHS_TEAM_ID ||
                          teamGame.matchTeam?.ID ||
                          teamGame.rencontre?.id;

        console.log(`🎯 API call: ${http.API}matchsTeam/${matchTeamId}/placePlayer`);
        console.log(`🎯 Params:`, { place: playerModal.place, playerId: playerId });

        // Check if it's a double player selection
        const isDoublePlayerSelection = playerModal.place && playerModal.place.toLowerCase().includes('double');

        http.put(http.API + "matchsTeam/" + matchTeamId + "/placePlayer", {
            place: playerModal.place,
            playerId: playerId
        }).then((response) => {
            console.log("✅ Player placed successfully, full response:", response);

            // The API returns {resp: {...}, control: {...}}
            const data = response.resp || response;
            console.log("✅ data:", data);
            console.log("✅ data.rencontre:", data.rencontre);

            // Update teamGame.rencontre with the response
            if (data && data.rencontre) {
                console.log("✅ Updating teamGame.rencontre...");
                teamGame.rencontre = data.rencontre;

                console.log("✅ Calling setRencontreState...");
                // Update rencontreState to force re-render with ALL data from API
                // status and winner are at resp level, not rencontre level
                setRencontreState({
                    playersA: data.rencontre.playersA || [],
                    playersX: data.rencontre.playersX || [],
                    players: data.rencontre.players || {},
                    matches: data.matches || [],  // matches is at resp level
                    status: parseInt(data.status) || 0,  // status is at resp level
                    winner: parseInt(data.winner) || 0   // winner is at resp level
                });
                console.log("✅ setRencontreState called with status:", data.status, "winner:", data.winner);
            } else {
                console.log("❌ No rencontre in data!");
            }

            // Close modal
            console.log("✅ Closing modal...");
            setPlayerModal({ opened: false, place: '', teamId: '', players: [] });

            // If it's a double player and rencontre is built, reload match data to get updated player names
            if (isDoublePlayerSelection && rencontreState.status === 1) {
                console.log("🔄 Double player changed while rencontre is built, reloading match data...");
                setTimeout(() => reloadMatchData(), 500); // Small delay to ensure API has updated
            }

            updateGame(Date.now());
            console.log("✅ selectPlayer completed!");
        }).catch((error) => {
            console.error("❌ Error placing player:", error);
            alert("Error placing player");
        });
    };

    // Handler for building the rencontre (feuille de match)
    const handleBuildRencontre = () => {
        const matchTeamId = teamGame.MATCHS_TEAM_ID ||
                          teamGame.matchTeam?.ID ||
                          teamGame.rencontre?.id;

        if (!matchTeamId) {
            console.error("❌ MATCHS_TEAM_ID not found");
            return;
        }

        console.log(`🔨 Building rencontre for matchTeamId: ${matchTeamId}`);

        http.get(http.API + "matchsTeam/" + matchTeamId + "/buildRencontre")
            .then((response) => {
            // The API returns {resp: {...}, control: {...}}
            const data = response.resp || response;
            if (data && data.rencontre) {
                teamGame.rencontre = data.rencontre;
                
                // Update states - status and winner are at resp level, not rencontre level
                setRencontreState({
                    playersA: data.rencontre.playersA || [],
                    playersX: data.rencontre.playersX || [],
                    players: data.rencontre.players || {},
                    matches: data.matches || [],  // matches is at resp level
                    status: parseInt(data.status) || 0,  // status is at resp level
                    winner: parseInt(data.winner) || 0   // winner is at resp level
                });
            }

            updateGame(Date.now());
        }).catch((error) => {
            console.error("❌ Error building rencontre:", error);
            alert("Error building rencontre");
        });
    };

    // Handler for unbuilding the rencontre
    const handleUnbuildRencontre = () => {
        const matchTeamId = teamGame.MATCHS_TEAM_ID ||
                          teamGame.matchTeam?.ID ||
                          teamGame.rencontre?.id;

        if (!matchTeamId) {
            console.error("❌ MATCHS_TEAM_ID not found");
            return;
        }

        http.get(http.API + "matchsTeam/" + matchTeamId + "/unbuildRencontre")
        .then((response) => {
            const data = response.resp || response;
            
            if (data && data.rencontre) {
                teamGame.rencontre = data.rencontre;
                setRencontreState({
                    playersA: data.rencontre.playersA || [],
                    playersX: data.rencontre.playersX || [],
                    players: data.rencontre.players || {},
                    matches: data.matches || [],  // Should be empty after unbuild
                    status: parseInt(data.status) || 0,  // Should be 0 after unbuild
                    winner: parseInt(data.winner) || 0   // Should be 0 after unbuild
                });
                setMatchHeader({
                    teamA: data.rencontre?.teamA || "Team A",
                    teamX: data.rencontre?.teamX || "Team X",
                    scoreA: data.rencontre?.scoreA || 0,
                    scoreX: data.rencontre?.scoreX || 0
                });
            }

            updateGame(Date.now());
        }).catch((error) => {
            console.error("❌ Error unbuilding rencontre:", error);
            alert("Error unbuilding rencontre");
        });
    };

    const finishRencontre = () => {
        http.get(http.API + "game/" + teamGame.vars.MATCHS_ID + "/confirmation").then( data => {
            if(data.resp.error) {
                alert(http.dico[data.resp.error]);
                return;
            }
            rencontreState.winner = data.resp.winner;
            setRencontreState({...rencontreState});
        }); 
    }
    const openRencontre = () => {
        http.get(http.API + "game/" + teamGame.vars.MATCHS_ID + "/annulation").then( data => {
            rencontreState.winner = data.resp.winner;
            setRencontreState({...rencontreState});
        }); 
    }

    // Handler for selecting which team plays on which side
    const handleSideSelection = (side, teamId) => {
        console.log("=== handleSideSelection called ===");
        console.log(`Setting side ${side} to team ${teamId}`);

        const matchTeamId = teamGame.MATCHS_TEAM_ID ||
                          teamGame.matchTeam?.ID ||
                          teamGame.rencontre?.id;

        if (!matchTeamId) {
            console.error("❌ MATCHS_TEAM_ID not found");
            return;
        }

        console.log(`✅ Using MATCHS_TEAM_ID: ${matchTeamId}`);
        console.log(`🌐 Calling API: ${http.API}matchsTeam/${matchTeamId}/side`);

        // Determine the other team: if team1 is selected, team2 is the other, and vice versa
        const otherTeamId = teamId === teamGame.team1?.id ? teamGame.team2?.id : teamGame.team1?.id;
        const otherSide = side === 'A' ? 'X' : 'A';

        http.put(http.API + "matchsTeam/" + matchTeamId + "/side", {
            side: side,
            teamId: parseInt(teamId)
        }).then((response) => {
            console.log("✅ Side selection successful:", response);

            // The API returns {resp: {...}, control: {...}}
            const data = response.resp || response;

            // CRITICAL: Update teamGame.rencontre with the response
            if (data && data.rencontre) {
                teamGame.rencontre = data.rencontre;
                console.log("✅ teamGame.rencontre updated:", teamGame.rencontre);

                // Update local state to force re-render
                // The API should return both teamA and teamX automatically
                setTeamSelections({
                    teamA: data.rencontre.teamA || "",
                    teamX: data.rencontre.teamX || ""
                });

                // Update rencontreState to refresh player assignments
                // status and winner are at resp level, not rencontre level
                setRencontreState({
                    playersA: data.rencontre.playersA || [],
                    playersX: data.rencontre.playersX || [],
                    players: data.rencontre.players || {},
                    matches: data.matches || [],  // matches is at resp level
                    status: parseInt(data.status) || 0,  // status is at resp level
                    winner: parseInt(data.winner) || 0   // winner is at resp level
                });
                console.log("✅ rencontreState updated after side change");
            } else {
                // If no rencontre in response, update both sides manually
                setTeamSelections({
                    [side === 'A' ? 'teamA' : 'teamX']: teamId,
                    [side === 'A' ? 'teamX' : 'teamA']: otherTeamId
                });
            }

            updateGame(Date.now());
        }).catch((error) => {
            console.error("❌ Error setting team side:", error);
        });
    };

    return(
        <div className="team-scorer-container">
            {/* Side Selection (if match not started) */}
            <div className="side-selection-container">
                {/* Team A Selection */}
                <div className="side-selection-box">
                    <h3 className="side-selection-title">{http.dico["TEAM"]} A</h3>
                    <select
                        className="side-selection-combo"
                        value={String(teamSelections.teamA || "")}
                        onChange={(e) => {
                            console.log("Team A selection changed to:", e.target.value);
                            handleSideSelection("A", e.target.value);
                        }}
                        disabled={isRencontreBuilt || isRencontreFinished}
                    >
                        <option value="">-- Select Team --</option>
                        <option value={teamGame.team1?.id}>
                            {teamGame.team1?.name}
                        </option>
                        <option value={teamGame.team2?.id}>
                            {teamGame.team2?.name}
                        </option>
                    </select>
                </div>

                {/* Team X Selection */}
                <div className="side-selection-box">
                    <h3 className="side-selection-title">{http.dico["TEAM"]} X</h3>
                    <select
                        className="side-selection-combo"
                        value={String(teamSelections.teamX || "")}
                        onChange={(e) => {
                            console.log("Team X selection changed to:", e.target.value);
                            handleSideSelection("X", e.target.value);
                        }}
                        disabled={isRencontreBuilt || isRencontreFinished}
                    >
                        <option value="">-- Select Team --</option>
                        <option value={teamGame.team1?.id}>
                            {teamGame.team1?.name}
                        </option>
                        <option value={teamGame.team2?.id}>
                            {teamGame.team2?.name}
                        </option>
                    </select>
                </div>
            </div>

            {/* Players Lists */}
            <div className="teams-players-container">
                {/* Team A Players */}
                <div className="team-players-section">
                    <h3 className="team-players-title">
                        {teamSelections.teamA && teamSelections.teamA !== "0" && (
                            <span className="selected-team-name">
                                {teamSelections.teamA === teamGame.team1?.id
                                    ? teamGame.team1?.name
                                    : teamGame.team2?.name}
                            </span>
                        )}
                    </h3>
                    <div className="players-list">
                        {teamGame.formule?.playersA && teamGame.formule.playersA.map((player, index) => {
                            const playerData = rencontreState.playersA?.[index];
                            // Check if label starts with "double" (e.g., "double", "double1", "double2")
                            const isDouble = typeof player === 'string' && player.toLowerCase().startsWith('double');

                            if (isDouble) {
                                // Double: Two separate buttons for player 1 and player 2
                                // Doubles can be edited even after build, but not after finished
                                const playerIds = playerData ? playerData.split('|') : ['0', '0'];
                                const player1Id = playerIds[0];
                                const player2Id = playerIds[1];

                                return (
                                    <div key={index} className="player-card double-card">
                                        <div className="player-position-label">
                                            <span className="position-badge">{player}</span>
                                            <span className="player-type">Double</span>
                                        </div>
                                        <div className="double-players-container">
                                            <button
                                                className={`double-player-btn ${!isRencontreFinished ? 'clickable' : 'disabled'}`}
                                                onClick={() => !isRencontreFinished && openPlayerModal(index, 'A', 1)}
                                                disabled={isRencontreFinished}
                                            >
                                                <span className="double-position-number">1️⃣</span>
                                                <span className="player-name-display">
                                                    {player1Id && player1Id !== "0" ?
                                                        getPlayerName(player1Id) :
                                                        "Click to select"}
                                                </span>
                                            </button>
                                            <button
                                                className={`double-player-btn ${!isRencontreFinished ? 'clickable' : 'disabled'}`}
                                                onClick={() => !isRencontreFinished && openPlayerModal(index, 'A', 2)}
                                                disabled={isRencontreFinished}
                                            >
                                                <span className="double-position-number">2️⃣</span>
                                                <span className="player-name-display">
                                                    {player2Id && player2Id !== "0" ?
                                                        getPlayerName(player2Id) :
                                                        "Click to select"}
                                                </span>
                                            </button>
                                        </div>
                                    </div>
                                );
                            } else {
                                // Single: One button
                                return (
                                    <div
                                        key={index}
                                        className={`player-card ${!isRencontreBuilt && !isRencontreFinished ? 'clickable' : 'disabled'}`}
                                        onClick={() => !isRencontreBuilt && !isRencontreFinished && openPlayerModal(index, 'A', null)}
                                    >
                                        <div className="player-position-label">
                                            <span className="position-badge">{player}</span>
                                            <span className="player-type">Single</span>
                                        </div>
                                        <div className="player-name-display">
                                            {playerData && playerData !== "0" ? (
                                                <span>{getPlayerName(playerData)}</span>
                                            ) : (
                                                <span className="not-selected">Click to select player</span>
                                            )}
                                        </div>
                                    </div>
                                );
                            }
                        })}
                    </div>
                </div>

                {/* Team X Players */}
                <div className="team-players-section">
                    <h3 className="team-players-title">
                        {teamSelections.teamX && teamSelections.teamX !== "0" && (
                            <span className="selected-team-name">
                                {teamSelections.teamX === teamGame.team1?.id
                                    ? teamGame.team1?.name
                                    : teamGame.team2?.name}
                            </span>
                        )}
                    </h3>
                    <div className="players-list">
                        {teamGame.formule?.playersX && teamGame.formule.playersX.map((player, index) => {
                            const playerData = rencontreState.playersX?.[index];
                            // Check if label starts with "double" (e.g., "double", "double1", "double2")
                            const isDouble = typeof player === 'string' && player.toLowerCase().startsWith('double');

                            if (isDouble) {
                                // Double: Two separate buttons for player 1 and player 2
                                // Doubles can be edited even after build, but not after finished
                                const playerIds = playerData ? playerData.split('|') : ['0', '0'];
                                const player1Id = playerIds[0];
                                const player2Id = playerIds[1];

                                return (
                                    <div key={index} className="player-card double-card">
                                        <div className="player-position-label">
                                            <span className="position-badge">{player}</span>
                                            <span className="player-type">Double</span>
                                        </div>
                                        <div className="double-players-container">
                                            <button
                                                className={`double-player-btn ${!isRencontreFinished ? 'clickable' : 'disabled'}`}
                                                onClick={() => !isRencontreFinished && openPlayerModal(index, 'X', 1)}
                                                disabled={isRencontreFinished}
                                            >
                                                <span className="double-position-number">1️⃣</span>
                                                <span className="player-name-display">
                                                    {player1Id && player1Id !== "0" ?
                                                        getPlayerName(player1Id) :
                                                        "Click to select"}
                                                </span>
                                            </button>
                                            <button
                                                className={`double-player-btn ${!isRencontreFinished ? 'clickable' : 'disabled'}`}
                                                onClick={() => !isRencontreFinished && openPlayerModal(index, 'X', 2)}
                                                disabled={isRencontreFinished}
                                            >
                                                <span className="double-position-number">2️⃣</span>
                                                <span className="player-name-display">
                                                    {player2Id && player2Id !== "0" ?
                                                        getPlayerName(player2Id) :
                                                        "Click to select"}
                                                </span>
                                            </button>
                                        </div>
                                    </div>
                                );
                            } else {
                                // Single: One button
                                return (
                                    <div
                                        key={index}
                                        className={`player-card ${!isRencontreBuilt && !isRencontreFinished ? 'clickable' : 'disabled'}`}
                                        onClick={() => !isRencontreBuilt && !isRencontreFinished && openPlayerModal(index, 'X', null)}
                                    >
                                        <div className="player-position-label">
                                            <span className="position-badge">{player}</span>
                                            <span className="player-type">Single</span>
                                        </div>
                                        <div className="player-name-display">
                                            {playerData && playerData !== "0" ? (
                                                <span>{getPlayerName(playerData)}</span>
                                            ) : (
                                                <span className="not-selected">Click to select player</span>
                                            )}
                                        </div>
                                    </div>
                                );
                            }
                        })}
                    </div>
                </div>
            </div>

            {/* Build/Unbuild Rencontre Button */}
            <div className="build-rencontre-container">
                {isRencontreFinished ? (
                    <></>
                ) : isRencontreBuilt ? (
                    <button
                        className="btn unbuild-btn"
                        onClick={handleUnbuildRencontre}
                    >
                        <span className="btn-icon">🔓</span>
                        <span>{http.dico["UNBUILD"]}</span>
                    </button>
                ) : (
                    <button
                        className="btn build-btn"
                        onClick={handleBuildRencontre}
                    >
                        <span className="btn-icon">🔨</span>
                        <span>{http.dico["BUILD"]}</span>
                    </button>
                )}
            </div>

            {/* Team Match Header */}
            <div className="team-match-header">
                <div className="team-info">
                    <div className="team-name">
                        {
                        teamGame.team1?.id == matchHeader.teamA ? teamGame.team1?.name : teamGame.team2?.name 
                        }
                    </div>
                    <div className="team-score">{matchHeader.scoreA}</div>
                </div>
                <div className="vs-separator">-</div>
                <div className="team-info">
                    <div className="team-name">
                        {
                        teamGame.team1?.id == matchHeader.teamX ? teamGame.team1?.name : teamGame.team2?.name 
                        }
                    </div>
                    <div className="team-score">{matchHeader.scoreX}</div>
                </div>
            </div>

            {/* Game Control Buttons */}
            { isRencontreBuilt &&
            <div className="game-controls">
                {rencontreState.winner == 0 && (
                    <button className="btn btn-success btn-large finish-game" onClick={finishRencontre}>
                        {http.dico["END_RENCONTRE"]}
                    </button>
                )}
                {rencontreState.winner != 0 && (
                    <button className="btn btn-danger btn-large open-game" onClick={openRencontre}>
                        Open the game
                    </button>
                )}
            </div>
            }

            {/* Matches List */}
            <div className="matches-list-container">
                <div className="matches-list">
                    {console.log("📋 rencontreState.matches:", rencontreState.matches)}

                    {
                        teamGame.formule?.lstMatchs && teamGame.formule.lstMatchs.map((matchLabel, index) => {
                            const game = new Game();
                            game.get(rencontreState.matches?.[index]);
                            game.index = index;
                            game.label = matchLabel;
                            game.rencontreId = teamGame.rencontre?.id;
                            game.updateGame = updateGame;
                            game.reloadMatchData = reloadMatchData;
                            
                            return(
                                <GameScore  key={game.id || index}
                                            http={http}
                                            game={game}
                                            isRencontreFinished={isRencontreFinished} />
                            )

                        })
                    }    

                </div>
            </div>

            {/* Image Uploader */}
            {isRencontreBuilt && teamGame.reportMandatory == 1 && (
                <ImageUploader
                    http={http}
                    matchId={teamGame.vars.MATCHS_ID}
                    teamGame={teamGame}
                    onUploadSuccess={() => updateGame(Date.now())}
                    isRencontreFinished={isRencontreFinished}
                />
            )}

            {/* Player Selection Modal */}
            <Modal
                id="PlayerSelection"
                title={`Select Player for Position ${playerModal.place}`}
                className="player-selection-modal"
                opened={playerModal.opened}
            >
                <div className="modal-player-list">
                    <button
                        className="modal-player-item remove"
                        onClick={() => selectPlayer("0")}
                    >
                        <span className="player-icon">✖</span>
                        <span>Remove Player</span>
                    </button>

                    <hr className="modal-divider" />

                    {playerModal.players.length > 0 ? (
                        playerModal.players.map((player) => {
                            const playerId = player.id || player.PLAYER_ID || player.ID;
                            console.log("Modal player:", player, "ID:", playerId);
                            return (
                                <button
                                    key={playerId}
                                    className="modal-player-item"
                                    onClick={() => {
                                        console.log("Player clicked, ID:", playerId);
                                        selectPlayer(playerId);
                                    }}
                                >
                                    <span className="player-icon">👤</span>
                                    <span className="player-name">
                                        {player.PLAYER_FNAME || player.firstName || player.fname} {player.PLAYER_NAME || player.lastName || player.name}
                                    </span>
                                </button>
                            );
                        })
                    ) : (
                        <div className="no-players">No players available</div>
                    )}
                </div>

                <button
                    className="btn modal-close-btn"
                    onClick={() => setPlayerModal({ opened: false, place: '', teamId: '', players: [] })}
                >
                    Close
                </button>
            </Modal>
        </div>
    )
}