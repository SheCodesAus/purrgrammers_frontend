// this allows any logged in user to view other profiles

async function getUserProfile(userId, token) {
    const url = `${import.meta.env.VITE_API_URL}/api/users/profile/${userId}/`;

    const response = await fetch(url, {
        method: "GET",
        headers: {
            "Authorization": token,
        },
    });

    if (!response.ok) {
        if (response.status === 404) {
            throw new Error("User not found");
        }
        
        const fallbackError = "Failed to fetch user profile";
        const data = await response.json().catch(() => {
            throw new Error(fallbackError);
        });

        throw new Error(data?.error ?? data?.detail ?? fallbackError);
    }

    return await response.json();
}

export default getUserProfile;