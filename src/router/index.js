import {createRouter, createWebHistory} from "vue-router";
import Login from '@/components/Login.vue'
import Register from '@/components/Register.vue'
import Elections from '@/components/ElectionList.vue'
import ElectionManager from "@/components/ElectionManager.vue";
import Auditing from "@/components/Auditing.vue";
import Admin from "@/components/Admin.vue";
import Profile from "@/components/Profile.vue";
import {SessionStorage} from 'quasar';

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: "/",
            redirect: SessionStorage.getItem('token') ? 'elections' : 'login',
        },
        {
            path: "/login",
            name: "Login",
            component: Login,
        },
        {
            path: "/register",
            name: "Register",
            component: Register,
        },
        {
            path: "/elections",
            name: "Elections",
            component: Elections,
        },
        {
            path: "/election-manager",
            name: "ElectionManager",
            component: ElectionManager,
        },
        {
            path: "/auditing",
            name: "Auditing",
            component: Auditing,
        },
        {
            path: "/admin",
            name: "Admin",
            component: Admin,
        },
        {
            path: "/profile",
            name: "Profile",
            component: Profile,
        }
        /* {
          path: '/about',
          name: 'about',
          // route level code-splitting
          // this generates a separate chunk (About.[hash].js) for this route
          // which is lazy-loaded when the route is visited.
          component: () => import('../views/AboutView.vue')
        }*/
    ],
});

export default router;