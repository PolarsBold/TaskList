import express from "express";
const router = express.Router();
export default router;

import requireBody from "#middleware/requireBody";
import requireUser from "#middleware/requireUser";
import {
  createTask,
  getTasksByUserId,
  updateTask,
  getTaskById,
  deleteTask,
} from "#db/queries/tasks";

router.use(requireUser);

router
  .route("/")
  .post(requireBody(["title", "done"]), async (req, res) => {
    const { title, done } = req.body;
    const newTask = await createTask(title, done, req.user.id);
    res.status(201).send(newTask);
  })
  .get(async (req, res) => {
    const tasks = await getTasksByUserId(req.user.id);
    res.status(200).send(tasks);
  });

router.param("id", async (req, res, next, id) => {
  const task = await getTaskById(id);
  if (!task) return res.status(404).send("Task not found");
  if (task.user_id !== req.user.id) {
    return res.status(403).send("This is not your task");
  }
  req.task = task;
  next();
});

router
  .route("/:id")
  .put(requireBody(["title", "done"]), async (req, res) => {
    const { title, done } = req.body;
    const updatedTask = await updateTask(
      req.params.id,
      title,
      done,
      req.user.id
    );
    if (!updatedTask)
      return res.status(403).json({ message: "You do not own this task" });
    res.status(200).send(updatedTask);
  })
  .delete(async (req, res) => {
    const deletedTask = await deleteTask(req.task.id);
    if (req.user.id != req.task.user_id)
      return res.status(403).json({ message: "You do not own this task" });
    res.status(204).send(deletedTask);
  });
