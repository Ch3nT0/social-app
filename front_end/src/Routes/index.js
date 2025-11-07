import LayoutDefault from "../layout/LayoutDefault";
import LayoutAdmin from "../layout/LayoutAdmin";
import Home from "../pages/client/home";

const URL_ADMIN = '/admin'

export const routes = [
    {
        path: '/',
        element: <LayoutDefault />,
        children: [{
            path: '/',
            element: <Home />
        },
    ]
    },
    {
        path: URL_ADMIN,
        element: <LayoutAdmin />,
        children: []
    }
]
