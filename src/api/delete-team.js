async function deleteTeam(teamId, token) {
    const url = `${import.meta.env.VITE_API_URL}/api/teams/${teamId}/`;

    const response = await fetch(url, {
        method: "DELETE",
        headers: {
            "Authorization": token
        }
    });

    if (!response.ok) {
        const fallbackError = "Error deleting team";

        const data = await response.json().catch(() => {
            throw new Error(fallbackError)
        });

        const errorMessage = data?.detail ?? fallbackError;
        throw new Error(errorMessage)
    }

    return;
}

export default deleteTeam;