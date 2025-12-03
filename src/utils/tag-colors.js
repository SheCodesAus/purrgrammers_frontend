// Color mapping for predefined tags
// Colors are professional and accessible

const TAG_COLORS = {
    // Programming Languages
    python: { bg: '#3776ab', text: '#ffffff' },
    javascript: { bg: '#f7df1e', text: '#000000' },
    java: { bg: '#ed8b00', text: '#000000' },
    csharp: { bg: '#512bd4', text: '#ffffff' },
    typescript: { bg: '#3178c6', text: '#ffffff' },
    
    // Frameworks
    django: { bg: '#092e20', text: '#ffffff' },
    nodejs: { bg: '#339933', text: '#ffffff' },
    react: { bg: '#61dafb', text: '#000000' },
    angular: { bg: '#dd0031', text: '#ffffff' },
    
    // Categories
    tools: { bg: '#6b7280', text: '#ffffff' },
    team_culture: { bg: '#8b5cf6', text: '#ffffff' },
    workload: { bg: '#f59e0b', text: '#000000' },
    communication: { bg: '#06b6d4', text: '#000000' },
    custom: { bg: '#9ca3af', text: '#000000' },
};

// Default color for unknown tags
const DEFAULT_COLOR = { bg: '#e5e7eb', text: '#374151' };

export function getTagColor(tagName) {
    return TAG_COLORS[tagName] || DEFAULT_COLOR;
}

export default TAG_COLORS;
