export function formatMessageTime(date) {
  try {
    if (!date) return '';
    
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) return '';
    
    return dateObj.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  } catch (error) {
    console.error('Error formatting message time:', error);
    return '';
  }
}