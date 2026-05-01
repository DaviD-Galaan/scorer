export default class TeamGame {
    get(data) {
        console.log("TeamGame.get() received FULL data object:", JSON.stringify(data, null, 2));
        console.log("data.rencontre:", data.rencontre);
        console.log("data.rencontre?.ID:", data.rencontre?.ID);
        console.log("data.rencontre?.vars:", data.rencontre?.vars);
        console.log("data.recontre:", data.recontre);

        // IMPORTANT: Based on the actual API response structure
        // The MATCHS_TEAM_ID is in data.matchTeam.ID or data.rencontre.id
        let matchsTeamId = null;

        // Priority 1: data.matchTeam.ID (most direct and reliable)
        if (data.matchTeam?.ID) {
            matchsTeamId = data.matchTeam.ID;
            console.log("✅ Found MATCHS_TEAM_ID in data.matchTeam.ID:", matchsTeamId);
        }
        // Priority 2: data.matchTeam.vars.MATCHS_TEAM_ID
        else if (data.matchTeam?.vars?.MATCHS_TEAM_ID) {
            matchsTeamId = data.matchTeam.vars.MATCHS_TEAM_ID;
            console.log("✅ Found MATCHS_TEAM_ID in data.matchTeam.vars.MATCHS_TEAM_ID:", matchsTeamId);
        }
        // Priority 3: data.rencontre.id (lowercase!)
        else if (data.rencontre?.id) {
            matchsTeamId = data.rencontre.id;
            console.log("✅ Found MATCHS_TEAM_ID in data.rencontre.id:", matchsTeamId);
        }
        // Priority 4: data.rencontre.ID (uppercase)
        else if (data.rencontre?.ID) {
            matchsTeamId = data.rencontre.ID;
            console.log("✅ Found MATCHS_TEAM_ID in data.rencontre.ID:", matchsTeamId);
        }
        // Fallback options
        else if (data.vars?.MATCHS_TEAM_ID) {
            matchsTeamId = data.vars.MATCHS_TEAM_ID;
            console.log("⚠️ Found MATCHS_TEAM_ID in data.vars.MATCHS_TEAM_ID:", matchsTeamId);
        }
        else {
            matchsTeamId = data.ID || data.id;
            console.warn("❌ Could not find MATCHS_TEAM_ID, using data.ID (might be MATCHS_ID!):", matchsTeamId);
        }

        this.MATCHS_TEAM_ID = matchsTeamId;

        // Also store as ID for backward compatibility
        this.ID = this.MATCHS_TEAM_ID || data.ID || data.id;
        this.id = this.MATCHS_TEAM_ID || data.id || data.ID;

        // Type of match
        this.type = data.type;

        // Teams information
        this.team1 = data.team1;
        this.team2 = data.team2;

        // Scores
        this.score1 = data.score1 || data.scoreA || 0;
        this.score2 = data.score2 || data.scoreX || 0;

        // Formula (playersA, playersX, lstMatchs)
        this.formule = data.formule;

        // Rencontre object (contains vars, matchs, etc.)
        this.rencontre = data.rencontre || data.recontre; // Support both spellings

        // MatchTeam object (contains MATCHS_TEAM_ID and vars)
        this.matchTeam = data.matchTeam;

        // Teams array
        this.teams = data.teams;

        // Teams matches
        this.matches = data.matches;

        // Teams status
        this.status = data.status;

        // Teams winner
        this.winner = data.winner;

        // Pictures
        this.formPict = data.formPict;
        this.picture = data.picture;
        this.reportMandatory = data.reportMandatory;

        // Store vars directly for easier access
        // Priority: matchTeam.vars > rencontre.vars > data.vars
        this.vars = data.matchTeam?.vars || data.vars || data.rencontre?.vars || data.recontre?.vars;

        console.log("=== TeamGame object created ===");
        console.log("MATCHS_TEAM_ID:", this.MATCHS_TEAM_ID);
        console.log("ID:", this.ID);
        console.log("id:", this.id);
        console.log("team1:", this.team1);
        console.log("team2:", this.team2);
        console.log("formule:", this.formule);
        console.log("vars:", this.vars);
        console.log("rencontre:", this.rencontre);
        console.log("===============================");
    }

}