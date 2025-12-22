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
            }, {
                path: '/friends',
                element: <FriendsPage />
            }
            ,{
                path: '/profile/edit',
                element: <EditProfilePage/>
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
        path: '/tank-game',
        element: <UnityGame />
    },
    {
        path: URL_ADMIN,
        element: <LayoutAdmin />,
        children: [
        ]
    }
];