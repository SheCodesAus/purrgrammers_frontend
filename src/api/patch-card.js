async function patchCard(cardId, cardData, token) {
    const url = `${import.meta.env.VITE_API_URL}/api/cards/${cardId}/`;

    const response = await fetch(url, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            "Authorization": token
        },
        body: JSON.stringify(cardData)
    });

    if (!response.ok) {
        const fallbackError = "Error updating card";

        const data = await response.json().catch(() => {
            throw new Error(fallbackError)
        });

        const errorMessage = data?.detail ?? fallbackError;
        throw new Error(errorMessage)
    }
    return await response.json();
};

export default patchCard;


