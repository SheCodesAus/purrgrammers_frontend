// user can update own profile

async function patchProfile(profileData, token) {
    const url =`${import.meta.env.VITE_API_URL}/api/users/profile`;

    const response = await fetch(url, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            "Authorization": token,
        },
    });

    if (!response.ok) {
        const fallbackError = "Failed to update profile";
        const data = await response.json().catch(() => {
            throw new Error(fallbackError);
        });
        
        throw new Error(data?.detail ?? fallbackError);
    }

    return await response.json();
}

export default patchProfile;