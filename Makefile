init-app:
	cp .env.example .env
	yarn install
	make migration

migration:
	yarn migration:up
