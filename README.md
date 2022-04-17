# Contract Crawler

## Run this project

- Require Node >= 14.x
- Have yarn
- Have pm2

1. Install package and execute migration

```sh
make init-app
```

2. Start Crawler processes

```sh
pm2 start apps.json
```
