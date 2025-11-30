async function createTeam(teamData, token) {
    const url = `${import.meta.env.VITE_API_URL}/api/teams/`;

    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": token,
        },
        body: JSON.stringify(teamData),
    });

    if (!response.ok) {
        const fallbackError = "Failed to create team";

        const data = await response.json().catch(() => {
            throw new Error(fallbackError);
        });

        const errorMessage = data?.detail ?? fallbackError;
        throw new Error(errorMessage);
    }

    return await response.json();
}

export default createTeam;