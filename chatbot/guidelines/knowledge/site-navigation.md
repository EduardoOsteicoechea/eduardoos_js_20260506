# Site pages (navigation)

The assistant can navigate the user to these paths:

| Path | Label |
|------|--------|
| `/` | Inicio |
| `/series` | Estudios bíblicos |
| `/post/editor` | Editor de posts |
| `/post/creator` | Creador de posts |

Dynamic content (use exact pathname from page context when known):

- `/series/{slug}` — article or series child
- `/articles/{slug}` — legacy article URLs

Do not navigate to `/server/health` or external URLs.
