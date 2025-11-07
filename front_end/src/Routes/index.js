import LayoutDefault from "../layout/LayoutDefault";
import LayoutAdmin from "../layout/LayoutAdmin";
import Home from "../pages/client/home";
import Profile from "../pages/client/profile";
import Login from "../pages/client/Login";
import Register from "../pages/client/register";

const URL_ADMIN = '/admin'

export const routes = [
    {
        path: '/',
        element: <LayoutDefault />,
        children: [{
            path: '/',
            element: <Home />
        }, {
            path: '/profile/:id',
            element: <Profile />
        }
        ]
    }, {
        path: '/login',
        element: <Login />
    }, {
        path: '/register',
        element: <Register />
    },
    {
        path: URL_ADMIN,
        element: <LayoutAdmin />,
        children: []
    }
]
