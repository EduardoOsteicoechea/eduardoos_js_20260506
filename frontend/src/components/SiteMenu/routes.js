class Route {
    constructor(url, userFriendlyName, description) {
        this.url = url;
        this.userFriendlyName = userFriendlyName;
        this.description = description;
    }
}

const privateRoutes = [

];

const publicRoutes = [
    new Route("/", "Home", "Start page and discovery of the site.")
    , new Route("/series", "Series", "Create and Edit articles.")
    , new Route("/post/catalog", "Posts", "Start page and discovery of the site.")
    , new Route("/post/editor", "Post Editor", "Create and Edit articles.")
    , new Route("/catalog", "Post Catalog Editor", "Create and Edit articles.")
    , new Route("/logs", "Logs", "Create and Edit articles.")
    , new Route("/media", "Media", "Create and Edit articles.")
    , new Route("/server/health", "Server Health", "Create and Edit articles.")
];


const allRoutes = [...privateRoutes, ...publicRoutes];

export default function getRoutes(session) {
    if (session && session.isAuthenticated) {
        return allRoutes;
    } else {
        return publicRoutes;
    }
}