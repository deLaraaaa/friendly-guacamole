import { router, PORT } from "./api/access_.js";
import CONST from "./infra/constants.js";
import crud from "./infra/crud.js";

router.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);

  testDatabase();
});

async function testDatabase() {
  try {
    const user = await crud.read(CONST.TABLES.ACCOUNT.KIND, { username: "rafael", namespace: "aguadoce" });
    console.log("User read:", user);
  } catch (error) {
    console.error(error);
  }
}
