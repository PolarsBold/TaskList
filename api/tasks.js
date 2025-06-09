import express from "express";
const router = express.Router();
export default router;

import requireBody from "#middleware/requireBody";
import requireUser from "#middleware/requireUser";
import { createTask } from "#db/queries/tasks";

router.use(requireUser);

router.route("/").post(requireBody(["title", "done"]), async (req, res) => {
  const { title, done } = req.body;
  const newTask = await createTask(title, done, req.user.id);
  res.status(201).send(newTask);
});

router.param("id", async (req, res, next, id) => {
  const task = await getTaskById(id);
  if (!task) return res.status(404).send("Task not found");
});
