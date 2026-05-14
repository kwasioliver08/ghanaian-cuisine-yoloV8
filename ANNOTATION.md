# 🖊️ Annotation Protocol

## Guidelines
* **Bounding Boxes:** Boxes must be drawn as tightly as possible around the food item to minimize background noise.
* **Consistency:** Always use the exact class names (e.g., `jollof_rice` instead of just `rice`).
* **Tooling:** All manual annotations are performed using **Roboflow**.

## Handling Challenges
* **Overlapping Food:** If a plate has two types of food, draw two separate boxes.
* **Low Light:** Images with poor lighting will be kept if the food is still distinguishable, as this helps the model's real-world robustness.
