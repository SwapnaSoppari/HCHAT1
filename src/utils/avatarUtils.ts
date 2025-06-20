
export const generateUserColor = (username: string): string => {
  const colors = [
    '#EC4899', '#8B5CF6', '#F97316', '#06B6D4', '#10B981',
    '#F59E0B', '#EF4444', '#8B5A2B', '#6366F1', '#84CC16',
    '#F472B6', '#A78BFA', '#FB923C', '#38BDF8', '#4ADE80'
  ];
  
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  return colors[Math.abs(hash) % colors.length];
};

export const getInitials = (username: string): string => {
  return username.split(' ').map(name => name[0]).join('').toUpperCase().slice(0, 2);
};
