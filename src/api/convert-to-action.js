async function convertToAction(cardId, token) {
    const url = `${import.meta.env.VITE_API_URL}/api/cards/${cardId}/convert-to-action/`;

    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Authorization": token
        }
    });

    if (!response.ok) {
        const fallbackError = "Error converting card to action";
        const data = await response.json().catch(() => {
            throw new Error(fallbackError);
        });
        const errorMessage = data?.detail ?? fallbackError;
        throw new Error(errorMessage);
    }

    return await response.json();
}

export default convertToAction;