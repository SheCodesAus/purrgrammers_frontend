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

function Avatar({ initials, size = 40, className = '' }) {
    const colors = AVATAR_COLORS.join(',');
    const avatarUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${initials || 'U'}&radius=50&backgroundColor=${colors}`;

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