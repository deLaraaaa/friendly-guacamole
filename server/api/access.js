import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import validator from "validator";
import crud from "../infra/crud.js";
import CONST from "../infra/constants.js";

export default {
  async getRestaurantByNamespace(namespace) {
    const restaurant = await crud.read(CONST.TABLES.RESTAURANT.KIND, { namespace });

    if (!restaurant) {
      throw { status: 404, message: "Restaurant with this namespace does not exist" };
    }
  },

  async restaurantRegister(data) {
    let { namespace } = data;
    namespace = validator.escape(namespace.trim());

    if (!namespace) {
      throw { status: 400, message: "Restaurant namespace is required" };
    }

    const existingRestaurant = await crud.read(CONST.TABLES.RESTAURANT.KIND, { namespace });
    if (existingRestaurant) {
      throw { status: 409, message: "Restaurant with this namespace already exists" };
    }

    const newRestaurant = await crud.create(CONST.TABLES.RESTAURANT.KIND, {
      namespace,
      createdAt: new Date()
    });

    return newRestaurant;
  },

  async register(data) {
    let {
      // eslint-disable-next-line prefer-const
      username, password, namespace, email, role
    } = data;

    username = validator.escape(username.trim());
    namespace = validator.escape(namespace.trim());
    email = validator.normalizeEmail(email.trim());
    role = role.toUpperCase();

    if (!username || !password || !namespace || !email || !role) {
      throw { status: 400, message: "Username, password, namespace, email, and role are required" };
    }

    if (!validator.isEmail(email)) {
      throw { status: 400, message: "Invalid email format" };
    }

    const validRoles = ["ADMIN", "RECEPCIONIST", "COOK", "WAITER"];
    if (!validRoles.includes(role)) {
      throw { status: 400, message: `Role must be one of: ${validRoles.join(", ")}` };
    }

    const restaurant = await this.getRestaurantByNamespace(namespace);
    const restaurantId = restaurant.id;

    const existingUserByUsername = await crud.read(CONST.TABLES.ACCOUNT.KIND, { username, namespace });
    if (existingUserByUsername) {
      throw { status: 409, message: "User already exists with this username and namespace" };
    }

    const existingUserByEmail = await crud.read(CONST.TABLES.ACCOUNT.KIND, { email });
    if (existingUserByEmail) {
      throw { status: 409, message: "User already exists with this email" };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await crud.create(CONST.TABLES.ACCOUNT.KIND, {
      username,
      password: hashedPassword,
      namespace,
      email,
      restaurantId,
      role,
      createdAt: new Date()
    });

    const { password: _, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  },

  async login(data) {
    const { login, password } = data;

    if (!login || !password) {
      throw { status: 400, message: "Login and password are required" };
    }

    const loginParts = login.split("@");
    if (loginParts.length !== 2) {
      throw { status: 400, message: "Invalid login format. Use username@namespace" };
    }

    const [username, namespace] = loginParts;

    const user = await crud.read(CONST.TABLES.ACCOUNT.KIND, { username, namespace });

    if (!user) {
      throw { status: 401, message: "Invalid credentials" };
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      throw { status: 401, message: "Invalid credentials" };
    }

    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        namespace: user.namespace,
        restaurantId: user.restaurantId,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    const { password: _, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, token };
  }
};
