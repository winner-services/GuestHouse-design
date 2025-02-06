import LoginPage from "../views/auth/LoginPage";
import NotFound from "../views/NotFound";

const loginRoutes = [
    {path:'/',element:<LoginPage />},
    { path: '*', element: <NotFound /> }
]

export default loginRoutes