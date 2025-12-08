async function startVoting(boardId, token) {
    const url = `${import.meta.env.VITE_API_URL}/api/retro-boards/${boardId}/start_voting/`;
    
    console.log("Starting new round - URL:", url, "Board ID:", boardId);

    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": token
        }
    });

    if (!response.ok) {
        const fallbackError = "Error starting new voting round";
        console.log("Response status:", response.status, "URL:", url);

        const data = await response.json().catch(() => {
            throw new Error(fallbackError);
        });

        console.log("data", data);
        const errorMessage = data?.detail ?? fallbackError;
        throw new Error(errorMessage);
    }

    return await response.json();
}

export default startVoting;
