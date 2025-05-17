export const formatTimeAgo = (date: Date | string): string => {
    const now = new Date();
    const past = new Date(date);
    const diffInMs = now.getTime() - past.getTime();
    
    // Convert to minutes
    const diffInMins = Math.floor(diffInMs / (1000 * 60));
    
    if (diffInMins < 1) {
        return 'just now';
    }
    
    if (diffInMins < 60) {
        return `${diffInMins} ${diffInMins === 1 ? 'min' : 'mins'} ago`;
    }
    
    // Convert to hours
    const diffInHours = Math.floor(diffInMins / 60);
    if (diffInHours < 24) {
        return `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`;
    }
    
    // Convert to days
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {
        return `${diffInDays} ${diffInDays === 1 ? 'day' : 'days'} ago`;
    }
    
    // Convert to weeks
    const diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInWeeks < 4) {
        return `${diffInWeeks} ${diffInWeeks === 1 ? 'week' : 'weeks'} ago`;
    }
    
    // Convert to months
    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) {
        return `${diffInMonths} ${diffInMonths === 1 ? 'month' : 'months'} ago`;
    }
    
    // Convert to years
    const diffInYears = Math.floor(diffInDays / 365);
    return `${diffInYears} ${diffInYears === 1 ? 'year' : 'years'} ago`;
}; 