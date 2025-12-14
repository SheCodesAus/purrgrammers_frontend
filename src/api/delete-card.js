async function deleteCard(cardId, token) {
    const url = `${import.meta.env.VITE_API_URL}/api/cards/${cardId}/`;

    const response = await fetch(url, {
        method: "DELETE",
        headers: {
            "Authorization": token
        }
    });

    if (!response.ok) {
        const fallbackError = "Error deleting card";

        // Handle permission errors with a friendly message
        if (response.status === 403) {
            throw new Error("You don't have permission to delete this card");
        }

        const data = await response.json().catch(() => {
            throw new Error(fallbackError)
        });

        const errorMessage = data?.detail ?? fallbackError;
        throw new Error(errorMessage)
    }

    // delete returns 204 no content, so no JSON to parse
    return;
}

export default deleteCard;