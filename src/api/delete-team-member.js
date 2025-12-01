async function deleteTeamMember(teamId, userId, token) {
    const url = `${import.meta.env.VITE_API_URL}/api/teams/${teamId}/remove-member/${userId}/`;

    const response = await fetch(url, {
        method: "DELETE",
        headers: {
            "Authorization": token
        }
    });

    if (!response.ok) {
        const fallbackError = "Error removing team member";

        const data = await response.json().catch(() => {
            throw new Error(fallbackError)
        });

        const errorMessage = data?.detail ?? fallbackError;
        throw new Error(errorMessage)
    }

    return;
}

export default deleteTeamMember;