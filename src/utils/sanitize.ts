export const sanitizeText = (val: string): string => {
    return val.trim().replace(/<[^>]*>/g, '').slice(0, 500);
};
