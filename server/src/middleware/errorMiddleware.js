const errorMiddleware = (err, req, res, next) => {
  if (process.env.NODE_ENV !== 'test') {
    console.error(err.stack || err.message);
  }

  let statusCode = err.statusCode || 500;
  let message = err.message || 'Server Error';

  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue || {})[0] || 'Field';
    message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
  }

  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((val) => val.message)
      .join(', ');
  }

  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Token invalid';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  }

  if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Resource not found';
  }

  res.status(statusCode).json({
    success: false,
    message
  });
};

module.exports = errorMiddleware;
