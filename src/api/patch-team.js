async function patchTeam(teamId, name, token) {
    const url = `${import.meta.env.VITE_API_URL}/api/teams/${teamId}/`;

    const response = await fetch(url, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `token ${token}`
        },
        body: JSON.stringify({ 
            "name": name,
            "description": "",
            "members": [],
            "is_active": true,
            })
    });

    if (!response.ok) {
        const fallbackError = "Error updating team";
        const data = await response.json().catch(() => {
            throw new Error(fallbackError)
        });

        const errorMessage = data?.detail ?? fallbackError;
        throw new Error(errorMessage)
    }

    return await response.json();
}

export default patchTeam