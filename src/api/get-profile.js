// This fetches users own profile

async function getProfile(token) {
    const url = `${import.meta.env.VITE_API_URL}/api/users/profile/`;

    const response = await fetch(url, {
        method: "GET",
        headers: {
            "Authorization": token,
        },
    });

    if (!response.ok) {
        const fallbackError = "Failed to fetch profile";
        const data = await response.json().catch(() => {
            throw new Error(fallbackError);
        });

        throw new Error(data?.detail ?? fallbackError);
    }

    return await response.json();
}

export default getProfile;