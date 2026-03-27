import { Router, type IRouter } from "express";
import healthRouter from "./health";
import screenerRouter from "./screener";
import secRouter from "./sec";

const router: IRouter = Router();

router.use(healthRouter);
router.use(screenerRouter);
router.use(secRouter);

export default router;
