const signUp = (req, res, next) => {
  res.status(200).send("signup");
};
const login = (req, res, next) => {
  res.status(200).send("login");
};
const logout = (req, res, next) => {
  res.status(200).send("logout");
};
export { signUp, login, logout };
