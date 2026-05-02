/**
 * @swagger
 * tags:
 *   name: Workspaces
 *   description: Workspace management
 */

/**
 * @swagger
 * /api/workspaces:
 *   post:
 *     summary: Create a new workspace
 *     tags: [Workspaces]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               accentColor:
 *                 type: string
 *                 example: "#6366f1"
 *     responses:
 *       201:
 *         description: Workspace created
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/workspaces:
 *   get:
 *     summary: Get all workspaces for current user
 *     tags: [Workspaces]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of workspaces
 */
export default router