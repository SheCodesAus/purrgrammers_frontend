const createCard = async (cardData, token) => {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/cards/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": token
        },
        body: JSON.stringify(cardData)
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
};

export default createCard;