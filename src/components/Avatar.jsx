import './Avatar.css';

// Color palette matching the retro board color picker
const AVATAR_COLORS = [
    'FCA5A5', 'FDBA74', 'FDE047', 'A7F3D0', 
    '67E8F9', '93C5FD', 'C4B5FD', 'F9A8D4', 
    'FB7185', 'F472B6', 'E879F9', 'C084FC',
    'A78BFA', '818CF8', '60A5FA', '34D399',
    '4ADE80', '84CC16', 'EAB308', 'FB923C',
    'F87171', 'EC4899', 'D946EF', 'A855F7'
];

// Simple hash function to get consistent index from userId
function getColorIndex(userId) {
    if (!userId) return 0;
    const str = String(userId);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash) % AVATAR_COLORS.length;
}

function Avatar({ initials, userId, size = 40, className = '' }) {
    // Pick a consistent color based on userId, fallback to initials-based
    const colorIndex = getColorIndex(userId || initials);
    const backgroundColor = AVATAR_COLORS[colorIndex];
    
    // Use initials as seed so DiceBear shows the correct letters
    const seed = initials || 'U';
    const avatarUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${seed}&radius=50&backgroundColor=${backgroundColor}`;

    return (
        <img
            src={avatarUrl}
            alt={initials || 'User'}
            className={`avatar ${className}`}
            style={{ width: size, height: size }}
        />
    );
}

export default Avatar;