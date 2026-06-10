class Route {
    constructor(url, userFriendlyName, description) {
        this.url = url;
        this.userFriendlyName = userFriendlyName;
        this.description = description;
    }
}

const privateRoutes = [
    new Route("/post/editor", "Post Editor", "Create and edit articles.")
    , new Route("/catalog", "Post Catalog Editor", "Manage series catalog metadata.")
    , new Route("/logs", "Logs", "Service logs (admin).")
    , new Route("/media", "Media", "Upload and browse media.")
];

const publicRoutes = [
    new Route("/", "Home", "Start page and discovery of the site.")
    , new Route("/series", "Posts Series", "Browse biblical studies.")
    , new Route("/auth/login", "Login", "Sign in to your account.")
    , new Route("/auth/register", "Register", "Create a new account.")
    , new Route("/auth/profile", "Profile", "Your account profile.")
    , new Route("/server/health", "Server Health", "Service health dashboard.")
];


const allRoutes = [...privateRoutes, ...publicRoutes];

function canSeePrivateRoutes(session) {
    if (!session?.isAuthenticated) return false;
    const roles = session.roles ?? [];
    return roles.includes('editor') || roles.includes('admin');
}

export default function getRoutes(session) {
    if (canSeePrivateRoutes(session)) {
        return allRoutes;
    }
    return publicRoutes;
}