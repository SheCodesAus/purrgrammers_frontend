async function createCard(cardData, token) {
    const url = `${import.meta.env.VITE_API_URL}/api/cards/`;

    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": token
        },
        body: JSON.stringify(cardData)
    });

    if (!response.ok) {
        const fallbackError = "Error creating card";

        const data = await response.json().catch(() => {
            throw new Error(fallbackError)
        });

        const errorMessage = data?.detail ?? fallbackError;
        throw new Error(errorMessage)
    }

    return await response.json();
}

export default createCard;