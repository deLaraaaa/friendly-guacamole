
import crud from "./crud.js";

(async () => {
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
  } catch (error) {
    console.error(error);
  }
})();
