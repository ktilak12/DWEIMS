export const requestLogger = (req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} - User ID: ${req.user ? req.user.id : 'Unauthenticated'}`);
    next();
};
