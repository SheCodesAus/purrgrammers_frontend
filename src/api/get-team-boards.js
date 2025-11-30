async function getTeamBoards(teamId, token){
    const url = `${import.meta.env.VITE_API_URL}/api/teams/${teamId}/retro-boards/`;

    const response = await fetch(url, {
        method: "GET",
        headers: {
            "Authorization": token
        }
    });

    if (!response.ok) {
        const fallbackError = "Error fetching boards";

        const data = await response.json().catch(() => {
            throw new Error(fallbackError)
        });

        const errorMessage = data?.detail ?? fallbackError;
        throw new Error(errorMessage)
    }

    return await response.json();
}

export default getTeamBoards;