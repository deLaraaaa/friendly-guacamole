import { router, PORT } from "./api.js";
import crud from "./infra/crud.js";

router.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);

  testDatabase();
});

async function testDatabase() {
  try {
    const user = await crud.create("Account", { name: "Alice", email: "alice@gmail.com" });
    console.log("User created:", user);

    const users = await crud.list("Account");
    console.log("All users:", users);

    const userById = await crud.read("Account", { id: user.id });
    console.log("User by ID:", userById);

    const updatedUser = await crud.update("Account", { id: user.id }, { ...user, name: "Alice Smith" });
    console.log("User updated:", updatedUser);

    const userByUser = await crud.read("Account", { name: "Alice Smith" });
    console.log("User by name:", userByUser);

    const usersListByName = await crud.list("Account", { name: "Alice" });
    console.log("Users by name:", usersListByName);

    const usersWithAliceInName = await crud.searchLike("Account", "name", "Alice");
    console.log("Users with 'Alice' in name:", usersWithAliceInName);
  } catch (error) {
    console.error(error);
  }
}
