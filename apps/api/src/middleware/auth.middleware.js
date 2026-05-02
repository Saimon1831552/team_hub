import jwt from 'jsonwebtoken'

export function verifyToken(req, res, next) {
  // Check Authorization header first (for production cross-domain)
  const authHeader = req.headers.authorization
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7)
    try {
      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET)
      req.userId = decoded.userId
      return next()
    } catch (err) {
      return res.status(401).json({ message: 'Invalid token' })
    }
  }

  // Fallback to cookie
  const token = req.cookies.accessToken
  if (!token) {
    return res.status(401).json({ message: 'No token provided' })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET)
    req.userId = decoded.userId
    next()
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' })
  }
}