async function getTeams(token) {
    const url = `${import.meta.env.VITE_API_URL}/api/teams/`;

    const response = await fetch(url, {
        method: "GET", 
        headers: {
            "Content-Type": "application/json",
            "Authorization": token  // Use token as-is since it already has "Token " prefix
        }
    });

    if (!response.ok) {
        const fallbackError = "Error fetching teams";

        const data = await response.json().catch(() => {
            throw new Error(fallbackError)
        });

        const errorMessage = data?.detail ?? fallbackError;
        throw new Error(errorMessage)
    }

    return await response.json();
}

export default getTeams;