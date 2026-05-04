# templates/

Project-scoped files that **`install.sh` does not symlink anywhere**. They're starter templates you copy into individual projects when you want them.

| Template | Where to copy it | Consumed by |
|---|---|---|
| `REVIEW_GUIDELINES.md` | next to your project's `.pi/` directory | the `/review` extension |

## Usage

```bash
# In a project that has a .pi/ dir (or where you want one):
cd ~/code/my-project
cp ~/Playground/dotpi/templates/REVIEW_GUIDELINES.md .
$EDITOR REVIEW_GUIDELINES.md   # tailor it to the project
```

The `/review` extension walks up the directory tree, and when it finds a `REVIEW_GUIDELINES.md` next to a `.pi/` directory, it appends its content to the review prompt.
