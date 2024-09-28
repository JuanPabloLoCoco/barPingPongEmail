import { Request, Response, Router } from "express";

const router = Router();
/**
 * Route for authtenticate user, otherwise request a new token
 * prompting for user authorization
 */
router.get("/", async (req: Request, res: Response) => {
    return res.send({ text: "App is running." });
});

export { router };
