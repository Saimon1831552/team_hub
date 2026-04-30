import jwt from 'jsonwebtoken'

export function verifyToken(req, res, next) {
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