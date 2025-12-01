async function voteCard(cardId, token) {
    const url = `${import.meta.env.VITE_API_URL}/api/cards/${cardId}/vote/`;

    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": token
        }
    });

    if (!response.ok) {
        const data = await response.json().catch(() => {
            throw new Error("Error voting on card");
        });

        const errorMessage = data?.error ?? data?.detail ?? "Error voting on card";
        throw new Error(errorMessage);
    }
    return await response.json();
}

async function removeVote(cardId, token) {
    const url = `${import.meta.env.VITE_API_URL}/api/cards/${cardId}/vote/`;

    const response = await fetch(url, {
        method: "DELETE",
        headers: {
            "Authorization": token
        }
    });

    if (!response.ok) {
        const data = await response.json().catch(() => {
            throw new Error("Error removing vote");
        });

        const errorMessage = data?.error ?? data?.detail ?? "Error removing vote";
        throw new Error(errorMessage);
    }
    return await response.json();
}

export { voteCard, removeVote };
