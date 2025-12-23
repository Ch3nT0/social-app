import LayoutDefault from "../layout/LayoutDefault";
import LayoutAdmin from "../layout/LayoutAdmin";
import Home from "../pages/client/home";
import Profile from "../pages/client/profile";
import Login from "../pages/client/Login";
import Register from "../pages/client/register";
import SearchFriendsPage from "../pages/client/SearchFriendsPage";
import FriendsPage from "../pages/client/FriendsPage/FriendsPage";
import EditProfilePage from "../pages/EditProfile";
import UnityGame from "../components/UnityGame/UnityGame";
import PrivateRoute from "../components/PrivateRoutes/index"; 
const URL_ADMIN = '/admin'

export const routes = [
    {
        path: '/',
        element: <LayoutDefault />,
        children: [
            {
                path: '/',
                element: <Home /> 
            },
            {
                path: '/profile/:id',
                element: <Profile /> 
            },
            {
                path: '/search/friends',
                element: <SearchFriendsPage />
            },
            {
                element: <PrivateRoute />, 
                children: [
                    {
                        path: '/friends',
                        element: <FriendsPage />
                    },
                    {
                        path: '/profile/edit',
                        element: <EditProfilePage/>
                    },
                    {
                        path: '/tank-game',
                        element: <UnityGame />
                    }
                ]
            }
        ]
    },
    {
        path: '/login',
        element: <Login />
    },
    {
        path: '/register',
        element: <Register />
    },
    {
        path: URL_ADMIN,
        element: <LayoutAdmin />,
        children: [
            // Có thể bọc PrivateRoute cho Admin ở đây nếu cần
        ]
    }
];